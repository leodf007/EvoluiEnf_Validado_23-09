import { TechnicianClinicalMedicalForm } from '../types/technicianClinicalMedical';
import { ConsistencyAlert } from './clinicalConsistencyValidator';

export interface ClinicalMedicalConsistencyAlert extends ConsistencyAlert {
  severity?: 'warning' | 'info';
}

/**
 * Clinical Medical Consistency Validator
 * 
 * Deterministic, non-blocking consistency validator for Nursing Technician
 * in Clinical Medical inpatient ward (TECH-CM-CONS-001 to TECH-CM-CONS-008).
 * 
 * Strictly follows rules:
 * - Never makes clinical or diagnostic judgments.
 * - Alerts are strictly non-blocking flags for human verification.
 * - Validates structural and factual field coherency.
 */
export function validateClinicalMedicalConsistency(
  form: Partial<TechnicianClinicalMedicalForm>
): ClinicalMedicalConsistencyAlert[] {
  const alerts: ClinicalMedicalConsistencyAlert[] = [];

  const gen = form.generalAssessment;
  const pain = form.pain;
  const resp = form.respiratory;
  const cardio = form.cardiovascular;
  const nutr = form.nutrition;
  const devices = form.devices;
  const bath = form.bath;
  const comp = form.complications;

  // ==========================================
  // TECH-CM-CONS-001: Banho não realizado + tolerância preenchida
  // OU Sedado/Inconsciente com queixa referida diretamente pelo paciente
  // ==========================================
  if (bath?.performed === 'não' && bath.tolerance && bath.tolerance.trim().length > 0) {
    alerts.push({
      id: 'TECH-CM-CONS-001',
      ruleId: 'TECH-CM-CONS-001',
      message:
        'Registro de tolerância ao banho informado, porém foi assinalado que o banho não foi realizado.',
      fieldsInvolved: ['bath.performed', 'bath.tolerance'],
      sectionIndex: 10,
      sectionTitle: 'Banho e Higiene',
      severity: 'warning',
    });
  }

  const isSedatedOrUnresponsive =
    gen?.observedState === 'sonolento' &&
    (gen?.observedStateCustom?.toLowerCase().includes('sedad') ||
      gen?.observedStateCustom?.toLowerCase().includes('rebaixad'));
  const isSedatedByText =
    (gen?.observedStateCustom && /sedad[oa]|comatos[oa]|torporos[oa]/i.test(gen.observedStateCustom)) ||
    (gen?.observedState as any) === 'sedado';
  const isDirectPatientComplaint =
    (gen?.complaints === 'sem queixas referidas' || gen?.complaints === 'com queixa') &&
    gen?.source === 'paciente';

  if ((isSedatedOrUnresponsive || isSedatedByText) && isDirectPatientComplaint) {
    alerts.push({
      id: 'TECH-CM-CONS-001',
      ruleId: 'TECH-CM-CONS-001',
      message:
        'Foi registrado estado sedado/inconsciente juntamente com queixa referida diretamente pelo paciente.',
      fieldsInvolved: ['generalAssessment.observedState', 'generalAssessment.source'],
      sectionIndex: 1,
      sectionTitle: 'Avaliação Geral',
      severity: 'warning',
    });
  }

  // ==========================================
  // TECH-CM-CONS-002: Ar ambiente com dispositivo de O2 ou fluxo
  // ==========================================
  const hasO2DeviceOrFlow =
    (resp?.oxygenDevice && resp.oxygenDevice.trim().length > 0) ||
    (resp?.oxygenFlow && resp.oxygenFlow.trim().length > 0);

  if (resp?.support === 'ar ambiente' && hasO2DeviceOrFlow) {
    alerts.push({
      id: 'TECH-CM-CONS-002',
      ruleId: 'TECH-CM-CONS-002',
      message:
        'Foi assinalado suporte respiratório em "ar ambiente", porém foram preenchidos dispositivo de oxigênio ou fluxo em L/min.',
      fieldsInvolved: ['respiratory.support', 'respiratory.oxygenDevice', 'respiratory.oxygenFlow'],
      sectionIndex: 4,
      sectionTitle: 'Respiratório',
      severity: 'warning',
    });
  }

  // ==========================================
  // TECH-CM-CONS-003: Dieta enteral sem via OU dados enterais para via oral
  // ==========================================
  if (nutr?.route === 'enteral' && (!nutr.enteralDevice || !nutr.enteralDevice.trim())) {
    alerts.push({
      id: 'TECH-CM-CONS-003',
      ruleId: 'TECH-CM-CONS-003',
      message:
        'Nutrição enteral indicada sem seleção da via (SNE, SNG ou GTT).',
      fieldsInvolved: ['nutrition.route', 'nutrition.enteralDevice'],
      sectionIndex: 6,
      sectionTitle: 'Alimentação',
      severity: 'warning',
    });
  }

  const hasEnteralData =
    (nutr?.enteralDevice && nutr.enteralDevice.trim().length > 0) ||
    (nutr?.enteralRate && nutr.enteralRate.trim().length > 0) ||
    (nutr?.enteralTolerance && nutr.enteralTolerance.trim().length > 0);

  if (nutr?.route === 'oral' && hasEnteralData) {
    alerts.push({
      id: 'TECH-CM-CONS-003',
      ruleId: 'TECH-CM-CONS-003',
      message:
        'Via de alimentação selecionada como "oral", porém foram preenchidos dados de dieta enteral (dispositivo, vazão ou tolerância).',
      fieldsInvolved: ['nutrition.route', 'nutrition.enteralDevice', 'nutrition.enteralRate'],
      sectionIndex: 6,
      sectionTitle: 'Alimentação',
      severity: 'warning',
    });
  }

  // ==========================================
  // TECH-CM-CONS-004: Aceitação oral com dieta não-oral
  // ==========================================
  if (
    nutr?.route &&
    nutr.route !== 'oral' &&
    nutr.oralAcceptance &&
    nutr.oralAcceptance.trim().length > 0
  ) {
    alerts.push({
      id: 'TECH-CM-CONS-004',
      ruleId: 'TECH-CM-CONS-004',
      message:
        'Aceitação da dieta oral foi informada, porém a via selecionada não é oral (ex: jejum ou enteral).',
      fieldsInvolved: ['nutrition.route', 'nutrition.oralAcceptance'],
      sectionIndex: 6,
      sectionTitle: 'Alimentação',
      severity: 'warning',
    });
  }

  // ==========================================
  // TECH-CM-CONS-005: Conduta/comunicação sem intercorrência
  // ==========================================
  const hasConductOrComm =
    (comp?.conduct && comp.conduct.trim().length > 0) ||
    (comp?.communication && comp.communication.trim().length > 0);

  if (
    (comp?.hasComplication === 'não' || comp?.explicitNoComplications === true) &&
    hasConductOrComm
  ) {
    alerts.push({
      id: 'TECH-CM-CONS-005',
      ruleId: 'TECH-CM-CONS-005',
      message:
        'Foi assinalado que não houve intercorrências no plantão, porém foram preenchidas condutas ou comunicação à equipe.',
      fieldsInvolved: ['complications.hasComplication', 'complications.conduct', 'complications.communication'],
      sectionIndex: 12,
      sectionTitle: 'Intercorrências',
      severity: 'warning',
    });
  }

  // ==========================================
  // TECH-CM-CONS-006: Escore de dor com status não avaliável
  // ==========================================
  const hasPainScoreOrLocation =
    (pain?.numericScaleValue !== undefined && pain?.numericScaleValue !== null) ||
    (pain?.location && pain.location.trim().length > 0);

  if (
    pain?.status &&
    pain.status !== 'avaliada' &&
    hasPainScoreOrLocation
  ) {
    alerts.push({
      id: 'TECH-CM-CONS-006',
      ruleId: 'TECH-CM-CONS-006',
      message:
        'Valor da escala de dor ou localização informado, porém o status foi assinalado como diferente de avaliada.',
      fieldsInvolved: ['pain.status', 'pain.numericScaleValue', 'pain.location'],
      sectionIndex: 3,
      sectionTitle: 'Avaliação da Dor',
      severity: 'warning',
    });
  }

  // ==========================================
  // TECH-CM-CONS-007: Edema ausente com localização preenchida
  // OU Intercorrência sim sem descrição
  // ==========================================
  if (
    cardio?.edema === 'ausente' &&
    cardio.edemaLocation &&
    cardio.edemaLocation.trim().length > 0
  ) {
    alerts.push({
      id: 'TECH-CM-CONS-007',
      ruleId: 'TECH-CM-CONS-007',
      message:
        'Edema foi assinalado como "ausente", porém foi informada localização anatômica de edema.',
      fieldsInvolved: ['cardiovascular.edema', 'cardiovascular.edemaLocation'],
      sectionIndex: 5,
      sectionTitle: 'Cardiovascular',
      severity: 'warning',
    });
  }

  if (comp?.hasComplication === 'sim' && (!comp.description || !comp.description.trim())) {
    alerts.push({
      id: 'TECH-CM-CONS-007',
      ruleId: 'TECH-CM-CONS-007',
      message:
        'Presença de intercorrência indicada no período, porém sem descrição detalhada do evento.',
      fieldsInvolved: ['complications.hasComplication', 'complications.description'],
      sectionIndex: 12,
      sectionTitle: 'Intercorrências',
      severity: 'warning',
    });
  }

  // ==========================================
  // TECH-CM-CONS-008: Dispositivo sem localização anatômica
  // ==========================================
  if (Array.isArray(devices) && devices.length > 0) {
    const devicesWithoutLocation = devices.filter(
      (d) => !d.location || !d.location.trim()
    );
    if (devicesWithoutLocation.length > 0) {
      alerts.push({
        id: 'TECH-CM-CONS-008',
        ruleId: 'TECH-CM-CONS-008',
        message:
          `Dispositivo invasivo (${devicesWithoutLocation.map((d) => d.type || 'Dispositivo').join(', ')}) cadastrado sem localização anatômica especificada.`,
        fieldsInvolved: ['devices.location'],
        sectionIndex: 8,
        sectionTitle: 'Dispositivos',
        severity: 'warning',
      });
    }
  }

  return alerts;
}
