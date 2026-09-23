import {
  ClinicalModuleCapabilities,
  ClinicalModuleDefinition,
  ClinicalModuleContract,
} from './types';
import {
  NurseSurgicalEvolutionForm,
  createInitialNurseSurgicalEvolutionForm,
} from '../../types/nurseSurgicalEvolution';
import {
  normalizeNurseSurgicalEvolutionForm,
  buildAuthorizedNurseSurgicalEvolutionFacts,
  validateNurseSurgicalEvolutionConsistency,
  auditNurseSurgicalEvolutionNarrative,
} from '../nurseSurgicalEvolutionFactBuilder';
import {
  buildNurseSurgicalEvolutionNote,
  buildNurseSurgicalEvolutionNoteWithTrace,
} from '../nurseSurgicalEvolutionNoteBuilder';
import { verifyNurseSurgicalEvolutionAIRefinedResponse } from '../nurseSurgicalEvolutionPostGenerationVerifier';

export const NURSE_SURGICAL_CLINIC_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: true,
  supportsPain: true,
  supportsNeurologicalAssessment: true,
  supportsRespiratoryAssessment: true,
  supportsMechanicalVentilation: false,
  supportsCardiovascularAssessment: true,
  supportsNutrition: true,
  supportsEliminations: true,
  supportsDevices: true,
  supportsSkinAssessment: true,
  supportsInfusions: false,
  supportsRiskAssessment: true,
  supportsResponseToCare: true,
  supportsNurseClinicalSynthesis: true, // Privativo do Enfermeiro
};

export const NURSE_EVOLUTION_SURGICAL_CLINIC: ClinicalModuleDefinition = {
  id: 'NURSE_EVOLUTION_SURGICAL_CLINIC',
  moduleId: 'nurse_evolution',
  professionalRole: 'nurse',
  documentType: 'NURSE_EVOLUTION',
  clinicalArea: 'surgicalClinic',
  title: 'Evolução de Enfermagem — Clínica Cirúrgica',
  capabilities: NURSE_SURGICAL_CLINIC_CAPABILITIES,
  status: 'development',
  sections: [
    {
      id: 'sec-context',
      title: 'Contexto da evolução',
      description: 'Momento da evolução, localização no setor e acompanhante',
      componentId: 'ContextInputs',
      order: 1,
      optional: false,
    },
    {
      id: 'sec-safety',
      title: 'Segurança e identificação',
      description: 'Pulseira, leito, precauções assistenciais e alergias',
      componentId: 'SafetyIdentificationInputs',
      order: 2,
      optional: false,
    },
    {
      id: 'sec-surgical-context',
      title: 'Contexto cirúrgico',
      description: 'Situação cirúrgica, procedimento realizado, data e anestesia',
      componentId: 'SurgicalContextInputs',
      order: 3,
      optional: false,
    },
    {
      id: 'sec-general',
      title: 'Avaliação geral',
      description: 'Estado geral, nível de consciência, comportamento e queixas',
      componentId: 'GeneralAssessmentInputs',
      order: 4,
      optional: false,
    },
    {
      id: 'sec-pain',
      title: 'Dor pós-operatória',
      description: 'Escala de dor, escore, localização e analgesia prescrita',
      componentId: 'PainAssessmentInputs',
      order: 5,
      optional: true,
      capabilityRequirement: 'supportsPain',
    },
    {
      id: 'sec-vitals',
      title: 'Sinais vitais',
      description: 'PA, PAM informada manualmente, FC, FR, SpO2, Temperatura e Glicemia',
      componentId: 'VitalSignsInputs',
      order: 6,
      optional: true,
      capabilityRequirement: 'supportsVitalSigns',
    },
    {
      id: 'sec-neuro',
      title: 'Avaliação neurológica',
      description: 'Nível de consciência, orientação, pupilas, fotorreação e déficit motor',
      componentId: 'NeurologicalInputs',
      order: 7,
      optional: true,
      capabilityRequirement: 'supportsNeurologicalAssessment',
    },
    {
      id: 'sec-resp',
      title: 'Respiratório',
      description: 'Suporte de O2, padrão ventilatório, desconforto e ausculta pulmonar',
      componentId: 'RespiratorySupportInputs',
      order: 8,
      optional: true,
      capabilityRequirement: 'supportsRespiratoryAssessment',
    },
    {
      id: 'sec-cardio',
      title: 'Cardiovascular',
      description: 'Perfusão periférica, extremidades, TEC, edema e ausculta cardíaca',
      componentId: 'CardiovascularPerfusionInputs',
      order: 9,
      optional: true,
      capabilityRequirement: 'supportsCardiovascularAssessment',
    },
    {
      id: 'sec-gi',
      title: 'Gastrointestinal',
      description: 'Forma abdominal, consistência, dor à palpação, RHA e náuseas/vômitos',
      componentId: 'GastrointestinalInputs',
      order: 10,
      optional: true,
    },
    {
      id: 'sec-nutrition',
      title: 'Nutrição',
      description: 'Via nutricional, aceitação, jejum e tolerância à dieta',
      componentId: 'NutritionInputs',
      order: 11,
      optional: true,
      capabilityRequirement: 'supportsNutrition',
    },
    {
      id: 'sec-elim',
      title: 'Eliminações',
      description: 'Diurese com via, aspecto e débito, e evacuações',
      componentId: 'EliminationInputs',
      order: 12,
      optional: true,
      capabilityRequirement: 'supportsEliminations',
    },
    {
      id: 'sec-wound',
      title: 'Ferida operatória',
      description: 'Localização anatômica, aspecto, curativo e presença de exsudato',
      componentId: 'SurgicalWoundInputs',
      order: 13,
      optional: true,
    },
    {
      id: 'sec-dressing',
      title: 'Curativo cirúrgico',
      description: 'Troca de curativo, cobertura e produto utilizado e achados',
      componentId: 'SurgicalDressingInputs',
      order: 14,
      optional: true,
    },
    {
      id: 'sec-drains',
      title: 'Drenos',
      description: 'Drenos cirúrgicos, permeabilidade, fixação, débito e aspecto',
      componentId: 'SurgicalDrainsInputs',
      order: 15,
      optional: true,
    },
    {
      id: 'sec-devices',
      title: 'Dispositivos invasivos',
      description: 'Acessos vasculares, sondas e outros dispositivos invasivos',
      componentId: 'DeviceFormCard',
      order: 16,
      optional: true,
      capabilityRequirement: 'supportsDevices',
    },
    {
      id: 'sec-mobility',
      title: 'Mobilidade',
      description: 'Deambulação, repouso no leito e mudança de decúbito assistida',
      componentId: 'MobilityInputs',
      order: 17,
      optional: true,
    },
    {
      id: 'sec-hygiene',
      title: 'Higiene e autocuidado',
      description: 'Grau de dependência para higiene, tipo de banho e tolerância',
      componentId: 'BathInputs',
      order: 18,
      optional: true,
    },
    {
      id: 'sec-risks',
      title: 'Riscos assistenciais',
      description: 'Escores de risco de queda, lesão por pressão e broncoaspiração',
      componentId: 'RiskAssessmentInputs',
      order: 19,
      optional: true,
      capabilityRequirement: 'supportsRiskAssessment',
    },
    {
      id: 'sec-care',
      title: 'Cuidados realizados',
      description: 'Checklist de cuidados de enfermagem cirúrgica prestados',
      componentId: 'NursingCareInputs',
      order: 20,
      optional: true,
    },
    {
      id: 'sec-response',
      title: 'Resposta aos cuidados',
      description: 'Resposta factual e objetiva observada após as intervenções',
      componentId: 'ResponseToCareInputs',
      order: 21,
      optional: true,
      capabilityRequirement: 'supportsResponseToCare',
    },
    {
      id: 'sec-complications',
      title: 'Intercorrências',
      description: 'Intercorrências registradas, conduta imediata e comunicação',
      componentId: 'ComplicationInputs',
      order: 22,
      optional: true,
    },
    {
      id: 'sec-communication',
      title: 'Comunicação',
      description: 'Comunicação assistencial à equipe cirúrgica ou plantonista',
      componentId: 'CommunicationInputs',
      order: 23,
      optional: true,
    },
    {
      id: 'sec-comparison',
      title: 'Comparação com avaliação anterior',
      description: 'Evolução clínica em relação ao período cirúrgico anterior',
      componentId: 'EvolutionStatusInputs',
      order: 24,
      optional: true,
    },
    {
      id: 'sec-synthesis',
      title: 'Síntese de enfermagem',
      description: 'Julgamento clínico e síntese privativa do Enfermeiro',
      componentId: 'NurseSynthesisInputs',
      order: 25,
      optional: true,
      capabilityRequirement: 'supportsNurseClinicalSynthesis',
    },
    {
      id: 'sec-status',
      title: 'Situação atual',
      description: 'Condição de permanência no leito ou encaminhamento pós-operatório',
      componentId: 'EvolutionStatusInputs',
      order: 26,
      optional: false,
    },
  ],
};

export const NURSE_EVOLUTION_SURGICAL_CLINIC_CONTRACT: ClinicalModuleContract<
  NurseSurgicalEvolutionForm,
  NurseSurgicalEvolutionForm,
  any
> = {
  definition: NURSE_EVOLUTION_SURGICAL_CLINIC,
  route: 'nurse-evolution-surgical-clinic',
  formComponentId: 'NurseSurgicalEvolutionFormScreen',
  createInitialForm: createInitialNurseSurgicalEvolutionForm,
  normalizer: normalizeNurseSurgicalEvolutionForm,
  factsBuilder: buildAuthorizedNurseSurgicalEvolutionFacts,
  deterministicBuilder: (norm: NurseSurgicalEvolutionForm) => {
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(norm);
    return buildNurseSurgicalEvolutionNote(facts);
  },
  consistencyValidator: validateNurseSurgicalEvolutionConsistency,
  narrativeAuditor: (traces: any, facts: any) => {
    const narrative = Array.isArray(traces)
      ? traces.map((t: any) => t.text || '').join(' ')
      : String(traces);
    const auditRes = auditNurseSurgicalEvolutionNarrative(narrative, facts);
    return {
      passed: auditRes.passed,
      unauthorizedSegments: auditRes.untraceableSegments,
    };
  },
  postGenerationVerifier: (rawResponse, facts, canonical) => {
    const vResult = verifyNurseSurgicalEvolutionAIRefinedResponse(rawResponse, facts, canonical);
    return {
      approved: vResult.approved,
      rejectionReasons: vResult.reasons,
    };
  },
  aiRefinementPolicy: {
    common: true,
    specificRole: 'nurse',
  },
};
