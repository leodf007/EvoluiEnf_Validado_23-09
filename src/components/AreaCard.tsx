import React from 'react';
import {
  Flame,
  Activity,
  Stethoscope,
  Scissors,
  Baby,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { ModuleStatus } from '../types';
import { DevelopmentBadge } from './DevelopmentBadge';

interface AreaCardProps {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  statusLabel?: string;
  iconName: string;
  onClick: () => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({
  id,
  name,
  description,
  status,
  statusLabel,
  iconName,
  onClick,
}) => {
  const isAvailable = status === 'available';

  const renderIcon = () => {
    const iconClass = `w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8] ${
      isAvailable ? 'text-teal-700' : 'text-slate-500'
    }`;

    switch (iconName) {
      case 'emergency':
        return <Flame className={iconClass} />;
      case 'icu':
        return <Activity className={iconClass} />;
      case 'medical-clinic':
        return <Stethoscope className={iconClass} />;
      case 'surgical-clinic':
        return <Scissors className={iconClass} />;
      case 'pediatrics':
        return <Baby className={iconClass} />;
      default:
        return <Building2 className={iconClass} />;
    }
  };

  return (
    <button
      id={`area-card-${id}`}
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 sm:p-5 transition-all duration-150 relative border flex items-center justify-between gap-4 group ${
        isAvailable
          ? 'bg-white border-teal-200/90 shadow-xs hover:border-teal-400 hover:shadow-md active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-teal-700/20'
          : 'bg-white/80 border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-[0.99]'
      }`}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isAvailable
              ? 'bg-teal-50 text-teal-700 border border-teal-100'
              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
          }`}
        >
          {renderIcon()}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3
              className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
                isAvailable ? 'text-slate-900' : 'text-slate-800'
              }`}
            >
              {name}
            </h3>
            <DevelopmentBadge status={status} customLabel={statusLabel} />
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-150 ${
            isAvailable
              ? 'bg-teal-50 text-teal-700 group-hover:translate-x-0.5'
              : 'bg-slate-50 text-slate-400'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};
