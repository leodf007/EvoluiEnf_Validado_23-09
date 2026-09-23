import { AuthorizedClinicalFacts, ClinicalFact } from './types';

export interface AuthorizedMedicationEntry {
  rawTerm: string;
  normalizedTerm: string;
  category: 'vasoactive' | 'sedationAnalgesia' | 'care' | 'other';
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
 * Unified Authorized Medication Registry.
 * Aggregates explicitly authorized medications from:
 * - vasoactiveDrugs
 * - sedationAndAnalgesia
 * - nursingCare (e.g., clorexidina in oral hygiene)
 * - other authorized medication fields
 *
 * Prevents unauthorized drug inventions and unwanted pharmacologic synonym replacements.
 */
export class AuthorizedMedicationRegistry {
  private medications: Map<string, AuthorizedMedicationEntry> = new Map();

  constructor(authorizedFacts?: AuthorizedClinicalFacts) {
    if (authorizedFacts) {
      this.populateFromFacts(authorizedFacts);
    }
  }

  public populateFromFacts(facts: AuthorizedClinicalFacts): void {
    this.medications.clear();

    // 1. Vasoactive drugs
    const dvaFacts = facts.vasoactiveDrugs || facts.vasoactive || [];
    dvaFacts.forEach((fact) => {
      if (Array.isArray(fact.value)) {
        fact.value.forEach((item: any) => {
          if (item && typeof item === 'object' && item.drugName) {
            this.addMedication(item.drugName, 'vasoactive', fact);
          }
        });
      }
      const valStr = String(fact.value || '');
      const canonStr = String(fact.canonicalText || '');
      const combined = `${valStr} ${canonStr}`.toLowerCase();
      for (const med of [
        'noradrenalina',
        'adrenalina',
        'dobutamina',
        'dopamina',
        'vasopressina',
        'nitroprussiato',
        'nitroglicerina',
      ]) {
        if (combined.includes(med)) {
          this.addMedication(med, 'vasoactive', fact);
        }
      }
      const medName = this.extractMedName(valStr) || this.extractMedName(canonStr);
      if (medName) {
        this.addMedication(medName, 'vasoactive', fact);
      }
    });

    // 2. Sedation and Analgesia
    const sedFacts = [
      ...(facts.sedationAndAnalgesia || []),
      ...(facts.sedationAnalgesia || []),
    ];
    sedFacts.forEach((fact) => {
      if (Array.isArray(fact.value)) {
        fact.value.forEach((item: any) => {
          if (item && typeof item === 'object' && item.drugName) {
            this.addMedication(item.drugName, 'sedationAnalgesia', fact);
          }
        });
      }
      const valStr = String(fact.value || '');
      const canonStr = String(fact.canonicalText || '');
      const combined = `${valStr} ${canonStr}`.toLowerCase();
      for (const med of [
        'fentanil',
        'midazolam',
        'dormonid',
        'propofol',
        'morfina',
        'precedex',
        'dexmedetomidina',
        'cetamina',
        'quetamina',
      ]) {
        if (combined.includes(med)) {
          this.addMedication(med, 'sedationAnalgesia', fact);
        }
      }
      const medName = this.extractMedName(valStr) || this.extractMedName(canonStr);
      if (medName) {
        this.addMedication(medName, 'sedationAnalgesia', fact);
      }
    });

    // 3. Pain / Analgesia facts
    const painFacts = facts.pain || [];
    painFacts.forEach((fact) => {
      const text = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`.toLowerCase();
      // Look for analgesics
      const analgesicCandidates = [
        'dipirona',
        'paracetamol',
        'tramadol',
        'cetoprofeno',
        'morfina',
        'fentanil',
        'codeina',
        'clonidina',
      ];
      for (const cand of analgesicCandidates) {
        if (text.includes(cand)) {
          this.addMedication(cand, 'sedationAnalgesia', fact);
        }
      }
      const medName = this.extractMedName(String(fact.value || ''));
      if (medName) {
        this.addMedication(medName, 'sedationAnalgesia', fact);
      }
    });

    // 4. Nursing Care items containing clinical substances (e.g. Clorexidina, SF)
    const careFacts = [
      ...(facts.care || []),
      ...(facts.surgicalDressing || []),
      ...(facts.surgicalWound || []),
    ];
    careFacts.forEach((fact) => {
      const text = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`.toLowerCase();
      if (text.includes('clorexidina')) {
        this.addMedication('clorexidina', 'care', fact);
      }
      if (text.includes('soro fisiologico')) {
        this.addMedication('soro fisiologico', 'care', fact);
      }
      if (text.includes('alcool')) {
        this.addMedication('alcool', 'care', fact);
      }
    });
  }

  private extractMedName(str: string): string | null {
    if (!str) return null;
    // e.g. "Noradrenalina (0.1 mcg/kg/min)" or "DVA: Noradrenalina a 0.1 mcg/kg/min" or "Dormonid (5 mg/h)"
    let clean = str.replace(/^(dva|sedacao\/analgesia cont[ií]nua|sedacao|analgesia):\s*/i, '');
    const parenIdx = clean.indexOf('(');
    if (parenIdx !== -1) {
      clean = clean.substring(0, parenIdx);
    }
    const aIdx = clean.indexOf(' a ');
    if (aIdx !== -1) {
      clean = clean.substring(0, aIdx);
    }
    clean = clean.trim();
    return clean.length > 1 ? clean : null;
  }

  private addMedication(term: string, category: AuthorizedMedicationEntry['category'], fact: ClinicalFact): void {
    const norm = normalize(term);
    if (!norm) return;
    if (!this.medications.has(norm)) {
      this.medications.set(norm, {
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
    if (this.medications.has(norm)) return true;

    for (const [registeredNorm] of this.medications.entries()) {
      if (norm === registeredNorm) return true;
      if (norm.length >= 4 && (norm.includes(registeredNorm) || registeredNorm.includes(norm))) {
        return true;
      }
    }
    return false;
  }

  public getAllAuthorized(): AuthorizedMedicationEntry[] {
    return Array.from(this.medications.values());
  }

  public getAuthorizedTerms(): string[] {
    return Array.from(this.medications.values()).map((m) => m.rawTerm);
  }
}

export function buildAuthorizedMedicationRegistry(facts: AuthorizedClinicalFacts): AuthorizedMedicationRegistry {
  return new AuthorizedMedicationRegistry(facts);
}
