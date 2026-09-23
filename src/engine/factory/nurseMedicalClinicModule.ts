import {
  ClinicalModuleCapabilities,
  ClinicalModuleDefinition,
  ClinicalModuleContract,
} from './types';
import {
  NurseMedicalEvolutionForm,
  createInitialNurseMedicalEvolutionForm,
} from '../../types/nurseMedicalEvolution';
import {
  normalizeNurseMedicalEvolutionForm,
  buildAuthorizedNurseMedicalEvolutionFacts,
  validateNurseMedicalEvolutionConsistency,
  auditNurseMedicalEvolutionNarrative,
} from '../nurseMedicalEvolutionFactBuilder';
import {
  buildNurseMedicalEvolutionNote,
  buildNurseMedicalEvolutionNoteWithTrace,
} from '../nurseMedicalEvolutionNoteBuilder';
import { verifyNurseMedicalEvolutionAIRefinedResponse } from '../nurseMedicalEvolutionPostGenerationVerifier';

export const NURSE_MEDICAL_CLINIC_CAPABILITIES: ClinicalModuleCapabilities = {
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

export const NURSE_EVOLUTION_MEDICAL_CLINIC: ClinicalModuleDefinition = {
  id: 'NURSE_EVOLUTION_MEDICAL_CLINIC',
  moduleId: 'nurse_evolution',
  professionalRole: 'nurse',
  documentType: 'NURSE_EVOLUTION',
  clinicalArea: 'medicalClinic',
  title: 'Evolução de Enfermagem — Clínica Médica',
  capabilities: NURSE_MEDICAL_CLINIC_CAPABILITIES,
  status: 'development',
  sections: [
    {
      id: 'sec-context',
      title: 'Contexto do Atendimento',
      description: 'Momento, localização, checagem de pulseira e leito, precauções e alergias',
      componentId: 'ContextInputs',
      order: 1,
      optional: false,
    },
    {
      id: 'sec-general',
      title: 'Avaliação Geral',
      description: 'Estado geral, nível de consciência, comportamento, queixas e fonte da informação',
      componentId: 'GeneralAssessmentInputs',
      order: 2,
      optional: false,
    },
    {
      id: 'sec-vitals',
      title: 'Sinais Vitais',
      description: 'PA, PAM manual, FC, FR, SpO2, Temperatura e Glicemia capilar',
      componentId: 'VitalSignsInputs',
      order: 3,
      optional: true,
      capabilityRequirement: 'supportsVitalSigns',
    },
    {
      id: 'sec-pain',
      title: 'Avaliação da Dor',
      description: 'Escala numérica ou descritiva, localização, características e observações',
      componentId: 'PainAssessmentInputs',
      order: 4,
      optional: true,
      capabilityRequirement: 'supportsPain',
    },
    {
      id: 'sec-neuro',
      title: 'Avaliação Neurológica',
      description: 'Consciência, orientação, pupilas, fotorreação e déficit motor',
      componentId: 'NeurologicalInputs',
      order: 5,
      optional: true,
      capabilityRequirement: 'supportsNeurologicalAssessment',
    },
    {
      id: 'sec-resp',
      title: 'Sistema Respiratório',
      description: 'Suporte de oxigênio, padrão, desconforto e ausculta pulmonar',
      componentId: 'RespiratorySupportInputs',
      order: 6,
      optional: true,
      capabilityRequirement: 'supportsRespiratoryAssessment',
    },
    {
      id: 'sec-cardio',
      title: 'Sistema Cardiovascular',
      description: 'Perfusão, extremidades, TEC, edema e ausculta cardíaca',
      componentId: 'CardiovascularPerfusionInputs',
      order: 7,
      optional: true,
      capabilityRequirement: 'supportsCardiovascularAssessment',
    },
    {
      id: 'sec-nutrition',
      title: 'Nutrição e Trato Gastrointestinal',
      description: 'Abdome, ruídos hidroaéreos, via nutricional e aceitação/tolerância',
      componentId: 'NutritionInputs',
      order: 8,
      optional: true,
      capabilityRequirement: 'supportsNutrition',
    },
    {
      id: 'sec-elim',
      title: 'Eliminações Fisiológicas',
      description: 'Diurese com via e aspecto, e evacuações',
      componentId: 'EliminationInputs',
      order: 9,
      optional: true,
      capabilityRequirement: 'supportsEliminations',
    },
    {
      id: 'sec-devices',
      title: 'Dispositivos Invasivos',
      description: 'Acessos vasculares periféricos e centrais, sondas e drenos',
      componentId: 'DeviceFormCard',
      order: 10,
      optional: true,
      capabilityRequirement: 'supportsDevices',
    },
    {
      id: 'sec-skin',
      title: 'Pele e Integridade Cutânea',
      description: 'Integridade, hidratação, lesões, características e curativos',
      componentId: 'SkinAssessmentInputs',
      order: 11,
      optional: true,
      capabilityRequirement: 'supportsSkinAssessment',
    },
    {
      id: 'sec-mobility',
      title: 'Mobilidade e Posicionamento',
      description: 'Deambulação, repouso no leito e mudança de decúbito',
      componentId: 'MobilityInputs',
      order: 12,
      optional: true,
    },
    {
      id: 'sec-hygiene',
      title: 'Higiene e Autocuidado',
      description: 'Condição de higiene, tipo de banho e tolerância se realizado',
      componentId: 'BathInputs',
      order: 13,
      optional: true,
    },
    {
      id: 'sec-risks',
      title: 'Riscos Assistenciais',
      description: 'Avaliação de risco de queda e de lesão por pressão com escalas registradas',
      componentId: 'RiskAssessmentInputs',
      order: 14,
      optional: true,
      capabilityRequirement: 'supportsRiskAssessment',
    },
    {
      id: 'sec-care',
      title: 'Cuidados Realizados',
      description: 'Checklist de condutas e cuidados de enfermagem executados',
      componentId: 'NursingCareInputs',
      order: 15,
      optional: true,
    },
    {
      id: 'sec-response',
      title: 'Resposta aos Cuidados',
      description: 'Resposta factual e objetiva observada após as intervenções',
      componentId: 'ResponseToCareInputs',
      order: 16,
      optional: true,
      capabilityRequirement: 'supportsResponseToCare',
    },
    {
      id: 'sec-complications',
      title: 'Intercorrências no Plantão',
      description: 'Ocorrências, ações executadas e comunicação imediata',
      componentId: 'ComplicationInputs',
      order: 17,
      optional: true,
    },
    {
      id: 'sec-communication',
      title: 'Comunicação Assistencial',
      description: 'Comunicação realizada à equipe médica, enfermagem ou multidisciplinar',
      componentId: 'CommunicationInputs',
      order: 18,
      optional: true,
    },
    {
      id: 'sec-comparison',
      title: 'Comparação com Avaliação Anterior',
      description: 'Alterações observadas em relação ao período ou plantão anterior',
      componentId: 'EvolutionStatusInputs',
      order: 19,
      optional: true,
    },
    {
      id: 'sec-synthesis',
      title: 'Síntese de Enfermagem',
      description: 'Síntese clínica e julgamento profissional privativo do Enfermeiro',
      componentId: 'NurseSynthesisInputs',
      order: 20,
      optional: true,
      capabilityRequirement: 'supportsNurseClinicalSynthesis',
    },
    {
      id: 'sec-status',
      title: 'Situação Atual',
      description: 'Desfecho e condição do paciente ao final do registro',
      componentId: 'EvolutionStatusInputs',
      order: 21,
      optional: false,
    },
  ],
};

export const NURSE_EVOLUTION_MEDICAL_CLINIC_CONTRACT: ClinicalModuleContract<
  NurseMedicalEvolutionForm,
  NurseMedicalEvolutionForm,
  any
> = {
  definition: NURSE_EVOLUTION_MEDICAL_CLINIC,
  route: 'nurse-evolution-medical-clinic',
  formComponentId: 'NurseMedicalEvolutionFormScreen',
  createInitialForm: createInitialNurseMedicalEvolutionForm,
  normalizer: normalizeNurseMedicalEvolutionForm,
  factsBuilder: buildAuthorizedNurseMedicalEvolutionFacts,
  deterministicBuilder: (norm: NurseMedicalEvolutionForm) => {
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(norm);
    return buildNurseMedicalEvolutionNote(facts);
  },
  consistencyValidator: validateNurseMedicalEvolutionConsistency,
  narrativeAuditor: (traces, facts) => {
    const auditRes = auditNurseMedicalEvolutionNarrative(traces, facts);
    return {
      passed: auditRes.passed,
      unauthorizedSegments: auditRes.unauthorizedSegments,
    };
  },
  postGenerationVerifier: (rawResponse, facts, canonical) => {
    const vResult = verifyNurseMedicalEvolutionAIRefinedResponse(rawResponse, facts, canonical);
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
