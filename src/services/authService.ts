import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  ProfessionalUser,
  Profissao,
  PlanoAssinatura,
  UserProfile,
  ProfessionalCategory,
  UserPreferences,
} from '../types';
import { UserService } from './userService';
import { UsageTracker } from './usageTracker';
import { ENV_CONFIG } from '../config/environment';

const USERS_COLLECTION = 'users';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const USAGE_COLLECTION = 'usage';
const LOCAL_USER_KEY = 'evoluienf_active_user_v1';

export class AuthService {
  /**
   * Realiza cadastro real do profissional com Nome, Email, Senha e Categoria Profissional.
   * Não solicita CPF, RG, COREN ou endereço.
   */
  static async cadastrarUsuario(
    nome: string,
    email: string,
    senha: string,
    categoria: ProfessionalCategory,
    coren: string = 'COREN-SP 000.000'
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = nome.trim() || 'Profissional';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('E-mail informado é inválido.');
    }
    if (!senha || senha.length < 6) {
      throw new Error('A senha deve conter no mínimo 6 caracteres.');
    }

    let uid = 'usr-prof-' + Date.now();
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, senha);
      if (cred.user) {
        uid = cred.user.uid;
        await updateProfile(cred.user, { displayName: cleanName });
      }
    } catch (err: any) {
      if (ENV_CONFIG.isProduction) {
        throw err;
      }
      // Se Firebase Auth não puder se conectar em ambiente de teste offline,
      // fallback gracioso mantendo estritamente a modelagem do UserProfile
      console.warn('Registro no Firebase Auth encontrou restrição de rede, gerando perfil local seguro:', err?.message || err);
      if (err?.code === 'auth/email-already-in-use') {
        throw err;
      }
    }

    const profile = await UserService.criarPerfil(uid, cleanName, cleanEmail, categoria, coren);
    const legacyProf = UserService.toProfessionalUser(profile);
    legacyProf.registroProfissional = coren;
    this.salvarUsuarioLocal(legacyProf);

    return profile;
  }

  /**
   * Realiza login real do profissional com Email e Senha.
   */
  static async loginUsuario(email: string, senha: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    let uid = '';

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, senha);
      uid = cred.user.uid;
    } catch (err: any) {
      if (ENV_CONFIG.isProduction) {
        throw err;
      }
      console.warn('Falha na autenticação remota, verificando credenciais locais:', err?.message || err);
      // Fallback estrito apenas para testes / modo mock
      const local = this.obterUsuarioLocal();
      if (local && local.email.toLowerCase() === cleanEmail) {
        uid = local.id;
      } else {
        throw err;
      }
    }

    let profile = await UserService.obterPerfil(uid);
    if (!profile) {
      profile = await UserService.criarPerfil(
        uid,
        cleanEmail.split('@')[0],
        cleanEmail,
        'NURSE'
      );
    }

    const legacyProf = UserService.toProfessionalUser(profile);
    this.salvarUsuarioLocal(legacyProf);
    UserService.salvarSessaoLocal(profile);

    return profile;
  }

  /**
   * Recuperação de senha real através do envio de e-mail seguro do Firebase Auth.
   */
  static async recuperarSenha(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Informe um e-mail válido para a recuperação de senha.');
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      if (ENV_CONFIG.isProduction) {
        throw err;
      }
      console.warn('Falha ao enviar e-mail de recuperação de senha pelo Firebase Auth:', err?.message || err);
      // Não trava em ambiente de teste/preview sem SMTP
      if (err?.code === 'auth/user-not-found') {
        throw new Error('Nenhum usuário cadastrado com este e-mail.');
      }
    }
  }

  /**
   * Atualização de nome do usuário autenticado.
   */
  static async atualizarNome(uid: string, novoNome: string): Promise<UserProfile> {
    const cleanName = novoNome.trim();
    if (!cleanName) {
      throw new Error('O nome não pode ser vazio.');
    }

    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: cleanName });
      } catch (e) {
        console.warn('Não foi possível atualizar displayName no Firebase Auth:', e);
      }
    }

    const updated = await UserService.atualizarNome(uid, cleanName);
    const legacy = UserService.toProfessionalUser(updated);
    this.salvarUsuarioLocal(legacy);

    return updated;
  }

  /**
   * Atualização da senha do usuário autenticado.
   */
  static async atualizarSenha(novaSenha: string): Promise<void> {
    if (!novaSenha || novaSenha.length < 6) {
      throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
    }

    if (auth.currentUser) {
      await updatePassword(auth.currentUser, novaSenha);
    } else {
      // Se não há sessão remota ativa, simula para testes locais
      console.log('Senha atualizada com sucesso no ambiente local.');
    }
  }

  /**
   * Atualiza preferências de interface.
   */
  static async atualizarPreferencias(
    uid: string,
    novasPreferencias: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    return UserService.atualizarPreferencias(uid, novasPreferencias);
  }

  /**
   * Logout seguro: encerra sessão do Firebase Auth e purga dados temporários.
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Erro ao deslogar do Firebase Auth:', err);
    } finally {
      this.limparUsuarioLocal();
      UserService.limparSessaoLocal();
      UsageTracker.clearUsage();
    }
  }

  // =========================================================================
  // MÉTODOS DE COMPATIBILIDADE LEGADA (PRESERVAM MÓDULOS EXISTENTES)
  // =========================================================================

  static async cadastrarComEmailESenha(
    email: string,
    senha: string,
    nome: string,
    profissao: Profissao = 'Enfermeiro',
    registroProfissional = 'COREN-SP 543.210',
    estado = 'SP'
  ): Promise<ProfessionalUser> {
    const categoria: ProfessionalCategory =
      profissao === 'Enfermeiro' ? 'NURSE' : 'TECHNICIAN';
    const profile = await this.cadastrarUsuario(nome, email, senha, categoria, registroProfissional);
    const profUser = UserService.toProfessionalUser(profile);
    profUser.registroProfissional = registroProfissional;
    profUser.estado = estado;
    return profUser;
  }

  static async loginComEmailESenha(email: string, senha: string): Promise<ProfessionalUser> {
    const profile = await this.loginUsuario(email, senha);
    return UserService.toProfessionalUser(profile);
  }

  static async obterPerfilUsuario(uid: string): Promise<ProfessionalUser | null> {
    const profile = await UserService.obterPerfil(uid);
    if (profile) {
      return UserService.toProfessionalUser(profile);
    }
    return this.obterUsuarioLocal(uid);
  }

  static async atualizarPerfilUsuario(
    uid: string,
    dados: Partial<ProfessionalUser>
  ): Promise<void> {
    if (dados.nome) {
      await this.atualizarNome(uid, dados.nome);
    }
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(docRef, dados);
    } catch (err) {
      console.warn('Falha ao atualizar no Firestore, persistindo localmente:', err);
    }

    const current = this.obterUsuarioLocal(uid);
    if (current) {
      this.salvarUsuarioLocal({ ...current, ...dados });
    }
  }

  static observarSessao(
    callback: (user: ProfessionalUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        this.limparUsuarioLocal();
        UserService.limparSessaoLocal();
        callback(null);
        return;
      }

      const profile = await UserService.obterPerfil(firebaseUser.uid);
      if (profile) {
        callback(UserService.toProfessionalUser(profile));
      } else {
        const minimal: ProfessionalUser = {
          id: firebaseUser.uid,
          nome: firebaseUser.displayName || 'Profissional',
          email: firebaseUser.email || '',
          profissao: 'Enfermeiro',
          plano: 'Free',
          isAuthenticated: true,
          role: 'nurse',
        };
        callback(minimal);
      }
    });
  }

  // --- Helpers de Cache Local ---
  static salvarUsuarioLocal(user: ProfessionalUser): void {
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } catch {
      // no-op
    }
  }

  static obterUsuarioLocal(uid?: string): ProfessionalUser | null {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ProfessionalUser;
      if (uid && parsed.id !== uid) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  static limparUsuarioLocal(): void {
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {
      // no-op
    }
  }
}
