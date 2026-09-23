import { NurseEvolutionForm } from '../types/nurseEvolutionClinical';

export function createInitialNurseEvolutionForm(): NurseEvolutionForm {
  return {
    context: {
      moment: '',
      customMoment: '',
      location: '',
      customLocation: '',
      escort: '',
      customEscort: '',
      wristbandIdentification: '',
      bedIdentification: '',
      precaution: '',
      customPrecaution: '',
      hasAllergies: '',
      allergyDescription: '',
    },
    generalAssessment: {
      behavior: [],
      customBehavior: '',
      complaintStatus: '',
      complaintDescription: '',
      informationSource: '',
      customInformationSource: '',
      hygieneStatus: '',
    },
    vitalSignsAndPain: {
      systolicBP: '',
      diastolicBP: '',
      meanArterialPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      capillaryBloodGlucose: '',
      painScaleType: '',
      painScore: '',
      painLocation: '',
      painCharacteristic: '',
      painDuration: '',
      painReliefOrAggravatingFactors: '',
      painObservation: '',
    },
    neurological: {
      consciousnessLevel: '',
      customConsciousness: '',
      orientation: '',
      glasgowScore: '',
      rassScore: '',
      pupils: '',
      customPupils: '',
      photoreaction: '',
      customPhotoreaction: '',
      motorDeficit: '',
      motorDeficitDescription: '',
    },
    respiratory: {
      respiratorySupport: '',
      oxygenDevice: '',
      oxygenFlowRate: '',
      oxygenFlowUnit: 'L/min',
      vniInterface: '',
      vniIpap: '',
      vniEpap: '',
      vniFiO2: '',
      vmiAirway: '',
      vmiMode: '',
      vmiFiO2: '',
      vmiPeep: '',
      vmiTidalVolume: '',
      vmiRrSet: '',
      respiratoryPattern: '',
      customPattern: '',
      respiratoryDistress: '',
      accessoryMuscles: '',
      secretions: '',
      secretionsDescription: '',
    },
    pulmonaryAuscultation: {
      performed: '',
      vesicularMurmur: '',
      vesicularMurmurDetails: '',
      adventitiousSounds: '',
      adventitiousSoundTypes: [],
      adventitiousSoundLocation: '',
      customAdventitiousDetails: '',
    },
    cardiovascular: {
      peripheralPerfusion: '',
      customPerfusion: '',
      extremities: '',
      customExtremities: '',
      capillaryRefillTime: '',
      customRefillTime: '',
      edema: '',
      edemaLocation: '',
      edemaGrade: '',
    },
    cardiacAuscultation: {
      performed: '',
      heartSounds: '',
      customHeartSounds: '',
      rhythm: '',
      customRhythm: '',
      times: '',
      customTimes: '',
      murmurs: '',
      murmursDescription: '',
    },
    gastrointestinalAndNutrition: {
      abdomenForm: '',
      customAbdomenForm: '',
      abdomenConsistency: '',
      customAbdomenConsistency: '',
      abdomenPalpation: '',
      abdomenPainLocation: '',
      bowelSounds: '',
      nutritionalStatus: '',
      oralAcceptance: '',
      enteralRoute: '',
      enteralRate: '',
      enteralRateUnit: 'mL/h',
      enteralTolerance: '',
      nutritionObservation: '',
    },
    eliminations: {
      diuresis: '',
      urinaryRoute: '',
      customUrinaryRoute: '',
      urineAspect: '',
      urineVolume: '',
      bowelElimination: '',
      bowelConsistency: '',
      bowelFrequency: '',
      bowelAspect: '',
    },
    devices: {
      list: [],
    },
    skin: {
      integrity: '',
      hydration: '',
      customHydration: '',
      coloration: '',
      customColoration: '',
      lesionLocation: '',
      lesionDescription: '',
      lesionDimensions: '',
      lesionExudate: '',
      lesionDressing: '',
      perilesionalCondition: '',
      lesionObservations: '',
    },
    mobilityAndSafety: {
      mobility: '',
      customMobility: '',
      repositioning: '',
      repositioningInterval: '',
      bedRails: '',
      headOfBed: '',
      headOfBedAngle: '',
    },
    therapiesAndInfusions: {
      vasoactiveDrugsInUse: '',
      vasoactiveDrugsList: [],
      sedationAnalgesiaInUse: '',
      sedationAnalgesiaList: [],
      otherInfusionsInUse: '',
      otherInfusionsList: [],
    },
    careDone: {
      careItems: [],
      customCareDetails: '',
    },
    riskAssessment: {
      fallRiskStatus: '',
      fallRiskScale: '',
      fallRiskScore: '',
      fallRiskClassification: '',
      pressureInjuryRiskStatus: '',
      pressureInjuryScale: '',
      pressureInjuryScore: '',
      pressureInjuryClassification: '',
      aspirationRiskStatus: '',
      customAspirationRisk: '',
    },
    complications: {
      hasComplication: '',
      description: '',
      time: '',
      interventionDone: '',
      responseObserved: '',
      communicationDone: '',
      communicationTime: '',
    },
    communication: {
      hasCommunication: '',
      target: '',
      customTarget: '',
      reason: '',
      time: '',
      responseObserved: '',
    },
    responseToCare: {
      evaluated: '',
      structuredResponseText: '',
    },
    evolutionState: {
      statusChange: '',
      changeDescription: '',
      nursingSynthesis: '',
      currentStatus: '',
      customCurrentStatus: '',
    },
  };
}

export function createSampleNurseEvolutionForm(): NurseEvolutionForm {
  return {
    context: {
      moment: 'Avalio paciente',
      location: 'Sala Vermelha',
      escort: 'Familiar',
      wristbandIdentification: 'Sim',
      bedIdentification: 'Sim',
      precaution: 'Padrão',
      hasAllergies: 'Não referidas',
    },
    generalAssessment: {
      behavior: ['Calmo', 'Cooperativo'],
      complaintStatus: 'Com queixa',
      complaintDescription: 'dor precordial ventilatório-dependente',
      informationSource: 'Paciente',
      hygieneStatus: 'Preservada',
    },
    vitalSignsAndPain: {
      systolicBP: '128',
      diastolicBP: '78',
      meanArterialPressure: '91',
      heartRate: '86',
      respiratoryRate: '18',
      oxygenSaturation: '97',
      temperature: '36.5',
      capillaryBloodGlucose: '112',
      painScaleType: 'Escala numérica 0–10',
      painScore: '4',
      painLocation: 'região precordial',
      painCharacteristic: 'em aperto',
      painDuration: 'há 30 minutos',
      painReliefOrAggravatingFactors: 'piora com esforço',
      painObservation: '',
    },
    neurological: {
      consciousnessLevel: 'Consciente',
      orientation: 'Orientado em tempo e espaço',
      glasgowScore: '15',
      rassScore: '',
      pupils: 'Isocóricas',
      photoreaction: 'Fotorreagentes',
      motorDeficit: 'Ausente',
    },
    respiratory: {
      respiratorySupport: 'Ar ambiente',
      respiratoryPattern: 'Eupneico',
      respiratoryDistress: 'Ausente',
      accessoryMuscles: 'Ausente',
      secretions: 'Ausentes',
    },
    pulmonaryAuscultation: {
      performed: 'Sim',
      vesicularMurmur: 'Presente bilateralmente',
      adventitiousSounds: 'Ausentes',
      adventitiousSoundTypes: [],
    },
    cardiovascular: {
      peripheralPerfusion: 'Adequada',
      extremities: 'Quentes',
      capillaryRefillTime: '< 3 segundos',
      edema: 'Ausente',
    },
    cardiacAuscultation: {
      performed: 'Sim',
      heartSounds: 'Normofonéticas',
      rhythm: 'Regular',
      times: '2T',
      murmurs: 'Ausentes',
    },
    gastrointestinalAndNutrition: {
      abdomenForm: 'Plano',
      abdomenConsistency: 'Flácido',
      abdomenPalpation: 'Indolor',
      bowelSounds: 'Presentes',
      nutritionalStatus: 'Via oral',
      oralAcceptance: 'Boa aceitação',
    },
    eliminations: {
      diuresis: 'Presente',
      urinaryRoute: 'Espontânea',
      urineAspect: 'clara',
      bowelElimination: 'Presentes',
      bowelConsistency: 'Formadas',
    },
    devices: {
      list: [
        {
          id: 'dev-1',
          type: 'AVP',
          location: 'MSD',
          permeability: 'Pérvio',
          functioning: 'Funcionante',
          dressingClean: true,
          dressingDry: true,
          dressingIntact: true,
          phlogisticSigns: 'Ausentes',
        },
      ],
    },
    skin: {
      integrity: 'Íntegra',
      hydration: 'Hidratada',
      coloration: 'Corada',
    },
    mobilityAndSafety: {
      mobility: 'Restrito ao leito',
      repositioning: 'Realizada',
      repositioningInterval: 'a cada 2 horas',
      bedRails: 'Elevadas',
      headOfBed: 'Elevada',
      headOfBedAngle: '30°',
    },
    therapiesAndInfusions: {
      vasoactiveDrugsInUse: 'Não',
      vasoactiveDrugsList: [],
      sedationAnalgesiaInUse: 'Não',
      sedationAnalgesiaList: [],
      otherInfusionsInUse: 'Sim',
      otherInfusionsList: [
        {
          id: 'inf-1',
          substance: 'Soro Fisiológico 0,9%',
          doseOrRate: '40',
          unit: 'mL/h',
          route: 'AVP',
        },
      ],
    },
    careDone: {
      careItems: [
        'monitorização de sinais vitais',
        'administração de medicamentos conforme prescrição',
        'coleta de exames',
      ],
    },
    riskAssessment: {
      fallRiskStatus: 'Avaliado',
      fallRiskScale: 'Morse',
      fallRiskScore: '35',
      fallRiskClassification: 'Médio risco',
      pressureInjuryRiskStatus: 'Avaliado',
      pressureInjuryScale: 'Braden',
      pressureInjuryScore: '18',
      pressureInjuryClassification: 'Baixo risco',
      aspirationRiskStatus: 'Ausente segundo avaliação registrada',
    },
    complications: {
      hasComplication: 'Não',
    },
    communication: {
      hasCommunication: 'Não',
    },
    responseToCare: {
      evaluated: 'Sim',
      structuredResponseText: 'Após intervenção analgésica prescrita, refere dor 2/10.',
    },
    evolutionState: {
      statusChange: 'Melhora registrada pelo Enfermeiro',
      changeDescription: 'Redução do escore de dor após medicação',
      nursingSynthesis: '',
      currentStatus: 'Permanece no setor sob cuidados de enfermagem',
    },
  };
}

export function normalizeNurseEvolutionForm(form: NurseEvolutionForm): NurseEvolutionForm {
  const cloned: NurseEvolutionForm = JSON.parse(JSON.stringify(form));

  // Context
  if (cloned.context.hasAllergies !== 'Sim') {
    cloned.context.allergyDescription = '';
  }
  if (cloned.context.location !== 'Outro') {
    cloned.context.customLocation = '';
  }
  if (cloned.context.moment !== 'Outro') {
    cloned.context.customMoment = '';
  }
  if (cloned.context.escort !== 'Outro') {
    cloned.context.customEscort = '';
  }
  if (cloned.context.precaution !== 'Outra') {
    cloned.context.customPrecaution = '';
  }

  // General assessment
  if (cloned.generalAssessment.complaintStatus !== 'Com queixa') {
    cloned.generalAssessment.complaintDescription = '';
  }
  if (cloned.generalAssessment.informationSource !== 'Outra') {
    cloned.generalAssessment.customInformationSource = '';
  }

  // Pain
  if (
    cloned.vitalSignsAndPain.painScaleType === 'Não avaliada' ||
    cloned.vitalSignsAndPain.painScaleType === 'Não avaliável' ||
    cloned.vitalSignsAndPain.painScaleType === 'Não informado' ||
    cloned.vitalSignsAndPain.painScaleType === ''
  ) {
    cloned.vitalSignsAndPain.painScore = '';
    cloned.vitalSignsAndPain.painLocation = '';
    cloned.vitalSignsAndPain.painCharacteristic = '';
    cloned.vitalSignsAndPain.painDuration = '';
    cloned.vitalSignsAndPain.painReliefOrAggravatingFactors = '';
    cloned.vitalSignsAndPain.painObservation = '';
  }

  // Respiratory
  if (cloned.respiratory.respiratorySupport !== 'Oxigenoterapia') {
    cloned.respiratory.oxygenDevice = '';
    cloned.respiratory.oxygenFlowRate = '';
  }
  if (cloned.respiratory.respiratorySupport !== 'VNI') {
    cloned.respiratory.vniInterface = '';
    cloned.respiratory.vniIpap = '';
    cloned.respiratory.vniEpap = '';
    cloned.respiratory.vniFiO2 = '';
  }
  if (cloned.respiratory.respiratorySupport !== 'VMI') {
    cloned.respiratory.vmiAirway = '';
    cloned.respiratory.vmiMode = '';
    cloned.respiratory.vmiFiO2 = '';
    cloned.respiratory.vmiPeep = '';
    cloned.respiratory.vmiTidalVolume = '';
    cloned.respiratory.vmiRrSet = '';
  }
  if (cloned.respiratory.secretions !== 'Presentes') {
    cloned.respiratory.secretionsDescription = '';
  }

  // Pulmonary auscultation
  if (cloned.pulmonaryAuscultation.performed !== 'Sim') {
    cloned.pulmonaryAuscultation.vesicularMurmur = '';
    cloned.pulmonaryAuscultation.vesicularMurmurDetails = '';
    cloned.pulmonaryAuscultation.adventitiousSounds = '';
    cloned.pulmonaryAuscultation.adventitiousSoundTypes = [];
    cloned.pulmonaryAuscultation.adventitiousSoundLocation = '';
    cloned.pulmonaryAuscultation.customAdventitiousDetails = '';
  } else if (cloned.pulmonaryAuscultation.adventitiousSounds !== 'Presentes') {
    cloned.pulmonaryAuscultation.adventitiousSoundTypes = [];
    cloned.pulmonaryAuscultation.adventitiousSoundLocation = '';
    cloned.pulmonaryAuscultation.customAdventitiousDetails = '';
  }

  // Cardiac auscultation
  if (cloned.cardiacAuscultation.performed !== 'Sim') {
    cloned.cardiacAuscultation.heartSounds = '';
    cloned.cardiacAuscultation.customHeartSounds = '';
    cloned.cardiacAuscultation.rhythm = '';
    cloned.cardiacAuscultation.customRhythm = '';
    cloned.cardiacAuscultation.times = '';
    cloned.cardiacAuscultation.customTimes = '';
    cloned.cardiacAuscultation.murmurs = '';
    cloned.cardiacAuscultation.murmursDescription = '';
  } else if (cloned.cardiacAuscultation.murmurs !== 'Presentes') {
    cloned.cardiacAuscultation.murmursDescription = '';
  }

  // Cardiovascular
  if (cloned.cardiovascular.edema !== 'Presente') {
    cloned.cardiovascular.edemaLocation = '';
    cloned.cardiovascular.edemaGrade = '';
  }

  // Neurological
  if (cloned.neurological.motorDeficit !== 'Presente') {
    cloned.neurological.motorDeficitDescription = '';
  }

  // Gastrointestinal
  if (cloned.gastrointestinalAndNutrition.abdomenPalpation !== 'Doloroso') {
    cloned.gastrointestinalAndNutrition.abdomenPainLocation = '';
  }
  if (cloned.gastrointestinalAndNutrition.nutritionalStatus !== 'Via oral') {
    cloned.gastrointestinalAndNutrition.oralAcceptance = '';
  }
  if (cloned.gastrointestinalAndNutrition.nutritionalStatus !== 'Dieta enteral') {
    cloned.gastrointestinalAndNutrition.enteralRoute = '';
    cloned.gastrointestinalAndNutrition.enteralRate = '';
    cloned.gastrointestinalAndNutrition.enteralTolerance = '';
  }

  // Eliminations
  if (cloned.eliminations.bowelElimination !== 'Presentes') {
    cloned.eliminations.bowelConsistency = '';
    cloned.eliminations.bowelFrequency = '';
    cloned.eliminations.bowelAspect = '';
  }

  // Skin
  if (cloned.skin.integrity !== 'Com alteração/lesão') {
    cloned.skin.lesionLocation = '';
    cloned.skin.lesionDescription = '';
    cloned.skin.lesionDimensions = '';
    cloned.skin.lesionExudate = '';
    cloned.skin.lesionDressing = '';
    cloned.skin.perilesionalCondition = '';
    cloned.skin.lesionObservations = '';
  }

  // Mobility
  if (cloned.mobilityAndSafety.repositioning !== 'Realizada') {
    cloned.mobilityAndSafety.repositioningInterval = '';
  }
  if (cloned.mobilityAndSafety.headOfBed !== 'Elevada') {
    cloned.mobilityAndSafety.headOfBedAngle = '';
  }

  // Therapies
  if (cloned.therapiesAndInfusions.vasoactiveDrugsInUse !== 'Sim') {
    cloned.therapiesAndInfusions.vasoactiveDrugsList = [];
  }
  if (cloned.therapiesAndInfusions.sedationAnalgesiaInUse !== 'Sim') {
    cloned.therapiesAndInfusions.sedationAnalgesiaList = [];
  }
  if (cloned.therapiesAndInfusions.otherInfusionsInUse !== 'Sim') {
    cloned.therapiesAndInfusions.otherInfusionsList = [];
  }

  // Risk assessment
  if (cloned.riskAssessment.fallRiskStatus !== 'Avaliado') {
    cloned.riskAssessment.fallRiskScale = '';
    cloned.riskAssessment.fallRiskScore = '';
    cloned.riskAssessment.fallRiskClassification = '';
  }
  if (cloned.riskAssessment.pressureInjuryRiskStatus !== 'Avaliado') {
    cloned.riskAssessment.pressureInjuryScale = '';
    cloned.riskAssessment.pressureInjuryScore = '';
    cloned.riskAssessment.pressureInjuryClassification = '';
  }
  if (cloned.riskAssessment.aspirationRiskStatus !== 'Outra descrição') {
    cloned.riskAssessment.customAspirationRisk = '';
  }

  // Complications
  if (cloned.complications.hasComplication !== 'Sim') {
    cloned.complications.description = '';
    cloned.complications.time = '';
    cloned.complications.interventionDone = '';
    cloned.complications.responseObserved = '';
    cloned.complications.communicationDone = '';
    cloned.complications.communicationTime = '';
  }

  // Communication
  if (cloned.communication.hasCommunication !== 'Sim') {
    cloned.communication.target = '';
    cloned.communication.customTarget = '';
    cloned.communication.reason = '';
    cloned.communication.time = '';
    cloned.communication.responseObserved = '';
  }

  // Response to care
  if (cloned.responseToCare.evaluated !== 'Sim') {
    cloned.responseToCare.structuredResponseText = '';
  }

  // Evolution state
  if (
    cloned.evolutionState.statusChange !== 'Houve alteração observada' &&
    cloned.evolutionState.statusChange !== 'Melhora registrada pelo Enfermeiro' &&
    cloned.evolutionState.statusChange !== 'Piora registrada pelo Enfermeiro'
  ) {
    cloned.evolutionState.changeDescription = '';
  }

  return cloned;
}

export function getNurseEvolutionSectionStatuses(
  form: NurseEvolutionForm
): Array<'completed' | 'in_progress' | 'not_started'> {
  const statuses: Array<'completed' | 'in_progress' | 'not_started'> = [];

  // 1. Contexto do registro
  const ctx = form.context;
  const ctxFilled = Boolean(
    ctx.moment ||
      ctx.location ||
      ctx.escort ||
      ctx.wristbandIdentification ||
      ctx.bedIdentification ||
      ctx.precaution ||
      ctx.hasAllergies
  );
  statuses.push(ctxFilled ? (ctx.moment && ctx.location ? 'completed' : 'in_progress') : 'not_started');

  // 2. Avaliação geral
  const gen = form.generalAssessment;
  const genFilled = Boolean(gen.behavior.length > 0 || gen.complaintStatus || gen.hygieneStatus);
  statuses.push(genFilled ? (gen.behavior.length > 0 && gen.complaintStatus ? 'completed' : 'in_progress') : 'not_started');

  // 3. Sinais vitais e dor
  const vs = form.vitalSignsAndPain;
  const vsFilled = Boolean(
    vs.systolicBP ||
      vs.diastolicBP ||
      vs.meanArterialPressure ||
      vs.heartRate ||
      vs.respiratoryRate ||
      vs.oxygenSaturation ||
      vs.temperature ||
      vs.capillaryBloodGlucose ||
      vs.painScaleType
  );
  statuses.push(vsFilled ? 'completed' : 'not_started');

  // 4. Neurológico
  const neuro = form.neurological;
  const neuroFilled = Boolean(
    neuro.consciousnessLevel ||
      neuro.orientation ||
      neuro.glasgowScore ||
      neuro.rassScore ||
      neuro.pupils ||
      neuro.photoreaction ||
      neuro.motorDeficit
  );
  statuses.push(neuroFilled ? (neuro.consciousnessLevel && neuro.orientation ? 'completed' : 'in_progress') : 'not_started');

  // 5. Respiratório
  const resp = form.respiratory;
  const respFilled = Boolean(resp.respiratorySupport || resp.respiratoryPattern || resp.respiratoryDistress);
  statuses.push(respFilled ? (resp.respiratorySupport && resp.respiratoryPattern ? 'completed' : 'in_progress') : 'not_started');

  // 6. Ausculta respiratória
  const pAusc = form.pulmonaryAuscultation;
  const pAuscFilled = Boolean(pAusc.performed);
  statuses.push(pAuscFilled ? (pAusc.performed === 'Não' || pAusc.vesicularMurmur ? 'completed' : 'in_progress') : 'not_started');

  // 7. Cardiovascular e perfusão
  const cv = form.cardiovascular;
  const cvFilled = Boolean(cv.peripheralPerfusion || cv.extremities || cv.capillaryRefillTime || cv.edema);
  statuses.push(cvFilled ? (cv.peripheralPerfusion ? 'completed' : 'in_progress') : 'not_started');

  // 8. Ausculta cardíaca
  const cAusc = form.cardiacAuscultation;
  const cAuscFilled = Boolean(cAusc.performed);
  statuses.push(cAuscFilled ? (cAusc.performed === 'Não' || cAusc.heartSounds ? 'completed' : 'in_progress') : 'not_started');

  // 9. Gastrointestinal e nutrição
  const gi = form.gastrointestinalAndNutrition;
  const giFilled = Boolean(gi.abdomenForm || gi.abdomenConsistency || gi.bowelSounds || gi.nutritionalStatus);
  statuses.push(giFilled ? (gi.abdomenForm && gi.nutritionalStatus ? 'completed' : 'in_progress') : 'not_started');

  // 10. Eliminações
  const elim = form.eliminations;
  const elimFilled = Boolean(elim.diuresis || elim.urinaryRoute || elim.bowelElimination);
  statuses.push(elimFilled ? (elim.diuresis ? 'completed' : 'in_progress') : 'not_started');

  // 11. Dispositivos
  const dev = form.devices;
  statuses.push(dev.list.length > 0 ? 'completed' : 'not_started');

  // 12. Pele e integridade cutânea
  const skin = form.skin;
  const skinFilled = Boolean(skin.integrity || skin.hydration || skin.coloration);
  statuses.push(skinFilled ? (skin.integrity ? 'completed' : 'in_progress') : 'not_started');

  // 13. Mobilidade e segurança
  const mob = form.mobilityAndSafety;
  const mobFilled = Boolean(mob.mobility || mob.repositioning || mob.bedRails || mob.headOfBed);
  statuses.push(mobFilled ? (mob.mobility ? 'completed' : 'in_progress') : 'not_started');

  // 14. Terapias e infusões
  const ther = form.therapiesAndInfusions;
  const therFilled = Boolean(ther.vasoactiveDrugsInUse || ther.sedationAnalgesiaInUse || ther.otherInfusionsInUse);
  statuses.push(therFilled ? 'completed' : 'not_started');

  // 15. Cuidados/intervenções de enfermagem
  const care = form.careDone;
  statuses.push(care.careItems.length > 0 || care.customCareDetails ? 'completed' : 'not_started');

  // 16. Avaliação de riscos
  const risk = form.riskAssessment;
  const riskFilled = Boolean(risk.fallRiskStatus || risk.pressureInjuryRiskStatus || risk.aspirationRiskStatus);
  statuses.push(riskFilled ? 'completed' : 'not_started');

  // 17. Intercorrências
  const comp = form.complications;
  statuses.push(comp.hasComplication ? 'completed' : 'not_started');

  // 18. Comunicação
  const comm = form.communication;
  statuses.push(comm.hasCommunication ? 'completed' : 'not_started');

  // 19. Resposta aos cuidados
  const respCare = form.responseToCare;
  statuses.push(respCare.evaluated ? 'completed' : 'not_started');

  // 20. Situação atual e Síntese
  const evo = form.evolutionState;
  const evoFilled = Boolean(evo.statusChange || evo.nursingSynthesis || evo.currentStatus);
  statuses.push(evoFilled ? (evo.currentStatus ? 'completed' : 'in_progress') : 'not_started');

  return statuses;
}
