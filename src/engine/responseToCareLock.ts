import { AuthorizedClinicalFacts } from './types';

export interface ResponseToCareLockResult {
  passed: boolean;
  unauthorizedResponseTerms: string[];
}

/**
 * Guard that verifies that assertions regarding patient response to nursing care or therapeutic interventions
 * are strictly grounded in authorized facts, preventing synthetic or hallucinated clinical outcomes.
 */
export function verifyResponseToCareLock(
  refinedText: string,
  authorizedFacts: AuthorizedClinicalFacts
): ResponseToCareLockResult {
  const lower = refinedText.toLowerCase();
  const unauthorizedResponseTerms: string[] = [];

  // Extract all text content from authorized facts
  const allFactTexts: string[] = [];
  Object.values(authorizedFacts).forEach((factList) => {
    if (Array.isArray(factList)) {
      factList.forEach((fact) => {
        if (typeof fact.value === 'string') allFactTexts.push(fact.value.toLowerCase());
        else if (Array.isArray(fact.value)) fact.value.forEach((v) => allFactTexts.push(String(v).toLowerCase()));
        if (fact.canonicalText) allFactTexts.push(fact.canonicalText.toLowerCase());
      });
    }
  });

  const factCorpus = allFactTexts.join(' ');

  const causalOutcomeChecks: Array<{ pattern: RegExp; term: string }> = [
    { pattern: /ap[oó]s\s+interven[çc][ãa]o.*(?:observou-se|notou-se|com\s+melhora|estabilizou)/i, term: 'desfecho causal pós-intervenção' },
    { pattern: /respondeu\s+positivamente\s+ao\s+cuidado/i, term: 'resposta positiva ao cuidado' },
    { pattern: /paciente\s+evoluindo\s+com\s+estabilidade\s+ap[oó]s/i, term: 'estabilidade após conduta' },
    { pattern: /obteve-se\s+al[íi]vio\s+da\s+dor/i, term: 'alívio da dor como inferência' },
    { pattern: /melhora.*ap[oó]s\s+cuidados/i, term: 'melhora atribuída a cuidados' },
    { pattern: /apresentou.*melhora.*ap[oó]s/i, term: 'melhora pós-cuidados' },
    { pattern: /excelente\s+resposta/i, term: 'excelente resposta aos cuidados' },
    { pattern: /recupera[çc][ãa]o\s+ventilat[oó]ria/i, term: 'recuperação ventilatória inferida' },
    { pattern: /resposta\s+ao\s+dec[uú]bito/i, term: 'resposta ao decúbito' },
  ];

  for (const check of causalOutcomeChecks) {
    if (check.pattern.test(lower)) {
      const isAuthorized = check.pattern.test(factCorpus);
      if (!isAuthorized) {
        unauthorizedResponseTerms.push(check.term);
      }
    }
  }

  return {
    passed: unauthorizedResponseTerms.length === 0,
    unauthorizedResponseTerms,
  };
}
