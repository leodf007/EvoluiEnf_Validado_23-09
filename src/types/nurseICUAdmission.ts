export interface NurseICUVasoactiveDrugItem {
  drugName: string;
  concentration: string;
  flowRate: string;
  rateUnit: string;
  route?: string;
}

export interface NurseICUSedationItem {
  drugName: string;
  flowRate: string;
  rateUnit: string;
  indication?: string;
}

export interface NurseICUInvasiveDeviceItem {
  id?: string;
  deviceType: string;
  anatomicalSite: string;
  insertionSide?: string;
  permeability: string;
  functioningStatus: string;
  dressingCondition: string;
  insertionDate?: string;
}

export interface NurseICUAdmissionForm {
  // 1. Contexto da admissão
  admissionContext: {
    moment: 'Admito paciente' | 'Recebo paciente' | string;
    customMoment?: string;
    bedLocation: string;
  };

  // 2. Origem/procedência
  origin: {
    patientOrigin: 'PS' | 'Centro cirúrgico' | 'Enfermaria' | 'UPA' | 'Outro' | string;
    originDetails?: string;
  };

  // 3. Transporte e chegada
  arrivalTransport: {
    arrivalMode: 'maca' | 'cadeira de rodas' | 'leito' | 'ambulância' | 'outro' | string;
    customArrivalMode?: string;
    transportSupport?: string;
  };

  // 4. Identificação e segurança
  safetyIdentification: {
    wristbandChecked: 'Sim' | 'Não' | string;
    bedSignChecked: 'Sim' | 'Não' | string;
  };

  // 5. Acompanhante
  companion: {
    companionType: 'familiar' | 'cuidador' | 'equipe' | 'desacompanhado' | string;
    customCompanionType?: string;
  };

  // 6. Alergias
  allergies: {
    hasAllergies: 'Nega' | 'Sim' | 'Não informado' | string;
    allergiesDetails?: string;
  };

  // 7. Precauções/isolamento
  precautions: {
    precautionType: 'Padrão' | 'Contato' | 'Gotículas' | 'Aerossóis' | 'Outra' | string;
    customPrecaution?: string;
  };

  // 8. Motivo informado da internação
  admissionReason: {
    reasonText: string;
  };

  // 9. Histórico informado
  reportedHistory: {
    pastHistoryText?: string;
    comorbidities?: string;
    homeMedications?: string;
  };

  // 10. Avaliação geral
  generalAssessment: {
    generalState: 'Grave' | 'Estável' | 'Regular' | 'Crítico estável' | string;
    complaints: 'Sem queixas' | 'Queixa referida' | 'Não contactante' | string;
    complaintsDescription?: string;
  };

  // 11. Nível de consciência
  neurologicalState: {
    consciousness: 'consciente' | 'sonolento' | 'sedado' | 'rebaixado' | 'outro' | string;
    customConsciousness?: string;
  };

  // 12. Glasgow
  glasgow: {
    score: string;
  };

  // 13. RASS
  rass: {
    score: string;
  };

  // 14. Pupilas
  pupils: {
    equality: 'isocóricas' | 'anisocóricas' | 'não avaliável' | string;
    reactivity: 'fotorreagentes' | 'reagentes lentas' | 'não fotorreagentes' | 'não avaliável' | string;
  };

  // 15. Dor
  pain: {
    scale: 'escala numérica' | 'BPS' | 'CPOT' | 'outra' | 'não avaliável' | string;
    score?: string;
    location?: string;
  };

  // 16. Sinais vitais
  vitalSigns: {
    systolicBP: string;
    diastolicBP: string;
    meanArterialPressure: string; // Manualmente informada - NUNCA calculada
    heartRate: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    temperature: string;
    bloodGlucose: string;
  };

  // 17. Suporte respiratório
  respiratorySupport: {
    supportType: 'ar ambiente' | 'oxigenoterapia' | 'VNI' | 'VMI' | 'traqueostomia' | string;
    deviceDetails?: string;
    oxygenFlowRate?: string;
  };

  // 18. Ventilação mecânica (somente se VMI)
  mechanicalVentilation: {
    airwayType: 'TOT' | 'TQT' | string;
    tubeCaliber?: string;
    fixationMark?: string;
    ventilationMode?: string;
    fio2?: string;
    peep?: string;
    tidalVolume?: string;
    respiratoryRateSet?: string;
  };

  // 19. Avaliação cardiovascular
  cardiovascularAssessment: {
    perfusion: 'adequada' | 'reduzida' | string;
    extremities: 'aquecidas' | 'frias' | string;
    capillaryRefillTime?: '<= 2 segundos' | '> 2 segundos' | string;
    edema?: 'Ausente' | 'Presente' | string;
    edemaDetails?: string;
    heartRhythm?: string;
  };

  // 20. Drogas vasoativas
  vasoactiveDrugs: {
    hasVasoactiveDrugs: 'Sim' | 'Não' | string;
    drugs: NurseICUVasoactiveDrugItem[];
  };

  // 21. Sedação e analgesia contínua
  sedationAnalgesia: {
    hasSedationAnalgesia: 'Sim' | 'Não' | string;
    continuousInfusions: NurseICUSedationItem[];
  };

  // 22. Avaliação gastrointestinal
  gastrointestinal: {
    abdomenAspect: 'Plano' | 'Globoso' | 'Distendido' | 'Flácido' | 'Escavado' | string;
    bowelSounds: 'Presentes' | 'Ausentes' | 'Diminuídos' | string;
    nauseaVomiting: 'Ausentes' | 'Náuseas' | 'Vômitos' | string;
  };

  // 23. Nutrição
  nutrition: {
    dietType: 'dieta oral' | 'enteral' | 'parenteral' | 'jejum' | string;
    enteralDevice?: 'SNE' | 'SNG' | 'GTT' | '' | string;
    infusionRate?: string;
    tolerance?: string;
  };

  // 24. Eliminações
  eliminations: {
    diuresisType: 'espontânea' | 'SVD' | 'outros' | string;
    diuresisCharacteristics?: string;
    bowelElimination: 'Ausente' | 'Presente' | 'Evacuação preservada' | string;
    bowelCharacteristics?: string;
  };

  // 25. Balanço hídrico inicial
  initialWaterBalance: {
    status: 'Zerado na admissão' | 'Parcial informado' | 'Não mensurado' | string;
    balanceValue?: string;
    observations?: string;
  };

  // 26. Dispositivos invasivos
  invasiveDevices: {
    hasInvasiveDevices: 'Sim' | 'Não' | string;
    devices: NurseICUInvasiveDeviceItem[];
  };

  // 27. Pele e integridade cutânea
  skinIntegrity: {
    integrity: 'íntegra' | 'lesão' | string;
    lesionLocation?: string;
    lesionDescription?: string;
    dressingApplied?: string;
  };

  // 28. Riscos assistenciais
  careRisks: {
    risksList: string[];
    bedRailsRaised: 'Sim' | 'Não' | string;
    preventativeMeasures?: string;
  };

  // 29. Cuidados realizados na admissão
  admissionCare: {
    actions: string[];
    customActions?: string;
  };

  // 30. Intercorrências
  complications: {
    hasComplication: 'Sim' | 'Não' | 'Não informado' | string;
    description?: string;
    immediateAction?: string;
    communicationDone?: string;
    complicationTime?: string;
  };

  // 31. Comunicação multiprofissional
  multiprofessionalCommunication: {
    hasCommunication: 'Sim' | 'Não' | string;
    targetTeam?: string;
    reason?: string;
    observedResponse?: string;
  };

  // 32. Situação após admissão
  postAdmissionStatus: {
    patientStatus: 'Permanece no leito em monitorização contínua' | 'Estável sob vigilância intensiva' | 'Outro' | string;
    customStatus?: string;
    pendingIssues?: string;
  };
}

export function createInitialNurseICUAdmissionForm(): NurseICUAdmissionForm {
  return {
    admissionContext: {
      moment: 'Admito paciente',
      customMoment: '',
      bedLocation: '',
    },
    origin: {
      patientOrigin: 'PS',
      originDetails: '',
    },
    arrivalTransport: {
      arrivalMode: 'maca',
      customArrivalMode: '',
      transportSupport: '',
    },
    safetyIdentification: {
      wristbandChecked: 'Sim',
      bedSignChecked: 'Sim',
    },
    companion: {
      companionType: 'equipe',
      customCompanionType: '',
    },
    allergies: {
      hasAllergies: 'Nega',
      allergiesDetails: '',
    },
    precautions: {
      precautionType: 'Padrão',
      customPrecaution: '',
    },
    admissionReason: {
      reasonText: '',
    },
    reportedHistory: {
      pastHistoryText: '',
      comorbidities: '',
      homeMedications: '',
    },
    generalAssessment: {
      generalState: 'Grave',
      complaints: 'Sem queixas',
      complaintsDescription: '',
    },
    neurologicalState: {
      consciousness: 'consciente',
      customConsciousness: '',
    },
    glasgow: {
      score: '',
    },
    rass: {
      score: '',
    },
    pupils: {
      equality: 'isocóricas',
      reactivity: 'fotorreagentes',
    },
    pain: {
      scale: 'não avaliável',
      score: '',
      location: '',
    },
    vitalSigns: {
      systolicBP: '',
      diastolicBP: '',
      meanArterialPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      bloodGlucose: '',
    },
    respiratorySupport: {
      supportType: 'ar ambiente',
      deviceDetails: '',
      oxygenFlowRate: '',
    },
    mechanicalVentilation: {
      airwayType: 'TOT',
      tubeCaliber: '',
      fixationMark: '',
      ventilationMode: '',
      fio2: '',
      peep: '',
      tidalVolume: '',
      respiratoryRateSet: '',
    },
    cardiovascularAssessment: {
      perfusion: 'adequada',
      extremities: 'aquecidas',
      capillaryRefillTime: '<= 2 segundos',
      edema: 'Ausente',
      edemaDetails: '',
      heartRhythm: '',
    },
    vasoactiveDrugs: {
      hasVasoactiveDrugs: 'Não',
      drugs: [],
    },
    sedationAnalgesia: {
      hasSedationAnalgesia: 'Não',
      continuousInfusions: [],
    },
    gastrointestinal: {
      abdomenAspect: 'Plano',
      bowelSounds: 'Presentes',
      nauseaVomiting: 'Ausentes',
    },
    nutrition: {
      dietType: 'jejum',
      enteralDevice: '',
      infusionRate: '',
      tolerance: '',
    },
    eliminations: {
      diuresisType: 'espontânea',
      diuresisCharacteristics: '',
      bowelElimination: 'Ausente',
      bowelCharacteristics: '',
    },
    initialWaterBalance: {
      status: 'Zerado na admissão',
      balanceValue: '',
      observations: '',
    },
    invasiveDevices: {
      hasInvasiveDevices: 'Não',
      devices: [],
    },
    skinIntegrity: {
      integrity: 'íntegra',
      lesionLocation: '',
      lesionDescription: '',
      dressingApplied: '',
    },
    careRisks: {
      risksList: [],
      bedRailsRaised: 'Sim',
      preventativeMeasures: '',
    },
    admissionCare: {
      actions: [],
      customActions: '',
    },
    complications: {
      hasComplication: 'Não',
      description: '',
      immediateAction: '',
      communicationDone: '',
      complicationTime: '',
    },
    multiprofessionalCommunication: {
      hasCommunication: 'Não',
      targetTeam: '',
      reason: '',
      observedResponse: '',
    },
    postAdmissionStatus: {
      patientStatus: 'Permanece no leito em monitorização contínua',
      customStatus: '',
      pendingIssues: '',
    },
  };
}

export function createSampleNurseICUAdmissionForm(): NurseICUAdmissionForm {
  return {
    admissionContext: {
      moment: 'Recebo paciente',
      customMoment: '',
      bedLocation: 'Leito 04 - UTI Geral',
    },
    origin: {
      patientOrigin: 'PS',
      originDetails: 'Emergência Clínica com relato de rebaixamento e insuficiência respiratória',
    },
    arrivalTransport: {
      arrivalMode: 'maca',
      customArrivalMode: '',
      transportSupport: 'Monitor multiparamétrico e oxigênio portátil',
    },
    safetyIdentification: {
      wristbandChecked: 'Sim',
      bedSignChecked: 'Sim',
    },
    companion: {
      companionType: 'equipe',
      customCompanionType: 'Equipe de transporte médico do PS',
    },
    allergies: {
      hasAllergies: 'Nega',
      allergiesDetails: '',
    },
    precautions: {
      precautionType: 'Padrão',
      customPrecaution: '',
    },
    admissionReason: {
      reasonText: 'Insuficiência respiratória aguda e necessidade de suporte ventilatório invasivo',
    },
    reportedHistory: {
      pastHistoryText: 'Hipertensão arterial sistêmica e Diabetes mellitus tipo 2',
      comorbidities: 'HAS, DM2',
      homeMedications: 'Losartana 50mg, Metformina 850mg',
    },
    generalAssessment: {
      generalState: 'Grave',
      complaints: 'Não contactante',
      complaintsDescription: 'Sedado em ventilação mecânica invasiva',
    },
    neurologicalState: {
      consciousness: 'sedado',
      customConsciousness: 'Sedação contínua',
    },
    glasgow: {
      score: 'Não avaliável (sedado/intubado)',
    },
    rass: {
      score: '-4',
    },
    pupils: {
      equality: 'isocóricas',
      reactivity: 'fotorreagentes',
    },
    pain: {
      scale: 'CPOT',
      score: '1',
      location: 'Tubo orotraqueal',
    },
    vitalSigns: {
      systolicBP: '110',
      diastolicBP: '70',
      meanArterialPressure: '83',
      heartRate: '88',
      respiratoryRate: '16',
      oxygenSaturation: '96',
      temperature: '36.5',
      bloodGlucose: '138',
    },
    respiratorySupport: {
      supportType: 'VMI',
      deviceDetails: 'Via TOT',
      oxygenFlowRate: '',
    },
    mechanicalVentilation: {
      airwayType: 'TOT',
      tubeCaliber: '7.5 mm',
      fixationMark: '22 cm na rima labial',
      ventilationMode: 'VCV',
      fio2: '40%',
      peep: '8 cmH2O',
      tidalVolume: '420 mL',
      respiratoryRateSet: '16 rpm',
    },
    cardiovascularAssessment: {
      perfusion: 'adequada',
      extremities: 'aquecidas',
      capillaryRefillTime: '<= 2 segundos',
      edema: 'Ausente',
      edemaDetails: '',
      heartRhythm: 'Ritmo sinusal ao monitor',
    },
    vasoactiveDrugs: {
      hasVasoactiveDrugs: 'Sim',
      drugs: [
        {
          drugName: 'Noradrenalina',
          concentration: '64 mcg/mL',
          flowRate: '8',
          rateUnit: 'mL/h',
          route: 'CVC jugular interna D',
        },
      ],
    },
    sedationAnalgesia: {
      hasSedationAnalgesia: 'Sim',
      continuousInfusions: [
        {
          drugName: 'Fentanil',
          flowRate: '5',
          rateUnit: 'mL/h',
          indication: 'Analgesia contínua',
        },
        {
          drugName: 'Midazolam',
          flowRate: '6',
          rateUnit: 'mL/h',
          indication: 'Sedação contínua',
        },
      ],
    },
    gastrointestinal: {
      abdomenAspect: 'Flácido',
      bowelSounds: 'Presentes',
      nauseaVomiting: 'Ausentes',
    },
    nutrition: {
      dietType: 'jejum',
      enteralDevice: '',
      infusionRate: '',
      tolerance: '',
    },
    eliminations: {
      diuresisType: 'SVD',
      diuresisCharacteristics: 'Diurese clara sem grumos, bolsa coletora com 150 mL na admissão',
      bowelElimination: 'Ausente',
      bowelCharacteristics: '',
    },
    initialWaterBalance: {
      status: 'Zerado na admissão',
      balanceValue: '0',
      observations: 'Iniciado controle rigoroso de balanço hídrico na UTI',
    },
    invasiveDevices: {
      hasInvasiveDevices: 'Sim',
      devices: [
        {
          id: 'dev-1',
          deviceType: 'TOT',
          anatomicalSite: 'Cavidade oral',
          insertionSide: 'Central',
          permeability: 'Pérvio',
          functioningStatus: 'Funcionante',
          dressingCondition: 'Fixação com cadarço limpa e seca',
        },
        {
          id: 'dev-2',
          deviceType: 'CVC',
          anatomicalSite: 'Jugular interna',
          insertionSide: 'Direita',
          permeability: 'Pérvio',
          functioningStatus: 'Funcionante',
          dressingCondition: 'Curativo estéril transparente com clorexidina íntegro',
        },
        {
          id: 'dev-3',
          deviceType: 'SVD',
          anatomicalSite: 'Uretra',
          insertionSide: '',
          permeability: 'Pérvio',
          functioningStatus: 'Drenando diurese clara',
          dressingCondition: 'Fixação em face interna de coxa íntegra',
        },
      ],
    },
    skinIntegrity: {
      integrity: 'íntegra',
      lesionLocation: '',
      lesionDescription: '',
      dressingApplied: '',
    },
    careRisks: {
      risksList: ['Risco de lesão por pressão', 'Risco de broncoaspiração', 'Risco de infecção relacionada a dispositivos'],
      bedRailsRaised: 'Sim',
      preventativeMeasures: 'Colchão pneumático instalado, cabeceira a 30 graus, grades elevadas',
    },
    admissionCare: {
      actions: [
        'Acomodação no leito de UTI',
        'Monitorização multiparamétrica contínua (ECG, SpO2, PNI, temperatura)',
        'Conexão e checagem de parâmetros de ventilação mecânica',
        'Instalação de bombas de infusão contínua para drogas vasoativas e sedação',
        'Coleta de exames laboratoriais admissionais e gasometria arterial',
        'Checagem de posicionamento e fixação de dispositivos invasivos',
      ],
      customActions: '',
    },
    complications: {
      hasComplication: 'Não',
      description: '',
      immediateAction: '',
      communicationDone: '',
      complicationTime: '',
    },
    multiprofessionalCommunication: {
      hasCommunication: 'Sim',
      targetTeam: 'Médico intensivista plantonista Dr. Marcos',
      reason: 'Passagem de caso na admissão, confirmação de metas hemodinâmicas e ventilatórias',
      observedResponse: 'Ciente, confirmadas metas de PAM >= 65 mmHg e ventilação protetora',
    },
    postAdmissionStatus: {
      patientStatus: 'Permanece no leito em monitorização contínua',
      customStatus: '',
      pendingIssues: 'Aguardando resultado de exames admissionais e RX de tórax de controle de dispositivos',
    },
  };
}
