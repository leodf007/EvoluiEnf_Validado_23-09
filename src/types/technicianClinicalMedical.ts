import { InvasiveDeviceItem } from './clinical';

export interface TechnicianClinicalMedicalContext {
  moment: 'Recebo paciente' | 'Avalio paciente' | 'Reavalio paciente' | '';
  location: 'Enfermaria' | 'Quarto' | 'Leito' | 'Outro' | '';
  locationCustom?: string;
  accompaniment: 'Desacompanhado' | 'Familiar' | 'Cuidador' | 'Outro' | '';
  accompanimentCustom?: string;
  wristbandChecked: boolean;
  bedSignChecked: boolean;
  precaution: 'Padrão' | 'Contato' | 'Gotículas' | 'Aerossóis' | 'Outra' | '';
  precautionCustom?: string;
}

export interface TechnicianClinicalMedicalGeneralAssessment {
  observedState: 'consciente' | 'sonolento' | 'agitado' | 'calmo' | 'colaborativo' | 'choroso' | 'hipoativo' | 'outro' | '';
  observedStateCustom?: string;
  complaints: 'sem queixas referidas' | 'com queixa' | 'impossibilitado de informar' | '';
  complaintsDetails?: string;
  source: 'paciente' | 'acompanhante' | 'equipe' | '';
  hygiene: 'preservada' | 'necessita auxílio' | 'realizada higiene no período' | '';
  mobility: 'deambula sem auxílio' | 'deambula com auxílio' | 'restrito ao leito' | '';
}

export interface TechnicianClinicalMedicalVitalSigns {
  systolicBP?: string;
  diastolicBP?: string;
  meanArterialPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  temperature?: string;
  capillaryBloodGlucose?: string;
}

export interface TechnicianClinicalMedicalPain {
  status: 'avaliada' | 'não avaliável' | 'não informada' | '';
  numericScaleValue?: number | string;
  location?: string;
}

export interface TechnicianClinicalMedicalRespiratory {
  support: 'ar ambiente' | 'oxigenoterapia' | '';
  pattern: 'eupneico' | 'taquipneico' | 'bradipneico' | 'outro' | '';
  patternCustom?: string;
  discomfort: 'presente' | 'ausente' | 'não avaliado' | '';
  oxygenDevice?: 'cateter nasal' | 'máscara de venturi' | 'máscara não reinalante' | 'outro' | '';
  oxygenDeviceCustom?: string;
  oxygenFlow?: string;
}

export interface TechnicianClinicalMedicalCardiovascular {
  perfusion: 'adequada' | 'reduzida' | 'não avaliada' | '';
  extremities: 'quentes' | 'frias' | '';
  edema: 'ausente' | 'presente' | '';
  edemaLocation?: string;
}

export interface TechnicianClinicalMedicalNutrition {
  route: 'oral' | 'enteral' | 'jejum' | 'outra' | '';
  routeCustom?: string;
  oralAcceptance?: 'boa' | 'moderada' | 'baixa' | '';
  enteralDevice?: 'SNE' | 'SNG' | 'GTT' | '';
  enteralRate?: string;
  enteralTolerance?: string;
}

export interface TechnicianClinicalMedicalEliminations {
  urinary: 'presente' | 'ausente' | 'não avaliada' | '';
  urinaryRoute?: 'espontânea' | 'SVD' | 'outra' | '';
  urinaryRouteCustom?: string;
  bowel: 'presente' | 'ausente' | '';
  bowelAspect?: 'formada' | 'pastosa' | 'líquida' | 'outro' | '';
  bowelAspectCustom?: string;
}

export interface TechnicianClinicalMedicalSkin {
  integrity: 'íntegra' | 'alteração presente' | 'não avaliada' | '';
  hydration: 'hidratada' | 'ressecada' | '';
  alterationDescription?: string;
}

export interface TechnicianClinicalMedicalBath {
  performed: 'não' | 'banho no leito' | 'banho de aspersão' | '';
  tolerance?: 'boa' | 'outra' | '';
  toleranceCustom?: string;
}

export interface TechnicianClinicalMedicalCare {
  actions: string[];
  otherCare?: string;
}

export interface TechnicianClinicalMedicalComplications {
  hasComplication: 'não' | 'sim' | 'não informado' | '';
  description?: string;
  conduct?: string;
  communication?: string;
  explicitNoComplications?: boolean;
}

export interface TechnicianClinicalMedicalFinalStatus {
  status: 'permanece no setor sob cuidados de enfermagem' | 'transferido' | 'encaminhado' | 'outro' | '';
  details?: string;
}

export interface TechnicianClinicalMedicalForm {
  context: TechnicianClinicalMedicalContext;
  generalAssessment: TechnicianClinicalMedicalGeneralAssessment;
  vitalSigns: TechnicianClinicalMedicalVitalSigns;
  pain: TechnicianClinicalMedicalPain;
  respiratory: TechnicianClinicalMedicalRespiratory;
  cardiovascular: TechnicianClinicalMedicalCardiovascular;
  nutrition: TechnicianClinicalMedicalNutrition;
  eliminations: TechnicianClinicalMedicalEliminations;
  devices: InvasiveDeviceItem[];
  skin: TechnicianClinicalMedicalSkin;
  bath: TechnicianClinicalMedicalBath;
  care: TechnicianClinicalMedicalCare;
  complications: TechnicianClinicalMedicalComplications;
  finalStatus: TechnicianClinicalMedicalFinalStatus;
}

export function createInitialTechnicianClinicalMedicalForm(): TechnicianClinicalMedicalForm {
  return {
    context: {
      moment: '',
      location: '',
      accompaniment: '',
      wristbandChecked: false,
      bedSignChecked: false,
      precaution: '',
    },
    generalAssessment: {
      observedState: '',
      complaints: '',
      source: '',
      hygiene: '',
      mobility: '',
    },
    vitalSigns: {},
    pain: {
      status: '',
    },
    respiratory: {
      support: '',
      pattern: '',
      discomfort: '',
    },
    cardiovascular: {
      perfusion: '',
      extremities: '',
      edema: '',
    },
    nutrition: {
      route: '',
    },
    eliminations: {
      urinary: '',
      bowel: '',
    },
    devices: [],
    skin: {
      integrity: '',
      hydration: '',
    },
    bath: {
      performed: '',
    },
    care: {
      actions: [],
    },
    complications: {
      hasComplication: '',
    },
    finalStatus: {
      status: '',
    },
  };
}
