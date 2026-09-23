import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Star,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { ModeloEnfermagem } from '../types/models';
import { AppScreen, PlanoAssinatura } from '../types';
import { ModelService } from '../services/modelService';

interface ModelDetailScreenProps {
  modelo: ModeloEnfermagem;
  usuarioId: string;
  plano?: PlanoAssinatura;
  onNavigate: (screen: AppScreen) => void;
  onSelectModel: (modelo: ModeloEnfermagem) => void;
  onShowNotice: (msg: string) => void;
}

export const ModelDetailScreen: React.FC<ModelDetailScreenProps> = ({
  modelo,
  usuarioId,
  plano = 'Gratuito',
  onNavigate,
  onSelectModel,
  onShowNotice,
}) => {
  const [isFavorito, setIsFavorito] = useState<boolean>(() =>
    ModelService.isFavorito(usuarioId, modelo.id)
  );

  useEffect(() => {
    setIsFavorito(ModelService.isFavorito(usuarioId, modelo.id));
  }, [usuarioId, modelo.id]);

  const temAcesso = ModelService.podeAcessarModelo(modelo, plano);
  const isPremium = modelo.nivelAcesso === 'premium';

  const handleToggleFavorito = async () => {
    if (isFavorito) {
      await ModelService.removerFavorito(usuarioId, modelo.id);
      setIsFavorito(false);
      onShowNotice(`"${modelo.titulo}" removido dos favoritos.`);
    } else {
      await ModelService.adicionarFavorito(usuarioId, modelo.id);
      setIsFavorito(true);
      onShowNotice(`"${modelo.titulo}" adicionado aos favoritos.`);
    }
  };

  const handleIniciarAtendimento = () => {
    if (!temAcesso) {
      onShowNotice('Este modelo exige assinatura Pro ou Premium. Atualize para desbloquear.');
      onNavigate('account');
      return;
    }
    onSelectModel(modelo);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('model-library')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Biblioteca
        </button>

        <button
          onClick={handleToggleFavorito}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isFavorito
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorito ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
          {isFavorito ? 'Favoritado' : 'Favoritar Modelo'}
        </button>
      </div>

      {/* Cartão de Destaque do Modelo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {modelo.categoria}
            </span>

            {isPremium ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Recurso Pro / Premium
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Acesso Gratuito
              </span>
            )}

            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
              Versão {modelo.versaoModelo}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {modelo.titulo}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {modelo.descricao}
          </p>
        </div>

        {/* Metadados de Governança e Auditoria do Modelo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-600">Criado Por</div>
              <div className="font-medium text-slate-800">{modelo.criadoPor}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-600">Publicado Em</div>
              <div className="font-medium text-slate-800">
                {new Date(modelo.dataCriacao).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-600">Última Revisão</div>
              <div className="font-medium text-slate-800">
                {new Date(modelo.dataAtualizacao).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Foco Clínico */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            Foco da Assistência de Enfermagem
          </h3>
          <p className="text-sm text-slate-700 bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl leading-relaxed">
            {modelo.focoClinico}
          </p>
        </div>

        {/* Campos Estruturados Necessários */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Campos Estruturados ({modelo.camposNecessarios.length})
            </h3>
            <span className="text-xs text-slate-600">
              Formato de destino: <strong>{modelo.tipoRegistro}</strong>
            </span>
          </div>

          <div className="space-y-2.5">
            {modelo.camposNecessarios.map((campo, index) => (
              <div
                key={campo.id || index}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {campo.secaoSoap && (
                      <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {campo.secaoSoap}
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {campo.rotulo}
                    </span>
                  </div>

                  {campo.obrigatorio && (
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Obrigatório
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  {campo.dica}
                </p>

                {campo.opcoesSugeridas && campo.opcoesSugeridas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {campo.opcoesSugeridas.map((opcao, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {opcao}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cuidados e Metas Assistenciais Recomendadas */}
        {modelo.cuidadosPrincipais && modelo.cuidadosPrincipais.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Metas e Cuidados Assistenciais do Roteiro
            </h3>
            <ul className="space-y-2">
              {modelo.cuidadosPrincipais.map((cuidado, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{cuidado}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer de Segurança e Ética Profissional */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-slate-800">Compromisso com o Exercício da Enfermagem</div>
            <p className="text-slate-600">
              Este modelo foi desenvolvido em conformidade com as diretrizes do COFEN. Ele visa orientar e estruturar a documentação clínica, nunca substituindo o raciocínio individualizado do profissional. Não emite diagnósticos nosológicos médicos nem prescrições farmacológicas.
            </p>
          </div>
        </div>

        {/* Ação Primária */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Ao utilizar este modelo, um novo atendimento será iniciado com as sugestões pré-carregadas.
          </div>

          <button
            onClick={handleIniciarAtendimento}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-150 shadow-md ${
              !temAcesso
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
            }`}
          >
            {!temAcesso ? (
              <>
                <Lock className="w-4 h-4" />
                Desbloquear no Plano Pro
              </>
            ) : (
              <>
                Iniciar Atendimento com este Modelo
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
