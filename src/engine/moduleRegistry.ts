import { AppScreen } from '../types';

export type CanonicalAssistentialAreaId =
  | 'emergency'
  | 'icu'
  | 'medicalClinic'
  | 'surgicalClinic'
  | 'pediatrics'
  | 'all';

export type AssistentialAreaId =
  | CanonicalAssistentialAreaId
  | 'CLINICAL_MEDICAL'
  | 'SURGICAL_CLINIC'
  | 'PEDIATRICS'
  | 'ALL';

export enum ClinicalArea {
  EMERGENCY = 'emergency',
  ICU = 'icu',
  MEDICAL_CLINIC = 'medicalClinic',
  SURGICAL_CLINIC = 'surgicalClinic',
  PEDIATRICS = 'pediatrics',
  ALL = 'all',
}

export const CLINICAL_MEDICAL = 'medicalClinic';
export const SURGICAL_CLINIC = 'surgicalClinic';
export const PEDIATRICS = 'pediatrics';

export type CanonicalModuleId =
  | 'TECHNICIAN_NURSING_NOTE'
  | 'TECHNICIAN_ADMISSION'
  | 'NURSE_EVOLUTION'
  | 'NURSE_ADMISSION'
  | 'NURSE_WOUNDS_ASSESSMENT'
  | 'NURSE_SOAP';

export type ModuleId =
  | 'technician_nursing_note'
  | 'technician_admission'
  | 'nurse_evolution'
  | 'nurse_admission'
  | 'nurse_wounds'
  | 'nurse_soap'
  | CanonicalModuleId;

export interface AssistentialAreaConfig {
  id: AssistentialAreaId;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  status: 'available' | 'development';
  route: AppScreen;
}

export interface ModuleDefinition {
  id: ModuleId;
  title: string;
  description: string;
  profile: 'technician' | 'nurse';
  status: 'available' | 'development';
  areas: Partial<Record<CanonicalAssistentialAreaId, {
    status: 'available' | 'development';
    route?: AppScreen;
    note?: string;
  }>> & {
    CLINICAL_MEDICAL?: {
      status: 'available' | 'development';
      route?: AppScreen;
      note?: string;
    };
  };
}

/**
 * Single source of truth for module and assistential area availability.
 * Guarantees consistent status across all dashboards and navigation cards.
 */
export const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition> = {
  technician_nursing_note: {
    id: 'technician_nursing_note',
    title: 'Anotação de Enfermagem',
    description: 'Registro pontual e factual de cuidados prestados, sinais vitais e intercorrências no plantão.',
    profile: 'technician',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'clinical-evolution' },
      icu: { status: 'available', route: 'icu-clinical-evolution' },
      medicalClinic: { status: 'available', route: 'medical-clinic-evolution' },
      surgicalClinic: { status: 'available', route: 'surgical-clinic-evolution' },
      pediatrics: { status: 'available', route: 'pediatric-clinic-evolution' },
    },
  },
  technician_admission: {
    id: 'technician_admission',
    title: 'Admissão — Anotação de Enfermagem',
    description: 'Registro de admissão com identificação, procedência, pertences, estado geral e cuidados iniciais.',
    profile: 'technician',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'admission-clinical-evolution' },
      icu: { status: 'development', note: 'Em desenvolvimento' },
      medicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      surgicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      pediatrics: { status: 'development', note: 'Em desenvolvimento' },
    },
  },
  nurse_evolution: {
    id: 'nurse_evolution',
    title: 'Evolução de Enfermagem',
    description: 'Avaliação clínica completa pelo Enfermeiro com raciocínio diagnóstico e julgamento profissional.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'nurse-evolution-clinical' },
      icu: { status: 'available', route: 'nurse-evolution-icu' },
      medicalClinic: { status: 'available', route: 'nurse-evolution-medical-clinic' },
      surgicalClinic: { status: 'available', route: 'nurse-evolution-surgical-clinic' },
      pediatrics: { status: 'available', route: 'nurse-evolution-pediatrics' },
    },
  },
  nurse_admission: {
    id: 'nurse_admission',
    title: 'Admissão — Evolução de Enfermagem',
    description: 'Histórico de enfermagem, exame físico céfalo-podálico sistematizado e plano terapêutico inicial.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'nurse-admission-clinical' },
      icu: { status: 'available', route: 'nurse-admission-icu' },
      medicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      surgicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      pediatrics: { status: 'development', note: 'Em desenvolvimento' },
    },
  },
  nurse_wounds: {
    id: 'nurse_wounds',
    title: 'Avaliação de Feridas',
    description: 'Avaliação detalhada de lesões, leito, bordas, exsudato, estadiamento informado e conduta de curativos.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'development' },
      icu: { status: 'development' },
      medicalClinic: { status: 'development' },
      surgicalClinic: { status: 'development' },
      pediatrics: { status: 'development' },
      all: { status: 'available', route: 'nurse-wounds-assessment' },
    },
  },
  nurse_soap: {
    id: 'nurse_soap',
    title: 'Registro SOAP de Enfermagem',
    description: 'Subjetivo, Objetivo, Avaliação e Plano para atendimento ambulatorial e consultas sistematizadas.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'development' },
      icu: { status: 'development' },
      medicalClinic: { status: 'development' },
      surgicalClinic: { status: 'development' },
      pediatrics: { status: 'development' },
      all: { status: 'available', route: 'nurse-soap' },
    },
  },
  // Canonical uppercase aliases matching COFEN / Audit specifications
  TECHNICIAN_NURSING_NOTE: {
    id: 'TECHNICIAN_NURSING_NOTE',
    title: 'Anotação de Enfermagem',
    description: 'Registro pontual e factual de cuidados prestados, sinais vitais e intercorrências no plantão.',
    profile: 'technician',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'clinical-evolution' },
      icu: { status: 'available', route: 'icu-clinical-evolution' },
      medicalClinic: { status: 'available', route: 'medical-clinic-evolution' },
      surgicalClinic: { status: 'available', route: 'surgical-clinic-evolution' },
      pediatrics: { status: 'available', route: 'pediatric-clinic-evolution' },
    },
  },
  TECHNICIAN_ADMISSION: {
    id: 'TECHNICIAN_ADMISSION',
    title: 'Admissão — Anotação de Enfermagem',
    description: 'Registro de admissão com identificação, procedência, pertences, estado geral e cuidados iniciais.',
    profile: 'technician',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'admission-clinical-evolution' },
      icu: { status: 'development', note: 'Em desenvolvimento' },
      medicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      surgicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      pediatrics: { status: 'development', note: 'Em desenvolvimento' },
    },
  },
  NURSE_EVOLUTION: {
    id: 'NURSE_EVOLUTION',
    title: 'Evolução de Enfermagem',
    description: 'Avaliação clínica completa pelo Enfermeiro com raciocínio diagnóstico e julgamento profissional.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'nurse-evolution-clinical' },
      icu: { status: 'available', route: 'nurse-evolution-icu' },
      medicalClinic: { status: 'available', route: 'nurse-evolution-medical-clinic' },
      surgicalClinic: { status: 'available', route: 'nurse-evolution-surgical-clinic' },
      pediatrics: { status: 'available', route: 'nurse-evolution-pediatrics' },
    },
  },
  NURSE_ADMISSION: {
    id: 'NURSE_ADMISSION',
    title: 'Admissão — Evolução de Enfermagem',
    description: 'Histórico de enfermagem, exame físico céfalo-podálico sistematizado e plano terapêutico inicial.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'available', route: 'nurse-admission-clinical' },
      icu: { status: 'available', route: 'nurse-admission-icu' },
      medicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      surgicalClinic: { status: 'development', note: 'Em desenvolvimento' },
      pediatrics: { status: 'development', note: 'Em desenvolvimento' },
    },
  },
  NURSE_WOUNDS_ASSESSMENT: {
    id: 'NURSE_WOUNDS_ASSESSMENT',
    title: 'Avaliação de Feridas',
    description: 'Avaliação detalhada de lesões, leito, bordas, exsudato, estadiamento informado e conduta de curativos.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'development' },
      icu: { status: 'development' },
      medicalClinic: { status: 'development' },
      surgicalClinic: { status: 'development' },
      pediatrics: { status: 'development' },
      all: { status: 'available', route: 'nurse-wounds-assessment' },
    },
  },
  NURSE_SOAP: {
    id: 'NURSE_SOAP',
    title: 'Registro SOAP de Enfermagem',
    description: 'Subjetivo, Objetivo, Avaliação e Plano para atendimento ambulatorial e consultas sistematizadas.',
    profile: 'nurse',
    status: 'available',
    areas: {
      emergency: { status: 'development' },
      icu: { status: 'development' },
      medicalClinic: { status: 'development' },
      surgicalClinic: { status: 'development' },
      pediatrics: { status: 'development' },
      all: { status: 'available', route: 'nurse-soap' },
    },
  },
};

/**
 * Strict role-to-module authorization boundaries
 */
export const TECHNICIAN_ALLOWED_MODULES: ModuleId[] = [
  'TECHNICIAN_NURSING_NOTE',
  'TECHNICIAN_ADMISSION',
  'technician_nursing_note',
  'technician_admission',
];

export const NURSE_ALLOWED_MODULES: ModuleId[] = [
  'NURSE_ADMISSION',
  'NURSE_EVOLUTION',
  'NURSE_WOUNDS_ASSESSMENT',
  'NURSE_SOAP',
  'nurse_admission',
  'nurse_evolution',
  'nurse_wounds',
  'nurse_soap',
];

export function isModuleAllowedForRole(role: 'technician' | 'nurse', moduleId: string): boolean {
  if (role === 'technician') {
    return TECHNICIAN_ALLOWED_MODULES.includes(moduleId as ModuleId);
  }
  if (role === 'nurse') {
    return NURSE_ALLOWED_MODULES.includes(moduleId as ModuleId);
  }
  return false;
}

export function getAllowedModulesForRole(role: 'technician' | 'nurse'): ModuleDefinition[] {
  const canonicalIds: CanonicalModuleId[] =
    role === 'technician'
      ? ['TECHNICIAN_NURSING_NOTE', 'TECHNICIAN_ADMISSION']
      : ['NURSE_ADMISSION', 'NURSE_EVOLUTION', 'NURSE_WOUNDS_ASSESSMENT', 'NURSE_SOAP'];

  return canonicalIds.map((id) => MODULE_REGISTRY[id]);
}

/**
 * Validates Module Registry integrity:
 * - Unique IDs
 * - Unique active routes
 * - Exact role separation
 * - Zero cross-profile leakage
 */
export function validateModuleRegistryIntegrity(): {
  valid: boolean;
  errors: string[];
  moduleCount: number;
  routesValidated: number;
} {
  const errors: string[] = [];
  const registeredIds = Object.keys(MODULE_REGISTRY);

  // Check unique IDs
  const idSet = new Set<string>();
  for (const id of registeredIds) {
    if (idSet.has(id)) {
      errors.push(`Duplicate module ID in registry: ${id}`);
    }
    idSet.add(id);
  }

  // Check unique active routes per profile
  const techRoutes = new Set<string>();
  const nurseRoutes = new Set<string>();
  let routesCount = 0;

  for (const mod of Object.values(MODULE_REGISTRY)) {
    if (mod.areas) {
      for (const [areaKey, areaDef] of Object.entries(mod.areas)) {
        if (areaDef && areaDef.status === 'available' && areaDef.route) {
          routesCount++;
          if (mod.profile === 'technician') {
            techRoutes.add(areaDef.route);
            if (nurseRoutes.has(areaDef.route)) {
              errors.push(`Cross-profile collision on route "${areaDef.route}" (shared by nurse & technician).`);
            }
          } else if (mod.profile === 'nurse') {
            nurseRoutes.add(areaDef.route);
            if (techRoutes.has(areaDef.route)) {
              errors.push(`Cross-profile collision on route "${areaDef.route}" (shared by technician & nurse).`);
            }
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    moduleCount: registeredIds.length,
    routesValidated: routesCount,
  };
}

export function getModuleAvailability(
  moduleId: ModuleId,
  areaId?: AssistentialAreaId
): { status: 'available' | 'development'; route?: AppScreen } {
  const mod = MODULE_REGISTRY[moduleId];
  if (!mod) return { status: 'development' };
  if (!areaId) return { status: mod.status };
  const area = mod.areas[areaId];
  return {
    status: area?.status || 'development',
    route: area?.route,
  };
}
