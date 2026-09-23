import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Check,
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { AppScreen, ProfessionalUser } from '../types';
import { PLAN_PRO } from '../services/subscriptionPlans';
import { SubscriptionService } from '../services/subscriptionService';
import { SubscriptionBadge } from '../components/commercial/SubscriptionBadge';
import { ENV_CONFIG } from '../config/environment';

interface CheckoutPlaceholderScreenProps {
  user: ProfessionalUser | null;
  onNavigate: (screen: AppScreen) => void;
  onShowNotice?: (msg: string) => void;
  onSubscriptionUpdated?: () => void;
}

export const CheckoutPlaceholderScreen: React.FC<CheckoutPlaceholderScreenProps> = ({
  user,
  onNavigate,
  onShowNotice,
  onSubscriptionUpdated,
}) => {
  const userId = user?.id || 'user-active';
  const [activating, setActivating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSimulateActivation = async () => {
    if (ENV_CONFIG.isProduction) {
      onShowNotice?.('Ativações de demonstração estão desabilitadas em produção.');
      return;
    }
    try {
      setActivating(true);
      await SubscriptionService.upgradeToPro(userId, 'NONE', 'simulated_test_pro');
      setSuccess(true);
      onShowNotice?.('Plano PRO ativado com sucesso em modo de demonstração!');
      onSubscriptionUpdated?.();
    } catch (err: any) {
      onShowNotice?.('Erro ao simular ativação: ' + (err?.message || err));
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Voltar */}
      <button
        type="button"
        id="btn-back-from-checkout"
        onClick={() => onNavigate('plans')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para Escolha de Planos</span>
      </button>

      {/* Card Principal de Checkout Placeholder */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Banner de Aviso de Integração Comercial */}
        <div
          id="checkout-integration-notice"
          className="rounded-xl p-4.5 bg-blue-50/90 border border-blue-200 text-blue-950 space-y-2"
        >
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
            <Info className="w-5 h-5 text-blue-700 shrink-0" />
            <span>Pagamento será integrado nesta etapa.</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed pl-7">
            Esta tela representa a infraestrutura interna do checkout comercial SaaS do EvoluiEnf.
            Nenhum dado bancário é solicitado, nenhum gateway externo (como Stripe ou Mercado Pago) é
            acionado e nenhuma cobrança real é realizada neste momento.
          </p>
        </div>

        {/* Resumo do Pedido / Plano */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{PLAN_PRO.name}</h1>
                <SubscriptionBadge plan="PRO" size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Assinatura Mensal Individual</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">{PLAN_PRO.precoMensalTexto}</span>
              <p className="text-[11px] text-slate-500">Renovação mensal estimada</p>
            </div>
          </div>

          {/* O que está incluso */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              O que você recebe no PRO:
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              {PLAN_PRO.recursos.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Simulação ou Status */}
        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Assinatura PRO ativada em modo de demonstração!</span>
            </div>
            <p className="text-xs text-emerald-800">
              Sua conta agora possui o status PRO ativo no EvoluiEnf. Você pode usufruir de cotas
              ampliadas e do assistente IA irrestrito.
            </p>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                id="btn-go-to-subscription"
                onClick={() => onNavigate('subscription')}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer"
              >
                Ver Minha Assinatura
              </button>
              <button
                type="button"
                id="btn-go-to-dashboard"
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 rounded-lg bg-white text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-50 cursor-pointer"
              >
                Ir ao Painel Principal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {ENV_CONFIG.isProduction ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Ambiente de Produção Ativo</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  O gateway oficial de pagamentos está em fase final de homologação. Ativações simuladas de demonstração estão desabilitadas neste ambiente para garantir a integridade dos registros contábeis.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Ambiente de homologação comercial seguro. Para fins de testes e validação da
                    experiência, você pode ativar o plano PRO em modo de demonstração abaixo:
                  </span>
                </div>

                <button
                  type="button"
                  id="btn-simulate-pro-activation"
                  disabled={activating}
                  onClick={handleSimulateActivation}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {activating ? 'Configurando assinatura...' : 'Ativar PRO em Modo de Demonstração'}
                  </span>
                </button>
              </>
            )}

            <button
              type="button"
              id="btn-cancel-checkout"
              onClick={() => onNavigate('plans')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 text-center cursor-pointer"
            >
              Cancelar e Voltar
            </button>
          </div>
        )}

        {/* Garantias & Conformidade */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-1">
          <p className="text-[11px] text-slate-400">
            Segurança em conformidade com a LGPD e sigilo deontológico da Enfermagem.
          </p>
        </div>
      </div>
    </div>
  );
};
