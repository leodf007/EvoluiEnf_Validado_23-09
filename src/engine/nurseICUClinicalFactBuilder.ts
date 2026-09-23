import {
  NurseICUEvolutionForm,
  createInitialNurseICUEvolutionForm,
} from '../types/nurseICUEvolution';
import { AuthorizedClinicalFacts, ClinicalFact, AIRefinedResponse, VerificationResult } from './types';
import {
  auditDeterministicNarrative,
  AuditResult,
  NarrativeFactTrace,
} from './deterministicNarrativeFactAuditor';
import { verifyNurseICUAIRefinedResponse } from './nurseICUPostGenerationVerifier';
import { checkPrivacyGuards } from './privacyGuard';

export interface NurseICUConsistencyAlert {
  field: string;
  severity: 'warning' | 'error';
  message: string;
}

/**
 * Normalizes anatomical text and spelling.
 */
function cleanAnatomy(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bfemural\b/gi, 'femoral')
    .replace(/\bjugular\s+esq\b/gi, 'jugular esquerda')
    .replace(/\bjugular\s+dir\b/gi, 'jugular direita')
    .trim();
}

/**
 * Normalizes NurseICUEvolutionForm to clean empty states and conditional dependencies.
 */
export function normalizeNurseICUEvolutionForm(form: NurseICUEvolutionForm): NurseICUEvolutionForm {
  const cloned: NurseICUEvolutionForm = JSON.parse(JSON.stringify(form));

  // Banho não realizado -> remove tolerância
  if (cloned.careDone.bath === 'Não realizado' || !cloned.careDone.bath) {
    cloned.careDone.bathTolerance = '';
    cloned.careDone.bathAlterationDetails = '';
  }

  // Ausculta pulmonar não realizada -> limpa achados
  if (cloned.respiratory.pulmonaryAuscultationPerformed !== 'Sim') {
    cloned.respiratory.vesicularMurmur = '';
    cloned.respiratory.vesicularMurmurDetails = '';
    cloned.respiratory.adventitiousSounds = '';
    cloned.respiratory.adventitiousSoundTypes = [];
    cloned.respiratory.adventitiousSoundLocation = '';
  }

  // Ausculta cardíaca não realizada -> limpa achados
  if (cloned.cardiovascular.cardiacAuscultationPerformed !== 'Sim') {
    cloned.cardiovascular.heartSounds = '';
    cloned.cardiovascular.rhythm = '';
    cloned.cardiovascular.times = '';
    cloned.cardiovascular.murmurs = '';
    cloned.cardiovascular.murmursDescription = '';
  }

  // Suporte sem VMI -> limpa parâmetros de ventilação mecânica
  if (cloned.respiratory.respiratorySupport !== 'VMI') {
    cloned.mechanicalVentilation = {
      vmiAirway: '',
      vmiMode: '',
      vmiFiO2: '',
      vmiPeep: '',
      vmiRrSet: '',
      vmiTidalVolume: '',
      vmiSupportPressure: '',
      vmiInspiratoryPressure: '',
      vmiOtherParameters: '',
    };
  }

  // Drogas vasoativas Não -> limpa lista
  if (cloned.vasoactiveDrugs.vasoactiveDrugsInUse === 'Não') {
    cloned.vasoactiveDrugs.vasoactiveDrugsList = [];
  }

  // Sedação Não -> limpa lista
  if (cloned.sedationAnalgesiaInfusions.sedationInUse === 'Não') {
    cloned.sedationAnalgesiaInfusions.sedationList = [];
  }

  // Analgesia Não -> limpa lista
  if (cloned.sedationAnalgesiaInfusions.analgesiaInUse === 'Não') {
    cloned.sedationAnalgesiaInfusions.analgesiaList = [];
  }

  // Outras infusões Não -> limpa lista
  if (cloned.otherInfusions.otherInfusionsInUse === 'Não') {
    cloned.otherInfusions.otherInfusionsList = [];
  }

  // Balanço hídrico Não realizado -> limpa valores
  if (cloned.waterBalance.controlPerformed !== 'Realizado') {
    cloned.waterBalance.inputs = '';
    cloned.waterBalance.outputs = '';
    cloned.waterBalance.reportedBalance = '';
  }

  // Alergias Não referidas / Não informado -> limpa detalhes
  if (cloned.context.hasAllergies !== 'Sim') {
    cloned.context.allergyDescription = '';
  }

  // Intercorrências Não / Não informado -> limpa detalhes
  if (cloned.complications.hasComplication !== 'Sim') {
    cloned.complications.description = '';
    cloned.complications.time = '';
    cloned.complications.interventionDone = '';
    cloned.complications.responseObserved = '';
    cloned.complications.communicationDone = '';
    cloned.complications.communicationTime = '';
  }

  // Comunicação Não / Não informado -> limpa detalhes
  if (cloned.communication.hasCommunication !== 'Sim') {
    cloned.communication.target = '';
    cloned.communication.customTarget = '';
    cloned.communication.reason = '';
    cloned.communication.time = '';
    cloned.communication.responseObserved = '';
  }

  // Resposta aos cuidados não observada -> limpa texto
  if (cloned.responseToCare.responseEvaluated !== 'Resposta observada') {
    cloned.responseToCare.structuredResponseText = '';
  }

  // Banho não realizado ou não informado -> limpa tolerância
  if (cloned.careDone.bath === 'Não realizado' || cloned.careDone.bath === 'Não informado' || !cloned.careDone.bath) {
    cloned.careDone.bathTolerance = '';
  }

  // Normalização de dispositivos
  if (Array.isArray(cloned.devices.list)) {
    cloned.devices.list.forEach((dev) => {
      dev.location = cleanAnatomy(dev.location);
    });
  }

  return cloned;
}

/**
 * Validates clinical consistency across fields (NUR-ICU-CONS-001 to NUR-ICU-CONS-013).
 */
export function validateNurseICUConsistency(form: NurseICUEvolutionForm): NurseICUConsistencyAlert[] {
  const alerts: NurseICUConsistencyAlert[] = [];

  const isSedated =
    form.generalAssessment.behavior.includes('Sedado') ||
    form.neurological.consciousnessLevel === 'Sedado' ||
    form.sedationAssessment.sedationStatus === 'Sedado';

  // NUR-ICU-CONS-001: Sedado + queixa diretamente referida
  if (isSedated && form.generalAssessment.complaintStatus === 'Com queixa') {
    const isDirectSource =
      form.generalAssessment.informationSource === 'Paciente' ||
      !form.generalAssessment.informationSource;
    if (isDirectSource) {
      alerts.push({
        field: 'generalAssessment.complaintStatus',
        severity: 'warning',
        message: 'Paciente sedado com queixa referida diretamente pelo paciente. Verifique se a informação proveio de familiar/equipe.',
      });
    }
  }

  // NUR-ICU-CONS-002: Glasgow baixo (<= 8) + deambulação
  const glasgowNum = parseInt(form.neurological.glasgowScore, 10);
  const isAmbulating =
    form.mobilityAndSafety.mobility === 'Deambula sem auxílio' ||
    form.mobilityAndSafety.mobility === 'Deambula com auxílio';

  if (!isNaN(glasgowNum) && glasgowNum <= 8 && isAmbulating) {
    alerts.push({
      field: 'mobilityAndSafety.mobility',
      severity: 'error',
      message: `Glasgow com escore ${glasgowNum} é clinicamente incompatível com deambulação ativa informada.`,
    });
  }

  // NUR-ICU-CONS-003: VMI + deambulação
  if (form.respiratory.respiratorySupport === 'VMI' && isAmbulating) {
    alerts.push({
      field: 'mobilityAndSafety.mobility',
      severity: 'error',
      message: 'Ventilação Mecânica Invasiva (VMI) é incompatível com deambulação ativa sem supervisão intensiva específica.',
    });
  }

  // NUR-ICU-CONS-004: Sedado + RASS incompatível (> 0)
  const rassVal = parseInt(form.neurological.rassScore.replace('+', ''), 10);
  if (isSedated && !isNaN(rassVal) && rassVal > 0) {
    alerts.push({
      field: 'neurological.rassScore',
      severity: 'warning',
      message: `Paciente registrado como sedado, mas pontuação RASS informada é positiva (${form.neurological.rassScore}, indicando agitação/inquietação).`,
    });
  }

  // NUR-ICU-CONS-005: Perfusão adequada + TEC >= 3s
  if (
    form.cardiovascular.peripheralPerfusion === 'Adequada' &&
    form.cardiovascular.capillaryRefillTime === '≥ 3 segundos'
  ) {
    alerts.push({
      field: 'cardiovascular.capillaryRefillTime',
      severity: 'warning',
      message: 'Perfusão periférica registrada como adequada, porém tempo de enchimento capilar (TEC) registrado é ≥ 3 segundos.',
    });
  }

  // NUR-ICU-CONS-006: FR incompatível com padrão
  const rrNum = parseInt(form.vitalSigns.respiratoryRate, 10);
  if (!isNaN(rrNum)) {
    if (rrNum > 24 && form.respiratory.respiratoryPattern === 'Eupneico') {
      alerts.push({
        field: 'respiratory.respiratoryPattern',
        severity: 'warning',
        message: `Frequência respiratória de ${rrNum} irpm registrada com padrão 'Eupneico' (esperado taquipneia para FR > 24).`,
      });
    }
    if (rrNum < 12 && (form.respiratory.respiratoryPattern === 'Eupneico' || form.respiratory.respiratoryPattern === 'Taquipneico')) {
      alerts.push({
        field: 'respiratory.respiratoryPattern',
        severity: 'warning',
        message: `Frequência respiratória de ${rrNum} irpm registrada com padrão incompatível (${form.respiratory.respiratoryPattern}).`,
      });
    }
    if (rrNum > 20 && form.respiratory.respiratoryPattern === 'Bradipneico') {
      alerts.push({
        field: 'respiratory.respiratoryPattern',
        severity: 'warning',
        message: `Frequência respiratória de ${rrNum} irpm registrada como 'Bradipneico'.`,
      });
    }
  }

  // NUR-ICU-CONS-007: SVD + via espontânea simultânea
  const hasSVDDevice = form.devices.list?.some((d) => d.type === 'SVD');
  const hasSVDRout = form.eliminations.urinaryRoute === 'SVD';
  const hasSpontaneousRoute = form.eliminations.urinaryRoute === 'Espontânea';
  if ((hasSVDDevice && hasSpontaneousRoute) || (hasSVDRout && form.eliminations.customUrinaryRoute?.toLowerCase().includes('espontânea'))) {
    alerts.push({
      field: 'eliminations.urinaryRoute',
      severity: 'warning',
      message: 'Registro simultâneo de Sonda Vesical de Demora (SVD) e diurese por via espontânea.',
    });
  }

  // NUR-ICU-CONS-008: Dieta enteral sem via
  if (
    form.gastrointestinalAndNutrition.nutritionalRoute === 'Dieta enteral' &&
    !form.gastrointestinalAndNutrition.enteralDevice
  ) {
    alerts.push({
      field: 'gastrointestinalAndNutrition.enteralDevice',
      severity: 'error',
      message: 'Dieta enteral selecionada sem dispositivo informado (SNE, SNG, GTT).',
    });
  }

  // NUR-ICU-CONS-009: DVA Sim sem medicamento
  if (
    form.vasoactiveDrugs.vasoactiveDrugsInUse === 'Sim' &&
    (!form.vasoactiveDrugs.vasoactiveDrugsList ||
      form.vasoactiveDrugs.vasoactiveDrugsList.length === 0 ||
      form.vasoactiveDrugs.vasoactiveDrugsList.every((d) => !d.medication?.trim()))
  ) {
    alerts.push({
      field: 'vasoactiveDrugs.vasoactiveDrugsList',
      severity: 'error',
      message: 'Drogas vasoativas marcadas em uso, mas nenhuma droga foi discriminada na lista.',
    });
  }

  // NUR-ICU-CONS-010: VMI sem via aérea
  if (
    form.respiratory.respiratorySupport === 'VMI' &&
    !form.mechanicalVentilation.vmiAirway?.trim()
  ) {
    alerts.push({
      field: 'mechanicalVentilation.vmiAirway',
      severity: 'error',
      message: 'Ventilação Mecânica Invasiva (VMI) selecionada sem especificação da via aérea (TOT ou Traqueostomia).',
    });
  }

  // NUR-ICU-CONS-011: Resposta aos cuidados Sim sem descrição
  if (
    form.responseToCare.responseEvaluated === 'Resposta observada' &&
    !form.responseToCare.structuredResponseText?.trim()
  ) {
    alerts.push({
      field: 'responseToCare.structuredResponseText',
      severity: 'warning',
      message: 'Resposta aos cuidados informada como observada, mas nenhum texto descritivo foi fornecido.',
    });
  }

  // NUR-ICU-CONS-012: Melhora/piora sem descrição
  if (
    (form.evolutionState.statusChange === 'Melhora registrada pelo Enfermeiro' ||
      form.evolutionState.statusChange === 'Piora registrada pelo Enfermeiro' ||
      form.evolutionState.statusChange === 'Houve alteração observada') &&
    !form.evolutionState.changeDescription?.trim()
  ) {
    alerts.push({
      field: 'evolutionState.changeDescription',
      severity: 'warning',
      message: `Alteração de estado '${form.evolutionState.statusChange}' sem descrição detalhada dos parâmetros observados.`,
    });
  }

  return alerts;
}

/**
 * Builds authorized clinical facts from NurseICUEvolutionForm.
 * Exclusively consumes explicit facts. Never infers PAM, risk scores, or diagnostic outcomes.
 */
export function buildAuthorizedNurseICUFacts(rawForm: NurseICUEvolutionForm): AuthorizedClinicalFacts {
  const form = normalizeNurseICUEvolutionForm(rawForm);
  const facts: AuthorizedClinicalFacts = {
    context: [],
    general: [],
    vitalSigns: [],
    pain: [],
    neurological: [],
    respiratory: [],
    cardiovascular: [],
    vasoactive: [],
    sedationAnalgesia: [],
    gastrointestinal: [],
    nutrition: [],
    urinary: [],
    bowel: [],
    waterBalance: [],
    devices: [],
    skin: [],
    mobility: [],
    riskAssessment: [],
    care: [],
    bath: [],
    responseToCare: [],
    complications: [],
    communication: [],
    comparison: [],
    synthesis: [],
    finalStatus: [],
    additional: [],
  };

  // 1. Contexto
  const ctx = form.context;
  if (ctx.moment) {
    const momentText = ctx.moment === 'Outro' && ctx.customMoment ? ctx.customMoment : ctx.moment;
    facts.context!.push({
      id: 'nurse-icu-ctx-moment',
      category: 'context',
      sourceField: 'context.moment',
      value: momentText,
      canonicalText: `${momentText} em ${ctx.location || 'UTI'}`,
    });
  }
  if (ctx.escort && ctx.escort !== 'Não informado') {
    const escortText = ctx.escort === 'Outro' && ctx.customEscort ? ctx.customEscort : ctx.escort;
    facts.context!.push({
      id: 'nurse-icu-ctx-escort',
      category: 'context',
      sourceField: 'context.escort',
      value: escortText,
      canonicalText: `Acompanhamento: ${escortText.toLowerCase()}`,
    });
  }
  if (ctx.wristbandIdentification && ctx.wristbandIdentification !== 'Não informado') {
    facts.context!.push({
      id: 'nurse-icu-ctx-wristband',
      category: 'context',
      sourceField: 'context.wristbandIdentification',
      value: ctx.wristbandIdentification,
      canonicalText: `Pulseira de identificação: ${ctx.wristbandIdentification.toLowerCase()}`,
    });
  }
  if (ctx.bedIdentification && ctx.bedIdentification !== 'Não informado') {
    facts.context!.push({
      id: 'nurse-icu-ctx-bedsign',
      category: 'context',
      sourceField: 'context.bedIdentification',
      value: ctx.bedIdentification,
      canonicalText: `Placa de identificação do leito: ${ctx.bedIdentification.toLowerCase()}`,
    });
  }
  if (ctx.precaution && ctx.precaution !== 'Não informado') {
    const prec = ctx.precaution === 'Outra' && ctx.customPrecaution ? ctx.customPrecaution : ctx.precaution;
    facts.context!.push({
      id: 'nurse-icu-ctx-precaution',
      category: 'context',
      sourceField: 'context.precaution',
      value: prec,
      canonicalText: `Precaução: ${prec}`,
    });
  }
  if (ctx.hasAllergies && ctx.hasAllergies !== 'Não informado') {
    const desc = ctx.hasAllergies === 'Sim' && ctx.allergyDescription ? `: ${ctx.allergyDescription}` : '';
    facts.context!.push({
      id: 'nurse-icu-ctx-allergies',
      category: 'context',
      sourceField: 'context.hasAllergies',
      value: `${ctx.hasAllergies}${desc}`,
      canonicalText: `Alergias: ${ctx.hasAllergies.toLowerCase()}${desc}`,
    });
  }

  // 2. Avaliação Geral
  const gen = form.generalAssessment;
  if (gen.behavior && gen.behavior.length > 0 && !gen.behavior.includes('Não avaliado')) {
    facts.general!.push({
      id: 'nurse-icu-gen-behavior',
      category: 'general',
      sourceField: 'generalAssessment.behavior',
      value: gen.behavior,
      canonicalText: `Estado geral e comportamento: ${gen.behavior.join(', ').toLowerCase()}`,
    });
  }
  if (gen.complaintStatus && gen.complaintStatus !== 'Não avaliado' && gen.complaintStatus !== 'Não informado') {
    const desc = gen.complaintStatus === 'Com queixa' && gen.complaintDescription ? `: ${gen.complaintDescription}` : '';
    const src = gen.informationSource && gen.informationSource !== 'Não informado' ? ` (informado por: ${gen.informationSource.toLowerCase()})` : '';
    facts.general!.push({
      id: 'nurse-icu-gen-complaints',
      category: 'general',
      sourceField: 'generalAssessment.complaintStatus',
      value: `${gen.complaintStatus}${desc}${src}`,
      canonicalText: `Queixas: ${gen.complaintStatus.toLowerCase()}${desc}${src}`,
    });
  }
  if (gen.hygieneStatus && gen.hygieneStatus !== 'Não avaliada' && gen.hygieneStatus !== 'Não informado') {
    facts.general!.push({
      id: 'nurse-icu-gen-hygiene',
      category: 'general',
      sourceField: 'generalAssessment.hygieneStatus',
      value: gen.hygieneStatus,
      canonicalText: `Higiene: ${gen.hygieneStatus.toLowerCase()}`,
    });
  }

  // 3. Sinais Vitais
  const vs = form.vitalSigns;
  if (vs.systolicBP && vs.diastolicBP) {
    facts.vitalSigns!.push({
      id: 'nurse-icu-vs-bp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.systolicBP',
      value: `${vs.systolicBP}x${vs.diastolicBP} mmHg`,
      canonicalText: `PA ${vs.systolicBP}x${vs.diastolicBP} mmHg`,
    });
  }
  // PAM: ONLY if explicitly filled, NEVER calculated
  if (vs.meanArterialPressure?.trim()) {
    facts.vitalSigns!.push({
      id: 'nurse-icu-vs-pam',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.meanArterialPressure',
      value: `${vs.meanArterialPressure.trim()} mmHg`,
      canonicalText: `PAM ${vs.meanArterialPressure.trim()} mmHg`,
    });
  }
  if (vs.heartRate) {
    facts.vitalSigns!.push({
      id: 'nurse-icu-vs-hr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.heartRate',
      value: `${vs.heartRate} bpm`,
      canonicalText: `FC ${vs.heartRate} bpm`,
    });
  }
  if (vs.respiratoryRate) {
    facts.vitalSigns!.push({
      id: 'nurse-icu-vs-rr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.respiratoryRate',
      value: `${vs.respiratoryRate} irpm`,
      canonicalText: `FR ${vs.respiratoryRate} irpm`,
    });
  }
  if (vs.oxygenSaturation) {
    facts.vitalSigns!.push({
      id: 'nurse-icu-vs-spo2',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.oxygenSaturation',
      value: `${vs.oxygenSaturation}%`,
      canonicalText: `SpO₂ ${vs.oxygenSaturation}%`,
    });
  }
  if (vs.temperature) {
    facts.vitalSigns!.push({
      id: 'nurse-icu-vs-temp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.temperature',
      value: `${vs.temperature} °C`,
      canonicalText: `Temperatura ${vs.temperature} °C`,
    });
  }
  if (vs.capillaryBloodGlucose) {
    facts.vitalSigns!.push({
      id: 'nurse-icu-vs-glucose',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.capillaryBloodGlucose',
      value: `${vs.capillaryBloodGlucose} mg/dL`,
      canonicalText: `Glicemia capilar ${vs.capillaryBloodGlucose} mg/dL`,
    });
  }

  // 4. Dor
  const pain = form.pain;
  if (pain.painScaleType && pain.painScaleType !== 'Não avaliada' && pain.painScaleType !== 'Não informado') {
    if (pain.painScaleType === 'Não avaliável') {
      facts.pain!.push({
        id: 'nurse-icu-pain-unassessable',
        category: 'pain',
        sourceField: 'pain.painScaleType',
        value: 'Dor não avaliável',
        canonicalText: 'Dor não avaliável',
      });
    } else {
      const scoreStr = pain.painScore ? ` escore ${pain.painScore}` : '';
      const locStr = pain.painLocation ? ` em ${pain.painLocation}` : '';
      const charStr = pain.painCharacteristic ? ` (${pain.painCharacteristic})` : '';
      facts.pain!.push({
        id: 'nurse-icu-pain-assessment',
        category: 'pain',
        sourceField: 'pain.painScore',
        value: `${pain.painScaleType}${scoreStr}${locStr}${charStr}`,
        canonicalText: `Avaliação de dor (${pain.painScaleType})${scoreStr}${locStr}${charStr}`,
      });
    }
  }

  // 5. Neurológico
  const neuro = form.neurological;
  if (neuro.consciousnessLevel && neuro.consciousnessLevel !== 'Não avaliado') {
    const cText = neuro.consciousnessLevel === 'Outro' && neuro.customConsciousness ? neuro.customConsciousness : neuro.consciousnessLevel;
    facts.neurological!.push({
      id: 'nurse-icu-neuro-consciousness',
      category: 'neurological',
      sourceField: 'neurological.consciousnessLevel',
      value: cText,
      canonicalText: `Nível de consciência: ${cText.toLowerCase()}`,
    });
  }
  if (neuro.orientation && neuro.orientation !== 'Não avaliado' && neuro.orientation !== 'Não avaliável') {
    facts.neurological!.push({
      id: 'nurse-icu-neuro-orientation',
      category: 'neurological',
      sourceField: 'neurological.orientation',
      value: neuro.orientation,
      canonicalText: `Orientação: ${neuro.orientation.toLowerCase()}`,
    });
  }
  if (neuro.glasgowScore && neuro.glasgowScore !== 'Não avaliado' && neuro.glasgowScore !== 'Não aplicado') {
    facts.neurological!.push({
      id: 'nurse-icu-neuro-glasgow',
      category: 'neurological',
      sourceField: 'neurological.glasgowScore',
      value: neuro.glasgowScore,
      canonicalText: `Glasgow ${neuro.glasgowScore}`,
    });
  }
  if (neuro.rassScore && neuro.rassScore !== 'Não avaliado' && neuro.rassScore !== 'Não aplicado') {
    facts.neurological!.push({
      id: 'nurse-icu-neuro-rass',
      category: 'neurological',
      sourceField: 'neurological.rassScore',
      value: neuro.rassScore,
      canonicalText: `RASS ${neuro.rassScore}`,
    });
  }
  if (neuro.pupils && neuro.pupils !== 'Não avaliadas') {
    const pText = neuro.pupils === 'Outra' && neuro.customPupils ? neuro.customPupils : neuro.pupils;
    facts.neurological!.push({
      id: 'nurse-icu-neuro-pupils',
      category: 'neurological',
      sourceField: 'neurological.pupils',
      value: pText,
      canonicalText: `Pupilas ${pText.toLowerCase()}`,
    });
  }
  if (neuro.photoreaction && neuro.photoreaction !== 'Não avaliada') {
    const phText = neuro.photoreaction === 'Outra' && neuro.customPhotoreaction ? neuro.customPhotoreaction : neuro.photoreaction;
    facts.neurological!.push({
      id: 'nurse-icu-neuro-photoreaction',
      category: 'neurological',
      sourceField: 'neurological.photoreaction',
      value: phText,
      canonicalText: `Fotorreação: ${phText.toLowerCase()}`,
    });
  }
  if (neuro.motorDeficit && neuro.motorDeficit !== 'Não avaliado') {
    const mDesc = neuro.motorDeficit === 'Presente' && neuro.motorDeficitDescription ? `: ${neuro.motorDeficitDescription}` : '';
    facts.neurological!.push({
      id: 'nurse-icu-neuro-motor-deficit',
      category: 'neurological',
      sourceField: 'neurological.motorDeficit',
      value: `${neuro.motorDeficit}${mDesc}`,
      canonicalText: `Déficit motor: ${neuro.motorDeficit.toLowerCase()}${mDesc}`,
    });
  }

  // 6. Sedação avaliada
  const sed = form.sedationAssessment;
  if (sed.sedationStatus && sed.sedationStatus !== 'Não avaliado') {
    const rTxt = sed.rassReported ? ` (RASS ${sed.rassReported})` : '';
    const oTxt = sed.sedationObservations ? ` - ${sed.sedationObservations}` : '';
    facts.neurological!.push({
      id: 'nurse-icu-sedation-assessment',
      category: 'neurological',
      sourceField: 'sedationAssessment.sedationStatus',
      value: `${sed.sedationStatus}${rTxt}${oTxt}`,
      canonicalText: `Status de sedação: ${sed.sedationStatus.toLowerCase()}${rTxt}${oTxt}`,
    });
  }

  // 7. Respiratório e 8. Ventilação Mecânica
  const resp = form.respiratory;
  if (resp.respiratorySupport && resp.respiratorySupport !== 'Não informado') {
    const supText = resp.respiratorySupport === 'Outro' && resp.customSupport ? resp.customSupport : resp.respiratorySupport;
    facts.respiratory!.push({
      id: 'nurse-icu-resp-support',
      category: 'respiratory',
      sourceField: 'respiratory.respiratorySupport',
      value: supText,
      canonicalText: `Suporte respiratório: ${supText}`,
    });

    if (resp.respiratorySupport === 'Oxigenoterapia') {
      const dev = resp.oxygenDevice ? ` por ${resp.oxygenDevice}` : '';
      const flow = resp.oxygenFlowRate ? ` a ${resp.oxygenFlowRate} L/min` : '';
      facts.respiratory!.push({
        id: 'nurse-icu-resp-ox-details',
        category: 'respiratory',
        sourceField: 'respiratory.oxygenDevice',
        value: `${dev}${flow}`.trim(),
        canonicalText: `Oxigenoterapia${dev}${flow}`,
      });
    }
  }

  // Se VMI: Parâmetros ventilatórios
  if (resp.respiratorySupport === 'VMI') {
    const mv = form.mechanicalVentilation;
    if (mv.vmiAirway) {
      const airwayText = mv.vmiAirway === 'Outro' && mv.customVmiAirway ? mv.customVmiAirway : mv.vmiAirway;
      facts.respiratory!.push({
        id: 'nurse-icu-vent-airway',
        category: 'respiratory',
        sourceField: 'mechanicalVentilation.vmiAirway',
        value: airwayText,
        canonicalText: `Via aérea artificial: ${airwayText}`,
      });
    }
    const params: string[] = [];
    if (mv.vmiMode) params.push(`modo ${mv.vmiMode}`);
    if (mv.vmiFiO2) params.push(`FiO₂ ${mv.vmiFiO2}%`);
    if (mv.vmiPeep) params.push(`PEEP ${mv.vmiPeep} cmH₂O`);
    if (mv.vmiRrSet) params.push(`FR ventilador ${mv.vmiRrSet} rpm`);
    if (mv.vmiTidalVolume) params.push(`VC ${mv.vmiTidalVolume} mL`);
    if (mv.vmiSupportPressure) params.push(`PS ${mv.vmiSupportPressure} cmH₂O`);
    if (mv.vmiInspiratoryPressure) params.push(`P.insp ${mv.vmiInspiratoryPressure} cmH₂O`);
    if (mv.vmiOtherParameters) params.push(mv.vmiOtherParameters);

    if (params.length > 0) {
      facts.respiratory!.push({
        id: 'nurse-icu-vent-parameters',
        category: 'respiratory',
        sourceField: 'mechanicalVentilation.vmiMode',
        value: params.join(', '),
        canonicalText: `Parâmetros ventilatórios: ${params.join(', ')}`,
      });
    }
  }

  if (resp.respiratoryPattern && resp.respiratoryPattern !== 'Não avaliado') {
    const patText = resp.respiratoryPattern === 'Outro' && resp.customPattern ? resp.customPattern : resp.respiratoryPattern;
    facts.respiratory!.push({
      id: 'nurse-icu-resp-pattern',
      category: 'respiratory',
      sourceField: 'respiratory.respiratoryPattern',
      value: patText,
      canonicalText: `Padrão respiratório: ${patText.toLowerCase()}`,
    });
  }

  if (resp.respiratoryDistress && resp.respiratoryDistress !== 'Não avaliado') {
    facts.respiratory!.push({
      id: 'nurse-icu-resp-distress',
      category: 'respiratory',
      sourceField: 'respiratory.respiratoryDistress',
      value: resp.respiratoryDistress,
      canonicalText: `Desconforto respiratório: ${resp.respiratoryDistress.toLowerCase()}`,
    });
  }

  if (resp.accessoryMuscles && resp.accessoryMuscles !== 'Não avaliado') {
    facts.respiratory!.push({
      id: 'nurse-icu-resp-accessory-muscles',
      category: 'respiratory',
      sourceField: 'respiratory.accessoryMuscles',
      value: resp.accessoryMuscles,
      canonicalText: `Uso de musculatura acessória: ${resp.accessoryMuscles.toLowerCase()}`,
    });
  }

  if (resp.secretions && resp.secretions !== 'Não avaliadas') {
    const secDesc = resp.secretions === 'Presentes' && resp.secretionsDescription ? `: ${resp.secretionsDescription}` : '';
    facts.respiratory!.push({
      id: 'nurse-icu-resp-secretions',
      category: 'respiratory',
      sourceField: 'respiratory.secretions',
      value: `${resp.secretions}${secDesc}`,
      canonicalText: `Secreções respiratórias: ${resp.secretions.toLowerCase()}${secDesc}`,
    });
  }

  // Ausculta pulmonar: ONLY if performed
  if (resp.pulmonaryAuscultationPerformed === 'Sim') {
    const auscParts: string[] = [];
    if (resp.vesicularMurmur) auscParts.push(`murmúrio vesicular ${resp.vesicularMurmur.toLowerCase()}`);
    if (resp.vesicularMurmurDetails) auscParts.push(`(${resp.vesicularMurmurDetails})`);
    if (resp.adventitiousSounds === 'Ausentes') {
      auscParts.push('ruídos adventícios ausentes');
    } else if (resp.adventitiousSounds === 'Presentes') {
      const types = resp.adventitiousSoundTypes && resp.adventitiousSoundTypes.length > 0 ? resp.adventitiousSoundTypes.join(', ').toLowerCase() : 'presentes';
      const loc = resp.adventitiousSoundLocation ? ` em ${resp.adventitiousSoundLocation}` : '';
      auscParts.push(`ruídos adventícios: ${types}${loc}`);
    }
    if (auscParts.length > 0) {
      facts.respiratory!.push({
        id: 'nurse-icu-resp-auscultation',
        category: 'respiratory',
        sourceField: 'respiratory.pulmonaryAuscultationPerformed',
        value: auscParts.join('; '),
        canonicalText: `Ausculta pulmonar: ${auscParts.join('; ')}`,
      });
    }
  }

  // 9. Cardiovascular e perfusão
  const cv = form.cardiovascular;
  if (cv.peripheralPerfusion && cv.peripheralPerfusion !== 'Não avaliada') {
    const perfText = cv.peripheralPerfusion === 'Outra' && cv.customPerfusion ? cv.customPerfusion : cv.peripheralPerfusion;
    facts.cardiovascular!.push({
      id: 'nurse-icu-cv-perfusion',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.peripheralPerfusion',
      value: perfText,
      canonicalText: `Perfusão periférica: ${perfText.toLowerCase()}`,
    });
  }
  if (cv.extremities && cv.extremities !== 'Não avaliadas') {
    const extText = cv.extremities === 'Outra' && cv.customExtremities ? cv.customExtremities : cv.extremities;
    facts.cardiovascular!.push({
      id: 'nurse-icu-cv-extremities',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.extremities',
      value: extText,
      canonicalText: `Extremidades: ${extText.toLowerCase()}`,
    });
  }
  if (cv.capillaryRefillTime && cv.capillaryRefillTime !== 'Não avaliado') {
    facts.cardiovascular!.push({
      id: 'nurse-icu-cv-tec',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.capillaryRefillTime',
      value: cv.capillaryRefillTime,
      canonicalText: `Tempo de enchimento capilar (TEC): ${cv.capillaryRefillTime}`,
    });
  }
  if (cv.edema && cv.edema !== 'Não avaliado') {
    const edLoc = cv.edema === 'Presente' && cv.edemaLocation ? ` em ${cv.edemaLocation}` : '';
    const edGrd = cv.edema === 'Presente' && cv.edemaGrade ? ` (${cv.edemaGrade})` : '';
    facts.cardiovascular!.push({
      id: 'nurse-icu-cv-edema',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.edema',
      value: `${cv.edema}${edLoc}${edGrd}`,
      canonicalText: `Edema: ${cv.edema.toLowerCase()}${edLoc}${edGrd}`,
    });
  }

  // Ausculta cardíaca: ONLY if performed
  if (cv.cardiacAuscultationPerformed === 'Sim') {
    const cardParts: string[] = [];
    if (cv.heartSounds) cardParts.push(`bulhas ${cv.heartSounds.toLowerCase()}`);
    if (cv.rhythm) cardParts.push(`ritmo ${cv.rhythm.toLowerCase()}`);
    if (cv.times) cardParts.push(`em ${cv.times}`);
    if (cv.murmurs === 'Ausentes') {
      cardParts.push('sopros ausentes');
    } else if (cv.murmurs === 'Presentes') {
      cardParts.push(`sopros presentes${cv.murmursDescription ? `: ${cv.murmursDescription}` : ''}`);
    }
    if (cardParts.length > 0) {
      facts.cardiovascular!.push({
        id: 'nurse-icu-cv-auscultation',
        category: 'cardiovascular',
        sourceField: 'cardiovascular.cardiacAuscultationPerformed',
        value: cardParts.join(', '),
        canonicalText: `Ausculta cardíaca: ${cardParts.join(', ')}`,
      });
    }
  }

  // 10. Drogas Vasoativas
  const dva = form.vasoactiveDrugs;
  if (dva.vasoactiveDrugsInUse === 'Sim' && Array.isArray(dva.vasoactiveDrugsList)) {
    dva.vasoactiveDrugsList.forEach((item, index) => {
      if (item.medication?.trim()) {
        const concStr = item.concentration ? ` (${item.concentration})` : '';
        const obsStr = item.observation ? ` - ${item.observation}` : '';
        facts.vasoactive!.push({
          id: `nurse-icu-dva-${index}`,
          category: 'vasoactive',
          sourceField: `vasoactiveDrugs.vasoactiveDrugsList[${index}]`,
          value: `${item.medication}${concStr} a ${item.doseOrRate} ${item.unit}${obsStr}`,
          canonicalText: `DVA em infusão: ${item.medication}${concStr} a ${item.doseOrRate} ${item.unit}${obsStr}`,
        });
      }
    });
  }

  // 11. Sedação e Analgesia em infusão
  const sedAnal = form.sedationAnalgesiaInfusions;
  if (sedAnal.sedationInUse === 'Sim' && Array.isArray(sedAnal.sedationList)) {
    sedAnal.sedationList.forEach((item, index) => {
      if (item.medication?.trim()) {
        const obsStr = item.observation ? ` - ${item.observation}` : '';
        facts.sedationAnalgesia!.push({
          id: `nurse-icu-sedation-${index}`,
          category: 'sedationAnalgesia',
          sourceField: `sedationAnalgesiaInfusions.sedationList[${index}]`,
          value: `${item.medication} a ${item.doseOrRate} ${item.unit}${obsStr}`,
          canonicalText: `Sedação em infusão contínua: ${item.medication} a ${item.doseOrRate} ${item.unit}${obsStr}`,
        });
      }
    });
  }
  if (sedAnal.analgesiaInUse === 'Sim' && Array.isArray(sedAnal.analgesiaList)) {
    sedAnal.analgesiaList.forEach((item, index) => {
      if (item.medication?.trim()) {
        const obsStr = item.observation ? ` - ${item.observation}` : '';
        facts.sedationAnalgesia!.push({
          id: `nurse-icu-analgesia-${index}`,
          category: 'sedationAnalgesia',
          sourceField: `sedationAnalgesiaInfusions.analgesiaList[${index}]`,
          value: `${item.medication} a ${item.doseOrRate} ${item.unit}${obsStr}`,
          canonicalText: `Analgesia em infusão contínua: ${item.medication} a ${item.doseOrRate} ${item.unit}${obsStr}`,
        });
      }
    });
  }

  // 12. Outras infusões contínuas
  const oth = form.otherInfusions;
  if (oth.otherInfusionsInUse === 'Sim' && Array.isArray(oth.otherInfusionsList)) {
    oth.otherInfusionsList.forEach((item, index) => {
      if (item.substance?.trim()) {
        const obsStr = item.observation ? ` - ${item.observation}` : '';
        facts.vasoactive!.push({
          id: `nurse-icu-infusion-${index}`,
          category: 'vasoactive',
          sourceField: `otherInfusions.otherInfusionsList[${index}]`,
          value: `${item.substance} a ${item.doseOrRate} ${item.unit}${obsStr}`,
          canonicalText: `Infusão contínua: ${item.substance} a ${item.doseOrRate} ${item.unit}${obsStr}`,
        });
      }
    });
  }

  // 13. Gastrointestinal e Nutrição
  const gi = form.gastrointestinalAndNutrition;
  if (gi.nutritionalRoute && gi.nutritionalRoute !== 'Não informado') {
    const rText = gi.nutritionalRoute === 'Outra' && gi.customNutritionalRoute ? gi.customNutritionalRoute : gi.nutritionalRoute;
    if (gi.nutritionalRoute === 'Dieta enteral') {
      const devStr = gi.enteralDevice ? ` via ${gi.enteralDevice}` : '';
      const rateStr = gi.enteralRate ? ` a ${gi.enteralRate} ${gi.enteralRateUnit || 'mL/h'}` : '';
      const tolStr = gi.enteralTolerance ? ` (${gi.enteralTolerance.toLowerCase()})` : '';
      facts.nutrition!.push({
        id: 'nurse-icu-gi-enteral',
        category: 'nutrition',
        sourceField: 'gastrointestinalAndNutrition.nutritionalRoute',
        value: `${rText}${devStr}${rateStr}${tolStr}`,
        canonicalText: `Nutrição: ${rText}${devStr}${rateStr}${tolStr}`,
      });
    } else {
      facts.nutrition!.push({
        id: 'nurse-icu-gi-route',
        category: 'nutrition',
        sourceField: 'gastrointestinalAndNutrition.nutritionalRoute',
        value: rText,
        canonicalText: `Nutrição: ${rText.toLowerCase()}`,
      });
    }
  }

  // Abdome
  const abdParts: string[] = [];
  if (gi.abdomenForm && gi.abdomenForm !== 'Não avaliado') abdParts.push(`forma ${gi.abdomenForm.toLowerCase()}`);
  if (gi.abdomenConsistency && gi.abdomenConsistency !== 'Não avaliado') abdParts.push(`consistência ${gi.abdomenConsistency.toLowerCase()}`);
  if (gi.abdomenPalpation && gi.abdomenPalpation !== 'Não realizada') {
    const pLoc = gi.abdomenPalpation === 'Doloroso' && gi.abdomenPainLocation ? ` em ${gi.abdomenPainLocation}` : '';
    abdParts.push(`palpação ${gi.abdomenPalpation.toLowerCase()}${pLoc}`);
  }
  // RHA: ONLY if provided and !== 'Não avaliados'
  if (gi.bowelSounds && gi.bowelSounds !== 'Não avaliados') {
    abdParts.push(`ruídos hidroaéreos (RHA) ${gi.bowelSounds.toLowerCase()}`);
  }
  if (abdParts.length > 0) {
    facts.gastrointestinal!.push({
      id: 'nurse-icu-gi-abdomen',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinalAndNutrition.abdomenForm',
      value: abdParts.join(', '),
      canonicalText: `Exame abdominal: ${abdParts.join(', ')}`,
    });
  }

  // 14. Eliminações
  const elim = form.eliminations;
  if (elim.diuresis && elim.diuresis !== 'Não avaliada' && elim.diuresis !== 'Não informado') {
    const rStr = elim.urinaryRoute && elim.urinaryRoute !== 'Não informado' ? ` via ${elim.urinaryRoute}` : '';
    const volStr = elim.urineVolume ? ` volume de ${elim.urineVolume} mL` : '';
    const aspStr = elim.urineAspect ? ` aspecto ${elim.urineAspect}` : '';
    facts.urinary!.push({
      id: 'nurse-icu-elim-diuresis',
      category: 'urinary',
      sourceField: 'eliminations.diuresis',
      value: `${elim.diuresis}${rStr}${volStr}${aspStr}`,
      canonicalText: `Diurese: ${elim.diuresis.toLowerCase()}${rStr}${volStr}${aspStr}`,
    });
  }

  if (elim.bowelElimination && elim.bowelElimination !== 'Não avaliadas' && elim.bowelElimination !== 'Não informado') {
    const aspStr = elim.bowelAspect ? ` aspecto ${elim.bowelAspect}` : '';
    const consStr = elim.bowelConsistency ? ` consistência ${elim.bowelConsistency}` : '';
    facts.bowel!.push({
      id: 'nurse-icu-elim-bowel',
      category: 'bowel',
      sourceField: 'eliminations.bowelElimination',
      value: `${elim.bowelElimination}${aspStr}${consStr}`,
      canonicalText: `Evacuações: ${elim.bowelElimination.toLowerCase()}${aspStr}${consStr}`,
    });
  }

  // 15. Balanço Hídrico
  const wb = form.waterBalance;
  if (wb.controlPerformed === 'Realizado') {
    const parts: string[] = [];
    if (wb.inputs) parts.push(`entradas: ${wb.inputs} mL`);
    if (wb.outputs) parts.push(`saídas: ${wb.outputs} mL`);
    if (wb.reportedBalance) parts.push(`balanço hídrico informado: ${wb.reportedBalance} mL`);
    if (parts.length > 0) {
      facts.waterBalance!.push({
        id: 'nurse-icu-water-balance',
        category: 'waterBalance',
        sourceField: 'waterBalance.controlPerformed',
        value: parts.join(', '),
        canonicalText: `Controle de balanço hídrico: ${parts.join(', ')}`,
      });
    }
  }

  // 16. Dispositivos Invasivos
  if (Array.isArray(form.devices.list)) {
    form.devices.list.forEach((dev, index) => {
      const typeStr = dev.type === 'Outro' && dev.customType ? dev.customType : dev.type;
      const locStr = dev.location ? ` em ${dev.location}` : '';
      const permStr = dev.permeability ? ` (${dev.permeability.toLowerCase()})` : '';
      const funcStr = dev.functioning ? ` (${dev.functioning.toLowerCase()})` : '';
      const phlogStr = dev.phlogisticSigns ? ` sinais flogísticos ${dev.phlogisticSigns.toLowerCase()}` : '';
      const obsStr = dev.observations ? ` - ${dev.observations}` : '';

      facts.devices!.push({
        id: `nurse-icu-device-${index}`,
        category: 'devices',
        sourceField: `devices.list[${index}]`,
        value: `${typeStr}${locStr}${permStr}${funcStr}${phlogStr}${obsStr}`,
        canonicalText: `Dispositivo invasivo: ${typeStr}${locStr}${permStr}${funcStr}${phlogStr}${obsStr}`,
      });
    });
  }

  // 17. Pele e Integridade Cutânea
  const skin = form.skin;
  if (skin.integrity && skin.integrity !== 'Não avaliada') {
    facts.skin!.push({
      id: 'nurse-icu-skin-integrity',
      category: 'skin',
      sourceField: 'skin.integrity',
      value: skin.integrity,
      canonicalText: `Integridade da pele: ${skin.integrity.toLowerCase()}`,
    });
  }
  if (skin.hydration && skin.hydration !== 'Não avaliada') {
    facts.skin!.push({
      id: 'nurse-icu-skin-hydration',
      category: 'skin',
      sourceField: 'skin.hydration',
      value: skin.hydration,
      canonicalText: `Turgor e hidratação da pele: ${skin.hydration.toLowerCase()}`,
    });
  }
  if (skin.integrity === 'Com alteração/lesão') {
    const lParts: string[] = [];
    if (skin.lesionLocation) lParts.push(`localização: ${skin.lesionLocation}`);
    if (skin.lesionDimensions) lParts.push(`dimensões: ${skin.lesionDimensions}`);
    if (skin.lesionAspect) lParts.push(`aspecto: ${skin.lesionAspect}`);
    if (skin.lesionExudate) lParts.push(`exsudato: ${skin.lesionExudate}`);
    if (skin.lesionDressing) lParts.push(`cobertura/curativo: ${skin.lesionDressing}`);
    if (skin.perilesionalCondition) lParts.push(`área perilesional: ${skin.perilesionalCondition}`);
    if (skin.lesionObservations) lParts.push(`observações: ${skin.lesionObservations}`);

    if (lParts.length > 0) {
      facts.skin!.push({
        id: 'nurse-icu-skin-lesion',
        category: 'skin',
        sourceField: 'skin.lesionLocation',
        value: lParts.join(', '),
        canonicalText: `Lesão cutânea: ${lParts.join(', ')}`,
      });
    }
  }

  // 18. Mobilidade e Posicionamento
  const mob = form.mobilityAndSafety;
  if (mob.mobility && mob.mobility !== 'Não avaliado') {
    const mText = mob.mobility === 'Outro' && mob.customMobility ? mob.customMobility : mob.mobility;
    facts.mobility!.push({
      id: 'nurse-icu-mob-level',
      category: 'mobility',
      sourceField: 'mobilityAndSafety.mobility',
      value: mText,
      canonicalText: `Mobilidade: ${mText.toLowerCase()}`,
    });
  }
  if (mob.repositioning && mob.repositioning !== 'Não informado') {
    const repStr = mob.repositioning === 'Realizada' && mob.repositioningInterval ? ` (intervalo: ${mob.repositioningInterval})` : '';
    facts.mobility!.push({
      id: 'nurse-icu-mob-repositioning',
      category: 'mobility',
      sourceField: 'mobilityAndSafety.repositioning',
      value: `${mob.repositioning}${repStr}`,
      canonicalText: `Mudança de decúbito: ${mob.repositioning.toLowerCase()}${repStr}`,
    });
  }
  if (mob.bedRails && mob.bedRails !== 'Não informado') {
    facts.mobility!.push({
      id: 'nurse-icu-mob-rails',
      category: 'mobility',
      sourceField: 'mobilityAndSafety.bedRails',
      value: mob.bedRails,
      canonicalText: `Grades do leito: ${mob.bedRails.toLowerCase()}`,
    });
  }
  if (mob.headOfBed && mob.headOfBed !== 'Não informado') {
    const angStr = mob.headOfBedAngle ? ` a ${mob.headOfBedAngle}°` : '';
    facts.mobility!.push({
      id: 'nurse-icu-mob-head',
      category: 'mobility',
      sourceField: 'mobilityAndSafety.headOfBed',
      value: `${mob.headOfBed}${angStr}`,
      canonicalText: `Cabeceira: ${mob.headOfBed.toLowerCase()}${angStr}`,
    });
  }

  // 19. Riscos Assistenciais (Preservados exatamente sem cálculo)
  const rsk = form.riskAssessment;
  if (rsk.fallRiskStatus === 'Avaliado') {
    const scl = rsk.fallRiskScale ? ` (${rsk.fallRiskScale})` : '';
    const scr = rsk.fallRiskScore ? ` escore ${rsk.fallRiskScore}` : '';
    const cls = rsk.fallRiskClassification ? ` classificação registrada: ${rsk.fallRiskClassification}` : '';
    facts.riskAssessment!.push({
      id: 'nurse-icu-risk-fall',
      category: 'riskAssessment',
      sourceField: 'riskAssessment.fallRiskStatus',
      value: `Risco de queda avaliado${scl}${scr}${cls}`,
      canonicalText: `Risco de queda avaliado${scl}${scr}${cls}`,
    });
  }
  if (rsk.pressureInjuryRiskStatus === 'Avaliado') {
    const scl = rsk.pressureInjuryScale ? ` (${rsk.pressureInjuryScale})` : '';
    const scr = rsk.pressureInjuryScore ? ` escore ${rsk.pressureInjuryScore}` : '';
    const cls = rsk.pressureInjuryClassification ? ` classificação registrada: ${rsk.pressureInjuryClassification}` : '';
    facts.riskAssessment!.push({
      id: 'nurse-icu-risk-pi',
      category: 'riskAssessment',
      sourceField: 'riskAssessment.pressureInjuryRiskStatus',
      value: `Risco de lesão por pressão avaliado${scl}${scr}${cls}`,
      canonicalText: `Risco de lesão por pressão avaliado${scl}${scr}${cls}`,
    });
  }
  if (rsk.aspirationRiskStatus && rsk.aspirationRiskStatus !== 'Não avaliado') {
    facts.riskAssessment!.push({
      id: 'nurse-icu-risk-aspiration',
      category: 'riskAssessment',
      sourceField: 'riskAssessment.aspirationRiskStatus',
      value: rsk.aspirationRiskStatus,
      canonicalText: `Risco de broncoaspiração: ${rsk.aspirationRiskStatus.toLowerCase()}`,
    });
  }

  // 20. Cuidados e Intervenções
  const care = form.careDone;
  if (Array.isArray(care.careItems) && care.careItems.length > 0) {
    care.careItems.forEach((item, index) => {
      facts.care!.push({
        id: `nurse-icu-care-${index}`,
        category: 'care',
        sourceField: `careDone.careItems[${index}]`,
        value: item,
        canonicalText: `Cuidado executado: ${item}`,
      });
    });
  }
  if (care.customCareDetails?.trim()) {
    facts.care!.push({
      id: 'nurse-icu-care-custom',
      category: 'care',
      sourceField: 'careDone.customCareDetails',
      value: care.customCareDetails.trim(),
      canonicalText: `Outros cuidados: ${care.customCareDetails.trim()}`,
    });
  }

  // Banho
  if (care.bath && care.bath !== 'Não realizado' && care.bath !== 'Não informado') {
    const tolStr = care.bathTolerance && care.bathTolerance !== 'Não avaliada' ? ` com ${care.bathTolerance.toLowerCase()}` : '';
    facts.bath!.push({
      id: 'nurse-icu-bath',
      category: 'bath',
      sourceField: 'careDone.bath',
      value: `${care.bath}${tolStr}`,
      canonicalText: `Banho: ${care.bath.toLowerCase()}${tolStr}`,
    });
  }

  // 21. Resposta aos Cuidados
  const respCare = form.responseToCare;
  if (respCare.responseEvaluated === 'Resposta observada' && respCare.structuredResponseText?.trim()) {
    facts.responseToCare!.push({
      id: 'nurse-icu-response-to-care',
      category: 'responseToCare',
      sourceField: 'responseToCare.structuredResponseText',
      value: respCare.structuredResponseText.trim(),
      canonicalText: `Resposta observada aos cuidados: ${respCare.structuredResponseText.trim()}`,
    });
  }

  // 22. Intercorrências
  const comp = form.complications;
  if (comp.hasComplication === 'Não') {
    facts.complications!.push({
      id: 'nurse-icu-complication-none',
      category: 'complications',
      sourceField: 'complications.hasComplication',
      value: 'Sem intercorrências no período.',
      canonicalText: 'Sem intercorrências no período.',
    });
  } else if (comp.hasComplication === 'Sim' && comp.description?.trim()) {
    const timeStr = comp.time ? ` às ${comp.time}` : '';
    const condStr = comp.interventionDone ? ` Conduta adotada: ${comp.interventionDone}.` : '';
    const resStr = comp.responseObserved ? ` Resposta: ${comp.responseObserved}.` : '';
    const commStr = comp.communicationDone ? ` Comunicação: ${comp.communicationDone}.` : '';

    facts.complications!.push({
      id: 'nurse-icu-complication-event',
      category: 'complications',
      sourceField: 'complications.description',
      value: `${comp.description.trim()}${timeStr}.${condStr}${resStr}${commStr}`,
      canonicalText: `Intercorrência${timeStr}: ${comp.description.trim()}.${condStr}${resStr}${commStr}`,
    });
  }

  // 23. Comunicação
  const comm = form.communication;
  if (comm.hasCommunication === 'Sim' && comm.reason?.trim()) {
    const tgt = comm.target === 'Outro' && comm.customTarget ? comm.customTarget : comm.target || 'equipe';
    const tStr = comm.time ? ` às ${comm.time}` : '';
    const rStr = comm.responseObserved ? ` Retorno/orientação: ${comm.responseObserved}.` : '';
    facts.communication!.push({
      id: 'nurse-icu-communication',
      category: 'communication',
      sourceField: 'communication.reason',
      value: `Comunicação realizada a(o) ${tgt}${tStr} referente a ${comm.reason.trim()}.${rStr}`,
      canonicalText: `Comunicação realizada a(o) ${tgt}${tStr} referente a ${comm.reason.trim()}.${rStr}`,
    });
  }

  // 24. Alterações em relação à avaliação anterior
  const evo = form.evolutionState;
  if (evo.statusChange && evo.statusChange !== 'Não informado' && evo.statusChange !== 'Sem comparação disponível') {
    const dStr = evo.changeDescription?.trim() ? `: ${evo.changeDescription.trim()}` : '';
    facts.comparison!.push({
      id: 'nurse-icu-comparison',
      category: 'comparison',
      sourceField: 'evolutionState.statusChange',
      value: `${evo.statusChange}${dStr}`,
      canonicalText: `Comparação com avaliação anterior: ${evo.statusChange}${dStr}`,
    });
  }

  // 25. Síntese de Enfermagem
  if (evo.nursingSynthesis?.trim()) {
    facts.synthesis!.push({
      id: 'nurse-icu-synthesis',
      category: 'synthesis',
      sourceField: 'evolutionState.nursingSynthesis',
      value: evo.nursingSynthesis.trim(),
      canonicalText: `Síntese de enfermagem: ${evo.nursingSynthesis.trim()}`,
    });
  }

  // 26. Situação Atual e Informações Adicionais
  if (evo.currentStatus && evo.currentStatus !== 'Não informado') {
    const curText = evo.currentStatus === 'Outra' && evo.customCurrentStatus ? evo.customCurrentStatus : evo.currentStatus;
    facts.finalStatus!.push({
      id: 'nurse-icu-final-status',
      category: 'finalStatus',
      sourceField: 'evolutionState.currentStatus',
      value: curText,
      canonicalText: `Situação atual: ${curText}`,
    });
  }
  if (evo.additionalNotes?.trim()) {
    facts.additional!.push({
      id: 'nurse-icu-additional',
      category: 'additional',
      sourceField: 'evolutionState.additionalNotes',
      value: evo.additionalNotes.trim(),
      canonicalText: `Informações adicionais: ${evo.additionalNotes.trim()}`,
    });
  }

  return facts;
}

/**
 * Builds the deterministic nurse ICU evolution note with trace segments.
 */
export function buildNurseICUEvolutionNoteWithTrace(facts: AuthorizedClinicalFacts): {
  narrative: string;
  segments: NarrativeFactTrace[];
} {
  const segments: NarrativeFactTrace[] = [];

  // Parágrafo 1: Contexto e Avaliação Geral
  const p1Facts = [
    ...(facts.context || []),
    ...(facts.general || []),
  ];
  if (p1Facts.length > 0) {
    p1Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'context_and_general',
      });
    });
  }

  // Parágrafo 2: Sinais Vitais e Dor
  const p2Facts = [
    ...(facts.vitalSigns || []),
    ...(facts.pain || []),
  ];
  if (p2Facts.length > 0) {
    p2Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'vitals_and_pain',
      });
    });
  }

  // Parágrafo 3: Neurológico e Sedação
  const p3Facts = [...(facts.neurological || [])];
  if (p3Facts.length > 0) {
    p3Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'neurological',
      });
    });
  }

  // Parágrafo 4: Respiratório e Ventilação Mecânica
  const p4Facts = [...(facts.respiratory || [])];
  if (p4Facts.length > 0) {
    p4Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'respiratory',
      });
    });
  }

  // Parágrafo 5: Cardiovascular, Perfusão, DVA e Infusões
  const p5Facts = [
    ...(facts.cardiovascular || []),
    ...(facts.vasoactive || []),
    ...(facts.sedationAnalgesia || []),
  ];
  if (p5Facts.length > 0) {
    p5Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'cardiovascular_and_infusions',
      });
    });
  }

  // Parágrafo 6: Gastrointestinal, Nutrição, Eliminações e Balanço Hídrico
  const p6Facts = [
    ...(facts.nutrition || []),
    ...(facts.gastrointestinal || []),
    ...(facts.urinary || []),
    ...(facts.bowel || []),
    ...(facts.waterBalance || []),
  ];
  if (p6Facts.length > 0) {
    p6Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'nutrition_and_eliminations',
      });
    });
  }

  // Parágrafo 7: Dispositivos Invasivos
  const p7Facts = [...(facts.devices || [])];
  if (p7Facts.length > 0) {
    p7Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'devices',
      });
    });
  }

  // Parágrafo 8: Pele, Integridade, Mobilidade e Riscos
  const p8Facts = [
    ...(facts.skin || []),
    ...(facts.mobility || []),
    ...(facts.riskAssessment || []),
  ];
  if (p8Facts.length > 0) {
    p8Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'skin_and_mobility',
      });
    });
  }

  // Parágrafo 9: Cuidados Realizados, Banho e Resposta aos Cuidados
  const p9Facts = [
    ...(facts.care || []),
    ...(facts.bath || []),
    ...(facts.responseToCare || []),
  ];
  if (p9Facts.length > 0) {
    p9Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'care_and_response',
      });
    });
  }

  // Parágrafo 10: Intercorrências, Comunicação, Comparação, Síntese e Desfecho
  const p10Facts = [
    ...(facts.complications || []),
    ...(facts.communication || []),
    ...(facts.comparison || []),
    ...(facts.synthesis || []),
    ...(facts.finalStatus || []),
    ...(facts.additional || []),
  ];
  if (p10Facts.length > 0) {
    p10Facts.forEach((f) => {
      segments.push({
        text: `${f.canonicalText}.`,
        factIds: [f.id],
        category: 'synthesis_and_outcome',
      });
    });
  }

  // Agrupa segmentos por categoria para formar parágrafos coerentes
  const categoryGroups: Record<string, string[]> = {};
  segments.forEach((seg) => {
    const cat = seg.category || 'general';
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(seg.text);
  });

  const narrative = Object.values(categoryGroups)
    .map((sentences) => sentences.join(' '))
    .join('\n\n');

  return { narrative, segments };
}

/**
 * Builds the canonical deterministic note string.
 */
export function buildNurseICUEvolutionNote(facts: AuthorizedClinicalFacts): string {
  return buildNurseICUEvolutionNoteWithTrace(facts).narrative;
}

/**
 * Audits deterministic narrative traces against authorized facts.
 */
export function auditNurseICUNarrative(
  segments: NarrativeFactTrace[],
  facts: AuthorizedClinicalFacts
): AuditResult {
  return auditDeterministicNarrative(segments, facts);
}
