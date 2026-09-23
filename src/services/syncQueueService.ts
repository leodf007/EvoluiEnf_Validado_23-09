import { SyncQueueItem, TipoOperacaoSync } from '../types';
import { AtendimentoService } from './atendimentoService';
import { ErrorHandlerService } from './errorHandlerService';

const SYNC_QUEUE_KEY = 'evoluienf_sync_queue_v1';

let inMemoryQueue: SyncQueueItem[] = [];

function readQueue(): SyncQueueItem[] {
  if (typeof localStorage === 'undefined') {
    return inMemoryQueue;
  }
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return inMemoryQueue;
  }
}

function writeQueue(items: SyncQueueItem[]): void {
  inMemoryQueue = items;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[SyncQueueService] Falha ao persistir fila no localStorage:', err);
  }
}

export const SyncQueueService = {
  /**
   * Retorna os itens pendentes na fila de sincronização, opcionalmente filtrados por usuário.
   */
  obterFila(usuarioId?: string): SyncQueueItem[] {
    const todos = readQueue();
    if (!usuarioId) return todos;
    return todos.filter((i) => i.usuarioId === usuarioId);
  },

  /**
   * Enfileira uma operação de sincronização de forma idempotente e resiliente.
   * Se já existir uma operação pendente para o mesmo atendimentoId, consolida os dados
   * sem gerar itens duplicados na fila.
   */
  enfileirar(params: {
    atendimentoId: string;
    usuarioId: string;
    tipoOperacao: TipoOperacaoSync;
    dados?: any;
  }): SyncQueueItem {
    const todos = readQueue();
    const agora = new Date().toISOString();

    // Procura se já existe item pendente para este atendimento
    const indexExistente = todos.findIndex(
      (i) => i.atendimentoId === params.atendimentoId && i.usuarioId === params.usuarioId
    );

    if (indexExistente !== -1) {
      const existente = todos[indexExistente];
      // Preserva a intenção original de criação caso ainda não tenha subido
      const tipoOperacaoFinal: TipoOperacaoSync =
        existente.tipoOperacao === 'CRIAR' ? 'CRIAR' : params.tipoOperacao;

      const atualizado: SyncQueueItem = {
        ...existente,
        tipoOperacao: tipoOperacaoFinal,
        dados: params.dados ? { ...(existente.dados || {}), ...params.dados } : existente.dados,
        timestamp: agora,
        // Não zera tentativas caso já tenha falhado
      };

      todos[indexExistente] = atualizado;
      writeQueue(todos);
      return atualizado;
    }

    const novoItem: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      atendimentoId: params.atendimentoId,
      usuarioId: params.usuarioId,
      tipoOperacao: params.tipoOperacao,
      dados: params.dados,
      timestamp: agora,
      tentativas: 0,
    };

    todos.push(novoItem);
    writeQueue(todos);
    return novoItem;
  },

  /**
   * Remove um item da fila apenas após confirmação de persistência bem-sucedida.
   */
  removerDaFila(itemId: string): void {
    const todos = readQueue();
    const filtrados = todos.filter((i) => i.id !== itemId);
    writeQueue(filtrados);
  },

  /**
   * Remove todas as operações pendentes associadas a um atendimento específico.
   */
  removerPorAtendimentoId(atendimentoId: string): void {
    const todos = readQueue();
    const filtrados = todos.filter((i) => i.atendimentoId !== atendimentoId);
    writeQueue(filtrados);
  },

  /**
   * Limpa a fila (geralmente utilizada em testes ou logout completo).
   */
  limparFila(usuarioId?: string): void {
    if (!usuarioId) {
      inMemoryQueue = [];
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(SYNC_QUEUE_KEY);
      }
    } else {
      const todos = readQueue();
      const restantes = todos.filter((i) => i.usuarioId !== usuarioId);
      writeQueue(restantes);
    }
  },

  /**
   * Processa a fila de operações pendentes.
   * Conexão recuperada -> executa sincronização remota -> remove apenas sucessos confirmados.
   */
  async processarFilaPendentes(
    usuarioId?: string
  ): Promise<{ processados: number; sucessos: number; falhas: number }> {
    const todos = readQueue();
    const pendentes = usuarioId
      ? todos.filter((i) => i.usuarioId === usuarioId)
      : [...todos];

    let sucessos = 0;
    let falhas = 0;

    for (const item of pendentes) {
      try {
        const ok = await AtendimentoService.processarItemFilaRemoto(item);
        if (ok) {
          this.removerDaFila(item.id);
          sucessos++;
        } else {
          // Atualiza contagem de tentativas e erro sem remover da fila
          this.marcarFalhaTentativa(item.id, 'Falha reportada pelo serviço de persistência');
          falhas++;
        }
      } catch (err) {
        const tratado = ErrorHandlerService.tratarErro(err, `Processamento Fila (${item.tipoOperacao})`);
        this.marcarFalhaTentativa(item.id, tratado.mensagemTecnica);
        falhas++;
      }
    }

    return {
      processados: pendentes.length,
      sucessos,
      falhas,
    };
  },

  /**
   * Registra falha de tentativa no item mantendo-o na fila para reprocessamento seguro.
   */
  marcarFalhaTentativa(itemId: string, erroMsg: string): void {
    const todos = readQueue();
    const index = todos.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      todos[index].tentativas = (todos[index].tentativas || 0) + 1;
      todos[index].ultimoErro = erroMsg;
      writeQueue(todos);

      // Também reflete o status de erro no registro de atendimento local
      AtendimentoService.marcarStatusSincronizacaoLocal(
        todos[index].atendimentoId,
        'erro',
        erroMsg
      );
    }
  },

  /**
   * Inicializa o listener de reconexão automática ao recuperar sinal de rede.
   */
  inicializarListenerOnline(): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleOnline = () => {
      if (navigator.onLine) {
        SyncQueueService.processarFilaPendentes().catch((err) => {
          console.warn('[SyncQueueService] Erro ao auto-processar fila após reconexão:', err);
        });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  },
};
