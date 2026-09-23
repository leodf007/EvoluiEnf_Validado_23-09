import { ModelService, MODELOS_PADRAO } from './modelService';
import { CategoriaModelo } from '../types/models';

export function runModelServiceTests() {
  const results: Array<{ id: string; name: string; passed: boolean; message?: string }> = [];

  // TEST 1: Todas as 5 categorias iniciais obrigatórias possuem modelos disponíveis
  try {
    const categoriasObrigatorias: CategoriaModelo[] = [
      'UTI',
      'Clínica Médica',
      'Feridas',
      'Cirúrgico',
      'Pediatria',
    ];

    const todasPresentes = categoriasObrigatorias.every((cat) => {
      const modelosDaCategoria = ModelService.listarModelos(cat);
      return modelosDaCategoria.length > 0;
    });

    if (todasPresentes) {
      results.push({
        id: 'MOD-CAT-001',
        name: 'Presença das 5 categorias iniciais obrigatórias',
        passed: true,
      });
    } else {
      results.push({
        id: 'MOD-CAT-001',
        name: 'Presença das 5 categorias iniciais obrigatórias',
        passed: false,
        message: 'Uma ou mais categorias obrigatórias não possuem modelos ativos',
      });
    }
  } catch (e: any) {
    results.push({
      id: 'MOD-CAT-001',
      name: 'Presença das 5 categorias iniciais obrigatórias',
      passed: false,
      message: e.message,
    });
  }

  // TEST 2: Presença dos campos de versionamento e governança em todos os modelos
  try {
    const todosComVersionamento = MODELOS_PADRAO.every((m) => {
      return (
        typeof m.versaoModelo === 'string' &&
        m.versaoModelo.trim().length > 0 &&
        typeof m.criadoPor === 'string' &&
        m.criadoPor.trim().length > 0 &&
        typeof m.dataCriacao === 'string' &&
        !isNaN(Date.parse(m.dataCriacao)) &&
        typeof m.dataAtualizacao === 'string' &&
        !isNaN(Date.parse(m.dataAtualizacao))
      );
    });

    if (todosComVersionamento) {
      results.push({
        id: 'MOD-VER-001',
        name: 'Campos de versionamento e governança (versaoModelo, criadoPor, datas)',
        passed: true,
      });
    } else {
      results.push({
        id: 'MOD-VER-001',
        name: 'Campos de versionamento e governança (versaoModelo, criadoPor, datas)',
        passed: false,
        message: 'Existem modelos com dados de versionamento incompletos ou inválidos',
      });
    }
  } catch (e: any) {
    results.push({
      id: 'MOD-VER-001',
      name: 'Campos de versionamento e governança',
      passed: false,
      message: e.message,
    });
  }

  // TEST 3: Segurança Clínica Estrita: Não criar diagnóstico médico nem prescrição farmacológica
  try {
    const termosProibidos = [
      'diagnóstico médico',
      'diagnostico medico',
      'prescrição médica',
      'prescricao medica',
      'receita médica',
      'receitar',
      'posologia médica',
      'cid-10',
      'cid10',
      'conduta médica',
    ];

    let violacaoEncontrada: string | null = null;

    for (const mod of MODELOS_PADRAO) {
      const textoCompleto = (
        mod.titulo +
        ' ' +
        mod.descricao +
        ' ' +
        mod.focoClinico +
        ' ' +
        mod.cuidadosPrincipais.join(' ') +
        ' ' +
        mod.camposNecessarios.map((c) => c.rotulo + ' ' + c.dica).join(' ')
      ).toLowerCase();

      for (const termo of termosProibidos) {
        if (textoCompleto.includes(termo)) {
          violacaoEncontrada = `Modelo ${mod.id} contém termo restrito: "${termo}"`;
          break;
        }
      }
      if (violacaoEncontrada) break;
    }

    if (!violacaoEncontrada) {
      results.push({
        id: 'MOD-SEC-001',
        name: 'Segurança clínica: sem diagnósticos médicos ou prescrições médicas',
        passed: true,
      });
    } else {
      results.push({
        id: 'MOD-SEC-001',
        name: 'Segurança clínica: sem diagnósticos médicos ou prescrições médicas',
        passed: false,
        message: violacaoEncontrada,
      });
    }
  } catch (e: any) {
    results.push({
      id: 'MOD-SEC-001',
      name: 'Segurança clínica',
      passed: false,
      message: e.message,
    });
  }

  // TEST 4: Verificação de acesso SaaS (gratuito vs premium)
  try {
    const modeloGratuito = MODELOS_PADRAO.find((m) => m.nivelAcesso === 'gratuito')!;
    const modeloPremium = MODELOS_PADRAO.find((m) => m.nivelAcesso === 'premium')!;

    const acessoGratuitoComFree = ModelService.podeAcessarModelo(modeloGratuito, 'Gratuito');
    const acessoPremiumComFree = ModelService.podeAcessarModelo(modeloPremium, 'Gratuito');
    const acessoPremiumComPro = ModelService.podeAcessarModelo(modeloPremium, 'Pro');
    const acessoPremiumComPremium = ModelService.podeAcessarModelo(modeloPremium, 'Premium');

    if (
      acessoGratuitoComFree === true &&
      acessoPremiumComFree === false &&
      acessoPremiumComPro === true &&
      acessoPremiumComPremium === true
    ) {
      results.push({
        id: 'MOD-SUB-001',
        name: 'Controle de nível de acesso por plano de assinatura (Gratuito vs Premium)',
        passed: true,
      });
    } else {
      results.push({
        id: 'MOD-SUB-001',
        name: 'Controle de nível de acesso por plano de assinatura',
        passed: false,
        message: `Inconsistência nos níveis: free->gratuito:${acessoGratuitoComFree}, free->premium:${acessoPremiumComFree}, pro->premium:${acessoPremiumComPro}`,
      });
    }
  } catch (e: any) {
    results.push({
      id: 'MOD-SUB-001',
      name: 'Controle de nível de acesso por plano de assinatura',
      passed: false,
      message: e.message,
    });
  }

  // TEST 5: Operações de Favoritos (adicionar, verificar, listar e remover)
  try {
    const testUserId = 'test-nurse-user-999';
    const testModelId = 'mod-uti-vm-01';

    // Limpa estado anterior se houver
    ModelService.removerFavorito(testUserId, testModelId);

    const isFavBefore = ModelService.isFavorito(testUserId, testModelId);
    ModelService.adicionarFavorito(testUserId, testModelId, 'Meu Protocolo UTI');
    const isFavAfter = ModelService.isFavorito(testUserId, testModelId);
    const lista = ModelService.listarFavoritos(testUserId);
    const encontrado = lista.find((f) => f.modeloId === testModelId);

    ModelService.removerFavorito(testUserId, testModelId);
    const isFavFinal = ModelService.isFavorito(testUserId, testModelId);

    if (
      !isFavBefore &&
      isFavAfter &&
      encontrado &&
      encontrado.nomePersonalizado === 'Meu Protocolo UTI' &&
      !isFavFinal
    ) {
      results.push({
        id: 'MOD-FAV-001',
        name: 'Gestão de modelos favoritos (adicionar, listar, renomear e remover)',
        passed: true,
      });
    } else {
      results.push({
        id: 'MOD-FAV-001',
        name: 'Gestão de modelos favoritos',
        passed: false,
        message: 'Falha no ciclo de vida de modelos favoritos',
      });
    }
  } catch (e: any) {
    results.push({
      id: 'MOD-FAV-001',
      name: 'Gestão de modelos favoritos',
      passed: false,
      message: e.message,
    });
  }

  const passed = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}
