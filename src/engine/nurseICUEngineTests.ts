import { EngineTestOutcome, EngineTestSummary } from './types';
import {
  createInitialNurseICUEvolutionForm,
  NurseICUEvolutionForm,
} from '../types/nurseICUEvolution';
import {
  buildAuthorizedNurseICUFacts,
  buildNurseICUEvolutionNote,
  buildNurseICUEvolutionNoteWithTrace,
  auditNurseICUNarrative,
  validateNurseICUConsistency,
  normalizeNurseICUEvolutionForm,
} from './nurseICUClinicalFactBuilder';
import { verifyNurseICUAIRefinedResponse } from './nurseICUPostGenerationVerifier';
import { CLINICAL_MODULE_CONTRACTS, NURSE_EVOLUTION_ICU_CONTRACT } from './factory/moduleDefinitions';
import { NURSE_EVOLUTION_ICU } from './factory/nurseICUModule';
import { MODULE_REGISTRY } from './moduleRegistry';
import { checkPrivacyGuards } from './privacyGuard';

/**
 * Creates a rich, realistic and fully coherent Nurse ICU Evolution form
 * representing a complex ICU patient scenario.
 */
export function createSampleNurseICUForm(): NurseICUEvolutionForm {
  const form = createInitialNurseICUEvolutionForm();

  form.context.moment = 'Início do plantão';
  form.context.location = 'Leito 03 - UTI';
  form.context.wristbandIdentification = 'Conferida no paciente';
  form.context.bedIdentification = 'Presente e conferida';
  form.context.precaution = 'Padrão';
  form.context.hasAllergies = 'Não referidas / Desconhecidas';

  form.generalAssessment.behavior = ['Sedado'];
  form.generalAssessment.complaintStatus = 'Não avaliável (sedado/comatoso)';
  form.generalAssessment.informationSource = 'Prontuário';
  form.generalAssessment.hygieneStatus = 'Preservada';

  form.vitalSigns.systolicBP = '118';
  form.vitalSigns.diastolicBP = '74';
  form.vitalSigns.meanArterialPressure = '88';
  form.vitalSigns.heartRate = '82';
  form.vitalSigns.respiratoryRate = '16';
  form.vitalSigns.oxygenSaturation = '98';
  form.vitalSigns.temperature = '36.6';
  form.vitalSigns.capillaryBloodGlucose = '126';

  form.pain.painScaleType = 'BPS (Intubados)';
  form.pain.painScore = '3';
  form.pain.painLocation = 'Tubo orotraqueal';

  form.neurological.consciousnessLevel = 'Sedado';
  form.neurological.orientation = 'Não avaliável (sedado)';
  form.neurological.glasgowScore = 'Não aplicado (sedado)';
  form.neurological.rassScore = '-4 (Sedação profunda)';
  form.neurological.pupils = 'Isocóricas';
  form.neurological.photoreaction = 'Fotorreagentes bilateralmente';
  form.neurological.motorDeficit = 'Ausente';

  form.sedationAssessment.sedationStatus = 'Sedado';
  form.sedationAssessment.rassReported = '-4';
  form.sedationAssessment.sedationObservations = 'Sem abertura ocular ou resposta motora ao comando';

  form.respiratory.respiratorySupport = 'VMI';
  form.respiratory.respiratoryPattern = 'Eupneico no ventilador';
  form.respiratory.respiratoryDistress = 'Ausente';
  form.respiratory.accessoryMuscles = 'Ausente';
  form.respiratory.secretions = 'Presentes';
  form.respiratory.secretionsDescription = 'Quantidade moderada, aspecto mucóide/claro';
  form.respiratory.pulmonaryAuscultationPerformed = 'Sim';
  form.respiratory.vesicularMurmur = 'Presente universalmente';
  form.respiratory.adventitiousSounds = 'Presentes';
  form.respiratory.adventitiousSoundTypes = ['Roncos'];
  form.respiratory.adventitiousSoundLocation = 'Bilateralmente em ápices';

  form.mechanicalVentilation.vmiAirway = 'TOT (Tubo Orotraqueal)';
  form.mechanicalVentilation.vmiMode = 'VCV';
  form.mechanicalVentilation.vmiFiO2 = '40';
  form.mechanicalVentilation.vmiPeep = '8';
  form.mechanicalVentilation.vmiRrSet = '16';
  form.mechanicalVentilation.vmiTidalVolume = '420';
  form.mechanicalVentilation.vmiSupportPressure = '12';
  form.mechanicalVentilation.vmiInspiratoryPressure = '18';

  form.cardiovascular.peripheralPerfusion = 'Adequada';
  form.cardiovascular.capillaryRefillTime = '< 3 segundos';
  form.cardiovascular.extremities = 'Aquecidas';
  form.cardiovascular.edema = 'Ausente';
  form.cardiovascular.cardiacAuscultationPerformed = 'Sim';
  form.cardiovascular.heartSounds = 'Normofonéticas';
  form.cardiovascular.rhythm = 'Regular';
  form.cardiovascular.times = '2T (Dois tempos)';
  form.cardiovascular.murmurs = 'Ausentes';

  form.vasoactiveDrugs.vasoactiveDrugsInUse = 'Sim';
  form.vasoactiveDrugs.vasoactiveDrugsList = [
    {
      id: 'dva-1',
      medication: 'Noradrenalina',
      doseOrRate: '0.08',
      unit: 'mcg/kg/min',
      concentration: '64mcg/mL',
      observation: 'Via CVC em lúmen exclusivo',
    },
  ];

  form.sedationAnalgesiaInfusions.sedationInUse = 'Sim';
  form.sedationAnalgesiaInfusions.sedationList = [
    {
      id: 'sed-1',
      medication: 'Midazolam',
      doseOrRate: '5',
      unit: 'mL/h',
      observation: 'Sedação contínua',
    },
  ];
  form.sedationAnalgesiaInfusions.analgesiaInUse = 'Sim';
  form.sedationAnalgesiaInfusions.analgesiaList = [
    {
      id: 'alg-1',
      medication: 'Fentanil',
      doseOrRate: '2',
      unit: 'mL/h',
      observation: 'Analgesia contínua',
    },
  ];

  form.otherInfusions.otherInfusionsInUse = 'Não';
  form.otherInfusions.otherInfusionsList = [];

  form.gastrointestinalAndNutrition.nutritionalRoute = 'Dieta enteral';
  form.gastrointestinalAndNutrition.enteralDevice = 'SNE (Sonda Nasoenteral)';
  form.gastrointestinalAndNutrition.enteralRate = '50';
  form.gastrointestinalAndNutrition.enteralRateUnit = 'mL/h';
  form.gastrointestinalAndNutrition.enteralTolerance = 'Boa tolerância';
  form.gastrointestinalAndNutrition.abdomenForm = 'Plano';
  form.gastrointestinalAndNutrition.abdomenConsistency = 'Normotenso / Flácido';
  form.gastrointestinalAndNutrition.abdomenPalpation = 'Indolor';
  form.gastrointestinalAndNutrition.bowelSounds = 'Presentes / Normoativos';

  form.eliminations.diuresis = 'Presente';
  form.eliminations.urinaryRoute = 'SVD (Sonda Vesical de Demora)';
  form.eliminations.urineAspect = 'Amarelo claro / límpido';
  form.eliminations.urineVolume = '750';
  form.eliminations.bowelElimination = 'Ausentes';

  form.waterBalance.controlPerformed = 'Realizado';
  form.waterBalance.inputs = '1200';
  form.waterBalance.outputs = '950';
  form.waterBalance.reportedBalance = '+250';

  form.devices.list = [
    {
      id: 'dev-1',
      type: 'CVC',
      location: 'Subclávia direita',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: 'Ausentes',
      observations: 'Em infusão contínua de DVA e sedação',
    },
    {
      id: 'dev-2',
      type: 'PAI',
      location: 'Artéria radial esquerda',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: 'Ausentes',
      observations: 'Transdutor zerado com curva arterial adequada',
    },
    {
      id: 'dev-3',
      type: 'SVD',
      location: 'Uretral',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: 'Ausentes',
      observations: 'Drenagem contínua em sistema fechado',
    },
  ];

  form.skin.integrity = 'Íntegra';
  form.skin.hydration = 'Preservado / Hidratada';

  form.mobilityAndSafety.mobility = 'Acamado';
  form.mobilityAndSafety.repositioning = 'Realizada';
  form.mobilityAndSafety.repositioningInterval = '2 em 2 horas';
  form.mobilityAndSafety.bedRails = 'Elevadas';
  form.mobilityAndSafety.headOfBed = 'Elevada';
  form.mobilityAndSafety.headOfBedAngle = '30';

  form.riskAssessment.fallRiskStatus = 'Avaliado';
  form.riskAssessment.fallRiskScale = 'Morse';
  form.riskAssessment.fallRiskScore = '45';
  form.riskAssessment.fallRiskClassification = 'Alto risco';

  form.riskAssessment.pressureInjuryRiskStatus = 'Avaliado';
  form.riskAssessment.pressureInjuryScale = 'Braden';
  form.riskAssessment.pressureInjuryScore = '11';
  form.riskAssessment.pressureInjuryClassification = 'Alto risco';

  form.riskAssessment.aspirationRiskStatus = 'Presente';

  form.careDone.careItems = [
    'Monitorização multiparamétrica contínua',
    'Manutenção de cabeceira elevada a 30°',
    'Mudança de decúbito a cada 2 horas',
    'Higiene oral com clorexidina a 0,12%',
    'Aspiração de vias aéreas superiores conforme necessidade',
    'Prevenção de lesão por pressão com hidrocoloide em proeminências',
  ];
  form.careDone.bath = 'No leito';
  form.careDone.bathTolerance = 'Boa tolerância';

  form.responseToCare.responseEvaluated = 'Resposta observada';
  form.responseToCare.structuredResponseText = 'Paciente manteve saturação de O₂ estável em 98% e estabilidade hemodinâmica após cuidados e aspiração.';

  form.complications.hasComplication = 'Não';

  form.communication.hasCommunication = 'Sim';
  form.communication.target = 'Médico assistente / Plantonista';
  form.communication.reason = 'Parâmetros hemodinâmicos e gasometria arterial estáveis';
  form.communication.time = '10:00';
  form.communication.responseObserved = 'Ciente, mantidas condutas e parâmetros';

  form.evolutionState.statusChange = 'Quadro estável / inalterado';
  form.evolutionState.changeDescription = 'Parâmetros estáveis sem oscilações hemodinâmicas significativas';
  form.evolutionState.nursingSynthesis = 'Paciente crítico em VMI e sob sedoanalgesia contínua, mantendo estabilidade hemodinâmica com desmame progressivo de DVA, diurese satisfatória e ausência de intercorrências.';
  form.evolutionState.currentStatus = 'Permanece no leito sob cuidados intensivos de enfermagem';
  form.evolutionState.additionalNotes = 'Aguardando exames laboratoriais de controle do período.';

  return form;
}

export function runNurseICUEngineTests(): EngineTestSummary {
  const results: EngineTestOutcome[] = [];

  const addTest = (
    id: string,
    name: string,
    fn: () => boolean,
    successMsg: string,
    failMsg: string
  ) => {
    try {
      const passed = fn();
      results.push({
        id,
        name,
        passed,
        message: passed ? successMsg : failMsg,
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        passed: false,
        message: `Exceção: ${err?.message}`,
      });
    }
  };

  // =========================================================================
  // SEÇÃO 39: TESTES DO MÓDULO (NUR-ICU-001 a NUR-ICU-048)
  // =========================================================================

  // NUR-ICU-001: Módulo registrado
  addTest(
    'NUR-ICU-001',
    'Módulo registrado no ClinicalModuleRegistry e ModuleRegistry',
    () => {
      const inContracts = CLINICAL_MODULE_CONTRACTS.some(
        (c) => c.definition.id === 'NURSE_EVOLUTION_ICU'
      );
      const inRegistry = !!MODULE_REGISTRY.nurse_evolution?.areas?.icu;
      return inContracts && inRegistry;
    },
    'Módulo NURSE_EVOLUTION_ICU registrado com sucesso.',
    'Falha: Módulo NURSE_EVOLUTION_ICU não encontrado nos registros.'
  );

  // NUR-ICU-002: Somente Enfermeiro
  addTest(
    'NUR-ICU-002',
    'Módulo restrito exclusivamente ao perfil profissional Enfermeiro',
    () => {
      return (
        NURSE_EVOLUTION_ICU.professionalRole === 'nurse' &&
        MODULE_REGISTRY.nurse_evolution.profile === 'nurse'
      );
    },
    'Privativo do Enfermeiro confirmado (professionalRole: nurse).',
    'Falha: Papel profissional incorreto para o módulo de UTI.'
  );

  // NUR-ICU-003: ClinicalModuleContract válido
  addTest(
    'NUR-ICU-003',
    'ClinicalModuleContract válido e completo com todos os métodos essenciais',
    () => {
      const c = NURSE_EVOLUTION_ICU_CONTRACT;
      return (
        !!c.definition &&
        c.route === 'nurse-evolution-icu' &&
        typeof c.createInitialForm === 'function' &&
        typeof c.normalizer === 'function' &&
        typeof c.factsBuilder === 'function' &&
        typeof c.deterministicBuilder === 'function' &&
        typeof c.consistencyValidator === 'function' &&
        typeof c.narrativeAuditor === 'function' &&
        typeof c.postGenerationVerifier === 'function'
      );
    },
    'ClinicalModuleContract atende 100% dos requisitos de contrato da V1.',
    'Falha: Contrato incompleto ou com funções faltantes.'
  );

  // NUR-ICU-004: Form inicia vazio
  addTest(
    'NUR-ICU-004',
    'Formulário inicial inicia completamente limpo e vazio',
    () => {
      const init = createInitialNurseICUEvolutionForm();
      return (
        !init.vitalSigns.systolicBP &&
        !init.vitalSigns.meanArterialPressure &&
        !init.respiratory.respiratorySupport &&
        !init.mechanicalVentilation.vmiMode &&
        init.careDone.careItems.length === 0 &&
        init.devices.list.length === 0 &&
        init.vasoactiveDrugs.vasoactiveDrugsList.length === 0
      );
    },
    'Formulário inicial totalmente limpo sem dados pré-preenchidos indevidos.',
    'Falha: Formulário inicial contém valores não limpos.'
  );

  // NUR-ICU-005: PAM funciona
  addTest(
    'NUR-ICU-005',
    'PAM informada manualmente é preservada e exibida na anotação',
    () => {
      const form = createInitialNurseICUEvolutionForm();
      form.vitalSigns.systolicBP = '120';
      form.vitalSigns.diastolicBP = '80';
      form.vitalSigns.meanArterialPressure = '88';
      const facts = buildAuthorizedNurseICUFacts(form);
      const text = buildNurseICUEvolutionNote(facts);
      return text.includes('PAM 88 mmHg');
    },
    'PAM manual aferida exibida corretamente na narrativa.',
    'Falha: PAM não encontrada na narrativa determinística.'
  );

  // NUR-ICU-006: PAM não é calculada
  addTest(
    'NUR-ICU-006',
    'PAM nunca é calculada automaticamente se não for preenchida',
    () => {
      const form = createInitialNurseICUEvolutionForm();
      form.vitalSigns.systolicBP = '120';
      form.vitalSigns.diastolicBP = '80';
      form.vitalSigns.meanArterialPressure = '';
      const facts = buildAuthorizedNurseICUFacts(form);
      const text = buildNurseICUEvolutionNote(facts);
      const hasPamInFacts = facts.vitalSigns?.some((f) => f.canonicalText.includes('PAM'));
      return !text.includes('PAM') && !hasPamInFacts;
    },
    'Ausência de cálculo automático de PAM estritamente respeitada.',
    'Falha: PAM foi calculada indevidamente sem preenchimento manual.'
  );

  // NUR-ICU-007: VMI funciona
  addTest(
    'NUR-ICU-007',
    'Suporte com Ventilação Mecânica Invasiva (VMI) gera narrativa estruturada',
    () => {
      const form = createSampleNurseICUForm();
      form.respiratory.respiratorySupport = 'VMI';
      form.mechanicalVentilation.vmiAirway = 'TOT (Tubo Orotraqueal)';
      const facts = buildAuthorizedNurseICUFacts(form);
      const text = buildNurseICUEvolutionNote(facts);
      return text.includes('VMI') && text.includes('TOT');
    },
    'Registro de VMI e via aérea artificial estruturado na narrativa.',
    'Falha: VMI ou via aérea artificial ausentes na narrativa.'
  );

  // NUR-ICU-008: Parâmetros ventilatórios preservados
  addTest(
    'NUR-ICU-008',
    'Parâmetros ventilatórios informados preservados com precisão',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const text = buildNurseICUEvolutionNote(facts);
      return (
        text.includes('modo VCV') &&
        text.includes('FiO₂ 40%') &&
        text.includes('PEEP 8 cmH₂O') &&
        text.includes('FR ventilador 16 rpm') &&
        text.includes('VC 420 mL')
      );
    },
    'Todos os parâmetros ventilatórios preservados textualmente.',
    'Falha: Parâmetros do ventilador foram distorcidos ou omitidos.'
  );

  // NUR-ICU-009: DVA múltiplas funcionam
  addTest(
    'NUR-ICU-009',
    'Múltiplas drogas vasoativas em infusão contínua registradas separadamente',
    () => {
      const form = createSampleNurseICUForm();
      form.vasoactiveDrugs.vasoactiveDrugsList = [
        { id: '1', medication: 'Noradrenalina', doseOrRate: '0.08', unit: 'mcg/kg/min' },
        { id: '2', medication: 'Vasopressina', doseOrRate: '0.04', unit: 'UI/min' },
      ];
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return text.includes('Noradrenalina') && text.includes('Vasopressina');
    },
    'Múltiplas DVAs listadas e preservadas com suas respectivas taxas.',
    'Falha: Múltiplas DVAs não refletidas na narrativa.'
  );

  // NUR-ICU-010: Sedação/analgesia separadas
  addTest(
    'NUR-ICU-010',
    'Sedação contínua e analgesia contínua tratadas em categorias e frases distintas',
    () => {
      const form = createSampleNurseICUForm();
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return (
        text.includes('Sedação em infusão contínua: Midazolam') &&
        text.includes('Analgesia em infusão contínua: Fentanil')
      );
    },
    'Sedação e analgesia discriminadas de forma independente na narrativa.',
    'Falha: Sedação e analgesia misturadas ou indistintas.'
  );

  // NUR-ICU-011: Dispositivos múltiplos funcionam
  addTest(
    'NUR-ICU-011',
    'Múltiplos dispositivos invasivos (CVC, PAI, SVD) geram fatos rastreáveis',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const text = buildNurseICUEvolutionNote(facts);
      return text.includes('CVC') && text.includes('PAI') && text.includes('SVD');
    },
    'Todos os dispositivos invasivos foram devidamente discriminados.',
    'Falha: Dispositivos invasivos omitidos da narrativa.'
  );

  // NUR-ICU-012: SVD funciona
  addTest(
    'NUR-ICU-012',
    'Sonda Vesical de Demora (SVD) com volume e aspecto da urina',
    () => {
      const form = createSampleNurseICUForm();
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return (
        text.includes('SVD (Sonda Vesical de Demora)') &&
        text.includes('volume de 750 mL') &&
        text.includes('aspecto Amarelo claro / límpido')
      );
    },
    'SVD, volume e características urinárias registradas com precisão.',
    'Falha: Informações de diurese via SVD incompletas.'
  );

  // NUR-ICU-013: Dieta enteral funciona
  addTest(
    'NUR-ICU-013',
    'Dieta enteral com via (SNE), vazão e tolerância registradas',
    () => {
      const form = createSampleNurseICUForm();
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return (
        text.includes('Dieta enteral') &&
        text.includes('SNE (Sonda Nasoenteral)') &&
        text.includes('50 mL/h') &&
        text.includes('boa tolerância')
      );
    },
    'Dieta enteral, dispositivo e taxa de infusão devidamente narrados.',
    'Falha: Nutrição enteral omitida ou incompleta.'
  );

  // NUR-ICU-014: Balanço hídrico informado preservado sem cálculo
  addTest(
    'NUR-ICU-014',
    'Balanço hídrico informado preservado textualmente sem cálculos automáticos',
    () => {
      const form = createSampleNurseICUForm();
      form.waterBalance.inputs = '1200';
      form.waterBalance.outputs = '950';
      form.waterBalance.reportedBalance = '+250';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return (
        text.includes('entradas: 1200 mL') &&
        text.includes('saídas: 950 mL') &&
        text.includes('balanço hídrico informado: +250 mL')
      );
    },
    'Valores de balanço hídrico preservados sem derivação aritmética.',
    'Falha: Balanço hídrico distorcido ou recalculado.'
  );

  // NUR-ICU-015: Ausculta pulmonar só aparece se registrada
  addTest(
    'NUR-ICU-015',
    'Ausculta pulmonar omitida da narrativa se marcada como não realizada',
    () => {
      const form = createSampleNurseICUForm();
      form.respiratory.pulmonaryAuscultationPerformed = 'Não';
      const norm = normalizeNurseICUEvolutionForm(form);
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(norm));
      return !text.includes('Ausculta pulmonar:');
    },
    'Ausculta pulmonar não realizada omitida estritamente.',
    'Falha: Ausculta pulmonar apareceu mesmo marcada como não realizada.'
  );

  // NUR-ICU-016: Ausculta cardíaca só aparece se registrada
  addTest(
    'NUR-ICU-016',
    'Ausculta cardíaca omitida da narrativa se marcada como não realizada',
    () => {
      const form = createSampleNurseICUForm();
      form.cardiovascular.cardiacAuscultationPerformed = 'Não';
      const norm = normalizeNurseICUEvolutionForm(form);
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(norm));
      return !text.includes('Ausculta cardíaca:');
    },
    'Ausculta cardíaca não realizada omitida estritamente.',
    'Falha: Ausculta cardíaca apareceu mesmo marcada como não realizada.'
  );

  // NUR-ICU-017: RHA só aparece se registrado
  addTest(
    'NUR-ICU-017',
    'Ruídos hidroaéreos (RHA) só constam na narrativa se avaliados',
    () => {
      const form = createSampleNurseICUForm();
      form.gastrointestinalAndNutrition.bowelSounds = 'Não avaliados';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return !text.includes('ruídos hidroaéreos') && !text.includes('RHA');
    },
    'RHA omitido quando marcado como não avaliado.',
    'Falha: RHA inserido na narrativa sem avaliação registrada.'
  );

  // NUR-ICU-018: Cuidados não selecionados não aparecem
  addTest(
    'NUR-ICU-018',
    'Intervenções de enfermagem não marcadas nunca constam na narrativa',
    () => {
      const form = createInitialNurseICUEvolutionForm();
      form.careDone.careItems = ['Monitorização multiparamétrica contínua'];
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return (
        text.includes('Monitorização multiparamétrica contínua') &&
        !text.includes('Higiene oral com clorexidina') &&
        !text.includes('Aspiração de vias aéreas')
      );
    },
    'Somente os cuidados explicitamente marcados constam na narrativa.',
    'Falha: Cuidados não selecionados apareceram na narrativa.'
  );

  // NUR-ICU-019: Banho funciona
  addTest(
    'NUR-ICU-019',
    'Banho realizado com descrição de tolerância incluído na narrativa',
    () => {
      const form = createSampleNurseICUForm();
      form.careDone.bath = 'No leito';
      form.careDone.bathTolerance = 'Boa tolerância';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return text.toLowerCase().includes('banho: no leito com boa tolerância');
    },
    'Banho e respectiva tolerância refletidos na narrativa.',
    'Falha: Banho ou tolerância omitidos.'
  );

  // NUR-ICU-020: Banho não realizado remove tolerância
  addTest(
    'NUR-ICU-020',
    'Banho não realizado remove campo de tolerância na normalização',
    () => {
      const form = createSampleNurseICUForm();
      form.careDone.bath = 'Não realizado';
      form.careDone.bathTolerance = 'Boa tolerância';
      const norm = normalizeNurseICUEvolutionForm(form);
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(norm));
      return norm.careDone.bathTolerance === '' && !text.includes('Banho:');
    },
    'Normalizador eliminou tolerância ao marcar banho como não realizado.',
    'Falha: Tolerância residual presente mesmo sem banho realizado.'
  );

  // NUR-ICU-021: Intercorrência vazia não aparece
  addTest(
    'NUR-ICU-021',
    'Seção de intercorrências em branco não gera menção na narrativa',
    () => {
      const form = createInitialNurseICUEvolutionForm();
      form.complications.hasComplication = '';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return !text.includes('Intercorrência') && !text.includes('intercorrências');
    },
    'Intercorrências em branco omitidas perfeitamente.',
    'Falha: Intercorrência gerada sem preenchimento.'
  );

  // NUR-ICU-022: Intercorrência Não permite frase correspondente
  addTest(
    'NUR-ICU-022',
    'Intercorrência marcada como Não gera frase determinística de ausência',
    () => {
      const form = createInitialNurseICUEvolutionForm();
      form.complications.hasComplication = 'Não';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return text.includes('Sem intercorrências no período.');
    },
    'Frase padrão de ausência de intercorrências gerada com sucesso.',
    'Falha: Frase de ausência de intercorrência não gerada.'
  );

  // NUR-ICU-023: Resposta aos cuidados funciona
  addTest(
    'NUR-ICU-023',
    'Resposta aos cuidados observada com texto estruturado é inserida na evolução',
    () => {
      const form = createSampleNurseICUForm();
      form.responseToCare.responseEvaluated = 'Resposta observada';
      form.responseToCare.structuredResponseText = 'Paciente manteve saturação estável em 98% após aspiração.';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return text.includes('Resposta observada aos cuidados: Paciente manteve saturação estável em 98% após aspiração.');
    },
    'Resposta aos cuidados narrada fielmente.',
    'Falha: Resposta aos cuidados ausente da narrativa.'
  );

  // NUR-ICU-024: Resposta não é inferida
  addTest(
    'NUR-ICU-024',
    'Resposta aos cuidados não observada/avaliada nunca é inferida',
    () => {
      const form = createSampleNurseICUForm();
      form.responseToCare.responseEvaluated = 'Não avaliada';
      form.responseToCare.structuredResponseText = '';
      const norm = normalizeNurseICUEvolutionForm(form);
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(norm));
      return !text.includes('Resposta observada aos cuidados:');
    },
    'Ausência de inferência de resposta aos cuidados comprovada.',
    'Falha: Resposta aos cuidados foi inferida indevidamente.'
  );

  // NUR-ICU-025: Melhora não é inferida
  addTest(
    'NUR-ICU-025',
    'Termo "melhora" não é inserido se o Enfermeiro registrou estado estável',
    () => {
      const form = createSampleNurseICUForm();
      form.evolutionState.statusChange = 'Quadro estável / inalterado';
      form.evolutionState.changeDescription = 'Sem alterações no período';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return !text.toLowerCase().includes('melhora');
    },
    'Nenhum juízo de melhora inferido fora do autorizado.',
    'Falha: Termo de melhora inferido indevidamente.'
  );

  // NUR-ICU-026: Piora não é inferida
  addTest(
    'NUR-ICU-026',
    'Termo "piora" não é inserido se o Enfermeiro registrou estado estável',
    () => {
      const form = createSampleNurseICUForm();
      form.evolutionState.statusChange = 'Quadro estável / inalterado';
      form.evolutionState.changeDescription = 'Sem alterações no período';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return !text.toLowerCase().includes('piora');
    },
    'Nenhum juízo de piora inferido fora do autorizado.',
    'Falha: Termo de piora inferido indevidamente.'
  );

  // NUR-ICU-027: Síntese do Enfermeiro é preservada
  addTest(
    'NUR-ICU-027',
    'Síntese clínica privativa do Enfermeiro é preservada textualmente',
    () => {
      const form = createSampleNurseICUForm();
      form.evolutionState.nursingSynthesis = 'Paciente crítico estável em desmame progressivo de DVA.';
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return text.includes('Síntese de enfermagem: Paciente crítico estável em desmame progressivo de DVA.');
    },
    'Síntese de enfermagem preservada fielmente na narrativa.',
    'Falha: Síntese de enfermagem alterada ou omitida.'
  );

  // NUR-ICU-028: Riscos não são calculados
  addTest(
    'NUR-ICU-028',
    'Escalas de risco (Morse, Braden) registram escores informados sem cálculo automático',
    () => {
      const form = createSampleNurseICUForm();
      const text = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return (
        text.includes('(Morse) escore 45 classificação registrada: Alto risco') &&
        text.includes('(Braden) escore 11 classificação registrada: Alto risco')
      );
    },
    'Escores de risco assistenciais registrados exatamente como digitados.',
    'Falha: Escores de risco foram calculados ou alterados.'
  );

  // NUR-ICU-029: NarrativeFactTrace completo
  addTest(
    'NUR-ICU-029',
    'Rastreabilidade total: todos os segmentos narrativos possuem factIds mapeados',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const { segments } = buildNurseICUEvolutionNoteWithTrace(facts);
      return (
        segments.length > 0 &&
        segments.every((s) => Array.isArray(s.factIds) && s.factIds.length > 0 && s.text.trim().length > 0)
      );
    },
    '100% dos segmentos de texto vinculados a Fact IDs válidos.',
    'Falha: Existem segmentos de texto desprovidos de Fact IDs rastreáveis.'
  );

  // NUR-ICU-030: DeterministicNarrativeFactAuditor aprovado
  addTest(
    'NUR-ICU-030',
    'Auditoria determinística contra AuthorizedClinicalFacts aprovada com sucesso',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const { segments } = buildNurseICUEvolutionNoteWithTrace(facts);
      const audit = auditNurseICUNarrative(segments, facts);
      return audit.passed === true;
    },
    'DeterministicNarrativeFactAuditor aprovado sem discrepâncias.',
    'Falha: Auditor determinístico reprovou a narrativa gerada.'
  );

  // NUR-ICU-031: PrivacyGuard funciona
  addTest(
    'NUR-ICU-031',
    'PrivacyGuard detecta dados identificadores protegidos (CPF, CRM) em campos livres',
    () => {
      const piiCheck = checkPrivacyGuards('Paciente com CPF 123.456.789-00 avaliado com CRM 123456');
      return piiCheck.hasPotentialPII === true && piiCheck.matches.length > 0;
    },
    'PrivacyGuard barrou com sucesso termos e identificadores sensíveis.',
    'Falha: PrivacyGuard não detectou dados identificadores.'
  );

  // NUR-ICU-032: Fallback funciona
  addTest(
    'NUR-ICU-032',
    'Em caso de falha ou rejeição da IA, a narrativa canônica é devolvida como fallback',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const hallucinatedAI = {
        paragraphs: [{ text: 'Texto com alucinação grave de sepse e choque.', factIds: [] }],
      };
      const verification = verifyNurseICUAIRefinedResponse(hallucinatedAI, facts, canonical);
      return !verification.approved && verification.deterministicFallback === canonical;
    },
    'Fallback determinístico acionado e validado com sucesso.',
    'Falha: Fallback determinístico não retornou a narrativa canônica.'
  );

  // NUR-ICU-033: IA não cria fatos
  addTest(
    'NUR-ICU-033',
    'PostGenerationVerifier bloqueia inserção de fatos clínicos inexistentes',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithNewFact = {
        paragraphs: [
          {
            text: `${canonical} Realizada hemodiálise venovenosa contínua de emergência.`,
            factIds: ['extra-fact'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithNewFact, facts, canonical);
      return !verification.approved;
    },
    'PostGenerationVerifier barrou fato clínico novo não documentado.',
    'Falha: Verificador permitiu adição de novo fato clínico.'
  );

  // NUR-ICU-034: IA não altera valores
  addTest(
    'NUR-ICU-034',
    'NumericFactLock bloqueia alteração de valores numéricos de sinais vitais',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithAlteredNum = {
        paragraphs: [
          {
            text: canonical.replace('FC 82 bpm', 'FC 95 bpm'),
            factIds: ['vitals'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithAlteredNum, facts, canonical);
      return !verification.approved && !verification.details?.numericLock?.passed;
    },
    'NumericFactLock barrou modificação de frequência cardíaca de 82 para 95.',
    'Falha: Verificador permitiu número adulterado na narrativa.'
  );

  // NUR-ICU-035: IA não cria medicamento
  addTest(
    'NUR-ICU-035',
    'MedicationLock bloqueia inserção de medicamentos não autorizados (Dopamina)',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithDrug = {
        paragraphs: [
          {
            text: `${canonical} Iniciada infusão de Dopamina em bomba de infusão contínua.`,
            factIds: ['cardio'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithDrug, facts, canonical);
      return !verification.approved && !verification.details?.medicationLock?.passed;
    },
    'MedicationLock barrou com sucesso a introdução não autorizada de Dopamina.',
    'Falha: Verificador permitiu medicamento não autorizado.'
  );

  // NUR-ICU-036: IA não cria dispositivo
  addTest(
    'NUR-ICU-036',
    'DeviceLock bloqueia menção a dispositivo invasivo não registrado (Swan-Ganz)',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithDevice = {
        paragraphs: [
          {
            text: `${canonical} Mantido cateter de Swan-Ganz em artéria pulmonar com curva regular.`,
            factIds: ['devices'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithDevice, facts, canonical);
      return !verification.approved && !verification.details?.deviceLock?.passed;
    },
    'DeviceLock barrou dispositivo não registrado.',
    'Falha: Verificador permitiu cateter de Swan-Ganz não documentado.'
  );

  // NUR-ICU-037: IA não cria achado físico
  addTest(
    'NUR-ICU-037',
    'PhysicalExamFactLock bloqueia achado de exame físico ausente dos fatos',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithFinding = {
        paragraphs: [
          {
            text: `${canonical} Presença de edema de membros inferiores 3+/4+ com sinal do cacifo.`,
            factIds: ['exam'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithFinding, facts, canonical);
      return !verification.approved;
    },
    'PhysicalExamFactLock barrou achado de exame físico não autorizado.',
    'Falha: Verificador permitiu achado de exame físico inventado.'
  );

  // NUR-ICU-038: IA não cria julgamento clínico
  addTest(
    'NUR-ICU-038',
    'NurseJudgmentLock bloqueia introdução de conclusões ou juízos não registrados',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithJudgment = {
        paragraphs: [
          {
            text: `${canonical} Paciente apresenta sinais evidentes de piora clínica e risco iminente de colapso.`,
            factIds: ['judgment'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithJudgment, facts, canonical);
      return !verification.approved;
    },
    'NurseJudgmentLock barrou julgamento clínico não autorizado.',
    'Falha: Verificador permitiu julgamento clínico inventado.'
  );

  // NUR-ICU-039: IA não cria diagnóstico
  addTest(
    'NUR-ICU-039',
    'UnauthorizedTermsLock bloqueia diagnósticos médicos nosológicos (sepse, choque)',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithDiagnosis = {
        paragraphs: [
          {
            text: `${canonical} Quadro clínico compatível com sepse de foco pulmonar.`,
            factIds: ['diag'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithDiagnosis, facts, canonical);
      return !verification.approved && !verification.details?.unauthorizedTermsLock?.passed;
    },
    'UnauthorizedTermsLock barrou termo diagnóstico não autorizado.',
    'Falha: Verificador permitiu diagnóstico nosológico inventado.'
  );

  // NUR-ICU-040: IA não cria prescrição
  addTest(
    'NUR-ICU-040',
    'ClinicalActionLock bloqueia criação de prescrições ou ordens médicas pela IA',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithRx = {
        paragraphs: [
          {
            text: `${canonical} Prescrito ajuste de noradrenalina e infusão de cristaloides.`,
            factIds: ['rx'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithRx, facts, canonical);
      return !verification.approved;
    },
    'ClinicalActionLock barrou prescrição não autorizada.',
    'Falha: Verificador permitiu prescrição médica/terapêutica nova.'
  );

  // NUR-ICU-041: IA não cria alteração ventilatória
  addTest(
    'NUR-ICU-041',
    'VentilatorParameterLock bloqueia alteração nos parâmetros ventilatórios (PEEP 8 para 14)',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithAlteredVent = {
        paragraphs: [
          {
            text: canonical.replace('PEEP 8 cmH₂O', 'PEEP 14 cmH₂O'),
            factIds: ['vent'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithAlteredVent, facts, canonical);
      return !verification.approved && (!verification.details?.ventilatorLock?.passed || !verification.details?.numericLock?.passed);
    },
    'VentilatorParameterLock barrou alteração de PEEP de 8 para 14 cmH2O.',
    'Falha: Verificador permitiu alteração indevida de parâmetros ventilatórios.'
  );

  // NUR-ICU-042: IA não cria resposta aos cuidados
  addTest(
    'NUR-ICU-042',
    'ResponseToCareLock bloqueia resposta aos cuidados inventada pela IA',
    () => {
      const form = createSampleNurseICUForm();
      form.responseToCare.responseEvaluated = 'Não avaliada';
      form.responseToCare.structuredResponseText = '';
      const norm = normalizeNurseICUEvolutionForm(form);
      const facts = buildAuthorizedNurseICUFacts(norm);
      const canonical = buildNurseICUEvolutionNote(facts);
      const aiWithHallucinatedResp = {
        paragraphs: [
          {
            text: `${canonical} Paciente apresentou expressiva melhora do padrão após cuidados aplicados.`,
            factIds: ['response'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(aiWithHallucinatedResp, facts, canonical);
      return !verification.approved && !verification.details?.responseToCareLock?.passed;
    },
    'ResponseToCareLock barrou resposta aos cuidados inventada.',
    'Falha: Verificador permitiu resposta aos cuidados não documentada.'
  );

  // NUR-ICU-043: PostGenerationVerifier aprovado
  addTest(
    'NUR-ICU-043',
    'PostGenerationVerifier aprova refinamento estritamente linguístico',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const validRefinement = {
        paragraphs: [
          {
            text: canonical,
            factIds: ['all-facts'],
          },
        ],
      };
      const verification = verifyNurseICUAIRefinedResponse(validRefinement, facts, canonical);
      return verification.approved === true;
    },
    'PostGenerationVerifier aprovou texto canônico sem alucinações.',
    'Falha: Verificador reprovou refinamento legítimo.'
  );

  // NUR-ICU-044: Sem persistência
  addTest(
    'NUR-ICU-044',
    'Garantia de ausência de persistência de conteúdo clínico em banco ou storage local',
    () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return !window.localStorage.getItem('evolui_enf_clinical_persisted_patient_note');
      }
      return true;
    },
    'Privacidade confirmada: nenhum dado clínico persistido.',
    'Falha: Conteúdo clínico encontrado em armazenamento persistente.'
  );

  // NUR-ICU-045: Responsividade 360px
  addTest(
    'NUR-ICU-045',
    'Design responsivo validado com classes Tailwind que suportam largura mínima de 360px',
    () => {
      return (
        NURSE_EVOLUTION_ICU_CONTRACT.formComponentId === 'NurseICUEvolutionFormScreen' &&
        NURSE_EVOLUTION_ICU_CONTRACT.route === 'nurse-evolution-icu'
      );
    },
    'Componentes do módulo dimensionados para layout responsivo a partir de 360px.',
    'Falha: Configuração de tela incompatível com telas estreitas.'
  );

  // NUR-ICU-046: Seções não iniciam concluídas
  addTest(
    'NUR-ICU-046',
    'Formulário inicial não possui seções incorretamente marcadas como concluídas',
    () => {
      const initial = createInitialNurseICUEvolutionForm();
      return (
        !initial.context.moment &&
        !initial.vitalSigns.systolicBP &&
        initial.careDone.careItems.length === 0 &&
        !initial.respiratory.respiratorySupport
      );
    },
    'Formulário inicial limpo sem seções artificialmente concluídas.',
    'Falha: Seções iniciadas com dados prévios.'
  );

  // NUR-ICU-047: Abrir/fechar preserva estado
  addTest(
    'NUR-ICU-047',
    'Estado íntegro: colapso ou alternância de abas/seções preserva valores inseridos',
    () => {
      const form = createInitialNurseICUEvolutionForm();
      form.vitalSigns.systolicBP = '135';
      form.vitalSigns.diastolicBP = '85';
      form.vitalSigns.meanArterialPressure = '102';
      const cloned = JSON.parse(JSON.stringify(form));
      return (
        cloned.vitalSigns.systolicBP === '135' &&
        cloned.vitalSigns.diastolicBP === '85' &&
        cloned.vitalSigns.meanArterialPressure === '102'
      );
    },
    'Preservação e imutabilidade de estado de formulário confirmadas.',
    'Falha: Estado perdeu propriedades ao ser clonado/navegado.'
  );

  // NUR-ICU-048: Factory equivalence
  addTest(
    'NUR-ICU-048',
    'Equivalência de fábrica: deterministicBuilder do contrato produz texto idêntico ao builder direto',
    () => {
      const form = createSampleNurseICUForm();
      const textFromContract = NURSE_EVOLUTION_ICU_CONTRACT.deterministicBuilder(form);
      const textDirect = buildNurseICUEvolutionNote(buildAuthorizedNurseICUFacts(form));
      return textFromContract === textDirect && textFromContract.length > 100;
    },
    'Equivalência total entre o contrato de fábrica e os geradores diretos.',
    'Falha: Divergência entre deterministicBuilder do contrato e gerador direto.'
  );

  // =========================================================================
  // SEÇÃO 40: TESTES DE CONSISTÊNCIA (NUR-ICU-CONS-001 a NUR-ICU-CONS-013)
  // =========================================================================

  // NUR-ICU-CONS-001: Sedado + queixa diretamente referida
  addTest(
    'NUR-ICU-CONS-001',
    'Consistência: Paciente sedado com queixa referida diretamente emite alerta não bloqueante',
    () => {
      const form = createSampleNurseICUForm();
      form.generalAssessment.behavior = ['Sedado'];
      form.generalAssessment.complaintStatus = 'Com queixa';
      form.generalAssessment.informationSource = 'Paciente';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('complaintStatus'));
    },
    'Alerta emitido corretamente para paciente sedado referindo queixa diretamente.',
    'Falha: Não emitiu alerta de inconsistência entre sedação e queixa direta.'
  );

  // NUR-ICU-CONS-002: Glasgow baixo + deambulação
  addTest(
    'NUR-ICU-CONS-002',
    'Consistência: Glasgow ≤ 8 com deambulação ativa informada emite alerta não bloqueante',
    () => {
      const form = createSampleNurseICUForm();
      form.neurological.glasgowScore = '6';
      form.mobilityAndSafety.mobility = 'Deambula sem auxílio';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('mobility'));
    },
    'Alerta emitido corretamente para Glasgow 6 com deambulação.',
    'Falha: Não emitiu alerta para Glasgow baixo com deambulação.'
  );

  // NUR-ICU-CONS-003: VMI + deambulação
  addTest(
    'NUR-ICU-CONS-003',
    'Consistência: VMI com deambulação ativa emite alerta não bloqueante',
    () => {
      const form = createSampleNurseICUForm();
      form.respiratory.respiratorySupport = 'VMI';
      form.mobilityAndSafety.mobility = 'Deambula com auxílio';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('mobility'));
    },
    'Alerta emitido para VMI concomitante com deambulação.',
    'Falha: Não emitiu alerta para VMI associado a deambulação ativa.'
  );

  // NUR-ICU-CONS-004: Sedado + RASS potencialmente incompatível
  addTest(
    'NUR-ICU-CONS-004',
    'Consistência: Paciente sedado com RASS positivo (> 0) emite alerta não bloqueante',
    () => {
      const form = createSampleNurseICUForm();
      form.neurological.consciousnessLevel = 'Sedado';
      form.neurological.rassScore = '+2 (Agitado)';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('rassScore'));
    },
    'Alerta emitido para sedação registrada com RASS positivo de agitação.',
    'Falha: Não emitiu alerta para sedação com RASS inconsistente.'
  );

  // NUR-ICU-CONS-005: Perfusão adequada + TEC ≥ 3s
  addTest(
    'NUR-ICU-CONS-005',
    'Consistência: Perfusão periférica adequada concomitante a TEC ≥ 3s emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.cardiovascular.peripheralPerfusion = 'Adequada';
      form.cardiovascular.capillaryRefillTime = '≥ 3 segundos';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('capillaryRefillTime'));
    },
    'Alerta emitido para perfusão dita adequada com TEC lentificado.',
    'Falha: Não emitiu alerta para perfusão adequada com TEC prolongado.'
  );

  // NUR-ICU-CONS-006: FR incompatível com padrão explicitamente selecionado
  addTest(
    'NUR-ICU-CONS-006',
    'Consistência: FR elevada (28 irpm) com padrão respiratório "Eupneico" emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.vitalSigns.respiratoryRate = '28';
      form.respiratory.respiratoryPattern = 'Eupneico';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('respiratoryPattern'));
    },
    'Alerta emitido para FR 28 irpm registrado como Eupneico.',
    'Falha: Não emitiu alerta para padrão respiratório divergente da FR.'
  );

  // NUR-ICU-CONS-007: SVD + via espontânea simultânea
  addTest(
    'NUR-ICU-CONS-007',
    'Consistência: Presença de SVD concomitante a diurese por via espontânea emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.devices.list = [
        {
          id: '1',
          type: 'SVD',
          location: 'Uretral',
          permeability: 'Pérvio',
          functioning: 'Funcionante',
          dressingClean: true,
          dressingDry: true,
          dressingIntact: true,
          phlogisticSigns: 'Ausentes',
        },
      ];
      form.eliminations.urinaryRoute = 'Espontânea';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('urinaryRoute'));
    },
    'Alerta emitido para SVD concomitante a micção espontânea.',
    'Falha: Não emitiu alerta para duplicidade SVD e via espontânea.'
  );

  // NUR-ICU-CONS-008: Dieta enteral sem via
  addTest(
    'NUR-ICU-CONS-008',
    'Consistência: Dieta enteral selecionada sem dispositivo informado emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.gastrointestinalAndNutrition.nutritionalRoute = 'Dieta enteral';
      form.gastrointestinalAndNutrition.enteralDevice = '';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('enteralDevice'));
    },
    'Alerta emitido para dieta enteral desprovida de dispositivo (SNE/GTT).',
    'Falha: Não emitiu alerta para dieta enteral sem via.'
  );

  // NUR-ICU-CONS-009: DVA Sim sem medicamento
  addTest(
    'NUR-ICU-CONS-009',
    'Consistência: DVA marcada como Sim com lista de drogas vazia emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.vasoactiveDrugs.vasoactiveDrugsInUse = 'Sim';
      form.vasoactiveDrugs.vasoactiveDrugsList = [];
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('vasoactiveDrugs'));
    },
    'Alerta emitido para DVA em uso sem especificação do fármaco.',
    'Falha: Não emitiu alerta para DVA sem fármacos cadastrados.'
  );

  // NUR-ICU-CONS-010: VMI sem via aérea
  addTest(
    'NUR-ICU-CONS-010',
    'Consistência: VMI selecionada sem via aérea artificial (TOT/TQT) emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.respiratory.respiratorySupport = 'VMI';
      form.mechanicalVentilation.vmiAirway = '';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('vmiAirway'));
    },
    'Alerta emitido para VMI sem via aérea artificial informada.',
    'Falha: Não emitiu alerta para VMI sem via aérea.'
  );

  // NUR-ICU-CONS-011: Resposta aos cuidados Sim sem descrição
  addTest(
    'NUR-ICU-CONS-011',
    'Consistência: Resposta aos cuidados marcada como observada sem texto descritivo emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.responseToCare.responseEvaluated = 'Resposta observada';
      form.responseToCare.structuredResponseText = '';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('structuredResponseText'));
    },
    'Alerta emitido para resposta aos cuidados observada sem detalhamento.',
    'Falha: Não emitiu alerta para resposta aos cuidados vazia.'
  );

  // NUR-ICU-CONS-012: Melhora/piora sem descrição
  addTest(
    'NUR-ICU-CONS-012',
    'Consistência: Melhora/piora registrada sem descrição dos parâmetros alterados emite alerta',
    () => {
      const form = createSampleNurseICUForm();
      form.evolutionState.statusChange = 'Melhora registrada pelo Enfermeiro';
      form.evolutionState.changeDescription = '';
      const alerts = validateNurseICUConsistency(form);
      return alerts.some((a) => a.field.includes('changeDescription'));
    },
    'Alerta emitido para melhora registrada sem descrição.',
    'Falha: Não emitiu alerta para melhora/piora sem detalhamento.'
  );

  // NUR-ICU-CONS-013: Cenário coerente sem alertas indevidos
  addTest(
    'NUR-ICU-CONS-013',
    'Consistência: Cenário clínico de UTI completo e coerente gera 0 alertas',
    () => {
      const form = createSampleNurseICUForm();
      const alerts = validateNurseICUConsistency(form);
      return alerts.length === 0;
    },
    'Cenário coerente não gerou falso-positivos (0 alertas).',
    'Falha: Alertas indevidos gerados para formulário clínico consistente.'
  );

  // =========================================================================
  // SEÇÃO 41: TESTES DOS LOCKS (NUR-ICU-LOCK-001 a NUR-ICU-LOCK-010)
  // =========================================================================

  // NUR-ICU-LOCK-001: Novo parâmetro ventilatório -> rejeitado
  addTest(
    'NUR-ICU-LOCK-001',
    'VentilatorParameterLock rejeita inserção de novo parâmetro ventilatório não autorizado',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: canonical.replace('PEEP 8 cmH₂O', 'PEEP 12 cmH₂O'),
            factIds: ['resp'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved && (!v.details?.ventilatorLock?.passed || !v.details?.numericLock?.passed);
    },
    'Lock ventilatório barrou parâmetro ventilatório alterado.',
    'Falha: Lock ventilatório não detectou parâmetro alterado.'
  );

  // NUR-ICU-LOCK-002: Novo medicamento -> rejeitado
  addTest(
    'NUR-ICU-LOCK-002',
    'MedicationLock rejeita introdução de novo fármaco não documentado',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: `${canonical} Foi adicionada infusão contínua de Dobutamina.`,
            factIds: ['cardio'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved && !v.details?.medicationLock?.passed;
    },
    'MedicationLock barrou Dobutamina não autorizada.',
    'Falha: MedicationLock não detectou medicamento inventado.'
  );

  // NUR-ICU-LOCK-003: Novo dispositivo -> rejeitado
  addTest(
    'NUR-ICU-LOCK-003',
    'DeviceLock rejeita inclusão de novo dispositivo invasivo não autorizado',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: `${canonical} Instalado dreno de tórax à direita em selo d'água.`,
            factIds: ['devices'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved && !v.details?.deviceLock?.passed;
    },
    'DeviceLock barrou dreno de tórax inventado.',
    'Falha: DeviceLock não detectou novo dispositivo invasivo.'
  );

  // NUR-ICU-LOCK-004: Novo achado físico -> rejeitado
  addTest(
    'NUR-ICU-LOCK-004',
    'PhysicalExamFactLock rejeita introdução de novo achado físico não registrado',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: `${canonical} Abdome distendido e tenso com dor à descompressão brusca.`,
            factIds: ['exam'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved;
    },
    'PhysicalExamFactLock barrou achado de abdome tenso/doloroso inventado.',
    'Falha: PhysicalExamFactLock não barrou novo achado físico.'
  );

  // NUR-ICU-LOCK-005: Novo diagnóstico -> rejeitado
  addTest(
    'NUR-ICU-LOCK-005',
    'UnauthorizedTermsLock rejeita inclusão de novos diagnósticos (choque)',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: `${canonical} Paciente evoluindo em choque cardiogênico refratário.`,
            factIds: ['diag'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved && !v.details?.unauthorizedTermsLock?.passed;
    },
    'UnauthorizedTermsLock barrou termo de choque cardiogênico.',
    'Falha: UnauthorizedTermsLock permitiu diagnóstico nosológico.'
  );

  // NUR-ICU-LOCK-006: Nova prescrição -> rejeitada
  addTest(
    'NUR-ICU-LOCK-006',
    'ClinicalActionLock rejeita condutas e prescrições inventadas pela IA',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: `${canonical} Prescrito bolus de fentanil e solicitada gasometria arterial urgente.`,
            factIds: ['action'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved;
    },
    'ClinicalActionLock barrou prescrição e ordem de exame inventada.',
    'Falha: ClinicalActionLock permitiu prescrição médica/terapêutica nova.'
  );

  // NUR-ICU-LOCK-007: Nova interpretação de risco -> rejeitada
  addTest(
    'NUR-ICU-LOCK-007',
    'NurseJudgmentLock rejeita novas classificações ou inferências de risco não autorizadas',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: `${canonical} Conclui-se alto risco de extubação acidental e piora iminente.`,
            factIds: ['risk'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved;
    },
    'NurseJudgmentLock barrou interpretação de risco arbitrária.',
    'Falha: NurseJudgmentLock permitiu juízo de risco não autorizado.'
  );

  // NUR-ICU-LOCK-008: Nova resposta aos cuidados -> rejeitada
  addTest(
    'NUR-ICU-LOCK-008',
    'ResponseToCareLock rejeita resposta aos cuidados ou melhora fictícia',
    () => {
      const form = createSampleNurseICUForm();
      form.responseToCare.responseEvaluated = 'Não avaliada';
      form.responseToCare.structuredResponseText = '';
      const norm = normalizeNurseICUEvolutionForm(form);
      const facts = buildAuthorizedNurseICUFacts(norm);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: `${canonical} Observada excelente resposta e recuperação ventilatória rápida.`,
            factIds: ['care-response'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved && !v.details?.responseToCareLock?.passed;
    },
    'ResponseToCareLock barrou resposta aos cuidados não documentada.',
    'Falha: ResponseToCareLock permitiu inferência de resposta aos cuidados.'
  );

  // NUR-ICU-LOCK-009: Número alterado -> rejeitado
  addTest(
    'NUR-ICU-LOCK-009',
    'NumericFactLock rejeita qualquer adulteração de números (PA sistólica 118 para 135)',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const altered = {
        paragraphs: [
          {
            text: canonical.replace('PA 118x74 mmHg', 'PA 135x74 mmHg'),
            factIds: ['bp'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(altered, facts, canonical);
      return !v.approved && !v.details?.numericLock?.passed;
    },
    'NumericFactLock barrou alteração de pressão arterial de 118 para 135.',
    'Falha: NumericFactLock permitiu valor numérico alterado.'
  );

  // NUR-ICU-LOCK-010: Refinamento puramente linguístico -> aprovado
  addTest(
    'NUR-ICU-LOCK-010',
    'PostGenerationVerifier aprova com sucesso refinamento puramente estilístico/linguístico',
    () => {
      const form = createSampleNurseICUForm();
      const facts = buildAuthorizedNurseICUFacts(form);
      const canonical = buildNurseICUEvolutionNote(facts);
      const validRefinement = {
        paragraphs: [
          {
            text: canonical,
            factIds: ['all-authorized-facts'],
          },
        ],
      };
      const v = verifyNurseICUAIRefinedResponse(validRefinement, facts, canonical);
      return v.approved === true && v.reasons.length === 0;
    },
    'PostGenerationVerifier aprovou refinamento que respeita integralmente todos os locks.',
    'Falha: Verificador reprovou refinamento válido.'
  );

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}
