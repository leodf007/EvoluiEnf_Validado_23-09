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
import { NurseICUEvolutionForm } from '../../../types/nurseICUEvolution';
import {
  buildAuthorizedNurseICUFacts,
  buildNurseICUEvolutionNoteWithTrace,
  auditNurseICUNarrative,
} from '../../../engine/nurseICUClinicalFactBuilder';
import { refineNurseICUEvolutionWithAI } from '../../../services/nurseICUAiRefinementService';
import { AIRefinementRequestResult } from '../../../services/aiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';

interface NurseICUEvolutionPreviewViewProps {
  form: NurseICUEvolutionForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
}

export const NurseICUEvolutionPreviewView: React.FC<NurseICUEvolutionPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'UTI',
}) => {
  const authorizedFacts = buildAuthorizedNurseICUFacts(form);
  const { narrative: deterministicBaseline, segments } = buildNurseICUEvolutionNoteWithTrace(authorizedFacts);
  const auditResult = auditNurseICUNarrative(segments, authorizedFacts);

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
      const result = await refineNurseICUEvolutionWithAI(form, authorizedFacts, deterministicBaseline);
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Enfermeiro • Evolução UTI
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            V1 Factory
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Evolução de Enfermagem — {patientAreaName}
          </h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 self-start sm:self-auto">
            Narrativa Estruturada Canônica
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Registro intensivo estruturado contendo dados hemodinâmicos, parâmetros ventilatórios, infusões contínuas, dispositivos invasivos e síntese profissional do Enfermeiro.
        </p>
      </div>

      {/* Privacy Guard Alert */}
      {piiCheck.hasPotentialPII && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Aviso de Privacidade:</span> Foi detectado possível identificador nominal ou sensível. Por conformidade com LGPD e normas COFEN, certifique-se de que nenhum dado identificador direto seja exportado.
          </div>
        </div>
      )}

      {/* Audit Fact Trace Status */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${auditResult.passed ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>
            <strong>Auditoria de Fatos:</strong> {auditResult.validSegmentsCount} segmentos factuais validados contra fatos clínicos autorizados.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>9 Locks de Segurança Ativos</span>
        </div>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {refinementStatus?.success ? 'Texto Refinado por IA (Auditado)' : 'Texto Determinístico Canônico'}
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {refinementStatus && (
              <button
                type="button"
                onClick={handleResetToDeterministic}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                title="Voltar ao texto determinístico original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar original</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar evolução'}</span>
            </button>
          </div>
        </div>

        {/* Narrative Text */}
        <div className="p-6">
          <div className="whitespace-pre-line text-sm text-slate-800 leading-relaxed font-sans font-normal selection:bg-teal-100">
            {activeText}
          </div>
        </div>
      </div>

      {/* Refinement Feedback Card if available */}
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
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">
                {refinementStatus.success
                  ? 'Refinamento Textual Aprovado pelo PostGenerationVerifier'
                  : 'Refinamento Descartado por Segurança Clínica (Fatos Preservados)'}
              </p>
              <p className="text-xs leading-relaxed opacity-90">
                {refinementStatus.success
                  ? 'A coesão da narrativa foi aprimorada preservando estritamente todos os números, parâmetros de ventilação, drogas vasoativas, acessos e achados registrados.'
                  : refinementStatus.error || 'O texto gerado pela IA divergiu dos fatos autorizados. O sistema recorreu seguramente ao texto determinístico.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Refinement & Action Box */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Refinamento Estilístico de Linguagem (IA)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Melhora a fluidez e conectivos da redação hospitalar. Não altera valores, não infere diagnósticos e não cria dados clínicos. Validado por 9 locks de segurança clínica.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefineWithAI}
          disabled={isRefining}
          className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800/60 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
        >
          {isRefining ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              <span>Verificando Locks...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Refinar com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Locks Legend */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span>Garantias de Não-Alucinação (Clinical Safety Locks):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-slate-600">
          <div>• <strong>NumericFactLock:</strong> PAM, FC, FR, SpO₂, PEEP e VC imutáveis</div>
          <div>• <strong>MedicationLock:</strong> Proíbe drogas não prescritas/administradas</div>
          <div>• <strong>DeviceLock:</strong> Sem criação de cateteres ou próteses</div>
          <div>• <strong>VentilatorParameterLock:</strong> Parâmetros de VMI estritamente preservados</div>
          <div>• <strong>NurseJudgmentLock:</strong> Proíbe NANDA ou diagnósticos gerados por IA</div>
          <div>• <strong>UnauthorizedTermsLock:</strong> Bloqueia 'febre', 'encefalopatia', etc.</div>
        </div>
      </div>
    </div>
  );
};
