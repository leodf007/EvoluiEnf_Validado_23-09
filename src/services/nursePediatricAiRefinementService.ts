import { authenticatedFetch } from './authenticatedFetch';
import { NursePediatricEvolutionForm } from '../types/nursePediatricEvolution';
import { AuthorizedClinicalFacts } from '../engine/types';
import { evaluatePrivacyGate } from '../engine/privacyGate';
import { verifyNursePediatricEvolutionAIRefinedResponse } from '../engine/nursePediatricEvolutionPostGenerationVerifier';
import { AIRefinementRequestResult, DEFAULT_AI_MODEL } from './aiRefinementService';

export async function refineNursePediatricEvolutionWithAI(
  form: Partial<NursePediatricEvolutionForm>,
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
        documentType: 'NURSE_EVOLUTION',
        area: 'pediatrics',
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
        error: message,
      };
    }

    const data = await res.json();
    const rawRefinedResponse = data.refinedResponse;

    // Step 3: Run PostGenerationVerifier with all locks including PediatricFactLock
    const verifierResult = verifyNursePediatricEvolutionAIRefinedResponse(
      rawRefinedResponse,
      authorizedFacts,
      canonicalNarrative
    );

    if (!verifierResult.approved) {
      return {
        success: false,
        fallbackText: canonicalNarrative,
        source: 'fallback_deterministic',
        model: data.model || DEFAULT_AI_MODEL,
        requestStatus: 'verifier_rejected',
        verifierStatus: 'rejected',
        rejectionReasons: verifierResult.reasons,
        verificationDetails: verifierResult.details,
        error: `Refinamento rejeitado pelas travas de segurança clínica: ${verifierResult.reasons.join(' | ')}`,
      };
    }

    const fullRefinedText = rawRefinedResponse.paragraphs.map((p: any) => p.text).join('\n\n');

    return {
      success: true,
      refinedText: fullRefinedText,
      fallbackText: canonicalNarrative,
      source: 'gemini_api',
      model: data.model || DEFAULT_AI_MODEL,
      requestStatus: 'success',
      verifierStatus: 'approved',
      verificationDetails: verifierResult.details,
    };
  } catch (err: any) {
    return {
      success: false,
      fallbackText: canonicalNarrative,
      source: 'fallback_deterministic',
      model: DEFAULT_AI_MODEL,
      requestStatus: 'provider_error',
      verifierStatus: 'not_executed',
      error: err?.message || 'Falha de comunicação com o serviço de refinamento.',
    };
  }
}
