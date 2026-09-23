/**
 * finalMasterAuditRunner.ts
 *
 * Executor mestre da Suíte de Auditoria Final e Estabilização do MVP do EvoluiEnf.
 *
 * Agrega e executa todas as suítes requeridas:
 * 1. FACTORY
 * 2. POLICY
 * 3. COMP
 * 4. EQUIV
 * 5. TECH (PS)
 * 6. TECH-CM (Clínica Médica)
 * 7. TECH-SC (Clínica Cirúrgica)
 * 8. PED (Pediatria)
 * 9. ADM (Admissão Técnico)
 * 10. PAM (PAM Locks & cálculos)
 * 11. AI (AI Engine & AI Assistant com AI-FINAL-001 a 005)
 * 12. NUR-ADM (Admissão Enfermeiro PS & UTI)
 * 13. NUR-EVO (Evolução Enfermeiro PS)
 * 14. NURSE-ICU (Evolução Enfermeiro UTI)
 * 15. NUR-CM (Evolução Enfermeiro Clínica Médica)
 * 16. NUR-SC (Evolução Enfermeiro Clínica Cirúrgica)
 * 17. NUR-PED (Evolução Enfermeiro Pediatria)
 * 18. NUR-WOUNDS (Avaliação de Feridas)
 * 19. NUR-SOAP (Registro SOAP)
 * 20. AUDITORIA TRANSVERSAL (Transversal & Privacy)
 * 21. REAL-SCENARIO-ICU (Cenário Real Crítico de UTI)
 * 22. REGISTRY-INTEGRITY (Integridade estrita do ModuleRegistry)
 * 23. QUALITY-REVIEW (ClinicalDocumentationQualityReview)
 */

import { runEngineUnitTests } from '../../engine/engineTests';
import { runAdmissionEngineTests } from '../../engine/admissionEngineTests';
import { runNurseAdmissionEngineTests } from '../../engine/nurseAdmissionEngineTests';
import { runNurseICUAdmissionEngineTests } from '../../engine/nurseICUAdmissionEngineTests';
import { runNurseEvolutionEngineTests } from '../../engine/nurseEvolutionEngineTests';
import { runNurseICUEngineTests } from '../../engine/nurseICUEngineTests';
import { runNurseMedicalEvolutionEngineTests } from '../../engine/nurseMedicalEvolutionEngineTests';
import { runNurseSurgicalEvolutionEngineTests } from '../../engine/nurseSurgicalEvolutionEngineTests';
import { runNursePediatricEvolutionEngineTests } from '../../engine/nursePediatricEvolutionEngineTests';
import { runNurseWoundsTests } from '../../engine/nurseWoundsEngineTests';
import { runNurseSoapTests } from '../../engine/nurseSoapTests';
import { runHardeningUnitTests } from '../../engine/hardeningTests';
import { runTransversalAuditTests } from '../../engine/transversalAuditTests';
import { runClinicalModuleFactoryTests } from '../../engine/factoryTests';
import { runAIEngineUnitTests } from '../../engine/aiEngineTests';
import { runPAMUnitTests } from '../../engine/pamTests';
import { runAIAssistantTests } from '../aiAssistant/aiAssistantTests';
import { runTechnicianClinicalMedicalTests } from '../../tests/technicianClinicalMedical.test';
import { runTechnicianSurgicalClinicTests } from '../../tests/technicianSurgicalClinic.test';
import { runTechnicianPediatricTests } from '../../tests/technicianPediatrics.test';
import { runICURealScenarioAudit } from './icuRealScenarioAudit';
import { validateModuleRegistryIntegrity } from '../../engine/moduleRegistry';
import { ClinicalDocumentationQualityReview } from '../clinicalDocumentationQualityReview';

export interface AuditSuiteResult {
  suiteId: string;
  name: string;
  category: string;
  passed: number;
  total: number;
  failed: number;
  status: 'passed' | 'failed';
  errors?: string[];
}

export interface MasterAuditReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  status: 'PASSED' | 'FAILED';
  suites: AuditSuiteResult[];
  icuRealScenario: ReturnType<typeof runICURealScenarioAudit>;
  registryIntegrity: ReturnType<typeof validateModuleRegistryIntegrity>;
  qualityReviewCheck: {
    passed: boolean;
    sampleScore: number;
    blocksSubmission: false;
  };
  correctionsApplied: string[];
}

export async function runMasterAudit(): Promise<MasterAuditReport> {
  const suites: AuditSuiteResult[] = [];
  const corrections: string[] = [
    'Unificação dos enums em moduleRegistry.ts com alias canônicos (CLINICAL_MEDICAL, PEDIATRICS, etc.)',
    'Remoção de todo uso de localStorage para narrativas clínicas e notas em evolutionService.ts',
    'Implementação de isolamento total de sessão com reset no chaveamento entre perfis e pacientes',
    'Barreira estrita de roteamento profissional em App.tsx impedindo acesso cruzado Técnico vs Enfermeiro',
    'Adição das travas AI-FINAL-001 a 005 no motor do Assistente IA garantindo fidelidade de sinais vitais, dispositivos e ausência de diagnósticos nosológicos',
    'Criação do ClinicalDocumentationQualityReview para feedback consultivo de preenchimento sem bloqueio de submissão',
  ];

  // 1. FACTORY, POLICY, COMP, EQUIV
  try {
    const factoryRes = runClinicalModuleFactoryTests();
    suites.push({
      suiteId: 'FACTORY_POLICY_COMP_EQUIV',
      name: 'FACTORY, POLICY, COMP & EQUIV Suites',
      category: 'Arquitetura e Contratos',
      passed: factoryRes.passed,
      total: factoryRes.total,
      failed: factoryRes.failed,
      status: factoryRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'FACTORY_POLICY_COMP_EQUIV',
      name: 'FACTORY Suites',
      category: 'Arquitetura',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message || 'Erro inesperado'],
    });
  }

  // 2. TECH (PS)
  try {
    const techRes = runEngineUnitTests();
    suites.push({
      suiteId: 'TECH_PS',
      name: 'TECH: Anotação de Enfermagem Pronto-Socorro',
      category: 'Técnico',
      passed: techRes.passed,
      total: techRes.total,
      failed: techRes.failed,
      status: techRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'TECH_PS',
      name: 'TECH PS',
      category: 'Técnico',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 3. TECH-CM
  try {
    const techCmRes = runTechnicianClinicalMedicalTests();
    suites.push({
      suiteId: 'TECH_CM',
      name: 'TECH-CM: Anotação Clínica Médica',
      category: 'Técnico',
      passed: techCmRes.passed,
      total: techCmRes.passed + techCmRes.failed,
      failed: techCmRes.failed,
      status: techCmRes.failed === 0 ? 'passed' : 'failed',
      errors: techCmRes.errors,
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'TECH_CM',
      name: 'TECH-CM',
      category: 'Técnico',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 4. TECH-SC
  try {
    const techScRes = runTechnicianSurgicalClinicTests();
    suites.push({
      suiteId: 'TECH_SC',
      name: 'TECH-SC: Anotação Clínica Cirúrgica',
      category: 'Técnico',
      passed: techScRes.passed,
      total: techScRes.passed + techScRes.failed,
      failed: techScRes.failed,
      status: techScRes.failed === 0 ? 'passed' : 'failed',
      errors: techScRes.errors,
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'TECH_SC',
      name: 'TECH-SC',
      category: 'Técnico',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 5. PED
  try {
    const pedRes = runTechnicianPediatricTests();
    suites.push({
      suiteId: 'PED',
      name: 'PED: Anotação Pediátrica',
      category: 'Técnico',
      passed: pedRes.passed,
      total: pedRes.passed + pedRes.failed,
      failed: pedRes.failed,
      status: pedRes.failed === 0 ? 'passed' : 'failed',
      errors: pedRes.errors,
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'PED',
      name: 'PED',
      category: 'Técnico',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 6. ADM (Técnico)
  try {
    const admRes = runAdmissionEngineTests();
    suites.push({
      suiteId: 'ADM',
      name: 'ADM: Admissão Técnico',
      category: 'Técnico',
      passed: admRes.passed,
      total: admRes.total,
      failed: admRes.failed,
      status: admRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'ADM',
      name: 'ADM',
      category: 'Técnico',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 7. PAM
  try {
    const pamRes = runPAMUnitTests();
    suites.push({
      suiteId: 'PAM',
      name: 'PAM: Validações e Trava de Pressão Arterial Média',
      category: 'Clínico',
      passed: pamRes.passed,
      total: pamRes.total,
      failed: pamRes.failed,
      status: pamRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'PAM',
      name: 'PAM',
      category: 'Clínico',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 8. AI ENGINE & AI ASSISTANT (com AI-FINAL-001 a 005)
  try {
    const aiEngineOutcomes = runAIEngineUnitTests();
    const aiEnginePassed = aiEngineOutcomes.filter((o) => o.passed).length;
    const aiEngineTotal = aiEngineOutcomes.length;
    const aiEngineFailed = aiEngineTotal - aiEnginePassed;

    const aiAssistantRes = runAIAssistantTests();
    const totalAiPassed = aiEnginePassed + aiAssistantRes.passed;
    const totalAiTests = aiEngineTotal + aiAssistantRes.total;
    const totalAiFailed = aiEngineFailed + (aiAssistantRes.total - aiAssistantRes.passed);

    suites.push({
      suiteId: 'AI',
      name: 'AI: Engine e Assistente de Documentação (AI-FINAL-001 a 005)',
      category: 'Inteligência Assistencial',
      passed: totalAiPassed,
      total: totalAiTests,
      failed: totalAiFailed,
      status: totalAiFailed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'AI',
      name: 'AI',
      category: 'Inteligência Assistencial',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 9. NUR-ADM (PS & ICU)
  try {
    const nurAdmPs = runNurseAdmissionEngineTests();
    const nurAdmIcu = runNurseICUAdmissionEngineTests();
    const totalAdmPassed = nurAdmPs.passed + nurAdmIcu.summary.passed;
    const totalAdmTests = nurAdmPs.total + nurAdmIcu.summary.total;
    const totalAdmFailed = nurAdmPs.failed + nurAdmIcu.summary.failed;

    suites.push({
      suiteId: 'NUR_ADM',
      name: 'NUR-ADM: Admissão Enfermeiro (PS & UTI)',
      category: 'Enfermeiro',
      passed: totalAdmPassed,
      total: totalAdmTests,
      failed: totalAdmFailed,
      status: totalAdmFailed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NUR_ADM',
      name: 'NUR-ADM',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 10. NUR-EVO (PS)
  try {
    const nurEvoRes = runNurseEvolutionEngineTests();
    suites.push({
      suiteId: 'NUR_EVO',
      name: 'NUR-EVO: Evolução Enfermeiro Pronto-Socorro',
      category: 'Enfermeiro',
      passed: nurEvoRes.passed,
      total: nurEvoRes.total,
      failed: nurEvoRes.failed,
      status: nurEvoRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NUR_EVO',
      name: 'NUR-EVO',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 11. NURSE-ICU
  try {
    const nurseIcuRes = runNurseICUEngineTests();
    suites.push({
      suiteId: 'NURSE_ICU',
      name: 'NURSE-ICU: Evolução Enfermeiro Terapia Intensiva',
      category: 'Enfermeiro',
      passed: nurseIcuRes.passed,
      total: nurseIcuRes.total,
      failed: nurseIcuRes.failed,
      status: nurseIcuRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NURSE_ICU',
      name: 'NURSE-ICU',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 12. NUR-CM (Clínica Médica)
  try {
    const nurCmRes = runNurseMedicalEvolutionEngineTests();
    suites.push({
      suiteId: 'NUR_CM',
      name: 'NUR-CM: Evolução Enfermeiro Clínica Médica',
      category: 'Enfermeiro',
      passed: nurCmRes.passed,
      total: nurCmRes.total,
      failed: nurCmRes.failed,
      status: nurCmRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NUR_CM',
      name: 'NUR-CM',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 13. NUR-SC (Clínica Cirúrgica)
  try {
    const nurScRes = runNurseSurgicalEvolutionEngineTests();
    suites.push({
      suiteId: 'NUR_SC',
      name: 'NUR-SC: Evolução Enfermeiro Clínica Cirúrgica',
      category: 'Enfermeiro',
      passed: nurScRes.passed,
      total: nurScRes.total,
      failed: nurScRes.failed,
      status: nurScRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NUR_SC',
      name: 'NUR-SC',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 14. NUR-PED (Pediatria)
  try {
    const nurPedRes = runNursePediatricEvolutionEngineTests();
    suites.push({
      suiteId: 'NUR_PED',
      name: 'NUR-PED: Evolução Enfermeiro Pediatria',
      category: 'Enfermeiro',
      passed: nurPedRes.passed,
      total: nurPedRes.total,
      failed: nurPedRes.failed,
      status: nurPedRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NUR_PED',
      name: 'NUR-PED',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 15. NUR-WOUNDS
  try {
    const nurWoundsRes = runNurseWoundsTests();
    suites.push({
      suiteId: 'NUR_WOUNDS',
      name: 'NUR-WOUNDS: Avaliação e Curativos de Feridas',
      category: 'Enfermeiro',
      passed: nurWoundsRes.summary.passed,
      total: nurWoundsRes.summary.total,
      failed: nurWoundsRes.summary.failed,
      status: nurWoundsRes.summary.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NUR_WOUNDS',
      name: 'NUR-WOUNDS',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 16. NUR-SOAP
  try {
    const soapRes = runNurseSoapTests();
    suites.push({
      suiteId: 'NUR_SOAP',
      name: 'NUR-SOAP: Registro de Enfermagem SOAP',
      category: 'Enfermeiro',
      passed: soapRes.passed,
      total: soapRes.total,
      failed: soapRes.failed,
      status: soapRes.failed === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'NUR_SOAP',
      name: 'NUR-SOAP',
      category: 'Enfermeiro',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 17. AUDITORIA TRANSVERSAL & PRIVACY
  try {
    const transRes = runTransversalAuditTests();
    suites.push({
      suiteId: 'AUDITORIA_TRANSVERSAL',
      name: 'AUDITORIA TRANSVERSAL: PrivacyGuard, Locks e Segurança Fática',
      category: 'Segurança e Auditoria',
      passed: transRes.passedCount,
      total: transRes.totalCount,
      failed: transRes.failedCount,
      status: transRes.failedCount === 0 ? 'passed' : 'failed',
    });
  } catch (err: any) {
    suites.push({
      suiteId: 'AUDITORIA_TRANSVERSAL',
      name: 'AUDITORIA TRANSVERSAL',
      category: 'Segurança',
      passed: 0,
      total: 1,
      failed: 1,
      status: 'failed',
      errors: [err?.message],
    });
  }

  // 18. CENÁRIO REAL UTI
  const icuRealScenario = runICURealScenarioAudit();
  suites.push({
    suiteId: 'REAL_SCENARIO_ICU',
    name: 'TESTE DE CENÁRIO REAL: Paciente Crítico de UTI (VM, DVA, Sedação, Invasivos, Dieta)',
    category: 'Cenário Clínico Integrado',
    passed: icuRealScenario.passedChecks,
    total: icuRealScenario.totalChecks,
    failed: icuRealScenario.totalChecks - icuRealScenario.passedChecks,
    status: icuRealScenario.overallPassed ? 'passed' : 'failed',
  });

  // 19. REGISTRY INTEGRITY
  const registryIntegrity = validateModuleRegistryIntegrity();
  suites.push({
    suiteId: 'MODULE_REGISTRY_INTEGRITY',
    name: 'INTEGRIDADE DO MODULE REGISTRY: Rotas e Perfis Isolados',
    category: 'Governança Arquitetural',
    passed: registryIntegrity.valid ? 1 : 0,
    total: 1,
    failed: registryIntegrity.valid ? 0 : 1,
    status: registryIntegrity.valid ? 'passed' : 'failed',
    errors: registryIntegrity.errors,
  });

  // 20. QUALITY REVIEW VALIDATOR
  const sampleQuality = ClinicalDocumentationQualityReview.evaluate(
    {
      vitalSigns: { bloodPressure: '120/80', heartRate: '76', oxygenSaturation: '98' },
      neurological: { consciousness: 'lúcido e orientado' },
      respiratory: { pattern: 'eupneico em ar ambiente' },
      interventions: ['Orientado repouso no leito'],
    },
    { moduleType: 'TECHNICIAN_NURSING_NOTE', role: 'technician' }
  );

  const qualityPassed = !sampleQuality.blocksSubmission && sampleQuality.completionScore >= 80;
  suites.push({
    suiteId: 'QUALITY_REVIEW',
    name: 'QUALIDADE DOCUMENTAL: ClinicalDocumentationQualityReview (Não bloqueia)',
    category: 'Qualidade Assistencial',
    passed: qualityPassed ? 1 : 0,
    total: 1,
    failed: qualityPassed ? 0 : 1,
    status: qualityPassed ? 'passed' : 'failed',
  });

  // Totals
  const totalPassed = suites.reduce((acc, s) => acc + s.passed, 0);
  const totalTests = suites.reduce((acc, s) => acc + s.total, 0);
  const totalFailed = suites.reduce((acc, s) => acc + s.failed, 0);

  return {
    timestamp: new Date().toISOString(),
    totalTests,
    totalPassed,
    totalFailed,
    status: totalFailed === 0 ? 'PASSED' : 'FAILED',
    suites,
    icuRealScenario,
    registryIntegrity,
    qualityReviewCheck: {
      passed: qualityPassed,
      sampleScore: sampleQuality.completionScore,
      blocksSubmission: false,
    },
    correctionsApplied: corrections,
  };
}
