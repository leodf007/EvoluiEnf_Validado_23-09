import { AuthorizedClinicalFacts } from './types';
import { buildAuthorizedMedicationRegistry } from './authorizedMedicationRegistry';

export interface MedicationLockResult {
  passed: boolean;
  unauthorizedMedications: string[];
  message: string;
}

/**
 * Common hospital / emergency / ICU medications to guard against hallucination.
 */
export const COMMON_MONITORED_MEDICATIONS = [
  'noradrenalina',
  'adrenalina',
  'dobutamina',
  'dopamina',
  'vasopressina',
  'nitroprussiato',
  'nitroglicerina',
  'fentanil',
  'midazolam',
  'dormonid',
  'propofol',
  'morfina',
  'precedex',
  'dexmedetomidina',
  'cetamina',
  'quetamina',
  'dipirona',
  'paracetamol',
  'ceftriaxona',
  'vancomicina',
  'meropenem',
  'piperacilina',
  'tazobactam',
  'heparina',
  'enoxaparina',
  'insulina',
  'furosemida',
  'amiodarona',
  'atropina',
  'tramadol',
  'ondansetrona',
  'plasil',
  'metoclopramida',
  'omeprazol',
  'pantoprazol',
  'hidrocortisona',
  'metilprednisolona',
  'dexametasona',
  'cloreto de potassio',
  'gluconato de calcio',
  'sulfato de magnesio',
  'clorexidina',
] as const;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * MedicationLock:
 * Verifies that no unauthorized medications were created in the AI output.
 * Uses Unified AuthorizedMedicationRegistry to prevent inventions and synonym alterations.
 */
export function verifyMedicationLock(
  aiText: string,
  authorizedFacts: AuthorizedClinicalFacts
): MedicationLockResult {
  const normalizedAi = normalize(aiText);
  const medRegistry = buildAuthorizedMedicationRegistry(authorizedFacts);
  const unauthorizedMedications: string[] = [];

  for (const med of COMMON_MONITORED_MEDICATIONS) {
    const medNorm = normalize(med);
    const regex = new RegExp(`\\b${medNorm}\\b`, 'i');

    if (regex.test(normalizedAi)) {
      // Check if authorized in unified medication registry
      if (!medRegistry.isAuthorized(med)) {
        unauthorizedMedications.push(med);
      }
    }
  }

  const passed = unauthorizedMedications.length === 0;

  return {
    passed,
    unauthorizedMedications,
    message: passed
      ? 'Validação de medicamentos autorizados aprovada.'
      : `Medicamento(s) não autorizado(s) detectado(s) na versão refinada: [${unauthorizedMedications.join(', ')}].`,
  };
}
