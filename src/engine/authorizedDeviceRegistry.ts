import { AuthorizedClinicalFacts, ClinicalFact } from './types';

export interface AuthorizedDeviceEntry {
  rawTerm: string;
  normalizedTerm: string;
  category: 'respiratory' | 'nutrition' | 'elimination' | 'devices' | 'other';
  factId: string;
  sourceField: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Unified Authorized Device Registry.
 * Aggregates explicitly authorized devices from ALL sections:
 * - respiratory (TOT, TQT, traqueostomia, cateter nasal, máscara de venturi, etc.)
 * - nutrition (SNE, SNG, GTT, jejunostomia)
 * - elimination (SVD, SVA, cistostomia)
 * - devices (AVP, CVC, PAI, PICC, CDL, Shiley, drenos, DVE, etc.)
 */
export class AuthorizedDeviceRegistry {
  private devices: Map<string, AuthorizedDeviceEntry> = new Map();

  constructor(authorizedFacts?: AuthorizedClinicalFacts) {
    if (authorizedFacts) {
      this.populateFromFacts(authorizedFacts);
    }
  }

  public populateFromFacts(facts: AuthorizedClinicalFacts): void {
    this.devices.clear();

    // 1. Respiratory devices
    const respFacts = facts.respiratory || [];
    respFacts.forEach((fact) => {
      const valStr = String(fact.value || '');
      const canonStr = String(fact.canonicalText || '');
      const combined = `${valStr} ${canonStr}`;

      if (/tot|tubo\s*orotraqueal/i.test(combined)) {
        this.addDevice('TOT', 'respiratory', fact);
        this.addDevice('tubo orotraqueal', 'respiratory', fact);
      }
      if (/traqueostomia|tqt/i.test(combined)) {
        this.addDevice('traqueostomia', 'respiratory', fact);
        this.addDevice('TQT', 'respiratory', fact);
      }
      if (/cateter\s*nasal|canula\s*nasal/i.test(combined)) {
        this.addDevice('cateter nasal', 'respiratory', fact);
        this.addDevice('canula nasal', 'respiratory', fact);
      }
      if (/mascara\s*de\s*venturi/i.test(combined)) {
        this.addDevice('mascara de venturi', 'respiratory', fact);
      }
      if (/mascara\s*com\s*reservatorio|mascara\s*nao\s*reinalante/i.test(combined)) {
        this.addDevice('mascara com reservatorio', 'respiratory', fact);
        this.addDevice('mascara nao reinalante', 'respiratory', fact);
      }
      if (/mascara\s*simples/i.test(combined)) {
        this.addDevice('mascara simples', 'respiratory', fact);
      }
      if (/vni|ventilacao\s*nao\s*invasiva/i.test(combined)) {
        this.addDevice('VNI', 'respiratory', fact);
      }
    });

    // 2. Nutrition devices
    const nutFacts = facts.nutrition || [];
    nutFacts.forEach((fact) => {
      const combined = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      if (/sne|sonda\s*nasoenteral/i.test(combined)) {
        this.addDevice('SNE', 'nutrition', fact);
        this.addDevice('sonda nasoenteral', 'nutrition', fact);
      }
      if (/sng|sonda\s*nasogastrica/i.test(combined)) {
        this.addDevice('SNG', 'nutrition', fact);
        this.addDevice('sonda nasogastrica', 'nutrition', fact);
      }
      if (/gtt|gastrostomia/i.test(combined)) {
        this.addDevice('GTT', 'nutrition', fact);
        this.addDevice('gastrostomia', 'nutrition', fact);
      }
      if (/jejunostomia/i.test(combined)) {
        this.addDevice('jejunostomia', 'nutrition', fact);
      }
    });

    // 3. Elimination devices
    const elimFacts = [
      ...(facts.elimination || []),
      ...(facts.eliminations || []),
      ...(facts.urinary || []),
      ...(facts.relatedDevices || []),
    ];
    elimFacts.forEach((fact) => {
      const combined = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      if (/svd|sonda\s*vesical\s*de\s*demora/i.test(combined)) {
        this.addDevice('SVD', 'elimination', fact);
        this.addDevice('sonda vesical de demora', 'elimination', fact);
      }
      if (/sva|sonda\s*vesical\s*de\s*alivio/i.test(combined)) {
        this.addDevice('SVA', 'elimination', fact);
        this.addDevice('sonda vesical de alivio', 'elimination', fact);
      }
      if (/cistostomia/i.test(combined)) {
        this.addDevice('cistostomia', 'elimination', fact);
      }
    });

    // 4. Invasives & Devices list + Drains list
    const devFacts = [
      ...(facts.devices || []),
      ...(facts.drains || []),
    ];
    devFacts.forEach((fact) => {
      const combined = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      if (/avp|acesso\s*venoso\s*periferico/i.test(combined)) {
        this.addDevice('AVP', 'devices', fact);
        this.addDevice('acesso venoso periferico', 'devices', fact);
      }
      if (/cvc|cateter\s*venoso\s*central/i.test(combined)) {
        this.addDevice('CVC', 'devices', fact);
        this.addDevice('cateter venoso central', 'devices', fact);
      }
      if (/pai|pressao\s*arterial\s*invasiva/i.test(combined)) {
        this.addDevice('PAI', 'devices', fact);
        this.addDevice('pressao arterial invasiva', 'devices', fact);
      }
      if (/picc|cateter\s*central\s*de\s*insercao\s*periferica/i.test(combined)) {
        this.addDevice('PICC', 'devices', fact);
      }
      if (/cdl|cateter\s*duplo\s*lumen/i.test(combined)) {
        this.addDevice('CDL', 'devices', fact);
      }
      if (/shilley|shiley/i.test(combined)) {
        this.addDevice('Shiley', 'devices', fact);
      }
      if (/dreno\s*de\s*torax/i.test(combined)) {
        this.addDevice('dreno de torax', 'devices', fact);
      }
      if (/dreno\s*abdominal/i.test(combined)) {
        this.addDevice('dreno abdominal', 'devices', fact);
      }
      if (/dreno\s*cirurgico|dreno\s*cirúrgico/i.test(combined)) {
        this.addDevice('dreno cirurgico', 'devices', fact);
      }
      if (/portovac|porto-vac/i.test(combined)) {
        this.addDevice('dreno de portovac', 'devices', fact);
        this.addDevice('portovac', 'devices', fact);
      }
      if (/penrose/i.test(combined)) {
        this.addDevice('dreno de penrose', 'devices', fact);
        this.addDevice('penrose', 'devices', fact);
      }
      if (/\bdreno\b/i.test(combined)) {
        this.addDevice('dreno', 'devices', fact);
      }
      if (/dve|derivacao\s*ventricular\s*externa/i.test(combined)) {
        this.addDevice('DVE', 'devices', fact);
      }

      // Add custom device text
      const rawVal = String(fact.value || '');
      if (rawVal) {
        const parts = rawVal.split(' em ');
        if (parts[0]) {
          this.addDevice(parts[0].trim(), 'devices', fact);
        }
      }
    });

    // 5. Cardiovascular PAI/PVC
    const cardioFacts = facts.cardiovascular || [];
    cardioFacts.forEach((fact) => {
      if (fact.id === 'icu-cardio-pai') {
        this.addDevice('PAI', 'devices', fact);
        this.addDevice('pressao arterial invasiva', 'devices', fact);
      }
    });
  }

  private addDevice(term: string, category: AuthorizedDeviceEntry['category'], fact: ClinicalFact): void {
    const norm = normalize(term);
    if (!norm) return;
    if (!this.devices.has(norm)) {
      this.devices.set(norm, {
        rawTerm: term,
        normalizedTerm: norm,
        category,
        factId: fact.id,
        sourceField: fact.sourceField,
      });
    }
  }

  public isAuthorized(term: string): boolean {
    const norm = normalize(term);
    if (this.devices.has(norm)) return true;

    // Substring or word match check
    for (const [registeredNorm] of this.devices.entries()) {
      if (norm === registeredNorm) return true;
      if (norm.length > 3 && (norm.includes(registeredNorm) || registeredNorm.includes(norm))) {
        return true;
      }
    }
    return false;
  }

  public getAllAuthorized(): AuthorizedDeviceEntry[] {
    return Array.from(this.devices.values());
  }

  public getAuthorizedTerms(): string[] {
    return Array.from(this.devices.values()).map((d) => d.rawTerm);
  }
}

export function buildAuthorizedDeviceRegistry(facts: AuthorizedClinicalFacts): AuthorizedDeviceRegistry {
  return new AuthorizedDeviceRegistry(facts);
}
