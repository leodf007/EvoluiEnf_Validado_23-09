import { TechnicianICUNursingNoteForm } from '../types/icuClinical';
import { ClinicalConsistencyAlert } from './types';

/**
 * Validates clinical consistency for ICU Technician Nursing Note (UTI-CONS-001 to UTI-CONS-011).
 * Conservative warnings only — NEVER mutates or auto-corrects user inputs.
 */
export function validateICUConsistency(form: TechnicianICUNursingNoteForm): ClinicalConsistencyAlert[] {
  const alerts: ClinicalConsistencyAlert[] = [];

  const neuro = form.neurologicalAndSedation;
  const cond = form.observedCondition;
  const resp = form.respiratoryAndVentilation;
  const cardio = form.cardiovascularAndPerfusion;
  const mob = form.mobilityAndPositioning;
  const vitals = form.vitalSignsAndPain;
  const elim = form.eliminationsAndFluidBalance;
  const nut = form.nutritionAndGastrointestinal;
  const dva = form.vasoactiveDrugs;
  const devs = form.devices;

  // UTI-CONS-001: Sedado + informação diretamente referida pelo paciente
  if (
    neuro.consciousnessLevel === 'Sedado' &&
    (cond.informationSource === 'Paciente' || (cond.complaints === 'Com queixa' && cond.informationSource === 'Paciente'))
  ) {
    alerts.push({
      id: 'UTI-CONS-001',
      title: 'Incompatibilidade de Sedação e Informação',
      fieldPath: 'observedCondition.informationSource',
      severity: 'warning',
      message: 'Paciente registrado como sedado, porém com queixas/informações declaradas como referidas diretamente pelo paciente.',
    });
  }

  // UTI-CONS-002: Glasgow baixo + deambula
  if (
    neuro.glasgowScore !== undefined &&
    neuro.glasgowScore <= 8 &&
    (mob.mobility === 'Deambula' || mob.mobility === 'Deambula com auxílio')
  ) {
    alerts.push({
      id: 'UTI-CONS-002',
      title: 'Glasgow Rebaixado e Deambulação',
      fieldPath: 'mobilityAndPositioning.mobility',
      severity: 'warning',
      message: `Escala de Coma de Glasgow rebaixada (${neuro.glasgowScore}) simultânea ao registro de paciente deambulando.`,
    });
  }

  // UTI-CONS-003: VMI + deambula
  if (
    resp.respiratorySupport === 'Ventilação mecânica invasiva' &&
    (mob.mobility === 'Deambula' || mob.mobility === 'Deambula com auxílio')
  ) {
    alerts.push({
      id: 'UTI-CONS-003',
      title: 'VMI e Deambulação',
      fieldPath: 'mobilityAndPositioning.mobility',
      severity: 'warning',
      message: 'Ventilação Mecânica Invasiva (VMI) registrada simultaneamente com deambulação do paciente.',
    });
  }

  // UTI-CONS-004: Sedado + RASS potencialmente incompatível (RASS positivo > 0 com nível Sedado)
  if (
    neuro.consciousnessLevel === 'Sedado' &&
    neuro.rassScore !== undefined &&
    neuro.rassScore > 0
  ) {
    alerts.push({
      id: 'UTI-CONS-004',
      title: 'Sedação com RASS Positivo',
      fieldPath: 'neurologicalAndSedation.rassScore',
      severity: 'warning',
      message: `Nível de consciência registrado como Sedado, porém com escala RASS positiva (+${neuro.rassScore}, indicando agitação/inquietação).`,
    });
  }

  // UTI-CONS-005: Perfusão adequada + TEC >= 3s
  if (
    cardio.peripheralPerfusion === 'Adequada' &&
    (cardio.capillaryRefillTime === '>= 3 segundos' ||
      (cardio.capillaryRefillTime === 'Informar valor' && Number(cardio.capillaryRefillTimeValue) >= 3))
  ) {
    alerts.push({
      id: 'UTI-CONS-005',
      title: 'Perfusão e TEC Divergentes',
      fieldPath: 'cardiovascularAndPerfusion.capillaryRefillTime',
      severity: 'warning',
      message: 'Perfusão periférica declarada como adequada simultaneamente a Tempo de Enchimento Capilar (TEC) prolongado (≥ 3 segundos).',
    });
  }

  // UTI-CONS-006: FR numérica e padrão respiratório potencialmente incompatíveis
  if (vitals.respiratoryRate && resp.respiratoryPattern) {
    const frNum = parseInt(vitals.respiratoryRate, 10);
    if (!isNaN(frNum)) {
      if (frNum >= 24 && resp.respiratoryPattern === 'Bradipneico') {
        alerts.push({
          id: 'UTI-CONS-006',
          title: 'FR e Padrão Respiratório',
          fieldPath: 'respiratoryAndVentilation.respiratoryPattern',
          severity: 'warning',
          message: `Frequência respiratória elevada (${frNum} irpm) registrada com padrão bradipneico.`,
        });
      } else if (frNum <= 10 && resp.respiratoryPattern === 'Taquipneico') {
        alerts.push({
          id: 'UTI-CONS-006',
          title: 'FR e Padrão Respiratório',
          fieldPath: 'respiratoryAndVentilation.respiratoryPattern',
          severity: 'warning',
          message: `Frequência respiratória diminuída (${frNum} irpm) registrada com padrão taquipneico.`,
        });
      }
    }
  }

  // UTI-CONS-007: SVD + diurese espontânea simultaneamente
  const hasSVDInDevices = devs.list?.some((d) => d.type === 'SVD');
  if (elim.urinaryRoute === 'Espontânea' && (hasSVDInDevices || elim.svdPermeable || elim.svdCaliber)) {
    alerts.push({
      id: 'UTI-CONS-007',
      title: 'Via Urinária e Dispositivo SVD',
      fieldPath: 'eliminationsAndFluidBalance.urinaryRoute',
      severity: 'warning',
      message: 'Diurese espontânea selecionada concomitantemente com presença de Sonda Vesical de Demora (SVD).',
    });
  }

  // UTI-CONS-008: Dieta enteral + via enteral ausente
  if (nut.nutritionalStatus === 'Dieta enteral' && !nut.enteralRoute?.trim()) {
    alerts.push({
      id: 'UTI-CONS-008',
      title: 'Dieta Enteral sem Via',
      fieldPath: 'nutritionAndGastrointestinal.enteralRoute',
      severity: 'warning',
      message: 'Dieta enteral em curso sem especificação da via de administração (SNE, SNG, GTT).',
    });
  }

  // UTI-CONS-009: DVA em uso = Sim sem medicamento
  if (dva.inUse === 'Sim') {
    const hasValidDrug = dva.drugsList?.some((d) => d.medication?.trim());
    if (!hasValidDrug) {
      alerts.push({
        id: 'UTI-CONS-009',
        title: 'DVA sem Fármacos Especificados',
        fieldPath: 'vasoactiveDrugs.drugsList',
        severity: 'warning',
        message: 'Drogas vasoativas marcadas como "Sim" sem nenhum medicamento especificado na lista.',
      });
    }
  }

  // UTI-CONS-010: VMI sem via aérea
  if (
    resp.respiratorySupport === 'Ventilação mecânica invasiva' &&
    !resp.mechanicalVentilationAirway?.trim()
  ) {
    alerts.push({
      id: 'UTI-CONS-010',
      title: 'VMI sem Via Aérea Artificial',
      fieldPath: 'respiratoryAndVentilation.mechanicalVentilationAirway',
      severity: 'warning',
      message: 'Ventilação Mecânica Invasiva (VMI) selecionada sem identificação da via aérea artificial (TOT ou Traqueostomia).',
    });
  }

  return alerts;
}
