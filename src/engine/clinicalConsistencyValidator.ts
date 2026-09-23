import { ClinicalEvolutionForm } from '../types/clinical';

export interface ConsistencyAlert {
  id: string; // e.g. 'CONS-001'
  ruleId: string;
  message: string;
  fieldsInvolved: string[];
  sectionIndex: number;
  sectionTitle: string;
}

/**
 * ClinicalConsistencyValidator
 * 
 * Deterministic validator that flags potentially incompatible combinations of
 * selections for human review.
 * 
 * Rules strictly followed:
 * - Never performs medical diagnosis or clinical classification.
 * - Never automatically alters or overrides any user input.
 * - All alerts are strictly NON-BLOCKING for human review.
 * - Conservative approach: flags only predefined structural/data inconsistencies.
 */
export function validateClinicalConsistency(form: Partial<ClinicalEvolutionForm>): ConsistencyAlert[] {
  const alerts: ConsistencyAlert[] = [];

  const neuro = form.neurological;
  const gen = form.generalAssessment;
  const vitals = form.vitalSigns;
  const resp = form.respiratory;
  const cardio = form.cardiovascular;

  // ==========================================
  // CONS-001: Sedado + Informação referida diretamente pelo paciente
  // ==========================================
  const isSedated = neuro?.consciousnessLevel === 'Sedado';
  const hasDirectPatientReport =
    gen?.complaints === 'Sem queixas no momento' ||
    (gen?.complaints === 'Com queixa' && !!gen.complaintsDetails?.trim());

  if (isSedated && hasDirectPatientReport) {
    alerts.push({
      id: 'CONS-001',
      ruleId: 'CONS-001',
      message:
        'Foi registrado que o paciente está sedado e também uma informação referida diretamente pelo paciente. Verifique se os dados estão corretos.',
      fieldsInvolved: ['neurological.consciousnessLevel', 'generalAssessment.complaints'],
      sectionIndex: 1, // Avaliação Geral / Neurológico
      sectionTitle: 'Neurológico / Avaliação Geral',
    });
  }

  // ==========================================
  // CONS-002: Glasgow rebaixado/baixo (ex: 7) + Deambulação
  // ==========================================
  const glasgowVal = neuro?.glasgowScore;
  const isAmbulating =
    gen?.mobility === 'Deambula sem auxílio' || gen?.mobility === 'Deambula com auxílio';

  if (glasgowVal !== undefined && glasgowVal !== null && Number(glasgowVal) <= 8 && isAmbulating) {
    alerts.push({
      id: 'CONS-002',
      ruleId: 'CONS-002',
      message:
        'As informações registradas sobre nível de consciência e deambulação podem precisar de revisão.',
      fieldsInvolved: ['neurological.glasgowScore', 'generalAssessment.mobility'],
      sectionIndex: 1,
      sectionTitle: 'Neurológico / Mobilidade',
    });
  }

  // ==========================================
  // CONS-003: Sedado + RASS 0
  // ==========================================
  const rassVal = neuro?.rassScore;
  if (isSedated && rassVal !== undefined && rassVal !== null && Number(rassVal) === 0) {
    alerts.push({
      id: 'CONS-003',
      ruleId: 'CONS-003',
      message:
        'O nível de consciência e o valor de RASS registrados podem ser incompatíveis. Revise as informações.',
      fieldsInvolved: ['neurological.consciousnessLevel', 'neurological.rassScore'],
      sectionIndex: 4, // Neurológico
      sectionTitle: 'Neurológico (Escala RASS)',
    });
  }

  // ==========================================
  // CONS-004: Frequência respiratória aferida vs Padrão respiratório incoerente
  // Ex: FR 25 irpm + Eupneico (ou FR >= 21 / FR < 12 com Eupneico)
  // ==========================================
  const rrNum = vitals?.respiratoryRate ? Number(vitals.respiratoryRate) : NaN;
  const pattern = resp?.respiratoryPattern;

  if (!isNaN(rrNum) && pattern === 'Eupneico') {
    if (rrNum >= 21 || rrNum < 12) {
      alerts.push({
        id: 'CONS-004',
        ruleId: 'CONS-004',
        message:
          'A frequência respiratória aferida e o padrão respiratório selecionado podem precisar de revisão.',
        fieldsInvolved: ['vitalSigns.respiratoryRate', 'respiratory.respiratoryPattern'],
        sectionIndex: 2, // Sinais vitais / Respiratório
        sectionTitle: 'Sinais Vitais / Respiratório',
      });
    }
  }

  // ==========================================
  // CONS-005: Perfusão periférica adequada + TEC lento / >= 3s
  // ==========================================
  const isPerfusionAdequate = cardio?.peripheralPerfusion === 'Adequada';

  const crtRaw = cardio?.capillaryRefillTime || '';
  const crtVal = cardio?.capillaryRefillTimeValue ? Number(cardio.capillaryRefillTimeValue) : NaN;
  const isCrtSlow =
    crtRaw.includes('Maior ou igual a 3') ||
    crtRaw.includes('>= 3') ||
    crtRaw.includes('Lento') ||
    (!isNaN(crtVal) && crtVal >= 3);

  if (isPerfusionAdequate && isCrtSlow) {
    alerts.push({
      id: 'CONS-005',
      ruleId: 'CONS-005',
      message:
        'Os dados registrados sobre perfusão periférica e tempo de enchimento capilar podem precisar de revisão.',
      fieldsInvolved: ['cardiovascular.peripheralPerfusion', 'cardiovascular.capillaryRefillTime'],
      sectionIndex: 6, // Cardiovascular
      sectionTitle: 'Cardiovascular',
    });
  }

  // ==========================================
  // CONS-006: Ventilação Mecânica Invasiva (VMI) + Deambulação
  // ==========================================
  const isVMI = resp?.respiratorySupport === 'Ventilação mecânica invasiva';
  if (isVMI && isAmbulating) {
    alerts.push({
      id: 'CONS-006',
      ruleId: 'CONS-006',
      message:
        'O suporte ventilatório e a mobilidade registrados podem precisar de revisão.',
      fieldsInvolved: ['respiratory.respiratorySupport', 'generalAssessment.mobility'],
      sectionIndex: 5, // Respiratório / Mobilidade
      sectionTitle: 'Respiratório / Mobilidade',
    });
  }

  return alerts;
}
