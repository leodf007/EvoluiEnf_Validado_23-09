import { AuthorizedClinicalFacts } from './types';
import { getAllAuthorizedFactIds } from './deterministicNarrativeFactAuditor';

export interface NurseJudgmentLockResult {
  passed: boolean;
  unauthorizedJudgmentTerms: string[];
}

/**
 * Guard that verifies that nursing judgment assertions or private professional evaluations
 * are only present in AI-refined text when backed by explicit authorized clinical facts.
 */
export function verifyNurseJudgmentLock(
  refinedText: string,
  authorizedFacts: AuthorizedClinicalFacts
): NurseJudgmentLockResult {
  const lower = refinedText.toLowerCase();
  const unauthorizedJudgmentTerms: string[] = [];

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

  const protectedJudgmentPatterns: Array<{ regex: RegExp; term: string }> = [
    { regex: /diagn[oó]stico\s+de\s+enfermagem/i, term: 'diagnóstico de enfermagem' },
    { regex: /\bnanda\b/i, term: 'nanda' },
    { regex: /prescri[çc][ãa]o\s+(?:m[ée]dica|de\s+enfermagem)/i, term: 'prescrição de enfermagem/médica' },
    { regex: /prescrev(?:o|e-se|emos)/i, term: 'prescrevo/conduta' },
    { regex: /plano\s+terap[êe]utico\s+futuro/i, term: 'plano terapêutico futuro' },
    { regex: /progn[oó]stico/i, term: 'prognóstico' },
    { regex: /perfus[ãa]o\s+(?:perif[ée]rica\s+)?prejudicada/i, term: 'perfusão prejudicada' },
    { regex: /padr[ãa]o\s+respirat[oó]rio\s+ineficaz/i, term: 'padrão respiratório ineficaz' },
    { regex: /risco\s+aumentado/i, term: 'risco aumentado' },
    { regex: /melhora\s+cl[íi]nica/i, term: 'melhora clínica' },
    { regex: /piora\s+cl[íi]nica/i, term: 'piora clínica' },
    { regex: /resposta\s+satisfat[oó]ria/i, term: 'resposta satisfatória' },
    { regex: /intoler[âa]ncia/i, term: 'intolerância' },
    { regex: /instabilidade\s+hemodin[âa]mica/i, term: 'instabilidade hemodinâmica' },
    { regex: /comprometimento\s+respirat[oó]rio/i, term: 'comprometimento respiratório' },
    { regex: /conclui-se|conclus[ãa]o\s+cl[íi]nica/i, term: 'conclusão clínica' },
    { regex: /piora\s+iminente/i, term: 'piora iminente' },
    { regex: /risco\s+de\s+(?:extuba[çc][ãa]o|aspira[çc][ãa]o|queda|sangramento|infec[çc][ãa]o)/i, term: 'juízo de risco' },
    { regex: /prescrito\b|prescrever|prescreve-se|ordem\s+m[ée]dica/i, term: 'prescrição médica/assistencial' },
  ];

  for (const item of protectedJudgmentPatterns) {
    if (item.regex.test(lower)) {
      // Check if this term was explicitly provided by the nurse in authorized facts
      const authorized = item.regex.test(factCorpus);
      if (!authorized) {
        unauthorizedJudgmentTerms.push(item.term);
      }
    }
  }

  return {
    passed: unauthorizedJudgmentTerms.length === 0,
    unauthorizedJudgmentTerms,
  };
}
