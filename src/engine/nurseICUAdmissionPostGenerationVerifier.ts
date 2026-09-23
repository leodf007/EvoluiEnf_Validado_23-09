import { AuthorizedClinicalFacts, AIRefinedResponse, VerificationResult } from './types';
import { verifyNumericFactLock } from './numericFactLock';
import { verifyMedicationLock } from './medicationLock';
import { verifyDeviceLock } from './deviceLock';
import { verifyClinicalActionLock } from './clinicalActionLock';
import { verifyPhysicalExamFactLock } from './physicalExamFactLock';
import { verifyNurseJudgmentLock } from './nurseJudgmentLock';
import { verifyUnauthorizedTermsLock } from './unauthorizedTermsLock';
import { verifyVentilatorParameterLock } from './ventilatorParameterLock';
import { verifyICUAdmissionFactLock } from './icuAdmissionFactLock';
import { checkPrivacyGuards } from './privacyGuard';

/**
 * PostGenerationVerifier for Nurse ICU Admission (NURSE_ADMISSION_ICU).
 * Executes multi-lock verification:
 * 1. NumericFactLock: Numbers, MAP, and vitals cannot be altered, invented, or calculated.
 * 2. MedicationLock: No unauthorized drugs or modifications.
 * 3. DeviceLock: Devices must strictly match authorized facts.
 * 4. ClinicalActionLock: No invented nursing interventions.
 * 5. PhysicalExamFactLock: Physical exam findings must match authorized facts.
 * 6. NurseJudgmentLock: Clinical judgments must originate from the nurse.
 * 7. VentilatorParameterLock: Ventilator parameters must match authorized facts.
 * 8. ICUAdmissionFactLock: Prohibits AI from inventing shock, sepsis, instability, organ failure, severity interpretations, prognoses, or medical prescriptions/diagnoses.
 * 9. UnauthorizedTermsLock: Prohibits speculative terminology and external diagnoses.
 * 10. PrivacyGuard: Prevents nominal PII leakage.
 */
export function verifyNurseICUAdmissionAIRefinedResponse(
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
  const actionLock = verifyClinicalActionLock(fullRefinedText, authorizedFacts);
  const examLock = verifyPhysicalExamFactLock(fullRefinedText, authorizedFacts);
  const judgmentLock = verifyNurseJudgmentLock(fullRefinedText, authorizedFacts);
  const ventLock = verifyVentilatorParameterLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const icuLock = verifyICUAdmissionFactLock(fullRefinedText, authorizedFacts, deterministicBaseline);
  const unauthLock = verifyUnauthorizedTermsLock(fullRefinedText, deterministicBaseline, authorizedFacts);
  const privacyCheck = checkPrivacyGuards(fullRefinedText);

  const passed =
    numLock.passed &&
    medLock.passed &&
    devLock.passed &&
    actionLock.passed &&
    examLock.passed &&
    judgmentLock.passed &&
    ventLock.passed &&
    icuLock.passed &&
    unauthLock.passed &&
    !privacyCheck.hasPotentialPII;

  const reasons: string[] = [];
  if (!numLock.passed) reasons.push(numLock.message);
  if (!medLock.passed) reasons.push(medLock.message);
  if (!devLock.passed) reasons.push(devLock.message);
  if (!actionLock.passed) reasons.push(actionLock.message);
  if (!examLock.passed) reasons.push(`Achado de exame físico não autorizado: [${examLock.unauthorizedExamFindings.join(', ')}]`);
  if (!judgmentLock.passed) reasons.push(`Julgamento clínico não autorizado: [${judgmentLock.unauthorizedJudgmentTerms.join(', ')}]`);
  if (!ventLock.passed) reasons.push(ventLock.message);
  if (!icuLock.passed) reasons.push(icuLock.message);
  if (!unauthLock.passed) reasons.push(unauthLock.message);
  if (privacyCheck.hasPotentialPII) reasons.push('Texto refinado contém possíveis dados de identificação direta (PII).');

  return {
    approved: passed,
    reasons,
    details: {
      numericLock: numLock,
      medicationLock: medLock,
      deviceLock: devLock,
      actionLock,
      physicalExamFactLock: examLock,
      judgmentLock,
      ventilatorParameterLock: ventLock,
      icuAdmissionFactLock: icuLock,
      unauthorizedTermsLock: unauthLock,
      privacyCheck,
    },
    deterministicFallback: deterministicBaseline,
  };
}
