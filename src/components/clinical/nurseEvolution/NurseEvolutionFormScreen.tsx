import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { NurseEvolutionForm } from '../../../types/nurseEvolutionClinical';
import {
  createInitialNurseEvolutionForm,
  createSampleNurseEvolutionForm,
  normalizeNurseEvolutionForm,
  getNurseEvolutionSectionStatuses,
} from '../../../utils/nurseEvolutionValidator';
import { NurseEvolutionPreviewView } from './NurseEvolutionPreviewView';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { DeviceFormCard } from '../DeviceFormCard';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';
import { InvasiveDeviceItem } from '../../../types/clinical';

interface NurseEvolutionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const NurseEvolutionFormScreen: React.FC<NurseEvolutionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Evolução de Enfermagem (Enfermeiro)" onNavigateHome={props.onBack}>
      <NurseEvolutionFormContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const NurseEvolutionFormContent: React.FC<NurseEvolutionFormScreenProps> = ({
  onBack,
  patientAreaName = 'PS / Emergência',
}) => {
  const [form, setForm] = useState<NurseEvolutionForm>(() => createInitialNurseEvolutionForm());
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  const normalizedForm = useMemo(() => normalizeNurseEvolutionForm(form), [form]);
  const sectionStatuses = useMemo(() => getNurseEvolutionSectionStatuses(normalizedForm), [normalizedForm]);

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? null : idx));
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja limpar todos os campos da evolução de enfermagem?')) {
      setForm(createInitialNurseEvolutionForm());
      setActiveSection(0);
    }
  };

  const handleFillSample = () => {
    setForm(createSampleNurseEvolutionForm());
    setActiveSection(0);
  };

  // Section State Updaters
  const updateContext = (patch: Partial<NurseEvolutionForm['context']>) => {
    setForm((p) => ({ ...p, context: { ...p.context, ...patch } }));
  };
  const updateGeneral = (patch: Partial<NurseEvolutionForm['generalAssessment']>) => {
    setForm((p) => ({ ...p, generalAssessment: { ...p.generalAssessment, ...patch } }));
  };
  const updateVitals = (patch: Partial<NurseEvolutionForm['vitalSignsAndPain']>) => {
    setForm((p) => ({ ...p, vitalSignsAndPain: { ...p.vitalSignsAndPain, ...patch } }));
  };
  const updateNeuro = (patch: Partial<NurseEvolutionForm['neurological']>) => {
    setForm((p) => ({ ...p, neurological: { ...p.neurological, ...patch } }));
  };
  const updateResp = (patch: Partial<NurseEvolutionForm['respiratory']>) => {
    setForm((p) => ({ ...p, respiratory: { ...p.respiratory, ...patch } }));
  };
  const updatePulmAusc = (patch: Partial<NurseEvolutionForm['pulmonaryAuscultation']>) => {
    setForm((p) => ({ ...p, pulmonaryAuscultation: { ...p.pulmonaryAuscultation, ...patch } }));
  };
  const updateCardio = (patch: Partial<NurseEvolutionForm['cardiovascular']>) => {
    setForm((p) => ({ ...p, cardiovascular: { ...p.cardiovascular, ...patch } }));
  };
  const updateCardAusc = (patch: Partial<NurseEvolutionForm['cardiacAuscultation']>) => {
    setForm((p) => ({ ...p, cardiacAuscultation: { ...p.cardiacAuscultation, ...patch } }));
  };
  const updateGI = (patch: Partial<NurseEvolutionForm['gastrointestinalAndNutrition']>) => {
    setForm((p) => ({ ...p, gastrointestinalAndNutrition: { ...p.gastrointestinalAndNutrition, ...patch } }));
  };
  const updateElim = (patch: Partial<NurseEvolutionForm['eliminations']>) => {
    setForm((p) => ({ ...p, eliminations: { ...p.eliminations, ...patch } }));
  };
  const updateSkin = (patch: Partial<NurseEvolutionForm['skin']>) => {
    setForm((p) => ({ ...p, skin: { ...p.skin, ...patch } }));
  };
  const updateMobility = (patch: Partial<NurseEvolutionForm['mobilityAndSafety']>) => {
    setForm((p) => ({ ...p, mobilityAndSafety: { ...p.mobilityAndSafety, ...patch } }));
  };
  const updateTherapies = (patch: Partial<NurseEvolutionForm['therapiesAndInfusions']>) => {
    setForm((p) => ({ ...p, therapiesAndInfusions: { ...p.therapiesAndInfusions, ...patch } }));
  };
  const updateCareDone = (patch: Partial<NurseEvolutionForm['careDone']>) => {
    setForm((p) => ({ ...p, careDone: { ...p.careDone, ...patch } }));
  };
  const updateRisk = (patch: Partial<NurseEvolutionForm['riskAssessment']>) => {
    setForm((p) => ({ ...p, riskAssessment: { ...p.riskAssessment, ...patch } }));
  };
  const updateComplications = (patch: Partial<NurseEvolutionForm['complications']>) => {
    setForm((p) => ({ ...p, complications: { ...p.complications, ...patch } }));
  };
  const updateCommunication = (patch: Partial<NurseEvolutionForm['communication']>) => {
    setForm((p) => ({ ...p, communication: { ...p.communication, ...patch } }));
  };
  const updateResponseToCare = (patch: Partial<NurseEvolutionForm['responseToCare']>) => {
    setForm((p) => ({ ...p, responseToCare: { ...p.responseToCare, ...patch } }));
  };
  const updateEvolutionState = (patch: Partial<NurseEvolutionForm['evolutionState']>) => {
    setForm((p) => ({ ...p, evolutionState: { ...p.evolutionState, ...patch } }));
  };

  // Device list helpers
  const addDevice = () => {
    const newDev: InvasiveDeviceItem = {
      id: `dev-${Date.now()}`,
      type: 'AVP',
      location: 'MSD',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: 'Ausentes',
    };
    setForm((p) => ({
      ...p,
      devices: { list: [...p.devices.list, newDev] },
    }));
  };

  const updateDevice = (idx: number, updated: InvasiveDeviceItem) => {
    setForm((p) => {
      const copy = [...p.devices.list];
      copy[idx] = updated;
      return { ...p, devices: { list: copy } };
    });
  };

  const removeDevice = (idx: number) => {
    setForm((p) => ({
      ...p,
      devices: { list: p.devices.list.filter((_, i) => i !== idx) },
    }));
  };

  // Vasoactive drugs helper
  const addVasoactiveDrug = () => {
    const newItem = {
      id: `vaso-${Date.now()}`,
      medication: 'Noradrenalina',
      doseOrRate: '10',
      unit: 'mL/h',
    };
    setForm((p) => ({
      ...p,
      therapiesAndInfusions: {
        ...p.therapiesAndInfusions,
        vasoactiveDrugsList: [...p.therapiesAndInfusions.vasoactiveDrugsList, newItem],
      },
    }));
  };

  if (viewMode === 'preview') {
    return (
      <NurseEvolutionPreviewView
        form={normalizedForm}
        onBackToEdit={() => setViewMode('form')}
        patientAreaName={patientAreaName}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar às áreas assistenciais</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preencher Exemplo</span>
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Evolução de Enfermagem — {patientAreaName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Exame clínico por sistemas, auscultas, riscos assistenciais, julgamento e resposta terapêutica do Enfermeiro.
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Perfil Enfermeiro
          </span>
        </div>

        <div className="pt-2">
          <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 text-xs text-teal-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>
              <strong>Segurança Clínica:</strong> Estruturação orientada a fatos auditados com verificação de travas pós-geração e salvaguardas de privacidade.
            </span>
          </div>
        </div>
      </div>

      {/* 20 Clinical Sections */}
      <div className="space-y-3">
        {/* 1. Contexto */}
        <ClinicalSection
          index={0}
          title="Contexto e Identificação"
          status={sectionStatuses[0]}
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Momento do Registro"
              value={form.context.moment}
              options={[
                { value: 'Avalio paciente', label: 'Avalio paciente' },
                { value: 'Reavalio paciente', label: 'Reavalio paciente' },
                { value: 'Recebo paciente no início do período', label: 'Recebo paciente' },
              ]}
              onChange={(val) => updateContext({ moment: val })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Localização"
                value={form.context.location}
                options={[
                  { value: 'Leito', label: 'Leito' },
                  { value: 'Box', label: 'Box' },
                  { value: 'Sala Vermelha', label: 'Sala Vermelha' },
                  { value: 'Observação', label: 'Observação' },
                ]}
                onChange={(val) => updateContext({ location: val })}
              />
              <ClinicalOptionGroup
                label="Acompanhante"
                value={form.context.escort}
                options={[
                  { value: 'Desacompanhado', label: 'Desacompanhado' },
                  { value: 'Familiar', label: 'Familiar' },
                  { value: 'Cuidador', label: 'Cuidador' },
                ]}
                onChange={(val) => updateContext({ escort: val })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Identificação por Pulseira"
                value={form.context.wristbandIdentification}
                options={[
                  { value: 'Sim', label: 'Checada e confirmada' },
                  { value: 'Não', label: 'Não' },
                  { value: 'Não se aplica', label: 'Não se aplica' },
                ]}
                onChange={(val) => updateContext({ wristbandIdentification: val })}
              />
              <ClinicalOptionGroup
                label="Identificação no Leito"
                value={form.context.bedIdentification}
                options={[
                  { value: 'Sim', label: 'Checada e confirmada' },
                  { value: 'Não', label: 'Não' },
                  { value: 'Não se aplica', label: 'Não se aplica' },
                ]}
                onChange={(val) => updateContext({ bedIdentification: val })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 2. Avaliação Geral */}
        <ClinicalSection
          index={1}
          title="Avaliação Geral e Comportamento"
          status={sectionStatuses[1]}
          isOpen={activeSection === 1}
          onToggle={() => toggleSection(1)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Comportamento / Atitude Observada"
              values={form.generalAssessment.behavior}
              options={[
                { value: 'Calmo', label: 'Calmo' },
                { value: 'Cooperativo', label: 'Cooperativo' },
                { value: 'Agitado', label: 'Agitado' },
                { value: 'Ansioso', label: 'Ansioso' },
                { value: 'Hipoativo', label: 'Hipoativo' },
                { value: 'Sonolento', label: 'Sonolento' },
                { value: 'Sedado', label: 'Sedado' },
              ]}
              onChange={(vals) => updateGeneral({ behavior: vals })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Queixas Referidas"
                value={form.generalAssessment.complaintStatus}
                options={[
                  { value: 'Sem queixas referidas', label: 'Sem queixas referidas' },
                  { value: 'Com queixa', label: 'Com queixa' },
                  { value: 'Impossibilitado de informar', label: 'Impossibilitado de informar' },
                ]}
                onChange={(val) => updateGeneral({ complaintStatus: val })}
              />
              <ClinicalOptionGroup
                label="Fonte de Informação"
                value={form.generalAssessment.informationSource}
                options={[
                  { value: 'Paciente', label: 'Paciente' },
                  { value: 'Acompanhante', label: 'Acompanhante' },
                  { value: 'Equipe', label: 'Equipe' },
                ]}
                onChange={(val) => updateGeneral({ informationSource: val })}
              />
            </div>
            {form.generalAssessment.complaintStatus === 'Com queixa' && (
              <ClinicalTextInput
                label="Descrição da queixa"
                value={form.generalAssessment.complaintDescription || ''}
                onChange={(v) => updateGeneral({ complaintDescription: v })}
                placeholder="Ex: cefaleia holocraniana de moderada intensidade"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 3. Sinais Vitais e Dor */}
        <ClinicalSection
          index={2}
          title="Sinais Vitais e Avaliação da Dor"
          status={sectionStatuses[2]}
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ClinicalTextInput
                label="PA Sistólica (mmHg)"
                value={form.vitalSignsAndPain.systolicBP}
                onChange={(v) => updateVitals({ systolicBP: v })}
                placeholder="120"
              />
              <ClinicalTextInput
                label="PA Diastólica (mmHg)"
                value={form.vitalSignsAndPain.diastolicBP}
                onChange={(v) => updateVitals({ diastolicBP: v })}
                placeholder="80"
              />
              <ClinicalTextInput
                label="PAM (mmHg, opcional)"
                value={form.vitalSignsAndPain.meanArterialPressure}
                onChange={(v) => updateVitals({ meanArterialPressure: v })}
                placeholder="93"
              />
              <ClinicalTextInput
                label="FC (bpm)"
                value={form.vitalSignsAndPain.heartRate}
                onChange={(v) => updateVitals({ heartRate: v })}
                placeholder="75"
              />
              <ClinicalTextInput
                label="FR (irpm)"
                value={form.vitalSignsAndPain.respiratoryRate}
                onChange={(v) => updateVitals({ respiratoryRate: v })}
                placeholder="16"
              />
              <ClinicalTextInput
                label="SpO₂ (%)"
                value={form.vitalSignsAndPain.oxygenSaturation}
                onChange={(v) => updateVitals({ oxygenSaturation: v })}
                placeholder="98"
              />
              <ClinicalTextInput
                label="Temperatura (°C)"
                value={form.vitalSignsAndPain.temperature}
                onChange={(v) => updateVitals({ temperature: v })}
                placeholder="36.5"
              />
              <ClinicalTextInput
                label="Glicemia (mg/dL)"
                value={form.vitalSignsAndPain.capillaryBloodGlucose}
                onChange={(v) => updateVitals({ capillaryBloodGlucose: v })}
                placeholder="110"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <ClinicalOptionGroup
                label="Escala de Dor"
                value={form.vitalSignsAndPain.painScaleType}
                options={[
                  { value: 'Sem dor', label: 'Sem dor' },
                  { value: 'Escala numérica 0–10', label: 'Escala numérica 0–10' },
                  { value: 'Não avaliável', label: 'Não avaliável' },
                ]}
                onChange={(v) => updateVitals({ painScaleType: v })}
              />
              {form.vitalSignsAndPain.painScaleType === 'Escala numérica 0–10' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <ClinicalTextInput
                    label="Nota da dor (0 a 10)"
                    value={form.vitalSignsAndPain.painScore}
                    onChange={(v) => updateVitals({ painScore: v })}
                    placeholder="Ex: 5"
                  />
                  <ClinicalTextInput
                    label="Localização"
                    value={form.vitalSignsAndPain.painLocation}
                    onChange={(v) => updateVitals({ painLocation: v })}
                    placeholder="Ex: hipocôndrio direito"
                  />
                  <ClinicalTextInput
                    label="Característica"
                    value={form.vitalSignsAndPain.painCharacteristic}
                    onChange={(v) => updateVitals({ painCharacteristic: v })}
                    placeholder="Ex: em pontada"
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 4. Neurológico */}
        <ClinicalSection
          index={3}
          title="Avaliação Neurológica"
          status={sectionStatuses[3]}
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Nível de Consciência"
              value={form.neurological.consciousnessLevel}
              options={[
                { value: 'Consciente', label: 'Consciente' },
                { value: 'Sonolento', label: 'Sonolento' },
                { value: 'Torporoso', label: 'Torporoso' },
                { value: 'Comatoso', label: 'Comatoso' },
                { value: 'Sedado', label: 'Sedado' },
              ]}
              onChange={(v) => updateNeuro({ consciousnessLevel: v })}
            />
            <ClinicalOptionGroup
              label="Orientação"
              value={form.neurological.orientation}
              options={[
                { value: 'Orientado em tempo e espaço', label: 'Orientado em tempo e espaço' },
                { value: 'Desorientado', label: 'Desorientado' },
                { value: 'Não avaliável', label: 'Não avaliável' },
              ]}
              onChange={(v) => updateNeuro({ orientation: v })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Pupilas"
                value={form.neurological.pupils}
                options={[
                  { value: 'Isocóricas', label: 'Isocóricas' },
                  { value: 'Anisocóricas', label: 'Anisocóricas' },
                  { value: 'Mióticas', label: 'Mióticas' },
                  { value: 'Midriáticas', label: 'Midriáticas' },
                ]}
                onChange={(v) => updateNeuro({ pupils: v })}
              />
              <ClinicalOptionGroup
                label="Fotorreagência"
                value={form.neurological.photoreaction}
                options={[
                  { value: 'Fotorreagentes', label: 'Fotorreagentes' },
                  { value: 'Não reagentes', label: 'Não reagentes' },
                  { value: 'Lentificadas', label: 'Lentificadas' },
                ]}
                onChange={(v) => updateNeuro({ photoreaction: v })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalTextInput
                label="Escala de Coma de Glasgow (3–15)"
                value={form.neurological.glasgowScore}
                onChange={(v) => updateNeuro({ glasgowScore: v })}
                placeholder="15"
              />
              <ClinicalTextInput
                label="Escala RASS (se aplicável, -5 a +4)"
                value={form.neurological.rassScore}
                onChange={(v) => updateNeuro({ rassScore: v })}
                placeholder="0"
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 5. Respiratório */}
        <ClinicalSection
          index={4}
          title="Padrão Respiratório e Suporte Ventilatório"
          status={sectionStatuses[4]}
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Suporte Respiratório"
              value={form.respiratory.respiratorySupport}
              options={[
                { value: 'Ar ambiente', label: 'Ar ambiente' },
                { value: 'Oxigenoterapia', label: 'Oxigenoterapia' },
                { value: 'VNI', label: 'VNI' },
                { value: 'VMI', label: 'VMI' },
              ]}
              onChange={(v) => updateResp({ respiratorySupport: v })}
            />
            {form.respiratory.respiratorySupport === 'Oxigenoterapia' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalOptionGroup
                  label="Dispositivo"
                  value={form.respiratory.oxygenDevice || ''}
                  options={[
                    { value: 'Cateter nasal', label: 'Cateter nasal' },
                    { value: 'Máscara com reservatório', label: 'Máscara com reservatório' },
                    { value: 'Máscara de Venturi', label: 'Máscara de Venturi' },
                  ]}
                  onChange={(v) => updateResp({ oxygenDevice: v })}
                />
                <ClinicalTextInput
                  label="Fluxo de O2 (L/min)"
                  value={form.respiratory.oxygenFlowRate || ''}
                  onChange={(v) => updateResp({ oxygenFlowRate: v })}
                  placeholder="3"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Padrão Respiratório"
                value={form.respiratory.respiratoryPattern}
                options={[
                  { value: 'Eupneico', label: 'Eupneico' },
                  { value: 'Taquipneico', label: 'Taquipneico' },
                  { value: 'Bradipneico', label: 'Bradipneico' },
                ]}
                onChange={(v) => updateResp({ respiratoryPattern: v })}
              />
              <ClinicalOptionGroup
                label="Esforço / Desconforto Respiratório"
                value={form.respiratory.respiratoryDistress}
                options={[
                  { value: 'Ausente', label: 'Ausente' },
                  { value: 'Presente', label: 'Presente' },
                ]}
                onChange={(v) => updateResp({ respiratoryDistress: v })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 6. Ausculta Pulmonar (Enfermeiro) */}
        <ClinicalSection
          index={5}
          title="Ausculta Pulmonar (Privativo do Enfermeiro)"
          status={sectionStatuses[5]}
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Ausculta Pulmonar Realizada?"
              value={form.pulmonaryAuscultation.performed}
              options={[
                { value: 'Sim', label: 'Sim, realizada' },
                { value: 'Não', label: 'Não realizada' },
              ]}
              onChange={(v) => updatePulmAusc({ performed: v })}
            />
            {form.pulmonaryAuscultation.performed === 'Sim' && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalOptionGroup
                  label="Murmúrio Vesicular"
                  value={form.pulmonaryAuscultation.vesicularMurmur}
                  options={[
                    { value: 'Presente bilateralmente', label: 'Presente bilateralmente sem ruídos' },
                    { value: 'Diminuído', label: 'Diminuído em bases' },
                    { value: 'Assimétrico', label: 'Assimétrico' },
                  ]}
                  onChange={(v) => updatePulmAusc({ vesicularMurmur: v })}
                />
                <ClinicalMultiSelect
                  label="Ruídos Adventícios"
                  values={form.pulmonaryAuscultation.adventitiousSoundTypes}
                  options={[
                    { value: 'Roncos', label: 'Roncos' },
                    { value: 'Sibilos', label: 'Sibilos' },
                    { value: 'Estertores finos', label: 'Estertores finos (crepitantes)' },
                    { value: 'Estertores grossos', label: 'Estertores grossos' },
                  ]}
                  onChange={(vals) => updatePulmAusc({ adventitiousSoundTypes: vals })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 7. Cardiovascular */}
        <ClinicalSection
          index={6}
          title="Avaliação Cardiovascular e Perfusão"
          status={sectionStatuses[6]}
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ClinicalOptionGroup
                label="Perfusão Periférica"
                value={form.cardiovascular.peripheralPerfusion}
                options={[
                  { value: 'Adequada', label: 'Adequada' },
                  { value: 'Reduzida', label: 'Reduzida' },
                ]}
                onChange={(v) => updateCardio({ peripheralPerfusion: v })}
              />
              <ClinicalOptionGroup
                label="Extremidades"
                value={form.cardiovascular.extremities}
                options={[
                  { value: 'Quentes', label: 'Aquecidas' },
                  { value: 'Frias', label: 'Frias' },
                ]}
                onChange={(v) => updateCardio({ extremities: v })}
              />
              <ClinicalOptionGroup
                label="Edema"
                value={form.cardiovascular.edema}
                options={[
                  { value: 'Ausente', label: 'Ausente' },
                  { value: 'Presente', label: 'Presente' },
                ]}
                onChange={(v) => updateCardio({ edema: v })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 8. Ausculta Cardíaca (Enfermeiro) */}
        <ClinicalSection
          index={7}
          title="Ausculta Cardíaca (Privativo do Enfermeiro)"
          status={sectionStatuses[7]}
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Ausculta Cardíaca Realizada?"
              value={form.cardiacAuscultation.performed}
              options={[
                { value: 'Sim', label: 'Sim, realizada' },
                { value: 'Não', label: 'Não realizada' },
              ]}
              onChange={(v) => updateCardAusc({ performed: v })}
            />
            {form.cardiacAuscultation.performed === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalOptionGroup
                  label="Bulhas Cardíacas"
                  value={form.cardiacAuscultation.heartSounds}
                  options={[
                    { value: 'Normofonéticas', label: 'Bulhas normofonéticas (BNF)' },
                    { value: 'Hipofonéticas', label: 'Bulhas hipofonéticas' },
                  ]}
                  onChange={(v) => updateCardAusc({ heartSounds: v })}
                />
                <ClinicalOptionGroup
                  label="Ritmo"
                  value={form.cardiacAuscultation.rhythm}
                  options={[
                    { value: 'Regular', label: 'Ritmo regular em 2T' },
                    { value: 'Irregular', label: 'Ritmo irregular' },
                  ]}
                  onChange={(v) => updateCardAusc({ rhythm: v })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 9. Gastrointestinal e Nutrição */}
        <ClinicalSection
          index={8}
          title="Gastrointestinal e Nutrição"
          status={sectionStatuses[8]}
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Forma do Abdome"
                value={form.gastrointestinalAndNutrition.abdomenForm}
                options={[
                  { value: 'Plano', label: 'Plano' },
                  { value: 'Globoso', label: 'Globoso' },
                  { value: 'Distendido', label: 'Distendido' },
                ]}
                onChange={(v) => updateGI({ abdomenForm: v })}
              />
              <ClinicalOptionGroup
                label="Consistência e Palpação"
                value={form.gastrointestinalAndNutrition.abdomenConsistency}
                options={[
                  { value: 'Flácido', label: 'Flácido e indolor' },
                  { value: 'Tenso', label: 'Tenso / doloroso' },
                ]}
                onChange={(v) => updateGI({ abdomenConsistency: v })}
              />
            </div>
            <ClinicalOptionGroup
              label="Nutrição / Dieta"
              value={form.gastrointestinalAndNutrition.nutritionalStatus}
              options={[
                { value: 'Via oral', label: 'Via oral' },
                { value: 'Dieta enteral', label: 'Dieta enteral' },
                { value: 'Jejum', label: 'Jejum' },
              ]}
              onChange={(v) => updateGI({ nutritionalStatus: v })}
            />
          </div>
        </ClinicalSection>

        {/* 10. Eliminações */}
        <ClinicalSection
          index={9}
          title="Eliminações Vesicais e Intestinais"
          status={sectionStatuses[9]}
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Diurese"
                value={form.eliminations.diuresis}
                options={[
                  { value: 'Presente', label: 'Presente' },
                  { value: 'Oligúrica', label: 'Oligúrica' },
                  { value: 'Anúrica', label: 'Anúrica' },
                ]}
                onChange={(v) => updateElim({ diuresis: v })}
              />
              <ClinicalOptionGroup
                label="Via Urinária"
                value={form.eliminations.urinaryRoute}
                options={[
                  { value: 'Espontânea', label: 'Espontânea' },
                  { value: 'SVD', label: 'SVD' },
                ]}
                onChange={(v) => updateElim({ urinaryRoute: v })}
              />
            </div>
            <ClinicalOptionGroup
              label="Eliminações Intestinais"
              value={form.eliminations.bowelElimination}
              options={[
                { value: 'Presentes', label: 'Presentes no plantão' },
                { value: 'Ausentes', label: 'Ausentes no plantão' },
              ]}
              onChange={(v) => updateElim({ bowelElimination: v })}
            />
          </div>
        </ClinicalSection>

        {/* 11. Dispositivos Invasivos */}
        <ClinicalSection
          index={10}
          title="Dispositivos Invasivos e Acessos"
          status={sectionStatuses[10]}
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
        >
          <div className="space-y-4">
            {form.devices.list.map((dev, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Dispositivo #{idx + 1}: {dev.type} ({dev.location})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDevice(idx)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
                <DeviceFormCard
                  device={dev}
                  onChange={(up) => updateDevice(idx, up)}
                  onRemove={() => removeDevice(idx)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addDevice}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-600 text-teal-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors bg-teal-50/50"
            >
              <Plus className="w-4 h-4" /> Adicionar Dispositivo
            </button>
          </div>
        </ClinicalSection>

        {/* 12. Pele e Curativos */}
        <ClinicalSection
          index={11}
          title="Pele, Mucosas e Curativos"
          status={sectionStatuses[11]}
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Integridade Cutânea"
              value={form.skin.integrity}
              options={[
                { value: 'Íntegra', label: 'Pele íntegra' },
                { value: 'Com alteração/lesão', label: 'Com lesão ou curativo' },
              ]}
              onChange={(v) => updateSkin({ integrity: v })}
            />
            {form.skin.integrity === 'Com alteração/lesão' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Localização da Lesão / Curativo"
                  value={form.skin.lesionLocation || ''}
                  onChange={(v) => updateSkin({ lesionLocation: v })}
                  placeholder="Ex: região sacra"
                />
                <ClinicalTextInput
                  label="Descrição e Cuidados"
                  value={form.skin.lesionDescription || ''}
                  onChange={(v) => updateSkin({ lesionDescription: v })}
                  placeholder="Ex: LPP estágio II, curativo limpo e seco"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 13. Mobilidade e Segurança */}
        <ClinicalSection
          index={12}
          title="Mobilidade e Medidas de Segurança"
          status={sectionStatuses[12]}
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Mobilidade"
              value={form.mobilityAndSafety.mobility}
              options={[
                { value: 'Deambula sem auxílio', label: 'Deambula sem auxílio' },
                { value: 'Deambula com auxílio', label: 'Deambula com auxílio' },
                { value: 'Restrito ao leito', label: 'Restrito ao leito' },
                { value: 'Acamado', label: 'Acamado' },
              ]}
              onChange={(v) => updateMobility({ mobility: v })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Grades do Leito"
                value={form.mobilityAndSafety.bedRails}
                options={[
                  { value: 'Elevadas', label: 'Elevadas' },
                  { value: 'Não elevadas', label: 'Não elevadas' },
                ]}
                onChange={(v) => updateMobility({ bedRails: v })}
              />
              <ClinicalOptionGroup
                label="Cabeceira do Leito"
                value={form.mobilityAndSafety.headOfBed}
                options={[
                  { value: 'Elevada', label: 'Elevada a 30°–45°' },
                  { value: 'Não elevada', label: 'Horizontal' },
                ]}
                onChange={(v) => updateMobility({ headOfBed: v })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 14. Terapias e Infusões */}
        <ClinicalSection
          index={13}
          title="Drogas Vasoativas e Infusões Contínuas"
          status={sectionStatuses[13]}
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Drogas Vasoativas em Uso?"
              value={form.therapiesAndInfusions.vasoactiveDrugsInUse}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Sim', label: 'Sim' },
              ]}
              onChange={(v) => updateTherapies({ vasoactiveDrugsInUse: v })}
            />
            {form.therapiesAndInfusions.vasoactiveDrugsInUse === 'Sim' && (
              <div className="space-y-3">
                {form.therapiesAndInfusions.vasoactiveDrugsList.map((d, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-slate-800">{d.medication} a {d.doseOrRate} {d.unit}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = form.therapiesAndInfusions.vasoactiveDrugsList.filter((_, idx) => idx !== i);
                        updateTherapies({ vasoactiveDrugsList: copy });
                      }}
                      className="text-rose-600 font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVasoactiveDrug}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-teal-300 text-teal-800 text-xs font-semibold bg-teal-50/40 hover:bg-teal-50"
                >
                  + Adicionar Infusão Vasoativa
                </button>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 15. Cuidados Prestados */}
        <ClinicalSection
          index={14}
          title="Cuidados de Enfermagem Prestados"
          status={sectionStatuses[14]}
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Cuidados e Ações Realizadas"
              values={form.careDone.careItems}
              options={[
                { value: 'Monitorização multiparamétrica de sinais vitais', label: 'Monitorização multiparamétrica de sinais vitais' },
                { value: 'Manutenção de decúbito elevado a 30 graus', label: 'Manutenção de decúbito elevado a 30°' },
                { value: 'Administração de medicações prescritas', label: 'Administração de medicações prescritas' },
                { value: 'Orientações ao paciente e acompanhante', label: 'Orientações ao paciente e acompanhante' },
                { value: 'Manutenção de grades elevadas e prevenção de quedas', label: 'Manutenção de grades elevadas' },
                { value: 'Mudança de decúbito programada', label: 'Mudança de decúbito programada' },
              ]}
              onChange={(vals) => updateCareDone({ careItems: vals })}
            />
          </div>
        </ClinicalSection>

        {/* 16. Riscos Assistenciais */}
        <ClinicalSection
          index={15}
          title="Avaliação de Riscos (Morse / Braden)"
          status={sectionStatuses[15]}
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Risco de Queda (Escala de Morse)"
                value={form.riskAssessment.fallRiskClassification || ''}
                options={[
                  { value: 'Baixo risco de queda', label: 'Baixo risco (0–24)' },
                  { value: 'Médio risco de queda', label: 'Médio risco (25–44)' },
                  { value: 'Alto risco de queda', label: 'Alto risco (≥ 45)' },
                ]}
                onChange={(v) => updateRisk({ fallRiskClassification: v, fallRiskStatus: 'Avaliado' })}
              />
              <ClinicalOptionGroup
                label="Risco de LPP (Escala de Braden)"
                value={form.riskAssessment.pressureInjuryClassification || ''}
                options={[
                  { value: 'Sem risco de lesão por pressão', label: 'Sem risco (> 18)' },
                  { value: 'Risco leve de lesão por pressão', label: 'Risco leve (15–18)' },
                  { value: 'Risco moderado de lesão por pressão', label: 'Risco moderado (13–14)' },
                  { value: 'Alto risco de lesão por pressão', label: 'Alto risco (≤ 12)' },
                ]}
                onChange={(v) => updateRisk({ pressureInjuryClassification: v, pressureInjuryRiskStatus: 'Avaliado' })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 17. Intercorrências */}
        <ClinicalSection
          index={16}
          title="Intercorrências no Período"
          status={sectionStatuses[16]}
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Intercorrência?"
              value={form.complications.hasComplication}
              options={[
                { value: 'Não', label: 'Não, período sem intercorrências' },
                { value: 'Sim', label: 'Sim, houve intercorrência' },
              ]}
              onChange={(v) => updateComplications({ hasComplication: v })}
            />
            {form.complications.hasComplication === 'Sim' && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Descrição da Intercorrência"
                  value={form.complications.description || ''}
                  onChange={(v) => updateComplications({ description: v })}
                  placeholder="Ex: episódio de pico hipertensivo 180x100 mmHg"
                />
                <ClinicalTextInput
                  label="Condutas e Intervenções Tomadas"
                  value={form.complications.interventionDone || ''}
                  onChange={(v) => updateComplications({ interventionDone: v })}
                  placeholder="Ex: comunicado médico e administrado anti-hipertensivo conforme PM"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 18. Resposta ao Cuidado (Privativo do Enfermeiro) */}
        <ClinicalSection
          index={17}
          title="Resposta aos Cuidados Prestados (Privativo do Enfermeiro)"
          status={sectionStatuses[17]}
          isOpen={activeSection === 17}
          onToggle={() => toggleSection(17)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Avaliação da Resposta Terapêutica"
              value={form.responseToCare.evaluated}
              options={[
                { value: 'Sim', label: 'Avaliada' },
                { value: 'Não avaliada', label: 'Não avaliada' },
              ]}
              onChange={(v) => updateResponseToCare({ evaluated: v })}
            />
            {form.responseToCare.evaluated === 'Sim' && (
              <ClinicalTextInput
                label="Síntese da Resposta aos Cuidados"
                value={form.responseToCare.structuredResponseText || ''}
                onChange={(v) => updateResponseToCare({ structuredResponseText: v })}
                placeholder="Ex: paciente apresentou melhora da dor após analgesia e boa tolerância às condutas"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 19. Estado Evolutivo Final */}
        <ClinicalSection
          index={18}
          title="Estado Final e Destino"
          status={sectionStatuses[18]}
          isOpen={activeSection === 18}
          onToggle={() => toggleSection(18)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Comparação Evolutiva no Período"
              value={form.evolutionState.statusChange}
              options={[
                { value: 'Sem alteração observada', label: 'Sem alteração observada no período' },
                { value: 'Melhora registrada pelo Enfermeiro', label: 'Melhora clínica observada' },
                { value: 'Piora registrada pelo Enfermeiro', label: 'Piora clínica observada' },
              ]}
              onChange={(v) => updateEvolutionState({ statusChange: v })}
            />
            <ClinicalOptionGroup
              label="Condição / Destino do Paciente ao Final"
              value={form.evolutionState.currentStatus}
              options={[
                { value: 'Permanece no setor sob cuidados de enfermagem', label: 'Permanece no setor sob cuidados de enfermagem' },
                { value: 'Mantido em observação', label: 'Mantido em observação' },
              ]}
              onChange={(v) => updateEvolutionState({ currentStatus: v })}
            />
          </div>
        </ClinicalSection>
      </div>

      {/* Floating / Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            Preencha os campos e gere a evolução de enfermagem estruturada.
          </div>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Visualizar Evolução Estruturada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
