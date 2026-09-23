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
  Server,
  Activity,
} from 'lucide-react';
import { ClinicalEvolutionForm } from '../../types/clinical';
import {
  normalizeClinicalData,
  buildAuthorizedFacts,
  buildTechnicianNursingNote,
  validateClinicalConsistency,
  checkPrivacyGuards,
  runEngineUnitTests,
} from '../../engine';
import {
  refineClinicalNoteWithAI,
  AIRefinementRequestResult,
  testAIConnectivity,
  DEFAULT_AI_MODEL,
} from '../../services/aiRefinementService';

import { Atendimento } from '../../types';
import { AtendimentoService } from '../../services/atendimentoService';

interface ClinicalEvolutionPreviewViewProps {
  form: ClinicalEvolutionForm;
  patientAreaName?: string;
  atendimento?: Atendimento;
  usuarioResponsavel?: string;
  perfilProfissional?: string;
  onEditSection: (sectionIndex: number) => void;
  onBackToForm: () => void;
  onRestart: () => void;
  onBackToDashboard: () => void;
  onComplete?: () => void;
}

export const ClinicalEvolutionPreviewView: React.FC<ClinicalEvolutionPreviewViewProps> = ({
  form,
  patientAreaName = 'PS / Emergência',
  atendimento,
  usuarioResponsavel,
  perfilProfissional,
  onEditSection,
  onBackToForm,
  onRestart,
  onBackToDashboard,
  onComplete,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedFacts, setCopiedFacts] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const [showFacts, setShowFacts] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const [showAIStatusPanel, setShowAIStatusPanel] = useState(true);

  const [dismissedPrivacyWarning, setDismissedPrivacyWarning] = useState(false);
  const [dismissedConsistencyAlerts, setDismissedConsistencyAlerts] = useState<string[]>([]);

  // AI Refinement V1 State
  const [activeTab, setActiveTab] = useState<'structured' | 'refined'>('structured');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResult, setRefinedResult] = useState<AIRefinementRequestResult | null>(null);

  // Dev Connectivity Test State
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connTestResult, setConnTestResult] = useState<{
    tested: boolean;
    success: boolean;
    durationMs: number;
    model: string;
    error?: string;
    statusCode?: number;
    code?: string;
  } | null>(null);

  // Engine V1 Deterministic processing - Technician Nursing Note
  const normalizedData = useMemo(() => normalizeClinicalData(form), [form]);
  const authorizedFacts = useMemo(() => buildAuthorizedFacts(normalizedData), [normalizedData]);
  const technicianNote = useMemo(() => buildTechnicianNursingNote(normalizedData), [normalizedData]);
  const privacyResult = useMemo(() => checkPrivacyGuards(form), [form]);
  const consistencyAlerts = useMemo(() => validateClinicalConsistency(form), [form]);
  const unitTestResults = useMemo(() => runEngineUnitTests(), []);

  const activeConsistencyAlerts = useMemo(() => {
    return consistencyAlerts.filter((a) => !dismissedConsistencyAlerts.includes(a.id));
  }, [consistencyAlerts, dismissedConsistencyAlerts]);

  const handleDismissConsistencyAlert = (alertId: string) => {
    setDismissedConsistencyAlerts((prev) => [...prev, alertId]);
  };

  const handleDismissAllConsistencyAlerts = () => {
    setDismissedConsistencyAlerts(consistencyAlerts.map((a) => a.id));
  };

  const currentDisplayText = useMemo(() => {
    if (activeTab === 'refined' && refinedResult?.success && refinedResult.refinedText) {
      return refinedResult.refinedText;
    }
    return technicianNote;
  }, [activeTab, refinedResult, technicianNote]);

  const handleCopyCurrentText = () => {
    navigator.clipboard?.writeText(currentDisplayText);
    setCopiedText(true);
    if (atendimento?.id) {
      try {
        AtendimentoService.salvarAtendimento({
          atendimentoId: atendimento.id,
          usuarioId: atendimento.usuarioId,
          usuarioResponsavel,
          perfilProfissional,
          categoriaClinica: patientAreaName,
          textoFinalGerado: currentDisplayText,
          setor: atendimento.setor,
          leito: atendimento.leito,
          identificacao: atendimento.identificacao,
          tipoRegistro: atendimento.tipoRegistro,
        });
      } catch (err) {
        console.warn('Erro ao persistir atendimento ao copiar:', err);
      }
    }
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyFacts = () => {
    navigator.clipboard?.writeText(JSON.stringify(authorizedFacts, null, 2));
    setCopiedFacts(true);
    setTimeout(() => setCopiedFacts(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(normalizedData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleTriggerAIRefinement = async () => {
    setIsRefining(true);
    setRefinedResult(null);

    try {
      const result = await refineClinicalNoteWithAI(form, authorizedFacts, technicianNote);
      setRefinedResult(result);
      if (result.success && result.refinedText) {
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
        providerErrorDetails: {
          provider: 'gemini',
          model: DEFAULT_AI_MODEL,
          statusCode: 0,
          code: 'NETWORK_ERROR',
          message: err?.message || 'Erro inesperado ao conectar ao serviço de refinamento.',
        },
        error: 'Não foi possível realizar o refinamento automático neste momento. A anotação estruturada foi preservada.',
      });
      setActiveTab('structured');
    } finally {
      setIsRefining(false);
    }
  };

  const handleRunConnectivityTest = async () => {
    setIsTestingConn(true);
    setConnTestResult(null);
    try {
      const res = await testAIConnectivity();
      setConnTestResult({
        tested: true,
        success: res.success,
        durationMs: res.durationMs,
        model: res.model,
        error: res.error,
        statusCode: res.statusCode,
        code: res.code,
      });
    } catch (err: any) {
      setConnTestResult({
        tested: true,
        success: false,
        durationMs: 0,
        model: DEFAULT_AI_MODEL,
        error: err?.message || 'Falha ao executar teste de conectividade.',
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  const totalFactsCount = useMemo(() => {
    const lists = Object.values(authorizedFacts);
    return lists.reduce(
      (acc: number, curr) => acc + (Array.isArray(curr) ? curr.length : 0),
      0
    );
  }, [authorizedFacts]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-200 pb-16">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                TechnicianNursingNoteBuilder — Determinístico
              </span>
              <span className="text-xs text-slate-500 font-medium">{patientAreaName}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Prévia da Anotação de Enfermagem
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToForm}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar e Editar</span>
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 hover:text-rose-600 hover:bg-rose-50 text-slate-500 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Iniciar nova anotação"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Anotação</span>
            </button>
          </div>
        </div>

        {/* Engine Transparency Notice */}
        <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 flex items-start gap-3 text-xs text-cyan-950">
          <div className="p-1 rounded-lg bg-cyan-700 text-white shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold block">Geração determinística com suporte a Refinamento Linguístico Seguro (Gemini 3.7 Flash)</span>
            <p className="text-cyan-900/90 leading-relaxed">
              O conteúdo clínico é sintetizado exclusivamente pelo <strong>TechnicianNursingNoteBuilder</strong> a partir dos fatos registrados.
              O refinamento por IA é estritamente limitado à fluidez e coesão textual, com verificação pós-geração inquebrável.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Gate Warning (Blocks AI Refinement if High-Confidence PII is present) */}
      {privacyResult.hasPotentialPII && !dismissedPrivacyWarning && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-amber-950">
                Possível identificador do paciente detectado (Privacy Gate)
              </h2>
              <p className="text-xs text-amber-900 leading-relaxed">
                Foram detectados possíveis identificadores pessoais (CPF, e-mail, telefone ou prontuário) em campos de texto livre.
                Remova a informação identificadora antes de utilizar o refinamento automático para conformidade estrita com a LGPD.
              </p>
            </div>
          </div>

          {/* Matches List */}
          <div className="p-3 rounded-xl bg-white/90 border border-amber-200 space-y-1.5 text-xs">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              Itens detectados:
            </span>
            <div className="space-y-1">
              {privacyResult.matches.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-slate-700">
                  <span className="font-medium text-slate-900">
                    {m.label}: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px]">{m.snippet}</code>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                    {m.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onBackToForm}
              className="min-h-[38px] px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Revisar campo no formulário
            </button>
            <button
              type="button"
              onClick={() => setDismissedPrivacyWarning(true)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              Entendo o risco e continuar apenas no modo determinístico
            </button>
          </div>
        </div>
      )}

      {/* Clinical Consistency Validator Alerts (Non-blocking human review notice) */}
      {activeConsistencyAlerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-orange-50/90 border-2 border-orange-300 space-y-4 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-600 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-orange-950">
                  Alerta de Consistência Clínica ({activeConsistencyAlerts.length} {activeConsistencyAlerts.length === 1 ? 'sugestão de revisão' : 'sugestões de revisão'})
                </h2>
                <p className="text-xs text-orange-900 leading-relaxed">
                  Foram identificadas combinações de dados que podem necessitar de conferência. O sistema não altera suas respostas nem realiza diagnósticos. Todo alerta é <strong>não bloqueante</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissAllConsistencyAlerts}
              className="text-xs font-semibold text-orange-800 hover:text-orange-950 underline shrink-0 cursor-pointer"
            >
              Manter tudo como registrado
            </button>
          </div>

          <div className="space-y-2.5">
            {activeConsistencyAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-white border border-orange-200/90 space-y-2 text-xs shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-900 bg-orange-100 px-2 py-0.5 rounded text-[11px] font-mono">
                        {alert.ruleId}
                      </span>
                      <span className="font-semibold text-slate-700 text-[11px]">
                        {alert.sectionTitle}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onEditSection(alert.sectionIndex)}
                    className="min-h-[32px] px-3 py-1 rounded-lg bg-orange-800 hover:bg-orange-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Revisar informações
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismissConsistencyAlert(alert.id)}
                    className="min-h-[32px] px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Manter como registrado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISTINCT ERROR BANNERS */}
      {/* 1. Provider / API Error Banner */}
      {refinedResult && !refinedResult.success && refinedResult.requestStatus === 'provider_error' && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-2.5 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <Server className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">
                Não foi possível realizar o refinamento automático neste momento. A anotação estruturada foi preservada.
              </span>
              <p className="text-slate-600 leading-relaxed">
                A anotação clínica determinística permanece completa e pronta para uso. O botão de cópia continua 100% funcional.
              </p>
              {refinedResult.providerErrorDetails && (
                <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                  <div className="font-bold text-slate-800 font-sans">AI Provider Error (Modo Desenvolvimento):</div>
                  <div>Provider: {refinedResult.providerErrorDetails.provider}</div>
                  <div>Model: {refinedResult.providerErrorDetails.model}</div>
                  <div>Status: {refinedResult.providerErrorDetails.statusCode}</div>
                  <div>Code: {refinedResult.providerErrorDetails.code}</div>
                  {refinedResult.providerErrorDetails.message && (
                    <div className="truncate text-slate-500">Detalhe: {refinedResult.providerErrorDetails.message}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Verifier Rejection Banner (Clinical invariant protection) */}
      {refinedResult && !refinedResult.success && refinedResult.requestStatus === 'verifier_rejected' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <ShieldX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-950 block">
                O refinamento automático foi descartado porque introduziu ou alterou informações não autorizadas. A anotação estruturada foi preservada.
              </span>
              <p className="text-rose-900 leading-relaxed">
                O <strong>PostGenerationVerifier</strong> identificou divergências em relação aos fatos clínicos autorizados e descartou o texto da IA por segurança assistencial:
              </p>
              {refinedResult.rejectionReasons && refinedResult.rejectionReasons.length > 0 && (
                <ul className="list-disc list-inside text-rose-800 text-[11px] pt-1 space-y-0.5">
                  {refinedResult.rejectionReasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}
              <span className="text-[11px] font-semibold text-rose-950 block pt-1">
                ✓ Exibindo com segurança a <strong>Anotação Determinística Estruturada</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Text Note Card with Version Switching & AI Refine Actions */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Version Selector Tabs (if Refinement active) */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {activeTab === 'refined' ? 'Texto com Refinamento Linguístico' : 'Texto Estruturado Preliminar'}
                </h2>
                {activeTab === 'refined' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <FileCheck className="w-3 h-3" />
                    Validado por Locks
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    <Lock className="w-3 h-3" />
                    Determinístico
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {totalFactsCount} fatos assistenciais documentados
              </span>
            </div>
          </div>

          {/* Action buttons: Refine AI & Copy */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerAIRefinement}
              disabled={isRefining}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-linear-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Aprimora a concordância e fluidez textual preservando 100% dos fatos"
            >
              {isRefining ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Refinando e Validando...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Refinar Texto (IA)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyCurrentText}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar {activeTab === 'refined' ? 'Refinado' : 'Estruturado'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toggle Switch between Structured vs Refined (visible if refined text is available) */}
        {refinedResult?.success && refinedResult.refinedText && (
          <div className="flex items-center justify-between bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-2 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('structured')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'structured'
                    ? 'bg-white text-cyan-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Texto Estruturado (Determinístico)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('refined')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'refined'
                    ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Texto Refinado (Linguístico)</span>
              </button>
            </div>

            <span className="hidden sm:inline text-[11px] text-slate-500 font-medium px-2">
              {activeTab === 'refined'
                ? 'Fluidez e coesão textual validadas'
                : 'Formulação padrão por regras canônicas'}
            </span>
          </div>
        )}

        {/* The Display Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4 font-normal select-text">
          {currentDisplayText ? (
            currentDisplayText.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-slate-400 italic">
              Nenhum dado clínico preenchido para gerar a anotação.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyCurrentText}
              className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl border border-cyan-700 hover:bg-cyan-50 text-cyan-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              id="btn-concluir-preview"
              onClick={() => {
                handleCopyCurrentText();
                if (onComplete) {
                  onComplete();
                } else {
                  onBackToDashboard();
                }
              }}
              className="w-full sm:w-auto min-h-[40px] px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir e Salvar</span>
            </button>
          </div>
        </div>
      </div>

      {/* DEV TOOLS & INSPECTION ACCORDION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <Code2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Painéis de Inspeção e Validação do Engine V1 (Modo Desenvolvimento)
          </span>
        </div>

        {/* 0. AI Status & Verification Panel */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <button
            type="button"
            onClick={() => setShowAIStatusPanel(!showAIStatusPanel)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Status do Modelo e Verificador de Refinamento IA
                </h3>
                <p className="text-[11px] text-slate-500">
                  Monitoramento em tempo real do modelo ativo ({DEFAULT_AI_MODEL}), status da requisição e locks.
                </p>
              </div>
            </div>

            <div
              className={`p-1 text-slate-400 transition-transform ${
                showAIStatusPanel ? 'rotate-180 text-cyan-800' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {showAIStatusPanel && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* 1. AI Model */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    AI Model
                  </span>
                  <span className="font-mono font-bold text-teal-900 text-xs sm:text-sm block">
                    {refinedResult?.model || DEFAULT_AI_MODEL}
                  </span>
                  <span className="text-[10px] text-slate-500">Configuração central única</span>
                </div>

                {/* 2. AI Request Status */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    AI Request Status
                  </span>
                  <span className="font-bold text-xs sm:text-sm block">
                    {!refinedResult ? (
                      <span className="text-slate-500">idle</span>
                    ) : refinedResult.requestStatus === 'success' ? (
                      <span className="text-emerald-700">success</span>
                    ) : refinedResult.requestStatus === 'provider_error' ? (
                      <span className="text-amber-700">provider_error</span>
                    ) : refinedResult.requestStatus === 'privacy_blocked' ? (
                      <span className="text-amber-700">privacy_blocked</span>
                    ) : (
                      <span className="text-rose-700">verifier_rejected</span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {!refinedResult
                      ? 'Nenhuma chamada efetuada'
                      : refinedResult.requestStatus === 'provider_error'
                      ? 'Falha de comunicação/HTTP com a API'
                      : refinedResult.requestStatus === 'success'
                      ? 'Resposta recebida com sucesso'
                      : 'Resposta recebida com reprovação clínica'}
                  </span>
                </div>

                {/* 3. PostGenerationVerifier */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    PostGenerationVerifier
                  </span>
                  <span className="font-bold text-xs sm:text-sm block">
                    {!refinedResult ? (
                      <span className="text-slate-500">not_executed</span>
                    ) : refinedResult.verifierStatus === 'approved' ? (
                      <span className="text-emerald-700">approved</span>
                    ) : refinedResult.verifierStatus === 'rejected' ? (
                      <span className="text-rose-700">rejected</span>
                    ) : (
                      <span className="text-slate-600">not_executed</span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {!refinedResult
                      ? 'Aguardando refinamento'
                      : refinedResult.verifierStatus === 'not_executed'
                      ? 'Não executado (erro no provider)'
                      : refinedResult.verifierStatus === 'approved'
                      ? '100% das travas aprovadas'
                      : 'Reprovado por travas determinísticas'}
                  </span>
                </div>
              </div>

              {/* Dev Connectivity Test Trigger */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">
                    Teste de Conectividade do Gemini 3.7 Flash
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Dispara requisição estruturada com dados fictícios para validar latência e comunicação da API.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRunConnectivityTest}
                  disabled={isTestingConn}
                  className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isTestingConn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testando...</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Testar Conectividade</span>
                    </>
                  )}
                </button>
              </div>

              {connTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    connTestResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {connTestResult.success
                        ? '✓ Conectividade com Gemini 3.7 Flash Operacional'
                        : '⚠ Falha na Conectividade com Gemini 3.7 Flash'}
                    </span>
                    <span className="font-mono text-[11px]">
                      {connTestResult.durationMs} ms | {connTestResult.model}
                    </span>
                  </div>
                  {connTestResult.error && (
                    <p className="text-[11px] text-amber-900 font-mono">
                      Erro: {connTestResult.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1. Collapsible: Authorized Clinical Facts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <button
            type="button"
            onClick={() => setShowFacts(!showFacts)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-800">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Fatos autorizados — desenvolvimento ({totalFactsCount} fatos)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Objeto canônico de fatos autorizados para validação estrita do PostGenerationVerifier.
                </p>
              </div>
            </div>

            <div
              className={`p-1 text-slate-400 transition-transform ${
                showFacts ? 'rotate-180 text-cyan-800' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {showFacts && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  {Object.keys(authorizedFacts).length} categorias com fatos extraídos
                </span>
                <button
                  type="button"
                  onClick={handleCopyFacts}
                  className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer font-medium"
                >
                  {copiedFacts ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Fatos Autorizados JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Categorized List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {Object.entries(authorizedFacts).map(([cat, factsList]) => {
                  const facts = Array.isArray(factsList) ? factsList : [];
                  if (facts.length === 0) return null;
                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                        <span className="font-bold text-slate-800 uppercase text-[11px]">
                          {cat}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {facts.length}
                        </span>
                      </div>
                      <ul className="space-y-1 text-slate-700">
                        {facts.map((f) => (
                          <li key={f.id} className="text-[11px] leading-tight">
                            <span className="font-semibold text-slate-900">• {f.sourceField}:</span>{' '}
                            <span className="text-cyan-950">{f.canonicalText || JSON.stringify(f.value)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Collapsible: Structured Normalized Data */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Dados estruturados normalizados — desenvolvimento
                </h3>
                <p className="text-[11px] text-slate-500">
                  Objeto JSON com campos vazios removidos e negativos clínicos preservados.
                </p>
              </div>
            </div>

            <div
              className={`p-1 text-slate-400 transition-transform ${
                showJson ? 'rotate-180 text-cyan-800' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {showJson && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer font-medium"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON Normalizado</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                {JSON.stringify(normalizedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 3. Collapsible: Complete Unit Test Battery (TECH + CONS + GRAM + AI-001 to AI-020) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <button
            type="button"
            onClick={() => setShowTests(!showTests)}
            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <PlayCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Bateria de Testes do Engine EvoluiEnf ({unitTestResults.total} Testes: TECH, CONS, GRAM, AI-001 a AI-020)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    {unitTestResults.passed}/{unitTestResults.total} Passaram
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Execução automatizada dos testes de conformidade profissional, determinismo, gramática e travas de IA.
                </p>
              </div>
            </div>

            <div
              className={`p-1 text-slate-400 transition-transform ${
                showTests ? 'rotate-180 text-cyan-800' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {showTests && (
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-1">
                {unitTestResults.results.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      t.passed
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="mt-0.5">
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold block">{t.name}</span>
                      <p className="text-[11px] text-slate-600">{t.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

