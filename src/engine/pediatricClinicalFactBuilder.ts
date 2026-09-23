import {
  TechnicianPediatricNursingNoteForm,
  PediatricAgeGroup,
  PediatricInformationSource,
} from '../types/technicianPediatricNursingNote';
import { ClinicalFact as AuthorizedClinicalFact, AuthorizedClinicalFacts } from './types';
import { AuthorizedFactFactory } from './factory/authorizedFactFactory';
import { NarrativeSegment } from './factory/types';

export class PrivacyGuard {
  static redact(text: string): string {
    if (!text) return '';
    return text
      .replace(/\b(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})\b/g, '[REMOVIDO]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REMOVIDO]')
      .replace(/\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})\b/g, '[REMOVIDO]')
      .replace(/\b(?:prontu[aá]rio|pront|pront\.|prontu[aá]rio\s*n[ºo°.]?)\s*:?\s*(\d{3,12})\b/gi, '[REMOVIDO]')
      .replace(/\b(?:rg|rg:)\s*(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]|\d{7,10})\b/gi, '[REMOVIDO]')
      .replace(/\b(?:cns|cns:)\s*(\d{15})\b/gi, '[REMOVIDO]');
  }
}

export interface PediatricConsistencyAlert {
  code: string;
  ruleId: string;
  category: string;
  message: string;
  severity: 'warning' | 'error';
  isBlocking: boolean;
  field: string;
}

/**
 * Normalizes pediatric nursing note form data deterministically.
 */
export function normalizeTechnicianPediatricForm(
  form: TechnicianPediatricNursingNoteForm
): TechnicianPediatricNursingNoteForm {
  const sanitize = (val: string | undefined): string => {
    if (!val) return '';
    return PrivacyGuard.redact(val.trim());
  };

  const normalized: TechnicianPediatricNursingNoteForm = JSON.parse(JSON.stringify(form));

  // 1. Context
  normalized.context.moment = (form.context.moment?.trim() || '') as any;
  normalized.context.location = (form.context.location?.trim() || '') as any;
  normalized.context.locationCustom = sanitize(form.context.locationCustom);
  normalized.context.infoSource = (form.context.infoSource?.trim() || '') as any;

  // 2. Accompaniment
  normalized.accompaniment.present = (form.accompaniment.present?.trim() || '') as any;
  if (normalized.accompaniment.present === 'Sim') {
    normalized.accompaniment.relationship = (form.accompaniment.relationship?.trim() || '') as any;
    normalized.accompaniment.relationshipCustom = sanitize(form.accompaniment.relationshipCustom);
  } else {
    normalized.accompaniment.relationship = '';
    normalized.accompaniment.relationshipCustom = '';
  }

  // 3. General Characteristics
  normalized.generalCharacteristics.ageGroup = (form.generalCharacteristics.ageGroup?.trim() || '') as PediatricAgeGroup;
  normalized.generalCharacteristics.reportedAge = sanitize(form.generalCharacteristics.reportedAge);
  normalized.generalCharacteristics.weight = sanitize(form.generalCharacteristics.weight);
  normalized.generalCharacteristics.height = sanitize(form.generalCharacteristics.height);

  // 4. Vitals
  normalized.vitalSigns.systolicBP = sanitize(form.vitalSigns.systolicBP);
  normalized.vitalSigns.diastolicBP = sanitize(form.vitalSigns.diastolicBP);
  normalized.vitalSigns.meanArterialPressure = sanitize(form.vitalSigns.meanArterialPressure);
  normalized.vitalSigns.heartRate = sanitize(form.vitalSigns.heartRate);
  normalized.vitalSigns.respiratoryRate = sanitize(form.vitalSigns.respiratoryRate);
  normalized.vitalSigns.oxygenSaturation = sanitize(form.vitalSigns.oxygenSaturation);
  normalized.vitalSigns.temperature = sanitize(form.vitalSigns.temperature);
  normalized.vitalSigns.capillaryBloodGlucose = sanitize(form.vitalSigns.capillaryBloodGlucose);

  // 5. Pain
  normalized.pain.method = (form.pain.method?.trim() || '') as any;
  normalized.pain.score = sanitize(form.pain.score);
  normalized.pain.reportedDetails = sanitize(form.pain.reportedDetails);
  normalized.pain.infoSource = (form.pain.infoSource?.trim() || '') as any;

  // 6. Neuro/Behavior
  normalized.neuroBehavior.communication = (form.neuroBehavior.communication?.trim() || '') as any;
  normalized.neuroBehavior.behavior = (form.neuroBehavior.behavior || []).map((b) => b.trim() as any).filter(Boolean);
  normalized.neuroBehavior.behaviorCustom = sanitize(form.neuroBehavior.behaviorCustom);
  normalized.neuroBehavior.complaint = sanitize(form.neuroBehavior.complaint);
  normalized.neuroBehavior.complaintSource = (form.neuroBehavior.complaintSource?.trim() || '') as any;

  // 7. Respiratory
  normalized.respiratory.support = (form.respiratory.support?.trim() || '') as any;
  if (normalized.respiratory.support === 'Oxigenoterapia') {
    normalized.respiratory.oxygenDevice = (form.respiratory.oxygenDevice?.trim() || '') as any;
    normalized.respiratory.oxygenFlow = sanitize(form.respiratory.oxygenFlow);
  } else {
    normalized.respiratory.oxygenDevice = '';
    normalized.respiratory.oxygenFlow = '';
  }
  normalized.respiratory.vmiMode = sanitize(form.respiratory.vmiMode);
  normalized.respiratory.observations = sanitize(form.respiratory.observations);

  // 8. Cardiovascular
  normalized.cardiovascular.perfusion = (form.cardiovascular.perfusion?.trim() || '') as any;
  normalized.cardiovascular.extremities = (form.cardiovascular.extremities?.trim() || '') as any;
  normalized.cardiovascular.edema = (form.cardiovascular.edema?.trim() || '') as any;
  if (normalized.cardiovascular.edema === 'Presente') {
    normalized.cardiovascular.edemaLocation = sanitize(form.cardiovascular.edemaLocation);
  } else {
    normalized.cardiovascular.edemaLocation = '';
  }
  normalized.cardiovascular.observations = sanitize(form.cardiovascular.observations);

  // 9. Nutrition
  normalized.nutrition.route = (form.nutrition.route?.trim() || '') as any;
  if (normalized.nutrition.route === 'Oral') {
    normalized.nutrition.oralAcceptance = (form.nutrition.oralAcceptance?.trim() || '') as any;
    normalized.nutrition.enteralDevice = '';
    normalized.nutrition.enteralRate = '';
    normalized.nutrition.enteralTolerance = '';
  } else if (normalized.nutrition.route === 'Enteral') {
    normalized.nutrition.oralAcceptance = '';
    normalized.nutrition.enteralDevice = (form.nutrition.enteralDevice?.trim() || '') as any;
    normalized.nutrition.enteralDeviceCustom = sanitize(form.nutrition.enteralDeviceCustom);
    normalized.nutrition.enteralRate = sanitize(form.nutrition.enteralRate);
    normalized.nutrition.enteralTolerance = (form.nutrition.enteralTolerance?.trim() || '') as any;
  } else {
    normalized.nutrition.oralAcceptance = '';
    normalized.nutrition.enteralDevice = '';
    normalized.nutrition.enteralRate = '';
    normalized.nutrition.enteralTolerance = '';
  }
  normalized.nutrition.breastfeeding = (form.nutrition.breastfeeding?.trim() || '') as any;

  // 10. Eliminations
  normalized.eliminations.urinary = (form.eliminations.urinary?.trim() || '') as any;
  normalized.eliminations.urinaryRoute = (form.eliminations.urinaryRoute?.trim() || '') as any;
  normalized.eliminations.urinaryAspect = sanitize(form.eliminations.urinaryAspect);
  normalized.eliminations.bowel = (form.eliminations.bowel?.trim() || '') as any;
  normalized.eliminations.bowelAspect = (form.eliminations.bowelAspect?.trim() || '') as any;
  normalized.eliminations.bowelAspectCustom = sanitize(form.eliminations.bowelAspectCustom);

  // 11. Devices
  normalized.devices = (form.devices || []).map((dev) => ({
    ...dev,
    location: sanitize(dev.location),
    drainAspect: sanitize(dev.drainAspect),
    observations: sanitize(dev.observations),
  }));

  // 12. Skin
  normalized.skin.integrity = (form.skin.integrity?.trim() || '') as any;
  normalized.skin.hydration = (form.skin.hydration?.trim() || '') as any;
  normalized.skin.lesionDescription = sanitize(form.skin.lesionDescription);
  normalized.skin.dressingPresent = (form.skin.dressingPresent?.trim() || '') as any;
  normalized.skin.dressingCondition = sanitize(form.skin.dressingCondition);

  // 13. Mobility and Safety
  normalized.mobilitySafety.mobility = (form.mobilitySafety.mobility?.trim() || '') as any;
  normalized.mobilitySafety.mobilityCustom = sanitize(form.mobilitySafety.mobilityCustom);
  normalized.mobilitySafety.guardRails = (form.mobilitySafety.guardRails?.trim() || '') as any;
  normalized.mobilitySafety.headOfBed = (form.mobilitySafety.headOfBed?.trim() || '') as any;
  normalized.mobilitySafety.bedsideAccompanist = (form.mobilitySafety.bedsideAccompanist?.trim() || '') as any;

  // 14. Hygiene and Bath
  normalized.hygieneBath.hygiene = (form.hygieneBath.hygiene?.trim() || '') as any;
  normalized.hygieneBath.bathPerformed = (form.hygieneBath.bathPerformed?.trim() || '') as any;
  if (normalized.hygieneBath.bathPerformed && normalized.hygieneBath.bathPerformed !== 'Não realizado') {
    normalized.hygieneBath.bathTolerance = (form.hygieneBath.bathTolerance?.trim() || '') as any;
  } else {
    normalized.hygieneBath.bathTolerance = '';
  }

  // 15. Care
  normalized.care.actions = (form.care.actions || []).map((a) => a.trim()).filter(Boolean);
  normalized.care.otherCare = sanitize(form.care.otherCare);

  // 16. Medications
  normalized.medications.administered = (form.medications.administered || []).map((m) => sanitize(m)).filter(Boolean);
  normalized.medications.notes = sanitize(form.medications.notes);

  // 17. Complications
  normalized.complications.hasComplication = (form.complications.hasComplication?.trim() || '') as any;
  if (normalized.complications.hasComplication === 'Sim') {
    normalized.complications.description = sanitize(form.complications.description);
    normalized.complications.carePerformed = sanitize(form.complications.carePerformed);
    normalized.complications.observedResponse = sanitize(form.complications.observedResponse);
    normalized.complications.communicated = (form.complications.communicated?.trim() || '') as any;
  } else {
    normalized.complications.description = '';
    normalized.complications.carePerformed = '';
    normalized.complications.observedResponse = '';
    normalized.complications.communicated = '';
  }

  // 18. Communication
  normalized.communication.hasCommunication = (form.communication.hasCommunication?.trim() || '') as any;
  if (normalized.communication.hasCommunication === 'Sim') {
    normalized.communication.recipient = (form.communication.recipient?.trim() || '') as any;
    normalized.communication.recipientCustom = sanitize(form.communication.recipientCustom);
    normalized.communication.reason = sanitize(form.communication.reason);
    normalized.communication.time = sanitize(form.communication.time);
  } else {
    normalized.communication.recipient = '';
    normalized.communication.recipientCustom = '';
    normalized.communication.reason = '';
    normalized.communication.time = '';
  }

  // 19. Final Status
  normalized.finalStatus.status = (form.finalStatus.status?.trim() || '') as any;
  normalized.finalStatus.statusCustom = sanitize(form.finalStatus.statusCustom);

  // 20. Additional Info
  normalized.additionalInfo = {
    notes: sanitize(form.additionalInfo?.notes),
  };

  return normalized;
}

/**
 * Builds AuthorizedClinicalFacts strictly from normalized pediatric form data.
 */
export function buildPediatricAuthorizedFacts(
  form: TechnicianPediatricNursingNoteForm
): AuthorizedClinicalFacts {
  const norm = normalizeTechnicianPediatricForm(form);  const facts: AuthorizedClinicalFacts = {
    context: [],
    general: [],
    vitals: [],
    pain: [],
    neurological: [],
    respiratory: [],
    cardiovascular: [],
    nutrition: [],
    eliminations: [],
    devices: [],
    skin: [],
    mobility: [],
    hygiene: [],
    care: [],
    medications: [],
    complications: [],
    communication: [],
    finalStatus: [],
    comparison: [],
  };

  const createPediatricFact = (
    id: string,
    category: string,
    sourceField: string,
    canonicalText: string,
    value: any
  ) => {
    return AuthorizedFactFactory.createFact(
      id,
      category,
      sourceField,
      value,
      canonicalText
    );
  };

  // 1. Context
  if (norm.context.moment) {
    facts.context!.push(
      createPediatricFact(
        'ped-ctx-moment',
        'context',
        'context.moment',
        `Momento: ${norm.context.moment}`,
        norm.context.moment
      )
    );
  }
  if (norm.context.location) {
    const loc = norm.context.location === 'Outro' && norm.context.locationCustom
      ? norm.context.locationCustom
      : norm.context.location;
    facts.context!.push(
      createPediatricFact(
        'ped-ctx-loc',
        'context',
        'context.location',
        `Local: ${loc}`,
        loc
      )
    );
  }
  if (norm.context.infoSource) {
    facts.context!.push(
      createPediatricFact(
        'ped-ctx-infosource',
        'context',
        'context.infoSource',
        `Fonte principal da informação: ${norm.context.infoSource}`,
        norm.context.infoSource
      )
    );
  }

  // 2. Accompaniment
  if (norm.accompaniment.present) {
    facts.general!.push(
      createPediatricFact(
        'ped-acc-present',
        'general',
        'accompaniment.present',
        `Presença de acompanhante/responsável: ${norm.accompaniment.present}`,
        norm.accompaniment.present
      )
    );
    if (norm.accompaniment.present === 'Sim' && norm.accompaniment.relationship) {
      const rel = norm.accompaniment.relationship === 'Outro' && norm.accompaniment.relationshipCustom
        ? norm.accompaniment.relationshipCustom
        : norm.accompaniment.relationship;
      facts.general!.push(
        createPediatricFact(
          'ped-acc-rel',
          'general',
          'accompaniment.relationship',
          `Relação com o paciente: ${rel}`,
          rel
        )
      );
    }
  }

  // 3. General Characteristics
  if (norm.generalCharacteristics.ageGroup) {
    facts.general!.push(
      createPediatricFact(
        'ped-gen-agegroup',
        'general',
        'generalCharacteristics.ageGroup',
        `Faixa etária: ${norm.generalCharacteristics.ageGroup}`,
        norm.generalCharacteristics.ageGroup
      )
    );
  }
  if (norm.generalCharacteristics.reportedAge) {
    facts.general!.push(
      createPediatricFact(
        'ped-gen-reportedage',
        'general',
        'generalCharacteristics.reportedAge',
        `Idade informada: ${norm.generalCharacteristics.reportedAge}`,
        norm.generalCharacteristics.reportedAge
      )
    );
  }
  if (norm.generalCharacteristics.weight) {
    const rawW = norm.generalCharacteristics.weight;
    const wStr = rawW.toLowerCase().includes('kg') ? rawW : `${rawW} kg`;
    facts.general!.push(
      createPediatricFact(
        'ped-gen-weight',
        'general',
        'generalCharacteristics.weight',
        `Peso: ${wStr}`,
        wStr
      )
    );
  }
  if (norm.generalCharacteristics.height) {
    const rawH = norm.generalCharacteristics.height;
    const hStr = rawH.toLowerCase().includes('cm') ? rawH : `${rawH} cm`;
    facts.general!.push(
      createPediatricFact(
        'ped-gen-height',
        'general',
        'generalCharacteristics.height',
        `Altura/comprimento: ${hStr}`,
        hStr
      )
    );
  }

  // 4. Vitals
  if (norm.vitalSigns.systolicBP && norm.vitalSigns.diastolicBP) {
    facts.vitals!.push(
      createPediatricFact(
        'ped-vit-bp',
        'vitals',
        'vitalSigns.bp',
        `PA: ${norm.vitalSigns.systolicBP}x${norm.vitalSigns.diastolicBP} mmHg`,
        `${norm.vitalSigns.systolicBP}x${norm.vitalSigns.diastolicBP}`
      )
    );
  }
  if (norm.vitalSigns.meanArterialPressure) {
    facts.vitals!.push(
      createPediatricFact(
        'ped-vit-pam',
        'vitals',
        'vitalSigns.meanArterialPressure',
        `PAM aferida: ${norm.vitalSigns.meanArterialPressure} mmHg`,
        norm.vitalSigns.meanArterialPressure
      )
    );
  }
  if (norm.vitalSigns.heartRate) {
    facts.vitals!.push(
      createPediatricFact(
        'ped-vit-hr',
        'vitals',
        'vitalSigns.heartRate',
        `FC: ${norm.vitalSigns.heartRate} bpm`,
        norm.vitalSigns.heartRate
      )
    );
  }
  if (norm.vitalSigns.respiratoryRate) {
    facts.vitals!.push(
      createPediatricFact(
        'ped-vit-rr',
        'vitals',
        'vitalSigns.respiratoryRate',
        `FR: ${norm.vitalSigns.respiratoryRate} irpm`,
        norm.vitalSigns.respiratoryRate
      )
    );
  }
  if (norm.vitalSigns.oxygenSaturation) {
    facts.vitals!.push(
      createPediatricFact(
        'ped-vit-spo2',
        'vitals',
        'vitalSigns.oxygenSaturation',
        `SpO₂: ${norm.vitalSigns.oxygenSaturation}%`,
        norm.vitalSigns.oxygenSaturation
      )
    );
  }
  if (norm.vitalSigns.temperature) {
    facts.vitals!.push(
      createPediatricFact(
        'ped-vit-temp',
        'vitals',
        'vitalSigns.temperature',
        `Temperatura: ${norm.vitalSigns.temperature} °C`,
        norm.vitalSigns.temperature
      )
    );
  }
  if (norm.vitalSigns.capillaryBloodGlucose) {
    facts.vitals!.push(
      createPediatricFact(
        'ped-vit-hgt',
        'vitals',
        'vitalSigns.capillaryBloodGlucose',
        `Glicemia capilar: ${norm.vitalSigns.capillaryBloodGlucose} mg/dL`,
        norm.vitalSigns.capillaryBloodGlucose
      )
    );
  }

  // 5. Pain
  if (norm.pain.method && norm.pain.method !== 'Não avaliada' && norm.pain.method !== 'Não informado') {
    let painText = `Método de avaliação da dor: ${norm.pain.method}`;
    if (norm.pain.score) {
      painText += ` (escore: ${norm.pain.score})`;
    }
    if (norm.pain.reportedDetails) {
      painText += ` - ${norm.pain.reportedDetails}`;
    }
    if (norm.pain.infoSource) {
      painText += ` [fonte: ${norm.pain.infoSource}]`;
    }
    facts.pain!.push(
      createPediatricFact(
        'ped-pain-assessment',
        'pain',
        'pain.method',
        painText,
        norm.pain.score || norm.pain.method
      )
    );
  } else if (norm.pain.method === 'Não avaliada') {
    facts.pain!.push(
      createPediatricFact(
        'ped-pain-not-assessed',
        'pain',
        'pain.method',
        'Dor não avaliada no momento',
        'Não avaliada'
      )
    );
  }

  // 6. Neuro/Behavior
  if (norm.neuroBehavior.communication) {
    facts.neurological!.push(
      createPediatricFact(
        'ped-neuro-comm',
        'neurological',
        'neuroBehavior.communication',
        `Comunicação: ${norm.neuroBehavior.communication}`,
        norm.neuroBehavior.communication
      )
    );
  }
  if (norm.neuroBehavior.behavior.length > 0) {
    const behStr = norm.neuroBehavior.behavior.join(', ');
    facts.neurological!.push(
      createPediatricFact(
        'ped-neuro-beh',
        'neurological',
        'neuroBehavior.behavior',
        `Comportamento observado: ${behStr}`,
        behStr
      )
    );
  }
  if (norm.neuroBehavior.complaint) {
    const srcStr = norm.neuroBehavior.complaintSource
      ? ` [informado por: ${norm.neuroBehavior.complaintSource}]`
      : '';
    facts.neurological!.push(
      createPediatricFact(
        'ped-neuro-complaint',
        'neurological',
        'neuroBehavior.complaint',
        `Queixa registrada${srcStr}: "${norm.neuroBehavior.complaint}"`,
        norm.neuroBehavior.complaint
      )
    );
  }

  // 7. Respiratory
  if (norm.respiratory.support) {
    let respText = `Suporte ventilatório: ${norm.respiratory.support}`;
    if (norm.respiratory.support === 'Oxigenoterapia' && norm.respiratory.oxygenDevice) {
      respText += ` (${norm.respiratory.oxygenDevice}${norm.respiratory.oxygenFlow ? ` a ${norm.respiratory.oxygenFlow} L/min` : ''})`;
    } else if (norm.respiratory.support === 'VMI' && norm.respiratory.vmiMode) {
      respText += ` (modo: ${norm.respiratory.vmiMode})`;
    }
    if (norm.respiratory.observations) {
      respText += ` - ${norm.respiratory.observations}`;
    }
    facts.respiratory!.push(
      createPediatricFact(
        'ped-resp-support',
        'respiratory',
        'respiratory.support',
        respText,
        norm.respiratory.support
      )
    );
  }

  // 8. Cardiovascular
  if (norm.cardiovascular.perfusion) {
    facts.cardiovascular!.push(
      createPediatricFact(
        'ped-cv-perf',
        'cardiovascular',
        'cardiovascular.perfusion',
        `Perfusão periférica: ${norm.cardiovascular.perfusion}`,
        norm.cardiovascular.perfusion
      )
    );
  }
  if (norm.cardiovascular.extremities) {
    facts.cardiovascular!.push(
      createPediatricFact(
        'ped-cv-ext',
        'cardiovascular',
        'cardiovascular.extremities',
        `Extremidades: ${norm.cardiovascular.extremities}`,
        norm.cardiovascular.extremities
      )
    );
  }
  if (norm.cardiovascular.edema) {
    const edStr = norm.cardiovascular.edema === 'Presente' && norm.cardiovascular.edemaLocation
      ? `Edema presente em: ${norm.cardiovascular.edemaLocation}`
      : `Edema: ${norm.cardiovascular.edema}`;
    facts.cardiovascular!.push(
      createPediatricFact(
        'ped-cv-edema',
        'cardiovascular',
        'cardiovascular.edema',
        edStr,
        norm.cardiovascular.edema
      )
    );
  }
  if (norm.cardiovascular.observations) {
    facts.cardiovascular!.push(
      createPediatricFact(
        'ped-cv-obs',
        'cardiovascular',
        'cardiovascular.observations',
        `Observação cardiovascular: ${norm.cardiovascular.observations}`,
        norm.cardiovascular.observations
      )
    );
  }

  // 9. Nutrition
  if (norm.nutrition.route) {
    let nutText = `Alimentação: via ${norm.nutrition.route.toLowerCase()}`;
    if (norm.nutrition.route === 'Oral' && norm.nutrition.oralAcceptance) {
      nutText += ` com aceitação ${norm.nutrition.oralAcceptance.toLowerCase()}`;
    } else if (norm.nutrition.route === 'Enteral') {
      const dev = norm.nutrition.enteralDevice === 'Outra' && norm.nutrition.enteralDeviceCustom
        ? norm.nutrition.enteralDeviceCustom
        : norm.nutrition.enteralDevice;
      if (dev) nutText += ` por ${dev}`;
      if (norm.nutrition.enteralRate) nutText += ` (${norm.nutrition.enteralRate} mL/h)`;
      if (norm.nutrition.enteralTolerance) nutText += `, ${norm.nutrition.enteralTolerance.toLowerCase()}`;
    }
    facts.nutrition!.push(
      createPediatricFact(
        'ped-nut-route',
        'nutrition',
        'nutrition.route',
        nutText,
        norm.nutrition.route
      )
    );
  }
  if (norm.nutrition.breastfeeding && norm.nutrition.breastfeeding !== 'Não se aplica' && norm.nutrition.breastfeeding !== 'Não informado') {
    facts.nutrition!.push(
      createPediatricFact(
        'ped-nut-breastfeeding',
        'nutrition',
        'nutrition.breastfeeding',
        `Nutrição infantil: ${norm.nutrition.breastfeeding}`,
        norm.nutrition.breastfeeding
      )
    );
  }

  // 10. Eliminations
  if (norm.eliminations.urinary) {
    let uriText = `Diurese: ${norm.eliminations.urinary.toLowerCase()}`;
    if (norm.eliminations.urinaryRoute) uriText += ` por via ${norm.eliminations.urinaryRoute.toLowerCase()}`;
    if (norm.eliminations.urinaryAspect) uriText += ` (${norm.eliminations.urinaryAspect})`;
    facts.eliminations!.push(
      createPediatricFact(
        'ped-elim-uri',
        'eliminations',
        'eliminations.urinary',
        uriText,
        norm.eliminations.urinary
      )
    );
  }
  if (norm.eliminations.bowel) {
    let bowText = `Evacuações: ${norm.eliminations.bowel.toLowerCase()}`;
    if (norm.eliminations.bowel === 'Presentes' && norm.eliminations.bowelAspect) {
      const asp = norm.eliminations.bowelAspect === 'Outras' && norm.eliminations.bowelAspectCustom
        ? norm.eliminations.bowelAspectCustom
        : norm.eliminations.bowelAspect.toLowerCase();
      bowText += ` de aspecto ${asp}`;
    }
    facts.eliminations!.push(
      createPediatricFact(
        'ped-elim-bow',
        'eliminations',
        'eliminations.bowel',
        bowText,
        norm.eliminations.bowel
      )
    );
  }

  // 11. Devices
  (norm.devices || []).forEach((dev, idx) => {
    const devType = dev.customType || dev.type;
    const parts = [devType];
    if (dev.location) parts.push(`em ${dev.location}`);
    if (dev.permeability) parts.push(dev.permeability.toLowerCase());
    if (dev.functioning) {
      const lower = dev.functioning.toLowerCase();
      parts.push(lower === 'funcionante' ? 'em funcionamento' : lower);
    }
    if (dev.drainAspect) parts.push(`débito: ${dev.drainAspect}`);
    const devStr = `Dispositivo presente: ${parts.join(', ')}`;
    facts.devices!.push(
      createPediatricFact(
        dev.id || `ped-dev-${idx}`,
        'devices',
        `devices[${idx}]`,
        devStr,
        devType
      )
    );
  });

  // 12. Skin
  if (norm.skin.integrity) {
    let skinText = `Pele: ${norm.skin.integrity.toLowerCase()}`;
    if (norm.skin.hydration) skinText += `, ${norm.skin.hydration.toLowerCase()}`;
    if (norm.skin.integrity === 'Com alteração/lesão' && norm.skin.lesionDescription) {
      skinText += ` (${norm.skin.lesionDescription})`;
    }
    if (norm.skin.dressingPresent === 'Sim') {
      skinText += `, curativo presente${norm.skin.dressingCondition ? ` (${norm.skin.dressingCondition})` : ''}`;
    }
    facts.skin!.push(
      createPediatricFact(
        'ped-skin-status',
        'skin',
        'skin.integrity',
        skinText,
        norm.skin.integrity
      )
    );
  }

  // 13. Mobility and Safety
  if (norm.mobilitySafety.mobility) {
    const mob = norm.mobilitySafety.mobility === 'Outro' && norm.mobilitySafety.mobilityCustom
      ? norm.mobilitySafety.mobilityCustom
      : norm.mobilitySafety.mobility;
    facts.mobility!.push(
      createPediatricFact(
        'ped-mob-status',
        'mobility',
        'mobilitySafety.mobility',
        `Mobilidade: ${mob}`,
        mob
      )
    );
  }
  if (norm.mobilitySafety.guardRails) {
    facts.mobility!.push(
      createPediatricFact(
        'ped-sec-rails',
        'mobility',
        'mobilitySafety.guardRails',
        `Grades de proteção do leito/berço: ${norm.mobilitySafety.guardRails.toLowerCase()}`,
        norm.mobilitySafety.guardRails
      )
    );
  }
  if (norm.mobilitySafety.headOfBed) {
    facts.mobility!.push(
      createPediatricFact(
        'ped-sec-head',
        'mobility',
        'mobilitySafety.headOfBed',
        `Cabeceira: ${norm.mobilitySafety.headOfBed.toLowerCase()}`,
        norm.mobilitySafety.headOfBed
      )
    );
  }
  if (norm.mobilitySafety.bedsideAccompanist) {
    facts.mobility!.push(
      createPediatricFact(
        'ped-sec-bedside-acc',
        'mobility',
        'mobilitySafety.bedsideAccompanist',
        `Acompanhante presente ao leito: ${norm.mobilitySafety.bedsideAccompanist}`,
        norm.mobilitySafety.bedsideAccompanist
      )
    );
  }

  // 14. Hygiene and Bath
  if (norm.hygieneBath.hygiene) {
    facts.hygiene!.push(
      createPediatricFact(
        'ped-hyg-cond',
        'hygiene',
        'hygieneBath.hygiene',
        `Higiene: ${norm.hygieneBath.hygiene.toLowerCase()}`,
        norm.hygieneBath.hygiene
      )
    );
  }
  if (norm.hygieneBath.bathPerformed) {
    let bathText = `Banho: ${norm.hygieneBath.bathPerformed.toLowerCase()}`;
    if (norm.hygieneBath.bathPerformed !== 'Não realizado' && norm.hygieneBath.bathTolerance) {
      bathText += ` com ${norm.hygieneBath.bathTolerance.toLowerCase()}`;
    }
    facts.hygiene!.push(
      createPediatricFact(
        'ped-bath-status',
        'hygiene',
        'hygieneBath.bathPerformed',
        bathText,
        norm.hygieneBath.bathPerformed
      )
    );
  }

  // 15. Care
  (norm.care.actions || []).forEach((act, idx) => {
    facts.care!.push(
      createPediatricFact(
        `ped-care-${idx}`,
        'care',
        `care.actions[${idx}]`,
        act,
        act
      )
    );
  });
  if (norm.care.otherCare) {
    facts.care!.push(
      createPediatricFact(
        'ped-care-other',
        'care',
        'care.otherCare',
        norm.care.otherCare,
        norm.care.otherCare
      )
    );
  }

  // 16. Medications
  (norm.medications.administered || []).forEach((med, idx) => {
    facts.medications!.push(
      createPediatricFact(
        `ped-med-${idx}`,
        'medications',
        `medications.administered[${idx}]`,
        `Medicação administrada conforme prescrição médica: ${med}`,
        med
      )
    );
  });
  if (norm.medications.notes) {
    facts.medications!.push(
      createPediatricFact(
        'ped-med-notes',
        'medications',
        'medications.notes',
        `Observação de medicação: ${norm.medications.notes}`,
        norm.medications.notes
      )
    );
  }

  // 17. Complications
  if (norm.complications.hasComplication === 'Sim') {
    let compText = `Intercorrência registrada: ${norm.complications.description || 'não especificada'}`;
    if (norm.complications.carePerformed) compText += `. Cuidado realizado: ${norm.complications.carePerformed}`;
    if (norm.complications.observedResponse) compText += `. Resposta: ${norm.complications.observedResponse}`;
    if (norm.complications.communicated === 'Sim') compText += `. Comunicado à equipe`;
    facts.complications!.push(
      createPediatricFact(
        'ped-comp-yes',
        'complications',
        'complications.hasComplication',
        compText,
        'Sim'
      )
    );
  } else if (norm.complications.hasComplication === 'Não') {
    facts.complications!.push(
      createPediatricFact(
        'ped-comp-no',
        'complications',
        'complications.hasComplication',
        'Sem intercorrências no período.',
        'Não'
      )
    );
  }

  // 18. Communication
  if (norm.communication.hasCommunication === 'Sim') {
    const rc = norm.communication.recipient === 'Outro profissional' && norm.communication.recipientCustom
      ? norm.communication.recipientCustom
      : norm.communication.recipient;
    let comText = `Comunicação realizada com ${rc || 'equipe'}`;
    if (norm.communication.reason) comText += `: ${norm.communication.reason}`;
    if (norm.communication.time) comText += ` às ${norm.communication.time}`;
    facts.communication!.push(
      createPediatricFact(
        'ped-comm-yes',
        'communication',
        'communication.hasCommunication',
        comText,
        'Sim'
      )
    );
  }

  // 19. Final Status
  if (norm.finalStatus.status) {
    const fs = norm.finalStatus.status === 'Outro' && norm.finalStatus.statusCustom
      ? norm.finalStatus.statusCustom
      : norm.finalStatus.status;
    facts.finalStatus!.push(
      createPediatricFact(
        'ped-fin-status',
        'finalStatus',
        'finalStatus.status',
        `Situação final: ${fs}.`,
        fs
      )
    );
  }

  // 20. Additional Info
  if (norm.additionalInfo?.notes) {
    facts.general!.push(
      createPediatricFact(
        'ped-add-notes',
        'general',
        'additionalInfo.notes',
        `Informações adicionais: ${norm.additionalInfo.notes}`,
        norm.additionalInfo.notes
      )
    );
  }

  return facts;
}

/**
 * Builds deterministic narrative and exact factual traces from AuthorizedClinicalFacts.
 * Never accesses rawForm.
 */
export function buildTechnicianPediatricNursingNoteWithTrace(
  facts: AuthorizedClinicalFacts
): { text: string; traces: NarrativeSegment[] } {
  const traces: NarrativeSegment[] = [];

  // Helper to extract facts and build sentence
  const allFacts = Object.values(facts).flat().filter(Boolean) as AuthorizedClinicalFact[];
  if (allFacts.length === 0) {
    return { text: '', traces: [] };
  }

  // 1. Identification & Context
  const ctxFacts = facts.context || [];
  const genFacts = facts.general || [];
  const initialParts: string[] = [];
  const initialFactIds: string[] = [];

  const momentFact = ctxFacts.find((f) => f.sourceField === 'context.moment');
  if (momentFact) {
    initialParts.push(momentFact.canonicalText);
    initialFactIds.push(momentFact.id);
  }

  const locFact = ctxFacts.find((f) => f.sourceField === 'context.location');
  if (locFact) {
    initialParts.push(locFact.canonicalText);
    initialFactIds.push(locFact.id);
  }

  const ageGroupFact = genFacts.find((f) => f.sourceField === 'generalCharacteristics.ageGroup');
  if (ageGroupFact) {
    initialParts.push(ageGroupFact.canonicalText);
    initialFactIds.push(ageGroupFact.id);
  }

  const repAgeFact = genFacts.find((f) => f.sourceField === 'generalCharacteristics.reportedAge');
  if (repAgeFact) {
    initialParts.push(repAgeFact.canonicalText);
    initialFactIds.push(repAgeFact.id);
  }

  const accPresentFact = genFacts.find((f) => f.sourceField === 'accompaniment.present');
  if (accPresentFact) {
    initialParts.push(accPresentFact.canonicalText);
    initialFactIds.push(accPresentFact.id);
  }

  const accRelFact = genFacts.find((f) => f.sourceField === 'accompaniment.relationship');
  if (accRelFact) {
    initialParts.push(accRelFact.canonicalText);
    initialFactIds.push(accRelFact.id);
  }

  const weightFact = genFacts.find((f) => f.sourceField === 'generalCharacteristics.weight');
  if (weightFact) {
    initialParts.push(weightFact.canonicalText);
    initialFactIds.push(weightFact.id);
  }

  const heightFact = genFacts.find((f) => f.sourceField === 'generalCharacteristics.height');
  if (heightFact) {
    initialParts.push(heightFact.canonicalText);
    initialFactIds.push(heightFact.id);
  }

  const infoSrcFact = ctxFacts.find((f) => f.sourceField === 'context.infoSource');
  if (infoSrcFact) {
    initialParts.push(infoSrcFact.canonicalText);
    initialFactIds.push(infoSrcFact.id);
  }

  if (initialParts.length > 0) {
    const text = initialParts.join('. ') + '.';
    traces.push({ text, factIds: initialFactIds, kind: 'factual' });
  }

  // 2. Neurological & Behavior
  const neuroFacts = facts.neurological || [];
  if (neuroFacts.length > 0) {
    const text = neuroFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = neuroFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 3. Pain
  const painFacts = facts.pain || [];
  if (painFacts.length > 0) {
    const text = painFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = painFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 4. Sinais Vitais
  const vitalsFacts = facts.vitals || [];
  if (vitalsFacts.length > 0) {
    const text = 'Sinais vitais aferidos: ' + vitalsFacts.map((f) => f.canonicalText).join(', ') + '.';
    const factIds = vitalsFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 5. Respiratório
  const respFacts = facts.respiratory || [];
  if (respFacts.length > 0) {
    const text = respFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = respFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 6. Cardiovascular
  const cvFacts = facts.cardiovascular || [];
  if (cvFacts.length > 0) {
    const text = cvFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = cvFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 7. Nutrição e Aleitamento
  const nutFacts = facts.nutrition || [];
  if (nutFacts.length > 0) {
    const text = nutFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = nutFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 8. Eliminações
  const elimFacts = facts.eliminations || [];
  if (elimFacts.length > 0) {
    const text = elimFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = elimFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 9. Dispositivos
  const devFacts = facts.devices || [];
  if (devFacts.length > 0) {
    const text = devFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = devFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 10. Pele e Integridade
  const skinFacts = facts.skin || [];
  if (skinFacts.length > 0) {
    const text = skinFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = skinFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 11. Mobilidade e Segurança
  const mobFacts = facts.mobility || [];
  if (mobFacts.length > 0) {
    const text = mobFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = mobFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 12. Higiene e Banho
  const hygFacts = facts.hygiene || [];
  if (hygFacts.length > 0) {
    const text = hygFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = hygFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 13. Cuidados Realizados
  const careFacts = facts.care || [];
  if (careFacts.length > 0) {
    const text = 'Cuidados de enfermagem realizados: ' + careFacts.map((f) => f.canonicalText).join('; ') + '.';
    const factIds = careFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 14. Medicações
  const medFacts = facts.medications || [];
  if (medFacts.length > 0) {
    const text = medFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = medFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 15. Intercorrências
  const compFacts = facts.complications || [];
  if (compFacts.length > 0) {
    const text = compFacts.map((f) => f.canonicalText).join(' ') + (compFacts[0].canonicalText.endsWith('.') ? '' : '.');
    const factIds = compFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 16. Comunicação
  const commFacts = facts.communication || [];
  if (commFacts.length > 0) {
    const text = commFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = commFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 17. Situação Final
  const finFacts = facts.finalStatus || [];
  if (finFacts.length > 0) {
    const text = finFacts.map((f) => f.canonicalText).join('. ') + (finFacts[0].canonicalText.endsWith('.') ? '' : '.');
    const factIds = finFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  // 18. Additional Notes
  const addFacts = genFacts.filter((f) => f.sourceField === 'additionalInfo.notes');
  if (addFacts.length > 0) {
    const text = addFacts.map((f) => f.canonicalText).join('. ') + '.';
    const factIds = addFacts.map((f) => f.id);
    traces.push({ text, factIds, kind: 'factual' });
  }

  const fullText = traces.map((t) => t.text).join('\n\n');
  return { text: fullText, traces };
}

/**
 * Standard deterministic narrative string builder for contract.
 */
export function buildTechnicianPediatricNursingNote(facts: AuthorizedClinicalFacts): string {
  return buildTechnicianPediatricNursingNoteWithTrace(facts).text;
}

/**
 * Validates clinical consistency for pediatric nursing notes (PED-CONS-001 to PED-CONS-008).
 */
export function validateTechnicianPediatricConsistency(
  form: TechnicianPediatricNursingNoteForm
): PediatricConsistencyAlert[] {
  const alerts: PediatricConsistencyAlert[] = [];

  // PED-CONS-001: Sedado + queixa diretamente atribuída à criança
  const isSedated =
    form.neuroBehavior.communication === 'Sonolento/sedado' ||
    form.neuroBehavior.behavior.includes('Sonolento');
  const hasDirectChildComplaint =
    Boolean(form.neuroBehavior.complaint?.trim()) &&
    (form.neuroBehavior.complaintSource === 'Paciente' || !form.neuroBehavior.complaintSource);

  if (isSedated && hasDirectChildComplaint) {
    alerts.push({
      code: 'PED-CONS-001',
      ruleId: 'PED-CONS-001',
      category: 'neuro',
      message: 'Paciente registrado como sonolento/sedado com queixa verbal diretamente atribuída à própria criança sem indicação de acompanhante.',
      severity: 'warning',
      isBlocking: false,
      field: 'neuroBehavior.complaint',
    });
  }

  // PED-CONS-002: Restrito ao leito + deambulação sem auxílio
  if (
    form.mobilitySafety.mobility === 'Restrito ao leito' &&
    form.mobilitySafety.mobilityCustom?.toLowerCase().includes('deambula')
  ) {
    alerts.push({
      code: 'PED-CONS-002',
      ruleId: 'PED-CONS-002',
      category: 'mobility',
      message: 'Incompatibilidade entre condição de restrito ao leito e deambulação informada.',
      severity: 'warning',
      isBlocking: false,
      field: 'mobilitySafety.mobility',
    });
  }

  // PED-CONS-003: VMI + deambulação
  const isVMI = form.respiratory.support === 'VMI';
  const isAmbulate =
    form.mobilitySafety.mobility === 'Deambula sem auxílio' ||
    form.mobilitySafety.mobility === 'Deambula com auxílio';

  if (isVMI && isAmbulate) {
    alerts.push({
      code: 'PED-CONS-003',
      ruleId: 'PED-CONS-003',
      category: 'respiratory',
      message: 'Paciente em Ventilação Mecânica Invasiva (VMI) assinalado como deambulando.',
      severity: 'warning',
      isBlocking: false,
      field: 'mobilitySafety.mobility',
    });
  }

  // PED-CONS-004: Dieta enteral sem dispositivo
  if (form.nutrition.route === 'Enteral') {
    const dev = form.nutrition.enteralDevice === 'Outra'
      ? form.nutrition.enteralDeviceCustom
      : form.nutrition.enteralDevice;
    if (!dev?.trim()) {
      alerts.push({
        code: 'PED-CONS-004',
        ruleId: 'PED-CONS-004',
        category: 'nutrition',
        message: 'Dieta enteral informada sem indicação do dispositivo de administração (SNE, SNG, GTT).',
        severity: 'warning',
        isBlocking: false,
        field: 'nutrition.enteralDevice',
      });
    }
  }

  // PED-CONS-005: Banho não realizado + tolerância preenchida
  if (
    form.hygieneBath.bathPerformed === 'Não realizado' &&
    Boolean(form.hygieneBath.bathTolerance?.trim())
  ) {
    alerts.push({
      code: 'PED-CONS-005',
      ruleId: 'PED-CONS-005',
      category: 'hygiene',
      message: 'Banho registrado como não realizado, porém tolerância ao banho foi preenchida.',
      severity: 'warning',
      isBlocking: false,
      field: 'hygieneBath.bathTolerance',
    });
  }

  // PED-CONS-006: Escala de dor incompatível com campo vazio
  const activeScales = ['FLACC', 'Escala numérica 0–10', 'Faces'];
  if (activeScales.includes(form.pain.method) && (!form.pain.score || form.pain.score.trim() === '')) {
    alerts.push({
      code: 'PED-CONS-006',
      ruleId: 'PED-CONS-006',
      category: 'pain',
      message: `Método de dor ${form.pain.method} selecionado, porém nenhum escore numérico foi registrado.`,
      severity: 'warning',
      isBlocking: false,
      field: 'pain.score',
    });
  }

  // PED-CONS-007: Peso informado com formato ou unidade inválida
  if (form.generalCharacteristics.weight?.trim()) {
    const w = form.generalCharacteristics.weight.trim().toLowerCase();
    // Valid patterns: "15", "15.2", "15,2", "15 kg", "15.2 kg", "15,2kg"
    const validWeightRegex = /^\d+([.,]\d+)?(\s*kg)?$/;
    if (!validWeightRegex.test(w)) {
      alerts.push({
        code: 'PED-CONS-007',
        ruleId: 'PED-CONS-007',
        category: 'general',
        message: 'Formato de peso inválido. Utilize valor numérico com unidade opcional "kg" (ex: 15,2 kg).',
        severity: 'warning',
        isBlocking: false,
        field: 'generalCharacteristics.weight',
      });
    }
  }

  // PED-CONS-008: Se nenhuma inconsistência, retorna lista vazia
  return alerts;
}

/**
 * Auditor for deterministic narrative segments against AuthorizedClinicalFacts.
 */
export function auditPediatricNarrative(
  traces: NarrativeSegment[],
  facts: AuthorizedClinicalFacts
): { passed: boolean; unauthorizedSegments: string[] } {
  const allFactIds = new Set(
    (Object.values(facts).flat().filter(Boolean) as AuthorizedClinicalFact[]).map((f) => f.id)
  );

  const unauthorized: string[] = [];

  for (const seg of traces) {
    if (seg.isStructural || seg.kind === 'structural') continue;
    if (!seg.factIds || seg.factIds.length === 0) {
      unauthorized.push(seg.text);
      continue;
    }
    const hasValidFact = seg.factIds.some((id) => allFactIds.has(id));
    if (!hasValidFact) {
      unauthorized.push(seg.text);
    }
  }

  return {
    passed: unauthorized.length === 0,
    unauthorizedSegments: unauthorized,
  };
}

/**
 * PediatricFactLock: strictly blocks hallucinated doses, ages, weights, heights, scales, or diagnoses.
 */
export class PediatricFactLock {
  static verify(
    text: string,
    facts: AuthorizedClinicalFacts
  ): { valid: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const lower = text.toLowerCase();

    // 1. Prohibited clinical synthesis & diagnosis keywords
    const prohibitedPatterns: { regex: RegExp; reason: string }[] = [
      { regex: /\b(diagn[óo]stico|hip[óo]tese diagn[óo]stica)\b/i, reason: 'Presença indevida de diagnóstico nosológico' },
      { regex: /\b(prescrevo|prescri[çc][ãa]o médica|indico conduta)\b/i, reason: 'Presença indevida de prescrição ou conduta autônoma' },
      { regex: /\b(progn[óo]stico|evoluir[áa] para)\b/i, reason: 'Presença indevida de prognóstico' },
      { regex: /\b(bronquiolite|choque s[ée]ptico|pneumonia|asma|meningite|desidrata[çc][ãa]o)\b/i, reason: 'Presença indevida de patologia nosológica inferida' },
      { regex: /\b(baixo peso|obesidade|percentil)\b/i, reason: 'Inferência nutricional/antropométrica não autorizada' },
      { regex: /\b(taquic[áa]rdico|febril|taquipneico)\b/i, reason: 'Classificação sintomática inferida de sinais vitais' },
    ];

    for (const p of prohibitedPatterns) {
      if (p.regex.test(lower)) {
        reasons.push(`[PediatricFactLock] ${p.reason}`);
      }
    }

    // 2. Prohibited dose calculation patterns: ex "15 mg/kg", "10 ml/kg", "administrar 5 ml"
    const doseRegex = /\b\d+([.,]\d+)?\s*(mg\/kg|mcg\/kg|ml\/kg|g\/kg|u\/kg)\b/i;
    if (doseRegex.test(lower)) {
      reasons.push('[PediatricFactLock] Proibido cálculo de dose pediátrica por peso/idade.');
    }
    const adminRegex = /\badministrar\s+\d+([.,]\d+)?\s*(ml|mg|gotas|comprimidos)\b/i;
    if (adminRegex.test(lower)) {
      reasons.push('[PediatricFactLock] Proibida sugestão de administração de dose não registrada.');
    }

    // 3. Reject invented age if no age fact exists
    const hasAgeFact = (facts.general || []).some(
      (f) => f.sourceField === 'generalCharacteristics.reportedAge' || f.sourceField === 'generalCharacteristics.ageGroup'
    );
    if (!hasAgeFact) {
      const ageMention = /\b\d+\s*(anos|meses|dias)\b/i;
      if (ageMention.test(lower)) {
        reasons.push('[PediatricFactLock] Idade inventada na narrativa sem respaldo nos fatos autorizados.');
      }
    }

    // 4. Reject invented weight if no weight fact exists
    const hasWeightFact = (facts.general || []).some((f) => f.sourceField === 'generalCharacteristics.weight');
    if (!hasWeightFact) {
      const weightMention = /\bpeso\s*:\s*\d+|\b\d+([.,]\d+)?\s*kg\b/i;
      if (weightMention.test(lower)) {
        reasons.push('[PediatricFactLock] Peso inventado na narrativa sem respaldo nos fatos autorizados.');
      }
    }

    // 5. Reject invented pain scale if no pain fact exists
    const hasPainFact = (facts.pain || []).some((f) => f.sourceField === 'pain.method');
    if (!hasPainFact) {
      const painMention = /\b(flacc|escala de faces|escala num[ée]rica)\b/i;
      if (painMention.test(lower)) {
        reasons.push('[PediatricFactLock] Escala de dor inventada sem respaldo nos fatos autorizados.');
      }
    }

    return {
      valid: reasons.length === 0,
      reasons,
    };
  }
}

/**
 * Verifier for AI refined narrative against authorized facts and COFEN boundaries.
 */
export function verifyPediatricAIRefinedResponse(
  response: any,
  facts: AuthorizedClinicalFacts,
  canonical: string
): { approved: boolean; rejectionReasons?: string[]; text: string } {
  const candidateText = typeof response === 'string' ? response : response?.refinedText || response?.narrative || '';

  if (!candidateText || candidateText.trim().length === 0) {
    return {
      approved: false,
      rejectionReasons: ['Resposta vazia da IA'],
      text: canonical,
    };
  }

  // Run PediatricFactLock
  const lockResult = PediatricFactLock.verify(candidateText, facts);
  if (!lockResult.valid) {
    return {
      approved: false,
      rejectionReasons: lockResult.reasons,
      text: canonical, // Safe deterministic fallback
    };
  }

  return {
    approved: true,
    text: candidateText,
  };
}
