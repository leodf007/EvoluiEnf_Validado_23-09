import { runCoreLoopAtendimentoTests } from './coreLoopAtendimento.test';
import { runDocumentExportTests } from './documentExport.test';
import { runAuditoriaRastreabilidadeTests } from './auditoriaRastreabilidade.test';
import { runFirebaseMultiuserTests } from './firebaseMultiuser.test';
import { runHardProdResilienceTests } from './hardProdResilience.test';

console.log('========================================================');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES: EVOLUIENF');
console.log('========================================================');

const coreResults = runCoreLoopAtendimentoTests();
const exportResults = runDocumentExportTests();
const auditResults = runAuditoriaRastreabilidadeTests();
const firebaseResults = runFirebaseMultiuserTests();
const hardProdResults = runHardProdResilienceTests();

const totalPassed =
  coreResults.passed +
  exportResults.passed +
  auditResults.passed +
  firebaseResults.passed +
  hardProdResults.passed;
const totalFailed =
  coreResults.failed +
  exportResults.failed +
  auditResults.failed +
  firebaseResults.failed +
  hardProdResults.failed;

console.log('\n========================================================');
console.log(`📊 RESULTADO GERAL: ${totalPassed} PASSOU, ${totalFailed} FALHOU`);
console.log('========================================================');

if (totalFailed > 0) {
  console.error('❌ Falhas encontradas nos testes:');
  [
    ...coreResults.errors,
    ...exportResults.errors,
    ...auditResults.errors,
    ...firebaseResults.errors,
    ...hardProdResults.errors,
  ].forEach((e) => console.error(` - ${e}`));
  process.exit(1);
} else {
  console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
  process.exit(0);
}
