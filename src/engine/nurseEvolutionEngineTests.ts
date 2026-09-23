import { EngineTestOutcome, EngineTestSummary, AuthorizedClinicalFacts } from './types';
import { createSampleNurseEvolutionForm, createInitialNurseEvolutionForm } from '../utils/nurseEvolutionValidator';
import { buildAuthorizedNurseEvolutionFacts } from './nurseEvolutionClinicalFactBuilder';
import { buildNurseEvolutionStructuredNarrative, buildNurseEvolutionNote } from './nurseEvolutionNoteBuilder';
import { verifyAIRefinedResponse } from './postGenerationVerifier';
import { verifyNurseJudgmentLock } from './nurseJudgmentLock';
import { verifyPhysicalExamFactLock } from './physicalExamFactLock';
import { verifyResponseToCareLock } from './responseToCareLock';

export function runNurseEvolutionEngineTests(): EngineTestSummary {
  const results: EngineTestOutcome[] = [];

  // TEST 1: Full structured narrative and fact builder for sample form
  try {
    const sample = createSampleNurseEvolutionForm();
    const facts = buildAuthorizedNurseEvolutionFacts(sample);
    const { narrative, paragraphs } = buildNurseEvolutionStructuredNarrative(sample, facts);

    const hasBP = narrative.includes('128/78 mmHg');
    const hasHR = narrative.includes('86 bpm');
    const hasTemp = narrative.includes('36.5 °C');
    const hasGlasgow = narrative.includes('Glasgow: 15');
    const hasAuscultation = narrative.includes('Ausculta pulmonar:') && narrative.includes('murmúrio vesicular');
    const hasCardiac = narrative.includes('Ausculta cardíaca:') && narrative.includes('bulhas normofonéticas');
    const hasAVP = narrative.includes('AVP em MSD');
    const hasCare = narrative.includes('monitorização de sinais vitais');
    const hasMorse = narrative.includes('Morse');
    const hasBraden = narrative.includes('Braden');
    const hasResponse = narrative.includes('refere dor 2/10');

    const passed =
      hasBP &&
      hasHR &&
      hasTemp &&
      hasGlasgow &&
      hasAuscultation &&
      hasCardiac &&
      hasAVP &&
      hasCare &&
      hasMorse &&
      hasBraden &&
      hasResponse &&
      paragraphs.length === 6;

    results.push({
      id: 'nurse-evo-01-full-narrative',
      name: 'Evolução de Enfermagem: Geração determinística de narrativa completa (6 parágrafos)',
      passed,
      message: passed
        ? 'Todos os 6 parágrafos com fatos dos 20 blocos foram gerados determinísticamente com sucesso.'
        : `Falha na geração estruturada. Parágrafos: ${paragraphs.length}`,
      generatedText: narrative,
    });
  } catch (err: any) {
    results.push({
      id: 'nurse-evo-01-full-narrative',
      name: 'Evolução de Enfermagem: Geração determinística de narrativa completa',
      passed: false,
      message: `Exceção: ${err.message}`,
    });
  }

  // TEST 2: Fact IDs validity and traceability
  try {
    const sample = createSampleNurseEvolutionForm();
    const facts = buildAuthorizedNurseEvolutionFacts(sample);
    const { paragraphs } = buildNurseEvolutionStructuredNarrative(sample, facts);

    let allFactsValid = true;
    let missingIdsCount = 0;

    paragraphs.forEach((p) => {
      if (!p.factIds || p.factIds.length === 0) {
        allFactsValid = false;
        missingIdsCount++;
      }
    });

    results.push({
      id: 'nurse-evo-02-fact-traceability',
      name: 'Evolução de Enfermagem: Rastreabilidade atômica de Fact IDs por parágrafo',
      passed: allFactsValid,
      message: allFactsValid
        ? 'Cada parágrafo possui conjunto válido e não vazio de Fact IDs rastreáveis.'
        : `Parágrafos com IDs ausentes: ${missingIdsCount}`,
    });
  } catch (err: any) {
    results.push({
      id: 'nurse-evo-02-fact-traceability',
      name: 'Evolução de Enfermagem: Rastreabilidade atômica de Fact IDs',
      passed: false,
      message: `Exceção: ${err.message}`,
    });
  }

  // TEST 3: NurseJudgmentLock blocks unauthorized clinical inferences
  try {
    const sample = createSampleNurseEvolutionForm();
    const facts = buildAuthorizedNurseEvolutionFacts(sample);

    const textWithInference = 'Paciente com diagnóstico de enfermagem de padrão respiratório ineficaz e prognóstico reservado.';
    const lockResult = verifyNurseJudgmentLock(textWithInference, facts);

    const passed = !lockResult.passed && lockResult.unauthorizedJudgmentTerms.length >= 2;
    results.push({
      id: 'nurse-evo-03-judgment-lock',
      name: 'NurseJudgmentLock: Bloqueio de diagnósticos NANDA não autorizados e prognósticos especulativos',
      passed,
      message: passed
        ? `Bloqueou corretamente termos de julgamento não autorizados: [${lockResult.unauthorizedJudgmentTerms.join(', ')}].`
        : 'Falha: Não bloqueou termos não autorizados.',
    });
  } catch (err: any) {
    results.push({
      id: 'nurse-evo-03-judgment-lock',
      name: 'NurseJudgmentLock: Bloqueio de inferências não autorizadas',
      passed: false,
      message: `Exceção: ${err.message}`,
    });
  }

  // TEST 4: PhysicalExamFactLock blocks hallucinated auscultation findings
  try {
    const sample = createSampleNurseEvolutionForm();
    // In sample, adventitious sounds are 'Ausentes'
    const facts = buildAuthorizedNurseEvolutionFacts(sample);

    const hallucinatedText = 'Ausculta pulmonar com roncos e sibilos difusos e sopros cardíacos sistólicos.';
    const examLock = verifyPhysicalExamFactLock(hallucinatedText, facts);

    const passed = !examLock.passed && examLock.unauthorizedExamFindings.includes('roncos') && examLock.unauthorizedExamFindings.includes('sibilos');
    results.push({
      id: 'nurse-evo-04-physical-exam-lock',
      name: 'PhysicalExamFactLock: Bloqueio de achados físicos e ausculta não declarados nos fatos',
      passed,
      message: passed
        ? `Bloqueou com sucesso achados de exame físico não autorizados: [${examLock.unauthorizedExamFindings.join(', ')}].`
        : 'Falha: achados inventados não foram detectados.',
    });
  } catch (err: any) {
    results.push({
      id: 'nurse-evo-04-physical-exam-lock',
      name: 'PhysicalExamFactLock: Bloqueio de achados não declarados',
      passed: false,
      message: `Exceção: ${err.message}`,
    });
  }

  // TEST 5: ResponseToCareLock blocks synthetic causal outcomes
  try {
    const sample = createSampleNurseEvolutionForm();
    const facts = buildAuthorizedNurseEvolutionFacts(sample);

    const causalText = 'Após intervenção observou-se com melhora acentuada e paciente respondendo positivamente ao cuidado.';
    const respLock = verifyResponseToCareLock(causalText, facts);

    const passed = !respLock.passed && respLock.unauthorizedResponseTerms.length > 0;
    results.push({
      id: 'nurse-evo-05-response-care-lock',
      name: 'ResponseToCareLock: Bloqueio de inferências causais de resposta sem fato registrado',
      passed,
      message: passed
        ? `Bloqueou corretamente termos de desfecho causal: [${respLock.unauthorizedResponseTerms.join(', ')}].`
        : 'Falha: Não bloqueou inferência de resposta.',
    });
  } catch (err: any) {
    results.push({
      id: 'nurse-evo-05-response-care-lock',
      name: 'ResponseToCareLock: Bloqueio de inferências causais',
      passed: false,
      message: `Exceção: ${err.message}`,
    });
  }

  // TEST 6: PostGenerationVerifier end-to-end rejection of hallucinated response
  try {
    const sample = createSampleNurseEvolutionForm();
    const facts = buildAuthorizedNurseEvolutionFacts(sample);
    const { narrative } = buildNurseEvolutionStructuredNarrative(sample, facts);

    const badAIResponse = {
      paragraphs: [
        {
          text: 'Paciente admitido com PA 190/110 mmHg e recebendo Fentanil 10 mL/h em CVC subclávia.',
          factIds: ['nurse-evo-bp'],
        },
      ],
    };

    const verif = verifyAIRefinedResponse(badAIResponse, facts, narrative);
    const passed = !verif.approved && verif.reasons.length > 0;

    results.push({
      id: 'nurse-evo-06-pgv-e2e-rejection',
      name: 'PostGenerationVerifier: Rejeição integral de alucinação numérica, medicamentosa e de dispositivo',
      passed,
      message: passed
        ? `Rejeição correta com motivos: [${verif.reasons.join(' | ')}].`
        : 'Falha: Resposta da IA com fatos não autorizados foi aprovada indevidamente.',
    });
  } catch (err: any) {
    results.push({
      id: 'nurse-evo-06-pgv-e2e-rejection',
      name: 'PostGenerationVerifier: Rejeição integral de alucinação',
      passed: false,
      message: `Exceção: ${err.message}`,
    });
  }

  // TEST 7: Clean initial form produces no false facts
  try {
    const initial = createInitialNurseEvolutionForm();
    const facts = buildAuthorizedNurseEvolutionFacts(initial);
    const factKeys = Object.keys(facts);

    const passed = factKeys.length === 0;
    results.push({
      id: 'nurse-evo-07-clean-form-purity',
      name: 'Formulário Inicial Limpo: Nenhuma asserção ou fato residual é gerado',
      passed,
      message: passed
        ? 'Formulário limpo não gerou nenhum fato clínico residual.'
        : `Gerou fatos indevidos: ${factKeys.join(', ')}`,
    });
  } catch (err: any) {
    results.push({
      id: 'nurse-evo-07-clean-form-purity',
      name: 'Formulário Inicial Limpo: Nenhuma asserção residual',
      passed: false,
      message: `Exceção: ${err.message}`,
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
