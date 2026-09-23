import { ClinicalEvolutionForm, InvasiveDeviceItem } from '../types/clinical';
import {
  formatSentence,
  joinWithAnd,
  haveIdenticalDeviceStatus,
  buildDeviceStatusDescription,
  NURSING_CARE_TEXT_MAP,
} from './outputRules';

/**
 * Builds a deterministic canonical clinical narrative strictly from explicitly provided clinical facts.
 * Absolutely no inference, diagnosis, severity guessing, or unselected data generation.
 */
export function buildCanonicalNarrative(form: Partial<ClinicalEvolutionForm>): string {
  const paragraphs: string[] = [];

  // ==========================================
  // PARAGRAPH 1: Contexto, Segurança e Avaliação Geral
  // ==========================================
  const p1Sentences: string[] = [];

  // 1. Initial greeting / moment & location
  const ctx = form.context;
  if (ctx?.moment && ctx?.location) {
    const loc = ctx.location === 'Outro' && ctx.locationCustom ? ctx.locationCustom : ctx.location;
    const moment = ctx.moment;

    let leadClause = '';
    if (moment === 'Recebo paciente') {
      leadClause = loc.toLowerCase().startsWith('leito') ? 'Recebo paciente no leito' : `Recebo paciente em ${loc}`;
    } else if (moment === 'Avalio paciente') {
      leadClause = loc.toLowerCase().startsWith('leito') ? 'Avalio paciente no leito' : `Avalio paciente em ${loc}`;
    } else {
      leadClause = `${moment} em ${loc}`;
    }

    const contextModifiers: string[] = [];

    // Accompaniment
    if (ctx.accompaniment && ctx.accompaniment !== 'Não informado') {
      if (ctx.accompaniment === 'Desacompanhado') {
        contextModifiers.push('desacompanhado');
      } else if (ctx.accompaniment === 'Familiar') {
        contextModifiers.push('acompanhado por familiar');
      } else if (ctx.accompaniment === 'Responsável') {
        contextModifiers.push('acompanhado por responsável');
      } else if (ctx.accompaniment === 'Cuidador') {
        contextModifiers.push('acompanhado por cuidador');
      } else if (ctx.accompaniment === 'Equipe') {
        contextModifiers.push('acompanhado por equipe');
      } else if (ctx.accompaniment === 'Outro' && ctx.accompanimentCustom) {
        contextModifiers.push(`acompanhado por ${ctx.accompanimentCustom}`);
      }
    }

    // Safety identification
    const wrist = ctx.wristbandChecked === 'Sim';
    const bed = ctx.bedSignChecked === 'Sim';
    if (wrist && bed) {
      contextModifiers.push('com identificação conferida por pulseira e placa');
    } else if (wrist) {
      contextModifiers.push('com identificação conferida por pulseira');
    } else if (bed) {
      contextModifiers.push('com identificação conferida por placa de identificação');
    }

    // Precautions
    if (ctx.precaution && ctx.precaution !== 'Não informado') {
      if (ctx.precaution === 'Contato') contextModifiers.push('em precaução de contato');
      else if (ctx.precaution === 'Gotículas') contextModifiers.push('em precaução de gotículas');
      else if (ctx.precaution === 'Aerossóis') contextModifiers.push('em precaução por aerossóis');
      else if (ctx.precaution === 'Padrão') contextModifiers.push('em precaução padrão');
      else if (ctx.precaution === 'Outra' && ctx.precautionCustom) contextModifiers.push(`em precaução ${ctx.precautionCustom}`);
    }

    if (contextModifiers.length > 0) {
      p1Sentences.push(`${leadClause}, ${contextModifiers.join(', ')}.`);
    } else {
      p1Sentences.push(`${leadClause}.`);
    }
  }

  // Allergies
  if (ctx?.allergies && ctx.allergies !== 'Não informado') {
    if (ctx.allergies === 'Não referidas') {
      p1Sentences.push('Alergias não referidas.');
    } else if (ctx.allergies === 'Sim') {
      p1Sentences.push(
        ctx.allergiesDetails
          ? `Apresenta alergia referida: ${ctx.allergiesDetails}.`
          : 'Apresenta alergias referidas.'
      );
    }
  }

  // Admission reason & comorbidities
  if (ctx?.admissionReason) {
    p1Sentences.push(`Motivo da admissão / queixa principal: ${ctx.admissionReason}.`);
  }
  if (ctx?.relevantComorbidities) {
    p1Sentences.push(`Comorbidades informadas: ${ctx.relevantComorbidities}.`);
  }

  // General assessment
  const gen = form.generalAssessment;
  if (gen) {
    const genClauses: string[] = [];

    if (gen.generalState && gen.generalState !== 'Não informado') {
      genClauses.push(`em ${gen.generalState.toLowerCase()} estado geral`);
    }

    if (gen.behavior && gen.behavior.length > 0 && !gen.behavior.includes('Não avaliado')) {
      const behaviors = gen.behavior.map((b) => b.toLowerCase());
      genClauses.push(joinWithAnd(behaviors));
    }

    if (gen.complaints && gen.complaints !== 'Não informado' && gen.complaints !== 'Não avaliado') {
      if (gen.complaints === 'Sem queixas no momento') {
        genClauses.push('sem queixas no momento');
      } else if (gen.complaints === 'Com queixa' && gen.complaintsDetails) {
        genClauses.push(`com queixa de ${gen.complaintsDetails}`);
      } else if (gen.complaints === 'Com queixa') {
        genClauses.push('com queixas relatadas');
      } else if (gen.complaints === 'Impossibilitado de informar') {
        genClauses.push('impossibilitado de informar queixas');
      }
    }

    if (gen.hygiene && gen.hygiene !== 'Não informado' && gen.hygiene !== 'Não avaliada') {
      if (gen.hygiene === 'Preservada') genClauses.push('higiene preservada');
      else if (gen.hygiene === 'Necessita cuidados') genClauses.push('necessitando de cuidados de higiene');
      else if (gen.hygiene === 'Higiene realizada no período') genClauses.push('higiene realizada no período');
    }

    if (gen.mobility && gen.mobility !== 'Não avaliada') {
      if (gen.mobility === 'Deambula sem auxílio') genClauses.push('deambula sem auxílio');
      else if (gen.mobility === 'Deambula com auxílio') genClauses.push('deambula com auxílio');
      else if (gen.mobility === 'Cadeira de rodas') genClauses.push('em uso de cadeira de rodas');
      else if (gen.mobility === 'Em maca') genClauses.push('em maca');
      else if (gen.mobility === 'Restrito ao leito') genClauses.push('restrito ao leito');
      else if (gen.mobility === 'Outro' && gen.mobilityCustom) genClauses.push(gen.mobilityCustom);
    }

    if (genClauses.length > 0) {
      p1Sentences.push(formatSentence(`Encontra-se ${genClauses.join(', ')}`));
    }
  }

  if (p1Sentences.length > 0) {
    paragraphs.push(p1Sentences.join(' '));
  }

  // ==========================================
  // PARAGRAPH 2: Sinais Vitais, Dor e Neurológico
  // ==========================================
  const p2Sentences: string[] = [];

  // Vital Signs (Grouped neutrally without clinical interpretation)
  const vs = form.vitalSigns;
  if (vs) {
    const vsItems: string[] = [];
    if (vs.systolicBP && vs.diastolicBP) {
      vsItems.push(`PA ${vs.systolicBP}/${vs.diastolicBP} mmHg`);
    }
    if (vs.meanArterialPressure) {
      vsItems.push(`PAM ${vs.meanArterialPressure} mmHg`);
    }
    if (vs.heartRate) {
      vsItems.push(`FC ${vs.heartRate} bpm`);
    }
    if (vs.respiratoryRate) {
      vsItems.push(`FR ${vs.respiratoryRate} irpm`);
    }
    if (vs.oxygenSaturation) {
      vsItems.push(`SpO₂ ${vs.oxygenSaturation}%`);
    }
    if (vs.temperature) {
      vsItems.push(`temperatura ${vs.temperature} °C`);
    }

    if (vsItems.length > 0) {
      p2Sentences.push(`Sinais vitais: ${joinWithAnd(vsItems)}.`);
    }
  }

  // Pain
  const pain = form.pain;
  if (pain?.assessmentType && pain.assessmentType !== 'Não informado') {
    if (pain.assessmentType === 'Escala numérica 0–10') {
      if (pain.numericScaleValue === 0) {
        p2Sentences.push('Refere ausência de dor (0/10 na escala numérica).');
      } else if (pain.numericScaleValue !== undefined) {
        const details = [
          pain.location ? `em ${pain.location}` : '',
          pain.characteristics ? `(${pain.characteristics})` : '',
        ].filter(Boolean).join(' ');
        p2Sentences.push(
          `Refere dor de intensidade ${pain.numericScaleValue}/10 na escala numérica${details ? ` ${details}` : ''}.`
        );
      }
    } else if (pain.assessmentType === 'Outra escala') {
      const details = [
        pain.location ? `em ${pain.location}` : '',
        pain.characteristics ? `(${pain.characteristics})` : '',
      ].filter(Boolean).join(' ');
      p2Sentences.push(
        `Avaliação de dor por ${pain.otherScaleName || 'outra escala'}: ${pain.otherScaleResult || 'informada'}${details ? ` ${details}` : ''}.`
      );
    } else if (pain.assessmentType === 'Não avaliável') {
      p2Sentences.push('Avaliação de dor não avaliável no momento.');
    } else if (pain.assessmentType === 'Não avaliada') {
      p2Sentences.push('Avaliação de dor não realizada no momento.');
    }
  }

  // Neurological
  const neuro = form.neurological;
  if (neuro) {
    const neuroItems: string[] = [];

    if (neuro.consciousnessLevel && neuro.consciousnessLevel !== 'Não avaliado') {
      const cStr =
        neuro.consciousnessLevel === 'Outro' && neuro.consciousnessCustom
          ? neuro.consciousnessCustom
          : neuro.consciousnessLevel.toLowerCase();
      neuroItems.push(cStr);
    }

    if (neuro.orientation && neuro.orientation !== 'Não avaliado') {
      if (neuro.orientation === 'Orientado em tempo e espaço') {
        neuroItems.push('orientado no tempo e espaço');
      } else if (neuro.orientation === 'Parcialmente orientado') {
        neuroItems.push('parcialmente orientado');
      } else if (neuro.orientation === 'Desorientado') {
        neuroItems.push('desorientado');
      } else if (neuro.orientation === 'Não avaliável') {
        neuroItems.push('com orientação não avaliável');
      }
    }

    if (neuro.glasgowType === 'score' && neuro.glasgowScore !== undefined) {
      neuroItems.push(`Glasgow ${neuro.glasgowScore} pontos`);
    }

    if (neuro.rassType === 'score' && neuro.rassScore !== undefined) {
      neuroItems.push(`RASS ${neuro.rassScore > 0 ? `+${neuro.rassScore}` : neuro.rassScore}`);
    }

    if (neuro.pupils && neuro.pupils !== 'Não avaliadas') {
      const pStr =
        neuro.pupils === 'Outra alteração' && neuro.pupilsCustom
          ? neuro.pupilsCustom
          : `pupilas ${neuro.pupils.toLowerCase()}`;
      neuroItems.push(pStr);
    }

    if (neuro.photoreaction && neuro.photoreaction !== 'Não avaliada') {
      const photStr =
        neuro.photoreaction === 'Outra' && neuro.photoreactionCustom
          ? neuro.photoreactionCustom
          : neuro.photoreaction.toLowerCase();
      neuroItems.push(photStr);
    }

    if (neuroItems.length > 0) {
      p2Sentences.push(formatSentence(`Ao exame neurológico, apresenta-se ${neuroItems.join(', ')}`));
    }

    if (neuro.identifiedNeurologicalAlteration && neuro.identifiedNeurologicalAlteration !== 'Não avaliado') {
      if (neuro.identifiedNeurologicalAlteration === 'Não') {
        p2Sentences.push('Sem alterações neurológicas focais identificadas na avaliação realizada.');
      } else if (neuro.identifiedNeurologicalAlteration === 'Sim') {
        p2Sentences.push(
          neuro.neurologicalAlterationDetails
            ? `Apresenta alteração neurológica focal: ${neuro.neurologicalAlterationDetails}.`
            : 'Apresenta alterações neurológicas focais.'
        );
      }
    }
  }

  if (p2Sentences.length > 0) {
    paragraphs.push(p2Sentences.join(' '));
  }

  // ==========================================
  // PARAGRAPH 3: Respiratório, Cardiovascular, DVA e Sedação
  // ==========================================
  const p3Sentences: string[] = [];

  // Respiratory
  const resp = form.respiratory;
  if (resp) {
    const respClauses: string[] = [];

    if (resp.respiratorySupport && resp.respiratorySupport !== 'Não informado') {
      if (resp.respiratorySupport === 'Ar ambiente') {
        respClauses.push('em ar ambiente');
      } else if (resp.respiratorySupport === 'Oxigenoterapia') {
        const dev = resp.oxygenDevice?.toLowerCase() || 'oxigenoterapia';
        const flow = resp.oxygenFlowRate ? ` a ${resp.oxygenFlowRate} L/min` : '';
        const fio2 = resp.oxygenFiO2 ? ` (FiO₂ ${resp.oxygenFiO2}%)` : '';
        respClauses.push(`em oxigenoterapia por ${dev}${flow}${fio2}`);
      } else if (resp.respiratorySupport === 'Ventilação não invasiva') {
        const vniParams = [
          resp.vniInterface ? `interface ${resp.vniInterface}` : '',
          resp.vniIpapPinsp ? `IPAP ${resp.vniIpapPinsp} cmH₂O` : '',
          resp.vniPeepEpap ? `EPAP ${resp.vniPeepEpap} cmH₂O` : '',
          resp.vniFiO2 ? `FiO₂ ${resp.vniFiO2}%` : '',
        ].filter(Boolean).join(', ');
        respClauses.push(`em ventilação não invasiva (VNI)${vniParams ? ` (${vniParams})` : ''}`);
      } else if (resp.respiratorySupport === 'Ventilação mecânica invasiva') {
        const vmiParams = [
          resp.vmiAirway ? `via ${resp.vmiAirway}` : '',
          resp.vmiCaliber ? `${resp.vmiCaliber}` : '',
          resp.vmiVentilatoryMode ? `modo ${resp.vmiVentilatoryMode}` : '',
          resp.vmiPeep ? `PEEP ${resp.vmiPeep} cmH₂O` : '',
          resp.vmiFiO2 ? `FiO₂ ${resp.vmiFiO2}%` : '',
          resp.vmiProgrammedRR ? `FR prog. ${resp.vmiProgrammedRR} irpm` : '',
          resp.vmiTidalVolume ? `VC ${resp.vmiTidalVolume} mL` : '',
        ].filter(Boolean).join(', ');
        respClauses.push(`em ventilação mecânica invasiva (VMI)${vmiParams ? ` (${vmiParams})` : ''}`);
      } else if (resp.respiratorySupport === 'Outro' && resp.supportCustom) {
        respClauses.push(resp.supportCustom);
      }
    }

    if (resp.respiratoryPattern && resp.respiratoryPattern !== 'Não avaliado') {
      respClauses.push(resp.respiratoryPattern.toLowerCase());
    }

    if (resp.respiratoryDistress && resp.respiratoryDistress !== 'Não avaliado') {
      if (resp.respiratoryDistress === 'Presente') respClauses.push('com desconforto respiratório');
      else if (resp.respiratoryDistress === 'Ausente') respClauses.push('sem desconforto respiratório');
    }

    if (resp.accessoryMuscles && resp.accessoryMuscles !== 'Não avaliado') {
      if (resp.accessoryMuscles === 'Presente') respClauses.push('com uso de musculatura acessória');
      else if (resp.accessoryMuscles === 'Ausente') respClauses.push('sem uso de musculatura acessória');
    }

    if (respClauses.length > 0) {
      p3Sentences.push(formatSentence(respClauses.join(', ')));
    }

    // Secretions
    if (resp.secretion && resp.secretion !== 'Não avaliada') {
      if (resp.secretion === 'Presente') {
        const secDetails = [resp.secretionQuantity, resp.secretionColor, resp.secretionConsistency]
          .filter(Boolean)
          .join(', ');
        p3Sentences.push(
          secDetails
            ? `Presença de secreção em vias aéreas (${secDetails}).`
            : 'Presença de secreção em vias aéreas.'
        );
      } else if (resp.secretion === 'Ausente') {
        p3Sentences.push('Sem secreções em vias aéreas.');
      }
    }

    // Breath sounds & adventitious sounds
    const auscultaParts: string[] = [];
    if (resp.breathSounds && resp.breathSounds !== 'Não avaliado') {
      if (resp.breathSounds === 'Presente bilateralmente') {
        auscultaParts.push('murmúrio vesicular presente bilateralmente');
      } else if (resp.breathSounds === 'Diminuído') {
        auscultaParts.push('murmúrio vesicular diminuído');
      } else {
        auscultaParts.push(resp.breathSounds.toLowerCase());
      }
    }

    if (resp.adventitiousSounds && resp.adventitiousSounds.length > 0 && !resp.adventitiousSounds.includes('Não avaliado')) {
      if (resp.adventitiousSounds.includes('Ausentes')) {
        auscultaParts.push('sem ruídos adventícios');
      } else {
        const sounds = resp.adventitiousSounds.map((s) => s.toLowerCase());
        auscultaParts.push(`com presença de ${joinWithAnd(sounds)}`);
      }
    }

    if (auscultaParts.length > 0) {
      p3Sentences.push(formatSentence(`Ausculta pulmonar com ${auscultaParts.join(', ')}`));
    }
  }

  // Cardiovascular & Hemodynamics
  const card = form.cardiovascular;
  if (card) {
    const cardClauses: string[] = [];

    if (card.hemodynamicCondition && card.hemodynamicCondition !== 'Não informado' && card.hemodynamicCondition !== 'Não avaliada') {
      if (card.hemodynamicCondition === 'Estável') cardClauses.push('hemodinamicamente estável');
      else if (card.hemodynamicCondition === 'Instável') cardClauses.push('hemodinamicamente instável');
    }

    if (card.peripheralPerfusion && card.peripheralPerfusion !== 'Não avaliada') {
      if (card.peripheralPerfusion === 'Adequada') cardClauses.push('perfusão periférica adequada');
      else if (card.peripheralPerfusion === 'Reduzida') cardClauses.push('perfusão periférica reduzida');
    }

    if (card.extremities && card.extremities !== 'Não avaliadas') {
      if (card.extremities === 'Quentes') cardClauses.push('extremidades aquecidas');
      else if (card.extremities === 'Frias') cardClauses.push('extremidades frias');
      else if (card.extremities === 'Outra' && card.extremitiesCustom) cardClauses.push(`extremidades ${card.extremitiesCustom}`);
    }

    if (card.capillaryRefillTime && card.capillaryRefillTime !== 'Não avaliado') {
      if (card.capillaryRefillTime === 'Menor que 3 segundos') cardClauses.push('tempo de enchimento capilar < 3s');
      else if (card.capillaryRefillTime === 'Maior ou igual a 3 segundos') cardClauses.push('tempo de enchimento capilar ≥ 3s');
      else if (card.capillaryRefillTime === 'Informar valor' && card.capillaryRefillTimeValue) cardClauses.push(`tempo de enchimento capilar ${card.capillaryRefillTimeValue}s`);
    }

    if (card.edema && card.edema !== 'Não avaliado') {
      if (card.edema === 'Ausente') {
        cardClauses.push('sem edemas');
      } else if (card.edema === 'Presente') {
        const edLoc = card.edemaLocations?.join(', ') || 'membros';
        const edInt = card.edemaIntensity ? `, intensidade ${card.edemaIntensity}` : '';
        cardClauses.push(`com edema em ${edLoc}${edInt}`);
      }
    }

    if (cardClauses.length > 0) {
      p3Sentences.push(formatSentence(`Condição cardiovascular: ${cardClauses.join(', ')}`));
    }
  }

  // Vasoactive Drugs
  const dva = form.vasoactiveDrugs;
  if (dva?.inUse) {
    if (dva.inUse === 'Não') {
      // If explicit "Não", we can optionally note absence if relevant, but let's keep neutral
    } else if (dva.inUse === 'Sim' && dva.drugsList && dva.drugsList.length > 0) {
      const drugPhrases = dva.drugsList.map((d) => {
        const name = d.medication === 'Outra' && d.observations ? d.observations : d.medication;
        const rate = d.infusionRate ? ` a ${d.infusionRate} ${d.unit || 'mL/h'}` : '';
        const conc = d.concentration ? ` (${d.concentration})` : '';
        return `${name?.toLowerCase() || 'droga vasoativa'}${rate}${conc}`;
      });
      p3Sentences.push(formatSentence(`Em uso de droga vasoativa: ${joinWithAnd(drugPhrases)}`));
    }
  }

  // Sedation & Analgesia (Distinct sentence)
  const sed = form.sedationAnalgesia;
  if (sed?.inUse) {
    if (sed.inUse === 'Sim' && sed.medicationsList && sed.medicationsList.length > 0) {
      const medPhrases = sed.medicationsList.map((m) => {
        const name = m.medication === 'Outro' && m.observations ? m.observations : m.medication;
        const dose = m.rateOrDose ? ` a ${m.rateOrDose}` : '';
        const conc = m.concentration ? ` (${m.concentration})` : '';
        const purp = m.purpose ? ` para ${m.purpose.toLowerCase()}` : '';
        return `${name?.toLowerCase() || 'medicamento'}${dose}${conc}${purp}`;
      });
      p3Sentences.push(formatSentence(`Em infusão contínua: ${joinWithAnd(medPhrases)}`));
    }
  }

  if (p3Sentences.length > 0) {
    paragraphs.push(p3Sentences.join(' '));
  }

  // ==========================================
  // PARAGRAPH 4: Gastrointestinal, Nutrição, Eliminações, Dispositivos e Pele
  // ==========================================
  const p4Sentences: string[] = [];

  // Gastrointestinal
  const gi = form.gastrointestinal;
  if (gi) {
    const giClauses: string[] = [];

    if (gi.abdominalShape && gi.abdominalShape !== 'Não avaliado') {
      giClauses.push(`abdômen ${gi.abdominalShape.toLowerCase()}`);
    }

    if (gi.consistency && gi.consistency !== 'Não avaliado') {
      giClauses.push(gi.consistency.toLowerCase());
    }

    if (gi.palpation && gi.palpation !== 'Não realizada') {
      if (gi.palpation === 'Indolor') {
        giClauses.push('indolor à palpação');
      } else if (gi.palpation === 'Doloroso') {
        giClauses.push(gi.palpationLocation ? `doloroso à palpação em ${gi.palpationLocation}` : 'doloroso à palpação');
      }
    }

    if (gi.bowelSounds && gi.bowelSounds !== 'Não avaliados') {
      if (gi.bowelSounds === 'Presentes/normoativos') {
        giClauses.push('ruídos hidroaéreos presentes');
      } else if (gi.bowelSounds === 'Hipoativos') {
        giClauses.push('ruídos hidroaéreos hipoativos');
      } else if (gi.bowelSounds === 'Hiperativos') {
        giClauses.push('ruídos hidroaéreos hiperativos');
      } else if (gi.bowelSounds === 'Ausentes') {
        giClauses.push('ruídos hidroaéreos ausentes');
      }
    }

    if (giClauses.length > 0) {
      p4Sentences.push(formatSentence(`Avaliação abdominal: ${giClauses.join(', ')}`));
    }
  }

  // Nutrition
  const nut = form.nutrition;
  if (nut) {
    const nutClauses: string[] = [];

    if (nut.status && nut.status !== 'Não informado') {
      if (nut.status === 'Dieta por via oral') {
        const acc = nut.oralAcceptance && nut.oralAcceptance !== 'Não avaliada' ? ` com ${nut.oralAcceptance.toLowerCase()} aceitação` : '';
        nutClauses.push(`dieta por via oral${acc}`);
      } else if (nut.status === 'Dieta enteral') {
        const dev = nut.enteralDevice || 'SNE';
        const rate = nut.enteralRate ? ` a ${nut.enteralRate} mL/h` : '';
        const tol = nut.enteralTolerance && nut.enteralTolerance !== 'Não avaliada' ? `, com tolerância ${nut.enteralTolerance.toLowerCase()}` : '';
        nutClauses.push(`dieta enteral por ${dev}${rate}${tol}`);
      } else if (nut.status === 'Jejum') {
        nutClauses.push('em jejum');
      } else if (nut.status === 'Dieta parenteral') {
        nutClauses.push('em nutrição parenteral');
      } else if (nut.status === 'Outra' && nut.statusCustom) {
        nutClauses.push(`em ${nut.statusCustom}`);
      }
    }

    if (nut.nausea && nut.nausea !== 'Não avaliadas') {
      if (nut.nausea === 'Presentes') nutClauses.push('com queixa de náuseas');
      else if (nut.nausea === 'Ausentes') nutClauses.push('sem náuseas');
    }

    if (nut.vomiting && nut.vomiting !== 'Não avaliados') {
      if (nut.vomiting === 'Presentes') {
        nutClauses.push(nut.vomitingDetails ? `com episódios de vômitos (${nut.vomitingDetails})` : 'com episódios de vômitos');
      } else if (nut.vomiting === 'Ausentes') {
        nutClauses.push('sem vômitos');
      }
    }

    if (nutClauses.length > 0) {
      p4Sentences.push(formatSentence(`Suporte nutricional: ${nutClauses.join(', ')}`));
    }
  }

  // Bowel Eliminations
  const bowel = form.bowelElimination;
  if (bowel) {
    const bowelClauses: string[] = [];

    if (bowel.bowelMovement && bowel.bowelMovement !== 'Não informado' && bowel.bowelMovement !== 'Não avaliada') {
      if (bowel.bowelMovement === 'Ausente') {
        bowelClauses.push('evacuação ausente no período');
      } else if (bowel.bowelMovement === 'Presente') {
        const aspect = bowel.aspect && bowel.aspect !== 'Não avaliado' ? ` (fezes ${bowel.aspect.toLowerCase()})` : '';
        const freq = bowel.frequencyOrQuantity ? `, ${bowel.frequencyOrQuantity}` : '';
        bowelClauses.push(`evacuação presente no período${aspect}${freq}`);
      }
    }

    if (bowel.ostomy && bowel.ostomy !== 'Não avaliada') {
      if (bowel.ostomy === 'Sim') {
        const ostType = bowel.ostomyType || 'Ostomia intestinal';
        const ostCond = bowel.ostomyStomaCondition ? ` (${bowel.ostomyStomaCondition})` : '';
        bowelClauses.push(`portador de ${ostType}${ostCond}`);
      }
    }

    if (bowelClauses.length > 0) {
      p4Sentences.push(formatSentence(`Eliminações intestinais: ${bowelClauses.join(', ')}`));
    }
  }

  // Urinary System
  const uri = form.urinary;
  if (uri) {
    const uriClauses: string[] = [];

    if (uri.diuresis && uri.diuresis !== 'Não informado' && uri.diuresis !== 'Não avaliada') {
      if (uri.diuresis === 'Presente') uriClauses.push('diurese presente');
      else if (uri.diuresis === 'Oligúrica') uriClauses.push('diurese oligúrica');
      else if (uri.diuresis === 'Anúrica') uriClauses.push('diurese anúrica');
    }

    if (uri.eliminationRoute && uri.eliminationRoute !== 'Não informado') {
      if (uri.eliminationRoute === 'Espontânea') {
        const details = [uri.spontaneousColor, uri.spontaneousAspect, uri.spontaneousVolume].filter(Boolean).join(', ');
        uriClauses.push(`por via espontânea${details ? ` (${details})` : ''}`);
      } else if (uri.eliminationRoute === 'SVD') {
        const svdParts: string[] = [];
        if (uri.svdCaliber) svdParts.push(uri.svdCaliber);
        if (uri.svdPatent === 'Sim') svdParts.push('pérvia');
        if (uri.svdOutputVolume) svdParts.push(`débito de ${uri.svdOutputVolume} mL`);
        if (uri.svdColor) svdParts.push(`coloração ${uri.svdColor}`);
        if (uri.svdAspect) svdParts.push(`aspecto ${uri.svdAspect}`);
        uriClauses.push(`por sonda vesical de demora${svdParts.length > 0 ? ` (${svdParts.join(', ')})` : ''}`);
      } else if (uri.eliminationRoute === 'Outro dispositivo') {
        uriClauses.push('por dispositivo urinário');
      }
    }

    if (uriClauses.length > 0) {
      p4Sentences.push(formatSentence(`Sistema urinário: ${uriClauses.join(', ')}`));
    }
  }

  // Invasive Devices (Consolidated if exact match, otherwise individual)
  const devs = form.devices?.list?.filter((d) => d.type?.trim() || d.location?.trim()) || [];
  if (devs.length > 0) {
    if (devs.length === 2 && haveIdenticalDeviceStatus(devs[0], devs[1])) {
      const d1Name = devs[0].type === 'Outro' && devs[0].customType ? devs[0].customType : devs[0].type;
      const d2Name = devs[1].type === 'Outro' && devs[1].customType ? devs[1].customType : devs[1].type;
      const d1Loc = devs[0].location || 'sítio informado';
      const d2Loc = devs[1].location || 'sítio informado';
      const statusStr = buildDeviceStatusDescription(devs[0], true);
      p4Sentences.push(
        formatSentence(`Mantém ${d1Name} em ${d1Loc} e ${d2Name} em ${d2Loc}${statusStr ? `, ${statusStr}` : ''}`)
      );
    } else {
      devs.forEach((dev) => {
        const name = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type || 'Dispositivo';
        const loc = dev.location ? ` em ${dev.location}` : '';
        const statusStr = buildDeviceStatusDescription(dev, false);
        p4Sentences.push(formatSentence(`Mantém ${name}${loc}${statusStr ? `, ${statusStr}` : ''}`));
      });
    }
  }

  // Skin & Integrity
  const skin = form.skin;
  if (skin) {
    const skinClauses: string[] = [];

    if (skin.integrity && skin.integrity !== 'Não avaliada') {
      if (skin.integrity === 'Íntegra') {
        skinClauses.push('pele íntegra');
      } else if (skin.integrity === 'Com alteração/lesão') {
        const loc = skin.lesionLocation ? ` em ${skin.lesionLocation}` : '';
        const dress = skin.lesionDressingPresent === 'Sim' ? ' com curativo' : '';
        const desc = skin.lesionDescription ? ` (${skin.lesionDescription})` : '';
        skinClauses.push(`presença de lesão cutânea${loc}${dress}${desc}`);
      }
    }

    if (skin.hydration && skin.hydration !== 'Não avaliada') {
      skinClauses.push(`hidratação ${skin.hydration.toLowerCase()}`);
    }

    if (skinClauses.length > 0) {
      p4Sentences.push(formatSentence(`Integridade cutânea: ${skinClauses.join(', ')}`));
    }
  }

  if (p4Sentences.length > 0) {
    paragraphs.push(p4Sentences.join(' '));
  }

  // ==========================================
  // PARAGRAPH 5: Cuidados Prestados, Banho, Intercorrências, Comparativo, Desfecho e Adicionais
  // ==========================================
  const p5Sentences: string[] = [];

  // Nursing Care items
  const careItems = form.nursingCare?.careItems || [];
  if (careItems.length > 0) {
    const mappedCare = careItems.map((item) => {
      if (item === 'Outro cuidado' && form.nursingCare?.otherCareDescription) {
        return form.nursingCare.otherCareDescription;
      }
      return NURSING_CARE_TEXT_MAP[item] || item.toLowerCase();
    });
    p5Sentences.push(formatSentence(`Cuidados de enfermagem prestados no período: ${joinWithAnd(mappedCare)}`));
  }

  // Bath
  const bath = form.bath;
  if (bath?.bathType && bath.bathType !== 'Não informado') {
    if (bath.bathType === 'Não realizado') {
      p5Sentences.push('Banho não realizado no período.');
    } else {
      const tol =
        bath.tolerance && bath.tolerance !== 'Não informar' && bath.tolerance !== 'Não avaliada'
          ? `, com ${bath.tolerance.toLowerCase()}`
          : '';
      p5Sentences.push(formatSentence(`Realizado ${bath.bathType.toLowerCase()}${tol}`));
    }
  }

  // Complications (Strictly only when informed)
  const comp = form.complications;
  if (comp?.hasComplication && comp.hasComplication !== 'Não informado') {
    if (comp.hasComplication === 'Não') {
      p5Sentences.push('Paciente evolui sem intercorrências durante o período.');
    } else if (comp.hasComplication === 'Sim') {
      const timeStr = comp.time ? `Às ${comp.time}, ` : '';
      const descStr = comp.description ? `apresentou ${comp.description}. ` : 'apresentou intercorrência clínica. ';
      const actStr = comp.actionsTaken ? `Condutas de enfermagem realizadas: ${comp.actionsTaken}. ` : '';
      const respStr = comp.patientResponse ? `Resposta do paciente: ${comp.patientResponse}. ` : '';
      const commStr =
        comp.communicatedToTeam === 'Sim' && comp.communicatedWho
          ? `${comp.communicatedWho} comunicada${comp.communicationTime ? ` às ${comp.communicationTime}` : ''}.`
          : '';
      p5Sentences.push(`${timeStr}${descStr}${actStr}${respStr}${commStr}`.trim());
    }
  }

  // Evolution Comparison (Strictly only when previous evaluation exists and indicated)
  const cmp = form.comparison;
  if (cmp?.hasPreviousEvaluation === 'Sim' && cmp.evolutionStatus) {
    const status = cmp.evolutionStatus;
    const aspects = cmp.aspectsRelated && cmp.aspectsRelated.length > 0 ? ` nos aspectos: ${cmp.aspectsRelated.join(', ')}` : '';
    const evidence = cmp.evidenceDescription ? ` (Evidência: ${cmp.evidenceDescription})` : '';
    p5Sentences.push(`Em relação à avaliação anterior, o paciente ${status.toLowerCase()}${aspects}${evidence}.`);
  }

  // Final Status
  const fin = form.finalStatus;
  if (fin?.condition && fin.condition !== 'Não informado') {
    if (fin.condition === 'Permanece no setor sob cuidados') {
      p5Sentences.push('Permanece aos cuidados da equipe de enfermagem e sob acompanhamento da equipe multiprofissional.');
    } else if (fin.condition === 'Transferência realizada') {
      p5Sentences.push('Transferência do paciente realizada conforme protocolo institucional.');
    } else if (fin.condition === 'Transferência em andamento') {
      p5Sentences.push('Transferência do paciente em andamento.');
    } else if (fin.condition === 'Alta do setor') {
      p5Sentences.push('Paciente recebe alta do setor.');
    } else if (fin.condition === 'Outra situação' && fin.conditionCustom) {
      p5Sentences.push(formatSentence(fin.conditionCustom));
    }
  }

  // Additional Information / Notes
  const addNotes = typeof form.additionalInformation === 'string' ? form.additionalInformation.trim() : (form.additionalInformation as any)?.notes?.trim();
  if (addNotes) {
    p5Sentences.push(`Observações complementares: ${addNotes}.`);
  }

  if (p5Sentences.length > 0) {
    paragraphs.push(p5Sentences.join(' '));
  }

  return paragraphs.join('\n\n');
}
