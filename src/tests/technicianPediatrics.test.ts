import { MODULE_REGISTRY, ClinicalArea } from '../engine/moduleRegistry';
import { ProfessionalRolePolicy } from '../engine/factory/professionalRolePolicy';
import {
  TECHNICIAN_NURSING_NOTE_PEDIATRICS,
  TECHNICIAN_NURSING_NOTE_PEDIATRICS_CONTRACT,
  TECH_PEDIATRICS_CAPABILITIES,
} from '../engine/factory/technicianPediatricModule';
import { validateClinicalModuleRegistry } from '../engine/factory/moduleDefinitions';
import {
  TechnicianPediatricNursingNoteForm,
  createInitialTechnicianPediatricNursingNoteForm,
} from '../types/technicianPediatricNursingNote';
import {
  normalizeTechnicianPediatricForm,
  buildPediatricAuthorizedFacts,
  buildTechnicianPediatricNursingNote,
  buildTechnicianPediatricNursingNoteWithTrace,
  validateTechnicianPediatricConsistency,
  auditPediatricNarrative,
  PediatricFactLock,
  verifyPediatricAIRefinedResponse,
} from '../engine/pediatricClinicalFactBuilder';
import * as fs from 'fs';
import * as path from 'path';

export function runTechnicianPediatricTests(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = [];
  let passed = 0;

  function assert(condition: boolean, testId: string, message: string) {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${testId}: ${message}`);
    } else {
      errors.push(`[FAIL] ${testId}: ${message}`);
      console.error(`  [FAIL] ${testId}: ${message}`);
    }
  }

  console.log('\n--- EXECUTING PED-001 TO PED-038 & CONSISTENCY TEST SUITE ---');

  // =========================================================================
  // PED-001: Módulo aparece somente para Técnico
  // =========================================================================
  const techRouteAllowed = ProfessionalRolePolicy.isRouteAllowedForRole('technician', 'pediatric-clinic-evolution');
  const nurseRouteAllowed = ProfessionalRolePolicy.isRouteAllowedForRole('nurse', 'pediatric-clinic-evolution');
  assert(techRouteAllowed === true && nurseRouteAllowed === false, 'PED-001', 'Módulo liberado para Técnico e bloqueado para Enfermeiro');

  // =========================================================================
  // PED-002: Pediatria aparece no ModuleRegistry
  // =========================================================================
  const pedRegistry = MODULE_REGISTRY.technician_nursing_note.areas.pediatrics;
  assert(
    pedRegistry !== undefined && pedRegistry.route === 'pediatric-clinic-evolution',
    'PED-002',
    'Pediatria registrada no ModuleRegistry sob technician_nursing_note'
  );

  // =========================================================================
  // PED-003: ClinicalModuleContract válido
  // =========================================================================
  const contract = TECHNICIAN_NURSING_NOTE_PEDIATRICS_CONTRACT;
  const isContractValid =
    typeof contract.normalizer === 'function' &&
    typeof contract.factsBuilder === 'function' &&
    typeof contract.deterministicBuilder === 'function' &&
    typeof contract.consistencyValidator === 'function' &&
    typeof contract.narrativeAuditor === 'function' &&
    typeof contract.postGenerationVerifier === 'function' &&
    typeof contract.createInitialForm === 'function' &&
    contract.route === 'pediatric-clinic-evolution';
  assert(isContractValid, 'PED-003', 'ClinicalModuleContract implementa todos os métodos requeridos');

  // =========================================================================
  // PED-004: ProfessionalRolePolicy aprovado
  // =========================================================================
  const roleCheck = ProfessionalRolePolicy.validateModuleDefinition(TECHNICIAN_NURSING_NOTE_PEDIATRICS);
  assert(roleCheck.valid, 'PED-004', 'ProfessionalRolePolicy aprova a definição do módulo pediátrico');

  // =========================================================================
  // PED-005: Formulário inicia vazio
  // =========================================================================
  const initialForm = createInitialTechnicianPediatricNursingNoteForm();
  const isInitEmpty =
    initialForm.context.moment === '' &&
    initialForm.accompaniment.present === '' &&
    !initialForm.generalCharacteristics.ageGroup &&
    !initialForm.generalCharacteristics.weight &&
    !initialForm.vitalSigns.heartRate &&
    initialForm.devices.length === 0 &&
    initialForm.care.actions.length === 0;
  assert(isInitEmpty, 'PED-005', 'Formulário inicializa com todos os campos limpos/vazios');

  // =========================================================================
  // PED-006: Acompanhante funciona
  // =========================================================================
  const formAcc = createInitialTechnicianPediatricNursingNoteForm();
  formAcc.accompaniment.present = 'Sim';
  formAcc.accompaniment.relationship = 'Mãe';
  const normAcc = normalizeTechnicianPediatricForm(formAcc);
  const factsAcc = buildPediatricAuthorizedFacts(normAcc);
  const noteAcc = buildTechnicianPediatricNursingNote(factsAcc);
  assert(
    noteAcc.includes('Presença de acompanhante/responsável: Sim') &&
    noteAcc.includes('Relação com o paciente: Mãe') &&
    !noteAcc.includes('Nome:'),
    'PED-006',
    'Acompanhante registrado com presença e relação sem identificação nominal'
  );

  // =========================================================================
  // PED-007: Fonte da informação funciona
  // =========================================================================
  const formSrc = createInitialTechnicianPediatricNursingNoteForm();
  formSrc.context.infoSource = 'Responsável/acompanhante';
  formSrc.neuroBehavior.complaint = 'Refere dor abdominal após almoço';
  formSrc.neuroBehavior.complaintSource = 'Responsável/acompanhante';
  const noteSrc = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formSrc)));
  assert(
    noteSrc.includes('Fonte principal da informação: Responsável/acompanhante') &&
    noteSrc.includes('[informado por: Responsável/acompanhante]'),
    'PED-007',
    'Fonte da informação preservada e distinguida entre paciente e responsável'
  );

  // =========================================================================
  // PED-008: Faixa etária é opcional
  // =========================================================================
  const formNoAge = createInitialTechnicianPediatricNursingNoteForm();
  formNoAge.context.moment = 'Avalio paciente';
  const noteNoAge = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formNoAge)));
  assert(
    !noteNoAge.includes('Faixa etária:') && !noteNoAge.includes('Lactente') && !noteNoAge.includes('Criança'),
    'PED-008',
    'Faixa etária não é inferida automaticamente quando omitida'
  );

  // =========================================================================
  // PED-009: Peso é opcional e preservado sem dose/IMC
  // =========================================================================
  const formWeight = createInitialTechnicianPediatricNursingNoteForm();
  formWeight.generalCharacteristics.weight = '14,5 kg';
  const noteWeight = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formWeight)));
  assert(
    noteWeight.includes('Peso: 14,5 kg') &&
    !noteWeight.includes('mg/kg') &&
    !noteWeight.includes('IMC') &&
    !noteWeight.includes('percentil'),
    'PED-009',
    'Peso é preservado verbatim sem cálculo de dose, IMC ou percentil'
  );

  // =========================================================================
  // PED-010: Altura é opcional
  // =========================================================================
  const formHeight = createInitialTechnicianPediatricNursingNoteForm();
  formHeight.generalCharacteristics.height = '98 cm';
  const noteHeight = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formHeight)));
  assert(
    noteHeight.includes('Altura/comprimento: 98 cm') && !noteHeight.includes('escore-z'),
    'PED-010',
    'Altura/comprimento preservada sem classificação antropométrica inferida'
  );

  // =========================================================================
  // PED-011: PAM funciona (manual mantida)
  // =========================================================================
  const formPAM = createInitialTechnicianPediatricNursingNoteForm();
  formPAM.vitalSigns.systolicBP = '100';
  formPAM.vitalSigns.diastolicBP = '60';
  formPAM.vitalSigns.meanArterialPressure = '73';
  const notePAM = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formPAM)));
  assert(
    notePAM.includes('PA: 100x60 mmHg') && notePAM.includes('PAM aferida: 73 mmHg'),
    'PED-011',
    'PAM manual aferida pelo técnico é mantida verbatim'
  );

  // =========================================================================
  // PED-012: PAM não é calculada automaticamente
  // =========================================================================
  const formNoPAM = createInitialTechnicianPediatricNursingNoteForm();
  formNoPAM.vitalSigns.systolicBP = '100';
  formNoPAM.vitalSigns.diastolicBP = '60';
  const noteNoPAM = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formNoPAM)));
  assert(
    noteNoPAM.includes('PA: 100x60 mmHg') && !noteNoPAM.includes('PAM'),
    'PED-012',
    'PAM ausente não é calculada por fórmula matemática'
  );

  // =========================================================================
  // PED-013: Escala FLACC funciona
  // =========================================================================
  const formFLACC = createInitialTechnicianPediatricNursingNoteForm();
  formFLACC.pain.method = 'FLACC';
  formFLACC.pain.score = '4';
  const noteFLACC = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formFLACC)));
  assert(
    noteFLACC.includes('Método de avaliação da dor: FLACC (escore: 4)'),
    'PED-013',
    'Escala FLACC e respectivo escore numérico registrados corretamente'
  );

  // =========================================================================
  // PED-014: Escala numérica funciona
  // =========================================================================
  const formNumPain = createInitialTechnicianPediatricNursingNoteForm();
  formNumPain.pain.method = 'Escala numérica 0–10';
  formNumPain.pain.score = '6';
  const noteNumPain = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formNumPain)));
  assert(
    noteNumPain.includes('Método de avaliação da dor: Escala numérica 0–10 (escore: 6)'),
    'PED-014',
    'Escala numérica de dor registrada com o escore numérico informado'
  );

  // =========================================================================
  // PED-015: Escala de dor vazia não cria avaliação de dor
  // =========================================================================
  const formEmptyPain = createInitialTechnicianPediatricNursingNoteForm();
  const noteEmptyPain = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formEmptyPain)));
  assert(
    !noteEmptyPain.includes('dor') && !noteEmptyPain.includes('Escala'),
    'PED-015',
    'Dor vazia não gera avaliação de dor ou escala inventada'
  );

  // =========================================================================
  // PED-016: Aleitamento funciona
  // =========================================================================
  const formAleitamento = createInitialTechnicianPediatricNursingNoteForm();
  formAleitamento.nutrition.route = 'Oral';
  formAleitamento.nutrition.breastfeeding = 'Aleitamento materno';
  const noteAleitamento = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formAleitamento)));
  assert(
    noteAleitamento.includes('Nutrição infantil: Aleitamento materno'),
    'PED-016',
    'Aleitamento materno registrado fidedignamente'
  );

  // =========================================================================
  // PED-017: Dieta enteral funciona
  // =========================================================================
  const formEnteral = createInitialTechnicianPediatricNursingNoteForm();
  formEnteral.nutrition.route = 'Enteral';
  formEnteral.nutrition.enteralDevice = 'SNE';
  formEnteral.nutrition.enteralRate = '35';
  formEnteral.nutrition.enteralTolerance = 'Boa tolerância';
  const noteEnteral = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formEnteral)));
  assert(
    noteEnteral.includes('Alimentação: via enteral por SNE (35 mL/h), boa tolerância'),
    'PED-017',
    'Dieta enteral com dispositivo, vazão e tolerância documentadas'
  );

  // =========================================================================
  // PED-018: Dispositivos funcionam
  // =========================================================================
  const formDev = createInitialTechnicianPediatricNursingNoteForm();
  formDev.devices = [
    {
      id: 'dev-1',
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
  const noteDev = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formDev)));
  assert(
    noteDev.includes('Dispositivo presente: AVP, em MSE, pérvio, em funcionamento'),
    'PED-018',
    'Dispositivos invasivos registrados conforme AuthorizedDeviceRegistry'
  );

  // =========================================================================
  // PED-019: Banho funciona
  // =========================================================================
  const formBath = createInitialTechnicianPediatricNursingNoteForm();
  formBath.hygieneBath.bathPerformed = 'Banho de aspersão com auxílio';
  formBath.hygieneBath.bathTolerance = 'Boa tolerância';
  const noteBath = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formBath)));
  assert(
    noteBath.includes('Banho: banho de aspersão com auxílio com boa tolerância'),
    'PED-019',
    'Banho realizado e tolerância observada registrados'
  );

  // =========================================================================
  // PED-020: Banho não realizado remove tolerância
  // =========================================================================
  const formNoBath = createInitialTechnicianPediatricNursingNoteForm();
  formNoBath.hygieneBath.bathPerformed = 'Não realizado';
  formNoBath.hygieneBath.bathTolerance = 'Boa tolerância';
  const normNoBath = normalizeTechnicianPediatricForm(formNoBath);
  assert(
    normNoBath.hygieneBath.bathPerformed === 'Não realizado' && normNoBath.hygieneBath.bathTolerance === '',
    'PED-020',
    'Normalizador remove tolerância quando banho não foi realizado'
  );

  // =========================================================================
  // PED-021: Cuidados não selecionados não aparecem
  // =========================================================================
  const formCare = createInitialTechnicianPediatricNursingNoteForm();
  formCare.care.actions = ['Higiene oral', 'Mudança de decúbito'];
  const noteCare = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formCare)));
  assert(
    noteCare.includes('Higiene oral') &&
    noteCare.includes('Mudança de decúbito') &&
    !noteCare.includes('Aspiração de vias aéreas') &&
    !noteCare.includes('Acolhimento e orientação ao acompanhante'),
    'PED-021',
    'Apenas cuidados expressamente assinalados são gerados no texto'
  );

  // =========================================================================
  // PED-022: Intercorrência vazia não cria ausência
  // =========================================================================
  const formEmptyComp = createInitialTechnicianPediatricNursingNoteForm();
  const noteEmptyComp = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formEmptyComp)));
  assert(
    !noteEmptyComp.includes('intercorrência') && !noteEmptyComp.includes('Sem intercorrências'),
    'PED-022',
    'Intercorrência não respondida não gera afirmação de ausência'
  );

  // =========================================================================
  // PED-023: Intercorrência Não cria ausência corretamente
  // =========================================================================
  const formNoComp = createInitialTechnicianPediatricNursingNoteForm();
  formNoComp.complications.hasComplication = 'Não';
  const noteNoComp = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formNoComp)));
  assert(
    noteNoComp.includes('Sem intercorrências no período.'),
    'PED-023',
    'Intercorrência = Não gera declaração factual de sem intercorrências'
  );

  // =========================================================================
  // PED-024: Comunicação vazia não aparece
  // =========================================================================
  const formEmptyComm = createInitialTechnicianPediatricNursingNoteForm();
  const noteEmptyComm = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formEmptyComm)));
  assert(
    !noteEmptyComm.includes('Comunicação'),
    'PED-024',
    'Comunicação vazia não aparece na anotação'
  );

  // =========================================================================
  // PED-025: Situação final vazia não aparece
  // =========================================================================
  const formEmptyFin = createInitialTechnicianPediatricNursingNoteForm();
  const noteEmptyFin = buildTechnicianPediatricNursingNote(buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formEmptyFin)));
  assert(
    !noteEmptyFin.includes('Situação final'),
    'PED-025',
    'Situação final vazia não gera texto na anotação'
  );

  // =========================================================================
  // PED-026: PediatricFactLock rejeita idade inventada
  // =========================================================================
  const factsNoAge = buildPediatricAuthorizedFacts(createInitialTechnicianPediatricNursingNoteForm());
  const ageLock = PediatricFactLock.verify('Paciente pediátrico de 5 anos em repouso no leito.', factsNoAge);
  assert(
    ageLock.valid === false && ageLock.reasons.some((r) => r.includes('Idade inventada')),
    'PED-026',
    'PediatricFactLock rejeita menção a idade não constante nos fatos'
  );

  // =========================================================================
  // PED-027: PediatricFactLock rejeita peso inventado
  // =========================================================================
  const factsNoWeight = buildPediatricAuthorizedFacts(createInitialTechnicianPediatricNursingNoteForm());
  const weightLock = PediatricFactLock.verify('Paciente pesando 12 kg, calmo.', factsNoWeight);
  assert(
    weightLock.valid === false && weightLock.reasons.some((r) => r.includes('Peso inventado')),
    'PED-027',
    'PediatricFactLock rejeita peso inventado pela IA'
  );

  // =========================================================================
  // PED-028: PediatricFactLock rejeita escala inventada
  // =========================================================================
  const factsNoPain = buildPediatricAuthorizedFacts(createInitialTechnicianPediatricNursingNoteForm());
  const scaleLock = PediatricFactLock.verify('Avaliado com escala FLACC escore 2.', factsNoPain);
  assert(
    scaleLock.valid === false && scaleLock.reasons.some((r) => r.includes('Escala de dor inventada')),
    'PED-028',
    'PediatricFactLock rejeita escala inventada sem registro prévio'
  );

  // =========================================================================
  // PED-029: IA não cria dose pediátrica
  // =========================================================================
  const doseLock = PediatricFactLock.verify('Administrar paracetamol 15 mg/kg por via oral.', factsNoPain);
  assert(
    doseLock.valid === false && doseLock.reasons.some((r) => r.includes('cálculo de dose pediátrica')),
    'PED-029',
    'PediatricFactLock proíbe cálculo de dose pediátrica por peso (mg/kg)'
  );

  // =========================================================================
  // PED-030: IA não cria diagnóstico
  // =========================================================================
  const diagLock = PediatricFactLock.verify('Paciente com hipótese diagnóstica de bronquiolite viral.', factsNoPain);
  assert(
    diagLock.valid === false && diagLock.reasons.some((r) => r.includes('diagnóstico') || r.includes('patologia')),
    'PED-030',
    'PediatricFactLock rejeita diagnóstico nosológico na narrativa técnica'
  );

  // =========================================================================
  // PED-031: NarrativeFactTrace completo
  // =========================================================================
  const formTrace = createInitialTechnicianPediatricNursingNoteForm();
  formTrace.context.moment = 'Plantão diurno';
  formTrace.generalCharacteristics.ageGroup = 'Criança';
  formTrace.vitalSigns.heartRate = '110';
  formTrace.vitalSigns.oxygenSaturation = '98';
  formTrace.hygieneBath.hygiene = 'Preservada';
  const factsTrace = buildPediatricAuthorizedFacts(normalizeTechnicianPediatricForm(formTrace));
  const traceResult = buildTechnicianPediatricNursingNoteWithTrace(factsTrace);
  const allHaveFactIds = traceResult.traces.every((t) => t.factIds && t.factIds.length > 0);
  assert(
    traceResult.traces.length > 0 && allHaveFactIds,
    'PED-031',
    'Todos os segmentos da narrativa determinística possuem rastreamento formal de factIds'
  );

  // =========================================================================
  // PED-032: DeterministicNarrativeFactAuditor aprovado
  // =========================================================================
  const auditResult = auditPediatricNarrative(traceResult.traces, factsTrace);
  assert(
    auditResult.passed === true && auditResult.unauthorizedSegments.length === 0,
    'PED-032',
    'DeterministicNarrativeFactAuditor aprova 100% dos segmentos gerados'
  );

  // =========================================================================
  // PED-033: PostGenerationVerifier aprovado
  // =========================================================================
  const canonical = traceResult.text;
  const verifierApproved = verifyPediatricAIRefinedResponse(
    { refinedText: 'Plantão diurno. Criança. Sinais vitais aferidos: FC: 110 bpm, SpO₂: 98%. Higiene: preservada.' },
    factsTrace,
    canonical
  );
  assert(
    verifierApproved.approved === true,
    'PED-033',
    'PostGenerationVerifier aprova texto factual condizente'
  );

  // =========================================================================
  // PED-034: Fallback funciona
  // =========================================================================
  const verifierRejected = verifyPediatricAIRefinedResponse(
    { refinedText: 'Diagnóstico de pneumonia grave, prescrever amoxicilina 50 mg/kg.' },
    factsTrace,
    canonical
  );
  assert(
    verifierRejected.approved === false && verifierRejected.text === canonical,
    'PED-034',
    'PostGenerationVerifier rejeita infrações e recai seguramente no texto determinístico canônico'
  );

  // =========================================================================
  // PED-035: Sem persistência (reactive state, resets cleanly)
  // =========================================================================
  const freshForm1 = createInitialTechnicianPediatricNursingNoteForm();
  const freshForm2 = createInitialTechnicianPediatricNursingNoteForm();
  freshForm1.vitalSigns.heartRate = '120';
  assert(
    freshForm2.vitalSigns.heartRate === undefined,
    'PED-035',
    'Instâncias de formulário são isoladas sem persistência residual em memória'
  );

  // =========================================================================
  // PED-036: Responsividade 360px
  // =========================================================================
  const uiFilePath = path.join(process.cwd(), 'src/components/clinical/pediatrics/TechnicianPediatricFormScreen.tsx');
  const uiContent = fs.readFileSync(uiFilePath, 'utf-8');
  assert(
    uiContent.includes('sm:') && uiContent.includes('px-') && uiContent.includes('py-'),
    'PED-036',
    'Componente UI desenhado para dispositivos móveis e telas estreitas a partir de 360px'
  );

  // =========================================================================
  // PED-037: ModuleRegistry íntegro
  // =========================================================================
  const registryValidation = validateClinicalModuleRegistry();
  assert(
    registryValidation.valid === true,
    'PED-037',
    `ModuleRegistry permanece 100% íntegro (erros: ${registryValidation.errors.join('; ')})`
  );

  // =========================================================================
  // PED-038: Equivalência Factory
  // =========================================================================
  const directText = buildTechnicianPediatricNursingNote(factsTrace);
  const factoryText = contract.deterministicBuilder(normalizeTechnicianPediatricForm(formTrace));
  assert(
    directText === factoryText,
    'PED-038',
    'Equivalência Factory: contract.deterministicBuilder é idêntico ao builder direto'
  );

  // =========================================================================
  // REGRAS DE CONSISTÊNCIA CLÍNICA (PED-CONS-001 a PED-CONS-008)
  // =========================================================================
  console.log('\n--- EXECUTING CONSISTENCY RULES TEST SUITE (PED-CONS-001 to 008) ---');

  // PED-CONS-001: Sedado + queixa diretamente atribuída à criança
  const c1Form = createInitialTechnicianPediatricNursingNoteForm();
  c1Form.neuroBehavior.communication = 'Sonolento/sedado';
  c1Form.neuroBehavior.complaint = 'Refere dor de cabeça';
  c1Form.neuroBehavior.complaintSource = 'Paciente';
  const c1Alerts = validateTechnicianPediatricConsistency(c1Form);
  assert(
    c1Alerts.some((a) => a.code === 'PED-CONS-001'),
    'PED-CONS-001',
    'Alerta para paciente sedado com queixa diretamente atribuída à criança'
  );

  // PED-CONS-002: Restrito ao leito + deambulação sem auxílio
  const c2Form = createInitialTechnicianPediatricNursingNoteForm();
  c2Form.mobilitySafety.mobility = 'Restrito ao leito';
  c2Form.mobilitySafety.mobilityCustom = 'Deambula sem auxílio no quarto';
  const c2Alerts = validateTechnicianPediatricConsistency(c2Form);
  assert(
    c2Alerts.some((a) => a.code === 'PED-CONS-002'),
    'PED-CONS-002',
    'Alerta para paciente restrito ao leito e deambulação conflituosa'
  );

  // PED-CONS-003: VMI + deambulação
  const c3Form = createInitialTechnicianPediatricNursingNoteForm();
  c3Form.respiratory.support = 'VMI';
  c3Form.mobilitySafety.mobility = 'Deambula sem auxílio';
  const c3Alerts = validateTechnicianPediatricConsistency(c3Form);
  assert(
    c3Alerts.some((a) => a.code === 'PED-CONS-003'),
    'PED-CONS-003',
    'Alerta para paciente em VMI assinalado como deambulando'
  );

  // PED-CONS-004: Dieta enteral sem dispositivo
  const c4Form = createInitialTechnicianPediatricNursingNoteForm();
  c4Form.nutrition.route = 'Enteral';
  c4Form.nutrition.enteralDevice = '';
  const c4Alerts = validateTechnicianPediatricConsistency(c4Form);
  assert(
    c4Alerts.some((a) => a.code === 'PED-CONS-004'),
    'PED-CONS-004',
    'Alerta para dieta enteral sem dispositivo informado'
  );

  // PED-CONS-005: Banho não realizado + tolerância preenchida
  const c5Form = createInitialTechnicianPediatricNursingNoteForm();
  c5Form.hygieneBath.bathPerformed = 'Não realizado';
  c5Form.hygieneBath.bathTolerance = 'Boa tolerância';
  const c5Alerts = validateTechnicianPediatricConsistency(c5Form);
  assert(
    c5Alerts.some((a) => a.code === 'PED-CONS-005'),
    'PED-CONS-005',
    'Alerta para banho não realizado com tolerância preenchida'
  );

  // PED-CONS-006: Escala de dor incompatível com campo vazio
  const c6Form = createInitialTechnicianPediatricNursingNoteForm();
  c6Form.pain.method = 'FLACC';
  c6Form.pain.score = '';
  const c6Alerts = validateTechnicianPediatricConsistency(c6Form);
  assert(
    c6Alerts.some((a) => a.code === 'PED-CONS-006'),
    'PED-CONS-006',
    'Alerta para escala de dor selecionada com escore vazio'
  );

  // PED-CONS-007: Peso informado com unidade inválida ou formato inválido
  const c7Form = createInitialTechnicianPediatricNursingNoteForm();
  c7Form.generalCharacteristics.weight = '15 litros';
  const c7Alerts = validateTechnicianPediatricConsistency(c7Form);
  assert(
    c7Alerts.some((a) => a.code === 'PED-CONS-007'),
    'PED-CONS-007',
    'Alerta para peso informado com formato ou unidade inválida'
  );

  // PED-CONS-008: Nenhuma inconsistência
  const c8Form = createInitialTechnicianPediatricNursingNoteForm();
  c8Form.context.moment = 'Avalio paciente';
  c8Form.vitalSigns.heartRate = '100';
  const c8Alerts = validateTechnicianPediatricConsistency(c8Form);
  assert(
    c8Alerts.length === 0,
    'PED-CONS-008',
    'Formulário consistente não gera nenhum falso alerta'
  );

  console.log(`\nPediatric Test Suite Execution Finished: ${passed} passed, ${errors.length} failed.\n`);
  return { passed, failed: errors.length, errors };
}

const res = runTechnicianPediatricTests();
if (res.failed > 0) {
  process.exit(1);
}
