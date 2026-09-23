import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Star,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import {
  ModeloEnfermagem,
  CategoriaModelo,
} from '../types/models';
import { AppScreen, PlanoAssinatura } from '../types';
import { ModelService } from '../services/modelService';

interface ModelLibraryScreenProps {
  usuarioId: string;
  plano?: PlanoAssinatura;
  onNavigate: (screen: AppScreen) => void;
  onSelectModel: (modelo: ModeloEnfermagem) => void;
  onViewModelDetails: (modelo: ModeloEnfermagem) => void;
  onShowNotice: (msg: string) => void;
}

export const ModelLibraryScreen: React.FC<ModelLibraryScreenProps> = ({
  usuarioId,
  plano = 'Gratuito',
  onNavigate,
  onSelectModel,
  onViewModelDetails,
  onShowNotice,
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');
  const [filtroAcesso, setFiltroAcesso] = useState<'todos' | 'gratuito' | 'premium'>('todos');
  const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set());

  // Carrega favoritos do usuário
  useEffect(() => {
    const favs = ModelService.listarFavoritos(usuarioId);
    setFavoritosIds(new Set(favs.map((f) => f.modeloId)));

    // Sincroniza em segundo plano
    ModelService.listarFavoritosAsync(usuarioId).then((remotos) => {
      if (remotos && remotos.length > 0) {
        setFavoritosIds(new Set(remotos.map((f) => f.modeloId)));
      }
    });
  }, [usuarioId]);

  const categorias = useMemo(() => {
    return ['todos', ...ModelService.listarCategorias()];
  }, []);

  const modelosFiltrados = useMemo(() => {
    return ModelService.listarModelos().filter((m) => {
      // Filtro de Categoria
      if (categoriaAtiva !== 'todos' && m.categoria !== categoriaAtiva) {
        return false;
      }
      // Filtro de Nível de Acesso
      if (filtroAcesso !== 'todos' && m.nivelAcesso !== filtroAcesso) {
        return false;
      }
      // Filtro de Busca Textual
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const textoBusca = `${m.titulo} ${m.descricao} ${m.categoria} ${m.focoClinico}`.toLowerCase();
        return textoBusca.includes(termo);
      }
      return true;
    });
  }, [categoriaAtiva, filtroAcesso, busca]);

  const handleToggleFavorito = async (modelo: ModeloEnfermagem, e: React.MouseEvent) => {
    e.stopPropagation();
    const jaFavorito = favoritosIds.has(modelo.id);

    if (jaFavorito) {
      await ModelService.removerFavorito(usuarioId, modelo.id);
      setFavoritosIds((prev) => {
        const next = new Set(prev);
        next.delete(modelo.id);
        return next;
      });
      onShowNotice(`"${modelo.titulo}" removido dos favoritos.`);
    } else {
      await ModelService.adicionarFavorito(usuarioId, modelo.id);
      setFavoritosIds((prev) => new Set(prev).add(modelo.id));
      onShowNotice(`"${modelo.titulo}" adicionado aos seus favoritos.`);
    }
  };

  const handleEscolherModelo = (modelo: ModeloEnfermagem) => {
    const permitido = ModelService.podeAcessarModelo(modelo, plano);
    if (!permitido) {
      onShowNotice('Este modelo faz parte dos recursos Pro/Premium. Atualize seu plano para desbloquear.');
      onNavigate('account');
      return;
    }
    onSelectModel(modelo);
  };

  const getCategoriaBadgeClass = (cat: CategoriaModelo) => {
    switch (cat) {
      case 'UTI':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Clínica Médica':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Feridas':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cirúrgico':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Pediatria':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Ações Rápidas */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Biblioteca Inteligente de Modelos
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Modelos de Enfermagem
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Roteiros clínicos estruturados para documentação ágil. Escolha um modelo para carregar campos sugeridos diretamente no fluxo de atendimento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('favorite-models')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all duration-150 backdrop-blur-sm active:scale-95"
            >
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400/40" />
              Meus Favoritos
              {favoritosIds.size > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs">
                  {favoritosIds.size}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('novo-atendimento')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-150 shadow-md active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Novo Atendimento Livre
            </button>
          </div>
        </div>

        {/* Banner de Conformidade e Segurança Clínica */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Conformidade COFEN:</strong> Modelos estruturam o processo assistencial de enfermagem sem emitir diagnósticos médicos ou prescrições farmacológicas privativas.
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, foco clínico ou setor..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filtro de Acesso */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFiltroAcesso('todos')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filtroAcesso === 'todos'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroAcesso('gratuito')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filtroAcesso === 'gratuito'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gratuitos
            </button>
            <button
              onClick={() => setFiltroAcesso('premium')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filtroAcesso === 'premium'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              Premium
            </button>
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                categoriaAtiva === cat
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat === 'todos' ? 'Todas as Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Modelos */}
      {modelosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">Nenhum modelo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não localizamos nenhum modelo com os filtros atuais. Tente ajustar o termo de busca ou alternar a categoria.
          </p>
          <button
            onClick={() => {
              setBusca('');
              setCategoriaAtiva('todos');
              setFiltroAcesso('todos');
            }}
            className="px-4 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modelosFiltrados.map((modelo) => {
            const isFav = favoritosIds.has(modelo.id);
            const isPremium = modelo.nivelAcesso === 'premium';
            const temAcesso = ModelService.podeAcessarModelo(modelo, plano);

            return (
              <div
                key={modelo.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-indigo-200"
              >
                <div className="p-5 space-y-3">
                  {/* Cabeçalho do Card: Categorias & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoriaBadgeClass(
                          modelo.categoria
                        )}`}
                      >
                        {modelo.categoria}
                      </span>

                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Pro / Premium
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Gratuito
                        </span>
                      )}

                      <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        v{modelo.versaoModelo}
                      </span>
                    </div>

                    {/* Botão de Favoritar */}
                    <button
                      onClick={(e) => handleToggleFavorito(modelo, e)}
                      title={isFav ? 'Remover dos favoritos' : 'Favoritar modelo'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Título & Descrição */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {modelo.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {modelo.descricao}
                    </p>
                  </div>

                  {/* Destaques de Foco Clínico */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-indigo-500" />
                      Foco da Assistência:
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      {modelo.focoClinico}
                    </p>
                  </div>

                  {/* Campos do Modelo */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>{modelo.camposNecessarios.length} campos estruturados</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{modelo.tipoRegistro}</span>
                  </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewModelDetails(modelo)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-white"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Ver Detalhes
                  </button>

                  <button
                    onClick={() => handleEscolherModelo(modelo)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm ${
                      !temAcesso
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                    }`}
                  >
                    {!temAcesso ? (
                      <>
                        <Lock className="w-3 h-3 text-white" />
                        Desbloquear
                      </>
                    ) : (
                      <>
                        Usar Modelo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
