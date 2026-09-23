import React, { useState } from 'react';
import {
  Sparkles,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Activity,
  HeartPulse,
  Baby,
  Building2,
  Bed,
  FileSpreadsheet,
  Check,
  FileCheck,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { UserRole, PreferredArea } from '../types';

interface WelcomeFlowScreenProps {
  userRole: UserRole;
  userName: string;
  onComplete: (preferredArea: PreferredArea) => void | Promise<void>;
}

export const WelcomeFlowScreen: React.FC<WelcomeFlowScreenProps> = ({
  userRole,
  userName,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedArea, setSelectedArea] = useState<PreferredArea>('PS/Emergência');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Perfil efetivo (Enfermeiro ou Técnico) respeitando estritamente o cadastro
  const isNurse = userRole === 'nurse';

  const areas: Array<{
    id: PreferredArea;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'PS/Emergência',
      label: 'PS / Emergência',
      description: 'Pronto-socorro, acolhimento e estabilização de urgência.',
      icon: <Activity className="w-5 h-5 text-rose-600" />,
    },
    {
      id: 'UTI',
      label: 'UTI',
      description: 'Terapia intensiva, monitorização hemodinâmica e suporte invasivo.',
      icon: <HeartPulse className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'Clínica Médica',
      label: 'Clínica Médica',
      description: 'Internação de pacientes clínicos e tratamento continuado.',
      icon: <Building2 className="w-5 h-5 text-teal-700" />,
    },
    {
      id: 'Clínica Cirúrgica',
      label: 'Clínica Cirúrgica',
      description: 'Pré e pós-operatório imediato e tardio de procedimentos cirúrgicos.',
      icon: <Bed className="w-5 h-5 text-amber-700" />,
    },
    {
      id: 'Pediatria',
      label: 'Pediatria',
      description: 'Cuidados assistenciais e monitorização da infância à adolescência.',
      icon: <Baby className="w-5 h-5 text-sky-600" />,
    },
  ];

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(selectedArea);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800">
      {/* Top Header com Progresso */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4">
        <Logo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="hidden sm:inline">Etapa</span>
          <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            {step} de 5
          </span>
        </div>
      </header>

      {/* Barra de Progresso visual */}
      <div className="max-w-2xl w-full mx-auto mb-6">
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-teal-700 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Card */}
      <main className="max-w-2xl w-full mx-auto my-auto py-2">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          {/* =========================================================================
              TELA 1 — APRESENTAÇÃO
             ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6" id="welcome-step-1">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-900 border border-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>Primeiro Acesso Profissional</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Bem-vindo ao EvoluiEnf
                </h1>
                <p className="text-sm sm:text-base text-teal-950 font-medium leading-relaxed">
                  "Seu apoio inteligente para documentação de enfermagem."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  O que você pode fazer no EvoluiEnf:
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Criação de anotações:</strong> registros técnicos objetivos e precisos para o turno de trabalho.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Evoluções:</strong> estruturação de raciocínio clínico nos padrões regulamentares do COFEN.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Admissões:</strong> documentação sistematizada de entrada em setores hospitalares.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Organização documental:</strong> histórico pessoal de atendimentos e biblioteca de modelos.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  id="welcome-btn-comecar"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-800 text-white text-sm font-semibold hover:bg-teal-900 shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <span>Começar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TELA 2 — PERFIL PROFISSIONAL
             ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6" id="welcome-step-2">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Conformidade Deontológica
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Você atua como:
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  O perfil foi definido no seu cadastro e respeita estritamente o escopo profissional legal.
                </p>
              </div>

              {/* Grid dos Cards de Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card Enfermeiro */}
                <div
                  id="welcome-card-nurse"
                  className={`p-5 rounded-2xl border transition-all text-left relative ${
                    isNurse
                      ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    {isNurse ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Seu cadastro
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <Lock className="w-3 h-3" /> Não atribuído
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Enfermeiro</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Acesso a evolução, admissão, SOAP e avaliação de feridas.
                  </p>
                </div>

                {/* Card Técnico em Enfermagem */}
                <div
                  id="welcome-card-tech"
                  className={`p-5 rounded-2xl border transition-all text-left relative ${
                    !isNurse
                      ? 'bg-cyan-50/70 border-cyan-300 ring-2 ring-cyan-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-700 text-white flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    {!isNurse ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Seu cadastro
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <Lock className="w-3 h-3" /> Não atribuído
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Técnico em Enfermagem</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Acesso a anotação e admissão técnica.
                  </p>
                </div>
              </div>

              {/* Aviso de Isolamento / Troca Indevida */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  O perfil respeita seu cadastro individual. Não é permitida troca indevida sem validação profissional.
                </span>
              </div>

              {/* Botões de Navegação */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  id="welcome-btn-step2-next"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-800 text-white text-xs sm:text-sm font-semibold hover:bg-teal-900 shadow-sm transition cursor-pointer"
                >
                  <span>Avançar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TELA 3 — ÁREA DE ATUAÇÃO
             ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6" id="welcome-step-3">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Personalização
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Área de atuação
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Selecione sua área predominante para priorizar atalhos. Não altera permissões legais.
                </p>
              </div>

              {/* Lista de Seleção de Áreas */}
              <div className="space-y-2.5">
                {areas.map((area) => {
                  const isSelected = selectedArea === area.id;
                  return (
                    <div
                      key={area.id}
                      id={`welcome-area-${area.id.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                      onClick={() => setSelectedArea(area.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-500/20 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                          {area.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900">{area.label}</p>
                          <p className="text-[11px] text-slate-500 truncate">{area.description}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-[11px] text-teal-900">
                <strong>Nota:</strong> Esta escolha define apenas personalização de interface e atalhos rápidos. Todos os módulos do seu perfil profissional continuam acessíveis.
              </div>

              {/* Botões de Navegação */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  id="welcome-btn-step3-next"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-800 text-white text-xs sm:text-sm font-semibold hover:bg-teal-900 shadow-sm transition cursor-pointer"
                >
                  <span>Avançar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TELA 4 — PRIVACIDADE
             ========================================================================= */}
          {step === 4 && (
            <div className="space-y-6" id="welcome-step-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Segurança e Ética</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Diretrizes de Privacidade
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  "O EvoluiEnf foi desenvolvido como ferramenta de apoio documental."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Compromissos essenciais do profissional:
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      !
                    </div>
                    <div>
                      <strong className="text-slate-900">Não substitui julgamento profissional:</strong> a redação e condutas assistenciais são de responsabilidade exclusiva do enfermeiro ou técnico.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      !
                    </div>
                    <div>
                      <strong className="text-slate-900">Não realiza diagnóstico:</strong> o assistente não gera diagnósticos médicos nem automatiza prescrições privativas.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      !
                    </div>
                    <div>
                      <strong className="text-slate-900">Não substitui protocolos institucionais:</strong> utilize sempre as rotinas e formulários vigentes na sua unidade.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      !
                    </div>
                    <div>
                      <strong className="text-slate-900">Dados clínicos sem PII:</strong> registros não devem conter dados identificadores pessoais (nome completo, CPF ou prontuário).
                    </div>
                  </li>
                </ul>
              </div>

              {/* Botões de Navegação */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  id="welcome-btn-entendi"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-800 text-white text-xs sm:text-sm font-semibold hover:bg-teal-900 shadow-sm transition cursor-pointer"
                >
                  <span>Entendi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TELA 5 — PRIMEIRO REGISTRO
             ========================================================================= */}
          {step === 5 && (
            <div className="space-y-6" id="welcome-step-5">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Pronto para Começar
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Vamos criar seu primeiro registro
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Siga estes 4 passos simples na sua rotina de plantão:
                </p>
              </div>

              {/* Passo a Passo */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Escolha o módulo</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Selecione a ferramenta de documentação compatível com seu perfil (Evolução, Anotação ou Admissão).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Preencha os dados observados</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Insira dados do exame físico, sinais vitais, dispositivos e queixas do paciente.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Revise a documentação</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Analise a síntese gerada, faça ajustes humanos e confira os itens de qualidade.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Salve seu registro pessoal</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Mantenha o registro guardado com segurança na sua biblioteca individual.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Finalização */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  id="welcome-btn-concluir"
                  disabled={isSubmitting}
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-800 text-white text-xs sm:text-sm font-semibold hover:bg-teal-900 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Salvando...' : 'Concluir e Ir para o Painel'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer simples de conformidade */}
      <footer className="max-w-2xl w-full mx-auto text-center pt-4">
        <p className="text-[11px] text-slate-600 font-medium">
          EvoluiEnf — Documentação Profissional de Enfermagem em Conformidade com o COFEN
        </p>
      </footer>
    </div>
  );
};
