import {
  NurseSurgicalEvolutionForm,
  createInitialNurseSurgicalEvolutionForm,
} from '../types/nurseSurgicalEvolution';
import {
  AuthorizedClinicalFacts,
  ClinicalFact,
  ClinicalConsistencyAlert,
} from './types';

/**
 * Normalizes user inputs for Nurse Surgical Clinic Evolution form.
 * Trims strings, removes undefined/null, ensures arrays are defined.
 */
export function normalizeNurseSurgicalEvolutionForm(
  form: Partial<NurseSurgicalEvolutionForm> | null | undefined
): NurseSurgicalEvolutionForm {
  const initial = createInitialNurseSurgicalEvolutionForm();
  if (!form) return initial;

  return {
    context: {
      moment: form.context?.moment?.trim() || '',
      customMoment: form.context?.customMoment?.trim() || '',
      location: form.context?.location?.trim() || '',
      customLocation: form.context?.customLocation?.trim() || '',
      escort: form.context?.escort?.trim() || '',
      customEscort: form.context?.customEscort?.trim() || '',
    },
    safetyIdentification: {
      wristbandIdentification: form.safetyIdentification?.wristbandIdentification?.trim() || '',
      bedIdentification: form.safetyIdentification?.bedIdentification?.trim() || '',
      precaution: form.safetyIdentification?.precaution?.trim() || '',
      customPrecaution: form.safetyIdentification?.customPrecaution?.trim() || '',
      hasAllergies: form.safetyIdentification?.hasAllergies?.trim() || '',
      allergyDescription: form.safetyIdentification?.allergyDescription?.trim() || '',
    },
    surgicalContext: {
      surgicalSituation: form.surgicalContext?.surgicalSituation?.trim() || '',
      surgicalProcedure: form.surgicalContext?.surgicalProcedure?.trim() || '',
      procedureDate: form.surgicalContext?.procedureDate?.trim() || '',
      anesthesiaType: form.surgicalContext?.anesthesiaType?.trim() || '',
      customAnesthesia: form.surgicalContext?.customAnesthesia?.trim() || '',
    },
    generalAssessment: {
      generalState: form.generalAssessment?.generalState?.trim() || '',
      consciousness: form.generalAssessment?.consciousness?.trim() || '',
      customConsciousness: form.generalAssessment?.customConsciousness?.trim() || '',
      behavior: Array.isArray(form.generalAssessment?.behavior) ? form.generalAssessment!.behavior : [],
      customBehavior: form.generalAssessment?.customBehavior?.trim() || '',
      complaintStatus: form.generalAssessment?.complaintStatus?.trim() || '',
      complaintDescription: form.generalAssessment?.complaintDescription?.trim() || '',
      informationSource: form.generalAssessment?.informationSource?.trim() || '',
      customInformationSource: form.generalAssessment?.customInformationSource?.trim() || '',
    },
    pain: {
      painScaleType: form.pain?.painScaleType?.trim() || '',
      painScore: form.pain?.painScore?.trim() || '',
      customScale: form.pain?.customScale?.trim() || '',
      painLocation: form.pain?.painLocation?.trim() || '',
      painCharacteristic: form.pain?.painCharacteristic?.trim() || '',
      analgesiaRegistered: form.pain?.analgesiaRegistered?.trim() || '',
      analgesiaDetails: form.pain?.analgesiaDetails?.trim() || '',
    },
    vitalSigns: {
      systolicBP: form.vitalSigns?.systolicBP?.trim() || '',
      diastolicBP: form.vitalSigns?.diastolicBP?.trim() || '',
      meanArterialPressure: form.vitalSigns?.meanArterialPressure?.trim() || '',
      heartRate: form.vitalSigns?.heartRate?.trim() || '',
      respiratoryRate: form.vitalSigns?.respiratoryRate?.trim() || '',
      oxygenSaturation: form.vitalSigns?.oxygenSaturation?.trim() || '',
      temperature: form.vitalSigns?.temperature?.trim() || '',
      capillaryBloodGlucose: form.vitalSigns?.capillaryBloodGlucose?.trim() || '',
    },
    neurological: {
      consciousnessLevel: form.neurological?.consciousnessLevel?.trim() || '',
      orientation: form.neurological?.orientation?.trim() || '',
      glasgowScore: form.neurological?.glasgowScore?.trim() || '',
      pupils: form.neurological?.pupils?.trim() || '',
      photoreaction: form.neurological?.photoreaction?.trim() || '',
      motorDeficit: form.neurological?.motorDeficit?.trim() || '',
      motorDeficitDetails: form.neurological?.motorDeficitDetails?.trim() || '',
    },
    respiratory: {
      respiratorySupport: form.respiratory?.respiratorySupport?.trim() || '',
      supportDevice: form.respiratory?.supportDevice?.trim() || '',
      oxygenFlow: form.respiratory?.oxygenFlow?.trim() || '',
      pattern: form.respiratory?.pattern?.trim() || '',
      respiratoryDiscomfort: form.respiratory?.respiratoryDiscomfort?.trim() || '',
      auscultation: form.respiratory?.auscultation?.trim() || '',
      adventitiousSoundsDetails: form.respiratory?.adventitiousSoundsDetails?.trim() || '',
    },
    cardiovascular: {
      peripheralPerfusion: form.cardiovascular?.peripheralPerfusion?.trim() || '',
      extremities: form.cardiovascular?.extremities?.trim() || '',
      tec: form.cardiovascular?.tec?.trim() || '',
      edema: form.cardiovascular?.edema?.trim() || '',
      edemaLocation: form.cardiovascular?.edemaLocation?.trim() || '',
      cardiacAuscultation: form.cardiovascular?.cardiacAuscultation?.trim() || '',
      cardiacDetails: form.cardiovascular?.cardiacDetails?.trim() || '',
    },
    gastrointestinal: {
      abdomenForm: form.gastrointestinal?.abdomenForm?.trim() || '',
      consistency: form.gastrointestinal?.consistency?.trim() || '',
      painOnPalpation: form.gastrointestinal?.painOnPalpation?.trim() || '',
      palpationPainLocation: form.gastrointestinal?.palpationPainLocation?.trim() || '',
      bowelSounds: form.gastrointestinal?.bowelSounds?.trim() || '',
      nauseaVomiting: form.gastrointestinal?.nauseaVomiting?.trim() || '',
    },
    nutrition: {
      nutritionalRoute: form.nutrition?.nutritionalRoute?.trim() || '',
      acceptance: form.nutrition?.acceptance?.trim() || '',
      fastingReason: form.nutrition?.fastingReason?.trim() || '',
      enteralDevice: form.nutrition?.enteralDevice?.trim() || '',
      enteralInfusionRate: form.nutrition?.enteralInfusionRate?.trim() || '',
      enteralTolerance: form.nutrition?.enteralTolerance?.trim() || '',
    },
    eliminations: {
      diuresis: form.eliminations?.diuresis?.trim() || '',
      urinaryRoute: form.eliminations?.urinaryRoute?.trim() || '',
      diuresisAspect: form.eliminations?.diuresisAspect?.trim() || '',
      diuresisVolume: form.eliminations?.diuresisVolume?.trim() || '',
      bowelEvacuation: form.eliminations?.bowelEvacuation?.trim() || '',
      bowelAspect: form.eliminations?.bowelAspect?.trim() || '',
    },
    surgicalWound: {
      hasSurgicalWound: form.surgicalWound?.hasSurgicalWound?.trim() || '',
      anatomicalLocation: form.surgicalWound?.anatomicalLocation?.trim() || '',
      aspect: form.surgicalWound?.aspect?.trim() || '',
      customAspect: form.surgicalWound?.customAspect?.trim() || '',
      dressingPresent: form.surgicalWound?.dressingPresent?.trim() || '',
      dressingCondition: form.surgicalWound?.dressingCondition?.trim() || '',
      customDressingCondition: form.surgicalWound?.customDressingCondition?.trim() || '',
      exudate: form.surgicalWound?.exudate?.trim() || '',
      exudateCharacteristics: form.surgicalWound?.exudateCharacteristics?.trim() || '',
    },
    surgicalDressing: {
      dressingChanged: form.surgicalDressing?.dressingChanged?.trim() || '',
      dressingProductUsed: form.surgicalDressing?.dressingProductUsed?.trim() || '',
      dressingAspectObserved: form.surgicalDressing?.dressingAspectObserved?.trim() || '',
      dressingInterventionDetails: form.surgicalDressing?.dressingInterventionDetails?.trim() || '',
    },
    drains: {
      hasDrains: form.drains?.hasDrains?.trim() || '',
      list: Array.isArray(form.drains?.list)
        ? form.drains!.list.map((d) => ({
            id: d.id || '',
            type: d.type?.trim() || '',
            customType: d.customType?.trim() || '',
            location: d.location?.trim() || '',
            permeability: d.permeability?.trim() || '',
            functioning: d.functioning?.trim() || '',
            fixation: d.fixation?.trim() || '',
            drainAspect: d.drainAspect?.trim() || '',
            volumeReported: d.volumeReported?.trim() || '',
          }))
        : [],
    },
    devices: {
      list: Array.isArray(form.devices?.list)
        ? form.devices!.list.map((dev) => ({
            id: dev.id || '',
            type: dev.type?.trim() || '',
            anatomicalSite: dev.anatomicalSite?.trim() || '',
            laterality: dev.laterality?.trim() || '',
            siteCondition: dev.siteCondition?.trim() || '',
            dressingCondition: dev.dressingCondition?.trim() || '',
            permeability: dev.permeability?.trim() || '',
          }))
        : [],
    },
    mobility: {
      mobility: form.mobility?.mobility?.trim() || '',
      customMobility: form.mobility?.customMobility?.trim() || '',
      decubitusChange: form.mobility?.decubitusChange?.trim() || '',
    },
    hygiene: {
      hygieneStatus: form.hygiene?.hygieneStatus?.trim() || '',
      bathType: form.hygiene?.bathType?.trim() || '',
      bathTolerance: form.hygiene?.bathTolerance?.trim() || '',
    },
    riskAssessment: {
      fallRiskStatus: form.riskAssessment?.fallRiskStatus?.trim() || '',
      fallRiskScore: form.riskAssessment?.fallRiskScore?.trim() || '',
      lppRiskStatus: form.riskAssessment?.lppRiskStatus?.trim() || '',
      lppRiskScore: form.riskAssessment?.lppRiskScore?.trim() || '',
      aspirationRiskStatus: form.riskAssessment?.aspirationRiskStatus?.trim() || '',
      otherRisks: form.riskAssessment?.otherRisks?.trim() || '',
    },
    careDone: {
      careItems: Array.isArray(form.careDone?.careItems) ? form.careDone!.careItems : [],
      customCare: form.careDone?.customCare?.trim() || '',
    },
    responseToCare: {
      evaluated: form.responseToCare?.evaluated?.trim() || '',
      interventionTarget: form.responseToCare?.interventionTarget?.trim() || '',
      observedResponse: form.responseToCare?.observedResponse?.trim() || '',
    },
    complications: {
      hasComplication: form.complications?.hasComplication?.trim() || '',
      description: form.complications?.description?.trim() || '',
      immediateAction: form.complications?.immediateAction?.trim() || '',
      communicationDone: form.complications?.communicationDone?.trim() || '',
      responseObserved: form.complications?.responseObserved?.trim() || '',
    },
    communication: {
      hasCommunication: form.communication?.hasCommunication?.trim() || '',
      target: form.communication?.target?.trim() || '',
      time: form.communication?.time?.trim() || '',
      reason: form.communication?.reason?.trim() || '',
      responseObserved: form.communication?.responseObserved?.trim() || '',
    },
    comparisonWithPrevious: {
      statusChange: form.comparisonWithPrevious?.statusChange?.trim() || '',
      description: form.comparisonWithPrevious?.description?.trim() || '',
    },
    nursingSynthesis: {
      synthesisText: form.nursingSynthesis?.synthesisText?.trim() || '',
    },
    currentStatus: {
      status: form.currentStatus?.status?.trim() || '',
      customStatus: form.currentStatus?.customStatus?.trim() || '',
      pendingIssues: form.currentStatus?.pendingIssues?.trim() || '',
    },
  };
}

/**
 * Builds AuthorizedClinicalFacts strictly from normalized user inputs.
 * No inference, no calculation, no hallucination.
 */
export function buildAuthorizedNurseSurgicalEvolutionFacts(
  form: NurseSurgicalEvolutionForm
): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts = {};

  // 1. Context Facts
  const contextFacts: ClinicalFact[] = [];
  if (form.context.moment) {
    const text = form.context.moment === 'Outro' && form.context.customMoment
      ? form.context.customMoment
      : form.context.moment;
    contextFacts.push({
      id: 'fact-ctx-moment',
      category: 'context',
      sourceField: 'context.moment',
      value: text,
      canonicalText: `Momento da evolução: ${text}.`,
    });
  }
  if (form.context.location) {
    const loc = form.context.location === 'Outro' && form.context.customLocation
      ? form.context.customLocation
      : form.context.location;
    contextFacts.push({
      id: 'fact-ctx-location',
      category: 'context',
      sourceField: 'context.location',
      value: loc,
      canonicalText: `Localização: ${loc}.`,
    });
  }
  if (form.context.escort) {
    const esc = form.context.escort === 'Outro' && form.context.customEscort
      ? form.context.customEscort
      : form.context.escort;
    contextFacts.push({
      id: 'fact-ctx-escort',
      category: 'context',
      sourceField: 'context.escort',
      value: esc,
      canonicalText: `Acompanhamento: ${esc}.`,
    });
  }
  if (contextFacts.length > 0) facts.context = contextFacts;

  // 2. Safety & Identification
  const safetyFacts: ClinicalFact[] = [];
  if (form.safetyIdentification.wristbandIdentification) {
    safetyFacts.push({
      id: 'fact-safety-wristband',
      category: 'safetyIdentification',
      sourceField: 'safetyIdentification.wristbandIdentification',
      value: form.safetyIdentification.wristbandIdentification,
      canonicalText: `Pulseira de identificação: ${form.safetyIdentification.wristbandIdentification}.`,
    });
  }
  if (form.safetyIdentification.bedIdentification) {
    safetyFacts.push({
      id: 'fact-safety-bed',
      category: 'safetyIdentification',
      sourceField: 'safetyIdentification.bedIdentification',
      value: form.safetyIdentification.bedIdentification,
      canonicalText: `Identificação no leito: ${form.safetyIdentification.bedIdentification}.`,
    });
  }
  if (form.safetyIdentification.precaution) {
    const prec = form.safetyIdentification.precaution === 'Outra' && form.safetyIdentification.customPrecaution
      ? form.safetyIdentification.customPrecaution
      : form.safetyIdentification.precaution;
    safetyFacts.push({
      id: 'fact-safety-precaution',
      category: 'safetyIdentification',
      sourceField: 'safetyIdentification.precaution',
      value: prec,
      canonicalText: `Precaução assistencial: ${prec}.`,
    });
  }
  if (form.safetyIdentification.hasAllergies) {
    const all = form.safetyIdentification.hasAllergies === 'Sim' && form.safetyIdentification.allergyDescription
      ? `Sim (${form.safetyIdentification.allergyDescription})`
      : form.safetyIdentification.hasAllergies;
    safetyFacts.push({
      id: 'fact-safety-allergies',
      category: 'safetyIdentification',
      sourceField: 'safetyIdentification.hasAllergies',
      value: all,
      canonicalText: `Alergias: ${all}.`,
    });
  }
  if (safetyFacts.length > 0) facts.safetyIdentification = safetyFacts;

  // 3. Surgical Context
  const surgContextFacts: ClinicalFact[] = [];
  if (form.surgicalContext.surgicalSituation) {
    surgContextFacts.push({
      id: 'fact-surg-situation',
      category: 'surgicalContext',
      sourceField: 'surgicalContext.surgicalSituation',
      value: form.surgicalContext.surgicalSituation,
      canonicalText: `Situação cirúrgica: ${form.surgicalContext.surgicalSituation}.`,
    });
  }
  if (form.surgicalContext.surgicalProcedure) {
    const procText = form.surgicalContext.procedureDate
      ? `${form.surgicalContext.surgicalProcedure} (data: ${form.surgicalContext.procedureDate})`
      : form.surgicalContext.surgicalProcedure;
    surgContextFacts.push({
      id: 'fact-surg-procedure',
      category: 'surgicalContext',
      sourceField: 'surgicalContext.surgicalProcedure',
      value: procText,
      canonicalText: `Procedimento cirúrgico: ${procText}.`,
    });
  }
  if (form.surgicalContext.anesthesiaType) {
    const anesth = form.surgicalContext.anesthesiaType === 'Outra' && form.surgicalContext.customAnesthesia
      ? form.surgicalContext.customAnesthesia
      : form.surgicalContext.anesthesiaType;
    surgContextFacts.push({
      id: 'fact-surg-anesthesia',
      category: 'surgicalContext',
      sourceField: 'surgicalContext.anesthesiaType',
      value: anesth,
      canonicalText: `Tipo de anestesia: ${anesth}.`,
    });
  }
  if (surgContextFacts.length > 0) facts.surgicalContext = surgContextFacts;

  // 4. General Assessment
  const generalFacts: ClinicalFact[] = [];
  if (form.generalAssessment.generalState) {
    generalFacts.push({
      id: 'fact-gen-state',
      category: 'general',
      sourceField: 'generalAssessment.generalState',
      value: form.generalAssessment.generalState,
      canonicalText: `Estado geral: ${form.generalAssessment.generalState}.`,
    });
  }
  if (form.generalAssessment.consciousness) {
    const cons = form.generalAssessment.consciousness === 'Outro' && form.generalAssessment.customConsciousness
      ? form.generalAssessment.customConsciousness
      : form.generalAssessment.consciousness;
    generalFacts.push({
      id: 'fact-gen-consciousness',
      category: 'general',
      sourceField: 'generalAssessment.consciousness',
      value: cons,
      canonicalText: `Consciência: ${cons}.`,
    });
  }
  if (form.generalAssessment.behavior.length > 0) {
    const beh = form.generalAssessment.behavior.join(', ');
    generalFacts.push({
      id: 'fact-gen-behavior',
      category: 'general',
      sourceField: 'generalAssessment.behavior',
      value: beh,
      canonicalText: `Comportamento: ${beh}.`,
    });
  }
  if (form.generalAssessment.complaintStatus) {
    const comp = form.generalAssessment.complaintStatus === 'Com queixa' && form.generalAssessment.complaintDescription
      ? `Com queixa referida: "${form.generalAssessment.complaintDescription}"`
      : form.generalAssessment.complaintStatus;
    generalFacts.push({
      id: 'fact-gen-complaint',
      category: 'general',
      sourceField: 'generalAssessment.complaintStatus',
      value: comp,
      canonicalText: `Queixas: ${comp}.`,
    });
  }
  if (form.generalAssessment.informationSource) {
    generalFacts.push({
      id: 'fact-gen-source',
      category: 'general',
      sourceField: 'generalAssessment.informationSource',
      value: form.generalAssessment.informationSource,
      canonicalText: `Fonte da informação: ${form.generalAssessment.informationSource}.`,
    });
  }
  if (generalFacts.length > 0) facts.general = generalFacts;

  // 5. Pain
  const painFacts: ClinicalFact[] = [];
  if (form.pain.painScaleType) {
    let painTxt = `Avaliação da dor (${form.pain.painScaleType}): `;
    if (form.pain.painScore) painTxt += `escore ${form.pain.painScore}`;
    if (form.pain.painLocation) painTxt += `, em ${form.pain.painLocation}`;
    if (form.pain.painCharacteristic) painTxt += ` (${form.pain.painCharacteristic})`;
    painFacts.push({
      id: 'fact-pain-assessment',
      category: 'pain',
      sourceField: 'pain.painScaleType',
      value: painTxt,
      canonicalText: `${painTxt}.`,
    });
  }
  if (form.pain.analgesiaRegistered) {
    const analg = form.pain.analgesiaRegistered === 'Sim' && form.pain.analgesiaDetails
      ? `Sim (${form.pain.analgesiaDetails})`
      : form.pain.analgesiaRegistered;
    painFacts.push({
      id: 'fact-pain-analgesia',
      category: 'pain',
      sourceField: 'pain.analgesiaRegistered',
      value: analg,
      canonicalText: `Analgesia administrada/registrada: ${analg}.`,
    });
  }
  if (painFacts.length > 0) facts.pain = painFacts;

  // 6. Vital Signs
  const vitalFacts: ClinicalFact[] = [];
  if (form.vitalSigns.systolicBP && form.vitalSigns.diastolicBP) {
    vitalFacts.push({
      id: 'fact-vs-bp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.bloodPressure',
      value: `${form.vitalSigns.systolicBP}x${form.vitalSigns.diastolicBP} mmHg`,
      canonicalText: `PA: ${form.vitalSigns.systolicBP}x${form.vitalSigns.diastolicBP} mmHg.`,
    });
  }
  if (form.vitalSigns.meanArterialPressure) {
    vitalFacts.push({
      id: 'fact-vs-pam',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.meanArterialPressure',
      value: `${form.vitalSigns.meanArterialPressure} mmHg`,
      canonicalText: `PAM manual: ${form.vitalSigns.meanArterialPressure} mmHg.`,
    });
  }
  if (form.vitalSigns.heartRate) {
    vitalFacts.push({
      id: 'fact-vs-hr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.heartRate',
      value: `${form.vitalSigns.heartRate} bpm`,
      canonicalText: `FC: ${form.vitalSigns.heartRate} bpm.`,
    });
  }
  if (form.vitalSigns.respiratoryRate) {
    vitalFacts.push({
      id: 'fact-vs-rr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.respiratoryRate',
      value: `${form.vitalSigns.respiratoryRate} irpm`,
      canonicalText: `FR: ${form.vitalSigns.respiratoryRate} irpm.`,
    });
  }
  if (form.vitalSigns.oxygenSaturation) {
    vitalFacts.push({
      id: 'fact-vs-spo2',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.oxygenSaturation',
      value: `${form.vitalSigns.oxygenSaturation}%`,
      canonicalText: `SpO₂: ${form.vitalSigns.oxygenSaturation}%.`,
    });
  }
  if (form.vitalSigns.temperature) {
    vitalFacts.push({
      id: 'fact-vs-temp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.temperature',
      value: `${form.vitalSigns.temperature} °C`,
      canonicalText: `Temperatura: ${form.vitalSigns.temperature} °C.`,
    });
  }
  if (form.vitalSigns.capillaryBloodGlucose) {
    vitalFacts.push({
      id: 'fact-vs-hgt',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.capillaryBloodGlucose',
      value: `${form.vitalSigns.capillaryBloodGlucose} mg/dL`,
      canonicalText: `Glicemia capilar: ${form.vitalSigns.capillaryBloodGlucose} mg/dL.`,
    });
  }
  if (vitalFacts.length > 0) facts.vitalSigns = vitalFacts;

  // 7. Neurological
  const neuroFacts: ClinicalFact[] = [];
  if (form.neurological.consciousnessLevel) {
    neuroFacts.push({
      id: 'fact-neuro-consciousness',
      category: 'neurological',
      sourceField: 'neurological.consciousnessLevel',
      value: form.neurological.consciousnessLevel,
      canonicalText: `Nível de consciência: ${form.neurological.consciousnessLevel}.`,
    });
  }
  if (form.neurological.orientation) {
    neuroFacts.push({
      id: 'fact-neuro-orientation',
      category: 'neurological',
      sourceField: 'neurological.orientation',
      value: form.neurological.orientation,
      canonicalText: `Orientação: ${form.neurological.orientation}.`,
    });
  }
  if (form.neurological.glasgowScore) {
    neuroFacts.push({
      id: 'fact-neuro-glasgow',
      category: 'neurological',
      sourceField: 'neurological.glasgowScore',
      value: form.neurological.glasgowScore,
      canonicalText: `Escala de Coma de Glasgow informada: ${form.neurological.glasgowScore}.`,
    });
  }
  if (form.neurological.pupils) {
    neuroFacts.push({
      id: 'fact-neuro-pupils',
      category: 'neurological',
      sourceField: 'neurological.pupils',
      value: form.neurological.pupils,
      canonicalText: `Pupilas: ${form.neurological.pupils}.`,
    });
  }
  if (form.neurological.photoreaction) {
    neuroFacts.push({
      id: 'fact-neuro-photoreaction',
      category: 'neurological',
      sourceField: 'neurological.photoreaction',
      value: form.neurological.photoreaction,
      canonicalText: `Fotorreação: ${form.neurological.photoreaction}.`,
    });
  }
  if (form.neurological.motorDeficit) {
    const mot = form.neurological.motorDeficit === 'Presente' && form.neurological.motorDeficitDetails
      ? `Presente (${form.neurological.motorDeficitDetails})`
      : form.neurological.motorDeficit;
    neuroFacts.push({
      id: 'fact-neuro-motor',
      category: 'neurological',
      sourceField: 'neurological.motorDeficit',
      value: mot,
      canonicalText: `Déficit motor: ${mot}.`,
    });
  }
  if (neuroFacts.length > 0) facts.neurological = neuroFacts;

  // 8. Respiratory
  const respFacts: ClinicalFact[] = [];
  if (form.respiratory.respiratorySupport) {
    let sup = form.respiratory.respiratorySupport;
    if (sup === 'Oxigenoterapia' && form.respiratory.supportDevice) {
      sup += ` via ${form.respiratory.supportDevice}`;
      if (form.respiratory.oxygenFlow) sup += ` a ${form.respiratory.oxygenFlow}`;
    }
    respFacts.push({
      id: 'fact-resp-support',
      category: 'respiratory',
      sourceField: 'respiratory.respiratorySupport',
      value: sup,
      canonicalText: `Suporte respiratório: ${sup}.`,
    });
  }
  if (form.respiratory.pattern) {
    respFacts.push({
      id: 'fact-resp-pattern',
      category: 'respiratory',
      sourceField: 'respiratory.pattern',
      value: form.respiratory.pattern,
      canonicalText: `Padrão respiratório: ${form.respiratory.pattern}.`,
    });
  }
  if (form.respiratory.respiratoryDiscomfort) {
    respFacts.push({
      id: 'fact-resp-discomfort',
      category: 'respiratory',
      sourceField: 'respiratory.respiratoryDiscomfort',
      value: form.respiratory.respiratoryDiscomfort,
      canonicalText: `Desconforto respiratório: ${form.respiratory.respiratoryDiscomfort}.`,
    });
  }
  if (form.respiratory.auscultation) {
    let ausc = form.respiratory.auscultation;
    if (ausc === 'Ruídos adventícios presentes' && form.respiratory.adventitiousSoundsDetails) {
      ausc += ` (${form.respiratory.adventitiousSoundsDetails})`;
    }
    respFacts.push({
      id: 'fact-resp-auscultation',
      category: 'respiratory',
      sourceField: 'respiratory.auscultation',
      value: ausc,
      canonicalText: `Ausculta pulmonar: ${ausc}.`,
    });
  }
  if (respFacts.length > 0) facts.respiratory = respFacts;

  // 9. Cardiovascular
  const cvFacts: ClinicalFact[] = [];
  if (form.cardiovascular.peripheralPerfusion) {
    cvFacts.push({
      id: 'fact-cv-perfusion',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.peripheralPerfusion',
      value: form.cardiovascular.peripheralPerfusion,
      canonicalText: `Perfusão periférica: ${form.cardiovascular.peripheralPerfusion}.`,
    });
  }
  if (form.cardiovascular.extremities) {
    cvFacts.push({
      id: 'fact-cv-extremities',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.extremities',
      value: form.cardiovascular.extremities,
      canonicalText: `Extremidades: ${form.cardiovascular.extremities}.`,
    });
  }
  if (form.cardiovascular.tec) {
    cvFacts.push({
      id: 'fact-cv-tec',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.tec',
      value: form.cardiovascular.tec,
      canonicalText: `Tempo de enchimento capilar (TEC): ${form.cardiovascular.tec}.`,
    });
  }
  if (form.cardiovascular.edema) {
    const ed = form.cardiovascular.edema === 'Presente' && form.cardiovascular.edemaLocation
      ? `Presente em ${form.cardiovascular.edemaLocation}`
      : form.cardiovascular.edema;
    cvFacts.push({
      id: 'fact-cv-edema',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.edema',
      value: ed,
      canonicalText: `Edema: ${ed}.`,
    });
  }
  if (form.cardiovascular.cardiacAuscultation) {
    let ca = form.cardiovascular.cardiacAuscultation;
    if (form.cardiovascular.cardiacDetails) ca += ` (${form.cardiovascular.cardiacDetails})`;
    cvFacts.push({
      id: 'fact-cv-cardiac',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.cardiacAuscultation',
      value: ca,
      canonicalText: `Ausculta cardíaca: ${ca}.`,
    });
  }
  if (cvFacts.length > 0) facts.cardiovascular = cvFacts;

  // 10. Gastrointestinal
  const giFacts: ClinicalFact[] = [];
  if (form.gastrointestinal.abdomenForm) {
    giFacts.push({
      id: 'fact-gi-form',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.abdomenForm',
      value: form.gastrointestinal.abdomenForm,
      canonicalText: `Abdome: ${form.gastrointestinal.abdomenForm}.`,
    });
  }
  if (form.gastrointestinal.consistency) {
    giFacts.push({
      id: 'fact-gi-consistency',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.consistency',
      value: form.gastrointestinal.consistency,
      canonicalText: `Consistência abdominal: ${form.gastrointestinal.consistency}.`,
    });
  }
  if (form.gastrointestinal.painOnPalpation) {
    const painP = form.gastrointestinal.painOnPalpation === 'Presente' && form.gastrointestinal.palpationPainLocation
      ? `Presente em ${form.gastrointestinal.palpationPainLocation}`
      : form.gastrointestinal.painOnPalpation;
    giFacts.push({
      id: 'fact-gi-pain',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.painOnPalpation',
      value: painP,
      canonicalText: `Dor à palpação abdominal: ${painP}.`,
    });
  }
  if (form.gastrointestinal.bowelSounds) {
    giFacts.push({
      id: 'fact-gi-rha',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.bowelSounds',
      value: form.gastrointestinal.bowelSounds,
      canonicalText: `Ruídos hidroaéreos (RHA): ${form.gastrointestinal.bowelSounds}.`,
    });
  }
  if (form.gastrointestinal.nauseaVomiting) {
    giFacts.push({
      id: 'fact-gi-nausea',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.nauseaVomiting',
      value: form.gastrointestinal.nauseaVomiting,
      canonicalText: `Náuseas/Vômitos: ${form.gastrointestinal.nauseaVomiting}.`,
    });
  }
  if (giFacts.length > 0) facts.gastrointestinal = giFacts;

  // 11. Nutrition
  const nutFacts: ClinicalFact[] = [];
  if (form.nutrition.nutritionalRoute) {
    let nutTxt = form.nutrition.nutritionalRoute;
    if (form.nutrition.acceptance && form.nutrition.acceptance !== 'Não se aplica') {
      nutTxt += `, ${form.nutrition.acceptance}`;
    }
    if (form.nutrition.fastingReason) {
      nutTxt += ` (motivo: ${form.nutrition.fastingReason})`;
    }
    if (form.nutrition.enteralDevice) {
      nutTxt += ` via ${form.nutrition.enteralDevice}`;
      if (form.nutrition.enteralInfusionRate) nutTxt += ` a ${form.nutrition.enteralInfusionRate}`;
      if (form.nutrition.enteralTolerance) nutTxt += ` (tolerância: ${form.nutrition.enteralTolerance})`;
    }
    nutFacts.push({
      id: 'fact-nut-route',
      category: 'nutrition',
      sourceField: 'nutrition.nutritionalRoute',
      value: nutTxt,
      canonicalText: `Nutrição e dieta: ${nutTxt}.`,
    });
  }
  if (nutFacts.length > 0) facts.nutrition = nutFacts;

  // 12. Eliminations
  const elimFacts: ClinicalFact[] = [];
  if (form.eliminations.diuresis) {
    let diuTxt = form.eliminations.diuresis;
    if (form.eliminations.diuresisAspect) diuTxt += `, aspecto ${form.eliminations.diuresisAspect}`;
    if (form.eliminations.diuresisVolume) diuTxt += ` (${form.eliminations.diuresisVolume} mL informados)`;
    elimFacts.push({
      id: 'fact-elim-diuresis',
      category: 'urinary',
      sourceField: 'eliminations.diuresis',
      value: diuTxt,
      canonicalText: `Diurese: ${diuTxt}.`,
    });
  }
  if (form.eliminations.bowelEvacuation) {
    let bowTxt = form.eliminations.bowelEvacuation;
    if (form.eliminations.bowelAspect) bowTxt += ` (${form.eliminations.bowelAspect})`;
    elimFacts.push({
      id: 'fact-elim-bowel',
      category: 'bowel',
      sourceField: 'eliminations.bowelEvacuation',
      value: bowTxt,
      canonicalText: `Evacuação: ${bowTxt}.`,
    });
  }
  if (elimFacts.length > 0) {
    facts.eliminations = elimFacts;
    facts.urinary = elimFacts.filter((f) => f.category === 'urinary');
    facts.bowel = elimFacts.filter((f) => f.category === 'bowel');
  }

  // 13. Surgical Wound
  const woundFacts: ClinicalFact[] = [];
  if (form.surgicalWound.hasSurgicalWound) {
    let wTxt = form.surgicalWound.hasSurgicalWound;
    if (form.surgicalWound.hasSurgicalWound === 'Sim') {
      if (form.surgicalWound.anatomicalLocation) wTxt += ` em ${form.surgicalWound.anatomicalLocation}`;
      if (form.surgicalWound.aspect) wTxt += `, aspecto ${form.surgicalWound.aspect}`;
      if (form.surgicalWound.dressingPresent) wTxt += `, curativo ${form.surgicalWound.dressingPresent.toLowerCase()}`;
      if (form.surgicalWound.dressingCondition) wTxt += ` (${form.surgicalWound.dressingCondition.toLowerCase()})`;
      if (form.surgicalWound.exudate) {
        wTxt += `, exsudato ${form.surgicalWound.exudate.toLowerCase()}`;
        if (form.surgicalWound.exudate === 'Presente' && form.surgicalWound.exudateCharacteristics) {
          wTxt += ` (${form.surgicalWound.exudateCharacteristics})`;
        }
      }
    }
    woundFacts.push({
      id: 'fact-surg-wound',
      category: 'surgicalWound',
      sourceField: 'surgicalWound.hasSurgicalWound',
      value: wTxt,
      canonicalText: `Ferida operatória: ${wTxt}.`,
    });
  }
  if (woundFacts.length > 0) facts.surgicalWound = woundFacts;

  // 14. Surgical Dressing
  const dressingFacts: ClinicalFact[] = [];
  if (form.surgicalDressing.dressingChanged) {
    let dTxt = `Troca de curativo: ${form.surgicalDressing.dressingChanged}`;
    if (form.surgicalDressing.dressingProductUsed) dTxt += `, utilizado: ${form.surgicalDressing.dressingProductUsed}`;
    if (form.surgicalDressing.dressingAspectObserved) dTxt += `, achados: ${form.surgicalDressing.dressingAspectObserved}`;
    if (form.surgicalDressing.dressingInterventionDetails) dTxt += ` (${form.surgicalDressing.dressingInterventionDetails})`;
    dressingFacts.push({
      id: 'fact-surg-dressing',
      category: 'surgicalDressing',
      sourceField: 'surgicalDressing.dressingChanged',
      value: dTxt,
      canonicalText: `${dTxt}.`,
    });
  }
  if (dressingFacts.length > 0) facts.surgicalDressing = dressingFacts;

  // 15. Drains
  const drainFacts: ClinicalFact[] = [];
  if (form.drains.hasDrains) {
    if (form.drains.hasDrains === 'Não') {
      drainFacts.push({
        id: 'fact-drain-none',
        category: 'drains',
        sourceField: 'drains.hasDrains',
        value: 'Sem drenos cirúrgicos presentes',
        canonicalText: 'Drenos cirúrgicos: não possui.',
      });
    } else if (form.drains.hasDrains === 'Sim' && form.drains.list.length > 0) {
      form.drains.list.forEach((dr, idx) => {
        const typeStr = dr.type === 'Outro' && dr.customType ? dr.customType : dr.type;
        let dStr = `${typeStr} em ${dr.location || 'local não especificado'}`;
        if (dr.permeability) dStr += `, ${dr.permeability.toLowerCase()}`;
        if (dr.functioning) dStr += `, ${dr.functioning.toLowerCase()}`;
        if (dr.fixation) dStr += `, fixação ${dr.fixation.toLowerCase()}`;
        if (dr.drainAspect) dStr += `, aspecto do débito: ${dr.drainAspect}`;
        if (dr.volumeReported) dStr += `, débito mensurado: ${dr.volumeReported} mL`;
        drainFacts.push({
          id: `fact-drain-${idx}`,
          category: 'drains',
          sourceField: `drains.list[${idx}]`,
          value: dStr,
          canonicalText: `Dreno: ${dStr}.`,
        });
      });
    }
  }
  if (drainFacts.length > 0) facts.drains = drainFacts;

  // 16. Devices
  const devFacts: ClinicalFact[] = [];
  if (form.devices.list.length > 0) {
    form.devices.list.forEach((dev, idx) => {
      let dStr = `${dev.type} em ${dev.anatomicalSite} ${dev.laterality}`;
      if (dev.siteCondition) dStr += `, sítio de inserção: ${dev.siteCondition}`;
      if (dev.dressingCondition) dStr += `, curativo: ${dev.dressingCondition}`;
      if (dev.permeability) dStr += `, ${dev.permeability.toLowerCase()}`;
      devFacts.push({
        id: `fact-dev-${idx}`,
        category: 'devices',
        sourceField: `devices.list[${idx}]`,
        value: dStr,
        canonicalText: `Dispositivo invasivo: ${dStr}.`,
      });
    });
  }
  if (devFacts.length > 0) facts.devices = devFacts;

  // 17. Mobility
  const mobFacts: ClinicalFact[] = [];
  if (form.mobility.mobility) {
    const mob = form.mobility.mobility === 'Outro' && form.mobility.customMobility
      ? form.mobility.customMobility
      : form.mobility.mobility;
    let mTxt = mob;
    if (form.mobility.decubitusChange && form.mobility.decubitusChange !== 'Não se aplica') {
      mTxt += `. Mudança de decúbito: ${form.mobility.decubitusChange}`;
    }
    mobFacts.push({
      id: 'fact-mob-mobility',
      category: 'mobility',
      sourceField: 'mobility.mobility',
      value: mTxt,
      canonicalText: `Mobilidade: ${mTxt}.`,
    });
  }
  if (mobFacts.length > 0) facts.mobility = mobFacts;

  // 18. Hygiene
  const hygFacts: ClinicalFact[] = [];
  if (form.hygiene.hygieneStatus) {
    let hTxt = form.hygiene.hygieneStatus;
    if (form.hygiene.bathType && form.hygiene.bathType !== 'Não se aplica') {
      hTxt += `. Banho: ${form.hygiene.bathType}`;
      if (form.hygiene.bathTolerance && form.hygiene.bathTolerance !== 'Não se aplica') {
        hTxt += ` (${form.hygiene.bathTolerance})`;
      }
    }
    hygFacts.push({
      id: 'fact-hyg-status',
      category: 'hygiene',
      sourceField: 'hygiene.hygieneStatus',
      value: hTxt,
      canonicalText: `Higiene e autocuidado: ${hTxt}.`,
    });
  }
  if (hygFacts.length > 0) facts.hygiene = hygFacts;

  // 19. Risks
  const riskFacts: ClinicalFact[] = [];
  if (form.riskAssessment.fallRiskStatus) {
    let rTxt = `Queda: ${form.riskAssessment.fallRiskStatus}`;
    if (form.riskAssessment.fallRiskScore) rTxt += ` (escore ${form.riskAssessment.fallRiskScore})`;
    riskFacts.push({
      id: 'fact-risk-fall',
      category: 'risks',
      sourceField: 'riskAssessment.fallRiskStatus',
      value: rTxt,
      canonicalText: `Risco assistencial - ${rTxt}.`,
    });
  }
  if (form.riskAssessment.lppRiskStatus) {
    let lTxt = `Lesão por pressão: ${form.riskAssessment.lppRiskStatus}`;
    if (form.riskAssessment.lppRiskScore) lTxt += ` (escore ${form.riskAssessment.lppRiskScore})`;
    riskFacts.push({
      id: 'fact-risk-lpp',
      category: 'risks',
      sourceField: 'riskAssessment.lppRiskStatus',
      value: lTxt,
      canonicalText: `Risco assistencial - ${lTxt}.`,
    });
  }
  if (form.riskAssessment.aspirationRiskStatus) {
    riskFacts.push({
      id: 'fact-risk-aspiration',
      category: 'risks',
      sourceField: 'riskAssessment.aspirationRiskStatus',
      value: form.riskAssessment.aspirationRiskStatus,
      canonicalText: `Risco de broncoaspiração: ${form.riskAssessment.aspirationRiskStatus}.`,
    });
  }
  if (form.riskAssessment.otherRisks) {
    riskFacts.push({
      id: 'fact-risk-other',
      category: 'risks',
      sourceField: 'riskAssessment.otherRisks',
      value: form.riskAssessment.otherRisks,
      canonicalText: `Outros riscos avaliados: ${form.riskAssessment.otherRisks}.`,
    });
  }
  if (riskFacts.length > 0) facts.riskAssessment = riskFacts;

  // 20. Care Done
  const careFacts: ClinicalFact[] = [];
  if (form.careDone.careItems.length > 0) {
    const items = [...form.careDone.careItems];
    if (form.careDone.customCare) items.push(form.careDone.customCare);
    careFacts.push({
      id: 'fact-care-items',
      category: 'care',
      sourceField: 'careDone.careItems',
      value: items.join('; '),
      canonicalText: `Cuidados de enfermagem prestados no plantão: ${items.join('; ')}.`,
    });
  }
  if (careFacts.length > 0) facts.care = careFacts;

  // 21. Response to Care
  const respCareFacts: ClinicalFact[] = [];
  if (form.responseToCare.evaluated && form.responseToCare.evaluated !== 'Não avaliado') {
    let rTxt = `Avaliada: ${form.responseToCare.evaluated}`;
    if (form.responseToCare.interventionTarget) rTxt += ` quanto a "${form.responseToCare.interventionTarget}"`;
    if (form.responseToCare.observedResponse) rTxt += ` — resposta observada: ${form.responseToCare.observedResponse}`;
    respCareFacts.push({
      id: 'fact-resp-care',
      category: 'responseToCare',
      sourceField: 'responseToCare.evaluated',
      value: rTxt,
      canonicalText: `Resposta aos cuidados: ${rTxt}.`,
    });
  }
  if (respCareFacts.length > 0) facts.responseToCare = respCareFacts;

  // 22. Complications
  const compFacts: ClinicalFact[] = [];
  if (form.complications.hasComplication) {
    let cTxt = form.complications.hasComplication;
    if (form.complications.hasComplication === 'Sim') {
      if (form.complications.description) cTxt += `: ${form.complications.description}`;
      if (form.complications.immediateAction) cTxt += `. Conduta: ${form.complications.immediateAction}`;
      if (form.complications.communicationDone) cTxt += `. Comunicação: ${form.complications.communicationDone}`;
      if (form.complications.responseObserved) cTxt += `. Retorno: ${form.complications.responseObserved}`;
    }
    compFacts.push({
      id: 'fact-comp-intercorr',
      category: 'complications',
      sourceField: 'complications.hasComplication',
      value: cTxt,
      canonicalText: `Intercorrência no plantão: ${cTxt}.`,
    });
  }
  if (compFacts.length > 0) facts.complications = compFacts;

  // 23. Communication
  const commFacts: ClinicalFact[] = [];
  if (form.communication.hasCommunication === 'Sim') {
    let cTxt = `Comunicação assistencial realizada`;
    if (form.communication.target) cTxt += ` com ${form.communication.target}`;
    if (form.communication.time) cTxt += ` às ${form.communication.time}`;
    if (form.communication.reason) cTxt += `, motivo: ${form.communication.reason}`;
    if (form.communication.responseObserved) cTxt += `, retorno: ${form.communication.responseObserved}`;
    commFacts.push({
      id: 'fact-comm-interprof',
      category: 'communication',
      sourceField: 'communication.hasCommunication',
      value: cTxt,
      canonicalText: `${cTxt}.`,
    });
  }
  if (commFacts.length > 0) facts.communication = commFacts;

  // 24. Comparison
  const compPrevFacts: ClinicalFact[] = [];
  if (form.comparisonWithPrevious.statusChange) {
    let cpTxt = form.comparisonWithPrevious.statusChange;
    if (form.comparisonWithPrevious.description) cpTxt += ` (${form.comparisonWithPrevious.description})`;
    compPrevFacts.push({
      id: 'fact-comp-previous',
      category: 'comparison',
      sourceField: 'comparisonWithPrevious.statusChange',
      value: cpTxt,
      canonicalText: `Comparação com avaliação anterior: ${cpTxt}.`,
    });
  }
  if (compPrevFacts.length > 0) facts.comparison = compPrevFacts;

  // 25. Synthesis
  const synthFacts: ClinicalFact[] = [];
  if (form.nursingSynthesis.synthesisText) {
    synthFacts.push({
      id: 'fact-nurse-synthesis',
      category: 'synthesis',
      sourceField: 'nursingSynthesis.synthesisText',
      value: form.nursingSynthesis.synthesisText,
      canonicalText: `Síntese de enfermagem: ${form.nursingSynthesis.synthesisText}`,
    });
  }
  if (synthFacts.length > 0) facts.synthesis = synthFacts;

  // 26. Current Status
  const statusFacts: ClinicalFact[] = [];
  if (form.currentStatus.status) {
    let sTxt = form.currentStatus.status === 'Outro' && form.currentStatus.customStatus
      ? form.currentStatus.customStatus
      : form.currentStatus.status;
    if (form.currentStatus.pendingIssues) sTxt += `. Pendências: ${form.currentStatus.pendingIssues}`;
    statusFacts.push({
      id: 'fact-final-status',
      category: 'finalStatus',
      sourceField: 'currentStatus.status',
      value: sTxt,
      canonicalText: `Situação atual: ${sTxt}.`,
    });
  }
  if (statusFacts.length > 0) facts.finalStatus = statusFacts;

  return facts;
}

/**
 * Validates clinical consistency for Nurse Surgical Clinic Evolution.
 * Implements NUR-SC-CONS-001 through NUR-SC-CONS-008.
 */
export function validateNurseSurgicalEvolutionConsistency(
  form: NurseSurgicalEvolutionForm
): ClinicalConsistencyAlert[] {
  const alerts: ClinicalConsistencyAlert[] = [];

  // NUR-SC-CONS-001: Ferida marcada sem localização
  if (form.surgicalWound.hasSurgicalWound === 'Sim' && !form.surgicalWound.anatomicalLocation?.trim()) {
    alerts.push({
      id: 'CONS-NUR-SC-001',
      ruleId: 'NUR-SC-CONS-001',
      severity: 'error',
      message: 'Ferida operatória indicada como presente, mas localização anatômica não foi informada.',
      fieldNames: ['surgicalWound.anatomicalLocation'],
      suggestedAction: 'Informe a localização anatômica da ferida cirúrgica.',
    });
  }

  // NUR-SC-CONS-002: Dreno marcado sem dispositivo
  if (form.drains.hasDrains === 'Sim' && (!form.drains.list || form.drains.list.length === 0)) {
    alerts.push({
      id: 'CONS-NUR-SC-002',
      ruleId: 'NUR-SC-CONS-002',
      severity: 'error',
      message: 'Drenos cirúrgicos indicados como presentes, mas nenhum dreno foi adicionado à lista.',
      fieldNames: ['drains.list'],
      suggestedAction: 'Adicione os dados do dreno (tipo, local, débito) ou corrija o campo.',
    });
  }

  // NUR-SC-CONS-003: Curativo não realizado com condição preenchida
  if (
    form.surgicalDressing.dressingChanged === 'Não' &&
    (form.surgicalDressing.dressingProductUsed?.trim() || form.surgicalDressing.dressingAspectObserved?.trim())
  ) {
    alerts.push({
      id: 'CONS-NUR-SC-003',
      ruleId: 'NUR-SC-CONS-003',
      severity: 'warning',
      message: 'Curativo indicado como não trocado, mas há produto utilizado ou aspecto observado preenchidos.',
      fieldNames: ['surgicalDressing.dressingProductUsed', 'surgicalDressing.dressingAspectObserved'],
      suggestedAction: 'Verifique se o curativo foi realmente trocado ou limpe os campos de intervenção.',
    });
  }

  // NUR-SC-CONS-004: Pós-operatório sem procedimento informado
  const isPostOp = [
    'Pós-operatório imediato',
    'Pós-operatório mediato',
    'Pós-operatório tardio',
  ].includes(form.surgicalContext.surgicalSituation);

  if (isPostOp && !form.surgicalContext.surgicalProcedure?.trim()) {
    alerts.push({
      id: 'CONS-NUR-SC-004',
      ruleId: 'NUR-SC-CONS-004',
      severity: 'warning',
      message: 'Paciente em situação de pós-operatório sem procedimento cirúrgico informado.',
      fieldNames: ['surgicalContext.surgicalProcedure'],
      suggestedAction: 'Informe o nome do procedimento cirúrgico realizado pelo paciente.',
    });
  }

  // NUR-SC-CONS-005: Resposta aos cuidados sem intervenção
  if (form.responseToCare.evaluated === 'Sim' && !form.responseToCare.interventionTarget?.trim()) {
    alerts.push({
      id: 'CONS-NUR-SC-005',
      ruleId: 'NUR-SC-CONS-005',
      severity: 'warning',
      message: 'Resposta aos cuidados assinalada como avaliada, mas a intervenção avaliada não foi informada.',
      fieldNames: ['responseToCare.interventionTarget'],
      suggestedAction: 'Especifique a intervenção de enfermagem cuja resposta clínica foi avaliada.',
    });
  }

  // NUR-SC-CONS-006: Intercorrência sem conduta
  if (form.complications.hasComplication === 'Sim' && !form.complications.immediateAction?.trim()) {
    alerts.push({
      id: 'CONS-NUR-SC-006',
      ruleId: 'NUR-SC-CONS-006',
      severity: 'error',
      message: 'Intercorrência cirúrgica registrada sem a conduta imediata tomada pela enfermagem.',
      fieldNames: ['complications.immediateAction'],
      suggestedAction: 'Descreva a conduta de enfermagem adotada diante da intercorrência.',
    });
  }

  // NUR-SC-CONS-007: Dispositivo ausente com descrição preenchida
  if (form.devices && form.devices.list) {
    for (let i = 0; i < form.devices.list.length; i++) {
      const dev = form.devices.list[i];
      if (!dev.type?.trim() && (dev.anatomicalSite?.trim() || dev.siteCondition?.trim())) {
        alerts.push({
          id: `CONS-NUR-SC-007-${i}`,
          ruleId: 'NUR-SC-CONS-007',
          severity: 'warning',
          message: `Dispositivo invasivo #${i + 1} possui detalhes preenchidos mas o tipo não foi especificado.`,
          fieldNames: [`devices.list[${i}].type`],
          suggestedAction: 'Selecione o tipo do dispositivo invasivo ou remova a linha.',
        });
      }
    }
  }

  // NUR-SC-CONS-008: Cenário correto sem alertas indevidos (retorna array vazio quando consistente)

  return alerts;
}

/**
 * Audits a narrative against authorized facts.
 */
export function auditNurseSurgicalEvolutionNarrative(
  narrative: string,
  authorizedFacts: AuthorizedClinicalFacts
): {
  passed: boolean;
  totalSegmentsCount: number;
  validSegmentsCount: number;
  untraceableSegments: string[];
} {
  const lines = narrative
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const untraceableSegments: string[] = [];

  // Flatten all authorized canonical texts and values
  const authorizedCorpus: string[] = [];
  for (const category of Object.values(authorizedFacts)) {
    if (Array.isArray(category)) {
      for (const fact of category) {
        if (fact.canonicalText) authorizedCorpus.push(fact.canonicalText.toLowerCase());
        if (typeof fact.value === 'string') authorizedCorpus.push(fact.value.toLowerCase());
      }
    }
  }

  const corpusText = authorizedCorpus.join(' ');

  lines.forEach((line) => {
    // Header lines are structural
    if (line.startsWith('EVOLUÇÃO DE ENFERMAGEM') || line.startsWith('Data/Hora') || line.startsWith('Profissional:')) {
      return;
    }
    const normLine = line.toLowerCase();
    // Check if key components of the line exist in authorized facts
    const words = normLine.split(/\s+/).filter((w) => w.length > 4);
    if (words.length > 0) {
      const matchFound = words.some((w) => corpusText.includes(w));
      if (!matchFound) {
        untraceableSegments.push(line);
      }
    }
  });

  return {
    passed: untraceableSegments.length === 0,
    totalSegmentsCount: lines.length,
    validSegmentsCount: lines.length - untraceableSegments.length,
    untraceableSegments,
  };
}
