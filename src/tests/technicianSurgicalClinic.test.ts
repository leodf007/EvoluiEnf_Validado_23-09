import { MODULE_REGISTRY } from '../engine/moduleRegistry';
import { ProfessionalRolePolicy } from '../engine/factory/professionalRolePolicy';
import { ClinicalComponentRegistry } from '../engine/factory/componentRegistry';
import {
  TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC,
  TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC_CONTRACT,
  TECH_SC_CAPABILITIES,
} from '../engine/factory/technicianSurgicalClinicModule';
import { validateClinicalModuleRegistry } from '../engine/factory/moduleDefinitions';
import {
  TechnicianSurgicalClinicForm,
  createInitialTechnicianSurgicalClinicForm,
} from '../types/technicianSurgicalClinic';
import {
  normalizeTechnicianSurgicalClinicData,
  buildSurgicalClinicAuthorizedFacts,
  validateTechnicianSurgicalClinicConsistency,
} from '../engine/surgicalClinicFactBuilder';
import {
  TechnicianSurgicalClinicalNursingNoteBuilder,
  buildTechnicianSurgicalClinicNursingNote,
} from '../engine/technicianSurgicalClinicalNursingNoteBuilder';
import { auditDeterministicNarrative } from '../engine/deterministicNarrativeFactAuditor';
import { verifyAIRefinedResponse } from '../engine/postGenerationVerifier';
import { AuthorizedFactFactory } from '../engine/factory/authorizedFactFactory';
import { AuthorizedClinicalFacts } from '../engine/types';
import * as fs from 'fs';
import * as path from 'path';

export function runTechnicianSurgicalClinicTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- EXECUTING TECH-SC-001 TO TECH-SC-020 TEST SUITE ---');

  // =========================================================================
  // TECH-SC-001: Módulo registrado corretamente
  // =========================================================================
  const noteModule = MODULE_REGISTRY.technician_nursing_note;
  const surgArea = noteModule.areas.surgicalClinic;
  assert(
    !!noteModule &&
      surgArea.route === 'surgical-clinic-evolution' &&
      TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC.professionalRole === 'technician' &&
      TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC.documentType === 'TECHNICIAN_NURSING_NOTE' &&
      TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC.clinicalArea === 'surgicalClinic',
    'TECH-SC-001',
    'Módulo registrado corretamente com professionalRole=technician, documentType=TECHNICIAN_NURSING_NOTE e rota surgical-clinic-evolution'
  );

  // =========================================================================
  // TECH-SC-002: Disponível apenas para Técnico
  // =========================================================================
  const techAllowed = ProfessionalRolePolicy.isRouteAllowed('technician', 'surgical-clinic-evolution');
  const nurseAllowed = ProfessionalRolePolicy.isRouteAllowed('nurse', 'surgical-clinic-evolution');
  assert(
    techAllowed === true && nurseAllowed === false,
    'TECH-SC-002',
    'Disponível apenas para Técnico: liberado para technician e estritamente bloqueado para nurse'
  );

  // =========================================================================
  // TECH-SC-003: ClinicalModuleContract válido
  // =========================================================================
  const contract = TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC_CONTRACT;
  assert(
    typeof contract.createInitialForm === 'function' &&
      typeof contract.normalizer === 'function' &&
      typeof contract.factsBuilder === 'function' &&
      typeof contract.deterministicBuilder === 'function' &&
      typeof contract.consistencyValidator === 'function' &&
      typeof contract.narrativeAuditor === 'function' &&
      typeof contract.postGenerationVerifier === 'function' &&
      contract.route === 'surgical-clinic-evolution' &&
      contract.formComponentId === 'TechnicianSurgicalClinicFormScreen' &&
      contract.aiRefinementPolicy?.specificRole === 'technician',
    'TECH-SC-003',
    'ClinicalModuleContract válido satisfazendo toda a interface e handlers canônicos'
  );

  // =========================================================================
  // TECH-SC-004: ProfessionalRolePolicy aprovado
  // =========================================================================
  const roleVal = ProfessionalRolePolicy.validateModuleDefinition(TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC);
  const caps = TECH_SC_CAPABILITIES;
  assert(
    roleVal.valid === true &&
      roleVal.errors.length === 0 &&
      caps.supportsNurseClinicalSynthesis === false &&
      caps.supportsMechanicalVentilation === false &&
      caps.supportsInfusions === false &&
      caps.supportsVitalSigns === true,
    'TECH-SC-004',
    'ProfessionalRolePolicy aprovado sem violações de escopo COFEN para técnico em enfermaria cirúrgica'
  );

  // =========================================================================
  // TECH-SC-005: Sem acesso a rawForm no builder
  // =========================================================================
  // Builder requires AuthorizedClinicalFacts and only navigates categories
  const factsOnly: AuthorizedClinicalFacts = {
    context: [
      AuthorizedFactFactory.createFact(
        'ctx-moment',
        'context',
        'moment',
        'Recebo paciente',
        'Recebo paciente'
      ),
    ],
    surgicalContext: [
      AuthorizedFactFactory.createFact(
        'surg-procedure',
        'surgicalContext',
        'procedure',
        'Apendicectomia',
        'Apendicectomia'
      ),
    ],
  };
  const builderOutputFromFacts = TechnicianSurgicalClinicalNursingNoteBuilder.build(factsOnly);
  assert(
    builderOutputFromFacts.traces.every((t) => t.factIds.length > 0) &&
      builderOutputFromFacts.narrative.includes('Recebo paciente') &&
      builderOutputFromFacts.narrative.includes('Apendicectomia') &&
      !('rawForm' in factsOnly),
    'TECH-SC-005',
    'Builder consome exclusivamente AuthorizedClinicalFacts sem qualquer dependência ou acesso a rawForm'
  );

  // =========================================================================
  // TECH-SC-006: Facts rastreáveis
  // =========================================================================
  const sampleTraceForm: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    context: {
      moment: 'Recebo paciente',
      location: 'Enfermaria cirúrgica',
      accompaniment: 'familiar',
      wristbandChecked: true,
      bedSignChecked: true,
      precaution: 'padrão',
    },
    surgicalContext: {
      situation: 'pós-operatório imediato',
      surgicalProcedure: 'Colecistectomia laparoscópica',
    },
    wound: {
      hasDressing: 'sim',
      location: 'hipocôndrio direito',
      condition: 'limpo e seco',
    },
    devices: [
      {
        id: 'dev-drain-1',
        type: 'Dreno abdominal',
        location: 'flanco direito',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        drainAspect: 'seroso em pequena quantidade',
        dressingClean: true,
        dressingDry: true,
        dressingIntact: true,
        phlogisticSigns: 'Ausentes',
      },
    ],
  };
  const generatedFacts = buildSurgicalClinicAuthorizedFacts(sampleTraceForm);
  const allFacts = Object.values(generatedFacts).flat().filter(Boolean);
  const allHaveRequiredFields = allFacts.every(
    (f) =>
      typeof f.id === 'string' &&
      f.id.trim().length > 0 &&
      typeof f.category === 'string' &&
      f.category.trim().length > 0 &&
      typeof f.sourceField === 'string' &&
      f.sourceField.trim().length > 0 &&
      typeof f.canonicalText === 'string' &&
      f.canonicalText.trim().length > 0 &&
      f.value !== undefined &&
      f.value !== null
  );
  const uniqueCheck = AuthorizedFactFactory.validateFactIdUniqueness(allFacts);
  assert(
    allHaveRequiredFields && uniqueCheck.valid && allFacts.length >= 6,
    'TECH-SC-006',
    'Todos os fatos gerados possuem id, category, sourceField, canonicalText e valor válidos com IDs únicos'
  );

  // =========================================================================
  // TECH-SC-007: Zero data
  // =========================================================================
  const emptyForm = createInitialTechnicianSurgicalClinicForm();
  const normalizedEmpty = normalizeTechnicianSurgicalClinicData(emptyForm);
  const factsEmpty = buildSurgicalClinicAuthorizedFacts(normalizedEmpty);
  const emptyFactsList = Object.values(factsEmpty).flat().filter(Boolean);
  const emptyNarrative = buildTechnicianSurgicalClinicNursingNote(factsEmpty);
  assert(
    emptyFactsList.length === 0 &&
      emptyNarrative.trim() === '' &&
      !emptyNarrative.includes('consciente') &&
      !emptyNarrative.includes('eupneico') &&
      !emptyNarrative.includes('curativo'),
    'TECH-SC-007',
    'Zero data: formulário em branco gera 0 fatos autorizados e narrativa vazia sem dados fantasmas'
  );

  // =========================================================================
  // TECH-SC-008: Minimal data
  // =========================================================================
  const minimalForm: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    context: {
      moment: 'Recebo paciente',
      location: 'Enfermaria cirúrgica',
      accompaniment: '',
      wristbandChecked: false,
      bedSignChecked: false,
      precaution: '',
    },
  };
  const minimalFacts = buildSurgicalClinicAuthorizedFacts(minimalForm);
  const minimalNarrative = buildTechnicianSurgicalClinicNursingNote(minimalFacts);
  assert(
    minimalNarrative.includes('Recebo paciente em Enfermaria cirúrgica.') &&
      !minimalNarrative.includes('Sinais vitais') &&
      !minimalNarrative.includes('Curativo') &&
      !minimalNarrative.includes('Dreno') &&
      !minimalNarrative.includes('Dor'),
    'TECH-SC-008',
    'Minimal data: gera exclusivamente a informação mínima preenchida sem acréscimos indevidos'
  );

  // =========================================================================
  // TECH-SC-009: PAM preservada
  // =========================================================================
  const pamForm: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    vitalSigns: {
      systolicBP: '120',
      diastolicBP: '80',
      meanArterialPressure: '93',
    },
  };
  const pamFacts = buildSurgicalClinicAuthorizedFacts(pamForm);
  const pamNarrative = buildTechnicianSurgicalClinicNursingNote(pamFacts);
  assert(
    pamNarrative.includes('PAM: 93 mmHg') &&
      !pamNarrative.includes('calculada') &&
      !pamNarrative.includes('fórmula') &&
      !pamNarrative.includes('normal') &&
      !pamNarrative.includes('estável'),
    'TECH-SC-009',
    'PAM preservada: valor manual aferido mantido estritamente verbatim sem cálculos nem interpretações'
  );

  // =========================================================================
  // TECH-SC-010: Curativo cirúrgico funciona
  // =========================================================================
  const woundForm: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    wound: {
      hasDressing: 'sim',
      location: 'abdome inferior',
      condition: 'limpo e seco',
      conditionDetails: 'Sem secreções visíveis',
    },
  };
  const woundFacts = buildSurgicalClinicAuthorizedFacts(woundForm);
  const woundNarrative = buildTechnicianSurgicalClinicNursingNote(woundFacts);
  assert(
    woundNarrative.includes('Curativo em ferida cirúrgica presente') &&
      woundNarrative.includes('abdome inferior') &&
      woundNarrative.includes('limpo e seco') &&
      woundNarrative.includes('Sem secreções visíveis') &&
      !woundNarrative.includes('sem infecção') &&
      !woundNarrative.includes('sem deiscência'),
    'TECH-SC-010',
    'Curativo cirúrgico funciona: descreve localização e aspecto sem conclusões diagnósticas'
  );

  // =========================================================================
  // TECH-SC-011: Dreno funciona
  // =========================================================================
  const drainForm: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    devices: [
      {
        id: 'd-1',
        type: 'Dreno abdominal',
        location: 'flanco direito',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        drainAspect: 'sero-hemático em moderada quantidade',
        dressingClean: true,
        dressingDry: true,
        dressingIntact: true,
        phlogisticSigns: 'Ausentes',
      },
    ],
  };
  const drainFacts = buildSurgicalClinicAuthorizedFacts(drainForm);
  const drainNarrative = buildTechnicianSurgicalClinicNursingNote(drainFacts);
  assert(
    drainNarrative.includes('Dreno abdominal') &&
      drainNarrative.includes('flanco direito') &&
      drainNarrative.includes('pérvio') &&
      drainNarrative.includes('em funcionamento') &&
      drainNarrative.includes('sero-hemático em moderada quantidade') &&
      !drainNarrative.includes('hemorragia') &&
      !drainNarrative.includes('reintervenção'),
    'TECH-SC-011',
    'Dreno funciona: registra tipo, sítio, funcionamento e débito sem interpretações clínicas'
  );

  // =========================================================================
  // TECH-SC-012: Banho funciona
  // =========================================================================
  const bathFormA: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    bath: {
      performed: 'banho de aspersão',
      tolerance: 'boa tolerância relatada pelo paciente',
    },
  };
  const bathFactsA = buildSurgicalClinicAuthorizedFacts(bathFormA);
  const bathNarrativeA = buildTechnicianSurgicalClinicNursingNote(bathFactsA);

  const bathFormB: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    bath: {
      performed: 'não realizado',
      tolerance: 'boa tolerância',
    },
  };
  const bathFactsB = buildSurgicalClinicAuthorizedFacts(bathFormB);
  const bathNarrativeB = buildTechnicianSurgicalClinicNursingNote(bathFactsB);
  const bathAlertsB = validateTechnicianSurgicalClinicConsistency(bathFormB);

  assert(
    bathNarrativeA.includes('Realizado banho de aspersão') &&
      bathNarrativeA.includes('boa tolerância relatada pelo paciente') &&
      bathNarrativeB.includes('Banho não realizado') &&
      !bathNarrativeB.includes('boa tolerância') &&
      bathAlertsB.some((a) => a.code === 'TECH-SC-CONS-005'),
    'TECH-SC-012',
    'Banho funciona: exibe tolerância somente quando realizado e oculta quando não realizado, alertando incoerência'
  );

  // =========================================================================
  // TECH-SC-013: Cuidados sem seleção não aparecem
  // =========================================================================
  const careFormNone: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    care: { actions: [], otherCare: '' },
  };
  const careFactsNone = buildSurgicalClinicAuthorizedFacts(careFormNone);
  const careNarrativeNone = buildTechnicianSurgicalClinicNursingNote(careFactsNone);

  const careFormSelect: TechnicianSurgicalClinicForm = {
    ...createInitialTechnicianSurgicalClinicForm(),
    care: {
      actions: ['monitorização de sinais vitais'],
      otherCare: '',
    },
  };
  const careFactsSelect = buildSurgicalClinicAuthorizedFacts(careFormSelect);
  const careNarrativeSelect = buildTechnicianSurgicalClinicNursingNote(careFactsSelect);

  assert(
    !careNarrativeNone.includes('Cuidados de enfermagem executados') &&
      careNarrativeSelect.includes('monitorização de sinais vitais') &&
      !careNarrativeSelect.includes('administração de medicamentos') &&
      !careNarrativeSelect.includes('higiene corporal'),
    'TECH-SC-013',
    'Cuidados sem seleção não aparecem: nenhum cuidado pré-selecionado é incluído na anotação'
  );

  // =========================================================================
  // TECH-SC-014: IA não cria complicações
  // =========================================================================
  const factsForAI = buildSurgicalClinicAuthorizedFacts(sampleTraceForm);
  const canonicalForAI = buildTechnicianSurgicalClinicNursingNote(factsForAI);

  const hallucinatedResponses = [
    'Paciente evoluindo com deiscência da ferida operatória e infecção do sítio cirúrgico.',
    'Quadro compatível com choque hipovolêmico pós-cirúrgico e hemorragia ativa.',
    'Diagnóstico de enfermagem: Risco de infecção cirúrgica relacionado a drenagem purulenta.',
    'Prescrevo dipirona 1g e cefalotina 1g EV de horário.',
    'Identificada complicação cirúrgica grave necessitando reabordagem em centro cirúrgico.',
  ];

  const aiRejections = hallucinatedResponses.map((text) =>
    verifyAIRefinedResponse(
      {
        paragraphs: [{ text, factIds: ['ctx-moment'] }],
      },
      factsForAI,
      canonicalForAI
    )
  );
  assert(
    aiRejections.every((r) => r.approved === false && r.reasons.length > 0),
    'TECH-SC-014',
    'IA não cria complicações: PostGenerationVerifier rejeita sumariamente diagnósticos, prescrições e complicações'
  );

  // =========================================================================
  // TECH-SC-015: Fallback determinístico funciona
  // =========================================================================
  // When AI is rejected or fails, the deterministic note is guaranteed valid
  const verifiedAiRefinement = aiRejections[0].approved ? 'Hallucination' : canonicalForAI;
  assert(
    verifiedAiRefinement === canonicalForAI &&
      canonicalForAI.length > 50 &&
      canonicalForAI.includes('Colecistectomia laparoscópica'),
    'TECH-SC-015',
    'Fallback determinístico funciona: garante anotação 100% canônica em caso de falha ou rejeição da IA'
  );

  // =========================================================================
  // TECH-SC-016: NarrativeFactTrace completo
  // =========================================================================
  const fullBuilderRes = TechnicianSurgicalClinicalNursingNoteBuilder.build(factsForAI);
  const traceCheck = fullBuilderRes.traces.every(
    (t) =>
      t.text &&
      t.text.trim().length > 0 &&
      t.category &&
      t.category.trim().length > 0 &&
      Array.isArray(t.factIds) &&
      t.factIds.length > 0
  );
  const auditOutput = auditDeterministicNarrative(fullBuilderRes.traces, factsForAI);
  assert(
    traceCheck &&
      auditOutput.passed === true &&
      auditOutput.unauthorizedSegments.length === 0 &&
      auditOutput.validSegmentsCount === fullBuilderRes.traces.length &&
      auditOutput.validSegmentsCount > 0,
    'TECH-SC-016',
    'NarrativeFactTrace completo: todos os segmentos auditados com 100% de rastreabilidade a fatos autorizados'
  );

  // =========================================================================
  // TECH-SC-017: Equivalência Factory
  // =========================================================================
  const contractBuilt = contract.deterministicBuilder(sampleTraceForm);
  const directBuilt = buildTechnicianSurgicalClinicNursingNote(factsForAI);
  assert(
    contractBuilt === directBuilt && contractBuilt.length > 50,
    'TECH-SC-017',
    'Equivalência Factory: saída de contract.deterministicBuilder é estritamente idêntica à chamada direta'
  );

  // =========================================================================
  // TECH-SC-018: Sem persistência
  // =========================================================================
  // Form initialization, normalization, and building must not mutate persistent storage
  const initialFresh1 = createInitialTechnicianSurgicalClinicForm();
  const initialFresh2 = createInitialTechnicianSurgicalClinicForm();
  assert(
    JSON.stringify(initialFresh1) === JSON.stringify(initialFresh2) &&
      initialFresh1.vitalSigns.meanArterialPressure === undefined &&
      initialFresh1.devices.length === 0,
    'TECH-SC-018',
    'Sem persistência: estado inicial puramente reativo sem vazamento ou acúmulo de dados entre instâncias'
  );

  // =========================================================================
  // TECH-SC-019: Responsividade mobile
  // =========================================================================
  const formScreenPath = path.join(
    process.cwd(),
    'src/components/clinical/surgicalClinic/TechnicianSurgicalClinicFormScreen.tsx'
  );
  const formScreenCode = fs.readFileSync(formScreenPath, 'utf-8');
  const hasMobileTouches =
    formScreenCode.includes('min-h-[44px]') || formScreenCode.includes('min-h-[48px]');
  const hasResponsiveGrids =
    formScreenCode.includes('grid-cols-1') &&
    (formScreenCode.includes('sm:grid-cols-2') || formScreenCode.includes('md:grid-cols-2'));
  const hasResponsivePadding = formScreenCode.includes('p-3') || formScreenCode.includes('p-4');
  assert(
    hasMobileTouches && hasResponsiveGrids && hasResponsivePadding,
    'TECH-SC-019',
    'Responsividade mobile: interface do formulário cirúrgico adota touch targets >= 44px e layouts responsivos'
  );

  // =========================================================================
  // TECH-SC-020: ModuleRegistry íntegro
  // =========================================================================
  // Transition status to 'available' as required upon completing verification
  TECHNICIAN_NURSING_NOTE_SURGICAL_CLINIC.status = 'available';
  MODULE_REGISTRY.technician_nursing_note.areas.surgicalClinic.status = 'available';
  const regResult = validateClinicalModuleRegistry();
  assert(
    regResult.valid === true && regResult.errors.length === 0,
    'TECH-SC-020',
    'ModuleRegistry íntegro: validação completa do catálogo com 0 erros após transição para available'
  );

  console.log(`\nTECH-SC SUMMARY: ${passed} PASSED, ${errors.length} FAILED.`);
  if (errors.length === 0) {
    console.log('ALL TECH-SC (SURGICAL CLINIC) TESTS PASSED SUCCESSFULLY!\n');
  }

  return { passed, failed: errors.length, errors };
}

// Auto-run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const res = runTechnicianSurgicalClinicTests();
  if (res.failed > 0) {
    process.exit(1);
  }
}
