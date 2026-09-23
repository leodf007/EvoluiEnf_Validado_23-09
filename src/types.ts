export type UserRole = 'nurse' | 'technician' | null;

export type Profissao = 'Enfermeiro' | 'Técnico de Enfermagem' | 'Técnico em Enfermagem';

export type PlanoAssinatura = 'Free' | 'Pro' | 'Premium' | 'Gratuito' | 'Profissional' | 'Hospitalar';

export type PreferredArea =
  | 'PS/Emergência'
  | 'UTI'
  | 'Clínica Médica'
  | 'Clínica Cirúrgica'
  | 'Pediatria';

export interface ProfessionalUser {
  id: string;
  nome: string;
  email: string;
  profissao: Profissao;
  registroProfissional?: string;
  estado?: string;
  plano: PlanoAssinatura;
  dataCadastro?: string;
  dataCriacao?: string;
  isAuthenticated?: boolean;
  role?: UserRole;
  onboardingCompleted?: boolean;
  firstAccessDate?: string;
  preferredArea?: PreferredArea;
}

export type TipoRegistroAtendimento =
  | 'Evolução SOAP'
  | 'Evolução de Enfermagem'
  | 'Anotação Técnica'
  | 'Admissão'
  | 'Admissão de Enfermagem'
  | 'Feridas'
  | 'Avaliação de Feridas';

export type SexoAtendimento = 'Feminino' | 'Masculino' | 'Outro' | 'Não informado';

export type StatusAtendimento = 'rascunho' | 'em_andamento' | 'concluido' | 'exportado';

export type StatusSincronizacao = 'sincronizado' | 'pendente' | 'erro' | 'conflito';

export interface SincronizacaoMetadados {
  status: StatusSincronizacao;
  sincronizado: boolean;
  pendente: boolean;
  ultimaSincronizacao?: string; // Formato ISO 8601
  versaoLocal: number;
  versaoRemota?: number;
  tentativas?: number;
  ultimoErro?: string;
}

export type TipoOperacaoSync = 'CRIAR' | 'ATUALIZAR' | 'CONCLUIR' | 'EXPORTAR' | 'EXCLUIR';

export interface SyncQueueItem {
  id: string; // ID único do item na fila
  atendimentoId: string;
  usuarioId: string;
  tipoOperacao: TipoOperacaoSync;
  dados?: any;
  timestamp: string;
  tentativas: number;
  ultimoErro?: string;
}

export type AppEnvironment = 'development' | 'staging' | 'production';

export type TipoEventoAuditoria =
  | 'criacao'
  | 'edicao'
  | 'conclusao'
  | 'exportacao'
  | 'visualizacao';

export interface AuditoriaEvento {
  id: string;
  tipo: TipoEventoAuditoria;
  dataHora: string; // Formato ISO 8601
  usuarioId?: string;
  usuarioNome?: string;
  perfilProfissional?: string;
  descricao: string;
  metadados?: Record<string, any>;
}

export interface VersaoAtendimento {
  versao: number;
  dataHora: string; // Formato ISO 8601
  usuarioResponsavel?: string;
  perfilProfissional?: string;
  registroProfissional?: string;
  narrativa: string;
  resumoRegistro?: string;
  motivoAlteracao?: string;
}

export interface Atendimento {
  id: string;
  usuarioId: string;
  identificacao: string; // Ex: 'L.L.S.' ou código anônimo
  idade: string;
  sexo: SexoAtendimento;
  setor: string; // Ex: 'UTI', 'Emergência', 'Clínica Médica'
  leito: string; // Ex: '05'
  tipoRegistro: TipoRegistroAtendimento;
  dataCriacao: string; // Formato ISO 8601
  dataConclusao?: string; // Formato ISO 8601
  ultimaAlteracao?: string; // Formato ISO 8601
  status?: StatusAtendimento;
  resumoRegistro?: string;
  narrativaFinal?: string;
  modeloId?: string;
  modeloNome?: string;
  versaoModelo?: string;
  usuarioResponsavel?: string;
  perfilProfissional?: string;
  categoriaClinica?: string;
  registroProfissional?: string;
  // Trilha de Auditoria e Versionamento (Etapa 3)
  versaoAtual?: number;
  historicoVersoes?: VersaoAtendimento[];
  trilhaAuditoria?: AuditoriaEvento[];
  // Controle de Sincronização e Resiliência (Etapa 5)
  sincronizacao?: SincronizacaoMetadados;
  // Autorização comercial emitida pelo backend para contabilização mensal idempotente
  quotaPermitId?: string;
  quotaPeriod?: string;
  quotaValidationStatus?: 'pending' | 'authorized' | 'denied';
}

export interface SalvarAtendimentoParams {
  atendimentoId?: string;
  usuarioId?: string;
  usuarioResponsavel?: string;
  perfilProfissional?: string;
  categoriaClinica?: string;
  registroProfissional?: string;
  tipoRegistro?: TipoRegistroAtendimento;
  textoFinalGerado: string;
  dataHora?: string;
  setor?: string;
  leito?: string;
  identificacao?: string;
  idade?: string;
  sexo?: SexoAtendimento;
  resumoRegistro?: string;
  motivoAlteracao?: string;
  marcarComoExportado?: boolean;
  quotaPermitId?: string;
  quotaPeriod?: string;
}

export interface EvolucaoDocument {
  id: string;
  usuarioId: string;
  atendimentoId?: string;
  identificacao: string; // Apenas iniciais ou código anônimo
  setor: string;
  tipoRegistro: TipoRegistroAtendimento | string;
  moduloId?: string;
  narrativa: string;
  fatosAutorizados?: Record<string, unknown> | Array<unknown>;
  dataCriacao: string;
}

export interface SubscriptionRecord {
  id: string;
  usuarioId: string;
  plano: PlanoAssinatura;
  status: 'ativo' | 'cancelado' | 'pendente';
  dataInicio: string;
  dataRenovacao?: string;
}

export interface UsageRecord {
  id: string;
  usuarioId: string;
  mesAno: string; // Formato YYYY-MM
  totalAtendimentos: number;
  totalEvolucoes: number;
  totalRefinamentosIA: number;
  ultimoUso: string;
}

export type AppScreen =
  | 'welcome'
  | 'welcome-flow'
  | 'login'
  | 'register'
  | 'role-selection'
  | 'dashboard'
  | 'novo-atendimento'
  | 'historico-atendimentos'
  | 'assistential-areas'
  | 'admission-assistential-areas'
  | 'admission-clinical-evolution'
  | 'nurse-admission-assistential-areas'
  | 'nurse-admission-clinical'
  | 'nurse-admission-icu'
  | 'nurse-evolution-assistential-areas'
  | 'nurse-evolution-clinical'
  | 'nurse-evolution-icu'
  | 'nurse-evolution-medical-clinic'
  | 'nurse-evolution-surgical-clinic'
  | 'nurse-evolution-pediatrics'
  | 'er-preparation'
  | 'clinical-evolution'
  | 'icu-clinical-evolution'
  | 'medical-clinic-evolution'
  | 'surgical-clinic-evolution'
  | 'pediatric-clinic-evolution'
  | 'nurse-wounds-assessment'
  | 'nurse-soap'
  | 'model-library'
  | 'model-detail'
  | 'favorite-models'
  | 'account'
  | 'plans'
  | 'subscription'
  | 'checkout-placeholder'
  | 'privacy'
  | 'terms';

export type NavigationTab =
  | 'inicio'
  | 'novo'
  | 'novo-atendimento'
  | 'modelos'
  | 'historico'
  | 'atendimentos'
  | 'registros'
  | 'conta';

export * from './types/models';

export type ProfessionalCategory = 'NURSE' | 'TECHNICIAN';

export type SubscriptionPlanType = 'FREE' | 'PRO';

export type UserSubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELED'
  | 'EXPIRED';

export type CanonicalSubscriptionStatus =
  | 'active'
  | 'pending'
  | 'past_due'
  | 'cancelled'
  | 'expired';

export type PaymentProvider =
  | 'NONE'
  | 'MERCADO_PAGO'
  | 'STRIPE';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: SubscriptionPlanType;
  status: UserSubscriptionStatus;
  startedAt: string;
  expiresAt?: string;
  paymentProvider: PaymentProvider;
  externalSubscriptionId?: string;
  // Campos padronizados para integração comercial e Firestore canônico
  plan?: SubscriptionPlanType;
  canonicalStatus?: CanonicalSubscriptionStatus;
  provider?: PaymentProvider;
  createdAt?: string;
  updatedAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELLED';
export type SubscriptionStatusType = 'ACTIVE' | 'INACTIVE';

export interface SubscriptionPlanLimits {
  documentsPerMonth: number;
  aiRequestsPerMonth: number;
  unlimitedHistory?: boolean;
  advancedFeatures?: boolean;
  [key: string]: any;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  features: string[];
  limits: SubscriptionPlanLimits;
}

export interface Subscription {
  plan: SubscriptionPlanType;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface UserUsage {
  documentsCreatedThisMonth: number;
  aiRequestsThisMonth: number;
  period?: string;
  lastResetDate?: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'normal' | 'large';
  compactMode?: boolean;
  [key: string]: any;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  professionalCategory?: ProfessionalCategory;
  createdAt?: string;
  preferences?: UserPreferences;
  // Campos de compatibilidade para código legado existente
  role?: UserRole;
  isAuthenticated?: boolean;
  subscription?: Subscription;
  // Campos SaaS B2C (Planos, Status e Uso Comercial)
  subscriptionPlan?: SubscriptionPlanType;
  subscriptionStatus?: SubscriptionStatusType;
  usage?: UserUsage;
  // Primeiro Acesso & Onboarding
  onboardingCompleted?: boolean;
  firstAccessDate?: string;
  preferredArea?: PreferredArea;
}

export type ModuleStatus = 'available' | 'soon' | 'development';

export interface AssistentialArea {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  statusLabel: string;
  iconName: string;
}

export interface NursingModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  statusLabel: string;
  iconName: string;
  role: 'nurse' | 'technician';
}
