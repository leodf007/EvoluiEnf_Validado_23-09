import { AuthorizedClinicalFacts } from './types';

export interface SOAPPlanLockResult {
  passed: boolean;
  message?: string;
  unauthorizedPlanTerms: string[];
}

/**
 * SOAPPlanLock:
 * Prohibits the AI from inventing, prescribing or adding:
 * - New prescriptions or medical/nursing orders (e.g., prescrever, prescreve-se, prescrição médica)
 * - New medications or drug therapies not registered by the nurse (e.g., iniciar antibioticoterapia)
 * - New treatments or therapies (e.g., iniciar oxigenoterapia, iniciar ventilação)
 * - New invasive conducts or procedures (e.g., instalar cateter, realizar punção, solicitar vaga de UTI)
 * 
 * Only care plans, monitoring instructions, orientations and scheduled evaluations
 * explicitly documented by the human nurse in authorized facts are permitted.
 */
export function verifySOAPPlanLock(
  refinedText: string,
  authorizedFacts: AuthorizedClinicalFacts,
  deterministicBaseline?: string
): SOAPPlanLockResult {
  const lower = refinedText.toLowerCase();
  const unauthorizedPlanTerms: string[] = [];

  // Build corpus of authorized text from facts and baseline
  const factCorpusParts: string[] = [];
  if (deterministicBaseline) {
    factCorpusParts.push(deterministicBaseline.toLowerCase());
  }

  Object.values(authorizedFacts).forEach((factList) => {
    if (Array.isArray(factList)) {
      factList.forEach((fact) => {
        if (typeof fact.value === 'string') {
          factCorpusParts.push(fact.value.toLowerCase());
        } else if (Array.isArray(fact.value)) {
          fact.value.forEach((v) => factCorpusParts.push(String(v).toLowerCase()));
        }
        if (fact.canonicalText) {
          factCorpusParts.push(fact.canonicalText.toLowerCase());
        }
      });
    }
  });

  const authorizedCorpus = factCorpusParts.join(' ');

  // Patterns for prohibited AI-generated prescriptions, therapies, and new conducts
  const prohibitedPlanPatterns: Array<{ regex: RegExp; term: string }> = [
    { regex: /iniciar\s+oxigenoterapia/i, term: 'iniciar oxigenoterapia' },
    { regex: /iniciar\s+(?:antibioticoterapia|antibi[oó]tico)/i, term: 'iniciar antibioticoterapia' },
    { regex: /iniciar\s+(?:hidrata[çc][ãa]o|soroterapia|infus[ãa]o\s+venosa)/i, term: 'iniciar hidratação/soroterapia' },
    { regex: /iniciar\s+(?:ventila[çc][ãa]o|vmi|vmni)/i, term: 'iniciar ventilação' },
    { regex: /iniciar\s+(?:droga\s+vasoativa|sedativo|analgesia)/i, term: 'iniciar medicação' },
    { regex: /prescrever\b|prescreve-se|prescrevo/i, term: 'prescrição ativa' },
    { regex: /prescri[çc][ãa]o\s+(?:m[ée]dica|de\s+enfermagem)/i, term: 'prescrição médica/enfermagem' },
    { regex: /solicitar\s+(?:vaga\s+de\s+uti|transfer[êe]ncia\s+para\s+uti)/i, term: 'solicitar vaga de UTI' },
    { regex: /instalar\s+(?:cateter|cvc|sng|sne|svd)/i, term: 'instalar cateter invasivo' },
    { regex: /realizar\s+pun[çc][ãa]o\s+(?:lombar|arterial|venosa\s+profunda)/i, term: 'punção invasiva' },
    { regex: /suspender\s+(?:medica[çc][ãa]o|droga|dieta|f[áa]rmaco)/i, term: 'suspender medicação/dieta' },
    { regex: /aumentar\s+dose\s+de|reduzir\s+dose\s+de/i, term: 'ajuste de dose farmacológica' },
    { regex: /recomenda-se\s+(?:in[íi]cio\s+de|administra[çc][ãa]o\s+de|tratamento\s+com)/i, term: 'recomendação de nova terapia' },
    { regex: /administrar\s+(?:antibi[oó]tico|sedativo|vasopressor|adrenalina|noradrenalina)/i, term: 'administração medicamentosa não autorizada' },
  ];

  for (const item of prohibitedPlanPatterns) {
    if (item.regex.test(lower)) {
      // Check if this plan action was explicitly provided by the nurse in authorizedFacts
      const isAuthorized = item.regex.test(authorizedCorpus);
      if (!isAuthorized) {
        unauthorizedPlanTerms.push(item.term);
      }
    }
  }

  const passed = unauthorizedPlanTerms.length === 0;

  return {
    passed,
    message: passed
      ? undefined
      : `SOAPPlanLock bloqueou planos ou prescrições não autorizados: [${unauthorizedPlanTerms.join(', ')}]. A IA não pode criar prescrições, medicamentos ou condutas novas.`,
    unauthorizedPlanTerms,
  };
}
