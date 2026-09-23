import React from 'react';
import { AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { SubscriptionPlanType, UserUsage, AppScreen } from '../../types';
import { UsageTracker } from '../../services/usageTracker';
import { getSubscriptionPlan } from '../../services/subscriptionPlans';

interface UsageWarningProps {
  userId?: string;
  planType?: SubscriptionPlanType;
  customUsage?: UserUsage;
  onNavigate?: (screen: AppScreen) => void;
  className?: string;
}

export const UsageWarning: React.FC<UsageWarningProps> = ({
  userId = 'active_user',
  planType = 'FREE',
  customUsage,
  onNavigate,
  className = '',
}) => {
  const activePlanType: SubscriptionPlanType = planType === 'PRO' ? 'PRO' : 'FREE';
  // As cotas são definidas centralmente por plano; o aviso se adapta aos limites vigentes
  const usage = customUsage || UsageTracker.getUsage(userId);
  const plan = getSubscriptionPlan(activePlanType);

  const docLimit = plan.limits.documentsPerMonth;
  const docCurrent = usage.documentsCreatedThisMonth;
  const docRatio = docLimit > 0 ? docCurrent / docLimit : 0;

  const aiLimit = plan.limits.aiRequestsPerMonth;
  const aiCurrent = usage.aiRequestsThisMonth;
  const aiRatio = aiLimit > 0 ? aiCurrent / aiLimit : 0;

  // Dispara o alerta se atingiu 75% ou mais de qualquer uma das cotas mensais
  const isDocNear = docRatio >= 0.75;
  const isAiNear = aiRatio >= 0.75;

  if (!isDocNear && !isAiNear) {
    return null;
  }

  const isDocReached = docCurrent >= docLimit;
  const isAiReached = aiCurrent >= aiLimit;
  const hasReachedAny = isDocReached || isAiReached;

  return (
    <div
      id="usage-warning-banner"
      className={`rounded-xl p-3.5 sm:p-4 border transition-all ${
        hasReachedAny
          ? 'bg-amber-50/90 border-amber-300 text-amber-900'
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              hasReachedAny ? 'bg-amber-200/80 text-amber-800' : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold leading-snug">
              {hasReachedAny
                ? 'Limite mensal atingido no seu plano'
                : 'Você está próximo do limite mensal'}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {isDocNear && (
                <span>
                  Documentos clínicos: <strong>{docCurrent}</strong> de {docLimit} utilizados.
                </span>
              )}{' '}
              {isAiNear && (
                <span>
                  Consultas ao Assistente IA: <strong>{aiCurrent}</strong> de {aiLimit} utilizadas.
                </span>
              )}
            </p>

            {/* Barra de progresso visual */}
            <div className="w-full max-w-xs bg-slate-200/80 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  hasReachedAny ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(docRatio, aiRatio) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {activePlanType === 'FREE' && onNavigate && (
          <button
            type="button"
            id="btn-upgrade-from-warning"
            onClick={() => onNavigate('plans')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conhecer Plano PRO</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
