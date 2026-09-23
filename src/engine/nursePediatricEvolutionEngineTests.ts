import { EngineTestOutcome, EngineTestSummary } from './types';
import {
  createInitialNursePediatricEvolutionForm,
  NursePediatricEvolutionForm,
} from '../types/nursePediatricEvolution';
import {
  buildAuthorizedNursePediatricEvolutionFacts,
  normalizeNursePediatricEvolutionForm,
  validateNursePediatricEvolutionConsistency,
  auditNursePediatricEvolutionNarrative,
} from './nursePediatricEvolutionFactBuilder';
import {
  buildNursePediatricEvolutionNote,
  buildNursePediatricEvolutionNoteWithTrace,
} from './nursePediatricEvolutionNoteBuilder';
import { verifyNursePediatricEvolutionAIRefinedResponse } from './nursePediatricEvolutionPostGenerationVerifier';
import { verifyPediatricFactLock } from './pediatricFactLock';
import {
  CLINICAL_MODULE_CONTRACTS,
  NURSE_EVOLUTION_PEDIATRICS_CONTRACT,
} from './factory/moduleDefinitions';
import { NURSE_EVOLUTION_PEDIATRICS } from './factory/nursePediatricModule';
import { checkPrivacyGuards } from './privacyGuard';

/**
 * Creates a rich, realistic sample form for Nurse Pediatric Evolution
 */
export function createSampleNursePediatricEvolutionForm(): NursePediatricEvolutionForm {
  const form = createInitialNursePediatricEvolutionForm();

  // 1. Contexto da evolução
  form.context.moment = 'Evolução do plantão';
  form.context.location = 'Enfermaria Pediátrica';

  // 2. Segurança e identificação
  form.safety.wristband = 'Presente e conferida';
  form.safety.bedIdentification = 'Presente e conferida';
  form.safety.precautions = 'Padrão';
  form.safety.allergies = 'Não referidas';

  // 3. Dados pediátricos
  form.pediatricData.age = '3 anos';
  form.pediatricData.weight = '14.2';
  form.pediatricData.weightUnit = 'kg';
  form.pediatricData.height = '96';
  form.pediatricData.heightUnit = 'cm';
  form.pediatricData.sex = 'Masculino';

  // 4. Responsável e acompanhante
  form.guardian.presence = 'Acompanhado';
  form.guardian.guardianType = 'Mãe';

  // 5. Fonte das informações
  form.infoSource.source = 'Responsável';

  // 6. Avaliação geral
  form.generalAssessment.generalState = 'Bom';
  form.generalAssessment.complaint = 'Sem queixas';

  // 7. Comportamento
  form.behavior.behavior = ['Tranquilo', 'Cooperativo'];
  form.behavior.activity = 'Ativa';

  // 8. Dor pediátrica
  form.pain.scale = 'Escala de faces';
  form.pain.score = '0';
  form.pain.location = '';
  form.pain.analgesiaAdministered = 'Não se aplica';

  // 9. Sinais vitais
  form.vitalSigns.systolicBP = '95';
  form.vitalSigns.diastolicBP = '60';
  form.vitalSigns.meanArterialPressure = '72';
  form.vitalSigns.heartRate = '104';
  form.vitalSigns.respiratoryRate = '22';
  form.vitalSigns.oxygenSaturation = '98';
  form.vitalSigns.temperature = '36.6';
  form.vitalSigns.capillaryBloodGlucose = '90';

  // 10. Neurológico
  form.neurological.consciousness = 'Consciente';
  form.neurological.orientation = 'Não se aplica';
  form.neurological.pupils = 'Isocóricas e fotorreagentes';
  form.neurological.observedResponse = 'Reativo aos estímulos visuais e auditivos';

  // 11. Respiratório
  form.respiratory.support = 'Ar ambiente';
  form.respiratory.pattern = 'Eupneico';
  form.respiratory.discomfort = 'Ausente';
  form.respiratory.auscultation = 'Murmúrio vesicular presente bilateralmente sem ruídos adventícios';

  // 12. Cardiovascular
  form.cardiovascular.auscultation = 'Bulhas normofonéticas e rítmicas';
  form.cardiovascular.perfusion = 'Boa / Preservada (TEC < 2s)';
  form.cardiovascular.extremities = 'Aquecidas';
  form.cardiovascular.pulses = 'Cheios e simétricos';
  form.cardiovascular.edema = 'Ausente';

  // 13. Gastrointestinal
  form.gastrointestinal.abdomen = 'Plano, flácido e indolor';
  form.gastrointestinal.bowelSounds = 'Presentes e normoativos';
  form.gastrointestinal.palpationPain = 'Ausente';
  form.gastrointestinal.vomitingRegurgitation = 'Ausente';

  // 14. Nutrição e alimentação
  form.nutrition.feedingType = 'Via oral';
  form.nutrition.acceptance = 'Boa aceitação';

  // 15. Eliminações
  form.eliminations.diuresis = 'Espontânea em fralda';
  form.eliminations.diuresisAspect = 'Amarelo claro';
  form.eliminations.diuresisVolume = '350 mL';
  form.eliminations.bowel = 'Presente';
  form.eliminations.bowelCharacteristics = 'Fezes pastosas e amareladas';

  // 16. Pele e integridade
  form.skin.integrity = 'Íntegra';
  form.skin.dressings = 'Ausentes';

  // 17. Dispositivos
  form.devices.hasDevices = 'Sim';
  form.devices.list = [
    {
      id: 'dev-avp-1',
      type: 'AVP',
      anatomicalSite: 'Dorso da mão',
      laterality: 'Direito',
      siteCondition: 'Sem sinais flogísticos',
      dressingCondition: 'Limpo e oclusivo',
      permeability: 'Pérvio com soroterapia',
    },
  ];

  // 18. Mobilidade
  form.mobility.mobility = 'Deambula com auxílio';

  // 19. Higiene
  form.hygiene.bath = 'Banho de aspersão';
  form.hygiene.bathTolerance = 'Boa tolerância';

  // 20. Sono
  form.sleep.pattern = 'Repousou tranquilamente';

  // 21. Riscos
  form.risks.fallRisk = 'Grade elevada mantida';
  form.risks.aspirationRisk = 'Ausente';
  form.risks.pressureUlcerRisk = 'Baixo';

  // 22. Cuidados
  form.care.performed = [
    'Higiene e conforto',
    'Administração de medicamentos prescritos',
    'Aferição de sinais vitais',
    'Orientação aos pais e familiares',
  ];

  // 23. Resposta aos cuidados
  form.responseToCare.evaluated = 'Sim';
  form.responseToCare.interventionTarget = 'Aferição e administração de medicações';
  form.responseToCare.observedResponse = 'Criança receptiva e calma durante procedimentos';

  // 24. Intercorrências
  form.complications.hasComplication = 'Não';

  // 25. Comunicação
  form.communication.familyOrientation = 'Sim, responsável orientado';
  form.communication.shiftHandover = 'Realizada passagem de plantão';

  // 26. Comparação
  form.comparison.status = 'Quadro estável';

  // 27. Síntese de enfermagem
  form.nursingSynthesis.synthesisText =
    'Criança mantendo estabilidade clínica e hemodinâmica, eupneica em ar ambiente, boa aceitação alimentar e hidratação. Segue sob vigilância de enfermagem e suporte contínuo da acompanhante.';

  // 28. Situação atual
  form.currentStatus.patientStatus = 'Permanece no leito em repouso';
  form.currentStatus.pendingIssues = 'Nenhuma pendência assistencial';

  return form;
}

/**
 * Runs the full test suite for Nurse Pediatric Evolution:
 * - 28 Unit tests (one for each section and its fact extraction)
 * - 8 Consistency tests (one for each consistency rule)
 * - 8 Safety / Fact Lock / Privacy / Verifier tests
 */
export function runNursePediatricEvolutionEngineTests(): EngineTestSummary {
  const results: EngineTestOutcome[] = [];

  const runTest = (id: string, name: string, fn: () => void) => {
    try {
      fn();
      results.push({
        id,
        name,
        passed: true,
        message: 'Teste aprovado com sucesso.',
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        passed: false,
        message: err?.message || 'Falha no teste.',
      });
    }
  };

  // ==========================================
  // 28 UNIT TESTS (One for each form section)
  // ==========================================

  // SEC-001: Contexto da evolução
  runTest('SEC-001', 'Gera fatos autorizados para Contexto da evolução', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    if (!facts.context || facts.context.length === 0) {
      throw new Error('Fatos de contexto ausentes');
    }
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Momento: Evolução do plantão') || !note.includes('Localização: Enfermaria Pediátrica')) {
      throw new Error('Nota determinística não reflete contexto');
    }
  });

  // SEC-002: Segurança e identificação
  runTest('SEC-002', 'Gera fatos de identificação e pulseira de segurança', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const safetyFacts = facts.safety || [];
    if (safetyFacts.length === 0) throw new Error('Fatos de segurança ausentes');
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Pulseira de identificação: Presente e conferida')) {
      throw new Error('Nota determinística não reflete segurança do paciente');
    }
  });

  // SEC-003: Dados pediátricos (Idade, Peso, Estatura sem IMC)
  runTest('SEC-003', 'Registra dados pediátricos textuais sem calcular IMC ou percentil', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Idade informada: 3 anos') || !note.includes('14.2 kg') || !note.includes('96 cm')) {
      throw new Error('Dados pediátricos não impressos corretamente');
    }
    if (note.toLowerCase().includes('imc') || note.toLowerCase().includes('percentil')) {
      throw new Error('Nota calculou ou inferiu IMC ou percentil');
    }
  });

  // SEC-004: Responsável e acompanhante
  runTest('SEC-004', 'Gera fatos sobre presença de acompanhante sem identificação nominal', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Paciente acompanhado por: Mãe')) {
      throw new Error('Acompanhamento não registrado na evolução');
    }
  });

  // SEC-005: Fonte das informações
  runTest('SEC-005', 'Gera fatos da fonte das informações prestadas', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Fonte das informações obtidas: Responsável')) {
      throw new Error('Fonte de informações não registrada na nota');
    }
  });

  // SEC-006: Avaliação geral
  runTest('SEC-006', 'Gera fatos de estado geral e ausência/presença de queixas', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Estado geral: Bom') || !note.includes('Queixa: Sem queixas')) {
      throw new Error('Avaliação geral ausente na nota');
    }
  });

  // SEC-007: Comportamento e nível de atividade
  runTest('SEC-007', 'Gera fatos de comportamento sem julgamento de maturação', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Comportamento observado: Tranquilo, Cooperativo') || !note.includes('Nível de atividade: Ativa')) {
      throw new Error('Comportamento e atividade não registrados');
    }
  });

  // SEC-008: Dor pediátrica
  runTest('SEC-008', 'Gera fatos fidedignos de escala de dor pediátrica', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.pain.scale = 'Escala de faces';
    form.pain.score = '2';
    form.pain.location = 'Abdomen';
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Avaliação de dor pela Escala de faces') || !note.includes('Escore informado: 2') || !note.includes('Localização da dor: Abdomen')) {
      throw new Error('Dor pediátrica não registrada com escore e localização');
    }
  });

  // SEC-009: Sinais vitais com PAM manual fidedigna
  runTest('SEC-009', 'Preserva sinais vitais e PAM manual sem cálculo automático', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('PAM manual aferida: 72 mmHg') || !note.includes('PA: 95x60 mmHg') || !note.includes('FC: 104 bpm')) {
      throw new Error('Sinais vitais e PAM fidedigna não registrados na nota');
    }
  });

  // SEC-010: Avaliação neurológica
  runTest('SEC-010', 'Gera fatos neurológicos (consciência, pupilas e reatividade)', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Nível de consciência: Consciente') || !note.includes('Pupilas: Isocóricas e fotorreagentes')) {
      throw new Error('Avaliação neurológica ausente');
    }
  });

  // SEC-011: Sistema respiratório
  runTest('SEC-011', 'Gera fatos de sistema respiratório e sinais de esforço/desconforto', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Suporte respiratório: Ar ambiente') || !note.includes('Ausculta pulmonar: Murmúrio vesicular presente')) {
      throw new Error('Sistema respiratório não incluído na nota');
    }
  });

  // SEC-012: Sistema cardiovascular
  runTest('SEC-012', 'Gera fatos de ausculta cardíaca, perfusão periférica e pulsos', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Ausculta cardíaca: Bulhas normofonéticas e rítmicas') || !note.includes('Perfusão periférica: Boa / Preservada')) {
      throw new Error('Cardiovascular e perfusão ausentes na nota');
    }
  });

  // SEC-013: Sistema gastrointestinal
  runTest('SEC-013', 'Gera fatos gastrointestinais e ausência de vômitos/regurgitação', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Abdome: Plano, flácido e indolor') || !note.includes('Ruídos hidroaéreos: Presentes e normoativos')) {
      throw new Error('Gastrointestinal ausente na nota');
    }
  });

  // SEC-014: Nutrição e alimentação pediátrica
  runTest('SEC-014', 'Gera fatos de alimentação pediátrica e aceitação alimentar', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Alimentação: Via oral') || !note.includes('Aceitação alimentar: Boa aceitação')) {
      throw new Error('Nutrição pediátrica não registrada na nota');
    }
  });

  // SEC-015: Eliminações
  runTest('SEC-015', 'Gera fatos de diurese e eliminações intestinais', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Diurese: Espontânea em fralda') || !note.includes('Fezes pastosas e amareladas')) {
      throw new Error('Eliminações não registradas na nota');
    }
  });

  // SEC-016: Pele e integridade cutânea
  runTest('SEC-016', 'Gera fatos de integridade cutânea e ausência de lesões', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Pele: Íntegra') || !note.includes('Curativos: Ausentes')) {
      throw new Error('Integridade cutânea não registrada na nota');
    }
  });

  // SEC-017: Dispositivos invasivos pediátricos
  runTest('SEC-017', 'Gera fatos detalhados para dispositivos invasivos cadastrados', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Dispositivo: AVP') || !note.includes('em Dorso da mão (Direito)') || !note.includes('Permeabilidade: Pérvio com soroterapia')) {
      throw new Error('Dispositivos invasivos não registrados fidedignamente');
    }
  });

  // SEC-018: Mobilidade
  runTest('SEC-018', 'Gera fatos de mobilidade (deambulação ou repouso)', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Mobilidade: Deambula com auxílio')) {
      throw new Error('Mobilidade ausente na nota');
    }
  });

  // SEC-019: Higiene e autocuidado
  runTest('SEC-019', 'Gera fatos de banho e tolerância da criança', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Banho: Banho de aspersão') || !note.includes('tolerância observada: Boa tolerância')) {
      throw new Error('Higiene e tolerância não registradas na nota');
    }
  });

  // SEC-020: Sono e repouso
  runTest('SEC-020', 'Gera fatos de sono e repouso pediátrico', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Sono e repouso: Repousou tranquilamente')) {
      throw new Error('Sono e repouso ausentes na nota');
    }
  });

  // SEC-021: Riscos assistenciais
  runTest('SEC-021', 'Gera fatos de riscos assistenciais e grades elevadas', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Risco de queda: Grade elevada mantida') || !note.includes('Risco de broncoaspiração: Ausente')) {
      throw new Error('Riscos assistenciais não registrados na nota');
    }
  });

  // SEC-022: Cuidados realizados
  runTest('SEC-022', 'Gera fatos de cuidados de enfermagem realizados no plantão', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Cuidados prestados no plantão:') || !note.includes('Higiene e conforto')) {
      throw new Error('Cuidados de enfermagem ausentes na nota');
    }
  });

  // SEC-023: Resposta aos cuidados
  runTest('SEC-023', 'Gera fatos de resposta explícita aos cuidados prestados', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Intervenção avaliada:') || !note.includes('Criança receptiva e calma')) {
      throw new Error('Resposta aos cuidados não registrada');
    }
  });

  // SEC-024: Intercorrências
  runTest('SEC-024', 'Gera fatos de ausência ou presença de intercorrências com conduta', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Sem intercorrências registradas no período')) {
      throw new Error('Intercorrências não registradas');
    }
  });

  // SEC-025: Comunicação com família e equipe
  runTest('SEC-025', 'Gera fatos de orientação aos responsáveis e alinhamento', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Orientação ao responsável: Sim, responsável orientado') || !note.includes('Passagem de plantão: Realizada passagem de plantão')) {
      throw new Error('Comunicação e passagem de plantão ausentes');
    }
  });

  // SEC-026: Comparação com avaliação anterior
  runTest('SEC-026', 'Gera fatos de comparação com plantão anterior', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Comparação com avaliação anterior: Quadro estável')) {
      throw new Error('Comparação com avaliação anterior ausente');
    }
  });

  // SEC-027: Síntese de enfermagem privativa
  runTest('SEC-027', 'Gera fatos de síntese clínica privativa do Enfermeiro', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Síntese de enfermagem:') || !note.includes('estabilidade clínica e hemodinâmica')) {
      throw new Error('Síntese clínica privativa ausente na nota');
    }
  });

  // SEC-028: Situação atual e pendências
  runTest('SEC-028', 'Gera fatos de situação atual do paciente e pendências assistenciais', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const note = buildNursePediatricEvolutionNote(facts);
    if (!note.includes('Situação atual: Permanece no leito em repouso') || !note.includes('Pendências: Nenhuma pendência')) {
      throw new Error('Situação atual e pendências ausentes na nota');
    }
  });

  // ==========================================
  // 8 CONSISTENCY TESTS (One for each rule)
  // ==========================================

  // NUR-PED-CONS-001: Paciente acompanhado sem tipo de responsável
  runTest('NUR-PED-CONS-001', 'Valida consistência: Paciente acompanhado sem tipo de responsável', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.guardian.presence = 'Acompanhado';
    form.guardian.guardianType = '';
    form.guardian.customGuardianType = '';
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Paciente acompanhado mas tipo de responsável não selecionado'))) {
      throw new Error('Inconsistência CONS-001 não foi detectada');
    }
  });

  // NUR-PED-CONS-002: Peso informado sem unidade definida
  runTest('NUR-PED-CONS-002', 'Valida consistência: Peso informado sem unidade definida (kg)', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.pediatricData.weight = '14.2';
    form.pediatricData.weightUnit = '';
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Peso informado sem unidade definida'))) {
      throw new Error('Inconsistência CONS-002 não foi detectada');
    }
  });

  // NUR-PED-CONS-003: Escala FLACC sem pontuação
  runTest('NUR-PED-CONS-003', 'Valida consistência: Escala FLACC selecionada sem pontuação informada', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.pain.scale = 'FLACC';
    form.pain.score = '';
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Escala FLACC selecionada sem pontuação informada'))) {
      throw new Error('Inconsistência CONS-003 não foi detectada');
    }
  });

  // NUR-PED-CONS-004: Dieta enteral sem especificação do dispositivo enteral
  runTest('NUR-PED-CONS-004', 'Valida consistência: Dieta enteral sem dispositivo informado', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.nutrition.feedingType = 'Enteral';
    form.nutrition.enteralDevice = '';
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Dieta enteral informada sem especificação do dispositivo'))) {
      throw new Error('Inconsistência CONS-004 não foi detectada');
    }
  });

  // NUR-PED-CONS-005: Dispositivos invasivos Sim com lista vazia
  runTest('NUR-PED-CONS-005', 'Valida consistência: Dispositivos invasivos marcados como presentes mas nenhum listado', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.devices.hasDevices = 'Sim';
    form.devices.list = [];
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Dispositivos invasivos marcados como presentes, mas nenhum dispositivo listado'))) {
      throw new Error('Inconsistência CONS-005 não foi detectada');
    }
  });

  // NUR-PED-CONS-006: Tolerância preenchida para banho não realizado
  runTest('NUR-PED-CONS-006', 'Valida consistência: Tolerância preenchida para banho não realizado', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.hygiene.bath = 'Não realizado';
    form.hygiene.bathTolerance = 'Boa tolerância';
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Tolerância ao banho preenchida para banho não realizado'))) {
      throw new Error('Inconsistência CONS-006 não foi detectada');
    }
  });

  // NUR-PED-CONS-007: Intercorrência relatada sem conduta imediata
  runTest('NUR-PED-CONS-007', 'Valida consistência: Intercorrência relatada sem descrição da conduta imediata', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.complications.hasComplication = 'Sim';
    form.complications.immediateAction = '';
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Intercorrência relatada sem descrição da conduta imediata'))) {
      throw new Error('Inconsistência CONS-007 não foi detectada');
    }
  });

  // NUR-PED-CONS-008: Diurese por SVD sem dispositivo correspondente cadastrado
  runTest('NUR-PED-CONS-008', 'Valida consistência: Diurese por SVD sem dispositivo invasivo na lista', () => {
    const form = createSampleNursePediatricEvolutionForm();
    form.eliminations.diuresis = 'SVD';
    form.devices.list = []; // No SVD device
    const norm = normalizeNursePediatricEvolutionForm(form);
    const alerts = validateNursePediatricEvolutionConsistency(norm);
    if (!alerts.errors.some((e) => e.includes('Diurese descrita por sonda vesical (SVD) sem registro correspondente'))) {
      throw new Error('Inconsistência CONS-008 não foi detectada');
    }
  });

  // ==========================================
  // SAFETY, PEDIATRIC FACT LOCK & POST-GEN VERIFIER TESTS
  // ==========================================

  // LOCK-PED-001: Bloqueia cálculo ou interpretação de IMC
  runTest('LOCK-PED-001', 'PediatricFactLock bloqueia termo ou cálculo de IMC e eutrofia inventados', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const canonical = buildNursePediatricEvolutionNote(facts);

    const hallucinatedText = `${canonical}\n\nPaciente eutrófico com IMC calculado em 15.4 kg/m2.`;
    const lockResult = verifyPediatricFactLock(hallucinatedText, facts, canonical);
    if (lockResult.passed) {
      throw new Error('PediatricFactLock não bloqueou IMC inventado');
    }
  });

  // LOCK-PED-002: Bloqueia percentis e escore-z
  runTest('LOCK-PED-002', 'PediatricFactLock bloqueia percentis e escore-z inventados', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const canonical = buildNursePediatricEvolutionNote(facts);

    const hallucinatedText = `${canonical}\n\nEstatura no percentil 50 e escore z zero.`;
    const lockResult = verifyPediatricFactLock(hallucinatedText, facts, canonical);
    if (lockResult.passed) {
      throw new Error('PediatricFactLock não bloqueou percentil/escore-z');
    }
  });

  // LOCK-PED-003: Bloqueia inferências de maturação ou desenvolvimento
  runTest('LOCK-PED-003', 'PediatricFactLock bloqueia desenvolvimento neuropsicomotor adequado inventado', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const canonical = buildNursePediatricEvolutionNote(facts);

    const hallucinatedText = `${canonical}\n\nDesenvolvimento neuropsicomotor compatível para a idade cronológica.`;
    const lockResult = verifyPediatricFactLock(hallucinatedText, facts, canonical);
    if (lockResult.passed) {
      throw new Error('PediatricFactLock não bloqueou desenvolvimento neuropsicomotor inventado');
    }
  });

  // LOCK-PED-004: Bloqueia peso, idade ou estatura inventados quando não autorizados
  runTest('LOCK-PED-004', 'PediatricFactLock bloqueia alteração de dados antropométricos', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const canonical = buildNursePediatricEvolutionNote(facts);

    const hallucinatedText = canonical.replace('14.2 kg', '18.5 kg');
    const lockResult = verifyPediatricFactLock(hallucinatedText, facts, canonical);
    if (lockResult.passed) {
      throw new Error('PediatricFactLock não bloqueou peso alterado arbitrariamente');
    }
  });

  // LOCK-PED-005: Bloqueia identificação nominal de acompanhante (LGPD / Privacidade)
  runTest('LOCK-PED-005', 'Privacidade bloqueia identificação nominal em texto gerado', () => {
    const textWithPII = 'Paciente acompanhado da mãe Maria da Silva, CPF 123.456.789-00.';
    const piiCheck = checkPrivacyGuards(textWithPII);
    if (!piiCheck.hasPotentialPII) {
      throw new Error('PrivacyGuard não bloqueou CPF de acompanhante');
    }
  });

  // LOCK-PED-006: PostGenerationVerifier bloqueia alucinações médicas
  runTest('LOCK-PED-006', 'PostGenerationVerifier bloqueia prescrição médica e diagnósticos médicos inventados', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const canonical = buildNursePediatricEvolutionNote(facts);

    const mockResponse = {
      paragraphs: [
        {
          text: `${canonical} Diagnosticado com bronquiolite viral aguda e prescrito nebulização com adrenalina.`,
          factIds: ['ped-1'],
        },
      ],
    };

    const verifierResult = verifyNursePediatricEvolutionAIRefinedResponse(mockResponse as any, facts, canonical);
    if (verifierResult.approved) {
      throw new Error('PostGenerationVerifier aprovou diagnóstico médico e droga não autorizada');
    }
  });

  // LOCK-PED-007: Refinamento legítimo mantendo fidelidade aos fatos é aprovado
  runTest('LOCK-PED-007', 'PostGenerationVerifier aprova texto fiel aos fatos autorizados', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const canonical = buildNursePediatricEvolutionNote(facts);

    const mockApprovedResponse = {
      paragraphs: [
        {
          text: canonical,
          factIds: ['ctx-1', 'ped-1'],
        },
      ],
    };

    const verifierResult = verifyNursePediatricEvolutionAIRefinedResponse(mockApprovedResponse as any, facts, canonical);
    if (!verifierResult.approved) {
      throw new Error(`Texto determinístico reprovou no verifier: ${verifierResult.reasons.join(', ')}`);
    }
  });

  // AUDIT-001: Auditoria 1:1 de narrativa determinística
  runTest('AUDIT-001', 'Auditoria rastreia 100% dos fatos clínicos na evolução determinística', () => {
    const form = createSampleNursePediatricEvolutionForm();
    const facts = buildAuthorizedNursePediatricEvolutionFacts(form);
    const { narrative } = buildNursePediatricEvolutionNoteWithTrace(facts);
    const auditRes = auditNursePediatricEvolutionNarrative(narrative, facts);
    if (!auditRes.passed) {
      throw new Error(`Auditoria falhou: ${auditRes.untraceableSegments.join(', ')}`);
    }
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}
