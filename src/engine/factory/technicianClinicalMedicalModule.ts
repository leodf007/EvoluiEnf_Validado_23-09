import {
  ClinicalModuleCapabilities,
  ClinicalModuleDefinition,
  ClinicalModuleContract,
} from './types';
import {
  TechnicianClinicalMedicalForm,
  createInitialTechnicianClinicalMedicalForm,
} from '../../types/technicianClinicalMedical';
import {
  normalizeTechnicianClinicalMedicalData,
  buildClinicalMedicalAuthorizedFacts,
} from '../clinicalMedicalFactBuilder';
import {
  TechnicianClinicalMedicalNursingNoteBuilder,
  buildTechnicianClinicalMedicalNursingNote,
} from '../technicianClinicalMedicalNursingNoteBuilder';
import { validateClinicalMedicalConsistency } from '../clinicalMedicalConsistencyValidator';
import { auditDeterministicNarrative } from '../deterministicNarrativeFactAuditor';
import { verifyAIRefinedResponse } from '../postGenerationVerifier';

export const TECH_CM_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: true,
  supportsPain: true,
  supportsNeurologicalAssessment: true,
  supportsRespiratoryAssessment: true,
  supportsMechanicalVentilation: false, // Inpatient ward technician does not manage invasive mechanical ventilation
  supportsCardiovascularAssessment: true,
  supportsNutrition: true,
  supportsEliminations: true,
  supportsDevices: true,
  supportsSkinAssessment: true,
  supportsInfusions: false,
  supportsRiskAssessment: false,
  supportsResponseToCare: true,
  supportsNurseClinicalSynthesis: false, // Strict COFEN prohibition for technician
};

export const TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL: ClinicalModuleDefinition = {
  id: 'TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL',
  moduleId: 'technician_nursing_note',
  professionalRole: 'technician',
  documentType: 'TECHNICIAN_NURSING_NOTE',
  clinicalArea: 'CLINICAL_MEDICAL',
  title: 'Anotação de Enfermagem — Clínica Médica',
  capabilities: TECH_CM_CAPABILITIES,
  status: 'development',
  sections: [
    {
      id: 'sec-context',
      title: 'Contexto do Registro',
      description: 'Momento, localização e checagens',
      componentId: 'ContextInputs',
      order: 1,
      optional: false,
    },
    {
      id: 'sec-general',
      title: 'Avaliação Geral',
      description: 'Estado observado, queixas e mobilidade',
      componentId: 'GeneralAssessmentInputs',
      order: 2,
      optional: false,
    },
    {
      id: 'sec-vitals',
      title: 'Sinais Vitais',
      description: 'PA, PAM manual, FC, FR, SpO2, Temperatura, Glicemia',
      componentId: 'VitalSignsInputs',
      order: 3,
      optional: true,
      capabilityRequirement: 'supportsVitalSigns',
    },
    {
      id: 'sec-pain',
      title: 'Avaliação de Dor',
      description: 'Escala numérica de dor e localização',
      componentId: 'PainAssessmentInputs',
      order: 4,
      optional: true,
      capabilityRequirement: 'supportsPain',
    },
    {
      id: 'sec-resp',
      title: 'Respiratório',
      description: 'Suporte ventilatório, padrão e desconforto',
      componentId: 'RespiratorySupportInputs',
      order: 5,
      optional: true,
      capabilityRequirement: 'supportsRespiratoryAssessment',
    },
    {
      id: 'sec-cardio',
      title: 'Cardiovascular',
      description: 'Perfusão periférica, extremidades e edema',
      componentId: 'CardiovascularPerfusionInputs',
      order: 6,
      optional: true,
      capabilityRequirement: 'supportsCardiovascularAssessment',
    },
    {
      id: 'sec-nutrition',
      title: 'Alimentação',
      description: 'Via de alimentação, aceitação e dieta enteral',
      componentId: 'NutritionInputs',
      order: 7,
      optional: true,
      capabilityRequirement: 'supportsNutrition',
    },
    {
      id: 'sec-eliminations',
      title: 'Eliminações',
      description: 'Eliminações vesicais e intestinais',
      componentId: 'EliminationInputs',
      order: 8,
      optional: true,
      capabilityRequirement: 'supportsEliminations',
    },
    {
      id: 'sec-devices',
      title: 'Dispositivos',
      description: 'Mapeamento de acessos vasculares, sondas e drenos',
      componentId: 'DeviceFormCard',
      order: 9,
      optional: true,
      capabilityRequirement: 'supportsDevices',
    },
    {
      id: 'sec-skin',
      title: 'Pele',
      description: 'Integridade cutânea e hidratação',
      componentId: 'SkinAssessmentInputs',
      order: 10,
      optional: true,
      capabilityRequirement: 'supportsSkinAssessment',
    },
    {
      id: 'sec-bath',
      title: 'Banho e Higiene',
      description: 'Tipo de banho e tolerância',
      componentId: 'BathInputs',
      order: 11,
      optional: true,
    },
    {
      id: 'sec-care',
      title: 'Cuidados Realizados',
      description: 'Checklist de cuidados de enfermagem executados',
      componentId: 'NursingCareInputs',
      order: 12,
      optional: true,
      capabilityRequirement: 'supportsResponseToCare',
    },
    {
      id: 'sec-complications',
      title: 'Intercorrências',
      description: 'Registro de intercorrências, conduta e comunicação',
      componentId: 'ComplicationInputs',
      order: 13,
      optional: true,
    },
    {
      id: 'sec-final-status',
      title: 'Situação Final',
      description: 'Destino e situação final do paciente no setor',
      componentId: 'CommunicationInputs',
      order: 14,
      optional: false,
    },
  ],
};

export const TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL_CONTRACT: ClinicalModuleContract<
  TechnicianClinicalMedicalForm,
  TechnicianClinicalMedicalForm,
  any
> = {
  definition: TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL,
  route: 'medical-clinic-evolution',
  formComponentId: 'TechnicianClinicalMedicalFormScreen',
  createInitialForm: createInitialTechnicianClinicalMedicalForm,
  normalizer: normalizeTechnicianClinicalMedicalData,
  factsBuilder: buildClinicalMedicalAuthorizedFacts,
  deterministicBuilder: (norm) => {
    const facts = buildClinicalMedicalAuthorizedFacts(norm);
    return buildTechnicianClinicalMedicalNursingNote(facts);
  },
  consistencyValidator: validateClinicalMedicalConsistency,
  narrativeAuditor: (traces: any[], facts: any) => {
    const res = auditDeterministicNarrative(traces, facts);
    return {
      passed: res.passed,
      unauthorizedSegments: res.unauthorizedSegments,
    };
  },
  postGenerationVerifier: (rawResponse: any, facts: any, canonical: string) => {
    const res = verifyAIRefinedResponse(rawResponse, facts, canonical);
    return {
      approved: res.approved,
      rejectionReasons: res.reasons,
    };
  },
  aiRefinementPolicy: {
    common: true,
    specificRole: 'technician',
  },
};
