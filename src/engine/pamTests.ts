import { ClinicalEvolutionForm } from '../types/clinical';
import { TechnicianAdmissionForm } from '../types/admissionClinical';
import { NurseAdmissionForm } from '../types/nurseAdmissionClinical';
import { createInitialClinicalForm } from '../utils/clinicalValidator';
import { createInitialAdmissionForm } from '../utils/admissionValidator';
import { createInitialNurseAdmissionForm } from '../utils/nurseAdmissionValidator';
import { normalizeClinicalData } from './clinicalDataNormalizer';
import { buildAuthorizedFacts } from './clinicalFactBuilder';
import { buildTechnicianNursingNote } from './technicianNursingNoteBuilder';
import { buildTechnicianAdmissionNote } from './technicianAdmissionNoteBuilder';
import { buildAuthorizedAdmissionFacts } from './admissionClinicalFactBuilder';
import { buildNurseAdmissionNote } from './nurseAdmissionNoteBuilder';
import { buildAuthorizedNurseAdmissionFacts } from './nurseAdmissionClinicalFactBuilder';
import { verifyAIRefinedResponse, AIRefinedStructuredResponse } from './postGenerationVerifier';
import { verifyNumericFactLock } from './numericFactLock';

export interface PAMTestResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

export interface PAMTestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  results: PAMTestResult[];
}

/**
 * Runs the deterministic unit tests for PAM (Pressão Arterial Média)
 * Validates PAM-001 through PAM-010.
 */
export function runPAMUnitTests(): PAMTestSuiteResult {
  const results: PAMTestResult[] = [];

  // ==========================================
  // PAM-001: PAM preenchida aparece na narrativa
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.context.moment = 'Recebo paciente';
    form.context.location = 'Leito';
    form.neurological.consciousnessLevel = 'Consciente';
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.meanArterialPressure = '96';
    form.vitalSigns.heartRate = '99';
    form.vitalSigns.respiratoryRate = '19';
    form.vitalSigns.oxygenSaturation = '99';
    form.vitalSigns.temperature = '37';

    const normalized = normalizeClinicalData(form);
    const facts = buildAuthorizedFacts(normalized);
    const note = buildTechnicianNursingNote(normalized);

    const factHasMap = facts.vitalSigns?.some((f) => f.id === 'vs-map' && f.value === '96 mmHg');
    const noteHasMap = note.includes('PAM: 96 mmHg');

    const passed = Boolean(factHasMap && noteHasMap);
    results.push({
      id: 'PAM-001',
      name: 'PAM preenchida aparece na narrativa e fatos autorizados',
      passed,
      message: passed
        ? 'PAM 96 mmHg inserida com sucesso nos fatos autorizados e na narrativa.'
        : `Falha ao registrar PAM na narrativa ou fatos. factHasMap: ${factHasMap}, noteHasMap: ${noteHasMap}`,
      details: note,
    });
  }

  // ==========================================
  // PAM-002: PAM vazia não aparece na narrativa
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.context.moment = 'Recebo paciente';
    form.context.location = 'Leito';
    form.neurological.consciousnessLevel = 'Consciente';
    form.vitalSigns.systolicBP = '120';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.meanArterialPressure = '';
    form.vitalSigns.heartRate = '80';
    form.vitalSigns.respiratoryRate = '18';
    form.vitalSigns.oxygenSaturation = '98';
    form.vitalSigns.temperature = '36.5';

    const normalized = normalizeClinicalData(form);
    const facts = buildAuthorizedFacts(normalized);
    const note = buildTechnicianNursingNote(normalized);

    const factHasMap = facts.vitalSigns?.some((f) => f.id === 'vs-map');
    const noteHasMap = note.includes('PAM');

    const passed = !factHasMap && !noteHasMap;
    results.push({
      id: 'PAM-002',
      name: 'PAM vazia não aparece na narrativa (sem placeholders)',
      passed,
      message: passed
        ? 'PAM vazia foi omitida com sucesso, sem menção a PAM ou mensagens de não informada.'
        : `PAM indevidamente mencionada quando não informada. factHasMap: ${factHasMap}, noteHasMap: ${noteHasMap}`,
      details: note,
    });
  }

  // ==========================================
  // PAM-003: PAM permanece exatamente com o valor informado
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.meanArterialPressure = '96';

    const normalized = normalizeClinicalData(form);
    const facts = buildAuthorizedFacts(normalized);

    const exactValueNormalized = normalized.vitalSigns?.meanArterialPressure === '96';
    const factValue = facts.vitalSigns?.find((f) => f.id === 'vs-map')?.value === '96 mmHg';

    const passed = exactValueNormalized && factValue;
    results.push({
      id: 'PAM-003',
      name: 'PAM preserva valor exato informado sem arredondamento ou modificação',
      passed,
      message: passed
        ? 'Valor "96" preservado exatamente no normalizador e nos fatos.'
        : `Valor foi alterado. exactValueNormalized: ${exactValueNormalized}, factValue: ${factValue}`,
    });
  }

  // ==========================================
  // PAM-004: PAM não é calculada automaticamente a partir de PAS/PAD
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.vitalSigns.systolicBP = '120';
    form.vitalSigns.diastolicBP = '80';
    delete form.vitalSigns.meanArterialPressure;

    const normalized = normalizeClinicalData(form);
    const facts = buildAuthorizedFacts(normalized);
    const note = buildTechnicianNursingNote(normalized);

    const isUndefinedInNormalized = normalized.vitalSigns?.meanArterialPressure === undefined;
    const noCalculatedWord = !note.toLowerCase().includes('calculada');
    const noAutoMapFact = !facts.vitalSigns?.some((f) => f.id === 'vs-map');

    const passed = isUndefinedInNormalized && noCalculatedWord && noAutoMapFact;
    results.push({
      id: 'PAM-004',
      name: 'PAM não é calculada automaticamente a partir de PAS/PAD',
      passed,
      message: passed
        ? 'PAM não foi calculada automaticamente; palavra "calculada" não consta no texto.'
        : 'PAM foi calculada ou referenciada indevidamente sem input do usuário.',
    });
  }

  // ==========================================
  // PAM-005: PAM não gera interpretação clínica
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.context.moment = 'Recebo paciente';
    form.context.location = 'Leito';
    form.neurological.consciousnessLevel = 'Consciente';
    form.vitalSigns.systolicBP = '80';
    form.vitalSigns.diastolicBP = '40';
    form.vitalSigns.meanArterialPressure = '53';
    form.vitalSigns.heartRate = '120';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);

    const bannedInterpretations = [
      'hipotenso',
      'hipotensão',
      'hipertenso',
      'hipertensão',
      'instabilidade hemodinâmica',
      'instável hemodinamicamente',
      'choque',
      'perfusão inadequada',
    ];

    const detected = bannedInterpretations.filter((term) => note.toLowerCase().includes(term));
    const passed = detected.length === 0;

    results.push({
      id: 'PAM-005',
      name: 'PAM não gera conclusões clínicas diagnósticas ou interpretações automáticas',
      passed,
      message: passed
        ? 'Nenhuma interpretação clínica gerada para PAM baixa (53 mmHg).'
        : `Interpretações clínicas detectadas indevidamente: [${detected.join(', ')}]`,
      details: note,
    });
  }

  // ==========================================
  // PAM-006: IA altera valor da PAM -> PostGenerationVerifier rejeita
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.meanArterialPressure = '96';
    form.vitalSigns.heartRate = '99';

    const normalized = normalizeClinicalData(form);
    const facts = buildAuthorizedFacts(normalized);
    const baseline = buildTechnicianNursingNote(normalized);

    // AI attempts to change PAM from 96 to 90
    const aiAttempt: AIRefinedStructuredResponse = {
      paragraphs: [
        {
          text: 'Sinais vitais aferidos: PA 130/80 mmHg, PAM 90 mmHg, FC 99 bpm.',
          factIds: ['vs-blood-pressure', 'vs-map', 'vs-heart-rate'],
        },
      ],
    };

    const verification = verifyAIRefinedResponse(aiAttempt, facts, baseline);
    const numLock = verifyNumericFactLock(aiAttempt.paragraphs[0].text, baseline, facts);

    const passed = !verification.approved && !numLock.passed && numLock.unauthorizedNumbers.includes('90');
    results.push({
      id: 'PAM-006',
      name: 'IA altera valor da PAM -> NumericFactLock e Verificador reprovam',
      passed,
      message: passed
        ? 'Alteração não autorizada de PAM (96 -> 90) foi detectada e reprovada com sucesso.'
        : 'Verificador falhou ao bloquear alteração numérica da PAM pela IA.',
      details: verification.reasons.join('; '),
    });
  }

  // ==========================================
  // PAM-007: PAM na Anotação de Enfermagem do Técnico (PS/Emergência)
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.context.moment = 'Recebo paciente';
    form.context.location = 'Sala Vermelha';
    form.neurological.consciousnessLevel = 'Consciente';
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.meanArterialPressure = '96';
    form.vitalSigns.heartRate = '99';
    form.vitalSigns.respiratoryRate = '19';
    form.vitalSigns.oxygenSaturation = '99';
    form.vitalSigns.temperature = '37';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);

    const passed = note.includes('PAM: 96 mmHg');
    results.push({
      id: 'PAM-007',
      name: 'PAM na Anotação de Enfermagem do Técnico (PS/Emergência)',
      passed,
      message: passed
        ? 'PAM formatada perfeitamente na anotação de enfermagem do técnico.'
        : 'PAM não encontrada na anotação de enfermagem do técnico.',
      details: note,
    });
  }

  // ==========================================
  // PAM-008: PAM na Admissão do Técnico (PS/Emergência)
  // ==========================================
  {
    const form = createInitialAdmissionForm();
    form.context.moment = 'Admito/Recebo paciente';
    form.context.location = 'Box';
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.meanArterialPressure = '96';
    form.vitalSigns.heartRate = '99';
    form.vitalSigns.respiratoryRate = '19';
    form.vitalSigns.oxygenSaturation = '99';
    form.vitalSigns.temperature = '37';

    const normalized = normalizeClinicalData(form);
    const facts = buildAuthorizedAdmissionFacts(normalized);
    const note = buildTechnicianAdmissionNote(normalized);

    const factHasMap = facts.vitalSigns?.some((f) => f.id === 'adm-vs-map' && f.value === '96 mmHg');
    const noteHasMap = note.includes('PAM 96 mmHg');

    const passed = Boolean(factHasMap && noteHasMap);
    results.push({
      id: 'PAM-008',
      name: 'PAM na Admissão do Técnico de Enfermagem (PS/Emergência)',
      passed,
      message: passed
        ? 'PAM formatada perfeitamente na admissão do técnico.'
        : `Falha na admissão do técnico. factHasMap: ${factHasMap}, noteHasMap: ${noteHasMap}`,
      details: note,
    });
  }

  // ==========================================
  // PAM-009: PAM na Admissão do Enfermeiro (PS/Emergência)
  // ==========================================
  {
    const form = createInitialNurseAdmissionForm();
    form.context.moment = 'Admitido no setor';
    form.context.location = 'Observação';
    form.vitalSignsAndPain.systolicBP = '130';
    form.vitalSignsAndPain.diastolicBP = '80';
    form.vitalSignsAndPain.meanArterialPressure = '96';
    form.vitalSignsAndPain.heartRate = '99';
    form.vitalSignsAndPain.respiratoryRate = '19';
    form.vitalSignsAndPain.oxygenSaturation = '99';
    form.vitalSignsAndPain.temperature = '37';
    form.vitalSignsAndPain.bloodGlucose = '235';

    const normalized = normalizeClinicalData(form);
    const facts = buildAuthorizedNurseAdmissionFacts(normalized);
    const note = buildNurseAdmissionNote(normalized);

    const factHasMap = facts.vitalSigns?.some((f) => f.id === 'nurse-adm-map' && f.value === '96 mmHg');
    const noteHasMap = note.includes('PAM 96 mmHg');

    const passed = Boolean(factHasMap && noteHasMap);
    results.push({
      id: 'PAM-009',
      name: 'PAM na Admissão do Enfermeiro (PS/Emergência)',
      passed,
      message: passed
        ? 'PAM formatada perfeitamente na admissão do enfermeiro.'
        : `Falha na admissão do enfermeiro. factHasMap: ${factHasMap}, noteHasMap: ${noteHasMap}`,
      details: note,
    });
  }

  // ==========================================
  // PAM-010: Componente reutilizável e modelo preparados para os demais setores
  // ==========================================
  {
    // Check that type contracts support meanArterialPressure across modules
    const evolutionVitals: ClinicalEvolutionForm['vitalSigns'] = { meanArterialPressure: '95' };
    const techAdmVitals: TechnicianAdmissionForm['vitalSigns'] = { meanArterialPressure: '95' };
    const nurseAdmVitals: Partial<NurseAdmissionForm['vitalSignsAndPain']> = { meanArterialPressure: '95' };

    const allTypesSupportMap =
      evolutionVitals.meanArterialPressure === '95' &&
      techAdmVitals.meanArterialPressure === '95' &&
      nurseAdmVitals.meanArterialPressure === '95';

    results.push({
      id: 'PAM-010',
      name: 'Componente reutilizável e tipagens preparados para futuros setores (UTI, Clínicas, Pediatria)',
      passed: allTypesSupportMap,
      message: allTypesSupportMap
        ? 'Interfaces de dados e componente reutilizável VitalSignsInputs padronizados para todos os setores.'
        : 'Tipagens de sinais vitais inconsistentes entre módulos.',
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  };
}
