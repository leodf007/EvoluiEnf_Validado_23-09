/**
 * EvoluiEnf - EntitlementService
 * 
 * Camada unificada e centralizada de controle de acesso a funcionalidades,
 * entitlements, cotas e planos (Free / PRO).
 * 
 * Centraliza toda verificação de permissão e recursos, eliminando checagens
 * dispersas (ex: `if (user.plan === 'PRO')`) pela interface.
 * 
 * REGRAS INEGOCIÁVEIS:
 * - Não bloqueia módulos clínicos arbitrariamente.
 * - Prerrogativas legais COFEN / RBAC são absolutas e NUNCA são alteradas por planos comerciais.
 * - Suporta verificação síncrona com cache e assíncrona com Firestore.
 */

import {
  UserProfile,
  ProfessionalUser,
  UserSubscription,
  SubscriptionPlanType,
  UserSubscriptionStatus,
  CanonicalSubscriptionStatus,
} from '../types';
import { SubscriptionGuard, GuardCheckResult } from './subscriptionGuard';
import { SubscriptionService } from './subscriptionService';
import { getSubscriptionPlan, CommercialPlanDetails } from './subscriptionPlans';
import { UsageTracker } from './usageTracker';
import { ProfessionalRolePolicy } from '../engine/factory/professionalRolePolicy';

export type FeatureKey =
  | 'create_document'
  | 'ai_assistant'
  | 'unlimited_history'
  | 'advanced_export'
  | 'priority_support'
  | 'custom_templates';

export interface EntitlementCheckResult {
  hasAccess: boolean;
  isPro: boolean;
  planType: SubscriptionPlanType;
  status: UserSubscriptionStatus | CanonicalSubscriptionStatus;
  limitReached: boolean;
  currentUsage: number;
  maxLimit: number;
  reason?: string;
}

export class EntitlementService {
  /**
   * Determina se o usuário é PRO ativo.
   * Consulta a fonte autorizada com suporte a fallback seguro.
   */
  static isPro(user?: UserProfile | ProfessionalUser | UserSubscription | string | null): boolean {
    if (!user) return false;

    // Se for UserSubscription direta
    if (typeof user === 'object' && 'planId' in user) {
      return SubscriptionGuard.hasProSubscription(user as UserSubscription);
    }

    // Se for string (userId)
    if (typeof user === 'string') {
      const sub = SubscriptionService.getSubscriptionLocal(user);
      return sub ? SubscriptionGuard.hasProSubscription(sub) : false;
    }

    return SubscriptionGuard.isProUser(user as UserProfile);
  }

  /**
   * Consulta assíncrona confiável direto da fonte canônica Firestore
   */
  static async isProAsync(userId: string): Promise<boolean> {
    if (!userId) return false;
    return SubscriptionService.isProAuthorized(userId);
  }

  /**
   * Obtém o status da assinatura do usuário
   */
  static getSubscriptionStatus(
    user?: UserProfile | ProfessionalUser | UserSubscription | string | null
  ): UserSubscriptionStatus {
    if (user && typeof user === 'object' && 'status' in user && 'planId' in user) {
      return (user as UserSubscription).status;
    }
    const userId = typeof user === 'string' ? user : (user as any)?.id;
    if (!userId) return 'ACTIVE';
    const sub = SubscriptionService.getSubscriptionLocal(userId);
    return sub?.status || 'ACTIVE';
  }

  /**
   * Retorna os detalhes comerciais do plano vigente do usuário
   */
  static getPlanDetails(
    user?: UserProfile | ProfessionalUser | UserSubscription | string | null
  ): CommercialPlanDetails {
    const isProUser = this.isPro(user);
    return getSubscriptionPlan(isProUser ? 'PRO' : 'FREE');
  }

  /**
   * Obtém o limite numérico de uma cota específica para o plano do usuário
   */
  static getQuotaLimit(
    quotaKey: 'documentsPerMonth' | 'aiRequestsPerMonth',
    user?: UserProfile | ProfessionalUser | UserSubscription | string | null
  ): number {
    const details = this.getPlanDetails(user);
    return details.limits[quotaKey];
  }

  /**
   * Verificação centralizada de acesso a uma feature específica
   */
  static canUseFeature(
    user: UserProfile | ProfessionalUser | UserSubscription | string | null | undefined,
    feature: FeatureKey
  ): EntitlementCheckResult {
    const userId = typeof user === 'string' ? user : (user as any)?.userId || user?.id || 'anonymous';
    const isProUser = this.isPro(user);
    const planType: SubscriptionPlanType = isProUser ? 'PRO' : 'FREE';
    const plan = getSubscriptionPlan(planType);
    const usage = UsageTracker.getUsage(userId);
    const status = this.getSubscriptionStatus(user);

    switch (feature) {
      case 'create_document': {
        const currentUsage = usage.documentsCreatedThisMonth;
        const maxLimit = plan.limits.documentsPerMonth;
        const limitReached = currentUsage >= maxLimit;

        return {
          hasAccess: !limitReached,
          isPro: isProUser,
          planType,
          status,
          limitReached,
          currentUsage,
          maxLimit,
          reason: limitReached
            ? `Limite mensal do plano ${plan.name} atingido (${currentUsage}/${maxLimit}).`
            : undefined,
        };
      }

      case 'ai_assistant': {
        const currentUsage = usage.aiRequestsThisMonth;
        const maxLimit = plan.limits.aiRequestsPerMonth;
        const limitReached = currentUsage >= maxLimit;

        return {
          hasAccess: !limitReached,
          isPro: isProUser,
          planType,
          status,
          limitReached,
          currentUsage,
          maxLimit,
          reason: limitReached
            ? `Cota do Assistente IA atingida no plano ${plan.name} (${currentUsage}/${maxLimit}).`
            : undefined,
        };
      }

      case 'unlimited_history':
      case 'advanced_export':
      case 'custom_templates':
      case 'priority_support': {
        const hasAccess = isProUser || plan.limits[feature] === true;
        return {
          hasAccess,
          isPro: isProUser,
          planType,
          status,
          limitReached: !hasAccess,
          currentUsage: 0,
          maxLimit: 1,
          reason: !hasAccess
            ? `O recurso '${feature}' faz parte dos benefícios do EvoluiEnf PRO.`
            : undefined,
        };
      }

      default:
        return {
          hasAccess: true,
          isPro: isProUser,
          planType,
          status,
          limitReached: false,
          currentUsage: 0,
          maxLimit: 999999,
        };
    }
  }

  /**
   * Validação de permissão de documento com mensagem descritiva
   */
  static canCreateDocument(user?: UserProfile | null): GuardCheckResult {
    return SubscriptionGuard.canCreateDocument(user);
  }

  /**
   * Validação de permissão do Assistente IA
   */
  static canUseAIAssistant(user?: UserProfile | null): GuardCheckResult {
    return SubscriptionGuard.canUseAIAssistant(user);
  }

  /**
   * GARANTIA ÉTICA E LEGAL COFEN (PLAN-007):
   * O Plano Comercial NUNCA substitui nem sobrepõe a restrição de escopo legal da enfermagem.
   */
  static assertProfessionalRoleCompatibility(
    role: 'nurse' | 'technician',
    moduleId: string
  ): { allowed: boolean; reason?: string } {
    return SubscriptionGuard.assertProfessionalRoleCompatibility(role, moduleId);
  }
}
