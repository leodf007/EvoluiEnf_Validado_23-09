import { InvasiveDeviceItem } from './clinical';

export interface TechnicianSurgicalClinicContext {
  moment: 'Recebo paciente' | 'Avalio paciente' | 'Reavalio paciente' | '';
  location: 'Enfermaria cirúrgica' | 'Pós-operatório' | 'Recuperação anestésica' | 'Leito' | 'Outro' | '';
  locationCustom?: string;
  accompaniment: 'desacompanhado' | 'familiar' | 'cuidador' | 'outro' | '';
  accompanimentCustom?: string;
  wristbandChecked: boolean;
  bedSignChecked: boolean;
  precaution: 'padrão' | 'contato' | 'gotículas' | 'aerossóis' | 'outra' | '';
  precautionCustom?: string;
}

export interface TechnicianSurgicalClinicSurgicalContext {
  situation: 'pré-operatório' | 'pós-operatório imediato' | 'pós-operatório mediato' | 'acompanhamento clínico pós-cirúrgico' | '';
  surgicalProcedure: string; // Campo texto livre. Registrar somente informação fornecida. Não interpretar procedimento.
}

export interface TechnicianSurgicalClinicGeneralAssessment {
  observedState: 'consciente' | 'sonolento' | 'agitado' | 'calmo' | 'colaborativo' | 'choroso' | 'hipoativo' | 'outro' | '';
  observedStateCustom?: string;
  complaints: 'sem queixas' | 'dor' | 'náusea' | 'outro' | '';
  complaintsDetails?: string;
  source: 'paciente' | 'acompanhante' | 'equipe' | '';
  hygiene: 'preservada' | 'necessita auxílio' | 'realizada no período' | '';
  mobility: 'deambula sem auxílio' | 'deambula com auxílio' | 'restrito ao leito' | '';
}

export interface TechnicianSurgicalClinicVitalSigns {
  systolicBP?: string;
  diastolicBP?: string;
  meanArterialPressure?: string; // PAM manual. Nunca calcular. Nunca interpretar.
  heartRate?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  temperature?: string;
  capillaryBloodGlucose?: string;
}

export interface TechnicianSurgicalClinicPain {
  status: 'avaliada' | 'não avaliada' | 'sem dor' | '';
  numericScaleValue?: number | string; // 0-10
  location?: string; // Campo opcional informado pelo paciente (ex: "incisional abdominal")
}

export interface TechnicianSurgicalClinicRespiratory {
  support: 'ar ambiente' | 'oxigenoterapia' | '';
  pattern: 'eupneico' | 'taquipneico' | 'bradipneico' | 'outro' | '';
  patternCustom?: string;
  discomfort: 'presente' | 'ausente' | '';
  oxygenDevice?: 'cateter nasal' | 'máscara de venturi' | 'máscara não reinalante' | 'outro' | '';
  oxygenDeviceCustom?: string;
  oxygenFlow?: string;
}

export interface TechnicianSurgicalClinicWound {
  hasDressing: 'sim' | 'não' | '';
  location?: string; // texto livre
  condition?: 'limpo' | 'seco' | 'íntegro' | 'limpo e seco' | 'presença de secreção' | 'outro' | '';
  conditionDetails?: string;
}

export interface TechnicianSurgicalClinicNutrition {
  route: 'jejum' | 'oral' | 'enteral' | 'outra' | '';
  routeCustom?: string;
  oralAcceptance?: 'boa' | 'moderada' | 'baixa' | '';
  enteralDevice?: 'SNE' | 'SNG' | 'GTT' | 'outra' | '';
  enteralDeviceCustom?: string;
  enteralRate?: string;
  enteralTolerance?: string;
}

export interface TechnicianSurgicalClinicEliminations {
  urinary: 'presente' | 'ausente' | 'não avaliada' | '';
  urinaryRoute?: 'espontânea' | 'SVD' | 'outra' | '';
  urinaryRouteCustom?: string;
  bowel: 'presente' | 'ausente' | '';
  bowelAspect?: 'formada' | 'pastosa' | 'líquida' | 'outro' | '';
  bowelAspectCustom?: string;
}

export interface TechnicianSurgicalClinicMobility {
  ambulation: 'realizada' | 'não realizada' | 'restrito ao leito' | '';
  assistance?: 'sem auxílio' | 'com auxílio' | '';
}

export interface TechnicianSurgicalClinicBath {
  performed: 'banho no leito' | 'banho de aspersão' | 'não realizado' | '';
  tolerance?: string;
}

export const SURGICAL_CLINIC_CARE_ACTIONS = [
  'administração de medicamentos conforme prescrição',
  'monitorização de sinais vitais',
  'cuidados com curativo',
  'cuidados com dispositivos',
  'higiene corporal',
  'higiene oral',
  'mudança de decúbito',
  'auxílio na mobilização',
  'controle de eliminações',
  'balanço hídrico',
  'glicemia capilar',
  'coleta de exames',
] as const;

export interface TechnicianSurgicalClinicCare {
  actions: string[];
  otherCare?: string;
}

export interface TechnicianSurgicalClinicComplications {
  hasComplication: 'sim' | 'não' | 'não informado' | '';
  description?: string;
  conduct?: string;
  communication?: string;
}

export interface TechnicianSurgicalClinicFinalStatus {
  status: 'permanece no setor sob cuidados de enfermagem' | 'transferido' | 'encaminhado' | 'alta do setor' | 'outro' | '';
  details?: string;
}

export interface TechnicianSurgicalClinicForm {
  context: TechnicianSurgicalClinicContext;
  surgicalContext: TechnicianSurgicalClinicSurgicalContext;
  generalAssessment: TechnicianSurgicalClinicGeneralAssessment;
  pain: TechnicianSurgicalClinicPain;
  vitalSigns: TechnicianSurgicalClinicVitalSigns;
  respiratory: TechnicianSurgicalClinicRespiratory;
  wound: TechnicianSurgicalClinicWound;
  devices: InvasiveDeviceItem[];
  nutrition: TechnicianSurgicalClinicNutrition;
  eliminations: TechnicianSurgicalClinicEliminations;
  mobility: TechnicianSurgicalClinicMobility;
  bath: TechnicianSurgicalClinicBath;
  care: TechnicianSurgicalClinicCare;
  complications: TechnicianSurgicalClinicComplications;
  finalStatus: TechnicianSurgicalClinicFinalStatus;
}

/**
 * Creates an entirely blank initial form for Technician Surgical Clinic.
 * Strictly guarantees NO pre-selected values, NO default checkboxes, NO default devices.
 */
export function createInitialTechnicianSurgicalClinicForm(): TechnicianSurgicalClinicForm {
  return {
    context: {
      moment: '',
      location: '',
      accompaniment: '',
      wristbandChecked: false,
      bedSignChecked: false,
      precaution: '',
    },
    surgicalContext: {
      situation: '',
      surgicalProcedure: '',
    },
    generalAssessment: {
      observedState: '',
      complaints: '',
      source: '',
      hygiene: '',
      mobility: '',
    },
    pain: {
      status: '',
    },
    vitalSigns: {},
    respiratory: {
      support: '',
      pattern: '',
      discomfort: '',
    },
    wound: {
      hasDressing: '',
    },
    devices: [],
    nutrition: {
      route: '',
    },
    eliminations: {
      urinary: '',
      bowel: '',
    },
    mobility: {
      ambulation: '',
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
