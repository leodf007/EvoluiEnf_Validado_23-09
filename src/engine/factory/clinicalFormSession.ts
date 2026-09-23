import { AIWorkflowStatus, ClinicalModuleContract, NarrativeSegment } from './types';

export interface ClinicalFormSessionState<TForm = any, TNormalized = any, TFacts = any> {
  moduleId: string;
  formState: TForm;
  normalizedData: TNormalized | null;
  authorizedFacts: TFacts | null;
  narrativeSegments: NarrativeSegment[];
  deterministicNarrative: string;
  refinedNarrative: string;
  selectedTextVersion: 'deterministic' | 'refined';
  validationWarnings: any[];
  consistencyWarnings: any[];
  privacyGuardState: {
    passed: boolean;
    detectedViolations: string[];
  };
  verifierResult: {
    approved: boolean;
    rejectionReasons: string[];
  } | null;
  aiStatus: AIWorkflowStatus;
  aiErrorMessage?: string;
  temporaryDeviceLists: any[];
  temporaryMedications: any[];
  temporaryClinicalActions: any[];
  isDirty: boolean;
  lastUpdated: number;
}

/**
 * In-memory only Clinical Form Session Manager.
 * 
 * STRICT PRIVACY & ZERO PERSISTENCE:
 * This state exists exclusively in volatile application memory (RAM).
 * It NEVER writes or synchronizes clinical patient data with localStorage, sessionStorage, or IndexedDB.
 */
export class ClinicalFormSession<TForm = any, TNormalized = any, TFacts = any> {
  private state: ClinicalFormSessionState<TForm, TNormalized, TFacts>;
  private contract: ClinicalModuleContract<TForm, TNormalized, TFacts>;

  constructor(contract: ClinicalModuleContract<TForm, TNormalized, TFacts>) {
    this.contract = contract;
    this.state = this.createInitialState();
  }

  private createInitialState(): ClinicalFormSessionState<TForm, TNormalized, TFacts> {
    const initialForm = this.contract.createInitialForm();
    return {
      moduleId: this.contract.definition.id,
      formState: initialForm,
      normalizedData: null,
      authorizedFacts: null,
      narrativeSegments: [],
      deterministicNarrative: '',
      refinedNarrative: '',
      selectedTextVersion: 'deterministic',
      validationWarnings: [],
      consistencyWarnings: [],
      privacyGuardState: {
        passed: true,
        detectedViolations: [],
      },
      verifierResult: null,
      aiStatus: 'idle',
      temporaryDeviceLists: [],
      temporaryMedications: [],
      temporaryClinicalActions: [],
      isDirty: false,
      lastUpdated: Date.now(),
    };
  }

  public getState(): Readonly<ClinicalFormSessionState<TForm, TNormalized, TFacts>> {
    return this.state;
  }

  public updateForm(newForm: TForm): void {
    this.state.formState = newForm;
    this.state.isDirty = true;
    this.state.lastUpdated = Date.now();
    this.recompute();
  }

  public recompute(): void {
    const normalized = this.contract.normalizer(this.state.formState);
    const facts = this.contract.factsBuilder(normalized);
    const narrative = this.contract.deterministicBuilder(normalized);
    const warnings = this.contract.consistencyValidator(this.state.formState);

    this.state.normalizedData = normalized;
    this.state.authorizedFacts = facts;
    this.state.deterministicNarrative = narrative;
    this.state.validationWarnings = warnings;
    this.state.consistencyWarnings = warnings;
  }

  public setAIStatus(status: AIWorkflowStatus, error?: string): void {
    this.state.aiStatus = status;
    this.state.aiErrorMessage = error;
  }

  public setRefinedNarrative(text: string): void {
    this.state.refinedNarrative = text;
  }

  public setSelectedTextVersion(version: 'deterministic' | 'refined'): void {
    this.state.selectedTextVersion = version;
  }

  public setVerifierResult(result: { approved: boolean; rejectionReasons: string[] } | null): void {
    this.state.verifierResult = result;
  }

  /**
   * Completely resets and clears all in-memory clinical data across all dimensions.
   */
  public reset(): void {
    this.state = this.createInitialState();
  }
}

/**
 * Creates a standalone in-memory clinical session for a module contract.
 */
export function createClinicalFormSession<TForm, TNormalized, TFacts>(
  contract: ClinicalModuleContract<TForm, TNormalized, TFacts>
): ClinicalFormSession<TForm, TNormalized, TFacts> {
  return new ClinicalFormSession(contract);
}

/**
 * Resets a clinical form session completely.
 */
export function resetClinicalSession<TForm, TNormalized, TFacts>(
  session: ClinicalFormSession<TForm, TNormalized, TFacts>
): void {
  session.reset();
}

