import { AuthorizedClinicalFacts, AIRefinedResponse, VerificationResult } from './types';
import { verifyNumericFactLock } from './numericFactLock';
import { verifyDeviceLock } from './deviceLock';
import { verifyClinicalActionLock } from './clinicalActionLock';
import { verifyNurseJudgmentLock } from './nurseJudgmentLock';
import { verifyUnauthorizedTermsLock } from './unauthorizedTermsLock';
import { verifyWoundFactLock } from './woundFactLock';
import { verifyDressingActionLock } from './dressingActionLock';
import { checkPrivacyGuards } from './privacyGuard';

/**
 * PostGenerationVerifier for Nurse Wound Assessment (NURSE_WOUNDS_ASSESSMENT).
 * Executes multi-lock verification:
 * 1. PrivacyGuard: Prohibits patient or professional personal identifiers (CPF, RG, phone, email).
 * 2. NumericFactLock: Numbers, dimensions (length, width, depth), scores, and durations cannot be invented or altered.
 * 3. DeviceLock: Devices near or on the wound must strictly match authorized facts.
 * 4. ClinicalActionLock: Nursing actions must originate exclusively from authorized facts.
 * 5. NurseJudgmentLock: Clinical interpretations must be professional nurse-entered facts only.
 * 6. UnauthorizedTermsLock: Prohibits speculative terminology and external diagnoses.
 * 7. WoundFactLock: Prohibits AI from generating infection diagnoses, stage inference, depth invention, severity, or healing prognosis.
 * 8. DressingActionLock: Prohibits AI from inserting unrecorded coverings, unauthorized products, or unperformed techniques.
 */
export function verifyNurseWoundsAIRefinedResponse(
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

  const privacyCheck = checkPrivacyGuards(fullRefinedText);
  const numLock = verifyNumericFactLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const devLock = verifyDeviceLock(fullRefinedText, authorizedFacts);
  const actionLock = verifyClinicalActionLock(fullRefinedText, authorizedFacts);
  const judgmentLock = verifyNurseJudgmentLock(fullRefinedText, authorizedFacts);
  const unauthLock = verifyUnauthorizedTermsLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const woundLock = verifyWoundFactLock(fullRefinedText, authorizedFacts, deterministicBaseline);
  const dressingLock = verifyDressingActionLock(fullRefinedText, authorizedFacts, deterministicBaseline);

  const passed =
    !privacyCheck.hasPotentialPII &&
    numLock.passed &&
    devLock.passed &&
    actionLock.passed &&
    judgmentLock.passed &&
    unauthLock.passed &&
    woundLock.passed &&
    dressingLock.passed;

  const reasons: string[] = [];
  if (privacyCheck.hasPotentialPII) reasons.push('PrivacyGuard: Dados identificadores sensíveis detectados.');
  if (!numLock.passed) reasons.push(numLock.message);
  if (!devLock.passed) reasons.push(devLock.message);
  if (!actionLock.passed) reasons.push(actionLock.message);
  if (!judgmentLock.passed) reasons.push(`Julgamento clínico não autorizado: [${judgmentLock.unauthorizedJudgmentTerms.join(', ')}]`);
  if (!unauthLock.passed) reasons.push(unauthLock.message);
  if (!woundLock.passed) reasons.push(woundLock.message);
  if (!dressingLock.passed) reasons.push(dressingLock.message);

  return {
    approved: passed,
    reasons,
    details: {
      privacyGuard: privacyCheck,
      numericLock: numLock,
      deviceLock: devLock,
      actionLock,
      judgmentLock,
      unauthorizedTermsLock: unauthLock,
      woundFactLock: woundLock,
      dressingActionLock: dressingLock,
    },
    deterministicFallback: deterministicBaseline,
  };
}
