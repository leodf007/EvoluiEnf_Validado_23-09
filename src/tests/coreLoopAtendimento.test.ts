import { AtendimentoService } from '../services/atendimentoService';
import { SalvarAtendimentoParams } from '../types';

export function runCoreLoopAtendimentoTests(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = [];
  let passed = 0;

  function assert(condition: boolean, testId: string, message: string) {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${testId}: ${message}`);
    } else {
      errors.push(`[FAIL] ${testId}: ${message}`);
      console.error(`  [FAIL] ${testId}: ${message}`);
    }
  }

  console.log('\n--- EXECUTING CORE LOOP ATENDIMENTO PERSISTENCE TESTS ---');

  const testUserId = `test-usr-${Date.now()}`;

  // TEST 1: Criação de atendimento com ID único
  const novo = AtendimentoService.criarAtendimento({
    usuarioId: testUserId,
    identificacao: 'M.S.A.',
    idade: '45',
    sexo: 'Feminino',
    setor: 'UTI Adulto',
    leito: '12B',
    tipoRegistro: 'Anotação Técnica',
    status: 'em_andamento',
    usuarioResponsavel: 'Enf. Joana Martins',
    perfilProfissional: 'Enfermeiro',
    categoriaClinica: 'Terapia Intensiva',
  });

  assert(Boolean(novo.id && novo.id.startsWith('atend-')), 'LOOP-001', 'Atendimento criado possui atendimentoId único');
  assert(novo.status === 'em_andamento', 'LOOP-002', 'Status inicial é em_andamento');
  assert(novo.setor === 'UTI Adulto', 'LOOP-003', 'Setor preservado corretamente');
  assert(novo.leito === '12B', 'LOOP-004', 'Leito preservado corretamente');

  // TEST 2: Conclusão via salvarAtendimento()
  const textoSimulado = 'Paciente lúcida, orientada, em ar ambiente. Sinais vitais estáveis. Diurese clara via SVD.';
  const dataHoraConclusao = new Date().toISOString();

  const params: SalvarAtendimentoParams = {
    atendimentoId: novo.id,
    usuarioId: testUserId,
    usuarioResponsavel: 'Enf. Joana Martins',
    perfilProfissional: 'Enfermeiro',
    categoriaClinica: 'Terapia Intensiva',
    textoFinalGerado: textoSimulado,
    dataHora: dataHoraConclusao,
    setor: 'UTI Adulto',
    leito: '12B',
    identificacao: 'M.S.A.',
    tipoRegistro: 'Anotação Técnica',
  };

  const salvo = AtendimentoService.salvarAtendimento(params);

  assert(salvo.id === novo.id, 'LOOP-005', 'ID mantido após salvar atendimento');
  assert(salvo.status === 'concluido', 'LOOP-006', 'Status atualizado para concluido');
  assert(salvo.narrativaFinal === textoSimulado, 'LOOP-007', 'Texto final gerado persistido com sucesso');
  assert(salvo.usuarioResponsavel === 'Enf. Joana Martins', 'LOOP-008', 'Usuário responsável persistido');
  assert(salvo.perfilProfissional === 'Enfermeiro', 'LOOP-009', 'Perfil profissional persistido');
  assert(salvo.categoriaClinica === 'Terapia Intensiva', 'LOOP-010', 'Categoria clínica persistida');
  assert(salvo.setor === 'UTI Adulto', 'LOOP-011', 'Setor persistido');
  assert(salvo.leito === '12B', 'LOOP-012', 'Leito persistido');

  // TEST 3: Atualização automática do histórico
  const historico = AtendimentoService.listarAtendimentos(testUserId);
  const encontrado = historico.find((item) => item.id === novo.id);

  assert(Boolean(encontrado), 'LOOP-013', 'Atendimento concluído aparece automaticamente no histórico do usuário');
  assert(encontrado?.status === 'concluido', 'LOOP-014', 'Item no histórico reflete status concluído');
  assert(encontrado?.narrativaFinal === textoSimulado, 'LOOP-015', 'Narrativa clínica no histórico está idêntica ao texto gerado');

  // TEST 4: Criação direta via salvarAtendimento() quando ainda não existe ID prévio
  const directParams: SalvarAtendimentoParams = {
    usuarioId: testUserId,
    usuarioResponsavel: 'Téc. Carlos Eduardo',
    perfilProfissional: 'Técnico em Enfermagem',
    categoriaClinica: 'Clínica Médica',
    textoFinalGerado: 'Recebo paciente em repouso no leito.',
    setor: 'Clínica Médica',
    leito: '04',
    identificacao: 'A.B.C.',
  };

  const directSalvo = AtendimentoService.salvarAtendimento(directParams);
  assert(Boolean(directSalvo.id && directSalvo.id.startsWith('atend-')), 'LOOP-016', 'Gera ID único automaticamente caso não fornecido');
  assert(directSalvo.status === 'concluido', 'LOOP-017', 'Novo atendimento direto já nasce com status concluido');
  assert(directSalvo.perfilProfissional === 'Técnico em Enfermagem', 'LOOP-018', 'Perfil técnico gravado com integridade');

  console.log(`\n--- CORE LOOP TESTS FINISHED: ${passed} PASSED, ${errors.length} FAILED ---`);
  return { passed, failed: errors.length, errors };
}
