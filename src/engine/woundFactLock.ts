import { AuthorizedClinicalFacts } from './types';

export interface WoundFactLockResult {
  passed: boolean;
  message: string;
  unauthorizedWoundTerms: string[];
  details: {
    unauthorizedInfection: string[];
    unauthorizedNecrosis: string[];
    unauthorizedStaging: string[];
    unauthorizedDepth: string[];
    unauthorizedSeverity: string[];
    unauthorizedPrognosis: string[];
    unauthorizedEtiology: string[];
    unauthorizedTherapeuticIndication: string[];
  };
}

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * WoundFactLock
 * Enforces strict boundaries on wound assessment text.
 * Strictly prevents AI from inventing or generating:
 * - Infecção ("ferida infectada", "infecção", "sinais de infecção", "processo infeccioso") unless recorded by nurse.
 * - Necrose if not documented by nurse in bed facts.
 * - Estadiamento / estágio if not explicitly recorded by nurse.
 * - Profundidade if not measured/recorded.
 * - Interpretação de gravidade ("lesão grave", "alta gravidade", "severidade").
 * - Cicatrização esperada / prognóstico ("prognóstico de cicatrização", "cicatrização esperada em X dias", etc.).
 */
export function verifyWoundFactLock(
  fullRefinedText: string,
  authorizedFacts: AuthorizedClinicalFacts,
  deterministicBaseline: string = ''
): WoundFactLockResult {
  const normRefined = normalizeText(fullRefinedText);
  const normBaseline = normalizeText(deterministicBaseline);

  // Collect authorized strings
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

  const unauthorizedInfection: string[] = [];
  const unauthorizedNecrosis: string[] = [];
  const unauthorizedStaging: string[] = [];
  const unauthorizedDepth: string[] = [];
  const unauthorizedSeverity: string[] = [];
  const unauthorizedPrognosis: string[] = [];
  const unauthorizedEtiology: string[] = [];
  const unauthorizedTherapeuticIndication: string[] = [];

  // 1. Infecção
  const infectionPatterns = [
    /\bferida\s+infectada\b/g,
    /\binfeccao\s+local\b/g,
    /\binfeccao\s+bacteriana\b/g,
    /\bquadro\s+infeccioso\b/g,
    /\bprocesso\s+infeccioso\b/g,
    /\bcolonizacao\s+critica\b/g,
    /\bsinais\s+de\s+infeccao\b/g,
    /\bapresenta\s+infeccao\b/g,
    /\bcom\s+infeccao\b/g,
  ];

  for (const pattern of infectionPatterns) {
    const matches = normRefined.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!allAuthorizedCorpus.includes(match)) {
          unauthorizedInfection.push(match);
        }
      }
    }
  }

  // 2. Necrose (se não registrada nos fatos)
  const necrosisAllowed =
    allAuthorizedCorpus.includes('necrose') ||
    allAuthorizedCorpus.includes('necrotico') ||
    allAuthorizedCorpus.includes('escara');

  if (!necrosisAllowed) {
    const necrosisPatterns = [
      /\btecido\s+necrotico\b/g,
      /\bnecrose\b/g,
      /\bescara\s+necrotica\b/g,
      /\barea\s+de\s+necrose\b/g,
    ];
    for (const pattern of necrosisPatterns) {
      const matches = normRefined.match(pattern);
      if (matches) {
        for (const match of matches) {
          unauthorizedNecrosis.push(match);
        }
      }
    }
  }

  // 3. Estadiamento inventado pela IA
  const stages = [
    'estagio 1',
    'estagio 2',
    'estagio 3',
    'estagio 4',
    'estagio i',
    'estagio ii',
    'estagio iii',
    'estagio iv',
    'lesao tissular profunda',
    'nao classificavel',
  ];

  for (const stage of stages) {
    if (normRefined.includes(stage)) {
      if (!allAuthorizedCorpus.includes(stage)) {
        unauthorizedStaging.push(`Classificação/estágio não autorizado: "${stage}"`);
      }
    }
  }

  // 4. Profundidade inventada (se não registrada)
  const depthAllowed =
    allAuthorizedCorpus.includes('profundidade') ||
    /\bdepth\b/i.test(allAuthorizedCorpus);

  // Check if depth fact has an actual value
  let hasActualDepth = false;
  const measurementFacts = authorizedFacts.woundMeasurements || authorizedFacts.measurements || [];
  for (const f of measurementFacts) {
    if (f.value && typeof f.value === 'object') {
      const d = (f.value as any).depthCm;
      if (d && String(d).trim() !== '' && String(d).trim() !== '0') {
        hasActualDepth = true;
      }
    } else if (f.value && typeof f.value === 'string' && f.value.includes('profundidade')) {
      hasActualDepth = true;
    }
  }

  if (!hasActualDepth) {
    const depthPatterns = [
      /\bprofundidade\s+de\s+\d+/g,
      /\bcom\s+\d+(\.\d+)?\s*cm\s+de\s+profundidade\b/g,
      /\blesao\s+profunda\b/g,
    ];
    for (const pattern of depthPatterns) {
      const matches = normRefined.match(pattern);
      if (matches) {
        for (const match of matches) {
          unauthorizedDepth.push(match);
        }
      }
    }
  }

  // 5. Gravidade não informada
  const severityPatterns = [
    /\bquadro\s+grave\b/g,
    /\blesao\s+gravissima\b/g,
    /\balta\s+gravidade\b/g,
    /\bgravidade\s+elevada\b/g,
    /\bseveridade\s+acentuada\b/g,
    /\balto\s+risco\s+de\s+amputacao\b/g,
    /\brisco\s+iminente\b/g,
  ];

  for (const pattern of severityPatterns) {
    const matches = normRefined.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!allAuthorizedCorpus.includes(match)) {
          unauthorizedSeverity.push(match);
        }
      }
    }
  }

  // 6. Cicatrização esperada e prognóstico
  const prognosisPatterns = [
    /\bcicatrizacao\s+esperada\b/g,
    /\bprevisao\s+de\s+cicatrizacao\b/g,
    /\btempo\s+estimado\s+de\s+cicatrizacao\b/g,
    /\btempo\s+estimado\s+de\s+cura\b/g,
    /\bexpectativa\s+de\s+cura\b/g,
    /\b(?:bom|excelente|mau|favoravel|desfavoravel)?\s*prognostico(?:\s+de\s+cicatrizacao)?\b/g,
    /\bprognostico\b/g,
    /\bcicatrizara\s+em\b/g,
    /\bexpectativa\s+de\s+fechamento\b/g,
  ];

  for (const pattern of prognosisPatterns) {
    const matches = normRefined.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!allAuthorizedCorpus.includes(match)) {
          unauthorizedPrognosis.push(match);
        }
      }
    }
  }

  // 7. Causa / etiologia da lesão deduzida automaticamente pela IA
  const etiologyPatterns = [
    /\bcausada\s+por\b/g,
    /\bcausado\s+por\b/g,
    /\bdecorrente\s+de\b/g,
    /\bforcas\s+de\s+friccao\b/g,
    /\bforca\s+de\s+cisalhamento\b/g,
    /\betiologia\s+decorrente\b/g,
    /\bcausa\s+primaria\b/g,
    /\bneuropatia\s+motora\b/g,
  ];

  for (const pattern of etiologyPatterns) {
    const matches = normRefined.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!allAuthorizedCorpus.includes(match)) {
          unauthorizedEtiology.push(match);
        }
      }
    }
  }

  // 8. Indicação terapêutica / prescrição automática não registrada pelo enfermeiro
  const therapeuticPatterns = [
    /\bindica-se\b/g,
    /\bindicacao\s+de\b/g,
    /\brecomenda-se\s+debridamento\b/g,
    /\bdebridamento\s+cirurgico\b/g,
    /\boxigenoterapia\s+hiperbarica\b/g,
    /\bterapia\s+de\s+pressao\s+negativa\b/g,
    /\bprescreve-se\b/g,
    /\bsugere-se\s+uso\s+de\b/g,
  ];

  for (const pattern of therapeuticPatterns) {
    const matches = normRefined.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!allAuthorizedCorpus.includes(match)) {
          unauthorizedTherapeuticIndication.push(match);
        }
      }
    }
  }

  const unauthorizedWoundTerms = [
    ...unauthorizedInfection,
    ...unauthorizedNecrosis,
    ...unauthorizedStaging,
    ...unauthorizedDepth,
    ...unauthorizedSeverity,
    ...unauthorizedPrognosis,
    ...unauthorizedEtiology,
    ...unauthorizedTherapeuticIndication,
  ];

  const passed = unauthorizedWoundTerms.length === 0;

  return {
    passed,
    message: passed
      ? 'WoundFactLock: Conformidade estrita com fatos da lesão confirmada. Zero inferência de infecção, necrose, estágio ou prognóstico.'
      : `WoundFactLock: Violação detectada. Termos não autorizados: ${unauthorizedWoundTerms.join(', ')}`,
    unauthorizedWoundTerms,
    details: {
      unauthorizedInfection,
      unauthorizedNecrosis,
      unauthorizedStaging,
      unauthorizedDepth,
      unauthorizedSeverity,
      unauthorizedPrognosis,
      unauthorizedEtiology,
      unauthorizedTherapeuticIndication,
    },
  };
}
