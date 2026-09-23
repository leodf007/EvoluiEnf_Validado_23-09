import { AuthorizedClinicalFacts } from './types';

export interface NumericLockResult {
  passed: boolean;
  unauthorizedNumbers: string[];
  message: string;
}

/**
 * Extracts all distinct numerical values and compound number patterns from text.
 * E.g., "150/90", "80", "25", "99", "37", "37.5", "37,5", "7", "0", "6", "50", "389", "10", "55"
 */
export function extractNumbers(text: string): string[] {
  if (!text) return [];

  // Match numbers including decimals (with . or ,) and compound fractions like blood pressure "120/80"
  // Also match isolated numbers
  const tokens: string[] = [];

  // 1. Match compound BP like 120/80, 150/90, 118x74
  const bpMatches: string[] = text.match(/\b\d{2,3}[xX/]\d{2,3}\b/g) || [];
  bpMatches.forEach((bp: string) => {
    tokens.push(bp);
    const parts = bp.split(/[xX/]/);
    tokens.push(parts[0], parts[1]);
  });

  // 2. Match general numbers (integers and decimals)
  const numMatches: string[] = text.match(/\b\d+(?:[.,]\d+)?\b/g) || [];
  numMatches.forEach((num: string) => {
    tokens.push(num);
    // Standardize decimal commas to dots for robust comparison
    if (num.includes(',')) {
      tokens.push(num.replace(',', '.'));
    }
  });

  return Array.from(new Set(tokens));
}

/**
 * Extracts all authorized numbers from the deterministic narrative and authorized facts.
 */
export function extractAuthorizedNumbers(
  canonicalNarrative: string,
  authorizedFacts: AuthorizedClinicalFacts
): Set<string> {
  const allowed = new Set<string>();

  // Extract from canonical narrative
  const narrativeNums = extractNumbers(canonicalNarrative);
  narrativeNums.forEach((n) => allowed.add(n));

  // Extract from all fact values & canonical texts
  Object.values(authorizedFacts).forEach((factsList) => {
    if (Array.isArray(factsList)) {
      factsList.forEach((fact) => {
        if (fact.canonicalText) {
          extractNumbers(fact.canonicalText).forEach((n) => allowed.add(n));
        }
        if (typeof fact.value === 'number') {
          allowed.add(String(fact.value));
        } else if (typeof fact.value === 'string') {
          extractNumbers(fact.value).forEach((n) => allowed.add(n));
        } else if (typeof fact.value === 'object' && fact.value !== null) {
          extractNumbers(JSON.stringify(fact.value)).forEach((n) => allowed.add(n));
        }
      });
    }
  });

  return allowed;
}

/**
 * NumericFactLock:
 * Ensures that no new numeric values or altered clinical parameters were created by the AI.
 */
export function verifyNumericFactLock(
  aiText: string,
  canonicalNarrative: string,
  authorizedFacts: AuthorizedClinicalFacts
): NumericLockResult {
  const authorizedNumbers = extractAuthorizedNumbers(canonicalNarrative, authorizedFacts);
  const aiNumbers = extractNumbers(aiText);

  const unauthorizedNumbers: string[] = [];

  for (const num of aiNumbers) {
    // Check if the number or its normalized form exists in authorized numbers
    const normalized = num.replace(',', '.');
    const hasDirect = authorizedNumbers.has(num) || authorizedNumbers.has(normalized);

    if (!hasDirect) {
      unauthorizedNumbers.push(num);
    }
  }

  const passed = unauthorizedNumbers.length === 0;

  return {
    passed,
    unauthorizedNumbers,
    message: passed
      ? 'Todos os números foram validados e correspondem aos dados autorizados.'
      : `Valores numéricos não autorizados detectados no texto refinado: [${unauthorizedNumbers.join(', ')}].`,
  };
}
