import {
  AuthorizedClinicalFacts,
  AIRefinedResponse,
  VerificationResult,
} from './types';
import { checkPrivacyGuards } from './privacyGuard';
import { verifyNumericFactLock } from './numericFactLock';
import { verifyMedicationLock } from './medicationLock';
import { verifyDeviceLock } from './deviceLock';
import { verifyClinicalActionLock } from './clinicalActionLock';
import { verifyPhysicalExamFactLock } from './physicalExamFactLock';
import { verifyNurseJudgmentLock } from './nurseJudgmentLock';
import { verifyUnauthorizedTermsLock } from './unauthorizedTermsLock';
import { verifySOAPClinicalReasoningLock } from './soapClinicalReasoningLock';
import { verifySOAPPlanLock } from './soapPlanLock';

/**
 * PostGenerationVerifier for Nurse SOAP Documentation Module (NURSE_SOAP).
 * Multi-lock security pipeline:
 * 1. PrivacyGuard: Blocks PII (names, CPF, phones, emails, documents).
 * 2. NumericFactLock: Prevents numeric hallucination in vital signs and measurements.
 * 3. MedicationLock: Prohibits unauthorized drug additions.
 * 4. DeviceLock: Prohibits unauthorized device additions.
 * 5. ClinicalActionLock: Prohibits unperformed clinical actions.
 * 6. PhysicalExamFactLock: Prohibits unobserved physical exam findings.
 * 7. NurseJudgmentLock: Protects human-only nursing conclusions and diagnoses.
 * 8. UnauthorizedTermsLock: Prohibits speculative terminology and external diagnoses.
 * 9. SOAPClinicalReasoningLock: Prohibits AI from inventing diagnoses, hypotheses or causal interpretations.
 * 10. SOAPPlanLock: Prohibits AI from generating prescriptions, medications, or new conducts.
 */
export function verifyNurseSoapAIRefinedResponse(
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
  const medLock = verifyMedicationLock(fullRefinedText, authorizedFacts);
  const devLock = verifyDeviceLock(fullRefinedText, authorizedFacts);
  const actionLock = verifyClinicalActionLock(fullRefinedText, authorizedFacts);
  const peLock = verifyPhysicalExamFactLock(fullRefinedText, authorizedFacts);
  const judgmentLock = verifyNurseJudgmentLock(fullRefinedText, authorizedFacts);
  const unauthLock = verifyUnauthorizedTermsLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const reasoningLock = verifySOAPClinicalReasoningLock(fullRefinedText, authorizedFacts, deterministicBaseline);
  const planLock = verifySOAPPlanLock(fullRefinedText, authorizedFacts, deterministicBaseline);

  const passed =
    !privacyCheck.hasPotentialPII &&
    numLock.passed &&
    medLock.passed &&
    devLock.passed &&
    actionLock.passed &&
    peLock.passed &&
    judgmentLock.passed &&
    unauthLock.passed &&
    reasoningLock.passed &&
    planLock.passed;

  const reasons: string[] = [];
  if (privacyCheck.hasPotentialPII) {
    reasons.push('PrivacyGuard: Dados identificadores sensíveis detectados.');
  }
  if (!numLock.passed) reasons.push(numLock.message);
  if (!medLock.passed) reasons.push(medLock.message);
  if (!devLock.passed) reasons.push(devLock.message);
  if (!actionLock.passed) reasons.push(actionLock.message);
  if (!peLock.passed) {
    reasons.push(`PhysicalExamFactLock: Achados de exame físico não autorizados: [${peLock.unauthorizedExamFindings.join(', ')}]`);
  }
  if (!judgmentLock.passed) {
    reasons.push(`Julgamento clínico não autorizado: [${judgmentLock.unauthorizedJudgmentTerms.join(', ')}]`);
  }
  if (!unauthLock.passed) reasons.push(unauthLock.message);
  if (!reasoningLock.passed && reasoningLock.message) {
    reasons.push(reasoningLock.message);
  }
  if (!planLock.passed && planLock.message) {
    reasons.push(planLock.message);
  }

  return {
    approved: passed,
    reasons,
    details: {
      privacyGuard: privacyCheck,
      numericLock: numLock,
      medicationLock: medLock,
      deviceLock: devLock,
      actionLock,
      physicalExamFactLock: peLock,
      judgmentLock,
      unauthorizedTermsLock: unauthLock,
      soapClinicalReasoningLock: reasoningLock,
      soapPlanLock: planLock,
    },
    deterministicFallback: deterministicBaseline,
  };
}
