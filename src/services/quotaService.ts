import { SubscriptionPlanType, UserUsage } from '../types';
import { authenticatedFetch } from './authenticatedFetch';

export type QuotaErrorType =
  | 'quota_exceeded'
  | 'duplicate_request'
  | 'auth_required'
  | 'invalid_token'
  | 'quota_backend_unavailable'
  | 'network_error'
  | 'unknown';

export interface AuthoritativeQuotaSnapshot {
  period: string;
  planType: SubscriptionPlanType;
  documentsCreatedThisMonth: number;
  aiRequestsThisMonth: number;
  documentsLimit: number;
  aiLimit: number;
}

export interface DocumentQuotaReservation extends AuthoritativeQuotaSnapshot {
  permitId: string;
  alreadyReserved: boolean;
}

export class QuotaServiceError extends Error {
  constructor(
    message: string,
    public type: QuotaErrorType,
    public status?: number,
    public current?: number,
    public limit?: number,
    public planType?: SubscriptionPlanType
  ) {
    super(message);
    this.name = 'QuotaServiceError';
  }
}

async function parseFailure(res: Response): Promise<never> {
  const data = await res.json().catch(() => ({}));
  throw new QuotaServiceError(
    data.error || 'Não foi possível validar a cota neste momento.',
    data.errorType || 'unknown',
    res.status,
    data.current,
    data.limit,
    data.planType
  );
}

export class QuotaService {
  static async getCurrentUsage(): Promise<AuthoritativeQuotaSnapshot> {
    try {
      const res = await authenticatedFetch('/api/quota/current', { method: 'GET' });
      if (!res.ok) return parseFailure(res);
      const data = await res.json();
      return {
        period: data.period,
        planType: data.planType === 'PRO' ? 'PRO' : 'FREE',
        documentsCreatedThisMonth: Number(data.documentsCreatedThisMonth || 0),
        aiRequestsThisMonth: Number(data.aiRequestsThisMonth || 0),
        documentsLimit: Number(data.documentsLimit || 0),
        aiLimit: Number(data.aiLimit || 0),
      };
    } catch (error) {
      if (error instanceof QuotaServiceError) throw error;
      throw new QuotaServiceError(
        'Sem conexão para validar a cota mensal. Seus registros existentes continuam disponíveis.',
        'network_error'
      );
    }
  }

  static async reserveDocument(resourceId: string): Promise<DocumentQuotaReservation> {
    try {
      const res = await authenticatedFetch('/api/quota/documents/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        requestId: `document_${resourceId}`,
        body: JSON.stringify({ resourceId }),
      });
      if (!res.ok) return parseFailure(res);
      const data = await res.json();
      return {
        period: data.period,
        planType: data.planType === 'PRO' ? 'PRO' : 'FREE',
        documentsCreatedThisMonth: Number(data.documentsCreatedThisMonth || 0),
        aiRequestsThisMonth: Number(data.aiRequestsThisMonth || 0),
        documentsLimit: Number(data.documentsLimit || 0),
        aiLimit: Number(data.aiLimit || 0),
        permitId: String(data.permitId || ''),
        alreadyReserved: Boolean(data.alreadyReserved),
      };
    } catch (error) {
      if (error instanceof QuotaServiceError) throw error;
      throw new QuotaServiceError(
        'Sem conexão para validar a criação de um novo documento.',
        'network_error'
      );
    }
  }

  static toUserUsage(snapshot: AuthoritativeQuotaSnapshot): UserUsage {
    return {
      documentsCreatedThisMonth: snapshot.documentsCreatedThisMonth,
      aiRequestsThisMonth: snapshot.aiRequestsThisMonth,
      period: snapshot.period,
      lastResetDate: `${snapshot.period}-01T00:00:00.000Z`,
    };
  }
}
