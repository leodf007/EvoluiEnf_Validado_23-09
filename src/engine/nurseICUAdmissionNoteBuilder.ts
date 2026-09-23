import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { NarrativeFactTrace } from './deterministicNarrativeFactAuditor';

/**
 * NurseICUAdmissionBuilder
 *
 * CRITICAL SAFETY DIRECTIVES:
 * 1. Consumes ONLY AuthorizedClinicalFacts (never rawForm).
 * 2. Every single sentence maps back 1:1 to a valid authorized factId.
 * 3. Never interprets clinical conditions (no shock, sepsis, organ failure, or severity inferences).
 * 4. Never calculates MAP or hemodynamic formulas (preserves manual input).
 * 5. Generates traceable NarrativeFactTrace for post-generation verification and auditing.
 */
export class NurseICUAdmissionBuilder {
  /**
   * Generates narrative and factual trace from authorized facts.
   */
  static buildWithTrace(facts: AuthorizedClinicalFacts): {
    narrative: string;
    traces: NarrativeFactTrace[];
  } {
    const traces: NarrativeFactTrace[] = [];

    const addFactTrace = (f: ClinicalFact, category: string) => {
      if (!f || !f.canonicalText) return;
      const cleanText = f.canonicalText.trim();
      const sentence = cleanText.endsWith('.') ? cleanText : `${cleanText}.`;
      traces.push({
        text: sentence,
        factIds: [f.id],
        category,
      });
    };

    // Parágrafo 1: Contexto, Admissão, Origem, Chegada, Identificação e Segurança
    const contextFacts = facts.context || [];
    contextFacts.forEach((f) => addFactTrace(f, 'context_and_safety'));

    // Parágrafo 2: Avaliação Geral, Nível de Consciência, Glasgow, RASS, Pupilas e Dor
    const neuroGeneralFacts = [
      ...(facts.general || []),
      ...(facts.neurological || []),
      ...(facts.pain || []),
    ];
    neuroGeneralFacts.forEach((f) => addFactTrace(f, 'general_and_neurological'));

    // Parágrafo 3: Sinais Vitais Admissionais e Avaliação Cardiovascular
    const cardioVitalsFacts = [
      ...(facts.vitalSigns || []),
      ...(facts.cardiovascular || []),
    ];
    cardioVitalsFacts.forEach((f) => addFactTrace(f, 'vitals_and_cardiovascular'));

    // Parágrafo 4: Suporte Respiratório e Parâmetros de Ventilação Mecânica Invasiva
    const respFacts = facts.respiratory || [];
    respFacts.forEach((f) => addFactTrace(f, 'respiratory_support'));

    // Parágrafo 5: Terapia Infusional Contínua: Drogas Vasoativas, Sedação e Analgesia
    const infusionFacts = [
      ...(facts.vasoactive || []),
      ...(facts.sedationAnalgesia || []),
    ];
    infusionFacts.forEach((f) => addFactTrace(f, 'infusions_and_sedation'));

    // Parágrafo 6: Gastrointestinal, Nutrição e Eliminações Fisiológicas
    const giNutElimFacts = [
      ...(facts.gastrointestinal || []),
      ...(facts.nutrition || []),
      ...(facts.eliminations || []),
    ];
    giNutElimFacts.forEach((f) => addFactTrace(f, 'gi_nutrition_eliminations'));

    // Parágrafo 7: Balanço Hídrico, Dispositivos Invasivos e Integridade Cutânea
    const devicesSkinFacts = [
      ...(facts.waterBalance || []),
      ...(facts.devices || []),
      ...(facts.skin || []),
    ];
    devicesSkinFacts.forEach((f) => addFactTrace(f, 'devices_and_skin'));

    // Parágrafo 8: Riscos Assistenciais e Cuidados de Enfermagem na Admissão
    const careFacts = facts.care || [];
    careFacts.forEach((f) => addFactTrace(f, 'care_and_risks'));

    // Parágrafo 9: Intercorrências, Comunicação Multiprofissional e Situação Pós-Admissão
    const finalFacts = [
      ...(facts.complications || []),
      ...(facts.communication || []),
      ...(facts.finalStatus || []),
    ];
    finalFacts.forEach((f) => addFactTrace(f, 'complications_and_status'));

    const narrative = traces.map((t) => t.text).join(' ');

    return {
      narrative,
      traces,
    };
  }

  /**
   * Generates deterministic string note directly from authorized facts.
   */
  static build(facts: AuthorizedClinicalFacts): string {
    return this.buildWithTrace(facts).narrative;
  }
}

/**
 * Functional wrapper for ClinicalModuleContract integration.
 */
export function buildNurseICUAdmissionNote(facts: AuthorizedClinicalFacts): string {
  return NurseICUAdmissionBuilder.build(facts);
}

export function buildNurseICUAdmissionNoteWithTrace(facts: AuthorizedClinicalFacts): {
  narrative: string;
  traces: NarrativeFactTrace[];
} {
  return NurseICUAdmissionBuilder.buildWithTrace(facts);
}
