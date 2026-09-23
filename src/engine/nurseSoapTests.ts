import {
  NurseSoapForm,
  createInitialNurseSoapForm,
} from '../types/nurseSoap';
import {
  normalizeNurseSoapForm,
  buildAuthorizedNurseSoapFacts,
  validateNurseSoapConsistency,
  auditNurseSoapNarrative,
} from './nurseSoapFactBuilder';
import { NurseSoapBuilder } from './nurseSoapBuilder';
import { verifySOAPClinicalReasoningLock } from './soapClinicalReasoningLock';
import { verifySOAPPlanLock } from './soapPlanLock';
import { verifyNurseSoapAIRefinedResponse } from './nurseSoapPostGenerationVerifier';
import { AIRefinedResponse } from './types';

export interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  message?: string;
}

export function runNurseSoapTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  const runTest = (id: string, name: string, fn: () => boolean) => {
    try {
      const ok = fn();
      results.push({ id, name, passed: ok });
    } catch (err: any) {
      results.push({ id, name, passed: false, message: err?.message || String(err) });
    }
  };

  // Helper valid form
  const getValidForm = (): NurseSoapForm => {
    const f = createInitialNurseSoapForm();
    f.context.date = '2026-03-29';
    f.context.time = '14:30';
    f.context.unit = 'Ambulatório de Especialidades';
    f.context.bedOrRoom = 'Consultório 03';
    f.identification.attendanceType = 'consulta de enfermagem';
    f.identification.reasonForVisit = 'Acompanhamento ambulatorial de hipertensão';
    f.subjective.chiefComplaint = 'Relata cefaleia frontal leve de início pela manhã.';
    f.subjective.informationSource = 'paciente';
    f.subjective.reportedSymptoms = 'Nega escotomas ou dor torácica.';
    f.subjective.patientPerception = 'Refere boa adesão medicamentosa.';
    f.objective.vitalSigns.bloodPressure = '130/85';
    f.objective.vitalSigns.heartRate = '76';
    f.objective.vitalSigns.respiratoryRate = '18';
    f.objective.vitalSigns.oxygenSaturation = '98';
    f.objective.vitalSigns.temperature = '36.4';
    f.objective.vitalSigns.bloodGlucose = '110';
    f.objective.physicalExam.neurological = 'Lúcido e orientado no tempo e espaço.';
    f.objective.physicalExam.respiratory = 'Murmúrio vesicular presente bilateralmente, sem ruídos adventícios.';
    f.objective.physicalExam.cardiovascular = 'Bulhas rítmicas normofonéticas em 2T, sem sopros.';
    f.objective.physicalExam.skin = 'Corado, hidratado, sem lesões ativas.';
    f.objective.devices = ['Acesso venoso periférico'];
    f.objective.deviceDetails = 'Jelco 20G em MSD sem sinais flogísticos.';
    f.objective.medicationsInUse = ['Losartana 50mg'];
    f.objective.medicationDetails = '1 comprimido pela manhã.';
    f.assessment.nurseClinicalSynthesis = 'Paciente lúcido, padrão respiratório estável, controle pressórico limítrofe.';
    f.nursingDiagnoses.diagnoses = ['Controle ineficaz da saúde'];
    f.nursingDiagnoses.clinicalReasoning = 'Adesão irregular à dieta hipossódica referida.';
    f.plan.carePlan = 'Manter rotina ambulatorial e cuidados habituais.';
    f.plan.plannedMonitoring = 'Aferição de PA a cada 4 horas.';
    f.plan.patientOrientations = 'Orientado sobre dieta hipossódica e ingestão hídrica adequada.';
    f.plan.scheduledEvaluations = 'Retorno agendado para reavaliação em 30 dias.';
    f.interventions.executedInterventions = ['Aferição de dados vitais'];
    f.interventions.interventionDetails = 'Realizada verificação de pressão arterial em repouso.';
    f.responseToCare.observedResponse = 'Compreendeu as orientações fornecidas e demonstrou boa receptividade.';
    return f;
  };

  // SOAP-001: normalizeNurseSoapForm sanitizes input strings
  runTest('SOAP-001', 'normalizeNurseSoapForm sanitizes input strings, trims spaces and handles missing fields', () => {
    const raw = createInitialNurseSoapForm();
    raw.context.unit = '   Ambulatório Central   ';
    raw.subjective.chiefComplaint = '  Cansaço fácil  ';
    const norm = normalizeNurseSoapForm(raw);
    return norm.context.unit === 'Ambulatório Central' && norm.subjective.chiefComplaint === 'Cansaço fácil';
  });

  // SOAP-002: normalizeNurseSoapForm cleans vital signs units
  runTest('SOAP-002', 'normalizeNurseSoapForm cleans vital signs units and converts commas to dots', () => {
    const raw = createInitialNurseSoapForm();
    raw.objective.vitalSigns.bloodPressure = '120/80 mmHg';
    raw.objective.vitalSigns.heartRate = '75 bpm';
    raw.objective.vitalSigns.respiratoryRate = '18 rpm';
    raw.objective.vitalSigns.oxygenSaturation = '98%';
    raw.objective.vitalSigns.temperature = '36,5°C';
    raw.objective.vitalSigns.bloodGlucose = '99 mg/dl';
    const norm = normalizeNurseSoapForm(raw);
    return (
      norm.objective.vitalSigns.bloodPressure === '120/80' &&
      norm.objective.vitalSigns.heartRate === '75' &&
      norm.objective.vitalSigns.respiratoryRate === '18' &&
      norm.objective.vitalSigns.oxygenSaturation === '98' &&
      norm.objective.vitalSigns.temperature === '36.5' &&
      norm.objective.vitalSigns.bloodGlucose === '99'
    );
  });

  // SOAP-003: buildAuthorizedNurseSoapFacts categorizes context and identification
  runTest('SOAP-003', 'buildAuthorizedNurseSoapFacts categorizes context and identification', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const ctx = facts.context || [];
    const id = facts.identification || [];
    return ctx.some((f) => f.id === 'fact-soap-unit') && id.some((f) => f.id === 'fact-soap-attendance-type');
  });

  // SOAP-004: buildAuthorizedNurseSoapFacts categorizes Subjective
  runTest('SOAP-004', 'buildAuthorizedNurseSoapFacts categorizes Subjective facts', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const subj = facts.subjective || [];
    return subj.some((f) => f.id === 'fact-soap-complaint') && subj.some((f) => f.id === 'fact-soap-source');
  });

  // SOAP-005: buildAuthorizedNurseSoapFacts categorizes Objective vital signs and physical exam
  runTest('SOAP-005', 'buildAuthorizedNurseSoapFacts categorizes Objective vital signs and physical exam', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const vs = facts.vitalSigns || [];
    const pe = facts.physicalExam || [];
    return vs.some((f) => f.id === 'fact-soap-bp') && pe.some((f) => f.id === 'fact-soap-pe-neuro');
  });

  // SOAP-006: buildAuthorizedNurseSoapFacts categorizes Objective devices and medications
  runTest('SOAP-006', 'buildAuthorizedNurseSoapFacts categorizes Objective devices and medications', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const dev = facts.devices || [];
    const med = facts.medications || [];
    return dev.some((f) => f.id === 'fact-soap-devices') && med.some((f) => f.id === 'fact-soap-meds');
  });

  // SOAP-007: buildAuthorizedNurseSoapFacts categorizes Assessment
  runTest('SOAP-007', 'buildAuthorizedNurseSoapFacts categorizes Assessment synthesis and diagnoses', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const ass = facts.assessment || [];
    const diag = facts.nursingDiagnoses || [];
    return ass.some((f) => f.id === 'fact-soap-synthesis') && diag.some((f) => f.id === 'fact-soap-diagnoses-list');
  });

  // SOAP-008: buildAuthorizedNurseSoapFacts categorizes Plan
  runTest('SOAP-008', 'buildAuthorizedNurseSoapFacts categorizes Plan fields', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const plan = facts.plan || [];
    return plan.some((f) => f.id === 'fact-soap-careplan') && plan.some((f) => f.id === 'fact-soap-monitoring');
  });

  // SOAP-009: buildAuthorizedNurseSoapFacts categorizes Interventions and Response
  runTest('SOAP-009', 'buildAuthorizedNurseSoapFacts categorizes Interventions and Response', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const int = facts.interventions || [];
    const resp = facts.responseToCare || [];
    return int.some((f) => f.id === 'fact-soap-interventions') && resp.some((f) => f.id === 'fact-soap-response');
  });

  // SOAP-010: NurseSoapBuilder produces deterministic SOAP narrative separated into S, O, A, P
  runTest('SOAP-010', 'NurseSoapBuilder produces deterministic narrative separated into S, O, A, P', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const note = NurseSoapBuilder.build(facts);
    return (
      note.includes('S - SUBJETIVO:') &&
      note.includes('O - OBJETIVO:') &&
      note.includes('A - AVALIAÇÃO:') &&
      note.includes('P - PLANO:')
    );
  });

  // SOAP-011: NurseSoapBuilder creates NarrativeFactTrace with valid factIds
  runTest('SOAP-011', 'NurseSoapBuilder creates NarrativeFactTrace with valid factIds', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const res = NurseSoapBuilder.buildWithTrace(facts);
    const bpTrace = res.traces.find((t) => t.category === 'vital_signs');
    return Boolean(bpTrace && bpTrace.factIds.includes('fact-soap-bp'));
  });

  // SOAP-012: SOAPClinicalReasoningLock blocks AI generated medical diagnoses
  runTest('SOAP-012', 'SOAPClinicalReasoningLock blocks AI generated medical diagnoses (e.g. insuficiência respiratória)', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const badText = 'Paciente apresenta insuficiência respiratória aguda e choque séptico.';
    const lockRes = verifySOAPClinicalReasoningLock(badText, facts);
    return !lockRes.passed && lockRes.unauthorizedReasoningTerms.length > 0;
  });

  // SOAP-013: SOAPClinicalReasoningLock permits authorized facts and deterministic baseline
  runTest('SOAP-013', 'SOAPClinicalReasoningLock permits authorized facts and deterministic baseline', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const lockRes = verifySOAPClinicalReasoningLock(baseline, facts, baseline);
    return lockRes.passed;
  });

  // SOAP-014: SOAPClinicalReasoningLock blocks causal deduction
  runTest('SOAP-014', 'SOAPClinicalReasoningLock blocks causal deduction (e.g. devido a descompensação)', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const textWithCausal = 'Quadro clínico decorrente de gravidade e infecção severa.';
    const lockRes = verifySOAPClinicalReasoningLock(textWithCausal, facts);
    return !lockRes.passed;
  });

  // SOAP-015: SOAPPlanLock blocks unauthorized prescriptions
  runTest('SOAP-015', 'SOAPPlanLock blocks unauthorized prescriptions (e.g. iniciar oxigenoterapia)', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const badPlanText = 'Plano de cuidados: Iniciar oxigenoterapia sob máscara e prescrever antibiótico.';
    const lockRes = verifySOAPPlanLock(badPlanText, facts);
    return !lockRes.passed && lockRes.unauthorizedPlanTerms.length > 0;
  });

  // SOAP-016: SOAPPlanLock permits authorized monitoring and care orientations
  runTest('SOAP-016', 'SOAPPlanLock permits authorized monitoring and care orientations', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const lockRes = verifySOAPPlanLock(baseline, facts, baseline);
    return lockRes.passed;
  });

  // SOAP-017: verifyNurseSoapAIRefinedResponse blocks PII via PrivacyGuard
  runTest('SOAP-017', 'verifyNurseSoapAIRefinedResponse blocks PII (CPF, nome completo) via PrivacyGuard', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [
        { text: 'Avaliado paciente João Carlos da Silva, portador do CPF 123.456.789-00 no consultório.', factIds: [] },
      ],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved && verif.reasons.some((r) => r.includes('PrivacyGuard'));
  });

  // SOAP-018: verifyNurseSoapAIRefinedResponse blocks numeric vital sign hallucinations
  runTest('SOAP-018', 'verifyNurseSoapAIRefinedResponse blocks numeric vital sign hallucinations via NumericFactLock', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [
        { text: 'Registro SOAP: Sinais vitais com PA: 190/110 mmHg e SpO2: 82%.', factIds: [] }, // Not in authorized facts
      ],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved;
  });

  // SOAP-019: verifyNurseSoapAIRefinedResponse blocks unauthorized medication additions
  runTest('SOAP-019', 'verifyNurseSoapAIRefinedResponse blocks unauthorized medication additions via MedicationLock', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [
        { text: 'Administrado fentanil e morfina em bólus endovenoso sem registro prévio.', factIds: [] },
      ],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved;
  });

  // SOAP-020: verifyNurseSoapAIRefinedResponse blocks unauthorized device additions
  runTest('SOAP-020', 'verifyNurseSoapAIRefinedResponse blocks unauthorized device additions via DeviceLock', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [
        { text: 'Instalado cateter venoso central duplo lúmen em veia subclávia direita.', factIds: [] },
      ],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved;
  });

  // SOAP-021: verifyNurseSoapAIRefinedResponse blocks unauthorized physical exam additions
  runTest('SOAP-021', 'verifyNurseSoapAIRefinedResponse blocks unauthorized physical exam additions via PhysicalExamFactLock', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [
        { text: 'Exame físico: Presença de estertores crepitantes em bases pulmonares e edema de membros inferiores 3+/4+.', factIds: [] },
      ],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved;
  });

  // SOAP-022: verifyNurseSoapAIRefinedResponse blocks unauthorized nursing conclusions
  runTest('SOAP-022', 'verifyNurseSoapAIRefinedResponse blocks unauthorized nursing conclusions via NurseJudgmentLock', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [
        { text: 'Avaliação: Paciente com prognóstico reservado e risco iminente de parada cardiorrespiratória.', factIds: [] },
      ],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved;
  });

  // SOAP-023: auditNurseSoapNarrative flags untraceable narrative sentences and passes for valid narrative
  runTest('SOAP-023', 'auditNurseSoapNarrative flags untraceable narrative sentences and passes for valid narrative', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const validAudit = auditNurseSoapNarrative(baseline, facts);
    const untraceableNarrative = baseline + ' Apresenta sangramento gengival espontâneo abundante.';
    const badAudit = auditNurseSoapNarrative(untraceableNarrative, facts);
    return validAudit.passed && !badAudit.passed && badAudit.untraceableSegments.length > 0;
  });

  // ==========================================================
  // Consistency tests: SOAP-CONS-001 to SOAP-CONS-008
  // ==========================================================

  // SOAP-CONS-001: Campo subjetivo vazio gera erro
  runTest('SOAP-CONS-001', 'Campo subjetivo vazio gera erro de consistência', () => {
    const norm = getValidForm();
    norm.subjective.chiefComplaint = '';
    norm.subjective.reportedSymptoms = '';
    norm.subjective.patientPerception = '';
    norm.subjective.familyInformation = '';
    const cons = validateNurseSoapConsistency(norm);
    return cons.errors.some((e) => e.includes('Campo subjetivo vazio'));
  });

  // SOAP-CONS-002: Sinais vitais com formato inválido (ex.: PA sem formato sistólica/diastólica)
  runTest('SOAP-CONS-002', 'Sinais vitais com formato inválido de PA gera erro de consistência', () => {
    const norm = getValidForm();
    norm.objective.vitalSigns.bloodPressure = '120'; // missing diastolic
    const cons = validateNurseSoapConsistency(norm);
    return cons.errors.some((e) => e.includes('Pressão arterial informada com formato inválido'));
  });

  // SOAP-CONS-003: Bloqueio de diagnóstico médico informado pela IA
  runTest('SOAP-CONS-003', 'Bloqueio de hipótese ou diagnóstico inferido pela IA', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [{ text: 'Avaliação: Hipótese diagnóstica de acidente vascular encefálico.', factIds: [] }],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved && verif.reasons.some((r) => r.toLowerCase().includes('soapclinicalreasoninglock'));
  });

  // SOAP-CONS-004: Bloqueio de plano criado pela IA
  runTest('SOAP-CONS-004', 'Bloqueio de plano ou prescrição criada pela IA', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const baseline = NurseSoapBuilder.build(facts);
    const refined: AIRefinedResponse = {
      paragraphs: [{ text: 'Plano: Iniciar antibioticoterapia profilática e prescrever analgésico.', factIds: [] }],
    };
    const verif = verifyNurseSoapAIRefinedResponse(refined, facts, baseline);
    return !verif.approved && verif.reasons.some((r) => r.toLowerCase().includes('soapplanlock'));
  });

  // SOAP-CONS-005: Dispositivo com detalhamento mas sem dispositivo selecionado
  runTest('SOAP-CONS-005', 'Dispositivo com detalhamento mas sem dispositivo selecionado gera erro', () => {
    const norm = getValidForm();
    norm.objective.devices = [];
    norm.objective.deviceDetails = 'Cateter em membro superior direito.';
    const cons = validateNurseSoapConsistency(norm);
    return cons.errors.some((e) => e.includes('Detalhes de dispositivos informados sem que nenhum dispositivo'));
  });

  // SOAP-CONS-006: Medicamento com detalhamento mas sem medicamento selecionado
  runTest('SOAP-CONS-006', 'Medicamento com detalhamento mas sem medicamento selecionado gera erro', () => {
    const norm = getValidForm();
    norm.objective.medicationsInUse = [];
    norm.objective.medicationDetails = 'Uso oral diário pela manhã.';
    const cons = validateNurseSoapConsistency(norm);
    return cons.errors.some((e) => e.includes('Detalhes farmacológicos informados sem que nenhum medicamento'));
  });

  // SOAP-CONS-007: Texto narrativo com segmento sem rastreabilidade
  runTest('SOAP-CONS-007', 'Texto narrativo com segmento sem rastreabilidade auditado com precisão', () => {
    const norm = getValidForm();
    const facts = buildAuthorizedNurseSoapFacts(norm);
    const fakeText = 'REGISTRO DE ENFERMAGEM - SOAP:\n\nPaciente necessita de drenagem torácica de urgência.';
    const audit = auditNurseSoapNarrative(fakeText, facts);
    return !audit.passed && audit.untraceableSegments.some((s) => s.includes('drenagem'));
  });

  // SOAP-CONS-008: Cenário válido completo sem erros de consistência
  runTest('SOAP-CONS-008', 'Cenário válido completo sem erros de consistência', () => {
    const norm = getValidForm();
    const cons = validateNurseSoapConsistency(norm);
    return cons.errors.length === 0;
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}
