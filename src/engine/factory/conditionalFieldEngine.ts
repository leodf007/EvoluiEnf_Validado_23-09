/**
 * Conditional Field Engine for EvoluiEnf.
 * 
 * PURE UI VISIBILITY CONTROLLER:
 * This engine only determines whether certain input sections/fields should be displayed in the UI.
 * It NEVER creates, alters, or synthesizes clinical facts.
 */

export class ConditionalFieldEngine {
  /**
   * Evaluates if mechanical ventilation parameter fields should be rendered.
   */
  static shouldShowMechanicalVentilation(respiratorySupport?: string): boolean {
    if (!respiratorySupport) return false;
    const lower = respiratorySupport.toLowerCase();
    return (
      lower.includes('mecânica invasiva') ||
      lower.includes('vmi') ||
      lower === 'ventilação mecânica invasiva'
    );
  }

  /**
   * Evaluates if supplemental oxygen flow fields should be rendered.
   */
  static shouldShowOxygenFlowRate(respiratorySupport?: string): boolean {
    if (!respiratorySupport) return false;
    const lower = respiratorySupport.toLowerCase();
    return (
      lower.includes('cateter') ||
      lower.includes('máscara') ||
      lower.includes('cnaf') ||
      lower.includes('vni')
    );
  }

  /**
   * Evaluates if enteral nutrition fields should be rendered.
   */
  static shouldShowEnteralFields(nutritionalStatus?: string): boolean {
    if (!nutritionalStatus) return false;
    const lower = nutritionalStatus.toLowerCase();
    return lower.includes('enteral');
  }

  /**
   * Evaluates if edema details (location, grade) should be rendered.
   */
  static shouldShowEdemaDetails(edemaStatus?: string): boolean {
    if (!edemaStatus) return false;
    const lower = edemaStatus.toLowerCase();
    return (
      lower !== 'ausente' &&
      lower !== 'não avaliado' &&
      lower !== 'não informado' &&
      lower.length > 0
    );
  }

  /**
   * Evaluates if skin lesion description and staging fields should be rendered.
   */
  static shouldShowSkinLesionDetails(skinIntegrity?: string): boolean {
    if (!skinIntegrity) return false;
    const lower = skinIntegrity.toLowerCase();
    return (
      lower.includes('lesão') ||
      lower.includes('úlcera') ||
      lower.includes('ferida') ||
      lower.includes('prejudicada') ||
      lower.includes('não íntegra')
    );
  }

  /**
   * Evaluates if complication description, actions and communication should be rendered.
   */
  static shouldShowComplicationDetails(hasComplication?: string): boolean {
    if (!hasComplication) return false;
    return hasComplication.trim().toLowerCase() === 'sim';
  }

  /**
   * Evaluates if vasoactive drugs details should be rendered.
   */
  static shouldShowVasoactiveDrugDetails(inUse?: string): boolean {
    if (!inUse) return false;
    return inUse.trim().toLowerCase() === 'sim';
  }

  /**
   * Evaluates if bath tolerance should be rendered.
   */
  static shouldShowBathTolerance(bathType?: string): boolean {
    if (!bathType) return false;
    const lower = bathType.toLowerCase();
    return lower !== 'não realizado' && lower !== 'não informado';
  }
}
