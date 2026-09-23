import { authenticatedFetch } from './authenticatedFetch';
import { TechnicianAdmissionForm } from '../types/admissionClinical';
import { AuthorizedClinicalFacts } from '../engine/types';
import { evaluatePrivacyGate } from '../engine/privacyGate';
import {
  verifyAdmissionAIRefinedResponse,
  AdmissionPostGenerationVerificationResult,
} from '../engine/admissionPostGenerationVerifier';
import { AIRefinedStructuredResponse } from '../engine/postGenerationVerifier';
import {
  AIRefinementRequestResult,
  DEFAULT_AI_MODEL,
} from './aiRefinementService';

/**
 * Refines the admission nursing note using server-side Gemini API (or strict deterministic fallback).
 * Evaluates PrivacyGate first, calls the server endpoint, and runs verifyAdmissionAIRefinedResponse.
 */
export async function refineAdmissionNoteWithAI(
  form: Partial<TechnicianAdmissionForm>,
  authorizedFacts: AuthorizedClinicalFacts,
  canonicalNarrative: string
): Promise<AIRefinementRequestResult & { admissionVerificationDetails?: AdmissionPostGenerationVerificationResult['details'] }> {
  // Step 1: PrivacyGate
  const privacyEvaluation = evaluatePrivacyGate(form);
  if (!privacyEvaluation.allowed) {
    return {
      success: false,
      fallbackText: canonicalNarrative,
      source: 'fallback_deterministic',
      model: DEFAULT_AI_MODEL,
      requestStatus: 'privacy_blocked',
      verifierStatus: 'not_executed',
      blockedByPrivacy: true,
      privacyEvaluation,
      error: privacyEvaluation.message,
    };
  }

  // Step 2: Server-side API Call
  try {
    const res = await authenticatedFetch('/api/ai/refine-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorizedFacts,
        canonicalNarrative,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const statusCode = errData.providerDetails?.statusCode || res.status;
      const code = errData.providerDetails?.code || `HTTP_${res.status}`;
      const providerModel = errData.providerDetails?.model || errData.model || DEFAULT_AI_MODEL;
      const message = errData.providerDetails?.message || errData.error || `Erro HTTP ${res.status}`;

      return {
        success: false,
        fallbackText: canonicalNarrative,
        source: 'fallback_deterministic',
        model: providerModel,
        requestStatus: 'provider_error',
        verifierStatus: 'not_executed',
        providerErrorDetails: {
          provider: 'gemini',
          model: providerModel,
          statusCode,
          code,
          message,
        },
        error: res.status === 429 ? message : 'Não foi possível realizar o refinamento automático neste momento. A anotação de admissão estruturada foi preservada.',
      };
    }

    const data = await res.json();
    const activeModel = data.model || DEFAULT_AI_MODEL;

    if (!data.success || !data.result) {
      return {
        success: false,
        fallbackText: canonicalNarrative,
        source: 'fallback_deterministic',
        model: activeModel,
        requestStatus: 'provider_error',
        verifierStatus: 'not_executed',
        providerErrorDetails: {
          provider: 'gemini',
          model: activeModel,
          statusCode: 500,
          code: 'INVALID_AI_RESPONSE',
          message: data.error || 'Resposta inválida do serviço de IA.',
        },
        error: 'Não foi possível realizar o refinamento automático neste momento. A anotação estruturada foi preservada.',
      };
    }

    const structuredResult: AIRefinedStructuredResponse = data.result;

    // Step 3: AdmissionPostGenerationVerifier (strictly deterministic verification with OriginFactLock and ExistingVsInstalledDevicesLock)
    const verification = verifyAdmissionAIRefinedResponse(
      structuredResult,
      authorizedFacts,
      canonicalNarrative
    );

    if (!verification.approved) {
      // COMPLETE DISCARD of the refined text. Fallback to deterministic narrative.
      return {
        success: false,
        fallbackText: canonicalNarrative,
        source: 'fallback_deterministic',
        model: activeModel,
        requestStatus: 'verifier_rejected',
        verifierStatus: 'rejected',
        rejectedByVerification: true,
        rejectionReasons: verification.reasons,
        verificationDetails: verification.details as any,
        admissionVerificationDetails: verification.details,
        error: 'O refinamento automático foi descartado porque introduziu ou alterou informações não autorizadas (ex: procedência, dispositivos ou dados clínicos). A anotação estruturada foi preservada.',
      };
    }

    const refinedText = structuredResult.paragraphs.map((p) => p.text).join('\n\n');

    return {
      success: true,
      refinedText,
      structuredResponse: structuredResult,
      fallbackText: canonicalNarrative,
      source: data.source || 'gemini_api',
      model: activeModel,
      requestStatus: 'success',
      verifierStatus: 'approved',
      admissionVerificationDetails: verification.details,
    };
  } catch (err: any) {
    return {
      success: false,
      fallbackText: canonicalNarrative,
      source: 'fallback_deterministic',
      model: DEFAULT_AI_MODEL,
      requestStatus: 'provider_error',
      verifierStatus: 'not_executed',
      providerErrorDetails: {
        provider: 'gemini',
        model: DEFAULT_AI_MODEL,
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message: err?.message || 'Falha de comunicação de rede.',
      },
      error: 'Não foi possível realizar o refinamento automático neste momento. A anotação estruturada foi preservada.',
    };
  }
}
