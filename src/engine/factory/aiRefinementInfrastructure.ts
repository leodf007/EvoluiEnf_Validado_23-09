import { AuthorizedClinicalFacts, ClinicalFact } from '../types';
import { ClinicalOperationResult, ClinicalDocumentType } from './types';
import { checkPrivacyGuards } from '../privacyGuard';
import { verifyPostGeneration } from '../postGenerationVerifier';

export interface AIRefinementRequest {
  documentType: ClinicalDocumentType;
  professionalRole: 'technician' | 'nurse';
  authorizedFacts: AuthorizedClinicalFacts;
  canonicalNarrative: string;
  registries?: {
    devices?: string[];
    medications?: string[];
    actions?: string[];
  };
  customLocks?: ((text: string, facts: AuthorizedClinicalFacts) => { approved: boolean; reason?: string })[];
}

export class CommonAIRefinementPolicy {
  static getUniversalDirectives(): string[] {
    return [
      'Proibido criar novos fatos clínicos não contidos na anotação canônica.',
      'Proibido alterar ou arredondar qualquer valor numérico ou sinal vital.',
      'Proibido adicionar medicamentos, doses ou vias não informadas.',
      'Proibido adicionar dispositivos invasivos não listados.',
      'Proibido inferir diagnósticos médicos ou de enfermagem não declarados.',
      'Preservar a fidelidade terminológica exata.',
    ];
  }
}

export class ModuleSpecificAIRefinementPolicy {
  static getRoleDirectives(role: 'technician' | 'nurse', documentType: ClinicalDocumentType): string[] {
    if (role === 'technician') {
      return [
        'Manter estilo objetivo de anotação de enfermagem de nível técnico.',
        'Proibido transformar a anotação em evolução de enfermagem.',
        'Proibido incluir termos privativos como "diagnóstico de enfermagem" ou "prescrição de enfermagem".',
        'Proibido emitir conclusões sobre estabilidade clínica ("hemodinamicamente estável", "bom estado geral").',
      ];
    }

    if (role === 'nurse') {
      return [
        'Manter rigor técnico da evolução de enfermagem sistematizada (Processo de Enfermagem).',
        'Preservar a síntese clínica e o julgamento do enfermeiro quando fornecidos.',
        'Proibido criar automaticamente diagnósticos de enfermagem não informados pelo profissional.',
        'Proibido criar condutas ou prescrições automáticas não prescritas pelo enfermeiro.',
      ];
    }

    return [];
  }
}

export class BasePostGenerationVerifier {
  /**
   * Executes base verification and module-specific locks on refined text.
   */
  static verify(
    refinedText: string,
    authorizedFacts: AuthorizedClinicalFacts,
    canonicalText: string,
    customLocks?: ((text: string, facts: AuthorizedClinicalFacts) => { approved: boolean; reason?: string })[]
  ): { approved: boolean; rejectionReasons: string[] } {
    const rejectionReasons: string[] = [];

    // Privacy guard check on AI output
    const piiCheck = checkPrivacyGuards(refinedText);
    if (piiCheck.hasPotentialPII) {
      rejectionReasons.push('AI output contains potential PII identifiers.');
      return { approved: false, rejectionReasons };
    }

    // Core post generation verifier
    const baseResult = verifyPostGeneration({
      aiOutput: refinedText,
      authorizedFacts,
      canonicalText,
    });

    if (!baseResult.approved) {
      rejectionReasons.push(...baseResult.rejectionReasons);
    }

    // Run any custom locks
    if (customLocks && customLocks.length > 0) {
      for (const lock of customLocks) {
        const lockResult = lock(refinedText, authorizedFacts);
        if (!lockResult.approved && lockResult.reason) {
          rejectionReasons.push(lockResult.reason);
        }
      }
    }

    return {
      approved: rejectionReasons.length === 0,
      rejectionReasons,
    };
  }
}

export class ClinicalAIRefinementService {
  /**
   * Evaluates and prepares an AI refinement pipeline request.
   * Ensures raw form data is NEVER passed directly to AI.
   */
  static validateRefinementInput(request: AIRefinementRequest): ClinicalOperationResult<boolean> {
    if (!request.canonicalNarrative || request.canonicalNarrative.trim().length === 0) {
      return {
        status: 'validation_warning',
        message: 'Narrativa canônica vazia.',
        data: false,
      };
    }

    // Check privacy on canonical text
    const piiCheck = checkPrivacyGuards(request.canonicalNarrative);
    if (piiCheck.hasPotentialPII) {
      return {
        status: 'privacy_blocked',
        message: 'Dados pessoais detectados no texto.',
        data: false,
      };
    }

    return {
      status: 'success',
      data: true,
    };
  }
}
