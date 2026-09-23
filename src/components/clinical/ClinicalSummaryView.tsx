import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  AlertTriangle,
  Lock,
  Heart,
  Brain,
  Wind,
  Shield,
  Activity,
  Droplets,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ClinicalEvolutionForm, ValidationAlert } from '../../types/clinical';
import { ClinicalAlertNotice } from './ClinicalAlertNotice';

interface ClinicalSummaryViewProps {
  form: ClinicalEvolutionForm;
  alerts: ValidationAlert[];
  onBackToForm: () => void;
  onEditSection: (sectionIndex: number) => void;
  onConfirmComplete: () => void;
}

export const ClinicalSummaryView: React.FC<ClinicalSummaryViewProps> = ({
  form,
  alerts,
  onBackToForm,
  onEditSection,
  onConfirmComplete,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBackToForm}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à edição dos campos</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resumo da Anotação de Enfermagem
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Revise as informações registradas antes de consolidar os dados.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onConfirmComplete}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-cyan-800 hover:bg-cyan-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Concluir Anotação</span>
          </button>
        </div>
      </div>

      {/* Validation alert banner if needed */}
      <ClinicalAlertNotice alerts={alerts} onNavigateToSection={onEditSection} />

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* 1. Contexto & Avaliação Geral */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Contexto e Avaliação Geral
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(0)}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {form.context.moment && (
              <div>
                <span className="text-slate-400 block font-medium">Momento:</span>
                <span className="font-semibold text-slate-800">{form.context.moment}</span>
              </div>
            )}
            {form.context.location && (
              <div>
                <span className="text-slate-400 block font-medium">Localização:</span>
                <span className="font-semibold text-slate-800">
                  {form.context.location === 'Outro'
                    ? form.context.locationCustom || 'Outro'
                    : form.context.location}
                </span>
              </div>
            )}
            {form.context.accompaniment && (
              <div>
                <span className="text-slate-400 block font-medium">Acompanhamento:</span>
                <span className="font-semibold text-slate-800">
                  {form.context.accompaniment === 'Outro'
                    ? form.context.accompanimentCustom || 'Outro'
                    : form.context.accompaniment}
                </span>
              </div>
            )}
            {form.context.allergies && (
              <div>
                <span className="text-slate-400 block font-medium">Alergias:</span>
                <span className="font-semibold text-slate-800">
                  {form.context.allergies}
                  {form.context.allergies === 'Sim' && form.context.allergiesDetails
                    ? ` (${form.context.allergiesDetails})`
                    : ''}
                </span>
              </div>
            )}
            {form.context.precaution && (
              <div>
                <span className="text-slate-400 block font-medium">Precaução:</span>
                <span className="font-semibold text-slate-800">
                  {form.context.precaution === 'Outra'
                    ? form.context.precautionCustom || 'Outra'
                    : form.context.precaution}
                </span>
              </div>
            )}
            {form.generalAssessment.generalState && (
              <div>
                <span className="text-slate-400 block font-medium">Estado Geral:</span>
                <span className="font-semibold text-slate-800">
                  {form.generalAssessment.generalState}
                </span>
              </div>
            )}
            {form.generalAssessment.behavior.length > 0 && (
              <div className="col-span-full">
                <span className="text-slate-400 block font-medium">Comportamento/Atitude:</span>
                <span className="font-semibold text-slate-800">
                  {form.generalAssessment.behavior.join(', ')}
                </span>
              </div>
            )}
            {form.generalAssessment.complaints && (
              <div className="col-span-full">
                <span className="text-slate-400 block font-medium">Queixas:</span>
                <span className="font-semibold text-slate-800">
                  {form.generalAssessment.complaints}
                  {form.generalAssessment.complaintsDetails
                    ? ` — ${form.generalAssessment.complaintsDetails}`
                    : ''}
                </span>
              </div>
            )}
            {form.generalAssessment.mobility && (
              <div>
                <span className="text-slate-400 block font-medium">Mobilidade:</span>
                <span className="font-semibold text-slate-800">
                  {form.generalAssessment.mobility}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Sinais Vitais e Dor */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Sinais Vitais e Dor
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(2)}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">PA</span>
              <span className="text-sm font-black text-slate-900">
                {form.vitalSigns.systolicBP && form.vitalSigns.diastolicBP
                  ? `${form.vitalSigns.systolicBP}x${form.vitalSigns.diastolicBP}`
                  : form.vitalSigns.systolicBP || '—'}
              </span>
              <span className="text-[10px] text-slate-400">mmHg</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">FC</span>
              <span className="text-sm font-black text-slate-900">
                {form.vitalSigns.heartRate || '—'}
              </span>
              <span className="text-[10px] text-slate-400">bpm</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">FR</span>
              <span className="text-sm font-black text-slate-900">
                {form.vitalSigns.respiratoryRate || '—'}
              </span>
              <span className="text-[10px] text-slate-400">irpm</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">SpO₂</span>
              <span className="text-sm font-black text-slate-900">
                {form.vitalSigns.oxygenSaturation || '—'}
              </span>
              <span className="text-[10px] text-slate-400">%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Tax</span>
              <span className="text-sm font-black text-slate-900">
                {form.vitalSigns.temperature || '—'}
              </span>
              <span className="text-[10px] text-slate-400">°C</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Dor (EVA)</span>
              <span className="text-sm font-black text-slate-900">
                {form.pain.assessmentType === 'Escala numérica 0–10' &&
                form.pain.numericScaleValue !== undefined
                  ? `${form.pain.numericScaleValue}/10`
                  : form.pain.assessmentType || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Neurológico */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">
                3. Neurológico
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(3)}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {form.neurological.consciousnessLevel && (
              <div>
                <span className="text-slate-400 block font-medium">Nível de Consciência:</span>
                <span className="font-semibold text-slate-800">
                  {form.neurological.consciousnessLevel}
                </span>
              </div>
            )}
            {form.neurological.orientation && (
              <div>
                <span className="text-slate-400 block font-medium">Orientação:</span>
                <span className="font-semibold text-slate-800">
                  {form.neurological.orientation}
                </span>
              </div>
            )}
            {form.neurological.glasgowScore !== undefined && (
              <div>
                <span className="text-slate-400 block font-medium">Escala de Glasgow:</span>
                <span className="font-semibold text-slate-800">
                  {form.neurological.glasgowScore} pontos
                </span>
              </div>
            )}
            {form.neurological.rassScore !== undefined && (
              <div>
                <span className="text-slate-400 block font-medium">Escala RASS:</span>
                <span className="font-semibold text-slate-800">
                  {form.neurological.rassScore > 0
                    ? `+${form.neurological.rassScore}`
                    : form.neurological.rassScore}
                </span>
              </div>
            )}
            {form.neurological.pupils && (
              <div>
                <span className="text-slate-400 block font-medium">Pupilas:</span>
                <span className="font-semibold text-slate-800">
                  {form.neurological.pupils}
                </span>
              </div>
            )}
            {form.neurological.photoreaction && (
              <div>
                <span className="text-slate-400 block font-medium">Fotorreatividade:</span>
                <span className="font-semibold text-slate-800">
                  {form.neurological.photoreaction}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Respiratório */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">
                4. Respiratório
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(4)}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {form.respiratory.respiratorySupport && (
              <div>
                <span className="text-slate-400 block font-medium">Suporte Respiratório:</span>
                <span className="font-semibold text-slate-800">
                  {form.respiratory.respiratorySupport}
                  {form.respiratory.oxygenDevice
                    ? ` (${form.respiratory.oxygenDevice} a ${form.respiratory.oxygenFlowRate || '—'} L/min)`
                    : ''}
                </span>
              </div>
            )}
            {form.respiratory.respiratoryPattern && (
              <div>
                <span className="text-slate-400 block font-medium">Padrão Respiratório:</span>
                <span className="font-semibold text-slate-800">
                  {form.respiratory.respiratoryPattern}
                </span>
              </div>
            )}
            {form.respiratory.respiratoryDistress && (
              <div>
                <span className="text-slate-400 block font-medium">Desconforto Respiratório:</span>
                <span className="font-semibold text-slate-800">
                  {form.respiratory.respiratoryDistress}
                </span>
              </div>
            )}
            {form.respiratory.breathSounds && (
              <div>
                <span className="text-slate-400 block font-medium">Murmúrio Vesicular:</span>
                <span className="font-semibold text-slate-800">
                  {form.respiratory.breathSounds}
                </span>
              </div>
            )}
            {form.respiratory.adventitiousSounds.length > 0 && (
              <div className="col-span-full">
                <span className="text-slate-400 block font-medium">Ruídos Adventícios:</span>
                <span className="font-semibold text-slate-800">
                  {form.respiratory.adventitiousSounds.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Cardiovascular & DVA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">
                5. Cardiovascular e Drogas Vasoativas
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(5)}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {form.cardiovascular.hemodynamicCondition && (
              <div>
                <span className="text-slate-400 block font-medium">Condição Hemodinâmica:</span>
                <span className="font-semibold text-slate-800">
                  {form.cardiovascular.hemodynamicCondition}
                </span>
              </div>
            )}
            {form.cardiovascular.peripheralPerfusion && (
              <div>
                <span className="text-slate-400 block font-medium">Perfusão Periférica:</span>
                <span className="font-semibold text-slate-800">
                  {form.cardiovascular.peripheralPerfusion}
                </span>
              </div>
            )}
            {form.cardiovascular.extremities && (
              <div>
                <span className="text-slate-400 block font-medium">Extremidades:</span>
                <span className="font-semibold text-slate-800">
                  {form.cardiovascular.extremities}
                </span>
              </div>
            )}
            {form.vasoactiveDrugs.inUse && (
              <div>
                <span className="text-slate-400 block font-medium">Drogas Vasoativas:</span>
                <span className="font-semibold text-slate-800">
                  {form.vasoactiveDrugs.inUse === 'Sim'
                    ? form.vasoactiveDrugs.drugsList
                        .map(
                          (d) =>
                            `${d.medication || 'DVA'} (${d.infusionRate || '—'} ${d.unit})`
                        )
                        .join(', ') || 'Sim (sem drogas cadastradas)'
                    : 'Não'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 6. Dispositivos & Integridade Cutânea */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">
                6. Dispositivos e Integridade Cutânea
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(10)}
              className="text-xs text-teal-800 hover:text-teal-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {form.devices.list.length > 0 ? (
              <div className="space-y-1.5">
                <span className="text-slate-400 block font-medium">Dispositivos Invasivos:</span>
                <div className="flex flex-wrap gap-2">
                  {form.devices.list.map((d, i) => (
                    <span
                      key={d.id || i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-800"
                    >
                      {d.type || 'Dispositivo'} em {d.location || 'Local não inf.'} (
                      {d.permeability || 'Perviedade s/inf'})
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">Nenhum dispositivo invasivo registrado.</p>
            )}

            {form.skin.integrity && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block font-medium">Integridade da Pele:</span>
                <span className="font-semibold text-slate-800">
                  {form.skin.integrity}
                  {form.skin.lesionLocation ? ` em ${form.skin.lesionLocation}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 7. Situação Final */}
        {form.finalStatus.condition && (
          <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2 text-xs">
            <span className="text-teal-900 block font-bold uppercase tracking-wider text-[11px]">
              Situação Final do Paciente
            </span>
            <p className="text-sm font-semibold text-teal-950">
              {form.finalStatus.condition === 'Outra situação'
                ? form.finalStatus.conditionCustom || 'Outra situação'
                : form.finalStatus.condition}
            </p>
          </div>
        )}
      </div>

      {/* Privacy note */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-slate-600 text-xs">
        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          Os dados inseridos não contêm identificadores de pacientes e são mantidos
          estritamente na sessão local para validação de estrutura.
        </span>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToForm}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          Voltar e Editar
        </button>

        <button
          type="button"
          onClick={onConfirmComplete}
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-cyan-800 hover:bg-cyan-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Confirmar e Finalizar Anotação</span>
        </button>
      </div>
    </div>
  );
};
