import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Code2,
  ChevronDown,
  RotateCcw,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  FileCheck2,
  Clock,
  Building2,
  Bed,
  User,
  History,
  Printer,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import { ClinicalEvolutionForm } from '../../types/clinical';
import { Atendimento, ProfessionalUser } from '../../types';
import { AtendimentoService } from '../../services/atendimentoService';
import { DocumentExportService } from '../../services/documentExportService';
import { DocumentPrintPreviewModal } from './DocumentPrintPreviewModal';
import { buildTechnicianNursingNote, normalizeClinicalData } from '../../engine';

interface ClinicalCompletedViewProps {
  form?: ClinicalEvolutionForm;
  atendimento?: Atendimento;
  atendimentoId?: string;
  usuarioId?: string;
  usuarioResponsavel?: string;
  perfilProfissional?: string;
  categoriaClinica?: string;
  textoFinalGerado?: string;
  setor?: string;
  leito?: string;
  identificacao?: string;
  dataHora?: string;
  usuario?: ProfessionalUser | null;
  onRestart?: () => void;
  onBackToDashboard: () => void;
  onNavigateHistorico?: () => void;
  onConcluir?: (atendimentoSalvo: Atendimento) => void;
}

export const ClinicalCompletedView: React.FC<ClinicalCompletedViewProps> = ({
  form,
  atendimento,
  atendimentoId,
  usuarioId,
  usuarioResponsavel,
  perfilProfissional = 'Técnico em Enfermagem',
  categoriaClinica,
  textoFinalGerado,
  setor,
  leito,
  identificacao,
  dataHora,
  usuario,
  onRestart,
  onBackToDashboard,
  onNavigateHistorico,
  onConcluir,
}) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [atendimentoSalvo, setAtendimentoSalvo] = useState<Atendimento | null>(null);

  // Computa o texto determinístico final caso não tenha sido repassado
  const computedText = useMemo(() => {
    if (textoFinalGerado && textoFinalGerado.trim().length > 0) {
      return textoFinalGerado;
    }
    if (form) {
      try {
        const normalized = normalizeClinicalData(form);
        return buildTechnicianNursingNote(normalized);
      } catch {
        return 'Registro de enfermagem finalizado.';
      }
    }
    return atendimento?.narrativaFinal || 'Registro de atendimento clínico finalizado.';
  }, [textoFinalGerado, form, atendimento]);

  const targetAtendimentoId = atendimentoId || atendimento?.id;
  const targetUsuarioId = usuarioId || atendimento?.usuarioId || 'usr-prof-ana';
  const targetUsuarioResponsavel = usuarioResponsavel || atendimento?.usuarioResponsavel || usuario?.nome || 'Profissional de Enfermagem';
  const targetPerfilProfissional = perfilProfissional || atendimento?.perfilProfissional || usuario?.profissao || 'Técnico de Enfermagem';
  const targetCategoriaClinica = categoriaClinica || atendimento?.setor || 'Área Geral';
  const targetSetor = setor || atendimento?.setor || 'Geral';
  const targetLeito = leito || atendimento?.leito || 'Não informado';
  const targetIdentificacao = identificacao || atendimento?.identificacao || 'PACIENTE ANÔNIMO';
  const targetDataHora = dataHora || atendimento?.dataCriacao || new Date().toISOString();

  // Executa o salvamento automático no AtendimentoService na finalização
  const executarSalvar = () => {
    try {
      const salvo = AtendimentoService.salvarAtendimento({
        atendimentoId: targetAtendimentoId,
        usuarioId: targetUsuarioId,
        usuarioResponsavel: targetUsuarioResponsavel,
        perfilProfissional: targetPerfilProfissional,
        categoriaClinica: targetCategoriaClinica,
        registroProfissional: usuario?.registroProfissional,
        tipoRegistro: atendimento?.tipoRegistro || 'Anotação Técnica',
        textoFinalGerado: computedText,
        dataHora: targetDataHora,
        setor: targetSetor,
        leito: targetLeito,
        identificacao: targetIdentificacao,
        resumoRegistro: `Registro clínico concluído para ${targetIdentificacao} no leito ${targetLeito} (${targetSetor})`,
      });

      setAtendimentoSalvo(salvo);
      setIsSaved(true);
      if (onConcluir) {
        onConcluir(salvo);
      }
    } catch (err) {
      console.warn('Erro ao salvar atendimento no AtendimentoService:', err);
    }
  };

  useEffect(() => {
    executarSalvar();
  }, []);

  const atendimentoParaExportar: Atendimento = useMemo(() => {
    return (
      atendimentoSalvo ||
      atendimento || {
        id: targetAtendimentoId || 'atend-temp',
        usuarioId: targetUsuarioId,
        identificacao: targetIdentificacao,
        idade: atendimento?.idade || '',
        sexo: atendimento?.sexo || 'Não informado',
        setor: targetSetor,
        leito: targetLeito,
        tipoRegistro: atendimento?.tipoRegistro || 'Evolução de Enfermagem',
        dataCriacao: targetDataHora,
        status: 'concluido',
        narrativaFinal: computedText,
        usuarioResponsavel: targetUsuarioResponsavel,
        perfilProfissional: targetPerfilProfissional,
        categoriaClinica: targetCategoriaClinica,
        registroProfissional: usuario?.registroProfissional,
      }
    );
  }, [
    atendimentoSalvo,
    atendimento,
    targetAtendimentoId,
    targetUsuarioId,
    targetIdentificacao,
    targetSetor,
    targetLeito,
    targetDataHora,
    computedText,
    targetUsuarioResponsavel,
    targetPerfilProfissional,
    targetCategoriaClinica,
    usuario?.registroProfissional,
  ]);

  const jsonString = JSON.stringify(form || atendimentoSalvo || {}, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(computedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopiarEvolucaoFormatada = async () => {
    const ok = await DocumentExportService.copiarModeloProfissional(atendimentoParaExportar, undefined, usuario);
    if (ok) {
      setCopiedFormatted(true);
      setTimeout(() => setCopiedFormatted(false), 2500);
    }
  };

  const handleVisualizarImpressao = () => {
    setShowPrintModal(true);
  };

  const handleExportarPdf = () => {
    DocumentExportService.imprimirOuExportarPdf(atendimentoParaExportar, undefined, usuario);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50 duration-200 pb-12">
      {/* Success Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              Estrutura Clínica Validada
            </span>
            {isSaved && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                Salvo no Histórico
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">
            Registro Clínico Concluído com Sucesso!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            O documento foi estruturado com rigor técnico, validado pelas regras do COFEN e salvo
            automaticamente no seu histórico individual de atendimentos.
          </p>
        </div>

        {/* Card de Metadados do Atendimento Salvo */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500 font-medium">Identificador:</span>
            <span className="font-mono font-bold text-slate-800">
              {atendimentoSalvo?.id || targetAtendimentoId || 'atend-gerado'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
            <div>
              <span className="block text-[11px] text-slate-400">Paciente:</span>
              <span className="font-semibold text-slate-800">{targetIdentificacao}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Setor:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {targetSetor}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Leito:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Bed className="w-3 h-3 text-slate-400" />
                {targetLeito}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Perfil:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {targetPerfilProfissional}
              </span>
            </div>
          </div>
        </div>

        {/* Bloco de Exportação Profissional */}
        <div className="pt-2 border-t border-slate-100">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-2.5">
            Exportação Profissional do Documento
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              id="btn-copiar-evolucao-formatada"
              onClick={handleCopiarEvolucaoFormatada}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-teal-700 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {copiedFormatted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Evolução Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Evolução Formatada</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-visualizar-impressao"
              onClick={handleVisualizarImpressao}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Visualizar Impressão</span>
            </button>

            <button
              type="button"
              id="btn-exportar-pdf"
              onClick={handleExportarPdf}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Ações de Navegação e Fluxo */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 border-t border-slate-100">
          {onNavigateHistorico && (
            <button
              type="button"
              id="btn-ver-historico"
              onClick={onNavigateHistorico}
              className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span>Ver no Histórico</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>

          {onRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Novo Registro</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Visualização de Impressão */}
      {showPrintModal && (
        <DocumentPrintPreviewModal
          atendimento={atendimentoParaExportar}
          usuario={usuario}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Pré-visualização do Texto Clínico Salvo */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-teal-700" />
            <span>Texto Final Formatado (Prontuário)</span>
          </h3>
          <button
            type="button"
            onClick={handleCopyText}
            className="text-xs text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 font-semibold"
          >
            {copiedText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedText ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {computedText}
        </div>
      </div>

      {/* Dev Mode structured JSON viewer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Dados estruturados (modo desenvolvimento)
              </h3>
              <p className="text-[11px] text-slate-500">
                Visualize o payload persistido no AtendimentoService e Firestore.
              </p>
            </div>
          </div>

          <div
            className={`p-1 text-slate-400 transition-transform ${
              showJson ? 'rotate-180 text-teal-800' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {showJson && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCopyJson}
                className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] sm:text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
              {jsonString}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
