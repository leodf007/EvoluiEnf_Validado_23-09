import { InvasiveDeviceItem } from './clinical';

export interface NurseEvolutionContext {
  moment: string; // 'Avalio paciente' | 'Reavalio paciente' | 'Recebo paciente no início do período' | 'Outro' | ''
  customMoment?: string;
  location: string; // 'Sala Vermelha' | 'Sala Amarela' | 'Sala Verde' | 'Observação' | 'Box' | 'Leito' | 'Outro' | ''
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

export interface NurseEvolutionGeneralAssessment {
  behavior: string[]; // ['Calmo', 'Cooperativo', 'Agitado', 'Ansioso', 'Inquieto', 'Choroso', 'Hipoativo', 'Sonolento', 'Sedado', 'Outro', 'Não avaliado']
  customBehavior?: string;
  complaintStatus: string; // 'Sem queixas referidas' | 'Com queixa' | 'Impossibilitado de informar' | 'Não avaliado' | 'Não informado' | ''
  complaintDescription?: string;
  informationSource: string; // 'Paciente' | 'Acompanhante' | 'Equipe' | 'Outra' | 'Não informado' | ''
  customInformationSource?: string;
  hygieneStatus: string; // 'Preservada' | 'Necessita cuidados' | 'Prejudicada' | 'Não avaliada' | 'Não informado' | ''
}

export interface NurseEvolutionVitalSignsAndPain {
  systolicBP: string;
  diastolicBP: string;
  meanArterialPressure: string; // PAM informada pelo enfermeiro, opcional
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  capillaryBloodGlucose: string;
  // Dor
  painScaleType: string; // 'Escala numérica 0–10' | 'Outra escala' | 'Não avaliável' | 'Não avaliada' | 'Não informado' | ''
  painScore: string;
  painLocation: string;
  painCharacteristic: string;
  painDuration: string;
  painReliefOrAggravatingFactors: string;
  painObservation: string;
}

export interface NurseEvolutionNeurological {
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

export interface NurseEvolutionRespiratory {
  respiratorySupport: string; // 'Ar ambiente' | 'Oxigenoterapia' | 'VNI' | 'VMI' | 'Traqueostomia sem VMI' | 'Outro' | 'Não informado' | ''
  oxygenDevice?: string; // 'Cateter nasal' | 'Máscara de Venturi' | 'Máscara com reservatório' | 'Outro'
  oxygenFlowRate?: string;
  oxygenFlowUnit?: string;
  vniInterface?: string;
  vniIpap?: string;
  vniEpap?: string;
  vniFiO2?: string;
  vmiAirway?: string; // 'TOT' | 'Traqueostomia'
  vmiMode?: string; // 'VCV' | 'PCV' | 'PSV' | 'Outro'
  vmiFiO2?: string;
  vmiPeep?: string;
  vmiTidalVolume?: string;
  vmiRrSet?: string;
  respiratoryPattern: string; // 'Eupneico' | 'Taquipneico' | 'Bradipneico' | 'Outro' | 'Não avaliado' | ''
  customPattern?: string;
  respiratoryDistress: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  accessoryMuscles: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  secretions: string; // 'Ausentes' | 'Presentes' | 'Não avaliadas' | ''
  secretionsDescription?: string;
}

export interface NurseEvolutionPulmonaryAuscultation {
  performed: string; // 'Não' | 'Sim' | ''
  vesicularMurmur: string; // 'Presente bilateralmente' | 'Diminuído' | 'Ausente em região informada' | 'Assimétrico' | 'Outro' | ''
  vesicularMurmurDetails?: string;
  adventitiousSounds: string; // 'Ausentes' | 'Presentes' | 'Não avaliados' | ''
  adventitiousSoundTypes: string[]; // ['Roncos', 'Sibilos', 'Estertores finos', 'Estertores grossos', 'Estridor', 'Outro']
  adventitiousSoundLocation?: string;
  customAdventitiousDetails?: string;
}

export interface NurseEvolutionCardiovascular {
  peripheralPerfusion: string; // 'Adequada' | 'Reduzida' | 'Outra' | 'Não avaliada' | ''
  customPerfusion?: string;
  extremities: string; // 'Quentes' | 'Frias' | 'Outra' | 'Não avaliadas' | ''
  customExtremities?: string;
  capillaryRefillTime: string; // '< 3 segundos' | '≥ 3 segundos' | 'valor informado' | 'Não avaliado' | ''
  customRefillTime?: string;
  edema: string; // 'Ausente' | 'Presente' | 'Não avaliado' | ''
  edemaLocation?: string;
  edemaGrade?: string; // '1+/4+', '2+/4+', '3+/4+', '4+/4+'
}

export interface NurseEvolutionCardiacAuscultation {
  performed: string; // 'Não' | 'Sim' | ''
  heartSounds: string; // 'Normofonéticas' | 'Hipofonéticas' | 'Hiperfonéticas' | 'Outra' | ''
  customHeartSounds?: string;
  rhythm: string; // 'Regular' | 'Irregular' | 'Outro' | ''
  customRhythm?: string;
  times: string; // '2T' | '3T' | 'Outro' | ''
  customTimes?: string;
  murmurs: string; // 'Ausentes' | 'Presentes' | 'Não avaliados' | ''
  murmursDescription?: string;
}

export interface NurseEvolutionGastrointestinalAndNutrition {
  abdomenForm: string; // 'Plano' | 'Globoso' | 'Distendido' | 'Outro' | 'Não avaliado' | ''
  customAbdomenForm?: string;
  abdomenConsistency: string; // 'Flácido' | 'Tenso' | 'Outro' | 'Não avaliado' | ''
  customAbdomenConsistency?: string;
  abdomenPalpation: string; // 'Indolor' | 'Doloroso' | 'Não realizada' | ''
  abdomenPainLocation?: string;
  bowelSounds: string; // 'Presentes' | 'Hipoativos' | 'Hiperativos' | 'Ausentes' | 'Não avaliados' | ''
  nutritionalStatus: string; // 'Via oral' | 'Dieta enteral' | 'Dieta parenteral' | 'Jejum' | 'Outra' | 'Não informado' | ''
  oralAcceptance?: string; // 'Boa aceitação' | 'Aceitação parcial' | 'Recusa alimentar' | 'Outra'
  enteralRoute?: string; // 'SNE' | 'SNG' | 'GTT' | 'Outra'
  enteralRate?: string;
  enteralRateUnit?: string;
  enteralTolerance?: string; // 'Boa tolerância' | 'Náuseas/vômitos' | 'Distensão abdominal' | 'Resíduo gástrico aumentado' | 'Outra' | 'Não informada'
  nutritionObservation?: string;
}

export interface NurseEvolutionEliminations {
  diuresis: string; // 'Presente' | 'Oligúrica' | 'Anúrica' | 'Não avaliada' | 'Não informado' | ''
  urinaryRoute: string; // 'Espontânea' | 'SVD' | 'Cistostomia' | 'Outra' | 'Não informado' | ''
  customUrinaryRoute?: string;
  urineAspect?: string;
  urineVolume?: string;
  bowelElimination: string; // 'Presentes' | 'Ausentes' | 'Não avaliadas' | 'Não informado' | ''
  bowelConsistency?: string; // 'Formadas' | 'Pastosas' | 'Líquidas' | 'Diarreicas' | 'Outra'
  bowelFrequency?: string;
  bowelAspect?: string;
}

export interface NurseEvolutionDevices {
  list: InvasiveDeviceItem[];
}

export interface NurseEvolutionSkin {
  integrity: string; // 'Íntegra' | 'Com alteração/lesão' | 'Não avaliada' | ''
  hydration: string; // 'Hidratada' | 'Ressecada' | 'Outra' | 'Não avaliada' | ''
  customHydration?: string;
  coloration: string; // 'Corada' | 'Hipocorada' | 'Cianótica' | 'Ictérica' | 'Outra' | 'Não avaliada' | ''
  customColoration?: string;
  lesionLocation?: string;
  lesionDescription?: string;
  lesionDimensions?: string;
  lesionExudate?: string;
  lesionDressing?: string;
  perilesionalCondition?: string;
  lesionObservations?: string;
}

export interface NurseEvolutionMobilityAndSafety {
  mobility: string; // 'Deambula sem auxílio' | 'Deambula com auxílio' | 'Restrito ao leito' | 'Acamado' | 'Mobilização passiva' | 'Outro' | 'Não avaliado' | ''
  customMobility?: string;
  repositioning: string; // 'Não realizada' | 'Realizada' | 'Não informado' | ''
  repositioningInterval?: string;
  bedRails: string; // 'Elevadas' | 'Não elevadas' | 'Não informado' | ''
  headOfBed: string; // 'Elevada' | 'Não elevada' | 'Não informado' | ''
  headOfBedAngle?: string;
}

export interface NurseEvolutionTherapiesAndInfusions {
  vasoactiveDrugsInUse: string; // 'Não' | 'Sim' | 'Não informado' | ''
  vasoactiveDrugsList: Array<{
    id: string;
    medication: string;
    doseOrRate: string;
    unit: string;
    route?: string;
    observation?: string;
  }>;
  sedationAnalgesiaInUse: string; // 'Não' | 'Sim' | 'Não informado' | ''
  sedationAnalgesiaList: Array<{
    id: string;
    medication: string;
    doseOrRate: string;
    unit: string;
    route?: string;
    observation?: string;
  }>;
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

export interface NurseEvolutionCareDone {
  careItems: string[];
  customCareDetails?: string;
}

export interface NurseEvolutionRiskAssessment {
  fallRiskStatus: string; // 'Não avaliado' | 'Avaliado' | ''
  fallRiskScale?: string;
  fallRiskScore?: string;
  fallRiskClassification?: string; // Classificação registrada pelo enfermeiro
  pressureInjuryRiskStatus: string; // 'Não avaliado' | 'Avaliado' | ''
  pressureInjuryScale?: string;
  pressureInjuryScore?: string;
  pressureInjuryClassification?: string;
  aspirationRiskStatus: string; // 'Não avaliado' | 'Ausente segundo avaliação registrada' | 'Presente segundo avaliação registrada' | 'Outra descrição' | ''
  customAspirationRisk?: string;
}

export interface NurseEvolutionComplications {
  hasComplication: string; // 'Não' | 'Sim' | 'Não informado' | ''
  description?: string;
  time?: string;
  interventionDone?: string;
  responseObserved?: string;
  communicationDone?: string;
  communicationTime?: string;
}

export interface NurseEvolutionCommunication {
  hasCommunication: string; // 'Não' | 'Sim' | 'Não informado' | ''
  target?: string; // 'Enfermeiro responsável/plantonista' | 'Equipe médica' | 'Outra equipe' | 'Outro'
  customTarget?: string;
  reason?: string;
  time?: string;
  responseObserved?: string;
}

export interface NurseEvolutionResponseToCare {
  evaluated: string; // 'Não avaliada' | 'Sim' | 'Não informado' | ''
  structuredResponseText?: string;
}

export interface NurseEvolutionEvolutionState {
  statusChange: string; // 'Sem alteração observada' | 'Houve alteração observada' | 'Melhora registrada pelo Enfermeiro' | 'Piora registrada pelo Enfermeiro' | 'Sem comparação disponível' | 'Não informado' | ''
  changeDescription?: string;
  nursingSynthesis?: string; // Síntese da avaliação de enfermagem (texto livre opcional)
  currentStatus: string; // 'Permanece no setor sob cuidados de enfermagem' | 'Mantido em observação' | 'Encaminhado para procedimento' | 'Transferência em andamento' | 'Transferido para outro setor' | 'Outra' | 'Não informado' | ''
  customCurrentStatus?: string;
}

export interface NurseEvolutionForm {
  context: NurseEvolutionContext;
  generalAssessment: NurseEvolutionGeneralAssessment;
  vitalSignsAndPain: NurseEvolutionVitalSignsAndPain;
  neurological: NurseEvolutionNeurological;
  respiratory: NurseEvolutionRespiratory;
  pulmonaryAuscultation: NurseEvolutionPulmonaryAuscultation;
  cardiovascular: NurseEvolutionCardiovascular;
  cardiacAuscultation: NurseEvolutionCardiacAuscultation;
  gastrointestinalAndNutrition: NurseEvolutionGastrointestinalAndNutrition;
  eliminations: NurseEvolutionEliminations;
  devices: NurseEvolutionDevices;
  skin: NurseEvolutionSkin;
  mobilityAndSafety: NurseEvolutionMobilityAndSafety;
  therapiesAndInfusions: NurseEvolutionTherapiesAndInfusions;
  careDone: NurseEvolutionCareDone;
  riskAssessment: NurseEvolutionRiskAssessment;
  complications: NurseEvolutionComplications;
  communication: NurseEvolutionCommunication;
  responseToCare: NurseEvolutionResponseToCare;
  evolutionState: NurseEvolutionEvolutionState;
}
