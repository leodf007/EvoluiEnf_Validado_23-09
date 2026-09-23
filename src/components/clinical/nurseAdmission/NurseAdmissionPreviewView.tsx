import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  Info,
} from 'lucide-react';
import { NurseAdmissionForm } from '../../../types/nurseAdmissionClinical';
import { buildNurseAdmissionNote } from '../../../engine/nurseAdmissionNoteBuilder';
import { buildAuthorizedNurseAdmissionFacts } from '../../../engine/nurseAdmissionClinicalFactBuilder';
import { refineNurseAdmissionNoteWithAI, NurseAIRefinementResult } from '../../../services/nurseAdmissionAiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';

interface NurseAdmissionPreviewViewProps {
  form: NurseAdmissionForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
}

export const NurseAdmissionPreviewView: React.FC<NurseAdmissionPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'PS / Emergência',
}) => {
  const deterministicBaseline = buildNurseAdmissionNote(form);
  const authorizedFacts = buildAuthorizedNurseAdmissionFacts(form);

  const [activeText, setActiveText] = useState<string>(deterministicBaseline);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementStatus, setRefinementStatus] = useState<NurseAIRefinementResult | null>(null);

  const piiCheck = checkPrivacyGuards(activeText);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefineWithAI = async () => {
    setIsRefining(true);
    try {
      const result = await refineNurseAdmissionNoteWithAI(deterministicBaseline, authorizedFacts);
      setRefinementStatus(result);
      if (result.refinedText) {
        setActiveText(result.refinedText);
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleResetToDeterministic = () => {
    setActiveText(deterministicBaseline);
    setRefinementStatus(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à edição</span>
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          Enfermeiro • Admissão de Enfermagem
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Admissão de Enfermagem — {patientAreaName}
          </h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 self-start sm:self-auto">
            Visualização e Validação Clínica
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Revise a narrativa clínica estruturada gerada a partir dos dados preenchidos. Você pode refinar a coesão textual ou copiar para o prontuário.
        </p>
      </div>

      {/* Privacy Guard Notice if needed */}
      {piiCheck.hasPotentialPII && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong>Aviso de Proteção de Dados:</strong> O texto gerado pode conter dados identificáveis. Remova identificadores diretos de pacientes antes da exportação.
          </div>
        </div>
      )}

      {/* Refinement Feedback Message */}
      {refinementStatus?.message && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-700" />
          <span>{refinementStatus.message}</span>
        </div>
      )}

      {/* Narrative Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Texto da Admissão de Enfermagem
            </span>
            {refinementStatus?.source === 'ai' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Refinado com IA
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {refinementStatus && (
              <button
                type="button"
                onClick={handleResetToDeterministic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                title="Restaurar versão determinística inicial"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restaurar Determinístico</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRefineWithAI}
              disabled={isRefining}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>{isRefining ? 'Refinando...' : 'Refinar com IA'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Text Area Content */}
        <div className="p-5 sm:p-7">
          <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200/80 font-sans text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-teal-100">
            {activeText}
          </div>
        </div>

        {/* Footer Verification Badge */}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Trava de segurança clínica e de fatos autorizados ativa
          </span>
          <span className="hidden sm:inline">EvoluiEnf • Módulo Enfermeiro</span>
        </div>
      </div>
    </div>
  );
};
