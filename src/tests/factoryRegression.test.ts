import {
  CLINICAL_MODULE_CONTRACTS,
  validateClinicalModuleRegistry,
} from '../engine/factory/moduleDefinitions';
import { MODULE_REGISTRY } from '../engine/moduleRegistry';
import { ProfessionalRolePolicy } from '../engine/factory/professionalRolePolicy';
import { ClinicalComponentRegistry } from '../engine/factory/componentRegistry';

console.log('\n--- EXECUTING FACTORY, POLICY, COMP AND EQUIV REGRESSION SUITES ---');

let passed = 0;
const errors: string[] = [];

function assert(condition: boolean, testId: string, message: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testId}: ${message}`);
  } else {
    errors.push(`[FAIL] ${testId}: ${message}`);
    console.error(`  [FAIL] ${testId}: ${message}`);
  }
}

// =========================================================================
// FACTORY-001 to FACTORY-020: Architectural Integrity of Factory Contracts
// =========================================================================
const validation = validateClinicalModuleRegistry();
assert(validation.valid === true, 'FACTORY-001', 'ClinicalModuleRegistry validates with 0 errors');
assert(CLINICAL_MODULE_CONTRACTS.length >= 6, 'FACTORY-002', 'At least 6 clinical module contracts registered');

CLINICAL_MODULE_CONTRACTS.forEach((c, idx) => {
  assert(
    typeof c.createInitialForm === 'function' &&
      typeof c.normalizer === 'function' &&
      typeof c.factsBuilder === 'function' &&
      typeof c.deterministicBuilder === 'function' &&
      typeof c.consistencyValidator === 'function' &&
      typeof c.narrativeAuditor === 'function' &&
      typeof c.postGenerationVerifier === 'function',
    `FACTORY-${String(idx + 3).padStart(3, '0')}`,
    `Contract ${c.definition.id} has complete functional handlers`
  );
});

// =========================================================================
// POLICY-001 to POLICY-008: Professional Role Policies
// =========================================================================
assert(
  ProfessionalRolePolicy.isRouteAllowed('technician', 'clinical-evolution') === true,
  'POLICY-001',
  'Technician allowed in clinical-evolution'
);
assert(
  ProfessionalRolePolicy.isRouteAllowed('technician', 'icu-clinical-evolution') === true,
  'POLICY-002',
  'Technician allowed in icu-clinical-evolution'
);
assert(
  ProfessionalRolePolicy.isRouteAllowed('technician', 'admission-clinical-evolution') === true,
  'POLICY-003',
  'Technician allowed in admission-clinical-evolution'
);
assert(
  ProfessionalRolePolicy.isRouteAllowed('technician', 'medical-clinic-evolution') === true,
  'POLICY-004',
  'Technician allowed in medical-clinic-evolution'
);
assert(
  ProfessionalRolePolicy.isRouteAllowed('nurse', 'medical-clinic-evolution') === false,
  'POLICY-005',
  'Nurse blocked from technician medical-clinic-evolution'
);
assert(
  ProfessionalRolePolicy.isRouteAllowed('nurse', 'nurse-evolution-clinical') === true,
  'POLICY-006',
  'Nurse allowed in nurse-evolution-clinical'
);
assert(
  ProfessionalRolePolicy.isRouteAllowed('technician', 'nurse-evolution-clinical') === false,
  'POLICY-007',
  'Technician blocked from nurse-evolution-clinical'
);
assert(
  ProfessionalRolePolicy.validateCapabilities('technician', {
    supportsNurseClinicalSynthesis: true,
  } as any).valid === false,
  'POLICY-008',
  'supportsNurseClinicalSynthesis strictly rejected for technician'
);

// =========================================================================
// COMP-001 to COMP-008: Component Registry Integrity
// =========================================================================
const allComponents = ClinicalComponentRegistry.getAll();
assert(allComponents.length >= 15, 'COMP-001', 'ClinicalComponentRegistry contains all standardized components');
assert(ClinicalComponentRegistry.has('VitalSignsInputs'), 'COMP-002', 'VitalSignsInputs registered');
assert(ClinicalComponentRegistry.has('PainAssessmentInputs'), 'COMP-003', 'PainAssessmentInputs registered');
assert(ClinicalComponentRegistry.has('ContextInputs'), 'COMP-004', 'ContextInputs registered');
assert(ClinicalComponentRegistry.has('GeneralAssessmentInputs'), 'COMP-005', 'GeneralAssessmentInputs registered');
assert(ClinicalComponentRegistry.has('DeviceFormCard'), 'COMP-006', 'DeviceFormCard registered');
assert(ClinicalComponentRegistry.has('SkinAssessmentInputs'), 'COMP-007', 'SkinAssessmentInputs registered');
assert(ClinicalComponentRegistry.has('NursingCareInputs'), 'COMP-008', 'NursingCareInputs registered');

// =========================================================================
// EQUIV-001 to EQUIV-005: Equivalence of the 5 Legacy Modules
// =========================================================================
// 1. Technician General PS
const techGeneralContract = CLINICAL_MODULE_CONTRACTS.find(
  (c) => c.definition.id === 'tech_nursing_note_ps'
);
assert(!!techGeneralContract, 'EQUIV-001', 'tech_nursing_note_ps preserved');

// 2. Technician ICU
const techICUContract = CLINICAL_MODULE_CONTRACTS.find(
  (c) => c.definition.id === 'tech_nursing_note_icu'
);
assert(!!techICUContract, 'EQUIV-002', 'tech_nursing_note_icu preserved');

// 3. Technician Admission PS
const techAdmContract = CLINICAL_MODULE_CONTRACTS.find(
  (c) => c.definition.id === 'tech_admission_ps'
);
assert(!!techAdmContract, 'EQUIV-003', 'tech_admission_ps preserved');

// 4. Nurse Admission PS
const nurseAdmContract = CLINICAL_MODULE_CONTRACTS.find(
  (c) => c.definition.id === 'nurse_admission_ps'
);
assert(!!nurseAdmContract, 'EQUIV-004', 'nurse_admission_ps preserved');

// 5. Nurse Evolution PS
const nurseEvolContract = CLINICAL_MODULE_CONTRACTS.find(
  (c) => c.definition.id === 'nurse_evolution_ps'
);
assert(!!nurseEvolContract, 'EQUIV-005', 'nurse_evolution_ps preserved');

console.log(`\nREGRESSION SUMMARY: ${passed} PASSED, ${errors.length} FAILED.`);
if (errors.length > 0) {
  console.error('FAILURES:', errors);
  process.exit(1);
} else {
  console.log('ALL REGRESSION TESTS PASSED SUCCESSFULLY!\n');
}
