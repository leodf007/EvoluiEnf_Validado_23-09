export interface NurseMedicalInvasiveDeviceItem {
  id: string;
  type: string;
  anatomicalSite: string;
  laterality: string;
  siteCondition: string;
  dressingCondition: string;
  permeability: string;
}

export type InvasiveDeviceItem = NurseMedicalInvasiveDeviceItem;

export interface NurseMedicalContext {
  moment: string; // 'Avalio paciente' | 'Reavalio paciente' | 'Evolução do período' | 'Outro' | ''
  customMoment?: string;
  location: string; // 'Clínica Médica' | 'Enfermaria' | 'Leito' | 'Quarto' | 'Outro' | ''
  customLocation?: string;
  escort: string; // 'Desacompanhado' | 'Familiar' | 'Responsável' | 'Cuidador' | 'Não informado' | 'Outro' | ''
  customEscort?: string;
  wristbandIdentification: string; // 'Sim' | 'Não' | 'Não se aplica' | 'Não informado' | ''
  bedIdentification: string; // 'Sim' | 'Não' | 'Não se aplica' | 'Não informado' | ''
  precaution: string; // 'Padrão' | 'Contato' | 'Gotículas' | 'Aerossóis' | 'Outra' | 'Não informado' | ''
  customPrecaution?: string;
  hasAllergies: string; // 'Não referidas' | 'Sim' | 'Não informado' | ''
  allergyDescription?: string;
}

export interface NurseMedicalGeneralAssessment {
  generalState: string; // 'Bom' | 'Regular' | 'Mau' | 'Não informado' | ''
  consciousness: string; // 'Consciente' | 'Sonolento' | 'Torporoso' | 'Outro' | 'Não avaliado' | ''
  customConsciousness?: string;
  behavior: string[]; // ['Calmo', 'Cooperativo', 'Agitado', 'Ansioso', 'Hipoativo', 'Outro', 'Não avaliado']
  customBehavior?: string;
  complaintStatus: string; // 'Sem queixas referidas' | 'Com queixa' | 'Impossibilitado de informar' | 'Não informado' | 'Não avaliado' | ''
  complaintDescription?: string;
  informationSource: string; // 'Paciente' | 'Familiar' | 'Equipe' | 'Outro' | 'Não informado' | ''
  customInformationSource?: string;
}

export interface NurseMedicalVitalSigns {
  systolicBP: string;
  diastolicBP: string;
  meanArterialPressure: string; // PAM manual informada pelo enfermeiro, nunca calculada
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  capillaryBloodGlucose: string;
}

export interface NurseMedicalPain {
  painScaleType: string; // 'Escala numérica 0–10' | 'Outra escala' | 'Não avaliável' | 'Não avaliada' | 'Não informado' | ''
  painScore: string;
  customScale?: string;
  painLocation: string;
  painCharacteristic: string;
  painObservation: string;
}

export interface NurseMedicalNeurological {
  consciousnessLevel: string; // 'Consciente' | 'Sonolento' | 'Torporoso' | 'Comatoso' | 'Sedado' | 'Outro' | 'Não avaliado' | ''
  customConsciousness?: string;
  orientation: string; // 'Orientado em tempo e espaço' | 'Parcialmente orientado' | 'Desorientado' | 'Não avaliável' | 'Não avaliado' | ''
  glasgowScore: string; // '3'..'15', 'Não aplicado', 'Não avaliado', ''
  pupils: string; // 'Isocóricas' | 'Anisocóricas' | 'Mióticas' | 'Midriáticas' | 'Outra' | 'Não avaliadas' | ''
  customPupils?: string;
  photoreaction: string; // 'Fotorreagentes' | 'Lentificadas' | 'Não reagentes' | 'Outra' | 'Não avaliada' | ''
  customPhotoreaction?: string;
  motorDeficit: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  motorDeficitDescription?: string;
}

export interface NurseMedicalRespiratory {
  respiratorySupport: string; // 'Ar ambiente' | 'Oxigenoterapia' | 'VNI' | 'VMI' | 'Traqueostomia' | 'Outro' | 'Não informado' | ''
  customSupport?: string;
  oxygenDevice?: string; // 'Cateter nasal' | 'Máscara de Venturi' | 'Máscara com reservatório' | 'Outro'
  oxygenFlowRate?: string;
  oxygenFiO2?: string;
  respiratoryPattern: string; // 'Eupneico' | 'Taquipneico' | 'Bradipneico' | 'Outro' | 'Não avaliado' | ''
  customPattern?: string;
  respiratoryDistress: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  pulmonaryAuscultationPerformed: string; // 'Não' | 'Sim' | ''
  vesicularMurmur?: string; // 'Presente bilateralmente' | 'Diminuído' | 'Ausente em região informada' | 'Assimétrico' | 'Outro' | ''
  adventitiousSounds?: string; // 'Ausentes' | 'Presentes' | 'Não avaliados' | ''
  adventitiousSoundTypes?: string[]; // ['Roncos', 'Sibilos', 'Estertores finos', 'Estertores grossos', 'Estridor', 'Outro']
  adventitiousSoundLocation?: string;
}

export interface NurseMedicalCardiovascular {
  peripheralPerfusion: string; // 'Adequada' | 'Reduzida' | 'Não avaliada' | ''
  extremities: string; // 'Aquecidas' | 'Frias' | 'Outras' | 'Não avaliadas' | ''
  customExtremities?: string;
  capillaryRefillTime: string; // '< 3 segundos' | '≥ 3 segundos' | 'Não avaliado' | ''
  customRefillTime?: string;
  edema: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  edemaLocation?: string;
  edemaGrade?: string; // '1+/4+', '2+/4+', '3+/4+', '4+/4+'
  cardiacAuscultationPerformed?: string; // 'Não' | 'Sim' | ''
  heartSounds?: string; // 'Normofonéticas' | 'Hipofonéticas' | 'Hiperfonéticas' | 'Outra' | ''
  rhythm?: string; // 'Regular' | 'Irregular' | 'Outro' | ''
}

export interface NurseMedicalGastrointestinal {
  abdomenForm: string; // 'Plano' | 'Globoso' | 'Distendido' | 'Outro' | 'Não avaliado' | ''
  customAbdomenForm?: string;
  abdomenConsistency: string; // 'Flácido' | 'Tenso' | 'Outro' | 'Não avaliado' | ''
  customAbdomenConsistency?: string;
  abdomenPalpation: string; // 'Indolor' | 'Dolorosa' | 'Não realizada' | ''
  abdomenPainLocation?: string;
  bowelSounds: string; // 'Presentes' | 'Ausentes' | 'Hipoativos' | 'Hiperativos' | 'Não avaliados' | ''
}

export interface NurseMedicalNutrition {
  nutritionalRoute: string; // 'Via oral' | 'Dieta enteral' | 'Dieta parenteral' | 'Jejum' | 'Outra' | 'Não informado' | ''
  customRoute?: string;
  oralAcceptance?: string; // 'Boa' | 'Moderada' | 'Baixa' | 'Recusa' | 'Não informada' | ''
  enteralDevice?: string; // 'SNE' | 'SNG' | 'GTT' | 'Outro' | ''
  enteralRate?: string;
  enteralTolerance?: string; // 'Boa tolerância' | 'Náuseas/vômitos' | 'Distensão abdominal' | 'Resíduo gástrico aumentado' | 'Outra' | 'Não informada' | ''
  nutritionObservation?: string;
}

export interface NurseMedicalEliminations {
  diuresis: string; // 'Presente' | 'Ausente' | 'Não avaliada' | 'Não informado' | ''
  urinaryRoute: string; // 'Espontânea' | 'SVD' | 'Outra' | 'Não informado' | ''
  customUrinaryRoute?: string;
  urineAspect?: string;
  bowelElimination: string; // 'Presentes' | 'Ausentes' | 'Não avaliadas' | 'Não informado' | ''
  bowelAspect?: string;
}

export interface NurseMedicalDevices {
  list: InvasiveDeviceItem[];
}

export interface NurseMedicalSkin {
  integrity: string; // 'Íntegra' | 'Com alteração/lesão' | 'Não avaliada' | ''
  hydration: string; // 'Hidratada' | 'Ressecada' | 'Não avaliada' | ''
  customHydration?: string;
  lesionLocation?: string;
  lesionCharacteristics?: string;
  lesionDressing?: string;
}

export interface NurseMedicalMobility {
  mobility: string; // 'Deambula sem auxílio' | 'Deambula com auxílio' | 'Restrito ao leito' | 'Cadeira de rodas' | 'Outro' | 'Não avaliado' | ''
  customMobility?: string;
  repositioning: string; // 'Não realizada' | 'Realizada' | 'Não informado' | ''
  repositioningInterval?: string;
}

export interface NurseMedicalHygiene {
  hygieneStatus: string; // 'Preservada' | 'Necessita auxílio' | 'Realizada' | 'Não avaliada' | 'Não informado' | ''
  bath: string; // 'Não realizado' | 'Banho no leito' | 'Banho de aspersão' | 'Banho com auxílio' | 'Não informado' | ''
  bathTolerance?: string; // 'Boa tolerância' | 'Cansaço/dispneia' | 'Recusa' | 'Outra' | ''
}

export interface NurseMedicalRiskAssessment {
  fallRiskStatus: string; // 'Não avaliado' | 'Avaliado' | ''
  fallRiskScale?: string;
  fallRiskScore?: string;
  fallRiskClassification?: string;
  pressureInjuryRiskStatus: string; // 'Não avaliado' | 'Avaliado' | ''
  pressureInjuryScale?: string;
  pressureInjuryScore?: string;
  pressureInjuryClassification?: string;
  otherRisks?: string;
}

export interface NurseMedicalCareDone {
  careItems: string[];
  customCareDetails?: string;
}

export interface NurseMedicalResponseToCare {
  evaluated: string; // 'Não avaliada' | 'Sim' | 'Não informado' | ''
  interventionDone?: string;
  observedResponse?: string;
  structuredResponseText?: string;
}

export interface NurseMedicalComplications {
  hasComplication: string; // 'Não' | 'Sim' | 'Não informado' | ''
  description?: string;
  time?: string;
  actionsTaken?: string;
  communicatedToTeam?: string;
  communicatedWho?: string;
  patientResponse?: string;
}

export interface NurseMedicalCommunication {
  hasCommunication: string; // 'Não' | 'Sim' | 'Não informado' | ''
  target?: string;
  time?: string;
  reason?: string;
  responseObserved?: string;
}

export interface NurseMedicalComparisonWithPrevious {
  statusChange: string; // 'Sem alteração observada' | 'Alteração registrada' | 'Não comparável' | 'Não informado' | ''
  changeDescription?: string;
}

export interface NurseMedicalNursingSynthesis {
  synthesisText: string; // Campo privativo do Enfermeiro
}

export interface NurseMedicalCurrentStatus {
  status: string; // 'Permanece internado sob cuidados de enfermagem' | 'Transferência' | 'Alta do setor' | 'Outro' | 'Não informado' | ''
  customStatus?: string;
}

export interface NurseMedicalEvolutionForm {
  context: NurseMedicalContext;
  generalAssessment: NurseMedicalGeneralAssessment;
  vitalSigns: NurseMedicalVitalSigns;
  pain: NurseMedicalPain;
  neurological: NurseMedicalNeurological;
  respiratory: NurseMedicalRespiratory;
  cardiovascular: NurseMedicalCardiovascular;
  gastrointestinal: NurseMedicalGastrointestinal;
  nutrition: NurseMedicalNutrition;
  eliminations: NurseMedicalEliminations;
  devices: NurseMedicalDevices;
  skin: NurseMedicalSkin;
  mobility: NurseMedicalMobility;
  hygiene: NurseMedicalHygiene;
  riskAssessment: NurseMedicalRiskAssessment;
  careDone: NurseMedicalCareDone;
  responseToCare: NurseMedicalResponseToCare;
  complications: NurseMedicalComplications;
  communication: NurseMedicalCommunication;
  comparisonWithPrevious: NurseMedicalComparisonWithPrevious;
  nursingSynthesis: NurseMedicalNursingSynthesis;
  currentStatus: NurseMedicalCurrentStatus;
}

export function createInitialNurseMedicalEvolutionForm(): NurseMedicalEvolutionForm {
  return {
    context: {
      moment: '',
      location: 'Clínica Médica',
      escort: '',
      wristbandIdentification: '',
      bedIdentification: '',
      precaution: '',
      hasAllergies: '',
    },
    generalAssessment: {
      generalState: '',
      consciousness: '',
      behavior: [],
      complaintStatus: '',
      informationSource: '',
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
    pain: {
      painScaleType: '',
      painScore: '',
      painLocation: '',
      painCharacteristic: '',
      painObservation: '',
    },
    neurological: {
      consciousnessLevel: '',
      orientation: '',
      glasgowScore: '',
      pupils: '',
      photoreaction: '',
      motorDeficit: '',
    },
    respiratory: {
      respiratorySupport: '',
      respiratoryPattern: '',
      respiratoryDistress: '',
      pulmonaryAuscultationPerformed: '',
    },
    cardiovascular: {
      peripheralPerfusion: '',
      extremities: '',
      capillaryRefillTime: '',
      edema: '',
    },
    gastrointestinal: {
      abdomenForm: '',
      abdomenConsistency: '',
      abdomenPalpation: '',
      bowelSounds: '',
    },
    nutrition: {
      nutritionalRoute: '',
    },
    eliminations: {
      diuresis: '',
      urinaryRoute: '',
      bowelElimination: '',
    },
    devices: {
      list: [],
    },
    skin: {
      integrity: '',
      hydration: '',
    },
    mobility: {
      mobility: '',
      repositioning: '',
    },
    hygiene: {
      hygieneStatus: '',
      bath: '',
    },
    riskAssessment: {
      fallRiskStatus: '',
      pressureInjuryRiskStatus: '',
    },
    careDone: {
      careItems: [],
    },
    responseToCare: {
      evaluated: '',
    },
    complications: {
      hasComplication: '',
    },
    communication: {
      hasCommunication: '',
    },
    comparisonWithPrevious: {
      statusChange: '',
    },
    nursingSynthesis: {
      synthesisText: '',
    },
    currentStatus: {
      status: '',
    },
  };
}
