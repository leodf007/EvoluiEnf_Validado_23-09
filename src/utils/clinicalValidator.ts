import { ClinicalEvolutionForm, ValidationAlert, SectionStatus } from '../types/clinical';

export const createInitialClinicalForm = (): ClinicalEvolutionForm => ({
  context: {
    moment: '',
    location: '',
    accompaniment: '',
    wristbandChecked: '',
    bedSignChecked: '',
    allergies: '',
    precaution: '',
  },
  generalAssessment: {
    generalState: '',
    behavior: [],
    complaints: '',
    hygiene: '',
    mobility: '',
  },
  vitalSigns: {},
  pain: {
    assessmentType: '',
  },
  neurological: {
    consciousnessLevel: '',
    orientation: '',
    glasgowType: '',
    rassType: '',
    pupils: '',
    photoreaction: '',
    identifiedNeurologicalAlteration: '',
  },
  respiratory: {
    respiratorySupport: '',
    respiratoryPattern: '',
    respiratoryDistress: '',
    accessoryMuscles: '',
    secretion: '',
    breathSounds: '',
    adventitiousSounds: [],
  },
  cardiovascular: {
    hemodynamicCondition: '',
    peripheralPerfusion: '',
    extremities: '',
    capillaryRefillTime: '',
    edema: '',
    edemaLocations: [],
  },
  vasoactiveDrugs: {
    inUse: '',
    drugsList: [],
  },
  sedationAnalgesia: {
    inUse: '',
    medicationsList: [],
  },
  gastrointestinal: {
    abdominalShape: '',
    consistency: '',
    palpation: '',
    bowelSounds: '',
  },
  nutrition: {
    status: '',
    nausea: '',
    vomiting: '',
  },
  bowelElimination: {
    bowelMovement: '',
    ostomy: '',
  },
  urinary: {
    diuresis: '',
    eliminationRoute: '',
  },
  devices: {
    list: [],
  },
  skin: {
    integrity: '',
    hydration: '',
  },
  nursingCare: {
    careItems: [],
  },
  bath: {
    bathType: '',
    tolerance: '',
  },
  complications: {
    hasComplication: '',
    communicatedToTeam: '',
  },
  comparison: {
    observationComparison: '',
    observedChangesDescription: '',
    hasPreviousEvaluation: '',
    aspectsRelated: [],
  },
  finalStatus: {
    condition: '',
  },
  additionalInformation: '',
});

export const ClinicalFormValidator = {
  validate(form: ClinicalEvolutionForm): ValidationAlert[] {
    const alerts: ValidationAlert[] = [];

    // V-001: Oxigenoterapia selecionada sem dispositivo
    if (
      form.respiratory.respiratorySupport === 'Oxigenoterapia' &&
      !form.respiratory.oxygenDevice
    ) {
      alerts.push({
        code: 'V-001',
        message: 'Dispositivo utilizado para oxigenoterapia não foi informado.',
        sectionIndex: 4, // 5th section (0-indexed: 4)
        sectionTitle: 'Respiratório',
      });
    }

    // V-002: Oxigenoterapia selecionada sem fluxo
    if (
      form.respiratory.respiratorySupport === 'Oxigenoterapia' &&
      !form.respiratory.oxygenFlowRate?.trim()
    ) {
      alerts.push({
        code: 'V-002',
        message: 'Fluxo de oxigênio não foi registrado.',
        sectionIndex: 4,
        sectionTitle: 'Respiratório',
      });
    }

    // V-003: SVD selecionada e nenhuma avaliação do dispositivo informada
    if (form.urinary.eliminationRoute === 'SVD') {
      const hasSvdInfo =
        form.urinary.svdPatent ||
        form.urinary.svdAspect?.trim() ||
        form.urinary.svdColor?.trim() ||
        form.urinary.svdOutputVolume?.trim() ||
        form.urinary.svdCaliber?.trim() ||
        form.urinary.svdObservations?.trim();
      if (!hasSvdInfo) {
        alerts.push({
          code: 'V-003',
          message:
            'Há SVD registrada, mas não há informações adicionais sobre sua condição ou débito.',
          sectionIndex: 9,
          sectionTitle: 'Sistema urinário',
        });
      }
    }

    // V-004: Dispositivo sem localização
    form.devices.list.forEach((dev, idx) => {
      if (dev.type && !dev.location?.trim()) {
        alerts.push({
          code: 'V-004',
          message: `Localização do dispositivo (${dev.type || 'Dispositivo'} #${idx + 1}) não foi informada.`,
          sectionIndex: 10,
          sectionTitle: 'Dispositivos',
        });
      }
    });

    // V-005: Lesão informada sem localização
    if (
      form.skin.integrity === 'Com alteração/lesão' &&
      !form.skin.lesionLocation?.trim()
    ) {
      alerts.push({
        code: 'V-005',
        message: 'Foi registrada alteração de pele/lesão sem localização.',
        sectionIndex: 11,
        sectionTitle: 'Pele e integridade cutânea',
      });
    }

    // V-006: Intercorrência = Sim e condutas vazias
    if (
      form.complications.hasComplication === 'Sim' &&
      !form.complications.actionsTaken?.trim()
    ) {
      alerts.push({
        code: 'V-006',
        message:
          'Foi registrada uma intercorrência, mas nenhuma conduta foi informada.',
        sectionIndex: 13,
        sectionTitle: 'Intercorrências',
      });
    }

    // V-007: Comunicação = Sim sem equipe/profissional
    if (
      form.complications.communicatedToTeam === 'Sim' &&
      !form.complications.communicatedWho
    ) {
      alerts.push({
        code: 'V-007',
        message: 'Informe quem foi comunicado na intercorrência.',
        sectionIndex: 13,
        sectionTitle: 'Intercorrências',
      });
    }

    // V-008: Comunicação = Sim sem horário (não-bloqueante)
    if (
      form.complications.communicatedToTeam === 'Sim' &&
      !form.complications.communicationTime?.trim()
    ) {
      alerts.push({
        code: 'V-008',
        message: 'Horário da comunicação não foi informado.',
        sectionIndex: 13,
        sectionTitle: 'Intercorrências',
        isBlocking: false,
      });
    }

    // V-009: Alteração observada sem descrição
    if (
      form.comparison.observationComparison === 'Houve alteração observada' &&
      !form.comparison.observedChangesDescription?.trim()
    ) {
      alerts.push({
        code: 'V-009-TECH',
        message:
          'Você indicou que houve alteração observada em relação ao registro anterior, mas não a descreveu.',
        sectionIndex: 14,
        sectionTitle: 'Alterações observadas em relação ao registro anterior',
      });
    }

    // V-009 (legado/enfermeiro): Melhora/piora/evolução mista sem evidência
    if (
      form.comparison.hasPreviousEvaluation === 'Sim' &&
      ['Apresenta melhora', 'Apresenta piora', 'Evolução mista', 'Outra mudança'].includes(
        form.comparison.evolutionStatus || ''
      ) &&
      !form.comparison.evidenceDescription?.trim()
    ) {
      alerts.push({
        code: 'V-009',
        message:
          'Você indicou mudança em relação à avaliação anterior, mas não informou o dado que fundamenta essa avaliação.',
        sectionIndex: 14,
        sectionTitle: 'Alterações observadas em relação ao registro anterior',
      });
    }

    // V-010: Droga vasoativa = Sim sem medicamento
    if (
      form.vasoactiveDrugs.inUse === 'Sim' &&
      form.vasoactiveDrugs.drugsList.length === 0
    ) {
      alerts.push({
        code: 'V-010',
        message:
          'Uso de droga vasoativa foi informado, mas nenhum medicamento foi adicionado.',
        sectionIndex: 6,
        sectionTitle: 'Drogas vasoativas, sedação e analgesia',
      });
    }

    // V-012: DVA com medicamento e vazão, mas sem concentração (não-bloqueante)
    if (form.vasoactiveDrugs.inUse === 'Sim') {
      form.vasoactiveDrugs.drugsList.forEach((d) => {
        if (d.medication && d.infusionRate && !d.concentration?.trim()) {
          alerts.push({
            code: 'V-012',
            message:
              'A concentração da droga vasoativa não foi informada. Verifique se deseja incluí-la no registro.',
            sectionIndex: 6,
            sectionTitle: 'Drogas vasoativas, sedação e analgesia',
            isBlocking: false,
          });
        }
      });
    }

    return alerts;
  },
};

export const getSectionStatuses = (
  form: ClinicalEvolutionForm
): { index: number; title: string; status: SectionStatus }[] => {
  const sections: { index: number; title: string; status: SectionStatus }[] = [];

  // 1. Contexto do registro
  const ctx = form.context;
  const ctxFilled =
    ctx.moment ||
    ctx.location ||
    ctx.accompaniment ||
    ctx.wristbandChecked ||
    ctx.bedSignChecked ||
    ctx.allergies ||
    ctx.precaution ||
    ctx.admissionReason ||
    ctx.relevantComorbidities;
  const ctxCompleted =
    ctx.moment &&
    ctx.location &&
    ctx.allergies &&
    (ctx.allergies !== 'Sim' || ctx.allergiesDetails);
  sections.push({
    index: 0,
    title: 'Contexto do registro',
    status: ctxCompleted ? 'completed' : ctxFilled ? 'in_progress' : 'not_started',
  });

  // 2. Avaliação geral
  const gen = form.generalAssessment;
  const genFilled =
    gen.generalState ||
    gen.behavior.length > 0 ||
    gen.complaints ||
    gen.hygiene ||
    gen.mobility;
  const genCompleted =
    gen.generalState &&
    gen.behavior.length > 0 &&
    gen.complaints &&
    gen.mobility;
  sections.push({
    index: 1,
    title: 'Avaliação geral',
    status: genCompleted ? 'completed' : genFilled ? 'in_progress' : 'not_started',
  });

  // 3. Sinais vitais e dor
  const vs = form.vitalSigns;
  const p = form.pain;
  const vsFilled =
    vs.systolicBP ||
    vs.diastolicBP ||
    vs.heartRate ||
    vs.respiratoryRate ||
    vs.oxygenSaturation ||
    vs.temperature ||
    p.assessmentType;
  const vsCompleted =
    (vs.systolicBP && vs.diastolicBP && vs.heartRate && vs.respiratoryRate && vs.oxygenSaturation) ||
    p.assessmentType !== '';
  sections.push({
    index: 2,
    title: 'Sinais vitais e dor',
    status: vsCompleted ? 'completed' : vsFilled ? 'in_progress' : 'not_started',
  });

  // 4. Neurológico
  const neuro = form.neurological;
  const neuroFilled =
    neuro.consciousnessLevel ||
    neuro.orientation ||
    neuro.glasgowType ||
    neuro.rassType ||
    neuro.pupils ||
    neuro.photoreaction ||
    neuro.identifiedNeurologicalAlteration;
  const neuroCompleted =
    neuro.consciousnessLevel &&
    neuro.orientation &&
    neuro.pupils &&
    neuro.photoreaction &&
    neuro.identifiedNeurologicalAlteration;
  sections.push({
    index: 3,
    title: 'Neurológico',
    status: neuroCompleted ? 'completed' : neuroFilled ? 'in_progress' : 'not_started',
  });

  // 5. Respiratório
  const resp = form.respiratory;
  const respFilled =
    resp.respiratorySupport ||
    resp.respiratoryPattern ||
    resp.respiratoryDistress ||
    resp.accessoryMuscles ||
    resp.secretion ||
    resp.breathSounds ||
    resp.adventitiousSounds.length > 0;
  const respCompleted =
    resp.respiratorySupport &&
    resp.respiratoryPattern &&
    resp.respiratoryDistress &&
    resp.breathSounds;
  sections.push({
    index: 4,
    title: 'Respiratório',
    status: respCompleted ? 'completed' : respFilled ? 'in_progress' : 'not_started',
  });

  // 6. Cardiovascular e hemodinâmico
  const card = form.cardiovascular;
  const cardFilled =
    card.hemodynamicCondition ||
    card.heartRateClassification ||
    card.bloodPressureClassification ||
    card.peripheralPerfusion ||
    card.extremities ||
    card.capillaryRefillTime ||
    card.edema;
  const cardCompleted =
    card.hemodynamicCondition &&
    card.peripheralPerfusion &&
    card.extremities &&
    card.edema;
  sections.push({
    index: 5,
    title: 'Cardiovascular e hemodinâmico',
    status: cardCompleted ? 'completed' : cardFilled ? 'in_progress' : 'not_started',
  });

  // 7. Drogas vasoativas, sedação e analgesia
  const dva = form.vasoactiveDrugs;
  const sed = form.sedationAnalgesia;
  const dvaFilled = dva.inUse || sed.inUse;
  const dvaCompleted = dva.inUse !== '' && sed.inUse !== '';
  sections.push({
    index: 6,
    title: 'Drogas vasoativas, sedação e analgesia',
    status: dvaCompleted ? 'completed' : dvaFilled ? 'in_progress' : 'not_started',
  });

  // 8. Gastrointestinal e nutrição
  const gi = form.gastrointestinal;
  const nut = form.nutrition;
  const giFilled =
    gi.abdominalShape ||
    gi.consistency ||
    gi.palpation ||
    gi.bowelSounds ||
    nut.status ||
    nut.nausea ||
    nut.vomiting;
  const giCompleted =
    gi.abdominalShape && gi.consistency && gi.palpation && nut.status;
  sections.push({
    index: 7,
    title: 'Gastrointestinal e nutrição',
    status: giCompleted ? 'completed' : giFilled ? 'in_progress' : 'not_started',
  });

  // 9. Eliminações intestinais
  const bowel = form.bowelElimination;
  const bowelFilled = bowel.bowelMovement || bowel.ostomy;
  const bowelCompleted = bowel.bowelMovement !== '' && bowel.ostomy !== '';
  sections.push({
    index: 8,
    title: 'Eliminações intestinais',
    status: bowelCompleted ? 'completed' : bowelFilled ? 'in_progress' : 'not_started',
  });

  // 10. Sistema urinário
  const uri = form.urinary;
  const uriFilled = uri.diuresis || uri.eliminationRoute;
  const uriCompleted = uri.diuresis !== '' && uri.eliminationRoute !== '';
  sections.push({
    index: 9,
    title: 'Sistema urinário',
    status: uriCompleted ? 'completed' : uriFilled ? 'in_progress' : 'not_started',
  });

  // 11. Dispositivos
  const dev = form.devices;
  const devFilled = dev.list.length > 0;
  sections.push({
    index: 10,
    title: 'Dispositivos',
    status: devFilled ? 'completed' : 'not_started',
  });

  // 12. Pele e integridade cutânea
  const skin = form.skin;
  const skinFilled = skin.integrity || skin.hydration;
  const skinCompleted = skin.integrity !== '' && skin.hydration !== '';
  sections.push({
    index: 11,
    title: 'Pele e integridade cutânea',
    status: skinCompleted ? 'completed' : skinFilled ? 'in_progress' : 'not_started',
  });

  // 13. Cuidados realizados
  const care = form.nursingCare;
  const bath = form.bath;
  const careFilled = care.careItems.length > 0 || bath.bathType;
  const careCompleted = care.careItems.length > 0 && bath.bathType !== '';
  sections.push({
    index: 12,
    title: 'Cuidados realizados',
    status: careCompleted ? 'completed' : careFilled ? 'in_progress' : 'not_started',
  });

  // 14. Intercorrências
  const comp = form.complications;
  const compFilled = comp.hasComplication;
  const compCompleted =
    comp.hasComplication === 'Não' ||
    (comp.hasComplication === 'Sim' && comp.actionsTaken);
  sections.push({
    index: 13,
    title: 'Intercorrências',
    status: compCompleted ? 'completed' : compFilled ? 'in_progress' : 'not_started',
  });

  // 15. Evolução em relação à avaliação anterior
  const compPrev = form.comparison;
  const compPrevFilled = compPrev.hasPreviousEvaluation;
  const compPrevCompleted =
    compPrev.hasPreviousEvaluation === 'Não' ||
    (compPrev.hasPreviousEvaluation === 'Sim' && compPrev.evolutionStatus);
  sections.push({
    index: 14,
    title: 'Evolução em relação à avaliação anterior',
    status: compPrevCompleted ? 'completed' : compPrevFilled ? 'in_progress' : 'not_started',
  });

  // 16. Situação final
  const fin = form.finalStatus;
  const finFilled = fin.condition;
  const finCompleted = fin.condition !== '';
  sections.push({
    index: 15,
    title: 'Situação final',
    status: finCompleted ? 'completed' : finFilled ? 'in_progress' : 'not_started',
  });

  // 17. Informações adicionais
  const add = form.additionalInformation;
  const addFilled = !!add?.trim();
  sections.push({
    index: 16,
    title: 'Informações adicionais',
    status: addFilled ? 'completed' : 'not_started',
  });

  return sections;
};
