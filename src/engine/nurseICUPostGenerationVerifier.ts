import { AuthorizedClinicalFacts, AIRefinedResponse, VerificationResult } from './types';
import { verifyNumericFactLock } from './numericFactLock';
import { verifyMedicationLock } from './medicationLock';
import { verifyDeviceLock } from './deviceLock';
import { verifyClinicalActionLock } from './clinicalActionLock';
import { verifyComplicationsAndComparisonLock } from './complicationsLock';
import { verifyUnauthorizedTermsLock } from './unauthorizedTermsLock';
import { verifyVentilatorParameterLock } from './ventilatorParameterLock';
import { verifyNurseJudgmentLock } from './nurseJudgmentLock';
import { verifyPhysicalExamFactLock } from './physicalExamFactLock';
import { verifyResponseToCareLock } from './responseToCareLock';

/**
 * PostGenerationVerifier for Nurse ICU Evolution (NURSE_EVOLUTION_ICU).
 * Executes comprehensive multi-lock verification to prevent AI hallucinations,
 * fabricated facts, altered numbers, unauthorized terms, new medications, new devices,
 * or invented clinical judgments/outcomes.
 */
export function verifyNurseICUAIRefinedResponse(
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
  const medLock = verifyMedicationLock(fullRefinedText, authorizedFacts);
  const devLock = verifyDeviceLock(fullRefinedText, authorizedFacts);
  const ventLock = verifyVentilatorParameterLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const actionLock = verifyClinicalActionLock(fullRefinedText, authorizedFacts);
  const compLock = verifyComplicationsAndComparisonLock(fullRefinedText, authorizedFacts);
  const unauthLock = verifyUnauthorizedTermsLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const judgmentLock = verifyNurseJudgmentLock(fullRefinedText, authorizedFacts);
  const examLock = verifyPhysicalExamFactLock(fullRefinedText, authorizedFacts);
  const responseLock = verifyResponseToCareLock(fullRefinedText, authorizedFacts);

  const passed =
    numLock.passed &&
    medLock.passed &&
    devLock.passed &&
    ventLock.passed &&
    actionLock.passed &&
    compLock.passed &&
    unauthLock.passed &&
    judgmentLock.passed &&
    examLock.passed &&
    responseLock.passed;

  const reasons: string[] = [];
  if (!numLock.passed) reasons.push(numLock.message);
  if (!medLock.passed) reasons.push(medLock.message);
  if (!devLock.passed) reasons.push(devLock.message);
  if (!ventLock.passed) reasons.push(ventLock.message);
  if (!actionLock.passed) reasons.push(actionLock.message);
  if (!compLock.passed) reasons.push(compLock.message);
  if (!unauthLock.passed) reasons.push(unauthLock.message);
  if (!judgmentLock.passed) reasons.push(`Julgamento clínico não autorizado: [${judgmentLock.unauthorizedJudgmentTerms.join(', ')}]`);
  if (!examLock.passed) reasons.push(`Achado de exame físico não autorizado: [${examLock.unauthorizedExamFindings.join(', ')}]`);
  if (!responseLock.passed) reasons.push(`Resposta aos cuidados não autorizada: [${responseLock.unauthorizedResponseTerms.join(', ')}]`);

  return {
    approved: passed,
    reasons,
    details: {
      numericLock: numLock,
      medicationLock: medLock,
      deviceLock: devLock,
      ventilatorLock: ventLock,
      actionLock: actionLock,
      complicationsLock: compLock,
      unauthorizedTermsLock: unauthLock,
      judgmentLock,
      physicalExamFactLock: examLock,
      responseToCareLock: responseLock,
    },
    deterministicFallback: deterministicBaseline,
  };
}
