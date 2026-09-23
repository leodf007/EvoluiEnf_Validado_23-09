import { auth } from './firebase';

export interface AuthenticatedFetchOptions extends RequestInit {
  requestId?: string;
}

function createRequestId(prefix = 'req'): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
  } catch {
    // fallback below
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Fetch autenticado para endpoints internos sensíveis.
 * Em produção exige usuário Firebase válido; o backend valida o ID token.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> {
  const user = auth.currentUser;
  const { requestId: explicitRequestId, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  const requestId = explicitRequestId || createRequestId('evoluienf');

  headers.set('X-EvoluiEnf-Request-Id', requestId);

  if (user) {
    const idToken = await user.getIdToken();
    headers.set('Authorization', `Bearer ${idToken}`);
  }

  const response = await fetch(input, {
    ...fetchOptions,
    headers,
  });

  try {
    const url = typeof input === 'string' ? input : input.toString();
    if (response.ok && typeof window !== 'undefined' && url.includes('/api/ai/')) {
      window.dispatchEvent(new CustomEvent('evoluienf:usage-updated'));
    }
  } catch {
    // Evento de atualização é apenas auxiliar de interface.
  }

  return response;
}

export function generateQuotaResourceId(prefix = 'atend'): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
  } catch {
    // fallback below
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
