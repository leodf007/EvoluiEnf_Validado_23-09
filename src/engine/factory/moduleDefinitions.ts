import {
  ClinicalModuleDefinition,
  ClinicalModuleContract,
  ClinicalModuleCapabilities,
} from './types';
import { MODULE_REGISTRY } from '../moduleRegistry';
import { ProfessionalRolePolicy } from './professionalRolePolicy';

// Normalizers
import { normalizeClinicalData } from '../clinicalDataNormalizer';
import { normalizeNurseEvolutionForm } from '../../utils/nurseEvolutionValidator';

// Facts Builders
import { buildAuthorizedFacts } from '../clinicalFactBuilder';
import { buildAuthorizedICUFacts } from '../icuClinicalFactBuilder';
import { buildAuthorizedAdmissionFacts } from '../admissionClinicalFactBuilder';
import { buildAuthorizedNurseAdmissionFacts } from '../nurseAdmissionClinicalFactBuilder';
import { buildAuthorizedNurseEvolutionFacts } from '../nurseEvolutionClinicalFactBuilder';

// Deterministic Builders
import { buildTechnicianNursingNote } from '../technicianNursingNoteBuilder';
import { buildTechnicianICUNursingNote } from '../technicianICUNursingNoteBuilder';
import { buildTechnicianAdmissionNote } from '../technicianAdmissionNoteBuilder';
import { buildNurseAdmissionNote } from '../nurseAdmissionNoteBuilder';
import { buildNurseEvolutionNote } from '../nurseEvolutionNoteBuilder';

// Consistency Validators
import { validateClinicalConsistency } from '../clinicalConsistencyValidator';
import { validateICUConsistency } from '../icuConsistencyValidator';
import { validateAdmissionClinicalConsistency } from '../admissionConsistencyValidator';
import { validateNurseAdmissionClinicalConsistency } from '../nurseAdmissionConsistencyValidator';

// Post Generation Verifiers
import { verifyPostGeneration } from '../postGenerationVerifier';
import { verifyICUAIRefinedResponse } from '../icuPostGenerationVerifier';
import { verifyAdmissionAIRefinedResponse } from '../admissionPostGenerationVerifier';
import { verifyNurseAdmissionAIRefinedResponse } from '../nurseAdmissionPostGenerationVerifier';

// Auditors
import { auditDeterministicNarrative } from '../deterministicNarrativeFactAuditor';

// Initial Form Creators
import { createInitialClinicalForm } from '../../utils/clinicalValidator';
import { createInitialICUForm } from '../../utils/icuValidator';
import { createInitialAdmissionForm } from '../../utils/admissionValidator';
import { createInitialNurseAdmissionForm } from '../../utils/nurseAdmissionValidator';
import { createInitialNurseEvolutionForm } from '../../utils/nurseEvolutionValidator';

// Component Registry
import { ClinicalComponentRegistry } from './componentRegistry';

// Clinical Medical Module
export {
  TECH_CM_CAPABILITIES,
  TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL,
  TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL_CONTRACT,
} from './technicianClinicalMedicalModule';
import { TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL_CONTRACT } from './technicianClinicalMedicalModule';

// Surgical Clinic Module
export {
  TECH_SC_CAPABILITIES,
  TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC,
  TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC_CONTRACT,
} from './technicianSurgicalClinicModule';
import { TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC_CONTRACT } from './technicianSurgicalClinicModule';

// Pediatrics Module
export {
  TECH_PEDIATRICS_CAPABILITIES,
  TECHNICIAN_NURSING_NOTE_PEDIATRICS,
  TECHNICIAN_NURSING_NOTE_PEDIATRICS_CONTRACT,
} from './technicianPediatricModule';
import { TECHNICIAN_NURSING_NOTE_PEDIATRICS_CONTRACT } from './technicianPediatricModule';

// Nurse ICU Evolution Module
export {
  NURSE_ICU_CAPABILITIES,
  NURSE_EVOLUTION_ICU,
  NURSE_EVOLUTION_ICU_CONTRACT,
} from './nurseICUModule';
import { NURSE_EVOLUTION_ICU_CONTRACT } from './nurseICUModule';

// Nurse Medical Clinic Evolution Module
export {
  NURSE_MEDICAL_CLINIC_CAPABILITIES,
  NURSE_EVOLUTION_MEDICAL_CLINIC,
  NURSE_EVOLUTION_MEDICAL_CLINIC_CONTRACT,
} from './nurseMedicalClinicModule';
import { NURSE_EVOLUTION_MEDICAL_CLINIC_CONTRACT } from './nurseMedicalClinicModule';

// Nurse Surgical Clinic Evolution Module
export {
  NURSE_SURGICAL_CLINIC_CAPABILITIES,
  NURSE_EVOLUTION_SURGICAL_CLINIC,
  NURSE_EVOLUTION_SURGICAL_CLINIC_CONTRACT,
} from './nurseSurgicalClinicModule';
import { NURSE_EVOLUTION_SURGICAL_CLINIC_CONTRACT } from './nurseSurgicalClinicModule';

// Nurse Pediatrics Evolution Module
export {
  NURSE_PEDIATRICS_CAPABILITIES,
  NURSE_EVOLUTION_PEDIATRICS,
  NURSE_EVOLUTION_PEDIATRICS_CONTRACT,
} from './nursePediatricModule';
import { NURSE_EVOLUTION_PEDIATRICS_CONTRACT } from './nursePediatricModule';

// Nurse ICU Admission Module
export {
  NURSE_ADMISSION_ICU_CAPABILITIES,
  NURSE_ADMISSION_ICU,
  NURSE_ADMISSION_ICU_CONTRACT,
} from './nurseICUAdmissionModule';
import { NURSE_ADMISSION_ICU_CONTRACT } from './nurseICUAdmissionModule';

// Nurse Wounds Assessment Module
export {
  NURSE_WOUNDS_ASSESSMENT_CAPABILITIES,
  NURSE_WOUNDS_ASSESSMENT,
  NURSE_WOUNDS_ASSESSMENT_CONTRACT,
} from './nurseWoundsAssessmentModule';
import { NURSE_WOUNDS_ASSESSMENT_CONTRACT } from './nurseWoundsAssessmentModule';

// Nurse SOAP Module
export {
  NURSE_SOAP_CAPABILITIES,
  NURSE_SOAP_DEFINITION,
  NURSE_SOAP_CONTRACT,
} from './nurseSoapModule';
import { NURSE_SOAP_CONTRACT } from './nurseSoapModule';

// Capabilities for Technician General PS Note
export const TECH_PS_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: true,
  supportsPain: true,
  supportsNeurologicalAssessment: true,
  supportsRespiratoryAssessment: true,
  supportsMechanicalVentilation: true,
  supportsCardiovascularAssessment: true,
  supportsNutrition: true,
  supportsEliminations: true,
  supportsDevices: true,
  supportsSkinAssessment: false,
  supportsInfusions: true,
  supportsRiskAssessment: false,
  supportsResponseToCare: false,
  supportsNurseClinicalSynthesis: false, // Strict COFEN prohibition for technician
};

// Capabilities for Technician ICU Note
export const TECH_ICU_CAPABILITIES: ClinicalModuleCapabilities = {
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
  supportsInfusions: true,
  supportsRiskAssessment: false,
  supportsResponseToCare: false,
  supportsNurseClinicalSynthesis: false,
};

// Capabilities for Technician Admission PS Note
export const TECH_ADM_PS_CAPABILITIES: ClinicalModuleCapabilities = {
  supportsVitalSigns: true,
  supportsPain: true,
  supportsNeurologicalAssessment: true,
  supportsRespiratoryAssessment: true,
  supportsMechanicalVentilation: false,
  supportsCardiovascularAssessment: false,
  supportsNutrition: false,
  supportsEliminations: false,
  supportsDevices: true,
  supportsSkinAssessment: true,
  supportsInfusions: false,
  supportsRiskAssessment: false,
  supportsResponseToCare: false,
  supportsNurseClinicalSynthesis: false,
};

// Capabilities for Nurse Admission PS Evolution
export const NURSE_ADM_PS_CAPABILITIES: ClinicalModuleCapabilities = {
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
  supportsResponseToCare: false,
  supportsNurseClinicalSynthesis: true,
};

// Capabilities for Nurse Evolution PS
export const NURSE_EVO_PS_CAPABILITIES: ClinicalModuleCapabilities = {
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
  supportsInfusions: true,
  supportsRiskAssessment: true,
  supportsResponseToCare: true,
  supportsNurseClinicalSynthesis: true,
};

export const TECH_PS_MODULE_DEFINITION: ClinicalModuleDefinition = {
  id: 'tech_nursing_note_ps',
  moduleId: 'technician_nursing_note',
  professionalRole: 'technician',
  documentType: 'TECHNICIAN_NURSING_NOTE',
  clinicalArea: 'emergency',
  title: 'Anotação de Enfermagem — Pronto-Socorro / Emergência',
  capabilities: TECH_PS_CAPABILITIES,
  sections: [
    { id: 'sec-context', title: 'Contexto e Identificação', description: 'Momento, localização e checagem', componentId: 'ContextSection', order: 1, optional: false },
    { id: 'sec-vitals', title: 'Sinais Vitais', description: 'PA, FC, FR, SpO2, Temperatura, Glicemia', componentId: 'VitalSignsInputs', order: 2, optional: true, capabilityRequirement: 'supportsVitalSigns' },
    { id: 'sec-pain', title: 'Avaliação de Dor', description: 'Escala de dor e caracterização', componentId: 'PainAssessmentInputs', order: 3, optional: true, capabilityRequirement: 'supportsPain' },
    { id: 'sec-neuro', title: 'Neurológico', description: 'Consciência, pupilas, Glasgow e RASS', componentId: 'NeurologicalInputs', order: 4, optional: true, capabilityRequirement: 'supportsNeurologicalAssessment' },
    { id: 'sec-resp', title: 'Respiratório', description: 'Padrão respiratório e suporte de O2', componentId: 'RespiratorySupportInputs', order: 5, optional: true, capabilityRequirement: 'supportsRespiratoryAssessment' },
    { id: 'sec-cardio', title: 'Cardiovascular', description: 'Perfusão, TEC e edema', componentId: 'CardiovascularPerfusionInputs', order: 6, optional: true, capabilityRequirement: 'supportsCardiovascularAssessment' },
    { id: 'sec-devices', title: 'Dispositivos Invasivos', description: 'Acessos vasculares, sondas e drenos', componentId: 'DeviceFormCard', order: 7, optional: true, capabilityRequirement: 'supportsDevices' },
    { id: 'sec-nutrition', title: 'Nutrição e Eliminações', description: 'Dieta e eliminações fisiológicas', componentId: 'NutritionInputs', order: 8, optional: true, capabilityRequirement: 'supportsNutrition' },
    { id: 'sec-care', title: 'Cuidados e Procedimentos', description: 'Higiene, banho e condutas', componentId: 'NursingCareInputs', order: 9, optional: true },
    { id: 'sec-complications', title: 'Intercorrências e Comunicação', description: 'Intercorrências e notificações', componentId: 'ComplicationInputs', order: 10, optional: true },
  ],
};

export const TECH_PS_MODULE_CONTRACT: ClinicalModuleContract = {
  definition: TECH_PS_MODULE_DEFINITION,
  route: 'clinical-evolution',
  formComponentId: 'ClinicalEvolutionWizard',
  createInitialForm: createInitialClinicalForm,
  normalizer: normalizeClinicalData,
  factsBuilder: buildAuthorizedFacts,
  deterministicBuilder: buildTechnicianNursingNote,
  consistencyValidator: validateClinicalConsistency,
  narrativeAuditor: auditDeterministicNarrative,
  postGenerationVerifier: (res, facts, canonical) => verifyPostGeneration({ aiOutput: res, authorizedFacts: facts, canonicalText: canonical }),
  aiRefinementPolicy: { common: true, specificRole: 'technician' },
};

export const TECH_ICU_MODULE_DEFINITION: ClinicalModuleDefinition = {
  id: 'tech_nursing_note_icu',
  moduleId: 'technician_nursing_note',
  professionalRole: 'technician',
  documentType: 'TECHNICIAN_NURSING_NOTE',
  clinicalArea: 'icu',
  title: 'Anotação de Enfermagem — Unidade de Terapia Intensiva (UTI)',
  capabilities: TECH_ICU_CAPABILITIES,
  sections: [
    { id: 'sec-context', title: 'Contexto e Identificação', description: 'Momento e checagens', componentId: 'ContextSection', order: 1, optional: false },
    { id: 'sec-vitals', title: 'Sinais Vitais e Monitorização', description: 'Parâmetros hemodinâmicos e PAM manual', componentId: 'VitalSignsInputs', order: 2, optional: true, capabilityRequirement: 'supportsVitalSigns' },
    { id: 'sec-neuro', title: 'Neurológico e Sedação', description: 'RASS, CAM-ICU, pupilas e sedoanalgesia', componentId: 'NeurologicalInputs', order: 3, optional: true, capabilityRequirement: 'supportsNeurologicalAssessment' },
    { id: 'sec-resp-vmi', title: 'Ventilação Mecânica e Suporte', description: 'VMI, parâmetros e via aérea', componentId: 'MechanicalVentilationInputs', order: 4, optional: true, capabilityRequirement: 'supportsMechanicalVentilation' },
    { id: 'sec-cardio-drogas', title: 'Cardiovascular e Drogas Vasoativas', description: 'Perfusão e infusões contínuas', componentId: 'CardiovascularPerfusionInputs', order: 5, optional: true, capabilityRequirement: 'supportsCardiovascularAssessment' },
    { id: 'sec-devices-drenos', title: 'Dispositivos e Drenagens', description: 'Acessos centrais, PAM, DVE, drenos', componentId: 'DeviceFormCard', order: 6, optional: true, capabilityRequirement: 'supportsDevices' },
    { id: 'sec-nutrition-balanco', title: 'Nutrição e Balanço', description: 'Dieta enteral/NPT e diurese', componentId: 'NutritionInputs', order: 7, optional: true, capabilityRequirement: 'supportsNutrition' },
    { id: 'sec-skin', title: 'Integridade Cutânea e LPP', description: 'Lesões e curativos em UTI', componentId: 'SkinAssessmentInputs', order: 8, optional: true, capabilityRequirement: 'supportsSkinAssessment' },
    { id: 'sec-care-icu', title: 'Cuidados Especializados de UTI', description: 'Higiene oral, aspiração e decúbito', componentId: 'NursingCareInputs', order: 9, optional: true },
    { id: 'sec-complications', title: 'Intercorrências e Notificações', description: 'Intercorrências no plantão', componentId: 'ComplicationInputs', order: 10, optional: true },
  ],
};

export const TECH_ICU_MODULE_CONTRACT: ClinicalModuleContract = {
  definition: TECH_ICU_MODULE_DEFINITION,
  route: 'icu-clinical-evolution',
  formComponentId: 'TechnicianICUFormWizard',
  createInitialForm: createInitialICUForm,
  normalizer: (form) => form,
  factsBuilder: buildAuthorizedICUFacts,
  deterministicBuilder: buildTechnicianICUNursingNote,
  consistencyValidator: validateICUConsistency,
  narrativeAuditor: auditDeterministicNarrative,
  postGenerationVerifier: (res, facts, canonical) => {
    const structured = typeof res === 'string' ? { paragraphs: [{ text: res, factIds: [] }] } : res;
    return verifyICUAIRefinedResponse(structured, facts, canonical);
  },
  aiRefinementPolicy: { common: true, specificRole: 'technician' },
};

export const TECH_ADM_PS_MODULE_DEFINITION: ClinicalModuleDefinition = {
  id: 'tech_admission_ps',
  moduleId: 'technician_admission',
  professionalRole: 'technician',
  documentType: 'TECHNICIAN_ADMISSION_NOTE',
  clinicalArea: 'emergency',
  title: 'Admissão — Anotação de Enfermagem (Pronto-Socorro)',
  capabilities: TECH_ADM_PS_CAPABILITIES,
  sections: [
    { id: 'sec-context', title: 'Contexto de Admissão', description: 'Momento e acomodação', componentId: 'ContextSection', order: 1, optional: false },
    { id: 'sec-origin', title: 'Procedência e Transporte', description: 'Origem, modo de chegada e equipe', componentId: 'OriginSection', order: 2, optional: false },
    { id: 'sec-id-belongings', title: 'Identificação e Pertences', description: 'Conferência e pertences do paciente', componentId: 'IdentificationSection', order: 3, optional: false },
    { id: 'sec-safety', title: 'Alergias e Segurança', description: 'Alergias e precauções', componentId: 'SafetySection', order: 4, optional: false },
    { id: 'sec-general', title: 'Estado Geral e Consciência', description: 'Nível de consciência e mobilidade', componentId: 'NeurologicalInputs', order: 5, optional: false },
    { id: 'sec-vitals', title: 'Sinais Vitais de Admissão', description: 'PA, FC, FR, SpO2, Temperatura, HGT', componentId: 'VitalSignsInputs', order: 6, optional: false, capabilityRequirement: 'supportsVitalSigns' },
    { id: 'sec-devices-adm', title: 'Dispositivos na Admissão', description: 'Dispositivos prévios e instalados', componentId: 'DeviceFormCard', order: 7, optional: false, capabilityRequirement: 'supportsDevices' },
    { id: 'sec-skin-adm', title: 'Integridade da Pele na Admissão', description: 'Lesões prévias identificadas', componentId: 'SkinAssessmentInputs', order: 8, optional: false, capabilityRequirement: 'supportsSkinAssessment' },
    { id: 'sec-actions', title: 'Cuidados e Orientações Iniciais', description: 'Condutas imediatas realizadas', componentId: 'NursingCareInputs', order: 9, optional: false },
    { id: 'sec-final', title: 'Condição Final e Pendências', description: 'Acomodação e orientações', componentId: 'FinalStatusSection', order: 10, optional: false },
  ],
};

export const TECH_ADM_PS_MODULE_CONTRACT: ClinicalModuleContract = {
  definition: TECH_ADM_PS_MODULE_DEFINITION,
  route: 'admission-clinical-evolution',
  formComponentId: 'TechnicianAdmissionFormWizard',
  createInitialForm: createInitialAdmissionForm,
  normalizer: (form) => form,
  factsBuilder: buildAuthorizedAdmissionFacts,
  deterministicBuilder: buildTechnicianAdmissionNote,
  consistencyValidator: validateAdmissionClinicalConsistency,
  narrativeAuditor: auditDeterministicNarrative,
  postGenerationVerifier: (res, facts, canonical) => {
    const structured = typeof res === 'string' ? { paragraphs: [{ text: res, factIds: [] }] } : res;
    return verifyAdmissionAIRefinedResponse(structured, facts, canonical);
  },
  aiRefinementPolicy: { common: true, specificRole: 'technician' },
};

export const NURSE_ADM_PS_MODULE_DEFINITION: ClinicalModuleDefinition = {
  id: 'nurse_admission_ps',
  moduleId: 'nurse_admission',
  professionalRole: 'nurse',
  documentType: 'NURSE_ADMISSION',
  clinicalArea: 'emergency',
  title: 'Admissão — Evolução de Enfermagem (Pronto-Socorro)',
  capabilities: NURSE_ADM_PS_CAPABILITIES,
  sections: [
    { id: 'sec-context', title: 'Contexto e Acolhimento', description: 'Momento e setor', componentId: 'ContextSection', order: 1, optional: false },
    { id: 'sec-origin', title: 'Procedência e Chegada', description: 'Origem e suporte de transporte', componentId: 'OriginSection', order: 2, optional: false },
    { id: 'sec-id-safety', title: 'Identificação, Alergias e Riscos', description: 'Pulseira, alergias e escalas', componentId: 'SafetySection', order: 3, optional: false },
    { id: 'sec-history', title: 'Histórico de Saúde e Queixa', description: 'História pregressa e queixa principal', componentId: 'HistorySection', order: 4, optional: false },
    { id: 'sec-vitals', title: 'Sinais Vitais e Dor', description: 'Sinais vitais completos e dor', componentId: 'VitalSignsInputs', order: 5, optional: false, capabilityRequirement: 'supportsVitalSigns' },
    { id: 'sec-physical-exam', title: 'Exame Físico Céfalo-Podálico', description: 'Exame sistematizado por sistemas', componentId: 'PhysicalExamSection', order: 6, optional: false },
    { id: 'sec-devices-adm', title: 'Dispositivos e Acessos', description: 'Dispositivos na admissão', componentId: 'DeviceFormCard', order: 7, optional: false, capabilityRequirement: 'supportsDevices' },
    { id: 'sec-synthesis-plan', title: 'Síntese Diagnóstica e Plano Inicial', description: 'Julgamento clínico e condutas', componentId: 'SynthesisPlanSection', order: 8, optional: false, capabilityRequirement: 'supportsNurseClinicalSynthesis' },
  ],
};

export const NURSE_ADM_PS_MODULE_CONTRACT: ClinicalModuleContract = {
  definition: NURSE_ADM_PS_MODULE_DEFINITION,
  route: 'nurse-admission-clinical',
  formComponentId: 'NurseAdmissionFormWizard',
  createInitialForm: createInitialNurseAdmissionForm,
  normalizer: (form) => form,
  factsBuilder: buildAuthorizedNurseAdmissionFacts,
  deterministicBuilder: buildNurseAdmissionNote,
  consistencyValidator: validateNurseAdmissionClinicalConsistency,
  narrativeAuditor: auditDeterministicNarrative,
  postGenerationVerifier: (res, facts, canonical) => {
    const structured = typeof res === 'string' ? { paragraphs: [{ text: res, factIds: [] }] } : res;
    return verifyNurseAdmissionAIRefinedResponse(structured, facts, canonical);
  },
  aiRefinementPolicy: { common: true, specificRole: 'nurse' },
};

export const NURSE_EVO_PS_MODULE_DEFINITION: ClinicalModuleDefinition = {
  id: 'nurse_evolution_ps',
  moduleId: 'nurse_evolution',
  professionalRole: 'nurse',
  documentType: 'NURSE_EVOLUTION',
  clinicalArea: 'emergency',
  title: 'Evolução de Enfermagem — Pronto-Socorro / Emergência',
  capabilities: NURSE_EVO_PS_CAPABILITIES,
  sections: [
    { id: 'sec-context', title: 'Contexto e Identificação', description: 'Momento e checagens', componentId: 'ContextSection', order: 1, optional: false },
    { id: 'sec-general', title: 'Estado Geral e Queixas', description: 'Comportamento e fonte de informação', componentId: 'GeneralSection', order: 2, optional: false },
    { id: 'sec-vitals', title: 'Sinais Vitais e Dor', description: 'Sinais vitais e escalas álgicas', componentId: 'VitalSignsInputs', order: 3, optional: false, capabilityRequirement: 'supportsVitalSigns' },
    { id: 'sec-neuro', title: 'Neurológico e Sedação', description: 'Glasgow, pupilas, RASS e reflexos', componentId: 'NeurologicalInputs', order: 4, optional: false, capabilityRequirement: 'supportsNeurologicalAssessment' },
    { id: 'sec-resp-cardio', title: 'Respiratório, Ausculta e Cardiovascular', description: 'Auscultas, suporte ventilatório e perfusão', componentId: 'RespiratorySupportInputs', order: 5, optional: false, capabilityRequirement: 'supportsRespiratoryAssessment' },
    { id: 'sec-nutrition-elim', title: 'Gastrointestinal e Geniturinário', description: 'Nutrição, abdome e eliminações', componentId: 'NutritionInputs', order: 6, optional: false, capabilityRequirement: 'supportsNutrition' },
    { id: 'sec-integumentary', title: 'Tegumentar e Dispositivos', description: 'Pele, lesões, acessos e drenos', componentId: 'SkinAssessmentInputs', order: 7, optional: false, capabilityRequirement: 'supportsSkinAssessment' },
    { id: 'sec-synthesis-response', title: 'Síntese Clínica e Resposta aos Cuidados', description: 'Julgamento profissional e plano', componentId: 'SynthesisPlanSection', order: 8, optional: false, capabilityRequirement: 'supportsNurseClinicalSynthesis' },
  ],
};

export const NURSE_EVO_PS_MODULE_CONTRACT: ClinicalModuleContract = {
  definition: NURSE_EVO_PS_MODULE_DEFINITION,
  route: 'nurse-evolution-clinical',
  formComponentId: 'NurseEvolutionFormWizard',
  createInitialForm: createInitialNurseEvolutionForm,
  normalizer: normalizeNurseEvolutionForm,
  factsBuilder: buildAuthorizedNurseEvolutionFacts,
  deterministicBuilder: buildNurseEvolutionNote,
  consistencyValidator: () => [],
  narrativeAuditor: auditDeterministicNarrative,
  postGenerationVerifier: (res, facts, canonical) => verifyPostGeneration({ aiOutput: res, authorizedFacts: facts, canonicalText: canonical }),
  aiRefinementPolicy: { common: true, specificRole: 'nurse' },
};

/**
 * Unified catalog of active module contracts.
 */
export const CLINICAL_MODULE_CONTRACTS: ClinicalModuleContract[] = [
  TECH_PS_MODULE_CONTRACT,
  TECH_ICU_MODULE_CONTRACT,
  TECH_ADM_PS_MODULE_CONTRACT,
  NURSE_ADM_PS_MODULE_CONTRACT,
  NURSE_EVO_PS_MODULE_CONTRACT,
  TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL_CONTRACT,
  TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC_CONTRACT,
  TECHNICIAN_NURSING_NOTE_PEDIATRICS_CONTRACT,
  NURSE_EVOLUTION_ICU_CONTRACT,
  NURSE_EVOLUTION_MEDICAL_CLINIC_CONTRACT,
  NURSE_EVOLUTION_SURGICAL_CLINIC_CONTRACT,
  NURSE_EVOLUTION_PEDIATRICS_CONTRACT,
  NURSE_ADMISSION_ICU_CONTRACT,
  NURSE_WOUNDS_ASSESSMENT_CONTRACT,
  NURSE_SOAP_CONTRACT,
];

/**
 * Build-time and test-time validation of Clinical Module Registry and Contracts.
 */
export function validateClinicalModuleRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const seenIds = new Set<string>();
  const seenRoutes = new Set<string>();

  for (const contract of CLINICAL_MODULE_CONTRACTS) {
    const { definition } = contract;

    // Check duplicate ID
    if (seenIds.has(definition.id)) {
      errors.push(`Duplicate Module Definition ID: "${definition.id}"`);
    }
    seenIds.add(definition.id);

    // Check duplicate route
    if (seenRoutes.has(contract.route)) {
      errors.push(`Duplicate Module Contract Route: "${contract.route}"`);
    }
    seenRoutes.add(contract.route);

    // Check required implementations
    if (!contract.deterministicBuilder || typeof contract.deterministicBuilder !== 'function') {
      errors.push(`Module "${definition.id}" is missing a deterministicBuilder.`);
    }
    if (!contract.normalizer || typeof contract.normalizer !== 'function') {
      errors.push(`Module "${definition.id}" is missing a normalizer.`);
    }
    if (!contract.factsBuilder || typeof contract.factsBuilder !== 'function') {
      errors.push(`Module "${definition.id}" is missing a factsBuilder.`);
    }
    if (!contract.consistencyValidator || typeof contract.consistencyValidator !== 'function') {
      errors.push(`Module "${definition.id}" is missing a consistencyValidator.`);
    }
    if (!contract.narrativeAuditor || typeof contract.narrativeAuditor !== 'function') {
      errors.push(`Module "${definition.id}" is missing a narrativeAuditor.`);
    }
    if (!contract.postGenerationVerifier || typeof contract.postGenerationVerifier !== 'function') {
      errors.push(`Module "${definition.id}" is missing a postGenerationVerifier.`);
    }
    if (!contract.createInitialForm || typeof contract.createInitialForm !== 'function') {
      errors.push(`Module "${definition.id}" is missing a createInitialForm.`);
    }

    // Role policy validation
    const roleValidation = ProfessionalRolePolicy.validateModuleDefinition(definition);
    if (!roleValidation.valid) {
      errors.push(...roleValidation.errors);
    }

    // Check sections
    if (!definition.sections || definition.sections.length === 0) {
      errors.push(`Module "${definition.id}" has no sections defined.`);
    }

    // Check availability in MODULE_REGISTRY
    const registryEntry = MODULE_REGISTRY[definition.moduleId];
    if (!registryEntry) {
      errors.push(`Module "${definition.id}" points to non-existent MODULE_REGISTRY entry: "${definition.moduleId}".`);
    } else {
      const areaKey =
        (definition.clinicalArea as string) === 'CLINICAL_MEDICAL' ||
        (definition.clinicalArea as string) === 'MEDICAL_CLINIC'
          ? 'medicalClinic'
          : (definition.clinicalArea as string) === 'SURGICAL_CLINIC'
          ? 'surgicalClinic'
          : (definition.clinicalArea as string) === 'PEDIATRICS'
          ? 'pediatrics'
          : definition.clinicalArea;
      const area = (registryEntry.areas as any)[areaKey];
      if (!area) {
        errors.push(`Module "${definition.id}" has contract but area "${definition.clinicalArea}" is not defined in MODULE_REGISTRY.`);
      } else {
        const expectedStatus = definition.status || 'available';
        if (expectedStatus === 'available' && area.status !== 'available') {
          errors.push(`Module "${definition.id}" has contract but is not marked as available in MODULE_REGISTRY for area "${definition.clinicalArea}".`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
