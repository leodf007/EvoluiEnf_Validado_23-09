// Polyfill de localStorage para execução da suíte em ambiente Node.js / CLI
if (typeof globalThis.localStorage === 'undefined' || typeof window === 'undefined') {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
  (globalThis as any).localStorage = mockStorage;
  (globalThis as any).window = globalThis;
}

import { runTransversalAuditTests } from '../src/engine/transversalAuditTests';
import { runHardeningUnitTests } from '../src/engine/hardeningTests';
import { runSubscriptionCommercialTests } from '../src/engine/subscriptionCommercialTests';
import { runQuotaPolicyTests } from '../src/engine/quotaPolicyTests';

async function main() {
  console.log('====================================================');
  console.log('INICIANDO SUÍTE COMPLETA DE TESTES AUTOMATIZADOS');
  console.log('====================================================\n');

  // 1. Suíte Transversal (69 testes clínicos / conformidade)
  console.log('--- 1. Executando Suíte Transversal de Auditoria Clínica ---');
  const auditReport = runTransversalAuditTests();
  console.log(`Suíte Transversal: ${auditReport.passedCount} de ${auditReport.totalCount} testes passaram.`);
  if (!auditReport.overallPassed) {
    console.error('Falhas na auditoria clínica transversal!');
    process.exit(1);
  }

  // 2. Suíte de Hardening (Fact locks, RBAC, etc.)
  console.log('\n--- 2. Executando Suíte de Hardening Unitário ---');
  const hardeningReport = runHardeningUnitTests();
  console.log(`Hardening: ${hardeningReport.passedCount} de ${hardeningReport.totalCount} testes passaram.`);
  if (!hardeningReport.allPassed) {
    console.error('Falhas no Hardening!');
    process.exit(1);
  }

  // 3. Suíte Comercial e SaaS (Assinaturas, Cotas, LGPD, Gateways)
  console.log('\n--- 3. Executando Suíte Comercial & SaaS (SUB-001 a SUB-015) ---');
  const commercialReport = await runSubscriptionCommercialTests();
  console.log(`Comercial/SaaS: ${commercialReport.passed} de ${commercialReport.total} testes passaram.`);
  for (const res of commercialReport.results) {
    const mark = res.passed ? '✓' : '✗';
    console.log(`  ${mark} [${res.id}] ${res.name}: ${res.message}`);
  }
  if (commercialReport.failed > 0) {
    console.error('Falhas na suíte Comercial/SaaS!');
    process.exit(1);
  }

  // 4. Política autoritativa de cotas (backend / competência / expiração)
  console.log('\n--- 4. Executando Suíte de Política de Cotas (QTA-001 a QTA-004) ---');
  const quotaReport = runQuotaPolicyTests();
  console.log(`Política de Cotas: ${quotaReport.passed} de ${quotaReport.total} testes passaram.`);
  for (const res of quotaReport.results) {
    const mark = res.passed ? '✓' : '✗';
    console.log(`  ${mark} [${res.id}] ${res.name}: ${res.message}`);
  }
  if (quotaReport.failed > 0) {
    console.error('Falhas na suíte de Política de Cotas!');
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('TODAS AS SUÍTES FORAM APROVADAS COM SUCESSO (100%)');
  console.log(`Total geral de testes verificados: ${auditReport.totalCount + hardeningReport.totalCount + commercialReport.total + quotaReport.total}`);
  console.log('====================================================');
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro fatal ao rodar testes:', err);
  process.exit(1);
});
