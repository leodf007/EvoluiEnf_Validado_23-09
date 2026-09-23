export interface NursePediatricInvasiveDeviceItem {
  id: string;
  type: string;
  anatomicalSite: string;
  laterality: string;
  siteCondition: string;
  dressingCondition: string;
  permeability: string;
}

export interface NursePediatricContext {
  moment: string; // 'Recebo paciente' | 'Avalio paciente' | 'Reavalio paciente' | 'Evolução do plantão' | 'Início do plantão' | 'Outro' | ''
  customMoment?: string;
  location: string; // 'Enfermaria Pediátrica' | 'Unidade Pediátrica' | 'Leito' | 'Berçário' | 'Observação' | 'Outro' | ''
  customLocation?: string;
}

export interface NursePediatricSafety {
  wristband: string; // 'Presente e conferida' | 'Ausente' | 'Não se aplica' | 'Não informado' | ''
  bedIdentification: string; // 'Presente e conferida' | 'Ausente' | 'Não se aplica' | 'Não informado' | ''
  precautions: string; // 'Padrão' | 'Contato' | 'Gotículas' | 'Aerossóis' | 'Outra' | 'Não informado' | ''
  customPrecautions?: string;
  allergies: string; // 'Não referidas' | 'Sim' | 'Não informado' | ''
  allergyDescription?: string;
}

export interface NursePediatricData {
  age: string; // Informado manualmente (ex: "8 meses", "3 anos") - NUNCA inventar
  weight: string; // Informado manualmente em kg (ex: "8", "14.5")
  weightUnit: string; // 'kg'
  height: string; // Informado manualmente em cm (ex: "72", "105")
  heightUnit: string; // 'cm'
  sex: string; // 'Masculino' | 'Feminino' | 'Não informado' | ''
  // OBS: É estritamente proibido calcular IMC, percentil, escore-z ou adequação nutricional/antropométrica
}

export interface NursePediatricGuardian {
  presence: string; // 'Acompanhado' | 'Desacompanhado' | 'Não informado' | ''
  guardianType: string; // 'Mãe' | 'Pai' | 'Responsável legal' | 'Cuidador' | 'Familiar' | 'Outro' | 'Desacompanhado' | ''
  customGuardianType?: string;
  // Jamais solicitar ou expor nome nominal do responsável (PrivacyGuard)
}

export interface NursePediatricInfoSource {
  source: string; // 'Paciente' | 'Responsável' | 'Equipe' | 'Outro' | 'Não informado' | ''
  customSource?: string;
}

export interface NursePediatricGeneralAssessment {
  generalState: string; // 'Bom' | 'Regular' | 'Mau' | 'Não informado' | ''
  complaint: string; // 'Sem queixas' | 'Com queixa' | 'Não avaliado' | 'Não informado' | ''
  complaintDescription?: string;
}

export interface NursePediatricBehavior {
  behavior: string[]; // ['Tranquilo', 'Choroso', 'Irritado', 'Agitado', 'Sonolento', 'Hipoativo', 'Cooperativo', 'Outro']
  customBehavior?: string;
  activity: string; // 'Ativa' | 'Reduzida' | 'Restrita' | 'Outro' | 'Não avaliada' | ''
  customActivity?: string;
}

export interface NursePediatricPain {
  scale: string; // 'Escala numérica 0–10' | 'Escala de faces' | 'FLACC' | 'Outra' | 'Não avaliável' | 'Sem dor' | ''
  score: string; // Valor informado sem conversão
  location?: string;
  analgesiaAdministered: string; // 'Sim' | 'Não' | 'Não se aplica' | ''
  analgesiaDetails?: string;
}

export interface NursePediatricVitalSigns {
  systolicBP: string;
  diastolicBP: string;
  meanArterialPressure: string; // PAM manual informada pelo enfermeiro, NUNCA calculada
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  capillaryBloodGlucose: string;
}

export interface NursePediatricNeurological {
  consciousness: string; // 'Consciente' | 'Sonolento' | 'Torporoso' | 'Comatoso' | 'Outro' | 'Não avaliado' | ''
  orientation: string; // 'Orientado' | 'Desorientado' | 'Não se aplica' | 'Não avaliado' | ''
  pupils: string; // 'Isocóricas e fotorreagentes' | 'Anisocóricas' | 'Midriáticas' | 'Mióticas' | 'Não avaliadas' | ''
  observedResponse: string; // Reações observadas factuais
}

export interface NursePediatricRespiratory {
  support: string; // 'Ar ambiente' | 'Oxigenoterapia' | 'VNI' | 'VMI' | 'Traqueostomia' | 'Outro' | ''
  supportDetails?: string;
  pattern: string; // 'Eupneico' | 'Taquipneico' | 'Bradipneico' | 'Dispneico' | 'Outro' | ''
  discomfort: string; // 'Ausente' | 'Tiragem intercostal' | 'Batimento de asa de nariz' | 'Retração subcostal' | 'Gemência' | 'Presente' | ''
  auscultation: string; // 'Murmúrio vesicular presente bilateralmente sem ruídos adventícios' | 'Ruídos adventícios presentes' | 'Não avaliada' | ''
  adventitiousDetails?: string;
}

export interface NursePediatricCardiovascular {
  auscultation: string; // 'Bulhas normofonéticas e rítmicas' | 'Sopro cardíaco' | 'Bulhas alteradas' | 'Não avaliada' | ''
  perfusion: string; // 'Boa / Preservada (TEC < 2s)' | 'Lentificada (TEC > 2s)' | 'Não avaliada' | ''
  extremities: string; // 'Aquecidas' | 'Frias' | 'Cianóticas' | 'Pálidas' | ''
  pulses: string; // 'Cheios e simétricos' | 'Filiformes' | 'Diminuídos' | 'Não avaliados' | ''
  edema: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  edemaDetails?: string;
}

export interface NursePediatricGastrointestinal {
  abdomen: string; // 'Plano, flácido e indolor' | 'Distendido' | 'Globoso' | 'Doloroso à palpação' | 'Outro' | ''
  bowelSounds: string; // 'Presentes e normoativos' | 'Aumentados' | 'Diminuídos' | 'Ausentes' | 'Não avaliados' | ''
  palpationPain: string; // 'Ausente' | 'Presente' | 'Não avaliada' | ''
  palpationPainLocation?: string;
  vomitingRegurgitation: string; // 'Ausente' | 'Náuseas' | 'Vômitos' | 'Regurgitação' | 'Outro' | ''
  vomitingDetails?: string;
}

export interface NursePediatricNutrition {
  feedingType: string; // 'Aleitamento materno exclusivo' | 'Aleitamento materno complementar' | 'Fórmula infantil' | 'Via oral' | 'Enteral' | 'Parenteral' | 'Jejum' | 'Outro' | ''
  acceptance: string; // 'Boa aceitação' | 'Aceitação parcial' | 'Recusa alimentar' | 'Não se aplica' | ''
  enteralDevice?: string; // 'SNE' | 'SNG' | 'GTT' | ''
  enteralRate?: string;
  enteralTolerance?: string;
}

export interface NursePediatricEliminations {
  diuresis: string; // 'Espontânea em fralda' | 'Espontânea no vaso/comadre' | 'SVD' | 'Ausente/anúria' | 'Não informado' | ''
  diuresisVolume?: string;
  diuresisAspect: string; // 'Amarelo claro' | 'Concentrada' | 'Hematúrica' | 'Outro' | ''
  bowel: string; // 'Presente' | 'Ausente no plantão' | 'Constipação' | 'Diarreia' | 'Não informado' | ''
  bowelCharacteristics?: string;
}

export interface NursePediatricSkin {
  integrity: string; // 'Íntegra' | 'Lesão presente' | 'Assadura / dermatite' | 'Hematoma / equimose' | 'Não avaliada' | ''
  lesionLocation?: string;
  lesionDescription?: string;
  dressings: string; // 'Ausentes' | 'Presentes' | ''
  dressingDetails?: string;
}

export interface NursePediatricDevices {
  hasDevices: string; // 'Não' | 'Sim' | 'Não informado' | ''
  list: NursePediatricInvasiveDeviceItem[];
}

export interface NursePediatricMobility {
  mobility: string; // 'No leito' | 'Deambula sem auxílio' | 'Deambula com auxílio' | 'No colo do acompanhante' | 'Em berço' | 'Restrito' | 'Outro' | ''
  customMobility?: string;
}

export interface NursePediatricHygiene {
  bath: string; // 'Não realizado' | 'Banho no leito' | 'Banho de aspersão' | 'Banho de imersão/banheira' | 'Outro' | ''
  bathTolerance?: string; // 'Boa tolerância' | 'Choro / irritabilidade' | 'Instabilidade' | 'Outro' | ''
}

export interface NursePediatricSleep {
  pattern: string; // 'Repousou tranquilamente' | 'Sono entrecortado' | 'Agitação noturna' | 'Sonolência excessiva' | 'Não observado' | ''
  details?: string;
}

export interface NursePediatricRisks {
  fallRisk: string; // 'Baixo' | 'Moderado' | 'Alto' | 'Grade elevada mantida' | 'Não avaliado' | ''
  aspirationRisk: string; // 'Presente' | 'Ausente' | 'Não avaliado' | ''
  pressureUlcerRisk: string; // 'Baixo' | 'Moderado' | 'Alto' | 'Não avaliado' | ''
  otherRisks?: string;
}

export interface NursePediatricCare {
  performed: string[];
  customCare?: string;
}

export interface NursePediatricResponseToCare {
  evaluated: string; // 'Sim' | 'Não' | 'Não se aplica' | ''
  interventionTarget: string;
  observedResponse: string;
}

export interface NursePediatricComplications {
  hasComplication: string; // 'Não' | 'Sim' | 'Não informado' | ''
  description?: string;
  immediateAction?: string;
  communicationDone?: string;
  responseObserved?: string;
}

export interface NursePediatricCommunication {
  familyOrientation: string; // 'Sim, responsável orientado' | 'Não' | 'Não se aplica' | ''
  shiftHandover: string; // 'Realizada passagem de plantão' | 'Não realizada' | ''
  multiprofessionalContact?: string;
}

export interface NursePediatricComparison {
  status: string; // 'Melhora clínica' | 'Quadro estável' | 'Piora clínica' | 'Primeira avaliação' | 'Não informado' | ''
  details?: string;
}

export interface NursePediatricSynthesis {
  synthesisText: string;
}

export interface NursePediatricStatus {
  patientStatus: string; // 'Permanece no leito em repouso' | 'Permanece no colo do acompanhante' | 'Permanece no berço estável' | 'Aguardando alta hospitalar' | 'Outro' | ''
  customPatientStatus?: string;
  pendingIssues: string;
}

export interface NursePediatricEvolutionForm {
  context: NursePediatricContext;
  safety: NursePediatricSafety;
  pediatricData: NursePediatricData;
  guardian: NursePediatricGuardian;
  infoSource: NursePediatricInfoSource;
  generalAssessment: NursePediatricGeneralAssessment;
  behavior: NursePediatricBehavior;
  pain: NursePediatricPain;
  vitalSigns: NursePediatricVitalSigns;
  neurological: NursePediatricNeurological;
  respiratory: NursePediatricRespiratory;
  cardiovascular: NursePediatricCardiovascular;
  gastrointestinal: NursePediatricGastrointestinal;
  nutrition: NursePediatricNutrition;
  eliminations: NursePediatricEliminations;
  skin: NursePediatricSkin;
  devices: NursePediatricDevices;
  mobility: NursePediatricMobility;
  hygiene: NursePediatricHygiene;
  sleep: NursePediatricSleep;
  risks: NursePediatricRisks;
  care: NursePediatricCare;
  responseToCare: NursePediatricResponseToCare;
  complications: NursePediatricComplications;
  communication: NursePediatricCommunication;
  comparison: NursePediatricComparison;
  nursingSynthesis: NursePediatricSynthesis;
  currentStatus: NursePediatricStatus;
}

export function createInitialNursePediatricEvolutionForm(): NursePediatricEvolutionForm {
  return {
    context: {
      moment: '',
      customMoment: '',
      location: '',
      customLocation: '',
    },
    safety: {
      wristband: '',
      bedIdentification: '',
      precautions: '',
      customPrecautions: '',
      allergies: '',
      allergyDescription: '',
    },
    pediatricData: {
      age: '',
      weight: '',
      weightUnit: 'kg',
      height: '',
      heightUnit: 'cm',
      sex: '',
    },
    guardian: {
      presence: '',
      guardianType: '',
      customGuardianType: '',
    },
    infoSource: {
      source: '',
      customSource: '',
    },
    generalAssessment: {
      generalState: '',
      complaint: '',
      complaintDescription: '',
    },
    behavior: {
      behavior: [],
      customBehavior: '',
      activity: '',
      customActivity: '',
    },
    pain: {
      scale: '',
      score: '',
      location: '',
      analgesiaAdministered: '',
      analgesiaDetails: '',
    },
    vitalSigns: {
      systolicBP: '',
      diastolicBP: '',
      meanArterialPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      capillaryBloodGlucose: '',
    },
    neurological: {
      consciousness: '',
      orientation: '',
      pupils: '',
      observedResponse: '',
    },
    respiratory: {
      support: '',
      supportDetails: '',
      pattern: '',
      discomfort: '',
      auscultation: '',
      adventitiousDetails: '',
    },
    cardiovascular: {
      auscultation: '',
      perfusion: '',
      extremities: '',
      pulses: '',
      edema: '',
      edemaDetails: '',
    },
    gastrointestinal: {
      abdomen: '',
      bowelSounds: '',
      palpationPain: '',
      palpationPainLocation: '',
      vomitingRegurgitation: '',
      vomitingDetails: '',
    },
    nutrition: {
      feedingType: '',
      acceptance: '',
      enteralDevice: '',
      enteralRate: '',
      enteralTolerance: '',
    },
    eliminations: {
      diuresis: '',
      diuresisVolume: '',
      diuresisAspect: '',
      bowel: '',
      bowelCharacteristics: '',
    },
    skin: {
      integrity: '',
      lesionLocation: '',
      lesionDescription: '',
      dressings: '',
      dressingDetails: '',
    },
    devices: {
      hasDevices: 'Não',
      list: [],
    },
    mobility: {
      mobility: '',
      customMobility: '',
    },
    hygiene: {
      bath: '',
      bathTolerance: '',
    },
    sleep: {
      pattern: '',
      details: '',
    },
    risks: {
      fallRisk: '',
      aspirationRisk: '',
      pressureUlcerRisk: '',
      otherRisks: '',
    },
    care: {
      performed: [],
      customCare: '',
    },
    responseToCare: {
      evaluated: '',
      interventionTarget: '',
      observedResponse: '',
    },
    complications: {
      hasComplication: 'Não',
      description: '',
      immediateAction: '',
      communicationDone: '',
      responseObserved: '',
    },
    communication: {
      familyOrientation: '',
      shiftHandover: '',
      multiprofessionalContact: '',
    },
    comparison: {
      status: '',
      details: '',
    },
    nursingSynthesis: {
      synthesisText: '',
    },
    currentStatus: {
      patientStatus: '',
      customPatientStatus: '',
      pendingIssues: '',
    },
  };
}
