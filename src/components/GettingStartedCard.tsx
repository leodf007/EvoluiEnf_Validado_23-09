import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FilePlus2,
  FolderClock,
  CreditCard,
  X,
  CheckCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { AppScreen, UserRole } from '../types';
import { HelpTooltip } from './HelpTooltip';

interface GettingStartedCardProps {
  userRole: UserRole;
  userId?: string;
  onNavigate: (screen: AppScreen) => void;
  className?: string;
}

export const GettingStartedCard: React.FC<GettingStartedCardProps> = ({
  userRole,
  userId = 'default',
  onNavigate,
  className = '',
}) => {
  const storageKey = `evoluienf_hide_getting_started_${userId}`;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(storageKey) === 'true';
      setHidden(isDismissed);
    } catch {
      // no-op
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // no-op
    }
  };

  const handleUnhide = () => {
    setHidden(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // no-op
    }
  };

  if (hidden) {
    return (
      <div className="flex justify-end my-1">
        <button
          type="button"
          id="btn-reopen-getting-started"
          onClick={handleUnhide}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-teal-800 transition-colors p-1 rounded cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver guia de início rápido</span>
        </button>
      </div>
    );
  }

  const isNurse = userRole === 'nurse';

  return (
    <div
      id="getting-started-card"
      className={`bg-white rounded-2xl border border-teal-200/80 shadow-xs p-5 sm:p-6 relative overflow-hidden ${className}`}
    >
      {/* Decoração sutil de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Guia de Início
            </span>
            <HelpTooltip
              id="tooltip-getting-started"
              title="Início Rápido"
              text="Atalhos recomendados para acelerar sua documentação e navegação no EvoluiEnf."
            />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Comece a documentar com o EvoluiEnf
          </h3>
          <p className="text-xs text-slate-500">
            Siga os atalhos abaixo para explorar seus recursos de documentação individual.
          </p>
        </div>

        <button
          type="button"
          id="btn-dismiss-getting-started"
          onClick={handleDismiss}
          title="Ocultar guia"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid de 4 Itens: Primeiro registro, Assistente IA, Meus registros, Meu plano */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Item 1: Primeiro Registro */}
        <button
          type="button"
          id="getting-started-item-registro"
          onClick={() => onNavigate(isNurse ? 'novo-atendimento' : 'assistential-areas')}
          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/60 hover:border-teal-200 transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <FilePlus2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 transition-colors" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-teal-900">Primeiro registro</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {isNurse ? 'Evolução ou SOAP com anonimização' : 'Anotação técnica do turno'}
            </p>
          </div>
        </button>

        {/* Item 2: Assistente IA */}
        <button
          type="button"
          id="getting-started-item-ia"
          onClick={() => onNavigate('novo-atendimento')}
          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-700 transition-colors" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">Assistente IA</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Padronização de termos e método SOAP
            </p>
          </div>
        </button>

        {/* Item 3: Meus Registros */}
        <button
          type="button"
          id="getting-started-item-historico"
          onClick={() => onNavigate('historico-atendimentos')}
          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderClock className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-slate-900">Meus registros</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Histórico pessoal de atendimentos
            </p>
          </div>
        </button>

        {/* Item 4: Meu Plano */}
        <button
          type="button"
          id="getting-started-item-plano"
          onClick={() => onNavigate('account')}
          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/60 hover:border-teal-200 transition-all text-left flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-800 transition-colors" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-teal-900">Meu plano</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Limites mensais e perfil profissional
            </p>
          </div>
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
          Perfil individual e seguro
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline underline-offset-2"
        >
          Ocultar este guia
        </button>
      </div>
    </div>
  );
};
