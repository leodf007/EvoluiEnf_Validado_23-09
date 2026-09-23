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
import { NurseICUAdmissionForm } from '../../../types/nurseICUAdmission';
import {
  buildAuthorizedNurseICUAdmissionFacts,
  auditNurseICUAdmissionNarrative,
} from '../../../engine/nurseICUAdmissionFactBuilder';
import { buildNurseICUAdmissionNoteWithTrace } from '../../../engine/nurseICUAdmissionNoteBuilder';
import { refineNurseICUAdmissionWithAI } from '../../../services/nurseICUAdmissionAiRefinementService';
import { AIRefinementRequestResult } from '../../../services/aiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';

interface NurseICUAdmissionPreviewViewProps {
  form: NurseICUAdmissionForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
}

export const NurseICUAdmissionPreviewView: React.FC<NurseICUAdmissionPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'UTI',
}) => {
  const authorizedFacts = buildAuthorizedNurseICUAdmissionFacts(form);
  const { narrative: deterministicBaseline, traces } = buildNurseICUAdmissionNoteWithTrace(authorizedFacts);
  const auditResult = auditNurseICUAdmissionNarrative(deterministicBaseline, authorizedFacts);

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
      const result = await refineNurseICUAdmissionWithAI(form, authorizedFacts, deterministicBaseline);
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
            <span>{copied ? 'Copiado!' : 'Copiar Admissão'}</span>
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
                Admissão de Enfermagem — {patientAreaName}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Visualização prévia do registro admissional completo em conformidade com as diretrizes COFEN e locks de segurança.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Auditado: 100% dos Fatos Conformes
            </span>
            {piiCheck.hasPotentialPII ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Alerta de Privacidade
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-500" />
                Privacidade Preservada
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Refinement Banner if used */}
      {refinementStatus && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
            refinementStatus.success
              ? 'bg-teal-50/70 border-teal-200 text-teal-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          {refinementStatus.success ? (
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {refinementStatus.success
                ? 'Narrativa refinada por IA com PostGenerationVerifier aprovado'
                : 'Refinamento de IA não aplicado (mantida a versão determinística segura)'}
            </p>
            <p className="mt-0.5 text-slate-700">
              {refinementStatus.success
                ? `Texto aprimorado mantendo estrita fidelidade aos dados clínicos autorizados (${traces.length} fatos estruturados).`
                : refinementStatus.error || 'A validação de segurança manteve o texto determinístico original.'}
            </p>
          </div>
        </div>
      )}

      {/* Text Area / Document Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="bg-slate-50/80 border-b border-slate-200/80 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Registro Clínico Admissional de Enfermagem
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefineWithAI}
              disabled={isRefining}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>{isRefining ? 'Refinando...' : 'Aprimorar Narrativa com IA'}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans whitespace-pre-wrap selection:bg-teal-100">
            {activeText}
          </div>
        </div>
      </div>

      {/* Fact Audit Details Footer */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          Este documento foi compilado a partir de <strong>{traces.length} fatos clínicos autorizados</strong>.
          Conforme as diretrizes institucionais e regulamentações do COFEN, não são gerados diagnósticos médicos automatizados, prescrições nem especulações de prognóstico. A responsabilidade técnica permanece sob o julgamento privativo do Enfermeiro.
        </p>
      </div>
    </div>
  );
};
