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
  Save,
} from 'lucide-react';
import { NurseSoapForm } from '../../../types/nurseSoap';
import { Atendimento } from '../../../types';
import { AtendimentoService } from '../../../services/atendimentoService';
import { EvolutionService } from '../../../services/evolutionService';
import {
  buildAuthorizedNurseSoapFacts,
  auditNurseSoapNarrative,
} from '../../../engine/nurseSoapFactBuilder';
import { buildNurseSoapNoteWithTrace } from '../../../engine/nurseSoapBuilder';
import { refineNurseSoapWithAI } from '../../../services/nurseSoapAiRefinementService';
import { AIRefinementRequestResult } from '../../../services/aiRefinementService';
import { checkPrivacyGuards } from '../../../engine/privacyGuard';
import { AIQualityReview } from '../aiAssistant/AIQualityReview';

interface NurseSoapPreviewViewProps {
  form: NurseSoapForm;
  onBackToEdit: () => void;
  patientAreaName?: string;
  atendimento?: Atendimento;
}

export const NurseSoapPreviewView: React.FC<NurseSoapPreviewViewProps> = ({
  form,
  onBackToEdit,
  patientAreaName = 'Ambulatório / Consulta',
  atendimento,
}) => {
  const authorizedFacts = buildAuthorizedNurseSoapFacts(form);
  const { narrative: deterministicBaseline, traces } =
    buildNurseSoapNoteWithTrace(authorizedFacts);
  const auditResult = auditNurseSoapNarrative(deterministicBaseline, authorizedFacts);

  const [activeText, setActiveText] = useState<string>(deterministicBaseline);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [refinementStatus, setRefinementStatus] = useState<AIRefinementRequestResult | null>(null);

  const piiCheck = checkPrivacyGuards(activeText);

  const handleSaveEvolution = async () => {
    setIsSaving(true);
    try {
      if (atendimento?.id) {
        AtendimentoService.salvarAtendimento({
          atendimentoId: atendimento.id,
          usuarioId: atendimento.usuarioId,
          usuarioResponsavel: atendimento.usuarioResponsavel,
          perfilProfissional: 'Enfermeiro(a)',
          categoriaClinica: atendimento.setor,
          tipoRegistro: 'Evolução SOAP',
          textoFinalGerado: activeText,
          setor: atendimento.setor,
          leito: atendimento.leito,
          identificacao: atendimento.identificacao,
          resumoRegistro: `Registro SOAP finalizado. Identificação: ${atendimento.identificacao}`,
        });

        await EvolutionService.salvarEvolucao({
          usuarioId: atendimento.usuarioId,
          atendimentoId: atendimento.id,
          identificacao: atendimento.identificacao,
          setor: atendimento.setor,
          tipoRegistro: 'Evolução SOAP',
          moduloId: 'NURSE_SOAP',
          narrativa: activeText,
          fatosAutorizados: authorizedFacts,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.warn('Falha ao registrar evolução no Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    handleSaveEvolution();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefineWithAI = async () => {
    setIsRefining(true);
    try {
      const result = await refineNurseSoapWithAI(form, authorizedFacts, deterministicBaseline);
      setRefinementStatus(result);
      if (result.success && result.refinedText) {
        setActiveText(result.refinedText);
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleRestoreBaseline = () => {
    setActiveText(deterministicBaseline);
    setRefinementStatus(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBackToEdit}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Formulário SOAP
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            Visualização do Registro SOAP de Enfermagem
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Documentação clínica estruturada (Subjetivo, Objetivo, Avaliação, Plano) — {patientAreaName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            id="btn-copy-soap"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={handleRefineWithAI}
            disabled={isRefining}
            id="btn-ai-refine-soap"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRefining ? 'Refinando texto...' : 'Refinar com IA'}</span>
          </button>
        </div>
      </div>

      {/* Clinical Lock Status Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between font-semibold text-slate-800 text-sm">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Garantia de Segurança Clínica EvoluiEnf (COFEN & Locks Rigorosos)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
            Ativo
          </span>
        </div>
        <p>
          Esta documentação é gerada exclusivamente a partir dos fatos clínicos autorizados inseridos pelo profissional.
          A inteligência artificial opera sob bloqueio estrito (Zero Alucinação, SOAPClinicalReasoningLock e SOAPPlanLock),
          sendo terminantemente proibida a geração autônoma de diagnósticos, prescrições ou hipóteses causais.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" /> SOAPClinicalReasoningLock
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" /> SOAPPlanLock
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" /> PrivacyGuard (LGPD)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" /> NumericFactLock
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            <Lock className="w-3 h-3 text-emerald-600" /> NurseJudgmentLock
          </span>
        </div>
      </div>

      {/* Refinement Result Alerts */}
      {refinementStatus && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
            refinementStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {refinementStatus.success ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <div className="font-semibold">
              {refinementStatus.success
                ? 'Texto refinado com sucesso e validado por todos os locks clínicos!'
                : 'Texto mantido na versão determinística segura:'}
            </div>
            <div className="text-xs opacity-90">
              {refinementStatus.success
                ? `Modelo: ${refinementStatus.model} | Verificador: Aprovado sem alterações de fatos clínicos.`
                : refinementStatus.error || 'O refinamento foi bloqueado para resguardar a integridade factual.'}
            </div>
            {!refinementStatus.success && (
              <button
                onClick={handleRestoreBaseline}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 underline hover:text-amber-950"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restaurar texto canônico original
              </button>
            )}
          </div>
        </div>
      )}

      {/* Narrative Text Container */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Corpo da Nota Clínica</span>
          <span className="text-slate-400">
            {activeText.split(/\s+/).filter(Boolean).length} palavras | {traces.length} fatos mapeados
          </span>
        </div>
        <div className="p-6">
          <pre
            id="text-soap-output"
            className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 selection:bg-emerald-100"
          >
            {activeText}
          </pre>
        </div>
      </div>

      {/* Alerta de Sucesso ao Salvar */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 font-semibold text-sm">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Evolução SOAP salva com sucesso no histórico de atendimentos e na nuvem!</span>
        </div>
      )}

      {/* 6) AIQualityReview - Revisão antes de salvar */}
      <AIQualityReview
        form={form}
        narrative={activeText}
        modeloNome={atendimento?.modeloNome}
        onReview={onBackToEdit}
        onConfirmSave={handleSaveEvolution}
        isSaving={isSaving}
      />

      {/* Audit & Traceability Panel */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Auditoria de Fatos e Rastreabilidade SOAP</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              auditResult.passed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {auditResult.passed ? '100% Rastreável' : 'Revisão Recomendada'}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Cada seção e oração do texto gerado corresponde a uma chave factual autorizada pelo enfermeiro, garantindo total conformidade legal.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-slate-400 text-[10px] font-semibold uppercase">Subjetivo</span>
            <span className="font-medium text-slate-800">
              {(authorizedFacts.subjective || []).length} fatos
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-slate-400 text-[10px] font-semibold uppercase">Objetivo</span>
            <span className="font-medium text-slate-800">
              {[
                ...(authorizedFacts.vitalSigns || []),
                ...(authorizedFacts.physicalExam || []),
                ...(authorizedFacts.devices || []),
                ...(authorizedFacts.medications || []),
              ].length} fatos
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-slate-400 text-[10px] font-semibold uppercase">Avaliação</span>
            <span className="font-medium text-slate-800">
              {[
                ...(authorizedFacts.assessment || []),
                ...(authorizedFacts.nursingDiagnoses || []),
              ].length} fatos
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-slate-400 text-[10px] font-semibold uppercase">Plano</span>
            <span className="font-medium text-slate-800">
              {[
                ...(authorizedFacts.plan || []),
                ...(authorizedFacts.interventions || []),
                ...(authorizedFacts.responseToCare || []),
              ].length} fatos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
