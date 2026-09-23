import { AppScreen } from '../../types';
import { AssistentialAreaId, ModuleId, ClinicalArea } from '../moduleRegistry';

export { ClinicalArea };

export type ClinicalDocumentType =
  | 'TECHNICIAN_NURSING_NOTE'
  | 'TECHNICIAN_ADMISSION_NOTE'
  | 'NURSE_ADMISSION'
  | 'NURSE_EVOLUTION'
  | 'WOUND_ASSESSMENT'
  | 'SOAP';

export interface ClinicalModuleCapabilities {
  supportsVitalSigns: boolean;
  supportsPain: boolean;
  supportsNeurologicalAssessment: boolean;
  supportsRespiratoryAssessment: boolean;
  supportsMechanicalVentilation: boolean;
  supportsCardiovascularAssessment: boolean;
  supportsNutrition: boolean;
  supportsEliminations: boolean;
  supportsDevices: boolean;
  supportsSkinAssessment: boolean;
  supportsInfusions: boolean;
  supportsRiskAssessment: boolean;
  supportsResponseToCare: boolean;
  supportsNurseClinicalSynthesis: boolean;
  supportsWoundAssessment?: boolean;
}

export interface ClinicalSectionDefinition {
  id: string;
  title: string;
  description: string;
  componentId: string;
  order: number;
  optional: boolean;
  capabilityRequirement?: keyof ClinicalModuleCapabilities;
}

export interface ClinicalModuleDefinition {
  id: string;
  moduleId: ModuleId;
  professionalRole: 'technician' | 'nurse';
  documentType: ClinicalDocumentType;
  clinicalArea: AssistentialAreaId;
  title: string;
  sections: ClinicalSectionDefinition[];
  capabilities: ClinicalModuleCapabilities;
  status?: 'available' | 'development';
}

export interface NarrativeSegment {
  text: string;
  factIds: string[];
  isStructural?: boolean;
  kind?: 'factual' | 'structural';
}

export type ClinicalOperationStatus =
  | 'success'
  | 'validation_warning'
  | 'privacy_blocked'
  | 'provider_error'
  | 'parse_error'
  | 'verifier_rejected'
  | 'internal_error';

export interface ClinicalOperationResult<T = any> {
  status: ClinicalOperationStatus;
  data?: T;
  message?: string;
  warnings?: string[];
  rejectionReasons?: string[];
}

export type AIWorkflowStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'provider_error'
  | 'privacy_blocked'
  | 'parse_error'
  | 'verifier_rejected';

export interface ClinicalModuleContract<TForm = any, TNormalized = any, TFacts = any> {
  definition: ClinicalModuleDefinition;
  route: AppScreen;
  formComponentId: string;
  createInitialForm: () => TForm;
  normalizer: (form: TForm) => TNormalized;
  factsBuilder: (norm: TNormalized) => TFacts;
  deterministicBuilder: (norm: TNormalized) => string;
  consistencyValidator: (form: TForm) => any[];
  narrativeAuditor: (traces: NarrativeSegment[], facts: TFacts) => { passed: boolean; unauthorizedSegments: string[] };
  postGenerationVerifier: (response: any, facts: TFacts, canonical: string) => { approved: boolean; rejectionReasons?: string[] };
  aiRefinementPolicy: {
    common: boolean;
    specificRole: 'technician' | 'nurse';
  };
}
