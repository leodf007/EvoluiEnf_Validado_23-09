import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { verifyNumericFactLock, NumericLockResult } from './numericFactLock';
import { verifyUnauthorizedTermsLock, UnauthorizedTermsLockResult } from './unauthorizedTermsLock';
import { verifyMedicationLock, MedicationLockResult } from './medicationLock';
import { verifyDeviceLock, DeviceLockResult } from './deviceLock';
import { verifyClinicalActionLock, ClinicalActionLockResult } from './clinicalActionLock';
import { verifyComplicationsAndComparisonLock, ComplicationsAndComparisonLockResult } from './complicationsLock';
import { verifyOriginFactLock, OriginFactLockResult } from './originFactLock';
import { verifyExistingVsInstalledDevicesLock, DeviceOriginLockResult } from './existingVsInstalledDevicesLock';
import { AIRefinedStructuredResponse, getAllAuthorizedFactIds } from './postGenerationVerifier';

export interface AdmissionPostGenerationVerificationResult {
  approved: boolean;
  reasons: string[];
  details: {
    factIdsValid: boolean;
    invalidFactIds: string[];
    numericLock: NumericLockResult;
    unauthorizedTermsLock: UnauthorizedTermsLockResult;
    medicationLock: MedicationLockResult;
    deviceLock: DeviceLockResult;
    clinicalActionLock: ClinicalActionLockResult;
    complicationsLock: ComplicationsAndComparisonLockResult;
    originLock: OriginFactLockResult;
    existingVsInstalledDevicesLock: DeviceOriginLockResult;
  };
}

/**
 * verifyAdmissionAIRefinedResponse:
 * Deterministic PostGenerationVerifier strictly dedicated to Admission Nursing Notes.
 * Applies all safety locks + OriginFactLock + ExistingVsInstalledDevicesLock.
 */
export function verifyAdmissionAIRefinedResponse(
  rawResponse: AIRefinedStructuredResponse,
  authorizedFacts: AuthorizedClinicalFacts,
  canonicalNarrative: string
): AdmissionPostGenerationVerificationResult {
  const reasons: string[] = [];

  // 1. Structure Check
  if (!rawResponse || !Array.isArray(rawResponse.paragraphs) || rawResponse.paragraphs.length === 0) {
    return {
      approved: false,
      reasons: ['Resposta da IA não contém estrutura de parágrafos válida.'],
      details: {
        factIdsValid: false,
        invalidFactIds: [],
        numericLock: { passed: false, unauthorizedNumbers: [], message: 'Sem conteúdo' },
        unauthorizedTermsLock: { passed: false, detectedForbiddenTerms: [], message: 'Sem conteúdo' },
        medicationLock: { passed: false, unauthorizedMedications: [], message: 'Sem conteúdo' },
        deviceLock: { passed: false, unauthorizedDevices: [], message: 'Sem conteúdo' },
        clinicalActionLock: { passed: false, unauthorizedActions: [], message: 'Sem conteúdo' },
        complicationsLock: { passed: false, message: 'Sem conteúdo' },
        originLock: { passed: false, unauthorizedOrigins: [], message: 'Sem conteúdo' },
        existingVsInstalledDevicesLock: { passed: false, violations: [], message: 'Sem conteúdo' },
      },
    };
  }

  const fullRefinedText = rawResponse.paragraphs.map((p) => p.text).join('\n\n');

  // 2. Fact IDs Validation
  const validFactIds = getAllAuthorizedFactIds(authorizedFacts);
  const invalidFactIds: string[] = [];

  for (const p of rawResponse.paragraphs) {
    if (!Array.isArray(p.factIds)) {
      invalidFactIds.push('empty-or-invalid-fact-array');
      continue;
    }
    for (const fId of p.factIds) {
      if (!validFactIds.has(fId)) {
        invalidFactIds.push(fId);
      }
    }
  }

  const factIdsValid = invalidFactIds.length === 0;
  if (!factIdsValid) {
    reasons.push(
      `Fact IDs não autorizados ou inexistentes foram utilizados pela IA: [${invalidFactIds.join(', ')}].`
    );
  }

  // 3. Numeric Fact Lock
  const numericLock = verifyNumericFactLock(fullRefinedText, canonicalNarrative, authorizedFacts);
  if (!numericLock.passed) {
    reasons.push(numericLock.message);
  }

  // 4. Unauthorized Terms Lock
  const unauthorizedTermsLock = verifyUnauthorizedTermsLock(
    fullRefinedText,
    canonicalNarrative,
    authorizedFacts
  );
  if (!unauthorizedTermsLock.passed) {
    reasons.push(unauthorizedTermsLock.message);
  }

  // 5. Medication Lock
  const medicationLock = verifyMedicationLock(fullRefinedText, authorizedFacts);
  if (!medicationLock.passed) {
    reasons.push(medicationLock.message);
  }

  // 6. Device Lock
  const deviceLock = verifyDeviceLock(fullRefinedText, authorizedFacts);
  if (!deviceLock.passed) {
    reasons.push(deviceLock.message);
  }

  // 7. Clinical Action Lock
  const clinicalActionLock = verifyClinicalActionLock(fullRefinedText, authorizedFacts);
  if (!clinicalActionLock.passed) {
    reasons.push(clinicalActionLock.message);
  }

  // 8. Complications Lock
  const complicationsLock = verifyComplicationsAndComparisonLock(fullRefinedText, authorizedFacts);
  if (!complicationsLock.passed) {
    reasons.push(complicationsLock.message);
  }

  // 9. Origin Fact Lock
  const originLock = verifyOriginFactLock(fullRefinedText, authorizedFacts);
  if (!originLock.passed) {
    reasons.push(originLock.message);
  }

  // 10. Existing Vs Installed Devices Lock
  const existingVsInstalledDevicesLock = verifyExistingVsInstalledDevicesLock(fullRefinedText, authorizedFacts);
  if (!existingVsInstalledDevicesLock.passed) {
    reasons.push(existingVsInstalledDevicesLock.message);
  }

  const approved = reasons.length === 0;

  return {
    approved,
    reasons,
    details: {
      factIdsValid,
      invalidFactIds,
      numericLock,
      unauthorizedTermsLock,
      medicationLock,
      deviceLock,
      clinicalActionLock,
      complicationsLock,
      originLock,
      existingVsInstalledDevicesLock,
    },
  };
}
