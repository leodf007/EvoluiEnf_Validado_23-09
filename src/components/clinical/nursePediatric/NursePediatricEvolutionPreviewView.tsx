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
  Info,
  Lock,
} from 'lucide-react';
import { NursePediatricEvolutionForm } from '../../../types/nursePediatricEvolution';
import {
  buildAuthorizedNursePediatricEvolutionFacts,
  auditNursePediatricEvolutionNarrative,
} from '../../../engine/nursePediatricEvolutionFactBuilder';
import { buildNursePediatricEvolutionNoteWithTrace } from '../../../engine/nursePediatricEvolutionNoteBuilder';
import { refineNursePediatricEvolutionWithAI } from '../../../services/nursePediatricAiRefinementService';
import { AIRefinementRequestResult } from '../../../services/aiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';

interface NursePediatricEvolutionPreviewViewProps {
  form: NursePediatricEvolutionForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
}

export const NursePediatricEvolutionPreviewView: React.FC<NursePediatricEvolutionPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'Pediatria',
}) => {
  const authorizedFacts = buildAuthorizedNursePediatricEvolutionFacts(form);
  const { narrative: deterministicBaseline, traces } = buildNursePediatricEvolutionNoteWithTrace(authorizedFacts);
  const auditResult = auditNursePediatricEvolutionNarrative(deterministicBaseline, authorizedFacts);

  const [activeText, setActiveText] = useState<string>(deterministicBaseline);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementStatus, setRefinementStatus] = useState<AIRefinementRequestResult | null>(null);

  const piiCheck = checkPrivacyGuards(activeText);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefineWithAI = async () => {
    setIsRefining(true);
    try {
      const result = await refineNursePediatricEvolutionWithAI(form, authorizedFacts, deterministicBaseline);
      setRefinementStatus(result);
      if (result.success && result.refinedText) {
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
          id="btn-back-to-edit"
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para edição
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-evolution"
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Texto
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Evolução de Enfermagem — {patientAreaName}
              </h2>
              <p className="text-xs text-slate-500">
                Texto estruturado conforme COFEN, rastreabilidade clínica 1:1 e travas pediátricas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {refinementStatus?.source === 'gemini_api' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                <Sparkles className="w-3 h-3" />
                Refinado por IA (validado)
              </span>
            )}
            {refinementStatus?.source === 'fallback_deterministic' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Lock className="w-3 h-3" />
                Base Determinística (segurança)
              </span>
            )}
          </div>
        </div>

        {/* Narrative Box */}
        <div className="p-4 sm:p-6">
          <div
            id="clinical-evolution-text-preview"
            className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text"
          >
            {activeText || 'Nenhum dado clínico preenchido para gerar a evolução.'}
          </div>
        </div>

        {/* Action Bar inside card */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Auditoria 1:1: {auditResult.passed ? '100% rastreável aos fatos clínicos' : 'Avisos de rastreabilidade'}</span>
          </div>

          <div className="flex items-center gap-2">
            {activeText !== deterministicBaseline && (
              <button
                id="btn-reset-deterministic"
                type="button"
                onClick={handleResetToDeterministic}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar texto determinístico
              </button>
            )}

            <button
              id="btn-refine-ai"
              type="button"
              onClick={handleRefineWithAI}
              disabled={isRefining || !activeText.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isRefining ? 'Refinando com IA...' : 'Refinar com IA segura'}
            </button>
          </div>
        </div>
      </div>

      {/* Refinement Alerts if any */}
      {refinementStatus && !refinementStatus.success && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-semibold">Refinamento da IA não aprovado pelos mecanismos de segurança</div>
            <p className="text-amber-800">{refinementStatus.error}</p>
            {refinementStatus.rejectionReasons && refinementStatus.rejectionReasons.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-700 pt-1">
                {refinementStatus.rejectionReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-amber-800 pt-1">
              O texto foi mantido na versão determinística segura e auditada.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notification */}
      {piiCheck.hasPotentialPII && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-semibold">Possível dado sensível identificado</div>
            <p className="text-red-700">
              {piiCheck.matches.map((m) => m.description).join(', ') || 'Verifique identificadores nominais ou dados pessoais.'}
            </p>
          </div>
        </div>
      )}

      {/* Traceability Details Accordion */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          Rastreabilidade de Fatos Clínicos ({traces.length} sentenças mapeadas)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Cada afirmação do prontuário é estritamente respaldada pelo registro clínico do enfermeiro.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {traces.map((tr, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <span className="text-slate-800 font-medium">{tr.text}</span>
              <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                {tr.factIds.join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
