import React from 'react';
import { Sparkles, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { SubscriptionPlanType, UserSubscriptionStatus, PlanoAssinatura } from '../../types';

interface SubscriptionBadgeProps {
  plan?: SubscriptionPlanType | PlanoAssinatura | string | null;
  status?: UserSubscriptionStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showIcon?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  plan = 'FREE',
  status = 'ACTIVE',
  size = 'md',
  showStatus = false,
  showIcon = true,
  onClick,
  className = '',
}) => {
  const isPro =
    plan === 'PRO' ||
    plan === 'Pro' ||
    plan === 'Profissional' ||
    plan === 'Premium';

  const isExpired = status === 'EXPIRED';

  // Tamanhos
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-bold',
  };

  // Cores por tipo
  let styleClasses = '';
  if (isExpired) {
    styleClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (isPro) {
    styleClasses = 'bg-teal-50/90 text-teal-800 border-teal-300 shadow-2xs';
  } else {
    styleClasses = 'bg-slate-100 text-slate-700 border-slate-200/80';
  }

  const clickableClasses = onClick
    ? 'cursor-pointer hover:opacity-85 transition-opacity'
    : '';

  return (
    <span
      onClick={onClick}
      id={`badge-plan-${isPro ? 'pro' : 'free'}`}
      className={`inline-flex items-center rounded-full border tracking-tight ${sizeClasses[size]} ${styleClasses} ${clickableClasses} ${className}`}
    >
      {showIcon && (
        <>
          {isExpired ? (
            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
          ) : isPro ? (
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          ) : (
            <Shield className="w-3 h-3 text-slate-500 shrink-0" />
          )}
        </>
      )}

      <span>{isPro ? 'EvoluiEnf PRO' : 'Plano Gratuito'}</span>

      {showStatus && status && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
            status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'TRIAL'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {status === 'ACTIVE'
            ? 'Ativo'
            : status === 'TRIAL'
            ? 'Degustação'
            : status === 'EXPIRED'
            ? 'Expirado'
            : status}
        </span>
      )}
    </span>
  );
};
