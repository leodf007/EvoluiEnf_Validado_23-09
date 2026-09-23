import { ClinicalEvolutionForm } from '../types/clinical';
import { TechnicianAdmissionForm } from '../types/admissionClinical';
import { checkPrivacyGuards } from './privacyGuard';
import { PrivacyGuardMatch, PrivacyGuardResult } from './types';

export interface PrivacyGateEvaluation {
  allowed: boolean;
  blockedReason?: string;
  matches: PrivacyGuardMatch[];
  message: string;
}

/**
 * Evaluates whether the clinical data is safe to send to the AI refinement pipeline.
 * If high-confidence PII is detected, it strictly blocks execution.
 */
export function evaluatePrivacyGate(
  form: ClinicalEvolutionForm | Partial<TechnicianAdmissionForm> | Record<string, any>
): PrivacyGateEvaluation {
  const guardResult: PrivacyGuardResult = checkPrivacyGuards(form as any);

  if (guardResult.hasPotentialPII && guardResult.matches.length > 0) {
    return {
      allowed: false,
      blockedReason: 'POSSIBLE_PII_DETECTED',
      matches: guardResult.matches,
      message:
        'Possível identificador do paciente detectado. Remova a informação identificadora antes de utilizar o refinamento automático.',
    };
  }

  return {
    allowed: true,
    matches: [],
    message: 'Nenhum identificador pessoal direto detectado. Liberado para processamento seguro.',
  };
}
