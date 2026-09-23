import { COMMERCIAL_PLAN_CONFIG } from '../config/commercialPlans';
import {
  DOCUMENT_PERMIT_GRACE_DAYS,
  determineAuthoritativePlanType,
  getAuthoritativeQuotaLimits,
  getDocumentPermitValidUntil,
  getQuotaPeriod,
} from '../server/quotaPolicy';

export interface QuotaPolicyTestResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
}

export interface QuotaPolicyTestSuiteResult {
  passed: number;
  failed: number;
  total: number;
  results: QuotaPolicyTestResult[];
}

export function runQuotaPolicyTests(): QuotaPolicyTestSuiteResult {
  const results: QuotaPolicyTestResult[] = [];

  const add = (id: string, name: string, passed: boolean, message: string) => {
    results.push({ id, name, passed, message });
  };

  try {
    const beforeBrazilMidnight = getQuotaPeriod(
      new Date('2026-10-01T01:30:00.000Z'),
      'America/Sao_Paulo'
    );
    const afterBrazilMidnight = getQuotaPeriod(
      new Date('2026-10-01T03:30:00.000Z'),
      'America/Sao_Paulo'
    );
    const passed = beforeBrazilMidnight === '2026-09' && afterBrazilMidnight === '2026-10';
    add(
      'QTA-001',
      'Virada mensal respeita calendário do Brasil',
      passed,
      passed
        ? 'A competência muda somente após a meia-noite em America/Sao_Paulo.'
        : `Competências inesperadas: antes=${beforeBrazilMidnight}, depois=${afterBrazilMidnight}`
    );
  } catch (error: any) {
    add('QTA-001', 'Virada mensal respeita calendário do Brasil', false, error?.message || String(error));
  }

  try {
    const free = getAuthoritativeQuotaLimits('FREE');
    const pro = getAuthoritativeQuotaLimits('PRO');
    const passed =
      free.documentsLimit === 10 &&
      free.aiLimit === 5 &&
      pro.documentsLimit === 100 &&
      pro.aiLimit === 100 &&
      COMMERCIAL_PLAN_CONFIG.PRO.monthlyPriceBRL === 34.97;
    add(
      'QTA-002',
      'Limites comerciais autoritativos',
      passed,
      passed
        ? 'FREE=10/5 e PRO=100/100 por R$ 34,97 estão centralizados na configuração comercial.'
        : 'Os limites autoritativos divergem da configuração comercial aprovada.'
    );
  } catch (error: any) {
    add('QTA-002', 'Limites comerciais autoritativos', false, error?.message || String(error));
  }

  try {
    const now = Date.parse('2026-09-21T15:00:00.000Z');
    const timestampLike = { toMillis: () => Date.parse('2026-10-21T15:00:00.000Z') };
    const expiredTimestampLike = { seconds: Math.floor(Date.parse('2026-08-21T15:00:00.000Z') / 1000) };
    const activePro = determineAuthoritativePlanType(
      { planId: 'PRO', canonicalStatus: 'active', currentPeriodEnd: timestampLike },
      now
    );
    const expiredPro = determineAuthoritativePlanType(
      { planId: 'PRO', canonicalStatus: 'active', currentPeriodEnd: expiredTimestampLike },
      now
    );
    const passed = activePro === 'PRO' && expiredPro === 'FREE';
    add(
      'QTA-003',
      'Plano PRO interpreta datas do Firestore',
      passed,
      passed
        ? 'Timestamp ativo mantém PRO e Timestamp expirado rebaixa com segurança para FREE.'
        : `Resultado inesperado: ativo=${activePro}, expirado=${expiredPro}`
    );
  } catch (error: any) {
    add('QTA-003', 'Plano PRO interpreta datas do Firestore', false, error?.message || String(error));
  }

  try {
    const start = new Date('2026-09-21T12:00:00.000Z');
    const validUntil = getDocumentPermitValidUntil(start);
    const diffDays = Math.round((validUntil.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const passed = diffDays === DOCUMENT_PERMIT_GRACE_DAYS && diffDays === 180;
    add(
      'QTA-004',
      'Autorização offline possui janela de sincronização',
      passed,
      passed
        ? 'Permissão de documento permanece válida por 180 dias para sincronização tardia, sem recontar a cota.'
        : `Validade inesperada: ${diffDays} dias.`
    );
  } catch (error: any) {
    add('QTA-004', 'Autorização offline possui janela de sincronização', false, error?.message || String(error));
  }

  const passed = results.filter((item) => item.passed).length;
  return {
    passed,
    failed: results.length - passed,
    total: results.length,
    results,
  };
}
