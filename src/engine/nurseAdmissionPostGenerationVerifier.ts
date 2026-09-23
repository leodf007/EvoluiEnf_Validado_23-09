import { AuthorizedClinicalFacts, AIRefinedResponse, VerificationResult } from './types';
import { verifyNumericFactLock } from './numericFactLock';
import { verifyDeviceLock } from './deviceLock';
import { verifyOriginFactLock } from './originFactLock';
import { verifyClinicalActionLock } from './clinicalActionLock';
import { verifyComplicationsAndComparisonLock } from './complicationsLock';
import { verifyUnauthorizedTermsLock } from './unauthorizedTermsLock';

/**
 * PostGenerationVerifier for Nurse Admission
 * Ensures AI text does not hallucinate new numbers, devices, diagnoses, or actions.
 */
export function verifyNurseAdmissionAIRefinedResponse(
  refined: AIRefinedResponse,
  authorizedFacts: AuthorizedClinicalFacts,
  deterministicBaseline: string
): VerificationResult {
  if (!refined || !Array.isArray(refined.paragraphs) || refined.paragraphs.length === 0) {
    return {
      approved: false,
      reasons: ['Resposta sem parágrafos válidos'],
    };
  }

  const fullRefinedText = refined.paragraphs.map((p) => p.text).join('\n\n');

  const numLock = verifyNumericFactLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const devLock = verifyDeviceLock(fullRefinedText, authorizedFacts);
  const origLock = verifyOriginFactLock(fullRefinedText, authorizedFacts);
  const actionLock = verifyClinicalActionLock(fullRefinedText, authorizedFacts);
  const compLock = verifyComplicationsAndComparisonLock(fullRefinedText, authorizedFacts);
  const unauthLock = verifyUnauthorizedTermsLock(fullRefinedText, deterministicBaseline, authorizedFacts);

  const passed =
    numLock.passed &&
    devLock.passed &&
    origLock.passed &&
    actionLock.passed &&
    compLock.passed &&
    unauthLock.passed;

  const reasons: string[] = [];
  if (!numLock.passed) reasons.push(numLock.message);
  if (!devLock.passed) reasons.push(devLock.message);
  if (!origLock.passed) reasons.push(origLock.message);
  if (!actionLock.passed) reasons.push(actionLock.message);
  if (!compLock.passed) reasons.push(compLock.message);
  if (!unauthLock.passed) reasons.push(unauthLock.message);

  return {
    approved: passed,
    reasons,
    details: {
      numericLock: numLock,
      deviceLock: devLock,
      originLock: origLock,
      actionLock: actionLock,
      complicationsLock: compLock,
      unauthorizedTermsLock: unauthLock,
    },
  };
}
