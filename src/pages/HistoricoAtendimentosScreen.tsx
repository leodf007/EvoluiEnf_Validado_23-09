import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowRight,
  FileText,
  Activity,
  PlusCircle,
  Copy,
  Check,
  Building2,
  Bed,
  Eye,
  Trash2,
  Printer,
  Download,
  ShieldCheck,
  User,
  History,
  FileCheck,
  AlertCircle,
  Tag,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { Atendimento, TipoRegistroAtendimento, AppScreen, ProfessionalUser } from '../types';
import { AtendimentoService } from '../services/atendimentoService';
import { DocumentExportService } from '../services/documentExportService';
import { DocumentPrintPreviewModal } from '../components/clinical/DocumentPrintPreviewModal';

interface HistoricoAtendimentosScreenProps {
  usuarioId: string;
  usuario?: ProfessionalUser | null;
  onNavigate: (screen: AppScreen) => void;
  onSelecionarAtendimento?: (atendimento: Atendimento) => void;
  onShowNotice: (msg: string) => void;
}

export const HistoricoAtendimentosScreen: React.FC<HistoricoAtendimentosScreenProps> = ({
  usuarioId,
  usuario,
  onNavigate,
  onSelecionarAtendimento,
  onShowNotice,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [itemSelecionado, setItemSelecionado] = useState<Atendimento | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [itemParaImprimir, setItemParaImprimir] = useState<Atendimento | null>(null);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>(() =>
    AtendimentoService.listarAtendimentos(usuarioId)
  );

  // Sincroniza atendimentos com Firestore em segundo plano
  useEffect(() => {
    let isMounted = true;
    AtendimentoService.listarAtendimentosAsync(usuarioId).then((items) => {
      if (isMounted) setAtendimentos(items);
    });
    return () => {
      isMounted = false;
    };
  }, [usuarioId]);

  // Filtra por termo de busca e tipo de registro
  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter((item) => {
      const matchBusca =
        item.identificacao.toLowerCase().includes(busca.toLowerCase()) ||
        item.setor.toLowerCase().includes(busca.toLowerCase()) ||
        item.leito.toLowerCase().includes(busca.toLowerCase());

      const matchTipo =
        filtroTipo === 'todos' || item.tipoRegistro.toLowerCase() === filtroTipo.toLowerCase();

      return matchBusca && matchTipo;
    });
  }, [atendimentos, busca, filtroTipo]);

  const formatarDataHora = (isoDate: string) => {
    const d = new Date(isoDate);
    const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { data, hora };
  };

  const handleCopiarEvolucaoFormatada = async (item: Atendimento, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = await DocumentExportService.copiarModeloProfissional(item, undefined, usuario);
    if (success) {
      setCopiadoId(item.id);
      onShowNotice('Evolução formatada copiada com sucesso!');
      setTimeout(() => setCopiadoId(null), 2500);
    } else {
      // Fallback
      const fallback = item.narrativaFinal || item.resumoRegistro || `Atendimento ${item.identificacao}`;
      navigator.clipboard.writeText(fallback);
      setCopiadoId(item.id);
      onShowNotice('Texto copiado para a área de transferência!');
      setTimeout(() => setCopiadoId(null), 2500);
    }
  };

  const handleImprimirOuExportar = (item: Atendimento, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemParaImprimir(item);
  };

  const handleVisualizar = (item: Atendimento, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemSelecionado(item);
  };

  const handleExcluir = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Deseja realmente remover este atendimento do histórico local?')) {
      AtendimentoService.excluirAtendimento(id);
      onShowNotice('Atendimento removido do histórico.');
      setAtendimentos((prev) => prev.filter((a) => a.id !== id));
      if (itemSelecionado?.id === id) {
        setItemSelecionado(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Gestão de Produtividade Clínica
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Histórico de Atendimentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registro cronológico das notas e evoluções estruturadas realizadas pelo profissional.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('novo-atendimento')}
          className="inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-4 py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-sm self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Atendimento</span>
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por iniciais, setor ou leito..."
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full sm:w-auto text-xs sm:text-sm font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 outline-none"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="Evolução SOAP">Evolução SOAP</option>
            <option value="Evolução de Enfermagem">Evolução de Enfermagem</option>
            <option value="Anotação Técnica">Anotação Técnica</option>
            <option value="Admissão">Admissão</option>
            <option value="Feridas">Feridas</option>
          </select>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      {atendimentosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Nenhum atendimento encontrado</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Não foram encontrados atendimentos com os critérios informados. Inicie um novo atendimento anônimo para documentar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('novo-atendimento')}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Iniciar Primeiro Atendimento</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {atendimentosFiltrados.map((item) => {
            const { data, hora } = formatarDataHora(item.dataCriacao);
            const isSoap = item.tipoRegistro.includes('SOAP');

            return (
              <div
                key={item.id}
                onClick={() => setItemSelecionado(item)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Lado Esquerdo: Identificação Anônima e Meta */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs ${
                      isSoap
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-teal-100 text-teal-900 border border-teal-200'
                    }`}
                  >
                    {isSoap ? <Activity className="w-5 h-5 text-emerald-800" /> : <FileText className="w-5 h-5 text-teal-800" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-900">
                        {item.identificacao}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isSoap
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.tipoRegistro}
                      </span>
                      {item.versaoAtual && item.versaoAtual > 1 && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          v{item.versaoAtual}
                        </span>
                      )}

                      {/* Status do Atendimento (Rascunho / Concluído / Exportado) */}
                      {item.status === 'exportado' ? (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-indigo-600" />
                          Exportado
                        </span>
                      ) : item.status === 'concluido' ? (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-teal-600" />
                          Concluído
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Rascunho
                        </span>
                      )}

                      {/* Indicador sutil de sincronização */}
                      {item.sincronizacao?.status === 'sincronizado' ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1" title="Sincronizado na nuvem">
                          <Cloud className="w-3 h-3 text-emerald-600" />
                          Nuvem
                        </span>
                      ) : item.sincronizacao?.status === 'conflito' ? (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-1" title="Versões preservadas com segurança">
                          <History className="w-3 h-3 text-purple-600" />
                          Preservado
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1" title="Salvo com segurança no dispositivo local">
                          <Cloud className="w-3 h-3 text-slate-400" />
                          Dispositivo
                        </span>
                      )}
                    </div>

                    {/* Metadados Auditáveis: Profissional, Categoria e Setor */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.usuarioResponsavel || usuario?.nome || 'Profissional'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {item.perfilProfissional || usuario?.profissao || 'Enfermeiro'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {item.setor}
                        {item.leito && ` (Leito ${item.leito})`}
                      </span>
                    </div>

                    {item.resumoRegistro && (
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 italic">
                        "{item.resumoRegistro}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Lado Direito: Data, Hora e Ações Rápidas */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-1 text-xs font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{data}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{hora}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Botão Visualizar */}
                    <button
                      type="button"
                      id={`btn-visualizar-${item.id}`}
                      title="Visualizar detalhes do atendimento"
                      onClick={(e) => handleVisualizar(item, e)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Visualizar</span>
                    </button>

                    {/* Botão Copiar */}
                    <button
                      type="button"
                      id={`btn-copiar-${item.id}`}
                      title="Copiar evolução formatada (modelo profissional)"
                      onClick={(e) => handleCopiarEvolucaoFormatada(item, e)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition-colors cursor-pointer"
                    >
                      {copiadoId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Copiar</span>
                        </>
                      )}
                    </button>

                    {/* Botão Imprimir/Exportar */}
                    <button
                      type="button"
                      id={`btn-imprimir-${item.id}`}
                      title="Imprimir ou exportar documento em PDF"
                      onClick={(e) => handleImprimirOuExportar(item, e)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Imprimir/Exportar</span>
                    </button>

                    {/* Botão Excluir */}
                    <button
                      type="button"
                      title="Excluir do histórico"
                      onClick={(e) => handleExcluir(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes do Atendimento */}
      {itemSelecionado && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setItemSelecionado(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-6 shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">
                    Atendimento: {itemSelecionado.identificacao}
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {itemSelecionado.tipoRegistro}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    Versão {itemSelecionado.versaoAtual || 1}
                  </span>
                  {itemSelecionado.status === 'exportado' ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Exportado
                    </span>
                  ) : itemSelecionado.status === 'concluido' ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      Concluído
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Rascunho
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ID Único: <span className="font-mono text-slate-600">{itemSelecionado.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setItemSelecionado(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* SEÇÃO 1: Dados Originais */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-800" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Dados Originais do Atendimento
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Paciente (Anônimo)</span>
                  <span className="font-semibold text-slate-800">{itemSelecionado.identificacao}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Idade / Sexo</span>
                  <span className="font-semibold text-slate-800">
                    {itemSelecionado.idade ? `${itemSelecionado.idade} anos` : 'N/I'} • {itemSelecionado.sexo || 'N/I'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Setor / Leito</span>
                  <span className="font-semibold text-slate-800">
                    {itemSelecionado.setor} {itemSelecionado.leito ? `- Leito ${itemSelecionado.leito}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Profissional</span>
                  <span className="font-semibold text-slate-800">
                    {itemSelecionado.usuarioResponsavel || usuario?.nome || 'Profissional de Enfermagem'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Categoria</span>
                  <span className="font-semibold text-slate-800">
                    {itemSelecionado.perfilProfissional || usuario?.profissao || 'Enfermeiro'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registro COREN</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {itemSelecionado.registroProfissional || usuario?.registroProfissional || 'COREN Ativo'}
                  </span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: Documento Final */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-teal-800" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Documento Final (Versão {itemSelecionado.versaoAtual || 1})
                  </h3>
                </div>
                {itemSelecionado.dataConclusao && (
                  <span className="text-[11px] text-slate-500">
                    Concluído em {formatarDataHora(itemSelecionado.dataConclusao).data} às {formatarDataHora(itemSelecionado.dataConclusao).hora}
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {itemSelecionado.narrativaFinal ||
                  itemSelecionado.resumoRegistro ||
                  'Nenhuma nota formal foi finalizada para este atendimento.'}
              </div>
            </div>

            {/* SEÇÃO 3: Informações de Auditoria e Rastreabilidade */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-800" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Informações de Auditoria e Rastreabilidade
                </h3>
              </div>

              {/* Grid de Timestamps Críticos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Data/Hora de Criação</span>
                  <span className="font-medium text-slate-800">
                    {formatarDataHora(itemSelecionado.dataCriacao).data} às {formatarDataHora(itemSelecionado.dataCriacao).hora}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data/Hora de Conclusão</span>
                  <span className="font-medium text-slate-800">
                    {itemSelecionado.dataConclusao
                      ? `${formatarDataHora(itemSelecionado.dataConclusao).data} às ${formatarDataHora(itemSelecionado.dataConclusao).hora}`
                      : 'Pendente'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Última Alteração</span>
                  <span className="font-medium text-slate-800">
                    {itemSelecionado.ultimaAlteracao
                      ? `${formatarDataHora(itemSelecionado.ultimaAlteracao).data} às ${formatarDataHora(itemSelecionado.ultimaAlteracao).hora}`
                      : formatarDataHora(itemSelecionado.dataCriacao).data}
                  </span>
                </div>
              </div>

              {/* Linha do Tempo da Trilha de Auditoria */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Trilha de Eventos Registrados
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(itemSelecionado.trilhaAuditoria && itemSelecionado.trilhaAuditoria.length > 0) ? (
                    itemSelecionado.trilhaAuditoria.map((evento, idx) => {
                      const { data: d, hora: h } = formatarDataHora(evento.dataHora);
                      return (
                        <div
                          key={evento.id || `evento-${idx}`}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="mt-0.5 shrink-0">
                            {evento.tipo === 'criacao' && (
                              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            {evento.tipo === 'conclusao' && (
                              <Check className="w-3.5 h-3.5 text-teal-600" />
                            )}
                            {evento.tipo === 'edicao' && (
                              <History className="w-3.5 h-3.5 text-purple-600" />
                            )}
                            {evento.tipo === 'exportacao' && (
                              <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-800 capitalize">
                                Evento: {evento.tipo}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {d} às {h}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{evento.descricao}</p>
                            {evento.usuarioNome && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Responsável: {evento.usuarioNome}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      Registro inicial criado em {formatarDataHora(itemSelecionado.dataCriacao).data}.
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico de Versões Anteriores (Proteção contra Alteração Silenciosa) */}
              {itemSelecionado.historicoVersoes && itemSelecionado.historicoVersoes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block">
                    Histórico de Versões Anteriores Preservadas ({itemSelecionado.historicoVersoes.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {itemSelecionado.historicoVersoes.map((v) => {
                      const { data: vd, hora: vh } = formatarDataHora(v.dataHora);
                      return (
                        <div
                          key={`versao-${v.versao}`}
                          className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-purple-950 font-bold">
                            <span>Versão {v.versao} (Arquivada)</span>
                            <span className="text-[10px] text-purple-700 font-normal">
                              Substituída em {vd} às {vh}
                            </span>
                          </div>
                          {v.motivoAlteracao && (
                            <p className="text-purple-900 italic text-[11px]">
                              Motivo da alteração: {v.motivoAlteracao}
                            </p>
                          )}
                          <div className="p-2.5 rounded-lg bg-white border border-purple-100 font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-28 overflow-y-auto">
                            {v.narrativa}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Ações do Rodapé */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Registro auditável sob conformidade ética e diretrizes de privacidade.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  id="btn-modal-copiar-formatado"
                  onClick={() => handleCopiarEvolucaoFormatada(itemSelecionado)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer border border-teal-200/60"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Modelo</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-imprimir-historico"
                  onClick={() => {
                    const item = itemSelecionado;
                    setItemSelecionado(null);
                    setItemParaImprimir(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Exportar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setItemSelecionado(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão / Exportação PDF */}
      {itemParaImprimir && (
        <DocumentPrintPreviewModal
          atendimento={itemParaImprimir}
          usuario={usuario}
          onClose={() => setItemParaImprimir(null)}
          onShowNotice={onShowNotice}
        />
      )}
    </div>
  );
};
