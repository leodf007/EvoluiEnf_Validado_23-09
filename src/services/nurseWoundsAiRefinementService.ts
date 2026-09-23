import { authenticatedFetch } from './authenticatedFetch';
import { NurseWoundsAssessmentForm } from '../types/nurseWoundsAssessment';
import { AuthorizedClinicalFacts } from '../engine/types';
import { evaluatePrivacyGate } from '../engine/privacyGate';
import { verifyNurseWoundsAIRefinedResponse } from '../engine/nurseWoundsPostGenerationVerifier';
import { AIRefinementRequestResult, DEFAULT_AI_MODEL } from './aiRefinementService';

export async function refineNurseWoundsWithAI(
  form: Partial<NurseWoundsAssessmentForm>,
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
        documentType: 'WOUND_ASSESSMENT',
        area: 'all',
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
    const rawRefined = data.refinedText || '';
    const usedModel = data.model || DEFAULT_AI_MODEL;

    // Step 3: PostGenerationVerifier multi-lock validation
    const verification = verifyNurseWoundsAIRefinedResponse(
      {
        paragraphs: [{ text: rawRefined, factIds: [] }],
      },
      authorizedFacts,
      canonicalNarrative
    );

    if (verification.approved) {
      return {
        success: true,
        refinedText: rawRefined,
        fallbackText: canonicalNarrative,
        source: 'gemini_api',
        model: usedModel,
        requestStatus: 'success',
        verifierStatus: 'approved',
        verificationDetails: {
          approved: true,
        },
      };
    } else {
      return {
        success: false,
        fallbackText: canonicalNarrative,
        source: 'fallback_deterministic',
        model: usedModel,
        requestStatus: 'verifier_rejected',
        verifierStatus: 'rejected',
        verificationDetails: {
          approved: false,
          reasons: verification.reasons,
        },
        error: `Refinamento rejeitado pelos locks clínicos de segurança: ${verification.reasons.join('; ')}`,
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
      error: `Falha na requisição de refinamento: ${err?.message || 'Erro de conexão'}`,
    };
  }
}
