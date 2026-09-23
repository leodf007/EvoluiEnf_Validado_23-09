import { ClinicalEvolutionForm } from '../types/clinical';

/**
 * Checks if a value is consider empty/unspecified.
 * Numbers (even 0) and booleans are NOT empty.
 * Explicit negative strings (e.g. "Não", "Ausente") are NOT empty.
 */
function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0;
  }
  return false;
}

/**
 * Cleans an object recursively by stripping empty strings, nulls, undefineds, and empty arrays/objects.
 * Preserves numbers (including 0) and booleans.
 */
function cleanObject<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map((item) => (typeof item === 'object' ? cleanObject(item) : item))
      .filter((item) => !isEmptyValue(item));
    return cleanedArray as unknown as T;
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed !== '') {
        cleaned[key] = trimmed;
      }
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      cleaned[key] = val;
    } else if (Array.isArray(val)) {
      const arr = val
        .map((item) => (typeof item === 'object' ? cleanObject(item) : typeof item === 'string' ? item.trim() : item))
        .filter((item) => !isEmptyValue(item));
      if (arr.length > 0) {
        cleaned[key] = arr;
      }
    } else if (typeof val === 'object' && val !== null) {
      const nested = cleanObject(val);
      if (Object.keys(nested as object).length > 0) {
        cleaned[key] = nested;
      }
    }
  }

  return cleaned as T;
}

/**
 * Normalizes clinical evolution form data by removing all non-informed fields
 * while strictly preserving explicit clinical negatives, zeroes, and user-selected assessments.
 */
export function normalizeClinicalData<T extends object = ClinicalEvolutionForm>(formData: T): Partial<T> {
  const cloned = JSON.parse(JSON.stringify(formData)) as any;

  // Specific domain validations before cleaning:
  // If vasoactiveDrugs.inUse === 'Não', remove drugsList
  if (cloned.vasoactiveDrugs?.inUse === 'Não') {
    cloned.vasoactiveDrugs.drugsList = [];
  }

  // If sedationAnalgesia.inUse === 'Não', remove medicationsList
  if (cloned.sedationAnalgesia?.inUse === 'Não') {
    cloned.sedationAnalgesia.medicationsList = [];
  }

  // If devices list items have no type and no location, strip them
  if (cloned.devices?.list) {
    cloned.devices.list = cloned.devices.list.filter((d: any) => d.type?.trim() || d.location?.trim());
  }

  // If complications.hasComplication === 'Não' or complications.hasComplications === 'Não'
  if (cloned.complications?.hasComplication === 'Não' || cloned.complications?.hasComplications === 'Não') {
    delete cloned.complications.description;
    delete cloned.complications.time;
    delete cloned.complications.actionsTaken;
    delete cloned.complications.patientResponse;
    delete cloned.complications.communicatedWho;
    delete cloned.complications.communicatedWhoCustom;
    delete cloned.complications.communicationTime;
    delete cloned.complications.communicatedTo;
  } else if (cloned.complications?.communicatedToTeam === 'Não') {
    delete cloned.complications.communicatedWho;
    delete cloned.complications.communicatedWhoCustom;
    delete cloned.complications.communicationTime;
    delete cloned.complications.communicatedTo;
  }

  // If respiratory support is 'Ar ambiente', clear O2 flow rate
  if (cloned.respiratory?.respiratorySupport === 'Ar ambiente') {
    delete cloned.respiratory.oxygenFlowRate;
    delete cloned.respiratory.oxygenFiO2;
    delete cloned.respiratory.oxygenDevice;
    delete cloned.respiratory.o2Flow;
  }

  // Clean empty values
  return cleanObject(cloned);
}

export function normalizeICUClinicalData(formData: any): any {
  const cloned = JSON.parse(JSON.stringify(formData));

  if (cloned.vasoactiveDrugs?.inUse === 'Não') {
    cloned.vasoactiveDrugs.drugsList = [];
  }
  if (cloned.sedationAndAnalgesia?.inUse === 'Não') {
    cloned.sedationAndAnalgesia.infusionsList = [];
  }
  if (cloned.respiratoryAndVentilation?.respiratorySupport === 'Ar ambiente') {
    delete cloned.respiratoryAndVentilation.mechanicalVentilationAirway;
    delete cloned.respiratoryAndVentilation.ventilationMode;
    delete cloned.respiratoryAndVentilation.ventilationPeep;
    delete cloned.respiratoryAndVentilation.peep;
    delete cloned.respiratoryAndVentilation.ventilationFiO2;
  }
  if (cloned.nutritionAndGastrointestinal?.nutritionalStatus === 'Via oral') {
    delete cloned.nutritionAndGastrointestinal.enteralRoute;
    delete cloned.nutritionAndGastrointestinal.enteralInfusionRate;
  }
  return cleanObject(cloned);
}

export function normalizeAdmissionClinicalData(formData: any): any {
  const cloned = JSON.parse(JSON.stringify(formData));
  return cleanObject(cloned);
}

export function normalizeNurseAdmissionClinicalData(formData: any): any {
  const cloned = JSON.parse(JSON.stringify(formData));
  return cleanObject(cloned);
}

export function normalizeNurseEvolutionClinicalData(formData: any): any {
  const cloned = JSON.parse(JSON.stringify(formData));
  if (cloned.cardiovascular?.edema === 'Ausente' || cloned.cardiovascularSystem?.edema === 'Ausente') {
    if (cloned.cardiovascular) {
      delete cloned.cardiovascular.edemaLocation;
      delete cloned.cardiovascular.edemaGrade;
    }
    if (cloned.cardiovascularSystem) {
      delete cloned.cardiovascularSystem.edemaLocation;
      delete cloned.cardiovascularSystem.edemaGrading;
    }
  }
  if (cloned.skin?.integrity === 'Íntegra') {
    delete cloned.skin.lesionDescription;
    delete cloned.skin.lesionLocation;
  }
  return cleanObject(cloned);
}
