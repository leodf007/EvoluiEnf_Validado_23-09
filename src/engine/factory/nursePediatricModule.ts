import {
  ClinicalModuleCapabilities,
  ClinicalModuleDefinition,
  ClinicalModuleContract,
} from './types';
import {
  NursePediatricEvolutionForm,
  createInitialNursePediatricEvolutionForm,
} from '../../types/nursePediatricEvolution';
import {
  normalizeNursePediatricEvolutionForm,
  buildAuthorizedNursePediatricEvolutionFacts,
  validateNursePediatricEvolutionConsistency,
  auditNursePediatricEvolutionNarrative,
} from '../nursePediatricEvolutionFactBuilder';
import {
  buildNursePediatricEvolutionNote,
  buildNursePediatricEvolutionNoteWithTrace,
} from '../nursePediatricEvolutionNoteBuilder';
import { verifyNursePediatricEvolutionAIRefinedResponse } from '../nursePediatricEvolutionPostGenerationVerifier';

export const NURSE_PEDIATRICS_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: true,
  supportsPain: true,
  supportsNeurologicalAssessment: true,
  supportsRespiratoryAssessment: true,
  supportsMechanicalVentilation: true,
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

export const NURSE_EVOLUTION_PEDIATRICS: ClinicalModuleDefinition = {
  id: 'NURSE_EVOLUTION_PEDIATRICS',
  moduleId: 'nurse_evolution',
  professionalRole: 'nurse',
  documentType: 'NURSE_EVOLUTION',
  clinicalArea: 'pediatrics',
  title: 'Evolução de Enfermagem — Pediatria',
  capabilities: NURSE_PEDIATRICS_CAPABILITIES,
  status: 'development',
  sections: [
    {
      id: 'sec-context',
      title: 'Contexto da evolução',
      description: 'Momento da evolução e localização no setor pediátrico',
      componentId: 'ContextInputs',
      order: 1,
      optional: false,
    },
    {
      id: 'sec-safety',
      title: 'Segurança e identificação',
      description: 'Pulseira, leito/berço, precauções e alergias',
      componentId: 'SafetyIdentificationInputs',
      order: 2,
      optional: false,
    },
    {
      id: 'sec-pediatric-data',
      title: 'Dados pediátricos',
      description: 'Idade informada, peso e estatura/comprimento (sem cálculos de IMC/percentil)',
      componentId: 'PediatricCharacteristicsInputs',
      order: 3,
      optional: true,
    },
    {
      id: 'sec-guardian',
      title: 'Responsável e acompanhante',
      description: 'Presença e grau de parentesco do acompanhante (sem identificação nominal)',
      componentId: 'PediatricAccompanimentInputs',
      order: 4,
      optional: false,
    },
    {
      id: 'sec-info-source',
      title: 'Fonte das informações',
      description: 'Origem das informações prestadas (paciente, responsável, equipe)',
      componentId: 'GeneralAssessmentInputs',
      order: 5,
      optional: false,
    },
    {
      id: 'sec-general',
      title: 'Avaliação geral',
      description: 'Estado geral e queixas referidas',
      componentId: 'GeneralAssessmentInputs',
      order: 6,
      optional: false,
    },
    {
      id: 'sec-behavior',
      title: 'Comportamento',
      description: 'Comportamento observado e nível de atividade sem inferências de maturidade',
      componentId: 'PediatricNeuroBehaviorInputs',
      order: 7,
      optional: false,
    },
    {
      id: 'sec-pain',
      title: 'Dor pediátrica',
      description: 'Escala numérica, Escala de Faces ou FLACC com escore informado',
      componentId: 'PainAssessmentInputs',
      order: 8,
      optional: true,
      capabilityRequirement: 'supportsPain',
    },
    {
      id: 'sec-vitals',
      title: 'Sinais vitais',
      description: 'PA, PAM manual fidedigna, FC, FR, SpO2, Tax e Glicemia',
      componentId: 'VitalSignsInputs',
      order: 9,
      optional: false,
      capabilityRequirement: 'supportsVitalSigns',
    },
    {
      id: 'sec-neuro',
      title: 'Avaliação neurológica',
      description: 'Nível de consciência, pupilas e reatividade aos estímulos',
      componentId: 'NeurologicalInputs',
      order: 10,
      optional: false,
      capabilityRequirement: 'supportsNeurologicalAssessment',
    },
    {
      id: 'sec-resp',
      title: 'Sistema respiratório',
      description: 'Suporte ventilatório, padrão, ausculta pulmonar e sinais de esforço/tiragem',
      componentId: 'RespiratorySupportInputs',
      order: 11,
      optional: false,
      capabilityRequirement: 'supportsRespiratoryAssessment',
    },
    {
      id: 'sec-cardio',
      title: 'Sistema cardiovascular',
      description: 'Ausculta cardíaca, perfusão periférica, pulsos, extremidades e edema',
      componentId: 'CardiovascularPerfusionInputs',
      order: 12,
      optional: false,
      capabilityRequirement: 'supportsCardiovascularAssessment',
    },
    {
      id: 'sec-gi',
      title: 'Sistema gastrointestinal',
      description: 'Abdome, ruídos hidroaéreos, dor à palpação e episódios de náuseas/vômitos',
      componentId: 'GeneralAssessmentInputs',
      order: 13,
      optional: false,
    },
    {
      id: 'sec-nutrition',
      title: 'Nutrição e alimentação',
      description: 'Tipo de alimentação (aleitamento, fórmula, VO, enteral), aceitação e taxa',
      componentId: 'NutritionInputs',
      order: 14,
      optional: false,
      capabilityRequirement: 'supportsNutrition',
    },
    {
      id: 'sec-eliminations',
      title: 'Eliminações',
      description: 'Diurese (fralda, vaso, sonda) e características das evacuações',
      componentId: 'EliminationInputs',
      order: 15,
      optional: false,
      capabilityRequirement: 'supportsEliminations',
    },
    {
      id: 'sec-skin',
      title: 'Pele e integridade cutânea',
      description: 'Integridade, turgor, assaduras/dermatites, lesões e curativos',
      componentId: 'SkinAssessmentInputs',
      order: 16,
      optional: false,
      capabilityRequirement: 'supportsSkinAssessment',
    },
    {
      id: 'sec-devices',
      title: 'Dispositivos',
      description: 'Acessos vasculares (PICC, AVP, CVC), sondas, permeabilidade e curativo',
      componentId: 'DeviceFormCard',
      order: 17,
      optional: true,
      capabilityRequirement: 'supportsDevices',
    },
    {
      id: 'sec-mobility',
      title: 'Mobilidade',
      description: 'Deambulação, repouso no leito, berço ou colo do acompanhante',
      componentId: 'MobilityInputs',
      order: 18,
      optional: false,
    },
    {
      id: 'sec-hygiene',
      title: 'Higiene e autocuidado',
      description: 'Tipo de banho realizado e tolerância observada da criança',
      componentId: 'BathInputs',
      order: 19,
      optional: true,
    },
    {
      id: 'sec-sleep',
      title: 'Sono e repouso',
      description: 'Padrão de repouso e sono durante o período',
      componentId: 'GeneralAssessmentInputs',
      order: 20,
      optional: true,
    },
    {
      id: 'sec-risks',
      title: 'Riscos assistenciais',
      description: 'Risco de queda (grades de berço/leito), broncoaspiração e lesões',
      componentId: 'RiskAssessmentInputs',
      order: 21,
      optional: true,
      capabilityRequirement: 'supportsRiskAssessment',
    },
    {
      id: 'sec-care',
      title: 'Cuidados realizados',
      description: 'Intervenções e cuidados de enfermagem executados no plantão',
      componentId: 'NursingCareInputs',
      order: 22,
      optional: false,
    },
    {
      id: 'sec-response-care',
      title: 'Resposta aos cuidados',
      description: 'Resposta factual explícita observada após as intervenções',
      componentId: 'ResponseToCareInputs',
      order: 23,
      optional: true,
      capabilityRequirement: 'supportsResponseToCare',
    },
    {
      id: 'sec-complications',
      title: 'Intercorrências',
      description: 'Registro de alterações agudas, conduta imediata e comunicação à equipe',
      componentId: 'ComplicationInputs',
      order: 24,
      optional: true,
    },
    {
      id: 'sec-communication',
      title: 'Comunicação com família e equipe',
      description: 'Orientações aos responsáveis e alinhamento assistencial',
      componentId: 'CommunicationInputs',
      order: 25,
      optional: true,
    },
    {
      id: 'sec-comparison',
      title: 'Comparação com avaliação anterior',
      description: 'Evolução clínica em relação ao plantão ou avaliação prévia',
      componentId: 'EvolutionStatusInputs',
      order: 26,
      optional: true,
    },
    {
      id: 'sec-synthesis',
      title: 'Síntese de enfermagem',
      description: 'Raciocínio clínico e julgamento profissional privativo do Enfermeiro',
      componentId: 'NurseSynthesisInputs',
      order: 27,
      optional: true,
      capabilityRequirement: 'supportsNurseClinicalSynthesis',
    },
    {
      id: 'sec-status',
      title: 'Situação atual',
      description: 'Condição de permanência no leito/berço e pendências assistenciais',
      componentId: 'EvolutionStatusInputs',
      order: 28,
      optional: false,
    },
  ],
};

export const NURSE_EVOLUTION_PEDIATRICS_CONTRACT: ClinicalModuleContract<
  NursePediatricEvolutionForm,
  NursePediatricEvolutionForm,
  any
> = {
  definition: NURSE_EVOLUTION_PEDIATRICS,
  route: 'nurse-evolution-pediatrics',
  formComponentId: 'NursePediatricEvolutionFormScreen',
  createInitialForm: createInitialNursePediatricEvolutionForm,
  normalizer: normalizeNursePediatricEvolutionForm,
  factsBuilder: buildAuthorizedNursePediatricEvolutionFacts,
  deterministicBuilder: (norm: NursePediatricEvolutionForm) => {
    const facts = buildAuthorizedNursePediatricEvolutionFacts(norm);
    return buildNursePediatricEvolutionNote(facts);
  },
  consistencyValidator: (form: NursePediatricEvolutionForm) => {
    const result = validateNursePediatricEvolutionConsistency(form);
    return [
      ...result.errors.map((msg) => ({ severity: 'error', message: msg })),
      ...result.warnings.map((msg) => ({ severity: 'warning', message: msg })),
    ];
  },
  narrativeAuditor: (traces: any, facts: any) => {
    const narrative = Array.isArray(traces)
      ? traces.map((t: any) => t.text || '').join(' ')
      : String(traces);
    const auditRes = auditNursePediatricEvolutionNarrative(narrative, facts);
    return {
      passed: auditRes.passed,
      unauthorizedSegments: auditRes.untraceableSegments,
    };
  },
  postGenerationVerifier: (rawResponse, facts, canonical) => {
    const vResult = verifyNursePediatricEvolutionAIRefinedResponse(rawResponse, facts, canonical);
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
