import { AtendimentoService } from '../services/atendimentoService';
import { DocumentExportService } from '../services/documentExportService';
import { Atendimento, ProfessionalUser, SalvarAtendimentoParams } from '../types';

export function runAuditoriaRastreabilidadeTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- EXECUTING AUDIT & TRACEABILITY TESTS (ETAPA 3) ---');

  const testUserId = `user-auditoria-${Date.now()}`;
  const mockUsuario: ProfessionalUser = {
    id: testUserId,
    nome: 'Enfermeiro Carlos Eduardo',
    email: 'carlos.eduardo@hospital.org',
    profissao: 'Enfermeiro',
    plano: 'Pro',
    dataCadastro: new Date().toISOString(),
    dataCriacao: new Date().toISOString(),
    isAuthenticated: true,
    role: 'nurse',
    registroProfissional: 'COREN-RJ 987.654-ENF',
  };

  // =========================================================================
  // AUD-001: Criação do atendimento gera log de auditoria
  // =========================================================================
  const novoAtendimento = AtendimentoService.criarAtendimento({
    usuarioId: testUserId,
    identificacao: 'M.A.S.',
    idade: '52',
    sexo: 'Masculino',
    setor: 'UTI Geral',
    leito: '12',
    tipoRegistro: 'Evolução de Enfermagem',
    status: 'rascunho',
    usuarioResponsavel: mockUsuario.nome,
    perfilProfissional: mockUsuario.profissao,
    registroProfissional: mockUsuario.registroProfissional,
    categoriaClinica: 'Terapia Intensiva',
  });

  const temTrilhaCriacao =
    Array.isArray(novoAtendimento.trilhaAuditoria) &&
    novoAtendimento.trilhaAuditoria.some(
      (ev) => ev.tipo === 'criacao' && ev.usuarioId === testUserId
    );

  assert(
    temTrilhaCriacao,
    'AUD-001',
    'Criação do atendimento gera log na trilha de auditoria com dados do responsável'
  );

  assert(
    Boolean(novoAtendimento.dataCriacao) && novoAtendimento.status === 'rascunho',
    'AUD-001-B',
    'Atendimento criado possui data de criação registrada e status rascunho'
  );

  // =========================================================================
  // AUD-002: Conclusão gera timestamp e log de conclusão
  // =========================================================================
  const textoEvolucaoOriginal =
    'Paciente em ventilação mecânica invasiva, sedado com fentanil e midazolam. ' +
    'Glasgow 3, RASS -4. Pupilas isocóricas e fotorreagentes. ' +
    'Diurese por SVD com débito de 80ml/h, urina clara. Hemodinamicamente estável com nora a 0.05 mcg/kg/min.';

  const timestampConclusao = new Date().toISOString();
  const atendimentoConcluido = AtendimentoService.salvarAtendimento({
    atendimentoId: novoAtendimento.id,
    usuarioId: testUserId,
    usuarioResponsavel: mockUsuario.nome,
    perfilProfissional: mockUsuario.profissao,
    registroProfissional: mockUsuario.registroProfissional,
    categoriaClinica: 'Terapia Intensiva',
    textoFinalGerado: textoEvolucaoOriginal,
    setor: 'UTI Geral',
    leito: '12',
    tipoRegistro: 'Evolução de Enfermagem',
    dataHora: timestampConclusao,
  });

  const temTimestampConclusao = Boolean(atendimentoConcluido.dataConclusao);
  const temLogConclusao =
    Array.isArray(atendimentoConcluido.trilhaAuditoria) &&
    atendimentoConcluido.trilhaAuditoria.some((ev) => ev.tipo === 'conclusao');

  assert(
    temTimestampConclusao && atendimentoConcluido.status === 'concluido' && temLogConclusao,
    'AUD-002',
    'Conclusão do atendimento gera timestamp de conclusão formal e log de conclusão na auditoria'
  );

  // =========================================================================
  // AUD-003: Exportação gera log
  // =========================================================================
  const exportado = AtendimentoService.registrarExportacao(
    atendimentoConcluido.id,
    mockUsuario.nome,
    'Impressão A4 Prontuário'
  );

  const temLogExportacao =
    Boolean(exportado) &&
    exportado?.status === 'exportado' &&
    exportado.trilhaAuditoria?.some(
      (ev) => ev.tipo === 'exportacao' && ev.metadados?.tipoExportacao === 'Impressão A4 Prontuário'
    );

  assert(
    Boolean(temLogExportacao),
    'AUD-003',
    'Exportação profissional gera evento de auditoria e atualiza status para exportado'
  );

  // =========================================================================
  // AUD-004: Edição após conclusão gera nova versão (proteção contra alteração silenciosa)
  // =========================================================================
  const textoEvolucaoRetificada =
    textoEvolucaoOriginal +
    '\n[ADITAMENTO 16:45] Paciente apresentou episódio febril (Tax 38.2°C). Coletadas hemoculturas pareadas e iniciado antipirético conforme prescrição médica.';

  const atendimentoRetificado = AtendimentoService.salvarAtendimento({
    atendimentoId: atendimentoConcluido.id,
    usuarioId: testUserId,
    usuarioResponsavel: mockUsuario.nome,
    perfilProfissional: mockUsuario.profissao,
    registroProfissional: mockUsuario.registroProfissional,
    textoFinalGerado: textoEvolucaoRetificada,
    motivoAlteracao: 'Aditamento de episódio febril e coleta de hemoculturas',
  });

  const versaoIncrementada = (atendimentoRetificado.versaoAtual || 1) === 2;
  const temLogEdicao = atendimentoRetificado.trilhaAuditoria?.some(
    (ev) => ev.tipo === 'edicao' && ev.metadados?.novaVersao === 2
  );

  assert(
    versaoIncrementada && Boolean(temLogEdicao),
    'AUD-004',
    'Edição de narrativa após conclusão gera Versão 2 e registra log de retificação/aditamento'
  );

  // =========================================================================
  // AUD-005: Histórico anterior permanece acessível intacto
  // =========================================================================
  const historicoVersoes = atendimentoRetificado.historicoVersoes || [];
  const versaoAnteriorSalva = historicoVersoes.find((v) => v.versao === 1);

  const versaoAnteriorIntacta =
    historicoVersoes.length === 1 &&
    Boolean(versaoAnteriorSalva) &&
    versaoAnteriorSalva?.narrativa.trim() === textoEvolucaoOriginal.trim() &&
    versaoAnteriorSalva?.motivoAlteracao?.includes('Aditamento de episódio febril');

  assert(
    versaoAnteriorIntacta,
    'AUD-005',
    'Versão anterior 1 permanece arquivada, acessível e intacta com narrativa e motivo preservados'
  );

  return { passed, failed: errors.length, errors };
}
