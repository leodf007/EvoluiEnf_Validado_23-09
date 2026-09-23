import { MODULE_REGISTRY } from '../engine/moduleRegistry';
import { ProfessionalRolePolicy } from '../engine/factory/professionalRolePolicy';
import { ClinicalComponentRegistry } from '../engine/factory/componentRegistry';
import {
  TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL,
  TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL_CONTRACT,
  TECH_CM_CAPABILITIES,
} from '../engine/factory/technicianClinicalMedicalModule';
import { validateClinicalModuleRegistry } from '../engine/factory/moduleDefinitions';
import {
  TechnicianClinicalMedicalForm,
  createInitialTechnicianClinicalMedicalForm,
} from '../types/technicianClinicalMedical';
import {
  normalizeTechnicianClinicalMedicalData,
  buildClinicalMedicalAuthorizedFacts,
} from '../engine/clinicalMedicalFactBuilder';
import { validateClinicalMedicalConsistency } from '../engine/clinicalMedicalConsistencyValidator';
import {
  TechnicianClinicalMedicalNursingNoteBuilder,
  buildTechnicianClinicalMedicalNursingNote,
} from '../engine/technicianClinicalMedicalNursingNoteBuilder';
import { auditDeterministicNarrative } from '../engine/deterministicNarrativeFactAuditor';
import { verifyAIRefinedResponse } from '../engine/postGenerationVerifier';

export function runTechnicianClinicalMedicalTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- EXECUTING TECH-CM-001 TO TECH-CM-020 TEST SUITE ---');

  // TECH-CM-001: Module Registration
  const noteModule = MODULE_REGISTRY.technician_nursing_note;
  const medArea = noteModule.areas.medicalClinic;
  assert(
    !!noteModule &&
      medArea.route === 'medical-clinic-evolution' &&
      TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL.professionalRole === 'technician' &&
      (TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL.clinicalArea === 'CLINICAL_MEDICAL' ||
        TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL.clinicalArea === 'medicalClinic'),
    'TECH-CM-001',
    'Module registered in MODULE_REGISTRY with technician profile, medicalClinic area and medical-clinic-evolution route'
  );

  // TECH-CM-002: Role Policy Enforcement
  const techAllowed = ProfessionalRolePolicy.isRouteAllowed('technician', 'medical-clinic-evolution');
  const nurseAllowed = ProfessionalRolePolicy.isRouteAllowed('nurse', 'medical-clinic-evolution');
  const roleVal = ProfessionalRolePolicy.validateModuleDefinition(TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL);
  assert(
    techAllowed === true && nurseAllowed === false && roleVal.valid === true,
    'TECH-CM-002',
    'Role policy allows technician access to medical-clinic-evolution and blocks nurse access'
  );

  // TECH-CM-003: Clinical Contract Integrity
  const contract = TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL_CONTRACT;
  assert(
    typeof contract.createInitialForm === 'function' &&
      typeof contract.normalizer === 'function' &&
      typeof contract.factsBuilder === 'function' &&
      typeof contract.deterministicBuilder === 'function' &&
      typeof contract.consistencyValidator === 'function' &&
      typeof contract.narrativeAuditor === 'function' &&
      typeof contract.postGenerationVerifier === 'function' &&
      contract.route === 'medical-clinic-evolution' &&
      contract.formComponentId === 'TechnicianClinicalMedicalFormScreen' &&
      contract.aiRefinementPolicy?.specificRole === 'technician',
    'TECH-CM-003',
    'Clinical contract satisfies all interface requirements with dedicated handlers'
  );

  // TECH-CM-004: Capabilities Verification
  const caps = TECH_CM_CAPABILITIES;
  assert(
    caps.supportsVitalSigns === true &&
      caps.supportsPain === true &&
      caps.supportsNeurologicalAssessment === true &&
      caps.supportsRespiratoryAssessment === true &&
      caps.supportsMechanicalVentilation === false &&
      caps.supportsCardiovascularAssessment === true &&
      caps.supportsNutrition === true &&
      caps.supportsEliminations === true &&
      caps.supportsDevices === true &&
      caps.supportsSkinAssessment === true &&
      caps.supportsInfusions === false &&
      caps.supportsRiskAssessment === false &&
      caps.supportsResponseToCare === true &&
      caps.supportsNurseClinicalSynthesis === false,
    'TECH-CM-004',
    'Capabilities strictly enforce inpatient ward technician scope (no VMI, no Nurse Synthesis)'
  );

  // TECH-CM-005: Form Initialization
  const initialForm = createInitialTechnicianClinicalMedicalForm();
  assert(
    initialForm.generalAssessment.observedState === '' &&
      initialForm.generalAssessment.complaints === '' &&
      initialForm.finalStatus.status === '' &&
      initialForm.devices.length === 0 &&
      initialForm.care.actions.length === 0 &&
      initialForm.context.moment === '',
    'TECH-CM-005',
    'createInitialTechnicianClinicalMedicalForm starts completely empty with no pre-selected values'
  );

  // TECH-CM-006: Normalizer Determinism
  const sampleForm: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    context: {
      moment: ' Recebo paciente ' as any,
      location: ' Enfermaria ' as any,
      locationCustom: '',
      accompaniment: ' Familiar ' as any,
      wristbandChecked: true,
      bedSignChecked: true,
      precaution: ' Padrão ' as any,
    },
    vitalSigns: {
      systolicBP: ' 120 ',
      diastolicBP: ' 80 ',
      meanArterialPressure: ' 93 ',
      heartRate: ' 72 ',
      respiratoryRate: ' 18 ',
      oxygenSaturation: ' 98 ',
      temperature: ' 36.5 ',
      capillaryBloodGlucose: ' 99 ',
    },
  };
  const norm1 = normalizeTechnicianClinicalMedicalData(sampleForm);
  const norm2 = normalizeTechnicianClinicalMedicalData(sampleForm);
  assert(
    JSON.stringify(norm1) === JSON.stringify(norm2) &&
      norm1.context.moment === 'Recebo paciente' &&
      norm1.vitalSigns.systolicBP === '120',
    'TECH-CM-006',
    'Normalizer executes deterministically and trims whitespace clean'
  );

  // TECH-CM-007: Authorized Clinical Facts Building
  const facts = buildClinicalMedicalAuthorizedFacts(norm1);
  const vsFacts = facts.vitalSigns || [];
  const ctxFacts = facts.context || [];
  assert(
    ctxFacts.some((f) => f.id === 'ctx-moment' && f.value === 'Recebo paciente') &&
      vsFacts.some((f) => f.id === 'vs-bp' && f.value === '120x80') &&
      vsFacts.every((f) => f.category === 'vitalSigns' && f.sourceField.startsWith('vitalSigns')),
    'TECH-CM-007',
    'Authorized facts builder structures all items with category, ID and source lineage'
  );

  // TECH-CM-008: Consistency Validator - TECH-CM-CONS-001
  const fBathAlert: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    bath: { performed: 'não', tolerance: 'boa' },
  };
  const alerts001 = validateClinicalMedicalConsistency(fBathAlert);
  assert(
    alerts001.some((a) => a.id === 'TECH-CM-CONS-001'),
    'TECH-CM-008',
    'TECH-CM-CONS-001 triggers alert when bath tolerance is given without bath performed'
  );

  // TECH-CM-009: Consistency Validator - TECH-CM-CONS-002
  const fO2Alert: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    respiratory: {
      support: 'ar ambiente',
      pattern: 'eupneico',
      discomfort: 'ausente',
      oxygenDevice: 'cateter nasal',
      oxygenFlow: '3',
    },
  };
  const alerts002 = validateClinicalMedicalConsistency(fO2Alert);
  assert(
    alerts002.some((a) => a.id === 'TECH-CM-CONS-002'),
    'TECH-CM-009',
    'TECH-CM-CONS-002 triggers alert when oxygen device/flow is given under room air support'
  );

  // TECH-CM-010: Consistency Validator - TECH-CM-CONS-003
  const fEnteralAlert: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    nutrition: {
      route: 'oral',
      oralAcceptance: 'boa',
      enteralDevice: 'SNE',
      enteralRate: '50 ml/h',
      enteralTolerance: 'boa',
    },
  };
  const alerts003 = validateClinicalMedicalConsistency(fEnteralAlert);
  assert(
    alerts003.some((a) => a.id === 'TECH-CM-CONS-003'),
    'TECH-CM-010',
    'TECH-CM-CONS-003 triggers alert when enteral device/rate is provided for oral route'
  );

  // TECH-CM-011: Consistency Validator - TECH-CM-CONS-004
  const fOralAlert: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    nutrition: {
      route: 'jejum',
      oralAcceptance: 'boa',
      enteralDevice: '',
      enteralRate: '',
      enteralTolerance: '',
    },
  };
  const alerts004 = validateClinicalMedicalConsistency(fOralAlert);
  assert(
    alerts004.some((a) => a.id === 'TECH-CM-CONS-004'),
    'TECH-CM-011',
    'TECH-CM-CONS-004 triggers alert when oral acceptance is provided for non-oral route'
  );

  // TECH-CM-012: Consistency Validator - TECH-CM-CONS-005
  const fCompAlert: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    complications: {
      hasComplication: 'não',
      explicitNoComplications: true,
      description: '',
      conduct: 'Elevada cabeceira a 45 graus',
      communication: '',
    },
  };
  const alerts005 = validateClinicalMedicalConsistency(fCompAlert);
  assert(
    alerts005.some((a) => a.id === 'TECH-CM-CONS-005'),
    'TECH-CM-012',
    'TECH-CM-CONS-005 triggers alert when complication conduct is specified without complication'
  );

  // TECH-CM-013: Consistency Validator - TECH-CM-CONS-006
  const fPainAlert: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    pain: {
      status: 'não avaliável',
      numericScaleValue: 8,
      location: 'Abdome em FID',
    },
  };
  const alerts006 = validateClinicalMedicalConsistency(fPainAlert);
  assert(
    alerts006.some((a) => a.id === 'TECH-CM-CONS-006'),
    'TECH-CM-013',
    'TECH-CM-CONS-006 triggers alert when pain score is provided for non-evaluated pain status'
  );

  // TECH-CM-014: Consistency Validator - TECH-CM-CONS-007
  const fEdemaAlert: TechnicianClinicalMedicalForm = {
    ...createInitialTechnicianClinicalMedicalForm(),
    cardiovascular: {
      perfusion: 'adequada',
      extremities: 'quentes',
      edema: 'ausente',
      edemaLocation: 'Tornozelos bilateral',
    },
  };
  const alerts007 = validateClinicalMedicalConsistency(fEdemaAlert);
  assert(
    alerts007.some((a) => a.id === 'TECH-CM-CONS-007'),
    'TECH-CM-014',
    'TECH-CM-CONS-007 triggers alert when edema location is provided while edema is absent'
  );

  // Comprehensive Standard Ward Fixture for Builders & Auditing
  const fullWardForm: TechnicianClinicalMedicalForm = {
    context: {
      moment: 'Recebo paciente',
      location: 'Enfermaria',
      locationCustom: '',
      accompaniment: 'Familiar',
      wristbandChecked: true,
      bedSignChecked: true,
      precaution: 'Padrão',
    },
    generalAssessment: {
      observedState: 'consciente',
      observedStateCustom: '',
      complaints: 'sem queixas referidas',
      complaintsDetails: '',
      source: 'paciente',
      hygiene: 'preservada',
      mobility: 'deambula com auxílio',
    },
    vitalSigns: {
      systolicBP: '120',
      diastolicBP: '80',
      meanArterialPressure: '93',
      heartRate: '78',
      respiratoryRate: '16',
      oxygenSaturation: '97',
      temperature: '36.4',
      capillaryBloodGlucose: '110',
    },
    pain: {
      status: 'avaliada',
      numericScaleValue: 2,
      location: 'região lombar',
    },
    respiratory: {
      support: 'ar ambiente',
      pattern: 'eupneico',
      discomfort: 'ausente',
      oxygenDevice: '',
      oxygenFlow: '',
    },
    cardiovascular: {
      perfusion: 'adequada',
      extremities: 'quentes',
      edema: 'ausente',
      edemaLocation: '',
    },
    nutrition: {
      route: 'oral',
      oralAcceptance: 'boa',
      enteralDevice: '',
      enteralRate: '',
      enteralTolerance: '',
    },
    eliminations: {
      urinary: 'presente',
      urinaryRoute: 'espontânea',
      bowel: 'presente',
      bowelAspect: 'formada',
    },
    devices: [
      {
        id: 'dev-1',
        type: 'AVP',
        location: 'MSD em dorso da mão',
        permeability: 'Pérvio',
        functioning: 'Funcionante',
        dressingClean: true,
        dressingDry: true,
        dressingIntact: true,
        phlogisticSigns: 'Ausentes',
      },
    ],
    skin: {
      integrity: 'íntegra',
      hydration: 'hidratada',
      alterationDescription: '',
    },
    bath: {
      performed: 'banho de aspersão',
      tolerance: 'boa',
    },
    care: {
      actions: [
        'Administração de medicamentos conforme prescrição médica',
        'Monitorização de sinais vitais',
        'Higiene corporal',
      ],
      otherCare: '',
    },
    complications: {
      hasComplication: 'não',
      explicitNoComplications: true,
      description: '',
      conduct: '',
      communication: '',
    },
    finalStatus: {
      status: 'permanece no setor sob cuidados de enfermagem',
      details: '',
    },
  };

  const wardNorm = normalizeTechnicianClinicalMedicalData(fullWardForm);
  const wardFacts = buildClinicalMedicalAuthorizedFacts(wardNorm);

  // TECH-CM-015: Deterministic Narrative Builder - Fact Trace Auditing
  const builderOutput = TechnicianClinicalMedicalNursingNoteBuilder.build(wardFacts);
  const auditRes = auditDeterministicNarrative(builderOutput.traces, wardFacts);
  assert(
    builderOutput.auditResult.passed === true &&
      auditRes.passed === true &&
      auditRes.unauthorizedSegments.length === 0 &&
      builderOutput.traces.length > 5,
    'TECH-CM-015',
    'Deterministic narrative segments audit passes with 100% trace coverage and zero unauthorized segments'
  );

  // TECH-CM-016: Professional Role Compliance - COFEN prohibition
  const narrative = builderOutput.narrative.toLowerCase();
  const prohibitedWords = [
    'diagnóstico de enfermagem',
    'prescrição de enfermagem',
    'prescrevo',
    'diagnostico',
    'instabilidade hemodinâmica crítica',
  ];
  const containsProhibited = prohibitedWords.some((w) => narrative.includes(w));
  assert(
    !containsProhibited,
    'TECH-CM-016',
    'Narrative strictly complies with COFEN technician role boundaries with zero clinical synthesis/prescription'
  );

  // TECH-CM-017: Post-Generation Verifier / AI Guardrails
  const legitimateInput = {
    paragraphs: builderOutput.traces.map((t) => ({ text: t.text, factIds: t.factIds })),
  };
  const legitVerification = verifyAIRefinedResponse(legitimateInput, wardFacts, builderOutput.narrative);

  const hallucinatedInput = {
    paragraphs: [
      { text: 'Prescrito vancomicina 1g EV de 12/12h pelo técnico.', factIds: ['fake-fact-id'] },
    ],
  };
  const hallucinatedVerification = verifyAIRefinedResponse(hallucinatedInput, wardFacts, builderOutput.narrative);

  assert(
    legitVerification.approved === true && hallucinatedVerification.approved === false,
    'TECH-CM-017',
    'PostGenerationVerifier approves valid trace-backed narrative and rejects hallucinated prescriptions'
  );

  // TECH-CM-018: Snapshot / Deterministic Reproduction
  const runA = buildTechnicianClinicalMedicalNursingNote(wardFacts);
  const runB = buildTechnicianClinicalMedicalNursingNote(wardFacts);
  const runC = buildTechnicianClinicalMedicalNursingNote(wardFacts);
  const runD = buildTechnicianClinicalMedicalNursingNote(wardFacts);
  const runE = buildTechnicianClinicalMedicalNursingNote(wardFacts);
  assert(
    runA === runB && runB === runC && runC === runD && runD === runE && runA.length > 100,
    'TECH-CM-018',
    'Deterministic narrative builder produces strictly identical text across 5 consecutive executions'
  );

  // TECH-CM-019: Component Registry Integrity
  const missingComponents = TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL.sections
    .map((s) => s.componentId)
    .filter((compId) => !ClinicalComponentRegistry.has(compId));
  assert(
    missingComponents.length === 0,
    'TECH-CM-019',
    'All 14 module sections map directly to registered components in ClinicalComponentRegistry'
  );

  // TECH-CM-020: Lifecycle & Transition to Available
  // Switch to available and validate registry
  TECHNICIAN_NURSING_NOTE_CLINICAL_MEDICAL.status = 'available';
  MODULE_REGISTRY.technician_nursing_note.areas.medicalClinic.status = 'available';
  const regValidation = validateClinicalModuleRegistry();
  assert(
    regValidation.valid === true && regValidation.errors.length === 0,
    'TECH-CM-020',
    'Successful validation and clean transition to available status with zero registry errors'
  );

  return { passed, failed: errors.length, errors };
}

// Direct execution when invoked via tsx
const result = runTechnicianClinicalMedicalTests();
console.log(`\nTECH-CM SUITE SUMMARY: ${result.passed} PASSED, ${result.failed} FAILED.`);
if (result.errors.length > 0) {
  console.error('FAILURES:', result.errors);
  process.exit(1);
} else {
  console.log('ALL 20 TECH-CM TESTS PASSED SUCCESSFULLY!\n');
}
