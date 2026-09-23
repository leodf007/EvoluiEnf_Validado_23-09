import { AuthorizedClinicalFacts } from './types';

export interface OriginFactLockResult {
  passed: boolean;
  unauthorizedOrigins: string[];
  message: string;
}

const MONITORED_ORIGIN_TERMS = [
  { term: 'samu', label: 'SAMU' },
  { term: 'corpo de bombeiros', label: 'Corpo de Bombeiros' },
  { term: 'bombeiros', label: 'Bombeiros' },
  { term: 'upa', label: 'UPA' },
  { term: 'unidade basica de saude', label: 'Unidade Básica de Saúde' },
  { term: 'ubs', label: 'UBS' },
  { term: 'ambulancia particular', label: 'Ambulância Particular' },
  { term: 'ambulancia', label: 'Ambulância' },
  { term: 'transferencia inter-hospitalar', label: 'Transferência Inter-hospitalar' },
  { term: 'instituicao de longa permanencia', label: 'Instituição de Longa Permanência' },
  { term: 'apos estabilizacao', label: 'Após estabilização (inferência não autorizada)' },
  { term: 'estabilizado em', label: 'Estabilizado em (inferência não autorizada)' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * OriginFactLock:
 * Verifies that AI refinement does not introduce fabricated origins,
 * unauthorized transport services, or inferred clinical status ("após estabilização").
 */
export function verifyOriginFactLock(
  aiText: string,
  authorizedFacts: AuthorizedClinicalFacts
): OriginFactLockResult {
  const normalizedAi = normalize(aiText);
  const normalizedFacts = normalize(JSON.stringify(authorizedFacts));

  const unauthorizedOrigins: string[] = [];

  for (const { term, label } of MONITORED_ORIGIN_TERMS) {
    const termNorm = normalize(term);
    const regex = new RegExp(`\\b${termNorm}\\b`, 'i');

    if (regex.test(normalizedAi)) {
      // Must be present in authorized facts
      if (!regex.test(normalizedFacts)) {
        unauthorizedOrigins.push(label);
      }
    }
  }

  const uniqueUnauthorized = Array.from(new Set(unauthorizedOrigins));
  const passed = uniqueUnauthorized.length === 0;

  return {
    passed,
    unauthorizedOrigins: uniqueUnauthorized,
    message: passed
      ? 'Validação de procedência e transporte aprovada.'
      : `Dado de procedência/transporte não autorizado detectado na versão refinada: [${uniqueUnauthorized.join(', ')}].`,
  };
}
