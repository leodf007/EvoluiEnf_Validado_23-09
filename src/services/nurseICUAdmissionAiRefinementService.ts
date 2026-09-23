import { authenticatedFetch } from './authenticatedFetch';
import { NurseICUAdmissionForm } from '../types/nurseICUAdmission';
import { AuthorizedClinicalFacts } from '../engine/types';
import { evaluatePrivacyGate } from '../engine/privacyGate';
import { verifyNurseICUAdmissionAIRefinedResponse } from '../engine/nurseICUAdmissionPostGenerationVerifier';
import { AIRefinementRequestResult, DEFAULT_AI_MODEL } from './aiRefinementService';

export async function refineNurseICUAdmissionWithAI(
  form: Partial<NurseICUAdmissionForm>,
  authorizedFacts: AuthorizedClinicalFacts,
  canonicalNarrative: string
): Promise<AIRefinementRequestResult> {
  // Step 1: PrivacyGate evaluation
  const privacyEvaluation = evaluatePrivacyGate(form as any);
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
        profile: 'nurse',
        documentType: 'NURSE_ADMISSION',
        area: 'icu',
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
        error: res.status === 429 ? message : 'Não foi possível refinar a admissão neste momento. O texto determinístico estruturado foi preservado.',
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
        error: 'Não foi possível refinar a admissão. O texto determinístico foi preservado.',
      };
    }

    const structuredResult = data.result;

    // Step 3: PostGenerationVerifier for Nurse ICU Admission
    const verification = verifyNurseICUAdmissionAIRefinedResponse(
      structuredResult,
      authorizedFacts,
      canonicalNarrative
    );

    if (!verification.approved) {
      return {
        success: false,
        fallbackText: canonicalNarrative,
        source: 'fallback_deterministic',
        model: activeModel,
        requestStatus: 'success',
        verifierStatus: 'rejected',
        rejectionReasons: verification.reasons,
        verificationDetails: verification.details,
        error: `O PostGenerationVerifier identificou divergências em relação aos fatos autorizados: ${verification.reasons.join('; ')}`,
      };
    }

    const refinedText = structuredResult.paragraphs.map((p: any) => p.text).join('\n\n');

    return {
      success: true,
      refinedText,
      fallbackText: canonicalNarrative,
      source: 'gemini_api',
      model: activeModel,
      requestStatus: 'success',
      verifierStatus: 'approved',
      verificationDetails: verification.details,
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
        statusCode: 500,
        code: 'NETWORK_ERROR',
        message: err?.message || 'Falha de conexão com o servidor.',
      },
      error: 'Erro de comunicação ao solicitar refinamento de IA.',
    };
  }
}
