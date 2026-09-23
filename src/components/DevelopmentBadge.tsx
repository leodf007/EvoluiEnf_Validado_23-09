import React from 'react';
import { ModuleStatus } from '../types';

interface DevelopmentBadgeProps {
  status: ModuleStatus;
  customLabel?: string;
  className?: string;
}

export const DevelopmentBadge: React.FC<DevelopmentBadgeProps> = ({
  status,
  customLabel,
  className = '',
}) => {
  const configs = {
    available: {
      defaultLabel: 'Disponível',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-1 ring-emerald-500/10',
      dot: 'bg-emerald-500',
    },
    soon: {
      defaultLabel: 'Disponível em breve',
      style: 'bg-teal-50 text-teal-900 border-teal-200/80 ring-1 ring-teal-500/10',
      dot: 'bg-teal-600',
    },
    development: {
      defaultLabel: 'Em desenvolvimento',
      style: 'bg-slate-100/90 text-slate-600 border-slate-200/90 ring-1 ring-slate-400/10',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[status] || configs.development;
  const label = customLabel || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border tracking-tight whitespace-nowrap ${config.style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {label}
    </span>
  );
};
