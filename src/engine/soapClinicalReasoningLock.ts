import { AuthorizedClinicalFacts } from './types';

export interface SOAPClinicalReasoningLockResult {
  passed: boolean;
  message?: string;
  unauthorizedReasoningTerms: string[];
}

/**
 * SOAPClinicalReasoningLock:
 * Prohibits the AI from inventing or inferring:
 * - Medical diagnoses (e.g., insuficiência respiratória, pneumonia, sepse, choque, infarto, crise hipertensiva)
 * - Clinical hypotheses (e.g., hipótese diagnóstica, quadro sugestivo de, suspeita de)
 * - Professional judgments (e.g., julgamento de gravidade, piora iminente, prognóstico)
 * - Causal interpretations (e.g., devido a, em virtude de, secundário a, decorrente de, causado por)
 * - Automated nursing diagnoses (e.g., diagnóstico de enfermagem, padrão respiratório ineficaz, troca de gases prejudicada)
 * 
 * All clinical reasoning and diagnoses must be strictly entered by the human nurse.
 */
export function verifySOAPClinicalReasoningLock(
  refinedText: string,
  authorizedFacts: AuthorizedClinicalFacts,
  deterministicBaseline?: string
): SOAPClinicalReasoningLockResult {
  const lower = refinedText.toLowerCase();
  const unauthorizedReasoningTerms: string[] = [];

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

  // Patterns for prohibited AI-generated clinical reasoning, causal deduction, and diagnosis
  const prohibitedReasoningPatterns: Array<{ regex: RegExp; term: string }> = [
    // Medical diagnoses / Syndromes
    { regex: /insufici[êe]ncia\s+respirat[oó]ria/i, term: 'insuficiência respiratória' },
    { regex: /choque\s+(?:s[ée]ptico|hipovol[êe]mico|cardiog[êe]nico|distributivo)/i, term: 'choque' },
    { regex: /\bsepse\b|\bs[ée]ptico\b/i, term: 'sepse' },
    { regex: /crise\s+hipertensiva/i, term: 'crise hipertensiva' },
    { regex: /infarto(?:\s+agudo)?|\biam\b/i, term: 'infarto/IAM' },
    { regex: /pneumonia\b/i, term: 'pneumonia' },
    { regex: /edema\s+agudo\s+de\s+pulm[ãa]o/i, term: 'edema agudo de pulmão' },
    { regex: /acidente\s+vascular(?:\s+encef[áa]lico|\s+cerebral)?|\bave\b|\bavc\b/i, term: 'AVE/AVC' },
    { regex: /cetoacidose(?:\s+diab[ée]tica)?/i, term: 'cetoacidose' },
    { regex: /fal[êe]ncia\s+(?:org[âa]nica|de\s+m[úu]ltiplos\s+[oó]rg[ãa]os)/i, term: 'falência orgânica' },
    { regex: /quadro\s+infeccioso\s+grave/i, term: 'quadro infeccioso grave' },

    // Diagnostic hypotheses and causal deduction
    { regex: /hip[oó]tese\s+diagn[oó]stica/i, term: 'hipótese diagnóstica' },
    { regex: /diagn[oó]stico\s+m[ée]dico/i, term: 'diagnóstico médico' },
    { regex: /diagn[oó]stico\s+prov[áa]vel/i, term: 'diagnóstico provável' },
    { regex: /sugerindo\s+(?:quadro\s+de|processo|infec[çc][ãa]o|patologia)/i, term: 'sugestão diagnóstica' },
    { regex: /compat[íi]vel\s+com\s+(?:infec[çc][ãa]o|sepse|choque|doen[çc]a|quadro)/i, term: 'compatibilidade diagnóstica' },
    { regex: /indicativo\s+de\s+(?:gravidade|fal[êe]ncia|patologia|descompensa[çc][ãa]o)/i, term: 'indicativo diagnóstico' },
    { regex: /devido\s+[aà]\s+(?:descompensa[çc][ãa]o|fal[êe]ncia|gravidade|infec[çc][ãa]o|piora)/i, term: 'dedução causal (devido a)' },
    { regex: /decorrente\s+de\s+(?:quadro|patologia|fal[êe]ncia|gravidade|infec[çc][ãa]o)/i, term: 'dedução causal (decorrente de)' },
    { regex: /causado\s+por\s+(?:infec[çc][ãa]o|patologia|fal[êe]ncia|gravidade)/i, term: 'dedução causal (causado por)' },
    { regex: /secund[áa]rio\s+a\s+(?:quadro|infec[çc][ãa]o|processo)/i, term: 'dedução causal (secundário a)' },
    { regex: /conclui-se\s+que/i, term: 'conclusão interpretativa' },
    { regex: /interpreta-se\s+como/i, term: 'interpretação causal' },

    // Automated nursing diagnoses (must only appear if entered by human nurse)
    { regex: /diagn[oó]stico\s+de\s+enfermagem/i, term: 'diagnóstico de enfermagem' },
    { regex: /padr[ãa]o\s+respirat[oó]rio\s+ineficaz/i, term: 'padrão respiratório ineficaz' },
    { regex: /troca\s+de\s+gases\s+prejudicada/i, term: 'troca de gases prejudicada' },
    { regex: /d[ée]bito\s+card[íi]aco\s+diminu[íi]do/i, term: 'débito cardíaco diminuído' },
    { regex: /perfus[ãa]o\s+tissular\s+ineficaz/i, term: 'perfusão tissular ineficaz' },
    { regex: /integridade\s+da\s+pele\s+prejudicada/i, term: 'integridade da pele prejudicada' },
    { regex: /volume\s+de\s+l[íi]quidos\s+deficiente/i, term: 'volume de líquidos deficiente' },
    { regex: /\bnanda\b/i, term: 'nanda' },
  ];

  for (const item of prohibitedReasoningPatterns) {
    if (item.regex.test(lower)) {
      // Check if this concept was explicitly registered by the nurse in authorizedFacts
      const isAuthorized = item.regex.test(authorizedCorpus);
      if (!isAuthorized) {
        unauthorizedReasoningTerms.push(item.term);
      }
    }
  }

  const passed = unauthorizedReasoningTerms.length === 0;

  return {
    passed,
    message: passed
      ? undefined
      : `SOAPClinicalReasoningLock bloqueou termos ou raciocínios clínicos não autorizados: [${unauthorizedReasoningTerms.join(', ')}]. A IA não pode inferir diagnósticos, hipóteses ou causas.`,
    unauthorizedReasoningTerms,
  };
}
