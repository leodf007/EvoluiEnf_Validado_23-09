import { NurseEvolutionForm } from '../types/nurseEvolutionClinical';
import { AuthorizedClinicalFacts, AIRefinedParagraph } from './types';
import {
  formatSentence,
  joinWithAnd,
  haveIdenticalDeviceStatus,
  buildDeviceStatusDescription,
} from './outputRules';
import { buildAuthorizedNurseEvolutionFacts } from './nurseEvolutionClinicalFactBuilder';

/**
 * Generates an objective, structured deterministic nursing evolution narrative
 * for Nurses (Enfermeiro → Evolução de Enfermagem).
 *
 * CRITICAL SAFETY RULES:
 * 1. Strictly relies on facts provided in the structured form.
 * 2. NO automated generation of unsolicited diagnoses (NANDA/CIPE).
 * 3. NO medical diagnoses or speculative inferences.
 * 4. Every paragraph is linked to exact factual IDs for traceability.
 */
export function buildNurseEvolutionStructuredNarrative(
  rawForm: Partial<NurseEvolutionForm>,
  facts?: AuthorizedClinicalFacts
): { narrative: string; paragraphs: AIRefinedParagraph[] } {
  const form: Partial<NurseEvolutionForm> = rawForm || {};
  const authorizedFacts = facts || buildAuthorizedNurseEvolutionFacts(form);
  const paragraphs: AIRefinedParagraph[] = [];

  // ==========================================
  // PARÁGRAFO 1: Contexto, Identificação, Alergias e Precauções
  // ==========================================
  const p1Sentences: string[] = [];
  const p1FactIds: string[] = [];
  const ctx = form.context;

  let lead = 'Realizada avaliação e evolução de enfermagem';
  if (ctx?.location && ctx.location.trim()) {
    const loc = ctx.location === 'Outro' && ctx.customLocation ? ctx.customLocation : ctx.location;
    lead = loc.toLowerCase().startsWith('leito')
      ? 'Realizada avaliação e evolução de enfermagem no leito'
      : `Realizada avaliação e evolução de enfermagem em ${loc}`;
    p1FactIds.push('nurse-evo-ctx-location');
  }

  const p1Mods: string[] = [];
  if (ctx?.moment && ctx.moment.trim()) {
    const momStr = ctx.moment === 'Outro' && ctx.customMoment ? ctx.customMoment : ctx.moment;
    p1Mods.push(momStr.toLowerCase());
    p1FactIds.push('nurse-evo-ctx-moment');
  }

  if (ctx?.escort && ctx.escort !== 'Não informado' && ctx.escort.trim()) {
    if (ctx.escort === 'Desacompanhado') p1Mods.push('paciente desacompanhado');
    else if (ctx.escort === 'Familiar') p1Mods.push('com acompanhamento de familiar');
    else if (ctx.escort === 'Responsável legal') p1Mods.push('com acompanhamento de responsável legal');
    else if (ctx.escort === 'Cuidador') p1Mods.push('com acompanhamento de cuidador');
    else if (ctx.escort === 'Outro' && ctx.customEscort) p1Mods.push(`com acompanhamento de ${ctx.customEscort}`);
    p1FactIds.push('nurse-evo-ctx-escort');
  }

  if (p1Mods.length > 0) {
    p1Sentences.push(formatSentence(`${lead}, ${p1Mods.join(', ')}`));
  } else if (ctx?.location || ctx?.moment) {
    p1Sentences.push(formatSentence(lead));
  }

  // Identificação
  const idParts: string[] = [];
  if (ctx?.wristbandIdentification === 'Sim' && ctx?.bedIdentification === 'Sim') {
    idParts.push('identificação ativa conferida por pulseira e placa de leito');
    p1FactIds.push('nurse-evo-ctx-wristband', 'nurse-evo-ctx-bed-plate');
  } else if (ctx?.wristbandIdentification === 'Sim') {
    idParts.push('identificação ativa conferida por pulseira');
    p1FactIds.push('nurse-evo-ctx-wristband');
  } else if (ctx?.bedIdentification === 'Sim') {
    idParts.push('identificação conferida por placa de leito');
    p1FactIds.push('nurse-evo-ctx-bed-plate');
  }

  if (ctx?.hasAllergies && ctx.hasAllergies !== 'Não informado' && ctx.hasAllergies.trim()) {
    if (ctx.hasAllergies === 'Não referidas') idParts.push('sem alergias referidas');
    else if (ctx.hasAllergies === 'Sim') {
      idParts.push(ctx.allergyDescription ? `alergias referidas: ${ctx.allergyDescription}` : 'alergias referidas');
    }
    p1FactIds.push('nurse-evo-ctx-allergies');
  }

  if (ctx?.precaution && ctx.precaution !== 'Não informado' && ctx.precaution.trim()) {
    const precStr = ctx.precaution === 'Outra' && ctx.customPrecaution ? ctx.customPrecaution : ctx.precaution;
    idParts.push(`em precaução ${precStr.toLowerCase()}`);
    p1FactIds.push('nurse-evo-ctx-precaution');
  }

  if (idParts.length > 0) {
    p1Sentences.push(formatSentence(joinWithAnd(idParts)));
  }

  if (p1Sentences.length > 0) {
    paragraphs.push({
      text: p1Sentences.join(' '),
      factIds: Array.from(new Set(p1FactIds)),
    });
  }

  // ==========================================
  // PARÁGRAFO 2: Avaliação Geral, Queixas, Sinais Vitais e Dor
  // ==========================================
  const p2Sentences: string[] = [];
  const p2FactIds: string[] = [];
  const gen = form.generalAssessment;

  const genParts: string[] = [];
  if (gen?.behavior && gen.behavior.length > 0 && !gen.behavior.includes('Não avaliado')) {
    const behStr = gen.behavior.map((b) => (b === 'Outro' && gen.customBehavior ? gen.customBehavior : b)).join(', ');
    genParts.push(`comportamento ${behStr.toLowerCase()}`);
    p2FactIds.push('nurse-evo-gen-behavior');
  }

  if (gen?.complaintStatus && gen.complaintStatus !== 'Não informado' && gen.complaintStatus !== 'Não avaliado') {
    const srcStr = gen.informationSource && gen.informationSource !== 'Não informado' && gen.informationSource !== 'Paciente'
      ? ` (informado por ${gen.informationSource === 'Outra' && gen.customInformationSource ? gen.customInformationSource : gen.informationSource.toLowerCase()})`
      : '';
    if (gen.complaintStatus === 'Sem queixas referidas') {
      genParts.push('sem queixas referidas no momento');
    } else if (gen.complaintStatus === 'Com queixa' && gen.complaintDescription) {
      genParts.push(`queixa referida de ${gen.complaintDescription}${srcStr}`);
    } else if (gen.complaintStatus === 'Impossibilitado de informar') {
      genParts.push('impossibilitado de informar queixas');
    }
    p2FactIds.push('nurse-evo-gen-complaint');
    if (gen.informationSource) p2FactIds.push('nurse-evo-gen-source');
  }

  if (gen?.hygieneStatus && gen.hygieneStatus !== 'Não informado' && gen.hygieneStatus !== 'Não avaliada') {
    genParts.push(`higiene corporal ${gen.hygieneStatus.toLowerCase()}`);
    p2FactIds.push('nurse-evo-gen-hygiene');
  }

  if (genParts.length > 0) {
    p2Sentences.push(formatSentence(`Avaliação geral: paciente ${joinWithAnd(genParts)}`));
  }

  // Sinais vitais
  const vit = form.vitalSignsAndPain;
  if (vit) {
    const vList: string[] = [];
    if (vit.systolicBP && vit.diastolicBP) {
      vList.push(`PA ${vit.systolicBP}/${vit.diastolicBP} mmHg`);
      p2FactIds.push('nurse-evo-bp');
    }
    if (vit.meanArterialPressure) {
      vList.push(`PAM ${vit.meanArterialPressure} mmHg`);
      p2FactIds.push('nurse-evo-map');
    }
    if (vit.heartRate) {
      vList.push(`FC ${vit.heartRate} bpm`);
      p2FactIds.push('nurse-evo-hr');
    }
    if (vit.respiratoryRate) {
      vList.push(`FR ${vit.respiratoryRate} irpm`);
      p2FactIds.push('nurse-evo-rr');
    }
    if (vit.oxygenSaturation) {
      vList.push(`SpO₂ ${vit.oxygenSaturation}%`);
      p2FactIds.push('nurse-evo-spo2');
    }
    if (vit.temperature) {
      vList.push(`temperatura axilar ${vit.temperature} °C`);
      p2FactIds.push('nurse-evo-temp');
    }
    if (vit.capillaryBloodGlucose) {
      vList.push(`glicemia capilar ${vit.capillaryBloodGlucose} mg/dL`);
      p2FactIds.push('nurse-evo-glucose');
    }

    if (vList.length > 0) {
      p2Sentences.push(`Parâmetros vitais aferidos: ${joinWithAnd(vList)}.`);
    }

    // Dor
    if (vit.painScaleType && vit.painScaleType !== 'Não avaliada' && vit.painScaleType !== 'Não informado') {
      if (vit.painScaleType === 'Não avaliável') {
        p2Sentences.push('Dor não avaliável no momento.');
        p2FactIds.push('nurse-evo-pain-score');
      } else if (vit.painScore !== undefined && vit.painScore !== '') {
        let pStr = `Dor avaliada em ${vit.painScore}/10 (${vit.painScaleType})`;
        p2FactIds.push('nurse-evo-pain-score');
        const pDet: string[] = [];
        if (vit.painLocation) {
          pDet.push(`em ${vit.painLocation}`);
          p2FactIds.push('nurse-evo-pain-location');
        }
        if (vit.painCharacteristic) {
          pDet.push(`característica ${vit.painCharacteristic}`);
          p2FactIds.push('nurse-evo-pain-char');
        }
        if (vit.painDuration) {
          pDet.push(`duração: ${vit.painDuration}`);
          p2FactIds.push('nurse-evo-pain-duration');
        }
        if (vit.painReliefOrAggravatingFactors) {
          pDet.push(`fatores: ${vit.painReliefOrAggravatingFactors}`);
          p2FactIds.push('nurse-evo-pain-factors');
        }
        if (pDet.length > 0) pStr += ` (${pDet.join(', ')})`;
        p2Sentences.push(formatSentence(pStr));
      }
      if (vit.painObservation) {
        p2Sentences.push(formatSentence(`Observações sobre a dor: ${vit.painObservation}`));
        p2FactIds.push('nurse-evo-pain-obs');
      }
    }
  }

  if (p2Sentences.length > 0) {
    paragraphs.push({
      text: p2Sentences.join(' '),
      factIds: Array.from(new Set(p2FactIds)),
    });
  }

  // ==========================================
  // PARÁGRAFO 3: Exame Neurológico, Respiratório, Ausculta Pulmonar, Cardiovascular e Ausculta Cardíaca
  // ==========================================
  const p3Sentences: string[] = [];
  const p3FactIds: string[] = [];

  // Neurológico
  const neuro = form.neurological;
  if (neuro) {
    const nList: string[] = [];
    if (neuro.consciousnessLevel && neuro.consciousnessLevel !== 'Não avaliado') {
      const cStr = neuro.consciousnessLevel === 'Outro' && neuro.customConsciousness ? neuro.customConsciousness : neuro.consciousnessLevel;
      nList.push(cStr.toLowerCase());
      p3FactIds.push('nurse-evo-neuro-consc');
    }
    if (neuro.orientation && neuro.orientation !== 'Não avaliado' && neuro.orientation !== 'Não avaliável') {
      nList.push(neuro.orientation.toLowerCase());
      p3FactIds.push('nurse-evo-neuro-orient');
    } else if (neuro.orientation === 'Não avaliável') {
      nList.push('orientação temporoespacial não avaliável');
      p3FactIds.push('nurse-evo-neuro-orient');
    }
    if (neuro.pupils && neuro.pupils !== 'Não avaliadas') {
      const pStr = neuro.pupils === 'Outra' && neuro.customPupils ? neuro.customPupils : neuro.pupils;
      nList.push(`pupilas ${pStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-neuro-pupils');
    }
    if (neuro.photoreaction && neuro.photoreaction !== 'Não avaliada') {
      const phStr = neuro.photoreaction === 'Outra' && neuro.customPhotoreaction ? neuro.customPhotoreaction : neuro.photoreaction;
      nList.push(`fotorreagência ${phStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-neuro-photo');
    }
    if (neuro.motorDeficit && neuro.motorDeficit !== 'Não avaliado') {
      if (neuro.motorDeficit === 'Presente') {
        nList.push(neuro.motorDeficitDescription ? `déficit motor presente (${neuro.motorDeficitDescription})` : 'déficit motor presente');
      } else {
        nList.push('sem déficit motor evidente');
      }
      p3FactIds.push('nurse-evo-neuro-motor-deficit');
    }
    if (nList.length > 0) {
      p3Sentences.push(formatSentence(`Exame neurológico: ${joinWithAnd(nList)}`));
    }
    if (neuro.glasgowScore && neuro.glasgowScore !== 'Não aplicado' && neuro.glasgowScore !== 'Não avaliado') {
      p3Sentences.push(`Escala de Coma de Glasgow: ${neuro.glasgowScore}.`);
      p3FactIds.push('nurse-evo-neuro-glasgow');
    }
    if (neuro.rassScore && neuro.rassScore !== 'Não aplicado' && neuro.rassScore !== 'Não avaliado') {
      p3Sentences.push(`Escala RASS: ${neuro.rassScore}.`);
      p3FactIds.push('nurse-evo-neuro-rass');
    }
  }

  // Respiratório
  const resp = form.respiratory;
  if (resp) {
    const rList: string[] = [];
    if (resp.respiratoryPattern && resp.respiratoryPattern !== 'Não avaliado') {
      const patStr = resp.respiratoryPattern === 'Outro' && resp.customPattern ? resp.customPattern : resp.respiratoryPattern;
      rList.push(`padrão respiratório ${patStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-resp-pattern');
    }
    if (resp.respiratoryDistress === 'Ausente') {
      rList.push('sem desconforto respiratório');
      p3FactIds.push('nurse-evo-resp-distress');
    } else if (resp.respiratoryDistress === 'Presente') {
      rList.push('com sinais de desconforto respiratório');
      p3FactIds.push('nurse-evo-resp-distress');
    }
    if (resp.accessoryMuscles === 'Presente') {
      rList.push('uso de musculatura acessória presente');
      p3FactIds.push('nurse-evo-resp-accessory-muscles');
    } else if (resp.accessoryMuscles === 'Ausente') {
      rList.push('sem uso de musculatura acessória');
      p3FactIds.push('nurse-evo-resp-accessory-muscles');
    }
    if (resp.respiratorySupport === 'Ar ambiente') {
      rList.push('em ar ambiente');
      p3FactIds.push('nurse-evo-resp-support');
    } else if (resp.respiratorySupport === 'Oxigenoterapia') {
      const dev = resp.oxygenDevice ? ` sob ${resp.oxygenDevice.toLowerCase()}` : '';
      const flow = resp.oxygenFlowRate ? ` a ${resp.oxygenFlowRate} ${resp.oxygenFlowUnit || 'L/min'}` : '';
      rList.push(`em oxigenoterapia${dev}${flow}`);
      p3FactIds.push('nurse-evo-resp-support');
    } else if (resp.respiratorySupport === 'VNI') {
      rList.push(`em suporte por VNI (${resp.vniInterface || 'interface facial'})`);
      p3FactIds.push('nurse-evo-resp-support');
    } else if (resp.respiratorySupport === 'VMI') {
      rList.push(`em ventilação mecânica invasiva (${resp.vmiAirway || 'TOT'}${resp.vmiMode ? ` modo ${resp.vmiMode}` : ''})`);
      p3FactIds.push('nurse-evo-resp-support');
    }
    if (resp.secretions === 'Ausentes') {
      rList.push('sem secreções traqueobrônquicas');
      p3FactIds.push('nurse-evo-resp-secretions');
    } else if (resp.secretions === 'Presentes') {
      rList.push(resp.secretionsDescription ? `secreções presentes (${resp.secretionsDescription})` : 'secreções presentes');
      p3FactIds.push('nurse-evo-resp-secretions');
    }
    if (rList.length > 0) {
      p3Sentences.push(formatSentence(`Sistema respiratório: ${joinWithAnd(rList)}`));
    }
  }

  // Ausculta Pulmonar
  const pAusc = form.pulmonaryAuscultation;
  if (pAusc && pAusc.performed === 'Sim') {
    const aList: string[] = [];
    p3FactIds.push('nurse-evo-pulm-performed');
    if (pAusc.vesicularMurmur) {
      const vesStr = pAusc.vesicularMurmurDetails ? `${pAusc.vesicularMurmur.toLowerCase()} (${pAusc.vesicularMurmurDetails})` : pAusc.vesicularMurmur.toLowerCase();
      aList.push(`murmúrio vesicular ${vesStr}`);
      p3FactIds.push('nurse-evo-pulm-vesicular');
    }
    if (pAusc.adventitiousSounds === 'Ausentes') {
      aList.push('sem ruídos adventícios');
      p3FactIds.push('nurse-evo-pulm-adventitious');
    } else if (pAusc.adventitiousSounds === 'Presentes' && pAusc.adventitiousSoundTypes && pAusc.adventitiousSoundTypes.length > 0) {
      const locStr = pAusc.adventitiousSoundLocation ? ` em ${pAusc.adventitiousSoundLocation}` : '';
      aList.push(`presença de ${pAusc.adventitiousSoundTypes.join(', ').toLowerCase()}${locStr}`);
      p3FactIds.push('nurse-evo-pulm-adventitious');
    }
    if (aList.length > 0) {
      p3Sentences.push(formatSentence(`Ausculta pulmonar: ${joinWithAnd(aList)}`));
    }
  }

  // Cardiovascular
  const cardio = form.cardiovascular;
  if (cardio) {
    const cList: string[] = [];
    if (cardio.peripheralPerfusion && cardio.peripheralPerfusion !== 'Não avaliada') {
      const perfStr = cardio.peripheralPerfusion === 'Outra' && cardio.customPerfusion ? cardio.customPerfusion : cardio.peripheralPerfusion;
      cList.push(`perfusão periférica ${perfStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-cv-perfusion');
    }
    if (cardio.extremities && cardio.extremities !== 'Não avaliadas') {
      const extStr = cardio.extremities === 'Outra' && cardio.customExtremities ? cardio.customExtremities : cardio.extremities;
      cList.push(`extremidades ${extStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-cv-extremities');
    }
    if (cardio.capillaryRefillTime && cardio.capillaryRefillTime !== 'Não avaliado') {
      const tec = cardio.capillaryRefillTime === 'valor informado' && cardio.customRefillTime ? cardio.customRefillTime : cardio.capillaryRefillTime;
      cList.push(`tempo de enchimento capilar ${tec}`);
      p3FactIds.push('nurse-evo-cv-tec');
    }
    if (cardio.edema === 'Ausente') {
      cList.push('sem edema periférico');
      p3FactIds.push('nurse-evo-cv-edema');
    } else if (cardio.edema === 'Presente') {
      const edLoc = cardio.edemaLocation ? ` em ${cardio.edemaLocation}` : '';
      const edGrd = cardio.edemaGrade ? ` (${cardio.edemaGrade})` : '';
      cList.push(`edema presente${edLoc}${edGrd}`);
      p3FactIds.push('nurse-evo-cv-edema');
    }
    if (cList.length > 0) {
      p3Sentences.push(formatSentence(`Sistema cardiovascular: ${joinWithAnd(cList)}`));
    }
  }

  // Ausculta Cardíaca
  const cAusc = form.cardiacAuscultation;
  if (cAusc && cAusc.performed === 'Sim') {
    const caList: string[] = [];
    p3FactIds.push('nurse-evo-card-performed');
    if (cAusc.heartSounds) {
      const sndStr = cAusc.heartSounds === 'Outra' && cAusc.customHeartSounds ? cAusc.customHeartSounds : cAusc.heartSounds;
      caList.push(`bulhas ${sndStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-card-sounds');
    }
    if (cAusc.times) {
      const timStr = cAusc.times === 'Outro' && cAusc.customTimes ? cAusc.customTimes : cAusc.times;
      caList.push(`em ${timStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-card-times');
    }
    if (cAusc.rhythm) {
      const rhyStr = cAusc.rhythm === 'Outro' && cAusc.customRhythm ? cAusc.customRhythm : cAusc.rhythm;
      caList.push(`ritmo ${rhyStr.toLowerCase()}`);
      p3FactIds.push('nurse-evo-card-rhythm');
    }
    if (cAusc.murmurs === 'Ausentes') {
      caList.push('sem sopros');
      p3FactIds.push('nurse-evo-card-murmurs');
    } else if (cAusc.murmurs === 'Presentes') {
      caList.push(cAusc.murmursDescription ? `sopros presentes (${cAusc.murmursDescription})` : 'sopros presentes');
      p3FactIds.push('nurse-evo-card-murmurs');
    }
    if (caList.length > 0) {
      p3Sentences.push(formatSentence(`Ausculta cardíaca: ${joinWithAnd(caList)}`));
    }
  }

  if (p3Sentences.length > 0) {
    paragraphs.push({
      text: p3Sentences.join(' '),
      factIds: Array.from(new Set(p3FactIds)),
    });
  }

  // ==========================================
  // PARÁGRAFO 4: Gastrointestinal, Nutrição, Eliminações e Tegumentar
  // ==========================================
  const p4Sentences: string[] = [];
  const p4FactIds: string[] = [];

  // Gastrointestinal
  const gastro = form.gastrointestinalAndNutrition;
  if (gastro) {
    const gList: string[] = [];
    if (gastro.abdomenForm && gastro.abdomenForm !== 'Não avaliado') {
      const fStr = gastro.abdomenForm === 'Outro' && gastro.customAbdomenForm ? gastro.customAbdomenForm : gastro.abdomenForm;
      gList.push(`abdome ${fStr.toLowerCase()}`);
      p4FactIds.push('nurse-evo-gi-form');
    }
    if (gastro.abdomenConsistency && gastro.abdomenConsistency !== 'Não avaliado') {
      const cStr = gastro.abdomenConsistency === 'Outro' && gastro.customAbdomenConsistency ? gastro.customAbdomenConsistency : gastro.abdomenConsistency;
      gList.push(cStr.toLowerCase());
      p4FactIds.push('nurse-evo-gi-consistency');
    }
    if (gastro.abdomenPalpation && gastro.abdomenPalpation !== 'Não realizada') {
      if (gastro.abdomenPalpation === 'Doloroso') {
        gList.push(gastro.abdomenPainLocation ? `doloroso à palpação em ${gastro.abdomenPainLocation}` : 'doloroso à palpação');
      } else {
        gList.push('indolor à palpação');
      }
      p4FactIds.push('nurse-evo-gi-palpation');
    }
    if (gastro.bowelSounds && gastro.bowelSounds !== 'Não avaliados') {
      gList.push(`ruídos hidroaéreos ${gastro.bowelSounds.toLowerCase()}`);
      p4FactIds.push('nurse-evo-gi-rha');
    }
    if (gList.length > 0) {
      p4Sentences.push(formatSentence(`Sistema gastrointestinal: ${joinWithAnd(gList)}`));
    }

    // Nutrição
    if (gastro.nutritionalStatus && gastro.nutritionalStatus !== 'Não informado') {
      let nutStr = `Dieta: ${gastro.nutritionalStatus.toLowerCase()}`;
      p4FactIds.push('nurse-evo-nut-status');
      if (gastro.nutritionalStatus === 'Via oral' && gastro.oralAcceptance) {
        nutStr += ` (${gastro.oralAcceptance.toLowerCase()})`;
        p4FactIds.push('nurse-evo-nut-oral-acceptance');
      } else if (gastro.nutritionalStatus === 'Dieta enteral') {
        const entParts: string[] = [];
        if (gastro.enteralRoute) entParts.push(`via ${gastro.enteralRoute}`);
        if (gastro.enteralRate) entParts.push(`vazão ${gastro.enteralRate} ${gastro.enteralRateUnit || 'mL/h'}`);
        if (gastro.enteralTolerance && gastro.enteralTolerance !== 'Não informada') entParts.push(`tolerância: ${gastro.enteralTolerance.toLowerCase()}`);
        if (entParts.length > 0) nutStr += ` (${entParts.join(', ')})`;
        p4FactIds.push('nurse-evo-nut-enteral-route', 'nurse-evo-nut-enteral-rate', 'nurse-evo-nut-enteral-tolerance');
      }
      p4Sentences.push(formatSentence(nutStr));
    }
  }

  // Eliminações
  const elim = form.eliminations;
  if (elim) {
    const eList: string[] = [];
    if (elim.diuresis && elim.diuresis !== 'Não informado' && elim.diuresis !== 'Não avaliada') {
      const rStr = elim.urinaryRoute ? ` via ${elim.urinaryRoute.toLowerCase()}` : '';
      const vStr = elim.urineVolume ? ` (débito ${elim.urineVolume} mL)` : '';
      const aStr = elim.urineAspect ? ` de aspecto ${elim.urineAspect.toLowerCase()}` : '';
      eList.push(`diurese ${elim.diuresis.toLowerCase()}${rStr}${vStr}${aStr}`);
      p4FactIds.push('nurse-evo-elim-diuresis', 'nurse-evo-elim-urinary-route');
    }
    if (elim.bowelElimination && elim.bowelElimination !== 'Não informado' && elim.bowelElimination !== 'Não avaliadas') {
      const cStr = elim.bowelElimination === 'Presentes' && elim.bowelConsistency ? ` (${elim.bowelConsistency.toLowerCase()})` : '';
      const fStr = elim.bowelFrequency ? ` frequência: ${elim.bowelFrequency}` : '';
      eList.push(`eliminações intestinais ${elim.bowelElimination.toLowerCase()}${cStr}${fStr}`);
      p4FactIds.push('nurse-evo-elim-bowel');
    }
    if (eList.length > 0) {
      p4Sentences.push(formatSentence(`Eliminações: ${joinWithAnd(eList)}`));
    }
  }

  // Tegumentar
  const skin = form.skin;
  if (skin) {
    const sList: string[] = [];
    if (skin.integrity === 'Íntegra') {
      sList.push('pele íntegra');
      p4FactIds.push('nurse-evo-skin-integrity');
    } else if (skin.integrity === 'Com alteração/lesão') {
      let lesStr = 'integridade cutânea prejudicada com lesão';
      p4FactIds.push('nurse-evo-skin-integrity');
      if (skin.lesionLocation) {
        lesStr += ` em ${skin.lesionLocation}`;
        p4FactIds.push('nurse-evo-skin-lesion-loc');
      }
      if (skin.lesionDescription) {
        lesStr += ` (${skin.lesionDescription})`;
        p4FactIds.push('nurse-evo-skin-lesion-desc');
      }
      if (skin.lesionDressing) {
        lesStr += `, curativo: ${skin.lesionDressing}`;
        p4FactIds.push('nurse-evo-skin-lesion-dressing');
      }
      sList.push(lesStr);
    }
    if (skin.hydration && skin.hydration !== 'Não avaliada') {
      const hydStr = skin.hydration === 'Outra' && skin.customHydration ? skin.customHydration : skin.hydration;
      sList.push(`hidratação ${hydStr.toLowerCase()}`);
      p4FactIds.push('nurse-evo-skin-hydration');
    }
    if (skin.coloration && skin.coloration !== 'Não avaliada') {
      const colStr = skin.coloration === 'Outra' && skin.customColoration ? skin.customColoration : skin.coloration;
      sList.push(`coloração ${colStr.toLowerCase()}`);
      p4FactIds.push('nurse-evo-skin-coloration');
    }
    if (sList.length > 0) {
      p4Sentences.push(formatSentence(`Tecido tegumentar: ${joinWithAnd(sList)}`));
    }
  }

  if (p4Sentences.length > 0) {
    paragraphs.push({
      text: p4Sentences.join(' '),
      factIds: Array.from(new Set(p4FactIds)),
    });
  }

  // ==========================================
  // PARÁGRAFO 5: Dispositivos, Mobilidade/Segurança, Terapias em Infusão e Cuidados Realizados
  // ==========================================
  const p5Sentences: string[] = [];
  const p5FactIds: string[] = [];

  // Dispositivos
  const devList = form.devices?.list?.filter((d) => d.type?.trim() || d.location?.trim()) || [];
  if (devList.length > 0) {
    if (devList.length === 2 && haveIdenticalDeviceStatus(devList[0], devList[1])) {
      const d1Loc = devList[0].location || 'sítio informado';
      const d2Loc = devList[1].location || 'sítio informado';
      const statusStr = buildDeviceStatusDescription(devList[0], true);
      p5Sentences.push(
        formatSentence(`Mantém ${devList[0].type} em ${d1Loc} e ${devList[1].type} em ${d2Loc}${statusStr ? `, ${statusStr}` : ''}`)
      );
      p5FactIds.push('nurse-evo-dev-0', 'nurse-evo-dev-1');
    } else {
      devList.forEach((dev, idx) => {
        const name = dev.type || 'Dispositivo';
        const loc = dev.location ? ` em ${dev.location}` : '';
        const statusStr = buildDeviceStatusDescription(dev, false);
        p5Sentences.push(formatSentence(`Mantém ${name}${loc}${statusStr ? `, ${statusStr}` : ''}`));
        p5FactIds.push(`nurse-evo-dev-${idx}`);
      });
    }
  }

  // Mobilidade e Segurança
  const mob = form.mobilityAndSafety;
  if (mob) {
    const mList: string[] = [];
    if (mob.mobility && mob.mobility !== 'Não avaliado') {
      const mobStr = mob.mobility === 'Outro' && mob.customMobility ? mob.customMobility : mob.mobility;
      mList.push(mobStr.toLowerCase());
      p5FactIds.push('nurse-evo-mob-mobility');
    }
    if (mob.repositioning === 'Realizada') {
      mList.push(mob.repositioningInterval ? `mudança de decúbito realizada (${mob.repositioningInterval})` : 'mudança de decúbito realizada');
      p5FactIds.push('nurse-evo-mob-repositioning');
    }
    if (mob.bedRails === 'Elevadas') {
      mList.push('grades do leito elevadas');
      p5FactIds.push('nurse-evo-safety-rails');
    }
    if (mob.headOfBed === 'Elevada') {
      mList.push(mob.headOfBedAngle ? `cabeceira elevada a ${mob.headOfBedAngle}` : 'cabeceira elevada');
      p5FactIds.push('nurse-evo-safety-head-of-bed');
    }
    if (mList.length > 0) {
      p5Sentences.push(formatSentence(`Mobilidade e segurança: ${joinWithAnd(mList)}`));
    }
  }

  // Terapias e infusões
  const ther = form.therapiesAndInfusions;
  if (ther) {
    if (ther.vasoactiveDrugsInUse === 'Sim' && ther.vasoactiveDrugsList && ther.vasoactiveDrugsList.length > 0) {
      const dvaStrs = ther.vasoactiveDrugsList.map((d, idx) => {
        p5FactIds.push(`nurse-evo-dva-${idx}`);
        return `${d.medication} (${d.doseOrRate} ${d.unit}${d.route ? ` via ${d.route}` : ''})`;
      });
      p5Sentences.push(formatSentence(`Droga(s) vasoativa(s) em infusão contínua: ${joinWithAnd(dvaStrs)}`));
    } else if (ther.vasoactiveDrugsInUse === 'Não') {
      p5Sentences.push('Sem drogas vasoativas em infusão contínua.');
      p5FactIds.push('nurse-evo-dva-status');
    }

    if (ther.sedationAnalgesiaInUse === 'Sim' && ther.sedationAnalgesiaList && ther.sedationAnalgesiaList.length > 0) {
      const sedStrs = ther.sedationAnalgesiaList.map((s, idx) => {
        p5FactIds.push(`nurse-evo-sed-${idx}`);
        return `${s.medication} (${s.doseOrRate} ${s.unit}${s.route ? ` via ${s.route}` : ''})`;
      });
      p5Sentences.push(formatSentence(`Sedação/analgesia contínua em infusão: ${joinWithAnd(sedStrs)}`));
    } else if (ther.sedationAnalgesiaInUse === 'Não') {
      p5Sentences.push('Sem sedação contínua em infusão.');
      p5FactIds.push('nurse-evo-sed-status');
    }

    if (ther.otherInfusionsInUse === 'Sim' && ther.otherInfusionsList && ther.otherInfusionsList.length > 0) {
      const infStrs = ther.otherInfusionsList.map((i, idx) => {
        p5FactIds.push(`nurse-evo-inf-${idx}`);
        return `${i.substance} (${i.doseOrRate} ${i.unit}${i.route ? ` via ${i.route}` : ''})`;
      });
      p5Sentences.push(formatSentence(`Outras infusões contínuas: ${joinWithAnd(infStrs)}`));
    }
  }

  // Cuidados e intervenções de enfermagem
  const care = form.careDone;
  if (care?.careItems && care.careItems.length > 0) {
    care.careItems.forEach((_, idx) => p5FactIds.push(`nurse-evo-care-${idx}`));
    p5Sentences.push(formatSentence(`Cuidados e intervenções de enfermagem executadas: ${joinWithAnd(care.careItems.map((c) => c.toLowerCase()))}`));
  }
  if (care?.customCareDetails?.trim()) {
    p5Sentences.push(formatSentence(`Intervenções complementares: ${care.customCareDetails.trim()}`));
    p5FactIds.push('nurse-evo-care-custom');
  }

  if (p5Sentences.length > 0) {
    paragraphs.push({
      text: p5Sentences.join(' '),
      factIds: Array.from(new Set(p5FactIds)),
    });
  }

  // ==========================================
  // PARÁGRAFO 6: Riscos, Intercorrências, Comunicação, Resposta, Evolução e Situação Atual
  // ==========================================
  const p6Sentences: string[] = [];
  const p6FactIds: string[] = [];

  // Riscos
  const risk = form.riskAssessment;
  if (risk) {
    const rList: string[] = [];
    if (risk.fallRiskStatus === 'Avaliado') {
      const scaleStr = risk.fallRiskScale ? `escala ${risk.fallRiskScale}` : '';
      const scStr = risk.fallRiskScore ? `escore ${risk.fallRiskScore}` : '';
      const clStr = risk.fallRiskClassification ? `classificação: ${risk.fallRiskClassification}` : '';
      const full = [scaleStr, scStr, clStr].filter(Boolean).join(', ');
      rList.push(`risco de queda: ${full || 'avaliado'}`);
      p6FactIds.push('nurse-evo-risk-fall');
    }
    if (risk.pressureInjuryRiskStatus === 'Avaliado') {
      const scaleStr = risk.pressureInjuryScale ? `escala ${risk.pressureInjuryScale}` : '';
      const scStr = risk.pressureInjuryScore ? `escore ${risk.pressureInjuryScore}` : '';
      const clStr = risk.pressureInjuryClassification ? `classificação: ${risk.pressureInjuryClassification}` : '';
      const full = [scaleStr, scStr, clStr].filter(Boolean).join(', ');
      rList.push(`risco de lesão por pressão: ${full || 'avaliado'}`);
      p6FactIds.push('nurse-evo-risk-lpp');
    }
    if (risk.aspirationRiskStatus && risk.aspirationRiskStatus !== 'Não avaliado') {
      const aspStr = risk.aspirationRiskStatus === 'Outra descrição' && risk.customAspirationRisk ? risk.customAspirationRisk : risk.aspirationRiskStatus;
      rList.push(`risco de broncoaspiração: ${aspStr.toLowerCase()}`);
      p6FactIds.push('nurse-evo-risk-aspiration');
    }
    if (rList.length > 0) {
      p6Sentences.push(formatSentence(`Avaliação de riscos assistenciais: ${joinWithAnd(rList)}`));
    }
  }

  // Intercorrências
  const comp = form.complications;
  if (comp) {
    if (comp.hasComplication === 'Não') {
      p6Sentences.push('Sem intercorrências registradas no período.');
      p6FactIds.push('nurse-evo-comp-status');
    } else if (comp.hasComplication === 'Sim' && comp.description) {
      const tm = comp.time ? `Às ${comp.time}, ` : '';
      p6Sentences.push(formatSentence(`${tm}intercorrência registrada: ${comp.description}`));
      p6FactIds.push('nurse-evo-comp-desc');
      if (comp.interventionDone) {
        p6Sentences.push(formatSentence(`Conduta imediata de enfermagem: ${comp.interventionDone}`));
        p6FactIds.push('nurse-evo-comp-intervention');
      }
      if (comp.responseObserved) {
        p6Sentences.push(formatSentence(`Resposta observada: ${comp.responseObserved}`));
        p6FactIds.push('nurse-evo-comp-response');
      }
      if (comp.communicationDone) {
        const cTm = comp.communicationTime ? ` às ${comp.communicationTime}` : '';
        p6Sentences.push(formatSentence(`Comunicação da intercorrência: ${comp.communicationDone}${cTm}`));
        p6FactIds.push('nurse-evo-comp-comm');
      }
    }
  }

  // Comunicação
  const comm = form.communication;
  if (comm?.hasCommunication === 'Sim') {
    const tgt = comm.target === 'Outro' && comm.customTarget ? comm.customTarget : comm.target || 'equipe assistencial';
    const rsn = comm.reason ? ` - Motivo: ${comm.reason}` : '';
    const tm = comm.time ? ` às ${comm.time}` : '';
    const resp = comm.responseObserved ? ` - Retorno/resposta: ${comm.responseObserved}` : '';
    p6Sentences.push(formatSentence(`Comunicação realizada com ${tgt}${rsn}${tm}${resp}`));
    p6FactIds.push('nurse-evo-comm-target');
  }

  // Resposta aos cuidados
  const respCare = form.responseToCare;
  if (respCare?.evaluated === 'Sim' && respCare.structuredResponseText) {
    p6Sentences.push(formatSentence(`Resposta aos cuidados e intervenções de enfermagem: ${respCare.structuredResponseText.trim()}`));
    p6FactIds.push('nurse-evo-resp-care-text');
  }

  // Evolução e Situação Atual
  const evo = form.evolutionState;
  if (evo) {
    if (evo.statusChange && evo.statusChange !== 'Não informado') {
      const chgStr = evo.changeDescription ? `${evo.statusChange}: ${evo.changeDescription}` : evo.statusChange;
      p6Sentences.push(formatSentence(`Evolução em relação à avaliação anterior: ${chgStr}`));
      p6FactIds.push('nurse-evo-state-change');
    }
    if (evo.nursingSynthesis && evo.nursingSynthesis.trim()) {
      p6Sentences.push(formatSentence(`Síntese da avaliação de enfermagem: ${evo.nursingSynthesis.trim()}`));
      p6FactIds.push('nurse-evo-synthesis');
    }
    if (evo.currentStatus && evo.currentStatus !== 'Não informado') {
      const curStr = evo.currentStatus === 'Outra' && evo.customCurrentStatus ? evo.customCurrentStatus : evo.currentStatus;
      p6Sentences.push(formatSentence(curStr));
      p6FactIds.push('nurse-evo-current-status');
    }
  }

  if (p6Sentences.length > 0) {
    paragraphs.push({
      text: p6Sentences.join(' '),
      factIds: Array.from(new Set(p6FactIds)),
    });
  }

  if (paragraphs.length === 0) {
    return {
      narrative: 'Nenhum dado clínico registrado para a evolução de enfermagem.',
      paragraphs: [],
    };
  }

  const narrative = paragraphs.map((p) => p.text).join('\n\n');
  return { narrative, paragraphs };
}

/**
 * Builds the canonical deterministic string for Nurse Evolution.
 */
export function buildNurseEvolutionNote(rawForm: Partial<NurseEvolutionForm>): string {
  const result = buildNurseEvolutionStructuredNarrative(rawForm);
  return result.narrative;
}
