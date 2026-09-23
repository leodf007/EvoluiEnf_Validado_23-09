/**
 * Types and schema for Nurse SOAP Documentation Module (NURSE_SOAP).
 * Strictly organized around:
 * S - Subjetivo
 * O - Objetivo
 * A - Avaliação Clínica e Diagnósticos Privativos do Enfermeiro
 * P - Plano Assistencial e Intervenções
 */

export type SoapInformationSource =
  | 'paciente'
  | 'familiar'
  | 'cuidador'
  | 'equipe'
  | 'outro';

export type SoapAttendanceType =
  | 'ambulatorial'
  | 'consulta de enfermagem'
  | 'parecer'
  | 'retorno'
  | 'visita domiciliar'
  | 'outro';

export interface NurseSoapContext {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  unit: string; // Unidade / Ambulatório / Setor
  bedOrRoom: string; // Consultório / Leito
}

export interface NurseSoapIdentification {
  attendanceType: SoapAttendanceType;
  reasonForVisit: string; // Motivo do atendimento / Demanda clínica
}

export interface NurseSoapSubjective {
  chiefComplaint: string; // Queixa principal
  informationSource: SoapInformationSource; // Fonte da informação
  sourceDetails: string; // Detalhes da fonte (ex.: cuidador formal, mãe, etc.)
  reportedSymptoms: string; // Sintomas relatados pelo paciente
  patientPerception: string; // Percepção do paciente sobre seu estado
  familyInformation: string; // Informações complementares fornecidas pela família
}

export interface NurseSoapVitalSigns {
  bloodPressure: string; // PA (mmHg)
  meanArterialPressure: string; // PAM (mmHg) aferida direta/manual
  heartRate: string; // FC (bpm)
  respiratoryRate: string; // FR (rpm)
  oxygenSaturation: string; // SpO2 (%)
  temperature: string; // Tax (°C)
  bloodGlucose: string; // HGT / Glicemia capilar (mg/dL)
}

export interface NurseSoapPhysicalExam {
  neurological: string; // Neurológico / Nível de consciência
  respiratory: string; // Respiratório
  cardiovascular: string; // Cardiovascular
  gastrointestinal: string; // Gastrointestinal / Abdome
  urinary: string; // Urinário / Eliminações
  skin: string; // Pele, mucosas e tegumento
}

export interface NurseSoapObjective {
  vitalSigns: NurseSoapVitalSigns;
  physicalExam: NurseSoapPhysicalExam;
  devices: string[]; // Dispositivos em uso (AuthorizedDeviceRegistry)
  deviceDetails: string;
  medicationsInUse: string[]; // Medicamentos em uso (AuthorizedMedicationRegistry)
  medicationDetails: string;
}

export interface NurseSoapAssessment {
  nurseClinicalSynthesis: string; // Síntese clínica manual exclusiva do enfermeiro
}

export interface NurseSoapNursingDiagnoses {
  diagnoses: string[]; // Diagnósticos de enfermagem manuais
  diagnosesText: string; // Descrição ou termos diagnósticos
  clinicalReasoning: string; // Raciocínio clínico do enfermeiro
}

export interface NurseSoapPlan {
  carePlan: string; // Plano assistencial definido pelo enfermeiro
  plannedMonitoring: string; // Monitorização planejada
  patientOrientations: string; // Orientações e educação em saúde
  scheduledEvaluations: string; // Avaliações e retornos programados
}

export interface NurseSoapInterventions {
  executedInterventions: string[]; // Intervenções executadas na consulta
  interventionDetails: string;
}

export interface NurseSoapResponseToCare {
  observedResponse: string; // Resposta observada / tolerância
}

export interface NurseSoapAdditionalInfo {
  notes: string; // Observações adicionais, pendências e encaminhamentos
}

export interface NurseSoapForm {
  context: NurseSoapContext;
  identification: NurseSoapIdentification;
  subjective: NurseSoapSubjective;
  objective: NurseSoapObjective;
  assessment: NurseSoapAssessment;
  nursingDiagnoses: NurseSoapNursingDiagnoses;
  plan: NurseSoapPlan;
  interventions: NurseSoapInterventions;
  responseToCare: NurseSoapResponseToCare;
  additionalInfo: NurseSoapAdditionalInfo;
}

export function createInitialNurseSoapForm(): NurseSoapForm {
  return {
    context: {
      date: '',
      time: '',
      unit: '',
      bedOrRoom: '',
    },
    identification: {
      attendanceType: 'consulta de enfermagem',
      reasonForVisit: '',
    },
    subjective: {
      chiefComplaint: '',
      informationSource: 'paciente',
      sourceDetails: '',
      reportedSymptoms: '',
      patientPerception: '',
      familyInformation: '',
    },
    objective: {
      vitalSigns: {
        bloodPressure: '',
        meanArterialPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        temperature: '',
        bloodGlucose: '',
      },
      physicalExam: {
        neurological: '',
        respiratory: '',
        cardiovascular: '',
        gastrointestinal: '',
        urinary: '',
        skin: '',
      },
      devices: [],
      deviceDetails: '',
      medicationsInUse: [],
      medicationDetails: '',
    },
    assessment: {
      nurseClinicalSynthesis: '',
    },
    nursingDiagnoses: {
      diagnoses: [],
      diagnosesText: '',
      clinicalReasoning: '',
    },
    plan: {
      carePlan: '',
      plannedMonitoring: '',
      patientOrientations: '',
      scheduledEvaluations: '',
    },
    interventions: {
      executedInterventions: [],
      interventionDetails: '',
    },
    responseToCare: {
      observedResponse: '',
    },
    additionalInfo: {
      notes: '',
    },
  };
}
