import { ClinicalEvolutionForm } from '../types/clinical';
import { createInitialClinicalForm } from '../utils/clinicalValidator';
import { normalizeClinicalData } from './clinicalDataNormalizer';
import { buildAuthorizedFacts } from './clinicalFactBuilder';
import { buildTechnicianNursingNote } from './technicianNursingNoteBuilder';
import { checkPrivacyGuards } from './privacyGuard';
import { validateClinicalConsistency } from './clinicalConsistencyValidator';
import { runAIEngineUnitTests } from './aiEngineTests';
import { runPAMUnitTests } from './pamTests';

export interface EngineTestResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  generatedText?: string;
  details?: string;
}

export interface EngineTestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  results: EngineTestResult[];
}

/**
 * Runs the deterministic unit tests for the EvoluiEnf engine
 * covering technician nursing notes, consistency validator, and grammar rules.
 */
export function runEngineUnitTests(): EngineTestSuiteResult {
  const results: EngineTestResult[] = [];

  // ==========================================
  // TECH-001: Ausência estrita de termos proibidos e conclusões subjetivas
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.context.moment = 'Recebo paciente';
    form.context.location = 'Leito';
    form.context.locationCustom = 'Leito 12';
    form.neurological.consciousnessLevel = 'Consciente';
    form.vitalSigns.systolicBP = '120';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.heartRate = '75';
    form.vitalSigns.oxygenSaturation = '98';
    form.respiratory.respiratorySupport = 'Ar ambiente';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);

    const bannedTerms = [
      'evolução de enfermagem',
      'diagnóstico de enfermagem',
      'prescrição de enfermagem',
      'bom estado',
      'regular estado',
      'mau estado',
      'hemodinamicamente estável',
      'hemodinamicamente instável',
      'hipoxêmico',
      'hipertenso',
      'normotenso',
      'hipotenso',
      'taquicárdico',
      'bradicárdico',
    ];

    const lower = note.toLowerCase();
    const foundBanned = bannedTerms.filter((term) => lower.includes(term));
    const passed = foundBanned.length === 0;

    results.push({
      id: 'TECH-001',
      name: 'TECH-001: Ausência estrita de termos proibidos e conclusões subjetivas',
      passed,
      message: passed
        ? 'Passou: Nenhum termo subjetivo, diagnóstico ou inferência de estabilidade presente.'
        : `Falhou: Termos proibidos encontrados: ${foundBanned.join(', ')}`,
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-002: Temperatura vazia -> "afebril" NÃO pode aparecer
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '85';
    form.vitalSigns.temperature = ''; // Empty temperature

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasAfebril = note.toLowerCase().includes('afebril') || note.toLowerCase().includes('febril');
    const passed = !hasAfebril;

    results.push({
      id: 'TECH-002',
      name: 'TECH-002: Temperatura não informada não gera "afebril" nem "febril"',
      passed,
      message: passed
        ? 'Passou: Nenhuma inferência sobre temperatura gerada para campo vazio.'
        : 'Falhou: O termo "afebril" ou "febril" foi gerado indevidamente.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-003: Temperatura 39°C -> gera valor objetivo sem diagnóstico de febre
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.vitalSigns.temperature = '39.0';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasTax = note.includes('39.0 °C') || note.includes('39 °C') || note.includes('Temperatura: 39.0 °C');
    const hasInterpretativeDiagnosis = note.toLowerCase().includes('hipertermia') || note.toLowerCase().includes('paciente febril');
    const passed = hasTax && !hasInterpretativeDiagnosis;

    results.push({
      id: 'TECH-003',
      name: 'TECH-003: Temperatura com valor objetivo mantida sem diagnóstico subjetivo',
      passed,
      message: passed
        ? 'Passou: Valor térmico 39.0 °C registrado estritamente como parâmetro aferido.'
        : 'Falhou: Não registrou o valor ou adicionou rótulos diagnósticos subjetivos.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-004: Fato não informado é completamente omitido
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.neurological.consciousnessLevel = 'Consciente';
    form.neurological.pupils = '';
    form.neurological.photoreaction = '';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasPupilas = note.toLowerCase().includes('pupilas') || note.toLowerCase().includes('fotorreagentes');
    const passed = !hasPupilas;

    results.push({
      id: 'TECH-004',
      name: 'TECH-004: Parâmetros neurológicos não avaliados são omitidos sem inferir normalidade',
      passed,
      message: passed
        ? 'Passou: Pupilas não informadas foram omitidas sem criação de achado normal falso.'
        : 'Falhou: Gerou menção a pupilas/fotorreatividade sem estarem preenchidas.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-005: Sinais flogísticos não informados em dispositivo -> NÃO gerar "sem sinais flogísticos"
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.devices.list = [
      {
        id: 'dev-1',
        type: 'AVP',
        location: 'MSD',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        dressingClean: false,
        dressingDry: false,
        dressingIntact: false,
        phlogisticSigns: '', // Empty
      },
    ];

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasFlogistico = note.toLowerCase().includes('sinais flogísticos') || note.toLowerCase().includes('sem sinais');
    const passed = !hasFlogistico;

    results.push({
      id: 'TECH-005',
      name: 'TECH-005: Sinais flogísticos não avaliados em dispositivo não viram "sem sinais flogísticos"',
      passed,
      message: passed
        ? 'Passou: Ausência de seleção preservada sem assumir integridade.'
        : 'Falhou: Inferiu "sem sinais flogísticos" para campo não preenchido.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-006: Banho não informado -> nenhuma menção a banho
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.bath.bathType = 'Não informado';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasBanho = note.toLowerCase().includes('banho') || note.toLowerCase().includes('leito');
    const passed = !hasBanho;

    results.push({
      id: 'TECH-006',
      name: 'TECH-006: Banho não informado não gera frase na anotação',
      passed,
      message: passed
        ? 'Passou: Omissão estrita de dado de higiene quando não selecionado.'
        : 'Falhou: Gerou menção indevida a banho.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-007: Banho no leito informado -> registro objetivo
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.bath.bathType = 'Banho no leito';
    form.bath.tolerance = 'Boa tolerância';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasBanho = note.toLowerCase().includes('realizado banho no leito') && note.toLowerCase().includes('boa tolerância');
    const passed = hasBanho;

    results.push({
      id: 'TECH-007',
      name: 'TECH-007: Banho no leito com tolerância registrado com precisão objetiva',
      passed,
      message: passed
        ? 'Passou: Frase descritiva de banho no leito gerada corretamente.'
        : 'Falhou: Frase de banho no leito incorreta ou ausente.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-008: Intercorrência não preenchida -> NÃO gerar "sem intercorrências"
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.complications.hasComplication = ''; // Not filled

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasIntercorr = note.toLowerCase().includes('intercorrência') || note.toLowerCase().includes('intercorrencia');
    const passed = !hasIntercorr;

    results.push({
      id: 'TECH-008',
      name: 'TECH-008: Intercorrência não selecionada não inventa "sem intercorrências"',
      passed,
      message: passed
        ? 'Passou: Nenhuma suposição de ausência de intercorrências quando campo não foi preenchido.'
        : 'Falhou: Gerou "sem intercorrências" para campo em branco.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-009: Cuidados não selecionados não aparecem na Anotação de Enfermagem
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.nursingCare.careItems = []; // No care items selected

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);

    const careTerms = [
      'cuidados realizados',
      'cabeceira elevada',
      'grades de proteção',
      'administração de medicamentos',
      'mudança de decúbito',
      'balanço hídrico',
      'aspiração de vias',
      'curativo realizado',
      'coleta de exames',
    ];

    const lower = note.toLowerCase();
    const foundCares = careTerms.filter((c) => lower.includes(c));
    const passed = foundCares.length === 0;

    results.push({
      id: 'TECH-009',
      name: 'TECH-009: Cuidados não selecionados (careItems = []) não aparecem na Anotação',
      passed,
      message: passed
        ? 'Passou: Nenhum cuidado assistencial foi inserido por padrão sem seleção do usuário.'
        : `Falhou: Cuidados não selecionados foram gerados: ${foundCares.join(', ')}`,
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-010: Dados observacionais permanecem corretamente registrados
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.neurological.consciousnessLevel = 'Consciente';
    form.generalAssessment.mobility = 'Deambula com auxílio';
    form.vitalSigns.heartRate = '80';
    form.respiratory.respiratorySupport = 'Ar ambiente';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);

    const hasConsciente = note.toLowerCase().includes('consciente');
    const hasDeambula = note.toLowerCase().includes('deambula com auxílio');
    const hasFC = note.includes('FC: 80 bpm') || note.includes('80 bpm');
    const hasArAmbiente = note.toLowerCase().includes('ar ambiente');

    const passed = hasConsciente && hasDeambula && hasFC && hasArAmbiente;

    results.push({
      id: 'TECH-010',
      name: 'TECH-010: Dados observacionais (consciência, mobilidade, FC, suporte ventilatório) preservados',
      passed,
      message: passed
        ? 'Passou: Todos os fatos clínicos fornecidos foram preservados com exatidão na anotação.'
        : 'Falhou: Um ou mais dados observacionais foram omitidos ou distorcidos.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-011: Intercorrência explicitamente "Não" -> gera registro objetivo de ausência
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.complications.hasComplication = 'Não';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasSemInterc = note.toLowerCase().includes('sem intercorrências registradas no período');
    const passed = hasSemInterc;

    results.push({
      id: 'TECH-011',
      name: 'TECH-011: Intercorrência = "Não" gera registro de ausência no período',
      passed,
      message: passed
        ? 'Passou: Ausência de intercorrências assistenciais registrada com sucesso.'
        : 'Falhou: Não registrou a ausência de intercorrências selecionada.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-012: Comparação: "Sem alteração observada"
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.comparison.observationComparison = 'Sem alteração observada';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasExpected = note.includes('Sem alterações observadas no período em relação ao registro anterior.');
    const passed = hasExpected;

    results.push({
      id: 'TECH-012',
      name: 'TECH-012: Comparação "Sem alteração observada" gera frase objetiva correta',
      passed,
      message: passed
        ? 'Passou: Texto de estabilidade observacional gerado sem termos de melhora/piora.'
        : 'Falhou: Frase incorreta para "Sem alteração observada".',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-013: Comunicação ao enfermeiro registrada com fidelidade
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.complications.hasComplication = 'Sim';
    form.complications.description = 'Queda da saturação de O2 para 88%';
    form.complications.actionsTaken = 'Instalado O2 sob cateter a 3 L/min';
    form.complications.communicatedToTeam = 'Sim';
    form.complications.communicatedWho = 'Enfermeiro responsável';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasComun = note.toLowerCase().includes('comunicado a(o) enfermeiro responsável') || note.toLowerCase().includes('enfermeiro');
    const passed = hasComun;

    results.push({
      id: 'TECH-013',
      name: 'TECH-013: Notificação da ocorrência ao enfermeiro é documentada textualmente',
      passed,
      message: passed
        ? 'Passou: Comunicação ao enfermeiro responsável registrada na anotação.'
        : 'Falhou: Não registrou comunicação ao enfermeiro.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-014: Orientações prestadas ao paciente são documentadas
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.nursingCare.careItems = ['Outro cuidado'];
    form.nursingCare.otherCareDescription = 'Orientado a manter grades elevadas e acionar campainha para levantar.';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasOrient = note.includes('Orientado a manter grades elevadas e acionar campainha para levantar.');
    const passed = hasOrient;

    results.push({
      id: 'TECH-014',
      name: 'TECH-014: Orientações de enfermagem prestadas ao paciente são registradas',
      passed,
      message: passed
        ? 'Passou: Orientações fornecidas registradas de maneira explícita e objetiva.'
        : 'Falhou: Não incluiu as orientações prestadas.',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-015: Privacy Guard preservado para o Técnico
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.additionalInformation = 'Paciente CPF 123.456.789-00, contato tel 11987654321 e email enfermagem@plantao.com';

    const piiResult = checkPrivacyGuards(form);
    const passed = piiResult.hasPotentialPII && piiResult.matches.length >= 3;

    results.push({
      id: 'TECH-015',
      name: 'TECH-015: Privacy Guard atua de forma rigorosa em textos livres da Anotação',
      passed,
      message: passed
        ? `Passou: Privacy Guard detectou com precisão ${piiResult.matches.length} identificadores potenciais.`
        : 'Falhou: Privacy Guard não detectou os identificadores testados.',
      details: JSON.stringify(piiResult.matches, null, 2),
    });
  }

  // ==========================================
  // CONS-001: Sedado + Informação referida diretamente pelo paciente
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.neurological.consciousnessLevel = 'Sedado';
    form.generalAssessment.complaints = 'Sem queixas no momento';

    const alerts = validateClinicalConsistency(form);
    const hasAlert = alerts.some((a) => a.ruleId === 'CONS-001');

    results.push({
      id: 'CONS-001',
      name: 'CONS-001: Alerta para Sedado + Queixa referida pelo paciente',
      passed: hasAlert,
      message: hasAlert
        ? 'Passou: Detectou combinação de paciente sedado com relato de queixa do próprio paciente.'
        : 'Falhou: Não gerou alerta CONS-001.',
    });
  }

  // ==========================================
  // CONS-002: Glasgow 7 + Deambulação
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.neurological.glasgowScore = 7;
    form.generalAssessment.mobility = 'Deambula com auxílio';

    const alerts = validateClinicalConsistency(form);
    const hasAlert = alerts.some((a) => a.ruleId === 'CONS-002');

    results.push({
      id: 'CONS-002',
      name: 'CONS-002: Alerta para Glasgow baixo (ex: 7) + Deambulação',
      passed: hasAlert,
      message: hasAlert
        ? 'Passou: Detectou combinação de Glasgow 7 com deambulação.'
        : 'Falhou: Não gerou alerta CONS-002.',
    });
  }

  // ==========================================
  // CONS-003: Sedado + RASS 0
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.neurological.consciousnessLevel = 'Sedado';
    form.neurological.rassScore = 0;

    const alerts = validateClinicalConsistency(form);
    const hasAlert = alerts.some((a) => a.ruleId === 'CONS-003');

    results.push({
      id: 'CONS-003',
      name: 'CONS-003: Alerta para Sedado + RASS 0',
      passed: hasAlert,
      message: hasAlert
        ? 'Passou: Detectou combinação de paciente sedado com RASS 0 (alerta e calmo).'
        : 'Falhou: Não gerou alerta CONS-003.',
    });
  }

  // ==========================================
  // CONS-004: FR 25 + Eupneico
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.vitalSigns.respiratoryRate = '25';
    form.respiratory.respiratoryPattern = 'Eupneico';

    const alerts = validateClinicalConsistency(form);
    const hasAlert = alerts.some((a) => a.ruleId === 'CONS-004');

    results.push({
      id: 'CONS-004',
      name: 'CONS-004: Alerta para FR 25 irpm + padrão Eupneico',
      passed: hasAlert,
      message: hasAlert
        ? 'Passou: Detectou combinação de FR 25 com padrão respiratório classificado como eupneico.'
        : 'Falhou: Não gerou alerta CONS-004.',
    });
  }

  // ==========================================
  // CONS-005: Perfusão adequada + TEC >= 3s
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.cardiovascular.peripheralPerfusion = 'Adequada';
    form.cardiovascular.capillaryRefillTime = 'Maior ou igual a 3 segundos';

    const alerts = validateClinicalConsistency(form);
    const hasAlert = alerts.some((a) => a.ruleId === 'CONS-005');

    results.push({
      id: 'CONS-005',
      name: 'CONS-005: Alerta para Perfusão adequada + TEC >= 3 segundos',
      passed: hasAlert,
      message: hasAlert
        ? 'Passou: Detectou combinação de perfusão adequada com tempo de enchimento capilar lento (>= 3s).'
        : 'Falhou: Não gerou alerta CONS-005.',
    });
  }

  // ==========================================
  // CONS-006: VMI + Deambulação
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.respiratory.respiratorySupport = 'Ventilação mecânica invasiva';
    form.generalAssessment.mobility = 'Deambula sem auxílio';

    const alerts = validateClinicalConsistency(form);
    const hasAlert = alerts.some((a) => a.ruleId === 'CONS-006');

    results.push({
      id: 'CONS-006',
      name: 'CONS-006: Alerta para Ventilação Mecânica Invasiva (VMI) + Deambulação',
      passed: hasAlert,
      message: hasAlert
        ? 'Passou: Detectou combinação de VMI com relato de deambulação sem auxílio.'
        : 'Falhou: Não gerou alerta CONS-006.',
    });
  }

  // ==========================================
  // CONS-007: Caso coerente sem alertas indevidos
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.neurological.consciousnessLevel = 'Consciente';
    form.neurological.orientation = 'Orientado em tempo e espaço';
    form.generalAssessment.mobility = 'Deambula sem auxílio';
    form.vitalSigns.respiratoryRate = '16';
    form.respiratory.respiratoryPattern = 'Eupneico';
    form.cardiovascular.peripheralPerfusion = 'Adequada';
    form.cardiovascular.capillaryRefillTime = 'Menor que 3 segundos';

    const alerts = validateClinicalConsistency(form);
    const passed = alerts.length === 0;

    results.push({
      id: 'CONS-007',
      name: 'CONS-007: Caso clínico coerente não gera alertas indevidos',
      passed,
      message: passed
        ? 'Passou: Nenhum alerta gerado para caso com dados consistentes.'
        : `Falhou: Gerou ${alerts.length} alertas indevidamente.`,
    });
  }

  // ==========================================
  // GRAM-001: Dispositivo único -> curativo no singular
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.devices.list = [
      {
        id: 'dev-1',
        type: 'AVP',
        location: 'MSD',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        dressingClean: true,
        dressingDry: true,
        dressingIntact: true,
        phlogisticSigns: 'Ausentes',
      },
    ];

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasSingular = note.includes('com curativo limpo, seco e íntegro');
    const passed = hasSingular;

    results.push({
      id: 'GRAM-001',
      name: 'GRAM-001: Dispositivo único gera "com curativo limpo, seco e íntegro" (singular)',
      passed,
      message: passed
        ? 'Passou: Concordância no singular para curativo de dispositivo único.'
        : 'Falhou: Não usou a concordância no singular correta.',
      generatedText: note,
    });
  }

  // ==========================================
  // GRAM-002: Dispositivos múltiplos -> curativos no plural
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.devices.list = [
      {
        id: 'dev-1',
        type: 'AVP',
        location: 'MSD',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        dressingClean: true,
        dressingDry: true,
        dressingIntact: true,
        phlogisticSigns: 'Ausentes',
      },
      {
        id: 'dev-2',
        type: 'AVP',
        location: 'MSE',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        dressingClean: true,
        dressingDry: true,
        dressingIntact: true,
        phlogisticSigns: 'Ausentes',
      },
    ];

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasPlural = note.includes('com curativos limpos, secos e íntegros');
    const passed = hasPlural;

    results.push({
      id: 'GRAM-002',
      name: 'GRAM-002: Múltiplos dispositivos geram "com curativos limpos, secos e íntegros" (plural)',
      passed,
      message: passed
        ? 'Passou: Concordância no plural para curativos de múltiplos dispositivos idênticos.'
        : 'Falhou: Não usou a concordância no plural correta.',
      generatedText: note,
    });
  }

  // ==========================================
  // GRAM-003: Dieta enteral -> sem duplicação "dieta dieta"
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.nutrition.status = 'Dieta enteral';
    form.nutrition.enteralDevice = 'SNE';
    form.nutrition.enteralRate = '60';
    form.nutrition.enteralTolerance = 'Boa';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasDoubleDieta = note.toLowerCase().includes('dieta dieta');
    const hasCorrect = note.includes('Em dieta enteral por SNE a 60 mL/h, com boa tolerância.');
    const passed = !hasDoubleDieta && hasCorrect;

    results.push({
      id: 'GRAM-003',
      name: 'GRAM-003: Dieta enteral gerada sem repetição "dieta dieta" e com tolerância fluida',
      passed,
      message: passed
        ? 'Passou: Texto de dieta enteral limpo e gramaticalmente perfeito.'
        : 'Falhou: Contém duplicação de palavras ou formato incorreto.',
      generatedText: note,
    });
  }

  // ==========================================
  // GRAM-004: Eliminações intestinais -> concordância "fezes formadas / pastosas"
  // ==========================================
  {
    const form = createInitialClinicalForm();
    form.bowelElimination.bowelMovement = 'Presente';
    form.bowelElimination.aspect = 'Pastosa';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const hasFezesPastosas = note.toLowerCase().includes('fezes pastosas');
    const passed = hasFezesPastosas;

    results.push({
      id: 'GRAM-004',
      name: 'GRAM-004: Eliminações intestinais com fezes pastosas com concordância correta',
      passed,
      message: passed
        ? 'Passou: Concordância exata "fezes pastosas" gerada com precisão.'
        : 'Falhou: Não gerou "fezes pastosas".',
      generatedText: note,
    });
  }

  // ==========================================
  // TECH-COMPLEX-01: Cenário Clínico Completo (Passo 11)
  // ==========================================
  {
    const form = createInitialClinicalForm();
    // Contexto
    form.context.moment = 'Recebo paciente';
    form.context.location = 'Leito';
    form.context.locationCustom = 'Leito 04';
    form.context.wristbandChecked = 'Sim';
    form.context.bedSignChecked = 'Sim';

    // Neurológico
    form.neurological.consciousnessLevel = 'Sedado';
    form.neurological.glasgowScore = 7;
    form.neurological.rassScore = 0; // Trigger for CONS-003

    // Vasoativas
    form.vasoactiveDrugs.inUse = 'Sim';
    form.vasoactiveDrugs.drugsList = [
      {
        id: 'drug-1',
        medication: 'Dobutamina',
        infusionRate: '10',
        unit: 'mL/h',
        observations: 'Suporte inotrópico',
      },
    ];

    // Respiratório
    form.respiratory.respiratorySupport = 'Ventilação mecânica invasiva';
    form.respiratory.vmiAirway = 'Traqueostomia';
    form.respiratory.vmiVentilatoryMode = 'PCV';
    form.respiratory.vmiPeep = '6';
    form.respiratory.vmiFiO2 = '50';
    form.respiratory.vmiTidalVolume = '389';

    // Sinais Vitais
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.heartRate = '88';
    form.vitalSigns.respiratoryRate = '25';
    form.vitalSigns.oxygenSaturation = '96';
    form.vitalSigns.temperature = '36.8';

    // Cardiovascular
    form.cardiovascular.peripheralPerfusion = 'Adequada';
    form.cardiovascular.capillaryRefillTime = 'Maior ou igual a 3 segundos'; // Trigger for CONS-005
    form.cardiovascular.edema = 'Ausente';

    // Dispositivos
    form.devices.list = [
      {
        id: 'dev-1',
        type: 'AVP',
        location: 'MSD',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        dressingClean: true,
        dressingDry: true,
        dressingIntact: true,
        phlogisticSigns: 'Ausentes',
      },
    ];

    // Nutrição
    form.nutrition.status = 'Dieta enteral';
    form.nutrition.enteralDevice = 'SNE';
    form.nutrition.enteralRate = '60';
    form.nutrition.enteralTolerance = 'Boa';

    // Eliminações
    form.urinary.eliminationRoute = 'SVD';
    form.urinary.svdCaliber = '16 Fr';
    form.urinary.svdAspect = 'Límpido';
    form.urinary.svdColor = 'Amarelo claro';
    form.urinary.svdOutputVolume = '450';

    form.bowelElimination.bowelMovement = 'Presente';
    form.bowelElimination.aspect = 'Pastosa';

    // Cuidados
    form.nursingCare.careItems = [
      'Mudança de decúbito de 2/2h',
      'Cabeceira elevada a 30°-45°',
      'Aspiração de vias aéreas',
    ];

    // Banho
    form.bath.bathType = 'Banho no leito';
    form.bath.tolerance = 'Boa tolerância';

    // Intercorrências
    form.complications.hasComplication = 'Não';

    // Comparação e Situação final
    form.comparison.observationComparison = 'Sem alteração observada';
    form.finalStatus.condition = 'Permanece no setor sob cuidados';

    const normalized = normalizeClinicalData(form);
    const note = buildTechnicianNursingNote(normalized);
    const alerts = validateClinicalConsistency(form);

    // Checks:
    const hasPulseiraLeito = note.toLowerCase().includes('pulseira') && note.toLowerCase().includes('leito');
    const hasSedado = note.toLowerCase().includes('sedado');
    const hasGlasgow = note.includes('Glasgow registrada: 7');
    const hasRass = note.includes('RASS registrada: 0');
    const hasDobutamina = note.includes('Dobutamina a 10 mL/h');
    const hasVMI = note.includes('Ventilação mecânica invasiva') || note.includes('ventilação mecânica invasiva');
    const hasPEEP = note.includes('PEEP: 6 cmH₂O');
    const hasFiO2 = note.includes('FiO₂: 50%');
    const hasVC = note.includes('VC: 389 mL');
    const hasPA = note.includes('PA: 130/80 mmHg');
    const hasFC = note.includes('FC: 88 bpm');
    const hasFR = note.includes('FR: 25 irpm');
    const hasSpO2 = note.includes('SpO₂: 96%');
    const hasTax = note.includes('Temperatura: 36.8 °C');
    const hasPerfusao = note.toLowerCase().includes('perfusão periférica adequada');
    const hasTEC = note.includes('TEC >= 3s') || note.includes('TEC maior');
    const hasSemEdema = note.toLowerCase().includes('sem edema');
    const hasAVP = note.includes('AVP em MSD') && note.includes('curativo limpo, seco e íntegro');
    const hasDietaEnteral = note.includes('Em dieta enteral por SNE a 60 mL/h, com boa tolerância.');
    const hasSVD = note.includes('Diurese por SVD') && note.includes('450 mL');
    const hasFezes = note.toLowerCase().includes('fezes pastosas');
    const hasCuidados = note.includes('Cuidados realizados:') && note.includes('mudança de decúbito');
    const hasBanho = note.includes('Realizado banho no leito, com boa tolerância.');
    const hasSemInterc = note.includes('Sem intercorrências registradas no período.');
    const hasComp = note.includes('Sem alterações observadas no período em relação ao registro anterior.');
    const hasFinal = note.includes('Permanece no setor sob cuidados de enfermagem.');

    const noteValid =
      hasPulseiraLeito &&
      hasSedado &&
      hasGlasgow &&
      hasRass &&
      hasDobutamina &&
      hasVMI &&
      hasPEEP &&
      hasFiO2 &&
      hasVC &&
      hasPA &&
      hasFC &&
      hasFR &&
      hasSpO2 &&
      hasTax &&
      hasPerfusao &&
      hasTEC &&
      hasSemEdema &&
      hasAVP &&
      hasDietaEnteral &&
      hasSVD &&
      hasFezes &&
      hasCuidados &&
      hasBanho &&
      hasSemInterc &&
      hasComp &&
      hasFinal;

    const alertCons003 = alerts.some((a) => a.ruleId === 'CONS-003');
    const alertCons005 = alerts.some((a) => a.ruleId === 'CONS-005');

    const passed = noteValid && alertCons003 && alertCons005;

    results.push({
      id: 'TECH-COMPLEX-01',
      name: 'TECH-COMPLEX-01: Cenário Clínico Completo (Passo 11) com fidelidade absoluta e alertas de consistência',
      passed,
      message: passed
        ? 'Passou: Todos os 26 fatos clínicos estruturados foram sintetizados deterministicamente na anotação, sem diagnósticos, sem jargões subjetivos, e os alertas não bloqueantes foram identificados com precisão.'
        : 'Falhou: O texto gerado ou os alertas não atenderam aos critérios do cenário.',
      generatedText: note,
      details: `Alertas de consistência gerados (${alerts.length}): ${alerts.map((a) => a.ruleId).join(', ')}`,
    });
  }

  // ==========================================
  // EvoluiEnf AI Refinement Tests (AI-001 a AI-015)
  // ==========================================
  const aiResults = runAIEngineUnitTests();
  results.push(...aiResults);

  // ==========================================
  // EvoluiEnf PAM Tests (PAM-001 a PAM-010)
  // ==========================================
  const pamSuite = runPAMUnitTests();
  results.push(...pamSuite.results);

  const passedCount = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  };
}
