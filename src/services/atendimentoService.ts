import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Atendimento,
  TipoRegistroAtendimento,
  SalvarAtendimentoParams,
  AuditoriaEvento,
  VersaoAtendimento,
  StatusAtendimento,
  StatusSincronizacao,
  SincronizacaoMetadados,
  SyncQueueItem,
} from '../types';
import { PrivacyGuard } from './privacyGuard';
import { SyncQueueService } from './syncQueueService';
import { ErrorHandlerService } from './errorHandlerService';
import { QuotaService, QuotaServiceError } from './quotaService';

const STORAGE_KEY = 'evoluienf_atendimentos';
const ATENDIMENTOS_COLLECTION = 'atendimentos';

/**
 * Helpers para a arquitetura multiusuário SaaS (ETAPA 4 e 5):
 * Estrutura canônica: users/{uid}/atendimentos/{atendimentoId}
 */
const getUserAtendimentosCollection = (uid: string) =>
  collection(db, 'users', uid, 'atendimentos');

const getUserAtendimentoDoc = (uid: string, atendimentoId: string) =>
  doc(db, 'users', uid, 'atendimentos', atendimentoId);

/**
 * Registros de exemplo para inicialização se o armazenamento estiver vazio.
 * Estritamente anônimos, sem dados de pacientes reais (apenas iniciais e leitos).
 */
const SEED_ATENDIMENTOS: Atendimento[] = [
  {
    id: 'atend-seed-1',
    usuarioId: 'usr-default-ana',
    identificacao: 'L.L.S.',
    idade: '67',
    sexo: 'Feminino',
    setor: 'UTI',
    leito: '05',
    tipoRegistro: 'Evolução SOAP',
    dataCriacao: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'concluido',
    resumoRegistro: 'Consulta de enfermagem SOAP realizada. Sinais estáveis, sem queixas álgicas agudas.',
    narrativaFinal: 'SUBJETIVO: Paciente L.L.S. refere repouso tranquilo no leito, nega dores...\nOBJETIVO: Consciente e orientada, eupneica...\nAVALIAÇÃO: Estabilidade clínica mantida...\nPLANO: Manter monitorização contínua e decúbito elevado.',
    sincronizacao: {
      status: 'sincronizado',
      sincronizado: true,
      pendente: false,
      ultimaSincronizacao: new Date(Date.now() - 3600000 * 2).toISOString(),
      versaoLocal: 1,
      versaoRemota: 1,
      tentativas: 0,
    },
  },
  {
    id: 'atend-seed-2',
    usuarioId: 'usr-default-ana',
    identificacao: 'M.R.C.',
    idade: '54',
    sexo: 'Masculino',
    setor: 'Emergência',
    leito: '02',
    tipoRegistro: 'Evolução SOAP',
    dataCriacao: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'concluido',
    resumoRegistro: 'Atendimento inicial em sala de observação. Estável hemodinamicamente.',
    narrativaFinal: 'SUBJETIVO: Paciente M.R.C. refere melhora progressiva...\nOBJETIVO: PA 130/80 mmHg, FC 78 bpm, afebril...\nAVALIAÇÃO: Padrão respiratório preservado...\nPLANO: Aguarda reavaliação médica e exames.',
    sincronizacao: {
      status: 'sincronizado',
      sincronizado: true,
      pendente: false,
      ultimaSincronizacao: new Date(Date.now() - 3600000 * 5).toISOString(),
      versaoLocal: 1,
      versaoRemota: 1,
      tentativas: 0,
    },
  },
  {
    id: 'atend-seed-3',
    usuarioId: 'usr-default-ana',
    identificacao: 'A.P.F.',
    idade: '42',
    sexo: 'Feminino',
    setor: 'Clínica Médica',
    leito: '14B',
    tipoRegistro: 'Evolução de Enfermagem',
    dataCriacao: new Date(Date.now() - 86400000).toISOString(),
    status: 'concluido',
    resumoRegistro: 'Evolução de rotina diária no leito 14B.',
    sincronizacao: {
      status: 'sincronizado',
      sincronizado: true,
      pendente: false,
      ultimaSincronizacao: new Date(Date.now() - 86400000).toISOString(),
      versaoLocal: 1,
      versaoRemota: 1,
      tentativas: 0,
    },
  },
];

let inMemoryAtendimentos: Atendimento[] = [...SEED_ATENDIMENTOS];

/**
 * Lê atendimentos salvos no storage local (ou seed inicial).
 */
function readStorage(): Atendimento[] {
  if (typeof localStorage === 'undefined') {
    return inMemoryAtendimentos;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ATENDIMENTOS));
      return SEED_ATENDIMENTOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_ATENDIMENTOS;
  } catch {
    return inMemoryAtendimentos;
  }
}

/**
 * Salva a lista atualizada no storage local.
 */
function writeStorage(items: Atendimento[]): void {
  inMemoryAtendimentos = items;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignora restrições locais
  }
}

/**
 * Deduplica eventos na trilha de auditoria para assegurar integridade sem repetições espúrias.
 */
function deduplicarTrilhaAuditoria(trilha: AuditoriaEvento[]): AuditoriaEvento[] {
  const vistos = new Set<string>();
  const resultado: AuditoriaEvento[] = [];

  for (const ev of trilha) {
    const chave = ev.id || `${ev.tipo}_${ev.dataHora}_${ev.usuarioId || ''}_${ev.descricao}`;
    if (!vistos.has(chave)) {
      vistos.add(chave);
      resultado.push(ev);
    }
  }

  return resultado;
}

/**
 * Sanitiza objetos recursivamente para o Firestore, removendo valores undefined
 * que são rejeitados pelo SDK.
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

export const AtendimentoService = {
  /**
   * Retorna todos os atendimentos cadastrados para o usuário atual,
   * garantindo isolamento estrito de dados multiusuário.
   */
  listarAtendimentos(usuarioId?: string): Atendimento[] {
    const todos = readStorage();
    let filtrados: Atendimento[];

    if (!usuarioId) {
      filtrados = todos;
    } else if (usuarioId === 'usr-default-ana' || usuarioId === 'usr-prof-ana') {
      // Usuário default de demonstração/mock em tela de pré-visualização
      filtrados = todos.filter(
        (a) =>
          a.usuarioId === usuarioId ||
          a.usuarioId === 'usr-default-ana' ||
          a.usuarioId === 'usr-prof-ana'
      );
    } else {
      // Isolamento multiusuário estrito: apenas os atendimentos criados pelo próprio UID
      filtrados = todos.filter((a) => a.usuarioId === usuarioId);
    }

    return filtrados.sort(
      (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
    );
  },

  /**
   * Versão assíncrona que consulta a subcoleção users/{uid}/atendimentos no Firestore.
   * Se o Firebase estiver indisponível ou offline, realiza fallback transparente para o storage local.
   * Aplica resolução segura de conflitos se versões remotas e locais divergirem.
   */
  async listarAtendimentosAsync(usuarioId: string): Promise<Atendimento[]> {
    if (!usuarioId) {
      return [];
    }

    try {
      const q = query(
        getUserAtendimentosCollection(usuarioId),
        orderBy('dataCriacao', 'desc')
      );
      const snap = await getDocs(q);
      const remotos: Atendimento[] = [];
      snap.forEach((d) => {
        const item = d.data() as Atendimento;
        // Garantia de isolamento adicional
        if (item.usuarioId === usuarioId) {
          remotos.push(item);
        }
      });

      if (remotos.length > 0) {
        // Sincroniza e mescla com locais preservando itens locais e resolvendo conflitos
        const locais = readStorage();
        const mapa = new Map<string, Atendimento>();

        for (const remoto of remotos) {
          const local = locais.find((l) => l.id === remoto.id);
          if (local) {
            // Verifica se há conflito não resolvido entre local e remoto
            const narrativaDiferente =
              Boolean(local.narrativaFinal && remoto.narrativaFinal) &&
              local.narrativaFinal?.trim() !== remoto.narrativaFinal?.trim();
            const versaoDiferente = (local.versaoAtual || 1) !== (remoto.versaoAtual || 1);

            if (narrativaDiferente && local.sincronizacao?.pendente) {
              // Conflito detectado: nunca sobrescrever silenciosamente
              const resolvido = this.resolverConflito(local, remoto);
              mapa.set(resolvido.id, resolvido);
            } else {
              // Remoto confirmado e sincronizado
              mapa.set(remoto.id, {
                ...remoto,
                sincronizacao: {
                  status: 'sincronizado',
                  sincronizado: true,
                  pendente: false,
                  ultimaSincronizacao: new Date().toISOString(),
                  versaoLocal: remoto.versaoAtual || 1,
                  versaoRemota: remoto.versaoAtual || 1,
                  tentativas: 0,
                },
              });
            }
          } else {
            mapa.set(remoto.id, {
              ...remoto,
              sincronizacao: {
                status: 'sincronizado',
                sincronizado: true,
                pendente: false,
                ultimaSincronizacao: new Date().toISOString(),
                versaoLocal: remoto.versaoAtual || 1,
                versaoRemota: remoto.versaoAtual || 1,
                tentativas: 0,
              },
            });
          }
        }

        // Itens locais pendentes não presentes no Firestore remoto
        locais.forEach((item) => {
          if (!mapa.has(item.id)) {
            mapa.set(item.id, item);
          }
        });

        const mesclados = Array.from(mapa.values()).sort(
          (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        );
        writeStorage(mesclados);
        return mesclados.filter((a) => a.usuarioId === usuarioId);
      }
    } catch (err) {
      console.warn(
        `Consulta ao Firestore (users/${usuarioId}/atendimentos) indisponível, utilizando fallback local:`,
        err
      );
    }

    // Fallback local garantido
    return this.listarAtendimentos(usuarioId);
  },

  /**
   * Busca um atendimento específico pelo seu ID.
   * Se usuarioId for informado, impede que um usuário acesse registros de outro (Isolamento de dados).
   */
  buscarPorId(id: string, usuarioId?: string): Atendimento | undefined {
    const todos = readStorage();
    const item = todos.find((a) => a.id === id);
    if (!item) return undefined;

    // ISOLAMENTO DE DADOS: Se usuarioId for especificado, bloqueia acesso a outros usuários
    if (usuarioId && item.usuarioId !== usuarioId) {
      return undefined;
    }

    return item;
  },

  /**
   * Alias assíncrono para buscar atendimento no Firestore subcoleção users/{uid}/atendimentos ou local.
   */
  async buscarAtendimento(id: string, usuarioId?: string): Promise<Atendimento | null> {
    if (usuarioId) {
      try {
        const docRef = getUserAtendimentoDoc(usuarioId, id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const dados = snap.data() as Atendimento;
          if (dados.usuarioId === usuarioId) {
            return dados;
          }
          return null; // Isolamento violado
        }
      } catch (err) {
        console.warn(`Consulta remota para atendimento ${id} no Firestore indisponível:`, err);
      }
    }

    return this.buscarPorId(id, usuarioId) || null;
  },

  /**
   * Cria um novo atendimento anônimo, higienizando a identificação via PrivacyGuard.
   * Inicializa a trilha de auditoria (AUD-001), versionamento e metadados de sincronização (HARD-PROD).
   * Operação idempotente: se já existir com o mesmo ID para o mesmo usuário, retorna o existente sem duplicar.
   */
  criarAtendimento(
    dados: Omit<Atendimento, 'id' | 'dataCriacao'> & { id?: string; dataCriacao?: string }
  ): Atendimento {
    const todos = readStorage();

    // OPERAÇÃO IDEMPOTENTE:
    // Se o atendimento com este ID já existe no armazenamento local:
    if (dados.id) {
      const jaExiste = todos.find((a) => a.id === dados.id);
      if (jaExiste) {
        if (jaExiste.usuarioId === dados.usuarioId) {
          return jaExiste;
        } else {
          throw new Error('Violação de isolamento multiusuário: Atendimento já cadastrado para outro profissional.');
        }
      }
    }

    // Aplica PrivacyGuard para garantir que a identificação seja segura (iniciais ou código)
    const sanitizedId =
      PrivacyGuard.validateAnonymousIdentifier(dados.identificacao).suggestedInitials ||
      dados.identificacao;

    const id = dados.id || `atend-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const dataCriacao = dados.dataCriacao || new Date().toISOString();
    const status: StatusAtendimento = (dados.status as StatusAtendimento) || 'rascunho';

    // Log de auditoria inicial (AUD-001)
    const logCriacao: AuditoriaEvento = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tipo: 'criacao',
      dataHora: dataCriacao,
      usuarioId: dados.usuarioId,
      usuarioNome: dados.usuarioResponsavel || 'Profissional de Enfermagem',
      perfilProfissional: dados.perfilProfissional,
      descricao: `Atendimento clínico iniciado para paciente anônimo ${sanitizedId.toUpperCase()} no setor ${dados.setor || 'Geral'}${dados.leito ? `, Leito ${dados.leito}` : ''}.`,
      metadados: {
        setor: dados.setor || 'Geral',
        leito: dados.leito || '',
        tipoRegistro: dados.tipoRegistro,
        versao: 1,
      },
    };

    const metadadosSync: SincronizacaoMetadados = {
      status: 'pendente',
      sincronizado: false,
      pendente: true,
      versaoLocal: 1,
      tentativas: 0,
    };

    const novoAtendimento: Atendimento = {
      id,
      usuarioId: dados.usuarioId,
      identificacao: sanitizedId.toUpperCase(),
      idade: dados.idade || '',
      sexo: dados.sexo || 'Não informado',
      setor: dados.setor || 'Geral',
      leito: dados.leito || '',
      tipoRegistro: dados.tipoRegistro,
      dataCriacao,
      ultimaAlteracao: dataCriacao,
      status,
      resumoRegistro: dados.resumoRegistro || '',
      narrativaFinal: dados.narrativaFinal || '',
      usuarioResponsavel: dados.usuarioResponsavel,
      perfilProfissional: dados.perfilProfissional,
      categoriaClinica: dados.categoriaClinica,
      registroProfissional: dados.registroProfissional,
      versaoAtual: 1,
      historicoVersoes: [],
      trilhaAuditoria: [logCriacao],
      sincronizacao: metadadosSync,
      quotaPermitId: dados.quotaPermitId,
      quotaPeriod: dados.quotaPeriod,
      quotaValidationStatus: dados.quotaPermitId ? 'authorized' : 'pending',
    };

    todos.unshift(novoAtendimento);
    writeStorage(todos);

    // Persistência assíncrona no Firestore (users/{uid}/atendimentos/{id})
    this.persistirNoFirestore(novoAtendimento).catch((err) => {
      console.warn('Falha na persistência remota do atendimento:', err);
    });

    return novoAtendimento;
  },

  /**
   * Salva e conclui um atendimento no histórico com persistência local e remota.
   * Gera timestamp de conclusão (AUD-002) e protege contra alteração silenciosa
   * criando nova versão e preservando histórico anterior (AUD-004).
   * Impede estritamente que um usuário edite registro de outro (Isolamento de dados).
   * Operação idempotente: salvamento repetido sem alterações não duplica versões nem auditoria.
   */
  salvarAtendimento(params: SalvarAtendimentoParams): Atendimento {
    const todos = readStorage();
    const agora = params.dataHora || new Date().toISOString();
    const id = params.atendimentoId || `atend-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const usuarioId = params.usuarioId || 'usr-prof-ana';

    const index = todos.findIndex((a) => a.id === id);
    let atendimentoSalvo: Atendimento;

    if (index !== -1) {
      const existente = todos[index];

      // ISOLAMENTO DE DADOS: Proteção contra edição de atendimento de outro usuário
      if (existente.usuarioId && existente.usuarioId !== usuarioId) {
        throw new Error(
          `Violação de isolamento multiusuário: Usuário ${usuarioId} não possui permissão para editar atendimento pertencente ao usuário ${existente.usuarioId}.`
        );
      }

      const jaConcluido = existente.status === 'concluido' || existente.status === 'exportado';
      const narrativaAlterada =
        Boolean(existente.narrativaFinal) &&
        existente.narrativaFinal?.trim() !== params.textoFinalGerado.trim();

      // OPERAÇÃO IDEMPOTENTE (HARD-PROD-001):
      // Se já está concluído com exatamente o mesmo texto, setor e leito, e sem nova justificativa de alteração:
      if (
        jaConcluido &&
        !narrativaAlterada &&
        (!params.motivoAlteracao || params.motivoAlteracao.trim() === '') &&
        (!params.setor || params.setor === existente.setor) &&
        (!params.leito || params.leito === existente.leito) &&
        (!params.marcarComoExportado || existente.status === 'exportado')
      ) {
        return existente;
      }

      const trilhaExistente: AuditoriaEvento[] = existente.trilhaAuditoria ? [...existente.trilhaAuditoria] : [];
      const historicoVersoes: VersaoAtendimento[] = existente.historicoVersoes ? [...existente.historicoVersoes] : [];
      let versaoAtual = existente.versaoAtual || 1;
      const dataConclusao = existente.dataConclusao || agora;

      // PROTEÇÃO CONTRA ALTERAÇÃO SILENCIOSA (AUD-004)
      if (jaConcluido && narrativaAlterada) {
        // Arquiva a versão anterior no histórico de versões
        const versaoAnteriorSnapshot: VersaoAtendimento = {
          versao: versaoAtual,
          dataHora: existente.ultimaAlteracao || existente.dataConclusao || existente.dataCriacao,
          usuarioResponsavel: existente.usuarioResponsavel,
          perfilProfissional: existente.perfilProfissional,
          registroProfissional: existente.registroProfissional,
          narrativa: existente.narrativaFinal || '',
          resumoRegistro: existente.resumoRegistro,
          motivoAlteracao: params.motivoAlteracao || 'Retificação / aditamento de documento clínico após conclusão',
        };
        historicoVersoes.push(versaoAnteriorSnapshot);

        versaoAtual += 1;

        // Log de auditoria da alteração de versão (AUD-004)
        trilhaExistente.push({
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tipo: 'edicao',
          dataHora: agora,
          usuarioId,
          usuarioNome: params.usuarioResponsavel || existente.usuarioResponsavel || 'Profissional de Enfermagem',
          perfilProfissional: params.perfilProfissional || existente.perfilProfissional,
          descricao: `Documento clínico retificado/aditado para Versão ${versaoAtual}. A versão ${versaoAnteriorSnapshot.versao} anterior foi arquivada no histórico de auditoria.`,
          metadados: {
            versaoAnterior: versaoAnteriorSnapshot.versao,
            novaVersao: versaoAtual,
            motivo: params.motivoAlteracao,
          },
        });
      } else if (!jaConcluido) {
        // Conclusão do atendimento pela primeira vez (AUD-002: Conclusão gera timestamp)
        trilhaExistente.push({
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tipo: 'conclusao',
          dataHora: agora,
          usuarioId,
          usuarioNome: params.usuarioResponsavel || existente.usuarioResponsavel || 'Profissional de Enfermagem',
          perfilProfissional: params.perfilProfissional || existente.perfilProfissional,
          descricao: `Evolução de enfermagem concluída e validada para prontuário na Versão ${versaoAtual}.`,
          metadados: {
            timestampConclusao: agora,
            versao: versaoAtual,
          },
        });
      }

      const novoStatus: StatusAtendimento = params.marcarComoExportado
        ? 'exportado'
        : 'concluido';

      const metaSync: SincronizacaoMetadados = {
        status: 'pendente',
        sincronizado: false,
        pendente: true,
        versaoLocal: versaoAtual,
        versaoRemota: existente.sincronizacao?.versaoRemota,
        tentativas: 0,
      };

      atendimentoSalvo = {
        ...existente,
        status: novoStatus,
        dataConclusao,
        ultimaAlteracao: agora,
        narrativaFinal: params.textoFinalGerado,
        resumoRegistro:
          params.resumoRegistro ||
          existente.resumoRegistro ||
          `Registro ${params.tipoRegistro || existente.tipoRegistro} finalizado para ${existente.identificacao}`,
        setor: params.setor || existente.setor,
        leito: params.leito || existente.leito,
        usuarioResponsavel: params.usuarioResponsavel || existente.usuarioResponsavel,
        perfilProfissional: params.perfilProfissional || existente.perfilProfissional,
        categoriaClinica: params.categoriaClinica || existente.categoriaClinica,
        registroProfissional: params.registroProfissional || existente.registroProfissional,
        tipoRegistro: params.tipoRegistro || existente.tipoRegistro,
        versaoAtual,
        historicoVersoes,
        trilhaAuditoria: deduplicarTrilhaAuditoria(trilhaExistente),
        sincronizacao: metaSync,
      };
      todos[index] = atendimentoSalvo;
    } else {
      const identificacaoSanitizada = params.identificacao
        ? PrivacyGuard.validateAnonymousIdentifier(params.identificacao).suggestedInitials || params.identificacao
        : 'PACIENTE ANÔNIMO';

      // Criação direta e conclusão no mesmo ato
      const logCriacao: AuditoriaEvento = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-cria`,
        tipo: 'criacao',
        dataHora: agora,
        usuarioId,
        usuarioNome: params.usuarioResponsavel || 'Profissional de Enfermagem',
        perfilProfissional: params.perfilProfissional,
        descricao: `Atendimento direto registrado para ${identificacaoSanitizada.toUpperCase()} no setor ${params.setor || 'Geral'}.`,
        metadados: {
          setor: params.setor || 'Geral',
          leito: params.leito || '',
        },
      };

      const logConclusao: AuditoriaEvento = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-conc`,
        tipo: 'conclusao',
        dataHora: agora,
        usuarioId,
        usuarioNome: params.usuarioResponsavel || 'Profissional de Enfermagem',
        perfilProfissional: params.perfilProfissional,
        descricao: `Evolução de enfermagem concluída e validada para prontuário.`,
        metadados: {
          timestampConclusao: agora,
          versao: 1,
        },
      };

      const statusInicial: StatusAtendimento = params.marcarComoExportado ? 'exportado' : 'concluido';

      const metaSync: SincronizacaoMetadados = {
        status: 'pendente',
        sincronizado: false,
        pendente: true,
        versaoLocal: 1,
        tentativas: 0,
      };

      atendimentoSalvo = {
        id,
        usuarioId,
        identificacao: identificacaoSanitizada.toUpperCase(),
        idade: params.idade || '',
        sexo: params.sexo || 'Não informado',
        setor: params.setor || 'Geral',
        leito: params.leito || '',
        tipoRegistro: params.tipoRegistro || 'Anotação Técnica',
        dataCriacao: agora,
        dataConclusao: agora,
        ultimaAlteracao: agora,
        status: statusInicial,
        narrativaFinal: params.textoFinalGerado,
        resumoRegistro:
          params.resumoRegistro ||
          `Registro ${params.tipoRegistro || 'Clínico'} finalizado para ${identificacaoSanitizada.toUpperCase()}`,
        usuarioResponsavel: params.usuarioResponsavel,
        perfilProfissional: params.perfilProfissional,
        categoriaClinica: params.categoriaClinica,
        registroProfissional: params.registroProfissional,
        versaoAtual: 1,
        historicoVersoes: [],
        trilhaAuditoria: [logCriacao, logConclusao],
        sincronizacao: metaSync,
        quotaPermitId: params.quotaPermitId,
        quotaPeriod: params.quotaPeriod,
        quotaValidationStatus: params.quotaPermitId ? 'authorized' : 'pending',
      };
      todos.unshift(atendimentoSalvo);
    }

    writeStorage(todos);

    // Persiste no Firestore em segundo plano (users/{uid}/atendimentos/{id})
    this.persistirNoFirestore(atendimentoSalvo).catch((err) => {
      console.warn('Falha na persistência remota do atendimento salvo:', err);
    });

    return atendimentoSalvo;
  },

  /**
   * Registra a exportação profissional de um atendimento, gerando log de auditoria (AUD-003).
   * Operação idempotente: exportações repetidas não duplicam eventos se já registradas recentemente.
   * Não altera o conteúdo clínico de forma alguma.
   * Bloqueia exportação caso o atendimento pertença a outro usuário (Isolamento de dados).
   */
  registrarExportacao(
    id: string,
    usuarioNome?: string,
    tipoExportacao: string = 'Documento Profissional',
    usuarioId?: string
  ): Atendimento | null {
    const todos = readStorage();
    const index = todos.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const existente = todos[index];

    // ISOLAMENTO DE DADOS: Bloqueia se pertencer a outro usuário
    if (usuarioId && existente.usuarioId && existente.usuarioId !== usuarioId) {
      console.warn(
        `Violação de isolamento multiusuário: Usuário ${usuarioId} tentou exportar atendimento de outro profissional (${existente.usuarioId}).`
      );
      return null;
    }

    const agora = new Date().toISOString();
    const trilha = existente.trilhaAuditoria ? [...existente.trilhaAuditoria] : [];

    // Idempotência: se já tiver evento de exportação com mesmo tipo recente (últimos 30s) e status já for exportado:
    const exportacaoRecente = trilha.find(
      (ev) =>
        ev.tipo === 'exportacao' &&
        ev.metadados?.tipoExportacao === tipoExportacao &&
        Math.abs(new Date(ev.dataHora).getTime() - new Date(agora).getTime()) < 30000
    );

    if (exportacaoRecente && existente.status === 'exportado') {
      return existente;
    }

    const logExportacao: AuditoriaEvento = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tipo: 'exportacao',
      dataHora: agora,
      usuarioId: existente.usuarioId,
      usuarioNome: usuarioNome || existente.usuarioResponsavel || 'Profissional de Enfermagem',
      perfilProfissional: existente.perfilProfissional,
      descricao: `Documento clínico exportado (${tipoExportacao}) para prontuário/impressão.`,
      metadados: {
        tipoExportacao,
        timestampExportacao: agora,
        versaoExportada: existente.versaoAtual || 1,
      },
    };

    trilha.push(logExportacao);

    const atualizado: Atendimento = {
      ...existente,
      status: 'exportado',
      ultimaAlteracao: agora,
      trilhaAuditoria: deduplicarTrilhaAuditoria(trilha),
    };

    todos[index] = atualizado;
    writeStorage(todos);

    this.persistirNoFirestore(atualizado).catch(() => {});
    return atualizado;
  },

  /**
   * Resolução segura de conflitos entre versão local e remota (HARD-PROD-004).
   * - Nunca sobrescreve silenciosamente documento concluído.
   * - Preserva ambas as versões arquivando a concorrente no histórico de versões.
   * - Registra o conflito explicitamente na auditoria para garantir rastreabilidade ética.
   */
  resolverConflito(local: Atendimento, remoto: Atendimento): Atendimento {
    const agora = new Date().toISOString();
    const trilha = deduplicarTrilhaAuditoria([
      ...(local.trilhaAuditoria || []),
      ...(remoto.trilhaAuditoria || []),
    ]);

    const historico: VersaoAtendimento[] = [
      ...(local.historicoVersoes || []),
      ...(remoto.historicoVersoes || []),
    ];

    // Preserva a versão concorrente no histórico
    const versaoPreservada: VersaoAtendimento = {
      versao: remoto.versaoAtual || 1,
      dataHora: remoto.ultimaAlteracao || remoto.dataConclusao || agora,
      usuarioResponsavel: remoto.usuarioResponsavel,
      perfilProfissional: remoto.perfilProfissional,
      registroProfissional: remoto.registroProfissional,
      narrativa: remoto.narrativaFinal || '',
      resumoRegistro: remoto.resumoRegistro,
      motivoAlteracao: 'Versão remota preservada automaticamente durante resolução segura de concorrência',
    };
    historico.push(versaoPreservada);

    const novaVersao = Math.max(local.versaoAtual || 1, remoto.versaoAtual || 1) + 1;

    // Registra evento de conflito na trilha de auditoria
    const eventoConflito: AuditoriaEvento = {
      id: `aud-conflito-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tipo: 'edicao',
      dataHora: agora,
      usuarioId: local.usuarioId,
      usuarioNome: local.usuarioResponsavel || remoto.usuarioResponsavel || 'Profissional de Enfermagem',
      perfilProfissional: local.perfilProfissional || remoto.perfilProfissional,
      descricao: `Conflito de sincronização concorrente resolvido com segurança. A versão remota ${remoto.versaoAtual || 1} foi preservada no histórico de versões para garantir integridade clínica.`,
      metadados: {
        tipo: 'resolucao_conflito',
        versaoLocal: local.versaoAtual || 1,
        versaoRemota: remoto.versaoAtual || 1,
        novaVersao,
      },
    };
    trilha.push(eventoConflito);

    const resolvido: Atendimento = {
      ...local,
      versaoAtual: novaVersao,
      historicoVersoes: historico,
      trilhaAuditoria: trilha,
      ultimaAlteracao: agora,
      sincronizacao: {
        status: 'conflito',
        sincronizado: false,
        pendente: true,
        versaoLocal: novaVersao,
        versaoRemota: remoto.versaoAtual,
        ultimaSincronizacao: local.sincronizacao?.ultimaSincronizacao,
        tentativas: 0,
      },
    };

    const todos = readStorage();
    const idx = todos.findIndex((a) => a.id === local.id);
    if (idx !== -1) {
      todos[idx] = resolvido;
    } else {
      todos.unshift(resolvido);
    }
    writeStorage(todos);

    // Enfileira resolução para persistência remota
    SyncQueueService.enfileirar({
      atendimentoId: resolvido.id,
      usuarioId: resolvido.usuarioId,
      tipoOperacao: 'ATUALIZAR',
      dados: resolvido,
    });

    return resolvido;
  },

  /**
   * Adiciona um evento customizado à trilha de auditoria do atendimento com deduplicação.
   */
  registrarEventoAuditoria(
    id: string,
    evento: Omit<AuditoriaEvento, 'id' | 'dataHora'> & { dataHora?: string }
  ): AuditoriaEvento | null {
    const todos = readStorage();
    const index = todos.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const dataHora = evento.dataHora || new Date().toISOString();
    const trilha = todos[index].trilhaAuditoria ? [...todos[index].trilhaAuditoria] : [];

    // Deduplicação: se já existir evento com mesmo tipo, descrição e dataHora próxima, reutiliza
    const eventoExistente = trilha.find(
      (ev) =>
        ev.tipo === evento.tipo &&
        ev.descricao === evento.descricao &&
        Math.abs(new Date(ev.dataHora).getTime() - new Date(dataHora).getTime()) < 2000
    );

    if (eventoExistente) {
      return eventoExistente;
    }

    const novoEvento: AuditoriaEvento = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dataHora,
      ...evento,
    };

    trilha.push(novoEvento);

    todos[index] = {
      ...todos[index],
      ultimaAlteracao: dataHora,
      trilhaAuditoria: deduplicarTrilhaAuditoria(trilha),
    };

    writeStorage(todos);
    this.persistirNoFirestore(todos[index]).catch(() => {});
    return novoEvento;
  },

  /**
   * Atualiza o status de um atendimento ('rascunho' | 'concluido' | 'exportado' | 'em_andamento').
   */
  atualizarStatus(id: string, status: StatusAtendimento, usuarioId?: string): Atendimento | null {
    return this.atualizarAtendimento(id, { status }, usuarioId);
  },

  /**
   * Atualiza dados de um atendimento existente com verificação de permissão multiusuário.
   */
  atualizarAtendimento(
    id: string,
    updates: Partial<Atendimento>,
    usuarioId?: string
  ): Atendimento | null {
    const todos = readStorage();
    const index = todos.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const item = todos[index];
    if (usuarioId && item.usuarioId !== usuarioId) {
      throw new Error(
        `Violação de isolamento multiusuário: Usuário ${usuarioId} não pode alterar atendimento de outro usuário.`
      );
    }

    const atualizado: Atendimento = {
      ...todos[index],
      ...updates,
      ultimaAlteracao: new Date().toISOString(),
      sincronizacao: {
        status: 'pendente',
        sincronizado: false,
        pendente: true,
        versaoLocal: updates.versaoAtual || todos[index].versaoAtual || 1,
        versaoRemota: todos[index].sincronizacao?.versaoRemota,
        tentativas: 0,
      },
    };

    todos[index] = atualizado;
    writeStorage(todos);

    this.persistirNoFirestore(atualizado).catch(() => {});
    return atualizado;
  },

  /**
   * Remove um atendimento do histórico local e do Firestore com validação de posse.
   */
  excluirAtendimento(id: string, usuarioId?: string): boolean {
    const todos = readStorage();
    const index = todos.findIndex((a) => a.id === id);
    if (index === -1) return false;

    const item = todos[index];
    if (usuarioId && item.usuarioId !== usuarioId) {
      console.warn(
        `Violação de isolamento multiusuário: Usuário ${usuarioId} tentou excluir atendimento de outro usuário.`
      );
      return false;
    }

    const filtrados = todos.filter((a) => a.id !== id);
    writeStorage(filtrados);

    // Remove pendências da fila de sincronização
    SyncQueueService.removerPorAtendimentoId(id);

    // Remove do Firestore na subcoleção do usuário
    if (item.usuarioId) {
      try {
        const subDocRef = getUserAtendimentoDoc(item.usuarioId, id);
        deleteDoc(subDocRef).catch(() => {
          SyncQueueService.enfileirar({
            atendimentoId: id,
            usuarioId: item.usuarioId,
            tipoOperacao: 'EXCLUIR',
          });
        });
      } catch {
        SyncQueueService.enfileirar({
          atendimentoId: id,
          usuarioId: item.usuarioId,
          tipoOperacao: 'EXCLUIR',
        });
      }
    }

    return true;
  },

  /**
   * Salva documento de atendimento no Firestore no caminho estruturado:
   * users/{uid}/atendimentos/{atendimentoId}
   * Armazenando: dados clínicos, documento final, auditoria, versões e timestamps.
   * Retorna boolean indicando sucesso ou falha para controle da fila resiliente.
   */
  async persistirNoFirestore(atendimento: Atendimento): Promise<boolean> {
    if (!atendimento.usuarioId) return false;

    try {
      // A cota é autorizada no backend. Se o documento nasceu offline, a reserva é
      // obtida antes da primeira sincronização remota; em caso de limite atingido,
      // o documento local é preservado e permanece pendente sem burlar a cota SaaS.
      if (!atendimento.quotaPermitId) {
        const reservation = await QuotaService.reserveDocument(atendimento.id);
        atendimento.quotaPermitId = reservation.permitId;
        atendimento.quotaPeriod = reservation.period;
        atendimento.quotaValidationStatus = 'authorized';

        const localItems = readStorage();
        const localIndex = localItems.findIndex((item) => item.id === atendimento.id);
        if (localIndex >= 0) {
          localItems[localIndex] = { ...localItems[localIndex], ...atendimento };
          writeStorage(localItems);
        }
      }

      const sanitized = sanitizeForFirestore(atendimento);

      // 1. Caminho canônico multiusuário isolado
      const subDocRef = getUserAtendimentoDoc(atendimento.usuarioId, atendimento.id);
      await setDoc(subDocRef, sanitized);

      // 2. Dual-write legado apenas para documentos já autorizados pela mesma permissão
      try {
        const legacyDocRef = doc(db, ATENDIMENTOS_COLLECTION, atendimento.id);
        await setDoc(legacyDocRef, sanitized);
      } catch {
        // Ignora caso coleção raiz seja restrita
      }

      // 3. Marca metadados de sincronização como sincronizado
      const agora = new Date().toISOString();
      const metaSync: SincronizacaoMetadados = {
        status: 'sincronizado',
        sincronizado: true,
        pendente: false,
        ultimaSincronizacao: agora,
        versaoLocal: atendimento.versaoAtual || 1,
        versaoRemota: atendimento.versaoAtual || 1,
        tentativas: 0,
      };

      atendimento.sincronizacao = metaSync;
      this.atualizarMetadadosSyncLocal(atendimento.id, metaSync);

      return true;
    } catch (err) {
      console.warn('Persistência no Firestore não executada (usando fallback local):', err);

      if (err instanceof QuotaServiceError && err.type === 'quota_exceeded') {
        atendimento.quotaValidationStatus = 'denied';
        const localItems = readStorage();
        const localIndex = localItems.findIndex((item) => item.id === atendimento.id);
        if (localIndex >= 0) {
          localItems[localIndex] = { ...localItems[localIndex], quotaValidationStatus: 'denied' };
          writeStorage(localItems);
        }
      }

      const metaSync: SincronizacaoMetadados = {
        status: 'erro',
        sincronizado: false,
        pendente: true,
        versaoLocal: atendimento.versaoAtual || 1,
        versaoRemota: atendimento.sincronizacao?.versaoRemota,
        tentativas: (atendimento.sincronizacao?.tentativas || 0) + 1,
        ultimoErro: String(err),
      };

      atendimento.sincronizacao = metaSync;
      this.atualizarMetadadosSyncLocal(atendimento.id, metaSync);

      // Enfileira na fila resiliente para envio assim que a conexão retornar
      SyncQueueService.enfileirar({
        atendimentoId: atendimento.id,
        usuarioId: atendimento.usuarioId,
        tipoOperacao: atendimento.status === 'concluido' ? 'CONCLUIR' : 'ATUALIZAR',
        dados: atendimento,
      });

      return false;
    }
  },

  /**
   * Processa item da fila de sincronização chamando a persistência remota.
   */
  async processarItemFilaRemoto(item: SyncQueueItem): Promise<boolean> {
    if (item.tipoOperacao === 'EXCLUIR') {
      try {
        const subDocRef = getUserAtendimentoDoc(item.usuarioId, item.atendimentoId);
        await deleteDoc(subDocRef);
        return true;
      } catch {
        return false;
      }
    }

    const local = this.buscarPorId(item.atendimentoId, item.usuarioId);
    if (!local) {
      if (item.dados && item.dados.usuarioId === item.usuarioId) {
        return this.persistirNoFirestore(item.dados);
      }
      return true;
    }

    return this.persistirNoFirestore(local);
  },

  /**
   * Atualiza os metadados de sincronização do atendimento no cache local.
   */
  atualizarMetadadosSyncLocal(atendimentoId: string, metaSync: SincronizacaoMetadados): void {
    const todos = readStorage();
    const idx = todos.findIndex((a) => a.id === atendimentoId);
    if (idx !== -1) {
      todos[idx].sincronizacao = metaSync;
      writeStorage(todos);
    }
  },

  /**
   * Atualiza o status técnico de sincronização no cache local.
   */
  marcarStatusSincronizacaoLocal(
    atendimentoId: string,
    status: StatusSincronizacao,
    erroMsg?: string
  ): void {
    const todos = readStorage();
    const idx = todos.findIndex((a) => a.id === atendimentoId);
    if (idx !== -1) {
      const atual = todos[idx].sincronizacao || {
        status: 'pendente',
        sincronizado: false,
        pendente: true,
        versaoLocal: todos[idx].versaoAtual || 1,
      };

      todos[idx].sincronizacao = {
        ...atual,
        status,
        sincronizado: status === 'sincronizado',
        pendente: status === 'pendente' || status === 'erro',
        ultimoErro: erroMsg,
      };
      writeStorage(todos);
    }
  },
};

// Exporta alias em minúsculo para conformidade
export const atendimentoService = AtendimentoService;
