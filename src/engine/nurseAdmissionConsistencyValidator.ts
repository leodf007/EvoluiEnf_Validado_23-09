import { NurseAdmissionForm } from '../types/nurseAdmissionClinical';
import { ClinicalConsistencyAlert } from './types';

/**
 * Validates clinical consistency specifically for the Nurse Admission module.
 * Alerts are non-blocking advisory indicators.
 */
export function validateNurseAdmissionClinicalConsistency(
  form: Partial<NurseAdmissionForm>
): ClinicalConsistencyAlert[] {
  const alerts: ClinicalConsistencyAlert[] = [];

  // 1. NUR-CONS-001: Sedado + queixa direta sem fonte de terceiros
  if (
    form.neurological?.consciousnessLevel === 'Sedado' &&
    form.nursingHistory?.admissionReason &&
    form.nursingHistory?.informationSource === 'Paciente'
  ) {
    alerts.push({
      id: 'NUR-CONS-001',
      fieldPath: 'nursingHistory.informationSource',
      message: 'Paciente registrado como sedado, porém a fonte do relato foi informada como o próprio paciente.',
      severity: 'warning',
      suggestedFix: 'Verifique se a fonte das informações foi acompanhante, equipe de transporte ou prontuário.',
    });
  }

  // 2. NUR-CONS-002: Glasgow rebaixado (<=8) sem registro de risco de broncoaspiração ou via aérea avançada
  if (
    form.neurological?.glasgowScore !== undefined &&
    form.neurological.glasgowScore <= 8 &&
    form.riskAssessment?.aspirationRisk !== 'Presente'
  ) {
    alerts.push({
      id: 'NUR-CONS-002',
      fieldPath: 'riskAssessment.aspirationRisk',
      message: 'Escala de Glasgow ≤ 8 sugere rebaixamento importante de consciência. Considere registrar o risco de broncoaspiração.',
      severity: 'info',
    });
  }

  // 3. NUR-CONS-003: Dispositivo em lista de existentes com mesmo tipo e sítio na lista de instalados
  if (
    form.existingDevices?.list &&
    form.installedDevices?.installedInAdmission === 'Sim' &&
    form.installedDevices?.list
  ) {
    const existingPairs = form.existingDevices.list.map(
      (d) => `${(d.type || '').trim().toLowerCase()}-${(d.location || '').trim().toLowerCase()}`
    );
    form.installedDevices.list.forEach((instDev) => {
      const instPair = `${(instDev.type || '').trim().toLowerCase()}-${(instDev.location || '').trim().toLowerCase()}`;
      if (existingPairs.includes(instPair) && instPair !== '-') {
        alerts.push({
          id: 'NUR-CONS-003',
          fieldPath: 'installedDevices.list',
          message: `O dispositivo ${instDev.type} (${instDev.location}) consta simultaneamente como já existente e como instalado na admissão.`,
          severity: 'warning',
          suggestedFix: 'Diferencie se o dispositivo já vinha na admissão ou se foi puncionado/instalado durante o atendimento.',
        });
      }
    });
  }

  // 4. NUR-CONS-004: Intercorrência sim sem descrição
  if (
    form.complicationsAndCommunication?.hasComplication === 'Sim' &&
    !form.complicationsAndCommunication.complicationDescription?.trim()
  ) {
    alerts.push({
      id: 'NUR-CONS-004',
      fieldPath: 'complicationsAndCommunication.complicationDescription',
      message: 'Foi indicada a ocorrência de intercorrência na admissão, mas a descrição está vazia.',
      severity: 'warning',
    });
  }

  return alerts;
}
