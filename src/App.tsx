import React, { useState, useEffect } from 'react';
import { UserRole, AppScreen, NavigationTab, UserProfile, ProfessionalUser, Atendimento, PreferredArea } from './types';
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { LoginScreen } from './pages/LoginScreen';
import { RegisterScreen } from './pages/RegisterScreen';
import { RoleSelectionScreen } from './pages/RoleSelectionScreen';
import { WelcomeFlowScreen } from './pages/WelcomeFlowScreen';
import { NurseDashboard } from './pages/NurseDashboard';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { AssistentialAreaScreen } from './pages/AssistentialAreaScreen';
import { AdmissionAssistentialAreaScreen } from './pages/AdmissionAssistentialAreaScreen';
import { NurseAdmissionAssistentialAreaScreen } from './pages/NurseAdmissionAssistentialAreaScreen';
import { NurseEvolutionAssistentialAreaScreen } from './pages/NurseEvolutionAssistentialAreaScreen';
import { ERPreparationScreen } from './pages/ERPreparationScreen';
import { ClinicalFormScreen } from './pages/ClinicalFormScreen';
import { TechnicianAdmissionFormScreen } from './components/clinical/admission/TechnicianAdmissionFormScreen';
import { NurseAdmissionFormScreen } from './components/clinical/nurseAdmission/NurseAdmissionFormScreen';
import { NurseICUAdmissionFormScreen } from './components/clinical/nurseICU/NurseICUAdmissionFormScreen';
import { NurseEvolutionFormScreen } from './components/clinical/nurseEvolution/NurseEvolutionFormScreen';
import { NurseICUEvolutionFormScreen } from './components/clinical/nurseICU/NurseICUEvolutionFormScreen';
import { NurseMedicalEvolutionFormScreen } from './components/clinical/nurseMedical/NurseMedicalEvolutionFormScreen';
import { NurseSurgicalEvolutionFormScreen } from './components/clinical/nurseSurgical/NurseSurgicalEvolutionFormScreen';
import { NursePediatricEvolutionFormScreen } from './components/clinical/nursePediatric/NursePediatricEvolutionFormScreen';
import { TechnicianICUFormScreen } from './components/clinical/icu/TechnicianICUFormScreen';
import { TechnicianClinicalMedicalFormScreen } from './components/clinical/clinicalMedical/TechnicianClinicalMedicalFormScreen';
import { TechnicianSurgicalClinicFormScreen } from './components/clinical/surgicalClinic/TechnicianSurgicalClinicFormScreen';
import { TechnicianPediatricFormScreen } from './components/clinical/pediatrics/TechnicianPediatricFormScreen';
import { NurseWoundsAssessmentFormScreen } from './components/clinical/nurseWounds/NurseWoundsAssessmentFormScreen';
import { NurseSoapFormScreen } from './components/clinical/nurseSoap/NurseSoapFormScreen';
import { NovoAtendimentoScreen } from './pages/NovoAtendimentoScreen';
import { HistoricoAtendimentosScreen } from './pages/HistoricoAtendimentosScreen';
import { AccountScreen } from './pages/AccountScreen';
import { PlansScreen } from './pages/PlansScreen';
import { SubscriptionScreen } from './pages/SubscriptionScreen';
import { CheckoutPlaceholderScreen } from './pages/CheckoutPlaceholderScreen';
import { PrivacyPolicyScreen } from './pages/PrivacyPolicyScreen';
import { TermsOfUseScreen } from './pages/TermsOfUseScreen';
import { ModelLibraryScreen } from './pages/ModelLibraryScreen';
import { ModelDetailScreen } from './pages/ModelDetailScreen';
import { FavoriteModelsScreen } from './pages/FavoriteModelsScreen';
import { ModeloEnfermagem } from './types/models';
import { MODELOS_PADRAO } from './services/modelService';
import { AppHeader } from './components/AppHeader';
import { MobileNavigation } from './components/MobileNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { ProfessionalRolePolicy } from './engine/factory/professionalRolePolicy';
import { Toast } from './components/Toast';
import { ENV_CONFIG } from './config/environment';

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    if (ENV_CONFIG.isProduction) {
      return {
        name: '',
        email: '',
        role: null,
        isAuthenticated: false,
      };
    }
    return {
      name: 'Ana',
      email: 'ana.enfermagem@exemplo.com',
      role: null,
      isAuthenticated: false,
    };
  });

  const [professionalUser, setProfessionalUser] = useState<ProfessionalUser>(() => {
    if (ENV_CONFIG.isProduction) {
      return {
        id: '',
        nome: '',
        email: '',
        profissao: 'Enfermeiro',
        registroProfissional: '',
        plano: 'Free',
        dataCriacao: new Date().toISOString(),
      };
    }
    return {
      id: 'usr-prof-ana',
      nome: 'Ana',
      email: 'ana.enfermagem@exemplo.com',
      profissao: 'Enfermeiro',
      registroProfissional: 'COREN-SP 543.210',
      plano: 'Pro',
      dataCriacao: '2026-01-10T10:00:00.000Z',
    };
  });

  const [activeAtendimento, setActiveAtendimento] = useState<Atendimento | null>(null);
  const [selectedModelo, setSelectedModelo] = useState<ModeloEnfermagem | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [activeTab, setActiveTab] = useState<NavigationTab>('inicio');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isChangingRole, setIsChangingRole] = useState<boolean>(false);

  // Monitora sessão ativa do Firebase Auth
  useEffect(() => {
    const unsubscribe = AuthService.observarSessao((prof) => {
      if (prof && prof.isAuthenticated) {
        setProfessionalUser(prof);
        setUser({
          name: prof.nome,
          email: prof.email,
          role: prof.role || (prof.profissao === 'Enfermeiro' ? 'nurse' : 'technician'),
          isAuthenticated: true,
        });
        if (prof.onboardingCompleted === false) {
          setCurrentScreen('welcome-flow');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleLogin = async (email: string, password?: string) => {
    let targetProf: ProfessionalUser | null = null;
    if (password) {
      const prof = await AuthService.loginComEmailESenha(email, password);
      targetProf = prof;
      setProfessionalUser(prof);
      setUser({
        name: prof.nome,
        email: prof.email,
        role: prof.role || (prof.profissao === 'Enfermeiro' ? 'nurse' : 'technician'),
        isAuthenticated: true,
      });
    } else {
      if (ENV_CONFIG.isProduction) {
        throw new Error('A senha é obrigatória para autenticação em produção.');
      }
      const defaultRole: UserRole = user.role || 'nurse';
      setUser((prev) => ({
        ...prev,
        name: 'Ana',
        email: email || 'ana.enfermagem@exemplo.com',
        isAuthenticated: true,
        role: defaultRole,
      }));
    }

    if (targetProf && targetProf.onboardingCompleted === false) {
      setCurrentScreen('welcome-flow');
    } else {
      setActiveTab('inicio');
      setCurrentScreen('dashboard');
    }
  };

  const handleRegister = async (name: string, email: string, password?: string) => {
    if (password) {
      try {
        const prof = await AuthService.cadastrarComEmailESenha(
          email,
          password,
          name,
          'Enfermeiro'
        );
        setProfessionalUser(prof);
        setUser({
          name: prof.nome,
          email: prof.email,
          role: 'nurse',
          isAuthenticated: true,
        });
        setCurrentScreen('role-selection');
        return;
      } catch (err) {
        if (ENV_CONFIG.isProduction) {
          throw err;
        }
        console.warn('Registro remoto falhou, prosseguindo com cadastro local:', err);
      }
    } else if (ENV_CONFIG.isProduction) {
      throw new Error('A senha é obrigatória para cadastro em produção.');
    }
    setUser((prev) => ({
      ...prev,
      name: name || 'Ana',
      email: email || 'ana.enfermagem@exemplo.com',
      isAuthenticated: true,
      role: null,
    }));
    setProfessionalUser((prev) => ({
      ...prev,
      nome: name || prev.nome,
      email: email || prev.email,
      onboardingCompleted: false,
    }));
    setCurrentScreen('role-selection');
  };

  const handleSelectRole = (role: UserRole) => {
    setUser((prev) => ({
      ...prev,
      role,
    }));
    const profissao = role === 'nurse' ? 'Enfermeiro' : 'Técnico em Enfermagem';
    const registro = role === 'nurse' ? 'COREN-SP 543.210' : 'COREN-SP 987.654-TE';
    setProfessionalUser((prev) => ({
      ...prev,
      profissao,
      registroProfissional: registro,
      role,
    }));
    if (professionalUser.id) {
      AuthService.atualizarPerfilUsuario(professionalUser.id, {
        profissao,
        registroProfissional: registro,
        role,
      }).catch(() => {});
    }
    // Session isolation: reset active attendance and selected model
    setActiveAtendimento(null);
    setSelectedModelo(null);
    setIsChangingRole(false);

    if (professionalUser.onboardingCompleted === false) {
      setCurrentScreen('welcome-flow');
    } else {
      setActiveTab('inicio');
      setCurrentScreen('dashboard');
    }
  };

  const handleCompleteOnboarding = async (preferredArea: PreferredArea) => {
    if (professionalUser.id) {
      try {
        const updated = await UserService.concluirOnboarding(professionalUser.id, preferredArea);
        const prof = UserService.toProfessionalUser(updated);
        setProfessionalUser(prof);
        AuthService.salvarUsuarioLocal(prof);
      } catch (e) {
        console.warn('Falha ao persistir conclusão de onboarding:', e);
      }
    }
    setProfessionalUser((prev) => ({
      ...prev,
      onboardingCompleted: true,
      preferredArea,
      firstAccessDate: prev.firstAccessDate || new Date().toISOString(),
    }));
    setActiveTab('inicio');
    setCurrentScreen('dashboard');
    showToast('Boas-vindas concluídas! Seu painel profissional está ativo.');
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser({
      name: 'Ana',
      email: 'ana.enfermagem@exemplo.com',
      role: null,
      isAuthenticated: false,
    });
    setActiveAtendimento(null);
    setIsChangingRole(false);
    setActiveTab('inicio');
    setCurrentScreen('welcome');
  };

  const handleNavigateTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab === 'inicio') {
      setCurrentScreen('dashboard');
    } else if (tab === 'novo') {
      setCurrentScreen('novo-atendimento');
    } else if (tab === 'modelos') {
      setCurrentScreen('model-library');
    } else if (tab === 'atendimentos') {
      setCurrentScreen('historico-atendimentos');
    } else if (tab === 'registros') {
      if (user.role === 'technician') {
        setCurrentScreen('assistential-areas');
      } else {
        setCurrentScreen('dashboard');
      }
    } else if (tab === 'conta') {
      setCurrentScreen('account');
    }
  };

  const startChangingRole = () => {
    setIsChangingRole(true);
    setCurrentScreen('role-selection');
  };

  // Rendering of standalone onboarding/auth screens
  if (!user.isAuthenticated || currentScreen === 'welcome') {
    if (currentScreen === 'login') {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
          <LoginScreen
            onLogin={handleLogin}
            onNavigate={setCurrentScreen}
            onShowNotice={showToast}
          />
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        </div>
      );
    }
    if (currentScreen === 'register') {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
          <RegisterScreen
            onRegister={handleRegister}
            onNavigate={setCurrentScreen}
            onShowNotice={showToast}
          />
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <WelcomeScreen onNavigate={setCurrentScreen} />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </div>
    );
  }

  // Role Selection (onboarding or switching role)
  if (currentScreen === 'role-selection' || !user.role) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <RoleSelectionScreen
          onSelectRole={handleSelectRole}
          currentRole={user.role}
          isChangingRole={isChangingRole}
          onCancel={() => {
            setIsChangingRole(false);
            setCurrentScreen('dashboard');
          }}
        />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </div>
    );
  }

  // Welcome / Onboarding Flow (5-step professional activation)
  if (currentScreen === 'welcome-flow') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <WelcomeFlowScreen
          userRole={user.role || 'nurse'}
          userName={user.name || professionalUser.nome || 'Profissional'}
          onComplete={handleCompleteOnboarding}
        />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </div>
    );
  }

  // Render main app view with authenticated Layout
  const renderMainContent = () => {
    // Strict role isolation: block cross-profile route access
    if (user.role && !ProfessionalRolePolicy.isRouteAllowedForRole(user.role, currentScreen)) {
      return (
        <div className="max-w-xl mx-auto my-12 p-6 bg-white border border-rose-200 rounded-2xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✕
          </div>
          <h2 className="text-lg font-bold text-slate-900">Acesso Restrito ao Perfil Profissional</h2>
          <p className="text-sm text-slate-600">
            A rota selecionada ({currentScreen}) não pertence ao escopo autorizado para o seu perfil de{' '}
            <strong className="text-slate-800">{user.role === 'technician' ? 'Técnico(a) em Enfermagem' : 'Enfermeiro(a)'}</strong>.
            O isolamento entre perfis é exigido pelo COFEN e pela arquitetura de segurança do EvoluiEnf.
          </p>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="px-5 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-xl hover:bg-teal-800 transition shadow-sm"
          >
            Voltar ao Meu Painel
          </button>
        </div>
      );
    }

    if (currentScreen === 'model-library') {
      return (
        <ModelLibraryScreen
          usuarioId={professionalUser.id}
          plano={professionalUser.plano}
          onNavigate={setCurrentScreen}
          onSelectModel={(mod) => {
            setSelectedModelo(mod);
            setCurrentScreen('novo-atendimento');
          }}
          onViewModelDetails={(mod) => {
            setSelectedModelo(mod);
            setCurrentScreen('model-detail');
          }}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'model-detail') {
      return (
        <ModelDetailScreen
          modelo={selectedModelo || MODELOS_PADRAO[0]}
          usuarioId={professionalUser.id}
          plano={professionalUser.plano}
          onNavigate={setCurrentScreen}
          onSelectModel={(mod) => {
            setSelectedModelo(mod);
            setCurrentScreen('novo-atendimento');
          }}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'favorite-models') {
      return (
        <FavoriteModelsScreen
          usuarioId={professionalUser.id}
          plano={professionalUser.plano}
          onNavigate={setCurrentScreen}
          onSelectModel={(mod) => {
            setSelectedModelo(mod);
            setCurrentScreen('novo-atendimento');
          }}
          onViewModelDetails={(mod) => {
            setSelectedModelo(mod);
            setCurrentScreen('model-detail');
          }}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'novo-atendimento') {
      return (
        <NovoAtendimentoScreen
          usuarioId={professionalUser.id}
          userRole={user.role || 'nurse'}
          plano={professionalUser.plano}
          modeloInicial={selectedModelo}
          onNavigate={setCurrentScreen}
          onIniciarAtendimento={(atendimento, destination, mod) => {
            setActiveAtendimento(atendimento);
            setSelectedModelo(mod || null);
            setCurrentScreen(destination);
          }}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'historico-atendimentos') {
      return (
        <HistoricoAtendimentosScreen
          usuarioId={professionalUser.id}
          usuario={professionalUser}
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
          onSelecionarAtendimento={(atendimento) => {
            setActiveAtendimento(atendimento);
            if (atendimento.tipoRegistro === 'Evolução SOAP') {
              setCurrentScreen('nurse-soap');
            } else if (atendimento.tipoRegistro === 'Evolução de Enfermagem') {
              setCurrentScreen('nurse-evolution-assistential-areas');
            } else if (atendimento.tipoRegistro === 'Admissão de Enfermagem') {
              setCurrentScreen('nurse-admission-assistential-areas');
            } else if (atendimento.tipoRegistro === 'Avaliação de Feridas') {
              setCurrentScreen('nurse-wounds-assessment');
            } else {
              setCurrentScreen('dashboard');
            }
          }}
        />
      );
    }

    if (currentScreen === 'account') {
      return (
        <AccountScreen
          userName={user.name}
          userEmail={user.email}
          userRole={user.role}
          professionalUser={professionalUser}
          onChangeRole={startChangingRole}
          onLogout={handleLogout}
          onShowNotice={showToast}
          onNavigate={setCurrentScreen}
        />
      );
    }

    if (currentScreen === 'plans') {
      return (
        <PlansScreen
          currentPlan={professionalUser.plano}
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'subscription') {
      return (
        <SubscriptionScreen
          user={professionalUser}
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'checkout-placeholder') {
      return (
        <CheckoutPlaceholderScreen
          user={professionalUser}
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
          onSubscriptionUpdated={() => {
            setProfessionalUser((prev) => ({
              ...prev,
              plano: 'Pro',
            }));
          }}
        />
      );
    }

    if (currentScreen === 'privacy') {
      return (
        <PrivacyPolicyScreen
          onNavigate={setCurrentScreen}
        />
      );
    }

    if (currentScreen === 'terms') {
      return (
        <TermsOfUseScreen
          onNavigate={setCurrentScreen}
        />
      );
    }

    if (currentScreen === 'assistential-areas') {
      return (
        <AssistentialAreaScreen
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'admission-assistential-areas') {
      return (
        <AdmissionAssistentialAreaScreen
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'nurse-admission-assistential-areas') {
      return (
        <NurseAdmissionAssistentialAreaScreen
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'nurse-evolution-assistential-areas') {
      return (
        <NurseEvolutionAssistentialAreaScreen
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
        />
      );
    }

    if (currentScreen === 'er-preparation') {
      return <ERPreparationScreen onNavigate={setCurrentScreen} />;
    }

    if (currentScreen === 'nurse-admission-clinical') {
      return (
        <NurseAdmissionFormScreen
          onBack={() => setCurrentScreen('nurse-admission-assistential-areas')}
          patientAreaName="PS / Emergência"
        />
      );
    }

    if (currentScreen === 'nurse-admission-icu') {
      return (
        <NurseICUAdmissionFormScreen
          onBack={() => setCurrentScreen('nurse-admission-assistential-areas')}
          patientAreaName="UTI"
        />
      );
    }

    if (currentScreen === 'nurse-evolution-clinical') {
      return (
        <NurseEvolutionFormScreen
          onBack={() => setCurrentScreen('nurse-evolution-assistential-areas')}
          patientAreaName="PS / Emergência"
        />
      );
    }

    if (currentScreen === 'nurse-evolution-icu') {
      return (
        <NurseICUEvolutionFormScreen
          onBack={() => setCurrentScreen('nurse-evolution-assistential-areas')}
          patientAreaName="UTI"
        />
      );
    }

    if (currentScreen === 'nurse-evolution-medical-clinic') {
      return (
        <NurseMedicalEvolutionFormScreen
          onBack={() => setCurrentScreen('nurse-evolution-assistential-areas')}
          patientAreaName="Clínica Médica"
        />
      );
    }

    if (currentScreen === 'nurse-evolution-surgical-clinic') {
      return (
        <NurseSurgicalEvolutionFormScreen
          onBack={() => setCurrentScreen('nurse-evolution-assistential-areas')}
          patientAreaName="Clínica Cirúrgica"
        />
      );
    }

    if (currentScreen === 'nurse-evolution-pediatrics') {
      return (
        <NursePediatricEvolutionFormScreen
          onBack={() => setCurrentScreen('nurse-evolution-assistential-areas')}
          patientAreaName="Pediatria"
        />
      );
    }

    if (currentScreen === 'admission-clinical-evolution') {
      return (
        <TechnicianAdmissionFormScreen
          onBack={() => setCurrentScreen('admission-assistential-areas')}
          patientAreaName="PS / Emergência"
        />
      );
    }

    if (currentScreen === 'clinical-evolution') {
      return (
        <ClinicalFormScreen
          onBack={() => setCurrentScreen('assistential-areas')}
          patientAreaName={activeAtendimento?.setor || 'PS / Emergência'}
          atendimento={activeAtendimento || undefined}
          usuario={professionalUser}
          onNavigateHistorico={() => setCurrentScreen('historico-atendimentos')}
        />
      );
    }

    if (currentScreen === 'icu-clinical-evolution') {
      return (
        <TechnicianICUFormScreen
          onBack={() => setCurrentScreen('assistential-areas')}
          patientAreaName="UTI"
        />
      );
    }

    if (currentScreen === 'medical-clinic-evolution') {
      return (
        <TechnicianClinicalMedicalFormScreen
          onBack={() => setCurrentScreen('assistential-areas')}
          patientAreaName="Clínica Médica"
        />
      );
    }

    if (currentScreen === 'surgical-clinic-evolution') {
      return (
        <TechnicianSurgicalClinicFormScreen
          onBack={() => setCurrentScreen('assistential-areas')}
          patientAreaName="Clínica Cirúrgica"
        />
      );
    }

    if (currentScreen === 'pediatric-clinic-evolution') {
      return (
        <TechnicianPediatricFormScreen
          onBack={() => setCurrentScreen('assistential-areas')}
          patientAreaName="Pediatria"
        />
      );
    }

    if (currentScreen === 'nurse-wounds-assessment') {
      return (
        <NurseWoundsAssessmentFormScreen
          onBack={() => setCurrentScreen('dashboard')}
          patientAreaName="Geral"
        />
      );
    }

    if (currentScreen === 'nurse-soap') {
      return (
        <NurseSoapFormScreen
          onBack={() => setCurrentScreen('dashboard')}
          patientAreaName={activeAtendimento?.setor || 'Ambulatório / Consulta'}
          atendimento={activeAtendimento || undefined}
        />
      );
    }

    // Default Dashboard based on role
    if (user.role === 'nurse') {
      return (
        <NurseDashboard
          userName={user.name}
          userId={professionalUser.id}
          onNavigate={setCurrentScreen}
          onShowNotice={showToast}
        />
      );
    }

    return (
      <TechnicianDashboard
        userName={user.name}
        userId={professionalUser.id}
        onNavigate={setCurrentScreen}
        onShowNotice={showToast}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Application Header */}
      <AppHeader
        userRole={user.role}
        userName={user.name}
        currentScreen={currentScreen}
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        onNavigateScreen={setCurrentScreen}
        onSwitchRole={startChangingRole}
        isAuthenticated={user.isAuthenticated}
      />

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Navigation Sidebar */}
        <DesktopSidebar
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          userRole={user.role}
          userName={user.name}
          onLogout={handleLogout}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0 max-w-full overflow-x-hidden">
          {renderMainContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
      />

      {/* Global Toast for discreet notifications */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
