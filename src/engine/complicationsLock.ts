import { AuthorizedClinicalFacts } from './types';

export interface ComplicationsAndComparisonLockResult {
  passed: boolean;
  message: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Verifies rules for complications and comparative records:
 * 1. "Sem intercorrências" is only allowed if complications.hasComplication is explicitly 'Não' in authorized facts.
 * 2. Stability inferences are strictly forbidden.
 */
export function verifyComplicationsAndComparisonLock(
  aiText: string,
  authorizedFacts: AuthorizedClinicalFacts
): ComplicationsAndComparisonLockResult {
  const normalizedAi = normalize(aiText);

  // Check if AI included "sem intercorrencias" / "sem queixas"
  const hasNoComplicationPhrase =
    /\bsem\s+intercorrencia[s]?\b/i.test(normalizedAi) ||
    /\blivre\s+de\s+intercorrencia[s]?\b/i.test(normalizedAi) ||
    /\bsem\s+queixas\b/i.test(normalizedAi);

  if (hasNoComplicationPhrase) {
    const compFacts = authorizedFacts.complications || [];
    const explicitNoFact = compFacts.find((f) => {
      const isComplicationField =
        f.sourceField === 'complications.hasComplication' ||
        f.sourceField === 'hasComplication' ||
        f.category === 'complications';
      if (!isComplicationField) return false;
      const isValueNo =
        f.value === 'Não' ||
        (typeof f.value === 'object' && f.value !== null && (f.value as any).hasComplication === 'Não');
      const isCanonicalNo =
        f.canonicalText?.toLowerCase().includes('não') ||
        f.canonicalText?.toLowerCase().includes('sem intercorrência') ||
        f.canonicalText?.toLowerCase().includes('sem intercorrencia');
      return Boolean(isValueNo || isCanonicalNo);
    });

    if (!explicitNoFact) {
      return {
        passed: false,
        message:
          'A IA adicionou "sem intercorrências", mas o campo de intercorrências não foi explicitamente preenchido com "Não" pelo profissional.',
      };
    }
  }

  // Check comparison claims
  if (
    normalizedAi.includes('estabilidade clinica') ||
    normalizedAi.includes('paciente estavel') ||
    normalizedAi.includes('quadro estavel')
  ) {
    const hasAuthorizedStability = Object.values(authorizedFacts).some((factsList) =>
      factsList?.some((f) => {
        const text = `${String(f.value || '')} ${String(f.canonicalText || '')}`.toLowerCase();
        return text.includes('estável') || text.includes('estavel');
      })
    );

    if (!hasAuthorizedStability) {
      return {
        passed: false,
        message:
          'A IA inferiu estabilidade clínica a partir de registro evolutivo ou comparativo, o que é proibido.',
      };
    }
  }

  return {
    passed: true,
    message: 'Validação de intercorrências e comparação aprovada.',
  };
}
