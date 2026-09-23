import { InvasiveDeviceItem } from './clinical';

export interface NurseICUContext {
  moment: string; // 'Avalio paciente' | 'Reavalio paciente' | 'Recebo paciente no início do período' | 'Outro' | ''
  customMoment?: string;
  location: string; // 'UTI' | 'Leito' | 'Box' | 'Outro' | ''
  customLocation?: string;
  escort: string; // 'Desacompanhado' | 'Familiar' | 'Responsável' | 'Cuidador' | 'Outro' | 'Não informado' | ''
  customEscort?: string;
  wristbandIdentification: string; // 'Sim' | 'Não' | 'Não se aplica' | 'Não informado' | ''
  bedIdentification: string; // 'Sim' | 'Não' | 'Não se aplica' | 'Não informado' | ''
  precaution: string; // 'Padrão' | 'Contato' | 'Gotículas' | 'Aerossóis' | 'Outra' | 'Não informado' | ''
  customPrecaution?: string;
  hasAllergies: string; // 'Não referidas' | 'Sim' | 'Não informado' | ''
  allergyDescription?: string;
}

export interface NurseICUGeneralAssessment {
  behavior: string[]; // ['Calmo', 'Cooperativo', 'Agitado', 'Ansioso', 'Inquieto', 'Hipoativo', 'Sonolento', 'Sedado', 'Outro', 'Não avaliado']
  customBehavior?: string;
  complaintStatus: string; // 'Sem queixas referidas' | 'Com queixa' | 'Impossibilitado de informar' | 'Não avaliado' | 'Não informado' | ''
  complaintDescription?: string;
  informationSource: string; // 'Paciente' | 'Acompanhante' | 'Equipe' | 'Outra' | 'Não informado' | ''
  customInformationSource?: string;
  hygieneStatus: string; // 'Preservada' | 'Necessita cuidados' | 'Prejudicada' | 'Não avaliada' | 'Não informado' | ''
}

export interface NurseICUVitalSigns {
  systolicBP: string;
  diastolicBP: string;
  meanArterialPressure: string; // PAM informada manualmente, opcional
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  capillaryBloodGlucose: string;
}

export interface NurseICUPain {
  painScaleType: string; // 'Escala numérica 0–10' | 'BPS' | 'CPOT' | 'Outra escala' | 'Não avaliável' | 'Não avaliada' | 'Não informado' | ''
  painScore: string;
  customScale?: string;
  painLocation: string;
  painCharacteristic: string;
  painObservation: string;
}

export interface NurseICUNeurological {
  consciousnessLevel: string; // 'Consciente' | 'Sonolento' | 'Torporoso' | 'Comatoso' | 'Sedado' | 'Outro' | 'Não avaliado' | ''
  customConsciousness?: string;
  orientation: string; // 'Orientado em tempo e espaço' | 'Parcialmente orientado' | 'Desorientado' | 'Não avaliável' | 'Não avaliado' | ''
  glasgowScore: string; // '3'..'15', 'Não aplicado', 'Não avaliado', ''
  rassScore: string; // '-5'..'+4', 'Não aplicado', 'Não avaliado', ''
  pupils: string; // 'Isocóricas' | 'Anisocóricas' | 'Mióticas' | 'Midriáticas' | 'Outra' | 'Não avaliadas' | ''
  customPupils?: string;
  photoreaction: string; // 'Fotorreagentes' | 'Lentificadas' | 'Não reagentes' | 'Outra' | 'Não avaliada' | ''
  customPhotoreaction?: string;
  motorDeficit: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  motorDeficitDescription?: string;
}

export interface NurseICUSedationAssessment {
  sedationStatus: string; // 'Sedado' | 'Não sedado' | 'Não avaliado' | ''
  rassReported?: string;
  sedationObservations?: string;
}

export interface NurseICURespiratory {
  respiratorySupport: string; // 'Ar ambiente' | 'Oxigenoterapia' | 'VNI' | 'VMI' | 'Traqueostomia sem VMI' | 'CNAF' | 'Outro' | 'Não informado' | ''
  customSupport?: string;
  oxygenDevice?: string;
  oxygenFlowRate?: string;
  oxygenFiO2?: string;
  vniInterface?: string;
  vniIpap?: string;
  vniEpap?: string;
  vniFiO2?: string;
  respiratoryPattern: string; // 'Eupneico' | 'Taquipneico' | 'Bradipneico' | 'Outro' | 'Não avaliado' | ''
  customPattern?: string;
  respiratoryDistress: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  accessoryMuscles: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  secretions: string; // 'Ausentes' | 'Presentes' | 'Não avaliadas' | ''
  secretionsDescription?: string;
  pulmonaryAuscultationPerformed: string; // 'Não' | 'Sim' | ''
  vesicularMurmur?: string; // 'Presente bilateralmente' | 'Diminuído' | 'Ausente em região informada' | 'Assimétrico' | 'Outro'
  vesicularMurmurDetails?: string;
  adventitiousSounds?: string; // 'Ausentes' | 'Presentes' | 'Não avaliados' | ''
  adventitiousSoundTypes?: string[]; // ['Roncos', 'Sibilos', 'Estertores finos', 'Estertores grossos', 'Estridor', 'Outro']
  adventitiousSoundLocation?: string;
}

export interface NurseICUMechanicalVentilation {
  vmiAirway: string; // 'TOT' | 'Traqueostomia' | 'Outro' | ''
  customVmiAirway?: string;
  vmiMode: string; // 'VCV' | 'PCV' | 'PSV' | 'SIMV' | 'Outro' | ''
  customVmiMode?: string;
  vmiFiO2: string;
  vmiPeep: string;
  vmiRrSet: string;
  vmiTidalVolume: string;
  vmiSupportPressure: string;
  vmiInspiratoryPressure: string;
  vmiOtherParameters?: string;
}

export interface NurseICUCardiovascular {
  peripheralPerfusion: string; // 'Adequada' | 'Reduzida' | 'Outra' | 'Não avaliada' | ''
  customPerfusion?: string;
  extremities: string; // 'Quentes' | 'Frias' | 'Outra' | 'Não avaliadas' | ''
  customExtremities?: string;
  capillaryRefillTime: string; // '< 3 segundos' | '≥ 3 segundos' | 'Não avaliado' | ''
  edema: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  edemaLocation?: string;
  edemaGrade?: string;
  cardiacAuscultationPerformed: string; // 'Não' | 'Sim' | ''
  heartSounds?: string; // 'Normofonéticas' | 'Hipofonéticas' | 'Hiperfonéticas' | 'Outra'
  rhythm?: string; // 'Regular' | 'Irregular' | 'Outro'
  times?: string; // '2 tempos' | '3 tempos' | 'Outro'
  murmurs?: string; // 'Ausentes' | 'Presentes' | 'Não avaliados'
  murmursDescription?: string;
}

export interface NurseICUVasoactiveDrugItem {
  id: string;
  medication: string;
  concentration?: string;
  doseOrRate: string;
  unit: string;
  route?: string;
  observation?: string;
}

export interface NurseICUVasoactiveDrugs {
  vasoactiveDrugsInUse: string; // 'Não' | 'Sim' | 'Não informado' | ''
  vasoactiveDrugsList: NurseICUVasoactiveDrugItem[];
}

export interface NurseICUInfusionItem {
  id: string;
  medication: string;
  doseOrRate: string;
  unit: string;
  route?: string;
  observation?: string;
}

export interface NurseICUSedationAnalgesiaInfusions {
  sedationInUse: string; // 'Não' | 'Sim' | 'Não informado' | ''
  sedationList: NurseICUInfusionItem[];
  analgesiaInUse: string; // 'Não' | 'Sim' | 'Não informado' | ''
  analgesiaList: NurseICUInfusionItem[];
}

export interface NurseICUOtherInfusions {
  otherInfusionsInUse: string; // 'Não' | 'Sim' | 'Não informado' | ''
  otherInfusionsList: Array<{
    id: string;
    substance: string;
    doseOrRate: string;
    unit: string;
    route?: string;
    observation?: string;
  }>;
}

export interface NurseICUGastrointestinalAndNutrition {
  nutritionalRoute: string; // 'Via oral' | 'Dieta enteral' | 'Dieta parenteral' | 'Jejum' | 'Outra' | 'Não informado' | ''
  customNutritionalRoute?: string;
  enteralDevice?: string; // 'SNE' | 'SNG' | 'GTT' | 'Outra' | ''
  enteralRate?: string;
  enteralRateUnit?: string;
  enteralTolerance?: string; // 'Boa tolerância' | 'Náuseas/vômitos' | 'Distensão abdominal' | 'Resíduo gástrico aumentado' | 'Outra' | 'Não informada'
  abdomenForm: string; // 'Plano' | 'Globoso' | 'Distendido' | 'Outro' | 'Não avaliado' | ''
  customAbdomenForm?: string;
  abdomenConsistency: string; // 'Flácido' | 'Tenso' | 'Outro' | 'Não avaliado' | ''
  customAbdomenConsistency?: string;
  abdomenPalpation: string; // 'Indolor' | 'Doloroso' | 'Não realizada' | ''
  abdomenPainLocation?: string;
  bowelSounds: string; // 'Presentes' | 'Hipoativos' | 'Hiperativos' | 'Ausentes' | 'Não avaliados' | ''
}

export interface NurseICUEliminations {
  diuresis: string; // 'Presente' | 'Oligúrica' | 'Anúrica' | 'Não avaliada' | 'Não informado' | ''
  urinaryRoute: string; // 'Espontânea' | 'SVD' | 'Cistostomia' | 'Outra' | 'Não informado' | ''
  customUrinaryRoute?: string;
  urineAspect?: string;
  urineVolume?: string;
  bowelElimination: string; // 'Presentes' | 'Ausentes' | 'Não avaliadas' | 'Não informado' | ''
  bowelConsistency?: string;
  bowelAspect?: string;
}

export interface NurseICUWaterBalance {
  controlPerformed: string; // 'Não realizado' | 'Realizado' | 'Não informado' | ''
  inputs?: string; // Entradas (mL)
  outputs?: string; // Saídas (mL)
  reportedBalance?: string; // Balanço informado (mL) - preservado verbatim sem cálculo automático
}

export interface NurseICUDevices {
  list: InvasiveDeviceItem[];
}

export interface NurseICUSkin {
  integrity: string; // 'Íntegra' | 'Com alteração/lesão' | 'Não avaliada' | ''
  hydration: string; // 'Hidratada' | 'Ressecada' | 'Outra' | 'Não avaliada' | ''
  customHydration?: string;
  coloration: string; // 'Corada' | 'Hipocorada' | 'Cianótica' | 'Ictérica' | 'Outra' | 'Não avaliada' | ''
  customColoration?: string;
  lesionLocation?: string;
  lesionDimensions?: string;
  lesionAspect?: string;
  lesionExudate?: string;
  lesionDressing?: string;
  perilesionalCondition?: string;
  lesionObservations?: string;
}

export interface NurseICUMobilityAndSafety {
  mobility: string; // 'Deambula sem auxílio' | 'Deambula com auxílio' | 'Restrito ao leito' | 'Acamado' | 'Mobilização passiva' | 'Outro' | 'Não avaliado' | ''
  customMobility?: string;
  currentPosition?: string;
  repositioning: string; // 'Não realizada' | 'Realizada' | 'Não informado' | ''
  repositioningInterval?: string;
  bedRails: string; // 'Elevadas' | 'Não elevadas' | 'Não informado' | ''
  headOfBed: string; // 'Elevada' | 'Não elevada' | 'Não informado' | ''
  headOfBedAngle?: string;
}

export interface NurseICURiskAssessment {
  fallRiskStatus: string; // 'Não avaliado' | 'Avaliado' | ''
  fallRiskScale?: string;
  fallRiskScore?: string;
  fallRiskClassification?: string;
  pressureInjuryRiskStatus: string; // 'Não avaliado' | 'Avaliado' | ''
  pressureInjuryScale?: string;
  pressureInjuryScore?: string;
  pressureInjuryClassification?: string;
  aspirationRiskStatus: string; // 'Não avaliado' | 'Ausente segundo avaliação registrada' | 'Presente segundo avaliação registrada' | 'Outra descrição' | ''
  customAspirationRisk?: string;
}

export interface NurseICUCareDone {
  careItems: string[];
  customCareDetails?: string;
  bath: string; // 'Não realizado' | 'Banho no leito' | 'Banho de aspersão' | 'Outro' | 'Não informado' | ''
  customBath?: string;
  bathTolerance: string; // 'Boa tolerância' | 'Alteração observada' | 'Não avaliada' | ''
  bathAlterationDetails?: string;
}

export interface NurseICUResponseToCare {
  responseEvaluated: string; // 'Não avaliada' | 'Resposta observada' | 'Não informado' | ''
  structuredResponseText?: string;
}

export interface NurseICUComplications {
  hasComplication: string; // 'Não' | 'Sim' | 'Não informado' | ''
  description?: string;
  time?: string;
  interventionDone?: string;
  responseObserved?: string;
  communicationDone?: string;
  communicationTime?: string;
}

export interface NurseICUCommunication {
  hasCommunication: string; // 'Não' | 'Sim' | 'Não informado' | ''
  target?: string;
  customTarget?: string;
  reason?: string;
  time?: string;
  responseObserved?: string;
}

export interface NurseICUEvolutionState {
  statusChange: string; // 'Sem alteração observada' | 'Houve alteração observada' | 'Melhora registrada pelo Enfermeiro' | 'Piora registrada pelo Enfermeiro' | 'Sem comparação disponível' | 'Não informado' | ''
  changeDescription?: string;
  nursingSynthesis?: string;
  currentStatus: string; // 'Permanece na UTI sob cuidados de enfermagem' | 'Encaminhado para procedimento' | 'Transferência em andamento' | 'Transferido para outro setor' | 'Alta da UTI' | 'Outra' | 'Não informado' | ''
  customCurrentStatus?: string;
  additionalNotes?: string;
}

export interface NurseICUEvolutionForm {
  context: NurseICUContext;
  generalAssessment: NurseICUGeneralAssessment;
  vitalSigns: NurseICUVitalSigns;
  pain: NurseICUPain;
  neurological: NurseICUNeurological;
  sedationAssessment: NurseICUSedationAssessment;
  respiratory: NurseICURespiratory;
  mechanicalVentilation: NurseICUMechanicalVentilation;
  cardiovascular: NurseICUCardiovascular;
  vasoactiveDrugs: NurseICUVasoactiveDrugs;
  sedationAnalgesiaInfusions: NurseICUSedationAnalgesiaInfusions;
  otherInfusions: NurseICUOtherInfusions;
  gastrointestinalAndNutrition: NurseICUGastrointestinalAndNutrition;
  eliminations: NurseICUEliminations;
  waterBalance: NurseICUWaterBalance;
  devices: NurseICUDevices;
  skin: NurseICUSkin;
  mobilityAndSafety: NurseICUMobilityAndSafety;
  riskAssessment: NurseICURiskAssessment;
  careDone: NurseICUCareDone;
  responseToCare: NurseICUResponseToCare;
  complications: NurseICUComplications;
  communication: NurseICUCommunication;
  evolutionState: NurseICUEvolutionState;
}

export function createInitialNurseICUEvolutionForm(): NurseICUEvolutionForm {
  return {
    context: {
      moment: '',
      location: 'UTI',
      escort: '',
      wristbandIdentification: '',
      bedIdentification: '',
      precaution: '',
      hasAllergies: '',
    },
    generalAssessment: {
      behavior: [],
      complaintStatus: '',
      informationSource: '',
      hygieneStatus: '',
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
      rassScore: '',
      pupils: '',
      photoreaction: '',
      motorDeficit: '',
    },
    sedationAssessment: {
      sedationStatus: '',
      rassReported: '',
      sedationObservations: '',
    },
    respiratory: {
      respiratorySupport: '',
      respiratoryPattern: '',
      respiratoryDistress: '',
      accessoryMuscles: '',
      secretions: '',
      pulmonaryAuscultationPerformed: '',
    },
    mechanicalVentilation: {
      vmiAirway: '',
      vmiMode: '',
      vmiFiO2: '',
      vmiPeep: '',
      vmiRrSet: '',
      vmiTidalVolume: '',
      vmiSupportPressure: '',
      vmiInspiratoryPressure: '',
    },
    cardiovascular: {
      peripheralPerfusion: '',
      extremities: '',
      capillaryRefillTime: '',
      edema: '',
      cardiacAuscultationPerformed: '',
    },
    vasoactiveDrugs: {
      vasoactiveDrugsInUse: '',
      vasoactiveDrugsList: [],
    },
    sedationAnalgesiaInfusions: {
      sedationInUse: '',
      sedationList: [],
      analgesiaInUse: '',
      analgesiaList: [],
    },
    otherInfusions: {
      otherInfusionsInUse: '',
      otherInfusionsList: [],
    },
    gastrointestinalAndNutrition: {
      nutritionalRoute: '',
      abdomenForm: '',
      abdomenConsistency: '',
      abdomenPalpation: '',
      bowelSounds: '',
    },
    eliminations: {
      diuresis: '',
      urinaryRoute: '',
      bowelElimination: '',
    },
    waterBalance: {
      controlPerformed: '',
      inputs: '',
      outputs: '',
      reportedBalance: '',
    },
    devices: {
      list: [],
    },
    skin: {
      integrity: '',
      hydration: '',
      coloration: '',
    },
    mobilityAndSafety: {
      mobility: '',
      repositioning: '',
      bedRails: '',
      headOfBed: '',
    },
    riskAssessment: {
      fallRiskStatus: '',
      pressureInjuryRiskStatus: '',
      aspirationRiskStatus: '',
    },
    careDone: {
      careItems: [],
      bath: '',
      bathTolerance: '',
    },
    responseToCare: {
      responseEvaluated: '',
    },
    complications: {
      hasComplication: '',
    },
    communication: {
      hasCommunication: '',
    },
    evolutionState: {
      statusChange: '',
      currentStatus: '',
    },
  };
}
