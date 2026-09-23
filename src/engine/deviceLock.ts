import { AuthorizedClinicalFacts } from './types';
import { buildAuthorizedDeviceRegistry } from './authorizedDeviceRegistry';

export interface DeviceLockResult {
  passed: boolean;
  unauthorizedDevices: string[];
  message: string;
}

/**
 * Common clinical invasive & monitoring devices.
 */
export const MONITORED_CLINICAL_DEVICES = [
  { term: 'avp', label: 'Acesso Venoso Periférico (AVP)' },
  { term: 'acesso venoso periferico', label: 'Acesso Venoso Periférico' },
  { term: 'cvc', label: 'Cateter Venoso Central (CVC)' },
  { term: 'cateter venoso central', label: 'Cateter Venoso Central' },
  { term: 'pai', label: 'Pressão Arterial Invasiva (PAI)' },
  { term: 'pressao arterial invasiva', label: 'Pressão Arterial Invasiva' },
  { term: 'picc', label: 'Cateter Central de Inserção Periférica (PICC)' },
  { term: 'cdl', label: 'Cateter Duplo Lúmen (CDL)' },
  { term: 'shilley', label: 'Cateter de Shiley' },
  { term: 'shiley', label: 'Cateter de Shiley' },
  { term: 'tot', label: 'Tubo Orotraqueal (TOT)' },
  { term: 'tubo orotraqueal', label: 'Tubo Orotraqueal' },
  { term: 'traqueostomia', label: 'Traqueostomia (TQT)' },
  { term: 'tqt', label: 'Traqueostomia (TQT)' },
  { term: 'svd', label: 'Sonda Vesical de Demora (SVD)' },
  { term: 'sonda vesical de demora', label: 'Sonda Vesical de Demora' },
  { term: 'sva', label: 'Sonda Vesical de Alívio (SVA)' },
  { term: 'sonda vesical de alivio', label: 'Sonda Vesical de Alívio' },
  { term: 'sne', label: 'Sonda Nasoenteral (SNE)' },
  { term: 'sonda nasoenteral', label: 'Sonda Nasoenteral' },
  { term: 'sng', label: 'Sonda Nasogástrica (SNG)' },
  { term: 'sonda nasogastrica', label: 'Sonda Nasogástrica' },
  { term: 'gtt', label: 'Gastrostomia (GTT)' },
  { term: 'gastrostomia', label: 'Gastrostomia' },
  { term: 'jejunostomia', label: 'Jejunostomia' },
  { term: 'dreno de torax', label: 'Dreno de Tórax' },
  { term: 'dreno de portovac', label: 'Dreno de Portovac' },
  { term: 'dreno de penrose', label: 'Dreno de Penrose' },
  { term: 'dreno', label: 'Dreno' },
  { term: 'derivacao ventricular externa', label: 'DVE' },
  { term: 'derivação ventricular externa', label: 'DVE' },
  { term: 'dve', label: 'DVE' },
  { term: 'mascara de venturi', label: 'Máscara de Venturi' },
  { term: 'cateter nasal', label: 'Cateter Nasal de O2' },
  { term: 'canula nasal', label: 'Cânula Nasal' },
  { term: 'mascara nao reinalante', label: 'Máscara Não Reinalante' },
  { term: 'mascara com reservatorio', label: 'Máscara com Reservatório' },
  { term: 'vni', label: 'VNI' },
  { term: 'swan-ganz', label: 'Cateter de Swan-Ganz' },
  { term: 'swan ganz', label: 'Cateter de Swan-Ganz' },
  { term: 'picco', label: 'Monitorização PiCCO' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * DeviceLock:
 * Verifies that the AI text does not fabricate invasive or monitoring devices.
 * Uses Unified AuthorizedDeviceRegistry to validate against all categories (respiratory, nutrition, elimination, devices).
 */
export function verifyDeviceLock(
  aiText: string,
  authorizedFacts: AuthorizedClinicalFacts
): DeviceLockResult {
  const normalizedAi = normalize(aiText);
  const deviceRegistry = buildAuthorizedDeviceRegistry(authorizedFacts);
  const unauthorizedDevices: string[] = [];

  for (const { term, label } of MONITORED_CLINICAL_DEVICES) {
    const termNorm = normalize(term);
    const regex = new RegExp(`\\b${termNorm}\\b`, 'i');

    if (regex.test(normalizedAi)) {
      // Must be authorized in the unified device registry
      if (!deviceRegistry.isAuthorized(term)) {
        unauthorizedDevices.push(label);
      }
    }
  }

  // Deduplicate
  const uniqueUnauthorized = Array.from(new Set(unauthorizedDevices));
  const passed = uniqueUnauthorized.length === 0;

  return {
    passed,
    unauthorizedDevices: uniqueUnauthorized,
    message: passed
      ? 'Validação de dispositivos clínicos aprovada.'
      : `Dispositivo(s) não autorizado(s) detectado(s) na versão refinada: [${uniqueUnauthorized.join(', ')}].`,
  };
}
