import {
  UserProfile,
  ProfessionalCategory,
  UserPreferences,
  Subscription,
  ProfessionalUser,
  SubscriptionPlanType,
  SubscriptionStatusType,
  UserUsage,
  PreferredArea,
} from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UsageTracker } from './usageTracker';

const USERS_COLLECTION = 'users';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PREFERENCES_KEY = 'evoluienf_user_preferences_v1';
const SESSION_PROFILE_KEY = 'evoluienf_user_profile_session_v1';

export class UserService {
  /**
   * Converte UserProfile para o formato de compatibilidade ProfessionalUser
   */
  static toProfessionalUser(profile: UserProfile): ProfessionalUser {
    const role = profile.professionalCategory === 'NURSE' ? 'nurse' : 'technician';
    const profissao =
      profile.professionalCategory === 'NURSE'
        ? 'Enfermeiro'
        : 'Técnico em Enfermagem';

    return {
      id: profile.id,
      nome: profile.name,
      email: profile.email,
      profissao,
      plano: profile.subscriptionPlan === 'PRO' || profile.subscription?.plan === 'PRO' ? 'Pro' : 'Free',
      dataCadastro: profile.createdAt,
      dataCriacao: profile.createdAt,
      isAuthenticated: true,
      role,
      onboardingCompleted: profile.onboardingCompleted,
      firstAccessDate: profile.firstAccessDate,
      preferredArea: profile.preferredArea,
    };
  }

  /**
   * Converte dados brutos ou legados para o modelo canônico UserProfile
   */
  static normalizeUserProfile(raw: any, fallbackId?: string): UserProfile {
    const id = raw?.id || fallbackId || 'usr-anon';
    const name = raw?.name || raw?.nome || 'Profissional';
    const email = raw?.email || '';
    
    // Normalização da categoria profissional
    let professionalCategory: ProfessionalCategory = 'NURSE';
    if (
      raw?.professionalCategory === 'TECHNICIAN' ||
      raw?.role === 'technician' ||
      (typeof raw?.profissao === 'string' && raw.profissao.toLowerCase().includes('téc'))
    ) {
      professionalCategory = 'TECHNICIAN';
    }

    const createdAt = raw?.createdAt || raw?.dataCadastro || new Date().toISOString();
    
    const preferences: UserPreferences = {
      theme: raw?.preferences?.theme || 'light',
      fontSize: raw?.preferences?.fontSize || 'normal',
      compactMode: Boolean(raw?.preferences?.compactMode),
    };

    const planType: SubscriptionPlanType =
      raw?.subscriptionPlan === 'PRO' || raw?.subscription?.plan === 'PRO' || raw?.plano === 'Pro'
        ? 'PRO'
        : 'FREE';

    const statusType: SubscriptionStatusType =
      raw?.subscriptionStatus === 'INACTIVE' || raw?.subscription?.status === 'INACTIVE'
        ? 'INACTIVE'
        : 'ACTIVE';

    const subscription: Subscription = {
      plan: planType,
      status: statusType,
      createdAt: raw?.subscription?.createdAt || createdAt,
    };

    const usage: UserUsage = raw?.usage || UsageTracker.getUsage(id);
    const onboardingCompleted = raw?.onboardingCompleted === true;
    const firstAccessDate = raw?.firstAccessDate;
    const preferredArea = raw?.preferredArea;

    return {
      id,
      name,
      email,
      professionalCategory,
      createdAt,
      preferences,
      role: professionalCategory === 'NURSE' ? 'nurse' : 'technician',
      isAuthenticated: true,
      subscription,
      subscriptionPlan: planType,
      subscriptionStatus: statusType,
      usage,
      onboardingCompleted,
      firstAccessDate,
      preferredArea,
    };
  }

  /**
   * Cria perfil canônico no Firestore
   */
  static async criarPerfil(
    id: string,
    name: string,
    email: string,
    professionalCategory: ProfessionalCategory,
    coren: string = 'COREN-SP 000.000'
  ): Promise<UserProfile> {
    const now = new Date().toISOString();
    const preferences: UserPreferences = {
      theme: 'light',
      fontSize: 'normal',
      compactMode: false,
    };

    const subscription: Subscription = {
      plan: 'FREE',
      status: 'ACTIVE',
      createdAt: now,
    };

    const usage = UsageTracker.resetForNewUser(id);

    const profile: UserProfile = {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      professionalCategory,
      createdAt: now,
      preferences,
      role: professionalCategory === 'NURSE' ? 'nurse' : 'technician',
      isAuthenticated: true,
      subscription,
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'ACTIVE',
      usage,
      onboardingCompleted: false,
    };

    // 1. Salva documento canônico em users/{uid} (ETAPA 4: estrutura SaaS)
    try {
      const categoriaFormatada =
        professionalCategory === 'NURSE' ? 'Enfermeiro' : 'Técnico em Enfermagem';

      await setDoc(doc(db, USERS_COLLECTION, id), {
        id: profile.id,
        nome: profile.name,
        name: profile.name,
        email: profile.email,
        categoriaProfissional: categoriaFormatada,
        profissao: categoriaFormatada,
        professionalCategory: profile.professionalCategory,
        coren: coren,
        registroProfissional: coren,
        plano: 'Free',
        dataCadastro: profile.createdAt,
        createdAt: profile.createdAt,
        preferences: profile.preferences,
        onboardingCompleted: false,
        role: profile.role,
      });
    } catch (err) {
      console.warn('Persistência remota do perfil no Firestore ignorada em ambiente offline/teste:', err);
    }

    // 2. Cria documento de assinatura em subscriptions/{uid}
    try {
      await setDoc(doc(db, SUBSCRIPTIONS_COLLECTION, id), {
        plan: subscription.plan,
        status: subscription.status,
        createdAt: subscription.createdAt,
        userId: id,
        usuarioId: id,
      });
    } catch (err) {
      console.warn('Persistência remota da subscription no Firestore ignorada:', err);
    }

    // Salva na sessão ativa local
    this.salvarSessaoLocal(profile);
    return profile;
  }

  /**
   * Obtém perfil do usuário do Firestore ou do cache de sessão
   */
  static async obterPerfil(id: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, USERS_COLLECTION, id));
      if (snap.exists()) {
        const data = snap.data();
        const profile = this.normalizeUserProfile(data, id);
        this.salvarSessaoLocal(profile);
        return profile;
      }
    } catch (err) {
      console.warn('Falha na consulta remota ao Firestore, recorrendo ao cache de sessão:', err);
    }

    return this.obterSessaoLocal(id);
  }

  /**
   * Atualiza o nome do usuário
   */
  static async atualizarNome(id: string, novoNome: string): Promise<UserProfile> {
    const nomeLimpo = novoNome.trim();
    if (!nomeLimpo) {
      throw new Error('Nome não pode ser vazio.');
    }

    try {
      await updateDoc(doc(db, USERS_COLLECTION, id), {
        name: nomeLimpo,
        nome: nomeLimpo,
      });
    } catch (err) {
      console.warn('Falha ao atualizar nome no Firestore:', err);
    }

    const current = this.obterSessaoLocal(id) || {
      id,
      name: nomeLimpo,
      email: '',
      professionalCategory: 'NURSE' as ProfessionalCategory,
      createdAt: new Date().toISOString(),
      preferences: {},
    };

    const updated: UserProfile = {
      ...current,
      name: nomeLimpo,
    };
    this.salvarSessaoLocal(updated);
    return updated;
  }

  /**
   * Atualiza preferências de interface (zero dados clínicos)
   */
  static async atualizarPreferencias(
    id: string,
    novasPreferencias: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const currentProfile = this.obterSessaoLocal(id);
    const mergedPreferences: UserPreferences = {
      theme: 'light',
      fontSize: 'normal',
      compactMode: false,
      ...(currentProfile?.preferences || {}),
      ...novasPreferencias,
    };

    try {
      await updateDoc(doc(db, USERS_COLLECTION, id), {
        preferences: mergedPreferences,
      });
    } catch (err) {
      console.warn('Falha ao atualizar preferências no Firestore:', err);
    }

    if (currentProfile) {
      this.salvarSessaoLocal({
        ...currentProfile,
        preferences: mergedPreferences,
      });
    }

    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(mergedPreferences));
    } catch {
      // no-op em iframes isolados
    }

    return mergedPreferences;
  }

  /**
   * Conclui o fluxo de primeiro acesso (onboarding) salvando status, data e área preferida.
   * Não altera permissões, escopos COFEN ou planos comerciais.
   */
  static async concluirOnboarding(
    id: string,
    preferredArea: PreferredArea
  ): Promise<UserProfile> {
    const now = new Date().toISOString();
    const updates = {
      onboardingCompleted: true,
      firstAccessDate: now,
      preferredArea,
    };

    try {
      await updateDoc(doc(db, USERS_COLLECTION, id), updates);
    } catch (err) {
      console.warn('Falha ao atualizar status de onboarding no Firestore:', err);
    }

    const currentProfile = this.obterSessaoLocal(id);
    const updated: UserProfile = {
      ...(currentProfile || {
        id,
        name: 'Profissional',
        email: '',
        professionalCategory: 'NURSE',
        createdAt: now,
        preferences: {},
        role: 'nurse',
        isAuthenticated: true,
      }),
      onboardingCompleted: true,
      firstAccessDate: currentProfile?.firstAccessDate || now,
      preferredArea,
    };

    this.salvarSessaoLocal(updated);
    return updated;
  }

  /**
   * Recupera preferências salvas
   */
  static obterPreferencias(): UserPreferences {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // no-op
    }
    return {
      theme: 'light',
      fontSize: 'normal',
      compactMode: false,
    };
  }

  /**
   * Valida isolamento: garante que o perfil de usuário não contém dados clínicos
   */
  static validarIsolamentoClinico(profile: Partial<UserProfile>): { isIsolated: boolean; violations: string[] } {
    const violations: string[] = [];
    const forbiddenKeys = [
      'patient',
      'paciente',
      'prontuario',
      'leito',
      'diagnostico',
      'evolucao',
      'anotacao',
      'sinaisVitais',
      'dispositivos',
      'medicamentos',
      'clinicalData',
      'fatosAutorizados',
    ];

    for (const key of Object.keys(profile)) {
      const lower = key.toLowerCase();
      if (forbiddenKeys.some((f) => lower.includes(f))) {
        violations.push(`Propriedade clínica proibida encontrada no perfil: ${key}`);
      }
    }

    return {
      isIsolated: violations.length === 0,
      violations,
    };
  }

  // --- Gerenciamento da Sessão Local ---
  static salvarSessaoLocal(profile: UserProfile): void {
    try {
      localStorage.setItem(SESSION_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // no-op
    }
  }

  static obterSessaoLocal(id?: string): UserProfile | null {
    try {
      const raw = localStorage.getItem(SESSION_PROFILE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as UserProfile;
      if (id && parsed.id !== id) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  static limparSessaoLocal(): void {
    try {
      localStorage.removeItem(SESSION_PROFILE_KEY);
      localStorage.removeItem('evoluienf_active_user_v1');
    } catch {
      // no-op
    }
  }
}
