import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { SectionStatus, ValidationAlert } from '../../types/clinical';

interface ClinicalProgressBarProps {
  sections: { index: number; title: string; status: SectionStatus }[];
  alerts: ValidationAlert[];
  onOpenSection: (index: number) => void;
  onOpenSummary: () => void;
}

export const ClinicalProgressBar: React.FC<ClinicalProgressBarProps> = ({
  sections,
  alerts,
  onOpenSection,
  onOpenSummary,
}) => {
  const total = sections.length;
  const completedCount = sections.filter((s) => s.status === 'completed').length;
  const inProgressCount = sections.filter((s) => s.status === 'in_progress').length;
  const percent = Math.round(((completedCount + inProgressCount * 0.4) / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs">
            {completedCount}/{total}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Progresso do Preenchimento Clínico
            </div>
            <div className="text-[11px] text-slate-500">
              {completedCount} concluídas • {inProgressCount} em andamento
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{alerts.length} alerta{alerts.length > 1 ? 's' : ''}</span>
            </span>
          )}

          <button
            type="button"
            onClick={onOpenSummary}
            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver</span> Resumo
          </button>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-teal-700 transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>

      {/* Mini dots for fast jump */}
      <div className="flex items-center justify-between gap-1 pt-1 overflow-x-auto no-scrollbar">
        {sections.map((sec) => (
          <button
            key={sec.index}
            type="button"
            title={`${sec.index + 1}. ${sec.title}`}
            onClick={() => onOpenSection(sec.index)}
            className={`h-2 flex-1 min-w-[10px] rounded-full transition-all cursor-pointer ${
              sec.status === 'completed'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : sec.status === 'in_progress'
                ? 'bg-amber-400 hover:bg-amber-500'
                : 'bg-slate-200 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
