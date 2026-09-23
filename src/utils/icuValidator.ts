import {
  TechnicianICUNursingNoteForm,
  SectionStatus,
  VasoactiveDrugItem,
  SedationAnalgesiaItem,
  ICUDeviceItem,
} from '../types/icuClinical';

export interface ValidationWarning {
  id: string;
  field: string;
  message: string;
}

export function createInitialICUForm(): TechnicianICUNursingNoteForm {
  return {
    context: {
      moment: '',
      accompaniment: '',
      wristbandChecked: '',
      bedSignChecked: '',
      allergies: '',
      allergiesDetails: '',
      precaution: '',
      precautionCustom: '',
    },
    observedCondition: {
      behavior: [],
      behaviorCustom: '',
      complaints: '',
      complaintsDetails: '',
      informationSource: '',
    },
    vitalSignsAndPain: {
      systolicBP: '',
      diastolicBP: '',
      meanArterialPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      bloodGlucose: '',
      painAssessmentType: '',
      painNumericScaleValue: undefined,
      painOtherScaleName: '',
      painOtherScaleResult: '',
      painLocation: '',
      painCharacteristics: '',
    },
    neurologicalAndSedation: {
      consciousnessLevel: '',
      consciousnessCustom: '',
      orientation: '',
      glasgowType: '',
      glasgowScore: undefined,
      rassType: '',
      rassScore: undefined,
      pupils: '',
      pupilsCustom: '',
      photoreaction: '',
      photoreactionCustom: '',
    },
    respiratoryAndVentilation: {
      respiratorySupport: '',
      respiratorySupportCustom: '',
      oxygenDevice: '',
      oxygenDeviceCustom: '',
      oxygenFlowRate: '',
      oxygenFiO2: '',
      mechanicalVentilationAirway: '',
      mechanicalVentilationAirwayCustom: '',
      ventilationMode: '',
      ventilationFiO2: '',
      ventilationPeep: '',
      ventilationRate: '',
      ventilationTidalVolume: '',
      ventilationSupportPressure: '',
      ventilationInspiratoryPressure: '',
      ventilationOtherParams: '',
      totNumber: '',
      totFixation: '',
      totPositionMarking: '',
      tracheostomyCaliber: '',
      tracheostomyStomaCondition: '',
      tracheostomyFixation: '',
      tracheostomyDressing: '',
      tracheostomyObservations: '',
      respiratoryPattern: '',
      respiratoryPatternCustom: '',
      respiratoryDistress: '',
      accessoryMuscleUse: '',
      secretionsPresence: '',
      secretionsQuantity: '',
      secretionsColor: '',
      secretionsAspect: '',
      secretionsConsistency: '',
      secretionsOdor: '',
      secretionsObservations: '',
    },
    cardiovascularAndPerfusion: {
      peripheralPerfusion: '',
      extremities: '',
      extremitiesCustom: '',
      capillaryRefillTime: '',
      capillaryRefillTimeValue: '',
      edema: '',
      edemaLocations: [],
      edemaGrading: '',
      hasInvasiveMonitoring: '',
      invasiveArterialPressureSite: '',
      invasiveArterialPressureValue: '',
      centralVenousPressureValue: '',
      otherInvasiveMonitoring: '',
    },
    vasoactiveDrugs: {
      inUse: '',
      drugsList: [],
    },
    sedationAndAnalgesia: {
      inUse: '',
      infusionsList: [],
    },
    nutritionAndGastrointestinal: {
      nutritionalStatus: '',
      oralDietAcceptance: '',
      enteralRoute: '',
      enteralRouteCustom: '',
      enteralInfusionRate: '',
      enteralTolerance: '',
      enteralToleranceCustom: '',
      enteralDietPaused: false,
      enteralObservations: '',
      abdomenInspection: '',
      abdomenInspectionCustom: '',
      abdomenConsistency: '',
      abdomenPalpation: '',
      bowelSounds: '',
    },
    eliminationsAndFluidBalance: {
      diuresis: '',
      urinaryRoute: '',
      urinaryRouteCustom: '',
      svdCaliber: '',
      svdPermeable: '',
      diuresisColor: '',
      diuresisAspect: '',
      diuresisVolume: '',
      diuresisObservations: '',
      bowelMovement: '',
      bowelAspect: '',
      bowelAspectCustom: '',
      bowelFrequency: '',
      bowelQuantity: '',
      hasFluidBalance: '',
      fluidIntake: '',
      fluidOutput: '',
      fluidBalanceResult: '',
    },
    devices: {
      list: [],
    },
    skinAndIntegrity: {
      integrity: '',
      hydration: '',
      hydrationCustom: '',
      lesionLocation: '',
      lesionDescription: '',
      lesionDressingPresent: '',
      lesionCareDone: '',
      lesionObservations: '',
    },
    mobilityAndPositioning: {
      mobility: '',
      mobilityCustom: '',
      decubitusChangeDone: '',
      decubitusInterval: '',
      decubitusIntervalCustom: '',
      bedHeadElevated: '',
      bedHeadAngle: '',
      bedHeadAngleCustom: '',
      sideRails: '',
    },
    hygieneAndBath: {
      bodyHygiene: '',
      bathType: '',
      bathTypeCustom: '',
      bathTolerance: '',
      bathToleranceDetails: '',
    },
    nursingCareDone: {
      careItems: [],
      otherCareDescription: '',
    },
    complicationsAndCommunication: {
      hasComplication: '',
      complicationDescription: '',
      complicationTime: '',
      nursingActionsTaken: '',
      patientResponse: '',
      communicatedTo: '',
      communicationRecipientCustom: '',
      communicationTime: '',
      communicationDetails: '',
    },
    observedChangesInPeriod: {
      comparisonStatus: '',
      changeDescription: '',
    },
    finalStatus: {
      condition: '',
      conditionCustom: '',
    },
    additionalInfo: {
      observations: '',
    },
  };
}

export function createEmptyVasoactiveDrug(): VasoactiveDrugItem {
  return {
    id: `dva-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    medication: '',
    concentration: '',
    infusionRate: '',
    unit: 'mL/h',
    observations: '',
  };
}

export function createEmptySedationAnalgesia(): SedationAnalgesiaItem {
  return {
    id: `sed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    medication: '',
    concentration: '',
    rateOrDose: '',
    unit: 'mL/h',
    purpose: '',
    observations: '',
  };
}

export function createEmptyICUDevice(): ICUDeviceItem {
  return {
    id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: '',
    customType: '',
    location: '',
    insertionDate: '',
    permeability: '',
    functioning: '',
    dressingStatus: '',
    phlogisticSigns: '',
  };
}

/**
 * Validates the ICU form for non-blocking clinical documentation warnings (UTI-V-001 to UTI-V-010)
 */
export function validateICUForm(form: TechnicianICUNursingNoteForm): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // UTI-V-001: Oxigenoterapia sem dispositivo
  if (
    form.respiratoryAndVentilation.respiratorySupport === 'Oxigenoterapia' &&
    !form.respiratoryAndVentilation.oxygenDevice?.trim()
  ) {
    warnings.push({
      id: 'UTI-V-001',
      field: 'respiratoryAndVentilation.oxygenDevice',
      message: 'Oxigenoterapia selecionada sem especificação do dispositivo.',
    });
  }

  // UTI-V-002: Oxigenoterapia sem fluxo
  if (
    form.respiratoryAndVentilation.respiratorySupport === 'Oxigenoterapia' &&
    !form.respiratoryAndVentilation.oxygenFlowRate?.trim()
  ) {
    warnings.push({
      id: 'UTI-V-002',
      field: 'respiratoryAndVentilation.oxygenFlowRate',
      message: 'Oxigenoterapia selecionada sem fluxo (L/min) informado.',
    });
  }

  // UTI-V-003: VMI sem via aérea
  if (
    form.respiratoryAndVentilation.respiratorySupport === 'Ventilação mecânica invasiva' &&
    !form.respiratoryAndVentilation.mechanicalVentilationAirway?.trim()
  ) {
    warnings.push({
      id: 'UTI-V-003',
      field: 'respiratoryAndVentilation.mechanicalVentilationAirway',
      message: 'Ventilação Mecânica Invasiva (VMI) selecionada sem via aérea (TOT/Traqueostomia).',
    });
  }

  // UTI-V-004: SVD sem condição/débito informado
  if (
    form.eliminationsAndFluidBalance.urinaryRoute === 'SVD' &&
    !form.eliminationsAndFluidBalance.diuresisVolume?.trim() &&
    !form.eliminationsAndFluidBalance.diuresis?.trim()
  ) {
    warnings.push({
      id: 'UTI-V-004',
      field: 'eliminationsAndFluidBalance.diuresisVolume',
      message: 'SVD selecionada sem débito ou aspecto de diurese informados.',
    });
  }

  // UTI-V-005: Dispositivo sem localização
  if (form.devices.list && form.devices.list.length > 0) {
    form.devices.list.forEach((dev, idx) => {
      if (dev.type && dev.type.trim() && !dev.location?.trim()) {
        warnings.push({
          id: 'UTI-V-005',
          field: `devices.list[${idx}].location`,
          message: `Dispositivo ${dev.type} sem sítio de inserção/localização informado.`,
        });
      }
    });
  }

  // UTI-V-006: Lesão sem localização
  if (
    form.skinAndIntegrity.integrity === 'Com alteração/lesão' &&
    !form.skinAndIntegrity.lesionLocation?.trim()
  ) {
    warnings.push({
      id: 'UTI-V-006',
      field: 'skinAndIntegrity.lesionLocation',
      message: 'Alteração cutânea/lesão selecionada sem localização anatômica informada.',
    });
  }

  // UTI-V-007: Intercorrência sem descrição
  if (
    form.complicationsAndCommunication.hasComplication === 'Sim' &&
    !form.complicationsAndCommunication.complicationDescription?.trim()
  ) {
    warnings.push({
      id: 'UTI-V-007',
      field: 'complicationsAndCommunication.complicationDescription',
      message: 'Intercorrência indicada como "Sim" sem descrição dos fatos ocorridos.',
    });
  }

  // UTI-V-008: Comunicação sem destinatário
  if (
    form.complicationsAndCommunication.hasComplication === 'Sim' &&
    form.complicationsAndCommunication.communicatedTo &&
    form.complicationsAndCommunication.communicatedTo !== 'Não realizada' &&
    form.complicationsAndCommunication.communicatedTo === 'Outro profissional' &&
    !form.complicationsAndCommunication.communicationRecipientCustom?.trim()
  ) {
    warnings.push({
      id: 'UTI-V-008',
      field: 'complicationsAndCommunication.communicationRecipientCustom',
      message: 'Comunicação realizada para "Outro profissional" sem identificação da função/categoria.',
    });
  }

  // UTI-V-009: DVA sem medicamento
  if (form.vasoactiveDrugs.inUse === 'Sim') {
    const emptyDrugs = form.vasoactiveDrugs.drugsList.filter((d) => !d.medication?.trim());
    if (form.vasoactiveDrugs.drugsList.length === 0 || emptyDrugs.length > 0) {
      warnings.push({
        id: 'UTI-V-009',
        field: 'vasoactiveDrugs.drugsList',
        message: 'Drogas vasoativas em uso marcadas como "Sim" sem medicamento preenchido.',
      });
    }
  }

  // UTI-V-010: Sedação/analgesia = Sim sem medicamento
  if (form.sedationAndAnalgesia.inUse === 'Sim') {
    const emptySeds = form.sedationAndAnalgesia.infusionsList.filter((s) => !s.medication?.trim());
    if (form.sedationAndAnalgesia.infusionsList.length === 0 || emptySeds.length > 0) {
      warnings.push({
        id: 'UTI-V-010',
        field: 'sedationAndAnalgesia.infusionsList',
        message: 'Infusão contínua de sedação/analgesia marcada como "Sim" sem medicamento preenchido.',
      });
    }
  }

  return warnings;
}

/**
 * Calculates section completion status dynamically.
 * Rule: NO section should start as 'completed'.
 */
export function getICUSectionStatus(
  form: TechnicianICUNursingNoteForm,
  sectionKey: keyof TechnicianICUNursingNoteForm
): SectionStatus {
  switch (sectionKey) {
    case 'context':
      if (!form.context.moment && !form.context.accompaniment && !form.context.allergies) {
        return 'not_started';
      }
      return form.context.moment ? 'completed' : 'in_progress';

    case 'observedCondition':
      if (
        form.observedCondition.behavior.length === 0 &&
        !form.observedCondition.complaints
      ) {
        return 'not_started';
      }
      return form.observedCondition.behavior.length > 0 || form.observedCondition.complaints ? 'completed' : 'in_progress';

    case 'vitalSignsAndPain':
      const hasVital =
        form.vitalSignsAndPain.systolicBP ||
        form.vitalSignsAndPain.meanArterialPressure ||
        form.vitalSignsAndPain.heartRate ||
        form.vitalSignsAndPain.respiratoryRate ||
        form.vitalSignsAndPain.oxygenSaturation ||
        form.vitalSignsAndPain.temperature ||
        form.vitalSignsAndPain.painAssessmentType;
      return hasVital ? 'completed' : 'not_started';

    case 'neurologicalAndSedation':
      if (
        !form.neurologicalAndSedation.consciousnessLevel &&
        !form.neurologicalAndSedation.orientation &&
        form.neurologicalAndSedation.glasgowScore === undefined &&
        form.neurologicalAndSedation.rassScore === undefined &&
        !form.neurologicalAndSedation.pupils
      ) {
        return 'not_started';
      }
      return 'completed';

    case 'respiratoryAndVentilation':
      return form.respiratoryAndVentilation.respiratorySupport ? 'completed' : 'not_started';

    case 'cardiovascularAndPerfusion':
      if (
        !form.cardiovascularAndPerfusion.peripheralPerfusion &&
        !form.cardiovascularAndPerfusion.extremities &&
        !form.cardiovascularAndPerfusion.capillaryRefillTime &&
        !form.cardiovascularAndPerfusion.edema &&
        !form.cardiovascularAndPerfusion.hasInvasiveMonitoring
      ) {
        return 'not_started';
      }
      return 'completed';

    case 'vasoactiveDrugs':
      if (!form.vasoactiveDrugs.inUse) return 'not_started';
      if (form.vasoactiveDrugs.inUse === 'Sim' && form.vasoactiveDrugs.drugsList.length === 0) return 'in_progress';
      return 'completed';

    case 'sedationAndAnalgesia':
      if (!form.sedationAndAnalgesia.inUse) return 'not_started';
      if (form.sedationAndAnalgesia.inUse === 'Sim' && form.sedationAndAnalgesia.infusionsList.length === 0) return 'in_progress';
      return 'completed';

    case 'nutritionAndGastrointestinal':
      if (
        !form.nutritionAndGastrointestinal.nutritionalStatus &&
        !form.nutritionAndGastrointestinal.abdomenInspection &&
        !form.nutritionAndGastrointestinal.bowelSounds
      ) {
        return 'not_started';
      }
      return 'completed';

    case 'eliminationsAndFluidBalance':
      if (
        !form.eliminationsAndFluidBalance.diuresis &&
        !form.eliminationsAndFluidBalance.bowelMovement &&
        !form.eliminationsAndFluidBalance.hasFluidBalance
      ) {
        return 'not_started';
      }
      return 'completed';

    case 'devices':
      return form.devices.list.length > 0 ? 'completed' : 'not_started';

    case 'skinAndIntegrity':
      return form.skinAndIntegrity.integrity ? 'completed' : 'not_started';

    case 'mobilityAndPositioning':
      if (
        !form.mobilityAndPositioning.mobility &&
        !form.mobilityAndPositioning.decubitusChangeDone &&
        !form.mobilityAndPositioning.bedHeadElevated &&
        !form.mobilityAndPositioning.sideRails
      ) {
        return 'not_started';
      }
      return 'completed';

    case 'hygieneAndBath':
      if (!form.hygieneAndBath.bodyHygiene && !form.hygieneAndBath.bathType) return 'not_started';
      return 'completed';

    case 'nursingCareDone':
      return form.nursingCareDone.careItems.length > 0 || form.nursingCareDone.otherCareDescription
        ? 'completed'
        : 'not_started';

    case 'complicationsAndCommunication':
      return form.complicationsAndCommunication.hasComplication ? 'completed' : 'not_started';

    case 'observedChangesInPeriod':
      return form.observedChangesInPeriod.comparisonStatus ? 'completed' : 'not_started';

    case 'finalStatus':
      return form.finalStatus.condition ? 'completed' : 'not_started';

    case 'additionalInfo':
      return form.additionalInfo.observations?.trim() ? 'completed' : 'not_started';

    default:
      return 'not_started';
  }
}

export function getICUSectionStatuses(form: TechnicianICUNursingNoteForm): SectionStatus[] {
  const sectionKeys: (keyof TechnicianICUNursingNoteForm)[] = [
    'context',
    'observedCondition',
    'vitalSignsAndPain',
    'neurologicalAndSedation',
    'respiratoryAndVentilation',
    'cardiovascularAndPerfusion',
    'vasoactiveDrugs',
    'sedationAndAnalgesia',
    'nutritionAndGastrointestinal',
    'eliminationsAndFluidBalance',
    'devices',
    'skinAndIntegrity',
    'mobilityAndPositioning',
    'hygieneAndBath',
    'nursingCareDone',
    'complicationsAndCommunication',
    'observedChangesInPeriod',
    'finalStatus',
    'additionalInfo',
  ];

  return sectionKeys.map((key) => getICUSectionStatus(form, key));
}

export function createSampleICUForm(): TechnicianICUNursingNoteForm {
  return {
    context: {
      moment: 'Recebo paciente',
      accompaniment: 'Desacompanhado',
      wristbandChecked: 'Sim',
      bedSignChecked: 'Sim',
      allergies: 'Não referidas',
      precaution: 'Padrão',
    },
    observedCondition: {
      behavior: ['Sedado'],
      complaints: 'Impossibilitado de informar',
      informationSource: 'Equipe',
    },
    vitalSignsAndPain: {
      systolicBP: '120',
      diastolicBP: '75',
      meanArterialPressure: '90',
      heartRate: '78',
      respiratoryRate: '16',
      oxygenSaturation: '98',
      temperature: '36.6',
      bloodGlucose: '110',
      painAssessmentType: 'Não avaliável',
    },
    neurologicalAndSedation: {
      consciousnessLevel: 'Sedado',
      orientation: 'Não avaliável',
      glasgowType: 'score',
      glasgowScore: 6,
      rassType: 'score',
      rassScore: -4,
      pupils: 'Isocóricas',
      photoreaction: 'Fotorreagentes',
    },
    respiratoryAndVentilation: {
      respiratorySupport: 'Ventilação mecânica invasiva',
      mechanicalVentilationAirway: 'TOT',
      totNumber: '8.0',
      totFixation: 'Cadarço íntegro',
      totPositionMarking: '22 cm',
      ventilationMode: 'VCV',
      ventilationFiO2: '40',
      ventilationPeep: '6',
      ventilationRate: '16',
      ventilationTidalVolume: '420',
      ventilationSupportPressure: '0',
      respiratoryPattern: 'Eupneico',
      respiratoryDistress: 'Ausente',
      secretionsPresence: 'Presente',
      secretionsQuantity: 'pequena',
      secretionsColor: 'esbranquiçada',
      secretionsAspect: 'fluida',
      secretionsOdor: 'inodoro',
    },
    cardiovascularAndPerfusion: {
      peripheralPerfusion: 'Adequada',
      extremities: 'Quentes',
      capillaryRefillTime: '< 2 segundos',
      edema: 'Ausente',
      hasInvasiveMonitoring: 'Sim',
      invasiveArterialPressureValue: '120/75 (90) mmHg',
      centralVenousPressureValue: '8 mmHg',
    },
    vasoactiveDrugs: {
      inUse: 'Sim',
      drugsList: [
        {
          id: 'sample-dva-1',
          medication: 'Noradrenalina',
          infusionRate: '8',
          unit: 'mL/h',
          concentration: '64 mcg/mL',
        },
      ],
    },
    sedationAndAnalgesia: {
      inUse: 'Sim',
      infusionsList: [
        {
          id: 'sample-sed-1',
          medication: 'Fentanil',
          rateOrDose: '5',
          unit: 'mL/h',
          purpose: 'Analgesia',
        },
        {
          id: 'sample-sed-2',
          medication: 'Midazolam',
          rateOrDose: '5',
          unit: 'mL/h',
          purpose: 'Sedação',
        },
      ],
    },
    nutritionAndGastrointestinal: {
      nutritionalStatus: 'Dieta enteral',
      enteralRoute: 'SNE',
      enteralInfusionRate: '50',
      enteralTolerance: 'Boa tolerância',
      abdomenInspection: 'Plano',
      abdomenConsistency: 'Flácido e indolor',
      bowelSounds: 'Presentes',
    },
    eliminationsAndFluidBalance: {
      diuresis: 'Presente',
      urinaryRoute: 'SVD',
      svdCaliber: '16',
      svdPermeable: 'Sim',
      diuresisColor: 'amarelo claro',
      diuresisVolume: '600',
      bowelMovement: 'Ausente',
      hasFluidBalance: 'Sim',
      fluidIntake: '1200',
      fluidOutput: '800',
      fluidBalanceResult: '+400 mL',
    },
    devices: {
      list: [
        {
          id: 'sample-dev-1',
          type: 'CVC',
          location: 'Subclávia D',
          permeability: 'Pérvio',
          dressingStatus: 'Limpo, seco e íntegro',
        },
        {
          id: 'sample-dev-2',
          type: 'PAI',
          location: 'Radial E',
          permeability: 'Pérvio',
          dressingStatus: 'Limpo, seco e íntegro',
        },
      ],
    },
    skinAndIntegrity: {
      integrity: 'Íntegra',
      hydration: 'Hidratada',
    },
    mobilityAndPositioning: {
      mobility: 'Restrito ao leito',
      decubitusChangeDone: 'Sim',
      bedHeadElevated: 'Sim',
      bedHeadAngle: '30°',
      sideRails: 'Elevadas',
    },
    hygieneAndBath: {
      bodyHygiene: 'Higiene realizada',
      bathType: 'Banho no leito',
      bathTolerance: 'Boa tolerância',
    },
    nursingCareDone: {
      careItems: [
        'Monitorização de sinais vitais contínua',
        'Higiene oral com clorexidina',
        'Aspiração de vias aéreas',
        'Manutenção de balanço hídrico',
      ],
    },
    complicationsAndCommunication: {
      hasComplication: 'Não',
    },
    observedChangesInPeriod: {
      comparisonStatus: 'Sem alterações observadas',
    },
    finalStatus: {
      condition: 'Permanece em leito de UTI sob cuidados intensivos de enfermagem',
    },
    additionalInfo: {
      observations: '',
    },
  };
}
