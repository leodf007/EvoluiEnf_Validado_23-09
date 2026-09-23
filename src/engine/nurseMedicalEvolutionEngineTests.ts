import { EngineTestOutcome, EngineTestSummary } from './types';
import {
  createInitialNurseMedicalEvolutionForm,
  NurseMedicalEvolutionForm,
} from '../types/nurseMedicalEvolution';
import {
  buildAuthorizedNurseMedicalEvolutionFacts,
  normalizeNurseMedicalEvolutionForm,
  validateNurseMedicalEvolutionConsistency,
  auditNurseMedicalEvolutionNarrative,
} from './nurseMedicalEvolutionFactBuilder';
import {
  buildNurseMedicalEvolutionNote,
  buildNurseMedicalEvolutionNoteWithTrace,
} from './nurseMedicalEvolutionNoteBuilder';
import { verifyNurseMedicalEvolutionAIRefinedResponse } from './nurseMedicalEvolutionPostGenerationVerifier';
import {
  CLINICAL_MODULE_CONTRACTS,
  NURSE_EVOLUTION_MEDICAL_CLINIC_CONTRACT,
} from './factory/moduleDefinitions';
import { NURSE_EVOLUTION_MEDICAL_CLINIC } from './factory/nurseMedicalClinicModule';
import { MODULE_REGISTRY } from './moduleRegistry';
import { checkPrivacyGuards } from './privacyGuard';

/**
 * Creates a rich, realistic Nurse Medical Clinic Evolution form
 * representing a complex inpatient ward scenario.
 */
export function createSampleNurseMedicalEvolutionForm(): NurseMedicalEvolutionForm {
  const form = createInitialNurseMedicalEvolutionForm();

  // 1. Context
  form.context.moment = 'Início do plantão';
  form.context.location = 'Enfermaria Clínica';
  form.context.escort = 'Familiar';
  form.context.wristbandIdentification = 'Conferida';
  form.context.bedIdentification = 'Conferida';
  form.context.precaution = 'Padrão';
  form.context.hasAllergies = 'Não referidas';

  // 2. General Assessment
  form.generalAssessment.generalState = 'Regular';
  form.generalAssessment.consciousness = 'Lúcido';
  form.generalAssessment.behavior = ['Calmo', 'Orientado', 'Cooperativo'];
  form.generalAssessment.complaintStatus = 'Com queixa';
  form.generalAssessment.complaintDescription = 'Discreta dor lombar ao mudar de posição';
  form.generalAssessment.informationSource = 'Paciente';

  // 3. Vital Signs
  form.vitalSigns.systolicBP = '130';
  form.vitalSigns.diastolicBP = '85';
  form.vitalSigns.meanArterialPressure = '100';
  form.vitalSigns.heartRate = '76';
  form.vitalSigns.respiratoryRate = '18';
  form.vitalSigns.oxygenSaturation = '96';
  form.vitalSigns.temperature = '36.8';
  form.vitalSigns.capillaryBloodGlucose = '118';

  // 4. Pain
  form.pain.painScaleType = 'Escala Numérica (0-10)';
  form.pain.painScore = '3/10';
  form.pain.painLocation = 'Região lombar';
  form.pain.painCharacteristic = 'Em queimação leve';
  form.pain.painObservation = 'Piora à movimentação';

  // 5. Neurological
  form.neurological.consciousnessLevel = 'Alerta';
  form.neurological.orientation = 'Orientado no tempo e espaço';
  form.neurological.glasgowScore = '15';
  form.neurological.pupils = 'Isocóricas';
  form.neurological.photoreaction = 'Reagentes';
  form.neurological.motorDeficit = 'Ausente';

  // 6. Respiratory
  form.respiratory.respiratorySupport = 'Ar ambiente';
  form.respiratory.respiratoryPattern = 'Eupneico';
  form.respiratory.respiratoryDistress = 'Ausente';
  form.respiratory.pulmonaryAuscultationPerformed = 'Sim';
  form.respiratory.vesicularMurmur = 'Presente universalmente';
  form.respiratory.adventitiousSounds = 'Ausentes';

  // 7. Cardiovascular
  form.cardiovascular.peripheralPerfusion = 'Adequada';
  form.cardiovascular.extremities = 'Aquecidas';
  form.cardiovascular.capillaryRefillTime = '< 2 segundos (normal)';
  form.cardiovascular.edema = 'Ausente';
  form.cardiovascular.cardiacAuscultationPerformed = 'Sim';
  form.cardiovascular.heartSounds = 'Normofonéticas em 2T';
  form.cardiovascular.rhythm = 'Ritmo regular';

  // 8. Gastrointestinal
  form.gastrointestinal.abdomenForm = 'Plano';
  form.gastrointestinal.abdomenConsistency = 'Flácido';
  form.gastrointestinal.abdomenPalpation = 'Indolor';
  form.gastrointestinal.bowelSounds = 'Presentes e normoativos';

  // 9. Nutrition
  form.nutrition.nutritionalRoute = 'Via oral';
  form.nutrition.oralAcceptance = 'Boa aceitação (> 75%)';

  // 10. Eliminations
  form.eliminations.diuresis = 'Presente';
  form.eliminations.urinaryRoute = 'Espontânea';
  form.eliminations.urineAspect = 'Amarelo claro límpido';
  form.eliminations.bowelElimination = 'Presente';
  form.eliminations.bowelAspect = 'Fezes pastosas e formadas';

  // 11. Devices
  form.devices.list = [
    {
      id: 'dev-1',
      type: 'Acesso Venoso Periférico (AVP)',
      anatomicalSite: 'MSE',
      laterality: 'Esquerdo',
      siteCondition: 'Sem sinais flogísticos',
      dressingCondition: 'Limpo e seco',
      permeability: 'Pérvio',
    },
  ];

  // 12. Skin
  form.skin.integrity = 'Íntegra';
  form.skin.hydration = 'Hidratada';

  // 13. Mobility
  form.mobility.mobility = 'Deambula com auxílio';
  form.mobility.repositioning = 'Realizada pelo paciente';

  // 14. Hygiene
  form.hygiene.hygieneStatus = 'Satisfatória';
  form.hygiene.bath = 'De aspersão com auxílio';
  form.hygiene.bathTolerance = 'Boa tolerância sem intercorrências';

  // 15. Risks
  form.riskAssessment.fallRiskStatus = 'Avaliado';
  form.riskAssessment.fallRiskScale = 'Morse';
  form.riskAssessment.fallRiskScore = '35';
  form.riskAssessment.fallRiskClassification = 'Médio risco';
  form.riskAssessment.pressureInjuryRiskStatus = 'Avaliado';
  form.riskAssessment.pressureInjuryScale = 'Braden';
  form.riskAssessment.pressureInjuryScore = '18';
  form.riskAssessment.pressureInjuryClassification = 'Sem risco';

  // 16. Care Done
  form.careDone.careItems = [
    'Higiene e conforto',
    'Administração de medicamentos prescritos',
    'Orientações ao paciente/acompanhante',
    'Auxílio na deambulação',
  ];
  form.careDone.customCareDetails = 'Orientado quanto à prevenção de quedas e acionamento da campainha';

  // 17. Response to Care
  form.responseToCare.evaluated = 'Sim';
  form.responseToCare.interventionDone = 'orientações posturais e auxílio';
  form.responseToCare.observedResponse = 'compreendeu as orientações e deambulou com segurança';

  // 18. Complications
  form.complications.hasComplication = 'Não';

  // 19. Communication
  form.communication.hasCommunication = 'Sim';
  form.communication.target = 'Fisioterapia motora';
  form.communication.time = '10:30';
  form.communication.reason = 'Alinhamento do plano de marcha';
  form.communication.responseObserved = 'Agendado atendimento conjunto no período da tarde';

  // 20. Comparison
  form.comparisonWithPrevious.statusChange = 'Quadro clínico estável';
  form.comparisonWithPrevious.changeDescription = 'Mantém padrão estável em relação ao plantão noturno';

  // 21. Nursing Synthesis
  form.nursingSynthesis.synthesisText =
    'Paciente com boa estabilidade hemodinâmica e ventilatória em enfermaria clínica. Risco moderado para quedas com medidas preventivas ativas implementadas. Segue sob vigilância assistencial.';

  // 22. Current Status
  form.currentStatus.status = 'Permanece estável na enfermaria';

  return form;
}

export interface NurseMedicalTestResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
}

export interface NurseMedicalTestSummary {
  total: number;
  passed: number;
  failed: number;
  results: NurseMedicalTestResult[];
}

/**
 * Runs test suite NUR-CM-001 to NUR-CM-029 and NUR-CM-CONS-001 to NUR-CM-CONS-008.
 */
export function runNurseMedicalEvolutionEngineTests(): NurseMedicalTestSummary {
  const results: NurseMedicalTestResult[] = [];

  const runTest = (id: string, name: string, fn: () => void) => {
    try {
      fn();
      results.push({ id, name, passed: true, message: 'Aprovado com sucesso.' });
    } catch (err: any) {
      results.push({
        id,
        name,
        passed: false,
        message: err?.message || String(err),
      });
    }
  };

  // NUR-CM-001: Contrato do Módulo V1
  runTest('NUR-CM-001', 'Contrato do módulo V1 implementado e registrado com conformidade estrutural', () => {
    const contract = NURSE_EVOLUTION_MEDICAL_CLINIC_CONTRACT;
    if (!contract) throw new Error('Contrato NURSE_EVOLUTION_MEDICAL_CLINIC_CONTRACT não encontrado');
    if (contract.definition.id !== 'NURSE_EVOLUTION_MEDICAL_CLINIC') {
      throw new Error(`ID incorreto: ${contract.definition.id}`);
    }
    if (contract.definition.professionalRole !== 'nurse') {
      throw new Error(`Role deve ser nurse, recebido: ${contract.definition.professionalRole}`);
    }
    if (contract.route !== 'nurse-evolution-medical-clinic') {
      throw new Error(`Rota incorreta: ${contract.route}`);
    }
    if (!contract.definition.capabilities.supportsNurseClinicalSynthesis) {
      throw new Error('Módulo de Enfermeiro deve suportar supportsNurseClinicalSynthesis');
    }
    const inCatalog = CLINICAL_MODULE_CONTRACTS.some((c) => c.definition.id === 'NURSE_EVOLUTION_MEDICAL_CLINIC');
    if (!inCatalog) throw new Error('Contrato não cadastrado em CLINICAL_MODULE_CONTRACTS');
  });

  // NUR-CM-002: Identificação Ativa (Pulseira e Leito)
  runTest('NUR-CM-002', 'Identificação ativa por pulseira e leito conferida e preservada no texto canônico', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.context.wristbandIdentification = 'Conferida';
    form.context.bedIdentification = 'Conferida';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Pulseira de identificação conferida: Conferida')) {
      throw new Error('Pulseira não encontrada no texto gerado');
    }
    if (!text.includes('Identificação do leito conferida: Conferida')) {
      throw new Error('Identificação do leito não encontrada no texto gerado');
    }
  });

  // NUR-CM-003: Alergias e Precauções
  runTest('NUR-CM-003', 'Registro estrito de alergias e precauções sem generalizações indevidas', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.context.precaution = 'Contato';
    form.context.hasAllergies = 'Sim';
    form.context.allergyDescription = 'Dipirona e Penicilina';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Precaução: Contato')) throw new Error('Precaução de contato não registrada');
    if (!text.includes('Dipirona e Penicilina')) throw new Error('Alergias não registradas no texto');
  });

  // NUR-CM-004: Estado Geral e Nível de Consciência
  runTest('NUR-CM-004', 'Estado geral e nível de consciência refletidos fidedignamente', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.generalAssessment.generalState = 'Regular';
    form.generalAssessment.consciousness = 'Lúcido';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Estado geral: Regular')) throw new Error('Estado geral ausente');
    if (!text.includes('Nível de consciência: Lúcido')) throw new Error('Nível de consciência ausente');
  });

  // NUR-CM-005: Comportamento e Interação
  runTest('NUR-CM-005', 'Comportamento e interação registrados sem inferências psicológicas não autorizadas', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.generalAssessment.behavior = ['Calmo', 'Cooperativo'];
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Comportamento: Calmo, Cooperativo')) {
      throw new Error('Comportamento incorreto');
    }
  });

  // NUR-CM-006: Queixas Relatadas e Fonte da Informação
  runTest('NUR-CM-006', 'Queixas relatadas acompanhadas da fonte da informação correspondente', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.generalAssessment.complaintStatus = 'Com queixa';
    form.generalAssessment.complaintDescription = 'Cefaleia moderada';
    form.generalAssessment.informationSource = 'Paciente';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Cefaleia moderada') || !text.includes('fonte: Paciente')) {
      throw new Error('Queixa e fonte não registradas corretamente');
    }
  });

  // NUR-CM-007: Sinais Vitais Numéricos (Lock Numérico)
  runTest('NUR-CM-007', 'Sinais vitais numéricos com bloqueio estrito contra alteração ou cálculo de PAM', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.vitalSigns.systolicBP = '145';
    form.vitalSigns.diastolicBP = '92';
    form.vitalSigns.meanArterialPressure = ''; // sem PAM manual
    form.vitalSigns.heartRate = '88';
    form.vitalSigns.respiratoryRate = '19';
    form.vitalSigns.oxygenSaturation = '95';
    form.vitalSigns.temperature = '37.1';
    form.vitalSigns.capillaryBloodGlucose = '142';

    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);

    if (!text.includes('145x92 mmHg')) throw new Error('PA não preservada');
    if (!text.includes('88 bpm')) throw new Error('FC não preservada');
    if (!text.includes('19 irpm')) throw new Error('FR não preservada');
    if (!text.includes('95%')) throw new Error('SpO2 não preservada');
    if (!text.includes('37.1 °C')) throw new Error('Temperatura não preservada');
    if (!text.includes('142 mg/dL')) throw new Error('Glicemia não preservada');
    if (text.includes('PAM:') || text.includes('PAM (manual)')) {
      throw new Error('PAM não informada foi indevidamente inventada/calculada!');
    }
  });

  // NUR-CM-008: Avaliação da Dor e Escalas
  runTest('NUR-CM-008', 'Escore de dor e características descritas com precisão anatômica', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.pain.painScaleType = 'Escala Numérica (0-10)';
    form.pain.painScore = '6/10';
    form.pain.painLocation = 'Flanco direito';
    form.pain.painCharacteristic = 'Cólica';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('6/10') || !text.includes('Flanco direito') || !text.includes('Cólica')) {
      throw new Error('Avaliação de dor não preservada');
    }
  });

  // NUR-CM-009: Avaliação Neurológica Básica
  runTest('NUR-CM-009', 'Avaliação neurológica incluindo pupilas, fotorreação e ausência/presença de déficit motor', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.neurological.pupils = 'Isocóricas';
    form.neurological.photoreaction = 'Reagentes';
    form.neurological.motorDeficit = 'Presente';
    form.neurological.motorDeficitDescription = 'Paresia braquial esquerda';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Pupilas: Isocóricas')) throw new Error('Pupilas ausentes');
    if (!text.includes('Fotorreatividade: Reagentes')) throw new Error('Fotorreatividade ausente');
    if (!text.includes('Paresia braquial esquerda')) throw new Error('Déficit motor ausente');
  });

  // NUR-CM-010: Suporte Ventilatório em Enfermaria
  runTest('NUR-CM-010', 'Suporte respiratório em enfermaria clínica com fluxo e dispositivo adequados', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.respiratory.respiratorySupport = 'Oxigenoterapia';
    form.respiratory.oxygenDevice = 'Cateter nasal';
    form.respiratory.oxygenFlowRate = '2';
    form.respiratory.oxygenFiO2 = '28';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Cateter nasal') || !text.includes('2 L/min') || !text.includes('FiO2: 28%')) {
      throw new Error('Suporte de oxigênio incompleto');
    }
  });

  // NUR-CM-011: Ausculta Pulmonar
  runTest('NUR-CM-011', 'Ausculta pulmonar apenas se realizada com descrição de murmúrios e ruídos', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.respiratory.pulmonaryAuscultationPerformed = 'Sim';
    form.respiratory.vesicularMurmur = 'Diminuído em bases';
    form.respiratory.adventitiousSounds = 'Presentes';
    form.respiratory.adventitiousSoundTypes = ['Estertores creptantes'];
    form.respiratory.adventitiousSoundLocation = 'Base direita';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('murmúrio vesicular diminuído em bases') || !text.includes('Estertores creptantes')) {
      throw new Error('Ausculta pulmonar divergente');
    }
  });

  // NUR-CM-012: Perfusão Periférica e Edema
  runTest('NUR-CM-012', 'Perfusão periférica, extremidades, TEC e mensuração de edema periférico', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.cardiovascular.peripheralPerfusion = 'Diminuída';
    form.cardiovascular.edema = 'Presente';
    form.cardiovascular.edemaLocation = 'Membros inferiores';
    form.cardiovascular.edemaGrade = '+2/4+';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Perfusão periférica: Diminuída') || !text.includes('Membros inferiores (+2/4+)')) {
      throw new Error('Perfusão ou edema ausentes');
    }
  });

  // NUR-CM-013: Ausculta Cardíaca
  runTest('NUR-CM-013', 'Ausculta cardíaca estruturada com bulhas e ritmo', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.cardiovascular.cardiacAuscultationPerformed = 'Sim';
    form.cardiovascular.heartSounds = 'Normofonéticas em 2T';
    form.cardiovascular.rhythm = 'Ritmo regular';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('bulhas normofonéticas em 2t') || !text.includes('ritmo ritmo regular')) {
      throw new Error('Ausculta cardíaca ausente');
    }
  });

  // NUR-CM-014: Abdome e Ruídos Hidroaéreos
  runTest('NUR-CM-014', 'Avaliação do abdome e presença de ruídos hidroaéreos', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.gastrointestinal.abdomenForm = 'Distendido';
    form.gastrointestinal.abdomenConsistency = 'Tenso';
    form.gastrointestinal.bowelSounds = 'Hipoativos';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Abdome: Distendido') || !text.includes('Consistência abdominal: Tenso') || !text.includes('Ruídos hidroaéreos: Hipoativos')) {
      throw new Error('Achados abdominais incorretos');
    }
  });

  // NUR-CM-015: Nutrição e Via de Alimentação
  runTest('NUR-CM-015', 'Via nutricional e aceitação alimentar ou detalhes de infusão enteral', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.nutrition.nutritionalRoute = 'Dieta enteral';
    form.nutrition.enteralDevice = 'SNE';
    form.nutrition.enteralRate = '50';
    form.nutrition.enteralTolerance = 'Boa tolerância';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Dieta enteral') || !text.includes('dispositivo SNE') || !text.includes('50 mL/h')) {
      throw new Error('Nutrição enteral ausente');
    }
  });

  // NUR-CM-016: Eliminações Urinárias e Intestinais
  runTest('NUR-CM-016', 'Eliminações fisiológicas com caracterização de diurese e evacuação', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.eliminations.diuresis = 'Presente';
    form.eliminations.urinaryRoute = 'Espontânea';
    form.eliminations.urineAspect = 'Límpida';
    form.eliminations.bowelElimination = 'Presente';
    form.eliminations.bowelAspect = 'Pastosas';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Diurese: Presente via Espontânea (Límpida)') || !text.includes('Evacuação: Presente (Pastosas)')) {
      throw new Error('Eliminações divergentes');
    }
  });

  // NUR-CM-017: Dispositivos Invasivos em Enfermaria
  runTest('NUR-CM-017', 'Dispositivos invasivos registrados com sítio anatômico, curativo e perviedade', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.devices.list = [
      {
        id: 'dev-1',
        type: 'Acesso Venoso Periférico (AVP)',
        anatomicalSite: 'MSD',
        laterality: 'Direito',
        siteCondition: 'Sem sinais flogísticos',
        dressingCondition: 'Limpo e seco',
        permeability: 'Pérvio',
      },
    ];
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('AVP') || !text.includes('MSD') || !text.includes('Pérvio')) {
      throw new Error('Dispositivo invasivo não registrado no texto');
    }
  });

  // NUR-CM-018: Pele, Integridade Cutânea e Lesões
  runTest('NUR-CM-018', 'Pele e integridade cutânea com localização de lesão e cobertura descrita', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.skin.integrity = 'Com alteração/lesão';
    form.skin.lesionLocation = 'Região sacra';
    form.skin.lesionCharacteristics = 'LPP estágio 2 de 2x2 cm';
    form.skin.lesionDressing = 'Curativo com hidrocoloide íntegro';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Região sacra') || !text.includes('LPP estágio 2') || !text.includes('hidrocoloide')) {
      throw new Error('Lesão cutânea não preservada');
    }
  });

  // NUR-CM-019: Mobilidade e Posicionamento no Leito
  runTest('NUR-CM-019', 'Grau de mobilidade e regime de mudança de decúbito com intervalo', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.mobility.mobility = 'Restrito ao leito';
    form.mobility.repositioning = 'Realizada pela equipe';
    form.mobility.repositioningInterval = 'A cada 2 horas';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Restrito ao leito') || !text.includes('A cada 2 horas')) {
      throw new Error('Mobilidade ausente');
    }
  });

  // NUR-CM-020: Higiene, Autocuidado e Banho
  runTest('NUR-CM-020', 'Higiene e tolerância ao banho somente quando o banho é realizado', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.hygiene.bath = 'No leito';
    form.hygiene.bathTolerance = 'Boa tolerância';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Banho: No leito, tolerância: Boa tolerância')) {
      throw new Error('Banho e tolerância não registrados');
    }
  });

  // NUR-CM-021: Riscos Assistenciais (Queda e LPP)
  runTest('NUR-CM-021', 'Escalas de riscos assistenciais validadas sem autocálculo desautorizado', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.riskAssessment.fallRiskStatus = 'Avaliado';
    form.riskAssessment.fallRiskScale = 'Morse';
    form.riskAssessment.fallRiskScore = '50';
    form.riskAssessment.fallRiskClassification = 'Alto risco';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Morse') || !text.includes('escore: 50') || !text.includes('Alto risco')) {
      throw new Error('Risco de queda não registrado');
    }
  });

  // NUR-CM-022: Cuidados de Enfermagem Realizados (Lock de Ações)
  runTest('NUR-CM-022', 'Lock de ações clínicas bloqueia cuidados não executados', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.careDone.careItems = ['Elevação de cabeceira 30-45°'];
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const baseline = buildNurseMedicalEvolutionNote(facts);

    // Tentativa de injetar cuidado não realizado no refinamento
    const unauthResponse = {
      paragraphs: [
        { text: `${baseline} Realizada passagem de sonda vesical de demora.` },
      ],
    };
    const verification = verifyNurseMedicalEvolutionAIRefinedResponse(unauthResponse as any, facts, baseline);
    if (verification.approved) {
      throw new Error('ClinicalActionLock falhou ao aprovar passagem de sonda não realizada!');
    }
  });

  // NUR-CM-023: Resposta aos Cuidados (Lock de Resposta)
  runTest('NUR-CM-023', 'Resposta aos cuidados estritamente atrelada a intervenção realizada', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.responseToCare.evaluated = 'Sim';
    form.responseToCare.interventionDone = 'analgesia prescrita';
    form.responseToCare.observedResponse = 'relatou alívio álgico';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('analgesia prescrita') || !text.includes('relatou alívio álgico')) {
      throw new Error('Resposta aos cuidados não registrada');
    }
  });

  // NUR-CM-024: Intercorrências e Condutas Imediatas (Lock de Intercorrência)
  runTest('NUR-CM-024', 'Lock de intercorrências exige conduta imediata e comunicação à equipe', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.complications.hasComplication = 'Sim';
    form.complications.time = '15:20';
    form.complications.description = 'Episódio de febre de 38.5 °C';
    form.complications.actionsTaken = 'Comunicado médico e administrado antitérmico prescrito';
    form.complications.communicatedToTeam = 'Sim';
    form.complications.communicatedWho = 'Dra. Luiza';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('15:20') || !text.includes('febre de 38.5 °C') || !text.includes('Dra. Luiza')) {
      throw new Error('Intercorrência incompleta');
    }
  });

  // NUR-CM-025: Comunicação Assistencial e Alinhamento
  runTest('NUR-CM-025', 'Comunicação multiprofissional documentada com clareza e desfecho observado', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.communication.hasCommunication = 'Sim';
    form.communication.target = 'Nutrição Clínica';
    form.communication.reason = 'Transição de consistência de dieta';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Nutrição Clínica') || !text.includes('Transição de consistência de dieta')) {
      throw new Error('Comunicação multiprofissional ausente');
    }
  });

  // NUR-CM-026: Comparação com Avaliação Anterior (Lock de Comparação)
  runTest('NUR-CM-026', 'Lock de comparação preserva status clínico sem invenção de evolução divergente', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.comparisonWithPrevious.statusChange = 'Quadro clínico em melhora';
    form.comparisonWithPrevious.changeDescription = 'Redução de demanda de oxigênio';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const baseline = buildNurseMedicalEvolutionNote(facts);

    if (!baseline.includes('Quadro clínico em melhora')) {
      throw new Error('Comparação anterior ausente na linha canônica');
    }

    // IA tenta inventar piora ou sepse
    const badAI = {
      paragraphs: [{ text: `${baseline} Paciente evolui com piora acentuada e rebaixamento.` }],
    };
    const ver = verifyNurseMedicalEvolutionAIRefinedResponse(badAI as any, facts, baseline);
    if (ver.approved) throw new Error('Lock de comparação falhou em barrar piora contraditória');
  });

  // NUR-CM-027: Síntese de Enfermagem Privativa (Lock de Julgamento)
  runTest('NUR-CM-027', 'Síntese de enfermagem privativa mantida integralmente sob julgamento do enfermeiro', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.nursingSynthesis.synthesisText = 'Paciente lúcido, estável na enfermaria sob cuidados gerais.';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Paciente lúcido, estável na enfermaria sob cuidados gerais.')) {
      throw new Error('Síntese de enfermagem não preservada');
    }
  });

  // NUR-CM-028: Situação Atual e Desfecho
  runTest('NUR-CM-028', 'Desfecho e situação do paciente ao término do atendimento documentados', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.currentStatus.status = 'Permanece estável na enfermaria';
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const text = buildNurseMedicalEvolutionNote(facts);
    if (!text.includes('Permanece estável na enfermaria')) {
      throw new Error('Desfecho ausente');
    }
  });

  // NUR-CM-029: Rastreabilidade Integral (DeterministicNarrativeFactAuditor)
  runTest('NUR-CM-029', 'DeterministicNarrativeFactAuditor valida 100% de rastreabilidade de fatos clínicos', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    const facts = buildAuthorizedNurseMedicalEvolutionFacts(form);
    const { traces } = buildNurseMedicalEvolutionNoteWithTrace(facts);
    const audit = auditNurseMedicalEvolutionNarrative(traces, facts);
    if (!audit.passed) {
      throw new Error(`Audit falhou com segmentos não autorizados: ${audit.unauthorizedSegments.join(', ')}`);
    }
    if (audit.validSegmentsCount < 10) {
      throw new Error(`Contagem de segmentos válida muito baixa: ${audit.validSegmentsCount}`);
    }
  });

  // CONSISTENCY TESTS (NUR-CM-CONS-001 a 008)

  // NUR-CM-CONS-001: Sedado + queixa direta
  runTest('NUR-CM-CONS-001', 'Inconsistência detectada: Sedado + queixa referida diretamente pelo paciente', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.generalAssessment.consciousness = 'Sedado';
    form.generalAssessment.complaintStatus = 'Com queixa';
    form.generalAssessment.informationSource = 'Paciente';
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    const found = alerts.some((a) => a.field.includes('complaintStatus'));
    if (!found) throw new Error('Não detectou inconsistência de paciente sedado com queixa direta');
  });

  // NUR-CM-CONS-002: VMI + deambulação
  runTest('NUR-CM-CONS-002', 'Inconsistência detectada: Ventilação Mecânica Invasiva e deambulação simultâneas', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.respiratory.respiratorySupport = 'VMI';
    form.mobility.mobility = 'Deambula sem auxílio';
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    const found = alerts.some((a) => a.field.includes('mobility'));
    if (!found) throw new Error('Não detectou incompatibilidade de VMI com deambulação');
  });

  // NUR-CM-CONS-003: Dieta enteral sem dispositivo
  runTest('NUR-CM-CONS-003', 'Inconsistência detectada: Dieta enteral informada sem dispositivo invasivo', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.nutrition.nutritionalRoute = 'Dieta enteral';
    form.nutrition.enteralDevice = ''; // sem dispositivo
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    const found = alerts.some((a) => a.field.includes('enteralDevice'));
    if (!found) throw new Error('Não detectou dieta enteral sem dispositivo associado');
  });

  // NUR-CM-CONS-004: SVD + diurese espontânea simultânea
  runTest('NUR-CM-CONS-004', 'Inconsistência detectada: SVD e micção espontânea simultâneas', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.eliminations.urinaryRoute = 'SVD';
    form.eliminations.diuresis = 'Espontânea';
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    const found = alerts.some((a) => a.field.includes('urinaryRoute'));
    if (!found) throw new Error('Não detectou conflito entre SVD e micção espontânea');
  });

  // NUR-CM-CONS-005: Banho não realizado + tolerância
  runTest('NUR-CM-CONS-005', 'Inconsistência detectada: Banho não realizado com tolerância preenchida', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.hygiene.bath = 'Não realizado';
    form.hygiene.bathTolerance = 'Boa tolerância';
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    const found = alerts.some((a) => a.field.includes('bathTolerance'));
    if (!found) throw new Error('Não detectou tolerância a banho não realizado');
  });

  // NUR-CM-CONS-006: Intercorrência Sim sem conduta
  runTest('NUR-CM-CONS-006', 'Inconsistência detectada: Intercorrência presente sem conduta ou descrição', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.complications.hasComplication = 'Sim';
    form.complications.actionsTaken = '';
    form.complications.description = '';
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    const found = alerts.some((a) => a.field.includes('complications'));
    if (!found) throw new Error('Não detectou intercorrência sem conduta especificada');
  });

  // NUR-CM-CONS-007: Resposta aos cuidados sem intervenção
  runTest('NUR-CM-CONS-007', 'Inconsistência detectada: Resposta aos cuidados avaliada sem intervenções registradas', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    form.careDone.careItems = [];
    form.careDone.customCareDetails = '';
    form.responseToCare.evaluated = 'Sim';
    form.responseToCare.interventionDone = '';
    form.responseToCare.observedResponse = 'Melhorou dos sintomas';
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    const found = alerts.some((a) => a.field.includes('responseToCare'));
    if (!found) throw new Error('Não detectou resposta avaliada sem cuidados registrados');
  });

  // NUR-CM-CONS-008: Sem inconsistências indevidas
  runTest('NUR-CM-CONS-008', 'Cenário consistente e válido passa na validação sem nenhum alerta', () => {
    const form = createSampleNurseMedicalEvolutionForm();
    const alerts = validateNurseMedicalEvolutionConsistency(form);
    if (alerts.length > 0) {
      throw new Error(`Cenário consistente produziu alertas inesperados: ${alerts.map((a) => a.message).join('; ')}`);
    }
  });

  const passedCount = results.filter((t) => t.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}
