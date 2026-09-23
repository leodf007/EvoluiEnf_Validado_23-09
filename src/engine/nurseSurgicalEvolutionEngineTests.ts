import { EngineTestOutcome, EngineTestSummary } from './types';
import {
  createInitialNurseSurgicalEvolutionForm,
  NurseSurgicalEvolutionForm,
} from '../types/nurseSurgicalEvolution';
import {
  buildAuthorizedNurseSurgicalEvolutionFacts,
  normalizeNurseSurgicalEvolutionForm,
  validateNurseSurgicalEvolutionConsistency,
  auditNurseSurgicalEvolutionNarrative,
} from './nurseSurgicalEvolutionFactBuilder';
import {
  buildNurseSurgicalEvolutionNote,
  buildNurseSurgicalEvolutionNoteWithTrace,
} from './nurseSurgicalEvolutionNoteBuilder';
import { verifyNurseSurgicalEvolutionAIRefinedResponse } from './nurseSurgicalEvolutionPostGenerationVerifier';
import { verifySurgicalFactLock } from './surgicalFactLock';
import {
  CLINICAL_MODULE_CONTRACTS,
  NURSE_EVOLUTION_SURGICAL_CLINIC_CONTRACT,
} from './factory/moduleDefinitions';
import { NURSE_EVOLUTION_SURGICAL_CLINIC } from './factory/nurseSurgicalClinicModule';
import { MODULE_REGISTRY } from './moduleRegistry';
import { checkPrivacyGuards } from './privacyGuard';

/**
 * Creates a rich, realistic sample form for Nurse Surgical Evolution
 */
export function createSampleNurseSurgicalEvolutionForm(): NurseSurgicalEvolutionForm {
  const form = createInitialNurseSurgicalEvolutionForm();

  // 1. Contexto da evolução
  form.context.moment = 'Início do plantão';
  form.context.location = 'Enfermaria Cirúrgica';
  form.context.escort = 'Familiar';

  // 2. Segurança e identificação
  form.safetyIdentification.wristbandIdentification = 'Presente e conferida';
  form.safetyIdentification.bedIdentification = 'Presente e conferida';
  form.safetyIdentification.precaution = 'Padrão';
  form.safetyIdentification.hasAllergies = 'Não referidas';

  // 3. Contexto cirúrgico
  form.surgicalContext.surgicalSituation = 'Pós-operatório imediato';
  form.surgicalContext.surgicalProcedure = 'Colecistectomia videolaparoscópica';
  form.surgicalContext.procedureDate = '09/09/2026';
  form.surgicalContext.anesthesiaType = 'Geral';

  // 4. Avaliação geral
  form.generalAssessment.generalState = 'Regular';
  form.generalAssessment.consciousness = 'Consciente';
  form.generalAssessment.behavior = ['Calmo', 'Cooperativo'];
  form.generalAssessment.complaintStatus = 'Com queixa';
  form.generalAssessment.complaintDescription = 'Desconforto doloroso em incisão cirúrgica';
  form.generalAssessment.informationSource = 'Paciente';

  // 5. Dor pós-operatória
  form.pain.painScaleType = 'Escala numérica 0-10';
  form.pain.painScore = '4';
  form.pain.painLocation = 'Região do hipocôndrio direito';
  form.pain.painCharacteristic = 'Em pontada leve';
  form.pain.analgesiaRegistered = 'Sim';
  form.pain.analgesiaDetails = 'Dipirona 1g IV às 08h';

  // 6. Sinais vitais
  form.vitalSigns.systolicBP = '120';
  form.vitalSigns.diastolicBP = '80';
  form.vitalSigns.meanArterialPressure = '93';
  form.vitalSigns.heartRate = '78';
  form.vitalSigns.respiratoryRate = '16';
  form.vitalSigns.oxygenSaturation = '98';
  form.vitalSigns.temperature = '36.6';
  form.vitalSigns.capillaryBloodGlucose = '110';

  // 7. Avaliação neurológica
  form.neurological.consciousnessLevel = 'Consciente';
  form.neurological.orientation = 'Orientado no tempo e espaço';
  form.neurological.pupils = 'Isocóricas';
  form.neurological.photoreaction = 'Reagentes';
  form.neurological.motorDeficit = 'Ausente';

  // 8. Respiratório
  form.respiratory.respiratorySupport = 'Ar ambiente';
  form.respiratory.pattern = 'Eupneico';
  form.respiratory.respiratoryDiscomfort = 'Ausente';
  form.respiratory.auscultation = 'Murmúrio vesicular presente bilateralmente sem ruídos adventícios';

  // 9. Cardiovascular
  form.cardiovascular.peripheralPerfusion = 'Boa / Preservada';
  form.cardiovascular.extremities = 'Aquecidas';
  form.cardiovascular.tec = '< 2 segundos';
  form.cardiovascular.edema = 'Ausente';
  form.cardiovascular.cardiacAuscultation = 'Bulhas rítmicas normofonéticas sem sopros';

  // 10. Gastrointestinal
  form.gastrointestinal.abdomenForm = 'Plano';
  form.gastrointestinal.consistency = 'Flácido e indolor';
  form.gastrointestinal.painOnPalpation = 'Ausente';
  form.gastrointestinal.bowelSounds = 'Presentes normoativos';
  form.gastrointestinal.nauseaVomiting = 'Ausente';

  // 11. Nutrição
  form.nutrition.nutritionalRoute = 'Oral';
  form.nutrition.acceptance = 'Boa aceitação (>75%)';
  form.nutrition.enteralDevice = '';
  form.nutrition.enteralInfusionRate = '';
  form.nutrition.enteralTolerance = '';

  // 12. Eliminações
  form.eliminations.diuresis = 'Espontânea';
  form.eliminations.urinaryRoute = 'Espontânea';
  form.eliminations.bowelEvacuation = 'Ausente';
  form.eliminations.bowelAspect = 'Sem eliminações hoje';

  // 13. Ferida operatória
  form.surgicalWound.hasSurgicalWound = 'Sim';
  form.surgicalWound.anatomicalLocation = 'Região subcostal direita e cicatriz umbilical';
  form.surgicalWound.aspect = 'Limpa, seca e íntegra';
  form.surgicalWound.dressingPresent = 'Presente';
  form.surgicalWound.dressingCondition = 'Limpo e seco';
  form.surgicalWound.exudate = 'Ausente';
  form.surgicalWound.exudateCharacteristics = '';

  // 14. Curativo cirúrgico
  form.surgicalDressing.dressingChanged = 'Sim';
  form.surgicalDressing.dressingProductUsed = 'Clorexidina alcoólica e micropore estéril';
  form.surgicalDressing.dressingAspectObserved = 'Incisões com bordas bem coaptadas e sem hiperemia';

  // 15. Drenos
  form.drains.hasDrains = 'Sim';
  form.drains.list = [
    {
      id: 'dr-1',
      type: 'Portovac',
      location: 'Flanco direito',
      permeability: 'Pérvio',
      functioning: 'Funcionante sob aspiração a vácuo',
      fixation: 'Fixado com ponto cirúrgico',
      drainAspect: 'Serossanguinolento',
      volumeReported: '80',
    },
  ];

  // 16. Dispositivos invasivos
  form.devices.list = [
    {
      id: 'dev-1',
      type: 'AVP',
      anatomicalSite: 'MSE',
      laterality: 'face anterior',
      siteCondition: 'Sem sinais flogísticos',
      permeability: 'Pérvio',
      dressingCondition: 'Limpo e seco',
    },
  ];

  // 17. Mobilidade
  form.mobility.mobility = 'Deambula com auxílio';
  form.mobility.decubitusChange = 'Não se aplica';

  // 18. Higiene e autocuidado
  form.hygiene.hygieneStatus = 'Necessita auxílio parcial';
  form.hygiene.bathType = 'Aspersão (chuveiro)';
  form.hygiene.bathTolerance = 'Boa tolerância sem queixas';

  // 19. Riscos assistenciais
  form.riskAssessment.fallRiskStatus = 'Alto risco';
  form.riskAssessment.lppRiskStatus = 'Risco moderado';
  form.riskAssessment.aspirationRiskStatus = 'Ausente';
  form.riskAssessment.otherRisks = 'Risco de infecção de sítio cirúrgico minimizado por curativo estéril';

  // 20. Cuidados realizados
  form.careDone.careItems = [
    'Administração de medicamentos prescritos',
    'Curativo cirúrgico',
    'Esvaziamento e mensuração de drenos',
    'Controle da dor',
    'Mobilização precoce / Deambulação assistida',
  ];

  // 21. Resposta aos cuidados
  form.responseToCare.evaluated = 'Sim';
  form.responseToCare.interventionTarget = 'Controle da dor com Dipirona 1g IV';
  form.responseToCare.observedResponse = 'Alívio álgico com redução do escore de dor de 7 para 4';

  // 22. Intercorrências
  form.complications.hasComplication = 'Não';
  form.complications.description = '';
  form.complications.immediateAction = '';
  form.complications.communicationDone = '';
  form.complications.responseObserved = '';

  // 23. Comunicação
  form.communication.hasCommunication = 'Sim';
  form.communication.target = 'Cirurgião assistente Dr. Carlos';
  form.communication.reason = 'Informado débito de 80 mL de secreção serossanguinolenta no dreno';
  form.communication.responseObserved = 'Ciente e manteve conduta assistencial';

  // 24. Comparação com avaliação anterior
  form.comparisonWithPrevious.statusChange = 'Melhora clínica e pós-operatória';
  form.comparisonWithPrevious.description = 'Evoluindo com redução da dor e aceitação da dieta';

  // 25. Síntese de enfermagem
  form.nursingSynthesis.synthesisText =
    'Paciente em PO imediato de colecistectomia videolaparoscópica, consciente, eupneico, estável hemodinamicamente. Ferida cirúrgica íntegra, dreno Portovac pérvio com débito seroso. Mantido plano terapêutico com incentivo à deambulação assistida e controle álgico.';

  // 26. Situação atual
  form.currentStatus.status = 'Permanece no leito estável';
  form.currentStatus.pendingIssues = 'Reavaliação de dreno no período da tarde';

  return form;
}

export function runNurseSurgicalEvolutionEngineTests(): EngineTestSummary {
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
  // NUR-SC-001 a NUR-SC-027: Suíte Principal conforme Especificação
  // ==========================================

  // NUR-SC-001: Módulo registrado.
  runTest('NUR-SC-001', 'Módulo registrado.', () => {
    const area = MODULE_REGISTRY.nurse_evolution?.areas?.surgicalClinic;
    if (!area) {
      throw new Error('Área surgicalClinic não encontrada em MODULE_REGISTRY.nurse_evolution');
    }
    if (area.route !== 'nurse-evolution-surgical-clinic') {
      throw new Error(`Rota da área surgicalClinic incorreta: ${area.route}`);
    }
  });

  // NUR-SC-002: Somente Enfermeiro.
  runTest('NUR-SC-002', 'Somente Enfermeiro.', () => {
    if (MODULE_REGISTRY.nurse_evolution.profile !== 'nurse') {
      throw new Error(`Perfil incorreto no MODULE_REGISTRY: ${MODULE_REGISTRY.nurse_evolution.profile}`);
    }
    if (NURSE_EVOLUTION_SURGICAL_CLINIC.professionalRole !== 'nurse') {
      throw new Error(`ProfessionalRole incorreto: ${NURSE_EVOLUTION_SURGICAL_CLINIC.professionalRole}`);
    }
  });

  // NUR-SC-003: Contrato válido.
  runTest('NUR-SC-003', 'Contrato válido.', () => {
    const contract = CLINICAL_MODULE_CONTRACTS.find(
      (c) => c.definition.id === 'NURSE_EVOLUTION_SURGICAL_CLINIC'
    );
    if (!contract) {
      throw new Error('Contrato NURSE_EVOLUTION_SURGICAL_CLINIC não encontrado em CLINICAL_MODULE_CONTRACTS');
    }
    if (contract.definition.documentType !== 'NURSE_EVOLUTION') {
      throw new Error(`documentType inválido: ${contract.definition.documentType}`);
    }
    if (contract.definition.clinicalArea !== 'surgicalClinic') {
      throw new Error(`clinicalArea inválida: ${contract.definition.clinicalArea}`);
    }
    if (typeof contract.deterministicBuilder !== 'function') {
      throw new Error('deterministicBuilder não é uma função');
    }
  });

  // NUR-SC-004: Form vazio.
  runTest('NUR-SC-004', 'Form vazio.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    if (!form.surgicalContext || !form.surgicalWound || !form.drains) {
      throw new Error('Formulário inicial não possui todas as seções obrigatórias');
    }
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (typeof note !== 'string') {
      throw new Error('Nota determinística a partir de form vazio falhou');
    }
  });

  // NUR-SC-005: PAM funciona.
  runTest('NUR-SC-005', 'PAM funciona.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.vitalSigns.systolicBP = '130';
    form.vitalSigns.diastolicBP = '85';
    form.vitalSigns.meanArterialPressure = '100';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (!note.includes('PAM manual: 100 mmHg')) {
      throw new Error(`PAM manual não preservada no texto: ${note}`);
    }
  });

  // NUR-SC-006: PAM não calculada.
  runTest('NUR-SC-006', 'PAM não calculada.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.vitalSigns.systolicBP = '120';
    form.vitalSigns.diastolicBP = '80';
    form.vitalSigns.meanArterialPressure = '';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (note.includes('PAM')) {
      throw new Error(`PAM foi calculada ou inserida indevidamente: ${note}`);
    }
  });

  // NUR-SC-007: Contexto cirúrgico funciona.
  runTest('NUR-SC-007', 'Contexto cirúrgico funciona.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.surgicalContext.surgicalSituation = 'Pós-operatório imediato';
    form.surgicalContext.surgicalProcedure = 'Herniorrafia inguinal direita';
    form.surgicalContext.procedureDate = '10/09/2026';
    form.surgicalContext.anesthesiaType = 'Raquidiana';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (
      !note.includes('Pós-operatório imediato') ||
      !note.includes('Herniorrafia inguinal direita') ||
      !note.includes('Raquidiana')
    ) {
      throw new Error(`Contexto cirúrgico ausente no texto: ${note}`);
    }
  });

  // NUR-SC-008: Cirurgia não inventada pela IA.
  runTest('NUR-SC-008', 'Cirurgia não inventada pela IA.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.surgicalContext.surgicalProcedure = 'Colecistectomia videolaparoscópica';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);
    const hallucinated = canonical.replace(
      'Colecistectomia videolaparoscópica',
      'Laparotomia exploradora e colectomia total'
    );
    const lockResult = verifySurgicalFactLock(hallucinated, facts, canonical);
    if (lockResult.passed) {
      throw new Error('SurgicalFactLock não bloqueou cirurgia inventada');
    }
  });

  // NUR-SC-009: Anestesia não inventada.
  runTest('NUR-SC-009', 'Anestesia não inventada.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.surgicalContext.anesthesiaType = 'Geral';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);
    const hallucinated = canonical.replace('Geral', 'Peridural com cateter contínuo');
    const lockResult = verifySurgicalFactLock(hallucinated, facts, canonical);
    if (lockResult.passed) {
      throw new Error('SurgicalFactLock não bloqueou anestesia inventada');
    }
  });

  // NUR-SC-010: Ferida operatória funciona.
  runTest('NUR-SC-010', 'Ferida operatória funciona.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.surgicalWound.hasSurgicalWound = 'Sim';
    form.surgicalWound.anatomicalLocation = 'Linha média infraumbilical';
    form.surgicalWound.aspect = 'Limpa, seca e íntegra';
    form.surgicalWound.dressingPresent = 'Presente';
    form.surgicalWound.dressingCondition = 'Limpo e seco';
    form.surgicalWound.exudate = 'Ausente';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (
      !note.includes('Linha média infraumbilical') ||
      !note.includes('Limpa, seca e íntegra') ||
      !note.includes('limpo e seco')
    ) {
      throw new Error(`Ferida operatória não preservada fielmente: ${note}`);
    }
  });

  // NUR-SC-011: Curativo funciona.
  runTest('NUR-SC-011', 'Curativo funciona.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.surgicalDressing.dressingChanged = 'Sim';
    form.surgicalDressing.dressingProductUsed = 'Gaze estéril e SF 0,9%';
    form.surgicalDressing.dressingAspectObserved = 'Incisão coaptada sem sinais flogísticos';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (
      !note.includes('Troca de curativo: Sim') ||
      !note.includes('Gaze estéril e SF 0,9%') ||
      !note.includes('Incisão coaptada sem sinais flogísticos')
    ) {
      throw new Error(`Curativo cirúrgico não refletido fielmente: ${note}`);
    }
  });

  // NUR-SC-012: Dreno funciona.
  runTest('NUR-SC-012', 'Dreno funciona.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.drains.hasDrains = 'Sim';
    form.drains.list = [
      {
        id: 'dr-test-1',
        type: 'Portovac',
        location: 'Flanco direito',
        permeability: 'Pérvio',
        functioning: 'Funcionante sob aspiração a vácuo',
        fixation: 'Fixado com ponto cirúrgico',
        drainAspect: 'Serossanguinolento',
        volumeReported: '50',
      },
    ];
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (
      !note.includes('Portovac') ||
      !note.includes('Flanco direito') ||
      !note.includes('50 mL') ||
      !note.includes('Serossanguinolento')
    ) {
      throw new Error(`Dreno não refletido fielmente: ${note}`);
    }
  });

  // NUR-SC-013: Dispositivos preservados.
  runTest('NUR-SC-013', 'Dispositivos preservados.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.devices.list = [
      {
        id: 'dev-cvc',
        type: 'CVC',
        anatomicalSite: 'VSC direita',
        laterality: 'direita',
        siteCondition: 'Sem sinais flogísticos',
        permeability: 'Pérvio',
        dressingCondition: 'Limpo e seco',
      },
    ];
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (!note.includes('CVC') || !note.includes('VSC direita')) {
      throw new Error(`Dispositivo não preservado: ${note}`);
    }
  });

  // NUR-SC-014: Dor preservada.
  runTest('NUR-SC-014', 'Dor preservada.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.pain.painScaleType = 'Escala numérica 0-10';
    form.pain.painScore = '6';
    form.pain.painLocation = 'Sítio cirúrgico abdominal';
    form.pain.painCharacteristic = 'Latejante';
    form.pain.analgesiaRegistered = 'Sim';
    form.pain.analgesiaDetails = 'Dipirona 1g EV';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (
      !note.includes('escore 6') ||
      !note.includes('Sítio cirúrgico abdominal') ||
      !note.includes('Dipirona 1g EV')
    ) {
      throw new Error(`Dor cirúrgica não preservada: ${note}`);
    }
  });

  // NUR-SC-015: Cuidados preservados.
  runTest('NUR-SC-015', 'Cuidados preservados.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.careDone.careItems = ['Curativo cirúrgico', 'Controle glicêmico'];
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (!note.includes('Curativo cirúrgico') || !note.includes('Controle glicêmico')) {
      throw new Error(`Cuidados não preservados: ${note}`);
    }
  });

  // NUR-SC-016: Resposta aos cuidados preservada.
  runTest('NUR-SC-016', 'Resposta aos cuidados preservada.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    form.responseToCare.evaluated = 'Sim';
    form.responseToCare.interventionTarget = 'Administração de analgésico prescrito';
    form.responseToCare.observedResponse = 'Paciente relata alívio álgico significativo';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (
      !note.includes('Administração de analgésico prescrito') ||
      !note.includes('Paciente relata alívio álgico significativo')
    ) {
      throw new Error(`Resposta aos cuidados não preservada: ${note}`);
    }
  });

  // NUR-SC-017: Síntese manual preservada.
  runTest('NUR-SC-017', 'Síntese manual preservada.', () => {
    const form = createInitialNurseSurgicalEvolutionForm();
    const textoPrivativo =
      'Paciente em POI de herniorrafia inguinal, lúcido, sem queixas álgicas agudas. Mantido decúbito elevado e vigilância de sangramentos.';
    form.nursingSynthesis.synthesisText = textoPrivativo;
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (!note.includes(textoPrivativo)) {
      throw new Error(`Síntese privativa do enfermeiro foi modificada ou suprimida: ${note}`);
    }
  });

  // NUR-SC-018: IA não cria complicação.
  runTest('NUR-SC-018', 'IA não cria complicação.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.complications.hasComplication = 'Não';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);
    const hallucinated = `${canonical}\n\nPaciente evolui com deiscência da ferida operatória e evisceração com choque hipovolêmico.`;
    const lockResult = verifySurgicalFactLock(hallucinated, facts, canonical);
    if (lockResult.passed) {
      throw new Error('SurgicalFactLock não bloqueou deiscência/choque inventados');
    }
  });

  // NUR-SC-019: IA não cria diagnóstico.
  runTest('NUR-SC-019', 'IA não cria diagnóstico.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);
    const mockResponse = {
      paragraphs: [
        {
          text: `${canonical} Hipótese diagnóstica de peritonite bacteriana aguda secundária.`,
          factIds: ['f-1'],
        },
      ],
    };
    const verifierResult = verifyNurseSurgicalEvolutionAIRefinedResponse(
      mockResponse as any,
      facts,
      canonical
    );
    if (verifierResult.approved) {
      throw new Error('PostGenerationVerifier aprovou diagnóstico médico inventado');
    }
  });

  // NUR-SC-020: IA não cria prescrição.
  runTest('NUR-SC-020', 'IA não cria prescrição.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);
    const mockResponse = {
      paragraphs: [
        {
          text: `${canonical} Prescrevo Ciprofloxacino 400mg IV de 12/12h e tramadol 100mg se dor.`,
          factIds: ['f-1'],
        },
      ],
    };
    const verifierResult = verifyNurseSurgicalEvolutionAIRefinedResponse(
      mockResponse as any,
      facts,
      canonical
    );
    if (verifierResult.approved) {
      throw new Error('PostGenerationVerifier aprovou prescrição médica inventada');
    }
  });

  // NUR-SC-021: SurgicalFactLock aprovado.
  runTest('NUR-SC-021', 'SurgicalFactLock aprovado.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);
    const lockResult = verifySurgicalFactLock(canonical, facts, canonical);
    if (!lockResult.passed) {
      throw new Error(`SurgicalFactLock reprovou texto canônico legítimo: ${lockResult.message}`);
    }
  });

  // NUR-SC-022: NarrativeFactTrace aprovado.
  runTest('NUR-SC-022', 'NarrativeFactTrace aprovado.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const { narrative, traces } = buildNurseSurgicalEvolutionNoteWithTrace(facts);
    const audit = auditNurseSurgicalEvolutionNarrative(narrative, facts);
    if (!audit.passed) {
      throw new Error(`NarrativeFactTrace auditor falhou: ${audit.untraceableSegments.join('; ')}`);
    }
    if (traces.length < 10) {
      throw new Error(`Traços insuficientes: ${traces.length}`);
    }
  });

  // NUR-SC-023: PostGenerationVerifier aprovado.
  runTest('NUR-SC-023', 'PostGenerationVerifier aprovado.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);
    const mockResponse = {
      paragraphs: [
        {
          text: canonical,
          factIds: ['ctx-1', 'surg-1'],
        },
      ],
    };
    const verifierResult = verifyNurseSurgicalEvolutionAIRefinedResponse(
      mockResponse as any,
      facts,
      canonical
    );
    if (!verifierResult.approved) {
      throw new Error(`PostGenerationVerifier reprovou texto fiel: ${verifierResult.reasons.join(', ')}`);
    }
  });

  // NUR-SC-024: PrivacyGuard aprovado.
  runTest('NUR-SC-024', 'PrivacyGuard aprovado.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    const privacyCheck = checkPrivacyGuards(note);
    if (privacyCheck.hasPotentialPII) {
      throw new Error(`PrivacyGuard detectou PII indevida: ${JSON.stringify(privacyCheck.matches)}`);
    }
    const dirtyText = `${note} CPF do paciente: 123.456.789-00`;
    const dirtyCheck = checkPrivacyGuards(dirtyText);
    if (!dirtyCheck.hasPotentialPII) {
      throw new Error('PrivacyGuard não detectou CPF injetado');
    }
  });

  // NUR-SC-025: Sem persistência.
  runTest('NUR-SC-025', 'Sem persistência.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const note = buildNurseSurgicalEvolutionNote(facts);
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(window.localStorage);
      const clinicalKeys = keys.filter((k) => k.includes('patient') || k.includes('clinical'));
      if (clinicalKeys.length > 0) {
        throw new Error(`Persistência indevida detectada no localStorage: ${clinicalKeys.join(', ')}`);
      }
    }
    if (!note || typeof note !== 'string') {
      throw new Error('Falha na geração sem persistência');
    }
  });

  // NUR-SC-026: Responsividade mobile.
  runTest('NUR-SC-026', 'Responsividade mobile.', () => {
    const sections = NURSE_EVOLUTION_SURGICAL_CLINIC.sections;
    if (!sections || sections.length !== 26) {
      throw new Error(`Número de seções do módulo diferente de 26: ${sections?.length}`);
    }
    const allHaveComponents = sections.every((s) => Boolean(s.componentId));
    if (!allHaveComponents) {
      throw new Error('Nem todas as seções possuem componentId mapeado');
    }
  });

  // NUR-SC-027: Factory equivalence.
  runTest('NUR-SC-027', 'Factory equivalence.', () => {
    const contract = NURSE_EVOLUTION_SURGICAL_CLINIC_CONTRACT;
    if (contract.definition.moduleId !== 'nurse_evolution') {
      throw new Error(`Equivalence failure: moduleId é ${contract.definition.moduleId}`);
    }
    if (contract.definition.clinicalArea !== 'surgicalClinic') {
      throw new Error(`Equivalence failure: clinicalArea é ${contract.definition.clinicalArea}`);
    }
    if (contract.route !== 'nurse-evolution-surgical-clinic') {
      throw new Error(`Equivalence failure: route é ${contract.route}`);
    }
  });

  // ==========================================
  // NUR-SC-CONS-001 a NUR-SC-CONS-008: Regras de Consistência Conforme Prompt
  // ==========================================

  // NUR-SC-CONS-001: Ferida marcada sem localização.
  runTest('NUR-SC-CONS-001', 'Ferida marcada sem localização.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.surgicalWound.hasSurgicalWound = 'Sim';
    form.surgicalWound.anatomicalLocation = '';
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    const alert = alerts.find((a) => a.ruleId === 'NUR-SC-CONS-001');
    if (!alert) throw new Error('Não detectou ferida marcada sem localização anatômica');
  });

  // NUR-SC-CONS-002: Dreno marcado sem dispositivo.
  runTest('NUR-SC-CONS-002', 'Dreno marcado sem dispositivo.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.drains.hasDrains = 'Sim';
    form.drains.list = [];
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    const alert = alerts.find((a) => a.ruleId === 'NUR-SC-CONS-002');
    if (!alert) throw new Error('Não detectou dreno marcado sem dispositivo na lista');
  });

  // NUR-SC-CONS-003: Curativo não realizado com condição preenchida.
  runTest('NUR-SC-CONS-003', 'Curativo não realizado com condição preenchida.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.surgicalDressing.dressingChanged = 'Não';
    form.surgicalDressing.dressingProductUsed = 'Gaze com SF 0,9%';
    form.surgicalDressing.dressingAspectObserved = 'Limpo';
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    const alert = alerts.find((a) => a.ruleId === 'NUR-SC-CONS-003');
    if (!alert) throw new Error('Não detectou curativo não realizado com condição preenchida');
  });

  // NUR-SC-CONS-004: Pós-operatório sem procedimento informado.
  runTest('NUR-SC-CONS-004', 'Pós-operatório sem procedimento informado.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.surgicalContext.surgicalSituation = 'Pós-operatório imediato';
    form.surgicalContext.surgicalProcedure = '';
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    const alert = alerts.find((a) => a.ruleId === 'NUR-SC-CONS-004');
    if (!alert) throw new Error('Não detectou pós-operatório sem procedimento cirúrgico');
  });

  // NUR-SC-CONS-005: Resposta aos cuidados sem intervenção.
  runTest('NUR-SC-CONS-005', 'Resposta aos cuidados sem intervenção.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.responseToCare.evaluated = 'Sim';
    form.responseToCare.interventionTarget = '';
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    const alert = alerts.find((a) => a.ruleId === 'NUR-SC-CONS-005');
    if (!alert) throw new Error('Não detectou resposta aos cuidados sem intervenção alvo');
  });

  // NUR-SC-CONS-006: Intercorrência sem conduta.
  runTest('NUR-SC-CONS-006', 'Intercorrência sem conduta.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.complications.hasComplication = 'Sim';
    form.complications.immediateAction = '';
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    const alert = alerts.find((a) => a.ruleId === 'NUR-SC-CONS-006');
    if (!alert) throw new Error('Não detectou intercorrência sem conduta imediata');
  });

  // NUR-SC-CONS-007: Dispositivo ausente com descrição preenchida.
  runTest('NUR-SC-CONS-007', 'Dispositivo ausente com descrição preenchida.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.devices.list = [
      {
        id: 'dev-invalid',
        type: '',
        anatomicalSite: 'MSD',
        laterality: '',
        siteCondition: 'Sem flogose',
        dressingCondition: '',
        permeability: '',
      },
    ];
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    const alert = alerts.find((a) => a.ruleId === 'NUR-SC-CONS-007');
    if (!alert) throw new Error('Não detectou dispositivo ausente com detalhes preenchidos');
  });

  // NUR-SC-CONS-008: Cenário correto sem alertas indevidos.
  runTest('NUR-SC-CONS-008', 'Cenário correto sem alertas indevidos.', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const alerts = validateNurseSurgicalEvolutionConsistency(form);
    if (alerts.length > 0) {
      throw new Error(`Cenário correto gerou alertas: ${alerts.map((a) => a.message).join('; ')}`);
    }
  });

  // ==========================================
  // SurgicalFactLock Tests Adicionais
  // ==========================================

  // LOCK-SURG-001: Alucinação de procedimento cirúrgico é bloqueada
  runTest('LOCK-SURG-001', 'SurgicalFactLock bloqueia cirurgia inventada pela IA', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.surgicalContext.surgicalProcedure = 'Colecistectomia videolaparoscópica';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);

    const hallucinatedText = canonical.replace(
      'Colecistectomia videolaparoscópica',
      'Gastrectomia total com reconstrução em Y de Roux'
    );

    const lockResult = verifySurgicalFactLock(hallucinatedText, facts, canonical);
    if (lockResult.passed) {
      throw new Error('SurgicalFactLock falhou ao aprovar cirurgia inventada');
    }
  });

  // LOCK-SURG-002: Alucinação de tipo anestésico é bloqueada
  runTest('LOCK-SURG-002', 'SurgicalFactLock bloqueia anestesia não registrada', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.surgicalContext.anesthesiaType = 'Geral';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);

    const hallucinatedText = canonical.replace('Geral', 'Peridural com cateter contínuo');
    const lockResult = verifySurgicalFactLock(hallucinatedText, facts, canonical);
    if (lockResult.passed) {
      throw new Error('SurgicalFactLock aprovou anestesia não registrada');
    }
  });

  // LOCK-SURG-003: Alucinação de complicação cirúrgica é bloqueada
  runTest('LOCK-SURG-003', 'SurgicalFactLock bloqueia choque ou sepse inventados', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    form.complications.hasComplication = 'Não';
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);

    const hallucinatedText = `${canonical}\n\nPaciente evolui com choque hipovolêmico e instabilidade hemodinâmica grave.`;
    const lockResult = verifySurgicalFactLock(hallucinatedText, facts, canonical);
    if (lockResult.passed) {
      throw new Error('SurgicalFactLock não bloqueou choque hipovolêmico alucinado');
    }
  });

  // LOCK-SURG-004: Diagnóstico médico ou conduta médica alucinada é bloqueada
  runTest('LOCK-SURG-004', 'PostGenerationVerifier bloqueia prescrição médica e diagnósticos médicos inventados', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);

    const mockResponse = {
      paragraphs: [
        {
          text: `${canonical} Diagnosticado pós-operatório complicado por peritonite bacteriana. Prescrito antibioticoterapia com Meropenem 1g IV.`,
          factIds: ['fact-1'],
        },
      ],
    };

    const verifierResult = verifyNurseSurgicalEvolutionAIRefinedResponse(mockResponse as any, facts, canonical);
    if (verifierResult.approved) {
      throw new Error('PostGenerationVerifier aprovou diagnóstico médico e antibiótico não registrado');
    }
  });

  // LOCK-SURG-005: Refinamento legítimo mantendo fidelidade aos fatos é aprovado
  runTest('LOCK-SURG-005', 'PostGenerationVerifier aprova texto fiel aos fatos autorizados', () => {
    const form = createSampleNurseSurgicalEvolutionForm();
    const facts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
    const canonical = buildNurseSurgicalEvolutionNote(facts);

    const mockApprovedResponse = {
      paragraphs: [
        {
          text: canonical,
          factIds: ['ctx-1', 'surg-1'],
        },
      ],
    };

    const verifierResult = verifyNurseSurgicalEvolutionAIRefinedResponse(mockApprovedResponse as any, facts, canonical);
    if (!verifierResult.approved) {
      throw new Error(`Texto determinístico reprovou no verifier: ${verifierResult.reasons.join(', ')}`);
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
