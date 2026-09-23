import React, { useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowLeft,
  Save,
  Sparkles,
  ShieldCheck,
  Layers,
  Info,
  Check,
  HelpCircle,
} from 'lucide-react';
import {
  explainGenerationBasis,
  evaluateDocumentationQuality,
} from '../../../services/aiAssistant/aiAssistantService';
import { GenerationBasisExplanation } from '../../../services/aiAssistant/aiAssistantTypes';
import { HelpTooltip } from '../../HelpTooltip';
import {
  ClinicalDocumentationQualityReview,
  DocumentationQualityReviewResult,
} from '../../../services/clinicalDocumentationQualityReview';

interface AIQualityReviewProps {
  form: any;
  narrative: string;
  modeloNome?: string;
  role?: 'technician' | 'nurse';
  moduleType?: string;
  area?: string;
  onReview: () => void;
  onConfirmSave: () => void;
  isSaving?: boolean;
}

export const AIQualityReview: React.FC<AIQualityReviewProps> = ({
  form,
  narrative,
  modeloNome,
  role = 'nurse',
  moduleType = 'NURSE_SOAP',
  area,
  onReview,
  onConfirmSave,
  isSaving = false,
}) => {
  const quality = evaluateDocumentationQuality(form);

  const docReview: DocumentationQualityReviewResult = useMemo(() => {
    return ClinicalDocumentationQualityReview.evaluate(form, {
      moduleType,
      role,
      area,
    });
  }, [form, moduleType, role, area]);

  const basis: GenerationBasisExplanation = explainGenerationBasis({
    subjective: form?.subjective,
    vitalSigns: form?.objective?.vitalSigns || form?.sinaisVitais,
    physicalExam: form?.objective?.physicalExam || form?.exameFisico,
    devices: form?.objective?.devices || form?.dispositivos,
    interventions: form?.plan?.interventions || form?.intervencoes,
    modeloUtilizado: modeloNome,
  });

  const displayScore = Math.max(quality.score, docReview.completionScore);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Cabeçalho da Revisão */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Revisão de Qualidade da Documentação
            </h2>
            <HelpTooltip
              id="tooltip-revisao-qualidade"
              title="Revisão de Qualidade"
              text="Avaliação consultiva de preenchimento, completude e consistência clínica."
            />
          </div>
          <p className="text-xs text-slate-500">
            Avaliação consultiva de preenchimento e consistência clínica. Não bloqueia o salvamento.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-full text-xs font-bold shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Qualidade: {displayScore}%</span>
        </div>
      </div>

      {/* Status Geral e Garantia de Não-Bloqueio */}
      <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between text-xs text-teal-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span className="font-semibold">
            Status Documental: {docReview.status === 'excelente' ? 'Excelente' : docReview.status === 'adequada' ? 'Adequado' : 'Requer Atenção'}
          </span>
        </div>
        <span className="text-[11px] text-teal-700 bg-white/80 px-2.5 py-0.5 rounded-md border border-teal-200 font-medium">
          Envio Não Bloqueante
        </span>
      </div>

      {/* Bloco de Campos Essenciais da Avaliação */}
      {docReview.essentialFields.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Campos Essenciais ({docReview.completedEssentialFields}/{docReview.totalEssentialFields})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {docReview.essentialFields.map((f, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                  f.present
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-amber-50/40 border-amber-200 text-slate-700'
                }`}
              >
                {f.present ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <span className="font-semibold block text-[11px] text-slate-900">
                    {f.name}
                  </span>
                  {f.hint && (
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {f.hint}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inconsistências Detectadas (se houver) */}
      {docReview.inconsistencies.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-950">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Inconsistências Detectadas (Consultivo):</span>
          </div>
          <div className="space-y-1.5 text-xs text-rose-900 pl-6">
            {docReview.inconsistencies.map((inc) => (
              <div key={inc.id} className="leading-relaxed">
                <span className="font-semibold">{inc.title}:</span> {inc.description}{' '}
                <span className="italic text-rose-700 block text-[11px]">Recomendação: {inc.recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sugestões de Melhoria (se houver) */}
      {(quality.sugestoesMelhoria.length > 0 || docReview.suggestions.length > 0) && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Sugestões de melhoria (não bloqueantes):</span>
          </div>
          <ul className="space-y-1 text-xs text-amber-900 pl-6 list-disc">
            {Array.from(new Set([...quality.sugestoesMelhoria, ...docReview.suggestions])).map((sug, idx) => (
              <li key={idx} className="leading-relaxed">
                {sug}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5) EXPLICABILIDADE DA IA: Base da Construção da Evolução */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-700" />
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              {basis.titulo}
            </h3>
          </div>
          {basis.modeloUtilizado && (
            <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
              Modelo: {basis.modeloUtilizado}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {basis.itensUtilizados.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                item.presente
                  ? 'bg-white border-indigo-100 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              {item.presente ? (
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className="font-bold block text-[11px] text-slate-900">
                  {item.categoria}
                </span>
                <span className="text-[11px] text-slate-500 leading-snug">
                  {item.descricao}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-indigo-100/70">
          {basis.avisoEtico}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onReview}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Revisar</span>
        </button>

        <div className="inline-flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onConfirmSave}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar evolução'}</span>
          </button>
          <HelpTooltip
            id="tooltip-salvar-documento"
            title="Salvar Documento"
            text="Armazena o documento com anonimização ativa e rastreabilidade profissional."
          />
        </div>
      </div>
    </div>
  );
};
