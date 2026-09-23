import { UserSubscription, UserSubscriptionStatus, SubscriptionPlanType, PaymentProvider } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ENV_CONFIG } from '../config/environment';
import { authenticatedFetch } from './authenticatedFetch';

const SUBSCRIPTIONS_KEY_PREFIX = 'evoluienf_user_sub_';
// Coleção canônica oficial segundo diretrizes da ETAPA 6
const CANONICAL_SUBSCRIPTIONS_COLLECTION = 'subscriptions';
// Coleção legada para leitura compatível e migração segura
const LEGACY_SUBSCRIPTIONS_COLLECTION = 'user_subscriptions';

export class SubscriptionService {
  /**
   * Retorna o nome da coleção canônica oficial.
   */
  static get canonicalCollectionName(): string {
    return CANONICAL_SUBSCRIPTIONS_COLLECTION;
  }

  /**
   * Retorna o nome da coleção legada suportada para migração.
   */
  static get legacyCollectionName(): string {
    return LEGACY_SUBSCRIPTIONS_COLLECTION;
  }

  /**
   * Gera a assinatura padrão FREE para um novo usuário.
   */
  static createDefaultFreeSubscription(userId: string): UserSubscription {
    const now = new Date().toISOString();
    return {
      id: `sub_free_${userId}`,
      userId,
      planId: 'FREE',
      plan: 'FREE',
      status: 'ACTIVE',
      canonicalStatus: 'active',
      startedAt: now,
      createdAt: now,
      updatedAt: now,
      paymentProvider: 'NONE',
      provider: 'NONE',
    };
  }

  /**
   * Obtém a assinatura ativa do usuário com fallback e migração transparente.
   * 1. Consulta a coleção canônica 'subscriptions'
   * 2. Se não existir, consulta a coleção legada 'user_subscriptions'
   * 3. Caso encontrada no legado, migra de forma segura e não destrutiva para 'subscriptions'
   * 4. Garante isolamento estrito de dados entre UIDs autenticados
   */
  static async getSubscription(userId: string): Promise<UserSubscription> {
    if (!userId) {
      return this.createDefaultFreeSubscription('anonymous');
    }

    // 1. Tenta recuperar da coleção canônica oficial 'subscriptions'
    try {
      const snapCanonical = await getDoc(doc(db, CANONICAL_SUBSCRIPTIONS_COLLECTION, userId));
      
      if (snapCanonical.exists()) {
        const data = snapCanonical.data() as any;
        const ownerId = data.userId || data.usuarioId;
        
        if (ownerId === userId) {
          const subObj = this.mapDataToSubscription(userId, data);
          this.saveSubscriptionLocal(subObj);
          return this.checkExpiration(subObj);
        }
      }

      // 2. Leitura compatível temporária na coleção legada 'user_subscriptions'
      const snapLegacy = await getDoc(doc(db, LEGACY_SUBSCRIPTIONS_COLLECTION, userId));
      if (snapLegacy.exists()) {
        const legacyData = snapLegacy.data() as any;
        const ownerId = legacyData.userId || legacyData.usuarioId;

        if (ownerId === userId) {
          const migratedSub = this.mapDataToSubscription(userId, legacyData);
          
          // Migração segura é executada pelo backend autenticado; o cliente não possui
          // permissão para escrever no estado comercial da assinatura.
          try {
            await authenticatedFetch('/api/subscriptions/migrate-legacy', { method: 'POST' });
          } catch (migErr) {
            console.warn('Migração em segundo plano adiada:', migErr);
          }

          this.saveSubscriptionLocal(migratedSub);
          return this.checkExpiration(migratedSub);
        }
      }
    } catch {
      // Offline ou indisponibilidade temporária de rede
    }

    // 3. Consulta cache local isolado por userId
    const local = this.getSubscriptionLocal(userId);
    if (local && local.userId === userId) {
      return this.checkExpiration(local);
    }

    // 4. Fallback: cria assinatura FREE padrão
    const defaultSub = this.createDefaultFreeSubscription(userId);
    this.saveSubscriptionLocal(defaultSub);
    return defaultSub;
  }

  /**
   * Mapeador padronizado de documentos do Firestore para o modelo canônico UserSubscription
   */
  public static mapDataToSubscription(userId: string, data: any): UserSubscription {
    const rawPlan = data.planId || data.plan || (data.plano === 'Pro' ? 'PRO' : 'FREE');
    const planId: SubscriptionPlanType = rawPlan === 'PRO' || rawPlan === 'Pro' ? 'PRO' : 'FREE';
    const rawStatus = (data.status || 'ACTIVE').toUpperCase();
    
    let canonicalStatus: 'active' | 'pending' | 'past_due' | 'cancelled' | 'expired' = 'active';
    if (rawStatus === 'EXPIRED') canonicalStatus = 'expired';
    else if (rawStatus === 'CANCELED' || rawStatus === 'CANCELLED') canonicalStatus = 'cancelled';
    else if (rawStatus === 'PENDING') canonicalStatus = 'pending';
    else if (rawStatus === 'PAST_DUE') canonicalStatus = 'past_due';

    const provider: PaymentProvider = data.paymentProvider || data.provider || 'NONE';
    const startedAt = data.startedAt || data.createdAt || data.dataInicio || new Date().toISOString();
    const expiresAt = data.expiresAt || data.dataRenovacao || data.currentPeriodEnd;

    const normalizedStatus =
      rawStatus === 'ATIVO' || rawStatus === 'ACTIVE'
        ? 'ACTIVE'
        : (rawStatus as any);

    return {
      id: data.id || `sub_${userId}`,
      userId,
      planId,
      plan: planId,
      status: normalizedStatus,
      canonicalStatus,
      startedAt,
      createdAt: data.createdAt || startedAt,
      updatedAt: data.updatedAt || new Date().toISOString(),
      expiresAt,
      currentPeriodStart: data.currentPeriodStart || startedAt,
      currentPeriodEnd: expiresAt,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      paymentProvider: provider,
      provider,
      providerCustomerId: data.providerCustomerId,
      providerSubscriptionId: data.providerSubscriptionId || data.externalSubscriptionId,
      externalSubscriptionId: data.externalSubscriptionId || data.providerSubscriptionId,
    };
  }

  /**
   * Grava exclusivamente na coleção canônica 'subscriptions' (Sem dual-write)
   */
  private static async persistToCanonical(subscription: UserSubscription): Promise<void> {
    const now = new Date().toISOString();
    const payload = {
      id: subscription.id,
      userId: subscription.userId,
      usuarioId: subscription.userId,
      plan: subscription.planId,
      planId: subscription.planId,
      plano: subscription.planId === 'PRO' ? 'Pro' : 'Free',
      status: subscription.status,
      canonicalStatus: subscription.canonicalStatus || (subscription.status === 'ACTIVE' ? 'active' : 'expired'),
      startedAt: subscription.startedAt,
      createdAt: subscription.createdAt || subscription.startedAt || now,
      updatedAt: now,
      expiresAt: subscription.expiresAt || null,
      currentPeriodStart: subscription.currentPeriodStart || subscription.startedAt || now,
      currentPeriodEnd: subscription.currentPeriodEnd || subscription.expiresAt || null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      paymentProvider: subscription.paymentProvider || 'NONE',
      provider: subscription.provider || subscription.paymentProvider || 'NONE',
      providerCustomerId: subscription.providerCustomerId || null,
      providerSubscriptionId: subscription.providerSubscriptionId || subscription.externalSubscriptionId || null,
      externalSubscriptionId: subscription.externalSubscriptionId || null,
    };
    await setDoc(doc(db, CANONICAL_SUBSCRIPTIONS_COLLECTION, subscription.userId), payload);
  }

  /**
   * Obtém a assinatura síncrona do cache local isolada por userId
   */
  static getSubscriptionLocal(userId: string): UserSubscription | null {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(`${SUBSCRIPTIONS_KEY_PREFIX}${userId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as UserSubscription;
      if (parsed.userId !== userId) {
        return null;
      }
      return this.checkExpiration(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Persiste a assinatura local e remotamente na coleção canônica 'subscriptions'
   */
  static async saveSubscription(subscription: UserSubscription): Promise<void> {
    this.saveSubscriptionLocal(subscription);
    try {
      await this.persistToCanonical(subscription);
    } catch (err) {
      console.warn('Persistência remota da assinatura em subscriptions ignorada:', err);
    }
  }

  /**
   * Salva no localStorage isolado pelo id do usuário
   */
  static saveSubscriptionLocal(subscription: UserSubscription): void {
    try {
      localStorage.setItem(
        `${SUBSCRIPTIONS_KEY_PREFIX}${subscription.userId}`,
        JSON.stringify(subscription)
      );
    } catch {
      // no-op
    }
  }

  /**
   * Prepara ou simula o upgrade para o plano PRO (SUB-010).
   * Em produção, bloqueia ativação sem provedor comercial válido.
   */
  static async upgradeToPro(
    userId: string,
    provider: PaymentProvider = 'NONE',
    externalId?: string
  ): Promise<UserSubscription> {
    if (ENV_CONFIG.isProduction && provider === 'NONE') {
      throw new Error(
        'Em produção, a ativação do plano PRO requer confirmação de pagamento válida através de gateway autorizado.'
      );
    }

    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const proSub: UserSubscription = {
      id: `sub_pro_${userId}_${Date.now()}`,
      userId,
      planId: 'PRO',
      plan: 'PRO',
      status: 'ACTIVE',
      canonicalStatus: 'active',
      startedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: oneMonthLater,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: oneMonthLater,
      cancelAtPeriodEnd: false,
      paymentProvider: provider,
      provider,
      providerSubscriptionId: externalId,
      externalSubscriptionId: externalId,
    };

    await this.saveSubscription(proSub);
    return proSub;
  }

  /**
   * Downgrade para plano FREE
   */
  static async downgradeToFree(userId: string): Promise<UserSubscription> {
    const freeSub = this.createDefaultFreeSubscription(userId);
    await this.saveSubscription(freeSub);
    return freeSub;
  }

  /**
   * Simula expiração de assinatura para testes ou contingência (SUB-003)
   */
  static async expireSubscription(userId: string): Promise<UserSubscription> {
    const current = (await this.getSubscription(userId)) || this.createDefaultFreeSubscription(userId);
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Ontem
    const expiredSub: UserSubscription = {
      ...current,
      status: 'EXPIRED',
      canonicalStatus: 'expired',
      expiresAt: pastDate,
      currentPeriodEnd: pastDate,
      updatedAt: new Date().toISOString(),
    };
    await this.saveSubscription(expiredSub);
    return expiredSub;
  }

  /**
   * Limpa a assinatura de um usuário (ex: no logout SUB-009)
   */
  static clearUserSubscription(userId: string): void {
    try {
      localStorage.removeItem(`${SUBSCRIPTIONS_KEY_PREFIX}${userId}`);
    } catch {
      // no-op
    }
  }

  /**
   * Migração explícita de registros de user_subscriptions para subscriptions
   */
  static async migrateLegacySubscriptionToCanonical(userId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const response = await authenticatedFetch('/api/subscriptions/migrate-legacy', { method: 'POST' });
      if (!response.ok) return false;
      const data = await response.json();
      return Boolean(data.success && (data.migrated || data.reason === 'canonical_exists'));
    } catch {
      return false;
    }
  }

  /**
   * Validação de autorização PRO confiável vinculada ao UID.
   * Não confia em manipulação simples de localStorage do navegador.
   */
  static async isProAuthorized(userId: string): Promise<boolean> {
    if (!userId) return false;
    const sub = await this.getSubscription(userId);
    if (!sub) return false;
    if (sub.userId !== userId) return false;
    if (sub.planId !== 'PRO' && sub.plan !== 'PRO') return false;
    if (sub.status !== 'ACTIVE' && sub.canonicalStatus !== 'active') return false;
    
    // Validação de expiração
    if (sub.expiresAt) {
      const exp = new Date(sub.expiresAt).getTime();
      if (!isNaN(exp) && exp < Date.now()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verifica se a data de expiração venceu e atualiza o status dinamicamente
   */
  private static checkExpiration(subscription: UserSubscription): UserSubscription {
    if (subscription.expiresAt) {
      const expTime = new Date(subscription.expiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now() && (subscription.status === 'ACTIVE' || subscription.canonicalStatus === 'active')) {
        return {
          ...subscription,
          status: 'EXPIRED',
          canonicalStatus: 'expired',
        };
      }
    }
    return subscription;
  }
}
