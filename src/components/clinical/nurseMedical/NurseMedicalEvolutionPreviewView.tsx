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
import { NurseMedicalEvolutionForm } from '../../../types/nurseMedicalEvolution';
import {
  buildAuthorizedNurseMedicalEvolutionFacts,
  auditNurseMedicalEvolutionNarrative,
} from '../../../engine/nurseMedicalEvolutionFactBuilder';
import { buildNurseMedicalEvolutionNoteWithTrace } from '../../../engine/nurseMedicalEvolutionNoteBuilder';
import { refineNurseMedicalEvolutionWithAI } from '../../../services/nurseMedicalAiRefinementService';
import { AIRefinementRequestResult } from '../../../services/aiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';

interface NurseMedicalEvolutionPreviewViewProps {
  form: NurseMedicalEvolutionForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
}

export const NurseMedicalEvolutionPreviewView: React.FC<NurseMedicalEvolutionPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'Clínica Médica',
}) => {
  const authorizedFacts = buildAuthorizedNurseMedicalEvolutionFacts(form);
  const { narrative: deterministicBaseline, traces } = buildNurseMedicalEvolutionNoteWithTrace(authorizedFacts);
  const auditResult = auditNurseMedicalEvolutionNarrative(traces, authorizedFacts);

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
      const result = await refineNurseMedicalEvolutionWithAI(form, authorizedFacts, deterministicBaseline);
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Enfermeiro • Clínica Médica
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Clinical Module Factory V1
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Evolução de Enfermagem — {patientAreaName}
          </h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            {refinementStatus?.source === 'gemini_api' ? 'Versão Refinada (IA)' : 'Base Determinística Canônica'}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Texto gerado a partir dos dados autorizados da enfermaria de Clínica Médica.
        </p>
      </div>

      {/* Fact Audit Status Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Auditoria de Fatos Clínicos Autorizados</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md font-medium text-xs ${
              auditResult.passed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {auditResult.passed ? '100% Rastreado' : 'Segmentos Não Autorizados'}
          </span>
        </div>
        <p className="text-slate-600">
          Segmentos válidos auditados: <strong className="text-slate-900">{auditResult.validSegmentsCount}</strong>.
          Cada linha gerada possui correlação direta com um fato clínico registrado.
        </p>
      </div>

      {/* Privacy Guard Notice */}
      {piiCheck.hasPotentialPII && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-1">Aviso de Privacidade</span>
            Foram detectados possíveis dados identificáveis no texto: {piiCheck.matches.map((m) => m.type).join(', ')}.
          </div>
        </div>
      )}

      {/* Refinement Feedback Notice */}
      {refinementStatus && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm ${
            refinementStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold mb-1">
            {refinementStatus.success ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Refinamento com IA aprovado com sucesso</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-amber-600" />
                <span>Retido na Base Determinística Canônica</span>
              </>
            )}
          </div>
          <p className="text-xs opacity-90">
            {refinementStatus.success
              ? 'O texto foi aprimorado apenas em coesão textual, mantendo 100% da integridade factual.'
              : refinementStatus.rejectionReasons?.join('; ') || refinementStatus.error || 'A base determinística foi preservada com segurança.'}
          </p>
        </div>
      )}

      {/* Evolution Content Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Registro da Evolução de Enfermagem</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-sm sm:text-base whitespace-pre-wrap">
            {activeText}
          </div>
        </div>

        <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Contrato: <span className="font-mono text-slate-700">NURSE_EVOLUTION_MEDICAL_CLINIC</span>
          </div>
          <div className="flex items-center gap-3">
            {refinementStatus?.source === 'gemini_api' && (
              <button
                type="button"
                onClick={handleResetToDeterministic}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Canônico</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRefineWithAI}
              disabled={isRefining}
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRefining ? 'Refinando...' : 'Refinar Texto (IA)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
