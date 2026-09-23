import { AuthorizedClinicalFacts, ClinicalFact, AIRefinedParagraph } from './types';
import { verifyNumericFactLock, NumericLockResult } from './numericFactLock';
import { verifyUnauthorizedTermsLock, UnauthorizedTermsLockResult } from './unauthorizedTermsLock';
import { verifyMedicationLock, MedicationLockResult } from './medicationLock';
import { verifyDeviceLock, DeviceLockResult } from './deviceLock';
import { verifyClinicalActionLock, ClinicalActionLockResult } from './clinicalActionLock';
import { verifyComplicationsAndComparisonLock, ComplicationsAndComparisonLockResult } from './complicationsLock';
import { verifyNurseJudgmentLock, NurseJudgmentLockResult } from './nurseJudgmentLock';
import { verifyPhysicalExamFactLock, PhysicalExamFactLockResult } from './physicalExamFactLock';
import { verifyResponseToCareLock, ResponseToCareLockResult } from './responseToCareLock';

export interface AIRefinedStructuredResponse {
  paragraphs: AIRefinedParagraph[];
}

export interface PostGenerationVerificationResult {
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
    nurseJudgmentLock?: NurseJudgmentLockResult;
    physicalExamFactLock?: PhysicalExamFactLockResult;
    responseToCareLock?: ResponseToCareLockResult;
  };
}

/**
 * Extracts all valid fact IDs from the AuthorizedClinicalFacts structure.
 */
export function getAllAuthorizedFactIds(authorizedFacts: AuthorizedClinicalFacts): Set<string> {
  const ids = new Set<string>();

  Object.values(authorizedFacts).forEach((factsList) => {
    if (Array.isArray(factsList)) {
      factsList.forEach((f: ClinicalFact) => {
        if (f.id) ids.add(f.id);
      });
    }
  });

  return ids;
}

/**
 * PostGenerationVerifier:
 * Pure deterministic validation engine. Runs BEFORE any AI refined output is shown to the user.
 * If ANY rule fails, the entire response is rejected.
 */
export function verifyAIRefinedResponse(
  rawResponse: AIRefinedStructuredResponse,
  authorizedFacts: AuthorizedClinicalFacts,
  canonicalNarrative: string
): PostGenerationVerificationResult {
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
      },
    };
  }

  // Aggregate full refined text
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

  // 8. Complications and Comparison Lock
  const complicationsLock = verifyComplicationsAndComparisonLock(fullRefinedText, authorizedFacts);
  if (!complicationsLock.passed) {
    reasons.push(complicationsLock.message);
  }

  // 9. Nurse Judgment Lock
  const nurseJudgmentLock = verifyNurseJudgmentLock(fullRefinedText, authorizedFacts);
  if (!nurseJudgmentLock.passed) {
    reasons.push(`Termos de julgamento/inferência clínica não autorizados detectados: [${nurseJudgmentLock.unauthorizedJudgmentTerms.join(', ')}].`);
  }

  // 10. Physical Exam Fact Lock
  const physicalExamFactLock = verifyPhysicalExamFactLock(fullRefinedText, authorizedFacts);
  if (!physicalExamFactLock.passed) {
    reasons.push(`Achados de exame físico não autorizados nos fatos clínicos: [${physicalExamFactLock.unauthorizedExamFindings.join(', ')}].`);
  }

  // 11. Response to Care Lock
  const responseToCareLock = verifyResponseToCareLock(fullRefinedText, authorizedFacts);
  if (!responseToCareLock.passed) {
    reasons.push(`Afirmações de resposta a cuidados/condutas sem respaldo nos fatos clínicos: [${responseToCareLock.unauthorizedResponseTerms.join(', ')}].`);
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
      nurseJudgmentLock,
      physicalExamFactLock,
      responseToCareLock,
    },
  };
}

export function verifyPostGeneration(params: {
  aiOutput: string | AIRefinedStructuredResponse;
  authorizedFacts: AuthorizedClinicalFacts;
  canonicalText: string;
}): { approved: boolean; rejectionReasons: string[] } {
  let structuredResponse: AIRefinedStructuredResponse;
  if (typeof params.aiOutput === 'string') {
    const paragraphs = params.aiOutput
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => ({ text: p, factIds: Array.from(getAllAuthorizedFactIds(params.authorizedFacts)) }));
    structuredResponse = { paragraphs };
  } else {
    structuredResponse = params.aiOutput;
  }

  const res = verifyAIRefinedResponse(structuredResponse, params.authorizedFacts, params.canonicalText);
  return {
    approved: res.approved,
    rejectionReasons: res.reasons,
  };
}
