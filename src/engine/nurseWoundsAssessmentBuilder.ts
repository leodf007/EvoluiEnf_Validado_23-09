import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { NarrativeFactTrace } from './deterministicNarrativeFactAuditor';

/**
 * NurseWoundsAssessmentBuilder
 *
 * CRITICAL SAFETY DIRECTIVES:
 * 1. Consumes ONLY AuthorizedClinicalFacts (never rawForm).
 * 2. Every single sentence maps back 1:1 to a valid authorized factId.
 * 3. Never interprets clinical conditions (no automated infection diagnosis, no auto-staging).
 * 4. Never calculates area, volume or evolutionary percentages (strictly manual measurements).
 * 5. Generates traceable NarrativeFactTrace for auditing and PostGenerationVerifier.
 */
export class NurseWoundsAssessmentBuilder {
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

    // 1. Contexto e Tipo de Avaliação
    const contextFacts = [
      ...(facts.context || []),
      ...(facts.evaluationType || []),
    ];
    contextFacts.forEach((f) => addFactTrace(f, 'context_and_type'));

    // 2. Identificação da lesão, Localização anatômica, Lateralidade e Histórico
    const idLocationFacts = [
      ...(facts.woundIdentification || []),
      ...(facts.anatomicalLocation || []),
      ...(facts.laterality || []),
      ...(facts.durationAndOrigin || []),
    ];
    idLocationFacts.forEach((f) => addFactTrace(f, 'identification_and_location'));

    // 3. Medidas da lesão (NumericFactLock compliance)
    const measureFacts = facts.woundMeasurements || [];
    measureFacts.forEach((f) => addFactTrace(f, 'measurements'));

    // 4. Características do Leito, Bordas e Pele Perilesional
    const tissueFacts = [
      ...(facts.woundBed || []),
      ...(facts.woundEdges || []),
      ...(facts.perilesionalSkin || []),
    ];
    tissueFacts.forEach((f) => addFactTrace(f, 'wound_tissues_and_edges'));

    // 5. Exsudato, Odor e Avaliação Álgica
    const exudatePainFacts = [
      ...(facts.exudate || []),
      ...(facts.odor || []),
      ...(facts.woundPain || []),
    ];
    exudatePainFacts.forEach((f) => addFactTrace(f, 'exudate_and_pain'));

    // 6. Classificação/Estadiamento informado, Túneis e Sinais Clínicos Observados
    const stagingSignFacts = [
      ...(facts.staging || []),
      ...(facts.tunneling || []),
      ...(facts.observedSigns || []),
    ];
    stagingSignFacts.forEach((f) => addFactTrace(f, 'staging_and_signs'));

    // 7. Dispositivos Relacionados e Cobertura Prévia Encontrada
    const devCoverFacts = [
      ...(facts.relatedDevices || []),
      ...(facts.currentCovering || []),
    ];
    devCoverFacts.forEach((f) => addFactTrace(f, 'devices_and_previous_covering'));

    // 8. Procedimento de Curativo e Produtos Utilizados
    const procedureFacts = [
      ...(facts.dressingProcedure || []),
      ...(facts.productsUsed || []),
    ];
    procedureFacts.forEach((f) => addFactTrace(f, 'dressing_and_products'));

    // 9. Resposta Observada e Comparação Evolutiva
    const responseFacts = [
      ...(facts.observedResponse || []),
      ...(facts.previousComparison || []),
    ];
    responseFacts.forEach((f) => addFactTrace(f, 'response_and_evolution'));

    // 10. Conduta Registrada pelo Enfermeiro e Informações Adicionais
    const planFacts = [
      ...(facts.nurseConduct || []),
      ...(facts.additionalInfo || []),
    ];
    planFacts.forEach((f) => addFactTrace(f, 'conduct_and_notes'));

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
export function buildNurseWoundsAssessmentNote(facts: AuthorizedClinicalFacts): string {
  return NurseWoundsAssessmentBuilder.build(facts);
}

export function buildNurseWoundsAssessmentNoteWithTrace(facts: AuthorizedClinicalFacts): {
  narrative: string;
  traces: NarrativeFactTrace[];
} {
  return NurseWoundsAssessmentBuilder.buildWithTrace(facts);
}
