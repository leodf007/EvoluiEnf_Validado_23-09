import { InvasiveDeviceItem } from './clinical';

export interface NurseAdmissionForm {
  // 1. Contexto da Admissão
  context: {
    moment: string;
    location: string;
    locationCustom?: string;
    accompaniment: string;
    accompanimentCustom?: string;
  };

  // 2. Procedência e Chegada
  origin: {
    patientOrigin: string;
    originCustom?: string;
    arrivalModes: string[];
    arrivalModesCustom?: string;
    accompaniedByTransportTeam: string;
    transportTeamType?: string;
    transportTeamTypeCustom?: string;
  };

  // 3. Identificação e Segurança
  identification: {
    wristbandChecked: string;
    bedSignChecked: string;
    allergies: string;
    allergiesDetails?: string;
    precaution: string;
    precautionCustom?: string;
  };

  // 4. Histórico de Enfermagem e Informações Referidas
  nursingHistory: {
    admissionReason: string;
    historyOfPresentIllness?: string;
    pastMedicalHistory?: string;
    homeMedicationsReported?: string;
    informationSource: string;
    informationSourceCustom?: string;
  };

  // 5. Sinais Vitais e Avaliação da Dor
  vitalSignsAndPain: {
    systolicBP?: string;
    diastolicBP?: string;
    meanArterialPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    temperature?: string;
    bloodGlucose?: string;
    painAssessmentType: string;
    painScaleValue?: number;
    painLocation?: string;
    painCharacteristics?: string;
  };

  // 6. Exame Físico Estruturado - Neurológico
  neurological: {
    consciousnessLevel: string;
    consciousnessCustom?: string;
    orientation: string;
    glasgowScore?: number;
    rassScore?: number;
    pupils: string;
    pupilsCustom?: string;
    photoreaction: string;
    motorResponse?: string;
  };

  // 7. Exame Físico Estruturado - Respiratório
  respiratory: {
    respiratorySupport: string;
    supportCustom?: string;
    oxygenDevice?: string;
    oxygenFlowRate?: string;
    respiratoryPattern: string;
    respiratoryDistress: string;
    breathSounds: string;
    breathSoundsLocation?: string;
    secretion: string;
    secretionDetails?: string;
  };

  // 8. Exame Físico Estruturado - Cardiovascular e Hemodinâmico
  cardiovascular: {
    peripheralPerfusion: string;
    extremities: string;
    capillaryRefillTime: string;
    capillaryRefillTimeValue?: string;
    peripheralPulses: string;
    edema: string;
    edemaLocations?: string[];
  };

  // 9. Exame Físico Estruturado - Gastrointestinal e Nutricional
  gastrointestinal: {
    nutritionalStatus: string;
    abdomenInspection: string;
    abdomenPalpation: string;
    bowelSounds: string;
  };

  // 10. Exame Físico Estruturado - Geniturinário e Eliminações
  elimination: {
    diuresis: string;
    urinaryRoute: string;
    urinaryAspect?: string;
    bowelMovement: string;
    bowelAspect?: string;
  };

  // 11. Exame Físico Estruturado - Tegumentar e Integridade Cutânea
  skin: {
    integrity: string;
    hydration: string;
    coloration?: string;
    lesionLocation?: string;
    lesionDescription?: string;
    lesionDressingPresent?: string;
  };

  // 12. Dispositivos Já Presentes na Admissão
  existingDevices: {
    list: InvasiveDeviceItem[];
  };

  // 13. Avaliação de Riscos Assistenciais de Enfermagem (Identificados pelo Enfermeiro)
  riskAssessment: {
    fallRisk: string; // 'Baixo risco', 'Médio risco', 'Alto risco', 'Não avaliado'
    pressureInjuryRisk: string; // 'Baixo risco', 'Risco moderado', 'Alto risco', 'Não avaliado'
    aspirationRisk: string; // 'Presente', 'Ausente', 'Não avaliado'
    deviceDislodgementRisk: string; // 'Presente', 'Ausente', 'Não avaliado'
  };

  // 14. Procedimentos e Cuidados de Entrada Realizados pelo Enfermeiro
  initialNursingCare: {
    careItems: string[];
    otherCareDescription?: string;
  };

  // 15. Dispositivos Instalados na Admissão
  installedDevices: {
    installedInAdmission: string;
    list: InvasiveDeviceItem[];
  };

  // 16. Pertences do Paciente
  belongings: {
    status: string;
    statusCustom?: string;
  };

  // 17. Intercorrências e Comunicação Multiprofissional
  complicationsAndCommunication: {
    hasComplication: string;
    complicationTime?: string;
    complicationDescription?: string;
    nursingActionsTaken?: string;
    patientResponse?: string;
    communicatedToMedicalTeam?: string;
    communicationTime?: string;
  };

  // 18. Condutas / Plano Inicial de Cuidados de Enfermagem
  nursingPlan: {
    planItems: string[];
    customPlanDetails?: string;
  };

  // 19. Situação Final da Admissão e Encaminhamento
  finalStatus: {
    conditions: string[];
    conditionCustom?: string;
  };

  // 20. Informações Adicionais / Observações
  additionalInformation: string;
}
