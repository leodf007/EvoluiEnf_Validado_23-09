import React from 'react';
import { ArrowLeft, Clock, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AppScreen } from '../types';

interface ERPreparationScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

export const ERPreparationScreen: React.FC<ERPreparationScreenProps> = ({
  onNavigate,
}) => {
  const sections = [
    { number: 1, title: 'Contexto do registro', hint: 'Data, hora, procedência e motivo' },
    { number: 2, title: 'Avaliação geral', hint: 'Estado geral, postura e atitude' },
    { number: 3, title: 'Sinais vitais e dor', hint: 'PA, FC, FR, SpO2, Temp, Escala de dor' },
    { number: 4, title: 'Neurológico', hint: 'Nível de consciência, Glasgow, pupilas' },
    { number: 5, title: 'Respiratório', hint: 'Padrão respiratório, ausculta, oxigenoterapia' },
    { number: 6, title: 'Cardiovascular', hint: 'Ritmo, pulsos, perfusão periférica, edema' },
    { number: 7, title: 'Drogas vasoativas e infusões', hint: 'Acessos venosos, soluções e bombas' },
    { number: 8, title: 'Gastrointestinal e nutrição', hint: 'Abdome, dieta, aceitação alimentar' },
    { number: 9, title: 'Eliminações intestinais', hint: 'Frequência, aspecto e intercorrências' },
    { number: 10, title: 'Sistema urinário', hint: 'Diurese, cateterismo, características' },
    { number: 11, title: 'Dispositivos', hint: 'Drenos, sondas, cânulas e fixações' },
    { number: 12, title: 'Pele e integridade cutânea', hint: 'Turgor, lesões, risco por escalas' },
    { number: 13, title: 'Cuidados realizados', hint: 'Procedimentos e assistência de enfermagem' },
    { number: 14, title: 'Intercorrências', hint: 'Eventos agudos e condutas imediatas' },
    { number: 15, title: 'Evolução em relação à avaliação anterior', hint: 'Comparativo clínico' },
    { number: 16, title: 'Situação final', hint: 'Condição no encerramento da avaliação' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('assistential-areas')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para áreas assistenciais</span>
        </button>
      </div>

      {/* Main Preparation Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/80">
            Estrutura Assistencial
          </span>
          <span className="text-xs font-medium text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-500">Módulo Piloto</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Evolução de Enfermagem
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mt-1">
          PS / Emergência
        </h2>

        <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-teal-950">
                Formulário Clínico Estruturado Disponível
              </p>
              <p className="text-xs text-teal-800/90 mt-0.5">
                Preencha os 17 domínios clínicos sequenciais com validação técnica de enfermagem.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('clinical-evolution')}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-[0.98]"
          >
            <span>Iniciar Preenchimento</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Representation of 16 Future Sections */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Estrutura dos 16 Blocos Clínicos
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Prévia de arquitetura
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sections.map((sec) => (
            <div
              key={sec.number}
              className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 flex items-start gap-3 transition-colors hover:bg-slate-50"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-100/80 text-teal-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {sec.number}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                  {sec.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {sec.hint}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
};
