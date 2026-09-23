import { ClinicalEvolutionForm } from '../types/clinical';
import {
  formatSentence,
  joinWithAnd,
  haveIdenticalDeviceStatus,
  buildDeviceStatusDescription,
  NURSING_CARE_TEXT_MAP,
} from './outputRules';

/**
 * TechnicianNursingNoteBuilder
 * 
 * Generates an objective, deterministic nursing note (Anotação de Enfermagem)
 * tailored for the Nursing Technician professional role.
 * 
 * Rules strictly enforced:
 * - Direct, objective vocabulary: apresenta, refere, observado, aferido, mantém, realizado,
 *   administrado conforme prescrição, comunicado, encaminhado, permanece, registrado.
 * - No nursing diagnoses, no nursing prescriptions, no clinical severity/stability inferences.
 * - No automatic classification of vital signs (no "febril", "hipertenso", "taquicárdico", "hipoxêmico").
 * - No general state assumption ("Bom/Regular/Mau" not required).
 * - No hemodynamic stability inference ("hemodinamicamente estável/instável" banned).
 * - Document is strictly titled and structured as Anotação de Enfermagem (never Evolução).
 */
export function buildTechnicianNursingNote(form: Partial<ClinicalEvolutionForm>): string {
  const paragraphs: string[] = [];

  // ==========================================
  // PARÁGRAFO 1: Contexto, Identificação, Consciência e Observações Gerais
  // ==========================================
  const p1Sentences: string[] = [];

  const ctx = form.context;
  if (ctx?.moment && ctx?.location) {
    const loc = ctx.location === 'Outro' && ctx.locationCustom ? ctx.locationCustom : ctx.location;
    const moment = ctx.moment;

    let leadClause = '';
    if (moment === 'Recebo paciente') {
      leadClause = loc.toLowerCase().startsWith('leito') ? 'Recebo paciente no leito' : `Recebo paciente em ${loc}`;
    } else if (moment === 'Avalio paciente') {
      leadClause = loc.toLowerCase().startsWith('leito') ? 'Observo paciente no leito' : `Observo paciente em ${loc}`;
    } else {
      leadClause = `${moment} em ${loc}`;
    }

    const contextModifiers: string[] = [];

    // Acompanhamento
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

    // Metas de identificação
    const wrist = ctx.wristbandChecked === 'Sim';
    const bed = ctx.bedSignChecked === 'Sim';
    if (wrist && bed) {
      contextModifiers.push('com identificação conferida por pulseira e placa de identificação do leito');
    } else if (wrist) {
      contextModifiers.push('com identificação conferida por pulseira');
    } else if (bed) {
      contextModifiers.push('com identificação conferida por placa de identificação do leito');
    }

    // Precauções
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

  // Alergias
  if (ctx?.allergies && ctx.allergies !== 'Não informado') {
    if (ctx.allergies === 'Não referidas') {
      p1Sentences.push('Alergias não referidas pelo paciente/acompanhante.');
    } else if (ctx.allergies === 'Sim') {
      p1Sentences.push(
        ctx.allergiesDetails
          ? `Alergia referida: ${ctx.allergiesDetails}.`
          : 'Alergias referidas registradas.'
      );
    }
  }

  // Motivo da admissão / queixa informada
  if (ctx?.admissionReason) {
    p1Sentences.push(`Motivo informado da admissão: ${ctx.admissionReason}.`);
  }
  if (ctx?.relevantComorbidities) {
    p1Sentences.push(`Comorbidades informadas: ${ctx.relevantComorbidities}.`);
  }

  // Nível de consciência e orientação (objetivo)
  const neuro = form.neurological;
  const consciousnessTerms: string[] = [];
  if (neuro?.consciousnessLevel && neuro.consciousnessLevel !== 'Não avaliado') {
    consciousnessTerms.push(neuro.consciousnessLevel.toLowerCase());
  }
  if (neuro?.orientation && neuro.orientation !== 'Não avaliado' && neuro.orientation !== 'Não avaliável') {
    if (neuro.orientation === 'Orientado em tempo e espaço') {
      consciousnessTerms.push('orientado em tempo e espaço');
    } else if (neuro.orientation === 'Parcialmente orientado') {
      consciousnessTerms.push('parcialmente orientado');
    } else if (neuro.orientation === 'Desorientado') {
      consciousnessTerms.push('desorientado');
    }
  }

  // Comportamento
  const gen = form.generalAssessment;
  if (gen) {
    if (gen.behavior && gen.behavior.length > 0 && !gen.behavior.includes('Não avaliado')) {
      consciousnessTerms.push(joinWithAnd(gen.behavior.map((b) => b.toLowerCase())));
    }

    if (consciousnessTerms.length > 0) {
      p1Sentences.push(formatSentence(`Apresenta-se ${consciousnessTerms.join(', ')}`));
    }

    // Queixas referidas
    if (gen.complaints && gen.complaints !== 'Não informado' && gen.complaints !== 'Não avaliado') {
      if (gen.complaints === 'Sem queixas no momento') {
        p1Sentences.push('Registrada ausência de queixas no momento.');
      } else if (gen.complaints === 'Com queixa' && gen.complaintsDetails) {
        p1Sentences.push(`Refere queixa de ${gen.complaintsDetails}.`);
      } else if (gen.complaints === 'Com queixa') {
        p1Sentences.push('Refere queixas no momento.');
      } else if (gen.complaints === 'Impossibilitado de informar') {
        p1Sentences.push('Impossibilitado de informar queixas no momento.');
      }
    }

    // Higiene
    if (gen.hygiene && gen.hygiene !== 'Não informado' && gen.hygiene !== 'Não avaliada') {
      if (gen.hygiene === 'Preservada') p1Sentences.push('Higiene preservada.');
      else if (gen.hygiene === 'Necessita cuidados') p1Sentences.push('Necessita de cuidados de higiene.');
      else if (gen.hygiene === 'Higiene realizada no período') p1Sentences.push('Higiene realizada no período.');
    }

    // Mobilidade
    if (gen.mobility && gen.mobility !== 'Não avaliada') {
      if (gen.mobility === 'Deambula sem auxílio') p1Sentences.push('Deambula sem auxílio.');
      else if (gen.mobility === 'Deambula com auxílio') p1Sentences.push('Deambula com auxílio.');
      else if (gen.mobility === 'Cadeira de rodas') p1Sentences.push('Em uso de cadeira de rodas.');
      else if (gen.mobility === 'Em maca') p1Sentences.push('Em maca.');
      else if (gen.mobility === 'Restrito ao leito') p1Sentences.push('Restrito ao leito.');
      else if (gen.mobility === 'Outro' && gen.mobilityCustom) p1Sentences.push(formatSentence(gen.mobilityCustom));
    }
  } else if (consciousnessTerms.length > 0) {
    p1Sentences.push(formatSentence(`Apresenta-se ${consciousnessTerms.join(', ')}`));
  }

  // Escalas neurológicas quando registradas
  if (neuro?.glasgowScore !== undefined) {
    p1Sentences.push(`Escala de Coma de Glasgow registrada: ${neuro.glasgowScore}.`);
  }
  if (neuro?.rassScore !== undefined) {
    const sign = neuro.rassScore > 0 ? '+' : '';
    p1Sentences.push(`Escala RASS registrada: ${sign}${neuro.rassScore}.`);
  }
  if (neuro?.identifiedNeurologicalAlteration === 'Sim' && neuro.neurologicalAlterationDetails) {
    p1Sentences.push(`Alteração neurológica observada: ${neuro.neurologicalAlterationDetails}.`);
  }

  if (p1Sentences.length > 0) {
    paragraphs.push(p1Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 2: Sinais Vitais Aferidos e Avaliação de Dor (SEM INFERÊNCIAS)
  // ==========================================
  const p2Sentences: string[] = [];
  const vitals = form.vitalSigns;
  const vitalsList: string[] = [];

  if (vitals) {
    if (vitals.systolicBP && vitals.diastolicBP) {
      vitalsList.push(`PA: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`);
    } else if (vitals.systolicBP) {
      vitalsList.push(`PA sistólica: ${vitals.systolicBP} mmHg`);
    }

    if (vitals.meanArterialPressure) {
      vitalsList.push(`PAM: ${vitals.meanArterialPressure} mmHg`);
    }

    if (vitals.heartRate) {
      vitalsList.push(`FC: ${vitals.heartRate} bpm`);
    }

    if (vitals.respiratoryRate) {
      vitalsList.push(`FR: ${vitals.respiratoryRate} irpm`);
    }

    if (vitals.oxygenSaturation) {
      vitalsList.push(`SpO₂: ${vitals.oxygenSaturation}%`);
    }

    if (vitals.temperature) {
      vitalsList.push(`Temperatura: ${vitals.temperature} °C`);
    }

    if (vitalsList.length > 0) {
      p2Sentences.push(`Sinais vitais aferidos: ${vitalsList.join(', ')}.`);
    }
  }

  // Avaliação de Dor (objetiva, sem diagnóstico)
  const pain = form.pain;
  if (pain) {
    if (pain.assessmentType === 'Escala numérica 0–10' && pain.numericScaleValue !== undefined) {
      let painText = `Dor avaliada em ${pain.numericScaleValue}/10 na escala numérica`;
      const painDetails: string[] = [];
      if (pain.location) painDetails.push(`em ${pain.location}`);
      if (pain.characteristics) painDetails.push(`tipo ${pain.characteristics}`);
      if (painDetails.length > 0) {
        painText += ` (${painDetails.join(', ')})`;
      }
      p2Sentences.push(formatSentence(painText));
    } else if (pain.assessmentType === 'Outra escala' && pain.otherScaleName) {
      let painText = `Dor avaliada pela escala ${pain.otherScaleName}: ${pain.otherScaleResult || 'sem valor informado'}`;
      if (pain.location) painText += ` em ${pain.location}`;
      p2Sentences.push(formatSentence(painText));
    } else if (pain.assessmentType === 'Não avaliável') {
      p2Sentences.push('Dor não avaliável no momento.');
    }
  }

  if (p2Sentences.length > 0) {
    paragraphs.push(p2Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 3: Suporte Respiratório, Cardiovascular e Achados Físicos Observados
  // ==========================================
  const p3Sentences: string[] = [];
  const resp = form.respiratory;

  if (resp) {
    if (resp.respiratorySupport && resp.respiratorySupport !== 'Não informado') {
      if (resp.respiratorySupport === 'Ar ambiente') {
        p3Sentences.push('Mantém respiração em ar ambiente.');
      } else if (resp.respiratorySupport === 'Oxigenoterapia') {
        const o2Parts: string[] = [];
        if (resp.oxygenDevice) o2Parts.push(`sob ${resp.oxygenDevice.toLowerCase()}`);
        if (resp.oxygenFlowRate) o2Parts.push(`a ${resp.oxygenFlowRate} L/min`);
        if (resp.oxygenFiO2) o2Parts.push(`(FiO₂ estimada: ${resp.oxygenFiO2}%)`);
        p3Sentences.push(formatSentence(`Mantém oxigenoterapia ${o2Parts.join(' ')}`));
      } else if (resp.respiratorySupport === 'Ventilação não invasiva') {
        const vniParts: string[] = [];
        if (resp.vniInterface) vniParts.push(`interface: ${resp.vniInterface}`);
        if (resp.vniIpapPinsp) vniParts.push(`IPAP: ${resp.vniIpapPinsp} cmH₂O`);
        if (resp.vniPeepEpap) vniParts.push(`EPAP: ${resp.vniPeepEpap} cmH₂O`);
        if (resp.vniFiO2) vniParts.push(`FiO₂: ${resp.vniFiO2}%`);
        p3Sentences.push(formatSentence(`Mantém ventilação não invasiva (${vniParts.join(', ')})`));
      } else if (resp.respiratorySupport === 'Ventilação mecânica invasiva') {
        const vmiParts: string[] = [];
        if (resp.vmiAirway) vmiParts.push(`via ${resp.vmiAirway}${resp.vmiCaliber ? ` (${resp.vmiCaliber})` : ''}`);
        if (resp.vmiVentilatoryMode) vmiParts.push(`modo ${resp.vmiVentilatoryMode}`);
        if (resp.vmiPeep) vmiParts.push(`PEEP: ${resp.vmiPeep} cmH₂O`);
        if (resp.vmiFiO2) vmiParts.push(`FiO₂: ${resp.vmiFiO2}%`);
        if (resp.vmiTidalVolume) vmiParts.push(`VC: ${resp.vmiTidalVolume} mL`);
        p3Sentences.push(formatSentence(`Mantém ventilação mecânica invasiva ${vmiParts.join(', ')}`));
      }
    }

    // Padrão e desconforto
    const respFindings: string[] = [];
    if (resp.respiratoryPattern && resp.respiratoryPattern !== 'Não avaliado') {
      respFindings.push(`padrão respiratório ${resp.respiratoryPattern.toLowerCase()}`);
    }
    if (resp.respiratoryDistress === 'Ausente') {
      respFindings.push('sem sinais de desconforto respiratório');
    } else if (resp.respiratoryDistress === 'Presente') {
      respFindings.push('com desconforto respiratório observado');
    }
    if (respFindings.length > 0) {
      p3Sentences.push(formatSentence(`Apresenta ${respFindings.join(', ')}`));
    }

    // Secreção traqueal / vias aéreas
    if (resp.secretion === 'Presente') {
      const secParts: string[] = [];
      if (resp.secretionQuantity) secParts.push(resp.secretionQuantity.toLowerCase());
      if (resp.secretionAspect) secParts.push(resp.secretionAspect.toLowerCase());
      if (resp.secretionColor) secParts.push(`de coloração ${resp.secretionColor.toLowerCase()}`);
      p3Sentences.push(
        formatSentence(
          `Presença de secreção em vias aéreas${secParts.length > 0 ? ` (${secParts.join(', ')})` : ''}`
        )
      );
    }
  }

  // Cardiovascular objetivo (perfusão, extremidades, edema - SEM inferir estabilidade)
  const cardio = form.cardiovascular;
  if (cardio) {
    const cardioObs: string[] = [];
    if (cardio.peripheralPerfusion && cardio.peripheralPerfusion !== 'Não avaliada') {
      cardioObs.push(`perfusão periférica ${cardio.peripheralPerfusion.toLowerCase()}`);
    }
    if (cardio.capillaryRefillTime && cardio.capillaryRefillTime !== 'Não avaliado') {
      let crtStr = '';
      if (cardio.capillaryRefillTime === 'Informar valor' && cardio.capillaryRefillTimeValue) {
        crtStr = `TEC ${cardio.capillaryRefillTimeValue}s`;
      } else if (
        cardio.capillaryRefillTime.includes('>= 3') ||
        cardio.capillaryRefillTime.includes('Maior ou igual a 3')
      ) {
        crtStr = 'TEC >= 3s';
      } else {
        crtStr = `TEC ${cardio.capillaryRefillTime.toLowerCase()}`;
      }
      cardioObs.push(crtStr);
    }
    if (cardio.extremities && cardio.extremities !== 'Não avaliadas') {
      cardioObs.push(`extremidades ${cardio.extremities.toLowerCase()}`);
    }
    if (cardio.edema && cardio.edema !== 'Não avaliado') {
      if (cardio.edema === 'Ausente') {
        cardioObs.push('sem edema');
      } else if (cardio.edema === 'Presente') {
        const locations =
          cardio.edemaLocations && cardio.edemaLocations.length > 0
            ? ` em ${cardio.edemaLocations.join(', ')}`
            : '';
        const intensity = cardio.edemaIntensity ? ` (${cardio.edemaIntensity})` : '';
        cardioObs.push(`edema presente${locations}${intensity}`);
      }
    }

    if (cardioObs.length > 0) {
      p3Sentences.push(formatSentence(`Ao exame: ${cardioObs.join(', ')}`));
    }
  }

  // Drogas vasoativas em infusão contínua
  const vasoDrugs = form.vasoactiveDrugs;
  if (vasoDrugs?.inUse === 'Sim' && vasoDrugs.drugsList && vasoDrugs.drugsList.length > 0) {
    const drugStrs = vasoDrugs.drugsList.map((d) => {
      const name = d.medication;
      return `${name} a ${d.infusionRate || 'taxa informada'} ${d.unit || 'mL/h'}`;
    });
    p3Sentences.push(`Mantém infusão contínua de ${joinWithAnd(drugStrs)}.`);
  }

  if (p3Sentences.length > 0) {
    paragraphs.push(p3Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 4: Dispositivos Invasivos, Curativos e Integridade Cutânea
  // ==========================================
  const p4Sentences: string[] = [];

  // Dispositivos
  const devs = form.devices?.list?.filter((d) => d.type?.trim() || d.location?.trim()) || [];
  if (devs.length > 0) {
    if (devs.length === 2 && haveIdenticalDeviceStatus(devs[0], devs[1])) {
      const d1Name = devs[0].type === 'Outro' && devs[0].customType ? devs[0].customType : devs[0].type;
      const d2Name = devs[1].type === 'Outro' && devs[1].customType ? devs[1].customType : devs[1].type;
      const d1Loc = devs[0].location || 'sítio informado';
      const d2Loc = devs[1].location || 'sítio informado';
      const statusStr = buildDeviceStatusDescription(devs[0], true);
      p4Sentences.push(
        formatSentence(
          `Mantém ${d1Name} em ${d1Loc} e ${d2Name} em ${d2Loc}${statusStr ? `, ${statusStr}` : ''}`
        )
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

  // Pele e Curativos
  const skin = form.skin;
  if (skin) {
    if (skin.integrity === 'Íntegra') {
      p4Sentences.push('Pele íntegra observada.');
    } else if (skin.integrity === 'Com alteração/lesão') {
      const lesionParts: string[] = [];
      if (skin.lesionLocation) {
        const loc = skin.lesionLocation.trim();
        const locLower = loc.toLowerCase();
        if (locLower === 'sacral') {
          lesionParts.push('em região sacral');
        } else if (locLower.startsWith('região ') || locLower.startsWith('em ')) {
          lesionParts.push(locLower.startsWith('em ') ? loc : `em ${loc}`);
        } else {
          lesionParts.push(`em ${loc}`);
        }
      }
      if (skin.lesionDressingPresent === 'Sim') lesionParts.push('com curativo presente');
      if (skin.lesionDescription) lesionParts.push(`(${skin.lesionDescription})`);
      p4Sentences.push(formatSentence(`Presença de lesão/alteração cutânea ${lesionParts.join(' ')}`));
    }
  }

  if (p4Sentences.length > 0) {
    paragraphs.push(p4Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 5: Nutrição, Eliminações e Cuidados Realizados
  // ==========================================
  const p5Sentences: string[] = [];

  // Nutrição (evita repetições como 'dieta dieta')
  const nut = form.nutrition;
  if (nut && nut.status && nut.status !== 'Não informado') {
    if (nut.status === 'Dieta por via oral') {
      const acc = nut.oralAcceptance && nut.oralAcceptance !== 'Não avaliada'
        ? `, com aceitação ${nut.oralAcceptance.toLowerCase()}`
        : '';
      p5Sentences.push(`Em dieta por via oral${acc}.`);
    } else if (nut.status === 'Dieta enteral') {
      const dev = nut.enteralDevice ? ` por ${nut.enteralDevice}` : '';
      const rate = nut.enteralRate ? ` a ${nut.enteralRate} mL/h` : '';
      let tol = '';
      if (nut.enteralTolerance && nut.enteralTolerance !== 'Não avaliada') {
        const tolLower = nut.enteralTolerance.toLowerCase();
        if (tolLower === 'boa' || tolLower === 'boa tolerância') {
          tol = ', com boa tolerância';
        } else if (tolLower === 'regular') {
          tol = ', com tolerância regular';
        } else if (tolLower === 'baixa' || tolLower === 'baixa tolerância') {
          tol = ', com baixa tolerância';
        } else {
          tol = `, com tolerância ${tolLower}`;
        }
      }
      p5Sentences.push(`Em dieta enteral${dev}${rate}${tol}.`);
    } else if (nut.status === 'Jejum') {
      p5Sentences.push('Em jejum.');
    } else if (nut.status === 'Dieta parenteral') {
      p5Sentences.push('Em nutrição parenteral.');
    } else if (nut.status === 'Outra' && nut.statusCustom) {
      p5Sentences.push(`Em dieta ${nut.statusCustom}.`);
    }
  }

  // Eliminações urinárias
  const uri = form.urinary;
  if (uri && uri.eliminationRoute && uri.eliminationRoute !== 'Não informado') {
    if (uri.eliminationRoute === 'SVD') {
      const uriDetails: string[] = [];
      if (uri.svdCaliber) uriDetails.push(`calibre ${uri.svdCaliber}`);
      if (uri.svdAspect) uriDetails.push(`aspecto ${uri.svdAspect.toLowerCase()}`);
      if (uri.svdColor) uriDetails.push(`cor ${uri.svdColor.toLowerCase()}`);
      if (uri.svdOutputVolume) uriDetails.push(`volume: ${uri.svdOutputVolume} mL`);
      p5Sentences.push(
        formatSentence(`Diurese por SVD${uriDetails.length > 0 ? ` (${uriDetails.join(', ')})` : ''}`)
      );
    } else if (uri.eliminationRoute === 'Espontânea') {
      const uriDetails: string[] = [];
      if (uri.spontaneousAspect) uriDetails.push(`aspecto ${uri.spontaneousAspect.toLowerCase()}`);
      if (uri.spontaneousColor) uriDetails.push(`cor ${uri.spontaneousColor.toLowerCase()}`);
      p5Sentences.push(
        formatSentence(`Diurese espontânea presente${uriDetails.length > 0 ? ` (${uriDetails.join(', ')})` : ''}`)
      );
    }
  }

  // Eliminações intestinais (com concordância exata: fezes formadas, pastosas, etc.)
  const bowel = form.bowelElimination;
  if (bowel && bowel.bowelMovement && bowel.bowelMovement !== 'Não avaliada' && bowel.bowelMovement !== 'Não informado') {
    if (bowel.bowelMovement === 'Presente') {
      const bowelParts: string[] = [];
      if (bowel.aspect && bowel.aspect !== 'Não avaliado') {
        const aspectMap: Record<string, string> = {
          'Formada': 'fezes formadas',
          'Pastosa': 'fezes pastosas',
          'Líquida': 'fezes líquidas',
          'Diarreica': 'fezes diarreicas',
          'Semipastosa': 'fezes semipastosas',
        };
        bowelParts.push(aspectMap[bowel.aspect] || `aspecto ${bowel.aspect.toLowerCase()}`);
      }
      if (bowel.frequencyOrQuantity) {
        bowelParts.push(`frequência/quantidade: ${bowel.frequencyOrQuantity}`);
      }
      p5Sentences.push(
        formatSentence(`Eliminações intestinais presentes${bowelParts.length > 0 ? ` (${bowelParts.join(', ')})` : ''}`)
      );
    } else if (bowel.bowelMovement === 'Ausente') {
      p5Sentences.push('Sem eliminações intestinais no período.');
    }
  }

  // Cuidados Prestados (itera exclusivamente sobre careItems selecionados)
  const care = form.nursingCare;
  if (care?.careItems && care.careItems.length > 0) {
    const validItems = care.careItems.filter((i) => i && i.trim().length > 0);
    if (validItems.length > 0) {
      const mappedCares = validItems.map((item) => {
        if (item === 'Outro cuidado' && care.otherCareDescription) {
          return care.otherCareDescription;
        }
        return NURSING_CARE_TEXT_MAP[item] || item.toLowerCase();
      });
      p5Sentences.push(formatSentence(`Cuidados realizados: ${joinWithAnd(mappedCares)}`));
    }
  }

  // Banho
  const bath = form.bath;
  if (bath?.bathType && bath.bathType !== 'Não informado') {
    if (bath.bathType === 'Não realizado') {
      p5Sentences.push('Banho não realizado no período.');
    } else {
      let bathStr = `Realizado ${bath.bathType.toLowerCase()}`;
      if (bath.tolerance && bath.tolerance !== 'Não avaliada' && bath.tolerance !== 'Não informar') {
        const tolLower = bath.tolerance.toLowerCase();
        if (tolLower === 'boa tolerância' || tolLower === 'boa') {
          bathStr += ', com boa tolerância';
        } else {
          bathStr += ` com ${tolLower}`;
        }
      }
      p5Sentences.push(formatSentence(bathStr));
    }
  }

  if (p5Sentences.length > 0) {
    paragraphs.push(p5Sentences.join(' '));
  }

  // ==========================================
  // PARÁGRAFO 6: Intercorrências e Comunicação à Equipe
  // ==========================================
  const comp = form.complications;
  if (comp) {
    if (comp.hasComplication === 'Não') {
      paragraphs.push('Sem intercorrências registradas no período.');
    } else if (comp.hasComplication === 'Sim') {
      const p6Sentences: string[] = [];
      const timePrefix = comp.time ? `Às ${comp.time}, ` : '';
      const desc = comp.description || 'registrada intercorrência assistencial';
      p6Sentences.push(formatSentence(`${timePrefix}${desc}`));

      if (comp.actionsTaken) {
        p6Sentences.push(formatSentence(`Condutas realizadas: ${comp.actionsTaken}`));
      }

      if (comp.patientResponse) {
        p6Sentences.push(formatSentence(`Resposta observada: ${comp.patientResponse}`));
      }

      if (comp.communicatedToTeam === 'Sim') {
        const who = comp.communicatedWho || 'equipe';
        const commTime = comp.communicationTime ? ` às ${comp.communicationTime}` : '';
        p6Sentences.push(formatSentence(`Comunicado a(o) ${who}${commTime}`));
      }

      if (p6Sentences.length > 0) {
        paragraphs.push(p6Sentences.join(' '));
      }
    }
  }

  // ==========================================
  // PARÁGRAFO 7: Alterações Observadas em Relação ao Período Anterior e Situação Final
  // ==========================================
  const p7Sentences: string[] = [];
  const comparison = form.comparison;

  if (comparison) {
    if (comparison.observationComparison === 'Sem alteração observada') {
      p7Sentences.push('Sem alterações observadas no período em relação ao registro anterior.');
    } else if (
      comparison.observationComparison === 'Houve alteração observada' &&
      comparison.observedChangesDescription
    ) {
      p7Sentences.push(
        formatSentence(`Alterações observadas em relação ao registro anterior: ${comparison.observedChangesDescription}`)
      );
    }
  }

  const finalSt = form.finalStatus;
  if (finalSt?.condition && finalSt.condition !== 'Não informado') {
    if (finalSt.condition === 'Permanece no setor sob cuidados') {
      p7Sentences.push('Permanece no setor sob cuidados de enfermagem.');
    } else if (finalSt.condition === 'Transferência realizada') {
      p7Sentences.push('Transferência realizada conforme protocolo setorial.');
    } else if (finalSt.condition === 'Transferência em andamento') {
      p7Sentences.push('Transferência em andamento.');
    } else if (finalSt.condition === 'Alta do setor') {
      p7Sentences.push('Alta do setor registrada.');
    } else if (finalSt.condition === 'Outra situação' && finalSt.conditionCustom) {
      p7Sentences.push(formatSentence(finalSt.conditionCustom));
    }
  }

  if (p7Sentences.length > 0) {
    paragraphs.push(p7Sentences.join(' '));
  }

  // Fallback if form is completely empty
  if (paragraphs.length === 0) {
    return 'Nenhum dado clínico registrado para a anotação de enfermagem.';
  }

  return paragraphs.join('\n\n');
}
