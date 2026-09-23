import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Star,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Check,
  X,
  Trash2,
  Sparkles,
  Lock,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  ModeloEnfermagem,
  FavoriteModelRecord,
} from '../types/models';
import { AppScreen, PlanoAssinatura } from '../types';
import { ModelService, MODELOS_PADRAO } from '../services/modelService';

interface FavoriteModelsScreenProps {
  usuarioId: string;
  plano?: PlanoAssinatura;
  onNavigate: (screen: AppScreen) => void;
  onSelectModel: (modelo: ModeloEnfermagem) => void;
  onViewModelDetails: (modelo: ModeloEnfermagem) => void;
  onShowNotice: (msg: string) => void;
}

export const FavoriteModelsScreen: React.FC<FavoriteModelsScreenProps> = ({
  usuarioId,
  plano = 'Gratuito',
  onNavigate,
  onSelectModel,
  onViewModelDetails,
  onShowNotice,
}) => {
  const [favoritos, setFavoritos] = useState<FavoriteModelRecord[]>(() =>
    ModelService.listarFavoritos(usuarioId)
  );
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState<string>('');

  useEffect(() => {
    ModelService.listarFavoritosAsync(usuarioId).then((remotos) => {
      if (remotos) {
        setFavoritos(remotos);
      }
    });
  }, [usuarioId]);

  const handleRemover = async (modeloId: string, titulo: string) => {
    await ModelService.removerFavorito(usuarioId, modeloId);
    setFavoritos((prev) => prev.filter((f) => f.modeloId !== modeloId));
    onShowNotice(`"${titulo}" removido dos favoritos.`);
  };

  const handleSalvarApelido = async (modeloId: string) => {
    await ModelService.renomearFavorito(usuarioId, modeloId, novoNome);
    setFavoritos((prev) =>
      prev.map((f) =>
        f.modeloId === modeloId
          ? { ...f, nomePersonalizado: novoNome.trim() || undefined }
          : f
      )
    );
    setEditandoId(null);
    setNovoNome('');
    onShowNotice('Apelido do modelo atualizado com sucesso.');
  };

  const handleUsarModelo = (modelo: ModeloEnfermagem) => {
    const permitido = ModelService.podeAcessarModelo(modelo, plano);
    if (!permitido) {
      onShowNotice('Este modelo faz parte do plano Pro/Premium. Atualize seu plano para desbloquear.');
      onNavigate('account');
      return;
    }
    onSelectModel(modelo);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('model-library')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para Biblioteca de Modelos
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
            Meus Modelos Favoritos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Acesse rapidamente seus roteiros de enfermagem mais utilizados e personalize os nomes de acordo com sua rotina de trabalho.
          </p>
        </div>

        <button
          onClick={() => onNavigate('model-library')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          Explorar Mais Modelos
        </button>
      </div>

      {/* Lista ou Estado Vazio */}
      {favoritos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
            <Star className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Nenhum modelo favoritado ainda</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Ao navegar pela biblioteca, clique na estrela de qualquer modelo para adicioná-lo aqui e ter acesso imediato nos seus atendimentos.
            </p>
          </div>
          <button
            onClick={() => onNavigate('model-library')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm"
          >
            Abrir Biblioteca de Modelos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoritos.map((fav) => {
            const modelo = MODELOS_PADRAO.find((m) => m.id === fav.modeloId);
            if (!modelo) return null;

            const isPremium = modelo.nivelAcesso === 'premium';
            const temAcesso = ModelService.podeAcessarModelo(modelo, plano);
            const estaEditando = editandoId === fav.modeloId;

            return (
              <div
                key={fav.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  {/* Categorias & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {modelo.categoria}
                    </span>

                    <div className="flex items-center gap-1">
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Premium
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Gratuito
                        </span>
                      )}

                      <button
                        onClick={() => handleRemover(modelo.id, modelo.titulo)}
                        title="Remover dos favoritos"
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Nome Personalizado / Título Oficial */}
                  <div>
                    {estaEditando ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={novoNome}
                          onChange={(e) => setNovoNome(e.target.value)}
                          placeholder="Ex: Meu Protocolo UTI"
                          className="flex-1 text-xs border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleSalvarApelido(modelo.id)}
                          className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {fav.nomePersonalizado && (
                          <div className="flex items-center gap-1 text-xs font-bold text-indigo-700">
                            <span>★ {fav.nomePersonalizado}</span>
                            <button
                              onClick={() => {
                                setEditandoId(fav.modeloId);
                                setNovoNome(fav.nomePersonalizado || '');
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {modelo.titulo}
                        </h3>
                        {!fav.nomePersonalizado && (
                          <button
                            onClick={() => {
                              setEditandoId(fav.modeloId);
                              setNovoNome('');
                            }}
                            className="text-[11px] text-slate-400 hover:text-indigo-600 inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            Definir apelido personalizado
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {modelo.descricao}
                    </p>
                  </div>

                  {/* Detalhes de Formato */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>{modelo.camposNecessarios.length} campos estruturados</span>
                    <span className="text-slate-400">•</span>
                    <span>v{modelo.versaoModelo}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewModelDetails(modelo)}
                    className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    Ver Detalhes
                  </button>

                  <button
                    onClick={() => handleUsarModelo(modelo)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm ${
                      !temAcesso
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                    }`}
                  >
                    {!temAcesso ? (
                      <>
                        <Lock className="w-3 h-3" />
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
