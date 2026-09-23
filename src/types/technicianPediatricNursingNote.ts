import { InvasiveDeviceItem } from './clinical';

export type PediatricAgeGroup = 'Lactente' | 'Criança' | 'Adolescente' | '';
export type PediatricAccompanimentPresence = 'Sim' | 'Não' | 'Não informado' | '';
export type PediatricAccompanimentRelationship =
  | 'Mãe'
  | 'Pai'
  | 'Responsável legal'
  | 'Familiar'
  | 'Cuidador'
  | 'Outro'
  | 'Não informado'
  | '';

export type PediatricInformationSource =
  | 'Paciente'
  | 'Responsável/acompanhante'
  | 'Equipe assistencial'
  | 'Documento/encaminhamento'
  | 'Outra'
  | 'Não informado'
  | '';

export type PediatricPainAssessmentMethod =
  | 'Escala numérica 0–10'
  | 'FLACC'
  | 'Faces'
  | 'Outra escala'
  | 'Não avaliável'
  | 'Não avaliada'
  | 'Não informado'
  | '';

export type PediatricCommunication =
  | 'Comunica verbalmente'
  | 'Comunicação limitada'
  | 'Não verbal'
  | 'Sonolento/sedado'
  | 'Não avaliável'
  | 'Não informado'
  | '';

export type PediatricBehavior =
  | 'Calmo'
  | 'Cooperativo'
  | 'Agitado'
  | 'Irritado'
  | 'Choroso'
  | 'Ansioso'
  | 'Sonolento'
  | 'Hipoativo'
  | 'Inquieto'
  | 'Outro'
  | 'Não avaliado'
  | '';

export type PediatricBreastfeeding =
  | 'Não se aplica'
  | 'Aleitamento materno'
  | 'Aleitamento misto'
  | 'Fórmula'
  | 'Outro'
  | 'Não informado'
  | '';

export type PediatricMobility =
  | 'Deambula sem auxílio'
  | 'Deambula com auxílio'
  | 'Restrito ao leito'
  | 'Em berço'
  | 'Em incubadora'
  | 'Em maca'
  | 'Cadeira de rodas'
  | 'Mobilização passiva'
  | 'Outro'
  | 'Não avaliada'
  | '';

export type PediatricGuardRails = 'Elevadas' | 'Não elevadas' | 'Não informado' | '';
export type PediatricHeadOfBed = 'Elevada' | 'Não elevada' | 'Não informado' | '';

export interface TechnicianPediatricNursingNoteForm {
  // 1. Contexto do registro
  context: {
    moment: 'Recebo paciente' | 'Avalio paciente' | 'Plantão diurno' | 'Plantão noturno' | 'Outro' | '';
    location: 'Enfermaria' | 'Leito' | 'Box' | 'Berçário' | 'Observação' | 'Outro' | '';
    locationCustom?: string;
    infoSource: PediatricInformationSource;
  };

  // 2. Identificação e acompanhante (sem identificação nominal)
  accompaniment: {
    present: PediatricAccompanimentPresence;
    relationship?: PediatricAccompanimentRelationship;
    relationshipCustom?: string;
  };

  // 3. Características gerais
  generalCharacteristics: {
    ageGroup?: PediatricAgeGroup;
    reportedAge?: string; // ex: "4 anos", "8 meses"
    weight?: string; // ex: "15,2" ou "15,2 kg"
    height?: string; // ex: "102" ou "102 cm"
  };

  // 4. Sinais vitais
  vitalSigns: {
    systolicBP?: string;
    diastolicBP?: string;
    meanArterialPressure?: string; // PAM manual preservada verbatim
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    temperature?: string;
    capillaryBloodGlucose?: string;
  };

  // 5. Dor
  pain: {
    method: PediatricPainAssessmentMethod;
    score?: string; // Escala 0-10, FLACC, Faces
    reportedDetails?: string;
    infoSource?: PediatricInformationSource;
  };

  // 6. Neurológico/comportamento
  neuroBehavior: {
    communication: PediatricCommunication;
    behavior: PediatricBehavior[];
    behaviorCustom?: string;
    complaint?: string;
    complaintSource?: PediatricInformationSource;
  };

  // 7. Respiratório
  respiratory: {
    support: 'Ar ambiente' | 'Oxigenoterapia' | 'VNI' | 'VMI' | 'Traqueostomia' | 'Não avaliado' | '';
    oxygenDevice?: 'Cateter nasal' | 'Máscara de Venturi' | 'Máscara com reservatório' | 'Outro' | '';
    oxygenFlow?: string; // L/min
    vmiMode?: string;
    observations?: string;
  };

  // 8. Cardiovascular/perfusão
  cardiovascular: {
    perfusion: 'Normal (TEC < 2s)' | 'Lenta (TEC > 2s)' | 'Não avaliada' | '';
    extremities: 'Aquecidas' | 'Frias' | 'Cianose periférica' | 'Pálidas' | 'Outro' | 'Não avaliado' | '';
    edema: 'Ausente' | 'Presente' | 'Não avaliado' | '';
    edemaLocation?: string;
    observations?: string;
  };

  // 9. Nutrição/alimentação
  nutrition: {
    route: 'Oral' | 'Enteral' | 'Parenteral' | 'Jejum' | 'Outra' | 'Não informado' | '';
    oralAcceptance?: 'Boa' | 'Moderada' | 'Baixa' | 'Recusada' | 'Não avaliada' | '';
    enteralDevice?: 'SNE' | 'SNG' | 'GTT' | 'Outra' | '';
    enteralDeviceCustom?: string;
    enteralRate?: string;
    enteralTolerance?: 'Boa tolerância' | 'Apresentou resíduo/alteração' | 'Não avaliada' | '';
    breastfeeding?: PediatricBreastfeeding;
  };

  // 10. Eliminações
  eliminations: {
    urinary: 'Presente' | 'Ausente' | 'Não avaliada' | 'Não informado' | '';
    urinaryRoute?: 'Espontânea' | 'SVD' | 'Fralda' | 'Outro' | '';
    urinaryAspect?: string;
    bowel: 'Presentes' | 'Ausentes' | 'Não avaliadas' | '';
    bowelAspect?: 'Formadas' | 'Pastosas' | 'Líquidas' | 'Outras' | '';
    bowelAspectCustom?: string;
  };

  // 11. Dispositivos (DeviceFormCard / InvasiveDeviceItem)
  devices: InvasiveDeviceItem[];

  // 12. Pele/integridade
  skin: {
    integrity: 'Íntegra' | 'Com alteração/lesão' | 'Não avaliada' | '';
    hydration: 'Hidratada' | 'Ressecada' | 'Outra' | 'Não avaliada' | '';
    lesionDescription?: string;
    dressingPresent?: 'Sim' | 'Não' | 'Não informado' | '';
    dressingCondition?: string;
  };

  // 13. Mobilidade/segurança
  mobilitySafety: {
    mobility: PediatricMobility;
    mobilityCustom?: string;
    guardRails: PediatricGuardRails;
    headOfBed: PediatricHeadOfBed;
    bedsideAccompanist: 'Sim' | 'Não' | 'Não informado' | '';
  };

  // 14. Higiene e banho
  hygieneBath: {
    hygiene: 'Preservada' | 'Necessita cuidados' | 'Realizada higiene' | 'Não avaliada' | '';
    bathPerformed:
      | 'Não realizado'
      | 'Banho no leito'
      | 'Banho de aspersão'
      | 'Banho de aspersão com auxílio'
      | 'Banho independente'
      | 'Outro'
      | 'Não informado'
      | '';
    bathTolerance?: 'Boa tolerância' | 'Apresentou alteração/intercorrência' | 'Não avaliada' | '';
  };

  // 15. Cuidados realizados
  care: {
    actions: string[];
    otherCare?: string;
  };

  // 16. Medicações/cuidados relacionados (apenas administradas pelo técnico)
  medications: {
    administered: string[];
    notes?: string;
  };

  // 17. Intercorrências
  complications: {
    hasComplication: 'Sim' | 'Não' | 'Não informado' | '';
    description?: string;
    carePerformed?: string;
    observedResponse?: string;
    communicated?: 'Sim' | 'Não' | 'Não informado' | '';
  };

  // 18. Comunicação com responsável/equipe
  communication: {
    hasCommunication: 'Sim' | 'Não' | 'Não informado' | '';
    recipient?:
      | 'Responsável/acompanhante'
      | 'Enfermeiro'
      | 'Equipe médica'
      | 'Outra equipe'
      | 'Outro profissional'
      | '';
    recipientCustom?: string;
    reason?: string;
    time?: string;
  };

  // 19. Situação final
  finalStatus: {
    status:
      | 'Permanece no setor sob cuidados de enfermagem'
      | 'Encaminhado'
      | 'Transferência'
      | 'Alta do setor'
      | 'Outro'
      | 'Não informado'
      | '';
    statusCustom?: string;
  };

  // 20. Informações adicionais
  additionalInfo?: {
    notes?: string;
  };
}

export function createInitialTechnicianPediatricNursingNoteForm(): TechnicianPediatricNursingNoteForm {
  return {
    context: {
      moment: '',
      location: '',
      infoSource: '',
    },
    accompaniment: {
      present: '',
    },
    generalCharacteristics: {},
    vitalSigns: {},
    pain: {
      method: '',
    },
    neuroBehavior: {
      communication: '',
      behavior: [],
    },
    respiratory: {
      support: '',
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
    mobilitySafety: {
      mobility: '',
      guardRails: '',
      headOfBed: '',
      bedsideAccompanist: '',
    },
    hygieneBath: {
      hygiene: '',
      bathPerformed: '',
    },
    care: {
      actions: [],
    },
    medications: {
      administered: [],
    },
    complications: {
      hasComplication: '',
    },
    communication: {
      hasCommunication: '',
    },
    finalStatus: {
      status: '',
    },
    additionalInfo: {},
  };
}

export const PEDIATRIC_CARE_ACTIONS = [
  'Monitorização de sinais vitais',
  'Administração de medicamentos conforme prescrição',
  'Higiene corporal / banho',
  'Higiene oral',
  'Troca de fralda / cuidados com higiene íntima',
  'Mudança de decúbito',
  'Posicionamento confortável e seguro no leito/berço',
  'Manutenção de grades de proteção elevadas',
  'Cuidados e manutenção de dispositivos invasivos',
  'Curativo limpo e protegido',
  'Aspiração de vias aéreas',
  'Controle de peso diário',
  'Controle de balanço hídrico',
  'Controle de eliminações fisiológicas',
  'Aferição de glicemia capilar',
  'Coleta de exames laboratoriais',
  'Acolhimento e orientação ao acompanhante',
] as const;
