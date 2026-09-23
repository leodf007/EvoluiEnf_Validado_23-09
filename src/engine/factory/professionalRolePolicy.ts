import { AppScreen } from '../../types';
import { ClinicalDocumentType, ClinicalModuleCapabilities, ClinicalModuleDefinition } from './types';

export class ProfessionalRolePolicy {
  /**
   * Validates that module capabilities strictly adhere to Brazilian nursing legislation (COFEN)
   * and the structural boundaries of EvoluiEnf.
   */
  static validateCapabilities(
    role: 'technician' | 'nurse',
    capabilities: ClinicalModuleCapabilities
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (role === 'technician') {
      if (capabilities.supportsNurseClinicalSynthesis) {
        errors.push('POLICY-ERR-001: Técnico de Enfermagem NÃO pode possuir capability "supportsNurseClinicalSynthesis" (privativo do Enfermeiro).');
      }
    }

    if (role === 'nurse') {
      // In EvoluiEnf, automated diagnosis/prescription generation by AI is strictly prohibited
      // Nurse capabilities must be grounded on human professional input
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Verifies if a document type is legally and architecturally allowed for a given professional role.
   */
  static isRoleAllowedForDocument(role: 'technician' | 'nurse', documentType: ClinicalDocumentType): boolean {
    if (role === 'technician') {
      return (
        documentType === 'TECHNICIAN_NURSING_NOTE' ||
        documentType === 'TECHNICIAN_ADMISSION_NOTE'
      );
    }
    if (role === 'nurse') {
      return (
        documentType === 'NURSE_EVOLUTION' ||
        documentType === 'NURSE_ADMISSION' ||
        documentType === 'WOUND_ASSESSMENT' ||
        documentType === 'SOAP'
      );
    }
    return false;
  }

  /**
   * Verifies if a route belongs to the assigned role, preventing profile leakages.
   */
  static isRouteAllowedForRole(role: 'technician' | 'nurse', route: AppScreen): boolean {
    const technicianRoutes: AppScreen[] = [
      'clinical-evolution',
      'icu-clinical-evolution',
      'admission-clinical-evolution',
      'medical-clinic-evolution',
      'surgical-clinic-evolution',
      'pediatric-clinic-evolution',
      'assistential-areas',
      'admission-assistential-areas',
    ];

    const nurseRoutes: AppScreen[] = [
      'nurse-evolution-clinical',
      'nurse-evolution-icu',
      'nurse-evolution-medical-clinic',
      'nurse-evolution-surgical-clinic',
      'nurse-evolution-pediatrics',
      'nurse-admission-clinical',
      'nurse-admission-icu',
      'nurse-evolution-assistential-areas',
      'nurse-admission-assistential-areas',
      'nurse-wounds-assessment',
      'nurse-soap',
    ];

    const sharedPublicRoutes: AppScreen[] = [
      'welcome',
      'role-selection',
      'login',
      'register',
      'account',
      'er-preparation',
      'dashboard',
      'novo-atendimento',
      'historico-atendimentos',
      'model-library',
      'model-detail',
      'favorite-models',
    ];

    if (sharedPublicRoutes.includes(route)) {
      return true;
    }

    if (role === 'technician') {
      return technicianRoutes.includes(route) && !nurseRoutes.includes(route);
    }

    if (role === 'nurse') {
      return nurseRoutes.includes(route) && !technicianRoutes.includes(route);
    }

    return false;
  }

  static isRouteAllowed(role: 'technician' | 'nurse', route: AppScreen): boolean {
    return this.isRouteAllowedForRole(role, route);
  }

  /**
   * Returns list of allowed clinical module IDs for a given role (USER-009 / USER-010).
   */
  static getAllowedModulesForRole(role: 'technician' | 'nurse'): string[] {
    if (role === 'technician') {
      return ['technician_nursing_note', 'technician_admission'];
    }
    if (role === 'nurse') {
      return ['nurse_evolution', 'nurse_admission', 'nurse_wounds', 'nurse_soap'];
    }
    return [];
  }

  /**
   * Checks if a specific clinical module ID is allowed for a given role.
   */
  static isModuleAllowedForRole(moduleId: string, role: 'technician' | 'nurse'): boolean {
    const allowed = this.getAllowedModulesForRole(role);
    return allowed.includes(moduleId);
  }

  /**
   * Complete validation of a module definition against role policy.
   */
  static validateModuleDefinition(def: ClinicalModuleDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isRoleAllowedForDocument(def.professionalRole, def.documentType)) {
      errors.push(`DocumentType ${def.documentType} is not permitted for role ${def.professionalRole}`);
    }

    const capValidation = this.validateCapabilities(def.professionalRole, def.capabilities);
    if (!capValidation.valid) {
      errors.push(...capValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
