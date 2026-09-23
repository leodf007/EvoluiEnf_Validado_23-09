import {
  TechnicianSurgicalClinicForm,
  createInitialTechnicianSurgicalClinicForm,
} from '../types/technicianSurgicalClinic';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import { AuthorizedFactFactory } from './factory/authorizedFactFactory';

/**
 * Normalizer for Technician Surgical Clinic Form.
 * Ensures consistent structures, trims whitespace, defaults nulls to undefined or empty,
 * without creating fabricated data.
 */
export function normalizeTechnicianSurgicalClinicData(
  form: Partial<TechnicianSurgicalClinicForm>
): TechnicianSurgicalClinicForm {
  const initial = createInitialTechnicianSurgicalClinicForm();

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
    surgicalContext: {
      situation: (form.surgicalContext?.situation?.trim() as any) || '',
      surgicalProcedure: form.surgicalContext?.surgicalProcedure?.trim() || '',
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
    wound: {
      hasDressing: (form.wound?.hasDressing?.trim() as any) || '',
      location: form.wound?.location?.trim(),
      condition: (form.wound?.condition?.trim() as any) || '',
      conditionDetails: form.wound?.conditionDetails?.trim(),
    },
    devices: Array.isArray(form.devices)
      ? form.devices.map((d) => ({
          ...d,
          location: d.location?.trim() || '',
          observations: d.observations?.trim(),
          drainAspect: d.drainAspect?.trim(),
        }))
      : [],
    nutrition: {
      route: (form.nutrition?.route?.trim() as any) || '',
      routeCustom: form.nutrition?.routeCustom?.trim(),
      oralAcceptance: (form.nutrition?.oralAcceptance?.trim() as any) || '',
      enteralDevice: (form.nutrition?.enteralDevice?.trim() as any) || '',
      enteralDeviceCustom: form.nutrition?.enteralDeviceCustom?.trim(),
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
    mobility: {
      ambulation: (form.mobility?.ambulation?.trim() as any) || '',
      assistance: (form.mobility?.assistance?.trim() as any) || '',
    },
    bath: {
      performed: (form.bath?.performed?.trim() as any) || '',
      tolerance: form.bath?.tolerance?.trim(),
    },
    care: {
      actions: Array.isArray(form.care?.actions)
        ? form.care!.actions.map((a) => a.trim()).filter(Boolean)
        : [],
      otherCare: form.care?.otherCare?.trim(),
    },
    complications: {
      hasComplication: (form.complications?.hasComplication?.trim() as any) || '',
      description: form.complications?.description?.trim(),
      conduct: form.complications?.conduct?.trim(),
      communication: form.complications?.communication?.trim(),
    },
    finalStatus: {
      status: (form.finalStatus?.status?.trim() as any) || '',
      details: form.finalStatus?.details?.trim(),
    },
  };
}

/**
 * Builds strictly authorized clinical facts for Technician Surgical Clinic.
 * Guarantees zero unverified claims and no pre-assumed inferences.
 */
export function buildSurgicalClinicAuthorizedFacts(
  rawForm: TechnicianSurgicalClinicForm
): AuthorizedClinicalFacts {
  const form = normalizeTechnicianSurgicalClinicData(rawForm);
  const facts: AuthorizedClinicalFacts = {
    context: [],
    surgicalContext: [],
    general: [],
    pain: [],
    vitalSigns: [],
    respiratory: [],
    wound: [],
    devices: [],
    nutrition: [],
    eliminations: [],
    mobility: [],
    bath: [],
    care: [],
    complications: [],
    finalStatus: [],
  };

  // 1. Context & Identification
  if (form.context.moment) {
    facts.context!.push(
      AuthorizedFactFactory.createFact(
        'ctx-moment',
        'context',
        'moment',
        form.context.moment,
        form.context.moment,
        'high'
      )
    );
  }

  const loc = form.context.location === 'Outro' && form.context.locationCustom
    ? form.context.locationCustom
    : form.context.location;
  if (loc) {
    facts.context!.push(
      AuthorizedFactFactory.createFact(
        'ctx-location',
        'context',
        'location',
        loc,
        loc,
        'high'
      )
    );
  }

  const acc = form.context.accompaniment === 'outro' && form.context.accompanimentCustom
    ? form.context.accompanimentCustom
    : form.context.accompaniment;
  if (acc) {
    facts.context!.push(
      AuthorizedFactFactory.createFact(
        'ctx-accompaniment',
        'context',
        'accompaniment',
        acc,
        acc,
        'high'
      )
    );
  }

  if (form.context.wristbandChecked) {
    facts.context!.push(
      AuthorizedFactFactory.createFact(
        'ctx-wristband',
        'context',
        'wristbandChecked',
        true,
        'pulseira de identificação checada',
        'high'
      )
    );
  }

  if (form.context.bedSignChecked) {
    facts.context!.push(
      AuthorizedFactFactory.createFact(
        'ctx-bedsign',
        'context',
        'bedSignChecked',
        true,
        'identificação do leito checada',
        'high'
      )
    );
  }

  const prec = form.context.precaution === 'outra' && form.context.precautionCustom
    ? form.context.precautionCustom
    : form.context.precaution;
  if (prec) {
    facts.context!.push(
      AuthorizedFactFactory.createFact(
        'ctx-precaution',
        'context',
        'precaution',
        prec,
        `precaução ${prec}`,
        'high'
      )
    );
  }

  // 2. Surgical Context (Informações Cirúrgicas Registradas)
  if (form.surgicalContext.situation) {
    facts.surgicalContext!.push(
      AuthorizedFactFactory.createFact(
        'surg-situation',
        'surgicalContext',
        'situation',
        form.surgicalContext.situation,
        form.surgicalContext.situation,
        'high'
      )
    );
  }

  if (form.surgicalContext.surgicalProcedure) {
    facts.surgicalContext!.push(
      AuthorizedFactFactory.createFact(
        'surg-procedure',
        'surgicalContext',
        'surgicalProcedure',
        form.surgicalContext.surgicalProcedure,
        form.surgicalContext.surgicalProcedure,
        'high'
      )
    );
  }

  // 3. General Assessment
  const state = form.generalAssessment.observedState === 'outro' && form.generalAssessment.observedStateCustom
    ? form.generalAssessment.observedStateCustom
    : form.generalAssessment.observedState;
  if (state) {
    facts.general!.push(
      AuthorizedFactFactory.createFact(
        'gen-state',
        'general',
        'observedState',
        state,
        state,
        'high'
      )
    );
  }

  if (form.generalAssessment.complaints) {
    facts.general!.push(
      AuthorizedFactFactory.createFact(
        'gen-complaints',
        'general',
        'complaints',
        form.generalAssessment.complaints,
        form.generalAssessment.complaints,
        'high'
      )
    );
  }

  if (form.generalAssessment.complaintsDetails) {
    facts.general!.push(
      AuthorizedFactFactory.createFact(
        'gen-complaints-details',
        'general',
        'complaintsDetails',
        form.generalAssessment.complaintsDetails,
        form.generalAssessment.complaintsDetails,
        'high'
      )
    );
  }

  if (form.generalAssessment.source) {
    facts.general!.push(
      AuthorizedFactFactory.createFact(
        'gen-source',
        'general',
        'source',
        form.generalAssessment.source,
        `relatado por ${form.generalAssessment.source}`,
        'high'
      )
    );
  }

  if (form.generalAssessment.hygiene) {
    facts.general!.push(
      AuthorizedFactFactory.createFact(
        'gen-hygiene',
        'general',
        'hygiene',
        form.generalAssessment.hygiene,
        `higiene ${form.generalAssessment.hygiene}`,
        'high'
      )
    );
  }

  if (form.generalAssessment.mobility) {
    facts.general!.push(
      AuthorizedFactFactory.createFact(
        'gen-mobility',
        'general',
        'mobility',
        form.generalAssessment.mobility,
        form.generalAssessment.mobility,
        'high'
      )
    );
  }

  // 4. Pain Assessment
  if (form.pain.status) {
    facts.pain!.push(
      AuthorizedFactFactory.createFact(
        'pain-status',
        'pain',
        'status',
        form.pain.status,
        form.pain.status,
        'high'
      )
    );
  }

  if (form.pain.numericScaleValue !== undefined && form.pain.status !== 'sem dor') {
    facts.pain!.push(
      AuthorizedFactFactory.createFact(
        'pain-scale',
        'pain',
        'numericScaleValue',
        form.pain.numericScaleValue,
        `escala numérica de dor ${form.pain.numericScaleValue}/10`,
        'high'
      )
    );
  }

  if (form.pain.location) {
    facts.pain!.push(
      AuthorizedFactFactory.createFact(
        'pain-location',
        'pain',
        'location',
        form.pain.location,
        `localização da dor referida em ${form.pain.location}`,
        'high'
      )
    );
  }

  // 5. Vital Signs
  if (form.vitalSigns.systolicBP && form.vitalSigns.diastolicBP) {
    facts.vitalSigns!.push(
      AuthorizedFactFactory.createFact(
        'vital-pa',
        'vitalSigns',
        'bloodPressure',
        `${form.vitalSigns.systolicBP}x${form.vitalSigns.diastolicBP}`,
        `PA: ${form.vitalSigns.systolicBP}x${form.vitalSigns.diastolicBP} mmHg`,
        'high'
      )
    );
  }

  // Manual MAP - strictly preserve verbatim, never compute, never classify
  if (form.vitalSigns.meanArterialPressure) {
    facts.vitalSigns!.push(
      AuthorizedFactFactory.createFact(
        'vital-pam',
        'vitalSigns',
        'meanArterialPressure',
        form.vitalSigns.meanArterialPressure,
        `PAM aferida: ${form.vitalSigns.meanArterialPressure} mmHg`,
        'high'
      )
    );
  }

  if (form.vitalSigns.heartRate) {
    facts.vitalSigns!.push(
      AuthorizedFactFactory.createFact(
        'vital-fc',
        'vitalSigns',
        'heartRate',
        form.vitalSigns.heartRate,
        `FC: ${form.vitalSigns.heartRate} bpm`,
        'high'
      )
    );
  }

  if (form.vitalSigns.respiratoryRate) {
    facts.vitalSigns!.push(
      AuthorizedFactFactory.createFact(
        'vital-fr',
        'vitalSigns',
        'respiratoryRate',
        form.vitalSigns.respiratoryRate,
        `FR: ${form.vitalSigns.respiratoryRate} irpm`,
        'high'
      )
    );
  }

  if (form.vitalSigns.oxygenSaturation) {
    facts.vitalSigns!.push(
      AuthorizedFactFactory.createFact(
        'vital-spo2',
        'vitalSigns',
        'oxygenSaturation',
        form.vitalSigns.oxygenSaturation,
        `SpO2: ${form.vitalSigns.oxygenSaturation}%`,
        'high'
      )
    );
  }

  if (form.vitalSigns.temperature) {
    facts.vitalSigns!.push(
      AuthorizedFactFactory.createFact(
        'vital-temp',
        'vitalSigns',
        'temperature',
        form.vitalSigns.temperature,
        `Tax: ${form.vitalSigns.temperature} °C`,
        'high'
      )
    );
  }

  if (form.vitalSigns.capillaryBloodGlucose) {
    facts.vitalSigns!.push(
      AuthorizedFactFactory.createFact(
        'vital-glicemia',
        'vitalSigns',
        'capillaryBloodGlucose',
        form.vitalSigns.capillaryBloodGlucose,
        `HGT: ${form.vitalSigns.capillaryBloodGlucose} mg/dL`,
        'high'
      )
    );
  }

  // 6. Respiratory Support
  if (form.respiratory.support) {
    facts.respiratory!.push(
      AuthorizedFactFactory.createFact(
        'resp-support',
        'respiratory',
        'support',
        form.respiratory.support,
        form.respiratory.support,
        'high'
      )
    );
  }

  const pat = form.respiratory.pattern === 'outro' && form.respiratory.patternCustom
    ? form.respiratory.patternCustom
    : form.respiratory.pattern;
  if (pat) {
    facts.respiratory!.push(
      AuthorizedFactFactory.createFact(
        'resp-pattern',
        'respiratory',
        'pattern',
        pat,
        `padrão respiratório ${pat}`,
        'high'
      )
    );
  }

  if (form.respiratory.discomfort) {
    facts.respiratory!.push(
      AuthorizedFactFactory.createFact(
        'resp-discomfort',
        'respiratory',
        'discomfort',
        form.respiratory.discomfort,
        `desconforto respiratório ${form.respiratory.discomfort}`,
        'high'
      )
    );
  }

  const oxDev = form.respiratory.oxygenDevice === 'outro' && form.respiratory.oxygenDeviceCustom
    ? form.respiratory.oxygenDeviceCustom
    : form.respiratory.oxygenDevice;
  if (oxDev) {
    facts.respiratory!.push(
      AuthorizedFactFactory.createFact(
        'resp-ox-device',
        'respiratory',
        'oxygenDevice',
        oxDev,
        oxDev,
        'high'
      )
    );
  }

  if (form.respiratory.oxygenFlow) {
    facts.respiratory!.push(
      AuthorizedFactFactory.createFact(
        'resp-ox-flow',
        'respiratory',
        'oxygenFlow',
        form.respiratory.oxygenFlow,
        `${form.respiratory.oxygenFlow} L/min`,
        'high'
      )
    );
  }

  // 7. Wound & Dressing Assessment
  if (form.wound.hasDressing) {
    facts.wound!.push(
      AuthorizedFactFactory.createFact(
        'wound-has-dressing',
        'wound',
        'hasDressing',
        form.wound.hasDressing,
        form.wound.hasDressing === 'sim' ? 'possui curativo em ferida cirúrgica' : 'sem curativo cirúrgico',
        'high'
      )
    );
  }

  if (form.wound.hasDressing === 'sim') {
    if (form.wound.location) {
      facts.wound!.push(
        AuthorizedFactFactory.createFact(
          'wound-location',
          'wound',
          'location',
          form.wound.location,
          `em ${form.wound.location}`,
          'high'
        )
      );
    }

    if (form.wound.condition) {
      facts.wound!.push(
        AuthorizedFactFactory.createFact(
          'wound-condition',
          'wound',
          'condition',
          form.wound.condition,
          `curativo ${form.wound.condition}`,
          'high'
        )
      );
    }

    if (form.wound.conditionDetails) {
      facts.wound!.push(
        AuthorizedFactFactory.createFact(
          'wound-condition-details',
          'wound',
          'conditionDetails',
          form.wound.conditionDetails,
          form.wound.conditionDetails,
          'high'
        )
      );
    }
  }

  // 8. Drains & Invasive Devices
  form.devices.forEach((dev, idx) => {
    const devType = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type;
    const parts: string[] = [devType];
    if (dev.location) parts.push(`em ${dev.location}`);

    if ((dev as any).permeable !== undefined) {
      parts.push((dev as any).permeable ? 'pérvio' : 'obstruído');
    } else if (dev.permeability) {
      parts.push(typeof dev.permeability === 'string' ? dev.permeability.toLowerCase() : 'pérvio');
    }

    if (dev.functioning !== undefined) {
      if (typeof dev.functioning === 'boolean') {
        parts.push(dev.functioning ? 'em funcionamento' : 'não funcionante');
      } else if (typeof dev.functioning === 'string') {
        const lower = dev.functioning.toLowerCase();
        parts.push(lower === 'funcionante' ? 'em funcionamento' : lower);
      }
    }

    if (dev.drainAspect) parts.push(`aspecto do débito: ${dev.drainAspect}`);

    const id = dev.id ? `dev-${dev.id}` : `dev-item-${idx}`;
    const valueStr = parts.join(', ');

    facts.devices!.push(
      AuthorizedFactFactory.createFact(
        id,
        'devices',
        `devices[${idx}]`,
        valueStr,
        valueStr,
        'high'
      )
    );
  });

  // 9. Nutrition
  const nutRoute = form.nutrition.route === 'outra' && form.nutrition.routeCustom
    ? form.nutrition.routeCustom
    : form.nutrition.route;
  if (nutRoute) {
    facts.nutrition!.push(
      AuthorizedFactFactory.createFact(
        'nut-route',
        'nutrition',
        'route',
        nutRoute,
        `dieta ${nutRoute}`,
        'high'
      )
    );
  }

  if (form.nutrition.oralAcceptance && form.nutrition.route === 'oral') {
    facts.nutrition!.push(
      AuthorizedFactFactory.createFact(
        'nut-oral-acceptance',
        'nutrition',
        'oralAcceptance',
        form.nutrition.oralAcceptance,
        `aceitação oral ${form.nutrition.oralAcceptance}`,
        'high'
      )
    );
  }

  const entDev = form.nutrition.enteralDevice === 'outra' && form.nutrition.enteralDeviceCustom
    ? form.nutrition.enteralDeviceCustom
    : form.nutrition.enteralDevice;
  if (entDev && form.nutrition.route === 'enteral') {
    facts.nutrition!.push(
      AuthorizedFactFactory.createFact(
        'nut-enteral-device',
        'nutrition',
        'enteralDevice',
        entDev,
        `via ${entDev}`,
        'high'
      )
    );
  }

  if (form.nutrition.enteralRate && form.nutrition.route === 'enteral') {
    facts.nutrition!.push(
      AuthorizedFactFactory.createFact(
        'nut-enteral-rate',
        'nutrition',
        'enteralRate',
        form.nutrition.enteralRate,
        `infusão a ${form.nutrition.enteralRate}`,
        'high'
      )
    );
  }

  if (form.nutrition.enteralTolerance && form.nutrition.route === 'enteral') {
    facts.nutrition!.push(
      AuthorizedFactFactory.createFact(
        'nut-enteral-tolerance',
        'nutrition',
        'enteralTolerance',
        form.nutrition.enteralTolerance,
        `tolerância enteral: ${form.nutrition.enteralTolerance}`,
        'high'
      )
    );
  }

  // 10. Eliminations
  if (form.eliminations.urinary) {
    facts.eliminations!.push(
      AuthorizedFactFactory.createFact(
        'elim-urinary',
        'eliminations',
        'urinary',
        form.eliminations.urinary,
        `diurese ${form.eliminations.urinary}`,
        'high'
      )
    );
  }

  const uRoute = form.eliminations.urinaryRoute === 'outra' && form.eliminations.urinaryRouteCustom
    ? form.eliminations.urinaryRouteCustom
    : form.eliminations.urinaryRoute;
  if (uRoute) {
    facts.eliminations!.push(
      AuthorizedFactFactory.createFact(
        'elim-urinary-route',
        'eliminations',
        'urinaryRoute',
        uRoute,
        `via ${uRoute}`,
        'high'
      )
    );
  }

  if (form.eliminations.bowel) {
    facts.eliminations!.push(
      AuthorizedFactFactory.createFact(
        'elim-bowel',
        'eliminations',
        'bowel',
        form.eliminations.bowel,
        `evacuação ${form.eliminations.bowel}`,
        'high'
      )
    );
  }

  const bAspect = form.eliminations.bowelAspect === 'outro' && form.eliminations.bowelAspectCustom
    ? form.eliminations.bowelAspectCustom
    : form.eliminations.bowelAspect;
  if (bAspect) {
    facts.eliminations!.push(
      AuthorizedFactFactory.createFact(
        'elim-bowel-aspect',
        'eliminations',
        'bowelAspect',
        bAspect,
        `aspecto fecal ${bAspect}`,
        'high'
      )
    );
  }

  // 11. Mobility
  if (form.mobility.ambulation) {
    facts.mobility!.push(
      AuthorizedFactFactory.createFact(
        'mob-ambulation',
        'mobility',
        'ambulation',
        form.mobility.ambulation,
        `deambulação ${form.mobility.ambulation}`,
        'high'
      )
    );
  }

  if (form.mobility.assistance) {
    facts.mobility!.push(
      AuthorizedFactFactory.createFact(
        'mob-assistance',
        'mobility',
        'assistance',
        form.mobility.assistance,
        form.mobility.assistance,
        'high'
      )
    );
  }

  // 12. Bath & Comfort
  if (form.bath.performed) {
    facts.bath!.push(
      AuthorizedFactFactory.createFact(
        'bath-type',
        'bath',
        'performed',
        form.bath.performed,
        form.bath.performed,
        'high'
      )
    );
  }

  if (form.bath.tolerance && form.bath.performed !== 'não realizado') {
    facts.bath!.push(
      AuthorizedFactFactory.createFact(
        'bath-tolerance',
        'bath',
        'tolerance',
        form.bath.tolerance,
        `tolerância ao banho: ${form.bath.tolerance}`,
        'high'
      )
    );
  }

  // 13. Nursing Care
  form.care.actions.forEach((act, idx) => {
    facts.care!.push(
      AuthorizedFactFactory.createFact(
        `care-action-${idx}`,
        'care',
        `actions[${idx}]`,
        act,
        act,
        'high'
      )
    );
  });

  if (form.care.otherCare) {
    facts.care!.push(
      AuthorizedFactFactory.createFact(
        'care-other',
        'care',
        'otherCare',
        form.care.otherCare,
        form.care.otherCare,
        'high'
      )
    );
  }

  // 14. Complications
  if (form.complications.hasComplication === 'não') {
    facts.complications!.push(
      AuthorizedFactFactory.createFact(
        'comp-none',
        'complications',
        'hasComplication',
        'não',
        'sem intercorrências no período',
        'high'
      )
    );
  } else if (form.complications.hasComplication === 'sim') {
    facts.complications!.push(
      AuthorizedFactFactory.createFact(
        'comp-presence',
        'complications',
        'hasComplication',
        'sim',
        'intercorrência registrada',
        'high'
      )
    );

    if (form.complications.description) {
      facts.complications!.push(
        AuthorizedFactFactory.createFact(
          'comp-desc',
          'complications',
          'description',
          form.complications.description,
          form.complications.description,
          'high'
        )
      );
    }

    if (form.complications.conduct) {
      facts.complications!.push(
        AuthorizedFactFactory.createFact(
          'comp-conduct',
          'complications',
          'conduct',
          form.complications.conduct,
          form.complications.conduct,
          'high'
        )
      );
    }

    if (form.complications.communication) {
      facts.complications!.push(
        AuthorizedFactFactory.createFact(
          'comp-communication',
          'complications',
          'communication',
          form.complications.communication,
          form.complications.communication,
          'high'
        )
      );
    }
  }

  // 15. Final Status
  if (form.finalStatus.status) {
    const text = form.finalStatus.details
      ? `${form.finalStatus.status} (${form.finalStatus.details})`
      : form.finalStatus.status;
    facts.finalStatus!.push(
      AuthorizedFactFactory.createFact(
        'final-status',
        'finalStatus',
        'status',
        text,
        text,
        'high'
      )
    );
  }

  return facts;
}

export interface ClinicalConsistencyAlert {
  code: string;
  ruleId: string;
  category: string;
  message: string;
  severity: 'warning' | 'info';
  isBlocking: false;
  field?: string;
}

/**
 * Consistency Validator for Technician Surgical Clinic.
 * Implements TECH-SC-CONS-001 through TECH-SC-CONS-008.
 * Guarantees all alerts are NON-BLOCKING (isBlocking: false).
 */
export function validateTechnicianSurgicalClinicConsistency(
  form: TechnicianSurgicalClinicForm
): ClinicalConsistencyAlert[] {
  const alerts: ClinicalConsistencyAlert[] = [];

  // TECH-SC-CONS-001: Pós-operatório informado sem procedimento preenchido
  const isPostOp =
    form.surgicalContext.situation === 'pós-operatório imediato' ||
    form.surgicalContext.situation === 'pós-operatório mediato' ||
    form.surgicalContext.situation === 'acompanhamento clínico pós-cirúrgico';

  if (isPostOp && !form.surgicalContext.surgicalProcedure.trim()) {
    alerts.push({
      code: 'TECH-SC-CONS-001',
      ruleId: 'TECH-SC-CONS-001',
      category: 'surgicalContext',
      message: 'Situação pós-operatória informada sem o procedimento cirúrgico preenchido.',
      severity: 'warning',
      isBlocking: false,
      field: 'surgicalProcedure',
    });
  }

  // TECH-SC-CONS-002: Curativo informado sem localização
  if (form.wound.hasDressing === 'sim' && !form.wound.location?.trim()) {
    alerts.push({
      code: 'TECH-SC-CONS-002',
      ruleId: 'TECH-SC-CONS-002',
      category: 'wound',
      message: 'Curativo cirúrgico informado como presente, mas a localização anatômica não foi especificada.',
      severity: 'warning',
      isBlocking: false,
      field: 'wound.location',
    });
  }

  // TECH-SC-CONS-003: Dreno informado sem localização
  if (Array.isArray(form.devices)) {
    const drainWithoutLoc = form.devices.some((dev) => {
      const isDrain =
        /dreno/i.test(dev.type) ||
        /dreno/i.test(dev.customType || '');
      return isDrain && !dev.location?.trim();
    });

    if (drainWithoutLoc) {
      alerts.push({
        code: 'TECH-SC-CONS-003',
        ruleId: 'TECH-SC-CONS-003',
        category: 'devices',
        message: 'Dispositivo tipo dreno informado sem a localização anatômica de inserção.',
        severity: 'warning',
        isBlocking: false,
        field: 'devices.location',
      });
    }
  }

  // TECH-SC-CONS-004: Dieta enteral sem dispositivo
  if (form.nutrition.route === 'enteral') {
    const dev = form.nutrition.enteralDevice === 'outra'
      ? form.nutrition.enteralDeviceCustom
      : form.nutrition.enteralDevice;
    if (!dev?.trim()) {
      alerts.push({
        code: 'TECH-SC-CONS-004',
        ruleId: 'TECH-SC-CONS-004',
        category: 'nutrition',
        message: 'Dieta enteral informada sem indicação do dispositivo de administração (SNE, SNG, GTT).',
        severity: 'warning',
        isBlocking: false,
        field: 'nutrition.enteralDevice',
      });
    }
  }

  // TECH-SC-CONS-005: Banho não realizado com tolerância preenchida
  if (form.bath.performed === 'não realizado' && Boolean(form.bath.tolerance?.trim())) {
    alerts.push({
      code: 'TECH-SC-CONS-005',
      ruleId: 'TECH-SC-CONS-005',
      category: 'bath',
      message: 'Banho assinalado como não realizado, porém a tolerância ao banho foi preenchida.',
      severity: 'warning',
      isBlocking: false,
      field: 'bath.tolerance',
    });
  }

  // TECH-SC-CONS-006: Intercorrência sim sem descrição
  if (form.complications.hasComplication === 'sim' && !form.complications.description?.trim()) {
    alerts.push({
      code: 'TECH-SC-CONS-006',
      ruleId: 'TECH-SC-CONS-006',
      category: 'complications',
      message: 'Intercorrência assinalada como presente sem descrição do ocorrido.',
      severity: 'warning',
      isBlocking: false,
      field: 'complications.description',
    });
  }

  // TECH-SC-CONS-007: Paciente restrito ao leito e deambula sem auxílio
  const isBedridden = form.generalAssessment.mobility === 'restrito ao leito';
  const isAmbulatingUnaided =
    form.mobility.ambulation === 'realizada' && form.mobility.assistance === 'sem auxílio';

  if (isBedridden && isAmbulatingUnaided) {
    alerts.push({
      code: 'TECH-SC-CONS-007',
      ruleId: 'TECH-SC-CONS-007',
      category: 'mobility',
      message: 'Incoerência de mobilidade: paciente registrado como restrito ao leito na avaliação geral, mas com registro de deambulação realizada sem auxílio.',
      severity: 'warning',
      isBlocking: false,
      field: 'mobility.ambulation',
    });
  }

  // TECH-SC-CONS-008: Cenário coerente sem alertas
  // When no inconsistencies are detected, returns an empty array.
  return alerts;
}
