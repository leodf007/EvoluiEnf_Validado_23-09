import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  FileText,
  Building2,
  Bed,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Atendimento, ProfessionalUser } from '../../types';
import { DocumentExportService } from '../../services/documentExportService';

interface DocumentPrintPreviewModalProps {
  atendimento: Atendimento;
  usuario?: ProfessionalUser | null;
  onClose: () => void;
  onShowNotice?: (msg: string) => void;
}

export const DocumentPrintPreviewModal: React.FC<DocumentPrintPreviewModalProps> = ({
  atendimento,
  usuario,
  onClose,
  onShowNotice,
}) => {
  const [copied, setCopied] = useState(false);

  const nome = atendimento.usuarioResponsavel || usuario?.nome || 'Profissional de Enfermagem';
  const categoria = DocumentExportService.normalizarCategoria(atendimento.perfilProfissional || usuario?.profissao);
  const registro = usuario?.registroProfissional || 'COREN Ativo';
  const dataHora = DocumentExportService.formatarDataHora(atendimento.dataCriacao);
  const documento = atendimento.tipoRegistro || 'Evolução de Enfermagem';
  const setor = atendimento.setor || 'Setor Geral';
  const leito = atendimento.leito ? `Leito ${atendimento.leito}` : 'Não especificado';
  const identificacao = atendimento.identificacao || 'PACIENTE ANÔNIMO';
  const conteudo = DocumentExportService.extrairConteudoClinico(atendimento);

  const handleCopyFormatted = async () => {
    const success = await DocumentExportService.copiarModeloProfissional(atendimento, undefined, usuario);
    if (success) {
      setCopied(true);
      if (onShowNotice) {
        onShowNotice('Evolução formatada copiada com sucesso!');
      }
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrintOrPdf = () => {
    DocumentExportService.imprimirOuExportarPdf(atendimento, undefined, usuario);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Visualização de Impressão</h2>
              <p className="text-[11px] text-slate-500">
                Modelo Profissional • Padrão Assistencial para Prontuário
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-modal-copiar-formatado"
              onClick={handleCopyFormatted}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Copiar texto estruturado"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Modelo</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-modal-imprimir-pdf"
              onClick={handlePrintOrPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-800 hover:bg-teal-900 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pré-visualização da Folha de Impressão (Estilo A4) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-5 text-slate-800">
            {/* Header da Folha */}
            <div className="border-b-2 border-teal-700 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                  EvoluiEnf • Documentação Assistencial de Enfermagem
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Evolução de Enfermagem
                </h1>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Id Anônimo</span>
                <span className="text-xs font-bold text-slate-700">{identificacao}</span>
              </div>
            </div>

            {/* Metadados Estruturados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Profissional</span>
                <span className="font-semibold text-slate-800">{nome}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Categoria</span>
                <span className="font-semibold text-slate-800">{categoria}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registro</span>
                <span className="font-semibold text-slate-800">{registro}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Data/Hora</span>
                <span className="font-semibold text-slate-800">{dataHora}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Documento</span>
                <span className="font-semibold text-slate-800">{documento}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Setor</span>
                <span className="font-semibold text-slate-800">{setor}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Leito</span>
                <span className="font-semibold text-slate-800">{leito}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="font-bold text-teal-800">Concluído</span>
              </div>
            </div>

            {/* Conteúdo Clínico */}
            <div>
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wide block pb-1 border-b border-slate-200 mb-3">
                Conteúdo Clínico Documentado
              </span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {conteudo}
              </div>
            </div>

            {/* Rodapé e Assinatura */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
              <div className="text-center sm:text-left">
                <p>Documento gerado eletronicamente para prontuário.</p>
                <p>Identificação anônima em conformidade com as diretrizes de privacidade.</p>
              </div>

              <div className="text-center sm:text-right border-t border-slate-400 pt-2 min-w-[200px]">
                <p className="font-bold text-slate-800 text-xs">{nome}</p>
                <p className="text-slate-600">{categoria} • {registro}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            Em conformidade com as resoluções vigentes do COFEN
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
