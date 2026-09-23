/**
 * Testes Unitários de Planos e Limites de Utilização (PLAN-001 a PLAN-008)
 *
 * Valida a infraestrutura comercial e limites SaaS para B2C profissional individual:
 * - PLAN-001: Usuário inicia FREE.
 * - PLAN-002: Usuário pode visualizar plano.
 * - PLAN-003: PRO possui permissões ampliadas.
 * - PLAN-004: UsageTracker registra documentos.
 * - PLAN-005: UsageTracker registra IA.
 * - PLAN-006: Troca de usuário limpa uso.
 * - PLAN-007: Plano não altera RBAC profissional.
 * - PLAN-008: SubscriptionGuard funciona.
 */

import { UserService } from '../services/userService';
import { AuthService } from '../services/authService';
import { getSubscriptionPlan, PLAN_FREE, PLAN_PRO } from '../services/subscriptionPlans';
import { UsageTracker } from '../services/usageTracker';
import { SubscriptionGuard } from '../services/subscriptionGuard';
import { UserProfile } from '../types';

export interface SubscriptionPlanTestResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

export interface SubscriptionPlanTestSuiteResult {
  passed: number;
  failed: number;
  total: number;
  results: SubscriptionPlanTestResult[];
}

export function runSubscriptionPlanTests(): SubscriptionPlanTestSuiteResult {
  const results: SubscriptionPlanTestResult[] = [];

  // =========================================================================
  // PLAN-001: Usuário inicia FREE
  // =========================================================================
  try {
    const rawUser = {
      id: 'usr-plan-001',
      name: 'Enfermeiro Inicial',
      email: 'inicial@evoluienf.com.br',
      role: 'nurse',
    };
    const profile = UserService.normalizeUserProfile(rawUser);

    const isFree = profile.subscriptionPlan === 'FREE';
    const isActive = profile.subscriptionStatus === 'ACTIVE';
    const guardPlan = SubscriptionGuard.getUserPlanType(profile) === 'FREE';
    const isPro = SubscriptionGuard.isPro(profile);

    const ok = isFree && isActive && guardPlan && !isPro;
    results.push({
      id: 'PLAN-001',
      name: 'Usuário inicia FREE',
      passed: ok,
      message: ok
        ? 'Novo profissional é inicializado automaticamente no Plano Gratuito (FREE) com status ativo.'
        : `Falha na inicialização padrão: plan=${profile.subscriptionPlan}, status=${profile.subscriptionStatus}, isPro=${isPro}`,
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-001',
      name: 'Usuário inicia FREE',
      passed: false,
      message: `Erro ao executar PLAN-001: ${err?.message || err}`,
    });
  }

  // =========================================================================
  // PLAN-002: Usuário pode visualizar plano
  // =========================================================================
  try {
    const freePlan = getSubscriptionPlan('FREE');
    const proPlan = getSubscriptionPlan('PRO');

    const freeValid =
      freePlan.id === 'plan_free' &&
      freePlan.name === 'Plano Gratuito' &&
      freePlan.type === 'FREE' &&
      Array.isArray(freePlan.features) &&
      freePlan.features.length >= 3 &&
      typeof freePlan.limits.documentsPerMonth === 'number' &&
      typeof freePlan.limits.aiRequestsPerMonth === 'number';

    const proValid =
      proPlan.id === 'plan_pro' &&
      proPlan.name === 'EvoluiEnf PRO' &&
      proPlan.type === 'PRO' &&
      Array.isArray(proPlan.features) &&
      proPlan.features.length >= 3 &&
      typeof proPlan.limits.documentsPerMonth === 'number' &&
      typeof proPlan.limits.aiRequestsPerMonth === 'number';

    const ok = freeValid && proValid;
    results.push({
      id: 'PLAN-002',
      name: 'Usuário pode visualizar plano',
      passed: ok,
      message: ok
        ? 'Catálogo de planos expõe nome, tipo, lista de características e limites de utilização corretamente.'
        : 'Estrutura dos planos FREE ou PRO não atendeu aos campos requeridos.',
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-002',
      name: 'Usuário pode visualizar plano',
      passed: false,
      message: `Erro ao executar PLAN-002: ${err?.message || err}`,
    });
  }

  // =========================================================================
  // PLAN-003: PRO possui permissões ampliadas
  // =========================================================================
  try {
    const docsProGreater = PLAN_PRO.limits.documentsPerMonth > PLAN_FREE.limits.documentsPerMonth;
    const aiProGreater = PLAN_PRO.limits.aiRequestsPerMonth > PLAN_FREE.limits.aiRequestsPerMonth;
    const historyPro = PLAN_PRO.limits.unlimitedHistory === true && PLAN_FREE.limits.unlimitedHistory === false;
    const advancedPro = PLAN_PRO.limits.advancedFeatures === true && PLAN_FREE.limits.advancedFeatures === false;

    const ok = docsProGreater && aiProGreater && historyPro && advancedPro;
    results.push({
      id: 'PLAN-003',
      name: 'PRO possui permissões ampliadas',
      passed: ok,
      message: ok
        ? `Plano PRO amplia cota de documentos (${PLAN_PRO.limits.documentsPerMonth} vs ${PLAN_FREE.limits.documentsPerMonth}) e consultas IA (${PLAN_PRO.limits.aiRequestsPerMonth} vs ${PLAN_FREE.limits.aiRequestsPerMonth}).`
        : `Diferença de limites entre FREE e PRO inconsistente: docsProGreater=${docsProGreater}, aiProGreater=${aiProGreater}`,
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-003',
      name: 'PRO possui permissões ampliadas',
      passed: false,
      message: `Erro ao executar PLAN-003: ${err?.message || err}`,
    });
  }

  // =========================================================================
  // PLAN-004: UsageTracker registra documentos
  // =========================================================================
  try {
    const testUid = 'user-plan-test-docs-' + Date.now();
    UsageTracker.resetForNewUser(testUid);

    const initial = UsageTracker.getUsage(testUid);
    const updated1 = UsageTracker.recordDocumentCreation(testUid);
    const updated2 = UsageTracker.recordDocumentCreation(testUid);

    const msg = UsageTracker.formatDocumentUsageMessage(updated2, 'FREE');
    const ok =
      initial.documentsCreatedThisMonth === 0 &&
      updated1.documentsCreatedThisMonth === 1 &&
      updated2.documentsCreatedThisMonth === 2 &&
      msg.includes('2');

    UsageTracker.clearUsage(testUid);

    results.push({
      id: 'PLAN-004',
      name: 'UsageTracker registra documentos',
      passed: ok,
      message: ok
        ? 'UsageTracker contabiliza corretamente a criação de novos registros clínicos do mês.'
        : `Contabilização incorreta: initial=${initial.documentsCreatedThisMonth}, final=${updated2.documentsCreatedThisMonth}`,
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-004',
      name: 'UsageTracker registra documentos',
      passed: false,
      message: `Erro ao executar PLAN-004: ${err?.message || err}`,
    });
  }

  // =========================================================================
  // PLAN-005: UsageTracker registra IA
  // =========================================================================
  try {
    const testUid = 'user-plan-test-ai-' + Date.now();
    UsageTracker.resetForNewUser(testUid);

    const initial = UsageTracker.getUsage(testUid);
    const updated1 = UsageTracker.recordAiRequest(testUid);
    const updated2 = UsageTracker.recordAiRequest(testUid);
    const updated3 = UsageTracker.recordAiRequest(testUid);

    const msg = UsageTracker.formatAiUsageMessage(updated3, 'FREE');
    const ok =
      initial.aiRequestsThisMonth === 0 &&
      updated1.aiRequestsThisMonth === 1 &&
      updated3.aiRequestsThisMonth === 3 &&
      msg.includes('3');

    UsageTracker.clearUsage(testUid);

    results.push({
      id: 'PLAN-005',
      name: 'UsageTracker registra IA',
      passed: ok,
      message: ok
        ? 'UsageTracker contabiliza consultas realizadas ao Assistente IA no período mensal.'
        : `Contabilização incorreta da IA: initial=${initial.aiRequestsThisMonth}, final=${updated3.aiRequestsThisMonth}`,
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-005',
      name: 'UsageTracker registra IA',
      passed: false,
      message: `Erro ao executar PLAN-005: ${err?.message || err}`,
    });
  }

  // =========================================================================
  // PLAN-006: Troca de usuário limpa uso
  // =========================================================================
  try {
    const userA = 'user-a-' + Date.now();
    const userB = 'user-b-' + Date.now();

    // User A acumula uso
    UsageTracker.recordDocumentCreation(userA);
    UsageTracker.recordDocumentCreation(userA);
    UsageTracker.recordAiRequest(userA);

    const usageA = UsageTracker.getUsage(userA);
    const hasUsageA = usageA.documentsCreatedThisMonth === 2 && usageA.aiRequestsThisMonth === 1;

    // Simula logout / limpeza de sessão do User A
    UsageTracker.clearUsage(userA);
    const clearedA = UsageTracker.getUsage(userA);

    // User B entra com contadores zerados
    const freshB = UsageTracker.getUsage(userB);

    const ok =
      hasUsageA &&
      clearedA.documentsCreatedThisMonth === 0 &&
      clearedA.aiRequestsThisMonth === 0 &&
      freshB.documentsCreatedThisMonth === 0;

    UsageTracker.clearUsage(userB);

    results.push({
      id: 'PLAN-006',
      name: 'Troca de usuário limpa uso',
      passed: ok,
      message: ok
        ? 'Logout e alternância de contas purgam e isolam o consumo mensal de forma estrita.'
        : `Falha no isolamento de uso entre usuários: hasUsageA=${hasUsageA}, clearedADocs=${clearedA.documentsCreatedThisMonth}`,
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-006',
      name: 'Troca de usuário limpa uso',
      passed: false,
      message: `Erro ao executar PLAN-006: ${err?.message || err}`,
    });
  }

  // =========================================================================
  // PLAN-007: Plano não altera RBAC profissional
  // =========================================================================
  try {
    // 1. Técnico com PRO NÃO pode acessar módulos de Enfermeiro
    const techProEvo = SubscriptionGuard.assertProfessionalRoleCompatibility('technician', 'nurse_evolution', 'PRO');
    const techProSoap = SubscriptionGuard.assertProfessionalRoleCompatibility('technician', 'nurse_soap', 'PRO');
    const techProWounds = SubscriptionGuard.assertProfessionalRoleCompatibility('technician', 'nurse_wounds', 'PRO');
    const techProNote = SubscriptionGuard.assertProfessionalRoleCompatibility('technician', 'technician_nursing_note', 'PRO');

    // 2. Enfermeiro com FREE PODE acessar todos os módulos de Enfermeiro
    const nurseFreeEvo = SubscriptionGuard.assertProfessionalRoleCompatibility('nurse', 'nurse_evolution', 'FREE');
    const nurseFreeSoap = SubscriptionGuard.assertProfessionalRoleCompatibility('nurse', 'nurse_soap', 'FREE');
    const nurseFreeWounds = SubscriptionGuard.assertProfessionalRoleCompatibility('nurse', 'nurse_wounds', 'FREE');
    const nurseFreeAdm = SubscriptionGuard.assertProfessionalRoleCompatibility('nurse', 'nurse_admission', 'FREE');
    const nurseFreeNote = SubscriptionGuard.assertProfessionalRoleCompatibility('nurse', 'technician_nursing_note', 'FREE');

    const ok =
      !techProEvo.allowed &&
      !techProSoap.allowed &&
      !techProWounds.allowed &&
      techProNote.allowed &&
      nurseFreeEvo.allowed &&
      nurseFreeSoap.allowed &&
      nurseFreeWounds.allowed &&
      nurseFreeAdm.allowed &&
      !nurseFreeNote.allowed;

    results.push({
      id: 'PLAN-007',
      name: 'Plano não altera RBAC profissional',
      passed: ok,
      message: ok
        ? 'Prerrogativas da Lei do Exercício Profissional COFEN permanecem intactas e soberanas sobre os planos comerciais.'
        : `Violação do RBAC sob plano comercial: techProEvo=${techProEvo.allowed}, nurseFreeEvo=${nurseFreeEvo.allowed}`,
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-007',
      name: 'Plano não altera RBAC profissional',
      passed: false,
      message: `Erro ao executar PLAN-007: ${err?.message || err}`,
    });
  }

  // =========================================================================
  // PLAN-008: SubscriptionGuard funciona
  // =========================================================================
  try {
    const freeUser: UserProfile = {
      id: 'usr-guard-free',
      name: 'Usuário Free',
      email: 'free@evoluienf.com.br',
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'ACTIVE',
      professionalCategory: 'NURSE',
    };

    const proUser: UserProfile = {
      id: 'usr-guard-pro',
      name: 'Usuário Pro',
      email: 'pro@evoluienf.com.br',
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE',
      professionalCategory: 'NURSE',
    };

    // Criação é permitida enquanto houver cota disponível
    const docCheckFree = SubscriptionGuard.canCreateDocument(freeUser, {
      documentsCreatedThisMonth: 5,
      aiRequestsThisMonth: 2,
    });
    const docCheckPro = SubscriptionGuard.canCreateDocument(proUser, {
      documentsCreatedThisMonth: 50,
      aiRequestsThisMonth: 10,
    });

    const aiCheckFree = SubscriptionGuard.canUseAIAssistant(freeUser, {
      documentsCreatedThisMonth: 5,
      aiRequestsThisMonth: 2,
    });

    // Verificação de recursos
    const freeAdvanced = SubscriptionGuard.canAccessFeature(freeUser, 'advancedFeatures');
    const proAdvanced = SubscriptionGuard.canAccessFeature(proUser, 'advancedFeatures');

    // Ao atingir a cota, o guard visual bloqueia; o backend confirma de forma autoritativa
    const limitReachedCheck = SubscriptionGuard.canCreateDocument(freeUser, {
      documentsCreatedThisMonth: 10,
      aiRequestsThisMonth: 2,
    });

    const aiLimitReachedCheck = SubscriptionGuard.canUseAIAssistant(freeUser, {
      documentsCreatedThisMonth: 0,
      aiRequestsThisMonth: 5,
    });

    const ok =
      docCheckFree.allowed &&
      docCheckPro.allowed &&
      aiCheckFree.allowed &&
      !freeAdvanced &&
      proAdvanced &&
      PLAN_FREE.limits.documentsPerMonth === 10 &&
      PLAN_FREE.limits.aiRequestsPerMonth === 5 &&
      PLAN_PRO.limits.documentsPerMonth === 100 &&
      PLAN_PRO.limits.aiRequestsPerMonth === 100 &&
      limitReachedCheck.limitReached === true &&
      limitReachedCheck.allowed === false &&
      aiLimitReachedCheck.limitReached === true &&
      aiLimitReachedCheck.allowed === false;

    results.push({
      id: 'PLAN-008',
      name: 'SubscriptionGuard funciona',
      passed: ok,
      message: ok
        ? 'SubscriptionGuard bloqueia novas ações ao atingir a cota, sem alterar RBAC profissional nem registros existentes.'
        : `Falha no comportamento do SubscriptionGuard: docCheckFree=${docCheckFree.allowed}, limitReached=${limitReachedCheck.limitReached}`,
    });
  } catch (err: any) {
    results.push({
      id: 'PLAN-008',
      name: 'SubscriptionGuard funciona',
      passed: false,
      message: `Erro ao executar PLAN-008: ${err?.message || err}`,
    });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    passed,
    failed,
    total: results.length,
    results,
  };
}
