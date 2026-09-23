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
import { NurseSurgicalEvolutionForm } from '../../../types/nurseSurgicalEvolution';
import {
  buildAuthorizedNurseSurgicalEvolutionFacts,
  auditNurseSurgicalEvolutionNarrative,
} from '../../../engine/nurseSurgicalEvolutionFactBuilder';
import { buildNurseSurgicalEvolutionNoteWithTrace } from '../../../engine/nurseSurgicalEvolutionNoteBuilder';
import { refineNurseSurgicalEvolutionWithAI } from '../../../services/nurseSurgicalAiRefinementService';
import { AIRefinementRequestResult } from '../../../services/aiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';

interface NurseSurgicalEvolutionPreviewViewProps {
  form: NurseSurgicalEvolutionForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
}

export const NurseSurgicalEvolutionPreviewView: React.FC<NurseSurgicalEvolutionPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'Clínica Cirúrgica',
}) => {
  const authorizedFacts = buildAuthorizedNurseSurgicalEvolutionFacts(form);
  const { narrative: deterministicBaseline, traces } = buildNurseSurgicalEvolutionNoteWithTrace(authorizedFacts);
  const auditResult = auditNurseSurgicalEvolutionNarrative(deterministicBaseline, authorizedFacts);

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
      const result = await refineNurseSurgicalEvolutionWithAI(form, authorizedFacts, deterministicBaseline);
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
          <span>Voltar à edição</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Enfermeiro • Clínica Cirúrgica
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
            SurgicalFactLock Ativo
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Visualização da evolução clínica cirúrgica com rastreabilidade integral de fatos autorizados, bloqueio de alucinações cirúrgicas e auditoria de segurança.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Garantia de Privacidade e Conformidade Legal (LGPD & COFEN)</p>
          <p>
            Processamento em memória transitória. Nenhum dado clínico é persistido em disco ou banco externo. A IA opera sob supervisão estrita sem autorização para inventar procedimentos cirúrgicos, drenos, anestesias ou diagnósticos médicos.
          </p>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            id="btn-copy-evolution"
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para a área de transferência!' : 'Copiar Evolução'}</span>
          </button>

          <button
            id="btn-refine-ai"
            type="button"
            disabled={isRefining}
            onClick={handleRefineWithAI}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors border ${
              isRefining
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-teal-50 text-teal-800 border-teal-300 hover:border-teal-400 shadow-xs'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isRefining ? 'animate-spin' : 'text-teal-600'}`} />
            <span>{isRefining ? 'Refinando texto...' : 'Refinar com IA'}</span>
          </button>

          {activeText !== deterministicBaseline && (
            <button
              id="btn-reset-deterministic"
              type="button"
              onClick={handleResetToDeterministic}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar original determinístico</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>{traces.length} fatos rastreados</span>
        </div>
      </div>

      {/* Refinement Result Status Banner */}
      {refinementStatus && (
        <div
          className={`rounded-xl p-4 border text-xs space-y-1.5 ${
            refinementStatus.success
              ? 'bg-teal-50/70 border-teal-200 text-teal-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              {refinementStatus.success ? (
                <>
                  <Check className="w-4 h-4 text-teal-700" />
                  Texto refinado com sucesso pela IA (modelo: {refinementStatus.model})
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Refinamento mantido no original determinístico
                </>
              )}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/70 border border-current">
              Status: {refinementStatus.verifierStatus}
            </span>
          </div>
          {refinementStatus.error && <p className="text-slate-600">{refinementStatus.error}</p>}
          {refinementStatus.rejectionReasons && refinementStatus.rejectionReasons.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 pt-1">
              {refinementStatus.rejectionReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Narrative Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Registro da Evolução de Enfermagem</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {activeText === deterministicBaseline ? 'Texto determinístico' : 'Refinado linguisticamente'}
          </span>
        </div>

        <div className="text-sm text-slate-800 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50/60 p-5 rounded-xl border border-slate-100 select-text">
          {activeText || 'Nenhum dado informado para compor a evolução.'}
        </div>
      </div>

      {/* Fact Trace Inspection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-600" />
            <span>Auditoria e Rastreabilidade de Fatos Clínicos ({traces.length})</span>
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            100% Rastreável
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Cada sentença gerada mapeia diretamente para um campo registrado pelo enfermeiro, garantindo fidelidade jurídica e médica.
        </p>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 text-xs">
          {traces.map((tr, idx) => (
            <div key={idx} className="py-2 flex items-start gap-3">
              <span className="font-mono text-[11px] text-slate-400 shrink-0 w-8">#{idx + 1}</span>
              <div className="flex-1 space-y-0.5">
                <p className="text-slate-800 font-medium">{tr.text}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>categoria: {tr.category}</span>
                  <span>•</span>
                  <span>fatos: [{tr.factIds.join(', ')}]</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
