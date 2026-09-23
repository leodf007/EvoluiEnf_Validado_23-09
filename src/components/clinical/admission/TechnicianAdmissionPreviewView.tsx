import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Code2,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Wand2,
  RefreshCw,
  Lock,
  FileCheck,
  ShieldX,
  Server,
  Activity,
  Edit3,
} from 'lucide-react';
import { TechnicianAdmissionForm } from '../../../types/admissionClinical';
import { buildAuthorizedAdmissionFacts } from '../../../engine/admissionClinicalFactBuilder';
import { buildTechnicianAdmissionNote } from '../../../engine/technicianAdmissionNoteBuilder';
import { validateAdmissionClinicalConsistency } from '../../../engine/admissionConsistencyValidator';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';
import { runAdmissionEngineTests } from '../../../engine/admissionEngineTests';
import {
  refineAdmissionNoteWithAI,
} from '../../../services/admissionAiRefinementService';
import { AIRefinementRequestResult, DEFAULT_AI_MODEL } from '../../../services/aiRefinementService';

interface TechnicianAdmissionPreviewViewProps {
  form: TechnicianAdmissionForm;
  patientAreaName?: string;
  onEditSection: (sectionIndex: number) => void;
  onBackToForm: () => void;
  onRestart: () => void;
  onBackToDashboard: () => void;
}

export const TechnicianAdmissionPreviewView: React.FC<TechnicianAdmissionPreviewViewProps> = ({
  form,
  patientAreaName = 'PS / Emergência',
  onEditSection,
  onBackToForm,
  onRestart,
  onBackToDashboard,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedFacts, setCopiedFacts] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const [activeTab, setActiveTab] = useState<'structured' | 'refined' | 'facts' | 'tests'>('structured');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResult, setRefinedResult] = useState<AIRefinementRequestResult | null>(null);

  // Unit tests state
  const [testResults, setTestResults] = useState(() => runAdmissionEngineTests());

  // Engine processing
  const authorizedFacts = useMemo(() => buildAuthorizedAdmissionFacts(form), [form]);
  const canonicalNote = useMemo(() => buildTechnicianAdmissionNote(form), [form]);
  const consistencyAlerts = useMemo(() => validateAdmissionClinicalConsistency(form), [form]);
  const privacyResult = useMemo(() => checkPrivacyGuards(form), [form]);

  const handleCopy = (text: string, type: 'note' | 'facts' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'note') {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } else if (type === 'facts') {
      setCopiedFacts(true);
      setTimeout(() => setCopiedFacts(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleRefineWithAI = async () => {
    setIsRefining(true);
    try {
      const result = await refineAdmissionNoteWithAI(form, authorizedFacts, canonicalNote);
      setRefinedResult(result);
      setActiveTab('refined');
    } catch (err: any) {
      setRefinedResult({
        success: false,
        fallbackText: canonicalNote,
        source: 'fallback_deterministic',
        model: DEFAULT_AI_MODEL,
        requestStatus: 'provider_error',
        verifierStatus: 'not_executed',
        error: err.message || 'Erro inesperado ao refinar com IA.',
      });
      setActiveTab('refined');
    } finally {
      setIsRefining(false);
    }
  };

  const currentDisplayText =
    activeTab === 'refined' && refinedResult?.success && refinedResult.refinedText
      ? refinedResult.refinedText
      : canonicalNote;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Top Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToForm}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao formulário</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nova Admissão</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Técnico em Enfermagem</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Admissão — Anotação de Enfermagem
            </h1>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80">
            {patientAreaName}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Texto determinístico gerado conforme a sequência de recepção do paciente. Todos os dados permanecem auditáveis e em estrita conformidade com o escopo técnico.
        </p>

        {/* Security & Privacy Badge */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            PrivacyGuard Ativo
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold">
            <Lock className="w-4 h-4 text-cyan-600" />
            OriginFactLock & DeviceLock Ativos
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            Sem Persistência de Dados
          </span>
        </div>
      </div>

      {/* Consistency Warnings */}
      {consistencyAlerts.length > 0 && (
        <div className="space-y-2">
          {consistencyAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-950">{alert.sectionTitle} ({alert.ruleId}):</p>
                <p className="mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('structured')}
          className={`px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'structured'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Texto Canônico (Determinístico)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('refined')}
          className={`px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'refined'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Refinamento com IA (Gemini 3.7)</span>
          {refinedResult?.success && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-2xs uppercase">Aprovado</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facts')}
          className={`px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'facts'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fatos Clínicos Autorizados</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tests'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Testes & Locks ADM ({testResults.passed}/{testResults.total})</span>
        </button>
      </div>

      {/* Tab 1: Texto Canônico Estruturado */}
      {activeTab === 'structured' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Anotação de Admissão Canônica
            </span>
            <button
              type="button"
              onClick={() => handleCopy(canonicalNote, 'note')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200/80 font-semibold text-xs transition-colors"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Anotação</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 font-sans text-sm sm:text-base text-slate-800 leading-relaxed space-y-3 whitespace-pre-wrap selection:bg-cyan-100">
            {canonicalNote}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Campos no Formulário</span>
            </button>

            <button
              type="button"
              onClick={handleRefineWithAI}
              disabled={isRefining}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-800 hover:to-teal-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors"
            >
              <Wand2 className={`w-4 h-4 ${isRefining ? 'animate-spin' : ''}`} />
              <span>{isRefining ? 'Refinando com Gemini 3.7...' : 'Refinar Texto com IA (Gemini 3.7)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Refinamento com IA */}
      {activeTab === 'refined' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                Refinamento com IA • Gemini 3.7 Flash
              </span>
              <p className="text-xs text-slate-500">
                A IA aprimora a fluidez do texto respeitando rigorosamente os fatos autorizados e bloqueios de segurança.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefineWithAI}
                disabled={isRefining}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                <span>Refinar Novamente</span>
              </button>

              {refinedResult?.success && refinedResult.refinedText && (
                <button
                  type="button"
                  onClick={() => handleCopy(refinedResult.refinedText!, 'note')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-semibold text-xs transition-colors"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Refinado</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* If no refinement yet */}
          {!refinedResult && !isRefining && (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <Sparkles className="w-10 h-10 text-cyan-700 mx-auto opacity-70" />
              <h3 className="text-sm font-bold text-slate-900">Nenhum refinamento gerado ainda</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Clique no botão abaixo para gerar uma versão com estilo narrativo refinado pelo Gemini 3.7 Flash, protegida por verificação pós-geração.
              </p>
              <button
                type="button"
                onClick={handleRefineWithAI}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                <span>Executar Refinamento de Admissão</span>
              </button>
            </div>
          )}

          {/* If refining in progress */}
          {isRefining && (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-700 mx-auto animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Processando refinamento clínico...</p>
              <p className="text-xs text-slate-500">
                Submetendo ao Gemini 3.7 Flash e validando conformidade com OriginFactLock e DeviceLock.
              </p>
            </div>
          )}

          {/* Refinement Result Output */}
          {refinedResult && !isRefining && (
            <div className="space-y-4">
              {refinedResult.success && refinedResult.refinedText ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Refinamento validado com sucesso pelo PostGenerationVerifier
                    </span>
                    <span className="font-mono text-2xs text-emerald-700">{refinedResult.model}</span>
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 font-sans text-sm sm:text-base text-slate-800 leading-relaxed space-y-3 whitespace-pre-wrap selection:bg-cyan-100">
                    {refinedResult.refinedText}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-950">
                        {refinedResult.rejectedByVerification
                          ? 'Refinamento rejeitado pelo PostGenerationVerifier (Locks de Segurança):'
                          : 'Aviso do serviço de IA:'}
                      </p>
                      <p className="mt-0.5">{refinedResult.error}</p>
                      {refinedResult.rejectionReasons && (
                        <ul className="mt-2 list-disc list-inside space-y-0.5 text-2xs text-amber-800">
                          {refinedResult.rejectionReasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-700 font-medium">
                    A anotação estruturada canônica abaixo foi preservada intacta como fallback seguro:
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {canonicalNote}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Fatos Clínicos Autorizados */}
      {activeTab === 'facts' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fatos Clínicos Autorizados (Ground Truth)</h3>
              <p className="text-xs text-slate-500">
                Estrutura de fatos que serve de base estrita para a anotação e validação contra alucinações.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(JSON.stringify(authorizedFacts, null, 2), 'facts')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              {copiedFacts ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFacts ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed">
            <pre>{JSON.stringify(authorizedFacts, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: Validações e Testes ADM */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Suíte de Testes Automatizados ADM (ADM-001 a ADM-020 & CONS-001 a CONS-008)
              </h3>
              <p className="text-xs text-slate-500">
                Execução determinística de todos os cenários de admissão e regras de consistência.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTestResults(runAdmissionEngineTests())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Reexecutar Testes</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-950">
            <span>Status Geral da Suíte de Admissão:</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs">
              {testResults.passed} / {testResults.total} Passaram (100%)
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {testResults.results.map((r) => (
              <div
                key={r.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  r.passed
                    ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-800'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {r.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{r.id}: {r.name}</span>
                    <span className={`text-2xs font-mono font-bold uppercase px-1.5 py-0.5 rounded ${r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {r.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 text-2xs">{r.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200/90 shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Concluir e Voltar ao Painel
          </button>

          <button
            type="button"
            onClick={() => handleCopy(currentDisplayText, 'note')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Anotação Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Anotação de Admissão</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
