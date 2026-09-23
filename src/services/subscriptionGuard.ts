import {
  UserProfile,
  SubscriptionPlan,
  SubscriptionPlanType,
  UserUsage,
  ProfessionalUser,
  UserSubscription,
  Subscription,
} from '../types';
import { getSubscriptionPlan, PLAN_FREE, PLAN_PRO, CommercialPlanDetails } from './subscriptionPlans';
import { UsageTracker } from './usageTracker';
import { ProfessionalRolePolicy } from '../engine/factory/professionalRolePolicy';

export interface GuardCheckResult {
  allowed: boolean;
  limitReached: boolean;
  current: number;
  max: number;
  message: string;
  planType: SubscriptionPlanType;
}

export class SubscriptionGuard {
  /**
   * Obtém o plano associado ao perfil do usuário (padrão FREE)
   */
  static getUserPlanType(
    user?: UserProfile | ProfessionalUser | null,
    subscription?: UserSubscription | null
  ): SubscriptionPlanType {
    // 1. Se houver UserSubscription explícita ativa
    if (subscription) {
      if (this.isSubscriptionActive(subscription) && subscription.planId === 'PRO') {
        return 'PRO';
      }
      if (this.isSubscriptionExpired(subscription) || subscription.status === 'CANCELED') {
        return 'FREE';
      }
      return subscription.planId;
    }

    // 2. Se for ProfessionalUser (compatibilidade)
    if (user && 'plano' in user) {
      const p = (user as ProfessionalUser).plano;
      if (p === 'Pro' || p === 'Profissional' || p === 'Premium') {
        return 'PRO';
      }
    }

    // 3. Se for UserProfile
    if (user && 'subscriptionPlan' in user) {
      const up = user as UserProfile;
      if (up.subscriptionPlan === 'PRO' || up.subscription?.plan === 'PRO') {
        return 'PRO';
      }
    }

    return 'FREE';
  }

  /**
   * Obtém os detalhes comerciais completos do plano de um usuário
   */
  static getUserPlan(
    user?: UserProfile | ProfessionalUser | null,
    subscription?: UserSubscription | null
  ): CommercialPlanDetails {
    const planType = this.getUserPlanType(user, subscription);
    return getSubscriptionPlan(planType);
  }

  /**
   * Consulta comercial (SUB): usuário possui PRO?
   */
  static isPro(user?: UserProfile | null): boolean {
    return this.getUserPlanType(user) === 'PRO';
  }

  /**
   * Consulta comercial (SUB): usuário possui PRO ativo?
   * Suporta tanto UserProfile quanto ProfessionalUser e UserSubscription.
   */
  static isProUser(
    user?: UserProfile | ProfessionalUser | null,
    subscription?: UserSubscription | null
  ): boolean {
    if (subscription) {
      return this.hasProSubscription(subscription);
    }
    return this.getUserPlanType(user) === 'PRO';
  }

  /**
   * Consulta comercial (SUB): assinatura é PRO ativa e não expirada?
   */
  static hasProSubscription(subscription?: UserSubscription | null): boolean {
    if (!subscription) return false;
    return subscription.planId === 'PRO' && this.isSubscriptionActive(subscription);
  }

  /**
   * Consulta comercial (SUB): assinatura ativa?
   * Retorna true para status ACTIVE ou TRIAL não vencidos.
   */
  static isSubscriptionActive(subscription?: UserSubscription | Subscription | null): boolean {
    if (!subscription) return false;

    // Se tiver expiresAt no passado, não está mais ativa
    if (subscription.expiresAt) {
      const expTime = new Date(subscription.expiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        return false;
      }
    }

    const st = subscription.status;
    return st === 'ACTIVE' || st === 'TRIAL';
  }

  /**
   * Consulta comercial (SUB): plano expirado?
   * Retorna true se status for EXPIRED ou se a data expiresAt já passou.
   */
  static isSubscriptionExpired(subscription?: UserSubscription | Subscription | null): boolean {
    if (!subscription) return false;
    if (subscription.status === 'EXPIRED') {
      return true;
    }
    if (subscription.expiresAt) {
      const expTime = new Date(subscription.expiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verifica permissão para criação de documentos.
   * Bloqueio visual baseado no último contador sincronizado; o backend continua sendo a fonte autoritativa.
   */
  static canCreateDocument(
    user?: UserProfile | null,
    providedUsage?: UserUsage
  ): GuardCheckResult {
    const planType = this.getUserPlanType(user);
    const plan = getSubscriptionPlan(planType);
    const userId = user?.id || 'active_user';
    const usage = providedUsage || UsageTracker.getUsage(userId);

    const current = usage.documentsCreatedThisMonth;
    const max = plan.limits.documentsPerMonth;
    const limitReached = current >= max;

    const message = limitReached
      ? `Você atingiu o limite de ${max} documentos neste mês no ${plan.name}.`
      : `Você utilizou ${current} de ${max} documentos este mês.`;

    return {
      allowed: !limitReached,
      limitReached,
      current,
      max,
      message,
      planType,
    };
  }

  /**
   * Verifica permissão para utilização do Assistente IA.
   * Bloqueio visual com base no último contador sincronizado; o backend valida cada chamada de IA.
   */
  static canUseAIAssistant(
    user?: UserProfile | null,
    providedUsage?: UserUsage
  ): GuardCheckResult {
    const planType = this.getUserPlanType(user);
    const plan = getSubscriptionPlan(planType);
    const userId = user?.id || 'active_user';
    const usage = providedUsage || UsageTracker.getUsage(userId);

    const current = usage.aiRequestsThisMonth;
    const max = plan.limits.aiRequestsPerMonth;
    const limitReached = current >= max;

    const message = limitReached
      ? `Você atingiu ${current} de ${max} requisições do Assistente IA no ${plan.name}.`
      : `Você utilizou ${current} de ${max} consultas do Assistente IA este mês.`;

    return {
      allowed: !limitReached,
      limitReached,
      current,
      max,
      message,
      planType,
    };
  }

  /**
   * Verifica se uma funcionalidade específica está disponível no plano.
   */
  static canAccessFeature(
    user: UserProfile | null | undefined,
    featureKey: 'unlimitedHistory' | 'advancedFeatures' | string
  ): boolean {
    const plan = this.getUserPlan(user);
    if (featureKey in plan.limits) {
      return Boolean((plan.limits as any)[featureKey]);
    }
    // Recursos padrão são permitidos
    return true;
  }

  /**
   * PROTEÇÃO ARQUITETURAL INEGOCIÁVEL (PLAN-007):
   * O Plano Comercial (FREE ou PRO) JAMAIS sobrepõe ou viola o RBAC profissional do COFEN.
   * Um Técnico de Enfermagem PRO NÃO pode acessar módulos privativos do Enfermeiro.
   * Um Enfermeiro no plano FREE continua tendo acesso a todos os módulos do Enfermeiro.
   */
  static assertProfessionalRoleCompatibility(
    role: 'nurse' | 'technician',
    moduleId: string,
    _planType: SubscriptionPlanType = 'FREE'
  ): { allowed: boolean; reason?: string } {
    const isAllowedByRole = ProfessionalRolePolicy.isModuleAllowedForRole(moduleId, role);
    if (!isAllowedByRole) {
      return {
        allowed: false,
        reason: `Módulo assistencial '${moduleId}' é restrito pela legislação COFEN para o perfil ${role}. O plano comercial não altera atribuições legais.`,
      };
    }
    return {
      allowed: true,
    };
  }
}
