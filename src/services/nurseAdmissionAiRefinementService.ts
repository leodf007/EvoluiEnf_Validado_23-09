import { authenticatedFetch } from './authenticatedFetch';
import { AuthorizedClinicalFacts, AIRefinedResponse, VerificationResult } from '../engine/types';
import { verifyNurseAdmissionAIRefinedResponse } from '../engine/nurseAdmissionPostGenerationVerifier';

export interface NurseAIRefinementResult {
  success: boolean;
  refinedText: string;
  source: 'ai' | 'deterministic';
  verification: VerificationResult | null;
  message?: string;
}

/**
 * Service for refining Nurse Admission notes using AI.
 * If AI fails, throws, or generates unverified facts, automatically falls back to deterministic text.
 */
export async function refineNurseAdmissionNoteWithAI(
  deterministicText: string,
  authorizedFacts: AuthorizedClinicalFacts
): Promise<NurseAIRefinementResult> {
  const fallbackVerification: VerificationResult = {
    approved: true,
    reasons: [],
    deterministicFallback: deterministicText,
    details: {
      numericLock: { passed: true, reason: 'Texto determinístico' },
      deviceLock: { passed: true, reason: 'Texto determinístico' },
      originLock: { passed: true, reason: 'Texto determinístico' },
      actionLock: { passed: true, reason: 'Texto determinístico' },
      complicationsLock: { passed: true, reason: 'Texto determinístico' },
      existingVsInstalledDevicesLock: { passed: true, reason: 'Texto determinístico' },
    },
  };

  try {
    const response = await authenticatedFetch('/api/ai/refine-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorizedFacts,
        canonicalNarrative: deterministicText,
        profile: 'nurse',
        documentType: 'NURSE_ADMISSION',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: true,
        refinedText: deterministicText,
        source: 'deterministic',
        verification: fallbackVerification,
        message: response.status === 429
          ? (errData.error || 'Sua cota mensal de consultas ao Assistente IA foi atingida.')
          : 'Serviço de refinamento temporariamente indisponível. Utilizando texto determinístico estruturado.',
      };
    }

    const data = await response.json();
    const paragraphs = data?.result?.paragraphs;
    if (!paragraphs || !Array.isArray(paragraphs)) {
      return {
        success: true,
        refinedText: deterministicText,
        source: 'deterministic',
        verification: fallbackVerification,
        message: 'Resposta da IA fora do padrão estruturado. Utilizando texto determinístico.',
      };
    }

    const aiResponse: AIRefinedResponse = {
      paragraphs,
    };

    const verification = verifyNurseAdmissionAIRefinedResponse(aiResponse, authorizedFacts, deterministicText);

    if (!verification.approved) {
      return {
        success: true,
        refinedText: deterministicText,
        source: 'deterministic',
        verification,
        message: 'Refinamento não aprovado nos testes de segurança clínica. Utilizando texto determinístico aprovado.',
      };
    }

    const refinedText = aiResponse.paragraphs.map((p) => p.text).join('\n\n');
    return {
      success: true,
      refinedText,
      source: 'ai',
      verification,
    };
  } catch {
    return {
      success: true,
      refinedText: deterministicText,
      source: 'deterministic',
      verification: fallbackVerification,
      message: 'Modo offline ou sem conexão. Utilizando texto determinístico estruturado.',
    };
  }
}
