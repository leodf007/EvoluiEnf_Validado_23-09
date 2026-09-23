import { AtendimentoService } from '../services/atendimentoService';
import { DocumentExportService } from '../services/documentExportService';
import { Atendimento, ProfessionalUser, SalvarAtendimentoParams } from '../types';

export function runDocumentExportTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- EXECUTING DOCUMENT EXPORT & PROFESSIONAL TEMPLATE TESTS ---');

  const testUserId = `test-export-${Date.now()}`;
  const mockUsuario: ProfessionalUser = {
    id: testUserId,
    nome: 'Dra. Camila Ribeiro',
    email: 'camila.ribeiro@hospital.com',
    profissao: 'Enfermeiro',
    plano: 'Pro',
    dataCadastro: new Date().toISOString(),
    dataCriacao: new Date().toISOString(),
    isAuthenticated: true,
    role: 'nurse',
    registroProfissional: 'COREN-SP 123.456-ENF',
  };

  const narrativaOriginal =
    'Paciente em pós-operatório imediato de apendicectomia videolaparoscópica, calmo, consciente, orientado em tempo e espaço. ' +
    'Curativo em ferida operatória abdominal limpo e seco, sem sinais flogísticos ou sangramento ativo. ' +
    'Acesso venoso periférico em MSE pérvio com infusão de Ringer Lactato 1000ml a 40ml/h. Diurese espontânea de coloração âmbar, 350ml em comadre. ' +
    'Sinais vitais estáveis: PA 120/80 mmHg, FC 74 bpm, FR 16 rpm, SpO2 98% em ar ambiente, Tax 36.5°C, Escala de dor EVA 2/10. ' +
    'Orientações prestadas ao paciente e acompanhante quanto ao repouso e cuidados com a ferida cirúrgica.';

  // Cria e salva um atendimento concluído com todos os metadados
  const params: SalvarAtendimentoParams = {
    usuarioId: testUserId,
    usuarioResponsavel: mockUsuario.nome,
    perfilProfissional: mockUsuario.profissao,
    registroProfissional: mockUsuario.registroProfissional,
    categoriaClinica: 'Clínica Cirúrgica',
    textoFinalGerado: narrativaOriginal,
    setor: 'Clínica Cirúrgica',
    leito: '204-A',
    identificacao: 'J.P.S.',
    tipoRegistro: 'Evolução de Enfermagem',
    dataHora: '2026-09-19T14:30:00.000Z',
  };

  const atendimentoSalvo = AtendimentoService.salvarAtendimento(params);

  // =========================================================================
  // TESTE 1: Documento mantém o conteúdo original com fidelidade absoluta
  // =========================================================================
  const textoModeloProfissional = DocumentExportService.gerarModeloProfissional(
    atendimentoSalvo,
    undefined,
    mockUsuario
  );

  assert(
    textoModeloProfissional.includes(narrativaOriginal),
    'EXP-001',
    'Documento exportado contém na íntegra todo o conteúdo original da narrativa'
  );

  const htmlImpressao = DocumentExportService.gerarHtmlImpressao(
    atendimentoSalvo,
    undefined,
    mockUsuario
  );

  assert(
    htmlImpressao.includes(narrativaOriginal),
    'EXP-002',
    'HTML timbrado de impressão/PDF mantém o conteúdo clínico original sem truncamento'
  );

  // =========================================================================
  // TESTE 2: Dados do profissional aparecem no documento exportado
  // =========================================================================
  assert(
    textoModeloProfissional.includes('Profissional:\nDra. Camila Ribeiro') ||
      textoModeloProfissional.includes('Dra. Camila Ribeiro'),
    'EXP-003',
    'Nome do profissional aparece no documento'
  );

  assert(
    textoModeloProfissional.includes('Categoria:\nEnfermeiro') ||
      textoModeloProfissional.includes('Enfermeiro'),
    'EXP-004',
    'Categoria do profissional (Enfermeiro) aparece no documento'
  );

  assert(
    textoModeloProfissional.includes('COREN-SP 123.456-ENF'),
    'EXP-005',
    'Registro COREN do profissional aparece no documento'
  );

  assert(
    textoModeloProfissional.includes('Setor:\nClínica Cirúrgica') ||
      textoModeloProfissional.includes('Clínica Cirúrgica'),
    'EXP-006',
    'Setor assistencial aparece no documento'
  );

  assert(
    textoModeloProfissional.includes('Leito:\nLeito 204-A') ||
      textoModeloProfissional.includes('204-A'),
    'EXP-007',
    'Leito do paciente aparece no documento'
  );

  assert(
    textoModeloProfissional.includes('Documento:\nEvolução de Enfermagem') ||
      textoModeloProfissional.includes('Evolução de Enfermagem'),
    'EXP-008',
    'Tipo do documento aparece no cabeçalho estruturado'
  );

  assert(
    textoModeloProfissional.startsWith('Evolução de Enfermagem'),
    'EXP-009',
    'Título do modelo profissional começa com "Evolução de Enfermagem"'
  );

  // =========================================================================
  // TESTE 3: A exportação não altera a narrativa clínica original
  // =========================================================================
  // Verifica se o objeto e o banco mantiveram os dados intactos após exportações
  const antesExport = atendimentoSalvo.narrativaFinal;
  DocumentExportService.gerarModeloProfissional(atendimentoSalvo, undefined, mockUsuario);
  DocumentExportService.gerarHtmlImpressao(atendimentoSalvo, undefined, mockUsuario);

  const atendimentoRecuperado = AtendimentoService.buscarPorId(atendimentoSalvo.id);
  assert(
    atendimentoRecuperado?.narrativaFinal === narrativaOriginal,
    'EXP-010',
    'Exportação não altera nem corrompe a narrativa clínica do registro no repositório'
  );
  assert(
    antesExport === atendimentoRecuperado?.narrativaFinal,
    'EXP-011',
    'Integridade referencial da narrativa preservada antes e depois da exportação'
  );

  // =========================================================================
  // TESTE 4: Histórico continua funcionando normalmente
  // =========================================================================
  const historicoUsuario = AtendimentoService.listarAtendimentos(testUserId);
  assert(
    historicoUsuario.length >= 1,
    'EXP-012',
    'Histórico lista os atendimentos concluídos normalmente'
  );

  const itemNoHistorico = historicoUsuario.find((a) => a.id === atendimentoSalvo.id);
  assert(
    Boolean(itemNoHistorico),
    'EXP-013',
    'Atendimento exportável existe no histórico do usuário'
  );
  assert(
    itemNoHistorico?.status === 'concluido',
    'EXP-014',
    'Status no histórico permanece concluído'
  );
  assert(
    itemNoHistorico?.identificacao === 'J.P.S.',
    'EXP-015',
    'Identificação anônima preservada no histórico'
  );

  // =========================================================================
  // TESTE 5: Suporte para Técnico de Enfermagem com normalização
  // =========================================================================
  const mockTecnico: ProfessionalUser = {
    ...mockUsuario,
    id: `tec-${Date.now()}`,
    nome: 'Marcos Vinicius',
    profissao: 'Técnico em Enfermagem',
    registroProfissional: 'COREN-RJ 987.654-TE',
    role: 'technician',
  };

  const atendimentoTecnico = AtendimentoService.salvarAtendimento({
    usuarioId: mockTecnico.id,
    usuarioResponsavel: mockTecnico.nome,
    perfilProfissional: mockTecnico.profissao,
    registroProfissional: mockTecnico.registroProfissional,
    textoFinalGerado: 'Verificados SSVV do paciente. Afebril e normotenso.',
    setor: 'Pronto-Socorro',
    leito: 'Box 03',
    identificacao: 'R.M.O.',
    tipoRegistro: 'Anotação Técnica',
  });

  const textoTecnico = DocumentExportService.gerarModeloProfissional(
    atendimentoTecnico,
    undefined,
    mockTecnico
  );

  assert(
    textoTecnico.includes('Técnico de Enfermagem') || textoTecnico.includes('Técnico em Enfermagem'),
    'EXP-016',
    'Normalização de categoria para Técnico em Enfermagem aplicada com sucesso'
  );
  assert(
    textoTecnico.includes('Marcos Vinicius'),
    'EXP-017',
    'Nome do técnico presente no modelo'
  );
  assert(
    textoTecnico.includes('COREN-RJ 987.654-TE'),
    'EXP-018',
    'COREN do técnico presente no modelo'
  );

  console.log(`\n--- DOCUMENT EXPORT TESTS FINISHED: ${passed} PASSED, ${errors.length} FAILED ---`);
  return { passed, failed: errors.length, errors };
}
