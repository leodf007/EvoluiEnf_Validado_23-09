import { ClinicalEvolutionForm, InvasiveDeviceItem } from '../types/clinical';
import { NarrativeContext } from './types';

/**
 * Standardizes Brazilian Portuguese list joining with oxford-style "e"
 * e.g. ["A", "B", "C"] -> "A, B e C"
 */
export function joinWithAnd(items: string[]): string {
  const clean = items.filter((i) => i && i.trim().length > 0);
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} e ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')} e ${clean[clean.length - 1]}`;
}

/**
 * Ensures a sentence starts with uppercase and ends with a period.
 */
export function formatSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const firstLetter = trimmed.charAt(0).toUpperCase();
  const rest = trimmed.slice(1);
  const withUpper = firstLetter + rest;
  return withUpper.endsWith('.') || withUpper.endsWith('!') || withUpper.endsWith('?')
    ? withUpper
    : `${withUpper}.`;
}

/**
 * Checks if two invasive devices have identical clinical status
 */
export function haveIdenticalDeviceStatus(a: InvasiveDeviceItem, b: InvasiveDeviceItem): boolean {
  return (
    a.permeability === b.permeability &&
    a.functioning === b.functioning &&
    !!a.dressingClean === !!b.dressingClean &&
    !!a.dressingDry === !!b.dressingDry &&
    !!a.dressingIntact === !!b.dressingIntact &&
    a.phlogisticSigns === b.phlogisticSigns &&
    (!a.phlogisticSignsDetails || a.phlogisticSignsDetails === b.phlogisticSignsDetails)
  );
}

/**
 * Helper to build device status phrase
 */
export function buildDeviceStatusDescription(dev: InvasiveDeviceItem, isPlural = false): string {
  const parts: string[] = [];

  const perm = dev.permeability === 'Pérvio' ? 'pérvio' : dev.permeability === 'Não pérvio' ? 'não pérvio' : '';
  const func = dev.functioning === 'Funcionante' ? 'funcionante' : dev.functioning === 'Alterado' ? 'com funcionamento alterado' : '';

  if (perm === 'pérvio' && func === 'funcionante') {
    parts.push(isPlural ? 'ambos pérvios e funcionantes' : 'pérvio e funcionante');
  } else if (perm && func) {
    parts.push(isPlural ? `ambos ${perm}s e ${func}s` : `${perm} e ${func}`);
  } else if (perm) {
    parts.push(isPlural ? `ambos ${perm}s` : perm);
  } else if (func) {
    parts.push(isPlural ? `ambos ${func}s` : func);
  }

  const dressingFlags: string[] = [];
  if (dev.dressingClean) dressingFlags.push('limpo');
  if (dev.dressingDry) dressingFlags.push('seco');
  if (dev.dressingIntact) dressingFlags.push('íntegro');

  if (dressingFlags.length > 0) {
    if (isPlural) {
      const pluralFlags = dressingFlags.map((f) => (f === 'limpo' ? 'limpos' : f === 'seco' ? 'secos' : 'íntegros'));
      const dStr = pluralFlags.length === 3 ? 'limpos, secos e íntegros' : pluralFlags.join(' e ');
      parts.push(`com curativos ${dStr}`);
    } else {
      const dStr = dressingFlags.length === 3 ? 'limpo, seco e íntegro' : dressingFlags.join(' e ');
      parts.push(`com curativo ${dStr}`);
    }
  }

  if (dev.phlogisticSigns === 'Ausentes') {
    parts.push('sem sinais flogísticos');
  } else if (dev.phlogisticSigns === 'Presentes') {
    parts.push(`com sinais flogísticos${dev.phlogisticSignsDetails ? `: ${dev.phlogisticSignsDetails}` : ''}`);
  }

  if (parts.length === 0) return '';
  return parts.join(', ');
}

/**
 * Mapping for nursing care actions
 */
export const NURSING_CARE_TEXT_MAP: Record<string, string> = {
  'Mudança de decúbito de 2/2h': 'realizada mudança de decúbito a cada 2 horas',
  'Cabeceira elevada a 30°-45°': 'mantida cabeceira elevada a 30°-45°',
  'Curativo realizado': 'realizado curativo',
  'Aspiração de vias aéreas': 'realizada aspiração de vias aéreas',
  'Administração de medicamentos conforme prescrição médica': 'administração de medicamentos conforme prescrição médica',
  'Administração de medicações conforme PM': 'administração de medicamentos conforme prescrição médica',
  'Coleta de exames laboratoriais': 'coleta de exames laboratoriais',
  'Instalação/troca de soroterapia': 'instalação/troca de soroterapia',
  'Controle rigoroso de balanço hídrico': 'realizado controle rigoroso do balanço hídrico',
  'Manutenção de grades de proteção elevadas': 'mantidas grades de proteção elevadas',
  'Instalação de oxigenoterapia': 'instalada oxigenoterapia',
  'Sondagem vesical de alívio/demora': 'realizada sondagem vesical',
  'Sondagem nasoenteral/nasogástrica': 'realizada sondagem enteral/gástrica',
};
