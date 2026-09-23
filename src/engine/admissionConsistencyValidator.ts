import { TechnicianAdmissionForm } from '../types/admissionClinical';
import { ConsistencyAlert } from './clinicalConsistencyValidator';

/**
 * validateAdmissionClinicalConsistency:
 * Deterministic validator for Admission Nursing Notes (Admissão — Anotação de Enfermagem).
 * Flags potentially inconsistent selections strictly for human review.
 * All alerts are NON-BLOCKING.
 */
export function validateAdmissionClinicalConsistency(
  form: Partial<TechnicianAdmissionForm>
): ConsistencyAlert[] {
  const alerts: ConsistencyAlert[] = [];

  const neuro = form.neurological;
  const rep = form.reportedInformation;
  const mob = form.mobility;
  const resp = form.respiratory;
  const orig = form.origin;
  const existingDevs = form.existingDevices?.list || [];
  const installedDevs = form.installedDevices?.list || [];
  const comp = form.complications;
  const comm = form.communications;

  // ==========================================
  // ADM-CONS-001: Sedado + informação diretamente referida pelo paciente
  // ==========================================
  const isSedated = neuro?.consciousnessLevel === 'Sedado';
  const isDirectPatientReport =
    rep?.informationSource === 'Paciente' &&
    (rep?.complaints === 'Sem queixas referidas no momento' ||
      (rep?.complaints === 'Com queixa' && !!rep?.complaintsDetails?.trim()));

  if (isSedated && isDirectPatientReport) {
    alerts.push({
      id: 'ADM-CONS-001',
      ruleId: 'ADM-CONS-001',
      message:
        'Foi registrado que o paciente está sedado e também uma queixa/informação referida diretamente pelo próprio paciente. Verifique os dados.',
      fieldsInvolved: ['neurological.consciousnessLevel', 'reportedInformation.complaints', 'reportedInformation.informationSource'],
      sectionIndex: 3,
      sectionTitle: 'Informações Referidas / Neurológico',
    });
  }

  // ==========================================
  // ADM-CONS-002: Glasgow baixo (<= 8) + deambulação
  // ==========================================
  const glasgowVal = neuro?.glasgowScore;
  const isAmbulating =
    mob?.condition === 'Deambula sem auxílio' || mob?.condition === 'Deambula com auxílio';

  if (glasgowVal !== undefined && glasgowVal !== null && Number(glasgowVal) <= 8 && isAmbulating) {
    alerts.push({
      id: 'ADM-CONS-002',
      ruleId: 'ADM-CONS-002',
      message:
        'As informações registradas sobre nível de consciência (Glasgow) e deambulação podem precisar de revisão.',
      fieldsInvolved: ['neurological.glasgowScore', 'mobility.condition'],
      sectionIndex: 6,
      sectionTitle: 'Neurológico / Mobilidade',
    });
  }

  // ==========================================
  // ADM-CONS-003: VMI + deambulação
  // ==========================================
  const isVMI = resp?.respiratorySupport === 'VMI';
  if (isVMI && isAmbulating) {
    alerts.push({
      id: 'ADM-CONS-003',
      ruleId: 'ADM-CONS-003',
      message:
        'O suporte ventilatório invasivo (VMI) e a mobilidade deambulando registrados podem precisar de revisão.',
      fieldsInvolved: ['respiratory.respiratorySupport', 'mobility.condition'],
      sectionIndex: 7,
      sectionTitle: 'Respiratório / Mobilidade',
    });
  }

  // ==========================================
  // ADM-CONS-004: Dispositivo listado como "já presente" e simultaneamente "instalado durante admissão"
  // ==========================================
  if (existingDevs.length > 0 && installedDevs.length > 0 && form.installedDevices?.installedInAdmission === 'Sim') {
    const existingKeys = existingDevs.map(
      (d) => `${(d.type || '').trim().toLowerCase()}_${(d.location || '').trim().toLowerCase()}`
    );
    const hasDuplicate = installedDevs.some((d) =>
      existingKeys.includes(`${(d.type || '').trim().toLowerCase()}_${(d.location || '').trim().toLowerCase()}`)
    );

    if (hasDuplicate) {
      alerts.push({
        id: 'ADM-CONS-004',
        ruleId: 'ADM-CONS-004',
        message:
          'Um mesmo dispositivo foi registrado simultaneamente como já presente na admissão e como instalado durante o atendimento. Verifique a seleção.',
        fieldsInvolved: ['existingDevices.list', 'installedDevices.list'],
        sectionIndex: 11,
        sectionTitle: 'Dispositivos na Admissão',
      });
    }
  }

  // ==========================================
  // ADM-CONS-005: Chegada em maca + deambula sem auxílio
  // ==========================================
  const arrivedInMaca = orig?.arrivalModes?.includes('Maca');
  const deambulaSemAuxilio = mob?.condition === 'Deambula sem auxílio';

  if (arrivedInMaca && deambulaSemAuxilio) {
    alerts.push({
      id: 'ADM-CONS-005',
      ruleId: 'ADM-CONS-005',
      message:
        'Foi registrada chegada ao setor em maca e simultaneamente mobilidade deambula sem auxílio. Verifique se as informações procedem.',
      fieldsInvolved: ['origin.arrivalModes', 'mobility.condition'],
      sectionIndex: 1,
      sectionTitle: 'Forma de Chegada / Mobilidade',
    });
  }

  // ==========================================
  // ADM-CONS-006: Intercorrência = Sim sem descrição
  // ==========================================
  if (comp?.hasComplication === 'Sim' && !comp.description?.trim()) {
    alerts.push({
      id: 'ADM-CONS-006',
      ruleId: 'ADM-CONS-006',
      message:
        'Foi indicado que houve intercorrência durante a admissão, mas a descrição da ocorrência não foi preenchida.',
      fieldsInvolved: ['complications.hasComplication', 'complications.description'],
      sectionIndex: 18,
      sectionTitle: 'Intercorrências na Admissão',
    });
  }

  // ==========================================
  // ADM-CONS-007: Comunicação = Sim sem profissional/equipe
  // ==========================================
  if (comm?.communicationNeeded === 'Sim' && !comm.professionalType?.trim()) {
    alerts.push({
      id: 'ADM-CONS-007',
      ruleId: 'ADM-CONS-007',
      message:
        'Foi indicado que houve comunicação adicional, mas o profissional ou equipe comunicada não foi selecionado.',
      fieldsInvolved: ['communications.communicationNeeded', 'communications.professionalType'],
      sectionIndex: 18,
      sectionTitle: 'Comunicação Assistencial',
    });
  }

  // ADM-CONS-008: Sem inconsistências -> retorna []
  return alerts;
}
