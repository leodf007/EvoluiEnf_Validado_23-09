import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Building2,
  Bed,
  FileSpreadsheet,
  FileText,
  Activity,
  HeartPulse,
  UserPlus,
  Info,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Layers,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Atendimento,
  TipoRegistroAtendimento,
  SexoAtendimento,
  UserRole,
  AppScreen,
  PlanoAssinatura,
} from '../types';
import { ModeloEnfermagem } from '../types/models';
import { AtendimentoService } from '../services/atendimentoService';
import { PrivacyGuard } from '../services/privacyGuard';
import { ModelService, MODELOS_PADRAO } from '../services/modelService';
import { HelpTooltip } from '../components/HelpTooltip';
import { generateQuotaResourceId } from '../services/authenticatedFetch';
import { QuotaService, QuotaServiceError } from '../services/quotaService';
import { UsageTracker } from '../services/usageTracker';

interface NovoAtendimentoScreenProps {
  usuarioId: string;
  userRole: UserRole;
  plano?: PlanoAssinatura;
  modeloInicial?: ModeloEnfermagem | null;
  onNavigate: (screen: AppScreen) => void;
  onIniciarAtendimento: (
    atendimento: Atendimento,
    destinoScreen: AppScreen,
    modeloAplicado?: ModeloEnfermagem | null
  ) => void;
  onShowNotice: (msg: string) => void;
}

export const NovoAtendimentoScreen: React.FC<NovoAtendimentoScreenProps> = ({
  usuarioId,
  userRole,
  plano = 'Gratuito' as PlanoAssinatura,
  modeloInicial = null,
  onNavigate,
  onIniciarAtendimento,
  onShowNotice,
}) => {
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloEnfermagem | null>(modeloInicial);
  const [mostrarDetalhesModelo, setMostrarDetalhesModelo] = useState(true);
  const [identificacao, setIdentificacao] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState<SexoAtendimento>('Feminino');
  const [setor, setSetor] = useState('UTI');
  const [leito, setLeito] = useState('');
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistroAtendimento>('Evolução SOAP');
  const [privacyWarning, setPrivacyWarning] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Se receber modeloInicial ou ao mudar modeloSelecionado, sincroniza campos sugeridos
  useEffect(() => {
    if (modeloInicial) {
      aplicarModelo(modeloInicial);
    }
  }, [modeloInicial]);

  const aplicarModelo = (mod: ModeloEnfermagem) => {
    const pode = ModelService.podeAcessarModelo(mod, plano);
    if (!pode) {
      onShowNotice('Este modelo faz parte dos recursos Pro/Premium. Atualize seu plano para desbloquear.');
      onNavigate('account');
      return;
    }

    setModeloSelecionado(mod);
    setTipoRegistro(mod.tipoRegistro);
    if (mod.sugestoesPreenchimento?.setorSugerido) {
      setSetor(mod.sugestoesPreenchimento.setorSugerido);
    }
  };

  const desmarcarModelo = () => {
    setModeloSelecionado(null);
  };

  // Opções de Tipo de Registro
  const TIPOS_REGISTRO: Array<{
    tipo: TipoRegistroAtendimento;
    titulo: string;
    subtitulo: string;
    icone: React.ElementType;
    exclusivoEnfermeiro?: boolean;
    destino: AppScreen;
    destaque?: boolean;
  }> = [
    {
      tipo: 'Evolução SOAP',
      titulo: 'Evolução SOAP',
      subtitulo: 'Subjetivo, Objetivo, Avaliação e Plano privativo',
      icone: Activity,
      exclusivoEnfermeiro: true,
      destino: 'nurse-soap',
      destaque: true,
    },
    {
      tipo: 'Evolução de Enfermagem',
      titulo: 'Evolução de Enfermagem',
      subtitulo: 'Processo de enfermagem em áreas assistenciais',
      icone: FileText,
      exclusivoEnfermeiro: true,
      destino: 'nurse-evolution-assistential-areas',
    },
    {
      tipo: 'Anotação Técnica',
      titulo: 'Anotação Técnica',
      subtitulo: 'Registro pontual de cuidados e procedimentos',
      icone: FileSpreadsheet,
      destino: 'assistential-areas',
    },
    {
      tipo: 'Admissão',
      titulo: 'Admissão',
      subtitulo: 'Acolhimento e histórico de entrada',
      icone: UserPlus,
      destino: userRole === 'nurse' ? 'nurse-admission-assistential-areas' : 'admission-assistential-areas',
    },
    {
      tipo: 'Feridas',
      titulo: 'Avaliação de Feridas',
      subtitulo: 'Mensuração, tecido e condutas de curativo',
      icone: HeartPulse,
      destino: 'nurse-wounds-assessment',
    },
  ];

  // Monitora alterações na identificação para validação de privacidade
  const handleIdentificacaoChange = (val: string) => {
    setIdentificacao(val);
    const check = PrivacyGuard.validateAnonymousIdentifier(val);
    if (!check.isSafe && check.message) {
      setPrivacyWarning(check.message);
    } else {
      setPrivacyWarning(null);
    }
  };

  const handleSubmeter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identificacao.trim()) {
      onShowNotice('Por favor, informe a identificação anônima (ex: iniciais L.L.S. ou código interno).');
      return;
    }

    // Se o usuário digitou um nome longo, converte automaticamente em iniciais para proteger a privacidade
    const check = PrivacyGuard.validateAnonymousIdentifier(identificacao);
    const identificacaoFinal = check.suggestedInitials || identificacao.trim().toUpperCase();

    setIsStarting(true);
    const resourceId = generateQuotaResourceId('atend');
    let quotaPermitId: string | undefined;
    let quotaPeriod: string | undefined;

    try {
      const reservation = await QuotaService.reserveDocument(resourceId);
      quotaPermitId = reservation.permitId;
      quotaPeriod = reservation.period;
      UsageTracker.setAuthoritativeUsage(usuarioId, QuotaService.toUserUsage(reservation));
    } catch (error) {
      setIsStarting(false);
      if (error instanceof QuotaServiceError && error.type === 'quota_exceeded') {
        onShowNotice(error.message);
        return;
      }

      // Preserva o trabalho offline: o rascunho pode nascer localmente, mas só será
      // sincronizado quando o backend autorizar a cota.
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        onShowNotice('Você está offline. O atendimento será preservado neste dispositivo e a cota será validada antes da sincronização.');
      } else {
        onShowNotice(error instanceof Error ? error.message : 'Não foi possível validar a cota agora. Tente novamente.');
        return;
      }
    }

    const novoAtendimento = AtendimentoService.criarAtendimento({
      id: resourceId,
      usuarioId,
      identificacao: identificacaoFinal,
      idade: idade.trim(),
      sexo,
      setor: setor.trim() || 'Geral',
      leito: leito.trim(),
      tipoRegistro,
      status: 'em_andamento',
      modeloId: modeloSelecionado?.id,
      modeloNome: modeloSelecionado?.titulo,
      versaoModelo: modeloSelecionado?.versaoModelo,
      usuarioResponsavel: usuarioId,
      perfilProfissional: userRole === 'nurse' ? 'Enfermeiro(a)' : 'Técnico(a) em Enfermagem',
      categoriaClinica: setor.trim() || 'Geral',
      quotaPermitId,
      quotaPeriod,
      quotaValidationStatus: quotaPermitId ? 'authorized' : 'pending',
    });

    setIsStarting(false);

    const configTipo = TIPOS_REGISTRO.find((t) => t.tipo === tipoRegistro);
    const destinoScreen = modeloSelecionado?.moduloDestino || (configTipo ? configTipo.destino : 'nurse-soap');

    onIniciarAtendimento(novoAtendimento, destinoScreen, modeloSelecionado);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Barra superior de navegação */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('model-library')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Biblioteca de Modelos</span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Atendimento Anônimo
          </span>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Novo Atendimento
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Escolha um modelo de documentação estruturada ou preencha de forma livre.
            </p>
          </div>
        </div>

        {/* Banner estrito de privacidade */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="font-semibold block text-amber-950 mb-0.5">
              Privacidade do Paciente por Padrão:
            </strong>
            Para proteger a privacidade do paciente, utilize preferencialmente apenas iniciais ou identificadores internos. O sistema não armazena nomes completos, CPF, endereço ou documentos pessoais.
          </div>
        </div>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmeter} className="space-y-6">
        {/* Bloco 0: Escolher Modelo de Enfermagem (Etapa Integrada) */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-indigo-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                1. Escolher Modelo de Enfermagem
              </h2>
              <HelpTooltip
                id="tooltip-novo-atendimento-modelo"
                title="Assistente IA"
                text="Modelos inteligentes estruturados para guiar o raciocínio clínico e agilizar a redação."
              />
            </div>
            <button
              type="button"
              onClick={() => onNavigate('model-library')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
            >
              Ver todos na biblioteca
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Selecione um roteiro de boas práticas para pré-carregar os campos sugeridos e o método de registro.
          </p>

          {/* Cards de Modelos em Destaque Rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={desmarcarModelo}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                !modeloSelecionado
                  ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Registro Livre (Sem Modelo)
                  </span>
                  {!modeloSelecionado && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Preenchimento manual flexível em qualquer módulo clínico.
                </p>
              </div>
            </button>

            {MODELOS_PADRAO.slice(0, 5).map((mod) => {
              const isSel = modeloSelecionado?.id === mod.id;
              const isPrem = mod.nivelAcesso === 'premium';
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => aplicarModelo(mod)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSel
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {mod.titulo}
                      </span>
                      {isSel && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {mod.categoria}
                      </span>
                      {isPrem && (
                        <span className="inline-flex items-center gap-0.5 text-amber-800 font-semibold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          Premium
                        </span>
                      )}
                      <span className="text-slate-600">v{mod.versaoModelo}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Card Detalhado dos Campos Sugeridos Carregados */}
          {modeloSelecionado && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950">
                    Modelo Ativo: {modeloSelecionado.titulo} (v{modeloSelecionado.versaoModelo})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarDetalhesModelo(!mostrarDetalhesModelo)}
                  className="text-xs font-medium text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                >
                  {mostrarDetalhesModelo ? (
                    <>
                      <span>Recolher campos</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Ver {modeloSelecionado.camposNecessarios.length} campos sugeridos</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {mostrarDetalhesModelo && (
                <div className="space-y-2 pt-2 border-t border-indigo-200/60 text-xs">
                  <p className="text-slate-700 leading-relaxed">
                    <strong>Foco Clínico:</strong> {modeloSelecionado.focoClinico}
                  </p>

                  <div className="space-y-1 pt-1">
                    <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-600" />
                      Campos Sugeridos para a Documentação:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modeloSelecionado.camposNecessarios.map((campo) => (
                        <div
                          key={campo.id}
                          className="bg-white p-2 rounded-lg border border-indigo-100 text-[11px]"
                        >
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            {campo.secaoSoap && (
                              <span className="w-3.5 h-3.5 rounded bg-indigo-600 text-white text-[9px] flex items-center justify-center">
                                {campo.secaoSoap}
                              </span>
                            )}
                            <span>{campo.rotulo}</span>
                          </div>
                          <div className="text-slate-500 mt-0.5 text-[10px]">
                            {campo.dica}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bloco 2: Identificação e Dados Demográficos Básicos */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            Dados Básicos do Atendimento
          </h2>

          {/* Campo Identificação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Identificação (Iniciais ou Código Anônimo) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identificacao}
                onChange={(e) => handleIdentificacaoChange(e.target.value)}
                placeholder="Ex: L.L.S. ou LEITO-05-A"
                className="w-full text-base font-medium px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            {privacyWarning && (
              <p className="text-xs text-amber-700 mt-2 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {privacyWarning}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Exemplo de boas práticas: utilize as 3 iniciais do paciente separadas por pontos.
            </p>
          </div>

          {/* Grid Idade e Sexo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Idade (Anos)
              </label>
              <input
                type="number"
                min="0"
                max="130"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 67"
                className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Sexo
              </label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value as SexoAtendimento)}
                className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
                <option value="Não informado">Não informado</option>
              </select>
            </div>
          </div>

          {/* Grid Setor e Leito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Setor / Unidade
              </label>
              <input
                type="text"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                placeholder="Ex: UTI, Pronto Atendimento, Clínica Médica"
                className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-slate-500" />
                Leito / Acomodação
              </label>
              <input
                type="text"
                value={leito}
                onChange={(e) => setLeito(e.target.value)}
                placeholder="Ex: 05, Leito 12, Isolamento 01"
                className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Tipo de Registro */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>Tipo de Registro Clínico</span>
              <HelpTooltip
                id="tooltip-novo-atendimento-tipo"
                title="Módulos Clínicos"
                text="Selecione o instrumento técnico compatível com suas atribuições profissionais."
              />
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione o instrumento técnico adequado para este atendimento.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {TIPOS_REGISTRO.map((item) => {
              const Icon = item.icone;
              const isSelected = tipoRegistro === item.tipo;
              const isNurseOnly = item.exclusivoEnfermeiro && userRole === 'technician';

              return (
                <button
                  key={item.tipo}
                  type="button"
                  disabled={isNurseOnly}
                  onClick={() => setTipoRegistro(item.tipo)}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-2 ring-teal-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                  } ${isNurseOnly ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900">
                        {item.titulo}
                      </span>
                      {item.destaque && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {item.subtitulo}
                    </p>
                    {isNurseOnly && (
                      <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                        Privativo para Enfermeiro
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Ação Principal (Grande, mobile-first, poucos cliques) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isStarting}
            className="w-full disabled:opacity-60 disabled:cursor-not-allowed bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 text-base sm:text-lg cursor-pointer active:scale-[0.99]"
          >
            <span>{isStarting ? 'Validando cota...' : 'Iniciar Documentação Clínica'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-xs text-slate-500 mt-2.5">
            Ao continuar, os dados preenchidos serão integrados com segurança ao módulo clínico selecionado.
          </p>
        </div>
      </form>
    </div>
  );
};
