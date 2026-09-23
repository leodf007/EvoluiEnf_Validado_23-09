import { AuthorizedClinicalFacts } from './types';

export interface UnauthorizedTermsLockResult {
  passed: boolean;
  detectedForbiddenTerms: string[];
  message: string;
}

/**
 * List of derived clinical interpretations, diagnostic labels, and clinical classifications
 * that AI MUST NEVER introduce unless explicitly authorized in the source facts.
 */
export const FORBIDDEN_DERIVED_CLINICAL_TERMS = [
  'febril',
  'afebril',
  'hipertenso',
  'hipertensa',
  'hipotenso',
  'hipotensa',
  'normotenso',
  'normotensa',
  'hipertensao',
  'hipertensão',
  'hipotensao',
  'hipotensão',
  'taquicardico',
  'taquicárdico',
  'taquicardica',
  'taquicárdica',
  'bradicardico',
  'bradicárdico',
  'bradicardica',
  'bradicárdica',
  'taquicardia',
  'bradicardia',
  'hipoxemico',
  'hipoxêmico',
  'hipoxemica',
  'hipoxêmica',
  'hipoxico',
  'hipóxico',
  'hipoxica',
  'hipóxica',
  'hipoxemia',
  'hipoxia',
  'estavel',
  'estável',
  'instavel',
  'instável',
  'estabilidade',
  'instabilidade',
  'grave',
  'gravidade',
  'septico',
  'séptico',
  'septica',
  'séptica',
  'sepse',
  'desidratado',
  'desidratada',
  'desidratacao',
  'desidratação',
  'rebaixamento neurologico',
  'rebaixamento neurológico',
  'rebaixamento',
  'insuficiencia respiratoria',
  'insuficiência respiratória',
  'eupneico',
  'eupneica',
  'dispneico',
  'dispneica',
  'taquipneico',
  'taquipneica',
  'bradipneico',
  'bradipneica',
  // Physical exam hallucinations without source facts (NUR-REG-001 to NUR-REG-005)
  'bulhas normofoneticas',
  'bulhas normofonéticas',
  'bulhas normorritmicas',
  'bulhas normorrítmicas',
  'ritmo em 2 tempos',
  'sopros ausentes',
  'sem sopros',
  'murmurio vesicular presente',
  'murmúrio vesicular presente',
  'ruidos adventicios ausentes',
  'ruídos adventícios ausentes',
  'sem ruidos adventicios',
  'sem ruídos adventícios',
  'plano de cuidados',
  // Surgical complications / diagnoses prohibited for technician unless explicitly present in facts
  'deiscencia',
  'deiscência',
  'infeccao',
  'infecção',
  'choque',
  'hemorragia',
  'evisceracao',
  'evisceração',
  'peritonite',
  'hipotese diagnostica',
  'hipótese diagnóstica',
  'diagnostico medico',
  'diagnóstico médico',
  'febre',
  'hipotermia',
  'encefalopatia',
  'lesao de orgao',
  'lesão de órgão',
] as const;

/**
 * Normalizes text for term comparison (lowercase, removes excess spaces, removes accents if needed).
 */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * UnauthorizedTermsLock:
 * Checks if the AI introduced forbidden derived clinical classifications that did not exist
 * in the authorized facts or deterministic text.
 */
export function verifyUnauthorizedTermsLock(
  aiText: string,
  canonicalNarrative: string,
  authorizedFacts: AuthorizedClinicalFacts
): UnauthorizedTermsLockResult {
  const normalizedAi = normalizeForSearch(aiText);
  const normalizedSource = normalizeForSearch(
    `${canonicalNarrative} ${JSON.stringify(authorizedFacts)}`
  );

  const detectedForbiddenTerms: string[] = [];

  for (const rawTerm of FORBIDDEN_DERIVED_CLINICAL_TERMS) {
    const term = normalizeForSearch(rawTerm);
    const regex = new RegExp(`\\b${term}\\b`, 'i');

    if (regex.test(normalizedAi)) {
      // Check if this term was already present in the authorized source
      if (!regex.test(normalizedSource)) {
        detectedForbiddenTerms.push(rawTerm);
      }
    }
  }

  const passed = detectedForbiddenTerms.length === 0;

  return {
    passed,
    detectedForbiddenTerms,
    message: passed
      ? 'Nenhum termo derivado ou diagnóstico não autorizado foi detectado.'
      : `Termos clínicos não autorizados foram introduzidos pela IA: [${detectedForbiddenTerms.join(', ')}].`,
  };
}
