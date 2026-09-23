import { ClinicalEvolutionForm } from '../types/clinical';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';

/**
 * Builds authorized clinical facts from normalized data.
 * No inference or hallucination is permitted: only explicitly informed fields produce facts.
 */
export function buildAuthorizedFacts(
  data: Partial<ClinicalEvolutionForm>
): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts = {};

  // 1. Contexto do registro
  if (data.context) {
    const ctxFacts: ClinicalFact[] = [];
    const c = data.context;

    if (c.moment) {
      ctxFacts.push({
        id: 'ctx-moment',
        category: 'context',
        sourceField: 'context.moment',
        value: c.moment,
        canonicalText: `Momento do registro: ${c.moment}`,
      });
    }
    if (c.location) {
      const locStr = c.location === 'Outro' && c.locationCustom ? c.locationCustom : c.location;
      ctxFacts.push({
        id: 'ctx-location',
        category: 'context',
        sourceField: 'context.location',
        value: locStr,
        canonicalText: `Localização: ${locStr}`,
      });
    }
    if (c.accompaniment && c.accompaniment !== 'Não informado') {
      const accStr = c.accompaniment === 'Outro' && c.accompanimentCustom ? c.accompanimentCustom : c.accompaniment;
      ctxFacts.push({
        id: 'ctx-accompaniment',
        category: 'context',
        sourceField: 'context.accompaniment',
        value: accStr,
        canonicalText: `Acompanhamento: ${accStr}`,
      });
    }
    if (c.wristbandChecked && c.wristbandChecked !== 'Não informado' && c.wristbandChecked !== 'Não se aplica') {
      ctxFacts.push({
        id: 'ctx-wristband',
        category: 'context',
        sourceField: 'context.wristbandChecked',
        value: c.wristbandChecked,
        canonicalText: `Pulseira de identificação: ${c.wristbandChecked}`,
      });
    }
    if (c.bedSignChecked && c.bedSignChecked !== 'Não informado' && c.bedSignChecked !== 'Não se aplica') {
      ctxFacts.push({
        id: 'ctx-bedsign',
        category: 'context',
        sourceField: 'context.bedSignChecked',
        value: c.bedSignChecked,
        canonicalText: `Placa de identificação do leito: ${c.bedSignChecked}`,
      });
    }
    if (c.allergies && c.allergies !== 'Não informado') {
      const allStr = c.allergies === 'Sim' && c.allergiesDetails ? `Sim (${c.allergiesDetails})` : c.allergies;
      ctxFacts.push({
        id: 'ctx-allergies',
        category: 'context',
        sourceField: 'context.allergies',
        value: allStr,
        canonicalText: `Alergias: ${allStr}`,
      });
    }
    if (c.precaution && c.precaution !== 'Não informado') {
      const precStr = c.precaution === 'Outra' && c.precautionCustom ? c.precautionCustom : c.precaution;
      ctxFacts.push({
        id: 'ctx-precaution',
        category: 'context',
        sourceField: 'context.precaution',
        value: precStr,
        canonicalText: `Precaução: ${precStr}`,
      });
    }
    if (c.admissionReason) {
      ctxFacts.push({
        id: 'ctx-admission-reason',
        category: 'context',
        sourceField: 'context.admissionReason',
        value: c.admissionReason,
        canonicalText: `Motivo da admissão / queixa: ${c.admissionReason}`,
      });
    }
    if (c.relevantComorbidities) {
      ctxFacts.push({
        id: 'ctx-comorbidities',
        category: 'context',
        sourceField: 'context.relevantComorbidities',
        value: c.relevantComorbidities,
        canonicalText: `Comorbidades informadas: ${c.relevantComorbidities}`,
      });
    }

    if (ctxFacts.length > 0) facts.context = ctxFacts;
  }

  // 2. Avaliação geral
  if (data.generalAssessment) {
    const genFacts: ClinicalFact[] = [];
    const g = data.generalAssessment;

    if (g.generalState && g.generalState !== 'Não informado') {
      genFacts.push({
        id: 'gen-state',
        category: 'general',
        sourceField: 'generalAssessment.generalState',
        value: g.generalState,
        canonicalText: `Estado geral: ${g.generalState}`,
      });
    }
    if (g.behavior && g.behavior.length > 0 && !g.behavior.includes('Não avaliado')) {
      genFacts.push({
        id: 'gen-behavior',
        category: 'general',
        sourceField: 'generalAssessment.behavior',
        value: g.behavior,
        canonicalText: `Comportamento: ${g.behavior.join(', ')}`,
      });
    }
    if (g.complaints && g.complaints !== 'Não informado' && g.complaints !== 'Não avaliado') {
      const compStr = g.complaints === 'Com queixa' && g.complaintsDetails ? `Com queixa (${g.complaintsDetails})` : g.complaints;
      genFacts.push({
        id: 'gen-complaints',
        category: 'general',
        sourceField: 'generalAssessment.complaints',
        value: compStr,
        canonicalText: `Queixas: ${compStr}`,
      });
    }
    if (g.hygiene && g.hygiene !== 'Não informado' && g.hygiene !== 'Não avaliada') {
      genFacts.push({
        id: 'gen-hygiene',
        category: 'general',
        sourceField: 'generalAssessment.hygiene',
        value: g.hygiene,
        canonicalText: `Higiene: ${g.hygiene}`,
      });
    }
    if (g.mobility && g.mobility !== 'Não avaliada') {
      const mobStr = g.mobility === 'Outro' && g.mobilityCustom ? g.mobilityCustom : g.mobility;
      genFacts.push({
        id: 'gen-mobility',
        category: 'general',
        sourceField: 'generalAssessment.mobility',
        value: mobStr,
        canonicalText: `Mobilidade: ${mobStr}`,
      });
    }

    if (genFacts.length > 0) facts.general = genFacts;
  }

  // 3. Sinais vitais
  if (data.vitalSigns) {
    const vsFacts: ClinicalFact[] = [];
    const vs = data.vitalSigns;

    if (vs.systolicBP && vs.diastolicBP) {
      vsFacts.push({
        id: 'vs-blood-pressure',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.bloodPressure',
        value: `${vs.systolicBP}/${vs.diastolicBP} mmHg`,
        canonicalText: `PA: ${vs.systolicBP}/${vs.diastolicBP} mmHg`,
      });
    }
    if (vs.meanArterialPressure) {
      vsFacts.push({
        id: 'vs-map',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.meanArterialPressure',
        value: `${vs.meanArterialPressure} mmHg`,
        canonicalText: `PAM: ${vs.meanArterialPressure} mmHg`,
      });
    }
    if (vs.heartRate) {
      vsFacts.push({
        id: 'vs-heart-rate',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.heartRate',
        value: `${vs.heartRate} bpm`,
        canonicalText: `FC: ${vs.heartRate} bpm`,
      });
    }
    if (vs.respiratoryRate) {
      vsFacts.push({
        id: 'vs-respiratory-rate',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.respiratoryRate',
        value: `${vs.respiratoryRate} irpm`,
        canonicalText: `FR: ${vs.respiratoryRate} irpm`,
      });
    }
    if (vs.oxygenSaturation) {
      vsFacts.push({
        id: 'vs-spo2',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.oxygenSaturation',
        value: `${vs.oxygenSaturation}%`,
        canonicalText: `SpO₂: ${vs.oxygenSaturation}%`,
      });
    }
    if (vs.temperature) {
      vsFacts.push({
        id: 'vs-temperature',
        category: 'vitalSigns',
        sourceField: 'vitalSigns.temperature',
        value: `${vs.temperature} °C`,
        canonicalText: `Temperatura: ${vs.temperature} °C`,
      });
    }

    if (vsFacts.length > 0) facts.vitalSigns = vsFacts;
  }

  // 4. Dor
  if (data.pain) {
    const painFacts: ClinicalFact[] = [];
    const p = data.pain;

    if (p.assessmentType && p.assessmentType !== 'Não informado') {
      painFacts.push({
        id: 'pain-assessment',
        category: 'pain',
        sourceField: 'pain.assessmentType',
        value: p,
        canonicalText:
          p.assessmentType === 'Escala numérica 0–10' && p.numericScaleValue !== undefined
            ? `Dor na escala numérica: ${p.numericScaleValue}/10${p.location ? ` em ${p.location}` : ''}${p.characteristics ? ` (${p.characteristics})` : ''}`
            : p.assessmentType === 'Outra escala'
            ? `Dor em ${p.otherScaleName || 'outra escala'}: ${p.otherScaleResult || 'informada'}${p.location ? ` em ${p.location}` : ''}`
            : `Dor: ${p.assessmentType}`,
      });
    }

    if (painFacts.length > 0) facts.pain = painFacts;
  }

  // 5. Neurológico
  if (data.neurological) {
    const neuroFacts: ClinicalFact[] = [];
    const n = data.neurological;

    if (n.consciousnessLevel && n.consciousnessLevel !== 'Não avaliado') {
      const cStr = n.consciousnessLevel === 'Outro' && n.consciousnessCustom ? n.consciousnessCustom : n.consciousnessLevel;
      neuroFacts.push({
        id: 'neuro-consciousness',
        category: 'neurological',
        sourceField: 'neurological.consciousnessLevel',
        value: cStr,
        canonicalText: `Consciência: ${cStr}`,
      });
    }
    if (n.orientation && n.orientation !== 'Não avaliado') {
      neuroFacts.push({
        id: 'neuro-orientation',
        category: 'neurological',
        sourceField: 'neurological.orientation',
        value: n.orientation,
        canonicalText: `Orientação: ${n.orientation}`,
      });
    }
    if (n.glasgowType === 'score' && n.glasgowScore !== undefined) {
      neuroFacts.push({
        id: 'neuro-glasgow',
        category: 'neurological',
        sourceField: 'neurological.glasgowScore',
        value: n.glasgowScore,
        canonicalText: `Glasgow: ${n.glasgowScore} pontos`,
      });
    }
    if (n.rassType === 'score' && n.rassScore !== undefined) {
      neuroFacts.push({
        id: 'neuro-rass',
        category: 'neurological',
        sourceField: 'neurological.rassScore',
        value: n.rassScore,
        canonicalText: `RASS: ${n.rassScore > 0 ? `+${n.rassScore}` : n.rassScore}`,
      });
    }
    if (n.pupils && n.pupils !== 'Não avaliadas') {
      const pupStr = n.pupils === 'Outra alteração' && n.pupilsCustom ? n.pupilsCustom : n.pupils;
      neuroFacts.push({
        id: 'neuro-pupils',
        category: 'neurological',
        sourceField: 'neurological.pupils',
        value: pupStr,
        canonicalText: `Pupilas: ${pupStr}`,
      });
    }
    if (n.photoreaction && n.photoreaction !== 'Não avaliada') {
      const photStr = n.photoreaction === 'Outra' && n.photoreactionCustom ? n.photoreactionCustom : n.photoreaction;
      neuroFacts.push({
        id: 'neuro-photoreaction',
        category: 'neurological',
        sourceField: 'neurological.photoreaction',
        value: photStr,
        canonicalText: `Fotorreação: ${photStr}`,
      });
    }
    if (n.identifiedNeurologicalAlteration && n.identifiedNeurologicalAlteration !== 'Não avaliado') {
      const altStr =
        n.identifiedNeurologicalAlteration === 'Sim' && n.neurologicalAlterationDetails
          ? `Sim (${n.neurologicalAlterationDetails})`
          : n.identifiedNeurologicalAlteration;
      neuroFacts.push({
        id: 'neuro-alteration',
        category: 'neurological',
        sourceField: 'neurological.identifiedNeurologicalAlteration',
        value: altStr,
        canonicalText: `Alteração neurológica focal: ${altStr}`,
      });
    }

    if (neuroFacts.length > 0) facts.neurological = neuroFacts;
  }

  // 6. Respiratório
  if (data.respiratory) {
    const respFacts: ClinicalFact[] = [];
    const r = data.respiratory;

    if (r.respiratorySupport && r.respiratorySupport !== 'Não informado') {
      respFacts.push({
        id: 'resp-support',
        category: 'respiratory',
        sourceField: 'respiratory.respiratorySupport',
        value: r.respiratorySupport,
        canonicalText: `Suporte respiratório: ${r.respiratorySupport}`,
      });
    }
    if (r.respiratoryPattern && r.respiratoryPattern !== 'Não avaliado') {
      respFacts.push({
        id: 'resp-pattern',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryPattern',
        value: r.respiratoryPattern,
        canonicalText: `Padrão respiratório: ${r.respiratoryPattern}`,
      });
    }
    if (r.respiratoryDistress && r.respiratoryDistress !== 'Não avaliado') {
      respFacts.push({
        id: 'resp-distress',
        category: 'respiratory',
        sourceField: 'respiratory.respiratoryDistress',
        value: r.respiratoryDistress,
        canonicalText: `Desconforto respiratório: ${r.respiratoryDistress}`,
      });
    }
    if (r.accessoryMuscles && r.accessoryMuscles !== 'Não avaliado') {
      respFacts.push({
        id: 'resp-accessory-muscles',
        category: 'respiratory',
        sourceField: 'respiratory.accessoryMuscles',
        value: r.accessoryMuscles,
        canonicalText: `Uso de musculatura acessória: ${r.accessoryMuscles}`,
      });
    }
    if (r.secretion && r.secretion !== 'Não avaliada') {
      const secStr =
        r.secretion === 'Presente'
          ? `Presente (${[r.secretionQuantity, r.secretionColor, r.secretionConsistency].filter(Boolean).join(', ') || 'informada'})`
          : 'Ausente';
      respFacts.push({
        id: 'resp-secretion',
        category: 'respiratory',
        sourceField: 'respiratory.secretion',
        value: secStr,
        canonicalText: `Secreção: ${secStr}`,
      });
    }
    if (r.breathSounds && r.breathSounds !== 'Não avaliado') {
      respFacts.push({
        id: 'resp-breath-sounds',
        category: 'respiratory',
        sourceField: 'respiratory.breathSounds',
        value: r.breathSounds,
        canonicalText: `Murmúrio vesicular: ${r.breathSounds}`,
      });
    }
    if (r.adventitiousSounds && r.adventitiousSounds.length > 0 && !r.adventitiousSounds.includes('Não avaliado')) {
      respFacts.push({
        id: 'resp-adventitious-sounds',
        category: 'respiratory',
        sourceField: 'respiratory.adventitiousSounds',
        value: r.adventitiousSounds,
        canonicalText: `Ruídos adventícios: ${r.adventitiousSounds.join(', ')}`,
      });
    }

    if (respFacts.length > 0) facts.respiratory = respFacts;
  }

  // 7. Cardiovascular
  if (data.cardiovascular) {
    const cardFacts: ClinicalFact[] = [];
    const cv = data.cardiovascular;

    if (cv.hemodynamicCondition && cv.hemodynamicCondition !== 'Não informado' && cv.hemodynamicCondition !== 'Não avaliada') {
      cardFacts.push({
        id: 'card-hemodynamic',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.hemodynamicCondition',
        value: cv.hemodynamicCondition,
        canonicalText: `Condição hemodinâmica: ${cv.hemodynamicCondition}`,
      });
    }
    if (cv.peripheralPerfusion && cv.peripheralPerfusion !== 'Não avaliada') {
      cardFacts.push({
        id: 'card-perfusion',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.peripheralPerfusion',
        value: cv.peripheralPerfusion,
        canonicalText: `Perfusão periférica: ${cv.peripheralPerfusion}`,
      });
    }
    if (cv.extremities && cv.extremities !== 'Não avaliadas') {
      const extStr = cv.extremities === 'Outra' && cv.extremitiesCustom ? cv.extremitiesCustom : cv.extremities;
      cardFacts.push({
        id: 'card-extremities',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.extremities',
        value: extStr,
        canonicalText: `Extremidades: ${extStr}`,
      });
    }
    if (cv.capillaryRefillTime && cv.capillaryRefillTime !== 'Não avaliado') {
      const tecStr = cv.capillaryRefillTime === 'Informar valor' && cv.capillaryRefillTimeValue ? `${cv.capillaryRefillTimeValue}s` : cv.capillaryRefillTime;
      cardFacts.push({
        id: 'card-tec',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.capillaryRefillTime',
        value: tecStr,
        canonicalText: `TEC: ${tecStr}`,
      });
    }
    if (cv.edema && cv.edema !== 'Não avaliado') {
      const edemaStr =
        cv.edema === 'Presente'
          ? `Presente (${cv.edemaLocations?.join(', ') || 'local não inf.'}${cv.edemaIntensity ? `, ${cv.edemaIntensity}` : ''})`
          : 'Ausente';
      cardFacts.push({
        id: 'card-edema',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.edema',
        value: edemaStr,
        canonicalText: `Edema: ${edemaStr}`,
      });
    }

    if (cardFacts.length > 0) facts.cardiovascular = cardFacts;
  }

  // 8. Drogas vasoativas
  if (data.vasoactiveDrugs && data.vasoactiveDrugs.inUse) {
    const dvaFacts: ClinicalFact[] = [];
    const dva = data.vasoactiveDrugs;

    dvaFacts.push({
      id: 'dva-in-use',
      category: 'vasoactive',
      sourceField: 'vasoactiveDrugs.inUse',
      value: dva.inUse,
      canonicalText: `Uso de drogas vasoativas: ${dva.inUse}`,
    });

    if (dva.inUse === 'Sim' && dva.drugsList) {
      dva.drugsList.forEach((d, idx) => {
        const drugName = d.medication === 'Outra' && d.observations ? d.observations : d.medication;
        dvaFacts.push({
          id: `dva-item-${idx}`,
          category: 'vasoactive',
          sourceField: `vasoactiveDrugs.drugsList[${idx}]`,
          value: d,
          canonicalText: `${drugName || 'DVA'} a ${d.infusionRate || '—'} ${d.unit || 'mL/h'}${d.concentration ? ` (${d.concentration})` : ''}`,
        });
      });
    }

    if (dvaFacts.length > 0) facts.vasoactive = dvaFacts;
  }

  // 9. Sedação e analgesia
  if (data.sedationAnalgesia && data.sedationAnalgesia.inUse) {
    const sedFacts: ClinicalFact[] = [];
    const sed = data.sedationAnalgesia;

    sedFacts.push({
      id: 'sed-in-use',
      category: 'sedationAnalgesia',
      sourceField: 'sedationAnalgesia.inUse',
      value: sed.inUse,
      canonicalText: `Uso de sedação/analgesia contínua: ${sed.inUse}`,
    });

    if (sed.inUse === 'Sim' && sed.medicationsList) {
      sed.medicationsList.forEach((m, idx) => {
        const medName = m.medication === 'Outro' && m.observations ? m.observations : m.medication;
        sedFacts.push({
          id: `sed-item-${idx}`,
          category: 'sedationAnalgesia',
          sourceField: `sedationAnalgesia.medicationsList[${idx}]`,
          value: m,
          canonicalText: `${m.purpose || 'Medicação'}: ${medName || 'Fármaco'} a ${m.rateOrDose || '—'}${m.concentration ? ` (${m.concentration})` : ''}`,
        });
      });
    }

    if (sedFacts.length > 0) facts.sedationAnalgesia = sedFacts;
  }

  // 10. Gastrointestinal e nutrição
  if (data.gastrointestinal || data.nutrition) {
    const giFacts: ClinicalFact[] = [];
    const nutFacts: ClinicalFact[] = [];
    const gi = data.gastrointestinal;
    const nut = data.nutrition;

    if (gi) {
      if (gi.abdominalShape && gi.abdominalShape !== 'Não avaliado') {
        giFacts.push({
          id: 'gi-shape',
          category: 'gastrointestinal',
          sourceField: 'gastrointestinal.abdominalShape',
          value: gi.abdominalShape,
          canonicalText: `Formato do abdome: ${gi.abdominalShape}`,
        });
      }
      if (gi.consistency && gi.consistency !== 'Não avaliado') {
        giFacts.push({
          id: 'gi-consistency',
          category: 'gastrointestinal',
          sourceField: 'gastrointestinal.consistency',
          value: gi.consistency,
          canonicalText: `Consistência abdominal: ${gi.consistency}`,
        });
      }
      if (gi.palpation && gi.palpation !== 'Não realizada') {
        const palpStr = gi.palpation === 'Doloroso' && gi.palpationLocation ? `Doloroso (${gi.palpationLocation})` : gi.palpation;
        giFacts.push({
          id: 'gi-palpation',
          category: 'gastrointestinal',
          sourceField: 'gastrointestinal.palpation',
          value: palpStr,
          canonicalText: `Palpação abdominal: ${palpStr}`,
        });
      }
      if (gi.bowelSounds && gi.bowelSounds !== 'Não avaliados') {
        giFacts.push({
          id: 'gi-bowel-sounds',
          category: 'gastrointestinal',
          sourceField: 'gastrointestinal.bowelSounds',
          value: gi.bowelSounds,
          canonicalText: `Ruídos hidroaéreos: ${gi.bowelSounds}`,
        });
      }
    }

    if (nut) {
      if (nut.status && nut.status !== 'Não informado') {
        nutFacts.push({
          id: 'nut-status',
          category: 'nutrition',
          sourceField: 'nutrition.status',
          value: nut.status,
          canonicalText: `Suporte nutricional: ${nut.status}`,
        });
      }
      if (nut.oralAcceptance && nut.oralAcceptance !== 'Não avaliada') {
        nutFacts.push({
          id: 'nut-acceptance',
          category: 'nutrition',
          sourceField: 'nutrition.oralAcceptance',
          value: nut.oralAcceptance,
          canonicalText: `Aceitação da dieta oral: ${nut.oralAcceptance}`,
        });
      }
      if (nut.enteralDevice) {
        nutFacts.push({
          id: 'nut-enteral-device',
          category: 'nutrition',
          sourceField: 'nutrition.enteralDevice',
          value: nut.enteralDevice,
          canonicalText: `Dispositivo enteral: ${nut.enteralDevice}${nut.enteralRate ? ` a ${nut.enteralRate} mL/h` : ''}`,
        });
      }
      if (nut.enteralTolerance && nut.enteralTolerance !== 'Não avaliada') {
        nutFacts.push({
          id: 'nut-enteral-tolerance',
          category: 'nutrition',
          sourceField: 'nutrition.enteralTolerance',
          value: nut.enteralTolerance,
          canonicalText: `Tolerância enteral: ${nut.enteralTolerance}`,
        });
      }
      if (nut.nausea && nut.nausea !== 'Não avaliadas') {
        nutFacts.push({
          id: 'nut-nausea',
          category: 'nutrition',
          sourceField: 'nutrition.nausea',
          value: nut.nausea,
          canonicalText: `Náuseas: ${nut.nausea}`,
        });
      }
      if (nut.vomiting && nut.vomiting !== 'Não avaliados') {
        const vomStr = nut.vomiting === 'Presentes' && nut.vomitingDetails ? `Presentes (${nut.vomitingDetails})` : nut.vomiting;
        nutFacts.push({
          id: 'nut-vomiting',
          category: 'nutrition',
          sourceField: 'nutrition.vomiting',
          value: vomStr,
          canonicalText: `Vômitos: ${vomStr}`,
        });
      }
    }

    if (giFacts.length > 0) facts.gastrointestinal = giFacts;
    if (nutFacts.length > 0) facts.nutrition = nutFacts;
  }

  // 11. Eliminações intestinais
  if (data.bowelElimination) {
    const bowelFacts: ClinicalFact[] = [];
    const b = data.bowelElimination;

    if (b.bowelMovement && b.bowelMovement !== 'Não informado' && b.bowelMovement !== 'Não avaliada') {
      const bStr =
        b.bowelMovement === 'Presente'
          ? `Presente (${b.aspect || 'aspecto não inf.'}${b.frequencyOrQuantity ? `, ${b.frequencyOrQuantity}` : ''})`
          : 'Ausente';
      bowelFacts.push({
        id: 'bowel-movement',
        category: 'bowel',
        sourceField: 'bowelElimination.bowelMovement',
        value: bStr,
        canonicalText: `Evacuação: ${bStr}`,
      });
    }
    if (b.ostomy && b.ostomy !== 'Não avaliada') {
      const ostStr =
        b.ostomy === 'Sim'
          ? `Sim (${b.ostomyType || 'Ostomia'}${b.ostomyStomaCondition ? `, ${b.ostomyStomaCondition}` : ''})`
          : 'Não';
      bowelFacts.push({
        id: 'bowel-ostomy',
        category: 'bowel',
        sourceField: 'bowelElimination.ostomy',
        value: ostStr,
        canonicalText: `Ostomia intestinal: ${ostStr}`,
      });
    }

    if (bowelFacts.length > 0) facts.bowel = bowelFacts;
  }

  // 12. Sistema urinário
  if (data.urinary) {
    const uriFacts: ClinicalFact[] = [];
    const u = data.urinary;

    if (u.diuresis && u.diuresis !== 'Não informado' && u.diuresis !== 'Não avaliada') {
      uriFacts.push({
        id: 'uri-diuresis',
        category: 'urinary',
        sourceField: 'urinary.diuresis',
        value: u.diuresis,
        canonicalText: `Diurese: ${u.diuresis}`,
      });
    }
    if (u.eliminationRoute && u.eliminationRoute !== 'Não informado') {
      let routeDesc: string = u.eliminationRoute;
      if (u.eliminationRoute === 'SVD') {
        const details = [
          u.svdCaliber ? `Calibre: ${u.svdCaliber}` : '',
          u.svdPatent ? `Pérvia: ${u.svdPatent}` : '',
          u.svdOutputVolume ? `Débito: ${u.svdOutputVolume} mL` : '',
          u.svdColor ? `Cor: ${u.svdColor}` : '',
          u.svdAspect ? `Aspecto: ${u.svdAspect}` : '',
        ].filter(Boolean).join(', ');
        routeDesc = `SVD (${details || 'sem dados adicionais'})`;
      } else if (u.eliminationRoute === 'Espontânea') {
        const details = [
          u.spontaneousColor ? `Cor: ${u.spontaneousColor}` : '',
          u.spontaneousAspect ? `Aspecto: ${u.spontaneousAspect}` : '',
          u.spontaneousVolume ? `Volume: ${u.spontaneousVolume}` : '',
        ].filter(Boolean).join(', ');
        if (details) routeDesc = `Espontânea (${details})`;
      }
      uriFacts.push({
        id: 'uri-route',
        category: 'urinary',
        sourceField: 'urinary.eliminationRoute',
        value: u.eliminationRoute,
        canonicalText: `Via urinária: ${routeDesc}`,
      });
    }

    if (uriFacts.length > 0) facts.urinary = uriFacts;
  }

  // 13. Dispositivos invasivos
  if (data.devices?.list && data.devices.list.length > 0) {
    const devFacts: ClinicalFact[] = [];
    data.devices.list.forEach((dev, idx) => {
      const devName = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type;
      const flags = [
        dev.dressingClean ? 'curativo limpo' : '',
        dev.dressingDry ? 'seco' : '',
        dev.dressingIntact ? 'íntegro' : '',
      ].filter(Boolean).join(', ');
      devFacts.push({
        id: `dev-item-${idx}`,
        category: 'devices',
        sourceField: `devices.list[${idx}]`,
        value: dev,
        canonicalText: `${devName || 'Dispositivo'} em ${dev.location || 'local não inf.'} (${[dev.permeability, dev.functioning, flags, dev.phlogisticSigns ? `sinais flogísticos: ${dev.phlogisticSigns}` : ''].filter(Boolean).join('; ')})`,
      });
    });
    if (devFacts.length > 0) facts.devices = devFacts;
  }

  // 14. Pele e integridade cutânea
  if (data.skin) {
    const skinFacts: ClinicalFact[] = [];
    const s = data.skin;

    if (s.integrity && s.integrity !== 'Não avaliada') {
      const integStr =
        s.integrity === 'Com alteração/lesão'
          ? `Com lesão em ${s.lesionLocation || 'local não inf.'}${s.lesionDescription ? ` (${s.lesionDescription})` : ''}`
          : s.integrity;
      skinFacts.push({
        id: 'skin-integrity',
        category: 'skin',
        sourceField: 'skin.integrity',
        value: integStr,
        canonicalText: `Integridade cutânea: ${integStr}`,
      });
    }
    if (s.hydration && s.hydration !== 'Não avaliada') {
      skinFacts.push({
        id: 'skin-hydration',
        category: 'skin',
        sourceField: 'skin.hydration',
        value: s.hydration,
        canonicalText: `Hidratação da pele: ${s.hydration}`,
      });
    }

    if (skinFacts.length > 0) facts.skin = skinFacts;
  }

  // 15. Cuidados realizados & Banho
  if (data.nursingCare?.careItems && data.nursingCare.careItems.length > 0) {
    facts.care = data.nursingCare.careItems.map((item, idx) => ({
      id: `care-item-${idx}`,
      category: 'care',
      sourceField: `nursingCare.careItems[${idx}]`,
      value: item,
      canonicalText: item === 'Outro cuidado' && data.nursingCare?.otherCareDescription ? data.nursingCare.otherCareDescription : item,
    }));
  }

  if (data.bath?.bathType && data.bath.bathType !== 'Não informado') {
    const b = data.bath;
    facts.bath = [
      {
        id: 'bath-fact',
        category: 'bath',
        sourceField: 'bath.bathType',
        value: b,
        canonicalText: `Banho: ${b.bathType}${b.tolerance && b.tolerance !== 'Não informar' && b.tolerance !== 'Não avaliada' ? ` (${b.tolerance})` : ''}`,
      },
    ];
  }

  // 16. Intercorrências
  if (data.complications?.hasComplication && data.complications.hasComplication !== 'Não informado') {
    const comp = data.complications;
    const compStr =
      comp.hasComplication === 'Sim'
        ? `Sim${comp.time ? ` às ${comp.time}` : ''}${comp.description ? `: ${comp.description}` : ''}${comp.actionsTaken ? `. Condutas: ${comp.actionsTaken}` : ''}${comp.patientResponse ? `. Resposta: ${comp.patientResponse}` : ''}${comp.communicatedToTeam === 'Sim' && comp.communicatedWho ? `. Comunicado a ${comp.communicatedWho}${comp.communicationTime ? ` às ${comp.communicationTime}` : ''}` : ''}`
        : 'Não';
    facts.complications = [
      {
        id: 'comp-fact',
        category: 'complications',
        sourceField: 'complications.hasComplication',
        value: comp,
        canonicalText: `Intercorrência no período: ${compStr}`,
      },
    ];
  }

  // 17. Comparação
  if (data.comparison?.hasPreviousEvaluation === 'Sim' && data.comparison.evolutionStatus) {
    const cmp = data.comparison;
    facts.comparison = [
      {
        id: 'comparison-fact',
        category: 'comparison',
        sourceField: 'comparison.evolutionStatus',
        value: cmp,
        canonicalText: `Status evolutivo: ${cmp.evolutionStatus}${cmp.aspectsRelated?.length ? ` (${cmp.aspectsRelated.join(', ')})` : ''}${cmp.evidenceDescription ? `. Evidência: ${cmp.evidenceDescription}` : ''}`,
      },
    ];
  }

  // 18. Situação final
  if (data.finalStatus?.condition && data.finalStatus.condition !== 'Não informado') {
    const f = data.finalStatus;
    const finStr = f.condition === 'Outra situação' && f.conditionCustom ? f.conditionCustom : f.condition;
    facts.finalStatus = [
      {
        id: 'final-status-fact',
        category: 'finalStatus',
        sourceField: 'finalStatus.condition',
        value: finStr,
        canonicalText: `Situação final: ${finStr}`,
      },
    ];
  }

  // 19. Informações adicionais
  const addStr = typeof data.additionalInformation === 'string' ? data.additionalInformation.trim() : (data.additionalInformation as any)?.notes?.trim();
  if (addStr) {
    facts.additional = [
      {
        id: 'additional-fact',
        category: 'additional',
        sourceField: 'additionalInformation',
        value: addStr,
        canonicalText: `Observações adicionais: ${addStr}`,
      },
    ];
  }

  return facts;
}
