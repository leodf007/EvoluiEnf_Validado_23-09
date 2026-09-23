import {
  TechnicianClinicalMedicalForm,
  createInitialTechnicianClinicalMedicalForm,
} from '../types/technicianClinicalMedical';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { AuthorizedFactFactory } from './factory/authorizedFactFactory';

/**
 * Normalizer for Technician Clinical Medical Form.
 * Ensures consistent structures, trims whitespace, defaults nulls to undefined or empty,
 * without creating fabricated data.
 */
export function normalizeTechnicianClinicalMedicalData(
  form: Partial<TechnicianClinicalMedicalForm>
): TechnicianClinicalMedicalForm {
  const initial = createInitialTechnicianClinicalMedicalForm();

  return {
    context: {
      moment: (form.context?.moment?.trim() as any) || '',
      location: (form.context?.location?.trim() as any) || '',
      locationCustom: form.context?.locationCustom?.trim(),
      accompaniment: (form.context?.accompaniment?.trim() as any) || '',
      accompanimentCustom: form.context?.accompanimentCustom?.trim(),
      wristbandChecked: Boolean(form.context?.wristbandChecked),
      bedSignChecked: Boolean(form.context?.bedSignChecked),
      precaution: (form.context?.precaution?.trim() as any) || '',
      precautionCustom: form.context?.precautionCustom?.trim(),
    },
    generalAssessment: {
      observedState: (form.generalAssessment?.observedState?.trim() as any) || '',
      observedStateCustom: form.generalAssessment?.observedStateCustom?.trim(),
      complaints: (form.generalAssessment?.complaints?.trim() as any) || '',
      complaintsDetails: form.generalAssessment?.complaintsDetails?.trim(),
      source: (form.generalAssessment?.source?.trim() as any) || '',
      hygiene: (form.generalAssessment?.hygiene?.trim() as any) || '',
      mobility: (form.generalAssessment?.mobility?.trim() as any) || '',
    },
    vitalSigns: {
      systolicBP: form.vitalSigns?.systolicBP?.trim(),
      diastolicBP: form.vitalSigns?.diastolicBP?.trim(),
      meanArterialPressure: form.vitalSigns?.meanArterialPressure?.trim(),
      heartRate: form.vitalSigns?.heartRate?.trim(),
      respiratoryRate: form.vitalSigns?.respiratoryRate?.trim(),
      oxygenSaturation: form.vitalSigns?.oxygenSaturation?.trim(),
      temperature: form.vitalSigns?.temperature?.trim(),
      capillaryBloodGlucose: form.vitalSigns?.capillaryBloodGlucose?.trim(),
    },
    pain: {
      status: (form.pain?.status?.trim() as any) || '',
      numericScaleValue:
        form.pain?.numericScaleValue !== undefined && form.pain?.numericScaleValue !== ''
          ? form.pain.numericScaleValue
          : undefined,
      location: form.pain?.location?.trim(),
    },
    respiratory: {
      support: (form.respiratory?.support?.trim() as any) || '',
      pattern: (form.respiratory?.pattern?.trim() as any) || '',
      patternCustom: form.respiratory?.patternCustom?.trim(),
      discomfort: (form.respiratory?.discomfort?.trim() as any) || '',
      oxygenDevice: (form.respiratory?.oxygenDevice?.trim() as any) || '',
      oxygenDeviceCustom: form.respiratory?.oxygenDeviceCustom?.trim(),
      oxygenFlow: form.respiratory?.oxygenFlow?.trim(),
    },
    cardiovascular: {
      perfusion: (form.cardiovascular?.perfusion?.trim() as any) || '',
      extremities: (form.cardiovascular?.extremities?.trim() as any) || '',
      edema: (form.cardiovascular?.edema?.trim() as any) || '',
      edemaLocation: form.cardiovascular?.edemaLocation?.trim(),
    },
    nutrition: {
      route: (form.nutrition?.route?.trim() as any) || '',
      routeCustom: form.nutrition?.routeCustom?.trim(),
      oralAcceptance: (form.nutrition?.oralAcceptance?.trim() as any) || '',
      enteralDevice: (form.nutrition?.enteralDevice?.trim() as any) || '',
      enteralRate: form.nutrition?.enteralRate?.trim(),
      enteralTolerance: form.nutrition?.enteralTolerance?.trim(),
    },
    eliminations: {
      urinary: (form.eliminations?.urinary?.trim() as any) || '',
      urinaryRoute: (form.eliminations?.urinaryRoute?.trim() as any) || '',
      urinaryRouteCustom: form.eliminations?.urinaryRouteCustom?.trim(),
      bowel: (form.eliminations?.bowel?.trim() as any) || '',
      bowelAspect: (form.eliminations?.bowelAspect?.trim() as any) || '',
      bowelAspectCustom: form.eliminations?.bowelAspectCustom?.trim(),
    },
    devices: Array.isArray(form.devices)
      ? form.devices.map((d) => ({
          ...d,
          location: d.location?.trim() || '',
          observations: d.observations?.trim(),
        }))
      : [],
    skin: {
      integrity: (form.skin?.integrity?.trim() as any) || '',
      hydration: (form.skin?.hydration?.trim() as any) || '',
      alterationDescription: form.skin?.alterationDescription?.trim(),
    },
    bath: {
      performed: (form.bath?.performed?.trim() as any) || '',
      tolerance: (form.bath?.tolerance?.trim() as any) || '',
      toleranceCustom: form.bath?.toleranceCustom?.trim(),
    },
    care: {
      actions: Array.isArray(form.care?.actions) ? [...form.care.actions] : [],
      otherCare: form.care?.otherCare?.trim(),
    },
    complications: {
      hasComplication: (form.complications?.hasComplication?.trim() as any) || '',
      description: form.complications?.description?.trim(),
      conduct: form.complications?.conduct?.trim(),
      communication: form.complications?.communication?.trim(),
      explicitNoComplications: Boolean(form.complications?.explicitNoComplications),
    },
    finalStatus: {
      status: (form.finalStatus?.status?.trim() as any) || '',
      details: form.finalStatus?.details?.trim(),
    },
  };
}

/**
 * Builds Authorized Clinical Facts strictly from normalized data.
 * Pure, deterministic, zero-hallucination fact generation.
 */
export function buildClinicalMedicalAuthorizedFacts(
  data: TechnicianClinicalMedicalForm
): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts = {};

  // 1. Context facts
  const ctx = data.context;
  const ctxFacts: ClinicalFact[] = [];
  if (ctx.moment) {
    ctxFacts.push({
      id: 'ctx-moment',
      category: 'context',
      sourceField: 'context.moment',
      value: ctx.moment,
      canonicalText: `Momento do registro: ${ctx.moment}`,
    });
  }
  if (ctx.location) {
    const loc = ctx.location === 'Outro' && ctx.locationCustom ? ctx.locationCustom : ctx.location;
    ctxFacts.push({
      id: 'ctx-location',
      category: 'context',
      sourceField: 'context.location',
      value: loc,
      canonicalText: `Localização: ${loc}`,
    });
  }
  if (ctx.accompaniment) {
    const acc = ctx.accompaniment === 'Outro' && ctx.accompanimentCustom ? ctx.accompanimentCustom : ctx.accompaniment;
    ctxFacts.push({
      id: 'ctx-accompaniment',
      category: 'context',
      sourceField: 'context.accompaniment',
      value: acc,
      canonicalText: `Acompanhamento: ${acc}`,
    });
  }
  if (ctx.wristbandChecked) {
    ctxFacts.push({
      id: 'ctx-wristband',
      category: 'context',
      sourceField: 'context.wristbandChecked',
      value: true,
      canonicalText: 'Pulseira de identificação conferida',
    });
  }
  if (ctx.bedSignChecked) {
    ctxFacts.push({
      id: 'ctx-bedsign',
      category: 'context',
      sourceField: 'context.bedSignChecked',
      value: true,
      canonicalText: 'Identificação no leito conferida',
    });
  }
  if (ctx.precaution) {
    const prec = ctx.precaution === 'Outra' && ctx.precautionCustom ? ctx.precautionCustom : ctx.precaution;
    ctxFacts.push({
      id: 'ctx-precaution',
      category: 'context',
      sourceField: 'context.precaution',
      value: prec,
      canonicalText: `Precaução: ${prec}`,
    });
  }
  if (ctxFacts.length > 0) {
    facts.context = ctxFacts;
  }

  // 2. General Assessment facts
  const gen = data.generalAssessment;
  const genFacts: ClinicalFact[] = [];
  if (gen.observedState) {
    const state = gen.observedState === 'outro' && gen.observedStateCustom ? gen.observedStateCustom : gen.observedState;
    genFacts.push({
      id: 'gen-observed-state',
      category: 'general',
      sourceField: 'generalAssessment.observedState',
      value: state,
      canonicalText: `Estado observado: ${state}`,
    });
  }
  if (gen.complaints) {
    let text: string = gen.complaints;
    if (gen.complaints === 'com queixa' && gen.complaintsDetails) {
      text = `queixa: ${gen.complaintsDetails}`;
    }
    genFacts.push({
      id: 'gen-complaints',
      category: 'general',
      sourceField: 'generalAssessment.complaints',
      value: text,
      canonicalText: `Queixas: ${text}`,
    });
  }
  if (gen.source) {
    genFacts.push({
      id: 'gen-source',
      category: 'general',
      sourceField: 'generalAssessment.source',
      value: gen.source,
      canonicalText: `Informante: ${gen.source}`,
    });
  }
  if (gen.hygiene) {
    genFacts.push({
      id: 'gen-hygiene',
      category: 'general',
      sourceField: 'generalAssessment.hygiene',
      value: gen.hygiene,
      canonicalText: `Higiene: ${gen.hygiene}`,
    });
  }
  if (gen.mobility) {
    genFacts.push({
      id: 'gen-mobility',
      category: 'general',
      sourceField: 'generalAssessment.mobility',
      value: gen.mobility,
      canonicalText: `Mobilidade: ${gen.mobility}`,
    });
  }
  if (genFacts.length > 0) {
    facts.general = genFacts;
  }

  // 3. Vital Signs facts
  const vs = data.vitalSigns;
  const vsFacts: ClinicalFact[] = [];
  if (vs.systolicBP && vs.diastolicBP) {
    vsFacts.push({
      id: 'vs-bp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.bloodPressure',
      value: `${vs.systolicBP}x${vs.diastolicBP}`,
      canonicalText: `PA: ${vs.systolicBP}x${vs.diastolicBP} mmHg`,
    });
  }
  if (vs.meanArterialPressure) {
    vsFacts.push({
      id: 'vs-map',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.meanArterialPressure',
      value: vs.meanArterialPressure,
      canonicalText: `PAM aferida manualmente: ${vs.meanArterialPressure} mmHg`,
    });
  }
  if (vs.heartRate) {
    vsFacts.push({
      id: 'vs-hr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.heartRate',
      value: vs.heartRate,
      canonicalText: `FC: ${vs.heartRate} bpm`,
    });
  }
  if (vs.respiratoryRate) {
    vsFacts.push({
      id: 'vs-rr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.respiratoryRate',
      value: vs.respiratoryRate,
      canonicalText: `FR: ${vs.respiratoryRate} irpm`,
    });
  }
  if (vs.oxygenSaturation) {
    vsFacts.push({
      id: 'vs-spo2',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.oxygenSaturation',
      value: vs.oxygenSaturation,
      canonicalText: `SpO2: ${vs.oxygenSaturation}%`,
    });
  }
  if (vs.temperature) {
    vsFacts.push({
      id: 'vs-temp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.temperature',
      value: vs.temperature,
      canonicalText: `Temperatura: ${vs.temperature} °C`,
    });
  }
  if (vs.capillaryBloodGlucose) {
    vsFacts.push({
      id: 'vs-glucose',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.capillaryBloodGlucose',
      value: vs.capillaryBloodGlucose,
      canonicalText: `Glicemia capilar: ${vs.capillaryBloodGlucose} mg/dL`,
    });
  }
  if (vsFacts.length > 0) {
    facts.vitalSigns = vsFacts;
  }

  // 4. Pain facts
  const p = data.pain;
  const painFacts: ClinicalFact[] = [];
  if (p.status) {
    painFacts.push({
      id: 'pain-status',
      category: 'pain',
      sourceField: 'pain.status',
      value: p.status,
      canonicalText: `Avaliação de dor: ${p.status}`,
    });
  }
  if (p.numericScaleValue !== undefined && p.numericScaleValue !== '') {
    painFacts.push({
      id: 'pain-score',
      category: 'pain',
      sourceField: 'pain.numericScaleValue',
      value: Number(p.numericScaleValue),
      canonicalText: `Escore de dor: ${p.numericScaleValue}/10`,
    });
  }
  if (p.location) {
    painFacts.push({
      id: 'pain-location',
      category: 'pain',
      sourceField: 'pain.location',
      value: p.location,
      canonicalText: `Localização da dor: ${p.location}`,
    });
  }
  if (painFacts.length > 0) {
    facts.pain = painFacts;
  }

  // 5. Respiratory facts
  const resp = data.respiratory;
  const respFacts: ClinicalFact[] = [];
  if (resp.support) {
    respFacts.push({
      id: 'resp-support',
      category: 'respiratory',
      sourceField: 'respiratory.support',
      value: resp.support,
      canonicalText: `Suporte ventilatório: ${resp.support}`,
    });
  }
  if (resp.pattern) {
    const pat = resp.pattern === 'outro' && resp.patternCustom ? resp.patternCustom : resp.pattern;
    respFacts.push({
      id: 'resp-pattern',
      category: 'respiratory',
      sourceField: 'respiratory.pattern',
      value: pat,
      canonicalText: `Padrão respiratório: ${pat}`,
    });
  }
  if (resp.discomfort) {
    respFacts.push({
      id: 'resp-discomfort',
      category: 'respiratory',
      sourceField: 'respiratory.discomfort',
      value: resp.discomfort,
      canonicalText: `Desconforto respiratório: ${resp.discomfort}`,
    });
  }
  if (resp.oxygenDevice) {
    const dev = resp.oxygenDevice === 'outro' && resp.oxygenDeviceCustom ? resp.oxygenDeviceCustom : resp.oxygenDevice;
    respFacts.push({
      id: 'resp-ox-device',
      category: 'respiratory',
      sourceField: 'respiratory.oxygenDevice',
      value: dev,
      canonicalText: `Dispositivo de oxigênio: ${dev}`,
    });
  }
  if (resp.oxygenFlow) {
    respFacts.push({
      id: 'resp-ox-flow',
      category: 'respiratory',
      sourceField: 'respiratory.oxygenFlow',
      value: resp.oxygenFlow,
      canonicalText: `Fluxo de oxigênio: ${resp.oxygenFlow} L/min`,
    });
  }
  if (respFacts.length > 0) {
    facts.respiratory = respFacts;
  }

  // 6. Cardiovascular facts
  const cv = data.cardiovascular;
  const cvFacts: ClinicalFact[] = [];
  if (cv.perfusion) {
    cvFacts.push({
      id: 'cv-perfusion',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.perfusion',
      value: cv.perfusion,
      canonicalText: `Perfusão periférica: ${cv.perfusion}`,
    });
  }
  if (cv.extremities) {
    cvFacts.push({
      id: 'cv-extremities',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.extremities',
      value: cv.extremities,
      canonicalText: `Extremidades: ${cv.extremities}`,
    });
  }
  if (cv.edema) {
    let edemaTxt: string = cv.edema;
    if (cv.edema === 'presente' && cv.edemaLocation) {
      edemaTxt = `presente em ${cv.edemaLocation}`;
    }
    cvFacts.push({
      id: 'cv-edema',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.edema',
      value: edemaTxt,
      canonicalText: `Edema: ${edemaTxt}`,
    });
  }
  if (cvFacts.length > 0) {
    facts.cardiovascular = cvFacts;
  }

  // 7. Nutrition facts
  const nutr = data.nutrition;
  const nutrFacts: ClinicalFact[] = [];
  if (nutr.route) {
    const r = nutr.route === 'outra' && nutr.routeCustom ? nutr.routeCustom : nutr.route;
    nutrFacts.push({
      id: 'nutr-route',
      category: 'nutrition',
      sourceField: 'nutrition.route',
      value: r,
      canonicalText: `Via alimentar: ${r}`,
    });
  }
  if (nutr.oralAcceptance) {
    nutrFacts.push({
      id: 'nutr-oral-acceptance',
      category: 'nutrition',
      sourceField: 'nutrition.oralAcceptance',
      value: nutr.oralAcceptance,
      canonicalText: `Aceitação da dieta oral: ${nutr.oralAcceptance}`,
    });
  }
  if (nutr.enteralDevice) {
    nutrFacts.push({
      id: 'nutr-enteral-device',
      category: 'nutrition',
      sourceField: 'nutrition.enteralDevice',
      value: nutr.enteralDevice,
      canonicalText: `Dispositivo enteral: ${nutr.enteralDevice}`,
    });
  }
  if (nutr.enteralRate) {
    nutrFacts.push({
      id: 'nutr-enteral-rate',
      category: 'nutrition',
      sourceField: 'nutrition.enteralRate',
      value: nutr.enteralRate,
      canonicalText: `Velocidade da dieta enteral: ${nutr.enteralRate}`,
    });
  }
  if (nutr.enteralTolerance) {
    nutrFacts.push({
      id: 'nutr-enteral-tolerance',
      category: 'nutrition',
      sourceField: 'nutrition.enteralTolerance',
      value: nutr.enteralTolerance,
      canonicalText: `Tolerância da dieta enteral: ${nutr.enteralTolerance}`,
    });
  }
  if (nutrFacts.length > 0) {
    facts.nutrition = nutrFacts;
  }

  // 8. Elimination facts
  const elim = data.eliminations;
  const elimFacts: ClinicalFact[] = [];
  if (elim.urinary) {
    let urTxt = elim.urinary;
    if (elim.urinaryRoute) {
      const uRoute = elim.urinaryRoute === 'outra' && elim.urinaryRouteCustom ? elim.urinaryRouteCustom : elim.urinaryRoute;
      urTxt += ` por via ${uRoute}`;
    }
    elimFacts.push({
      id: 'elim-urinary',
      category: 'urinary',
      sourceField: 'eliminations.urinary',
      value: urTxt,
      canonicalText: `Eliminação urinária: ${urTxt}`,
    });
  }
  if (elim.bowel) {
    let bowTxt = elim.bowel;
    if (elim.bowelAspect) {
      const bAspect = elim.bowelAspect === 'outro' && elim.bowelAspectCustom ? elim.bowelAspectCustom : elim.bowelAspect;
      bowTxt += `, aspecto ${bAspect}`;
    }
    elimFacts.push({
      id: 'elim-bowel',
      category: 'bowel',
      sourceField: 'eliminations.bowel',
      value: bowTxt,
      canonicalText: `Evacuação: ${bowTxt}`,
    });
  }
  if (elimFacts.length > 0) {
    facts.eliminations = elimFacts;
    facts.urinary = elimFacts.filter((f) => f.id === 'elim-urinary');
    facts.bowel = elimFacts.filter((f) => f.id === 'elim-bowel');
  }

  // 9. Devices facts
  if (Array.isArray(data.devices) && data.devices.length > 0) {
    const devFacts: ClinicalFact[] = [];
    data.devices.forEach((dev, idx) => {
      const dType = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type;
      const dressingPieces = [
        dev.dressingClean ? 'limpo' : null,
        dev.dressingDry ? 'seco' : null,
        dev.dressingIntact ? 'íntegro' : null,
      ].filter(Boolean);
      const dressingStr = dressingPieces.length > 0 ? dressingPieces.join(', ') : 'não especificado';

      devFacts.push({
        id: `device-${idx}-${(dev.type || 'dev').toLowerCase()}`,
        category: 'devices',
        sourceField: `devices[${idx}]`,
        value: {
          type: dType,
          location: dev.location,
          permeability: dev.permeability,
          functioning: dev.functioning,
          phlogisticSigns: dev.phlogisticSigns,
          dressing: dressingStr,
        },
        canonicalText: `${dType} em ${dev.location || 'local não especificado'}, ${dev.permeability || ''}, curativo ${dressingStr}, sinais flogísticos ${dev.phlogisticSigns || 'não avaliados'}`,
      });
    });
    facts.devices = devFacts;
  }

  // 10. Skin facts
  const skin = data.skin;
  const skinFacts: ClinicalFact[] = [];
  if (skin.integrity) {
    let sTxt = skin.integrity;
    if (skin.integrity === 'alteração presente' && skin.alterationDescription) {
      sTxt += `: ${skin.alterationDescription}`;
    }
    skinFacts.push({
      id: 'skin-integrity',
      category: 'skin',
      sourceField: 'skin.integrity',
      value: sTxt,
      canonicalText: `Integridade cutânea: ${sTxt}`,
    });
  }
  if (skin.hydration) {
    skinFacts.push({
      id: 'skin-hydration',
      category: 'skin',
      sourceField: 'skin.hydration',
      value: skin.hydration,
      canonicalText: `Pele: ${skin.hydration}`,
    });
  }
  if (skinFacts.length > 0) {
    facts.skin = skinFacts;
  }

  // 11. Bath facts
  const bath = data.bath;
  const bathFacts: ClinicalFact[] = [];
  if (bath.performed) {
    bathFacts.push({
      id: 'bath-performed',
      category: 'bath',
      sourceField: 'bath.performed',
      value: bath.performed,
      canonicalText: `Banho realizado: ${bath.performed}`,
    });
    if (bath.performed !== 'não' && bath.tolerance) {
      const tol = bath.tolerance === 'outra' && bath.toleranceCustom ? bath.toleranceCustom : bath.tolerance;
      bathFacts.push({
        id: 'bath-tolerance',
        category: 'bath',
        sourceField: 'bath.tolerance',
        value: tol,
        canonicalText: `Tolerância ao banho: ${tol}`,
      });
    }
  }
  if (bathFacts.length > 0) {
    facts.bath = bathFacts;
  }

  // 12. Care facts
  const care = data.care;
  if (Array.isArray(care.actions) && care.actions.length > 0) {
    const careFacts: ClinicalFact[] = care.actions.map((act, idx) => ({
      id: `care-action-${idx}`,
      category: 'care',
      sourceField: `care.actions[${idx}]`,
      value: act,
      canonicalText: act,
    }));
    if (care.otherCare) {
      careFacts.push({
        id: 'care-other',
        category: 'care',
        sourceField: 'care.otherCare',
        value: care.otherCare,
        canonicalText: care.otherCare,
      });
    }
    facts.care = careFacts;
  }

  // 13. Complications facts
  const comp = data.complications;
  const compFacts: ClinicalFact[] = [];
  if (comp.hasComplication === 'sim') {
    compFacts.push({
      id: 'comp-presence',
      category: 'complications',
      sourceField: 'complications.hasComplication',
      value: 'sim',
      canonicalText: 'Intercorrência registrada no plantão',
    });
    if (comp.description) {
      compFacts.push({
        id: 'comp-desc',
        category: 'complications',
        sourceField: 'complications.description',
        value: comp.description,
        canonicalText: `Intercorrência: ${comp.description}`,
      });
    }
    if (comp.conduct) {
      compFacts.push({
        id: 'comp-conduct',
        category: 'complications',
        sourceField: 'complications.conduct',
        value: comp.conduct,
        canonicalText: `Conduta realizada: ${comp.conduct}`,
      });
    }
    if (comp.communication) {
      compFacts.push({
        id: 'comp-communication',
        category: 'complications',
        sourceField: 'complications.communication',
        value: comp.communication,
        canonicalText: `Comunicação da intercorrência: ${comp.communication}`,
      });
    }
  } else if (comp.hasComplication === 'não' || comp.explicitNoComplications) {
    compFacts.push({
      id: 'comp-none',
      category: 'complications',
      sourceField: 'complications.explicitNoComplications',
      value: 'Sem intercorrências registradas no período.',
      canonicalText: 'Sem intercorrências registradas no período.',
    });
  }
  if (compFacts.length > 0) {
    facts.complications = compFacts;
  }

  // 14. Final Status facts
  const fs = data.finalStatus;
  const fsFacts: ClinicalFact[] = [];
  if (fs.status) {
    const sVal = fs.status === 'outro' && fs.details ? fs.details : fs.status;
    fsFacts.push({
      id: 'final-status',
      category: 'finalStatus',
      sourceField: 'finalStatus.status',
      value: sVal,
      canonicalText: `Situação final: ${sVal}`,
    });
  }
  if (fsFacts.length > 0) {
    facts.finalStatus = fsFacts;
  }

  return facts;
}
