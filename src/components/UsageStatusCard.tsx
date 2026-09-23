import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Sparkles, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import { SubscriptionPlanType } from '../types';
import { UsageTracker } from '../services/usageTracker';
import { AuthoritativeQuotaSnapshot, QuotaService } from '../services/quotaService';
import { getSubscriptionPlan } from '../services/subscriptionPlans';

interface UsageStatusCardProps {
  userId?: string;
  planType?: SubscriptionPlanType;
  className?: string;
  compact?: boolean;
  onUpgradeClick?: () => void;
}

export const UsageStatusCard: React.FC<UsageStatusCardProps> = ({
  userId = 'active_user',
  planType = 'FREE',
  className = '',
  compact = false,
  onUpgradeClick,
}) => {
  const [authoritativeQuota, setAuthoritativeQuota] = useState<AuthoritativeQuotaSnapshot | null>(null);
  const activePlanType: SubscriptionPlanType = authoritativeQuota?.planType || (planType === 'PRO' ? 'PRO' : 'FREE');
  const [usageVersion, setUsageVersion] = useState(0);
  const summary = useMemo(() => UsageTracker.getUsageSummary(userId, activePlanType), [userId, activePlanType, usageVersion]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      QuotaService.getCurrentUsage()
        .then((snapshot) => {
          if (!active) return;
          UsageTracker.setAuthoritativeUsage(userId, QuotaService.toUserUsage(snapshot));
          setAuthoritativeQuota(snapshot);
          setUsageVersion((v) => v + 1);
        })
        .catch(() => undefined);
    };

    refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('evoluienf:usage-updated', refresh);
    }

    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('evoluienf:usage-updated', refresh);
      }
    };
  }, [userId]);
  const plan = getSubscriptionPlan(activePlanType);
  const isPro = activePlanType === 'PRO';

  const formatPeriodDisplay = (periodStr: string) => {
    try {
      const [y, m] = periodStr.split('-');
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } catch {
      return periodStr;
    }
  };

  return (
    <div
      id="usage-status-card"
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
            Consumo Mensal de Recursos
          </h4>
          <p className="text-xs text-slate-700 capitalize mt-0.5">
            Competência: {formatPeriodDisplay(summary.period)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isPro
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-teal-50 text-teal-800 border border-teal-200'
            }`}
          >
            {isPro ? 'Plano PRO' : 'Plano Gratuito'}
          </span>
        </div>
      </div>

      {/* Grid de Uso */}
      <div className={`grid ${compact ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-4'}`}>
        {/* Documentos Utilizados */}
        <div
          id="usage-documents-block"
          className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Documentos Criados</p>
                <p className="text-base font-extrabold text-slate-900 leading-tight">
                  {summary.documentsUsed}{' '}
                  <span className="text-xs font-normal text-slate-600">
                    {`de ${summary.documentsLimit} documentos`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isPro
                    ? 'bg-purple-600'
                    : summary.documentsPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-teal-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, summary.documentsPercent))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              {summary.documentMessage}
            </p>
          </div>
        </div>

        {/* Assistente IA Utilizado */}
        <div
          id="usage-ai-block"
          className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Assistente IA</p>
                <p className="text-base font-extrabold text-slate-900 leading-tight">
                  {summary.aiUsed}{' '}
                  <span className="text-xs font-normal text-slate-600">
                    {`de ${summary.aiLimit} consultas`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isPro
                    ? 'bg-purple-600'
                    : summary.aiPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, summary.aiPercent))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              {summary.aiMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé Informativo / Call to Action PRO */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <p className="text-slate-600 text-[11px]">
          ℹ️ Os limites mensais são reiniciados no primeiro dia de cada mês civil.
        </p>

        {!isPro && onUpgradeClick && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            <span>Conhecer PRO</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
