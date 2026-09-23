/**
 * EvoluiEnf - Payment Provider Abstraction
 * 
 * Camada de desacoplamento arquitetural para integração com gateways de pagamento
 * reais (Mercado Pago, Stripe, etc.) sem acoplamento a um fornecedor específico.
 * 
 * Em conformidade com a ETAPA 6:
 * - Não expõe chaves ou credenciais no cliente
 * - Não simula pagamentos em produção
 * - Define contratos claros para Checkout, Consulta, Cancelamento e Webhooks
 * - Marca status como "GATEWAY EXTERNO PENDENTE" quando não configurado
 */

import { PaymentProvider, SubscriptionPlanType } from '../../types';

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  userName?: string;
  planId: SubscriptionPlanType;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  gatewayStatus: 'CONFIGURADO' | 'GATEWAY_EXTERNO_PENDENTE' | 'ERRO';
  checkoutUrl?: string;
  sessionId?: string;
  provider: PaymentProvider;
  message: string;
}

export interface SubscriptionStatusResult {
  providerSubscriptionId: string;
  status: 'active' | 'pending' | 'past_due' | 'cancelled' | 'expired';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message: string;
  cancelledAt?: string;
}

export interface WebhookProcessResult {
  handled: boolean;
  eventId?: string;
  eventType?: string;
  userId?: string;
  newStatus?: string;
  message: string;
}

export interface PaymentProviderService {
  readonly providerName: PaymentProvider;
  isConfigured(): boolean;
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult>;
  getSubscriptionStatus(providerSubscriptionId: string): Promise<SubscriptionStatusResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<CancelSubscriptionResult>;
  processWebhook(rawBody: any, signatureHeader?: string): Promise<WebhookProcessResult>;
}

/**
 * Provedor de pagamento padrão quando nenhum gateway externo foi configurado.
 * Notifica com elegância a pendência de contratação externa sem quebrar o sistema.
 */
export class PendingExternalPaymentProvider implements PaymentProviderService {
  readonly providerName: PaymentProvider = 'NONE';

  isConfigured(): boolean {
    return false;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    return {
      success: false,
      gatewayStatus: 'GATEWAY_EXTERNO_PENDENTE',
      provider: this.providerName,
      message:
        'GATEWAY EXTERNO PENDENTE: A contratação comercial direta via gateway de pagamento (ex: Mercado Pago ou Stripe) está em fase de homologação técnica. Em breve novos métodos de pagamento serão disponibilizados.',
    };
  }

  async getSubscriptionStatus(providerSubscriptionId: string): Promise<SubscriptionStatusResult> {
    return {
      providerSubscriptionId,
      status: 'pending',
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<CancelSubscriptionResult> {
    return {
      success: false,
      message: 'Operação indisponível: Nenhum gateway comercial ativo vinculado.',
    };
  }

  async processWebhook(rawBody: any, _signatureHeader?: string): Promise<WebhookProcessResult> {
    return {
      handled: false,
      message: 'Gateway externo não configurado para recepção de webhooks.',
    };
  }
}

/**
 * Mercado Pago Provider (Estrutura arquitetural preparada para implantação)
 */
export class MercadoPagoPaymentProvider implements PaymentProviderService {
  readonly providerName: PaymentProvider = 'MERCADO_PAGO';
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
  }

  isConfigured(): boolean {
    return Boolean(this.accessToken && !this.accessToken.includes('PLACEHOLDER'));
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        gatewayStatus: 'GATEWAY_EXTERNO_PENDENTE',
        provider: this.providerName,
        message: 'GATEWAY EXTERNO PENDENTE: Credenciais do Mercado Pago não configuradas no ambiente de produção.',
      };
    }

    // Estrutura pronta para chamada ao endpoint /v1/preferences ou /preapproval do Mercado Pago
    return {
      success: false,
      gatewayStatus: 'GATEWAY_EXTERNO_PENDENTE',
      provider: this.providerName,
      message: 'GATEWAY EXTERNO PENDENTE: Aguardando provisionamento de chaves oficiais do Mercado Pago.',
    };
  }

  async getSubscriptionStatus(providerSubscriptionId: string): Promise<SubscriptionStatusResult> {
    return {
      providerSubscriptionId,
      status: 'pending',
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<CancelSubscriptionResult> {
    return {
      success: false,
      message: 'Cancelamento Mercado Pago pendente de chaves oficiais.',
    };
  }

  async processWebhook(rawBody: any, signatureHeader?: string): Promise<WebhookProcessResult> {
    if (!this.isConfigured()) {
      return {
        handled: false,
        message: 'Mercado Pago webhook ignorado: Gateway não configurado.',
      };
    }
    return {
      handled: true,
      message: 'Webhook recebido para processamento.',
    };
  }
}

/**
 * Stripe Provider (Estrutura arquitetural preparada para implantação)
 */
export class StripePaymentProvider implements PaymentProviderService {
  readonly providerName: PaymentProvider = 'STRIPE';
  private secretKey?: string;

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.STRIPE_SECRET_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.secretKey && !this.secretKey.includes('PLACEHOLDER'));
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        gatewayStatus: 'GATEWAY_EXTERNO_PENDENTE',
        provider: this.providerName,
        message: 'GATEWAY EXTERNO PENDENTE: Credenciais da Stripe não configuradas no ambiente de produção.',
      };
    }

    return {
      success: false,
      gatewayStatus: 'GATEWAY_EXTERNO_PENDENTE',
      provider: this.providerName,
      message: 'GATEWAY EXTERNO PENDENTE: Aguardando provisionamento de chaves oficiais da Stripe.',
    };
  }

  async getSubscriptionStatus(providerSubscriptionId: string): Promise<SubscriptionStatusResult> {
    return {
      providerSubscriptionId,
      status: 'pending',
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<CancelSubscriptionResult> {
    return {
      success: false,
      message: 'Cancelamento Stripe pendente de chaves oficiais.',
    };
  }

  async processWebhook(rawBody: any, signatureHeader?: string): Promise<WebhookProcessResult> {
    if (!this.isConfigured()) {
      return {
        handled: false,
        message: 'Stripe webhook ignorado: Gateway não configurado.',
      };
    }
    return {
      handled: true,
      message: 'Webhook recebido para processamento.',
    };
  }
}

/**
 * Factory para obter o provedor ativo ou obter por nome
 */
export class PaymentProviderFactory {
  static getProvider(provider?: PaymentProvider): PaymentProviderService {
    if (provider === 'MERCADO_PAGO') {
      return new MercadoPagoPaymentProvider();
    }
    if (provider === 'STRIPE') {
      return new StripePaymentProvider();
    }
    return new PendingExternalPaymentProvider();
  }
}

export function getActivePaymentProvider(): PaymentProviderService {
  const configured = (process.env.PAYMENT_GATEWAY_PROVIDER || '').toUpperCase();
  if (configured === 'MERCADO_PAGO') {
    return new MercadoPagoPaymentProvider();
  }
  if (configured === 'STRIPE') {
    return new StripePaymentProvider();
  }
  return new PendingExternalPaymentProvider();
}
