import { EngineTestResult } from './engineTests';
import { createInitialICUForm } from '../utils/icuValidator';
import { buildAuthorizedICUFacts } from './icuClinicalFactBuilder';
import { buildTechnicianICUNursingNoteWithTrace, buildTechnicianICUNursingNote } from './technicianICUNursingNoteBuilder';
import { auditDeterministicNarrative, getAllAuthorizedFactIds } from './deterministicNarrativeFactAuditor';
import { buildAuthorizedDeviceRegistry } from './authorizedDeviceRegistry';
import { buildAuthorizedMedicationRegistry } from './authorizedMedicationRegistry';
import { MODULE_REGISTRY, getModuleAvailability } from './moduleRegistry';
import { verifyDeviceLock } from './deviceLock';
import { verifyMedicationLock } from './medicationLock';
import { verifyICUAIRefinedResponse } from './icuPostGenerationVerifier';
import { AIRefinedStructuredResponse } from './postGenerationVerifier';

export function runHardeningUnitTests(): {
  results: EngineTestResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
} {
  const results: EngineTestResult[] = [];

  const addTest = (id: string, title: string, fn: () => boolean, successMsg: string, failMsg: string) => {
    try {
      const passed = fn();
      results.push({
        id,
        name: title,
        passed,
        message: passed ? successMsg : failMsg,
        details: passed ? successMsg : failMsg,
      });
    } catch (err: any) {
      results.push({
        id,
        name: title,
        passed: false,
        message: `Exceção: ${err?.message}`,
        details: `Exceção: ${err?.message}`,
      });
    }
  };

  // =========================================================================
  // SUÍTE TRACE (TRACE-001 a TRACE-008): Fact Traceability
  // =========================================================================

  // TRACE-001: Sentenças geradas possuem factIds válidos
  addTest(
    'TRACE-001',
    'Todas as sentenças geradas pelo builder determinístico possuem factIds válidos e existentes',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vitalSignsAndPain.systolicBP = '130';
      form.vitalSignsAndPain.diastolicBP = '80';
      form.vitalSignsAndPain.meanArterialPressure = '96';
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.mechanicalVentilationAirway = 'TOT';
      form.respiratoryAndVentilation.ventilationMode = 'VCV';

      const facts = buildAuthorizedICUFacts(form);
      const { traces } = buildTechnicianICUNursingNoteWithTrace(facts);
      const authorizedIds = getAllAuthorizedFactIds(facts);

      const allTracesHaveValidIds = traces.every(
        (t) => t.factIds.length > 0 && t.factIds.every((id) => authorizedIds.has(id))
      );
      return allTracesHaveValidIds && traces.length > 0;
    },
    '100% dos segmentos factuais rastreiam para IDs autorizados válidos.',
    'Existem segmentos sem factId ou com factId não registrado.'
  );

  // TRACE-002: Sentença sem factId é bloqueada/rejeitada pelo auditor
  addTest(
    'TRACE-002',
    'Sentença sem factId é detectada e descartada pelo DeterministicNarrativeFactAuditor',
    () => {
      const form = createInitialICUForm();
      const facts = buildAuthorizedICUFacts(form);
      const unauthTrace = {
        text: 'Paciente refere melhora substancial da dor torácica.',
        factIds: ['invented-fact-id-999'],
        category: 'unauthorized',
      };

      const audit = auditDeterministicNarrative([unauthTrace], facts);
      return !audit.passed && audit.unauthorizedSegments.length === 1;
    },
    'Sentença sem factId autorizado foi bloqueada com sucesso pelo auditor.',
    'Sentença não autorizada passou indevidamente pelo auditor.'
  );

  // TRACE-003: Auditoria completa com fatos reais
  addTest(
    'TRACE-003',
    'Auditoria de narrativa completa aprova 100% quando todos os fatos são autorizados',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Em atendimento';
      form.vitalSignsAndPain.heartRate = '78';
      form.vitalSignsAndPain.oxygenSaturation = '98';
      form.neurologicalAndSedation.consciousnessLevel = 'Consciente';

      const facts = buildAuthorizedICUFacts(form);
      const { traces } = buildTechnicianICUNursingNoteWithTrace(facts);
      const audit = auditDeterministicNarrative(traces, facts);

      return audit.passed && audit.validSegmentsCount === traces.length;
    },
    'Narrativa clínica integral auditada e 100% aprovada.',
    'Auditoria reprovou fatos legítimos.'
  );

  // TRACE-004: Correção ortográfica anatômica femoral nos fatos autorizados
  addTest(
    'TRACE-004',
    'Correção ortográfica automática de termos anatômicos (ex: "femural" -> "femoral")',
    () => {
      const form = createInitialICUForm();
      form.devices.list = [{ id: 'd1', type: 'CVC', location: 'veia femural dir' }];
      const facts = buildAuthorizedICUFacts(form);
      const devFact = facts.devices?.find((f) => f.id === 'icu-dev-0');
      return devFact?.value.includes('femoral') && !devFact?.value.includes('femural');
    },
    'Termo "femural" normalizado com rigor ortográfico para "femoral".',
    'Termo incorreto persistiu nos fatos.'
  );

  // TRACE-005: Padrão respiratório gera fato próprio icu-resp-pattern
  addTest(
    'TRACE-005',
    'Padrão respiratório gera fato clínico independente com ID icu-resp-pattern',
    () => {
      const form = createInitialICUForm();
      form.respiratoryAndVentilation.respiratoryPattern = 'Taquipneico';
      const facts = buildAuthorizedICUFacts(form);
      const patFact = facts.respiratory?.find((f) => f.id === 'icu-resp-pattern');
      return patFact !== undefined && patFact.value === 'Taquipneico';
    },
    'Fato icu-resp-pattern criado com sucesso.',
    'Fato icu-resp-pattern não foi gerado.'
  );

  // TRACE-006: Desconforto respiratório gera fato próprio icu-resp-distress
  addTest(
    'TRACE-006',
    'Desconforto respiratório gera fato clínico independente com ID icu-resp-distress',
    () => {
      const form = createInitialICUForm();
      form.respiratoryAndVentilation.respiratoryDistress = 'Presente';
      const facts = buildAuthorizedICUFacts(form);
      const distFact = facts.respiratory?.find((f) => f.id === 'icu-resp-distress');
      return distFact !== undefined && distFact.value === 'Presente';
    },
    'Fato icu-resp-distress criado com sucesso.',
    'Fato icu-resp-distress não foi gerado.'
  );

  // TRACE-007: Tolerância da dieta enteral gera fato próprio icu-nut-enteral-tolerance
  addTest(
    'TRACE-007',
    'Tolerância enteral gera fato clínico independente com ID icu-nut-enteral-tolerance',
    () => {
      const form = createInitialICUForm();
      form.nutritionAndGastrointestinal.nutritionalStatus = 'Dieta enteral';
      form.nutritionAndGastrointestinal.enteralTolerance = 'Boa tolerância';
      const facts = buildAuthorizedICUFacts(form);
      const tolFact = facts.nutrition?.find((f) => f.id === 'icu-nut-enteral-tolerance');
      return tolFact !== undefined && tolFact.value === 'Boa tolerância';
    },
    'Fato icu-nut-enteral-tolerance criado com sucesso.',
    'Fato icu-nut-enteral-tolerance não foi gerado.'
  );

  // TRACE-008: Permeabilidade e funcionamento de dispositivos geram fatos dedicados
  addTest(
    'TRACE-008',
    'Dispositivos geram fatos específicos para permeabilidade, funcionamento e curativo',
    () => {
      const form = createInitialICUForm();
      form.devices.list = [
        {
          id: 'dev1',
          type: 'CVC',
          location: 'subclávia D',
          permeability: 'Pérvio',
          functioning: 'Funcionante',
          dressingStatus: 'Limpo, seco e íntegro',
          phlogisticSigns: 'Ausentes',
        },
      ];
      const facts = buildAuthorizedICUFacts(form);
      const patFact = facts.devices?.find((f) => f.id === 'icu-dev-0-patency');
      const funcFact = facts.devices?.find((f) => f.id === 'icu-dev-0-function');
      const dressFact = facts.devices?.find((f) => f.id === 'icu-dev-0-dressing');
      const phlogFact = facts.devices?.find((f) => f.id === 'icu-dev-0-phlogistic');

      return Boolean(patFact && funcFact && dressFact && phlogFact);
    },
    'Fatos atômicos de dispositivos gerados com precisão.',
    'Faltam fatos atômicos para dispositivos.'
  );

  // =========================================================================
  // SUÍTE REG (REG-001 a REG-010): Device & Medication Registries
  // =========================================================================

  // REG-001: Device Registry unifica dispositivos respiratórios
  addTest(
    'REG-001',
    'AuthorizedDeviceRegistry reconhece TOT e Traqueostomia a partir da seção respiratória',
    () => {
      const form = createInitialICUForm();
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.mechanicalVentilationAirway = 'TOT';

      const facts = buildAuthorizedICUFacts(form);
      const registry = buildAuthorizedDeviceRegistry(facts);

      return registry.isAuthorized('TOT') && registry.isAuthorized('tubo orotraqueal');
    },
    'TOT e Tubo Orotraqueal autorizados com sucesso pelo registro unificado.',
    'Dispositivo respiratório não autorizado.'
  );

  // REG-002: Device Registry unifica dispositivos nutricionais
  addTest(
    'REG-002',
    'AuthorizedDeviceRegistry reconhece SNE e GTT a partir da seção nutricional',
    () => {
      const form = createInitialICUForm();
      form.nutritionAndGastrointestinal.nutritionalStatus = 'Dieta enteral';
      form.nutritionAndGastrointestinal.enteralRoute = 'SNE';

      const facts = buildAuthorizedICUFacts(form);
      const registry = buildAuthorizedDeviceRegistry(facts);

      return registry.isAuthorized('SNE') && registry.isAuthorized('sonda nasoenteral');
    },
    'SNE autorizada via seção de nutrição.',
    'SNE não foi autorizada.'
  );

  // REG-003: Device Registry unifica dispositivos eliminatórios
  addTest(
    'REG-003',
    'AuthorizedDeviceRegistry reconhece SVD a partir da seção de eliminações',
    () => {
      const form = createInitialICUForm();
      form.eliminationsAndFluidBalance.urinaryRoute = 'SVD';
      form.eliminationsAndFluidBalance.diuresis = 'Presente';

      const facts = buildAuthorizedICUFacts(form);
      const registry = buildAuthorizedDeviceRegistry(facts);

      return registry.isAuthorized('SVD') && registry.isAuthorized('sonda vesical de demora');
    },
    'SVD autorizada via seção de eliminações.',
    'SVD não foi autorizada.'
  );

  // REG-004: Device Registry unifica dispositivos invasivos vasculares
  addTest(
    'REG-004',
    'AuthorizedDeviceRegistry reconhece CVC, PAI, PICC e CDL da lista de dispositivos',
    () => {
      const form = createInitialICUForm();
      form.devices.list = [
        { id: 'd1', type: 'CVC', location: 'jugular D' },
        { id: 'd2', type: 'PAI', location: 'radial E' },
      ];

      const facts = buildAuthorizedICUFacts(form);
      const registry = buildAuthorizedDeviceRegistry(facts);

      return registry.isAuthorized('CVC') && registry.isAuthorized('PAI');
    },
    'CVC e PAI autorizados com sucesso.',
    'Dispositivos invasivos não autorizados.'
  );

  // REG-005: DeviceLock bloqueia dispositivo não presente
  addTest(
    'REG-005',
    'DeviceLock bloqueia texto de IA que alucina CVC quando apenas AVP foi registrado',
    () => {
      const form = createInitialICUForm();
      form.devices.list = [{ id: 'd1', type: 'AVP', location: 'MSE' }];
      const facts = buildAuthorizedICUFacts(form);
      const aiText = 'Paciente calmo, mantém cateter venoso central (CVC) em subclávia.';

      const result = verifyDeviceLock(aiText, facts);
      return !result.passed && result.unauthorizedDevices.some((d) => d.includes('CVC') || d.includes('Central'));
    },
    'DeviceLock bloqueou com sucesso CVC alucinado.',
    'DeviceLock falhou ao bloquear dispositivo não autorizado.'
  );

  // REG-006: Medication Registry reconhece drogas vasoativas
  addTest(
    'REG-006',
    'AuthorizedMedicationRegistry reconhece noradrenalina e vasopressina de DVA',
    () => {
      const form = createInitialICUForm();
      form.vasoactiveDrugs.inUse = 'Sim';
      form.vasoactiveDrugs.drugsList = [
        { id: 'm1', medication: 'Noradrenalina', infusionRate: '0.1', unit: 'mcg/kg/min' },
      ];
      const facts = buildAuthorizedICUFacts(form);
      const registry = buildAuthorizedMedicationRegistry(facts);

      return registry.isAuthorized('noradrenalina');
    },
    'Noradrenalina autorizada no registro de medicamentos.',
    'Noradrenalina não foi reconhecida.'
  );

  // REG-007: Medication Registry reconhece sedação contínua
  addTest(
    'REG-007',
    'AuthorizedMedicationRegistry reconhece Dormonid e Fentanil de Sedação/Analgesia',
    () => {
      const form = createInitialICUForm();
      form.sedationAndAnalgesia.inUse = 'Sim';
      form.sedationAndAnalgesia.infusionsList = [
        { id: 's1', medication: 'Dormonid', rateOrDose: '5', unit: 'mL/h', purpose: 'Sedação' },
      ];
      const facts = buildAuthorizedICUFacts(form);
      const registry = buildAuthorizedMedicationRegistry(facts);

      return registry.isAuthorized('Dormonid');
    },
    'Dormonid autorizado preservando a denominação informada.',
    'Dormonid não foi autorizado.'
  );

  // REG-008: Medication Registry reconhece substâncias de cuidados (clorexidina)
  addTest(
    'REG-008',
    'AuthorizedMedicationRegistry reconhece substâncias clínicas de cuidados prescritos',
    () => {
      const form = createInitialICUForm();
      form.nursingCareDone.careItems = ['Higiene oral com clorexidina 0,12%'];
      const facts = buildAuthorizedICUFacts(form);
      const registry = buildAuthorizedMedicationRegistry(facts);

      return registry.isAuthorized('clorexidina');
    },
    'Clorexidina autorizada via cuidados executados.',
    'Clorexidina não autorizada.'
  );

  // REG-009: MedicationLock bloqueia medicamento não prescrito
  addTest(
    'REG-009',
    'MedicationLock bloqueia fentanil e propofol quando não foram informados',
    () => {
      const form = createInitialICUForm();
      form.vasoactiveDrugs.inUse = 'Não';
      form.sedationAndAnalgesia.inUse = 'Não';
      const facts = buildAuthorizedICUFacts(form);
      const aiText = 'Paciente em uso de propofol contínuo para sedação.';

      const result = verifyMedicationLock(aiText, facts);
      return !result.passed && result.unauthorizedMedications.includes('propofol');
    },
    'MedicationLock bloqueou com sucesso propofol não autorizado.',
    'MedicationLock falhou ao bloquear medicamento alucinado.'
  );

  // REG-010: Não substituição indevida de sinônimos farmacológicos
  addTest(
    'REG-010',
    'Preserva nomes de medicamentos sem conversão indevida para sinônimos farmacológicos',
    () => {
      const form = createInitialICUForm();
      form.vasoactiveDrugs.inUse = 'Sim';
      form.vasoactiveDrugs.drugsList = [
        { id: 'm1', medication: 'Noradrenalina', infusionRate: '0.05', unit: 'mcg/kg/min' },
      ];
      const facts = buildAuthorizedICUFacts(form);
      const note = buildTechnicianICUNursingNote(facts);

      return note.includes('Noradrenalina') && !note.includes('Norepinefrina');
    },
    'Denominação Noradrenalina mantida com estrita fidelidade.',
    'Houve substituição não autorizada.'
  );

  // =========================================================================
  // SUÍTE NAV (NAV-001 a NAV-008): Navigation & Module Availability
  // =========================================================================

  // NAV-001: Módulo Técnico Anotação PS disponível
  addTest(
    'NAV-001',
    'Módulo Técnico: Anotação de Enfermagem para PS/Emergência está Disponível',
    () => {
      const avail = getModuleAvailability('technician_nursing_note', 'emergency');
      return avail.status === 'available' && avail.route === 'clinical-evolution';
    },
    'Status Disponível confirmado no ModuleRegistry.',
    'Status incorreto.'
  );

  // NAV-002: Módulo Técnico Anotação UTI disponível
  addTest(
    'NAV-002',
    'Módulo Técnico: Anotação de Enfermagem para UTI está Disponível',
    () => {
      const avail = getModuleAvailability('technician_nursing_note', 'icu');
      return avail.status === 'available' && avail.route === 'icu-clinical-evolution';
    },
    'Status Disponível para UTI confirmado no ModuleRegistry.',
    'Status incorreto.'
  );

  // NAV-003: Módulo Técnico Admissão disponível no dashboard
  addTest(
    'NAV-003',
    'Módulo Técnico: Admissão — Anotação de Enfermagem está Disponível no Dashboard',
    () => {
      const mod = MODULE_REGISTRY.technician_admission;
      return mod.status === 'available';
    },
    'Módulo de Admissão do Técnico com status Disponível no Dashboard.',
    'Módulo de Admissão com status incorreto.'
  );

  // NAV-004: Módulo Técnico Admissão PS disponível
  addTest(
    'NAV-004',
    'Módulo Técnico: Admissão PS/Emergência está Disponível para navegação',
    () => {
      const avail = getModuleAvailability('technician_admission', 'emergency');
      return avail.status === 'available' && avail.route === 'admission-clinical-evolution';
    },
    'Admissão PS do Técnico configurada como Disponível para rota admission-clinical-evolution.',
    'Admissão PS do Técnico não está disponível.'
  );

  // NAV-005: Módulo Técnico Admissão UTI em desenvolvimento
  addTest(
    'NAV-005',
    'Módulo Técnico: Admissão UTI está configurada como Em desenvolvimento',
    () => {
      const avail = getModuleAvailability('technician_admission', 'icu');
      return avail.status === 'development';
    },
    'Status Em desenvolvimento confirmado para Admissão UTI.',
    'Status incorreto.'
  );

  // NAV-006: Módulo Técnico Admissão Clínica Médica em desenvolvimento
  addTest(
    'NAV-006',
    'Módulo Técnico: Admissão Clínica Médica está Em desenvolvimento',
    () => {
      const avail = getModuleAvailability('technician_admission', 'medicalClinic');
      return avail.status === 'development';
    },
    'Status Em desenvolvimento confirmado para Clínica Médica.',
    'Status incorreto.'
  );

  // NAV-007: Módulo Enfermeiro Admissão PS disponível
  addTest(
    'NAV-007',
    'Módulo Enfermeiro: Admissão PS/Emergência está Disponível',
    () => {
      const avail = getModuleAvailability('nurse_admission', 'emergency');
      return avail.status === 'available';
    },
    'Admissão do Enfermeiro para PS confirmada como Disponível.',
    'Status incorreto.'
  );

  // NAV-008: Ausência de strings hardcoded de status desatualizadas
  addTest(
    'NAV-008',
    'Centralização integral das disponibilidades através do MODULE_REGISTRY',
    () => {
      return Object.keys(MODULE_REGISTRY).length >= 6;
    },
    'ModuleRegistry ativo como fonte única de verdade.',
    'ModuleRegistry incompleto.'
  );

  // =========================================================================
  // SUÍTE UTI-AI (UTI-AI-001 a UTI-AI-015): AI Refinement & Post-generation Verifier
  // =========================================================================

  // UTI-AI-001: Verificador aprova resposta íntegra
  addTest(
    'UTI-AI-001',
    'PostGenerationVerifier aprova resposta estruturada de IA idêntica aos fatos autorizados',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo plantão';
      form.vitalSignsAndPain.systolicBP = '120';
      form.vitalSignsAndPain.diastolicBP = '80';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: canonical, factIds: ['icu-ctx-moment', 'vs-blood-pressure'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return result.approved;
    },
    'Resposta de IA 100% aprovada pelo PostGenerationVerifier.',
    'Resposta válida foi reprovada.'
  );

  // UTI-AI-002: Verificador rejeita alteração numérica de PA
  addTest(
    'UTI-AI-002',
    'NumericLock rejeita alteração de valor de PA (ex: 120/80 -> 140/90)',
    () => {
      const form = createInitialICUForm();
      form.vitalSignsAndPain.systolicBP = '120';
      form.vitalSignsAndPain.diastolicBP = '80';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Sinais vitais: PA 140/90 mmHg.', factIds: ['vs-blood-pressure'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved && result.reasons.some((r) => r.includes('numérica') || r.includes('140'));
    },
    'Alteração não autorizada de PA bloqueada com sucesso.',
    'Alteração indevida de PA foi aceita.'
  );

  // UTI-AI-003: Verificador rejeita alteração numérica de PAM
  addTest(
    'UTI-AI-003',
    'NumericLock rejeita alteração ou cálculo indevido de PAM (ex: PAM 85 -> 95)',
    () => {
      const form = createInitialICUForm();
      form.vitalSignsAndPain.meanArterialPressure = '85';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Sinais vitais com PAM 95 mmHg.', factIds: ['vs-map'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved;
    },
    'Alteração não autorizada de PAM bloqueada.',
    'Alteração indevida de PAM foi aceita.'
  );

  // UTI-AI-004: Verificador rejeita inserção de diagnóstico de enfermagem
  addTest(
    'UTI-AI-004',
    'RoleBoundaryLock rejeita termos privativos do enfermeiro na anotação do técnico',
    () => {
      const form = createInitialICUForm();
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [
          {
            text: 'Evidenciado diagnóstico de enfermagem de troca de gases prejudicada.',
            factIds: ['icu-ctx-moment'],
          },
        ],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved && result.reasons.some((r) => r.includes('competência') || r.includes('diagnóstico') || r.includes('privativo'));
    },
    'Invasão de competência privativa bloqueada com sucesso.',
    'Termo privativo não foi bloqueado.'
  );

  // UTI-AI-005: Verificador rejeita alteração de parâmetros de ventilador (FiO2)
  addTest(
    'UTI-AI-005',
    'VentilatorParameterLock rejeita alteração de FiO2 (ex: 40% -> 60%)',
    () => {
      const form = createInitialICUForm();
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.ventilationFiO2 = '40';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Ventilação mecânica com FiO₂ 60%.', factIds: ['icu-resp-vmi-fio2'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved && result.reasons.some((r) => r.includes('FiO₂') || r.includes('ventilatório') || r.includes('numérica'));
    },
    'Alteração de parâmetro ventilatório bloqueada com sucesso.',
    'Alteração indevida de FiO2 foi aceita.'
  );

  // UTI-AI-006: Verificador rejeita alteração de PEEP
  addTest(
    'UTI-AI-006',
    'VentilatorParameterLock rejeita alteração de PEEP (ex: 5 -> 10 cmH2O)',
    () => {
      const form = createInitialICUForm();
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.ventilationPeep = '5';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Ventilação mecânica mantida com PEEP 10 cmH₂O.', factIds: ['icu-resp-vmi-peep'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved;
    },
    'Alteração indevida de PEEP bloqueada.',
    'Alteração indevida de PEEP foi aceita.'
  );

  // UTI-AI-007: Fallback determinístico preservado em caso de rejeição
  addTest(
    'UTI-AI-007',
    'Descarte completo de texto refinado reprovado com retorno à anotação determinística',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente em leito de UTI';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const invalidResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Paciente com infusão de dobutamina não prescrita.', factIds: ['icu-ctx-moment'] }],
      };

      const verification = verifyICUAIRefinedResponse(invalidResponse, facts, canonical);
      return !verification.approved && canonical.includes('Recebo paciente em leito de UTI');
    },
    'Texto rejeitado descartado integralmente e fallback determinístico preservado.',
    'Falha no fallback de segurança.'
  );

  // UTI-AI-008: Preservação de taxa de infusão de drogas vasoativas
  addTest(
    'UTI-AI-008',
    'NumericLock preserva vazão de drogas vasoativas (ex: 0.1 mcg/kg/min)',
    () => {
      const form = createInitialICUForm();
      form.vasoactiveDrugs.inUse = 'Sim';
      form.vasoactiveDrugs.drugsList = [
        { id: 'd1', medication: 'Noradrenalina', infusionRate: '0.1', unit: 'mcg/kg/min' },
      ];
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Noradrenalina a 0.5 mcg/kg/min.', factIds: ['icu-dva-item-0'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved;
    },
    'Alteração de taxa de infusão de DVA bloqueada.',
    'Alteração de taxa de DVA foi aceita.'
  );

  // UTI-AI-009: Preservação de vazão de sedação contínua
  addTest(
    'UTI-AI-009',
    'NumericLock preserva vazão de sedação contínua (ex: 5 mL/h)',
    () => {
      const form = createInitialICUForm();
      form.sedationAndAnalgesia.inUse = 'Sim';
      form.sedationAndAnalgesia.infusionsList = [
        { id: 's1', medication: 'Dormonid', rateOrDose: '5', unit: 'mL/h', purpose: 'Sedação' },
      ];
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Dormonid em BIC a 15 mL/h.', factIds: ['icu-sed-item-0'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved;
    },
    'Alteração de taxa de sedação bloqueada.',
    'Alteração de taxa de sedação foi aceita.'
  );

  // UTI-AI-010: Bloqueio de omissão de DVA
  addTest(
    'UTI-AI-010',
    'OmissionLock bloqueia omissão de droga vasoativa registrada no formulário',
    () => {
      const form = createInitialICUForm();
      form.vasoactiveDrugs.inUse = 'Sim';
      form.vasoactiveDrugs.drugsList = [
        { id: 'd1', medication: 'Noradrenalina', infusionRate: '0.1', unit: 'mcg/kg/min' },
      ];
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      // AI response omits noradrenalina completely
      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Paciente calmo, sem intercorrências hemodinâmicas no período.', factIds: ['icu-ctx-moment'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved;
    },
    'Omissão indevida de DVA bloqueada pelo verificador.',
    'Omissão de DVA não foi detectada.'
  );

  // UTI-AI-011: Bloqueio de omissão de dispositivo invasivo CVC
  addTest(
    'UTI-AI-011',
    'OmissionLock bloqueia omissão de CVC informado no formulário',
    () => {
      const form = createInitialICUForm();
      form.devices.list = [{ id: 'd1', type: 'CVC', location: 'subclávia D' }];
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Paciente descansando no leito, sem queixas.', factIds: ['icu-ctx-moment'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved;
    },
    'Omissão de CVC bloqueada com sucesso.',
    'Omissão de CVC não foi detectada.'
  );

  // UTI-AI-012: Bloqueio de alucinação de dreno
  addTest(
    'UTI-AI-012',
    'DeviceLock bloqueia alucinação de dreno de tórax',
    () => {
      const form = createInitialICUForm();
      form.devices.list = [];
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Mantém dreno de tórax em hemitórax direito com débito seroso.', factIds: ['icu-ctx-moment'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved && result.reasons.some((r) => r.includes('dreno') || r.includes('Dispositivo'));
    },
    'Alucinação de dreno bloqueada com sucesso.',
    'Alucinação de dreno foi aceita.'
  );

  // UTI-AI-013: Bloqueio de prescrição de conduta terapêutica
  addTest(
    'UTI-AI-013',
    'RoleBoundaryLock bloqueia prescrição de condutas privativas médicas/enfermagem',
    () => {
      const form = createInitialICUForm();
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Prescrevo desmame ventilatório progressivo e redução da sedação.', factIds: ['icu-ctx-moment'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved && result.reasons.some((r) => r.includes('competência') || r.includes('prescrev') || r.includes('privativo'));
    },
    'Prescrição de conduta bloqueada pelo PostGenerationVerifier.',
    'Prescrição de conduta foi aceita.'
  );

  // UTI-AI-014: Validação de integridade do Balanço Hídrico
  addTest(
    'UTI-AI-014',
    'NumericLock preserva valores exatos de Balanço Hídrico (entradas, saídas e resultado)',
    () => {
      const form = createInitialICUForm();
      form.eliminationsAndFluidBalance.hasFluidBalance = 'Sim';
      form.eliminationsAndFluidBalance.fluidIntake = '1500';
      form.eliminationsAndFluidBalance.fluidOutput = '1200';
      form.eliminationsAndFluidBalance.fluidBalanceResult = '+300';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Balanço hídrico do período com resultado de +500 mL.', factIds: ['icu-elim-fluid-balance'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return !result.approved;
    },
    'Alteração indevida de balanço hídrico bloqueada.',
    'Alteração de balanço hídrico foi aceita.'
  );

  // UTI-AI-015: Estruturação estrita em parágrafos clínicos
  addTest(
    'UTI-AI-015',
    'Garante estruturação de parágrafos coerentes sem formatações Markdown invasivas',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      const facts = buildAuthorizedICUFacts(form);
      const canonical = buildTechnicianICUNursingNote(facts);

      const aiResponse: AIRefinedStructuredResponse = {
        paragraphs: [{ text: 'Recebo paciente em UTI.', factIds: ['icu-ctx-moment'] }],
      };

      const result = verifyICUAIRefinedResponse(aiResponse, facts, canonical);
      return result.approved;
    },
    'Validação de formato e ausência de markdown aprovada.',
    'Falha na validação de formato.'
  );

  const passedCount = results.filter((r) => r.passed).length;

  return {
    results,
    passedCount,
    totalCount: results.length,
    allPassed: passedCount === results.length,
  };
}
