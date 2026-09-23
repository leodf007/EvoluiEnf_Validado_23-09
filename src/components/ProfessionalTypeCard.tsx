import React from 'react';
import { Stethoscope, ClipboardCheck, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface ProfessionalTypeCardProps {
  role: 'nurse' | 'technician';
  title: string;
  description: string;
  badgeText: string;
  selected?: boolean;
  onSelect: (role: 'nurse' | 'technician') => void;
}

export const ProfessionalTypeCard: React.FC<ProfessionalTypeCardProps> = ({
  role,
  title,
  description,
  badgeText,
  selected = false,
  onSelect,
}) => {
  const isNurse = role === 'nurse';

  return (
    <button
      id={`role-card-${role}`}
      type="button"
      onClick={() => onSelect(role)}
      className={`w-full text-left rounded-2xl p-6 sm:p-7 transition-all duration-150 relative border flex flex-col justify-between group cursor-pointer ${
        selected
          ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-600/20'
          : 'bg-white border-slate-200/90 shadow-xs hover:border-teal-300 hover:shadow-md hover:bg-slate-50/50'
      } active:scale-[0.99]`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isNurse
                ? 'bg-teal-50 text-teal-700 border border-teal-100 group-hover:bg-teal-100/70'
                : 'bg-cyan-50 text-cyan-800 border border-cyan-100 group-hover:bg-cyan-100/70'
            }`}
          >
            {isNurse ? (
              <Stethoscope className="w-7 h-7 stroke-[1.8]" />
            ) : (
              <ClipboardCheck className="w-7 h-7 stroke-[1.8]" />
            )}
          </div>

          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
            {badgeText}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-teal-700 group-hover:text-teal-800 flex items-center gap-1.5">
          Continuar como {title}
          <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
};
