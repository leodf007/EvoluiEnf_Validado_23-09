import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { TechnicianICUNursingNoteForm } from '../types/icuClinical';
import { buildAuthorizedICUFacts } from './icuClinicalFactBuilder';
import { NarrativeFactTrace, auditDeterministicNarrative } from './deterministicNarrativeFactAuditor';

function formatSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return capitalized.endsWith('.') ? capitalized : `${capitalized}.`;
}

function joinWithAnd(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

function findFact(facts: ClinicalFact[] | undefined, id: string): ClinicalFact | undefined {
  return facts?.find((f) => f.id === id);
}

function hasFact(facts: ClinicalFact[] | undefined, id: string): boolean {
  return !!findFact(facts, id);
}

/**
 * Builds the deterministic ICU Technician nursing note narrative with full fact traceability.
 * STRICT ARCHITECTURAL RULE:
 * This builder strictly consumes AuthorizedClinicalFacts, ensuring no narrative without an authorized fact.
 */
export function buildTechnicianICUNursingNoteWithTrace(
  authorizedFacts: AuthorizedClinicalFacts
): { narrative: string; traces: NarrativeFactTrace[] } {
  const traces: NarrativeFactTrace[] = [];

  // ==========================================
  // PARÁGRAFO 1: Contexto, Identificação, Alergias e Precaução
  // ==========================================
  const ctxFacts = authorizedFacts.context || [];
  const momentFact = findFact(ctxFacts, 'icu-ctx-moment');
  const accFact = findFact(ctxFacts, 'icu-ctx-accompaniment');

  if (momentFact) {
    let intro = `${momentFact.value} em UTI`;
    const introIds = [momentFact.id];
    if (accFact) {
      introIds.push(accFact.id);
      if (accFact.value.toLowerCase() !== 'desacompanhado') {
        intro += `, acompanhado por ${accFact.value.toLowerCase()}`;
      } else {
        intro += ', desacompanhado';
      }
    }
    traces.push({
      text: formatSentence(intro),
      factIds: introIds,
      category: 'context',
    });
  }

  const wristFact = findFact(ctxFacts, 'icu-ctx-wristband');
  const bedSignFact = findFact(ctxFacts, 'icu-ctx-bedsign');
  const idChecks: string[] = [];
  const idFactIds: string[] = [];
  if (wristFact && wristFact.value === 'Sim') {
    idChecks.push('pulseira');
    idFactIds.push(wristFact.id);
  }
  if (bedSignFact && bedSignFact.value === 'Sim') {
    idChecks.push('placa do leito');
    idFactIds.push(bedSignFact.id);
  }
  if (idChecks.length > 0) {
    traces.push({
      text: `Identificação conferida por ${joinWithAnd(idChecks)}.`,
      factIds: idFactIds,
      category: 'context',
    });
  }

  const allFact = findFact(ctxFacts, 'icu-ctx-allergies');
  if (allFact) {
    const text = allFact.value.startsWith('Sim')
      ? `Alergias referidas${allFact.value.replace(/^Sim:?/, ':')}.`
      : 'Sem alergias referidas.';
    traces.push({
      text: formatSentence(text),
      factIds: [allFact.id],
      category: 'context',
    });
  }

  const precFact = findFact(ctxFacts, 'icu-ctx-precaution');
  if (precFact) {
    traces.push({
      text: `Precaução ${precFact.value.toLowerCase()} mantida.`,
      factIds: [precFact.id],
      category: 'context',
    });
  }

  // ==========================================
  // PARÁGRAFO 2: Condição Observada, Comportamento e Queixas
  // ==========================================
  const condFacts = authorizedFacts.generalAssessment || [];
  const behavFact = findFact(condFacts, 'icu-cond-behavior');
  if (behavFact) {
    traces.push({
      text: formatSentence(`Apresenta-se ${behavFact.value.toLowerCase()}`),
      factIds: [behavFact.id],
      category: 'generalAssessment',
    });
  }

  const compFact = findFact(condFacts, 'icu-cond-complaints');
  if (compFact) {
    let compText = '';
    if (compFact.value.startsWith('Sem queixas')) {
      compText = 'Sem queixas referidas no momento.';
    } else if (compFact.value.startsWith('Impossibilitado')) {
      compText = 'Paciente impossibilitado de informar queixas verbais.';
    } else {
      compText = `Queixa referida: ${compFact.value.replace(/^Com queixa:?/, '').trim()}`;
    }
    traces.push({
      text: formatSentence(compText),
      factIds: [compFact.id],
      category: 'generalAssessment',
    });
  }

  // ==========================================
  // PARÁGRAFO 3: Sinais Vitais, PAM e Dor
  // ==========================================
  const vsFacts = authorizedFacts.vitalSigns || [];
  const vsItems: string[] = [];
  const vsIds: string[] = [];

  const bpFact = findFact(vsFacts, 'vs-blood-pressure') || findFact(vsFacts, 'vs-systolic');
  if (bpFact) {
    vsItems.push(`PA ${bpFact.value}`);
    vsIds.push(bpFact.id);
  }

  const mapFact = findFact(vsFacts, 'vs-map');
  if (mapFact) {
    vsItems.push(`PAM ${mapFact.value}`);
    vsIds.push(mapFact.id);
  }

  const hrFact = findFact(vsFacts, 'vs-heart-rate');
  if (hrFact) {
    vsItems.push(`FC ${hrFact.value}`);
    vsIds.push(hrFact.id);
  }

  const rrFact = findFact(vsFacts, 'vs-respiratory-rate');
  if (rrFact) {
    vsItems.push(`FR ${rrFact.value}`);
    vsIds.push(rrFact.id);
  }

  const spo2Fact = findFact(vsFacts, 'vs-spo2');
  if (spo2Fact) {
    vsItems.push(`SpO₂ ${spo2Fact.value}`);
    vsIds.push(spo2Fact.id);
  }

  const tempFact = findFact(vsFacts, 'vs-temperature');
  if (tempFact) {
    vsItems.push(`temperatura ${tempFact.value}`);
    vsIds.push(tempFact.id);
  }

  const gluFact = findFact(vsFacts, 'vs-glucose');
  if (gluFact) {
    vsItems.push(`glicemia capilar ${gluFact.value}`);
    vsIds.push(gluFact.id);
  }

  if (vsItems.length > 0) {
    traces.push({
      text: `Sinais vitais aferidos no momento: ${joinWithAnd(vsItems)}.`,
      factIds: vsIds,
      category: 'vitalSigns',
    });
  }

  const painNumeric = findFact(vsFacts, 'icu-pain-numeric');
  const painOther = findFact(vsFacts, 'icu-pain-other');
  const painUnassessed = findFact(vsFacts, 'icu-pain-unassessed');
  const painNone = findFact(vsFacts, 'icu-pain-none');

  if (painNumeric) {
    traces.push({
      text: `Dor avaliada em ${painNumeric.value} em escala numérica.`,
      factIds: [painNumeric.id],
      category: 'vitalSigns',
    });
  } else if (painOther) {
    traces.push({
      text: `Avaliação de dor: ${painOther.value}.`,
      factIds: [painOther.id],
      category: 'vitalSigns',
    });
  } else if (painUnassessed) {
    traces.push({
      text: 'Dor não avaliável.',
      factIds: [painUnassessed.id],
      category: 'vitalSigns',
    });
  } else if (painNone) {
    traces.push({
      text: 'Sem dor referida.',
      factIds: [painNone.id],
      category: 'vitalSigns',
    });
  }

  // ==========================================
  // PARÁGRAFO 4: Neurológico e Sedação
  // ==========================================
  const neuroFacts = authorizedFacts.neurological || [];
  const neuroExamParts: string[] = [];
  const neuroExamIds: string[] = [];

  const cFact = findFact(neuroFacts, 'icu-neuro-consciousness');
  if (cFact) {
    neuroExamParts.push(cFact.value.toLowerCase());
    neuroExamIds.push(cFact.id);
  }

  const oFact = findFact(neuroFacts, 'icu-neuro-orientation');
  if (oFact) {
    neuroExamParts.push(oFact.value.toLowerCase());
    neuroExamIds.push(oFact.id);
  }

  if (neuroExamParts.length > 0) {
    traces.push({
      text: formatSentence(`Ao exame neurológico: ${joinWithAnd(neuroExamParts)}`),
      factIds: neuroExamIds,
      category: 'neurological',
    });
  }

  const glasgowFact = findFact(neuroFacts, 'icu-neuro-glasgow');
  if (glasgowFact) {
    traces.push({
      text: `Escala de Coma de Glasgow: ${glasgowFact.value}.`,
      factIds: [glasgowFact.id],
      category: 'neurological',
    });
  }

  const rassFact = findFact(neuroFacts, 'icu-neuro-rass');
  if (rassFact) {
    traces.push({
      text: `Escala RASS: ${rassFact.value}.`,
      factIds: [rassFact.id],
      category: 'neurological',
    });
  }

  const pupFact = findFact(neuroFacts, 'icu-neuro-pupils');
  const phFact = findFact(neuroFacts, 'icu-neuro-photoreaction');
  const pupParts: string[] = [];
  const pupIds: string[] = [];
  if (pupFact) {
    pupParts.push(`pupilas ${pupFact.value.toLowerCase()}`);
    pupIds.push(pupFact.id);
  }
  if (phFact) {
    pupParts.push(`fotorreação ${phFact.value.toLowerCase()}`);
    pupIds.push(phFact.id);
  }
  if (pupParts.length > 0) {
    traces.push({
      text: formatSentence(joinWithAnd(pupParts)),
      factIds: pupIds,
      category: 'neurological',
    });
  }

  // ==========================================
  // PARÁGRAFO 5: Respiratório, Ventilação e Vias Aéreas
  // ==========================================
  const respFacts = authorizedFacts.respiratory || [];
  const respSupp = findFact(respFacts, 'icu-resp-support');

  if (respSupp) {
    if (respSupp.value === 'Ar ambiente') {
      traces.push({
        text: 'Mantém respiração espontânea em ar ambiente.',
        factIds: [respSupp.id],
        category: 'respiratory',
      });
    } else if (respSupp.value === 'Oxigenoterapia') {
      const devFact = findFact(respFacts, 'icu-resp-ox-device');
      const flowFact = findFact(respFacts, 'icu-resp-ox-flow');
      const fio2Fact = findFact(respFacts, 'icu-resp-ox-fio2');
      const oxIds = [respSupp.id];
      const oxParts: string[] = [];
      if (devFact) {
        oxParts.push(`sob ${devFact.value.toLowerCase()}`);
        oxIds.push(devFact.id);
      }
      if (flowFact) {
        oxParts.push(`a ${flowFact.value}`);
        oxIds.push(flowFact.id);
      }
      if (fio2Fact) {
        oxParts.push(`(FiO₂ ${fio2Fact.value})`);
        oxIds.push(fio2Fact.id);
      }
      const oxDetails = oxParts.length > 0 ? ` ${oxParts.join(' ')}` : '';
      traces.push({
        text: formatSentence(`Em oxigenoterapia${oxDetails}`),
        factIds: oxIds,
        category: 'respiratory',
      });
    } else if (respSupp.value === 'VNI') {
      traces.push({
        text: 'Em ventilação não invasiva (VNI).',
        factIds: [respSupp.id],
        category: 'respiratory',
      });
    } else if (respSupp.value === 'Ventilação mecânica invasiva') {
      const airwayFact = findFact(respFacts, 'icu-resp-vmi-airway');
      const modeFact = findFact(respFacts, 'icu-resp-vmi-mode');
      const fio2Fact = findFact(respFacts, 'icu-resp-vmi-fio2');
      const peepFact = findFact(respFacts, 'icu-resp-vmi-peep');
      const rateFact = findFact(respFacts, 'icu-resp-vmi-rate');
      const volFact = findFact(respFacts, 'icu-resp-vmi-volume');
      const psFact = findFact(respFacts, 'icu-resp-vmi-ps');
      const pinspFact = findFact(respFacts, 'icu-resp-vmi-pinsp');

      const vmiIds = [respSupp.id];
      let airwayStr = '';
      if (airwayFact) {
        airwayStr = ` por ${airwayFact.value}`;
        vmiIds.push(airwayFact.id);
      }

      const params: string[] = [];
      if (modeFact) { params.push(`modo ${modeFact.value}`); vmiIds.push(modeFact.id); }
      if (fio2Fact) { params.push(`FiO₂ ${fio2Fact.value}`); vmiIds.push(fio2Fact.id); }
      if (peepFact) { params.push(`PEEP ${peepFact.value}`); vmiIds.push(peepFact.id); }
      if (rateFact) { params.push(`FR ${rateFact.value}`); vmiIds.push(rateFact.id); }
      if (volFact) { params.push(`VC ${volFact.value}`); vmiIds.push(volFact.id); }
      if (psFact) { params.push(`PS ${psFact.value}`); vmiIds.push(psFact.id); }
      if (pinspFact) { params.push(`Pinsp ${pinspFact.value}`); vmiIds.push(pinspFact.id); }

      const paramStr = params.length > 0 ? `, ${joinWithAnd(params)}` : '';
      traces.push({
        text: formatSentence(`Mantém ventilação mecânica invasiva${airwayStr}${paramStr}`),
        factIds: vmiIds,
        category: 'respiratory',
      });
    } else if (respSupp.value === 'Traqueostomia sem ventilação mecânica') {
      traces.push({
        text: 'Em traqueostomia sem ventilação mecânica.',
        factIds: [respSupp.id],
        category: 'respiratory',
      });
    }
  }

  const totFact = findFact(respFacts, 'icu-resp-tot-details');
  if (totFact) {
    traces.push({
      text: formatSentence(`Tubo orotraqueal: ${totFact.value}`),
      factIds: [totFact.id],
      category: 'respiratory',
    });
  }

  const tqtFact = findFact(respFacts, 'icu-resp-tqt-details');
  if (tqtFact) {
    traces.push({
      text: formatSentence(`Traqueostomia: ${tqtFact.value}`),
      factIds: [tqtFact.id],
      category: 'respiratory',
    });
  }

  // Padrão e desconforto
  const patFact = findFact(respFacts, 'icu-resp-pattern');
  const distFact = findFact(respFacts, 'icu-resp-distress');
  const accMuscFact = findFact(respFacts, 'icu-resp-accessory-muscles');
  const patList: string[] = [];
  const patIds: string[] = [];
  if (patFact) {
    patList.push(`padrão ${patFact.value.toLowerCase()}`);
    patIds.push(patFact.id);
  }
  if (distFact) {
    patList.push(distFact.canonicalText);
    patIds.push(distFact.id);
  }
  if (accMuscFact && accMuscFact.value === 'Presente') {
    patList.push('com uso de musculatura acessória');
    patIds.push(accMuscFact.id);
  }
  if (patList.length > 0) {
    traces.push({
      text: formatSentence(joinWithAnd(patList)),
      factIds: patIds,
      category: 'respiratory',
    });
  }

  const secrFact = findFact(respFacts, 'icu-resp-secretions');
  if (secrFact) {
    traces.push({
      text: formatSentence(secrFact.canonicalText),
      factIds: [secrFact.id],
      category: 'respiratory',
    });
  }

  // ==========================================
  // PARÁGRAFO 6: Cardiovascular, Perfusão e Monitorização Invasiva
  // ==========================================
  const cardioFacts = authorizedFacts.cardiovascular || [];
  const cList: string[] = [];
  const cIds: string[] = [];

  const perfFact = findFact(cardioFacts, 'icu-cardio-perfusion');
  if (perfFact) {
    cList.push(`perfusão periférica ${perfFact.value.toLowerCase()}`);
    cIds.push(perfFact.id);
  }

  const extFact = findFact(cardioFacts, 'icu-cardio-extremities');
  if (extFact) {
    cList.push(`extremidades ${extFact.value.toLowerCase()}`);
    cIds.push(extFact.id);
  }

  const tecFact = findFact(cardioFacts, 'icu-cardio-tec');
  if (tecFact) {
    cList.push(tecFact.value);
    cIds.push(tecFact.id);
  }

  const edemaFact = findFact(cardioFacts, 'icu-cardio-edema');
  if (edemaFact) {
    cList.push(edemaFact.value === 'Ausente' ? 'sem edema' : `edema presente (${edemaFact.value})`);
    cIds.push(edemaFact.id);
  }

  if (cList.length > 0) {
    traces.push({
      text: formatSentence(`Avaliação periférica: ${joinWithAnd(cList)}`),
      factIds: cIds,
      category: 'cardiovascular',
    });
  }

  const paiFact = findFact(cardioFacts, 'icu-cardio-pai');
  const pvcFact = findFact(cardioFacts, 'icu-cardio-pvc');
  const invList: string[] = [];
  const invIds: string[] = [];
  if (paiFact) {
    invList.push(`PAI ${paiFact.value}`);
    invIds.push(paiFact.id);
  }
  if (pvcFact) {
    invList.push(`PVC ${pvcFact.value}`);
    invIds.push(pvcFact.id);
  }
  if (invList.length > 0) {
    traces.push({
      text: `Monitorização hemodinâmica invasiva: ${joinWithAnd(invList)}.`,
      factIds: invIds,
      category: 'cardiovascular',
    });
  }

  // ==========================================
  // PARÁGRAFO 7: Drogas Vasoativas
  // ==========================================
  const dvaFacts = authorizedFacts.vasoactiveDrugs || [];
  const dvaInUse = findFact(dvaFacts, 'icu-dva-inuse');
  const dvaItems = dvaFacts.filter((f) => f.id.startsWith('icu-dva-item-'));

  if (dvaItems.length > 0) {
    const dStrs = dvaItems.map((f) => f.value);
    const dIds = dvaItems.map((f) => f.id);
    if (dvaInUse) dIds.push(dvaInUse.id);
    traces.push({
      text: formatSentence(`Em uso de drogas vasoativas em bomba de infusão contínua: ${joinWithAnd(dStrs)}`),
      factIds: dIds,
      category: 'vasoactiveDrugs',
    });
  } else if (dvaInUse && dvaInUse.value === 'Não') {
    traces.push({
      text: 'Sem drogas vasoativas em uso no momento.',
      factIds: [dvaInUse.id],
      category: 'vasoactiveDrugs',
    });
  }

  // ==========================================
  // PARÁGRAFO 8: Sedação e Analgesia em Infusão Contínua
  // ==========================================
  const sedFacts = authorizedFacts.sedationAndAnalgesia || [];
  const sedInUse = findFact(sedFacts, 'icu-sed-inuse');
  const sedItems = sedFacts.filter((f) => f.id.startsWith('icu-sed-item-'));

  if (sedItems.length > 0) {
    const sStrs = sedItems.map((f) => f.value);
    const sIds = sedItems.map((f) => f.id);
    if (sedInUse) sIds.push(sedInUse.id);
    traces.push({
      text: formatSentence(`Em infusão contínua de sedação/analgesia: ${joinWithAnd(sStrs)}`),
      factIds: sIds,
      category: 'sedationAndAnalgesia',
    });
  } else if (sedInUse && sedInUse.value === 'Não') {
    traces.push({
      text: 'Sem infusão contínua de sedação ou analgesia no momento.',
      factIds: [sedInUse.id],
      category: 'sedationAndAnalgesia',
    });
  }

  // ==========================================
  // PARÁGRAFO 9: Nutrição e Gastrointestinal
  // ==========================================
  const nutFacts = authorizedFacts.nutrition || [];
  const nutStatus = findFact(nutFacts, 'icu-nut-status');

  if (nutStatus) {
    if (nutStatus.value === 'Via oral') {
      const accFact = findFact(nutFacts, 'icu-nut-oral-acceptance');
      const oralIds = [nutStatus.id];
      let accStr = '';
      if (accFact) {
        accStr = ` com ${accFact.value.toLowerCase()} aceitação`;
        oralIds.push(accFact.id);
      }
      traces.push({
        text: formatSentence(`Em dieta por via oral${accStr}`),
        factIds: oralIds,
        category: 'nutrition',
      });
    } else if (nutStatus.value === 'Dieta enteral') {
      const routeFact = findFact(nutFacts, 'icu-nut-enteral-route');
      const rateFact = findFact(nutFacts, 'icu-nut-enteral-rate');
      const tolFact = findFact(nutFacts, 'icu-nut-enteral-tolerance');
      const pausedFact = findFact(nutFacts, 'icu-nut-enteral-paused');

      const entIds = [nutStatus.id];
      const rStr = routeFact ? ` por ${routeFact.value}` : '';
      if (routeFact) entIds.push(routeFact.id);
      const rateStr = rateFact ? ` a ${rateFact.value}` : '';
      if (rateFact) entIds.push(rateFact.id);
      const tolStr = tolFact ? `, apresentando ${tolFact.value.toLowerCase()}` : '';
      if (tolFact) entIds.push(tolFact.id);
      const pStr = pausedFact ? ', dieta pausada temporariamente no período' : '';
      if (pausedFact) entIds.push(pausedFact.id);

      traces.push({
        text: formatSentence(`Em dieta enteral${rStr}${rateStr}${tolStr}${pStr}`),
        factIds: entIds,
        category: 'nutrition',
      });
    } else if (nutStatus.value === 'Dieta parenteral') {
      traces.push({
        text: 'Em nutrição parenteral total (NPT).',
        factIds: [nutStatus.id],
        category: 'nutrition',
      });
    } else if (nutStatus.value === 'Jejum') {
      traces.push({
        text: 'Mantém jejum no período.',
        factIds: [nutStatus.id],
        category: 'nutrition',
      });
    }
  }

  const abdInsp = findFact(nutFacts, 'icu-nut-abdomen-insp');
  const abdCons = findFact(nutFacts, 'icu-nut-abdomen-cons');
  const abdPalp = findFact(nutFacts, 'icu-nut-abdomen-palp');
  const abdBowel = findFact(nutFacts, 'icu-nut-bowel-sounds');
  const abdParts: string[] = [];
  const abdIds: string[] = [];
  if (abdInsp) { abdParts.push(`abdome ${abdInsp.value.toLowerCase()}`); abdIds.push(abdInsp.id); }
  if (abdCons) { abdParts.push(abdCons.value.toLowerCase()); abdIds.push(abdCons.id); }
  if (abdPalp) { abdParts.push(`palpação ${abdPalp.value.toLowerCase()}`); abdIds.push(abdPalp.id); }
  if (abdBowel) { abdParts.push(`ruídos hidroaéreos ${abdBowel.value.toLowerCase()}`); abdIds.push(abdBowel.id); }
  if (abdParts.length > 0) {
    traces.push({
      text: formatSentence(`Exame abdominal: ${joinWithAnd(abdParts)}`),
      factIds: abdIds,
      category: 'nutrition',
    });
  }

  // ==========================================
  // PARÁGRAFO 10: Eliminações e Balanço Hídrico
  // ==========================================
  const elimFacts = authorizedFacts.elimination || [];
  const diurFact = findFact(elimFacts, 'icu-elim-diuresis');
  const routeFact = findFact(elimFacts, 'icu-elim-urinary-route');
  if (diurFact) {
    traces.push({
      text: formatSentence(`Diurese ${diurFact.value.toLowerCase()}`),
      factIds: [diurFact.id],
      category: 'elimination',
    });
  } else if (routeFact) {
    traces.push({
      text: formatSentence(`Via urinária: ${routeFact.value}`),
      factIds: [routeFact.id],
      category: 'elimination',
    });
  }

  const bowelFact = findFact(elimFacts, 'icu-elim-bowel');
  if (bowelFact) {
    const text = bowelFact.value.startsWith('Ausente')
      ? 'Sem eliminações intestinais no período.'
      : formatSentence(`Eliminações intestinais presentes (${bowelFact.value})`);
    traces.push({
      text,
      factIds: [bowelFact.id],
      category: 'elimination',
    });
  }

  const fbIn = findFact(elimFacts, 'icu-elim-fluid-intake');
  const fbOut = findFact(elimFacts, 'icu-elim-fluid-output');
  const fbRes = findFact(elimFacts, 'icu-elim-fluid-balance');
  const fbParts: string[] = [];
  const fbIds: string[] = [];
  if (fbIn) { fbParts.push(`entradas totais de ${fbIn.value}`); fbIds.push(fbIn.id); }
  if (fbOut) { fbParts.push(`saídas totais de ${fbOut.value}`); fbIds.push(fbOut.id); }
  if (fbRes) { fbParts.push(`balanço hídrico acumulado de ${fbRes.value}`); fbIds.push(fbRes.id); }
  if (fbParts.length > 0) {
    traces.push({
      text: formatSentence(`Controle de balanço hídrico: ${joinWithAnd(fbParts)}`),
      factIds: fbIds,
      category: 'elimination',
    });
  }

  // ==========================================
  // PARÁGRAFO 11: Dispositivos Invasivos e Drenos
  // ==========================================
  const devFacts = authorizedFacts.devices || [];
  // Find all device base facts
  const mainDevFacts = devFacts.filter((f) => /^icu-dev-\d+$/.test(f.id));
  mainDevFacts.forEach((dFact) => {
    const baseId = dFact.id;
    const patFact = findFact(devFacts, `${baseId}-patency`);
    const funcFact = findFact(devFacts, `${baseId}-function`);
    const dressFact = findFact(devFacts, `${baseId}-dressing`);
    const phlogFact = findFact(devFacts, `${baseId}-phlogistic`);
    const drainVol = findFact(devFacts, `${baseId}-drain-vol`);
    const drainAsp = findFact(devFacts, `${baseId}-drain-aspect`);

    const devIds = [dFact.id];
    const details: string[] = [];

    if (patFact) { details.push(patFact.value.toLowerCase()); devIds.push(patFact.id); }
    if (funcFact) { details.push(funcFact.value.toLowerCase()); devIds.push(funcFact.id); }
    if (phlogFact) { details.push(`sinais flogísticos ${phlogFact.value.toLowerCase()}`); devIds.push(phlogFact.id); }
    if (dressFact) { details.push(`curativo ${dressFact.value.toLowerCase()}`); devIds.push(dressFact.id); }
    if (drainVol) { details.push(`débito de ${drainVol.value}`); devIds.push(drainVol.id); }
    if (drainAsp) { details.push(`aspecto ${drainAsp.value.toLowerCase()}`); devIds.push(drainAsp.id); }

    const detailStr = details.length > 0 ? `, ${joinWithAnd(details)}` : '';
    traces.push({
      text: formatSentence(`Mantém ${dFact.value}${detailStr}`),
      factIds: devIds,
      category: 'devices',
    });
  });

  // ==========================================
  // PARÁGRAFO 12: Pele e Integridade Cutânea
  // ==========================================
  const skinFacts = authorizedFacts.skin || [];
  const skinInt = findFact(skinFacts, 'icu-skin-integrity');
  const skinHyd = findFact(skinFacts, 'icu-skin-hydration');
  const skinIds: string[] = [];
  let skinText = '';

  if (skinInt) {
    skinIds.push(skinInt.id);
    if (skinInt.value.startsWith('Íntegra')) {
      let hydStr = '';
      if (skinHyd) {
        hydStr = `, pele ${skinHyd.value.toLowerCase()}`;
        skinIds.push(skinHyd.id);
      }
      skinText = `Pele íntegra${hydStr}.`;
    } else {
      skinText = formatSentence(`Integridade cutânea: ${skinInt.value}`);
    }
    traces.push({
      text: skinText,
      factIds: skinIds,
      category: 'skin',
    });
  }

  // ==========================================
  // PARÁGRAFO 13: Mobilidade, Posicionamento e Segurança
  // ==========================================
  const mobFacts = authorizedFacts.mobility || [];
  const mobStatus = findFact(mobFacts, 'icu-mob-status');
  if (mobStatus) {
    traces.push({
      text: formatSentence(`Mobilidade no leito: ${mobStatus.value.toLowerCase()}`),
      factIds: [mobStatus.id],
      category: 'mobility',
    });
  }

  const decubFact = findFact(mobFacts, 'icu-mob-decubitus');
  if (decubFact) {
    traces.push({
      text: formatSentence(decubFact.value),
      factIds: [decubFact.id],
      category: 'mobility',
    });
  }

  const bedHeadFact = findFact(mobFacts, 'icu-mob-bedhead');
  if (bedHeadFact) {
    traces.push({
      text: formatSentence(bedHeadFact.value),
      factIds: [bedHeadFact.id],
      category: 'mobility',
    });
  }

  const railsFact = findFact(mobFacts, 'icu-mob-siderails');
  if (railsFact) {
    traces.push({
      text: `Grades de proteção no leito mantidas ${railsFact.value.toLowerCase()}.`,
      factIds: [railsFact.id],
      category: 'mobility',
    });
  }

  // ==========================================
  // PARÁGRAFO 14: Higiene e Banho
  // ==========================================
  const hygFacts = authorizedFacts.hygiene || [];
  const hygBody = findFact(hygFacts, 'icu-hyg-body');
  if (hygBody) {
    traces.push({
      text: formatSentence(`Higiene corporal: ${hygBody.value.toLowerCase()}`),
      factIds: [hygBody.id],
      category: 'hygiene',
    });
  }

  const hygBath = findFact(hygFacts, 'icu-hyg-bath');
  if (hygBath) {
    traces.push({
      text: formatSentence(`Realizado ${hygBath.value.toLowerCase()}`),
      factIds: [hygBath.id],
      category: 'hygiene',
    });
  }

  // ==========================================
  // PARÁGRAFO 15: Cuidados Realizados
  // ==========================================
  const careFacts = authorizedFacts.care || [];
  const careItems = careFacts.filter((f) => f.id.startsWith('icu-care-item-'));
  if (careItems.length > 0) {
    const cNames = careItems.map((c) => c.value.toLowerCase());
    const cIds = careItems.map((c) => c.id);
    traces.push({
      text: formatSentence(`Cuidados e intervenções executadas no período: ${joinWithAnd(cNames)}`),
      factIds: cIds,
      category: 'care',
    });
  }

  const otherCare = findFact(careFacts, 'icu-care-other');
  if (otherCare) {
    traces.push({
      text: formatSentence(`Outros cuidados realizados: ${otherCare.value}`),
      factIds: [otherCare.id],
      category: 'care',
    });
  }

  // ==========================================
  // PARÁGRAFO 16: Intercorrências e Comunicação
  // ==========================================
  const compFacts = authorizedFacts.complications || [];
  const compNone = findFact(compFacts, 'icu-comp-none');
  const compPres = findFact(compFacts, 'icu-comp-present');
  const compComm = findFact(compFacts, 'icu-comp-communication');

  if (compNone) {
    traces.push({
      text: 'Sem intercorrências registradas no período.',
      factIds: [compNone.id],
      category: 'complications',
    });
  } else if (compPres) {
    traces.push({
      text: formatSentence(`Intercorrência: ${compPres.value}`),
      factIds: [compPres.id],
      category: 'complications',
    });
  }

  if (compComm) {
    traces.push({
      text: formatSentence(`Comunicação realizada com ${compComm.value}`),
      factIds: [compComm.id],
      category: 'complications',
    });
  }

  // ==========================================
  // PARÁGRAFO 17: Alterações Observadas no Período
  // ==========================================
  const addFacts = authorizedFacts.additional || [];
  const changeFact = findFact(addFacts, 'icu-changes-status');
  if (changeFact) {
    const text = changeFact.value.startsWith('Sem alterações')
      ? 'Sem alterações observadas em relação ao registro anterior.'
      : formatSentence(`Alteração observada no período: ${changeFact.value}`);
    traces.push({
      text,
      factIds: [changeFact.id],
      category: 'additional',
    });
  }

  // ==========================================
  // PARÁGRAFO 18: Situação Final e Informações Adicionais
  // ==========================================
  const finFacts = authorizedFacts.finalStatus || [];
  const finFact = findFact(finFacts, 'icu-fin-status');
  if (finFact) {
    traces.push({
      text: formatSentence(finFact.value),
      factIds: [finFact.id],
      category: 'finalStatus',
    });
  }

  const addObs = findFact(addFacts, 'icu-add-obs');
  if (addObs) {
    traces.push({
      text: formatSentence(`Observações adicionais: ${addObs.value}`),
      factIds: [addObs.id],
      category: 'additional',
    });
  }

  // Run the Deterministic Narrative Fact Auditor on the generated traces
  const auditResult = auditDeterministicNarrative(traces, authorizedFacts);

  return {
    narrative: auditResult.filteredNarrative || 'Nenhum dado clínico registrado para a anotação de enfermagem em UTI.',
    traces: auditResult.traces,
  };
}

/**
 * Standard buildTechnicianICUNursingNote signature.
 * Accepts AuthorizedClinicalFacts directly, or a TechnicianICUNursingNoteForm (automatically converted).
 */
export function buildTechnicianICUNursingNote(
  input: AuthorizedClinicalFacts | TechnicianICUNursingNoteForm
): string {
  let facts: AuthorizedClinicalFacts;
  if ('context' in input && Array.isArray((input as AuthorizedClinicalFacts).context)) {
    facts = input as AuthorizedClinicalFacts;
  } else {
    facts = buildAuthorizedICUFacts(input as TechnicianICUNursingNoteForm);
  }

  const { narrative } = buildTechnicianICUNursingNoteWithTrace(facts);
  return narrative;
}
