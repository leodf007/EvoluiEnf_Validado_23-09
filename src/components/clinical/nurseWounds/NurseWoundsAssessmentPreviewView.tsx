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
import { NurseWoundsAssessmentForm } from '../../../types/nurseWoundsAssessment';
import {
  buildAuthorizedNurseWoundsFacts,
  auditNurseWoundsNarrative,
} from '../../../engine/nurseWoundsFactBuilder';
import { buildNurseWoundsAssessmentNoteWithTrace } from '../../../engine/nurseWoundsAssessmentBuilder';
import { refineNurseWoundsWithAI } from '../../../services/nurseWoundsAiRefinementService';
import { AIRefinementRequestResult } from '../../../services/aiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';

interface NurseWoundsAssessmentPreviewViewProps {
  form: NurseWoundsAssessmentForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
}

export const NurseWoundsAssessmentPreviewView: React.FC<NurseWoundsAssessmentPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'Geral',
}) => {
  const authorizedFacts = buildAuthorizedNurseWoundsFacts(form);
  const { narrative: deterministicBaseline, traces } =
    buildNurseWoundsAssessmentNoteWithTrace(authorizedFacts);
  const auditResult = auditNurseWoundsNarrative(deterministicBaseline, authorizedFacts);

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
      const result = await refineNurseWoundsWithAI(form, authorizedFacts, deterministicBaseline);
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
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à edição</span>
        </button>

        <div className="flex items-center gap-2">
          {refinementStatus?.success && (
            <button
              type="button"
              onClick={handleResetToDeterministic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Base Determinística</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Avaliação'}</span>
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900">
                Avaliação de Feridas — {patientAreaName}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Registro estruturado de lesões, leito, bordas, medidas, estadiamento manual e plano de curativo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              WoundFactLock Ativo
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              <Lock className="w-3.5 h-3.5" />
              DressingActionLock Ativo
            </span>
          </div>
        </div>
      </div>

      {/* AI Refinement Status Notification if any */}
      {refinementStatus && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm ${
            refinementStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {refinementStatus.success ? (
              <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-semibold">
                {refinementStatus.success
                  ? 'Texto refinado estilisticamente pela IA e validado pelos Locks de Feridas'
                  : 'Refinamento automático não aplicado (Mantida a base factual determinística)'}
              </p>
              {refinementStatus.error && <p className="mt-1 text-xs">{refinementStatus.error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Guard Alert */}
      {piiCheck.hasPotentialPII && (
        <div className="p-4 rounded-xl border bg-rose-50 border-rose-200 text-rose-900 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-semibold">PrivacyGuard: Identificadores detectados no texto.</p>
          </div>
        </div>
      )}

      {/* Main Text Content */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Texto da Avaliação Clínica
            </span>
            {activeText === deterministicBaseline ? (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                Base Determinística
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-100 text-purple-800 rounded-md">
                Refinado por IA (Locks Verificados)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefineWithAI}
            disabled={isRefining}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRefining ? 'Refinando...' : 'Refinar Estilo com IA'}</span>
          </button>
        </div>

        <div className="text-slate-800 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-slate-50/70 p-4 rounded-xl border border-slate-100">
          {activeText || 'Nenhum fato clínico documentado para geração da avaliação.'}
        </div>
      </div>

      {/* Audit and Trace Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Auditoria de Rastreabilidade Factual (NarrativeFactTrace)
            </h2>
          </div>
          <span
            className={`px-2 py-0.5 text-[11px] font-bold rounded ${
              auditResult.passed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {auditResult.passed ? '100% Rastreável' : 'Segmentos Não Rastreáveis'}
          </span>
        </div>

        <div className="space-y-2">
          {traces.map((trace, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <span className="font-semibold text-slate-700 block">{trace.text}</span>
                <span className="text-[10px] text-slate-600 block">
                  Categoria: {trace.category} • Fatos:{' '}
                  {trace.factIds?.join(', ') || 'direto'}
                </span>
              </div>
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono bg-teal-50 text-teal-700 rounded border border-teal-200">
                Auditado
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
