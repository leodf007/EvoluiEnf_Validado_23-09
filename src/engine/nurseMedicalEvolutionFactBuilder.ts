import {
  NurseMedicalEvolutionForm,
  createInitialNurseMedicalEvolutionForm,
} from '../types/nurseMedicalEvolution';
import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import {
  auditDeterministicNarrative,
  AuditResult,
  NarrativeFactTrace,
} from './deterministicNarrativeFactAuditor';

export interface NurseMedicalEvolutionConsistencyAlert {
  field: string;
  severity: 'warning' | 'error';
  message: string;
}

/**
 * Normalizes NurseMedicalEvolutionForm to clean empty states and conditional dependencies.
 */
export function normalizeNurseMedicalEvolutionForm(form: NurseMedicalEvolutionForm): NurseMedicalEvolutionForm {
  const cloned: NurseMedicalEvolutionForm = JSON.parse(JSON.stringify(form));

  // Banho não realizado -> remove tolerância
  if (cloned.hygiene.bath === 'Não realizado' || !cloned.hygiene.bath) {
    cloned.hygiene.bathTolerance = '';
  }

  // Ausculta pulmonar não realizada -> limpa achados
  if (cloned.respiratory.pulmonaryAuscultationPerformed !== 'Sim') {
    cloned.respiratory.vesicularMurmur = '';
    cloned.respiratory.adventitiousSounds = '';
    cloned.respiratory.adventitiousSoundTypes = [];
    cloned.respiratory.adventitiousSoundLocation = '';
  }

  // Ausculta cardíaca não realizada -> limpa achados
  if (cloned.cardiovascular.cardiacAuscultationPerformed !== 'Sim') {
    cloned.cardiovascular.heartSounds = '';
    cloned.cardiovascular.rhythm = '';
  }

  // Queixas: se sem queixas ou não informado, limpa descrição
  if (cloned.generalAssessment.complaintStatus === 'Sem queixas referidas' || !cloned.generalAssessment.complaintStatus) {
    cloned.generalAssessment.complaintDescription = '';
  }

  // Alergias: se não referidas, limpa descrição
  if (cloned.context.hasAllergies === 'Não referidas' || !cloned.context.hasAllergies) {
    cloned.context.allergyDescription = '';
  }

  // Intercorrências: se Não ou vazio, limpa detalhes
  if (cloned.complications.hasComplication === 'Não' || !cloned.complications.hasComplication) {
    cloned.complications.description = '';
    cloned.complications.time = '';
    cloned.complications.actionsTaken = '';
    cloned.complications.communicatedToTeam = '';
    cloned.complications.communicatedWho = '';
    cloned.complications.patientResponse = '';
  }

  // Comunicação: se Não ou vazio, limpa detalhes
  if (cloned.communication.hasCommunication === 'Não' || !cloned.communication.hasCommunication) {
    cloned.communication.target = '';
    cloned.communication.time = '';
    cloned.communication.reason = '';
    cloned.communication.responseObserved = '';
  }

  // Dieta enteral: se não for enteral, limpa detalhes específicos de sonda
  if (cloned.nutrition.nutritionalRoute !== 'Dieta enteral') {
    cloned.nutrition.enteralDevice = '';
    cloned.nutrition.enteralRate = '';
    cloned.nutrition.enteralTolerance = '';
  }

  // Resposta aos cuidados: se não avaliada, limpa respostas
  if (cloned.responseToCare.evaluated !== 'Sim') {
    cloned.responseToCare.interventionDone = '';
    cloned.responseToCare.observedResponse = '';
    cloned.responseToCare.structuredResponseText = '';
  }

  return cloned;
}

/**
 * Validates clinical consistency for Nurse Medical Clinic Evolution.
 * NUR-CM-CONS-001 to NUR-CM-CONS-008
 */
export function validateNurseMedicalEvolutionConsistency(form: NurseMedicalEvolutionForm): NurseMedicalEvolutionConsistencyAlert[] {
  const alerts: NurseMedicalEvolutionConsistencyAlert[] = [];

  const isSedatedOrDepressed =
    form.generalAssessment.consciousness === 'Sedado' ||
    form.generalAssessment.consciousness === 'Torporoso' ||
    form.neurological.consciousnessLevel === 'Sedado' ||
    form.neurological.consciousnessLevel === 'Comatoso' ||
    form.generalAssessment.behavior.includes('Sedado');

  // NUR-CM-CONS-001: Sedado + queixa direta
  if (isSedatedOrDepressed && form.generalAssessment.complaintStatus === 'Com queixa') {
    const isDirectSource =
      form.generalAssessment.informationSource === 'Paciente' ||
      !form.generalAssessment.informationSource;
    if (isDirectSource) {
      alerts.push({
        field: 'generalAssessment.complaintStatus',
        severity: 'warning',
        message: 'Paciente com nível de consciência deprimido/sedado com queixa referida diretamente pelo paciente. Verifique se a informação proveio de familiar ou equipe.',
      });
    }
  }

  // NUR-CM-CONS-002: VMI + deambulação
  const isAmbulating =
    form.mobility.mobility === 'Deambula sem auxílio' ||
    form.mobility.mobility === 'Deambula com auxílio';
  if (form.respiratory.respiratorySupport === 'VMI' && isAmbulating) {
    alerts.push({
      field: 'mobility.mobility',
      severity: 'error',
      message: 'Ventilação Mecânica Invasiva (VMI) é clinicamente incompatível com deambulação em enfermaria clínica.',
    });
  }

  // NUR-CM-CONS-003: Dieta enteral sem dispositivo
  if (form.nutrition.nutritionalRoute === 'Dieta enteral') {
    const hasDevice = Boolean(form.nutrition.enteralDevice && form.nutrition.enteralDevice.trim() !== '');
    if (!hasDevice) {
      alerts.push({
        field: 'nutrition.enteralDevice',
        severity: 'error',
        message: 'Dieta enteral informada sem o respectivo dispositivo de acesso enteral (SNE/SNG/GTT).',
      });
    }
  }

  // NUR-CM-CONS-004: SVD + diurese espontânea simultânea
  const hasSVD =
    form.eliminations.urinaryRoute === 'SVD' ||
    (form.eliminations.customUrinaryRoute && form.eliminations.customUrinaryRoute.toLowerCase().includes('svd'));
  const hasSpontaneous =
    form.eliminations.urinaryRoute === 'Espontânea' ||
    form.eliminations.diuresis === 'Espontânea' ||
    (form.eliminations.customUrinaryRoute && form.eliminations.customUrinaryRoute.toLowerCase().includes('espontân')) ||
    (form.eliminations.urineAspect && form.eliminations.urineAspect.toLowerCase().includes('espontân'));

  if (hasSVD && hasSpontaneous) {
    alerts.push({
      field: 'eliminations.urinaryRoute',
      severity: 'warning',
      message: 'Sonda vesical de demora (SVD) e micção espontânea registradas simultaneamente.',
    });
  }

  // NUR-CM-CONS-005: Banho não realizado + tolerância
  if (
    (form.hygiene.bath === 'Não realizado' || !form.hygiene.bath) &&
    form.hygiene.bathTolerance &&
    form.hygiene.bathTolerance.trim() !== ''
  ) {
    alerts.push({
      field: 'hygiene.bathTolerance',
      severity: 'warning',
      message: 'Tolerância ao banho registrada mesmo com banho informado como não realizado.',
    });
  }

  // NUR-CM-CONS-006: Intercorrência Sim sem conduta
  if (form.complications.hasComplication === 'Sim') {
    const hasAction = Boolean(
      (form.complications.actionsTaken && form.complications.actionsTaken.trim() !== '') ||
      (form.complications.description && form.complications.description.trim() !== '')
    );
    if (!hasAction) {
      alerts.push({
        field: 'complications.actionsTaken',
        severity: 'warning',
        message: 'Intercorrência registrada como presente ("Sim"), mas nenhuma descrição ou conduta foi especificada.',
      });
    }
  }

  // NUR-CM-CONS-007: Resposta aos cuidados sem intervenção
  const hasResponse =
    form.responseToCare.evaluated === 'Sim' ||
    Boolean(form.responseToCare.observedResponse && form.responseToCare.observedResponse.trim() !== '') ||
    Boolean(form.responseToCare.structuredResponseText && form.responseToCare.structuredResponseText.trim() !== '');

  const hasIntervention =
    (form.careDone.careItems && form.careDone.careItems.length > 0) ||
    Boolean(form.careDone.customCareDetails && form.careDone.customCareDetails.trim() !== '') ||
    Boolean(form.responseToCare.interventionDone && form.responseToCare.interventionDone.trim() !== '');

  if (hasResponse && !hasIntervention) {
    alerts.push({
      field: 'responseToCare.evaluated',
      severity: 'warning',
      message: 'Resposta aos cuidados informada sem que nenhum cuidado ou intervenção tenha sido registrado.',
    });
  }

  // NUR-CM-CONS-008: Sem inconsistências indevidas -> when clean, returns []

  return alerts;
}

/**
 * Builds AuthorizedClinicalFacts strictly from normalized NurseMedicalEvolutionForm.
 */
export function buildAuthorizedNurseMedicalEvolutionFacts(norm: NurseMedicalEvolutionForm): AuthorizedClinicalFacts {
  const facts: AuthorizedClinicalFacts = {
    context: [],
    general: [],
    vitalSigns: [],
    pain: [],
    neurological: [],
    respiratory: [],
    cardiovascular: [],
    gastrointestinal: [],
    nutrition: [],
    eliminations: [],
    devices: [],
    skin: [],
    mobility: [],
    hygiene: [],
    risks: [],
    care: [],
    responseToCare: [],
    complications: [],
    communication: [],
    comparison: [],
    synthesis: [],
    currentStatus: [],
  };

  // 1. Context
  if (norm.context.moment) {
    const val = norm.context.moment === 'Outro' && norm.context.customMoment ? norm.context.customMoment : norm.context.moment;
    facts.context!.push({
      id: 'nurse-cm-context-moment',
      category: 'context',
      sourceField: 'context.moment',
      value: val,
      canonicalText: `Momento do registro: ${val}.`,
    });
  }
  if (norm.context.location) {
    const val = norm.context.location === 'Outro' && norm.context.customLocation ? norm.context.customLocation : norm.context.location;
    facts.context!.push({
      id: 'nurse-cm-context-location',
      category: 'context',
      sourceField: 'context.location',
      value: val,
      canonicalText: `Setor: ${val}.`,
    });
  }
  if (norm.context.escort) {
    const val = norm.context.escort === 'Outro' && norm.context.customEscort ? norm.context.customEscort : norm.context.escort;
    facts.context!.push({
      id: 'nurse-cm-context-escort',
      category: 'context',
      sourceField: 'context.escort',
      value: val,
      canonicalText: `Acompanhamento: ${val}.`,
    });
  }
  if (norm.context.wristbandIdentification) {
    facts.context!.push({
      id: 'nurse-cm-context-wristband',
      category: 'context',
      sourceField: 'context.wristbandIdentification',
      value: norm.context.wristbandIdentification,
      canonicalText: `Pulseira de identificação conferida: ${norm.context.wristbandIdentification}.`,
    });
  }
  if (norm.context.bedIdentification) {
    facts.context!.push({
      id: 'nurse-cm-context-bedid',
      category: 'context',
      sourceField: 'context.bedIdentification',
      value: norm.context.bedIdentification,
      canonicalText: `Identificação do leito conferida: ${norm.context.bedIdentification}.`,
    });
  }
  if (norm.context.precaution) {
    const val = norm.context.precaution === 'Outra' && norm.context.customPrecaution ? norm.context.customPrecaution : norm.context.precaution;
    facts.context!.push({
      id: 'nurse-cm-context-precaution',
      category: 'context',
      sourceField: 'context.precaution',
      value: val,
      canonicalText: `Precaução: ${val}.`,
    });
  }
  if (norm.context.hasAllergies) {
    const has = norm.context.hasAllergies;
    const desc = has === 'Sim' && norm.context.allergyDescription ? ` (${norm.context.allergyDescription})` : '';
    facts.context!.push({
      id: 'nurse-cm-context-allergies',
      category: 'context',
      sourceField: 'context.hasAllergies',
      value: `${has}${desc}`,
      canonicalText: `Alergias: ${has}${desc}.`,
    });
  }

  // 2. General Assessment
  if (norm.generalAssessment.generalState) {
    facts.general!.push({
      id: 'nurse-cm-general-state',
      category: 'general',
      sourceField: 'generalAssessment.generalState',
      value: norm.generalAssessment.generalState,
      canonicalText: `Estado geral: ${norm.generalAssessment.generalState}.`,
    });
  }
  if (norm.generalAssessment.consciousness) {
    const val = norm.generalAssessment.consciousness === 'Outro' && norm.generalAssessment.customConsciousness ? norm.generalAssessment.customConsciousness : norm.generalAssessment.consciousness;
    facts.general!.push({
      id: 'nurse-cm-general-consciousness',
      category: 'general',
      sourceField: 'generalAssessment.consciousness',
      value: val,
      canonicalText: `Nível de consciência: ${val}.`,
    });
  }
  if (norm.generalAssessment.behavior && norm.generalAssessment.behavior.length > 0) {
    facts.general!.push({
      id: 'nurse-cm-general-behavior',
      category: 'general',
      sourceField: 'generalAssessment.behavior',
      value: norm.generalAssessment.behavior,
      canonicalText: `Comportamento: ${norm.generalAssessment.behavior.join(', ')}.`,
    });
  }
  if (norm.generalAssessment.complaintStatus) {
    const desc = norm.generalAssessment.complaintDescription ? `: ${norm.generalAssessment.complaintDescription}` : '';
    const src = norm.generalAssessment.informationSource ? ` (fonte: ${norm.generalAssessment.informationSource})` : '';
    facts.general!.push({
      id: 'nurse-cm-general-complaints',
      category: 'general',
      sourceField: 'generalAssessment.complaintStatus',
      value: `${norm.generalAssessment.complaintStatus}${desc}${src}`,
      canonicalText: `Queixas relatadas: ${norm.generalAssessment.complaintStatus}${desc}${src}.`,
    });
  }

  // 3. Vital Signs (Numeric facts preserved without auto-calculation)
  if (norm.vitalSigns.systolicBP && norm.vitalSigns.diastolicBP) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-bp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.bp',
      value: `${norm.vitalSigns.systolicBP}x${norm.vitalSigns.diastolicBP}`,
      canonicalText: `Pressão arterial: ${norm.vitalSigns.systolicBP}x${norm.vitalSigns.diastolicBP} mmHg.`,
    });
  } else if (norm.vitalSigns.systolicBP) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-pas',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.systolicBP',
      value: norm.vitalSigns.systolicBP,
      canonicalText: `PA sistólica: ${norm.vitalSigns.systolicBP} mmHg.`,
    });
  }

  // Explicit MAP: ONLY if manually entered, never calculate!
  if (norm.vitalSigns.meanArterialPressure) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-pam',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.meanArterialPressure',
      value: norm.vitalSigns.meanArterialPressure,
      canonicalText: `PAM: ${norm.vitalSigns.meanArterialPressure} mmHg (manual).`,
    });
  }

  if (norm.vitalSigns.heartRate) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-hr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.heartRate',
      value: norm.vitalSigns.heartRate,
      canonicalText: `Frequência cardíaca: ${norm.vitalSigns.heartRate} bpm.`,
    });
  }
  if (norm.vitalSigns.respiratoryRate) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-rr',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.respiratoryRate',
      value: norm.vitalSigns.respiratoryRate,
      canonicalText: `Frequência respiratória: ${norm.vitalSigns.respiratoryRate} irpm.`,
    });
  }
  if (norm.vitalSigns.oxygenSaturation) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-spo2',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.oxygenSaturation',
      value: norm.vitalSigns.oxygenSaturation,
      canonicalText: `SpO2: ${norm.vitalSigns.oxygenSaturation}%.`,
    });
  }
  if (norm.vitalSigns.temperature) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-temp',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.temperature',
      value: norm.vitalSigns.temperature,
      canonicalText: `Temperatura axilar: ${norm.vitalSigns.temperature} °C.`,
    });
  }
  if (norm.vitalSigns.capillaryBloodGlucose) {
    facts.vitalSigns!.push({
      id: 'nurse-cm-vitals-glucose',
      category: 'vitalSigns',
      sourceField: 'vitalSigns.capillaryBloodGlucose',
      value: norm.vitalSigns.capillaryBloodGlucose,
      canonicalText: `Glicemia capilar: ${norm.vitalSigns.capillaryBloodGlucose} mg/dL.`,
    });
  }

  // 4. Pain
  if (norm.pain.painScaleType) {
    const parts: string[] = [norm.pain.painScaleType];
    if (norm.pain.painScore) parts.push(`escore ${norm.pain.painScore}`);
    if (norm.pain.painLocation) parts.push(`em ${norm.pain.painLocation}`);
    if (norm.pain.painCharacteristic) parts.push(`característica: ${norm.pain.painCharacteristic}`);
    if (norm.pain.painObservation) parts.push(`obs: ${norm.pain.painObservation}`);

    facts.pain!.push({
      id: 'nurse-cm-pain-evaluation',
      category: 'pain',
      sourceField: 'pain.painScaleType',
      value: norm.pain.painScore || norm.pain.painScaleType,
      canonicalText: `Avaliação de dor: ${parts.join(', ')}.`,
    });
  }

  // 5. Neurological
  if (norm.neurological.consciousnessLevel) {
    const val = norm.neurological.consciousnessLevel === 'Outro' && norm.neurological.customConsciousness ? norm.neurological.customConsciousness : norm.neurological.consciousnessLevel;
    facts.neurological!.push({
      id: 'nurse-cm-neuro-consciousness',
      category: 'neurological',
      sourceField: 'neurological.consciousnessLevel',
      value: val,
      canonicalText: `Nível de consciência: ${val}.`,
    });
  }
  if (norm.neurological.orientation) {
    facts.neurological!.push({
      id: 'nurse-cm-neuro-orientation',
      category: 'neurological',
      sourceField: 'neurological.orientation',
      value: norm.neurological.orientation,
      canonicalText: `Orientação: ${norm.neurological.orientation}.`,
    });
  }
  if (norm.neurological.glasgowScore) {
    facts.neurological!.push({
      id: 'nurse-cm-neuro-glasgow',
      category: 'neurological',
      sourceField: 'neurological.glasgowScore',
      value: norm.neurological.glasgowScore,
      canonicalText: `Escala de Coma de Glasgow: ${norm.neurological.glasgowScore} pontos.`,
    });
  }
  if (norm.neurological.pupils) {
    const val = norm.neurological.pupils === 'Outra' && norm.neurological.customPupils ? norm.neurological.customPupils : norm.neurological.pupils;
    facts.neurological!.push({
      id: 'nurse-cm-neuro-pupils',
      category: 'neurological',
      sourceField: 'neurological.pupils',
      value: val,
      canonicalText: `Pupilas: ${val}.`,
    });
  }
  if (norm.neurological.photoreaction) {
    const val = norm.neurological.photoreaction === 'Outra' && norm.neurological.customPhotoreaction ? norm.neurological.customPhotoreaction : norm.neurological.photoreaction;
    facts.neurological!.push({
      id: 'nurse-cm-neuro-photoreaction',
      category: 'neurological',
      sourceField: 'neurological.photoreaction',
      value: val,
      canonicalText: `Fotorreatividade: ${val}.`,
    });
  }
  if (norm.neurological.motorDeficit) {
    const desc = norm.neurological.motorDeficit === 'Presente' && norm.neurological.motorDeficitDescription ? ` (${norm.neurological.motorDeficitDescription})` : '';
    facts.neurological!.push({
      id: 'nurse-cm-neuro-motordeficit',
      category: 'neurological',
      sourceField: 'neurological.motorDeficit',
      value: `${norm.neurological.motorDeficit}${desc}`,
      canonicalText: `Déficit motor: ${norm.neurological.motorDeficit}${desc}.`,
    });
  }

  // 6. Respiratory
  if (norm.respiratory.respiratorySupport) {
    let details = norm.respiratory.respiratorySupport;
    if (norm.respiratory.respiratorySupport === 'Oxigenoterapia') {
      const dev = norm.respiratory.oxygenDevice || 'cateter';
      const flow = norm.respiratory.oxygenFlowRate ? ` a ${norm.respiratory.oxygenFlowRate} L/min` : '';
      const fio2 = norm.respiratory.oxygenFiO2 ? ` (FiO2: ${norm.respiratory.oxygenFiO2}%)` : '';
      details = `Oxigenoterapia via ${dev}${flow}${fio2}`;
    }
    facts.respiratory!.push({
      id: 'nurse-cm-resp-support',
      category: 'respiratory',
      sourceField: 'respiratory.respiratorySupport',
      value: details,
      canonicalText: `Suporte respiratório: ${details}.`,
    });
  }
  if (norm.respiratory.respiratoryPattern) {
    facts.respiratory!.push({
      id: 'nurse-cm-resp-pattern',
      category: 'respiratory',
      sourceField: 'respiratory.respiratoryPattern',
      value: norm.respiratory.respiratoryPattern,
      canonicalText: `Padrão ventilatório: ${norm.respiratory.respiratoryPattern}.`,
    });
  }
  if (norm.respiratory.respiratoryDistress) {
    facts.respiratory!.push({
      id: 'nurse-cm-resp-distress',
      category: 'respiratory',
      sourceField: 'respiratory.respiratoryDistress',
      value: norm.respiratory.respiratoryDistress,
      canonicalText: `Desconforto respiratório: ${norm.respiratory.respiratoryDistress}.`,
    });
  }

  // Pulmonary Auscultation: ONLY if performed
  if (norm.respiratory.pulmonaryAuscultationPerformed === 'Sim') {
    const auscParts: string[] = ['Ausculta pulmonar realizada'];
    if (norm.respiratory.vesicularMurmur) auscParts.push(`murmúrio vesicular ${norm.respiratory.vesicularMurmur.toLowerCase()}`);
    if (norm.respiratory.adventitiousSounds === 'Ausentes') {
      auscParts.push('ruídos adventícios ausentes');
    } else if (norm.respiratory.adventitiousSounds === 'Presentes') {
      const types = norm.respiratory.adventitiousSoundTypes?.join(', ') || 'ruídos adventícios presentes';
      const loc = norm.respiratory.adventitiousSoundLocation ? ` (${norm.respiratory.adventitiousSoundLocation})` : '';
      auscParts.push(`presença de ${types}${loc}`);
    }

    facts.respiratory!.push({
      id: 'nurse-cm-resp-auscultation',
      category: 'respiratory',
      sourceField: 'respiratory.pulmonaryAuscultationPerformed',
      value: auscParts.join(', '),
      canonicalText: `${auscParts.join(', ')}.`,
    });
  }

  // 7. Cardiovascular
  if (norm.cardiovascular.peripheralPerfusion) {
    facts.cardiovascular!.push({
      id: 'nurse-cm-cardio-perfusion',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.peripheralPerfusion',
      value: norm.cardiovascular.peripheralPerfusion,
      canonicalText: `Perfusão periférica: ${norm.cardiovascular.peripheralPerfusion}.`,
    });
  }
  if (norm.cardiovascular.extremities) {
    facts.cardiovascular!.push({
      id: 'nurse-cm-cardio-extremities',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.extremities',
      value: norm.cardiovascular.extremities,
      canonicalText: `Extremidades: ${norm.cardiovascular.extremities}.`,
    });
  }
  if (norm.cardiovascular.capillaryRefillTime) {
    facts.cardiovascular!.push({
      id: 'nurse-cm-cardio-tec',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.capillaryRefillTime',
      value: norm.cardiovascular.capillaryRefillTime,
      canonicalText: `Tempo de enchimento capilar: ${norm.cardiovascular.capillaryRefillTime}.`,
    });
  }
  if (norm.cardiovascular.edema) {
    const loc = norm.cardiovascular.edema === 'Presente' && norm.cardiovascular.edemaLocation ? ` em ${norm.cardiovascular.edemaLocation}` : '';
    const grd = norm.cardiovascular.edema === 'Presente' && norm.cardiovascular.edemaGrade ? ` (${norm.cardiovascular.edemaGrade})` : '';
    facts.cardiovascular!.push({
      id: 'nurse-cm-cardio-edema',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.edema',
      value: `${norm.cardiovascular.edema}${loc}${grd}`,
      canonicalText: `Edema: ${norm.cardiovascular.edema}${loc}${grd}.`,
    });
  }
  if (norm.cardiovascular.cardiacAuscultationPerformed === 'Sim') {
    const cardioParts: string[] = ['Ausculta cardíaca realizada'];
    if (norm.cardiovascular.heartSounds) cardioParts.push(`bulhas ${norm.cardiovascular.heartSounds.toLowerCase()}`);
    if (norm.cardiovascular.rhythm) cardioParts.push(`ritmo ${norm.cardiovascular.rhythm.toLowerCase()}`);
    facts.cardiovascular!.push({
      id: 'nurse-cm-cardio-auscultation',
      category: 'cardiovascular',
      sourceField: 'cardiovascular.cardiacAuscultationPerformed',
      value: cardioParts.join(', '),
      canonicalText: `${cardioParts.join(', ')}.`,
    });
  }

  // 8. Gastrointestinal
  if (norm.gastrointestinal.abdomenForm) {
    facts.gastrointestinal!.push({
      id: 'nurse-cm-gi-form',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.abdomenForm',
      value: norm.gastrointestinal.abdomenForm,
      canonicalText: `Abdome: ${norm.gastrointestinal.abdomenForm}.`,
    });
  }
  if (norm.gastrointestinal.abdomenConsistency) {
    facts.gastrointestinal!.push({
      id: 'nurse-cm-gi-consistency',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.abdomenConsistency',
      value: norm.gastrointestinal.abdomenConsistency,
      canonicalText: `Consistência abdominal: ${norm.gastrointestinal.abdomenConsistency}.`,
    });
  }
  if (norm.gastrointestinal.abdomenPalpation) {
    const painLoc = norm.gastrointestinal.abdomenPalpation === 'Dolorosa' && norm.gastrointestinal.abdomenPainLocation ? ` (${norm.gastrointestinal.abdomenPainLocation})` : '';
    facts.gastrointestinal!.push({
      id: 'nurse-cm-gi-palpation',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.abdomenPalpation',
      value: `${norm.gastrointestinal.abdomenPalpation}${painLoc}`,
      canonicalText: `Palpação abdominal: ${norm.gastrointestinal.abdomenPalpation}${painLoc}.`,
    });
  }
  if (norm.gastrointestinal.bowelSounds) {
    facts.gastrointestinal!.push({
      id: 'nurse-cm-gi-sounds',
      category: 'gastrointestinal',
      sourceField: 'gastrointestinal.bowelSounds',
      value: norm.gastrointestinal.bowelSounds,
      canonicalText: `Ruídos hidroaéreos: ${norm.gastrointestinal.bowelSounds}.`,
    });
  }

  // 9. Nutrition
  if (norm.nutrition.nutritionalRoute) {
    const parts: string[] = [`Via nutricional: ${norm.nutrition.nutritionalRoute}`];
    if (norm.nutrition.nutritionalRoute === 'Via oral' && norm.nutrition.oralAcceptance) {
      parts.push(`aceitação alimentar ${norm.nutrition.oralAcceptance.toLowerCase()}`);
    } else if (norm.nutrition.nutritionalRoute === 'Dieta enteral') {
      if (norm.nutrition.enteralDevice) parts.push(`dispositivo ${norm.nutrition.enteralDevice}`);
      if (norm.nutrition.enteralRate) parts.push(`taxa de ${norm.nutrition.enteralRate} mL/h`);
      if (norm.nutrition.enteralTolerance) parts.push(`tolerância: ${norm.nutrition.enteralTolerance}`);
    }
    if (norm.nutrition.nutritionObservation) {
      parts.push(`obs: ${norm.nutrition.nutritionObservation}`);
    }

    facts.nutrition!.push({
      id: 'nurse-cm-nutrition-route',
      category: 'nutrition',
      sourceField: 'nutrition.nutritionalRoute',
      value: parts.join(', '),
      canonicalText: `${parts.join(', ')}.`,
    });
  }

  // 10. Eliminations
  if (norm.eliminations.diuresis) {
    const route = norm.eliminations.urinaryRoute ? ` via ${norm.eliminations.urinaryRoute}` : '';
    const aspect = norm.eliminations.urineAspect ? ` (${norm.eliminations.urineAspect})` : '';
    facts.eliminations!.push({
      id: 'nurse-cm-elim-diuresis',
      category: 'eliminations',
      sourceField: 'eliminations.diuresis',
      value: `${norm.eliminations.diuresis}${route}${aspect}`,
      canonicalText: `Diurese: ${norm.eliminations.diuresis}${route}${aspect}.`,
    });
  }
  if (norm.eliminations.bowelElimination) {
    const aspect = norm.eliminations.bowelAspect ? ` (${norm.eliminations.bowelAspect})` : '';
    facts.eliminations!.push({
      id: 'nurse-cm-elim-bowel',
      category: 'eliminations',
      sourceField: 'eliminations.bowelElimination',
      value: `${norm.eliminations.bowelElimination}${aspect}`,
      canonicalText: `Evacuação: ${norm.eliminations.bowelElimination}${aspect}.`,
    });
  }

  // 11. Devices
  if (norm.devices.list && norm.devices.list.length > 0) {
    norm.devices.list.forEach((dev, idx) => {
      const loc = dev.anatomicalSite ? ` em ${dev.anatomicalSite}` : '';
      const side = dev.laterality && dev.laterality !== 'Não se aplica' ? ` (${dev.laterality})` : '';
      const cond = dev.siteCondition ? `, inserção ${dev.siteCondition}` : '';
      const dress = dev.dressingCondition ? `, curativo ${dev.dressingCondition}` : '';
      const perm = dev.permeability ? `, perviedade ${dev.permeability}` : '';

      facts.devices!.push({
        id: `nurse-cm-device-${idx + 1}-${dev.type.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        category: 'devices',
        sourceField: `devices.list[${idx}]`,
        value: dev,
        canonicalText: `Dispositivo invasivo: ${dev.type}${loc}${side}${cond}${dress}${perm}.`,
      });
    });
  }

  // 12. Skin
  if (norm.skin.integrity) {
    const parts: string[] = [`Integridade cutânea: ${norm.skin.integrity}`];
    if (norm.skin.hydration) parts.push(`pele ${norm.skin.hydration.toLowerCase()}`);
    if (norm.skin.integrity === 'Com alteração/lesão') {
      if (norm.skin.lesionLocation) parts.push(`lesão em ${norm.skin.lesionLocation}`);
      if (norm.skin.lesionCharacteristics) parts.push(`características: ${norm.skin.lesionCharacteristics}`);
      if (norm.skin.lesionDressing) parts.push(`curativo: ${norm.skin.lesionDressing}`);
    }
    facts.skin!.push({
      id: 'nurse-cm-skin-assessment',
      category: 'skin',
      sourceField: 'skin.integrity',
      value: parts.join(', '),
      canonicalText: `${parts.join(', ')}.`,
    });
  }

  // 13. Mobility
  if (norm.mobility.mobility) {
    facts.mobility!.push({
      id: 'nurse-cm-mobility-status',
      category: 'mobility',
      sourceField: 'mobility.mobility',
      value: norm.mobility.mobility,
      canonicalText: `Mobilidade: ${norm.mobility.mobility}.`,
    });
  }
  if (norm.mobility.repositioning) {
    const interval = norm.mobility.repositioningInterval ? ` (intervalo: ${norm.mobility.repositioningInterval})` : '';
    facts.mobility!.push({
      id: 'nurse-cm-mobility-repositioning',
      category: 'mobility',
      sourceField: 'mobility.repositioning',
      value: `${norm.mobility.repositioning}${interval}`,
      canonicalText: `Mudança de decúbito: ${norm.mobility.repositioning}${interval}.`,
    });
  }

  // 14. Hygiene and Self-Care
  if (norm.hygiene.hygieneStatus) {
    facts.hygiene!.push({
      id: 'nurse-cm-hygiene-status',
      category: 'hygiene',
      sourceField: 'hygiene.hygieneStatus',
      value: norm.hygiene.hygieneStatus,
      canonicalText: `Condição de higiene: ${norm.hygiene.hygieneStatus}.`,
    });
  }
  if (norm.hygiene.bath) {
    const tol = norm.hygiene.bath !== 'Não realizado' && norm.hygiene.bathTolerance ? `, tolerância: ${norm.hygiene.bathTolerance}` : '';
    facts.hygiene!.push({
      id: 'nurse-cm-hygiene-bath',
      category: 'hygiene',
      sourceField: 'hygiene.bath',
      value: `${norm.hygiene.bath}${tol}`,
      canonicalText: `Banho: ${norm.hygiene.bath}${tol}.`,
    });
  }

  // 15. Risk Assessment (Manual and authorized, no auto calculation)
  if (norm.riskAssessment.fallRiskStatus === 'Avaliado') {
    const scale = norm.riskAssessment.fallRiskScale ? ` (escala: ${norm.riskAssessment.fallRiskScale})` : '';
    const score = norm.riskAssessment.fallRiskScore ? `, escore: ${norm.riskAssessment.fallRiskScore}` : '';
    const cls = norm.riskAssessment.fallRiskClassification ? `, classificação: ${norm.riskAssessment.fallRiskClassification}` : '';
    facts.risks!.push({
      id: 'nurse-cm-risk-fall',
      category: 'risks',
      sourceField: 'riskAssessment.fallRiskStatus',
      value: `Avaliado${scale}${score}${cls}`,
      canonicalText: `Risco de queda avaliado${scale}${score}${cls}.`,
    });
  }
  if (norm.riskAssessment.pressureInjuryRiskStatus === 'Avaliado') {
    const scale = norm.riskAssessment.pressureInjuryScale ? ` (escala: ${norm.riskAssessment.pressureInjuryScale})` : '';
    const score = norm.riskAssessment.pressureInjuryScore ? `, escore: ${norm.riskAssessment.pressureInjuryScore}` : '';
    const cls = norm.riskAssessment.pressureInjuryClassification ? `, classificação: ${norm.riskAssessment.pressureInjuryClassification}` : '';
    facts.risks!.push({
      id: 'nurse-cm-risk-pressure',
      category: 'risks',
      sourceField: 'riskAssessment.pressureInjuryRiskStatus',
      value: `Avaliado${scale}${score}${cls}`,
      canonicalText: `Risco de lesão por pressão avaliado${scale}${score}${cls}.`,
    });
  }
  if (norm.riskAssessment.otherRisks) {
    facts.risks!.push({
      id: 'nurse-cm-risk-other',
      category: 'risks',
      sourceField: 'riskAssessment.otherRisks',
      value: norm.riskAssessment.otherRisks,
      canonicalText: `Outros riscos assistenciais registrados: ${norm.riskAssessment.otherRisks}.`,
    });
  }

  // 16. Care Done (Clinical Actions - No preselection)
  if (norm.careDone.careItems && norm.careDone.careItems.length > 0) {
    norm.careDone.careItems.forEach((careItem, idx) => {
      facts.care!.push({
        id: `nurse-cm-care-${idx + 1}`,
        category: 'care',
        sourceField: `careDone.careItems[${idx}]`,
        value: careItem,
        canonicalText: `Cuidado realizado: ${careItem}.`,
      });
    });
  }
  if (norm.careDone.customCareDetails) {
    facts.care!.push({
      id: 'nurse-cm-care-custom',
      category: 'care',
      sourceField: 'careDone.customCareDetails',
      value: norm.careDone.customCareDetails,
      canonicalText: `Detalhes dos cuidados: ${norm.careDone.customCareDetails}.`,
    });
  }

  // 17. Response to Care (Only when evaluated and authorized)
  if (norm.responseToCare.evaluated === 'Sim') {
    const intv = norm.responseToCare.interventionDone ? `após ${norm.responseToCare.interventionDone}` : 'aos cuidados';
    const resp = norm.responseToCare.observedResponse || norm.responseToCare.structuredResponseText || 'resposta observada registrada';
    facts.responseToCare!.push({
      id: 'nurse-cm-response-evaluation',
      category: 'responseToCare',
      sourceField: 'responseToCare.evaluated',
      value: `${intv}: ${resp}`,
      canonicalText: `Resposta observada ${intv}: ${resp}.`,
    });
  }

  // 18. Complications (Intercorrências)
  if (norm.complications.hasComplication === 'Não') {
    facts.complications!.push({
      id: 'nurse-cm-complications-none',
      category: 'complications',
      sourceField: 'complications.hasComplication',
      value: 'Sem intercorrências no período',
      canonicalText: 'Sem intercorrências registradas no período.',
    });
  } else if (norm.complications.hasComplication === 'Sim') {
    const parts: string[] = ['Intercorrência registrada'];
    if (norm.complications.time) parts.push(`às ${norm.complications.time}`);
    if (norm.complications.description) parts.push(`descrição: ${norm.complications.description}`);
    if (norm.complications.actionsTaken) parts.push(`conduta imediata: ${norm.complications.actionsTaken}`);
    if (norm.complications.communicatedToTeam === 'Sim') {
      const who = norm.complications.communicatedWho ? ` à equipe (${norm.complications.communicatedWho})` : ' à equipe';
      parts.push(`comunicado${who}`);
    }
    if (norm.complications.patientResponse) parts.push(`evolução: ${norm.complications.patientResponse}`);

    facts.complications!.push({
      id: 'nurse-cm-complications-details',
      category: 'complications',
      sourceField: 'complications.hasComplication',
      value: parts.join(', '),
      canonicalText: `${parts.join(', ')}.`,
    });
  }

  // 19. Communication
  if (norm.communication.hasCommunication === 'Sim') {
    const parts: string[] = ['Comunicação realizada'];
    if (norm.communication.target) parts.push(`com ${norm.communication.target}`);
    if (norm.communication.time) parts.push(`às ${norm.communication.time}`);
    if (norm.communication.reason) parts.push(`motivo: ${norm.communication.reason}`);
    if (norm.communication.responseObserved) parts.push(`resposta/alinhamento: ${norm.communication.responseObserved}`);

    facts.communication!.push({
      id: 'nurse-cm-communication-details',
      category: 'communication',
      sourceField: 'communication.hasCommunication',
      value: parts.join(', '),
      canonicalText: `${parts.join(', ')}.`,
    });
  }

  // 20. Comparison with Previous Assessment
  if (norm.comparisonWithPrevious.statusChange) {
    const desc = norm.comparisonWithPrevious.changeDescription ? `: ${norm.comparisonWithPrevious.changeDescription}` : '';
    facts.comparison!.push({
      id: 'nurse-cm-comparison-status',
      category: 'comparison',
      sourceField: 'comparisonWithPrevious.statusChange',
      value: `${norm.comparisonWithPrevious.statusChange}${desc}`,
      canonicalText: `Comparação com avaliação anterior: ${norm.comparisonWithPrevious.statusChange}${desc}.`,
    });
  }

  // 21. Nursing Synthesis (Manual exclusive nurse field)
  if (norm.nursingSynthesis.synthesisText && norm.nursingSynthesis.synthesisText.trim() !== '') {
    facts.synthesis!.push({
      id: 'nurse-cm-synthesis-text',
      category: 'synthesis',
      sourceField: 'nursingSynthesis.synthesisText',
      value: norm.nursingSynthesis.synthesisText.trim(),
      canonicalText: `Síntese de enfermagem: ${norm.nursingSynthesis.synthesisText.trim()}`,
    });
  }

  // 22. Current Status
  if (norm.currentStatus.status) {
    const val = norm.currentStatus.status === 'Outro' && norm.currentStatus.customStatus ? norm.currentStatus.customStatus : norm.currentStatus.status;
    facts.currentStatus!.push({
      id: 'nurse-cm-current-status',
      category: 'currentStatus',
      sourceField: 'currentStatus.status',
      value: val,
      canonicalText: `Situação do paciente: ${val}.`,
    });
  }

  return facts;
}

/**
 * Narrative Auditor for Nurse Medical Clinic Evolution.
 */
export function auditNurseMedicalEvolutionNarrative(
  traces: NarrativeFactTrace[],
  facts: AuthorizedClinicalFacts
): AuditResult {
  return auditDeterministicNarrative(traces, facts, process.env.NODE_ENV !== 'production');
}
