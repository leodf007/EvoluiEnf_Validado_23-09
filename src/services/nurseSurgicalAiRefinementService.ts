import { authenticatedFetch } from './authenticatedFetch';
import { NurseSurgicalEvolutionForm } from '../types/nurseSurgicalEvolution';
import { AuthorizedClinicalFacts } from '../engine/types';
import { evaluatePrivacyGate } from '../engine/privacyGate';
import { verifyNurseSurgicalEvolutionAIRefinedResponse } from '../engine/nurseSurgicalEvolutionPostGenerationVerifier';
import { AIRefinementRequestResult, DEFAULT_AI_MODEL } from './aiRefinementService';

export async function refineNurseSurgicalEvolutionWithAI(
  form: Partial<NurseSurgicalEvolutionForm>,
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
        area: 'surgicalClinic',
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
    const usedModel = data.model || DEFAULT_AI_MODEL;

    // Step 3: PostGenerationVerifier validation with SurgicalFactLock
    const verification = verifyNurseSurgicalEvolutionAIRefinedResponse(
      data,
      authorizedFacts,
      canonicalNarrative
    );

    if (verification.approved) {
      const refinedText = data.paragraphs.map((p: any) => p.text).join('\n\n');
      return {
        success: true,
        refinedText,
        fallbackText: canonicalNarrative,
        source: 'gemini_api',
        model: usedModel,
        requestStatus: 'success',
        verifierStatus: 'approved',
        verificationDetails: verification,
      };
    } else {
      return {
        success: false,
        fallbackText: canonicalNarrative,
        source: 'fallback_deterministic',
        model: usedModel,
        requestStatus: 'verifier_rejected',
        verifierStatus: 'rejected',
        rejectionReasons: verification.reasons,
        verificationDetails: verification,
        error: `Rejeitado pelo Verificador de Segurança Clínica: ${verification.reasons.join(', ')}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      fallbackText: canonicalNarrative,
      source: 'fallback_deterministic',
      model: DEFAULT_AI_MODEL,
      requestStatus: 'provider_error',
      verifierStatus: 'not_executed',
      error: err?.message || 'Falha de conexão com a API de IA.',
    };
  }
}
