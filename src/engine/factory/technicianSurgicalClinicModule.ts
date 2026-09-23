import {
  ClinicalModuleCapabilities,
  ClinicalModuleDefinition,
  ClinicalModuleContract,
} from './types';
import {
  TechnicianSurgicalClinicForm,
  createInitialTechnicianSurgicalClinicForm,
} from '../../types/technicianSurgicalClinic';
import {
  normalizeTechnicianSurgicalClinicData,
  buildSurgicalClinicAuthorizedFacts,
  validateTechnicianSurgicalClinicConsistency,
} from '../surgicalClinicFactBuilder';
import {
  TechnicianSurgicalClinicalNursingNoteBuilder,
  buildTechnicianSurgicalClinicNursingNote,
} from '../technicianSurgicalClinicalNursingNoteBuilder';
import { auditDeterministicNarrative } from '../deterministicNarrativeFactAuditor';
import { verifyAIRefinedResponse } from '../postGenerationVerifier';

export const TECH_SC_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: true,
  supportsPain: true,
  supportsNeurologicalAssessment: true,
  supportsRespiratoryAssessment: true,
  supportsMechanicalVentilation: false, // Strict: Ward technician does not handle invasive mechanical ventilation
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

export const TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC: ClinicalModuleDefinition = {
  id: 'TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC',
  moduleId: 'technician_nursing_note',
  professionalRole: 'technician',
  documentType: 'TECHNICIAN_NURSING_NOTE',
  clinicalArea: 'surgicalClinic',
  title: 'Anotação de Enfermagem — Clínica Cirúrgica',
  capabilities: TECH_SC_CAPABILITIES,
  status: 'available',
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
      id: 'sec-surgical-context',
      title: 'Informações Cirúrgicas Registradas',
      description: 'Situação cirúrgica e procedimento cirúrgico informado',
      componentId: 'SurgicalContextInputs',
      order: 2,
      optional: false,
    },
    {
      id: 'sec-general',
      title: 'Avaliação Geral',
      description: 'Estado observado, queixas e mobilidade',
      componentId: 'GeneralAssessmentInputs',
      order: 3,
      optional: false,
    },
    {
      id: 'sec-pain',
      title: 'Dor Pós-Operatória',
      description: 'Escala numérica de dor e localização referida',
      componentId: 'PainAssessmentInputs',
      order: 4,
      optional: true,
      capabilityRequirement: 'supportsPain',
    },
    {
      id: 'sec-vitals',
      title: 'Sinais Vitais',
      description: 'PA, PAM manual, FC, FR, SpO2, Temperatura, Glicemia',
      componentId: 'VitalSignsInputs',
      order: 5,
      optional: true,
      capabilityRequirement: 'supportsVitalSigns',
    },
    {
      id: 'sec-resp',
      title: 'Respiratório',
      description: 'Suporte ventilatório, padrão e desconforto',
      componentId: 'RespiratorySupportInputs',
      order: 6,
      optional: true,
      capabilityRequirement: 'supportsRespiratoryAssessment',
    },
    {
      id: 'sec-wound',
      title: 'Ferida e Curativo Cirúrgico Observado',
      description: 'Presença de curativo, localização e condição observada',
      componentId: 'SurgicalWoundInputs',
      order: 7,
      optional: true,
    },
    {
      id: 'sec-devices',
      title: 'Drenos e Dispositivos Invasivos',
      description: 'Drenos (tórax, abdominal, cirúrgico), acessos vasculares e sondas',
      componentId: 'DeviceFormCard',
      order: 8,
      optional: true,
      capabilityRequirement: 'supportsDevices',
    },
    {
      id: 'sec-nutrition',
      title: 'Alimentação',
      description: 'Via de alimentação, jejum, aceitação e dieta enteral',
      componentId: 'NutritionInputs',
      order: 9,
      optional: true,
      capabilityRequirement: 'supportsNutrition',
    },
    {
      id: 'sec-eliminations',
      title: 'Eliminações',
      description: 'Eliminações vesicais e intestinais',
      componentId: 'EliminationInputs',
      order: 10,
      optional: true,
      capabilityRequirement: 'supportsEliminations',
    },
    {
      id: 'sec-mobility',
      title: 'Mobilidade e Pós-Operatório',
      description: 'Deambulação realizada, auxílio ou restrito ao leito',
      componentId: 'MobilityInputs',
      order: 11,
      optional: true,
    },
    {
      id: 'sec-bath',
      title: 'Banho e Higiene',
      description: 'Tipo de banho e tolerância',
      componentId: 'BathInputs',
      order: 12,
      optional: true,
    },
    {
      id: 'sec-care',
      title: 'Cuidados Realizados',
      description: 'Checklist de cuidados de enfermagem executados',
      componentId: 'NursingCareInputs',
      order: 13,
      optional: true,
      capabilityRequirement: 'supportsResponseToCare',
    },
    {
      id: 'sec-complications',
      title: 'Intercorrências',
      description: 'Registro de intercorrências, conduta e comunicação',
      componentId: 'ComplicationInputs',
      order: 14,
      optional: true,
    },
    {
      id: 'sec-final-status',
      title: 'Situação Final',
      description: 'Destino e situação final do paciente no setor',
      componentId: 'CommunicationInputs',
      order: 15,
      optional: false,
    },
  ],
};

export const TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC_CONTRACT: ClinicalModuleContract<
  TechnicianSurgicalClinicForm,
  TechnicianSurgicalClinicForm,
  any
> = {
  definition: TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC,
  route: 'surgical-clinic-evolution',
  formComponentId: 'TechnicianSurgicalClinicFormScreen',
  createInitialForm: createInitialTechnicianSurgicalClinicForm,
  normalizer: normalizeTechnicianSurgicalClinicData,
  factsBuilder: buildSurgicalClinicAuthorizedFacts,
  deterministicBuilder: (norm) => {
    const facts = buildSurgicalClinicAuthorizedFacts(norm);
    return buildTechnicianSurgicalClinicNursingNote(facts);
  },
  consistencyValidator: validateTechnicianSurgicalClinicConsistency,
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
