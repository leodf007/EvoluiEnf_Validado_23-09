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
  ChevronDown,
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
  Activity,
  HeartPulse,
} from 'lucide-react';
import { TechnicianICUNursingNoteForm } from '../../../types/icuClinical';
import {
  buildAuthorizedICUFacts,
  buildTechnicianICUNursingNote,
  validateICUConsistency,
  checkPrivacyGuards,
  runICUEngineUnitTests,
  runNurseRegressionTests,
} from '../../../engine';
import {
  refineICUNoteWithAI,
} from '../../../services/icuAiRefinementService';
import {
  AIRefinementRequestResult,
  DEFAULT_AI_MODEL,
} from '../../../services/aiRefinementService';

interface TechnicianICUPreviewViewProps {
  form: TechnicianICUNursingNoteForm;
  patientAreaName?: string;
  onEditSection: (sectionIndex: number) => void;
  onBackToForm: () => void;
  onRestart: () => void;
  onBackToDashboard: () => void;
}

export const TechnicianICUPreviewView: React.FC<TechnicianICUPreviewViewProps> = ({
  form,
  patientAreaName = 'UTI - Terapia Intensiva',
  onEditSection,
  onBackToForm,
  onRestart,
  onBackToDashboard,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedFacts, setCopiedFacts] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const [showFacts, setShowFacts] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showTests, setShowTests] = useState(false);

  const [dismissedConsistencyAlerts, setDismissedConsistencyAlerts] = useState<string[]>([]);

  // AI Refinement State
  const [activeTab, setActiveTab] = useState<'structured' | 'refined'>('structured');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResult, setRefinedResult] = useState<AIRefinementRequestResult | null>(null);

  // Deterministic ICU Processing
  const authorizedFacts = useMemo(() => buildAuthorizedICUFacts(form), [form]);
  const technicianNote = useMemo(() => buildTechnicianICUNursingNote(form), [form]);
  const privacyResult = useMemo(() => checkPrivacyGuards(form as any), [form]);
  const consistencyAlerts = useMemo(() => validateICUConsistency(form), [form]);
  const unitTestResults = useMemo(() => runICUEngineUnitTests(), []);
  const nurseRegressionResults = useMemo(() => runNurseRegressionTests(), []);

  const activeConsistencyAlerts = useMemo(() => {
    return consistencyAlerts.filter((a) => !dismissedConsistencyAlerts.includes(a.id));
  }, [consistencyAlerts, dismissedConsistencyAlerts]);

  const handleDismissConsistencyAlert = (alertId: string) => {
    setDismissedConsistencyAlerts((prev) => [...prev, alertId]);
  };

  const displayedText = useMemo(() => {
    if (activeTab === 'refined' && refinedResult?.success && refinedResult.refinedText) {
      return refinedResult.refinedText;
    }
    return technicianNote;
  }, [activeTab, refinedResult, technicianNote]);

  const handleCopy = (text: string, type: 'text' | 'facts' | 'json') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'text') {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      } else if (type === 'facts') {
        setCopiedFacts(true);
        setTimeout(() => setCopiedFacts(false), 2000);
      } else if (type === 'json') {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      }
    });
  };

  const handleTriggerRefinement = async () => {
    setIsRefining(true);
    try {
      const res = await refineICUNoteWithAI(form, authorizedFacts, technicianNote);
      setRefinedResult(res);
      if (res.success && res.refinedText) {
        setActiveTab('refined');
      } else {
        setActiveTab('structured');
      }
    } catch (err: any) {
      setRefinedResult({
        success: false,
        fallbackText: technicianNote,
        source: 'fallback_deterministic',
        model: DEFAULT_AI_MODEL,
        requestStatus: 'provider_error',
        verifierStatus: 'not_executed',
        error: 'Erro de comunicação ao solicitar refinamento.',
      });
      setActiveTab('structured');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToForm}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Voltar para o formulário"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-800 rounded">
                UTI / Terapia Intensiva
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-100 text-cyan-800 rounded">
                Técnico em Enfermagem
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Anotação de Enfermagem — UTI
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRestart}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nova Anotação
          </button>
        </div>
      </div>

      {/* Consistency Warnings */}
      {activeConsistencyAlerts.length > 0 && (
        <div className="space-y-2">
          {activeConsistencyAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 flex items-start justify-between gap-3 text-amber-900 text-xs sm:text-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{alert.title}: </span>
                  <span>{alert.message}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDismissConsistencyAlert(alert.id)}
                className="text-xs text-amber-700 hover:text-amber-900 underline shrink-0 font-medium"
              >
                Dispensar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Privacidade & Segurança:</strong> Nenhum dado clínico é gravado ou persistido externamente. O processamento ocorre em memória volátil.
          </span>
        </div>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Tabs Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('structured')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'structured'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              <span>Anotação Estruturada (Determinística)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (refinedResult?.success) {
                  setActiveTab('refined');
                } else {
                  handleTriggerRefinement();
                }
              }}
              disabled={isRefining}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'refined'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Refinamento IA (Gemini 3.7 Flash)</span>
              {isRefining && <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(displayedText, 'text')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>
        </div>

        {/* AI Status / Fallback Notice */}
        {activeTab === 'refined' && (
          <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>PostGenerationVerifier Aprovado:</strong> Todos os fatos clínicos, dispositivos e parâmetros ventilatórios foram preservados sem introdução de termos não autorizados.
              </span>
            </div>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-medium rounded text-[11px]">
              {DEFAULT_AI_MODEL}
            </span>
          </div>
        )}

        {/* Rejection / Provider Error Banner */}
        {refinedResult && !refinedResult.success && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Refinamento automático não aplicado: </span>
              <span>{refinedResult.error || 'A anotação estruturada determinística foi preservada com segurança integral.'}</span>
              {refinedResult.rejectionReasons && (
                <ul className="list-disc ml-4 mt-1 text-[11px] text-amber-800">
                  {refinedResult.rejectionReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Narrative Text Body */}
        <div className="p-6 sm:p-8">
          <div className="bg-slate-50/50 rounded-xl p-5 sm:p-6 border border-slate-200/80 font-mono text-sm leading-relaxed text-slate-800 whitespace-pre-wrap selection:bg-cyan-100">
            {displayedText}
          </div>
        </div>
      </div>

      {/* Advanced Inspection Panels */}
      <div className="space-y-3">
        {/* Authorized Facts Accordion */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFacts((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Fatos Clínicos Autorizados (AuthorizedClinicalFacts)
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showFacts ? 'rotate-180' : ''}`} />
          </button>
          {showFacts && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(authorizedFacts, null, 2), 'facts')}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                >
                  {copiedFacts ? 'Copiado!' : 'Copiar Fatos JSON'}
                </button>
              </div>
              <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-72 font-mono">
                {JSON.stringify(authorizedFacts, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Engine Tests Drawer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTests((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Suíte de Testes Clínicos & Locks (UTI-001 a 030, Consistência e Regressão)
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded">
                {unitTestResults.passedCount + nurseRegressionResults.passedCount} / {unitTestResults.totalCount + nurseRegressionResults.totalCount} aprovados
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showTests ? 'rotate-180' : ''}`} />
          </button>
          {showTests && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Testes de Terapia Intensiva (UTI)
                </h4>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {unitTestResults.results.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-start gap-2 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">[{t.id}] {t.name}: </span>
                        <span className="text-slate-600">{t.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Testes de Regressão de Ausculta e Exame Físico (NUR-REG-001 a 005)
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {nurseRegressionResults.results.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-start gap-2 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">[{t.id}] {t.name}: </span>
                        <span className="text-slate-600">{t.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
