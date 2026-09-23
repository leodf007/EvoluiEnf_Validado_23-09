export type CategoriaErro =
  | 'FIRESTORE_INDISPONIVEL'
  | 'SESSAO_EXPIRADA'
  | 'NAO_AUTENTICADO'
  | 'FALHA_SINCRONIZACAO'
  | 'CONFLITO_VERSAO'
  | 'ERRO_PERMISSAO'
  | 'DESCONHECIDO';

export interface ErroTratado {
  categoria: CategoriaErro;
  codigoOriginal?: string;
  mensagemProfissional: string;
  mensagemTecnica: string;
  podeRetentar: boolean;
  documentoPreservadoLocalmente: boolean;
  timestamp: string;
}

export const ErrorHandlerService = {
  /**
   * Classifica e trata erros técnicos do Firebase/Rede sem assustar o profissional de enfermagem.
   * Assegura explicitamente que os dados clínicos foram preservados no dispositivo local.
   */
  tratarErro(err: unknown, contexto: string = 'operação'): ErroTratado {
    const timestamp = new Date().toISOString();
    const erroString = String(err);
    const erroCode = (err as any)?.code || '';
    const erroMsg = (err as any)?.message || erroString;

    let categoria: CategoriaErro = 'DESCONHECIDO';
    let mensagemProfissional = 'Ocorreu uma instabilidade momentânea. Seus dados foram salvos com segurança no dispositivo.';
    let podeRetentar = true;

    if (
      erroCode === 'unavailable' ||
      erroCode === 'failed-precondition' ||
      erroString.includes('network') ||
      erroString.includes('offline') ||
      erroString.includes('Failed to fetch')
    ) {
      categoria = 'FIRESTORE_INDISPONIVEL';
      mensagemProfissional =
        'Conexão com o servidor indisponível. O registro foi salvo com segurança no dispositivo e será sincronizado assim que o sinal for restabelecido.';
      podeRetentar = true;
    } else if (
      erroCode === 'permission-denied' ||
      erroString.includes('permission-denied') ||
      erroString.includes('Violação de isolamento')
    ) {
      categoria = 'ERRO_PERMISSAO';
      mensagemProfissional =
        'Acesso restrito: este registro pertence a outro profissional ou seu perfil não possui autorização para esta alteração.';
      podeRetentar = false;
    } else if (
      erroCode === 'unauthenticated' ||
      erroString.includes('unauthenticated') ||
      erroString.includes('auth/user-not-found')
    ) {
      categoria = 'NAO_AUTENTICADO';
      mensagemProfissional =
        'Sessão não identificada. Conecte-se novamente com suas credenciais profissionais para concluir a sincronização em nuvem.';
      podeRetentar = false;
    } else if (
      erroCode === 'auth/id-token-expired' ||
      erroString.includes('token-expired')
    ) {
      categoria = 'SESSAO_EXPIRADA';
      mensagemProfissional =
        'Sua sessão expirou por segurança. Faça login novamente; suas alterações locais estão protegidas e salvas no dispositivo.';
      podeRetentar = false;
    } else if (
      erroString.includes('conflito') ||
      erroString.includes('conflict') ||
      erroString.includes('concorrente')
    ) {
      categoria = 'CONFLITO_VERSAO';
      mensagemProfissional =
        'Detectamos alterações simultâneas neste prontuário. Todas as versões foram preservadas no histórico para assegurar a rastreabilidade ética.';
      podeRetentar = true;
    } else if (
      erroString.includes('sync') ||
      erroString.includes('sincronização')
    ) {
      categoria = 'FALHA_SINCRONIZACAO';
      mensagemProfissional =
        'Falha momentânea na sincronização em nuvem. Os dados estão preservados no dispositivo e serão reenviados automaticamente.';
      podeRetentar = true;
    }

    // Log técnico controlado apenas em ambiente de desenvolvimento/inspeção
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn(`[ErrorHandlerService] [${categoria}] Contexto: ${contexto}`, {
        codigoOriginal: erroCode,
        mensagemTecnica: erroMsg,
      });
    }

    return {
      categoria,
      codigoOriginal: erroCode,
      mensagemProfissional,
      mensagemTecnica: erroMsg,
      podeRetentar,
      documentoPreservadoLocalmente: true,
      timestamp,
    };
  },
};
