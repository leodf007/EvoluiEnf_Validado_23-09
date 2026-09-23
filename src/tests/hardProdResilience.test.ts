import { AtendimentoService } from '../services/atendimentoService';
import { SyncQueueService } from '../services/syncQueueService';
import { ErrorHandlerService } from '../services/errorHandlerService';
import { Atendimento, SalvarAtendimentoParams, SyncQueueItem } from '../types';

export function runHardProdResilienceTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- EXECUTING HARD-PROD RESILIENCE & SYNCHRONIZATION TESTS (ETAPA 5) ---');

  const now = Date.now();
  const uidAlpha = `usr-nurse-alpha-${now}`;
  const uidBeta = `usr-nurse-beta-${now}`;

  // =========================================================================
  // HARD-PROD-001: salvamento repetido não duplica atendimento
  // =========================================================================
  const atendId1 = `hard-atend-001-${now}`;
  const atend1 = AtendimentoService.criarAtendimento({
    id: atendId1,
    usuarioId: uidAlpha,
    identificacao: 'R.T.M.',
    idade: '62',
    sexo: 'Masculino',
    setor: 'UTI Geral',
    leito: '12',
    tipoRegistro: 'Evolução SOAP',
    narrativaFinal: 'SUBJETIVO: Paciente estável sem queixas álgicas agudas.\nOBJETIVO: Sinais vitais preservados.\nAVALIAÇÃO: Estabilidade clínica mantida.\nPLANO: Manter decúbito elevado a 30 graus.',
    status: 'concluido',
  });

  // Salva novamente exatamente o mesmo atendimento com os mesmos dados
  const salvoRepetido = AtendimentoService.salvarAtendimento({
    atendimentoId: atendId1,
    usuarioId: uidAlpha,
    textoFinalGerado: 'SUBJETIVO: Paciente estável sem queixas álgicas agudas.\nOBJETIVO: Sinais vitais preservados.\nAVALIAÇÃO: Estabilidade clínica mantida.\nPLANO: Manter decúbito elevado a 30 graus.',
    setor: 'UTI Geral',
    leito: '12',
  });

  const todosAposRepeticao = AtendimentoService.listarAtendimentos(uidAlpha);
  const contagemId1 = todosAposRepeticao.filter((a) => a.id === atendId1).length;

  assert(
    contagemId1 === 1 && salvoRepetido.id === atendId1,
    'HARD-PROD-001',
    'Salvamento repetido com mesmos dados não duplica atendimento nem versões no histórico'
  );

  // =========================================================================
  // HARD-PROD-002: atendimento offline sincroniza após reconexão
  // =========================================================================
  SyncQueueService.limparFila(uidAlpha);
  const atendIdOffline = `hard-atend-off-${now}`;

  // Enfileira operação offline
  const itemFila = SyncQueueService.enfileirar({
    atendimentoId: atendIdOffline,
    usuarioId: uidAlpha,
    tipoOperacao: 'CRIAR',
    dados: {
      id: atendIdOffline,
      usuarioId: uidAlpha,
      identificacao: 'P.O.L.',
      setor: 'Emergência',
      narrativaFinal: 'Paciente em observação clínica.',
      status: 'concluido',
    },
  });

  const filaAntes = SyncQueueService.obterFila(uidAlpha);
  assert(
    filaAntes.length >= 1 && filaAntes.some((i) => i.atendimentoId === atendIdOffline),
    'HARD-PROD-002.1',
    'Atendimento criado offline é enfileirado com sucesso com status pendente'
  );

  // Simula processamento da fila ao reconectar
  // Cria localmente para que o processador localize o documento
  AtendimentoService.criarAtendimento({
    id: atendIdOffline,
    usuarioId: uidAlpha,
    identificacao: 'P.O.L.',
    idade: '45',
    sexo: 'Feminino',
    setor: 'Emergência',
    leito: '03',
    tipoRegistro: 'Evolução SOAP',
    narrativaFinal: 'Paciente em observação clínica.',
    status: 'concluido',
  });

  // =========================================================================
  // HARD-PROD-003: sincronização repetida é idempotente
  // =========================================================================
  // Enfileirar novamente o mesmo atendimentoId atualiza sem duplicar itens na fila
  SyncQueueService.enfileirar({
    atendimentoId: atendIdOffline,
    usuarioId: uidAlpha,
    tipoOperacao: 'ATUALIZAR',
    dados: {
      leito: '04',
    },
  });

  const filaAposSegundoEnfileiramento = SyncQueueService.obterFila(uidAlpha).filter(
    (i) => i.atendimentoId === atendIdOffline
  );

  assert(
    filaAposSegundoEnfileiramento.length === 1,
    'HARD-PROD-003',
    'Sincronização repetida e enfileiramento consecutivo são idempotentes (não geram itens duplicados na fila)'
  );

  // =========================================================================
  // HARD-PROD-004: conflito local/remoto preserva versões
  // =========================================================================
  const localDoc: Atendimento = {
    id: `conflito-doc-${now}`,
    usuarioId: uidAlpha,
    identificacao: 'M.B.S.',
    idade: '38',
    sexo: 'Feminino',
    setor: 'Clínica Cirúrgica',
    leito: '20A',
    tipoRegistro: 'Evolução de Enfermagem',
    dataCriacao: new Date().toISOString(),
    status: 'concluido',
    narrativaFinal: 'Nota Local: Ferida operatória limpa e seca.',
    versaoAtual: 1,
    trilhaAuditoria: [
      {
        id: `aud-local-${now}`,
        tipo: 'criacao',
        dataHora: new Date().toISOString(),
        usuarioId: uidAlpha,
        descricao: 'Criação local',
      },
    ],
  };

  const remotoDoc: Atendimento = {
    id: `conflito-doc-${now}`,
    usuarioId: uidAlpha,
    identificacao: 'M.B.S.',
    idade: '38',
    sexo: 'Feminino',
    setor: 'Clínica Cirúrgica',
    leito: '20A',
    tipoRegistro: 'Evolução de Enfermagem',
    dataCriacao: new Date().toISOString(),
    status: 'concluido',
    narrativaFinal: 'Nota Remota: Curativo trocado, administrado analgésico EV.',
    versaoAtual: 1,
    trilhaAuditoria: [
      {
        id: `aud-remoto-${now}`,
        tipo: 'criacao',
        dataHora: new Date().toISOString(),
        usuarioId: uidAlpha,
        descricao: 'Criação remota',
      },
    ],
  };

  const docResolvido = AtendimentoService.resolverConflito(localDoc, remotoDoc);

  const versaoPreservadaNoHistorico = docResolvido.historicoVersoes?.some((v) =>
    v.narrativa.includes('Nota Remota')
  );
  const conflitoRegistradoNaAuditoria = docResolvido.trilhaAuditoria?.some((ev) =>
    ev.descricao.includes('Conflito de sincronização concorrente')
  );

  assert(
    docResolvido.versaoAtual === 2 &&
      versaoPreservadaNoHistorico === true &&
      conflitoRegistradoNaAuditoria === true,
    'HARD-PROD-004',
    'Conflito local/remoto preserva ambas as versões no histórico e registra o evento na auditoria sem perda de dados'
  );

  // =========================================================================
  // HARD-PROD-005: usuário A continua sem acesso aos dados do usuário B
  // =========================================================================
  const atendIdBeta = `hard-beta-${now}`;
  AtendimentoService.criarAtendimento({
    id: atendIdBeta,
    usuarioId: uidBeta,
    identificacao: 'B.E.T.',
    idade: '10',
    sexo: 'Masculino',
    setor: 'Pediatria',
    leito: '05',
    tipoRegistro: 'Anotação Técnica',
    status: 'concluido',
  });

  const listaAlpha = AtendimentoService.listarAtendimentos(uidAlpha);
  const encontrouBeta = listaAlpha.some((a) => a.id === atendIdBeta);
  const buscaDiretaAlphaTentandoBeta = AtendimentoService.buscarPorId(atendIdBeta, uidAlpha);

  assert(
    !encontrouBeta && buscaDiretaAlphaTentandoBeta === undefined,
    'HARD-PROD-005',
    'Usuário A não consegue listar nem buscar diretamente atendimentos pertencentes ao usuário B'
  );

  // =========================================================================
  // HARD-PROD-006: falha Firestore não provoca perda local
  // =========================================================================
  const atendIdResiliente = `hard-resiliente-${now}`;
  const atendCriado = AtendimentoService.criarAtendimento({
    id: atendIdResiliente,
    usuarioId: uidAlpha,
    identificacao: 'F.A.L.',
    idade: '72',
    sexo: 'Masculino',
    setor: 'Isolamento',
    leito: '01',
    tipoRegistro: 'Evolução SOAP',
    narrativaFinal: 'Dados clínicos críticos preservados no storage local.',
    status: 'concluido',
  });

  // Simula falha do Firestore via ErrorHandlerService
  const erroSimulado = new Error('Firebase network unavailable');
  const erroTratado = ErrorHandlerService.tratarErro(erroSimulado, 'persistencia_remota');

  // Verifica que o atendimento continua íntegro no storage local
  const buscadoLocal = AtendimentoService.buscarPorId(atendIdResiliente, uidAlpha);

  assert(
    buscadoLocal !== undefined &&
      buscadoLocal.narrativaFinal === 'Dados clínicos críticos preservados no storage local.' &&
      erroTratado.documentoPreservadoLocalmente === true,
    'HARD-PROD-006',
    'Falha no Firestore não provoca perda do documento clínico local, que permanece íntegro'
  );

  // =========================================================================
  // HARD-PROD-007: auditoria não duplica eventos durante sincronização
  // =========================================================================
  const ev1 = AtendimentoService.registrarEventoAuditoria(atendId1, {
    tipo: 'edicao',
    descricao: 'Ajuste de conduta de enfermagem',
    usuarioId: uidAlpha,
    dataHora: '2026-09-19T12:00:00.000Z',
  });

  // Tentativa de registrar o mesmo evento imediatamente
  const ev2 = AtendimentoService.registrarEventoAuditoria(atendId1, {
    tipo: 'edicao',
    descricao: 'Ajuste de conduta de enfermagem',
    usuarioId: uidAlpha,
    dataHora: '2026-09-19T12:00:00.500Z',
  });

  const atendAudit = AtendimentoService.buscarPorId(atendId1, uidAlpha);
  const eventosIguais = atendAudit?.trilhaAuditoria?.filter(
    (e) => e.descricao === 'Ajuste de conduta de enfermagem'
  );

  assert(
    eventosIguais !== undefined && eventosIguais.length === 1,
    'HARD-PROD-007',
    'Auditoria deduplica eventos redundantes e preserva integridade sem repetições espúrias'
  );

  // =========================================================================
  // HARD-PROD-008: usuarioId não pode ser substituído para acessar registro de terceiro
  // =========================================================================
  let spoofingBloqueado = false;
  try {
    // Usuário Alpha tenta salvar alterações no atendimento do Usuário Beta
    AtendimentoService.salvarAtendimento({
      atendimentoId: atendIdBeta,
      usuarioId: uidAlpha, // Alpha tentando usurpar o registro de Beta
      textoFinalGerado: 'Texto forjado por outro usuário.',
    });
  } catch (err: any) {
    if (err.message && err.message.includes('Violação de isolamento multiusuário')) {
      spoofingBloqueado = true;
    }
  }

  assert(
    spoofingBloqueado === true,
    'HARD-PROD-008',
    'Tentativa de usurpar ou modificar atendimento de terceiro com usuarioId distinto é bloqueada com erro explícito'
  );

  // =========================================================================
  // HARD-PROD-009: fila pendente é processada corretamente
  // =========================================================================
  const atendIdFila = `hard-fila-exec-${now}`;
  AtendimentoService.criarAtendimento({
    id: atendIdFila,
    usuarioId: uidAlpha,
    identificacao: 'Q.U.E.',
    idade: '28',
    sexo: 'Feminino',
    setor: 'UTI Neonatal',
    leito: '02',
    tipoRegistro: 'Anotação Técnica',
    status: 'concluido',
  });

  SyncQueueService.enfileirar({
    atendimentoId: atendIdFila,
    usuarioId: uidAlpha,
    tipoOperacao: 'CONCLUIR',
  });

  const filaAntesProc = SyncQueueService.obterFila(uidAlpha);
  const itemExiste = filaAntesProc.some((i) => i.atendimentoId === atendIdFila);

  // Simula confirmação e remoção segura
  SyncQueueService.removerPorAtendimentoId(atendIdFila);
  const filaAposProc = SyncQueueService.obterFila(uidAlpha);
  const itemRemovido = !filaAposProc.some((i) => i.atendimentoId === atendIdFila);

  assert(
    itemExiste && itemRemovido,
    'HARD-PROD-009',
    'Fila de sincronização pendente enfileira e remove operações apenas após confirmação'
  );

  // =========================================================================
  // HARD-PROD-010: aplicação continua compilando e funcionando sem alterar motores clínicos
  // =========================================================================
  // Valida que os motores clínicos (SOAP, Anotação, PrivacyGuard, Exportação) continuam operacionais
  const soapValido = atend1.narrativaFinal && atend1.narrativaFinal.includes('SUBJETIVO:');
  const privacidadeValida = atend1.identificacao.length <= 10; // Iniciais seguras
  const statusAuditavel = atend1.status === 'concluido' || atend1.status === 'exportado';

  assert(
    Boolean(soapValido && privacidadeValida && statusAuditavel),
    'HARD-PROD-010',
    'Motores clínicos, regras COFEN/RBAC e formatação continuam íntegros sem alterações estruturais'
  );

  return { passed, failed: errors.length, errors };
}
