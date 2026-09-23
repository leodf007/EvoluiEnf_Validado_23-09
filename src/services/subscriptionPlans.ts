import { SubscriptionPlan, SubscriptionPlanType } from '../types';
import { COMMERCIAL_PLAN_CONFIG, formatMonthlyPriceBRL } from '../config/commercialPlans';

export interface CommercialPlanDetails extends SubscriptionPlan {
  description: string;
  recursos: string[];
  limitacoes: string[];
  precoMensalTexto: string;
  badgeTexto?: string;
}

/**
 * Configuração do Plano Gratuito (FREE)
 * - documentos limitados;
 * - Assistente IA limitado;
 * - histórico limitado;
 * - recursos básicos.
 */
export const PLAN_FREE: CommercialPlanDetails = {
  id: 'plan_free',
  name: 'Plano Gratuito',
  type: 'FREE',
  description: 'Acesso essencial e seguro para organização individual de registros e anotações.',
  precoMensalTexto: formatMonthlyPriceBRL(COMMERCIAL_PLAN_CONFIG.FREE.monthlyPriceBRL),
  recursos: [
    'Recursos básicos assistenciais',
    'Acesso aos módulos permitidos pelo perfil (COFEN)',
    'Armazenamento seguro e individual de registros',
    'Exportação e cópia rápida de registros',
  ],
  limitacoes: [
    'Documentos limitados (até 10 registros/mês)',
    'Assistente IA limitado (até 5 consultas/mês)',
    'Histórico limitado (apenas registros recentes)',
  ],
  features: [
    'Recursos básicos assistenciais',
    'Acesso aos módulos permitidos pelo perfil',
    'Documentos limitados (10 documentos/mês)',
    'Assistente IA limitado (5 consultas/mês)',
    'Histórico limitado de atendimentos',
    'Armazenamento seguro individual',
  ],
  limits: {
    documentsPerMonth: COMMERCIAL_PLAN_CONFIG.FREE.documentsPerMonth,
    aiRequestsPerMonth: COMMERCIAL_PLAN_CONFIG.FREE.aiRequestsPerMonth,
    unlimitedHistory: false,
    advancedFeatures: false,
  },
};

/**
 * Configuração do Plano PRO (EvoluiEnf PRO)
 * - maior limite de documentos;
 * - Assistente IA ampliado;
 * - histórico completo;
 * - recursos avançados.
 */
export const PLAN_PRO: CommercialPlanDetails = {
  id: 'plan_pro',
  name: 'EvoluiEnf PRO',
  type: 'PRO',
  badgeTexto: 'Mais Escolhido por Plantonistas',
  description: 'Agilidade máxima, alta capacidade e suporte ampliado do Assistente IA para sua rotina de plantão.',
  precoMensalTexto: formatMonthlyPriceBRL(COMMERCIAL_PLAN_CONFIG.PRO.monthlyPriceBRL),
  recursos: [
    'Até 100 documentos por mês',
    'Até 100 consultas ao Assistente IA por mês',
    'Histórico completo e pesquisa irrestrita de registros anteriores',
    'Recursos avançados de síntese, auditoria e exportação profissional',
    'Biblioteca prioritária de modelos assistenciais',
  ],
  limitacoes: [
    'Nenhuma limitação no histórico de atendimentos',
  ],
  features: [
    'Até 100 documentos por mês',
    'Até 100 consultas ao Assistente IA por mês',
    'Histórico completo sem restrições',
    'Recursos avançados de exportação e síntese',
    'Modelos de IA de alta performance prioritários',
  ],
  limits: {
    documentsPerMonth: COMMERCIAL_PLAN_CONFIG.PRO.documentsPerMonth,
    aiRequestsPerMonth: COMMERCIAL_PLAN_CONFIG.PRO.aiRequestsPerMonth,
    unlimitedHistory: true,
    advancedFeatures: true,
  },
};

/**
 * Catálogo canônico de planos de assinatura do EvoluiEnf
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanType, CommercialPlanDetails> = {
  FREE: PLAN_FREE,
  PRO: PLAN_PRO,
};

/**
 * Obtém a definição do plano por tipo ('FREE' | 'PRO').
 * Retorna Plano Gratuito por padrão caso não especificado.
 */
export function getSubscriptionPlan(type?: SubscriptionPlanType | null): CommercialPlanDetails {
  if (type === 'PRO') {
    return PLAN_PRO;
  }
  return PLAN_FREE;
}
