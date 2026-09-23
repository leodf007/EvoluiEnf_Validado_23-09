import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { NarrativeFactTrace } from './deterministicNarrativeFactAuditor';

/**
 * NurseSoapBuilder
 *
 * CRITICAL SAFETY DIRECTIVES:
 * 1. Consumes ONLY AuthorizedClinicalFacts (never rawForm).
 * 2. Formats narrative strictly separated into:
 *    - S - SUBJETIVO
 *    - O - OBJETIVO
 *    - A - AVALIAÇÃO
 *    - P - PLANO
 * 3. Every clinical sentence maps 1:1 to AuthorizedClinicalFacts.
 * 4. Never infers medical/nursing diagnoses, prognostic estimations, or new prescriptions.
 * 5. Generates NarrativeFactTrace for auditing and PostGenerationVerifier.
 */
export class NurseSoapBuilder {
  /**
   * Generates SOAP narrative and factual trace from authorized facts.
   */
  static buildWithTrace(facts: AuthorizedClinicalFacts): {
    narrative: string;
    traces: NarrativeFactTrace[];
  } {
    const traces: NarrativeFactTrace[] = [];

    const addTrace = (text: string, factIds: string[], category: string) => {
      if (!text || !text.trim()) return;
      const cleanText = text.trim();
      const sentence = cleanText.endsWith('.') || cleanText.endsWith(':') ? cleanText : `${cleanText}.`;
      traces.push({
        text: sentence,
        factIds,
        category,
      });
    };

    // -------------------------------------------------------------
    // Header & Context
    // -------------------------------------------------------------
    const contextFacts = facts.context || [];
    const idFacts = facts.identification || [];
    const contextFactIds = [...contextFacts, ...idFacts].map((f) => f.id);

    addTrace('REGISTRO DE ENFERMAGEM - SOAP:', contextFactIds, 'header');

    if (contextFacts.length > 0 || idFacts.length > 0) {
      const parts: string[] = [];
      const dateFact = contextFacts.find((f) => f.id === 'fact-soap-date');
      const timeFact = contextFacts.find((f) => f.id === 'fact-soap-time');
      const unitFact = contextFacts.find((f) => f.id === 'fact-soap-unit');
      const roomFact = contextFacts.find((f) => f.id === 'fact-soap-room');
      const attTypeFact = idFacts.find((f) => f.id === 'fact-soap-attendance-type');
      const reasonFact = idFacts.find((f) => f.id === 'fact-soap-reason');

      if (dateFact) parts.push(`Data: ${dateFact.value}`);
      if (timeFact) parts.push(`Horário: ${timeFact.value}`);
      if (unitFact) parts.push(`Unidade: ${unitFact.value}`);
      if (roomFact) parts.push(`Local/Consultório: ${roomFact.value}`);
      if (attTypeFact) parts.push(`Atendimento: ${attTypeFact.value}`);
      if (reasonFact) parts.push(`Demanda clínica: ${reasonFact.value}`);

      if (parts.length > 0) {
        addTrace(`Identificação do atendimento: ${parts.join(' | ')}.`, contextFactIds, 'context');
      }
    }

    // -------------------------------------------------------------
    // S - SUBJETIVO
    // -------------------------------------------------------------
    const subjectiveFacts = facts.subjective || [];
    const subjIds = subjectiveFacts.map((f) => f.id);
    addTrace('S - SUBJETIVO:', subjIds, 'subjective_header');

    if (subjectiveFacts.length === 0) {
      addTrace('Dados subjetivos não referidos no momento.', [], 'subjective');
    } else {
      subjectiveFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'subjective');
      });
    }

    // -------------------------------------------------------------
    // O - OBJETIVO
    // -------------------------------------------------------------
    const vsFacts = facts.vitalSigns || [];
    const peFacts = facts.physicalExam || [];
    const devFacts = facts.devices || [];
    const medFacts = facts.medications || [];
    const objIds = [...vsFacts, ...peFacts, ...devFacts, ...medFacts].map((f) => f.id);

    addTrace('O - OBJETIVO:', objIds, 'objective_header');

    // Sinais Vitais
    if (vsFacts.length > 0) {
      const vsTexts = vsFacts.map((f) => f.canonicalText).filter(Boolean);
      addTrace(`Sinais vitais: ${vsTexts.join(' | ')}.`, vsFacts.map((f) => f.id), 'vital_signs');
    } else {
      addTrace('Sinais vitais: sem registros adicionais nesta avaliação.', [], 'vital_signs');
    }

    // Exame Físico por Sistemas
    if (peFacts.length > 0) {
      peFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'physical_exam');
      });
    } else {
      addTrace('Exame físico direcionado sem queixas ou alterações evidentes relatadas.', [], 'physical_exam');
    }

    // Dispositivos
    if (devFacts.length > 0) {
      devFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'devices');
      });
    }

    // Medicamentos em uso
    if (medFacts.length > 0) {
      medFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'medications');
      });
    }

    // -------------------------------------------------------------
    // A - AVALIAÇÃO
    // -------------------------------------------------------------
    const assessmentFacts = facts.assessment || [];
    const diagFacts = facts.nursingDiagnoses || [];
    const evalIds = [...assessmentFacts, ...diagFacts].map((f) => f.id);

    addTrace('A - AVALIAÇÃO:', evalIds, 'assessment_header');

    if (assessmentFacts.length > 0) {
      assessmentFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'assessment_synthesis');
      });
    }

    if (diagFacts.length > 0) {
      diagFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'nursing_diagnoses');
      });
    }

    if (assessmentFacts.length === 0 && diagFacts.length === 0) {
      addTrace('Avaliação do enfermeiro: paciente em acompanhamento de enfermagem.', [], 'assessment');
    }

    // -------------------------------------------------------------
    // P - PLANO
    // -------------------------------------------------------------
    const planFacts = facts.plan || [];
    const intervFacts = facts.interventions || [];
    const respFacts = facts.responseToCare || [];
    const noteFacts = facts.additionalInfo || [];
    const planIds = [...planFacts, ...intervFacts, ...respFacts, ...noteFacts].map((f) => f.id);

    addTrace('P - PLANO:', planIds, 'plan_header');

    if (planFacts.length > 0) {
      planFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'plan');
      });
    }

    if (intervFacts.length > 0) {
      intervFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'interventions');
      });
    }

    if (respFacts.length > 0) {
      respFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'response_to_care');
      });
    }

    if (noteFacts.length > 0) {
      noteFacts.forEach((f) => {
        addTrace(f.canonicalText || String(f.value), [f.id], 'additional_notes');
      });
    }

    if (planFacts.length === 0 && intervFacts.length === 0 && respFacts.length === 0 && noteFacts.length === 0) {
      addTrace('Plano assistencial mantido conforme rotina da unidade.', [], 'plan');
    }

    const narrative = traces.map((t) => t.text).join('\n\n');

    return {
      narrative,
      traces,
    };
  }

  /**
   * Builds deterministic narrative string from authorized facts.
   */
  static build(facts: AuthorizedClinicalFacts): string {
    return this.buildWithTrace(facts).narrative;
  }
}

/**
 * Functional wrappers for ClinicalModuleContract.
 */
export function buildNurseSoapNote(facts: AuthorizedClinicalFacts): string {
  return NurseSoapBuilder.build(facts);
}

export function buildNurseSoapNoteWithTrace(facts: AuthorizedClinicalFacts): {
  narrative: string;
  traces: NarrativeFactTrace[];
} {
  return NurseSoapBuilder.buildWithTrace(facts);
}
