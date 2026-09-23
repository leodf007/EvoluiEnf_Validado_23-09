import { AtendimentoService } from '../services/atendimentoService';
import { DocumentExportService } from '../services/documentExportService';
import { UserService } from '../services/userService';
import { ProfessionalUser, SalvarAtendimentoParams } from '../types';

export function runFirebaseMultiuserTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- EXECUTING FIREBASE PRODUCTION & MULTIUSER ISOLATION TESTS (ETAPA 4) ---');

  const now = Date.now();
  const uidA = `usr-nurse-a-${now}`;
  const uidB = `usr-nurse-b-${now}`;

  const mockUserA: ProfessionalUser = {
    id: uidA,
    nome: 'Enf. Juliana Rossi',
    email: 'juliana.rossi@hospital.org',
    profissao: 'Enfermeiro',
    plano: 'Pro',
    dataCadastro: new Date().toISOString(),
    dataCriacao: new Date().toISOString(),
    isAuthenticated: true,
    role: 'nurse',
    registroProfissional: 'COREN-SP 111.222-ENF',
  };

  const mockUserB: ProfessionalUser = {
    id: uidB,
    nome: 'Téc. Marcos Vinicius',
    email: 'marcos.vinicius@hospital.org',
    profissao: 'Técnico em Enfermagem',
    plano: 'Gratuito',
    dataCadastro: new Date().toISOString(),
    dataCriacao: new Date().toISOString(),
    isAuthenticated: true,
    role: 'technician',
    registroProfissional: 'COREN-SP 333.444-TE',
  };

  // =========================================================================
  // TESTE FIRE-001: Usuário cria atendimento próprio vinculado ao seu UID
  // =========================================================================
  const atendA1 = AtendimentoService.criarAtendimento({
    usuarioId: uidA,
    identificacao: 'G.H.K.',
    idade: '58',
    sexo: 'Masculino',
    setor: 'UTI Cardiológica',
    leito: '04',
    tipoRegistro: 'Evolução de Enfermagem',
    status: 'rascunho',
    usuarioResponsavel: mockUserA.nome,
    perfilProfissional: mockUserA.profissao,
    registroProfissional: mockUserA.registroProfissional,
    categoriaClinica: 'Cardiologia',
  });

  assert(
    Boolean(atendA1.id && atendA1.id.startsWith('atend-')),
    'FIRE-001.1',
    'Atendimento criado possui ID único de sistema'
  );
  assert(
    atendA1.usuarioId === uidA,
    'FIRE-001.2',
    'Atendimento criado está estritamente vinculado ao UID do usuário autenticado'
  );
  assert(
    Array.isArray(atendA1.trilhaAuditoria) &&
      atendA1.trilhaAuditoria.length > 0 &&
      atendA1.trilhaAuditoria[0].usuarioId === uidA,
    'FIRE-001.3',
    'Log inicial de auditoria registra o UID do usuário criador'
  );

  // =========================================================================
  // TESTE FIRE-002: Usuário recupera somente seus documentos
  // =========================================================================
  // Usuário A cria um segundo atendimento
  const atendA2 = AtendimentoService.criarAtendimento({
    usuarioId: uidA,
    identificacao: 'R.M.P.',
    idade: '33',
    sexo: 'Feminino',
    setor: 'Clínica Médica',
    leito: '102',
    tipoRegistro: 'Evolução SOAP',
    status: 'rascunho',
    usuarioResponsavel: mockUserA.nome,
    perfilProfissional: mockUserA.profissao,
    registroProfissional: mockUserA.registroProfissional,
    categoriaClinica: 'Clínica Médica',
  });

  // Usuário B cria um atendimento próprio
  const atendB1 = AtendimentoService.criarAtendimento({
    usuarioId: uidB,
    identificacao: 'T.L.S.',
    idade: '72',
    sexo: 'Feminino',
    setor: 'Emergência',
    leito: 'S01',
    tipoRegistro: 'Anotação Técnica',
    status: 'rascunho',
    usuarioResponsavel: mockUserB.nome,
    perfilProfissional: mockUserB.profissao,
    registroProfissional: mockUserB.registroProfissional,
    categoriaClinica: 'Urgência e Emergência',
  });

  const listaUsuarioA = AtendimentoService.listarAtendimentos(uidA);
  const listaUsuarioB = AtendimentoService.listarAtendimentos(uidB);

  const idsListaA = listaUsuarioA.map((a) => a.id);
  const idsListaB = listaUsuarioB.map((a) => a.id);

  assert(
    idsListaA.includes(atendA1.id) && idsListaA.includes(atendA2.id),
    'FIRE-002.1',
    'Usuário A recupera com sucesso todos os seus próprios documentos'
  );
  assert(
    !idsListaA.includes(atendB1.id),
    'FIRE-002.2',
    'Documento do Usuário B NÃO é retornado na listagem do Usuário A'
  );
  assert(
    idsListaB.includes(atendB1.id) && !idsListaB.includes(atendA1.id) && !idsListaB.includes(atendA2.id),
    'FIRE-002.3',
    'Usuário B recupera exclusivamente seus documentos com isolamento completo'
  );

  // =========================================================================
  // TESTE FIRE-003: Usuário A não acessa, edita ou exporta atendimento de Usuário B
  // =========================================================================
  // 1. Bloqueio de visualização
  const buscaCruzada = AtendimentoService.buscarPorId(atendB1.id, uidA);
  assert(
    buscaCruzada === undefined,
    'FIRE-003.1',
    'Isolamento de leitura: Usuário A não consegue visualizar atendimento de Usuário B'
  );

  // 2. Bloqueio de edição
  let erroEdicaoDisparado = false;
  try {
    AtendimentoService.salvarAtendimento({
      atendimentoId: atendB1.id,
      usuarioId: uidA, // Usuário A tenta editar documento de B
      usuarioResponsavel: mockUserA.nome,
      perfilProfissional: mockUserA.profissao,
      textoFinalGerado: 'Texto invasivo não autorizado.',
      setor: 'Emergência',
      leito: 'S01',
      identificacao: 'T.L.S.',
      tipoRegistro: 'Anotação Técnica',
    });
  } catch (err) {
    erroEdicaoDisparado = true;
  }
  assert(
    erroEdicaoDisparado,
    'FIRE-003.2',
    'Isolamento de escrita: Usuário A é estritamente impedido de alterar atendimento de Usuário B'
  );

  // 3. Bloqueio de exportação direta
  const exportacaoCruzada = AtendimentoService.registrarExportacao(
    atendB1.id,
    mockUserA.nome,
    'PDF',
    uidA // Usuário A tentando exportar documento de B
  );
  assert(
    exportacaoCruzada === null,
    'FIRE-003.3',
    'Isolamento de exportação: AtendimentoService.registrarExportacao bloqueia exportação de outro usuário'
  );

  // 4. Bloqueio no DocumentExportService
  let bloqueioExportService = false;
  try {
    DocumentExportService.gerarModeloProfissional(atendB1, undefined, mockUserA);
  } catch {
    bloqueioExportService = true;
  }
  assert(
    bloqueioExportService,
    'FIRE-003.4',
    'DocumentExportService impede que Usuário A gere modelo ou exporte atendimento de Usuário B'
  );

  // =========================================================================
  // TESTE FIRE-004: Auditoria continua preservada na nova arquitetura
  // =========================================================================
  const paramsConclusao: SalvarAtendimentoParams = {
    atendimentoId: atendA1.id,
    usuarioId: uidA,
    usuarioResponsavel: mockUserA.nome,
    perfilProfissional: mockUserA.profissao,
    registroProfissional: mockUserA.registroProfissional,
    textoFinalGerado: 'Evolução clínica auditada com parâmetros vitais estáveis.',
    setor: 'UTI Cardiológica',
    leito: '04',
    identificacao: 'G.H.K.',
    tipoRegistro: 'Evolução de Enfermagem',
  };

  const concluidoA1 = AtendimentoService.salvarAtendimento(paramsConclusao);

  assert(
    concluidoA1.status === 'concluido',
    'FIRE-004.1',
    'Atendimento concluído atualiza status para concluido'
  );
  assert(
    Boolean(concluidoA1.dataConclusao),
    'FIRE-004.2',
    'Timestamp de conclusão é registrado com fidelidade'
  );
  assert(
    concluidoA1.trilhaAuditoria.some((ev) => ev.tipo === 'conclusao' && ev.usuarioId === uidA),
    'FIRE-004.3',
    'Trilha de auditoria preserva evento de conclusão vinculado ao UID'
  );

  // Retificação / Nova Versão
  const retificadoA1 = AtendimentoService.salvarAtendimento({
    ...paramsConclusao,
    textoFinalGerado: 'Evolução clínica auditada e aditada: paciente sem queixas álgicas.',
    motivoAlteracao: 'Aditamento de ausência de dor',
  });

  assert(
    retificadoA1.versaoAtual === 2,
    'FIRE-004.4',
    'Proteção contra alteração silenciosa incrementa versão para 2'
  );
  assert(
    retificadoA1.historicoVersoes.length === 1 &&
      retificadoA1.historicoVersoes[0].versao === 1,
    'FIRE-004.5',
    'Versão anterior 1 permanece arquivada e auditável no histórico'
  );

  // =========================================================================
  // TESTE FIRE-005: Fallback local continua funcionando perfeitamente
  // =========================================================================
  // Verifica se o armazenamento local persiste e recupera dados mesmo sem dependência externa
  const uidOffline = `usr-offline-${now}`;
  const atendOffline = AtendimentoService.criarAtendimento({
    usuarioId: uidOffline,
    identificacao: 'OFF.1',
    idade: '40',
    sexo: 'Feminino',
    setor: 'Ambulatório',
    leito: '01',
    tipoRegistro: 'Anotação Técnica',
    status: 'rascunho',
    usuarioResponsavel: 'Enf. Offline',
  });

  const recuperadoOffline = AtendimentoService.buscarPorId(atendOffline.id, uidOffline);
  const listaOffline = AtendimentoService.listarAtendimentos(uidOffline);

  assert(
    Boolean(recuperadoOffline && recuperadoOffline.id === atendOffline.id),
    'FIRE-005.1',
    'Fallback local: atendimento é persistido e recuperado via storage local'
  );
  assert(
    listaOffline.length === 1 && listaOffline[0].identificacao === 'OFF.1',
    'FIRE-005.2',
    'Fallback local: listagem local retorna exatamente o registro criado'
  );

  console.log(`\n--- RESUMO TESTES FIREBASE PRODUCTION: ${passed} PASSOU, ${errors.length} FALHAS ---`);
  return { passed, failed: errors.length, errors };
}
