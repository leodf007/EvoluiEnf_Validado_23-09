import { AuthorizedClinicalFacts } from './types';

export interface DressingActionLockResult {
  passed: boolean;
  message: string;
  unauthorizedDressingItems: string[];
  details: {
    unauthorizedCoverings: string[];
    unauthorizedProducts: string[];
    unauthorizedTechniques: string[];
    unauthorizedPerformedAssertion: string[];
  };
}

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * DressingActionLock
 * Prevents AI from fabricating:
 * - Coberturas terapêuticas não utilizadas
 * - Produtos, soluções ou pomadas não informados pelo enfermeiro
 * - Técnicas não realizadas (ex.: desbridamento cortante, autolítico, mecânico, curativo a vácuo)
 * - Afirmação de curativo realizado quando o enfermeiro assinalou que não foi realizado
 */
export function verifyDressingActionLock(
  fullRefinedText: string,
  authorizedFacts: AuthorizedClinicalFacts,
  deterministicBaseline: string = ''
): DressingActionLockResult {
  const normRefined = normalizeText(fullRefinedText);
  const normBaseline = normalizeText(deterministicBaseline);

  // Collect authorized text
  const authorizedTexts: string[] = [];
  if (normBaseline) {
    authorizedTexts.push(normBaseline);
  }

  for (const [, category] of Object.entries(authorizedFacts)) {
    if (Array.isArray(category)) {
      for (const fact of category) {
        if (fact.value) {
          if (typeof fact.value === 'string') {
            authorizedTexts.push(normalizeText(fact.value));
          } else if (typeof fact.value === 'object') {
            authorizedTexts.push(normalizeText(JSON.stringify(fact.value)));
          }
        }
        if (fact.canonicalText) {
          authorizedTexts.push(normalizeText(fact.canonicalText));
        }
      }
    }
  }

  const allAuthorizedCorpus = authorizedTexts.join(' ');

  const unauthorizedCoverings: string[] = [];
  const unauthorizedProducts: string[] = [];
  const unauthorizedTechniques: string[] = [];
  const unauthorizedPerformedAssertion: string[] = [];

  // Known coverings and products to monitor
  const monitoredProducts = [
    { pattern: /\bhidrocoloide\b/g, label: 'Hidrocolóide' },
    { pattern: /\balginato\s*(de\s*calcio)?\b/g, label: 'Alginato de cálcio' },
    { pattern: /\bhidrogel\b/g, label: 'Hidrogel' },
    { pattern: /\bespuma\s*(de\s*poliuretano)?\b/g, label: 'Espuma de poliuretano' },
    { pattern: /\bcarvao\s*ativado\b/g, label: 'Carvão ativado' },
    { pattern: /\bprata\s*(nanocristalina)?\b/g, label: 'Prata / Cobertura com prata' },
    { pattern: /\bcolagenase\b/g, label: 'Colagenase' },
    { pattern: /\bpapaina\b/g, label: 'Papaína' },
    { pattern: /\bsulfadiazina\s*(de\s*prata)?\b/g, label: 'Sulfadiazina de prata' },
    { pattern: /\bbota\s*de\s*unna\b/g, label: 'Bota de Unna' },
    { pattern: /\bfilme\s*transparente\b/g, label: 'Filme transparente' },
    { pattern: /\bcurativo\s*(a\s*|por\s*)vacuo\b/g, label: 'Curativo a vácuo / TPN' },
    { pattern: /\bterapia\s*por\s*pressao\s*negativa\b/g, label: 'Terapia por pressão negativa' },
    { pattern: /\bpoliexanida\b|\bphmb\b/g, label: 'PHMB / Polihexanida' },
    { pattern: /\baqua\s*cel\b|\baquacel\b/g, label: 'Aquacel' },
    { pattern: /\bmeplilex\b|\bmepilex\b/g, label: 'Mepilex' },
  ];

  for (const item of monitoredProducts) {
    const matches = normRefined.match(item.pattern);
    if (matches) {
      // Check if this pattern or label was authorized
      const normLabel = normalizeText(item.label);
      const isAuthorized =
        allAuthorizedCorpus.includes(normalizeText(matches[0])) ||
        allAuthorizedCorpus.includes(normLabel.split('/')[0].trim());

      if (!isAuthorized) {
        unauthorizedProducts.push(`Produto/cobertura não informado: "${item.label}"`);
      }
    }
  }

  // Monitored unperformed surgical / aggressive techniques
  const monitoredTechniques = [
    { pattern: /\bdesbridamento\s*cirurgico\b/g, label: 'Desbridamento cirúrgico' },
    { pattern: /\bdesbridamento\s*cortante\b/g, label: 'Desbridamento cortante' },
    { pattern: /\bdesbridamento\s*instrumental\b/g, label: 'Desbridamento instrumental' },
    { pattern: /\bdesbridamento\s*autolitico\b/g, label: 'Desbridamento autolítico' },
    { pattern: /\bdesbridamento\s*enzimatico\b/g, label: 'Desbridamento enzimático' },
    { pattern: /\bdesbridamento\s*mecanico\b/g, label: 'Desbridamento mecânico' },
    { pattern: /\bincisao\s*e\s*drenagem\b/g, label: 'Incisão e drenagem' },
  ];

  for (const tech of monitoredTechniques) {
    const matches = normRefined.match(tech.pattern);
    if (matches) {
      const isAuthorized =
        allAuthorizedCorpus.includes(normalizeText(matches[0])) ||
        allAuthorizedCorpus.includes(normalizeText(tech.label));

      if (!isAuthorized) {
        unauthorizedTechniques.push(`Técnica não realizada/informada: "${tech.label}"`);
      }
    }
  }

  // Check if dressing was performed vs not performed
  const dressingFacts = authorizedFacts.dressingProcedure || [];
  let dressingWasPerformed = false;
  for (const f of dressingFacts) {
    if (f.value && typeof f.value === 'object') {
      if ((f.value as any).performed === 'Sim') {
        dressingWasPerformed = true;
      }
    } else if (f.canonicalText && f.canonicalText.includes('Curativo realizado: Sim')) {
      dressingWasPerformed = true;
    }
  }

  if (!dressingWasPerformed) {
    const performedAssertions = [
      /\bcurativo\s+realizado\b/g,
      /\brealizado\s+curativo\b/g,
      /\bprocedido\s+curativo\b/g,
      /\bexecutado\s+curativo\b/g,
      /\bfeita\s+limpeza\s+da\s+lesao\b/g,
    ];

    for (const pat of performedAssertions) {
      if (pat.test(normRefined) && !pat.test(allAuthorizedCorpus)) {
        unauthorizedPerformedAssertion.push(
          'Afirmação de curativo realizado, quando registrado como Não realizado.'
        );
        break;
      }
    }
  }

  const unauthorizedDressingItems = [
    ...unauthorizedCoverings,
    ...unauthorizedProducts,
    ...unauthorizedTechniques,
    ...unauthorizedPerformedAssertion,
  ];

  const passed = unauthorizedDressingItems.length === 0;

  return {
    passed,
    message: passed
      ? 'DressingActionLock: Conformidade estrita com coberturas, produtos e técnicas registrada. Nenhuma intervenção inventada.'
      : `DressingActionLock: Violação detectada: ${unauthorizedDressingItems.join('; ')}`,
    unauthorizedDressingItems,
    details: {
      unauthorizedCoverings,
      unauthorizedProducts,
      unauthorizedTechniques,
      unauthorizedPerformedAssertion,
    },
  };
}
