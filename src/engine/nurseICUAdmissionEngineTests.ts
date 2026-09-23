import { EngineTestOutcome, EngineTestSummary } from './types';
import {
  createInitialNurseICUAdmissionForm,
  NurseICUAdmissionForm,
} from '../types/nurseICUAdmission';
import {
  buildAuthorizedNurseICUAdmissionFacts,
  normalizeNurseICUAdmissionForm,
  validateNurseICUAdmissionConsistency,
  auditNurseICUAdmissionNarrative,
} from './nurseICUAdmissionFactBuilder';
import {
  NurseICUAdmissionBuilder,
  buildNurseICUAdmissionNote,
  buildNurseICUAdmissionNoteWithTrace,
} from './nurseICUAdmissionNoteBuilder';
import { verifyNurseICUAdmissionAIRefinedResponse } from './nurseICUAdmissionPostGenerationVerifier';
import { verifyICUAdmissionFactLock } from './icuAdmissionFactLock';
import {
  CLINICAL_MODULE_CONTRACTS,
  NURSE_ADMISSION_ICU_CONTRACT,
} from './factory/moduleDefinitions';
import { NURSE_ADMISSION_ICU } from './factory/nurseICUAdmissionModule';
import { MODULE_REGISTRY } from './moduleRegistry';
import { ProfessionalRolePolicy } from './factory/professionalRolePolicy';

/**
 * Creates a rich, realistic sample form for Nurse ICU Admission.
 */
export function createSampleNurseICUAdmissionForm(): NurseICUAdmissionForm {
  const form = createInitialNurseICUAdmissionForm();

  // 1. Contexto da admissão
  form.admissionContext.moment = 'Admito paciente';
  form.admissionContext.bedLocation = 'Box 03';

  // 2. Origem / procedência
  form.origin.patientOrigin = 'PS';
  form.origin.originDetails = 'Transferência interna do setor de emergência';

  // 3. Transporte e chegada
  form.arrivalTransport.arrivalMode = 'maca';
  form.arrivalTransport.transportSupport = 'oxigenoterapia sob máscara e monitorização contínua';

  // 4. Identificação e segurança
  form.safetyIdentification.wristbandChecked = 'Sim';
  form.safetyIdentification.bedSignChecked = 'Sim';

  // 5. Acompanhante
  form.companion.companionType = 'familiar';

  // 6. Alergias
  form.allergies.hasAllergies = 'Nega';

  // 7. Precauções / isolamento
  form.precautions.precautionType = 'Padrão';

  // 8. Motivo informado da internação
  form.admissionReason.reasonText = 'Insuficiência respiratória aguda e necessidade de suporte intensivo';

  // 9. Histórico informado
  form.reportedHistory.pastHistoryText = 'Nega cirurgias prévias';
  form.reportedHistory.comorbidities = 'HAS e Diabetes Mellitus tipo 2';
  form.reportedHistory.homeMedications = 'Losartana 50mg/dia e Metformina 850mg 2x/dia';

  // 10. Avaliação geral
  form.generalAssessment.generalState = 'Grave';
  form.generalAssessment.complaints = 'Não contactante';

  // 11. Nível de consciência
  form.neurologicalState.consciousness = 'sedado';

  // 12. Glasgow
  form.glasgow.score = 'Não avaliável (sedado/intubado)';

  // 13. RASS
  form.rass.score = '-4';

  // 14. Pupilas
  form.pupils.equality = 'isocóricas';
  form.pupils.reactivity = 'fotorreagentes';

  // 15. Dor
  form.pain.scale = 'CPOT';
  form.pain.score = '1';
  form.pain.location = 'Geral';

  // 16. Sinais vitais
  form.vitalSigns.systolicBP = '110';
  form.vitalSigns.diastolicBP = '70';
  form.vitalSigns.meanArterialPressure = '83';
  form.vitalSigns.heartRate = '88';
  form.vitalSigns.respiratoryRate = '16';
  form.vitalSigns.oxygenSaturation = '98';
  form.vitalSigns.temperature = '36.6';
  form.vitalSigns.bloodGlucose = '126';

  // 17. Suporte respiratório
  form.respiratorySupport.supportType = 'VMI';

  // 18. Ventilação mecânica invasiva
  form.mechanicalVentilation.airwayType = 'TOT';
  form.mechanicalVentilation.tubeCaliber = '8.0';
  form.mechanicalVentilation.fixationMark = '22 cm';
  form.mechanicalVentilation.ventilationMode = 'VCV';
  form.mechanicalVentilation.fio2 = '40';
  form.mechanicalVentilation.peep = '8';
  form.mechanicalVentilation.tidalVolume = '440';
  form.mechanicalVentilation.respiratoryRateSet = '16';

  // 19. Avaliação cardiovascular
  form.cardiovascularAssessment.perfusion = 'adequada';
  form.cardiovascularAssessment.extremities = 'aquecidas';
  form.cardiovascularAssessment.capillaryRefillTime = '< 2 segundos';
  form.cardiovascularAssessment.edema = 'Ausente';
  form.cardiovascularAssessment.heartRhythm = 'Sinusal ao monitor';

  // 20. Drogas vasoativas
  form.vasoactiveDrugs.hasVasoactiveDrugs = 'Sim';
  form.vasoactiveDrugs.drugs = [
    {
      drugName: 'Noradrenalina',
      concentration: '4mg/250mL SG5%',
      flowRate: '6',
      rateUnit: 'mL/h',
      route: 'CVC',
    },
  ];

  // 21. Sedação e analgesia contínua
  form.sedationAnalgesia.hasSedationAnalgesia = 'Sim';
  form.sedationAnalgesia.continuousInfusions = [
    {
      drugName: 'Fentanil',
      flowRate: '3',
      rateUnit: 'mL/h',
      indication: 'analgesia',
    },
    {
      drugName: 'Midazolam',
      flowRate: '4',
      rateUnit: 'mL/h',
      indication: 'sedação',
    },
  ];

  // 22. Gastrointestinal
  form.gastrointestinal.abdomenAspect = 'plano';
  form.gastrointestinal.bowelSounds = 'presentes';
  form.gastrointestinal.nauseaVomiting = 'ausentes';

  // 23. Nutrição
  form.nutrition.dietType = 'jejum';

  // 24. Eliminações
  form.eliminations.diuresisType = 'SVD';
  form.eliminations.diuresisCharacteristics = 'amarelo claro límpido, débito de 150 mL na chegada';
  form.eliminations.bowelElimination = 'ausente';

  // 25. Balanço hídrico inicial
  form.initialWaterBalance.status = 'Zerado na admissão';
  form.initialWaterBalance.observations = 'Controle horário rigoroso iniciado';

  // 26. Dispositivos invasivos
  form.invasiveDevices.hasInvasiveDevices = 'Sim';
  form.invasiveDevices.devices = [
    {
      deviceType: 'CVC',
      anatomicalSite: 'veia subclávia',
      insertionSide: 'direito',
      permeability: 'permeável',
      functioningStatus: 'em funcionamento',
      dressingCondition: 'oclusivo limpo e seco',
    },
    {
      deviceType: 'SVD',
      anatomicalSite: 'meato uretral',
      permeability: 'permeável',
      functioningStatus: 'em funcionamento',
      dressingCondition: 'fixação em face anterior da coxa',
    },
  ];

  // 27. Pele e integridade cutânea
  form.skinIntegrity.integrity = 'íntegra';

  // 28. Riscos assistenciais
  form.careRisks.risksList = [
    'Risco de queda',
    'Risco de lesão por pressão (LPP)',
    'Risco de broncoaspiração',
    'Risco de perda de dispositivos invasivos',
  ];
  form.careRisks.bedRailsRaised = 'Sim';
  form.careRisks.preventativeMeasures = 'Cabeceira a 30 graus, mudança de decúbito e grades elevadas';

  // 29. Cuidados realizados na admissão
  form.admissionCare.actions = [
    'Instalação de monitorização cardíaca contínua multiparamétrica',
    'Aferição e checagem de sinais vitais na admissão',
    'Conferência de acessos vasculares e dispositivos invasivos',
    'Instalação / conferência de ventilação mecânica',
    'Elevação de cabeceira a 30°',
  ];

  // 30. Intercorrências
  form.complications.hasComplication = 'Não';

  // 31. Comunicação multiprofissional
  form.multiprofessionalCommunication.hasCommunication = 'Sim';
  form.multiprofessionalCommunication.targetTeam = 'médico plantonista da UTI';
  form.multiprofessionalCommunication.reason = 'passagem de plantão e confirmação de metas hemodinâmicas';
  form.multiprofessionalCommunication.observedResponse = 'metas terapêuticas alinhadas sem pendências imediatas';

  // 32. Situação pós-admissão
  form.postAdmissionStatus.patientStatus = 'Permanece no leito em monitorização contínua';
  form.postAdmissionStatus.pendingIssues = 'Aguardando exames laboratoriais admissionais de rotina';

  return form;
}

/**
 * Runs test suite NUR-ADM-ICU-001 through NUR-ADM-ICU-020 and consistency tests.
 */
export function runNurseICUAdmissionEngineTests(): {
  suite: string;
  tests: EngineTestOutcome[];
  summary: EngineTestSummary;
} {
  const tests: EngineTestOutcome[] = [];

  const addTest = (
    id: string,
    name: string,
    passed: boolean,
    details?: string
  ) => {
    tests.push({
      id,
      name,
      passed,
      message: passed ? `Passou: ${name}` : `Falhou: ${name}`,
      details,
    });
  };

  // NUR-ADM-ICU-001: Registro módulo
  const regIcu = MODULE_REGISTRY.nurse_admission.areas.icu;
  addTest(
    'NUR-ADM-ICU-001',
    'Registro módulo: nurse_admission na UTI configurado como available com rota nurse-admission-icu',
    regIcu.status === 'available' && regIcu.route === 'nurse-admission-icu',
    `Status: ${regIcu.status}, Rota: ${regIcu.route}`
  );

  // NUR-ADM-ICU-002: Somente enfermeiro
  const techAllowed = ProfessionalRolePolicy.isRouteAllowedForRole('technician', 'nurse-admission-icu');
  const nurseAllowed = ProfessionalRolePolicy.isRouteAllowedForRole('nurse', 'nurse-admission-icu');
  addTest(
    'NUR-ADM-ICU-002',
    'Somente enfermeiro: bloqueia acesso de técnico e autoriza enfermeiro para nurse-admission-icu',
    !techAllowed && nurseAllowed,
    `Técnico permitido: ${techAllowed}, Enfermeiro permitido: ${nurseAllowed}`
  );

  // NUR-ADM-ICU-003: Contrato válido
  const contractInList = CLINICAL_MODULE_CONTRACTS.some((c) => c.definition.id === 'NURSE_ADMISSION_ICU');
  const contractValid =
    NURSE_ADMISSION_ICU_CONTRACT.definition.id === 'NURSE_ADMISSION_ICU' &&
    NURSE_ADMISSION_ICU_CONTRACT.definition.sections.length === 32 &&
    NURSE_ADMISSION_ICU.capabilities.supportsMechanicalVentilation === true;
  addTest(
    'NUR-ADM-ICU-003',
    'Contrato válido: módulo NURSE_ADMISSION_ICU no catálogo com 32 seções e capabilities corretas',
    contractInList && contractValid,
    `No catálogo: ${contractInList}, Seções: ${NURSE_ADMISSION_ICU_CONTRACT.definition.sections.length}`
  );

  // NUR-ADM-ICU-004: Form vazio
  const emptyForm = createInitialNurseICUAdmissionForm();
  const emptyNorm = normalizeNurseICUAdmissionForm(emptyForm);
  const emptyFacts = buildAuthorizedNurseICUAdmissionFacts(emptyNorm);
  const emptyNote = buildNurseICUAdmissionNote(emptyFacts);
  addTest(
    'NUR-ADM-ICU-004',
    'Form vazio: inicialização, normalização e geração determinística de form em branco executam sem erro',
    Boolean(emptyNote && emptyNote.length > 50),
    `Comprimento da nota em branco: ${emptyNote.length}`
  );

  // Sample form for remaining tests
  const sample = createSampleNurseICUAdmissionForm();
  const sampleNorm = normalizeNurseICUAdmissionForm(sample);
  const sampleFacts = buildAuthorizedNurseICUAdmissionFacts(sampleNorm);
  const { narrative: sampleNote, traces } = buildNurseICUAdmissionNoteWithTrace(sampleFacts);

  // NUR-ADM-ICU-005: Origem preservada
  const originPreserved = sampleNote.includes('Procedência: PS') && sampleNote.includes('Transferência interna');
  addTest(
    'NUR-ADM-ICU-005',
    'Origem preservada: setor de procedência e detalhamento integrados fielmente',
    originPreserved,
    `Encontrado no texto: ${originPreserved}`
  );

  // NUR-ADM-ICU-006: Transporte preservado
  const transportPreserved = sampleNote.includes('maca') && sampleNote.includes('oxigenoterapia sob máscara');
  addTest(
    'NUR-ADM-ICU-006',
    'Transporte preservado: meio de transporte e suporte do trajeto preservados',
    transportPreserved,
    `Encontrado no texto: ${transportPreserved}`
  );

  // NUR-ADM-ICU-007: Glasgow preservado
  const glasgowPreserved = sampleNote.includes('Escala de Coma de Glasgow') && sampleNote.includes('Não avaliável (sedado/intubado)');
  addTest(
    'NUR-ADM-ICU-007',
    'Glasgow preservado: valor informado preservado sem deduções automatizadas',
    glasgowPreserved,
    `Encontrado no texto: ${glasgowPreserved}`
  );

  // NUR-ADM-ICU-008: RASS preservado
  const rassPreserved = sampleNote.includes('RASS') && sampleNote.includes('-4');
  addTest(
    'NUR-ADM-ICU-008',
    'RASS preservado: escore de sedação RASS preservado na narrativa',
    rassPreserved,
    `Encontrado no texto: ${rassPreserved}`
  );

  // NUR-ADM-ICU-009: PAM preservada
  const pamPreserved = sampleNote.includes('PAM (aferição manual direta): 83 mmHg');
  addTest(
    'NUR-ADM-ICU-009',
    'PAM preservada: aferição manual direta de PAM mantida sem fórmula calculada',
    pamPreserved,
    `Encontrado no texto: ${pamPreserved}`
  );

  // NUR-ADM-ICU-010: VMI preservada
  const vmiPreserved = sampleNote.includes('VMI') && sampleNote.includes('TOT') && sampleNote.includes('8.0');
  addTest(
    'NUR-ADM-ICU-010',
    'VMI preservada: suporte respiratório invasivo e via aérea artificial identificados',
    vmiPreserved,
    `Encontrado no texto: ${vmiPreserved}`
  );

  // NUR-ADM-ICU-011: Parâmetros ventilatórios preservados
  const paramsPreserved =
    sampleNote.includes('VCV') &&
    sampleNote.includes('FiO₂ 40') &&
    sampleNote.includes('PEEP 8') &&
    sampleNote.includes('VC 440');
  addTest(
    'NUR-ADM-ICU-011',
    'Parâmetros ventilatórios preservados: modo, FiO2, PEEP e VC preservados fielmente',
    paramsPreserved,
    `Encontrado no texto: ${paramsPreserved}`
  );

  // NUR-ADM-ICU-012: Drogas vasoativas preservadas
  const dvaPreserved = sampleNote.includes('Noradrenalina') && sampleNote.includes('6 mL/h');
  addTest(
    'NUR-ADM-ICU-012',
    'Drogas vasoativas preservadas: fármaco vasoativo, diluição e vazão preservados',
    dvaPreserved,
    `Encontrado no texto: ${dvaPreserved}`
  );

  // NUR-ADM-ICU-013: Sedação preservada
  const sedPreserved = sampleNote.includes('Fentanil') && sampleNote.includes('Midazolam') && sampleNote.includes('4 mL/h');
  addTest(
    'NUR-ADM-ICU-013',
    'Sedação preservada: fármacos contínuos e vazões preservados',
    sedPreserved,
    `Encontrado no texto: ${sedPreserved}`
  );

  // NUR-ADM-ICU-014: Dispositivos preservados
  const devPreserved = sampleNote.includes('CVC em veia subclávia') && sampleNote.includes('SVD em meato uretral');
  addTest(
    'NUR-ADM-ICU-014',
    'Dispositivos preservados: cateteres vasculares e sondas com sítio anatômico mantidos',
    devPreserved,
    `Encontrado no texto: ${devPreserved}`
  );

  // NUR-ADM-ICU-015: Nutrição preservada
  const nutPreserved = sampleNote.includes('Suporte nutricional: jejum');
  addTest(
    'NUR-ADM-ICU-015',
    'Nutrição preservada: status nutricional registrado com precisão',
    nutPreserved,
    `Encontrado no texto: ${nutPreserved}`
  );

  // NUR-ADM-ICU-016: Balanço hídrico preservado
  const wbPreserved = sampleNote.includes('Balanço hídrico inicial: Zerado na admissão');
  addTest(
    'NUR-ADM-ICU-016',
    'Balanço hídrico preservado: condição admissional do balanço hídrico preservada',
    wbPreserved,
    `Encontrado no texto: ${wbPreserved}`
  );

  // NUR-ADM-ICU-017: Cuidados preservados
  const noteLower = sampleNote.toLowerCase();
  const carePreserved =
    noteLower.includes('monitorização cardíaca') &&
    noteLower.includes('elevação de cabeceira a 30°');
  addTest(
    'NUR-ADM-ICU-017',
    'Cuidados preservados: intervenções de enfermagem executadas registradas fielmente',
    carePreserved,
    `Encontrado no texto: ${carePreserved}`
  );

  // NUR-ADM-ICU-018: IA sem diagnóstico
  const aiWithDiag = {
    paragraphs: [
      {
        text: sampleNote + ' Paciente com diagnóstico de choque séptico e sepse grave estabelecida.',
        factIds: ['FACT-ADM-ICU-001'],
      },
    ],
  };
  const verifDiag = verifyNurseICUAdmissionAIRefinedResponse(aiWithDiag, sampleFacts, sampleNote);
  addTest(
    'NUR-ADM-ICU-018',
    'IA sem diagnóstico: PostGenerationVerifier rejeita criação automatizada de diagnóstico médico de choque ou sepse',
    !verifDiag.approved,
    `Rejeitado: ${!verifDiag.approved}, Motivos: ${verifDiag.reasons.join('; ')}`
  );

  // NUR-ADM-ICU-019: IA sem prognóstico
  const aiWithProg = {
    paragraphs: [
      {
        text: sampleNote + ' Apresenta prognóstico reservado e iminência de disfunção de múltiplos órgãos.',
        factIds: ['FACT-ADM-ICU-001'],
      },
    ],
  };
  const verifProg = verifyNurseICUAdmissionAIRefinedResponse(aiWithProg, sampleFacts, sampleNote);
  addTest(
    'NUR-ADM-ICU-019',
    'IA sem prognóstico: PostGenerationVerifier rejeita especulação de prognóstico e disfunção de órgãos',
    !verifProg.approved,
    `Rejeitado: ${!verifProg.approved}, Motivos: ${verifProg.reasons.join('; ')}`
  );

  // NUR-ADM-ICU-020: ICUAdmissionFactLock aprovado
  const validAI = {
    paragraphs: [
      {
        text: sampleNote,
        factIds: ['FACT-ADM-ICU-001'],
      },
    ],
  };
  const verifValid = verifyNurseICUAdmissionAIRefinedResponse(validAI, sampleFacts, sampleNote);
  const lockDirect = verifyICUAdmissionFactLock(sampleNote, sampleFacts, sampleNote);
  addTest(
    'NUR-ADM-ICU-020',
    'ICUAdmissionFactLock aprovado: narrativa estritamente factual é validada e aprovada pelo lock',
    lockDirect.passed && verifValid.approved,
    `Lock direto: ${lockDirect.passed}, PostGeneration: ${verifValid.approved}`
  );

  // Consistency Tests: NUR-ADM-ICU-CONS-001 to CONS-007
  // NUR-ADM-ICU-CONS-001: VMI sem parâmetros
  const formVmiNoParams = createInitialNurseICUAdmissionForm();
  formVmiNoParams.respiratorySupport.supportType = 'VMI';
  formVmiNoParams.mechanicalVentilation.ventilationMode = '';
  formVmiNoParams.mechanicalVentilation.fio2 = '';
  formVmiNoParams.mechanicalVentilation.peep = '';
  const resVmi = validateNurseICUAdmissionConsistency(formVmiNoParams);
  addTest(
    'NUR-ADM-ICU-CONS-001',
    'Consistência: VMI sem parâmetros ventilatórios gera alerta de erro',
    resVmi.errors.some((e) => e.includes('Ventilação Mecânica Invasiva (VMI) selecionada sem registro')),
    `Erros encontrados: ${resVmi.errors.join('; ')}`
  );

  // NUR-ADM-ICU-CONS-002: Dieta enteral sem dispositivo
  const formEnteralNoDev = createInitialNurseICUAdmissionForm();
  formEnteralNoDev.nutrition.dietType = 'enteral';
  formEnteralNoDev.nutrition.enteralDevice = '';
  const resEnteral = validateNurseICUAdmissionConsistency(formEnteralNoDev);
  addTest(
    'NUR-ADM-ICU-CONS-002',
    'Consistência: Dieta enteral sem dispositivo gera alerta de erro',
    resEnteral.errors.some((e) => e.includes('Dieta enteral selecionada sem especificação do dispositivo')),
    `Erros encontrados: ${resEnteral.errors.join('; ')}`
  );

  // NUR-ADM-ICU-CONS-003: DVA sem medicamento
  const formDvaEmpty = createInitialNurseICUAdmissionForm();
  formDvaEmpty.vasoactiveDrugs.hasVasoactiveDrugs = 'Sim';
  formDvaEmpty.vasoactiveDrugs.drugs = [];
  const resDva = validateNurseICUAdmissionConsistency(formDvaEmpty);
  addTest(
    'NUR-ADM-ICU-CONS-003',
    'Consistência: Drogas vasoativas "Sim" sem medicamento gera alerta de erro',
    resDva.errors.some((e) => e.includes('nenhuma droga foi cadastrada')),
    `Erros encontrados: ${resDva.errors.join('; ')}`
  );

  // NUR-ADM-ICU-CONS-004: Sedação sem medicação
  const formSedEmpty = createInitialNurseICUAdmissionForm();
  formSedEmpty.sedationAnalgesia.hasSedationAnalgesia = 'Sim';
  formSedEmpty.sedationAnalgesia.continuousInfusions = [];
  const resSed = validateNurseICUAdmissionConsistency(formSedEmpty);
  addTest(
    'NUR-ADM-ICU-CONS-004',
    'Consistência: Sedação contínua "Sim" sem medicação gera alerta de erro',
    resSed.errors.some((e) => e.includes('nenhuma medicação foi cadastrada')),
    `Erros encontrados: ${resSed.errors.join('; ')}`
  );

  // NUR-ADM-ICU-CONS-005: Dispositivo sem localização
  const formDevNoSite = createInitialNurseICUAdmissionForm();
  formDevNoSite.invasiveDevices.hasInvasiveDevices = 'Sim';
  formDevNoSite.invasiveDevices.devices = [
    {
      deviceType: 'CVC',
      anatomicalSite: '',
      insertionSide: 'direito',
      permeability: 'permeável',
      functioningStatus: 'em funcionamento',
      dressingCondition: 'limpo e seco',
    },
  ];
  const resDev = validateNurseICUAdmissionConsistency(formDevNoSite);
  addTest(
    'NUR-ADM-ICU-CONS-005',
    'Consistência: Dispositivo invasivo sem localização anatômica gera alerta de erro',
    resDev.errors.some((e) => e.includes('sem especificação do sítio anatômico')),
    `Erros encontrados: ${resDev.errors.join('; ')}`
  );

  // NUR-ADM-ICU-CONS-006: Intercorrência sem conduta
  const formCompNoAction = createInitialNurseICUAdmissionForm();
  formCompNoAction.complications.hasComplication = 'Sim';
  formCompNoAction.complications.immediateAction = '';
  const resComp = validateNurseICUAdmissionConsistency(formCompNoAction);
  addTest(
    'NUR-ADM-ICU-CONS-006',
    'Consistência: Intercorrência "Sim" sem conduta imediata gera alerta de erro',
    resComp.errors.some((e) => e.includes('sem especificação da conduta imediata')),
    `Erros encontrados: ${resComp.errors.join('; ')}`
  );

  // NUR-ADM-ICU-CONS-007: Cenário válido sem alerta
  const validConsistency = validateNurseICUAdmissionConsistency(sampleNorm);
  addTest(
    'NUR-ADM-ICU-CONS-007',
    'Consistência: Cenário completo e válido não gera nenhum alerta de erro',
    validConsistency.errors.length === 0,
    `Erros encontrados: ${validConsistency.errors.length}`
  );

  const passedCount = tests.filter((t) => t.passed).length;
  const failedCount = tests.length - passedCount;

  return {
    suite: 'NurseICUAdmissionEngineTests',
    tests,
    summary: {
      total: tests.length,
      passed: passedCount,
      failed: failedCount,
      results: tests,
    },
  };
}
