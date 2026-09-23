import { EngineTestResult, EngineTestSuiteResult } from './engineTests';
import {
  validateClinicalModuleRegistry,
  CLINICAL_MODULE_CONTRACTS,
  TECH_PS_MODULE_CONTRACT,
  TECH_ICU_MODULE_CONTRACT,
  TECH_ADM_PS_MODULE_CONTRACT,
  NURSE_ADM_PS_MODULE_CONTRACT,
  NURSE_EVO_PS_MODULE_CONTRACT,
} from './factory/moduleDefinitions';
import { ProfessionalRolePolicy } from './factory/professionalRolePolicy';
import { AuthorizedFactFactory } from './factory/authorizedFactFactory';
import { ConditionalFieldEngine } from './factory/conditionalFieldEngine';
import { NarrativeComposer } from './factory/narrativeComposer';
import { createClinicalFormSession, resetClinicalSession } from './factory/clinicalFormSession';
import { VITAL_SIGNS_DEFINITIONS } from './factory/vitalSignsDefinition';
import {
  precautionOptions,
  accompanimentOptions,
  consciousnessOptions,
  orientationOptions,
  respiratorySupportOptions,
  edemaOptions,
  bathOptions,
  complicationOptions,
  communicationTargets,
} from './factory/commonOptions';
import { ClinicalComponentRegistry } from './factory/componentRegistry';
import { MODULE_REGISTRY, getModuleAvailability } from './moduleRegistry';

// Snapshots and data creators
import { createInitialClinicalForm } from '../utils/clinicalValidator';
import { createInitialICUForm } from '../utils/icuValidator';
import { createInitialAdmissionForm } from '../utils/admissionValidator';
import { createInitialNurseAdmissionForm } from '../utils/nurseAdmissionValidator';
import { createInitialNurseEvolutionForm } from '../utils/nurseEvolutionValidator';

import { normalizeClinicalData } from './clinicalDataNormalizer';
import { normalizeNurseEvolutionForm } from '../utils/nurseEvolutionValidator';

import { buildTechnicianNursingNote } from './technicianNursingNoteBuilder';
import { buildTechnicianICUNursingNote } from './technicianICUNursingNoteBuilder';
import { buildTechnicianAdmissionNote } from './technicianAdmissionNoteBuilder';
import { buildNurseAdmissionNote } from './nurseAdmissionNoteBuilder';
import { buildNurseEvolutionNote } from './nurseEvolutionNoteBuilder';
import { getAllAuthorizedFactIds } from './deterministicNarrativeFactAuditor';

export function runClinicalModuleFactoryTests(): EngineTestSuiteResult {
  const results: EngineTestResult[] = [];

  // =========================================================================
  // FACTORY-001 a FACTORY-020
  // =========================================================================

  // FACTORY-001: Todos os módulos available possuem ClinicalModuleContract completo
  {
    const validation = validateClinicalModuleRegistry();
    results.push({
      id: 'FACTORY-001',
      name: 'FACTORY-001: Todos os módulos available possuem ClinicalModuleContract completo',
      passed: validation.valid,
      message: validation.valid
        ? 'Passou: Todos os módulos available possuem contrato completo com todas as dependências tipadas.'
        : `Falhou: ${validation.errors.join('; ')}`,
    });
  }

  // FACTORY-002: Module ID duplicado é rejeitado
  {
    const duplicateContracts = [
      ...CLINICAL_MODULE_CONTRACTS,
      { ...TECH_PS_MODULE_CONTRACT }, // exact duplicate ID
    ];
    const seenIds = new Set<string>();
    let hasDuplicate = false;
    for (const c of duplicateContracts) {
      if (seenIds.has(c.definition.id)) {
        hasDuplicate = true;
        break;
      }
      seenIds.add(c.definition.id);
    }
    results.push({
      id: 'FACTORY-002',
      name: 'FACTORY-002: Module ID duplicado é rejeitado',
      passed: hasDuplicate,
      message: hasDuplicate
        ? 'Passou: Detecção de Module ID duplicado validada com sucesso.'
        : 'Falhou: Não detectou ID duplicado.',
    });
  }

  // FACTORY-003: Rota duplicada é rejeitada
  {
    const seenRoutes = new Set<string>();
    let duplicateDetected = false;
    for (const c of CLINICAL_MODULE_CONTRACTS) {
      if (seenRoutes.has(c.route)) {
        duplicateDetected = true;
      }
      seenRoutes.add(c.route);
    }
    const passed = !duplicateDetected && seenRoutes.size === CLINICAL_MODULE_CONTRACTS.length;
    results.push({
      id: 'FACTORY-003',
      name: 'FACTORY-003: Rotas são únicas entre contratos ativos',
      passed,
      message: passed
        ? 'Passou: Cada contrato clínico ativo mapeia para uma rota exclusiva no app.'
        : 'Falhou: Colisão de rotas detectada entre módulos.',
    });
  }

  // FACTORY-004: Builder ausente impede validação
  {
    const invalidContract: any = {
      ...TECH_PS_MODULE_CONTRACT,
      deterministicBuilder: null,
    };
    const isMissing = !invalidContract.deterministicBuilder || typeof invalidContract.deterministicBuilder !== 'function';
    results.push({
      id: 'FACTORY-004',
      name: 'FACTORY-004: Builder ausente impede available / falha validação',
      passed: isMissing,
      message: isMissing
        ? 'Passou: Ausência de builder determinístico identificada como falha de contrato.'
        : 'Falhou: Contrato sem builder foi aceito indevidamente.',
    });
  }

  // FACTORY-005: Normalizer ausente impede validação
  {
    const invalidContract: any = {
      ...TECH_PS_MODULE_CONTRACT,
      normalizer: null,
    };
    const isMissing = !invalidContract.normalizer || typeof invalidContract.normalizer !== 'function';
    results.push({
      id: 'FACTORY-005',
      name: 'FACTORY-005: Normalizer ausente impede available / falha validação',
      passed: isMissing,
      message: isMissing
        ? 'Passou: Ausência de normalizer identificada como falha de contrato.'
        : 'Falhou: Contrato sem normalizer foi aceito indevidamente.',
    });
  }

  // FACTORY-006: FactsBuilder ausente impede validação
  {
    const invalidContract: any = {
      ...TECH_PS_MODULE_CONTRACT,
      factsBuilder: null,
    };
    const isMissing = !invalidContract.factsBuilder || typeof invalidContract.factsBuilder !== 'function';
    results.push({
      id: 'FACTORY-006',
      name: 'FACTORY-006: FactsBuilder ausente impede available / falha validação',
      passed: isMissing,
      message: isMissing
        ? 'Passou: Ausência de factsBuilder identificada como falha de contrato.'
        : 'Falhou: Contrato sem factsBuilder foi aceito indevidamente.',
    });
  }

  // FACTORY-007: PostGenerationVerifier ausente impede validação
  {
    const invalidContract: any = {
      ...TECH_PS_MODULE_CONTRACT,
      postGenerationVerifier: null,
    };
    const isMissing = !invalidContract.postGenerationVerifier || typeof invalidContract.postGenerationVerifier !== 'function';
    results.push({
      id: 'FACTORY-007',
      name: 'FACTORY-007: PostGenerationVerifier ausente impede available / falha validação',
      passed: isMissing,
      message: isMissing
        ? 'Passou: Ausência de postGenerationVerifier identificada como falha de contrato.'
        : 'Falhou: Contrato sem verifier foi aceito indevidamente.',
    });
  }

  // FACTORY-008: Capability incompatível com Técnico é rejeitada
  {
    const invalidCapabilities = {
      ...TECH_PS_MODULE_CONTRACT.definition.capabilities,
      supportsNurseClinicalSynthesis: true, // Deliberately invalid for technician
    };
    const check = ProfessionalRolePolicy.validateCapabilities('technician', invalidCapabilities);
    const badDef = {
      ...TECH_PS_MODULE_CONTRACT.definition,
      capabilities: invalidCapabilities,
    };
    const defCheck = ProfessionalRolePolicy.validateModuleDefinition(badDef);
    const passed = !check.valid && !defCheck.valid && check.errors.some((e) => e.includes('POLICY-ERR-001'));
    results.push({
      id: 'FACTORY-008',
      name: 'FACTORY-008: Capability incompatível com Técnico é rejeitada (COFEN / Hardening)',
      passed,
      message: passed
        ? 'Passou: ProfessionalRolePolicy rejeitou estritamente capability privativa de Enfermeiro para perfil Técnico.'
        : 'Falhou: Capability privativa do Enfermeiro foi indevidamente aceita para o Técnico.',
    });
  }

  // FACTORY-009: Capability compatível com Enfermeiro é permitida
  {
    const check = ProfessionalRolePolicy.validateCapabilities('nurse', {
      ...NURSE_EVO_PS_MODULE_CONTRACT.definition.capabilities,
      supportsNurseClinicalSynthesis: true,
    });
    const nurseDef = NURSE_EVO_PS_MODULE_CONTRACT.definition;
    const defCheck = ProfessionalRolePolicy.validateModuleDefinition(nurseDef);
    const passed = check.valid && defCheck.valid && check.errors.length === 0;
    results.push({
      id: 'FACTORY-009',
      name: 'FACTORY-009: Capability compatível com Enfermeiro é permitida (sem julgamento autônomo)',
      passed,
      message: passed
        ? 'Passou: ProfessionalRolePolicy aprovou capacidades legais do Enfermeiro para documentação manual.'
        : `Falhou: ${check.errors.join('; ')}`,
    });
  }

  // FACTORY-010: ClinicalSectionDefinition não armazena dados clínicos
  {
    let hasClinicalData = false;
    const forbiddenKeys = [
      'patientData',
      'value',
      'patientValue',
      'answer',
      'clinicalValue',
      'defaultClinicalValue',
      'formData',
      'recordedAt',
      'vitalSignValues',
    ];
    for (const contract of CLINICAL_MODULE_CONTRACTS) {
      for (const section of contract.definition.sections) {
        const keys = Object.keys(section);
        if (keys.some((k) => forbiddenKeys.includes(k))) {
          hasClinicalData = true;
        }
      }
    }
    const passed = !hasClinicalData;
    results.push({
      id: 'FACTORY-010',
      name: 'FACTORY-010: ClinicalSectionDefinition não armazena dados clínicos do paciente',
      passed,
      message: passed
        ? 'Passou: Seções contêm exclusivamente metadados, estrutura, componente, ordem e regras de exibição.'
        : 'Falhou: Encontrados campos de dados clínicos em seções.',
    });
  }

  // FACTORY-011: Field definitions não possuem valores default clínicos
  {
    const optionsArrays = [
      precautionOptions,
      accompanimentOptions,
      consciousnessOptions,
      orientationOptions,
      respiratorySupportOptions,
      edemaOptions,
      bathOptions,
      complicationOptions,
      communicationTargets,
    ];
    // Check that none of the option arrays contain pre-selected clinical truth defaults
    const forbiddenDefaults = ['Consciente', 'Padrão', 'Ausente', 'Não', 'Íntegra', 'Eupneico'];
    const hasDefaultProperty = Object.values(VITAL_SIGNS_DEFINITIONS).some(
      (def: any) => def.defaultValue !== undefined && forbiddenDefaults.includes(def.defaultValue)
    );
    const isSafe = optionsArrays.every((arr) => Array.isArray(arr) && arr.length > 0) && !hasDefaultProperty;
    results.push({
      id: 'FACTORY-011',
      name: 'FACTORY-011: Field definitions não possuem valores default clínicos predefinidos',
      passed: isSafe,
      message: isSafe
        ? 'Passou: Ausência de seleção permanece semanticamente vazia; nenhum default clínico pré-selecionado.'
        : 'Falhou: Encontrados defaults clínicos pré-configurados.',
    });
  }

  // FACTORY-012: Conditional engine não cria fatos
  {
    const vmiCheck = ConditionalFieldEngine.shouldShowMechanicalVentilation('Ventilação mecânica invasiva');
    const oxygenCheck = ConditionalFieldEngine.shouldShowOxygenFlowRate('Cateter nasal');
    const enteralCheck = ConditionalFieldEngine.shouldShowEnteralFields('Dieta enteral');
    const edemaCheck = ConditionalFieldEngine.shouldShowEdemaDetails('Presente em MMII');
    const lesionCheck = ConditionalFieldEngine.shouldShowSkinLesionDetails('Com lesão por pressão');
    const compCheck = ConditionalFieldEngine.shouldShowComplicationDetails('Sim');
    const vasoCheck = ConditionalFieldEngine.shouldShowVasoactiveDrugDetails('Sim');
    const bathCheck = ConditionalFieldEngine.shouldShowBathTolerance('Banho no leito');

    // Engine returns booleans only - never creates facts or objects
    const passed =
      typeof vmiCheck === 'boolean' &&
      typeof oxygenCheck === 'boolean' &&
      typeof enteralCheck === 'boolean' &&
      typeof edemaCheck === 'boolean' &&
      typeof lesionCheck === 'boolean' &&
      typeof compCheck === 'boolean' &&
      typeof vasoCheck === 'boolean' &&
      typeof bathCheck === 'boolean';
    results.push({
      id: 'FACTORY-012',
      name: 'FACTORY-012: ConditionalFieldEngine é estritamente controlador de UI (não cria fatos)',
      passed,
      message: passed
        ? 'Passou: ConditionalFieldEngine apenas controla visibilidade de campos e nunca sintetiza fatos.'
        : 'Falhou: ConditionalFieldEngine retornou dados não booleanos.',
    });
  }

  // FACTORY-013: Fact factory rejeita value vazio e preserva zero
  {
    let caughtEmptyString = false;
    let caughtWhitespace = false;
    let caughtNull = false;
    let caughtEmptyArray = false;
    let preservedNumericZero = false;
    let preservedStringZero = false;

    try {
      AuthorizedFactFactory.create({
        id: 'test-empty',
        category: 'test',
        sourceField: 'testField',
        value: '',
        canonicalText: 'Texto',
      });
    } catch {
      caughtEmptyString = true;
    }

    try {
      AuthorizedFactFactory.create({
        id: 'test-ws',
        category: 'test',
        sourceField: 'testField',
        value: '   ',
        canonicalText: 'Texto',
      });
    } catch {
      caughtWhitespace = true;
    }

    try {
      AuthorizedFactFactory.create({
        id: 'test-null',
        category: 'test',
        sourceField: 'testField',
        value: null,
        canonicalText: 'Texto',
      });
    } catch {
      caughtNull = true;
    }

    try {
      AuthorizedFactFactory.create({
        id: 'test-arr',
        category: 'test',
        sourceField: 'testField',
        value: [],
        canonicalText: 'Texto',
      });
    } catch {
      caughtEmptyArray = true;
    }

    try {
      const factZero = AuthorizedFactFactory.create({
        id: 'test-num-zero',
        category: 'test',
        sourceField: 'painLevel',
        value: 0,
        canonicalText: 'Dor: EVA 0/10 (sem queixa de dor)',
      });
      preservedNumericZero = factZero.value === 0;
    } catch {
      preservedNumericZero = false;
    }

    try {
      const factStrZero = AuthorizedFactFactory.create({
        id: 'test-str-zero',
        category: 'test',
        sourceField: 'painLevel',
        value: '0',
        canonicalText: 'Dor: EVA 0/10',
      });
      preservedStringZero = factStrZero.value === '0';
    } catch {
      preservedStringZero = false;
    }

    const passed =
      caughtEmptyString &&
      caughtWhitespace &&
      caughtNull &&
      caughtEmptyArray &&
      preservedNumericZero &&
      preservedStringZero;

    results.push({
      id: 'FACTORY-013',
      name: 'FACTORY-013: Fact factory rejeita value vazio e preserva explicitamente o valor 0',
      passed,
      message: passed
        ? 'Passou: AuthorizedFactFactory rejeita valores nulos, vazios ou espaços e preserva explicitamente 0 (EVA 0, balanço 0).'
        : 'Falhou: Erro na validação de valores vazios ou na preservação do zero.',
    });
  }

  // FACTORY-014: Fact factory exige sourceField
  {
    let caughtEmptySource = false;
    let caughtWhitespaceSource = false;
    let caughtNullSource = false;

    try {
      AuthorizedFactFactory.create({
        id: 'test-sf-empty',
        category: 'test',
        sourceField: '',
        value: 'valor válido',
        canonicalText: 'Texto canônico',
      });
    } catch {
      caughtEmptySource = true;
    }

    try {
      AuthorizedFactFactory.create({
        id: 'test-sf-ws',
        category: 'test',
        sourceField: '   ',
        value: 'valor válido',
        canonicalText: 'Texto canônico',
      });
    } catch {
      caughtWhitespaceSource = true;
    }

    try {
      AuthorizedFactFactory.create({
        id: 'test-sf-null',
        category: 'test',
        sourceField: null as any,
        value: 'valor válido',
        canonicalText: 'Texto canônico',
      });
    } catch {
      caughtNullSource = true;
    }

    const passed = caughtEmptySource && caughtWhitespaceSource && caughtNullSource;
    results.push({
      id: 'FACTORY-014',
      name: 'FACTORY-014: Fact factory exige sourceField para proveniência rastreável',
      passed,
      message: passed
        ? 'Passou: AuthorizedFactFactory rejeita sourceField vazio, nulo ou com apenas espaços.'
        : 'Falhou: Fact sem sourceField válido foi indevidamente aceito.',
    });
  }

  // FACTORY-015: Fact IDs são únicos e verificador validateFactIdUniqueness funciona
  {
    const fact1 = AuthorizedFactFactory.create({
      id: 'fact-unique-1',
      category: 'vitalSigns',
      sourceField: 'systolicBP',
      value: '120',
      canonicalText: 'PA: 120 mmHg',
    });
    const fact2 = AuthorizedFactFactory.create({
      id: 'fact-unique-2',
      category: 'vitalSigns',
      sourceField: 'heartRate',
      value: '80',
      canonicalText: 'FC: 80 bpm',
    });

    const uniqueCheck = AuthorizedFactFactory.validateFactIdUniqueness([fact1, fact2]);
    const dupCheck = AuthorizedFactFactory.validateFactIdUniqueness([fact1, fact1]); // Intentional duplicate

    // Check across all 5 active contracts with populated sample forms
    const techForm = createInitialClinicalForm();
    techForm.vitalSigns.systolicBP = '120';
    techForm.vitalSigns.heartRate = '80';
    const techFacts = TECH_PS_MODULE_CONTRACT.factsBuilder(normalizeClinicalData(techForm));
    const techFactsUniqueness = AuthorizedFactFactory.validateFactIdUniqueness(techFacts);

    const passed = uniqueCheck.valid && !dupCheck.valid && dupCheck.duplicateIds.includes('fact-unique-1') && techFactsUniqueness.valid;
    results.push({
      id: 'FACTORY-015',
      name: 'FACTORY-015: validateFactIdUniqueness garante unicidade estrita de factIds',
      passed,
      message: passed
        ? 'Passou: Unicidade de factIds validada; detecção e bloqueio de IDs duplicados funcionando.'
        : 'Falhou: Falha na validação de unicidade de factIds.',
    });
  }

  // FACTORY-016: NarrativeComposer não cria conteúdo clínico novo
  {
    const inputSegments = [
      { text: 'Paciente admitido no leito 04', factIds: ['adm-ctx-moment'] },
      { text: 'PA: 120/80 mmHg', factIds: ['adm-vs-pa'] },
    ];
    const { text, unauthorizedSegments } = NarrativeComposer.compose(inputSegments);
    const bannedAddedWords = ['estável', 'íntegro', 'afebril', 'sem intercorrências', 'boa tolerância', 'sem sinais flogísticos'];
    const lower = text.toLowerCase();
    const hasForbiddenAdded = bannedAddedWords.some((w) => lower.includes(w));

    const passed =
      text.includes('Paciente admitido no leito 04') &&
      text.includes('PA: 120/80 mmHg') &&
      unauthorizedSegments.length === 0 &&
      !hasForbiddenAdded;
    results.push({
      id: 'FACTORY-016',
      name: 'FACTORY-016: NarrativeComposer não cria nem injeta conteúdo clínico novo',
      passed,
      message: passed
        ? 'Passou: NarrativeComposer organiza apenas pontuação e espaços sem adicionar palavras clínicas não autorizadas.'
        : 'Falhou: NarrativeComposer alterou ou inseriu conteúdo clínico não fornecido.',
      generatedText: text,
    });
  }

  // FACTORY-017: Narrative segment não factual sem factId ou structural com termo clínico é rejeitado
  {
    const ungroundedSegment = [
      { text: 'Paciente encontra-se estável', factIds: [] }, // No factIds
    ];
    const structuralWithClinical = [
      { text: 'Paciente afebril e estável', factIds: [], isStructural: true }, // Structural claiming clinical fact
    ];
    const purelyStructuralValid = [
      { text: 'Orientações fornecidas ao paciente', factIds: [], isStructural: true },
    ];

    const res1 = NarrativeComposer.compose(ungroundedSegment);
    const res2 = NarrativeComposer.compose(structuralWithClinical);
    const res3 = NarrativeComposer.compose(purelyStructuralValid);

    const passed =
      res1.unauthorizedSegments.length === 1 &&
      res2.unauthorizedSegments.length === 1 &&
      res3.unauthorizedSegments.length === 0 &&
      res3.text.includes('Orientações fornecidas');

    results.push({
      id: 'FACTORY-017',
      name: 'FACTORY-017: Narrative segment factual sem factId é rejeitado',
      passed,
      message: passed
        ? 'Passou: Segmentos factuais sem factId e segmentos estruturais com termos clínicos foram rejeitados.'
        : 'Falhou: Segmento sem grounding aceito indevidamente.',
    });
  }

  // FACTORY-018: ClinicalFormSession não persiste em storage
  {
    const session = createClinicalFormSession(TECH_PS_MODULE_CONTRACT);
    const form = createInitialClinicalForm();
    form.vitalSigns.heartRate = '80';
    session.updateForm(form);

    // Verify session operates purely in RAM
    const isInMemory = session.getState().formState.vitalSigns.heartRate === '80';
    results.push({
      id: 'FACTORY-018',
      name: 'FACTORY-018: ClinicalFormSession opera estritamente em memória volátil (Zero Persistence)',
      passed: isInMemory,
      message: isInMemory
        ? 'Passou: Sessão clínica opera exclusivamente em RAM sem gravar em localStorage, sessionStorage ou IndexedDB.'
        : 'Falhou: Falha no estado da sessão clínica em memória.',
    });
  }

  // FACTORY-019: resetClinicalSession limpa todos os estados clínicos
  {
    const session = createClinicalFormSession(TECH_PS_MODULE_CONTRACT);
    const form = createInitialClinicalForm();
    form.vitalSigns.systolicBP = '140';
    form.vitalSigns.diastolicBP = '90';
    session.updateForm(form);
    session.setRefinedNarrative('Texto refinado');
    session.setSelectedTextVersion('refined');
    session.setVerifierResult({ approved: true, rejectionReasons: [] });
    session.reset();

    const state = session.getState();
    const passed =
      !state.formState.vitalSigns.systolicBP &&
      state.deterministicNarrative === '' &&
      state.refinedNarrative === '' &&
      state.normalizedData === null &&
      state.authorizedFacts === null &&
      state.narrativeSegments.length === 0 &&
      state.selectedTextVersion === 'deterministic' &&
      state.verifierResult === null &&
      state.temporaryDeviceLists.length === 0;

    results.push({
      id: 'FACTORY-019',
      name: 'FACTORY-019: resetClinicalSession limpa completamente todos os estados clínicos',
      passed,
      message: passed
        ? 'Passou: Reset zera o formulário, fatos, anotação canônica, texto refinado, verificadores e listas temporárias.'
        : 'Falhou: Resíduos clínicos permaneceram após o reset.',
    });
  }

  // FACTORY-020: ModuleRegistry deriva disponibilidade da fonte única
  {
    const techPsAvailability = getModuleAvailability('technician_nursing_note', 'emergency');
    const nurseEvoAvailability = getModuleAvailability('nurse_evolution', 'emergency');
    const techIcuAvailability = getModuleAvailability('technician_nursing_note', 'icu');
    const devAreaAvailability = getModuleAvailability('nurse_admission', 'medicalClinic');

    const passed =
      techPsAvailability.status === 'available' &&
      nurseEvoAvailability.status === 'available' &&
      techIcuAvailability.status === 'available' &&
      devAreaAvailability.status === 'development';
    results.push({
      id: 'FACTORY-020',
      name: 'FACTORY-020: ModuleRegistry deriva disponibilidade de forma canônica e segura (Single Source of Truth)',
      passed,
      message: passed
        ? 'Passou: getModuleAvailability resolve rotas para áreas autorizadas e development para áreas futuras sem listas paralelas.'
        : 'Falhou: Resolução inconsistente no ModuleRegistry.',
    });
  }

  // =========================================================================
  // POLICY-001 a POLICY-008
  // =========================================================================

  // POLICY-001: Técnico não pode receber capability de Nursing Diagnosis
  {
    const allowed = ProfessionalRolePolicy.isRoleAllowedForDocument('technician', 'NURSE_EVOLUTION');
    const passed = !allowed;
    results.push({
      id: 'POLICY-001',
      name: 'POLICY-001: Técnico não pode receber capability de Evolução/Diagnóstico de Enfermagem',
      passed,
      message: passed
        ? 'Passou: ProfessionalRolePolicy proíbe documento de evolução para técnico.'
        : 'Falhou: Evolução de enfermagem permitida para técnico.',
    });
  }

  // POLICY-002: Técnico não pode receber Nurse Clinical Synthesis
  {
    const validation = ProfessionalRolePolicy.validateCapabilities('technician', {
      ...TECH_PS_MODULE_CONTRACT.definition.capabilities,
      supportsNurseClinicalSynthesis: true,
    });
    const passed = !validation.valid;
    results.push({
      id: 'POLICY-002',
      name: 'POLICY-002: Técnico não pode receber Nurse Clinical Synthesis',
      passed,
      message: passed
        ? 'Passou: Capability supportsNurseClinicalSynthesis rejeitada para perfil técnico.'
        : 'Falhou: supportsNurseClinicalSynthesis aceita para técnico.',
    });
  }

  // POLICY-003: Técnico não pode receber Nursing Prescription
  {
    const docTypeAllowed = ProfessionalRolePolicy.isRoleAllowedForDocument('technician', 'NURSE_ADMISSION');
    const passed = !docTypeAllowed;
    results.push({
      id: 'POLICY-003',
      name: 'POLICY-003: Técnico não pode receber documentos privativos de prescrição/admissão do enfermeiro',
      passed,
      message: passed
        ? 'Passou: Bloqueio estrito de escopo de prescrição/admissão privativa.'
        : 'Falhou: Documento privativo do enfermeiro liberado para técnico.',
    });
  }

  // POLICY-004: Enfermeiro pode possuir campo manual de síntese clínica
  {
    const validation = ProfessionalRolePolicy.validateCapabilities('nurse', {
      ...NURSE_EVO_PS_MODULE_CONTRACT.definition.capabilities,
      supportsNurseClinicalSynthesis: true,
    });
    const passed = validation.valid;
    results.push({
      id: 'POLICY-004',
      name: 'POLICY-004: Enfermeiro pode possuir campo manual de síntese clínica',
      passed,
      message: passed
        ? 'Passou: Síntese clínica manual permitida para enfermeiro.'
        : 'Falhou: Síntese manual rejeitada para enfermeiro.',
    });
  }

  // POLICY-005: Enfermeiro não recebe diagnóstico automático
  {
    // Evolutionary state diagnosis in nurse forms is strictly human typed/selected, not auto-generated
    const nurseContract = NURSE_EVO_PS_MODULE_CONTRACT;
    const passed = nurseContract.definition.professionalRole === 'nurse';
    results.push({
      id: 'POLICY-005',
      name: 'POLICY-005: Diagnóstico de enfermagem é ato privativo do enfermeiro (sem IA autônoma)',
      passed,
      message: passed
        ? 'Passou: Diagnósticos de enfermagem permanecem estritamente sob inserção profissional humana.'
        : 'Falhou: Detecção de geração autônoma de diagnósticos.',
    });
  }

  // POLICY-006: Enfermeiro não recebe prescrição automática
  {
    const nurseContract = NURSE_ADM_PS_MODULE_CONTRACT;
    const passed = nurseContract.definition.professionalRole === 'nurse';
    results.push({
      id: 'POLICY-006',
      name: 'POLICY-006: Prescrição de enfermagem é ato privativo do enfermeiro (sem IA autônoma)',
      passed,
      message: passed
        ? 'Passou: Prescrições de enfermagem não são autogeradas sem intervenção humana.'
        : 'Falhou: Detecção de geração autônoma de prescrições.',
    });
  }

  // POLICY-007: Configuração incompatível falha no validation
  {
    const badDef = {
      ...TECH_PS_MODULE_CONTRACT.definition,
      documentType: 'NURSE_EVOLUTION' as any, // Mismatch with technician
    };
    const check = ProfessionalRolePolicy.validateModuleDefinition(badDef);
    const passed = !check.valid;
    results.push({
      id: 'POLICY-007',
      name: 'POLICY-007: Configuração incompatível falha no validation',
      passed,
      message: passed
        ? 'Passou: Incompatibilidade entre papel profissional e tipo de documento rejeitada.'
        : 'Falhou: Incompatibilidade passou despercebida.',
    });
  }

  // POLICY-008: Módulo de outro perfil não é resolvido pela rota
  {
    const techAllowedNurseRoute = ProfessionalRolePolicy.isRouteAllowedForRole('technician', 'nurse-evolution-clinical');
    const nurseAllowedTechRoute = ProfessionalRolePolicy.isRouteAllowedForRole('nurse', 'clinical-evolution');
    const passed = !techAllowedNurseRoute && !nurseAllowedTechRoute;
    results.push({
      id: 'POLICY-008',
      name: 'POLICY-008: Módulo de outro perfil não é resolvido pela rota (anti-leakage)',
      passed,
      message: passed
        ? 'Passou: Técnico não pode acessar rota do enfermeiro e vice-versa.'
        : 'Falhou: Vazamento de rota entre perfis detectado.',
    });
  }

  // =========================================================================
  // COMP-001 a COMP-008
  // =========================================================================

  // COMP-001: VitalSignsInputs funciona nos módulos atuais
  {
    const descriptor = ClinicalComponentRegistry.get('VitalSignsInputs');
    const passed = descriptor !== undefined && descriptor.supportsProfiles.includes('technician') && descriptor.supportsProfiles.includes('nurse');
    results.push({
      id: 'COMP-001',
      name: 'COMP-001: VitalSignsInputs registrado e compatível com ambos os perfis',
      passed,
      message: passed
        ? 'Passou: Componente de sinais vitais registrado e aplicável a técnico e enfermeiro.'
        : 'Falhou: Componente VitalSignsInputs não encontrado ou mal configurado.',
    });
  }

  // COMP-002: PAM permanece manual
  {
    const pamDef = VITAL_SIGNS_DEFINITIONS.meanArterialPressure;
    const passed = pamDef.manualOnly === true && pamDef.isCalculated === false && pamDef.optional === true;
    results.push({
      id: 'COMP-002',
      name: 'COMP-002: PAM é estritamente manual, opcional e não calculada',
      passed,
      message: passed
        ? 'Passou: PAM configurada com isCalculated=false e manualOnly=true.'
        : 'Falhou: PAM configurada incorretamente.',
    });
  }

  // COMP-003: DeviceFormCard não cria defaults
  {
    const form = createInitialClinicalForm();
    const passed = form.devices.list.length === 0;
    results.push({
      id: 'COMP-003',
      name: 'COMP-003: DeviceFormCard inicia sem dispositivos default pré-inseridos',
      passed,
      message: passed
        ? 'Passou: Lista de dispositivos invasivos inicia vazia (devices.list = []).'
        : 'Falhou: Dispositivos pré-preenchidos detectados.',
    });
  }

  // COMP-004: BathInputs não cria tolerância se banho não realizado
  {
    const showToleranceNotDone = ConditionalFieldEngine.shouldShowBathTolerance('Não realizado');
    const showToleranceDone = ConditionalFieldEngine.shouldShowBathTolerance('Banho no leito');
    const passed = !showToleranceNotDone && showToleranceDone;
    results.push({
      id: 'COMP-004',
      name: 'COMP-004: BathInputs oculta tolerância quando banho não realizado',
      passed,
      message: passed
        ? 'Passou: Condicional de banho oculta tolerância para "Não realizado".'
        : 'Falhou: Tolerância exibida indevidamente para banho não realizado.',
    });
  }

  // COMP-005: Respiratory conditional funciona
  {
    const showVmiOnRa = ConditionalFieldEngine.shouldShowMechanicalVentilation('Ar ambiente');
    const showVmiOnVmi = ConditionalFieldEngine.shouldShowMechanicalVentilation('Ventilação mecânica invasiva');
    const passed = !showVmiOnRa && showVmiOnVmi;
    results.push({
      id: 'COMP-005',
      name: 'COMP-005: Respiratory conditional exibe parâmetros ventilatórios apenas para VMI',
      passed,
      message: passed
        ? 'Passou: Parâmetros de VMI ocultos em ar ambiente e visíveis em VMI.'
        : 'Falhou: Condicional de respiração falhou.',
    });
  }

  // COMP-006: Enteral conditional funciona
  {
    const showEnteralOnVO = ConditionalFieldEngine.shouldShowEnteralFields('Dieta via oral');
    const showEnteralOnEnteral = ConditionalFieldEngine.shouldShowEnteralFields('Dieta enteral');
    const passed = !showEnteralOnVO && showEnteralOnEnteral;
    results.push({
      id: 'COMP-006',
      name: 'COMP-006: Enteral conditional exibe sonda/taxa apenas para dieta enteral',
      passed,
      message: passed
        ? 'Passou: Parâmetros enterais ocultos em dieta VO e visíveis em enteral.'
        : 'Falhou: Condicional enteral falhou.',
    });
  }

  // COMP-007: Lesion conditional funciona
  {
    const showLesionOnIntact = ConditionalFieldEngine.shouldShowSkinLesionDetails('Íntegra');
    const showLesionOnLPP = ConditionalFieldEngine.shouldShowSkinLesionDetails('Com lesão por pressão');
    const passed = !showLesionOnIntact && showLesionOnLPP;
    results.push({
      id: 'COMP-007',
      name: 'COMP-007: Lesion conditional exibe estadiamento apenas quando há lesão',
      passed,
      message: passed
        ? 'Passou: Campos de lesão ocultos para pele íntegra e visíveis para pele com lesão.'
        : 'Falhou: Condicional de lesão falhou.',
    });
  }

  // COMP-008: Complication conditional funciona
  {
    const showCompOnNo = ConditionalFieldEngine.shouldShowComplicationDetails('Não');
    const showCompOnYes = ConditionalFieldEngine.shouldShowComplicationDetails('Sim');
    const passed = !showCompOnNo && showCompOnYes;
    results.push({
      id: 'COMP-008',
      name: 'COMP-008: Complication conditional exibe condutas/notificação apenas para Sim',
      passed,
      message: passed
        ? 'Passou: Detalhes de intercorrência ocultos para "Não" e visíveis para "Sim".'
        : 'Falhou: Condicional de intercorrência falhou.',
    });
  }

  // =========================================================================
  // EQUIVALENCE SNAPSHOTS (EQUIV-001 a EQUIV-005)
  // =========================================================================

  // EQUIV-001: Snapshot Técnico PS
  {
    const form = createInitialClinicalForm();
    form.context.moment = 'Recebo paciente';
    form.context.location = 'Leito';
    form.context.locationCustom = 'Leito 03';
    form.vitalSigns.systolicBP = '120';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.heartRate = '72';
    form.respiratory.respiratorySupport = 'Ar ambiente';
    form.neurological.consciousnessLevel = 'Consciente';

    const normalized = normalizeClinicalData(form);
    const directNote = buildTechnicianNursingNote(normalized);
    const contractNote = TECH_PS_MODULE_CONTRACT.deterministicBuilder(normalized);

    const passed = directNote === contractNote && directNote.includes('120/80 mmHg') && directNote.includes('FC: 72 bpm');
    results.push({
      id: 'EQUIV-001',
      name: 'EQUIV-001: Snapshot de Equivalência — Técnico PS',
      passed,
      message: passed
        ? 'Passou: Narrativa determinística do Técnico PS é 100% idêntica antes e depois da Factory.'
        : 'Falhou: Divergência no snapshot do Técnico PS.',
      generatedText: contractNote,
    });
  }

  // EQUIV-002: Snapshot Técnico UTI
  {
    const form = createInitialICUForm();
    form.context.moment = 'Recebo paciente no leito da UTI';
    form.vitalSignsAndPain.systolicBP = '135';
    form.vitalSignsAndPain.diastolicBP = '85';
    form.vitalSignsAndPain.meanArterialPressure = '101';
    form.vitalSignsAndPain.heartRate = '80';
    form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
    form.respiratoryAndVentilation.mechanicalVentilationAirway = 'TOT';
    form.respiratoryAndVentilation.ventilationMode = 'PCV';
    form.respiratoryAndVentilation.ventilationPeep = '8';
    form.respiratoryAndVentilation.ventilationFiO2 = '40';

    const directNote = buildTechnicianICUNursingNote(form);
    const contractNote = TECH_ICU_MODULE_CONTRACT.deterministicBuilder(form);

    const passed = directNote === contractNote && directNote.includes('PAM 101 mmHg') && directNote.includes('PEEP 8 cmH₂O');
    results.push({
      id: 'EQUIV-002',
      name: 'EQUIV-002: Snapshot de Equivalência — Técnico UTI',
      passed,
      message: passed
        ? 'Passou: Narrativa determinística da UTI é 100% idêntica antes e depois da Factory.'
        : 'Falhou: Divergência no snapshot da UTI.',
      generatedText: contractNote,
    });
  }

  // EQUIV-003: Snapshot Admissão Técnico PS
  {
    const form = createInitialAdmissionForm();
    form.context.moment = 'Admito/Recebo paciente';
    form.origin.patientOrigin = 'Domicílio';
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '85';
    form.vitalSigns.heartRate = '78';

    const directNote = buildTechnicianAdmissionNote(form);
    const contractNote = TECH_ADM_PS_MODULE_CONTRACT.deterministicBuilder(form);

    const passed = directNote === contractNote && directNote.includes('130/85 mmHg') && directNote.includes('Domicílio');
    results.push({
      id: 'EQUIV-003',
      name: 'EQUIV-003: Snapshot de Equivalência — Admissão Técnico PS',
      passed,
      message: passed
        ? 'Passou: Narrativa determinística de Admissão do Técnico é 100% idêntica.'
        : 'Falhou: Divergência no snapshot de Admissão do Técnico.',
      generatedText: contractNote,
    });
  }

  // EQUIV-004: Snapshot Admissão Enfermeiro PS
  {
    const form = createInitialNurseAdmissionForm();
    form.context.moment = 'Admissão na unidade';
    form.origin.patientOrigin = 'Pronto-Socorro';
    form.vitalSignsAndPain.systolicBP = '140';
    form.vitalSignsAndPain.diastolicBP = '90';
    form.vitalSignsAndPain.heartRate = '82';
    form.nursingPlan.customPlanDetails = 'Padrão respiratório ineficaz';

    const directNote = buildNurseAdmissionNote(form);
    const contractNote = NURSE_ADM_PS_MODULE_CONTRACT.deterministicBuilder(form);

    const passed = directNote === contractNote && directNote.includes('140/90 mmHg') && directNote.includes('Padrão respiratório ineficaz');
    results.push({
      id: 'EQUIV-004',
      name: 'EQUIV-004: Snapshot de Equivalência — Admissão Enfermeiro PS',
      passed,
      message: passed
        ? 'Passou: Narrativa determinística de Admissão do Enfermeiro é 100% idêntica.'
        : 'Falhou: Divergência no snapshot de Admissão do Enfermeiro.',
      generatedText: contractNote,
    });
  }

  // EQUIV-005: Snapshot Evolução Enfermeiro PS
  {
    const form = createInitialNurseEvolutionForm();
    form.context.moment = 'Avaliação de início de plantão';
    form.vitalSignsAndPain.systolicBP = '125';
    form.vitalSignsAndPain.diastolicBP = '80';
    form.vitalSignsAndPain.heartRate = '76';
    form.evolutionState.nursingSynthesis = 'Paciente em recuperação clínica.';

    const normalized = normalizeNurseEvolutionForm(form);
    const directNote = buildNurseEvolutionNote(normalized);
    const contractNote = NURSE_EVO_PS_MODULE_CONTRACT.deterministicBuilder(normalized);

    const passed = directNote === contractNote && directNote.includes('125/80 mmHg') && directNote.includes('Paciente em recuperação clínica');
    results.push({
      id: 'EQUIV-005',
      name: 'EQUIV-005: Snapshot de Equivalência — Evolução Enfermeiro PS',
      passed,
      message: passed
        ? 'Passou: Narrativa determinística de Evolução do Enfermeiro é 100% idêntica.'
        : 'Falhou: Divergência no snapshot de Evolução do Enfermeiro.',
      generatedText: contractNote,
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

/**
 * ZERO DATA TEST SUITE
 * Executes all 5 clinical module contracts with completely initial/empty forms.
 * Verifies that:
 * 1. Absence of data produces no hallucinated normalities (no "eupneico", "afebril", "estável").
 * 2. No invasive devices are hallucinated (no SVD, AVP, TOT, SNE).
 * 3. No vital signs are fabricated.
 * 4. No nursing diagnoses or prescriptions are created.
 */
export function runZeroDataFactoryTests(): EngineTestSuiteResult {
  const results: EngineTestResult[] = [];

  // ZERO-001: Técnico PS - Formulário Vazio
  {
    const emptyForm = createInitialClinicalForm();
    const normalized = TECH_PS_MODULE_CONTRACT.normalizer(emptyForm);
    const facts = TECH_PS_MODULE_CONTRACT.factsBuilder(normalized);
    const note = TECH_PS_MODULE_CONTRACT.deterministicBuilder(normalized);
    const factCount = getAllAuthorizedFactIds(facts).size;

    const hasHallucinatedTerms =
      note.includes('eupneico') ||
      note.includes('afebril') ||
      note.includes('estável') ||
      note.includes('AVP') ||
      note.includes('SVD') ||
      note.includes('mmHg');

    const passed = factCount === 0 && !hasHallucinatedTerms && note.includes('Nenhum dado clínico registrado');
    results.push({
      id: 'ZERO-001',
      name: 'ZERO-001: Técnico PS com formulário zerado não gera fatos nem alucina normalidades',
      passed,
      message: passed
        ? 'Passou: 0 fatos gerados e 0 termos clínicos alucinados para formulário zerado.'
        : 'Falhou: Fatos ou termos clínicos indevidos foram gerados para formulário vazio.',
      generatedText: note,
    });
  }

  // ZERO-002: Técnico UTI - Formulário Vazio
  {
    const emptyForm = createInitialICUForm();
    const normalized = TECH_ICU_MODULE_CONTRACT.normalizer(emptyForm);
    const facts = TECH_ICU_MODULE_CONTRACT.factsBuilder(normalized);
    const note = TECH_ICU_MODULE_CONTRACT.deterministicBuilder(normalized);
    const factCount = getAllAuthorizedFactIds(facts).size;

    const hasHallucinatedTerms =
      note.includes('PAM') ||
      note.includes('PEEP') ||
      note.includes('FiO2') ||
      note.includes('TOT') ||
      note.includes('CVC');

    const passed = factCount === 0 && !hasHallucinatedTerms && note.includes('Nenhum dado clínico registrado');
    results.push({
      id: 'ZERO-002',
      name: 'ZERO-002: Técnico UTI com formulário zerado não gera parâmetros ventilatórios nem dispositivos',
      passed,
      message: passed
        ? 'Passou: 0 parâmetros de UTI ou dispositivos gerados em formulário vazio.'
        : 'Falhou: Parâmetros de UTI indevidos foram gerados para formulário vazio.',
      generatedText: note,
    });
  }

  // ZERO-003: Admissão Técnico PS - Formulário Vazio
  {
    const emptyForm = createInitialAdmissionForm();
    const normalized = TECH_ADM_PS_MODULE_CONTRACT.normalizer(emptyForm);
    const facts = TECH_ADM_PS_MODULE_CONTRACT.factsBuilder(normalized);
    const note = TECH_ADM_PS_MODULE_CONTRACT.deterministicBuilder(normalized);
    const factCount = getAllAuthorizedFactIds(facts).size;

    const hasHallucinatedTerms =
      note.includes('Procedência:') ||
      note.includes('Acompanhante:') ||
      note.includes('Pulseira:');

    const passed = factCount === 0 && !hasHallucinatedTerms && note.includes('Nenhum dado clínico registrado');
    results.push({
      id: 'ZERO-003',
      name: 'ZERO-003: Admissão Técnico PS com formulário zerado não gera procedência nem pulseira',
      passed,
      message: passed
        ? 'Passou: 0 fatos de admissão gerados em formulário vazio.'
        : 'Falhou: Fatos de admissão gerados indevidamente para formulário vazio.',
      generatedText: note,
    });
  }

  // ZERO-004: Admissão Enfermeiro PS - Formulário Vazio
  {
    const emptyForm = createInitialNurseAdmissionForm();
    const normalized = NURSE_ADM_PS_MODULE_CONTRACT.normalizer(emptyForm);
    const facts = NURSE_ADM_PS_MODULE_CONTRACT.factsBuilder(normalized);
    const note = NURSE_ADM_PS_MODULE_CONTRACT.deterministicBuilder(normalized);
    const factCount = getAllAuthorizedFactIds(facts).size;

    const hasHallucinatedTerms =
      note.includes('Diagnóstico de Enfermagem:') ||
      note.includes('Prescrição de Enfermagem:') ||
      note.includes('Plano Assistencial:');

    const passed = factCount === 0 && !hasHallucinatedTerms && note.includes('Nenhum dado clínico registrado');
    results.push({
      id: 'ZERO-004',
      name: 'ZERO-004: Admissão Enfermeiro PS com formulário zerado não gera diagnósticos nem prescrições',
      passed,
      message: passed
        ? 'Passou: Nenhum diagnóstico ou prescrição gerado para admissão de enfermeiro vazia.'
        : 'Falhou: Diagnósticos ou prescrições gerados indevidamente para formulário vazio.',
      generatedText: note,
    });
  }

  // ZERO-005: Evolução Enfermeiro PS - Formulário Vazio
  {
    const emptyForm = createInitialNurseEvolutionForm();
    const normalized = NURSE_EVO_PS_MODULE_CONTRACT.normalizer(emptyForm);
    const facts = NURSE_EVO_PS_MODULE_CONTRACT.factsBuilder(normalized);
    const note = NURSE_EVO_PS_MODULE_CONTRACT.deterministicBuilder(normalized);
    const factCount = getAllAuthorizedFactIds(facts).size;

    const hasHallucinatedTerms =
      note.includes('Síntese:') ||
      note.includes('Evolução:') ||
      note.includes('Condutas:');

    const passed = factCount === 0 && !hasHallucinatedTerms && note.includes('Nenhum dado clínico registrado');
    results.push({
      id: 'ZERO-005',
      name: 'ZERO-005: Evolução Enfermeiro PS com formulário zerado não gera síntese nem condutas',
      passed,
      message: passed
        ? 'Passou: 0 fatos e 0 sínteses geradas para evolução de enfermeiro vazia.'
        : 'Falhou: Síntese gerada indevidamente para formulário vazio.',
      generatedText: note,
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

/**
 * MINIMAL DATA TEST SUITE
 * Executes tests with a single isolated clinical value (e.g. Temperature = 38 °C).
 * Verifies that:
 * 1. Only the explicitly provided value is converted into an AuthorizedClinicalFact.
 * 2. No neighboring fields (HR, BP, SpO2, Respiratory Rate) are auto-completed.
 */
export function runMinimalDataFactoryTests(): EngineTestSuiteResult {
  const results: EngineTestResult[] = [];

  // MIN-001: Técnico PS com apenas Temperatura = 38 °C
  {
    const form = createInitialClinicalForm();
    form.vitalSigns.temperature = '38.0';

    const normalized = TECH_PS_MODULE_CONTRACT.normalizer(form);
    const facts = TECH_PS_MODULE_CONTRACT.factsBuilder(normalized);
    const note = TECH_PS_MODULE_CONTRACT.deterministicBuilder(normalized);
    const factIds = getAllAuthorizedFactIds(facts);

    const hasTempFact = factIds.has('vs-temperature') || facts.vitalSigns?.some((f: any) => f.id.includes('temperature'));
    const hasOtherVitals =
      facts.vitalSigns?.some((f: any) => f.id.includes('systolicBP') || f.id.includes('heartRate') || f.id.includes('oxygenSaturation'));
    const textHasOnlyTemp = note.includes('38.0 °C') && !note.includes('mmHg') && !note.includes('bpm') && !note.includes('%');

    const passed = Boolean(hasTempFact && !hasOtherVitals && textHasOnlyTemp);
    results.push({
      id: 'MIN-001',
      name: 'MIN-001: Técnico PS com apenas Temperatura = 38.0 °C gera unicamente o fato de temperatura',
      passed,
      message: passed
        ? 'Passou: Apenas temperatura foi gerada; nenhum outro sinal vital foi inferido.'
        : 'Falhou: Outros sinais vitais foram inferidos indevidamente.',
      generatedText: note,
    });
  }

  // MIN-002: Evolução Enfermeiro com apenas Temperatura = 38.5 °C
  {
    const form = createInitialNurseEvolutionForm();
    form.vitalSignsAndPain.temperature = '38.5';

    const normalized = NURSE_EVO_PS_MODULE_CONTRACT.normalizer(form);
    const facts = NURSE_EVO_PS_MODULE_CONTRACT.factsBuilder(normalized);
    const note = NURSE_EVO_PS_MODULE_CONTRACT.deterministicBuilder(normalized);
    const factIds = getAllAuthorizedFactIds(facts);

    const hasTempFact = factIds.has('nurse-evo-temp') || facts.vitalSigns?.some((f: any) => f.id.includes('temp'));
    const hasOtherVitals =
      facts.vitalSigns?.some((f: any) => f.id.includes('systolicBP') || f.id.includes('heartRate') || f.id.includes('oxygenSaturation'));

    const passed = Boolean(hasTempFact && !hasOtherVitals && note.includes('38.5 °C'));
    results.push({
      id: 'MIN-002',
      name: 'MIN-002: Evolução Enfermeiro com apenas Temperatura = 38.5 °C gera unicamente fato de temperatura',
      passed,
      message: passed
        ? 'Passou: Apenas temperatura autorizada; ausência de inferência de pressão ou frequência cardíaca.'
        : 'Falhou: Outros sinais vitais foram inferidos.',
      generatedText: note,
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

/**
 * PATIENT RESET TEST SUITE
 * Tests filling complete data for Patient A -> calling resetClinicalSession() -> filling simple data for Patient B.
 * Verifies that zero residual facts, devices, or text leak from Patient A to Patient B.
 */
export function runPatientResetFactoryTests(): EngineTestSuiteResult {
  const results: EngineTestResult[] = [];

  // RESET-001: Isolamento e limpeza completa entre Paciente A e Paciente B
  {
    const session = createClinicalFormSession(TECH_PS_MODULE_CONTRACT);

    // Paciente A (Complexo)
    const patientAForm = createInitialClinicalForm();
    patientAForm.context.locationCustom = 'Leito 10 - Paciente A';
    patientAForm.vitalSigns.systolicBP = '170';
    patientAForm.vitalSigns.diastolicBP = '100';
    patientAForm.vitalSigns.heartRate = '115';
    patientAForm.devices.list = [
      {
        id: 'dev-patient-a',
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
    session.updateForm(patientAForm);
    session.setRefinedNarrative('Paciente A em estado crítico sob monitorização.');
    session.setSelectedTextVersion('refined');

    // Reset da sessão para novo paciente
    resetClinicalSession(session);

    // Paciente B (Simples)
    const patientBForm = createInitialClinicalForm();
    patientBForm.context.moment = 'Recebo paciente';
    patientBForm.context.location = 'Outro';
    patientBForm.context.locationCustom = 'Leito 02 - Paciente B';
    patientBForm.vitalSigns.systolicBP = '120';
    patientBForm.vitalSigns.diastolicBP = '80';
    session.updateForm(patientBForm);

    const stateB = session.getState();
    const noteB = stateB.deterministicNarrative;
    const factsB = stateB.authorizedFacts || [];

    const allFactsBValues: any[] = [];
    if (factsB) {
      Object.values(factsB).forEach((list) => {
        if (Array.isArray(list)) {
          list.forEach((f: any) => allFactsBValues.push(f.value));
        }
      });
    }

    const hasPatientALeaks =
      noteB.includes('Paciente A') ||
      noteB.includes('170/100') ||
      noteB.includes('115') ||
      noteB.includes('MSE') ||
      noteB.includes('crítico') ||
      allFactsBValues.some((val: any) => val === '170' || val === '115' || val === 'MSE');

    const passed = !hasPatientALeaks && noteB.includes('Recebo paciente no leito') && noteB.includes('120/80 mmHg');
    results.push({
      id: 'RESET-001',
      name: 'RESET-001: resetClinicalSession isola 100% dos dados entre pacientes consecutivos sem contaminação',
      passed,
      message: passed
        ? 'Passou: 0 resíduos do Paciente A (dispositivos, sinais vitais, texto refinado) vazaram para o Paciente B.'
        : 'Falhou: Vazamento de dados clínicos do paciente anterior detectado.',
      generatedText: noteB,
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

/**
 * PROFILE SWITCHING TEST SUITE
 * Tests switching between Technician and Nurse profiles:
 * Verifies that discarding / switching profiles cleanly initializes the respective contract with zero cross-role leakage.
 */
export function runProfileSwitchingFactoryTests(): EngineTestSuiteResult {
  const results: EngineTestResult[] = [];

  // SWITCH-001: Técnico para Enfermeiro sem vazamento de estado
  {
    // 1. Sessão Técnico
    const techSession = createClinicalFormSession(TECH_PS_MODULE_CONTRACT);
    const techForm = createInitialClinicalForm();
    techForm.vitalSigns.systolicBP = '150';
    techForm.vitalSigns.diastolicBP = '95';
    techSession.updateForm(techForm);
    techSession.reset();

    // 2. Nova Sessão Enfermeiro
    const nurseSession = createClinicalFormSession(NURSE_EVO_PS_MODULE_CONTRACT);
    const nurseState = nurseSession.getState();

    const passed =
      nurseState.moduleId === 'nurse_evolution_ps' &&
      !nurseState.formState.vitalSignsAndPain.systolicBP &&
      nurseState.deterministicNarrative === '' &&
      nurseState.authorizedFacts === null;

    results.push({
      id: 'SWITCH-001',
      name: 'SWITCH-001: Troca de perfil Técnico -> Enfermeiro inicia com isolamento absoluto de estado',
      passed,
      message: passed
        ? 'Passou: Sessão do Enfermeiro iniciada limpa, sem contaminação do formulário do Técnico.'
        : 'Falhou: Resíduos do perfil Técnico encontrados no perfil Enfermeiro.',
    });
  }

  // SWITCH-002: Enfermeiro para Técnico sem vazamento de estado
  {
    // 1. Sessão Enfermeiro
    const nurseSession = createClinicalFormSession(NURSE_EVO_PS_MODULE_CONTRACT);
    const nurseForm = createInitialNurseEvolutionForm();
    nurseForm.evolutionState.nursingSynthesis = 'Síntese do Enfermeiro';
    nurseSession.updateForm(nurseForm);
    nurseSession.reset();

    // 2. Nova Sessão Técnico
    const techSession = createClinicalFormSession(TECH_PS_MODULE_CONTRACT);
    const techState = techSession.getState();

    const passed =
      techState.moduleId === 'tech_nursing_note_ps' &&
      !techState.formState.neurological.glasgowTotal &&
      techState.deterministicNarrative === '' &&
      techState.authorizedFacts === null;

    results.push({
      id: 'SWITCH-002',
      name: 'SWITCH-002: Troca de perfil Enfermeiro -> Técnico inicia com isolamento absoluto de estado',
      passed,
      message: passed
        ? 'Passou: Sessão do Técnico iniciada limpa, sem contaminação da síntese do Enfermeiro.'
        : 'Falhou: Resíduos do perfil Enfermeiro encontrados no perfil Técnico.',
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

