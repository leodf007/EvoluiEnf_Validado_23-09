import React from 'react';
import { ChevronDown, CheckCircle2, Clock, CircleDot } from 'lucide-react';
import { SectionStatus } from '../../types/clinical';

interface ClinicalSectionProps {
  id?: string;
  number?: number;
  index?: number;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  status?: SectionStatus;
  isFilled?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ClinicalSection: React.FC<ClinicalSectionProps> = ({
  id,
  number,
  index,
  title,
  subtitle,
  description,
  icon,
  status,
  isFilled,
  isOpen,
  onToggle,
  children,
  className = '',
}) => {
  const displayNum = number !== undefined ? number : (index !== undefined ? index + 1 : undefined);
  const actualSubtitle = subtitle || description;
  const actualStatus: SectionStatus = status || (isFilled ? 'completed' : 'not_started');
  const getStatusBadge = () => {
    switch (actualStatus) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Concluída</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Em preenchimento</span>
          </span>
        );
      case 'not_started':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200/80">
            <CircleDot className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            <span>Não iniciada</span>
          </span>
        );
    }
  };

  return (
    <div
      id={id}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'bg-white border-teal-600/40 shadow-sm ring-1 ring-teal-600/10'
          : 'bg-white/90 border-slate-200 hover:border-slate-300 shadow-2xs'
      } ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-colors hover:bg-slate-50/70"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 transition-colors ${
              actualStatus === 'completed'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isOpen
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            {displayNum}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                {title}
              </h3>
            </div>
            {actualSubtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {actualSubtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {getStatusBadge()}
          <div
            className={`p-1 rounded-lg text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-teal-800 bg-teal-50' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 pt-2 sm:pt-2 border-t border-slate-100 space-y-5 animate-in fade-in-50 duration-150">
          {children}
        </div>
      )}
    </div>
  );
};
