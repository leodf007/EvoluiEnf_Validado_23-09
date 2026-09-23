import { TipoRegistroAtendimento, AppScreen } from '../types';

export type CategoriaModelo =
  | 'UTI'
  | 'Clínica Médica'
  | 'Feridas'
  | 'Cirúrgico'
  | 'Pediatria';

export type NivelAcessoModelo = 'gratuito' | 'premium';

export interface CampoNecessarioModelo {
  id: string;
  rotulo: string;
  tipo: 'texto' | 'selecao' | 'numero' | 'multiplo';
  obrigatorio: boolean;
  secaoSoap?: 'S' | 'O' | 'A' | 'P';
  dica: string;
  opcoesSugeridas?: string[];
}

export interface ModeloEnfermagem {
  id: string;
  categoria: CategoriaModelo;
  titulo: string;
  descricao: string;
  tipoRegistro: TipoRegistroAtendimento;
  camposNecessarios: CampoNecessarioModelo[];
  nivelAcesso: NivelAcessoModelo;
  ativo: boolean;
  versaoModelo: string;
  criadoPor: string;
  dataCriacao: string;
  dataAtualizacao: string;
  moduloDestino: AppScreen;
  focoClinico: string;
  cuidadosPrincipais: string[];
  sugestoesPreenchimento?: {
    setorSugerido?: string;
    subjetivoPadrao?: string;
    focoObjetivo?: string;
    planoCuidadosBase?: string[];
  };
}

export interface FavoriteModelRecord {
  id: string;
  usuarioId: string;
  modeloId: string;
  nomePersonalizado?: string;
  dataCriacao: string;
}
