import React from 'react';
import { PlusCircle, History, ShieldCheck, BookOpen, FilePlus2, LayoutGrid, Sparkles, UserCircle } from 'lucide-react';
import { FeatureCard } from '../components/FeatureCard';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AppScreen } from '../types';
import { MODULE_REGISTRY } from '../engine/moduleRegistry';
import { GettingStartedCard } from '../components/GettingStartedCard';
import { HelpTooltip } from '../components/HelpTooltip';

interface NurseDashboardProps {
  userName: string;
  userId?: string;
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({
  userName,
  userId,
  onNavigate,
  onShowNotice,
}) => {
  const developmentMessage =
    'Este módulo será disponibilizado nas próximas etapas do desenvolvimento.';

  const evolutionModule = MODULE_REGISTRY.nurse_evolution;
  const admissionModule = MODULE_REGISTRY.nurse_admission;
  const woundsModule = MODULE_REGISTRY.nurse_wounds;
  const soapModule = MODULE_REGISTRY.nurse_soap;

  const scrollToModules = () => {
    const el = document.getElementById('meus-modulos-nurse');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header section com Saudação SaaS */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Olá, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Painel Profissional do Enfermeiro — EvoluiEnf
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              Perfil Enfermeiro
            </span>
          </div>
        </div>

        {/* 4 Cards Principais do Dashboard Profissional */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            id="dash-card-novo-registro"
            onClick={() => onNavigate('novo-atendimento')}
            className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 hover:bg-teal-100/70 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FilePlus2 className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-teal-950">Novo registro</p>
            <p className="text-[11px] text-teal-800/80 leading-tight mt-0.5">
              Iniciar atendimento ou evolução
            </p>
          </button>

          <button
            type="button"
            id="dash-card-meus-modulos"
            onClick={scrollToModules}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <HelpTooltip
                id="tooltip-nurse-modules"
                title="Módulos Clínicos"
                text="Ferramentas assistenciais autorizadas conforme regulamentação COFEN."
              />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">Meus módulos</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Admissão, Evolução, Feridas, SOAP
            </p>
          </button>

          <button
            type="button"
            id="dash-card-assistente-ia"
            onClick={() => onNavigate('novo-atendimento')}
            className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70 hover:bg-indigo-100/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <HelpTooltip
                id="tooltip-nurse-ai"
                title="Assistente IA"
                text="Apoio consultivo para padronização de linguagem e método SOAP."
              />
            </div>
            <p className="text-xs sm:text-sm font-bold text-indigo-950">Assistente inteligente</p>
            <p className="text-[11px] text-indigo-800/80 leading-tight mt-0.5">
              Validações e método SOAP
            </p>
          </button>

          <button
            type="button"
            id="dash-card-minha-conta"
            onClick={() => onNavigate('account')}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UserCircle className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">Minha conta</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Perfil, segurança e plano
            </p>
          </button>
        </div>
      </div>

      {/* GettingStartedCard após Onboarding */}
      <GettingStartedCard
        userRole="nurse"
        userId={userId}
        onNavigate={onNavigate}
      />

      {/* SaaS Hero / Novo Atendimento Principal Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm border border-teal-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Privacidade por Padrão (Sem PII)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Assistente Inteligente de Enfermagem
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl leading-relaxed">
              Crie notas clínicas estruturadas com validações automáticas, método SOAP, áreas assistenciais e anonimização ativa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
            <button
              type="button"
              id="dashboard-btn-novo-atendimento"
              onClick={() => onNavigate('novo-atendimento')}
              className="bg-white hover:bg-teal-50 text-teal-950 font-bold px-5 py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 text-teal-700" />
              <span>Novo Atendimento</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('model-library')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-white/15"
            >
              <BookOpen className="w-4 h-4 text-teal-200" />
              <span>Modelos</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('historico-atendimentos')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-white/15"
            >
              <History className="w-4 h-4 text-teal-200" />
              <span>Histórico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção Meus Módulos */}
      <div id="meus-modulos-nurse" className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Meus Módulos Permitidos (Enfermeiro)
          </h2>
          <span className="text-xs text-slate-400">4 ferramentas ativas</span>
        </div>

      {/* 4 Cards Grid for Nurse derived from MODULE_REGISTRY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 1: Evolução de Enfermagem */}
        <FeatureCard
          id="nurse-evolucao"
          title={evolutionModule.title}
          description={evolutionModule.description}
          status={evolutionModule.status}
          statusLabel={evolutionModule.status === 'available' ? 'Disponível' : 'Em desenvolvimento'}
          iconName="file-text"
          onClick={() => onNavigate('nurse-evolution-assistential-areas')}
        />

        {/* Card 2: Admissão de Enfermagem */}
        <FeatureCard
          id="nurse-admissao"
          title={admissionModule.title}
          description={admissionModule.description}
          status={admissionModule.status}
          statusLabel={admissionModule.status === 'available' ? 'Disponível' : 'Em desenvolvimento'}
          iconName="user-plus"
          onClick={() => onNavigate('nurse-admission-assistential-areas')}
        />

        {/* Card 3: Avaliação de Feridas */}
        <FeatureCard
          id="nurse-feridas"
          title={woundsModule.title}
          description={woundsModule.description}
          status={woundsModule.status}
          statusLabel={woundsModule.status === 'available' ? 'Disponível' : 'Em desenvolvimento'}
          iconName="heart-pulse"
          onClick={() => {
            if (woundsModule.status === 'available') {
              onNavigate('nurse-wounds-assessment');
            } else {
              onShowNotice(developmentMessage);
            }
          }}
        />

        {/* Card 4: SOAP */}
        <FeatureCard
          id="nurse-soap"
          title={soapModule.title}
          description={soapModule.description}
          status={soapModule.status}
          statusLabel={soapModule.status === 'available' ? 'Disponível' : 'Em desenvolvimento'}
          iconName="activity"
          onClick={() => {
            if (soapModule.status === 'available') {
              onNavigate('nurse-soap');
            } else {
              onShowNotice(developmentMessage);
            }
          }}
        />
      </div>
      </div>

      {/* Patient Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
};
