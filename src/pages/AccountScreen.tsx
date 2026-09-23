import React, { useState } from 'react';
import {
  User,
  Mail,
  Award,
  RefreshCw,
  Shield,
  FileText,
  LogOut,
  AlertCircle,
  ChevronRight,
  X,
  CheckCircle2,
  Play,
  Edit3,
  KeyRound,
  Check,
  Loader2,
  Zap,
  Sparkles,
  ArrowUpRight,
  CheckCheck,
  Building2,
  CreditCard,
  UserX,
  Trash2,
} from 'lucide-react';
import { UserRole, AppScreen, ProfessionalUser, SubscriptionPlanType } from '../types';
import { AtendimentoService } from '../services/atendimentoService';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AuthService } from '../services/authService';
import { AccountDeletionService } from '../services/accountDeletionService';
import { UsageStatusCard } from '../components/UsageStatusCard';
import { SubscriptionGuard } from '../services/subscriptionGuard';
import { getSubscriptionPlan, PLAN_FREE, PLAN_PRO } from '../services/subscriptionPlans';
import { SubscriptionBadge } from '../components/commercial/SubscriptionBadge';
import { runSubscriptionPlanTests, SubscriptionPlanTestSuiteResult } from '../engine/subscriptionPlanTests';
import { runOnboardingTests, OnboardingTestSuiteResult } from '../engine/onboardingTests';
import { runSubscriptionCommercialTests, SubscriptionCommercialTestSuiteResult } from '../engine/subscriptionCommercialTests';
import { runAdmissionEngineTests } from '../engine/admissionEngineTests';
import { runNurseAdmissionEngineTests } from '../engine/nurseAdmissionEngineTests';
import { runEngineUnitTests } from '../engine/engineTests';
import { runNurseEvolutionEngineTests } from '../engine/nurseEvolutionEngineTests';
import { runNurseICUEngineTests } from '../engine/nurseICUEngineTests';
import { runNurseMedicalEvolutionEngineTests } from '../engine/nurseMedicalEvolutionEngineTests';
import { runHardeningUnitTests } from '../engine/hardeningTests';
import { runTransversalAuditTests, TransversalAuditReport } from '../engine/transversalAuditTests';
import { runClinicalModuleFactoryTests } from '../engine/factoryTests';
import { runNurseSoapTests } from '../engine/nurseSoapTests';
import { runModelServiceTests } from '../services/modelServiceTests';
import { runAIAssistantTests } from '../services/aiAssistant/aiAssistantTests';
import { runUserAuthTests, UserAuthTestSuiteResult } from '../engine/userAuthTests';

interface AccountScreenProps {
  userName: string;
  userEmail: string;
  userRole: UserRole;
  professionalUser?: ProfessionalUser;
  onChangeRole: () => void;
  onLogout: () => void;
  onShowNotice: (msg: string) => void;
  onNavigate?: (screen: AppScreen) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  userName,
  userEmail,
  userRole,
  professionalUser,
  onChangeRole,
  onLogout,
  onShowNotice,
  onNavigate,
}) => {
  const atendimentosCount = AtendimentoService.listarAtendimentos(professionalUser?.id).length;
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'tests' | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [activeTestCategory, setActiveTestCategory] = useState<'all' | 'onboarding' | 'sub' | 'user' | 'plan' | 'audit' | 'factory' | 'tech' | 'nurse'>('onboarding');
  const [testResults, setTestResults] = useState<{
    general: ReturnType<typeof runEngineUnitTests> | null;
    admissionTech: ReturnType<typeof runAdmissionEngineTests> | null;
    admissionNurse: ReturnType<typeof runNurseAdmissionEngineTests> | null;
    nurseEvolution: ReturnType<typeof runNurseEvolutionEngineTests> | null;
    nurseICU: ReturnType<typeof runNurseICUEngineTests> | null;
    nurseMedical: ReturnType<typeof runNurseMedicalEvolutionEngineTests> | null;
    hardening: ReturnType<typeof runHardeningUnitTests> | null;
    audit: TransversalAuditReport | null;
    factory: ReturnType<typeof runClinicalModuleFactoryTests> | null;
    nurseSoap: ReturnType<typeof runNurseSoapTests> | null;
    models: ReturnType<typeof runModelServiceTests> | null;
    aiAssistant: ReturnType<typeof runAIAssistantTests> | null;
    userAuth: UserAuthTestSuiteResult | null;
    plans: SubscriptionPlanTestSuiteResult | null;
    onboarding: OnboardingTestSuiteResult | null;
    commercial: SubscriptionCommercialTestSuiteResult | null;
  }>({
    general: null,
    admissionTech: null,
    admissionNurse: null,
    nurseEvolution: null,
    nurseICU: null,
    nurseMedical: null,
    hardening: null,
    audit: null,
    factory: null,
    nurseSoap: null,
    models: null,
    aiAssistant: null,
    userAuth: null,
    plans: null,
    onboarding: null,
    commercial: null,
  });
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Estados SaaS Minha Conta
  const [displayName, setDisplayName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName);
  const [isSavingName, setIsSavingName] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Estados Exclusão Segura de Conta (Etapa 6 - LGPD)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteAccountError(null);

    if (deleteInput.trim().toUpperCase() !== AccountDeletionService.CONFIRMATION_WORD) {
      setDeleteAccountError(`Digite exatamente '${AccountDeletionService.CONFIRMATION_WORD}' para confirmar a exclusão.`);
      return;
    }

    setIsDeletingAccount(true);
    try {
      const result = await AccountDeletionService.deleteAccount(
        professionalUser?.id || '',
        deleteInput
      );

      if (result.success) {
        setShowDeleteModal(false);
        onShowNotice(result.message);
        onLogout();
      } else {
        setDeleteAccountError(result.message);
        if (result.requiresReauth) {
          setTimeout(() => {
            setShowDeleteModal(false);
            onLogout();
          }, 3500);
        }
      }
    } catch (err: any) {
      setDeleteAccountError(err?.message || 'Falha ao processar exclusão de conta.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSaveName = async () => {
    const clean = nameDraft.trim();
    if (!clean) {
      onShowNotice('O nome não pode ser vazio.');
      return;
    }
    setIsSavingName(true);
    try {
      if (professionalUser?.id) {
        await AuthService.atualizarNome(professionalUser.id, clean);
      }
      setDisplayName(clean);
      setIsEditingName(false);
      onShowNotice('Nome atualizado com sucesso!');
    } catch (err: any) {
      onShowNotice(err?.message || 'Falha ao atualizar nome.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve possuir ao menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await AuthService.atualizarSenha(newPassword);
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        onShowNotice('Senha alterada com sucesso!');
      }, 1500);
    } catch (err: any) {
      setPasswordError(err?.message || 'Falha ao alterar senha.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleRunAllTests = () => {
    setIsRunningTests(true);
    setTimeout(async () => {
      const gen = runEngineUnitTests();
      const tech = runAdmissionEngineTests();
      const nurse = runNurseAdmissionEngineTests();
      const evo = runNurseEvolutionEngineTests();
      const icuEvo = runNurseICUEngineTests();
      const medEvo = runNurseMedicalEvolutionEngineTests();
      const hard = runHardeningUnitTests();
      const aud = runTransversalAuditTests();
      const fact = runClinicalModuleFactoryTests();
      const soap = runNurseSoapTests();
      const mods = runModelServiceTests();
      const aiAss = runAIAssistantTests();
      const users = await runUserAuthTests();
      const plans = runSubscriptionPlanTests();
      const onb = runOnboardingTests();
      const comm = await runSubscriptionCommercialTests();
      setTestResults({
        general: gen,
        admissionTech: tech,
        admissionNurse: nurse,
        nurseEvolution: evo,
        nurseICU: icuEvo,
        nurseMedical: medEvo,
        hardening: hard,
        audit: aud,
        factory: fact,
        nurseSoap: soap,
        models: mods,
        aiAssistant: aiAss,
        userAuth: users,
        plans,
        onboarding: onb,
        commercial: comm,
      });
      setIsRunningTests(false);
    }, 100);
  };

  const roleLabel =
    userRole === 'nurse'
      ? 'Enfermeiro(a)'
      : userRole === 'technician'
      ? 'Técnico(a) em Enfermagem'
      : 'Não definido';

  const currentPlanType: SubscriptionPlanType =
    professionalUser?.plano === 'Pro' ? 'PRO' : 'FREE';
  const currentPlan = getSubscriptionPlan(currentPlanType);
  const isPro = currentPlanType === 'PRO';

  const totalAllPassed =
    (testResults.general?.passed || 0) +
    (testResults.admissionTech?.passed || 0) +
    (testResults.admissionNurse?.passed || 0) +
    (testResults.nurseEvolution?.passed || 0) +
    (testResults.nurseICU?.passed || 0) +
    (testResults.nurseMedical?.passed || 0) +
    (testResults.hardening?.passedCount || 0) +
    (testResults.audit?.passedCount || 0) +
    (testResults.factory?.passed || 0) +
    (testResults.nurseSoap?.passed || 0) +
    (testResults.models?.passed || 0) +
    (testResults.aiAssistant?.passed || 0) +
    (testResults.userAuth?.passed || 0) +
    (testResults.plans?.passed || 0) +
    (testResults.onboarding?.passed || 0) +
    (testResults.commercial?.passed || 0);

  const totalAllCount =
    (testResults.general?.total || 0) +
    (testResults.admissionTech?.total || 0) +
    (testResults.admissionNurse?.total || 0) +
    (testResults.nurseEvolution?.total || 0) +
    (testResults.nurseICU?.total || 0) +
    (testResults.nurseMedical?.total || 0) +
    (testResults.hardening?.totalCount || 0) +
    (testResults.audit?.totalCount || 0) +
    (testResults.factory?.total || 0) +
    (testResults.nurseSoap?.total || 0) +
    (testResults.models?.total || 0) +
    (testResults.aiAssistant?.total || 0) +
    (testResults.userAuth?.total || 0) +
    (testResults.plans?.total || 0) +
    (testResults.onboarding?.total || 0) +
    (testResults.commercial?.total || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Minha conta
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Informações de perfil e configurações de acesso profissional.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Dados do Profissional
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nome</span>
              </div>
              {!isEditingName && (
                <button
                  type="button"
                  id="account-btn-edit-name"
                  onClick={() => {
                    setNameDraft(displayName);
                    setIsEditingName(true);
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar nome</span>
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className="mt-2 space-y-2">
                <input
                  id="account-input-name"
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-teal-600 rounded-lg outline-none focus:ring-2 focus:ring-teal-700/20"
                  placeholder="Seu nome completo"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    id="account-btn-save-name"
                    disabled={isSavingName}
                    onClick={handleSaveName}
                    className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingName ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    <span>Salvar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm sm:text-base font-semibold text-slate-900">
                {displayName}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
              {userEmail}
            </p>
          </div>

          {/* Categoria Profissional */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>Categoria profissional</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">
              {roleLabel}
            </p>
          </div>

          {/* Plano Atual */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Plano atual</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">
                Plano {professionalUser?.plano === 'Pro' ? 'PRO' : 'FREE'}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Ativo
            </span>
          </div>

          {/* Área de Atuação Preferencial */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Área de Atuação Preferencial</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">
              {professionalUser?.preferredArea || 'Não definida'}
            </p>
          </div>
        </div>

        {/* Bloco de Alterar Senha */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-700" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Segurança da Conta</p>
                <p className="text-xs text-slate-500">Mantenha sua senha de acesso atualizada</p>
              </div>
            </div>
            <button
              type="button"
              id="account-btn-toggle-password"
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              className="text-xs font-semibold text-teal-800 hover:text-teal-950 px-3 py-1.5 rounded-lg border border-teal-200 bg-white hover:bg-teal-50/50 cursor-pointer"
            >
              {isChangingPassword ? 'Cancelar alteração' : 'Alterar senha'}
            </button>
          </div>

          {isChangingPassword && (
            <form onSubmit={handleChangePassword} className="mt-4 pt-4 border-t border-slate-200/60 space-y-3">
              {passwordError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Senha alterada com sucesso!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nova senha (mínimo 6 caracteres)
                  </label>
                  <input
                    id="account-input-new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirmar nova senha
                  </label>
                  <input
                    id="account-input-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  id="account-btn-save-password"
                  disabled={isSavingPassword}
                  className="py-2 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando nova senha...</span>
                    </>
                  ) : (
                    <span>Salvar nova senha</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Métrica de Atendimentos Anônimos */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
              {atendimentosCount}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Histórico de Atendimentos Anônimos
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {atendimentosCount} atendimentos documentados neste dispositivo
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            Privacy by Default
          </span>
        </div>

        {/* Categoria Profissional and Switch Action */}
        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
              <Award className="w-4 h-4 text-teal-700" />
              <span>Categoria Profissional Ativa</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-teal-950">
              {roleLabel}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                A alteração da categoria modifica as ferramentas disponíveis no
                EvoluiEnf.
              </span>
            </p>
          </div>

          <button
            id="account-btn-change-role"
            type="button"
            onClick={onChangeRole}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Alterar categoria profissional</span>
          </button>
        </div>
      </div>

      {/* Card: Meu Plano & Limites de Utilização (SaaS B2C Individual) */}
      <div id="account-plan-card" className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Meu plano
              </h2>
              <SubscriptionBadge plan={currentPlanType} status="ACTIVE" showStatus={true} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Plano de assinatura profissional individual com controle ético de limites e consumo mensal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="account-btn-my-subscription"
              onClick={() => onNavigate?.('subscription')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-600" />
              <span>Minha assinatura</span>
            </button>

            <button
              type="button"
              id="account-btn-change-plan"
              onClick={() => onNavigate?.('plans')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>Alterar plano</span>
            </button>
          </div>
        </div>

        {/* Status de Utilização do Mês */}
        <UsageStatusCard
          userId={professionalUser?.id}
          planType={currentPlanType}
          onUpgradeClick={() => onNavigate?.('plans')}
        />

        {/* Benefícios do Plano Atual */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Recursos inclusos no {currentPlan.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentPlan.features.map((feat, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-700 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Information & Legal Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {/* Minha Assinatura */}
        <button
          type="button"
          id="account-btn-row-subscription"
          onClick={() => onNavigate?.('subscription')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Minha assinatura</p>
              <p className="text-xs text-slate-500">
                Gerencie vigência, status atual, cotas de uso e benefícios ativos
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Alterar Plano */}
        <button
          type="button"
          id="account-btn-row-plans"
          onClick={() => onNavigate?.('plans')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Alterar plano</p>
              <p className="text-xs text-slate-500">
                Compare o Plano Gratuito e o EvoluiEnf PRO com capacidade expandida
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => setModalType('privacy')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Privacidade</p>
              <p className="text-xs text-slate-500">
                Diretrizes de privacidade e proteção de dados
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => setModalType('terms')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Termos de uso
              </p>
              <p className="text-xs text-slate-500">
                Condições de uso e responsabilidade profissional
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          id="account-btn-welcome-flow"
          onClick={() => onNavigate?.('welcome-flow')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Apresentação e Guia de Boas-Vindas
              </p>
              <p className="text-xs text-slate-500">
                Rever a experiência de boas-vindas, escopo do perfil e termos éticos
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            setModalType('tests');
            if (!testResults.general) {
              handleRunAllTests();
            }
          }}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Validação e Auditoria dos Motores Clínicos
              </p>
              <p className="text-xs text-slate-500">
                Executar suíte automatizada de testes clínicos e travas determinísticas
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout button */}
      <div className="pt-2 space-y-2">
        <button
          id="account-btn-logout"
          type="button"
          onClick={onLogout}
          className="w-full py-3.5 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50/80 text-rose-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </button>

        <button
          id="account-btn-open-delete-modal"
          type="button"
          onClick={() => {
            setShowDeleteModal(true);
            setDeleteInput('');
            setDeleteAccountError(null);
          }}
          className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Excluir minha conta e dados pessoais</span>
        </button>
      </div>

      {/* Patient Privacy Notice */}
      <PrivacyNotice />

      {/* Modal for Privacy / Terms / Tests */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {modalType === 'privacy'
                  ? 'Política de Privacidade'
                  : modalType === 'terms'
                  ? 'Termos de Uso'
                  : 'Auditoria dos Motores Clínicos (Testes Automatizados)'}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-3 overflow-y-auto pr-1 leading-relaxed flex-1">
              {modalType === 'privacy' && (
                <>
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-950 font-medium text-xs">
                    <strong>Princípio Central:</strong> O EvoluiEnf <u>NÃO é um prontuário eletrônico</u>. O aplicativo é um assistente inteligente para criação de documentação técnica de enfermagem.
                  </div>
                  <p>
                    O sistema segue rigorosamente o modelo de <strong>Privacidade por Padrão (Privacy by Default)</strong>. Não salvamos nem processamos dados pessoais identificáveis (PII) de pacientes, tais como:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs pl-2 text-slate-700">
                    <li>Nome completo do paciente</li>
                    <li>CPF ou RG</li>
                    <li>Endereço residencial e CEP</li>
                    <li>Telefone ou e-mail pessoal</li>
                    <li>Documentos e registros civis</li>
                  </ul>
                  <p>
                    Recomenda-se aos profissionais utilizarem apenas as <strong>iniciais do paciente (ex: L.L.S.)</strong> ou código do leito.
                  </p>
                  <p>
                    Antes de qualquer envio ou processamento por modelos de linguagem (IA), o serviço <strong>PrivacyGuard</strong> anonimiza ativamente qualquer dado sensível residual.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      id="account-btn-view-full-privacy"
                      onClick={() => {
                        setModalType(null);
                        onNavigate?.('privacy');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                    >
                      <span>Ler Política de Privacidade completa e detalhada</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}

              {modalType === 'terms' && (
                <>
                  <p>
                    O <strong>EvoluiEnf</strong> destina-se ao uso por profissionais
                    de enfermagem devidamente habilitados (Enfermeiros e Técnicos em
                    Enfermagem).
                  </p>
                  <p>
                    O aplicativo atua como ferramenta de auxílio e organização na
                    escrita técnica. As decisões assistenciais, validação clínica e
                    assinatura de prontuários permanecem sob a exclusiva
                    responsabilidade do profissional.
                  </p>
                  <p>
                    O acesso aos módulos segue rigorosamente as prerrogativas de
                    cada categoria profissional.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      id="account-btn-view-full-terms"
                      onClick={() => {
                        setModalType(null);
                        onNavigate?.('terms');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                    >
                      <span>Ler Termos de Uso e Acordo de Responsabilidade completos</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}

              {modalType === 'tests' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Suítes de Conformidade e Auditoria Transversal V1
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {totalAllCount > 0
                          ? `Total consolidado: ${totalAllPassed}/${totalAllCount} testes aprovados (${
                              totalAllCount === totalAllPassed ? '100% OK' : `${totalAllCount - totalAllPassed} falhas`
                            })`
                          : 'Clique em executar para rodar os testes transversais.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isRunningTests}
                      onClick={handleRunAllTests}
                      className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isRunningTests ? 'Executando...' : 'Executar Todos'}</span>
                    </button>
                  </div>

                  {/* Summary Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {/* Assinatura Comercial (SUB-001 a SUB-010) */}
                    <div
                      onClick={() => setActiveTestCategory('sub')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        activeTestCategory === 'sub'
                          ? 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block truncate">
                        Assinatura (SUB)
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {testResults.commercial ? `${testResults.commercial.passed}/${testResults.commercial.total}` : '—'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {testResults.commercial?.failed === 0 ? '✓ 10/10 OK' : testResults.commercial ? `${testResults.commercial.failed} falhas` : 'Não executado'}
                      </span>
                    </div>

                    {/* User Auth & SaaS (USER-001 a USER-010) */}
                    <div
                      onClick={() => setActiveTestCategory('user')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        activeTestCategory === 'user'
                          ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block truncate">
                        Usuário (USER)
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {testResults.userAuth ? `${testResults.userAuth.passed}/${testResults.userAuth.total}` : '—'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {testResults.userAuth?.failed === 0 ? '✓ 10/10 OK' : testResults.userAuth ? `${testResults.userAuth.failed} falhas` : 'Não executado'}
                      </span>
                    </div>

                    {/* Planos & Limites (PLAN-001 a PLAN-008) */}
                    <div
                      onClick={() => setActiveTestCategory('plan')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        activeTestCategory === 'plan'
                          ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block truncate">
                        Planos (PLAN)
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {testResults.plans ? `${testResults.plans.passed}/${testResults.plans.total}` : '—'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {testResults.plans?.failed === 0 ? '✓ 8/8 OK' : testResults.plans ? `${testResults.plans.failed} falhas` : 'Não executado'}
                      </span>
                    </div>

                    {/* Clinical Factory V1 */}
                    <div
                      onClick={() => setActiveTestCategory('factory')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        activeTestCategory === 'factory'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block truncate">
                        Factory V1
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {testResults.factory ? `${testResults.factory.passed}/${testResults.factory.total}` : '—'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {testResults.factory?.failed === 0 ? '✓ 100% OK' : testResults.factory ? `${testResults.factory.failed} falhas` : 'Não executado'}
                      </span>
                    </div>

                    {/* Transversal Audit */}
                    <div
                      onClick={() => setActiveTestCategory('audit')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        activeTestCategory === 'audit'
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block truncate">
                        Auditoria V1
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {testResults.audit ? `${testResults.audit.passedCount}/${testResults.audit.totalCount}` : '—'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {testResults.audit?.failedCount === 0 ? '✓ 100% OK' : testResults.audit ? `${testResults.audit.failedCount} falhas` : 'Não executado'}
                      </span>
                    </div>

                    {/* Nurse Evolution */}
                    <div
                      onClick={() => setActiveTestCategory('nurse')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        activeTestCategory === 'nurse'
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block truncate">
                        Enfermeiro
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {testResults.nurseEvolution ? `${testResults.nurseEvolution.passed}/${testResults.nurseEvolution.total}` : '—'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {testResults.nurseEvolution?.failed === 0 ? '✓ 100% OK' : testResults.nurseEvolution ? `${testResults.nurseEvolution.failed} falhas` : 'Não executado'}
                      </span>
                    </div>

                    {/* Hardening & Locks */}
                    <div
                      onClick={() => setActiveTestCategory('all')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        activeTestCategory === 'all'
                          ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-400/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block truncate">
                        Hardening
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {testResults.hardening ? `${testResults.hardening.passedCount}/${testResults.hardening.totalCount}` : '—'}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {testResults.hardening?.allPassed ? '✓ 100% OK' : testResults.hardening ? `${testResults.hardening.totalCount - testResults.hardening.passedCount} falhas` : 'Não executado'}
                      </span>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'sub', label: 'Assinatura Comercial (SUB-001 a 010)' },
                      { id: 'onboarding', label: 'Onboarding (ONB-001 a 010)' },
                      { id: 'plan', label: 'Planos & Limites (PLAN-001 a 008)' },
                      { id: 'user', label: 'Usuário & SaaS (USER-001 a 010)' },
                      { id: 'factory', label: 'Factory & Contratos (V1)' },
                      { id: 'audit', label: 'Auditoria Transversal V1' },
                      { id: 'nurse', label: 'Enfermeiro (Evo + Adm)' },
                      { id: 'tech', label: 'Técnico (PS + UTI + Adm)' },
                      { id: 'all', label: 'Todos os Testes' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTestCategory(tab.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                          activeTestCategory === tab.id
                            ? 'bg-teal-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Detailed Results List */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2 bg-white">
                    {activeTestCategory === 'sub' && testResults.commercial && (
                      <>
                        {testResults.commercial.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {activeTestCategory === 'onboarding' && testResults.onboarding && (
                      <>
                        {testResults.onboarding.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {activeTestCategory === 'plan' && testResults.plans && (
                      <>
                        {testResults.plans.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {activeTestCategory === 'user' && testResults.userAuth && (
                      <>
                        {testResults.userAuth.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {activeTestCategory === 'factory' && testResults.factory && (
                      <>
                        {testResults.factory.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                              {r.generatedText && (
                                <p className="text-[10px] text-slate-400 font-mono mt-1 bg-white p-1 rounded border border-slate-100 truncate">
                                  {r.generatedText}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {activeTestCategory === 'audit' && testResults.audit && (
                      <>
                        {Object.values(testResults.audit.suites).flatMap((s) => s.results).map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {activeTestCategory === 'nurse' && (
                      <>
                        {testResults.nurseEvolution?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.nurseICU?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.nurseMedical?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.admissionNurse?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.nurseSoap?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {activeTestCategory === 'tech' && (
                      <>
                        {testResults.general?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.admissionTech?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {activeTestCategory === 'all' && (
                      <>
                        {testResults.hardening?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.models?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.aiAssistant?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-indigo-50/50 border-indigo-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                        {testResults.plans?.results.map((r) => (
                          <div
                            key={r.id}
                            className="p-2 rounded-lg border text-xs flex items-start gap-2 bg-slate-50/60 border-slate-200"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.id}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 leading-snug">{r.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{r.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {!testResults.general && !testResults.audit && (
                      <p className="text-xs text-slate-400 text-center py-6">
                        Nenhum teste executado nesta sessão. Clique em "Executar Todos".
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-800 text-white text-xs sm:text-sm font-semibold hover:bg-teal-900 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conhecer PRO */}
      {showProModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-800 text-amber-300 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">EvoluiEnf PRO</h3>
                  <p className="text-xs text-slate-500">Produtividade assistencial contínua para profissionais</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">
                O plano <strong className="text-teal-900">EvoluiEnf PRO</strong> foi desenhado exclusivamente para o profissional de enfermagem individual e de plantão que busca agilidade máxima sem restrições mensais de volume.
              </p>

              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                <p className="font-bold text-teal-950 uppercase tracking-wider text-[11px]">
                  Vantagens exclusivas do Plano PRO:
                </p>
                <ul className="space-y-2 text-slate-700">
                  {PLAN_PRO.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Infraestrutura SaaS Pronta</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Os limites e monitoramento em tempo real já estão ativos na sua conta. Em breve, a contratação direta por cartão de crédito e PIX será liberada nesta tela sem intermediação hospitalar.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                id="modal-pro-btn-close"
                onClick={() => setShowProModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-800 text-white text-xs sm:text-sm font-semibold hover:bg-teal-900 cursor-pointer transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Seguro de Exclusão Definitiva de Conta (LGPD / Etapa 6) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <Trash2 className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Conta Permanentemente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeletingAccount) {
                    setShowDeleteModal(false);
                    setDeleteAccountError(null);
                  }
                }}
                disabled={isDeletingAccount}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 font-medium text-xs space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>Atenção: Esta ação é irreversível e permanente</span>
                </p>
                <p>
                  Ao prosseguir, todos os dados associados à sua conta serão definitivamente apagados:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-rose-900 pl-1 text-[11px]">
                  <li>Histórico local de atendimentos e anotações no dispositivo;</li>
                  <li>Fila de sincronização e rascunhos em andamento;</li>
                  <li>Registros vinculados na nuvem e assinatura do plano;</li>
                  <li>Cadastro de autenticação profissional.</li>
                </ul>
              </div>

              {deleteAccountError && (
                <div className="p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
                  {deleteAccountError}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Digite a palavra <span className="text-rose-700 font-bold">EXCLUIR</span> para confirmar:
                  </label>
                  <input
                    type="text"
                    id="account-input-confirm-delete"
                    required
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="EXCLUIR"
                    autoComplete="off"
                    disabled={isDeletingAccount}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 uppercase tracking-widest outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeletingAccount}
                    className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="account-btn-confirm-delete"
                    disabled={isDeletingAccount || deleteInput.trim().toUpperCase() !== 'EXCLUIR'}
                    className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Excluindo dados...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirmar Exclusão</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
