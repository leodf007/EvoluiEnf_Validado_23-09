import React from 'react';
import { Logo } from '../components/Logo';
import { ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { AppScreen } from '../types';

interface WelcomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100/60 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pt-2">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-xs sm:text-sm font-semibold text-teal-800 hover:text-teal-950 px-3 py-1.5 rounded-lg hover:bg-teal-50/80 transition-colors"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="max-w-xl w-full mx-auto my-auto py-8 sm:py-12 text-center flex flex-col items-center">
        {/* Subtle badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-semibold mb-6 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Estrutura & Agilidade Assistencial</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-3">
          Evolui<span className="text-teal-700">Enf</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl font-medium text-teal-900 mb-4 max-w-md">
          Apoio inteligente à documentação de enfermagem
        </p>

        {/* Short Phrase */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mb-8">
          Registros mais organizados, objetivos e estruturados para sua rotina
          profissional.
        </p>

        {/* Action Buttons (Mobile-first, touch-friendly, minimum 44px) */}
        <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-3">
          <button
            id="welcome-btn-enter"
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="welcome-btn-register"
            type="button"
            onClick={() => onNavigate('register')}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm sm:text-base shadow-2xs hover:shadow-xs transition-all flex items-center justify-center cursor-pointer"
          >
            Criar conta
          </button>
        </div>

        {/* Key Features Minimal Highlight */}
        <div className="mt-12 grid grid-cols-2 gap-3 w-full max-w-md text-left">
          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-teal-800 font-semibold text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Perfis Específicos</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Ferramentas sob medida para Enfermeiros e Técnicos.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-teal-800 font-semibold text-xs mb-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Foco no Plantão</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Navegação rápida e direta pensada para o smartphone.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-slate-400">
        <p>© EvoluiEnf — Plataforma de apoio à documentação de enfermagem</p>
      </footer>
    </div>
  );
};
