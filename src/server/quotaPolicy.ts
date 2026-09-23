import { COMMERCIAL_PLAN_CONFIG } from '../config/commercialPlans';

export type AuthoritativePlanType = 'FREE' | 'PRO';

export const DEFAULT_QUOTA_TIMEZONE = 'America/Sao_Paulo';
export const DOCUMENT_PERMIT_GRACE_DAYS = 180;

function getDateParts(date: Date, timeZone: string): { year: number; month: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value || date.getUTCFullYear());
  const month = Number(parts.find((part) => part.type === 'month')?.value || date.getUTCMonth() + 1);
  return { year, month };
}

/** Competência mensal autoritativa do SaaS. Por padrão usa o calendário civil de Brasília/São Paulo. */
export function getQuotaPeriod(date = new Date(), timeZone = DEFAULT_QUOTA_TIMEZONE): string {
  const { year, month } = getDateParts(date, timeZone);
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Validade longa o suficiente para um documento criado offline sincronizar posteriormente. */
export function getDocumentPermitValidUntil(date = new Date()): Date {
  return new Date(date.getTime() + DOCUMENT_PERMIT_GRACE_DAYS * 24 * 60 * 60 * 1000);
}

/** Converte ISO, Date, número ou Timestamp do Firestore sem depender do SDK no módulo de política. */
export function valueToEpochMillis(value: unknown): number | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === 'object') {
    const candidate = value as { toMillis?: () => number; seconds?: number; _seconds?: number };
    if (typeof candidate.toMillis === 'function') {
      try {
        const ms = candidate.toMillis();
        return Number.isFinite(ms) ? ms : null;
      } catch {
        return null;
      }
    }
    const seconds = typeof candidate.seconds === 'number' ? candidate.seconds : candidate._seconds;
    if (typeof seconds === 'number' && Number.isFinite(seconds)) return seconds * 1000;
  }
  return null;
}

/** Plano efetivo: PRO apenas quando a fonte autoritativa informa PRO ativo e não expirado. */
export function determineAuthoritativePlanType(
  data: Record<string, any> | undefined,
  now = Date.now()
): AuthoritativePlanType {
  if (!data) return 'FREE';
  const rawPlan = String(data.planId || data.plan || data.plano || '').toUpperCase();
  const rawStatus = String(data.canonicalStatus || data.status || '').toLowerCase();
  const end = data.currentPeriodEnd ?? data.expiresAt ?? data.dataRenovacao;
  const endMs = valueToEpochMillis(end);
  const hasEnd = end !== undefined && end !== null && end !== '';
  const expiredByDate = hasEnd ? (endMs === null || endMs < now) : false;
  const activeStatus = rawStatus === 'active' || rawStatus === 'ativo' || rawStatus === 'trial';
  return rawPlan === 'PRO' && activeStatus && !expiredByDate ? 'PRO' : 'FREE';
}

export function getAuthoritativeQuotaLimits(planType: AuthoritativePlanType) {
  const plan = COMMERCIAL_PLAN_CONFIG[planType];
  return {
    documentsLimit: plan.documentsPerMonth,
    aiLimit: plan.aiRequestsPerMonth,
  };
}
