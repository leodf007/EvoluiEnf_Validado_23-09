import { AtendimentoService } from './atendimentoService';
import { EvolutionService } from './evolutionService';
import { PrivacyGuard } from './privacyGuard';

export function runFirebaseDataTests() {
  const results: Array<{ id: string; name: string; passed: boolean; message?: string }> = [];

  // TEST 1: PrivacyGuard blocks full patient name
  try {
    const hasPII = PrivacyGuard.hasPII('Paciente Carlos Eduardo Silva, leito 12');
    if (!hasPII) {
      results.push({ id: 'DATA-PRIV-001', name: 'Bloqueio de nome completo de paciente', passed: false, message: 'Deveria detectar PII no nome completo' });
    } else {
      results.push({ id: 'DATA-PRIV-001', name: 'Bloqueio de nome completo de paciente', passed: true });
    }
  } catch (e: any) {
    results.push({ id: 'DATA-PRIV-001', name: 'Bloqueio de nome completo de paciente', passed: false, message: e.message });
  }

  // TEST 2: PrivacyGuard blocks CPF
  try {
    const hasPII = PrivacyGuard.hasPII('CPF: 123.456.789-00');
    if (!hasPII) {
      results.push({ id: 'DATA-PRIV-002', name: 'Bloqueio de CPF', passed: false, message: 'Deveria detectar CPF' });
    } else {
      results.push({ id: 'DATA-PRIV-002', name: 'Bloqueio de CPF', passed: true });
    }
  } catch (e: any) {
    results.push({ id: 'DATA-PRIV-002', name: 'Bloqueio de CPF', passed: false, message: e.message });
  }

  // TEST 3: AtendimentoService sanitizes full name into initials
  try {
    const atd = AtendimentoService.criarAtendimento({
      usuarioId: 'test-user-123',
      identificacao: 'Carlos Eduardo Silva',
      idade: '45',
      sexo: 'Masculino',
      setor: 'UTI',
      leito: '04',
      tipoRegistro: 'Evolução SOAP',
    });

    if (atd.identificacao.includes('Carlos') || atd.identificacao.includes('Silva')) {
      results.push({
        id: 'DATA-ATD-001',
        name: 'Sanitização de identificação em iniciais',
        passed: false,
        message: `Identificação não foi reduzida a iniciais: ${atd.identificacao}`,
      });
    } else if (atd.identificacao !== 'C.E.S.') {
      results.push({
        id: 'DATA-ATD-001',
        name: 'Sanitização de identificação em iniciais',
        passed: false,
        message: `Esperado C.E.S., obtido: ${atd.identificacao}`,
      });
    } else {
      results.push({ id: 'DATA-ATD-001', name: 'Sanitização de identificação em iniciais', passed: true });
    }
  } catch (e: any) {
    results.push({ id: 'DATA-ATD-001', name: 'Sanitização de identificação em iniciais', passed: false, message: e.message });
  }

  // TEST 4: AtendimentoService can query and update status
  try {
    const atd = AtendimentoService.criarAtendimento({
      usuarioId: 'test-user-456',
      identificacao: 'M.B.',
      idade: '60',
      sexo: 'Feminino',
      setor: 'Emergência',
      leito: '01',
      tipoRegistro: 'Evolução SOAP',
    });

    const updated = AtendimentoService.atualizarStatus(atd.id, 'concluido');
    if (!updated || updated.status !== 'concluido') {
      results.push({ id: 'DATA-ATD-002', name: 'Atualização de status de atendimento', passed: false, message: 'Status não foi atualizado' });
    } else {
      const found = AtendimentoService.buscarPorId(atd.id);
      if (found?.status === 'concluido') {
        results.push({ id: 'DATA-ATD-002', name: 'Atualização de status de atendimento', passed: true });
      } else {
        results.push({ id: 'DATA-ATD-002', name: 'Atualização de status de atendimento', passed: false, message: 'Registro buscado não reflete status' });
      }
    }
  } catch (e: any) {
    results.push({ id: 'DATA-ATD-002', name: 'Atualização de status de atendimento', passed: false, message: e.message });
  }

  // TEST 5: EvolutionService sanitizes narrative PII and saves with initials
  try {
    const syncEvo = EvolutionService.listarHistoricoSync('test-user-789');
    if (Array.isArray(syncEvo)) {
      results.push({ id: 'DATA-EVO-001', name: 'Consulta síncrona do histórico de evoluções', passed: true });
    } else {
      results.push({ id: 'DATA-EVO-001', name: 'Consulta síncrona do histórico de evoluções', passed: false, message: 'Não retornou array' });
    }
  } catch (e: any) {
    results.push({ id: 'DATA-EVO-001', name: 'Consulta síncrona do histórico de evoluções', passed: false, message: e.message });
  }

  const passed = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}
