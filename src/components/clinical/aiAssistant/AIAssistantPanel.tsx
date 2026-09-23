import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Wand2,
  Check,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  analyzeDocumentationCompleteness,
  generateSmartQuestions,
  improveNursingNarrative,
} from '../../../services/aiAssistant/aiAssistantService';
import {
  CompletenessAnalysisResult,
  SmartQuestion,
  NarrativeImprovementResult,
} from '../../../services/aiAssistant/aiAssistantTypes';

interface AIAssistantPanelProps {
  form: any;
  currentNarrative?: string;
  onApplySuggestion?: (sugestaoTexto: string) => void;
  onApplyImprovedNarrative?: (improvedText: string) => void;
  modeloNome?: string;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  form,
  currentNarrative = '',
  onApplySuggestion,
  onApplyImprovedNarrative,
  modeloNome,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'sugestoes' | 'perguntas' | 'melhoria'>('sugestoes');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementResult, setRefinementResult] = useState<NarrativeImprovementResult | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Análise de completude em tempo real
  const analysis: CompletenessAnalysisResult = useMemo(() => {
    return analyzeDocumentationCompleteness(form, modeloNome);
  }, [form, modeloNome]);

  // Perguntas inteligentes baseadas no relato subjetivo ou narrativa atual
  const smartQuestions: SmartQuestion[] = useMemo(() => {
    const textContext =
      currentNarrative ||
      form?.subjective?.patientReport ||
      form?.queixaPrincipal ||
      form?.relato ||
      '';
    return generateSmartQuestions(textContext);
  }, [form, currentNarrative]);

  const handleImproveText = async () => {
    const sourceText =
      currentNarrative ||
      form?.subjective?.patientReport ||
      form?.relato ||
      '';

    if (!sourceText.trim()) return;

    setIsRefining(true);
    try {
      const res = await improveNursingNarrative(sourceText);
      setRefinementResult(res);
    } finally {
      setIsRefining(false);
    }
  };

  const handleApplyImproved = () => {
    if (refinementResult && onApplyImprovedNarrative) {
      onApplyImprovedNarrative(refinementResult.improvedText);
      setAppliedNotice('Texto aprimorado aplicado com sucesso!');
      setTimeout(() => setAppliedNotice(null), 3000);
    }
  };

  const scoreBadgeColor =
    analysis.scoreQualidade >= 85
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : analysis.scoreQualidade >= 65
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-2xs overflow-hidden transition-all">
      {/* Header do Painel */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-teal-50/50 border-b border-indigo-100/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-none">
                Assistente de Enfermagem EvoluiEnf
              </h3>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase">
                Copiloto IA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sugestões assistenciais não vinculantes • Não substitui seu julgamento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de Qualidade da Documentação */}
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${scoreBadgeColor}`}
            title="Índice estimado de completude e qualidade técnica"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{analysis.scoreQualidade}% Qualidade</span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={expanded ? 'Recolher assistente' : 'Expandir assistente'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Navegação de Abas do Assistente */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSubTab('sugestoes')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'sugestoes'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>💡 Sugestões</span>
              {analysis.sugestoes.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">
                  {analysis.sugestoes.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('perguntas')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'perguntas'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Perguntas ({smartQuestions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('melhoria')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'melhoria'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Melhorar Escrita</span>
            </button>
          </div>

          {/* Subaba 1: Sugestões e Campos para Revisar */}
          {activeSubTab === 'sugestoes' && (
            <div className="space-y-3">
              {analysis.sugestoes.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Excelente completude assistencial!</span>
                    <p className="text-emerald-800 mt-0.5">
                      Todos os parâmetros essenciais e dispositivos informados contam com detalhamento técnico adequado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-slate-700 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      ⚠ Campos recomendados para complementar:
                    </span>
                    <span className="text-[11px]">Não bloqueia o registro</span>
                  </div>

                  {analysis.sugestoes.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/30 transition-all text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                              {sug.campo}
                            </span>
                            {sug.nivel === 'atencao' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                                Importante
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 font-medium leading-relaxed">
                            {sug.mensagem}
                          </p>
                          {sug.exemploPratico && (
                            <p className="text-[11px] text-slate-500 italic bg-white/80 p-2 rounded-lg border border-slate-100">
                              {sug.exemploPratico}
                            </p>
                          )}
                        </div>

                        {onApplySuggestion && sug.exemploPratico && (
                          <button
                            type="button"
                            onClick={() => onApplySuggestion(sug.exemploPratico || '')}
                            className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Usar formato de exemplo como base"
                          >
                            <span>Usar base</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Qualidade da documentação visual */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-700">Completude documental:</span>
                  <span className="text-slate-500">
                    {analysis.camposPreenchidos} de {analysis.totalCamposAnalisados} aspectos assistenciais abordados
                  </span>
                </div>
                <span className="font-bold text-slate-900">{analysis.scoreQualidade}/100</span>
              </div>
            </div>
          )}

          {/* Subaba 2: Perguntas Inteligentes */}
          {activeSubTab === 'perguntas' && (
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-indigo-950">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Checklist Reflexivo Assistencial</span>
                  <p className="text-[11px] text-indigo-800 leading-snug">
                    Perguntas baseadas no relato do paciente para estimular o raciocínio clínico de enfermagem.
                  </p>
                </div>
              </div>

              {smartQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 shadow-2xs space-y-1.5 transition-all"
                >
                  <p className="font-bold text-slate-900 leading-snug flex items-start gap-1.5">
                    <span className="text-indigo-600 font-extrabold">•</span>
                    <span>{q.pergunta}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <strong>Objetivo:</strong> {q.motivoAssistencial}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Subaba 3: Melhoria de Texto */}
          {activeSubTab === 'melhoria' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Padronização Técnica e Linguística</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Transforma expressões coloquiais em termos técnicos padronizados de enfermagem sem alterar fatos, inventar dados ou criar diagnósticos.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Texto de origem:{' '}
                  <strong>
                    {currentNarrative ? 'Narrativa atual' : form?.subjective?.patientReport ? 'Relato subjetivo' : 'Nenhum texto informado'}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={handleImproveText}
                  disabled={isRefining}
                  className="inline-flex items-center gap-1.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isRefining ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analisando...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Aprimorar Escrita</span>
                    </>
                  )}
                </button>
              </div>

              {refinementResult && (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-indigo-200">
                  {refinementResult.aiNotice && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
                      {refinementResult.aiNotice} O EvoluiEnf manteve apenas o refinamento local seguro, sem consumir nova consulta de IA.
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Sugestão Técnica Proposta:
                    </span>
                    <p className="text-xs text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-medium">
                      {refinementResult.improvedText}
                    </p>
                  </div>

                  {refinementResult.alteracoesLinguisticas.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Ajustes de redação realizados:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                        {refinementResult.alteracoesLinguisticas.map((alt, idx) => (
                          <li key={idx}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {onApplyImprovedNarrative && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={handleApplyImproved}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirmar e Aplicar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {appliedNotice && (
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-center font-bold text-xs">
                  {appliedNotice}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
