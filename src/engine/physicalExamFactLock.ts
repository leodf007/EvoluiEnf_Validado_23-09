import { AuthorizedClinicalFacts } from './types';

export interface PhysicalExamFactLockResult {
  passed: boolean;
  unauthorizedExamFindings: string[];
}

/**
 * Guard that verifies that physical exam findings (pulmonary auscultation, cardiac auscultation,
 * abdomen/RHA, pupils, motor deficits, edema, lesions) are strictly grounded in authorized facts.
 */
export function verifyPhysicalExamFactLock(
  refinedText: string,
  authorizedFacts: AuthorizedClinicalFacts
): PhysicalExamFactLockResult {
  const lower = refinedText.toLowerCase();
  const unauthorizedExamFindings: string[] = [];

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

  const physicalExamChecks: Array<{ pattern: RegExp; term: string }> = [
    // Pulmonary Auscultation
    { pattern: /murm[uú]rio\s+vesicular/i, term: 'murmúrio vesicular' },
    { pattern: /\broncos\b/i, term: 'roncos' },
    { pattern: /\bsibilos\b/i, term: 'sibilos' },
    { pattern: /estertores(?:\s+(?:finos|grossos))?/i, term: 'estertores' },
    { pattern: /\bestridor\b/i, term: 'estridor' },
    { pattern: /ru[íi]dos\s+advent[íi]cios/i, term: 'ruídos adventícios' },

    // Cardiac Auscultation
    { pattern: /bulhas\s+(?:normofon[ée]ticas|hipofon[ée]ticas|normorr[íi]tmicas)/i, term: 'bulhas cardíacas' },
    { pattern: /ritmo\s+em\s+(?:2|dois)\s+tempos|2t|3t/i, term: 'tempos cardíacos (2T/3T)' },
    { pattern: /\bsopros?\b/i, term: 'sopros cardíacos' },

    // Abdomen & RHA
    { pattern: /ru[íi]dos\s+hidroa[ée]reos|\brha\b/i, term: 'ruídos hidroaéreos (RHA)' },
    { pattern: /descompress[ãa]o\s+brusca/i, term: 'descompressão brusca' },

    // Neurological
    { pattern: /pupilas\s+(?:isoc[oó]ricas|anisoc[oó]ricas|mi[oó]ticas|midri[áa]ticas)/i, term: 'exame pupilar' },
    { pattern: /fotorreagentes|fotorrea[çc][ãa]o/i, term: 'fotorreação pupilar' },

    // Edema & Lesions
    { pattern: /edema\s+(?:em|de|\d\+\/4\+)/i, term: 'edema periférico' },
  ];

  for (const check of physicalExamChecks) {
    if (check.pattern.test(lower)) {
      const isAuthorized = check.pattern.test(factCorpus);
      if (!isAuthorized) {
        unauthorizedExamFindings.push(check.term);
      }
    }
  }

  return {
    passed: unauthorizedExamFindings.length === 0,
    unauthorizedExamFindings,
  };
}
