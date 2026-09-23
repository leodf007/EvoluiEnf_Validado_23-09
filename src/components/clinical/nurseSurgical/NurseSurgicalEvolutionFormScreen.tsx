import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  Activity,
  Heart,
  Wind,
  Droplet,
  CheckCircle2,
} from 'lucide-react';
import {
  NurseSurgicalEvolutionForm,
  createInitialNurseSurgicalEvolutionForm,
  NurseSurgicalDrainItem,
  NurseSurgicalInvasiveDeviceItem,
} from '../../../types/nurseSurgicalEvolution';
import {
  normalizeNurseSurgicalEvolutionForm,
  validateNurseSurgicalEvolutionConsistency,
} from '../../../engine/nurseSurgicalEvolutionFactBuilder';
import { ClinicalConsistencyAlert } from '../../../engine/types';
import { NurseSurgicalEvolutionPreviewView } from './NurseSurgicalEvolutionPreviewView';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface NurseSurgicalEvolutionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const NurseSurgicalEvolutionFormScreen: React.FC<NurseSurgicalEvolutionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Evolução de Enfermagem — Clínica Cirúrgica" onNavigateHome={props.onBack}>
      <NurseSurgicalEvolutionFormContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const NurseSurgicalEvolutionFormContent: React.FC<NurseSurgicalEvolutionFormScreenProps> = ({
  onBack,
  patientAreaName = 'Clínica Cirúrgica',
}) => {
  const [form, setForm] = useState<NurseSurgicalEvolutionForm>(() => createInitialNurseSurgicalEvolutionForm());
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  const normalizedForm = useMemo(() => normalizeNurseSurgicalEvolutionForm(form), [form]);
  const consistencyAlerts: ClinicalConsistencyAlert[] = useMemo(
    () => validateNurseSurgicalEvolutionConsistency(normalizedForm),
    [normalizedForm]
  );

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? null : idx));
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja limpar todos os campos da evolução de enfermagem de Clínica Cirúrgica?')) {
      setForm(createInitialNurseSurgicalEvolutionForm());
      setActiveSection(0);
    }
  };

  // Updaters
  const updateContext = (patch: Partial<NurseSurgicalEvolutionForm['context']>) => {
    setForm((p) => ({ ...p, context: { ...p.context, ...patch } }));
  };

  const updateSafety = (patch: Partial<NurseSurgicalEvolutionForm['safetyIdentification']>) => {
    setForm((p) => ({ ...p, safetyIdentification: { ...p.safetyIdentification, ...patch } }));
  };

  const updateSurgicalContext = (patch: Partial<NurseSurgicalEvolutionForm['surgicalContext']>) => {
    setForm((p) => ({ ...p, surgicalContext: { ...p.surgicalContext, ...patch } }));
  };

  const updateGeneral = (patch: Partial<NurseSurgicalEvolutionForm['generalAssessment']>) => {
    setForm((p) => ({ ...p, generalAssessment: { ...p.generalAssessment, ...patch } }));
  };

  const updatePain = (patch: Partial<NurseSurgicalEvolutionForm['pain']>) => {
    setForm((p) => ({ ...p, pain: { ...p.pain, ...patch } }));
  };

  const updateVitals = (patch: Partial<NurseSurgicalEvolutionForm['vitalSigns']>) => {
    setForm((p) => ({ ...p, vitalSigns: { ...p.vitalSigns, ...patch } }));
  };

  const updateNeurological = (patch: Partial<NurseSurgicalEvolutionForm['neurological']>) => {
    setForm((p) => ({ ...p, neurological: { ...p.neurological, ...patch } }));
  };

  const updateRespiratory = (patch: Partial<NurseSurgicalEvolutionForm['respiratory']>) => {
    setForm((p) => ({ ...p, respiratory: { ...p.respiratory, ...patch } }));
  };

  const updateCardiovascular = (patch: Partial<NurseSurgicalEvolutionForm['cardiovascular']>) => {
    setForm((p) => ({ ...p, cardiovascular: { ...p.cardiovascular, ...patch } }));
  };

  const updateGastrointestinal = (patch: Partial<NurseSurgicalEvolutionForm['gastrointestinal']>) => {
    setForm((p) => ({ ...p, gastrointestinal: { ...p.gastrointestinal, ...patch } }));
  };

  const updateNutrition = (patch: Partial<NurseSurgicalEvolutionForm['nutrition']>) => {
    setForm((p) => ({ ...p, nutrition: { ...p.nutrition, ...patch } }));
  };

  const updateEliminations = (patch: Partial<NurseSurgicalEvolutionForm['eliminations']>) => {
    setForm((p) => ({ ...p, eliminations: { ...p.eliminations, ...patch } }));
  };

  const updateWound = (patch: Partial<NurseSurgicalEvolutionForm['surgicalWound']>) => {
    setForm((p) => ({ ...p, surgicalWound: { ...p.surgicalWound, ...patch } }));
  };

  const updateDressing = (patch: Partial<NurseSurgicalEvolutionForm['surgicalDressing']>) => {
    setForm((p) => ({ ...p, surgicalDressing: { ...p.surgicalDressing, ...patch } }));
  };

  const updateDrains = (patch: Partial<NurseSurgicalEvolutionForm['drains']>) => {
    setForm((p) => ({ ...p, drains: { ...p.drains, ...patch } }));
  };

  const addDrain = () => {
    const newItem: NurseSurgicalDrainItem = {
      id: `drain-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'Portovac',
      location: '',
      permeability: 'Pérvio',
      functioning: 'Funcionante sob aspiração a vácuo',
      fixation: 'Fixado com ponto cirúrgico',
      drainAspect: 'Seroso',
      volumeReported: '',
    };
    setForm((p) => ({
      ...p,
      drains: {
        ...p.drains,
        hasDrains: 'Sim',
        list: [...p.drains.list, newItem],
      },
    }));
  };

  const updateDrainItem = (idx: number, patch: Partial<NurseSurgicalDrainItem>) => {
    setForm((p) => {
      const nextList = [...p.drains.list];
      nextList[idx] = { ...nextList[idx], ...patch };
      return { ...p, drains: { ...p.drains, list: nextList } };
    });
  };

  const removeDrainItem = (idx: number) => {
    setForm((p) => {
      const nextList = p.drains.list.filter((_, i) => i !== idx);
      return { ...p, drains: { ...p.drains, list: nextList } };
    });
  };

  const addDevice = () => {
    const newItem: NurseSurgicalInvasiveDeviceItem = {
      id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'AVP',
      anatomicalSite: 'MSD',
      laterality: 'Direito',
      siteCondition: 'Sem sinais flogísticos',
      dressingCondition: 'Limpo e seco',
      permeability: 'Pérvio',
    };
    setForm((p) => ({
      ...p,
      devices: {
        list: [...p.devices.list, newItem],
      },
    }));
  };

  const updateDeviceItem = (idx: number, patch: Partial<NurseSurgicalInvasiveDeviceItem>) => {
    setForm((p) => {
      const nextList = [...p.devices.list];
      nextList[idx] = { ...nextList[idx], ...patch };
      return { ...p, devices: { list: nextList } };
    });
  };

  const removeDeviceItem = (idx: number) => {
    setForm((p) => {
      const nextList = p.devices.list.filter((_, i) => i !== idx);
      return { ...p, devices: { list: nextList } };
    });
  };

  const updateMobility = (patch: Partial<NurseSurgicalEvolutionForm['mobility']>) => {
    setForm((p) => ({ ...p, mobility: { ...p.mobility, ...patch } }));
  };

  const updateHygiene = (patch: Partial<NurseSurgicalEvolutionForm['hygiene']>) => {
    setForm((p) => ({ ...p, hygiene: { ...p.hygiene, ...patch } }));
  };

  const updateRisks = (patch: Partial<NurseSurgicalEvolutionForm['riskAssessment']>) => {
    setForm((p) => ({ ...p, riskAssessment: { ...p.riskAssessment, ...patch } }));
  };

  const updateCare = (patch: Partial<NurseSurgicalEvolutionForm['careDone']>) => {
    setForm((p) => ({ ...p, careDone: { ...p.careDone, ...patch } }));
  };

  const updateResponse = (patch: Partial<NurseSurgicalEvolutionForm['responseToCare']>) => {
    setForm((p) => ({ ...p, responseToCare: { ...p.responseToCare, ...patch } }));
  };

  const updateComplications = (patch: Partial<NurseSurgicalEvolutionForm['complications']>) => {
    setForm((p) => ({ ...p, complications: { ...p.complications, ...patch } }));
  };

  const updateCommunication = (patch: Partial<NurseSurgicalEvolutionForm['communication']>) => {
    setForm((p) => ({ ...p, communication: { ...p.communication, ...patch } }));
  };

  const updateComparison = (patch: Partial<NurseSurgicalEvolutionForm['comparisonWithPrevious']>) => {
    setForm((p) => ({ ...p, comparisonWithPrevious: { ...p.comparisonWithPrevious, ...patch } }));
  };

  const updateSynthesis = (patch: Partial<NurseSurgicalEvolutionForm['nursingSynthesis']>) => {
    setForm((p) => ({ ...p, nursingSynthesis: { ...p.nursingSynthesis, ...patch } }));
  };

  const updateStatus = (patch: Partial<NurseSurgicalEvolutionForm['currentStatus']>) => {
    setForm((p) => ({ ...p, currentStatus: { ...p.currentStatus, ...patch } }));
  };

  if (viewMode === 'preview') {
    return (
      <NurseSurgicalEvolutionPreviewView
        form={normalizedForm}
        onBackToEdit={() => setViewMode('form')}
        patientAreaName={patientAreaName}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Top Breadcrumb & Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-back-to-areas"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar às áreas</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            id="btn-clear-form"
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar formulário</span>
          </button>
          <button
            id="btn-view-preview"
            type="button"
            onClick={() => setViewMode('preview')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Visualizar Evolução</span>
          </button>
        </div>
      </div>

      {/* Screen Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Evolução de Enfermagem — {patientAreaName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Registro sistematizado privativo do Enfermeiro para enfermaria cirúrgica e recuperação pós-operatória.
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Perfil Enfermeiro
          </span>
        </div>
      </div>

      {/* Consistency Alerts Banner */}
      {consistencyAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Avisos de Consistência Clínica ({consistencyAlerts.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {consistencyAlerts.map((a) => (
              <li key={a.id}>
                <span className="font-medium text-amber-950">[{a.ruleId}]</span> {a.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-3">
        {/* 1. Contexto da evolução */}
        <ClinicalSection
          id="sec-1-context"
          title="1. Contexto da evolução"
          description="Momento, localização e acompanhante"
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
          isFilled={Boolean(form.context.moment || form.context.location)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Momento da evolução"
              value={form.context.moment}
              onChange={(val) => updateContext({ moment: val })}
              options={[
                'Início do plantão',
                'Meio do plantão',
                'Término do plantão',
                'Admissão no setor',
                'Retorno de centro cirúrgico',
                'Transferência',
                'Outro',
              ]}
            />
            {form.context.moment === 'Outro' && (
              <ClinicalTextInput
                id="inp-ctx-custom-moment"
                label="Especifique o momento"
                value={form.context.customMoment || ''}
                onChange={(val) => updateContext({ customMoment: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Localização"
              value={form.context.location}
              onChange={(val) => updateContext({ location: val })}
              options={['Enfermaria Cirúrgica', 'Apartamento', 'Leito cirúrgico', 'RPA / Recuperação', 'Outro']}
            />
            {form.context.location === 'Outro' && (
              <ClinicalTextInput
                id="inp-ctx-custom-location"
                label="Especifique a localização"
                value={form.context.customLocation || ''}
                onChange={(val) => updateContext({ customLocation: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Acompanhamento"
              value={form.context.escort}
              onChange={(val) => updateContext({ escort: val })}
              options={['Desacompanhado', 'Familiar', 'Acompanhante contratado', 'Responsável', 'Outro']}
            />
            {form.context.escort === 'Outro' && (
              <ClinicalTextInput
                id="inp-ctx-custom-escort"
                label="Especifique o acompanhante"
                value={form.context.customEscort || ''}
                onChange={(val) => updateContext({ customEscort: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 2. Segurança e identificação */}
        <ClinicalSection
          id="sec-2-safety"
          title="2. Segurança e identificação"
          description="Pulseira, leito, precauções e alergias"
          isOpen={activeSection === 1}
          onToggle={() => toggleSection(1)}
          isFilled={Boolean(form.safetyIdentification.wristbandIdentification || form.safetyIdentification.hasAllergies)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Pulseira de identificação"
              value={form.safetyIdentification.wristbandIdentification}
              onChange={(val) => updateSafety({ wristbandIdentification: val })}
              options={['Presente e conferida', 'Ausente', 'Danificada', 'Não se aplica']}
            />
            <ClinicalOptionGroup
              label="Identificação no leito"
              value={form.safetyIdentification.bedIdentification}
              onChange={(val) => updateSafety({ bedIdentification: val })}
              options={['Presente e conferida', 'Ausente', 'Incorreta', 'Não se aplica']}
            />
            <ClinicalOptionGroup
              label="Precauções assistenciais"
              value={form.safetyIdentification.precaution}
              onChange={(val) => updateSafety({ precaution: val })}
              options={['Padrão', 'Contato', 'Gotículas', 'Aerossóis', 'Outra', 'Não informado']}
            />
            {form.safetyIdentification.precaution === 'Outra' && (
              <ClinicalTextInput
                id="inp-safety-custom-precaution"
                label="Especifique a precaução"
                value={form.safetyIdentification.customPrecaution || ''}
                onChange={(val) => updateSafety({ customPrecaution: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Alergias conhecidas"
              value={form.safetyIdentification.hasAllergies}
              onChange={(val) => updateSafety({ hasAllergies: val })}
              options={['Não referidas', 'Sim', 'Não informado']}
            />
            {form.safetyIdentification.hasAllergies === 'Sim' && (
              <ClinicalTextInput
                id="inp-safety-allergy-desc"
                label="Descreva as alergias referidas"
                value={form.safetyIdentification.allergyDescription || ''}
                onChange={(val) => updateSafety({ allergyDescription: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 3. Contexto cirúrgico */}
        <ClinicalSection
          id="sec-3-surgical-context"
          title="3. Contexto cirúrgico"
          description="Situação cirúrgica, procedimento, data e anestesia"
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
          isFilled={Boolean(form.surgicalContext.surgicalSituation || form.surgicalContext.surgicalProcedure)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Situação cirúrgica"
              value={form.surgicalContext.surgicalSituation}
              onChange={(val) => updateSurgicalContext({ surgicalSituation: val })}
              options={[
                'Pré-operatório',
                'Pós-operatório imediato',
                'Pós-operatório mediato',
                'Pós-operatório tardio',
                'Pós-procedimento',
                'Não informado',
              ]}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ClinicalTextInput
                  id="inp-surg-procedure"
                  label="Procedimento cirúrgico (informado pelo enfermeiro)"
                  placeholder="Ex: Colecistectomia videolaparoscópica, Apendicectomia"
                  value={form.surgicalContext.surgicalProcedure || ''}
                  onChange={(val) => updateSurgicalContext({ surgicalProcedure: val })}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nota de segurança: A IA é estritamente proibida de inventar procedimentos cirúrgicos não registrados.
                </p>
              </div>
              <ClinicalTextInput
                id="inp-surg-proc-date"
                label="Data do procedimento (opcional)"
                placeholder="Ex: 09/09/2026 ou D1 pós-op"
                value={form.surgicalContext.procedureDate || ''}
                onChange={(val) => updateSurgicalContext({ procedureDate: val })}
              />
            </div>
            <ClinicalOptionGroup
              label="Tipo de anestesia"
              value={form.surgicalContext.anesthesiaType}
              onChange={(val) => updateSurgicalContext({ anesthesiaType: val })}
              options={['Geral', 'Raquidiana', 'Peridural', 'Sedação', 'Local', 'Outra', 'Não informado']}
            />
            {form.surgicalContext.anesthesiaType === 'Outra' && (
              <ClinicalTextInput
                id="inp-surg-custom-anesthesia"
                label="Especifique a anestesia"
                value={form.surgicalContext.customAnesthesia || ''}
                onChange={(val) => updateSurgicalContext({ customAnesthesia: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 4. Avaliação geral */}
        <ClinicalSection
          id="sec-4-general"
          title="4. Avaliação geral"
          description="Estado geral, nível de consciência, comportamento e queixas"
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
          isFilled={Boolean(form.generalAssessment.generalState || form.generalAssessment.consciousness)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Estado geral"
              value={form.generalAssessment.generalState}
              onChange={(val) => updateGeneral({ generalState: val })}
              options={['Bom', 'Regular', 'Mau', 'Não informado']}
            />
            <ClinicalOptionGroup
              label="Consciência"
              value={form.generalAssessment.consciousness}
              onChange={(val) => updateGeneral({ consciousness: val })}
              options={['Consciente', 'Sonolento', 'Torporoso', 'Sedado', 'Outro', 'Não avaliado']}
            />
            <div className="sm:col-span-2">
              <ClinicalMultiSelect
                label="Comportamento / Atitude"
                selectedValues={form.generalAssessment.behavior}
                onChange={(vals) => updateGeneral({ behavior: vals })}
                options={['Calmo', 'Cooperativo', 'Ansioso', 'Agitado', 'Hipoativo', 'Sonolento pós-anestesia', 'Outro']}
              />
            </div>
            <ClinicalOptionGroup
              label="Status de queixas"
              value={form.generalAssessment.complaintStatus}
              onChange={(val) => updateGeneral({ complaintStatus: val })}
              options={['Sem queixas referidas', 'Com queixa', 'Impossibilitado de informar', 'Não informado']}
            />
            {form.generalAssessment.complaintStatus === 'Com queixa' && (
              <ClinicalTextInput
                id="inp-gen-complaint-desc"
                label="Descrição da queixa relatada"
                value={form.generalAssessment.complaintDescription || ''}
                onChange={(val) => updateGeneral({ complaintDescription: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Fonte da informação"
              value={form.generalAssessment.informationSource}
              onChange={(val) => updateGeneral({ informationSource: val })}
              options={['Paciente', 'Familiar', 'Equipe', 'Outro', 'Não informado']}
            />
          </div>
        </ClinicalSection>

        {/* 5. Dor pós-operatória */}
        <ClinicalSection
          id="sec-5-pain"
          title="5. Dor pós-operatória"
          description="Escala de dor, escore, localização e analgesia"
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
          isFilled={Boolean(form.pain.painScaleType || form.pain.painScore)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Escala utilizada"
              value={form.pain.painScaleType}
              onChange={(val) => updatePain({ painScaleType: val })}
              options={['Escala numérica 0-10', 'Escala visual analógica', 'Escala verbal', 'Não avaliável', 'Não avaliada']}
            />
            <ClinicalTextInput
              id="inp-pain-score"
              label="Escore da dor (ex: 0, 3, 7)"
              value={form.pain.painScore}
              onChange={(val) => updatePain({ painScore: val })}
            />
            <ClinicalTextInput
              id="inp-pain-loc"
              label="Localização da dor (ex: sítio cirúrgico, incisão, lombar)"
              value={form.pain.painLocation || ''}
              onChange={(val) => updatePain({ painLocation: val })}
            />
            <ClinicalTextInput
              id="inp-pain-char"
              label="Característica (ex: pontada, queimação, latejante)"
              value={form.pain.painCharacteristic || ''}
              onChange={(val) => updatePain({ painCharacteristic: val })}
            />
            <ClinicalOptionGroup
              label="Analgesia prescrita realizada no plantão"
              value={form.pain.analgesiaRegistered}
              onChange={(val) => updatePain({ analgesiaRegistered: val })}
              options={['Sim', 'Não', 'Não informado']}
            />
            {form.pain.analgesiaRegistered === 'Sim' && (
              <ClinicalTextInput
                id="inp-pain-analg-details"
                label="Detalhes da analgesia (medicamento/horário)"
                value={form.pain.analgesiaDetails || ''}
                onChange={(val) => updatePain({ analgesiaDetails: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 6. Sinais vitais */}
        <ClinicalSection
          id="sec-6-vitals"
          title="6. Sinais vitais"
          description="PA, PAM manual, FC, FR, SpO2, Temperatura e Glicemia"
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
          isFilled={Boolean(form.vitalSigns.systolicBP || form.vitalSigns.heartRate)}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Diretriz COFEN & EvoluiEnf:</span> Todos os valores numéricos são preservados estritamente. A PAM é informada manualmente pelo profissional e NUNCA calculada automaticamente pelo sistema.
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ClinicalTextInput
                id="inp-vs-pas"
                label="PA Sistólica (mmHg)"
                placeholder="Ex: 120"
                value={form.vitalSigns.systolicBP}
                onChange={(val) => updateVitals({ systolicBP: val })}
              />
              <ClinicalTextInput
                id="inp-vs-pad"
                label="PA Diastólica (mmHg)"
                placeholder="Ex: 80"
                value={form.vitalSigns.diastolicBP}
                onChange={(val) => updateVitals({ diastolicBP: val })}
              />
              <ClinicalTextInput
                id="inp-vs-pam"
                label="PAM manual (mmHg)"
                placeholder="Ex: 93"
                value={form.vitalSigns.meanArterialPressure}
                onChange={(val) => updateVitals({ meanArterialPressure: val })}
              />
              <ClinicalTextInput
                id="inp-vs-fc"
                label="FC (bpm)"
                placeholder="Ex: 78"
                value={form.vitalSigns.heartRate}
                onChange={(val) => updateVitals({ heartRate: val })}
              />
              <ClinicalTextInput
                id="inp-vs-fr"
                label="FR (irpm)"
                placeholder="Ex: 16"
                value={form.vitalSigns.respiratoryRate}
                onChange={(val) => updateVitals({ respiratoryRate: val })}
              />
              <ClinicalTextInput
                id="inp-vs-spo2"
                label="SpO₂ (%)"
                placeholder="Ex: 98"
                value={form.vitalSigns.oxygenSaturation}
                onChange={(val) => updateVitals({ oxygenSaturation: val })}
              />
              <ClinicalTextInput
                id="inp-vs-temp"
                label="Temperatura (°C)"
                placeholder="Ex: 36.5"
                value={form.vitalSigns.temperature}
                onChange={(val) => updateVitals({ temperature: val })}
              />
              <ClinicalTextInput
                id="inp-vs-hgt"
                label="Glicemia capilar (mg/dL)"
                placeholder="Ex: 104"
                value={form.vitalSigns.capillaryBloodGlucose}
                onChange={(val) => updateVitals({ capillaryBloodGlucose: val })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 7. Avaliação neurológica */}
        <ClinicalSection
          id="sec-7-neuro"
          title="7. Avaliação neurológica"
          description="Nível de consciência, orientação, pupilas e déficit motor"
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
          isFilled={Boolean(form.neurological.consciousnessLevel || form.neurological.orientation)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Nível de consciência"
              value={form.neurological.consciousnessLevel}
              onChange={(val) => updateNeurological({ consciousnessLevel: val })}
              options={['Consciente', 'Sonolento', 'Torporoso', 'Sedado', 'Não avaliado']}
            />
            <ClinicalOptionGroup
              label="Orientação alopsíquica e autopsíquica"
              value={form.neurological.orientation}
              onChange={(val) => updateNeurological({ orientation: val })}
              options={['Orientado no tempo e espaço', 'Desorientado', 'Confuso', 'Não avaliado']}
            />
            <ClinicalTextInput
              id="inp-neuro-glasgow"
              label="Escore de Glasgow (opcional)"
              placeholder="Ex: 15"
              value={form.neurological.glasgowScore || ''}
              onChange={(val) => updateNeurological({ glasgowScore: val })}
            />
            <ClinicalOptionGroup
              label="Pupilas"
              value={form.neurological.pupils}
              onChange={(val) => updateNeurological({ pupils: val })}
              options={['Isocóricas', 'Anisocóricas', 'Midriáticas', 'Mióticas', 'Não avaliadas']}
            />
            <ClinicalOptionGroup
              label="Fotorreação"
              value={form.neurological.photoreaction}
              onChange={(val) => updateNeurological({ photoreaction: val })}
              options={['Reagentes', 'Não reagentes', 'Lentificadas', 'Não avaliadas']}
            />
            <ClinicalOptionGroup
              label="Déficit motor"
              value={form.neurological.motorDeficit}
              onChange={(val) => updateNeurological({ motorDeficit: val })}
              options={['Ausente', 'Presente', 'Em recuperação anestésica', 'Não avaliado']}
            />
            {form.neurological.motorDeficit === 'Presente' && (
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  id="inp-neuro-motor-details"
                  label="Detalhes do déficit motor observado"
                  value={form.neurological.motorDeficitDetails || ''}
                  onChange={(val) => updateNeurological({ motorDeficitDetails: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 8. Respiratório */}
        <ClinicalSection
          id="sec-8-resp"
          title="8. Respiratório"
          description="Suporte de O2, padrão ventilatório, desconforto e ausculta"
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
          isFilled={Boolean(form.respiratory.respiratorySupport || form.respiratory.pattern)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Suporte respiratório"
              value={form.respiratory.respiratorySupport}
              onChange={(val) => updateRespiratory({ respiratorySupport: val })}
              options={['Ar ambiente', 'Oxigenoterapia', 'VNI', 'VMI', 'Outro']}
            />
            {form.respiratory.respiratorySupport === 'Oxigenoterapia' && (
              <>
                <ClinicalOptionGroup
                  label="Dispositivo de oxigênio"
                  value={form.respiratory.supportDevice || ''}
                  onChange={(val) => updateRespiratory({ supportDevice: val })}
                  options={['Cânula nasal', 'Máscara de Venturi', 'Máscara com reservatório', 'Outro']}
                />
                <ClinicalTextInput
                  id="inp-resp-flow"
                  label="Fluxo de oxigênio (ex: 2 L/min)"
                  value={form.respiratory.oxygenFlow || ''}
                  onChange={(val) => updateRespiratory({ oxygenFlow: val })}
                />
              </>
            )}
            <ClinicalOptionGroup
              label="Padrão respiratório"
              value={form.respiratory.pattern}
              onChange={(val) => updateRespiratory({ pattern: val })}
              options={['Eupneico', 'Taquipneico', 'Bradipneico', 'Dispneico', 'Outro']}
            />
            <ClinicalOptionGroup
              label="Desconforto respiratório"
              value={form.respiratory.respiratoryDiscomfort}
              onChange={(val) => updateRespiratory({ respiratoryDiscomfort: val })}
              options={['Ausente', 'Tiragem intercostal', 'Batimento asa de nariz', 'Uso musculatura acessória']}
            />
            <div className="sm:col-span-2">
              <ClinicalOptionGroup
                label="Ausculta pulmonar"
                value={form.respiratory.auscultation}
                onChange={(val) => updateRespiratory({ auscultation: val })}
                options={[
                  'Murmúrio vesicular presente bilateralmente sem ruídos adventícios',
                  'Ruídos adventícios presentes',
                  'Diminuição bilateral de MV',
                  'Diminuição unilateral',
                  'Não realizada',
                ]}
              />
            </div>
            {form.respiratory.auscultation === 'Ruídos adventícios presentes' && (
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  id="inp-resp-adventitious"
                  label="Detalhes dos ruídos adventícios (roncos, sibilos, estertores)"
                  value={form.respiratory.adventitiousSoundsDetails || ''}
                  onChange={(val) => updateRespiratory({ adventitiousSoundsDetails: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 9. Cardiovascular */}
        <ClinicalSection
          id="sec-9-cardio"
          title="9. Cardiovascular"
          description="Perfusão periférica, extremidades, TEC, edema e ausculta"
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
          isFilled={Boolean(form.cardiovascular.peripheralPerfusion || form.cardiovascular.cardiacAuscultation)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Perfusão periférica"
              value={form.cardiovascular.peripheralPerfusion}
              onChange={(val) => updateCardiovascular({ peripheralPerfusion: val })}
              options={['Boa / Preservada', 'Lentificada', 'Prejudicada', 'Não avaliada']}
            />
            <ClinicalOptionGroup
              label="Extremidades"
              value={form.cardiovascular.extremities}
              onChange={(val) => updateCardiovascular({ extremities: val })}
              options={['Aquecidas', 'Frias', 'Cianóticas', 'Não avaliadas']}
            />
            <ClinicalOptionGroup
              label="Tempo de enchimento capilar (TEC)"
              value={form.cardiovascular.tec}
              onChange={(val) => updateCardiovascular({ tec: val })}
              options={['< 2 segundos', '≥ 2 segundos', 'Não avaliado']}
            />
            <ClinicalOptionGroup
              label="Edema"
              value={form.cardiovascular.edema}
              onChange={(val) => updateCardiovascular({ edema: val })}
              options={['Ausente', 'Presente', 'Não avaliado']}
            />
            {form.cardiovascular.edema === 'Presente' && (
              <ClinicalTextInput
                id="inp-cv-edema-loc"
                label="Localização do edema (ex: MMII +/4+, tornozelos)"
                value={form.cardiovascular.edemaLocation || ''}
                onChange={(val) => updateCardiovascular({ edemaLocation: val })}
              />
            )}
            <div className="sm:col-span-2">
              <ClinicalOptionGroup
                label="Ausculta cardíaca"
                value={form.cardiovascular.cardiacAuscultation}
                onChange={(val) => updateCardiovascular({ cardiacAuscultation: val })}
                options={[
                  'Bulhas rítmicas normofonéticas sem sopros',
                  'Arritmia auscultada',
                  'Sopro auscultado',
                  'Não realizada',
                ]}
              />
            </div>
            {form.cardiovascular.cardiacAuscultation &&
              form.cardiovascular.cardiacAuscultation !== 'Bulhas rítmicas normofonéticas sem sopros' &&
              form.cardiovascular.cardiacAuscultation !== 'Não realizada' && (
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    id="inp-cv-cardiac-details"
                    label="Detalhes da alteração auscultada"
                    value={form.cardiovascular.cardiacDetails || ''}
                    onChange={(val) => updateCardiovascular({ cardiacDetails: val })}
                  />
                </div>
              )}
          </div>
        </ClinicalSection>

        {/* 10. Gastrointestinal */}
        <ClinicalSection
          id="sec-10-gi"
          title="10. Gastrointestinal"
          description="Forma abdominal, consistência, dor à palpação, RHA e náuseas/vômitos"
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
          isFilled={Boolean(form.gastrointestinal.abdomenForm || form.gastrointestinal.consistency)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Forma do abdome"
              value={form.gastrointestinal.abdomenForm}
              onChange={(val) => updateGastrointestinal({ abdomenForm: val })}
              options={['Plano', 'Globoso', 'Distendido', 'Escavado', 'Não avaliado']}
            />
            <ClinicalOptionGroup
              label="Consistência abdominal"
              value={form.gastrointestinal.consistency}
              onChange={(val) => updateGastrointestinal({ consistency: val })}
              options={['Flácido e indolor', 'Tenso', 'Rígido', 'Não avaliado']}
            />
            <ClinicalOptionGroup
              label="Dor à palpação"
              value={form.gastrointestinal.painOnPalpation}
              onChange={(val) => updateGastrointestinal({ painOnPalpation: val })}
              options={['Ausente', 'Presente', 'Não avaliado']}
            />
            {form.gastrointestinal.painOnPalpation === 'Presente' && (
              <ClinicalTextInput
                id="inp-gi-pain-loc"
                label="Localização da dor (ex: FID, mesogástrio, incisão)"
                value={form.gastrointestinal.palpationPainLocation || ''}
                onChange={(val) => updateGastrointestinal({ palpationPainLocation: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Ruídos hidroaéreos (RHA)"
              value={form.gastrointestinal.bowelSounds}
              onChange={(val) => updateGastrointestinal({ bowelSounds: val })}
              options={['Presentes normoativos', 'Hipoativos', 'Hiperativos', 'Ausentes', 'Não avaliados']}
            />
            <ClinicalOptionGroup
              label="Náuseas e vômitos"
              value={form.gastrointestinal.nauseaVomiting}
              onChange={(val) => updateGastrointestinal({ nauseaVomiting: val })}
              options={['Ausente', 'Náuseas', 'Vômitos', 'Não informado']}
            />
          </div>
        </ClinicalSection>

        {/* 11. Nutrição */}
        <ClinicalSection
          id="sec-11-nutrition"
          title="11. Nutrição"
          description="Via nutricional, aceitação, jejum e tolerância"
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
          isFilled={Boolean(form.nutrition.nutritionalRoute)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Via nutricional"
              value={form.nutrition.nutritionalRoute}
              onChange={(val) => updateNutrition({ nutritionalRoute: val })}
              options={['Oral', 'Enteral', 'Parenteral', 'Jejum pré-operatório', 'Jejum pós-operatório', 'Não informado']}
            />
            <ClinicalOptionGroup
              label="Aceitação da dieta"
              value={form.nutrition.acceptance}
              onChange={(val) => updateNutrition({ acceptance: val })}
              options={['Boa aceitação (>75%)', 'Aceitação parcial (50-75%)', 'Baixa aceitação (<50%)', 'Recusada', 'Não se aplica']}
            />
            {form.nutrition.nutritionalRoute.includes('Jejum') && (
              <ClinicalTextInput
                id="inp-nut-fasting-reason"
                label="Motivo do jejum (ex: cirurgia programada para 14h)"
                value={form.nutrition.fastingReason || ''}
                onChange={(val) => updateNutrition({ fastingReason: val })}
              />
            )}
            {form.nutrition.nutritionalRoute === 'Enteral' && (
              <>
                <ClinicalOptionGroup
                  label="Dispositivo enteral"
                  value={form.nutrition.enteralDevice || ''}
                  onChange={(val) => updateNutrition({ enteralDevice: val })}
                  options={['SNE', 'SNG', 'GTT']}
                />
                <ClinicalTextInput
                  id="inp-nut-enteral-rate"
                  label="Vazão de infusão (ex: 50 mL/h)"
                  value={form.nutrition.enteralInfusionRate || ''}
                  onChange={(val) => updateNutrition({ enteralInfusionRate: val })}
                />
              </>
            )}
          </div>
        </ClinicalSection>

        {/* 12. Eliminações */}
        <ClinicalSection
          id="sec-12-elim"
          title="12. Eliminações"
          description="Diurese com via, aspecto e débito, e evacuações"
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
          isFilled={Boolean(form.eliminations.diuresis || form.eliminations.bowelEvacuation)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Diurese"
              value={form.eliminations.diuresis}
              onChange={(val) => updateEliminations({ diuresis: val })}
              options={[
                'Espontânea',
                'Por cateter vesical de demora (SVD)',
                'Por cateterismo intermitente',
                'Preservada sem mensuração',
                'Ausente / Anúria',
                'Não avaliada',
              ]}
            />
            <ClinicalOptionGroup
              label="Aspecto da diurese"
              value={form.eliminations.diuresisAspect || ''}
              onChange={(val) => updateEliminations({ diuresisAspect: val })}
              options={['Amarelo claro / Clara', 'Concentrada', 'Hematúrica', 'Piúrica', 'Com grumos']}
            />
            <ClinicalTextInput
              id="inp-elim-diuresis-vol"
              label="Volume de diurese (mL mensurados)"
              placeholder="Ex: 450"
              value={form.eliminations.diuresisVolume || ''}
              onChange={(val) => updateEliminations({ diuresisVolume: val })}
            />
            <ClinicalOptionGroup
              label="Evacuação"
              value={form.eliminations.bowelEvacuation}
              onChange={(val) => updateEliminations({ bowelEvacuation: val })}
              options={['Presente', 'Ausente', 'Não avaliada', 'Não informado']}
            />
            {form.eliminations.bowelEvacuation === 'Presente' && (
              <ClinicalOptionGroup
                label="Aspecto das fezes"
                value={form.eliminations.bowelAspect || ''}
                onChange={(val) => updateEliminations({ bowelAspect: val })}
                options={['Fezes pastosas normocoradas', 'Fezes líquidas', 'Fezes endurecidas', 'Melena', 'Com sangue']}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 13. Ferida operatória */}
        <ClinicalSection
          id="sec-13-wound"
          title="13. Ferida operatória"
          description="Localização anatômica, aspecto, curativo e presença de exsudato"
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
          isFilled={Boolean(form.surgicalWound.hasSurgicalWound)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Possui ferida operatória / incisão cirúrgica?"
              value={form.surgicalWound.hasSurgicalWound}
              onChange={(val) => updateWound({ hasSurgicalWound: val })}
              options={['Sim', 'Não', 'Não avaliada']}
            />
            {form.surgicalWound.hasSurgicalWound === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <ClinicalTextInput
                  id="inp-wound-loc"
                  label="Localização anatômica da incisão *"
                  placeholder="Ex: Abdome em hipocôndrio direito, Linha média infraumbilical"
                  value={form.surgicalWound.anatomicalLocation || ''}
                  onChange={(val) => updateWound({ anatomicalLocation: val })}
                />
                <ClinicalOptionGroup
                  label="Aspecto da ferida"
                  value={form.surgicalWound.aspect || ''}
                  onChange={(val) => updateWound({ aspect: val })}
                  options={['Limpo', 'Seco', 'Íntegro', 'Bordas aproximadas', 'Outro']}
                />
                <ClinicalOptionGroup
                  label="Curativo cirúrgico"
                  value={form.surgicalWound.dressingPresent || ''}
                  onChange={(val) => updateWound({ dressingPresent: val })}
                  options={['Presente', 'Ausente']}
                />
                <ClinicalOptionGroup
                  label="Condição do curativo"
                  value={form.surgicalWound.dressingCondition || ''}
                  onChange={(val) => updateWound({ dressingCondition: val })}
                  options={['Limpo', 'Seco', 'Íntegro', 'Saturado', 'Com mancha hemática', 'Outro']}
                />
                <ClinicalOptionGroup
                  label="Exsudato"
                  value={form.surgicalWound.exudate || ''}
                  onChange={(val) => updateWound({ exudate: val })}
                  options={['Ausente', 'Presente']}
                />
                {form.surgicalWound.exudate === 'Presente' && (
                  <ClinicalTextInput
                    id="inp-wound-exudate-char"
                    label="Características do exsudato (seroso, hemático, purulento)"
                    value={form.surgicalWound.exudateCharacteristics || ''}
                    onChange={(val) => updateWound({ exudateCharacteristics: val })}
                  />
                )}
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 14. Curativo cirúrgico */}
        <ClinicalSection
          id="sec-14-dressing"
          title="14. Curativo cirúrgico"
          description="Troca de curativo realizada no plantão e produtos"
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
          isFilled={Boolean(form.surgicalDressing.dressingChanged)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Troca de curativo realizada no plantão?"
              value={form.surgicalDressing.dressingChanged || ''}
              onChange={(val) => updateDressing({ dressingChanged: val })}
              options={['Sim', 'Não', 'Não se aplica']}
            />
            {form.surgicalDressing.dressingChanged === 'Sim' && (
              <>
                <ClinicalTextInput
                  id="inp-dressing-product"
                  label="Produto / cobertura utilizada"
                  placeholder="Ex: SF 0,9% + gaze estéril e micropore"
                  value={form.surgicalDressing.dressingProductUsed || ''}
                  onChange={(val) => updateDressing({ dressingProductUsed: val })}
                />
                <ClinicalTextInput
                  id="inp-dressing-aspect"
                  label="Achados observados na troca"
                  placeholder="Ex: Incisão limpa, sem sinais flogísticos"
                  value={form.surgicalDressing.dressingAspectObserved || ''}
                  onChange={(val) => updateDressing({ dressingAspectObserved: val })}
                />
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    id="inp-dressing-details"
                    label="Observações da troca de curativo"
                    value={form.surgicalDressing.dressingInterventionDetails || ''}
                    onChange={(val) => updateDressing({ dressingInterventionDetails: val })}
                  />
                </div>
              </>
            )}
          </div>
        </ClinicalSection>

        {/* 15. Drenos */}
        <ClinicalSection
          id="sec-15-drains"
          title="15. Drenos"
          description="Drenos cirúrgicos, funcionamento, fixação, débito e aspecto"
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
          isFilled={Boolean(form.drains.hasDrains)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Paciente possui dreno cirúrgico?"
              value={form.drains.hasDrains}
              onChange={(val) => updateDrains({ hasDrains: val })}
              options={['Sim', 'Não', 'Não informado']}
            />
            {form.drains.hasDrains === 'Sim' && (
              <div className="space-y-3 pt-2">
                {form.drains.list.map((dr, idx) => (
                  <div key={dr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">Dreno #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeDrainItem(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ClinicalOptionGroup
                        label="Tipo de dreno"
                        value={dr.type}
                        onChange={(val) => updateDrainItem(idx, { type: val })}
                        options={['Portovac', 'Dreno de Penrose', 'Dreno tubular', 'Dreno de tórax', 'Dreno Blake', 'Jackson-Pratt', 'Outro']}
                      />
                      <ClinicalTextInput
                        id={`inp-drain-loc-${idx}`}
                        label="Localização anatômica do dreno"
                        placeholder="Ex: Flanco direito, Hipocôndrio direito"
                        value={dr.location}
                        onChange={(val) => updateDrainItem(idx, { location: val })}
                      />
                      <ClinicalOptionGroup
                        label="Permeabilidade"
                        value={dr.permeability}
                        onChange={(val) => updateDrainItem(idx, { permeability: val })}
                        options={['Pérvio', 'Obstruído', 'Não avaliado']}
                      />
                      <ClinicalOptionGroup
                        label="Funcionamento"
                        value={dr.functioning}
                        onChange={(val) => updateDrainItem(idx, { functioning: val })}
                        options={['Funcionante sob aspiração a vácuo', 'Funcionante por gravidade', 'Sem oscilação', 'Alterado']}
                      />
                      <ClinicalOptionGroup
                        label="Fixação"
                        value={dr.fixation}
                        onChange={(val) => updateDrainItem(idx, { fixation: val })}
                        options={['Fixado com ponto cirúrgico', 'Fita adesiva', 'Íntegra', 'Não avaliada']}
                      />
                      <ClinicalOptionGroup
                        label="Aspecto do débito"
                        value={dr.drainAspect}
                        onChange={(val) => updateDrainItem(idx, { drainAspect: val })}
                        options={['Seroso', 'Sero-hemático', 'Hemático', 'Purulento', 'Bilioso', 'Outro']}
                      />
                      <ClinicalTextInput
                        id={`inp-drain-vol-${idx}`}
                        label="Débito mensurado no plantão (mL)"
                        placeholder="Ex: 80"
                        value={dr.volumeReported}
                        onChange={(val) => updateDrainItem(idx, { volumeReported: val })}
                      />
                    </div>
                  </div>
                ))}
                <button
                  id="btn-add-drain"
                  type="button"
                  onClick={addDrain}
                  className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Dreno Cirúrgico</span>
                </button>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 16. Dispositivos invasivos */}
        <ClinicalSection
          id="sec-16-devices"
          title="16. Dispositivos invasivos"
          description="Acessos vasculares, sondas e outros dispositivos invasivos"
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
          isFilled={form.devices.list.length > 0}
        >
          <div className="space-y-3">
            {form.devices.list.map((dev, idx) => (
              <div key={dev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Dispositivo #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeDeviceItem(idx)}
                    className="text-xs text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalOptionGroup
                    label="Tipo do dispositivo"
                    value={dev.type}
                    onChange={(val) => updateDeviceItem(idx, { type: val })}
                    options={['AVP', 'CVC', 'PICC', 'SVD', 'SNG', 'SNE', 'Ostomia', 'Outro']}
                  />
                  <ClinicalTextInput
                    id={`inp-dev-site-${idx}`}
                    label="Local de inserção"
                    placeholder="Ex: MSD, Subclávia D, Antebraço E"
                    value={dev.anatomicalSite}
                    onChange={(val) => updateDeviceItem(idx, { anatomicalSite: val })}
                  />
                  <ClinicalOptionGroup
                    label="Condição do sítio"
                    value={dev.siteCondition}
                    onChange={(val) => updateDeviceItem(idx, { siteCondition: val })}
                    options={['Sem sinais flogísticos', 'Hiperemia', 'Edema', 'Dor local', 'Exsudato', 'Não avaliado']}
                  />
                  <ClinicalOptionGroup
                    label="Condição do curativo"
                    value={dev.dressingCondition}
                    onChange={(val) => updateDeviceItem(idx, { dressingCondition: val })}
                    options={['Limpo e seco', 'Oclusivo íntegro', 'Úmido/Solto']}
                  />
                  <ClinicalOptionGroup
                    label="Permeabilidade"
                    value={dev.permeability}
                    onChange={(val) => updateDeviceItem(idx, { permeability: val })}
                    options={['Pérvio', 'Salinizado', 'Infusão contínua', 'Obstruído']}
                  />
                </div>
              </div>
            ))}
            <button
              id="btn-add-device"
              type="button"
              onClick={addDevice}
              className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Dispositivo Invasivo</span>
            </button>
          </div>
        </ClinicalSection>

        {/* 17. Mobilidade */}
        <ClinicalSection
          id="sec-17-mobility"
          title="17. Mobilidade"
          description="Deambulação, repouso no leito e mudança de decúbito"
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
          isFilled={Boolean(form.mobility.mobility)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Mobilidade no leito e deambulação"
              value={form.mobility.mobility}
              onChange={(val) => updateMobility({ mobility: val })}
              options={[
                'Deambula sem auxílio',
                'Deambula com auxílio',
                'Restrito ao leito',
                'Em repouso no leito prescrito',
                'Outro',
                'Não avaliado',
              ]}
            />
            <ClinicalOptionGroup
              label="Mudança de decúbito"
              value={form.mobility.decubitusChange}
              onChange={(val) => updateMobility({ decubitusChange: val })}
              options={['Realizada com auxílio da equipe', 'Realizada de forma independente', 'Não realizada', 'Não se aplica']}
            />
          </div>
        </ClinicalSection>

        {/* 18. Higiene e autocuidado */}
        <ClinicalSection
          id="sec-18-hygiene"
          title="18. Higiene e autocuidado"
          description="Grau de dependência para higiene e tipo de banho"
          isOpen={activeSection === 17}
          onToggle={() => toggleSection(17)}
          isFilled={Boolean(form.hygiene.hygieneStatus)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Condição de higiene / Autocuidado"
              value={form.hygiene.hygieneStatus}
              onChange={(val) => updateHygiene({ hygieneStatus: val })}
              options={[
                'Preservada / Autocuidado preservado',
                'Necessita auxílio parcial',
                'Total dependência para higiene',
                'Não avaliado',
              ]}
            />
            <ClinicalOptionGroup
              label="Tipo de banho realizado"
              value={form.hygiene.bathType}
              onChange={(val) => updateHygiene({ bathType: val })}
              options={['Aspersão (chuveiro)', 'Leito', 'Não realizado no plantão', 'Não se aplica']}
            />
            <div className="sm:col-span-2">
              <ClinicalOptionGroup
                label="Tolerância ao banho"
                value={form.hygiene.bathTolerance}
                onChange={(val) => updateHygiene({ bathTolerance: val })}
                options={['Boa tolerância sem queixas', 'Fadiga ao esforço', 'Dor durante o procedimento', 'Não se aplica']}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 19. Riscos assistenciais */}
        <ClinicalSection
          id="sec-19-risks"
          title="19. Riscos assistenciais"
          description="Escores de risco de queda, lesão por pressão e broncoaspiração"
          isOpen={activeSection === 18}
          onToggle={() => toggleSection(18)}
          isFilled={Boolean(form.riskAssessment.fallRiskStatus || form.riskAssessment.lppRiskStatus)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Risco de queda"
              value={form.riskAssessment.fallRiskStatus}
              onChange={(val) => updateRisks({ fallRiskStatus: val })}
              options={['Baixo risco', 'Risco moderado', 'Alto risco', 'Não avaliado']}
            />
            <ClinicalTextInput
              id="inp-risk-fall-score"
              label="Escore de risco de queda (opcional)"
              placeholder="Ex: Morse 45"
              value={form.riskAssessment.fallRiskScore || ''}
              onChange={(val) => updateRisks({ fallRiskScore: val })}
            />
            <ClinicalOptionGroup
              label="Risco de lesão por pressão (LPP)"
              value={form.riskAssessment.lppRiskStatus}
              onChange={(val) => updateRisks({ lppRiskStatus: val })}
              options={['Baixo risco', 'Risco moderado', 'Alto risco', 'Não avaliado']}
            />
            <ClinicalTextInput
              id="inp-risk-lpp-score"
              label="Escore Braden (opcional)"
              placeholder="Ex: Braden 14"
              value={form.riskAssessment.lppRiskScore || ''}
              onChange={(val) => updateRisks({ lppRiskScore: val })}
            />
            <div className="sm:col-span-2">
              <ClinicalOptionGroup
                label="Risco de broncoaspiração"
                value={form.riskAssessment.aspirationRiskStatus}
                onChange={(val) => updateRisks({ aspirationRiskStatus: val })}
                options={['Ausente', 'Presente', 'Não avaliado']}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 20. Cuidados realizados */}
        <ClinicalSection
          id="sec-20-care"
          title="20. Cuidados realizados"
          description="Checklist de cuidados de enfermagem cirúrgica executados"
          isOpen={activeSection === 19}
          onToggle={() => toggleSection(19)}
          isFilled={form.careDone.careItems.length > 0}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Cuidados executados no plantão"
              selectedValues={form.careDone.careItems}
              onChange={(vals) => updateCare({ careItems: vals })}
              options={[
                'Administração de medicamentos prescritos',
                'Curativo cirúrgico',
                'Cuidados e ordenha de drenos',
                'Higiene e banho',
                'Mudança de decúbito',
                'Mobilização precoce / Deambulação assistida',
                'Controle da dor',
                'Controle glicêmico',
                'Esvaziamento e mensuração de drenos',
                'Controle do balanço hídrico',
                'Coleta de exames laboratoriais',
                'Outros',
              ]}
            />
            {form.careDone.careItems.includes('Outros') && (
              <ClinicalTextInput
                id="inp-care-custom"
                label="Descreva os outros cuidados executados"
                value={form.careDone.customCare || ''}
                onChange={(val) => updateCare({ customCare: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 21. Resposta aos cuidados */}
        <ClinicalSection
          id="sec-21-response"
          title="21. Resposta aos cuidados"
          description="Resposta factual e objetiva observada após as intervenções"
          isOpen={activeSection === 20}
          onToggle={() => toggleSection(20)}
          isFilled={Boolean(form.responseToCare.evaluated && form.responseToCare.evaluated !== 'Não avaliado')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Resposta aos cuidados avaliada?"
              value={form.responseToCare.evaluated}
              onChange={(val) => updateResponse({ evaluated: val })}
              options={['Sim', 'Não', 'Não avaliado']}
            />
            {form.responseToCare.evaluated === 'Sim' && (
              <>
                <ClinicalTextInput
                  id="inp-resp-intervention-target"
                  label="Intervenção avaliada *"
                  placeholder="Ex: Analgesia prescrita, Deambulação assistida"
                  value={form.responseToCare.interventionTarget || ''}
                  onChange={(val) => updateResponse({ interventionTarget: val })}
                />
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    id="inp-resp-observed"
                    label="Resposta clínica observada"
                    placeholder="Ex: Redução do escore de dor de 7 para 2 após 40 minutos"
                    value={form.responseToCare.observedResponse || ''}
                    onChange={(val) => updateResponse({ observedResponse: val })}
                  />
                </div>
              </>
            )}
          </div>
        </ClinicalSection>

        {/* 22. Intercorrências */}
        <ClinicalSection
          id="sec-22-complications"
          title="22. Intercorrências"
          description="Ocorrências no plantão, conduta e comunicação"
          isOpen={activeSection === 21}
          onToggle={() => toggleSection(21)}
          isFilled={Boolean(form.complications.hasComplication)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve intercorrência cirúrgica no plantão?"
              value={form.complications.hasComplication}
              onChange={(val) => updateComplications({ hasComplication: val })}
              options={['Sim', 'Não', 'Não informado']}
            />
            {form.complications.hasComplication === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    id="inp-comp-desc"
                    label="Descrição da intercorrência"
                    placeholder="Ex: Náuseas e vômitos refratários, sangramento na ferida"
                    value={form.complications.description || ''}
                    onChange={(val) => updateComplications({ description: val })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    id="inp-comp-action"
                    label="Conduta imediata de enfermagem *"
                    placeholder="Ex: Administrado antiemético prescrito, reforço do curativo oclusivo"
                    value={form.complications.immediateAction || ''}
                    onChange={(val) => updateComplications({ immediateAction: val })}
                  />
                </div>
                <ClinicalTextInput
                  id="inp-comp-comm"
                  label="Comunicação realizada (quem foi comunicado)"
                  placeholder="Ex: Médico plantonista Dr. Silva"
                  value={form.complications.communicationDone || ''}
                  onChange={(val) => updateComplications({ communicationDone: val })}
                />
                <ClinicalTextInput
                  id="inp-comp-resp"
                  label="Retorno observado / orientações recebidas"
                  placeholder="Ex: Orientado manter hidratação e reavaliar em 1h"
                  value={form.complications.responseObserved || ''}
                  onChange={(val) => updateComplications({ responseObserved: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 23. Comunicação */}
        <ClinicalSection
          id="sec-23-comm"
          title="23. Comunicação"
          description="Comunicação assistencial à equipe cirúrgica ou plantonista"
          isOpen={activeSection === 22}
          onToggle={() => toggleSection(22)}
          isFilled={Boolean(form.communication.hasCommunication === 'Sim')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Comunicação assistencial realizada?"
              value={form.communication.hasCommunication}
              onChange={(val) => updateCommunication({ hasCommunication: val })}
              options={['Sim', 'Não']}
            />
            {form.communication.hasCommunication === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <ClinicalTextInput
                  id="inp-comm-target"
                  label="Destinatário da comunicação"
                  placeholder="Ex: Cirurgião assistente Dr. Castro"
                  value={form.communication.target || ''}
                  onChange={(val) => updateCommunication({ target: val })}
                />
                <ClinicalTextInput
                  id="inp-comm-time"
                  label="Horário do contato"
                  placeholder="Ex: 15:30"
                  value={form.communication.time || ''}
                  onChange={(val) => updateCommunication({ time: val })}
                />
                <ClinicalTextInput
                  id="inp-comm-reason"
                  label="Motivo da comunicação"
                  placeholder="Ex: Débito hemático de 120 mL em dreno tubular"
                  value={form.communication.reason || ''}
                  onChange={(val) => updateCommunication({ reason: val })}
                />
                <ClinicalTextInput
                  id="inp-comm-resp"
                  label="Retorno recebido"
                  placeholder="Ex: Ciente, conduta expectante"
                  value={form.communication.responseObserved || ''}
                  onChange={(val) => updateCommunication({ responseObserved: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 24. Comparação com avaliação anterior */}
        <ClinicalSection
          id="sec-24-comparison"
          title="24. Comparação com avaliação anterior"
          description="Evolução clínica em relação ao período cirúrgico anterior"
          isOpen={activeSection === 23}
          onToggle={() => toggleSection(23)}
          isFilled={Boolean(form.comparisonWithPrevious.statusChange)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Evolução comparativa"
              value={form.comparisonWithPrevious.statusChange}
              onChange={(val) => updateComparison({ statusChange: val })}
              options={[
                'Estável em relação à avaliação anterior',
                'Melhora clínica e pós-operatória',
                'Piora clínica',
                'Novo sintoma ou alteração identificada',
                'Não avaliado',
              ]}
            />
            {form.comparisonWithPrevious.statusChange &&
              form.comparisonWithPrevious.statusChange !== 'Estável em relação à avaliação anterior' &&
              form.comparisonWithPrevious.statusChange !== 'Não avaliado' && (
                <ClinicalTextInput
                  id="inp-comparison-desc"
                  label="Descrição detalhada da alteração comparativa"
                  placeholder="Ex: Recuperação completa da mobilidade em MMII pós-raquianestesia"
                  value={form.comparisonWithPrevious.description || ''}
                  onChange={(val) => updateComparison({ description: val })}
                />
              )}
          </div>
        </ClinicalSection>

        {/* 25. Síntese de enfermagem */}
        <ClinicalSection
          id="sec-25-synthesis"
          title="25. Síntese de enfermagem"
          description="Julgamento clínico e síntese privativa do Enfermeiro"
          isOpen={activeSection === 24}
          onToggle={() => toggleSection(24)}
          isFilled={Boolean(form.nursingSynthesis.synthesisText)}
        >
          <div className="space-y-3">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800">
              <span className="font-semibold">Ato Privativo do Enfermeiro (Lei 7.498/86):</span> Registre a síntese clínica e seu julgamento profissional. A IA é estritamente proibida de criar diagnósticos médicos, diagnósticos de enfermagem ou prescrições não digitadas aqui.
            </div>
            <ClinicalTextarea
              id="inp-nurse-synthesis-text"
              label="Síntese clínica e planejamento do cuidado"
              placeholder="Ex: Paciente em 1º PO de colecistectomia, estável hemodinamicamente, boa aceitação de dieta leve, ferida operatória íntegra sem sinais infecciosos, dreno com débito seroso mínimo. Mantido plano de analgesia e mobilização precoce."
              value={form.nursingSynthesis.synthesisText}
              onChange={(val) => updateSynthesis({ synthesisText: val })}
              rows={4}
            />
          </div>
        </ClinicalSection>

        {/* 26. Situação atual */}
        <ClinicalSection
          id="sec-26-status"
          title="26. Situação atual"
          description="Condição do paciente ao final da evolução"
          isOpen={activeSection === 25}
          onToggle={() => toggleSection(25)}
          isFilled={Boolean(form.currentStatus.status)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Desfecho / Condição do paciente"
              value={form.currentStatus.status}
              onChange={(val) => updateStatus({ status: val })}
              options={[
                'Permanece no leito estável',
                'Permanece em recuperação pós-operatória',
                'Alta da clínica cirúrgica',
                'Transferência setorial',
                'Encaminhado ao Centro Cirúrgico',
                'Outro',
              ]}
            />
            {form.currentStatus.status === 'Outro' && (
              <ClinicalTextInput
                id="inp-status-custom"
                label="Especifique a situação"
                value={form.currentStatus.customStatus || ''}
                onChange={(val) => updateStatus({ customStatus: val })}
              />
            )}
            <ClinicalTextInput
              id="inp-status-pending"
              label="Pendências para o próximo plantão (opcional)"
              placeholder="Ex: Aguarda retorno de exames de controle, reavaliação de dreno pela equipe cirúrgica"
              value={form.currentStatus.pendingIssues || ''}
              onChange={(val) => updateStatus({ pendingIssues: val })}
            />
          </div>
        </ClinicalSection>
      </div>

      {/* Bottom Floating Bar */}
      <div className="sticky bottom-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-800">26 Seções Cirúrgicas</span>
          <span className="hidden sm:inline"> • Protegido por SurgicalFactLock</span>
        </div>
        <button
          id="btn-bottom-view-preview"
          type="button"
          onClick={() => setViewMode('preview')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Visualizar Evolução de Enfermagem</span>
        </button>
      </div>
    </div>
  );
};
