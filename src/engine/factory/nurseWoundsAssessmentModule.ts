import {
  ClinicalModuleCapabilities,
  ClinicalModuleDefinition,
  ClinicalModuleContract,
  ClinicalArea,
} from './types';
import {
  NurseWoundsAssessmentForm,
  createInitialNurseWoundsAssessmentForm,
} from '../../types/nurseWoundsAssessment';
import {
  normalizeNurseWoundsAssessmentForm,
  buildAuthorizedNurseWoundsFacts,
  validateNurseWoundsConsistency,
  auditNurseWoundsNarrative,
} from '../nurseWoundsFactBuilder';
import { buildNurseWoundsAssessmentNote } from '../nurseWoundsAssessmentBuilder';
import { verifyNurseWoundsAIRefinedResponse } from '../nurseWoundsPostGenerationVerifier';

export const NURSE_WOUNDS_ASSESSMENT_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: false,
  supportsPain: true,
  supportsNeurologicalAssessment: false,
  supportsRespiratoryAssessment: false,
  supportsMechanicalVentilation: false,
  supportsCardiovascularAssessment: false,
  supportsNutrition: false,
  supportsEliminations: false,
  supportsDevices: true,
  supportsSkinAssessment: true,
  supportsInfusions: false,
  supportsRiskAssessment: false,
  supportsResponseToCare: true,
  supportsNurseClinicalSynthesis: true,
  supportsWoundAssessment: true,
};

export const NURSE_WOUNDS_ASSESSMENT: ClinicalModuleDefinition = {
  id: 'NURSE_WOUNDS_ASSESSMENT',
  moduleId: 'nurse_wounds',
  professionalRole: 'nurse',
  documentType: 'WOUND_ASSESSMENT',
  clinicalArea: ClinicalArea.ALL,
  title: 'Avaliação de Feridas',
  capabilities: NURSE_WOUNDS_ASSESSMENT_CAPABILITIES,
  status: 'available',
  sections: [
    {
      id: 'sec-wound-context',
      title: 'Contexto da Avaliação',
      description: 'Data, horário, unidade clínica e leito de realização',
      componentId: 'WoundEvaluationContextInputs',
      order: 1,
      optional: false,
    },
    {
      id: 'sec-wound-eval-type',
      title: 'Tipo de Avaliação',
      description: 'Avaliação inicial, reavaliação ou acompanhamento evolutivo',
      componentId: 'WoundEvaluationTypeInputs',
      order: 2,
      optional: false,
    },
    {
      id: 'sec-wound-id',
      title: 'Identificação da Lesão',
      description: 'Etiologia/tipo da lesão informada e identificador',
      componentId: 'WoundIdentificationInputs',
      order: 3,
      optional: false,
    },
    {
      id: 'sec-wound-location',
      title: 'Localização Anatômica',
      description: 'Região anatômica da lesão e detalhamento',
      componentId: 'WoundAnatomicalLocationInputs',
      order: 4,
      optional: false,
    },
    {
      id: 'sec-wound-laterality',
      title: 'Lateralidade',
      description: 'Lado direito, esquerdo, bilateral ou não informado',
      componentId: 'WoundLateralityInputs',
      order: 5,
      optional: false,
    },
    {
      id: 'sec-wound-duration',
      title: 'Tempo de Existência Informado',
      description: 'Duração referida pelo paciente, familiar ou prontuário',
      componentId: 'WoundReportedDurationInputs',
      order: 6,
      optional: true,
    },
    {
      id: 'sec-wound-origin',
      title: 'Origem Informada',
      description: 'Domiciliar, intra-hospitalar ou procedência externa',
      componentId: 'WoundReportedOriginInputs',
      order: 7,
      optional: true,
    },
    {
      id: 'sec-wound-measurements',
      title: 'Medidas da Lesão',
      description: 'Comprimento, largura e profundidade em centímetros',
      componentId: 'WoundMeasurementsInputs',
      order: 8,
      optional: false,
    },
    {
      id: 'sec-wound-bed',
      title: 'Características do Leito',
      description: 'Tipos de tecidos observados (granulação, esfacelo, necrose, epitelização)',
      componentId: 'WoundBedInputs',
      order: 9,
      optional: false,
    },
    {
      id: 'sec-wound-edges',
      title: 'Bordas',
      description: 'Condição das bordas (íntegras, maceradas, hiperemiadas, ressecadas)',
      componentId: 'WoundEdgesInputs',
      order: 10,
      optional: false,
    },
    {
      id: 'sec-wound-perilesional',
      title: 'Pele ao Redor',
      description: 'Condição da pele perilesional (íntegra, hiperemia, edema, maceração)',
      componentId: 'PerilesionalSkinInputs',
      order: 11,
      optional: false,
    },
    {
      id: 'sec-wound-exudate',
      title: 'Exsudato',
      description: 'Presença, tipo e quantidade de exsudato',
      componentId: 'WoundExudateInputs',
      order: 12,
      optional: false,
    },
    {
      id: 'sec-wound-odor',
      title: 'Odor',
      description: 'Odor ausente ou presente e características',
      componentId: 'WoundOdorInputs',
      order: 13,
      optional: false,
    },
    {
      id: 'sec-wound-pain',
      title: 'Dor Relacionada',
      description: 'Avaliação de dor na lesão, escala e escore',
      componentId: 'WoundPainInputs',
      order: 14,
      optional: false,
      capabilityRequirement: 'supportsPain',
    },
    {
      id: 'sec-wound-staging',
      title: 'Classificação / Estadiamento Informado',
      description: 'Estadiamento registrado privativamente pelo enfermeiro',
      componentId: 'WoundStagingInputs',
      order: 15,
      optional: false,
      capabilityRequirement: 'supportsNurseClinicalSynthesis',
    },
    {
      id: 'sec-wound-tunneling',
      title: 'Túneis e Descolamentos',
      description: 'Presença de descolamento, fístula ou trajeto tunelizado',
      componentId: 'WoundTunnelingInputs',
      order: 16,
      optional: true,
    },
    {
      id: 'sec-wound-signs',
      title: 'Sinais Observados',
      description: 'Sinais clínicos locais (calor, rubor perilesional, sangramento)',
      componentId: 'WoundObservedSignsInputs',
      order: 17,
      optional: false,
    },
    {
      id: 'sec-wound-devices',
      title: 'Dispositivos Relacionados',
      description: 'Dispositivos próximos ou fixados no sítio da lesão',
      componentId: 'WoundRelatedDevicesInputs',
      order: 18,
      optional: true,
      capabilityRequirement: 'supportsDevices',
    },
    {
      id: 'sec-wound-covering',
      title: 'Cobertura Atual Encontrada',
      description: 'Cobertura prévia presente na inspeção inicial',
      componentId: 'WoundCurrentCoveringInputs',
      order: 19,
      optional: true,
    },
    {
      id: 'sec-wound-dressing',
      title: 'Curativo Realizado',
      description: 'Procedimento de curativo, técnica, solução e coberturas aplicadas',
      componentId: 'WoundDressingProcedureInputs',
      order: 20,
      optional: false,
    },
    {
      id: 'sec-wound-products',
      title: 'Produtos Utilizados',
      description: 'Produtos terapêuticos e coberturas utilizadas no curativo',
      componentId: 'WoundProductsUsedInputs',
      order: 21,
      optional: true,
    },
    {
      id: 'sec-wound-response',
      title: 'Resposta Observada',
      description: 'Tolerância do paciente ao procedimento e desfecho imediato',
      componentId: 'WoundObservedResponseInputs',
      order: 22,
      optional: false,
      capabilityRequirement: 'supportsResponseToCare',
    },
    {
      id: 'sec-wound-comparison',
      title: 'Comparação com Avaliação Anterior',
      description: 'Evolução comparativa da ferida em relação à avaliação prévia',
      componentId: 'WoundPreviousComparisonInputs',
      order: 23,
      optional: true,
    },
    {
      id: 'sec-wound-conduct',
      title: 'Conduta Registrada pelo Enfermeiro',
      description: 'Plano de troca de curativo, orientações e encaminhamentos',
      componentId: 'WoundNurseConductInputs',
      order: 24,
      optional: false,
      capabilityRequirement: 'supportsNurseClinicalSynthesis',
    },
    {
      id: 'sec-wound-additional',
      title: 'Informações Adicionais',
      description: 'Observações complementares de enfermagem',
      componentId: 'WoundAdditionalInfoInputs',
      order: 25,
      optional: true,
    },
  ],
};

export const NURSE_WOUNDS_ASSESSMENT_CONTRACT: ClinicalModuleContract<
  NurseWoundsAssessmentForm,
  NurseWoundsAssessmentForm,
  any
> = {
  definition: NURSE_WOUNDS_ASSESSMENT,
  route: 'nurse-wounds-assessment',
  formComponentId: 'NurseWoundsAssessmentFormScreen',
  createInitialForm: createInitialNurseWoundsAssessmentForm,
  normalizer: normalizeNurseWoundsAssessmentForm,
  factsBuilder: buildAuthorizedNurseWoundsFacts,
  deterministicBuilder: (norm: NurseWoundsAssessmentForm) => {
    const facts = buildAuthorizedNurseWoundsFacts(norm);
    return buildNurseWoundsAssessmentNote(facts);
  },
  consistencyValidator: (form: NurseWoundsAssessmentForm) => {
    const result = validateNurseWoundsConsistency(form);
    return [
      ...result.errors.map((msg) => ({ severity: 'error', message: msg })),
      ...result.warnings.map((msg) => ({ severity: 'warning', message: msg })),
    ];
  },
  narrativeAuditor: (traces: any, facts: any) => {
    const narrative = Array.isArray(traces)
      ? traces.map((t: any) => t.text || '').join(' ')
      : String(traces);
    const auditRes = auditNurseWoundsNarrative(narrative, facts);
    return {
      passed: auditRes.passed,
      unauthorizedSegments: auditRes.untraceableSegments,
    };
  },
  postGenerationVerifier: (rawResponse, facts, canonical) => {
    const vResult = verifyNurseWoundsAIRefinedResponse(rawResponse, facts, canonical);
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
