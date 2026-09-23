import { AuthorizedClinicalFacts, ClinicalFact } from './types';

export interface AuthorizedClinicalActionEntry {
  rawTerm: string;
  normalizedTerm: string;
  category: 'hygiene' | 'positioning' | 'airway' | 'wound' | 'infusion' | 'monitoring' | 'other';
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
 * Unified Authorized Clinical Action Registry.
 * Aggregates explicitly authorized nursing procedures and care actions:
 * - hygiene (banho de leito, banho de aspersão, higiene oral, higiene íntima)
 * - positioning (mudança de decúbito, elevação de cabeceira, coxins)
 * - airway (aspiração de vias aéreas, fixação de TOT/TQT, umidificação)
 * - wound (curativo, troca de cobertura, degermação)
 * - infusion (instalação de acesso, infusão venosa, lavagem com SF 0.9%)
 * - monitoring (balanço hídrico, monitorização contínua, glicemia)
 *
 * Prevents unauthorized fabrication of nursing interventions not recorded by staff.
 */
export class AuthorizedClinicalActionRegistry {
  private actions: Map<string, AuthorizedClinicalActionEntry> = new Map();

  constructor(authorizedFacts?: AuthorizedClinicalFacts) {
    if (authorizedFacts) {
      this.populateFromFacts(authorizedFacts);
    }
  }

  public populateFromFacts(facts: AuthorizedClinicalFacts): void {
    this.actions.clear();

    // 1. Care facts
    const careFacts = facts.care || facts.nursingCare || [];
    careFacts.forEach((fact: ClinicalFact) => {
      const text = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      this.extractActionsFromText(text, fact);
    });

    // 2. Bath & Hygiene facts
    const bathFacts = [
      ...(facts.bath || []),
      ...(facts.hygiene || []),
    ];
    bathFacts.forEach((fact: ClinicalFact) => {
      const text = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      if (/banho\s*no\s*leito/i.test(text)) {
        this.addAction('banho no leito', 'hygiene', fact);
      }
      if (/banho\s*de\s*aspers[aã]o|aspers[aã]o/i.test(text)) {
        this.addAction('banho de aspersao', 'hygiene', fact);
      }
      if (/higiene\s*oral/i.test(text)) {
        this.addAction('higiene oral', 'hygiene', fact);
      }
      if (/higiene\s*[ií]ntima/i.test(text)) {
        this.addAction('higiene intima', 'hygiene', fact);
      }
    });

    // 3. Skin, Mobility & Wound care facts
    const skinFacts = [
      ...(facts.skin || []),
      ...(facts.integumentary || []),
      ...(facts.mobility || []),
      ...(facts.surgicalDressing || []),
      ...(facts.surgicalWound || []),
      ...(facts.drains || []),
    ];
    skinFacts.forEach((fact: ClinicalFact) => {
      const text = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      if (/curativo/i.test(text)) {
        this.addAction('curativo', 'wound', fact);
        this.addAction('curativo realizado', 'wound', fact);
        this.addAction('troca de curativo', 'wound', fact);
      }
      if (/mudan[cç]a\s*de\s*dec[uú]bito|revezamento\s*de\s*dec[uú]bito|dec[uú]bito/i.test(text)) {
        this.addAction('mudanca de decubito', 'positioning', fact);
        this.addAction('mudanca de posicao', 'positioning', fact);
        this.addAction('revezamento de decubito', 'positioning', fact);
      }
      if (/aspira[cç][aã]o/i.test(text)) {
        this.addAction('aspiracao', 'other', fact);
      }
    });

    // 4. Respiratory / Airway care facts
    const respFacts = facts.respiratory || [];
    respFacts.forEach((fact: ClinicalFact) => {
      const text = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      if (/aspira[cç][aã]o/i.test(text)) {
        this.addAction('aspiracao', 'airway', fact);
        this.addAction('aspiradas vias aereas', 'airway', fact);
      }
    });

    // 5. Hydration / Elimination / Balance facts
    const waterFacts = facts.waterBalance || facts.elimination || facts.urinary || [];
    waterFacts.forEach((fact: ClinicalFact) => {
      const text = `${String(fact.value || '')} ${String(fact.canonicalText || '')}`;
      if (/balan[cç]o\s*h[ií]drico/i.test(text)) {
        this.addAction('balanco hidrico', 'monitoring', fact);
      }
    });
  }

  private extractActionsFromText(text: string, fact: ClinicalFact): void {
    const t = text.toLowerCase();
    if (t.includes('aspiracao') || t.includes('aspiração')) {
      this.addAction('aspiracao', 'airway', fact);
      this.addAction('aspiradas vias aereas', 'airway', fact);
    }
    if (t.includes('mudanca de decubito') || t.includes('mudança de decúbito') || t.includes('decubito')) {
      this.addAction('mudanca de decubito', 'positioning', fact);
      this.addAction('mudanca de posicao', 'positioning', fact);
      this.addAction('revezamento de decubito', 'positioning', fact);
    }
    if (t.includes('banho no leito')) {
      this.addAction('banho no leito', 'hygiene', fact);
    }
    if (t.includes('banho de aspersao') || t.includes('banho de aspersão')) {
      this.addAction('banho de aspersao', 'hygiene', fact);
    }
    if (t.includes('higiene oral')) {
      this.addAction('higiene oral', 'hygiene', fact);
    }
    if (t.includes('higiene intima') || t.includes('higiene íntima')) {
      this.addAction('higiene intima', 'hygiene', fact);
    }
    if (t.includes('curativo')) {
      this.addAction('curativo', 'wound', fact);
      this.addAction('curativo realizado', 'wound', fact);
      this.addAction('troca de curativo', 'wound', fact);
    }
    if (t.includes('balanco hidrico') || t.includes('balanço hídrico')) {
      this.addAction('balanco hidrico', 'monitoring', fact);
    }
    if (t.includes('coleta de exames') || t.includes('coleta')) {
      this.addAction('coleta de exames', 'monitoring', fact);
    }
    if (t.includes('nebulizacao') || t.includes('nebulização') || t.includes('inalacao') || t.includes('inalação')) {
      this.addAction('nebulizacao', 'airway', fact);
    }
    if (t.includes('administracao') || t.includes('administração') || t.includes('medicacao') || t.includes('medicação') || t.includes('prescricao') || t.includes('prescrição')) {
      this.addAction('administracao de medicacao', 'infusion', fact);
      this.addAction('administracao de medicamentos conforme prescricao', 'infusion', fact);
    }
    if (t.includes('monitorizacao') || t.includes('monitorização') || t.includes('sinais vitais')) {
      this.addAction('monitorizacao de sinais vitais', 'monitoring', fact);
    }
    if (t.includes('cuidados com curativo')) {
      this.addAction('cuidados com curativo', 'wound', fact);
    }
    if (t.includes('cuidados com dispositivos') || t.includes('dispositivos')) {
      this.addAction('cuidados com dispositivos', 'other', fact);
    }
    if (t.includes('higiene corporal')) {
      this.addAction('higiene corporal', 'hygiene', fact);
    }
    if (t.includes('auxilio na mobilizacao') || t.includes('auxílio na mobilização') || t.includes('mobilizacao') || t.includes('mobilização')) {
      this.addAction('auxilio na mobilizacao', 'positioning', fact);
    }
    if (t.includes('controle de eliminacoes') || t.includes('controle de eliminações')) {
      this.addAction('controle de eliminacoes', 'monitoring', fact);
    }
    if (t.includes('glicemia') || t.includes('glicemia capilar') || t.includes('hgt')) {
      this.addAction('glicemia capilar', 'monitoring', fact);
    }
  }

  private addAction(term: string, category: AuthorizedClinicalActionEntry['category'], fact: ClinicalFact): void {
    const norm = normalize(term);
    if (!norm) return;
    if (!this.actions.has(norm)) {
      this.actions.set(norm, {
        rawTerm: term,
        normalizedTerm: norm,
        category,
        factId: fact.id,
        sourceField: fact.sourceField,
      });
    }
  }

  public isActionAuthorized(term: string): boolean {
    const norm = normalize(term);
    return this.actions.has(norm);
  }

  public getAuthorizedActions(): AuthorizedClinicalActionEntry[] {
    return Array.from(this.actions.values());
  }

  public getActionCount(): number {
    return this.actions.size;
  }
}

export function buildAuthorizedClinicalActionRegistry(facts: AuthorizedClinicalFacts): AuthorizedClinicalActionRegistry {
  return new AuthorizedClinicalActionRegistry(facts);
}
