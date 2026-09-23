import { AuthorizedClinicalFacts, AIRefinedResponse, VerificationResult } from './types';
import { verifyNumericFactLock } from './numericFactLock';
import { verifyMedicationLock } from './medicationLock';
import { verifyDeviceLock } from './deviceLock';
import { verifyClinicalActionLock } from './clinicalActionLock';
import { verifyComplicationsAndComparisonLock } from './complicationsLock';
import { verifyUnauthorizedTermsLock } from './unauthorizedTermsLock';
import { verifyNurseJudgmentLock } from './nurseJudgmentLock';
import { verifyPhysicalExamFactLock } from './physicalExamFactLock';
import { verifyResponseToCareLock } from './responseToCareLock';
import { verifyPediatricFactLock } from './pediatricFactLock';

/**
 * PostGenerationVerifier for Nurse Pediatric Evolution (NURSE_EVOLUTION_PEDIATRICS).
 * Enforces all safety locks:
 * 1. NumericFactLock: Numbers cannot be altered, invented, or calculated.
 * 2. MedicationLock: No new drugs or unapproved modifications.
 * 3. DeviceLock: Devices must strictly match authorized facts.
 * 4. ClinicalActionLock: No invented nursing interventions.
 * 5. ComplicationsLock: Complications and comparisons must match authorized records.
 * 6. UnauthorizedTermsLock: Prohibits medical diagnoses, speculative terms, etc.
 * 7. NurseJudgmentLock: Clinical synthesis terms must originate from the nurse.
 * 8. PhysicalExamFactLock: Physical exam findings must match authorized facts.
 * 9. ResponseToCareLock: Responses must be tied to authorized interventions.
 * 10. PediatricFactLock: Prohibits unrecorded age, weight, height, guardian, percentiles,
 *     development inferences, and nutritional/anthropometric interpretations.
 */
export function verifyNursePediatricEvolutionAIRefinedResponse(
  refined: AIRefinedResponse,
  authorizedFacts: AuthorizedClinicalFacts,
  deterministicBaseline: string
): VerificationResult {
  if (!refined || !Array.isArray(refined.paragraphs) || refined.paragraphs.length === 0) {
    return {
      approved: false,
      reasons: ['Resposta sem parágrafos válidos.'],
      deterministicFallback: deterministicBaseline,
    };
  }

  const fullRefinedText = refined.paragraphs.map((p) => p.text).join('\n\n');

  const numLock = verifyNumericFactLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const medLock = verifyMedicationLock(fullRefinedText, authorizedFacts);
  const devLock = verifyDeviceLock(fullRefinedText, authorizedFacts);
  const actionLock = verifyClinicalActionLock(fullRefinedText, authorizedFacts);
  const compLock = verifyComplicationsAndComparisonLock(fullRefinedText, authorizedFacts);
  const unauthLock = verifyUnauthorizedTermsLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const judgmentLock = verifyNurseJudgmentLock(fullRefinedText, authorizedFacts);
  const examLock = verifyPhysicalExamFactLock(fullRefinedText, authorizedFacts);
  const responseLock = verifyResponseToCareLock(fullRefinedText, authorizedFacts);
  const pediatricLock = verifyPediatricFactLock(fullRefinedText, authorizedFacts, deterministicBaseline);

  const passed =
    numLock.passed &&
    medLock.passed &&
    devLock.passed &&
    actionLock.passed &&
    compLock.passed &&
    unauthLock.passed &&
    judgmentLock.passed &&
    examLock.passed &&
    responseLock.passed &&
    pediatricLock.passed;

  const reasons: string[] = [];
  if (!numLock.passed) reasons.push(numLock.message);
  if (!medLock.passed) reasons.push(medLock.message);
  if (!devLock.passed) reasons.push(devLock.message);
  if (!actionLock.passed) reasons.push(actionLock.message);
  if (!compLock.passed) reasons.push(compLock.message);
  if (!unauthLock.passed) reasons.push(unauthLock.message);
  if (!judgmentLock.passed) reasons.push(`Julgamento clínico não autorizado: [${judgmentLock.unauthorizedJudgmentTerms.join(', ')}]`);
  if (!examLock.passed) reasons.push(`Achado de exame físico não autorizado: [${examLock.unauthorizedExamFindings.join(', ')}]`);
  if (!responseLock.passed) reasons.push(`Resposta aos cuidados não autorizada: [${responseLock.unauthorizedResponseTerms.join(', ')}]`);
  if (!pediatricLock.passed) reasons.push(pediatricLock.message);

  return {
    approved: passed,
    reasons,
    details: {
      numericLock: numLock,
      medicationLock: medLock,
      deviceLock: devLock,
      actionLock,
      complicationsLock: compLock,
      unauthorizedTermsLock: unauthLock,
      judgmentLock,
      physicalExamFactLock: examLock,
      responseToCareLock: responseLock,
      pediatricFactLock: pediatricLock,
    },
    deterministicFallback: deterministicBaseline,
  };
}
