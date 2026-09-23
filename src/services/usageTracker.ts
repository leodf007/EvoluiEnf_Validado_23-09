import { UserUsage, SubscriptionPlanType } from '../types';
import { getSubscriptionPlan } from './subscriptionPlans';
import { QuotaService } from './quotaService';

const USAGE_STORAGE_KEY = 'evoluienf_user_usage_v1';

interface UsageStore {
  [userId: string]: UserUsage;
}

export class UsageTracker {
  /**
   * Obtém a chave do período mensal corrente no formato YYYY-MM (ex: '2026-09')
   */
  static getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Lê o mapa de armazenamento local de uso
   */
  private static readStore(): UsageStore {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(USAGE_STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /**
   * Salva o mapa de armazenamento local de uso
   */
  private static writeStore(store: UsageStore): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Ignora falhas de cota no localStorage
    }
  }

  /**
   * Obtém o uso mensal atual do usuário.
   * Se o mês mudou, redefine automaticamente os contadores para o novo período.
   */
  static getUsage(userId: string = 'active_user'): UserUsage {
    const store = this.readStore();
    const currentPeriod = this.getCurrentPeriod();
    const userUsage = store[userId];

    if (!userUsage || userUsage.period !== currentPeriod) {
      const freshUsage: UserUsage = {
        documentsCreatedThisMonth: 0,
        aiRequestsThisMonth: 0,
        period: currentPeriod,
        lastResetDate: new Date().toISOString(),
      };
      store[userId] = freshUsage;
      this.writeStore(store);
      return freshUsage;
    }

    return userUsage;
  }


  /**
   * Atualiza o cache de exibição com o valor autoritativo retornado pelo backend.
   * O cache local nunca é usado pelo servidor para autorizar consumo.
   */
  static setAuthoritativeUsage(userId: string, usage: UserUsage): UserUsage {
    const store = this.readStore();
    store[userId] = usage;
    this.writeStore(store);
    return usage;
  }

  /**
   * Sincroniza o contador visual com o backend autenticado.
   */
  static async refreshFromServer(userId: string): Promise<UserUsage> {
    const snapshot = await QuotaService.getCurrentUsage();
    return this.setAuthoritativeUsage(userId, QuotaService.toUserUsage(snapshot));
  }

  /**
   * Contabiliza a criação de um documento clínico.
   * Não bloqueia; apenas incrementa o registro.
   */
  static recordDocumentCreation(userId: string = 'active_user'): UserUsage {
    const store = this.readStore();
    const current = this.getUsage(userId);
    const updated: UserUsage = {
      ...current,
      documentsCreatedThisMonth: current.documentsCreatedThisMonth + 1,
    };
    store[userId] = updated;
    this.writeStore(store);
    return updated;
  }

  /**
   * Contabiliza uma requisição ou interação com o Assistente IA.
   * Não bloqueia; apenas incrementa o registro.
   */
  static recordAiRequest(userId: string = 'active_user'): UserUsage {
    const store = this.readStore();
    const current = this.getUsage(userId);
    const updated: UserUsage = {
      ...current,
      aiRequestsThisMonth: current.aiRequestsThisMonth + 1,
    };
    store[userId] = updated;
    this.writeStore(store);
    return updated;
  }

  /**
   * Limpa os dados de uso de um usuário específico ou todos (ao deslogar).
   */
  static clearUsage(userId?: string): void {
    if (typeof window === 'undefined') return;
    const store = this.readStore();
    if (userId) {
      delete store[userId];
      this.writeStore(store);
    } else {
      try {
        localStorage.removeItem(USAGE_STORAGE_KEY);
      } catch {
        // Ignora
      }
    }
  }

  /**
   * Reseta o uso para um novo usuário logado.
   */
  static resetForNewUser(userId: string = 'active_user'): UserUsage {
    const store = this.readStore();
    const currentPeriod = this.getCurrentPeriod();
    const fresh: UserUsage = {
      documentsCreatedThisMonth: 0,
      aiRequestsThisMonth: 0,
      period: currentPeriod,
      lastResetDate: new Date().toISOString(),
    };
    store[userId] = fresh;
    this.writeStore(store);
    return fresh;
  }

  /**
   * Formata mensagem amigável de uso de documentos:
   * Exemplo: "Você utilizou 8 de 10 documentos este mês."
   */
  static formatDocumentUsageMessage(
    usage: UserUsage,
    planType: SubscriptionPlanType = 'FREE'
  ): string {
    const plan = getSubscriptionPlan(planType);
    return `Você utilizou ${usage.documentsCreatedThisMonth} de ${plan.limits.documentsPerMonth} documentos este mês${planType === 'PRO' ? ' (Plano PRO)' : ''}.`;
  }

  /**
   * Formata mensagem amigável de uso da IA:
   * Exemplo: "Você utilizou 3 de 5 consultas IA este mês."
   */
  static formatAiUsageMessage(
    usage: UserUsage,
    planType: SubscriptionPlanType = 'FREE'
  ): string {
    const plan = getSubscriptionPlan(planType);
    return `Você utilizou ${usage.aiRequestsThisMonth} de ${plan.limits.aiRequestsPerMonth} consultas do Assistente IA este mês${planType === 'PRO' ? ' (Plano PRO)' : ''}.`;
  }

  /**
   * Retorna um resumo completo de status e progresso de uso
   */
  static getUsageSummary(
    userId: string = 'active_user',
    planType: SubscriptionPlanType = 'FREE'
  ) {
    const usage = this.getUsage(userId);
    const plan = getSubscriptionPlan(planType);

    const docLimit = plan.limits.documentsPerMonth;
    const aiLimit = plan.limits.aiRequestsPerMonth;

    const docPercent = Math.min(100, Math.round((usage.documentsCreatedThisMonth / docLimit) * 100));
    const aiPercent = Math.min(100, Math.round((usage.aiRequestsThisMonth / aiLimit) * 100));

    return {
      period: usage.period || this.getCurrentPeriod(),
      documentsUsed: usage.documentsCreatedThisMonth,
      documentsLimit: docLimit,
      documentsPercent: docPercent,
      documentMessage: this.formatDocumentUsageMessage(usage, planType),
      aiUsed: usage.aiRequestsThisMonth,
      aiLimit: aiLimit,
      aiPercent: aiPercent,
      aiMessage: this.formatAiUsageMessage(usage, planType),
      isPro: planType === 'PRO',
      planName: plan.name,
    };
  }
}
