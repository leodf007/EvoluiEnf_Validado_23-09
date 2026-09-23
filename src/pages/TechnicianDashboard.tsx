import React from 'react';
import { FilePlus2, LayoutGrid, Sparkles, UserCircle } from 'lucide-react';
import { FeatureCard } from '../components/FeatureCard';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AppScreen } from '../types';
import { MODULE_REGISTRY } from '../engine/moduleRegistry';
import { GettingStartedCard } from '../components/GettingStartedCard';
import { HelpTooltip } from '../components/HelpTooltip';

interface TechnicianDashboardProps {
  userName: string;
  userId?: string;
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  userName,
  userId,
  onNavigate,
}) => {
  const noteModule = MODULE_REGISTRY.technician_nursing_note;
  const admissionModule = MODULE_REGISTRY.technician_admission;

  const scrollToModules = () => {
    const el = document.getElementById('meus-modulos-tech');
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
              Painel Profissional do Técnico em Enfermagem — EvoluiEnf
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
              Perfil Técnico em Enfermagem
            </span>
          </div>
        </div>

        {/* 4 Cards Principais do Dashboard Profissional */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            id="dash-tech-novo-registro"
            onClick={() => onNavigate('assistential-areas')}
            className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200/80 hover:bg-cyan-100/70 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FilePlus2 className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-cyan-950">Novo registro</p>
            <p className="text-[11px] text-cyan-800/80 leading-tight mt-0.5">
              Anotação de Enfermagem
            </p>
          </button>

          <button
            type="button"
            id="dash-tech-meus-modulos"
            onClick={scrollToModules}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <HelpTooltip
                id="tooltip-tech-modules"
                title="Módulos Clínicos"
                text="Ferramentas assistenciais autorizadas conforme COFEN para Técnicos de Enfermagem."
              />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">Meus módulos</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Anotação e Admissão Técnica
            </p>
          </button>

          <button
            type="button"
            id="dash-tech-assistente-ia"
            onClick={() => onNavigate('assistential-areas')}
            className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70 hover:bg-indigo-100/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <HelpTooltip
                id="tooltip-tech-ai"
                title="Assistente IA"
                text="Apoio consultivo para padronização de vocabulário e checagens técnicas."
              />
            </div>
            <p className="text-xs sm:text-sm font-bold text-indigo-950">Assistente inteligente</p>
            <p className="text-[11px] text-indigo-800/80 leading-tight mt-0.5">
              Validações e padronização
            </p>
          </button>

          <button
            type="button"
            id="dash-tech-minha-conta"
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
        userRole="technician"
        userId={userId}
        onNavigate={onNavigate}
      />

      {/* Seção Meus Módulos Permitidos */}
      <div id="meus-modulos-tech" className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Meus Módulos Permitidos (Técnico em Enfermagem)
          </h2>
          <span className="text-xs text-slate-400">2 ferramentas ativas</span>
        </div>

        {/* 2 Modules for Technician */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Module 1: Anotação de Enfermagem (Available) */}
          <FeatureCard
            id="technician-anotacao"
            title={noteModule.title}
            description={noteModule.description}
            status={noteModule.status}
            statusLabel={noteModule.status === 'available' ? 'Disponível' : 'Em desenvolvimento'}
            iconName="clipboard-pen"
            isPrimaryAction={true}
            onClick={() => onNavigate('assistential-areas')}
          />

          {/* Module 2: Admissão — Anotação de Enfermagem (Available) */}
          <FeatureCard
            id="technician-admissao-anotacao"
            title={admissionModule.title}
            description={admissionModule.description}
            status={admissionModule.status}
            statusLabel={admissionModule.status === 'available' ? 'Disponível' : 'Em desenvolvimento'}
            iconName="user-plus"
            onClick={() => onNavigate('admission-assistential-areas')}
          />
        </div>
      </div>

      {/* Patient Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
};
