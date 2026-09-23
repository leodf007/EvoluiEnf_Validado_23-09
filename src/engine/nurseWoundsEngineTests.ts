import { EngineTestOutcome, EngineTestSummary } from './types';
import {
  createInitialNurseWoundsAssessmentForm,
  NurseWoundsAssessmentForm,
} from '../types/nurseWoundsAssessment';
import {
  buildAuthorizedNurseWoundsFacts,
  normalizeNurseWoundsAssessmentForm,
  validateNurseWoundsConsistency,
  auditNurseWoundsNarrative,
} from './nurseWoundsFactBuilder';
import {
  buildNurseWoundsAssessmentNote,
  buildNurseWoundsAssessmentNoteWithTrace,
} from './nurseWoundsAssessmentBuilder';
import { verifyNurseWoundsAIRefinedResponse } from './nurseWoundsPostGenerationVerifier';
import { verifyWoundFactLock } from './woundFactLock';
import { verifyDressingActionLock } from './dressingActionLock';
import {
  CLINICAL_MODULE_CONTRACTS,
  NURSE_WOUNDS_ASSESSMENT_CONTRACT,
} from './factory/moduleDefinitions';
import { NURSE_WOUNDS_ASSESSMENT } from './factory/nurseWoundsAssessmentModule';
import { MODULE_REGISTRY } from './moduleRegistry';

/**
 * Creates a rich, realistic sample form for Nurse Wounds Assessment.
 */
export function createSampleNurseWoundsAssessmentForm(): NurseWoundsAssessmentForm {
  const form = createInitialNurseWoundsAssessmentForm();

  // 1. Contexto da avaliação
  form.evaluationContext.evaluationDate = '2026-09-12';
  form.evaluationContext.evaluationTime = '14:30';
  form.evaluationContext.clinicalUnit = 'UTI Adulto';
  form.evaluationContext.bedLocation = 'Leito 05';

  // 2. Tipo de avaliação
  form.evaluationType.type = 'reavaliação';
  form.evaluationType.typeDetails = 'Acompanhamento do plano terapêutico de lesão';

  // 3. Identificação da lesão
  form.woundIdentification.woundType = 'lesão por pressão';
  form.woundIdentification.woundNumber = 'Lesão 1';

  // 4. Localização anatômica
  form.anatomicalLocation.region = 'sacral';
  form.anatomicalLocation.regionDetails = 'Região sacrococcígea central';

  // 5. Lateralidade
  form.laterality.side = 'não informado';

  // 6. Tempo de existência informado
  form.reportedDuration.durationText = 'há 10 dias';

  // 7. Origem informada
  form.reportedOrigin.origin = 'intra-hospitalar';

  // 8. Medidas da lesão
  form.woundMeasurements.lengthCm = '6.5';
  form.woundMeasurements.widthCm = '4.0';
  form.woundMeasurements.depthCm = '1.2';
  form.woundMeasurements.measurementUnit = 'cm';

  // 9. Características do leito
  form.woundBed.tissues = ['granulação', 'esfacelo'];
  form.woundBed.otherTissueDetails = '70% tecido de granulação vermelho vivo e 30% esfacelo amarelado aderido';

  // 10. Bordas
  form.woundEdges.characteristics = ['maceradas', 'descoladas'];
  form.woundEdges.edgeDetails = 'Bordas maceradas e discretamente descoladas em bordo superior';

  // 11. Pele ao redor
  form.perilesionalSkin.characteristics = ['hiperemia', 'edema'];
  form.perilesionalSkin.skinDetails = 'Hiperemia perilesional sem calor local';

  // 12. Exsudato
  form.exudate.present = 'Sim';
  form.exudate.type = 'serossanguinolento';
  form.exudate.amount = 'moderada';
  form.exudate.exudateDetails = 'Sem extravasamento de curativo prévio';

  // 13. Odor
  form.odor.present = 'ausente';

  // 14. Dor relacionada
  form.woundPain.hasPain = 'Sim';
  form.woundPain.painScale = 'numérica';
  form.woundPain.painScore = '4';
  form.woundPain.painDetails = 'Dor em pontada referida durante a manipulação';

  // 15. Classificação / Estadiamento informado
  form.staging.stage = 'estágio 3';
  form.staging.stagingNotes = 'Classificação privativa conforme diretrizes NPUAP';

  // 16. Túneis e descolamentos
  form.tunneling.present = 'Sim';
  form.tunneling.clockPosition = 'às 12 horas';
  form.tunneling.depthCm = '1.0';
  form.tunneling.details = 'Descolamento subjacente às 12h medindo 1.0 cm';

  // 17. Sinais observados
  form.observedSigns.signs = ['sangramento ao toque'];
  form.observedSigns.signsDetails = 'Discreto sangramento após limpeza cuidadosa';

  // 18. Dispositivos relacionados
  form.relatedDevices.hasRelatedDevices = 'Sim';
  form.relatedDevices.devices = [
    {
      deviceType: 'Sonda Vesical de Demora',
      anatomicalSite: 'Uretra',
      condition: 'fixada e pérvia, sem tração sobre o sítio sacral',
    },
  ];

  // 19. Cobertura atual encontrada
  form.currentCovering.coveringFound = 'Placa de hidrocolóide com saturação de cerca de 50%';

  // 20. Curativo realizado
  form.dressingProcedure.performed = 'Sim';
  form.dressingProcedure.cleansingSolution = 'Solução Fisiológica 0,9%';
  form.dressingProcedure.cleansingTechnique = 'Irrigação sob baixa pressão com agulha 40x12';
  form.dressingProcedure.primaryDressing = 'Alginato de cálcio em fita no leito e hidrogel';
  form.dressingProcedure.secondaryDressing = 'Gaze estéril dobrada';
  form.dressingProcedure.fixation = 'Fita microporosa hipoalergênica';

  // 21. Produtos utilizados
  form.productsUsed.products = ['Solução Fisiológica 0,9%', 'Alginato de cálcio', 'Hidrogel amorfo'];
  form.productsUsed.productDetails = 'Aplicado hidrogel sobre área com esfacelo';

  // 22. Resposta observada
  form.observedResponse.patientTolerance = 'Boa tolerância ao procedimento, sem queixas álgicas agudas';
  form.observedResponse.immediateOutcome = 'Curativo limpo, seco e oclusivo ao término';

  // 23. Comparação com avaliação anterior
  form.previousComparison.comparison = 'melhora observada';
  form.previousComparison.comparisonNotes = 'Evolução favorável com aumento do tecido de granulação em relação ao registro prévio';

  // 24. Conduta registrada pelo enfermeiro
  form.nurseConduct.dressingFrequency = 'Troca diária ou se apresentar saturação/descolamento';
  form.nurseConduct.guidance = 'Orientada equipe para mudança de decúbito a cada 2 horas e alívio de pressão sacral';

  // 25. Informações adicionais
  form.additionalInfo.notes = 'Manter colchão pneumático ativo em nível terapêutico.';

  return form;
}

/**
 * Runs the full test suite for NURSE_WOUNDS_ASSESSMENT (WOUND-001 to WOUND-023 and WOUND-CONS-001 to WOUND-CONS-008).
 */
export function runNurseWoundsTests(): {
  suite: string;
  tests: EngineTestOutcome[];
  summary: EngineTestSummary;
} {
  const tests: EngineTestOutcome[] = [];

  const addTest = (id: string, name: string, passed: boolean, message: string) => {
    tests.push({ id, name, passed, message });
  };

  const sampleForm = createSampleNurseWoundsAssessmentForm();
  const sampleNorm = normalizeNurseWoundsAssessmentForm(sampleForm);
  const sampleFacts = buildAuthorizedNurseWoundsFacts(sampleNorm);
  const { narrative: sampleNarrative, traces: sampleTraces } =
    buildNurseWoundsAssessmentNoteWithTrace(sampleFacts);

  // WOUND-001: Módulo registrado no Factory e ModuleRegistry
  const moduleContract = CLINICAL_MODULE_CONTRACTS.find(
    (c) => c.definition.id === 'NURSE_WOUNDS_ASSESSMENT'
  );
  addTest(
    'WOUND-001',
    'Módulo registrado no Factory e presente em CLINICAL_MODULE_CONTRACTS',
    moduleContract !== undefined && MODULE_REGISTRY.nurse_wounds.status === 'available',
    `Contrato: ${moduleContract ? 'presente' : 'ausente'}; ModuleRegistry: ${MODULE_REGISTRY.nurse_wounds.status}`
  );

  // WOUND-002: Estrutura contém todas as 25 seções obrigatórias
  const sectionCount = NURSE_WOUNDS_ASSESSMENT.sections.length;
  addTest(
    'WOUND-002',
    'Módulo define exatamente 25 seções estruturadas',
    sectionCount === 25,
    `Seções encontradas: ${sectionCount}/25`
  );

  // WOUND-003: WoundFactLock bloqueia diagnóstico automático de infecção
  const infectionCheck = verifyWoundFactLock(
    'Nota clínica: ferida com infecção evidente e processo infeccioso bacteriano grave.',
    sampleFacts
  );
  addTest(
    'WOUND-003',
    'WoundFactLock bloqueia diagnóstico de infecção não registrado pelo enfermeiro',
    !infectionCheck.passed && infectionCheck.details.unauthorizedInfection.length > 0,
    `Violações detectadas: ${infectionCheck.details.unauthorizedInfection.join(', ')}`
  );

  // WOUND-004: WoundFactLock bloqueia inferência de causa/etiologia não informada
  const causeCheck = verifyWoundFactLock(
    'Lesão causada por forças de fricção e cisalhamento decorrente de neuropatia motora.',
    sampleFacts
  );
  addTest(
    'WOUND-004',
    'WoundFactLock bloqueia causa/etiologia deduzida automaticamente pela IA',
    !causeCheck.passed && causeCheck.details.unauthorizedEtiology.length > 0,
    `Violações detectadas: ${causeCheck.details.unauthorizedEtiology.join(', ')}`
  );

  // WOUND-005: WoundFactLock bloqueia estadiamento automático não informado
  const unrecordedStagingFacts = buildAuthorizedNurseWoundsFacts(createInitialNurseWoundsAssessmentForm());
  const stagingCheck = verifyWoundFactLock(
    'Avaliação: lesão estadiada como estágio 4 com exposição óssea.',
    unrecordedStagingFacts
  );
  addTest(
    'WOUND-005',
    'WoundFactLock bloqueia estadiamento atribuído pela IA sem registro do enfermeiro',
    !stagingCheck.passed && stagingCheck.details.unauthorizedStaging.length > 0,
    `Violações detectadas: ${stagingCheck.details.unauthorizedStaging.join(', ')}`
  );

  // WOUND-006: WoundFactLock bloqueia prognóstico de cicatrização
  const prognosisCheck = verifyWoundFactLock(
    'Apresenta excelente prognóstico de cicatrização com tempo estimado de cura em 15 dias.',
    sampleFacts
  );
  addTest(
    'WOUND-006',
    'WoundFactLock bloqueia prognóstico e previsão temporal de cicatrização',
    !prognosisCheck.passed && prognosisCheck.details.unauthorizedPrognosis.length > 0,
    `Violações detectadas: ${prognosisCheck.details.unauthorizedPrognosis.join(', ')}`
  );

  // WOUND-007: WoundFactLock bloqueia indicação terapêutica invasiva não prescrita
  const indicationCheck = verifyWoundFactLock(
    'Recomenda-se encaminhamento para debridamento cirúrgico em centro cirúrgico e terapia de pressão negativa.',
    sampleFacts
  );
  addTest(
    'WOUND-007',
    'WoundFactLock bloqueia indicação terapêutica não registrada pelo enfermeiro',
    !indicationCheck.passed && indicationCheck.details.unauthorizedTherapeuticIndication.length > 0,
    `Violações detectadas: ${indicationCheck.details.unauthorizedTherapeuticIndication.join(', ')}`
  );

  // WOUND-008: DressingActionLock bloqueia produto não registrado
  const dressingProductCheck = verifyDressingActionLock(
    'Realizado curativo com aplicação de sulfadiazina de prata a 1% e colagenase tópica.',
    sampleFacts
  );
  addTest(
    'WOUND-008',
    'DressingActionLock bloqueia produtos farmacológicos e coberturas não registrados',
    !dressingProductCheck.passed && dressingProductCheck.details.unauthorizedProducts.length > 0,
    `Violações detectadas: ${dressingProductCheck.details.unauthorizedProducts.join(', ')}`
  );

  // WOUND-009: DressingActionLock bloqueia ação cirúrgica/desbridamento não executado
  const dressingActionCheck = verifyDressingActionLock(
    'Procedido a desbridamento cortante e instrumental com bisturi no leito.',
    sampleFacts
  );
  addTest(
    'WOUND-009',
    'DressingActionLock bloqueia procedimentos de desbridamento não documentados',
    !dressingActionCheck.passed && dressingActionCheck.details.unauthorizedTechniques.length > 0,
    `Violações detectadas: ${dressingActionCheck.details.unauthorizedTechniques.join(', ')}`
  );

  // WOUND-010: Normalizer manipula formulário completo com sanitização
  const messyForm = createSampleNurseWoundsAssessmentForm();
  messyForm.woundMeasurements.lengthCm = ' 6.5 cm ';
  messyForm.woundBed.tissues = [' granulação ', 'esfacelo'];
  const normResult = normalizeNurseWoundsAssessmentForm(messyForm);
  addTest(
    'WOUND-010',
    'Normalizador higieniza medidas e tecidos com segurança',
    normResult.woundMeasurements.lengthCm === '6.5' && normResult.woundBed.tissues[0] === 'granulação',
    `Comprimento: "${normResult.woundMeasurements.lengthCm}", Tecido: "${normResult.woundBed.tissues[0]}"`
  );

  // WOUND-011: Normalizer manipula formulário inicial vazio sem crash
  const emptyForm = createInitialNurseWoundsAssessmentForm();
  const emptyNorm = normalizeNurseWoundsAssessmentForm(emptyForm);
  addTest(
    'WOUND-011',
    'Normalizador processa formulário inicial com defaults íntegros',
    emptyNorm.anatomicalLocation.region === '' && emptyNorm.exudate.present === 'Não',
    `Região: "${emptyNorm.anatomicalLocation.region}", Exsudato: "${emptyNorm.exudate.present}"`
  );

  // WOUND-012: FactsBuilder gera fatos autorizados para medidas da lesão
  const measurementsFact = sampleFacts.woundMeasurements?.[0];
  addTest(
    'WOUND-012',
    'FactsBuilder gera AuthorizedClinicalFact preciso para medidas (6.5 x 4.0 x 1.2 cm)',
    measurementsFact !== undefined &&
      measurementsFact.value.lengthCm === '6.5' &&
      measurementsFact.value.widthCm === '4.0' &&
      measurementsFact.value.depthCm === '1.2',
    `Medidas no fato: ${JSON.stringify(measurementsFact?.value)}`
  );

  // WOUND-013: FactsBuilder gera fatos autorizados para tecidos do leito
  const bedFact = sampleFacts.woundBed?.[0];
  addTest(
    'WOUND-013',
    'FactsBuilder gera fatos para leito contendo tecidos observados',
    bedFact !== undefined &&
      bedFact.value.tissues.includes('granulação') &&
      bedFact.value.tissues.includes('esfacelo'),
    `Tecidos no fato: ${JSON.stringify(bedFact?.value?.tissues)}`
  );

  // WOUND-014: FactsBuilder gera fatos para exsudato e odor
  const exudateFact = sampleFacts.exudate?.[0];
  const odorFact = sampleFacts.odor?.[0];
  addTest(
    'WOUND-014',
    'FactsBuilder gera fatos para exsudato serossanguinolento e odor ausente',
    exudateFact !== undefined &&
      odorFact !== undefined &&
      exudateFact.value.type === 'serossanguinolento' &&
      odorFact.value.present === 'ausente',
    `Exsudato: "${exudateFact?.value?.type}", Odor: "${odorFact?.value?.present}"`
  );

  // WOUND-015: FactsBuilder gera fatos autorizados para dor relacionada
  const painFact = sampleFacts.woundPain?.[0];
  addTest(
    'WOUND-015',
    'FactsBuilder gera fatos para avaliação de dor (escore 4)',
    painFact !== undefined && painFact.value.painScore === '4',
    `Dor: "${painFact?.value?.painScore}"`
  );

  // WOUND-016: FactsBuilder gera fatos autorizados para curativo e produtos
  const procFact = sampleFacts.dressingProcedure?.[0];
  const prodFact = sampleFacts.productsUsed?.[0];
  addTest(
    'WOUND-016',
    'FactsBuilder gera fatos para técnica de curativo e produtos aplicados',
    procFact !== undefined &&
      prodFact !== undefined &&
      prodFact.value.products.includes('Alginato de cálcio'),
    `Produtos: ${JSON.stringify(prodFact?.value?.products)}`
  );

  // WOUND-017: DeterministicBuilder inclui medidas, leito, curativo e conduta
  const hasMedidas = sampleNarrative.includes('6.5') && sampleNarrative.includes('4.0') && sampleNarrative.includes('1.2');
  const hasLeito = sampleNarrative.includes('granulação') && sampleNarrative.includes('esfacelo');
  const hasConduta = sampleNarrative.includes('Troca diária');
  addTest(
    'WOUND-017',
    'DeterministicBuilder gera texto narrativo clínico completo e coeso',
    hasMedidas && hasLeito && hasConduta,
    `Narrativa contém medidas: ${hasMedidas}, leito: ${hasLeito}, conduta: ${hasConduta}`
  );

  // WOUND-018: DeterministicBuilder anota rastreabilidade (NarrativeFactTrace)
  addTest(
    'WOUND-018',
    'DeterministicBuilder gera NarrativeFactTrace completo para todas as sentenças',
    sampleTraces.length >= 8 && sampleTraces.every((t) => t.factIds.length > 0),
    `Traces gerados: ${sampleTraces.length}, todos com fatos mapeados.`
  );

  // WOUND-019: NarrativeAuditor aprova narrativa puramente determinística
  const auditSuccess = auditNurseWoundsNarrative(sampleNarrative, sampleFacts);
  addTest(
    'WOUND-019',
    'NarrativeAuditor valida 100% de rastreabilidade na narrativa determinística',
    auditSuccess.passed && auditSuccess.untraceableSegments.length === 0,
    `Auditoria determinística: ${auditSuccess.passed ? 'Aprovada' : 'Reprovada'}`
  );

  // WOUND-020: NarrativeAuditor detecta e reprova conteúdo não rastreável
  const hallucinatedText = sampleNarrative + ' Paciente com excelente tolerância à dor e sem risco de sepse.';
  const auditHallucination = auditNurseWoundsNarrative(hallucinatedText, sampleFacts);
  addTest(
    'WOUND-020',
    'NarrativeAuditor identifica segmentos não rastreáveis aos fatos autorizados',
    !auditHallucination.passed && auditHallucination.untraceableSegments.length > 0,
    `Segmentos identificados: ${auditHallucination.untraceableSegments.join('; ')}`
  );

  const allSampleFactIds = Object.values(sampleFacts).flatMap((cat) =>
    Array.isArray(cat) ? cat.map((f) => f.id) : []
  );

  // WOUND-021: PostGenerationVerifier aprova texto refinado válido
  const validRefined = {
    paragraphs: [{ text: sampleNarrative, factIds: allSampleFactIds }],
    usedFactIds: allSampleFactIds,
    confidenceScore: 0.98,
  };
  const verifierPass = verifyNurseWoundsAIRefinedResponse(validRefined, sampleFacts, sampleNarrative);
  addTest(
    'WOUND-021',
    'PostGenerationVerifier aprova saída refinada compatível com todos os fatos',
    verifierPass.approved && verifierPass.reasons.length === 0,
    `Status: ${verifierPass.approved ? 'Aprovado' : 'Rejeitado'}, razões: ${verifierPass.reasons.join('; ')}`
  );

  // WOUND-022: PostGenerationVerifier rejeita refinamento com produto não autorizado
  const invalidProductRefined = {
    paragraphs: [
      {
        text: sampleNarrative + ' Realizada cobertura com papaína a 10% e pomada de sulfadiazina de prata.',
        factIds: allSampleFactIds,
      },
    ],
    usedFactIds: allSampleFactIds,
    confidenceScore: 0.95,
  };
  const verifierFailProduct = verifyNurseWoundsAIRefinedResponse(
    invalidProductRefined,
    sampleFacts,
    sampleNarrative
  );
  addTest(
    'WOUND-022',
    'PostGenerationVerifier rejeita refinamento contendo produtos não registrados',
    !verifierFailProduct.approved && verifierFailProduct.reasons.some((r) => r.includes('DressingActionLock')),
    `Razões: ${verifierFailProduct.reasons.join('; ')}`
  );

  // WOUND-023: PostGenerationVerifier rejeita refinamento com diagnóstico/prognóstico não autorizado
  const invalidInferenceRefined = {
    paragraphs: [
      {
        text: sampleNarrative + ' Observa-se ferida infectada com evolução compatível com sepse de foco cutâneo.',
        factIds: allSampleFactIds,
      },
    ],
    usedFactIds: allSampleFactIds,
    confidenceScore: 0.95,
  };
  const verifierFailInference = verifyNurseWoundsAIRefinedResponse(
    invalidInferenceRefined,
    sampleFacts,
    sampleNarrative
  );
  addTest(
    'WOUND-023',
    'PostGenerationVerifier rejeita refinamento contendo inferência diagnóstica e prognóstica',
    !verifierFailInference.approved && verifierFailInference.reasons.some((r) => r.includes('WoundFactLock')),
    `Razões: ${verifierFailInference.reasons.join('; ')}`
  );

  // CONSISTENCY TESTS: WOUND-CONS-001 to WOUND-CONS-008

  // WOUND-CONS-001: Região anatômica faltante gera erro
  const formMissingRegion = createSampleNurseWoundsAssessmentForm();
  formMissingRegion.anatomicalLocation.region = '' as any;
  const resCons1 = validateNurseWoundsConsistency(formMissingRegion);
  addTest(
    'WOUND-CONS-001',
    'Consistência: Região anatômica da lesão é obrigatória',
    resCons1.errors.some((e) => e.includes('Localização anatômica da lesão')),
    `Erros encontrados: ${resCons1.errors.join('; ')}`
  );

  // WOUND-CONS-002: Medidas não numéricas ou negativas geram erro
  const formInvalidMeasures = createSampleNurseWoundsAssessmentForm();
  formInvalidMeasures.woundMeasurements.lengthCm = '-5';
  const resCons2 = validateNurseWoundsConsistency(formInvalidMeasures);
  addTest(
    'WOUND-CONS-002',
    'Consistência: Medidas negativas geram erro de validação',
    resCons2.errors.some((e) => e.includes('Comprimento da lesão deve ser um valor positivo')),
    `Erros encontrados: ${resCons2.errors.join('; ')}`
  );

  // WOUND-CONS-003: Exsudato presente sem tipo especificado
  const formExudateNoType = createSampleNurseWoundsAssessmentForm();
  formExudateNoType.exudate.present = 'Sim';
  formExudateNoType.exudate.type = '' as any;
  const resCons3 = validateNurseWoundsConsistency(formExudateNoType);
  addTest(
    'WOUND-CONS-003',
    'Consistência: Exsudato marcado como "Sim" sem tipo gera erro',
    resCons3.errors.some((e) => e.includes('tipo de exsudato deve ser especificado')),
    `Erros encontrados: ${resCons3.errors.join('; ')}`
  );

  // WOUND-CONS-004: Dor presente sem escore
  const formPainNoScore = createSampleNurseWoundsAssessmentForm();
  formPainNoScore.woundPain.hasPain = 'Sim';
  formPainNoScore.woundPain.painScore = '';
  const resCons4 = validateNurseWoundsConsistency(formPainNoScore);
  addTest(
    'WOUND-CONS-004',
    'Consistência: Dor marcada como "Sim" sem escore numérico gera aviso/erro',
    resCons4.warnings.some((w) => w.includes('Dor relacionada indicada como presente sem escore')),
    `Avisos encontrados: ${resCons4.warnings.join('; ')}`
  );

  // WOUND-CONS-005: Curativo realizado sem solução de limpeza
  const formDressingNoSolution = createSampleNurseWoundsAssessmentForm();
  formDressingNoSolution.dressingProcedure.performed = 'Sim';
  formDressingNoSolution.dressingProcedure.cleansingSolution = '';
  const resCons5 = validateNurseWoundsConsistency(formDressingNoSolution);
  addTest(
    'WOUND-CONS-005',
    'Consistência: Curativo realizado sem solução de limpeza gera erro',
    resCons5.errors.some((e) => e.includes('solução de limpeza')),
    `Erros encontrados: ${resCons5.errors.join('; ')}`
  );

  // WOUND-CONS-006: Leito sem nenhum tecido selecionado
  const formNoTissues = createSampleNurseWoundsAssessmentForm();
  formNoTissues.woundBed.tissues = [];
  const resCons6 = validateNurseWoundsConsistency(formNoTissues);
  addTest(
    'WOUND-CONS-006',
    'Consistência: Leito da lesão sem nenhum tecido selecionado gera erro',
    resCons6.errors.some((e) => e.includes('Pelo menos um tipo de tecido')),
    `Erros encontrados: ${resCons6.errors.join('; ')}`
  );

  // WOUND-CONS-007: Túneis marcados como "Sim" sem posição ou profundidade
  const formTunnelNoDetails = createSampleNurseWoundsAssessmentForm();
  formTunnelNoDetails.tunneling.present = 'Sim';
  formTunnelNoDetails.tunneling.clockPosition = '';
  formTunnelNoDetails.tunneling.depthCm = '';
  const resCons7 = validateNurseWoundsConsistency(formTunnelNoDetails);
  addTest(
    'WOUND-CONS-007',
    'Consistência: Túneis e descolamentos marcados como "Sim" sem detalhamento geram aviso',
    resCons7.warnings.some((w) => w.includes('Túneis ou descolamentos indicados sem posição')),
    `Avisos encontrados: ${resCons7.warnings.join('; ')}`
  );

  // WOUND-CONS-008: Dispositivos relacionados "Sim" sem nenhum dispositivo adicionado
  const formDevicesNoItems = createSampleNurseWoundsAssessmentForm();
  formDevicesNoItems.relatedDevices.hasRelatedDevices = 'Sim';
  formDevicesNoItems.relatedDevices.devices = [];
  const resCons8 = validateNurseWoundsConsistency(formDevicesNoItems);
  addTest(
    'WOUND-CONS-008',
    'Consistência: Dispositivos relacionados "Sim" sem itens na lista gera erro',
    resCons8.errors.some((e) => e.includes('nenhum dispositivo foi inserido')),
    `Erros encontrados: ${resCons8.errors.join('; ')}`
  );

  const passedCount = tests.filter((t) => t.passed).length;
  const failedCount = tests.length - passedCount;

  return {
    suite: 'NurseWoundsEngineTests',
    tests,
    summary: {
      total: tests.length,
      passed: passedCount,
      failed: failedCount,
      results: tests,
    },
  };
}
