import React from 'react';
import {
  FileText,
  UserPlus,
  HeartPulse,
  Activity,
  ClipboardPen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ModuleStatus } from '../types';
import { DevelopmentBadge } from './DevelopmentBadge';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  statusLabel?: string;
  iconName: string;
  onClick: () => void;
  isPrimaryAction?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  title,
  description,
  status,
  statusLabel,
  iconName,
  onClick,
  isPrimaryAction = false,
}) => {
  const renderIcon = () => {
    const iconClass = `w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8] ${
      isPrimaryAction ? 'text-teal-700' : 'text-slate-600'
    }`;

    switch (iconName) {
      case 'file-text':
        return <FileText className={iconClass} />;
      case 'user-plus':
        return <UserPlus className={iconClass} />;
      case 'heart-pulse':
        return <HeartPulse className={iconClass} />;
      case 'activity':
        return <Activity className={iconClass} />;
      case 'clipboard-pen':
        return <ClipboardPen className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const isClickable = isPrimaryAction || status === 'available';

  return (
    <button
      id={`feature-card-${id}`}
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-5 sm:p-6 transition-all duration-150 relative border flex flex-col justify-between group ${
        isPrimaryAction
          ? 'bg-white border-teal-200/90 shadow-sm hover:shadow-md hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 active:scale-[0.99]'
          : 'bg-white/90 border-slate-200/90 shadow-xs hover:border-slate-300 hover:bg-slate-50/50 active:scale-[0.99]'
      }`}
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isPrimaryAction
                ? 'bg-teal-50 text-teal-700 border border-teal-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            {renderIcon()}
          </div>
          <DevelopmentBadge status={status} customLabel={statusLabel} />
        </div>

        <h3
          className={`text-base sm:text-lg font-semibold tracking-tight mb-1.5 ${
            isPrimaryAction ? 'text-slate-900' : 'text-slate-800'
          }`}
        >
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
        <span
          className={
            isClickable ? 'text-teal-700 font-semibold' : 'text-slate-400'
          }
        >
          {isClickable ? 'Acessar módulo' : 'Em breve'}
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-150 ${
            isClickable
              ? 'text-teal-700 group-hover:translate-x-0.5'
              : 'text-slate-300'
          }`}
        />
      </div>
    </button>
  );
};
