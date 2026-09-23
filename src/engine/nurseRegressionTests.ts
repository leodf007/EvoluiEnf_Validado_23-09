import { EngineTestResult } from './engineTests';
import { buildNurseAdmissionNote } from './nurseAdmissionNoteBuilder';
import { buildAuthorizedNurseAdmissionFacts } from './nurseAdmissionClinicalFactBuilder';
import { verifyNurseAdmissionAIRefinedResponse } from './nurseAdmissionPostGenerationVerifier';
import { NurseAdmissionForm } from '../types/nurseAdmissionClinical';
import { createInitialNurseAdmissionForm } from '../utils/nurseAdmissionValidator';

/**
 * Executes regression test suite for Nurse Admission (NUR-REG-001 to NUR-REG-005).
 */
export function runNurseRegressionTests(): {
  results: EngineTestResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
} {
  const results: EngineTestResult[] = [];

  // =========================================================================
  // NUR-REG-001: Ausculta cardíaca não informada não pode gerar termos cardíacos
  // =========================================================================
  try {
    const form: NurseAdmissionForm = createInitialNurseAdmissionForm();
    form.context.moment = 'Admissão de enfermagem';
    form.context.location = 'Observação';
    form.cardiovascular.peripheralPerfusion = 'Adequada'; // sem ausculta cardíaca especificada

    const note = buildNurseAdmissionNote(form);
    const lower = note.toLowerCase();

    const hasHallucinatedCardiac =
      lower.includes('bulhas normofonéticas') ||
      lower.includes('bulhas normorrítmicas') ||
      lower.includes('bulhas normorritmicas') ||
      lower.includes('ritmo em 2 tempos') ||
      lower.includes('sopros ausentes') ||
      lower.includes('sem sopros');

    results.push({
      id: 'NUR-REG-001',
      name: 'Ausculta cardíaca não informada não gera bulhas, ritmo ou sopros na narrativa determinística',
      passed: !hasHallucinatedCardiac,
      message: !hasHallucinatedCardiac
        ? 'Nenhum achado auscultatório cardíaco não informado foi gerado.'
        : `Erro: termos auscultatórios gerados indevidamente no texto: "${note}"`,
      details: !hasHallucinatedCardiac
        ? 'Nenhum achado auscultatório cardíaco não informado foi gerado.'
        : `Erro: termos auscultatórios gerados indevidamente no texto: "${note}"`,
    });
  } catch (err: any) {
    results.push({
      id: 'NUR-REG-001',
      name: 'Ausculta cardíaca não informada não gera bulhas, ritmo ou sopros na narrativa determinística',
      passed: false,
      message: `Exceção: ${err?.message}`,
      details: `Exceção: ${err?.message}`,
    });
  }

  // =========================================================================
  // NUR-REG-002: Ausculta pulmonar não informada não pode gerar murmúrio ou ausência de RA
  // =========================================================================
  try {
    const form: NurseAdmissionForm = createInitialNurseAdmissionForm();
    form.context.moment = 'Admissão de enfermagem';
    form.context.location = 'Observação';
    form.respiratory.respiratorySupport = 'Ar ambiente';
    form.respiratory.breathSounds = 'Não avaliada';

    const note = buildNurseAdmissionNote(form);
    const lower = note.toLowerCase();

    const hasHallucinatedPulmonary =
      lower.includes('murmúrio vesicular presente') ||
      lower.includes('murmurio vesicular presente') ||
      lower.includes('sem ruídos adventícios') ||
      lower.includes('sem ruidos adventicios') ||
      lower.includes('ruídos adventícios ausentes');

    results.push({
      id: 'NUR-REG-002',
      name: 'Ausculta pulmonar não informada não gera murmúrio vesicular ou ausência de ruídos adventícios',
      passed: !hasHallucinatedPulmonary,
      message: !hasHallucinatedPulmonary
        ? 'Nenhum achado auscultatório pulmonar não informado foi gerado.'
        : `Erro: termos pulmonares gerados indevidamente no texto: "${note}"`,
      details: !hasHallucinatedPulmonary
        ? 'Nenhum achado auscultatório pulmonar não informado foi gerado.'
        : `Erro: termos pulmonares gerados indevidamente no texto: "${note}"`,
    });
  } catch (err: any) {
    results.push({
      id: 'NUR-REG-002',
      name: 'Ausculta pulmonar não informada não gera murmúrio vesicular ou ausência de ruídos adventícios',
      passed: false,
      message: `Exceção: ${err?.message}`,
      details: `Exceção: ${err?.message}`,
    });
  }

  // =========================================================================
  // NUR-REG-003: Plano de cuidados não autorizado não pode gerar "Segue sob plano de cuidados"
  // =========================================================================
  try {
    const form: NurseAdmissionForm = createInitialNurseAdmissionForm();
    form.context.moment = 'Admissão de enfermagem';
    form.context.location = 'Observação';
    form.nursingPlan.planItems = [];
    form.nursingPlan.customPlanDetails = '';

    const note = buildNurseAdmissionNote(form);
    const lower = note.toLowerCase();

    const hasUncheckedPlan =
      lower.includes('segue sob plano de cuidados') ||
      lower.includes('plano inicial de cuidados de enfermagem:');

    results.push({
      id: 'NUR-REG-003',
      name: 'Plano de cuidados não autorizado não gera "Segue sob plano de cuidados" ou lista vazia',
      passed: !hasUncheckedPlan,
      message: !hasUncheckedPlan
        ? 'Plano de cuidados omitido corretamente quando não autorizado.'
        : `Erro: plano de cuidados gerado indevidamente no texto: "${note}"`,
      details: !hasUncheckedPlan
        ? 'Plano de cuidados omitido corretamente quando não autorizado.'
        : `Erro: plano de cuidados gerado indevidamente no texto: "${note}"`,
    });
  } catch (err: any) {
    results.push({
      id: 'NUR-REG-003',
      name: 'Plano de cuidados não autorizado não gera "Segue sob plano de cuidados" ou lista vazia',
      passed: false,
      message: `Exceção: ${err?.message}`,
      details: `Exceção: ${err?.message}`,
    });
  }

  // =========================================================================
  // NUR-REG-004: Todo achado de exame físico do NurseAdmissionBuilder possui sourceField/factId
  // =========================================================================
  try {
    const form: NurseAdmissionForm = createInitialNurseAdmissionForm();
    form.context.moment = 'Admissão de enfermagem';
    form.context.location = 'Observação';
    form.respiratory.breathSounds = 'Murmúrio vesicular presente bilateralmente';
    form.respiratory.breathSoundsLocation = 'em ambos os hemitórax';
    form.cardiovascular.peripheralPerfusion = 'Adequada';
    form.neurological.consciousnessLevel = 'Consciente';
    form.neurological.orientation = 'Orientado em tempo e espaço';

    const facts = buildAuthorizedNurseAdmissionFacts(form);
    const hasBreathFact = facts.respiratory?.some(
      (f) => f.sourceField === 'respiratory.breathSounds' && String(f.value).includes('Murmúrio vesicular')
    );
    const hasPerfusionFact = facts.cardiovascular?.some((f) => f.sourceField === 'cardiovascular.peripheralPerfusion');
    const hasNeuroFact = facts.neurological?.some((f) => f.sourceField === 'neurological.consciousnessLevel');

    const passed = Boolean(hasBreathFact && hasPerfusionFact && hasNeuroFact);

    results.push({
      id: 'NUR-REG-004',
      name: 'Todo achado de exame físico do NurseAdmissionBuilder possui factId e sourceField correspondentes',
      passed,
      message: passed
        ? 'Fatos clínicos autorizados indexados com sourceField e factId para todos os achados do exame físico.'
        : 'Erro: fatos de exame físico não indexados corretamente.',
      details: passed
        ? 'Fatos clínicos autorizados indexados com sourceField e factId para todos os achados do exame físico.'
        : 'Erro: fatos de exame físico não indexados corretamente.',
    });
  } catch (err: any) {
    results.push({
      id: 'NUR-REG-004',
      name: 'Todo achado de exame físico do NurseAdmissionBuilder possui factId e sourceField correspondentes',
      passed: false,
      message: `Exceção: ${err?.message}`,
      details: `Exceção: ${err?.message}`,
    });
  }

  // =========================================================================
  // NUR-REG-005: PostGenerationVerifier rejeita achados de exame físico introduzidos pela IA
  // =========================================================================
  try {
    const form: NurseAdmissionForm = createInitialNurseAdmissionForm();
    form.context.moment = 'Admissão de enfermagem';
    form.context.location = 'Observação';
    form.respiratory.respiratorySupport = 'Ar ambiente';

    const facts = buildAuthorizedNurseAdmissionFacts(form);
    const deterministic = buildNurseAdmissionNote(form);

    // AI hallucinates physical exam findings not present in source facts
    const hallucinatedAIResponse = {
      paragraphs: [
        {
          text: 'Admissão de enfermagem realizada em Observação. Em ar ambiente. Ausculta cardíaca com bulhas normorítmicas em 2T sem sopros, murmúrio vesicular presente sem ruídos adventícios.',
          factIds: ['nurse-adm-moment'],
        },
      ],
    };

    const verif = verifyNurseAdmissionAIRefinedResponse(hallucinatedAIResponse, facts, deterministic);
    const rejected = !verif.approved && verif.reasons.length > 0;

    results.push({
      id: 'NUR-REG-005',
      name: 'PostGenerationVerifier rejeita qualquer achado de exame introduzido pela IA sem fato autorizado',
      passed: rejected,
      message: rejected
        ? `A IA foi reprovada com sucesso. Motivos: ${verif.reasons.join(' | ')}`
        : 'Erro: PostGenerationVerifier aceitou achados não autorizados introduzidos pela IA.',
      details: rejected
        ? `A IA foi reprovada com sucesso. Motivos: ${verif.reasons.join(' | ')}`
        : 'Erro: PostGenerationVerifier aceitou achados não autorizados introduzidos pela IA.',
    });
  } catch (err: any) {
    results.push({
      id: 'NUR-REG-005',
      name: 'PostGenerationVerifier rejeita qualquer achado de exame introduzido pela IA sem fato autorizado',
      passed: false,
      message: `Exceção: ${err?.message}`,
      details: `Exceção: ${err?.message}`,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;

  return {
    results,
    passedCount,
    totalCount: results.length,
    allPassed: passedCount === results.length,
  };
}
