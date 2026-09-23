import { AuthorizedClinicalFacts } from './types';

export interface DeviceOriginLockResult {
  passed: boolean;
  message: string;
  violations: string[];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * ExistingVsInstalledDevicesLock:
 * Ensures the AI refinement does NOT transform an existing device into an installed device.
 * e.g., if CVC was an existing device and no CVC was installed during admission,
 * AI cannot say "Realizada instalação de CVC" or "instalado CVC".
 */
export function verifyExistingVsInstalledDevicesLock(
  aiText: string,
  authorizedFacts: AuthorizedClinicalFacts
): DeviceOriginLockResult {
  const normalizedAi = normalize(aiText);
  const violations: string[] = [];

  // Check existing devices vs installed devices in authorizedFacts
  const existingDevFacts = (authorizedFacts as any).existingDevices || [];
  const installedDevFacts = (authorizedFacts as any).installedDevices || [];

  const existingDevNames: string[] = [];
  existingDevFacts.forEach((f: any) => {
    if (f.value?.type) existingDevNames.push(normalize(f.value.type));
    if (f.value?.customType) existingDevNames.push(normalize(f.value.customType));
  });

  const installedDevNames: string[] = [];
  installedDevFacts.forEach((f: any) => {
    if (f.value?.type) installedDevNames.push(normalize(f.value.type));
    if (f.value?.customType) installedDevNames.push(normalize(f.value.customType));
  });

  // Phrases that imply installation/procedure during admission
  const installationTriggers = [
    'instalado',
    'instalada',
    'instalacao de',
    'realizada instalacao',
    'passado',
    'passagem de',
    'puncionado',
    'puncionada',
    'puncao de',
    'inserido',
    'inserida',
    'insercao de',
  ];

  for (const existingName of existingDevNames) {
    // If not also in installedDevNames
    if (!installedDevNames.includes(existingName)) {
      for (const trigger of installationTriggers) {
        // e.g. "instalacao de cvc", "instalado cvc", "puncionado avp"
        const phraseRegex = new RegExp(`\\b${trigger}\\s+(?:o\\s+|a\\s+|de\\s+|do\\s+|da\\s+)?${existingName}\\b`, 'i');
        if (phraseRegex.test(normalizedAi)) {
          violations.push(
            `Dispositivo já presente (${existingName}) foi indevidamente descrito como instalado/procedimento realizado durante a admissão.`
          );
        }
      }
    }
  }

  const passed = violations.length === 0;

  return {
    passed,
    violations,
    message: passed
      ? 'Validação de distinção entre dispositivos presentes e instalados aprovada.'
      : violations.join(' '),
  };
}
