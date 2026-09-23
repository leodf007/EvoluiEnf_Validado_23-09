import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Sparkles,
  Shield,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { AppScreen, SubscriptionPlanType, UserSubscription, ProfessionalUser } from '../types';
import { SubscriptionBadge } from '../components/commercial/SubscriptionBadge';
import { SubscriptionService } from '../services/subscriptionService';
import { SubscriptionGuard } from '../services/subscriptionGuard';
import { UsageTracker } from '../services/usageTracker';
import { getSubscriptionPlan } from '../services/subscriptionPlans';

interface SubscriptionScreenProps {
  user: ProfessionalUser | null;
  onNavigate: (screen: AppScreen) => void;
  onShowNotice?: (msg: string) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  user,
  onNavigate,
  onShowNotice,
}) => {
  const userId = user?.id || 'user-active';
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSub() {
      try {
        setLoading(true);
        const sub = await SubscriptionService.getSubscription(userId);
        setSubscription(sub);
      } catch (err) {
        console.warn('Erro ao carregar assinatura:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSub();
  }, [userId]);

  const planType: SubscriptionPlanType = subscription?.planId || 'FREE';
  const isPro = planType === 'PRO';
  const planDetails = getSubscriptionPlan(planType);
  const isExpired = subscription ? SubscriptionGuard.isSubscriptionExpired(subscription) : false;
  const status = isExpired ? 'EXPIRED' : subscription?.status || 'ACTIVE';

  const usage = UsageTracker.getUsage(userId);

  // Formatação de datas
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const startedAtFormatted = formatDate(subscription?.startedAt);
  const expiresAtFormatted = subscription?.expiresAt
    ? formatDate(subscription.expiresAt)
    : isPro
    ? 'Renovação mensal contínua'
    : 'Sem data de expiração (Vitalício Gratuito)';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="btn-back-from-subscription"
          onClick={() => onNavigate('account')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Minha Conta</span>
        </button>

        <button
          type="button"
          id="btn-change-plan-top"
          onClick={() => onNavigate('plans')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200/70 transition-colors cursor-pointer"
        >
          <span>Alterar plano</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Minha Assinatura
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Gerencie os detalhes do seu plano individual, vigência e capacidade mensal de registros.
        </p>
      </div>

      {/* Card Principal de Resumo */}
      <div
        id="card-subscription-overview"
        className={`rounded-2xl border p-6 sm:p-7 bg-white shadow-2xs space-y-6 ${
          isPro ? 'border-teal-200' : 'border-slate-200'
        }`}
      >
        {/* Topo do resumo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Plano Atual
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {planDetails.name}
              </h2>
              <SubscriptionBadge
                plan={planType}
                status={status}
                showStatus={true}
                size="md"
              />
            </div>
            <p className="text-xs text-slate-600">{planDetails.description}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {planDetails.precoMensalTexto}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPro ? 'Cobrança mensal' : 'Acesso livre'}
            </p>
          </div>
        </div>

        {/* Metadados da Assinatura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 font-medium">Data de Início:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{startedAtFormatted}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Clock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 font-medium">
                {isPro ? 'Próxima Renovação:' : 'Vigência:'}
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{expiresAtFormatted}</p>
            </div>
          </div>
        </div>

        {/* Consumo no mês atual */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Uso no Mês Vigente
            </span>
            <span className="text-xs text-slate-500">Renovação automática no 1º dia do mês</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Documentos */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>Documentos criados:</span>
                <span className="font-bold text-slate-900">
                  {usage.documentsCreatedThisMonth} / {planDetails.limits.documentsPerMonth}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usage.documentsCreatedThisMonth >= planDetails.limits.documentsPerMonth
                      ? 'bg-amber-500'
                      : 'bg-teal-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (usage.documentsCreatedThisMonth / planDetails.limits.documentsPerMonth) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* IA */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>Consultas ao Assistente IA:</span>
                <span className="font-bold text-slate-900">
                  {usage.aiRequestsThisMonth} / {planDetails.limits.aiRequestsPerMonth}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usage.aiRequestsThisMonth >= planDetails.limits.aiRequestsPerMonth
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (usage.aiRequestsThisMonth / planDetails.limits.aiRequestsPerMonth) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Benefícios Inclusos */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Benefícios Ativos no seu Plano
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {planDetails.recursos.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            id="btn-subscription-change-plan"
            onClick={() => onNavigate('plans')}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            Alterar plano
          </button>

          {!isPro && (
            <button
              type="button"
              id="btn-subscription-upgrade-pro"
              onClick={() => onNavigate('checkout-placeholder')}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fazer upgrade para PRO</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner de Upgrade para usuários FREE */}
      {!isPro && (
        <div
          id="banner-upgrade-pro-callout"
          className="rounded-2xl p-6 bg-gradient-to-r from-teal-800 to-teal-950 text-white space-y-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-700/80 text-teal-100 border border-teal-600/50">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>EvoluiEnf PRO</span>
              </div>
              <h3 className="text-lg font-bold">Precisa de mais capacidade nos seus plantões?</h3>
              <p className="text-xs text-teal-200 max-w-xl leading-relaxed">
                Assine o plano PRO para ter capacidade expandida de documentos, maior apoio do
                Assistente IA e acesso completo ao histórico clínico sem restrições.
              </p>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              id="btn-callout-subscribe-pro"
              onClick={() => onNavigate('checkout-placeholder')}
              className="py-2.5 px-5 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              <span>Conhecer e Assinar PRO</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
