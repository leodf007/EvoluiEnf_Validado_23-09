import { ClinicalEvolutionForm } from '../types/clinical';

export interface ClinicalFact {
  id: string;
  category: string;
  sourceField: string;
  value: any;
  canonicalText?: string;
}

export interface AuthorizedClinicalFacts {
  context?: ClinicalFact[];
  general?: ClinicalFact[];
  vitalSigns?: ClinicalFact[];
  pain?: ClinicalFact[];
  neurological?: ClinicalFact[];
  respiratory?: ClinicalFact[];
  cardiovascular?: ClinicalFact[];
  vasoactive?: ClinicalFact[];
  sedationAnalgesia?: ClinicalFact[];
  gastrointestinal?: ClinicalFact[];
  nutrition?: ClinicalFact[];
  bowel?: ClinicalFact[];
  urinary?: ClinicalFact[];
  devices?: ClinicalFact[];
  skin?: ClinicalFact[];
  care?: ClinicalFact[];
  bath?: ClinicalFact[];
  complications?: ClinicalFact[];
  comparison?: ClinicalFact[];
  finalStatus?: ClinicalFact[];
  additional?: ClinicalFact[];
  [key: string]: ClinicalFact[] | undefined;
}

export interface AIRefinedParagraph {
  text: string;
  factIds: string[];
}

export interface AIRefinedResponse {
  paragraphs: AIRefinedParagraph[];
  explanation?: string;
}

export interface VerificationResult {
  approved: boolean;
  reasons: string[];
  details?: Record<string, any>;
  deterministicFallback?: string;
}

export interface ClinicalConsistencyAlert {
  id: string;
  category?: 'warning' | 'error' | 'critical' | 'info';
  severity?: 'warning' | 'error' | 'critical' | 'info';
  title?: string;
  description?: string;
  message: string;
  fieldNames?: string[];
  fieldPath?: string;
  suggestedAction?: string;
  suggestedFix?: string;
  ruleId?: string;
  fieldsInvolved?: string[];
  sectionIndex?: number;
  sectionTitle?: string;
}

export interface NarrativeContext {
  renderedFactIds: Set<string>;
  hasVitalSignsRendered: boolean;
  hasHeartRateRendered: boolean;
  hasSpO2Rendered: boolean;
  hasBloodPressureRendered: boolean;
  hasTemperatureRendered: boolean;
}

export interface PrivacyGuardMatch {
  field: string;
  label: string;
  type: 'CPF' | 'EMAIL' | 'PHONE' | 'PRONTUARIO' | 'DOCUMENT';
  description: string;
  snippet: string;
}

export interface PrivacyGuardResult {
  hasPotentialPII: boolean;
  matches: PrivacyGuardMatch[];
}

export interface EngineTestOutcome {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  generatedText?: string;
  details?: string;
}

export interface EngineTestSummary {
  total: number;
  passed: number;
  failed: number;
  results: EngineTestOutcome[];
}
