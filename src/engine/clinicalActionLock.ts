import { AuthorizedClinicalFacts } from './types';
import { AuthorizedClinicalActionRegistry } from './authorizedClinicalActionRegistry';

export interface ClinicalActionLockResult {
  passed: boolean;
  unauthorizedActions: string[];
  message: string;
}

export const MONITORED_CARE_ACTIONS = [
  { term: 'aspiracao', label: 'Aspiração de vias aéreas' },
  { term: 'aspiradas vias aereas', label: 'Aspiração de vias aéreas' },
  { term: 'mudanca de decubito', label: 'Mudança de decúbito' },
  { term: 'mudanca de posicao', label: 'Mudança de posição' },
  { term: 'revezamento de decubito', label: 'Revezamento de decúbito' },
  { term: 'banho no leito', label: 'Banho no leito' },
  { term: 'banho de aspersao', label: 'Banho de aspersão' },
  { term: 'higiene oral', label: 'Higiene oral' },
  { term: 'higiene intima', label: 'Higiene íntima' },
  { term: 'curativo realizado', label: 'Realização de curativo' },
  { term: 'troca de curativo', label: 'Troca de curativo' },
  { term: 'coleta de exames', label: 'Coleta de exames laboratoriais' },
  { term: 'balanco hidrico', label: 'Balanço hídrico' },
  { term: 'nebulizacao', label: 'Inalação / Nebulização' },
  { term: 'administracao de medicacao', label: 'Administração de medicação' },
  { term: 'hemodialise', label: 'Hemodiálise' },
  { term: 'hemodialise venovenosa', label: 'Hemodiálise venovenosa contínua' },
  { term: 'prescrito', label: 'Prescrição / Ordem terapêutica' },
  { term: 'prescricao', label: 'Prescrição' },
  { term: 'cristaloides', label: 'Infusão de cristaloides' },
  { term: 'ordem medica', label: 'Ordem médica' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * ClinicalActionLock:
 * Ensures the AI doesn't fabricate assistential procedures or actions not recorded by the nursing staff.
 * Utilizes AuthorizedClinicalActionRegistry for comprehensive tracking.
 */
export function verifyClinicalActionLock(
  aiText: string,
  authorizedFacts: AuthorizedClinicalFacts
): ClinicalActionLockResult {
  const normalizedAi = normalize(aiText);
  const registry = new AuthorizedClinicalActionRegistry(authorizedFacts);
  const careFacts = authorizedFacts.care || authorizedFacts.nursingCare || [];
  const bathFacts = authorizedFacts.bath || [];
  const skinFacts = authorizedFacts.skin || authorizedFacts.integumentary || [];
  const allCareFacts = [...careFacts, ...bathFacts, ...skinFacts];

  const normalizedCare = normalize(JSON.stringify(allCareFacts));

  const unauthorizedActions: string[] = [];

  for (const { term, label } of MONITORED_CARE_ACTIONS) {
    const termNorm = normalize(term);
    const regex = new RegExp(`\\b${termNorm}\\b`, 'i');

    if (regex.test(normalizedAi)) {
      const isAuthInRegistry = registry.isActionAuthorized(term);
      const isAuthInFacts = regex.test(normalizedCare);
      if (!isAuthInRegistry && !isAuthInFacts) {
        unauthorizedActions.push(label);
      }
    }
  }

  const uniqueActions = Array.from(new Set(unauthorizedActions));
  const passed = uniqueActions.length === 0;

  return {
    passed,
    unauthorizedActions: uniqueActions,
    message: passed
      ? 'Ações assistenciais validadas com sucesso.'
      : `Procedimento(s) ou cuidado(s) não registrado(s) detectado(s): [${uniqueActions.join(', ')}].`,
  };
}
