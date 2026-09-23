import React from 'react';
import { Check, X, Sparkles, Shield, ArrowLeft, ArrowRight, Zap, Award } from 'lucide-react';
import { AppScreen, SubscriptionPlanType, PlanoAssinatura } from '../types';
import { PLAN_FREE, PLAN_PRO } from '../services/subscriptionPlans';
import { SubscriptionBadge } from '../components/commercial/SubscriptionBadge';

interface PlansScreenProps {
  currentPlan?: SubscriptionPlanType | PlanoAssinatura;
  onNavigate: (screen: AppScreen) => void;
  onShowNotice?: (msg: string) => void;
}

export const PlansScreen: React.FC<PlansScreenProps> = ({
  currentPlan = 'FREE',
  onNavigate,
  onShowNotice,
}) => {
  const isPro =
    currentPlan === 'PRO' ||
    currentPlan === 'Pro' ||
    currentPlan === 'Profissional' ||
    currentPlan === 'Premium';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="btn-back-from-plans"
          onClick={() => onNavigate('account')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Minha Conta</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Plano Atual:</span>
          <SubscriptionBadge plan={isPro ? 'PRO' : 'FREE'} size="sm" />
        </div>
      </div>

      {/* Cabeçalho da Página */}
      <div className="text-center space-y-2 max-w-2xl mx-auto pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
          <Award className="w-3.5 h-3.5" />
          <span>Assinatura Individual para Enfermagem</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Escolha seu plano
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Potencialize sua prática assistencial com registros ágeis, segurança jurídica ética e
          suporte ampliado do Assistente IA para seus plantões.
        </p>
      </div>

      {/* Grid com os 2 Cards: FREE e PRO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Card PLANO GRATUITO */}
        <div
          id="card-plan-free"
          className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all bg-white ${
            !isPro
              ? 'border-slate-300 ring-2 ring-slate-200 shadow-sm'
              : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="space-y-5">
            {/* Header do Card */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{PLAN_FREE.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{PLAN_FREE.description}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            {/* Preço */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {PLAN_FREE.precoMensalTexto}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Sem custos, para sempre</p>
            </div>

            {/* Recursos */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recursos Inclusos
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                {PLAN_FREE.recursos.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitações */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Limitações do Gratuito
              </p>
              <ul className="space-y-2 text-xs text-slate-500">
                {PLAN_FREE.limitacoes.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            {!isPro ? (
              <button
                type="button"
                id="btn-plan-free-current"
                disabled
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-500 border border-slate-200 cursor-default text-center"
              >
                Plano atual
              </button>
            ) : (
              <button
                type="button"
                id="btn-plan-free-select"
                onClick={() => {
                  onShowNotice?.('Seu plano atual é o PRO. Para gerenciar sua assinatura, consulte a tela Minha Assinatura.');
                  onNavigate('subscription');
                }}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Gerenciar Assinatura
              </button>
            )}
          </div>
        </div>

        {/* Card EVOLUIENF PRO */}
        <div
          id="card-plan-pro"
          className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all bg-gradient-to-b from-white to-teal-50/20 relative ${
            isPro
              ? 'border-teal-400 ring-2 ring-teal-200 shadow-md'
              : 'border-teal-300 shadow-md hover:border-teal-400'
          }`}
        >
          {/* Badge flutuante do plano */}
          <div className="absolute -top-3 right-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-700 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>{PLAN_PRO.badgeTexto || 'Recomendado'}</span>
            </span>
          </div>

          <div className="space-y-5">
            {/* Header do Card */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{PLAN_PRO.name}</span>
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">{PLAN_PRO.description}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Preço */}
            <div className="pt-2 border-t border-teal-100/70">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {PLAN_PRO.precoMensalTexto}
                </span>
              </div>
              <p className="text-xs text-teal-800 font-medium mt-0.5">
                Investimento profissional • Cancele quando quiser
              </p>
            </div>

            {/* Recursos */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Recursos Avançados
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                {PLAN_PRO.recursos.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitações */}
            <div className="space-y-2 pt-2 border-t border-teal-100/70">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Limitações
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                {PLAN_PRO.limitacoes.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="pt-6 mt-6 border-t border-teal-100/70">
            {isPro ? (
              <button
                type="button"
                id="btn-plan-pro-current"
                disabled
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-teal-100 text-teal-800 border border-teal-200 cursor-default text-center flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Plano atual</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  id="btn-plan-pro-subscribe"
                  onClick={() => onNavigate('checkout-placeholder')}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-sm transition-all cursor-pointer text-center flex items-center justify-center gap-2 group"
                >
                  <span>Assinar PRO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  id="btn-plan-pro-learn-more"
                  onClick={() => onNavigate('checkout-placeholder')}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-teal-800 hover:bg-teal-50 transition-colors text-center cursor-pointer"
                >
                  Conhecer PRO
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nota de Ética & Sigilo Profissional */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
        <p>
          O EvoluiEnf é uma ferramenta de apoio individual ao profissional de enfermagem. O plano
          comercial não modifica nem substitui as atribuições legais regulamentadas pelo COFEN.
        </p>
      </div>
    </div>
  );
};
