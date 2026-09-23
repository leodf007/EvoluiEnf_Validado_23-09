import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  HeartPulse,
} from 'lucide-react';
import { TechnicianICUNursingNoteForm, ICUDeviceItem, VasoactiveDrugItem, SedationInfusionItem } from '../../../types/icuClinical';
import { SectionStatus } from '../../../types/clinical';
import {
  createInitialICUForm,
  createSampleICUForm,
  getICUSectionStatuses,
  validateICUForm,
} from '../../../utils/icuValidator';
import { validateICUConsistency } from '../../../engine/icuConsistencyValidator';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalNumericInput } from '../ClinicalNumericInput';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalProgressBar } from '../ClinicalProgressBar';
import { VitalSignsInputs } from '../VitalSignsInputs';
import { TechnicianICUPreviewView } from './TechnicianICUPreviewView';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface TechnicianICUFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const TechnicianICUFormScreen: React.FC<TechnicianICUFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Anotação de Enfermagem — UTI" onNavigateHome={props.onBack}>
      <TechnicianICUFormScreenContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const TechnicianICUFormScreenContent: React.FC<TechnicianICUFormScreenProps> = ({
  onBack,
  patientAreaName = 'UTI - Terapia Intensiva',
}) => {
  const [form, setForm] = useState<TechnicianICUNursingNoteForm>(createInitialICUForm);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  // Consistency alerts & section statuses
  const consistencyAlerts = useMemo(() => validateICUConsistency(form), [form]);
  const sectionStatuses = useMemo(() => getICUSectionStatuses(form), [form]);

  const icuSectionTitles = useMemo(
    () => [
      'Contexto e Identificação',
      'Condição Observada',
      'Sinais Vitais e Dor',
      'Neurológico e Sedação',
      'Respiratório e Ventilação',
      'Cardiovascular e Perfusão',
      'Drogas Vasoativas (DVA)',
      'Sedação e Analgesia Contínua',
      'Nutrição e Gastrointestinal',
      'Eliminações e Balanço Hídrico',
      'Dispositivos e Acessos',
      'Pele e Integridade Cutânea',
      'Mobilidade, Posicionamento e Segurança',
      'Higiene e Banho',
      'Cuidados e Ações de Enfermagem',
      'Intercorrências e Comunicação',
      'Alterações Observadas no Período',
      'Situação Final e Continuidade',
      'Informações Adicionais',
    ],
    []
  );

  const sectionsForProgress = useMemo(
    () =>
      icuSectionTitles.map((title, index) => ({
        index,
        title,
        status: (sectionStatuses[index] || 'not_started') as SectionStatus,
      })),
    [icuSectionTitles, sectionStatuses]
  );

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? -1 : idx));
  };

  const openSection = (idx: number) => {
    setViewMode('form');
    setActiveSection(idx);
    setTimeout(() => {
      const el = document.getElementById(`section-${idx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja realmente limpar todos os campos da anotação de UTI?')) {
      setForm(createInitialICUForm());
      setActiveSection(0);
      setViewMode('form');
    }
  };

  const handleFillSample = () => {
    setForm(createSampleICUForm());
    setActiveSection(0);
  };

  // State updaters
  const updateContext = (updates: Partial<TechnicianICUNursingNoteForm['context']>) =>
    setForm((prev) => ({ ...prev, context: { ...prev.context, ...updates } }));

  const updateCondition = (updates: Partial<TechnicianICUNursingNoteForm['observedCondition']>) =>
    setForm((prev) => ({ ...prev, observedCondition: { ...prev.observedCondition, ...updates } }));

  const updateVitals = (updates: Partial<TechnicianICUNursingNoteForm['vitalSignsAndPain']>) =>
    setForm((prev) => ({ ...prev, vitalSignsAndPain: { ...prev.vitalSignsAndPain, ...updates } }));

  const updateNeuro = (updates: Partial<TechnicianICUNursingNoteForm['neurologicalAndSedation']>) =>
    setForm((prev) => ({ ...prev, neurologicalAndSedation: { ...prev.neurologicalAndSedation, ...updates } }));

  const updateResp = (updates: Partial<TechnicianICUNursingNoteForm['respiratoryAndVentilation']>) =>
    setForm((prev) => ({ ...prev, respiratoryAndVentilation: { ...prev.respiratoryAndVentilation, ...updates } }));

  const updateCardio = (updates: Partial<TechnicianICUNursingNoteForm['cardiovascularAndPerfusion']>) =>
    setForm((prev) => ({ ...prev, cardiovascularAndPerfusion: { ...prev.cardiovascularAndPerfusion, ...updates } }));

  const updateDva = (updates: Partial<TechnicianICUNursingNoteForm['vasoactiveDrugs']>) =>
    setForm((prev) => ({ ...prev, vasoactiveDrugs: { ...prev.vasoactiveDrugs, ...updates } }));

  const updateSedation = (updates: Partial<TechnicianICUNursingNoteForm['sedationAndAnalgesia']>) =>
    setForm((prev) => ({ ...prev, sedationAndAnalgesia: { ...prev.sedationAndAnalgesia, ...updates } }));

  const updateNut = (updates: Partial<TechnicianICUNursingNoteForm['nutritionAndGastrointestinal']>) =>
    setForm((prev) => ({ ...prev, nutritionAndGastrointestinal: { ...prev.nutritionAndGastrointestinal, ...updates } }));

  const updateElim = (updates: Partial<TechnicianICUNursingNoteForm['eliminationsAndFluidBalance']>) =>
    setForm((prev) => ({ ...prev, eliminationsAndFluidBalance: { ...prev.eliminationsAndFluidBalance, ...updates } }));

  const updateDevices = (updates: Partial<TechnicianICUNursingNoteForm['devices']>) =>
    setForm((prev) => ({ ...prev, devices: { ...prev.devices, ...updates } }));

  const updateSkin = (updates: Partial<TechnicianICUNursingNoteForm['skinAndIntegrity']>) =>
    setForm((prev) => ({ ...prev, skinAndIntegrity: { ...prev.skinAndIntegrity, ...updates } }));

  const updateMobility = (updates: Partial<TechnicianICUNursingNoteForm['mobilityAndPositioning']>) =>
    setForm((prev) => ({ ...prev, mobilityAndPositioning: { ...prev.mobilityAndPositioning, ...updates } }));

  const updateHygiene = (updates: Partial<TechnicianICUNursingNoteForm['hygieneAndBath']>) =>
    setForm((prev) => ({ ...prev, hygieneAndBath: { ...prev.hygieneAndBath, ...updates } }));

  const updateCare = (updates: Partial<TechnicianICUNursingNoteForm['nursingCareDone']>) =>
    setForm((prev) => ({ ...prev, nursingCareDone: { ...prev.nursingCareDone, ...updates } }));

  const updateComplications = (updates: Partial<TechnicianICUNursingNoteForm['complicationsAndCommunication']>) =>
    setForm((prev) => ({ ...prev, complicationsAndCommunication: { ...prev.complicationsAndCommunication, ...updates } }));

  const updateChanges = (updates: Partial<TechnicianICUNursingNoteForm['observedChangesInPeriod']>) =>
    setForm((prev) => ({ ...prev, observedChangesInPeriod: { ...prev.observedChangesInPeriod, ...updates } }));

  const updateFinal = (updates: Partial<TechnicianICUNursingNoteForm['finalStatus']>) =>
    setForm((prev) => ({ ...prev, finalStatus: { ...prev.finalStatus, ...updates } }));

  const updateAdditional = (updates: Partial<TechnicianICUNursingNoteForm['additionalInfo']>) =>
    setForm((prev) => ({ ...prev, additionalInfo: { ...prev.additionalInfo, ...updates } }));

  // Helper dynamic items
  const addDva = () => {
    const newItem: VasoactiveDrugItem = {
      id: Math.random().toString(36).substring(2, 9),
      medication: '',
      infusionRate: '',
      unit: 'mL/h',
    };
    updateDva({ drugsList: [...(form.vasoactiveDrugs.drugsList || []), newItem] });
  };

  const removeDva = (id: string) => {
    updateDva({ drugsList: (form.vasoactiveDrugs.drugsList || []).filter((d) => d.id !== id) });
  };

  const updateDvaItem = (id: string, patch: Partial<VasoactiveDrugItem>) => {
    updateDva({
      drugsList: (form.vasoactiveDrugs.drugsList || []).map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  };

  const addSedation = () => {
    const newItem: SedationInfusionItem = {
      id: Math.random().toString(36).substring(2, 9),
      medication: '',
      rateOrDose: '',
      unit: 'mL/h',
      purpose: 'Sedação',
    };
    updateSedation({ infusionsList: [...(form.sedationAndAnalgesia.infusionsList || []), newItem] });
  };

  const removeSedation = (id: string) => {
    updateSedation({ infusionsList: (form.sedationAndAnalgesia.infusionsList || []).filter((s) => s.id !== id) });
  };

  const updateSedationItem = (id: string, patch: Partial<SedationInfusionItem>) => {
    updateSedation({
      infusionsList: (form.sedationAndAnalgesia.infusionsList || []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const addDevice = () => {
    const newItem: ICUDeviceItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'AVP',
      location: '',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
    };
    updateDevices({ list: [...(form.devices.list || []), newItem] });
  };

  const removeDevice = (id: string) => {
    updateDevices({ list: (form.devices.list || []).filter((d) => d.id !== id) });
  };

  const updateDeviceItem = (id: string, patch: Partial<ICUDeviceItem>) => {
    updateDevices({
      list: (form.devices.list || []).map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  };

  if (viewMode === 'preview') {
    return (
      <TechnicianICUPreviewView
        form={form}
        patientAreaName={patientAreaName}
        onEditSection={openSection}
        onBackToForm={() => setViewMode('form')}
        onRestart={handleResetForm}
        onBackToDashboard={onBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Voltar às áreas"
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
            onClick={handleFillSample}
            className="px-3 py-1.5 text-xs font-medium text-cyan-800 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
          >
            Exemplo Prático UTI
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <ClinicalProgressBar
        sections={sectionsForProgress}
        alerts={consistencyAlerts.map((a) => ({
          code: a.ruleId || a.id,
          message: a.message,
          sectionIndex: a.sectionIndex ?? 0,
          sectionTitle: a.sectionTitle ?? a.title ?? 'Geral',
          isBlocking: a.severity === 'critical',
        }))}
        onOpenSection={openSection}
        onOpenSummary={() => setViewMode('preview')}
      />

      {/* Consistency Warnings Bar */}
      {consistencyAlerts.length > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Avisos de Consistência Clínica ({consistencyAlerts.length}): </span>
            <span>{consistencyAlerts.map((a) => a.title).join(' • ')}</span>
          </div>
        </div>
      )}

      {/* Sections Accordion */}
      <div className="space-y-3">
        {/* SEÇÃO 0: Contexto e Identificação */}
        <ClinicalSection
          id="section-0"
          title="1. Contexto e Identificação"
          subtitle="Momento do registro, identificação do leito/pulseira, acompanhamento e precauções"
          status={sectionStatuses[0]}
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Momento do Registro"
              options={['Recebo paciente', 'Avalio paciente', 'Em atendimento', 'Transfiro cuidado']}
              value={form.context.moment}
              onChange={(val) => updateContext({ moment: val })}
            />

            <ClinicalOptionGroup
              label="Acompanhamento no Leito"
              options={['Desacompanhado', 'Familiar presente', 'Acompanhante autorizado', 'Outro']}
              value={form.context.accompaniment}
              onChange={(val) => updateContext({ accompaniment: val })}
            />
            {form.context.accompaniment === 'Outro' && (
              <ClinicalTextInput
                label="Especificar acompanhante"
                value={form.context.accompanimentCustom || ''}
                onChange={(val) => updateContext({ accompanimentCustom: val })}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Pulseira de Identificação Conferida?"
                options={['Sim', 'Não', 'Não aplicável']}
                value={form.context.wristbandChecked}
                onChange={(val) => updateContext({ wristbandChecked: val as any })}
              />
              <ClinicalOptionGroup
                label="Placa de Identificação do Leito Conferida?"
                options={['Sim', 'Não', 'Não aplicável']}
                value={form.context.bedSignChecked}
                onChange={(val) => updateContext({ bedSignChecked: val as any })}
              />
            </div>

            <ClinicalOptionGroup
              label="Alergias Referidas?"
              options={['Não referidas', 'Sim', 'Não informado']}
              value={form.context.allergies}
              onChange={(val) => updateContext({ allergies: val })}
            />
            {form.context.allergies === 'Sim' && (
              <ClinicalTextInput
                label="Especificar alergias conhecidas"
                value={form.context.allergiesDetails || ''}
                onChange={(val) => updateContext({ allergiesDetails: val })}
                placeholder="Ex: Dipirona, Penicilina, Látex"
              />
            )}

            <ClinicalOptionGroup
              label="Tipo de Precaução"
              options={['Padrão', 'Contato', 'Gotículas', 'Aerossóis', 'Reversa / Protetora', 'Outra']}
              value={form.context.precaution}
              onChange={(val) => updateContext({ precaution: val })}
            />
            {form.context.precaution === 'Outra' && (
              <ClinicalTextInput
                label="Especificar precaução"
                value={form.context.precautionCustom || ''}
                onChange={(val) => updateContext({ precautionCustom: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 1: Condição Observada, Comportamento e Queixas */}
        <ClinicalSection
          id="section-1"
          title="2. Condição Observada, Comportamento e Queixas"
          subtitle="Apresentação inicial do paciente no leito, atitude e sintomas verbalizados"
          status={sectionStatuses[1]}
          isOpen={activeSection === 1}
          onToggle={() => toggleSection(1)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Comportamento Observado"
              options={['Calmo', 'Cooperativo', 'Sonolento', 'Sedado', 'Agitado', 'Confuso', 'Outro']}
              selectedValues={form.observedCondition.behavior}
              onChange={(vals) => updateCondition({ behavior: vals })}
            />
            {form.observedCondition.behavior?.includes('Outro') && (
              <ClinicalTextInput
                label="Especificar outro comportamento"
                value={form.observedCondition.behaviorCustom || ''}
                onChange={(val) => updateCondition({ behaviorCustom: val })}
              />
            )}

            <ClinicalOptionGroup
              label="Queixas Referidas"
              options={['Sem queixas referidas', 'Com queixa', 'Impossibilitado de informar', 'Não avaliado']}
              value={form.observedCondition.complaints}
              onChange={(val) => updateCondition({ complaints: val })}
            />
            {form.observedCondition.complaints === 'Com queixa' && (
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Descrição da queixa"
                  value={form.observedCondition.complaintsDetails || ''}
                  onChange={(val) => updateCondition({ complaintsDetails: val })}
                  placeholder="Ex: desconforto precordial, náusea"
                />
                <ClinicalOptionGroup
                  label="Fonte da Informação"
                  options={['Paciente', 'Acompanhante', 'Equipe']}
                  value={form.observedCondition.informationSource}
                  onChange={(val) => updateCondition({ informationSource: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 2: Sinais Vitais, PAM e Dor */}
        <ClinicalSection
          id="section-2"
          title="3. Sinais Vitais, PAM e Avaliação da Dor"
          subtitle="Hemodinâmica de base com campo de PAM manual e escalas de dor"
          status={sectionStatuses[2]}
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
        >
          <div className="space-y-4">
            <VitalSignsInputs
              values={form.vitalSignsAndPain}
              onChange={(patch) => updateVitals(patch)}
              showBloodGlucose={true}
            />

            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Avaliação de Dor
              </h4>
              <ClinicalOptionGroup
                label="Tipo de Avaliação"
                options={['Sem dor', 'Escala numérica 0–10', 'Não avaliável', 'Outra escala']}
                value={form.vitalSignsAndPain.painAssessmentType}
                onChange={(val) => updateVitals({ painAssessmentType: val })}
              />

              {form.vitalSignsAndPain.painAssessmentType === 'Escala numérica 0–10' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <ClinicalNumericInput
                    label="Intensidade (0 a 10)"
                    value={form.vitalSignsAndPain.painNumericScaleValue !== undefined ? String(form.vitalSignsAndPain.painNumericScaleValue) : ''}
                    onChange={(val) => updateVitals({ painNumericScaleValue: val ? Number(val) : undefined })}
                    min={0}
                    max={10}
                  />
                  <ClinicalTextInput
                    label="Localização da dor"
                    value={form.vitalSignsAndPain.painLocation || ''}
                    onChange={(val) => updateVitals({ painLocation: val })}
                    placeholder="Ex: incisão cirúrgica, abdome"
                  />
                  <ClinicalTextInput
                    label="Características"
                    value={form.vitalSignsAndPain.painCharacteristics || ''}
                    onChange={(val) => updateVitals({ painCharacteristics: val })}
                    placeholder="Ex: em queimação, contínua"
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 3: Neurológico e Sedação */}
        <ClinicalSection
          id="section-3"
          title="4. Neurológico, Glasgow e Escala RASS"
          subtitle="Nível de consciência, escalas de sedação/coma e avaliação pupilar"
          status={sectionStatuses[3]}
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Nível de Consciência"
              options={['Consciente', 'Sonolento', 'Torporoso', 'Comatoso', 'Sedado', 'Outro']}
              value={form.neurologicalAndSedation.consciousnessLevel}
              onChange={(val) => updateNeuro({ consciousnessLevel: val })}
            />
            {form.neurologicalAndSedation.consciousnessLevel === 'Outro' && (
              <ClinicalTextInput
                label="Especificar nível de consciência"
                value={form.neurologicalAndSedation.consciousnessCustom || ''}
                onChange={(val) => updateNeuro({ consciousnessCustom: val })}
              />
            )}

            <ClinicalOptionGroup
              label="Orientação"
              options={['Orientado', 'Desorientado', 'Confuso', 'Não avaliável']}
              value={form.neurologicalAndSedation.orientation}
              onChange={(val) => updateNeuro({ orientation: val })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalNumericInput
                label="Escala de Glasgow"
                sublabel="(3 a 15)"
                value={form.neurologicalAndSedation.glasgowScore !== undefined ? String(form.neurologicalAndSedation.glasgowScore) : ''}
                onChange={(val) => updateNeuro({ glasgowScore: val ? Number(val) : undefined })}
                min={3}
                max={15}
                placeholder="Ex: 15"
              />

              <ClinicalNumericInput
                label="Escala RASS"
                sublabel="(-5 a +4)"
                value={form.neurologicalAndSedation.rassScore !== undefined ? String(form.neurologicalAndSedation.rassScore) : ''}
                onChange={(val) => updateNeuro({ rassScore: val !== '' ? Number(val) : undefined })}
                min={-5}
                max={4}
                placeholder="Ex: -3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Pupilas"
                options={['Isocóricas', 'Anisocóricas', 'Midriáticas', 'Mióticas', 'Não avaliadas']}
                value={form.neurologicalAndSedation.pupils}
                onChange={(val) => updateNeuro({ pupils: val })}
              />
              <ClinicalOptionGroup
                label="Fotorreação"
                options={['Fotorreagentes', 'Reagentes à luz', 'Preguiçosas', 'Não reagentes', 'Não avaliada']}
                value={form.neurologicalAndSedation.photoreaction}
                onChange={(val) => updateNeuro({ photoreaction: val })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 4: Suporte Respiratório e Ventilação Mecânica */}
        <ClinicalSection
          id="section-4"
          title="5. Suporte Respiratório e Ventilação Mecânica"
          subtitle="Ar ambiente, oxigenoterapia, VMI com parâmetros completos e via aérea artificial"
          status={sectionStatuses[4]}
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Suporte Respiratório"
              options={[
                'Ar ambiente',
                'Oxigenoterapia',
                'VNI',
                'Ventilação mecânica invasiva',
                'Traqueostomia sem ventilação mecânica',
              ]}
              value={form.respiratoryAndVentilation.respiratorySupport}
              onChange={(val) => updateResp({ respiratorySupport: val })}
            />

            {/* Sub-form Oxigenoterapia */}
            {form.respiratoryAndVentilation.respiratorySupport === 'Oxigenoterapia' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalOptionGroup
                  label="Dispositivo de Oxigênio"
                  options={['Cateter nasal', 'Máscara de Venturi', 'Máscara com reservatório', 'Cânula nasal']}
                  value={form.respiratoryAndVentilation.oxygenDevice}
                  onChange={(val) => updateResp({ oxygenDevice: val })}
                />
                <ClinicalNumericInput
                  label="Fluxo (L/min)"
                  value={form.respiratoryAndVentilation.oxygenFlowRate || ''}
                  onChange={(val) => updateResp({ oxygenFlowRate: val })}
                  unit="L/min"
                  placeholder="Ex: 3"
                />
                <ClinicalNumericInput
                  label="FiO₂ (%)"
                  value={form.respiratoryAndVentilation.oxygenFiO2 || ''}
                  onChange={(val) => updateResp({ oxygenFiO2: val })}
                  unit="%"
                  placeholder="Ex: 35"
                />
              </div>
            )}

            {/* Sub-form Ventilação Mecânica Invasiva */}
            {form.respiratoryAndVentilation.respiratorySupport === 'Ventilação mecânica invasiva' && (
              <div className="space-y-3 p-4 bg-rose-50/50 rounded-xl border border-rose-200">
                <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Parâmetros do Ventilador Mecânico
                </h5>

                <ClinicalOptionGroup
                  label="Via Aérea Artificial"
                  options={['TOT', 'TQT']}
                  value={form.respiratoryAndVentilation.mechanicalVentilationAirway}
                  onChange={(val) => updateResp({ mechanicalVentilationAirway: val as any })}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <ClinicalOptionGroup
                    label="Modo Ventilatório"
                    options={['VCV', 'PCV', 'PSV', 'SIMV', 'Outro']}
                    value={form.respiratoryAndVentilation.ventilationMode}
                    onChange={(val) => updateResp({ ventilationMode: val })}
                  />
                  <ClinicalNumericInput
                    label="FiO₂"
                    value={form.respiratoryAndVentilation.ventilationFiO2 || ''}
                    onChange={(val) => updateResp({ ventilationFiO2: val })}
                    unit="%"
                    placeholder="Ex: 40"
                  />
                  <ClinicalNumericInput
                    label="PEEP"
                    value={form.respiratoryAndVentilation.ventilationPeep || ''}
                    onChange={(val) => updateResp({ ventilationPeep: val })}
                    unit="cmH₂O"
                    placeholder="Ex: 6"
                  />
                  <ClinicalNumericInput
                    label="FR Programada"
                    value={form.respiratoryAndVentilation.ventilationRate || ''}
                    onChange={(val) => updateResp({ ventilationRate: val })}
                    unit="irpm"
                    placeholder="Ex: 16"
                  />
                  <ClinicalNumericInput
                    label="Volume Corrente (VC)"
                    value={form.respiratoryAndVentilation.ventilationTidalVolume || ''}
                    onChange={(val) => updateResp({ ventilationTidalVolume: val })}
                    unit="mL"
                    placeholder="Ex: 420"
                  />
                  <ClinicalNumericInput
                    label="Pressão de Suporte (PS)"
                    value={form.respiratoryAndVentilation.ventilationSupportPressure || ''}
                    onChange={(val) => updateResp({ ventilationSupportPressure: val })}
                    unit="cmH₂O"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
            )}

            {/* Via aérea artificial: TOT / TQT */}
            {(form.respiratoryAndVentilation.mechanicalVentilationAirway === 'TOT' ||
              form.respiratoryAndVentilation.respiratorySupport === 'Traqueostomia sem ventilação mecânica' ||
              form.respiratoryAndVentilation.mechanicalVentilationAirway === 'TQT') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Calibre da Cânula/Tubo"
                  value={form.respiratoryAndVentilation.totNumber || form.respiratoryAndVentilation.tracheostomyCaliber || ''}
                  onChange={(val) =>
                    form.respiratoryAndVentilation.mechanicalVentilationAirway === 'TQT'
                      ? updateResp({ tracheostomyCaliber: val })
                      : updateResp({ totNumber: val })
                  }
                  placeholder="Ex: 7.5 ou 8.0"
                />
                <ClinicalTextInput
                  label="Fixação"
                  value={form.respiratoryAndVentilation.totFixation || form.respiratoryAndVentilation.tracheostomyFixation || ''}
                  onChange={(val) => updateResp({ totFixation: val, tracheostomyFixation: val })}
                  placeholder="Ex: cadarço íntegro"
                />
                <ClinicalTextInput
                  label="Marcação Comissura Labial (TOT)"
                  value={form.respiratoryAndVentilation.totPositionMarking || ''}
                  onChange={(val) => updateResp({ totPositionMarking: val })}
                  placeholder="Ex: 22 cm"
                />
              </div>
            )}

            {/* Padrão Respiratório & Secreções */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Padrão Respiratório"
                options={['Eupneico', 'Taquipneico', 'Bradipneico', 'Superficial', 'Profundo', 'Não avaliado']}
                value={form.respiratoryAndVentilation.respiratoryPattern}
                onChange={(val) => updateResp({ respiratoryPattern: val })}
              />
              <ClinicalOptionGroup
                label="Sinais de Desconforto Respiratório"
                options={['Ausente', 'Presente', 'Não avaliado']}
                value={form.respiratoryAndVentilation.respiratoryDistress}
                onChange={(val) => updateResp({ respiratoryDistress: val })}
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Presença de Secreção em Vias Aéreas"
                options={['Ausente', 'Presente', 'Não avaliada']}
                value={form.respiratoryAndVentilation.secretionsPresence}
                onChange={(val) => updateResp({ secretionsPresence: val })}
              />
              {form.respiratoryAndVentilation.secretionsPresence === 'Presente' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <ClinicalTextInput
                    label="Quantidade"
                    value={form.respiratoryAndVentilation.secretionsQuantity || ''}
                    onChange={(val) => updateResp({ secretionsQuantity: val })}
                    placeholder="Ex: moderada"
                  />
                  <ClinicalTextInput
                    label="Coloração"
                    value={form.respiratoryAndVentilation.secretionsColor || ''}
                    onChange={(val) => updateResp({ secretionsColor: val })}
                    placeholder="Ex: esbranquiçada, amarelada"
                  />
                  <ClinicalTextInput
                    label="Aspecto"
                    value={form.respiratoryAndVentilation.secretionsAspect || ''}
                    onChange={(val) => updateResp({ secretionsAspect: val })}
                    placeholder="Ex: fluida, espessa"
                  />
                  <ClinicalTextInput
                    label="Odor"
                    value={form.respiratoryAndVentilation.secretionsOdor || ''}
                    onChange={(val) => updateResp({ secretionsOdor: val })}
                    placeholder="Ex: inodoro"
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 5: Cardiovascular, Perfusão e Monitorização Invasiva */}
        <ClinicalSection
          id="section-5"
          title="6. Cardiovascular, Perfusão e Monitorização Invasiva"
          subtitle="Perfusão periférica, TEC, edema e valores de PAI / PVC"
          status={sectionStatuses[5]}
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Perfusão Periférica"
                options={['Adequada', 'Diminuída', 'Prejudicada', 'Não avaliada']}
                value={form.cardiovascularAndPerfusion.peripheralPerfusion}
                onChange={(val) => updateCardio({ peripheralPerfusion: val })}
              />
              <ClinicalOptionGroup
                label="Tempo de Enchimento Capilar (TEC)"
                options={['< 2 segundos', '>= 3 segundos', 'Informar valor', 'Não avaliado']}
                value={form.cardiovascularAndPerfusion.capillaryRefillTime}
                onChange={(val) => updateCardio({ capillaryRefillTime: val })}
              />
            </div>

            {form.cardiovascularAndPerfusion.capillaryRefillTime === 'Informar valor' && (
              <ClinicalNumericInput
                label="Valor do TEC (segundos)"
                value={form.cardiovascularAndPerfusion.capillaryRefillTimeValue || ''}
                onChange={(val) => updateCardio({ capillaryRefillTimeValue: val })}
                unit="s"
              />
            )}

            <ClinicalOptionGroup
              label="Edema"
              options={['Ausente', 'Presente', 'Não avaliado']}
              value={form.cardiovascularAndPerfusion.edema}
              onChange={(val) => updateCardio({ edema: val })}
            />
            {form.cardiovascularAndPerfusion.edema === 'Presente' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalMultiSelect
                  label="Localização do Edema"
                  options={['Membros inferiores', 'Membros superiores', 'Anasarca', 'Sacral', 'Periorbital']}
                  selectedValues={form.cardiovascularAndPerfusion.edemaLocations}
                  onChange={(vals) => updateCardio({ edemaLocations: vals })}
                />
                <ClinicalOptionGroup
                  label="Graduação"
                  options={['+1/4+', '+2/4+', '+3/4+', '+4/4+', 'Não graduado']}
                  value={form.cardiovascularAndPerfusion.edemaGrading}
                  onChange={(val) => updateCardio({ edemaGrading: val })}
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Monitorização Hemodinâmica Invasiva (PAI / PVC)?"
                options={['Não', 'Sim']}
                value={form.cardiovascularAndPerfusion.hasInvasiveMonitoring}
                onChange={(val) => updateCardio({ hasInvasiveMonitoring: val as any })}
              />
              {form.cardiovascularAndPerfusion.hasInvasiveMonitoring === 'Sim' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3.5 bg-rose-50/40 rounded-xl border border-rose-200">
                  <ClinicalTextInput
                    label="Valor da PAI (Pressão Arterial Invasiva)"
                    value={form.cardiovascularAndPerfusion.invasiveArterialPressureValue || ''}
                    onChange={(val) => updateCardio({ invasiveArterialPressureValue: val })}
                    placeholder="Ex: 110/65 (80) mmHg"
                  />
                  <ClinicalTextInput
                    label="Valor da PVC (Pressão Venosa Central)"
                    value={form.cardiovascularAndPerfusion.centralVenousPressureValue || ''}
                    onChange={(val) => updateCardio({ centralVenousPressureValue: val })}
                    placeholder="Ex: 8 mmHg ou 10 cmH₂O"
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 6: Drogas Vasoativas */}
        <ClinicalSection
          id="section-6"
          title="7. Drogas Vasoativas em Bomba de Infusão"
          subtitle="Fármacos vasoativos contínuos (Noradrenalina, Vasopressina, Dobutamina, etc.)"
          status={sectionStatuses[6]}
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Drogas Vasoativas em Uso?"
              options={['Não', 'Sim', 'Não avaliado']}
              value={form.vasoactiveDrugs.inUse}
              onChange={(val) => updateDva({ inUse: val })}
            />

            {form.vasoactiveDrugs.inUse === 'Sim' && (
              <div className="space-y-3 p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Fármacos Vasoativos Cadastrados
                  </h5>
                  <button
                    type="button"
                    onClick={addDva}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Droga
                  </button>
                </div>

                {(form.vasoactiveDrugs.drugsList || []).map((dva, idx) => (
                  <div key={dva.id || idx} className="p-3 bg-white rounded-lg border border-rose-200 flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[140px]">
                      <ClinicalTextInput
                        label="Medicamento"
                        value={dva.medication}
                        onChange={(val) => updateDvaItem(dva.id, { medication: val })}
                        placeholder="Ex: Noradrenalina"
                      />
                    </div>
                    <div className="w-24">
                      <ClinicalTextInput
                        label="Vazão/Dose"
                        value={dva.infusionRate}
                        onChange={(val) => updateDvaItem(dva.id, { infusionRate: val })}
                        placeholder="Ex: 12"
                      />
                    </div>
                    <div className="w-28">
                      <ClinicalTextInput
                        label="Unidade"
                        value={dva.unit}
                        onChange={(val) => updateDvaItem(dva.id, { unit: val })}
                        placeholder="Ex: mL/h"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <ClinicalTextInput
                        label="Concentração (opcional)"
                        value={dva.concentration || ''}
                        onChange={(val) => updateDvaItem(dva.id, { concentration: val })}
                        placeholder="Ex: 64 mcg/mL"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDva(dva.id)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 7: Sedação e Analgesia Contínua (Separada de DVA) */}
        <ClinicalSection
          id="section-7"
          title="8. Sedação e Analgesia em Infusão Contínua"
          subtitle="Infusão contínua separada de DVA (Midazolam, Fentanil, Propofol, Dexmedetomidina)"
          status={sectionStatuses[7]}
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Infusão de Sedação ou Analgesia Contínua em Uso?"
              options={['Não', 'Sim', 'Não avaliado']}
              value={form.sedationAndAnalgesia.inUse}
              onChange={(val) => updateSedation({ inUse: val })}
            />

            {form.sedationAndAnalgesia.inUse === 'Sim' && (
              <div className="space-y-3 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Infusões de Sedação / Analgesia
                  </h5>
                  <button
                    type="button"
                    onClick={addSedation}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Fármaco
                  </button>
                </div>

                {(form.sedationAndAnalgesia.infusionsList || []).map((sed, idx) => (
                  <div key={sed.id || idx} className="p-3 bg-white rounded-lg border border-indigo-200 flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[140px]">
                      <ClinicalTextInput
                        label="Fármaco"
                        value={sed.medication}
                        onChange={(val) => updateSedationItem(sed.id, { medication: val })}
                        placeholder="Ex: Fentanil"
                      />
                    </div>
                    <div className="w-24">
                      <ClinicalTextInput
                        label="Vazão/Dose"
                        value={sed.rateOrDose}
                        onChange={(val) => updateSedationItem(sed.id, { rateOrDose: val })}
                        placeholder="Ex: 5"
                      />
                    </div>
                    <div className="w-24">
                      <ClinicalTextInput
                        label="Unidade"
                        value={sed.unit}
                        onChange={(val) => updateSedationItem(sed.id, { unit: val })}
                        placeholder="Ex: mL/h"
                      />
                    </div>
                    <div className="w-32">
                      <ClinicalOptionGroup
                        label="Finalidade"
                        options={['Sedação', 'Analgesia', 'Bloqueio']}
                        value={sed.purpose}
                        onChange={(val) => updateSedationItem(sed.id, { purpose: val as any })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSedation(sed.id)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 8: Nutrição e Gastrointestinal */}
        <ClinicalSection
          id="section-8"
          title="9. Nutrição e Gastrointestinal"
          subtitle="Via alimentar, dieta enteral com velocidade em mL/h, tolerância e exame do abdome"
          status={sectionStatuses[8]}
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Situação Nutricional"
              options={['Via oral', 'Dieta enteral', 'Dieta parenteral', 'Jejum']}
              value={form.nutritionAndGastrointestinal.nutritionalStatus}
              onChange={(val) => updateNut({ nutritionalStatus: val })}
            />

            {form.nutritionAndGastrointestinal.nutritionalStatus === 'Dieta enteral' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalOptionGroup
                  label="Via de Administração"
                  options={['SNE', 'SNG', 'GTT']}
                  value={form.nutritionAndGastrointestinal.enteralRoute}
                  onChange={(val) => updateNut({ enteralRoute: val as any })}
                />
                <ClinicalNumericInput
                  label="Velocidade de Infusão"
                  value={form.nutritionAndGastrointestinal.enteralInfusionRate || ''}
                  onChange={(val) => updateNut({ enteralInfusionRate: val })}
                  unit="mL/h"
                  placeholder="Ex: 60"
                />
                <ClinicalOptionGroup
                  label="Tolerância à Dieta"
                  options={['Boa tolerância', 'Resíduo gástrico aumentado', 'Vômitos', 'Diarreia']}
                  value={form.nutritionAndGastrointestinal.enteralTolerance}
                  onChange={(val) => updateNut({ enteralTolerance: val })}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Inspeção do Abdome"
                options={['Plano', 'Globoso', 'Distendido', 'Escavado', 'Não avaliado']}
                value={form.nutritionAndGastrointestinal.abdomenInspection}
                onChange={(val) => updateNut({ abdomenInspection: val })}
              />
              <ClinicalOptionGroup
                label="Consistência / Palpação"
                options={['Flácido e indolor', 'Tenso', 'Doloroso à palpação', 'Não avaliado']}
                value={form.nutritionAndGastrointestinal.abdomenConsistency}
                onChange={(val) => updateNut({ abdomenConsistency: val })}
              />
              <ClinicalOptionGroup
                label="Ruídos Hidroaéreos (RHA)"
                options={['Presentes', 'Diminuídos', 'Aumentados', 'Ausentes', 'Não avaliados']}
                value={form.nutritionAndGastrointestinal.bowelSounds}
                onChange={(val) => updateNut({ bowelSounds: val })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 9: Eliminações e Balanço Hídrico */}
        <ClinicalSection
          id="section-9"
          title="10. Eliminações e Balanço Hídrico"
          subtitle="Diurese (SVD/espontânea, débito, aspecto), evacuações e balanço do período"
          status={sectionStatuses[9]}
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Diurese"
                options={['Presente', 'Ausente / Anúria', 'Diminuída / Oligúria', 'Não avaliada']}
                value={form.eliminationsAndFluidBalance.diuresis}
                onChange={(val) => updateElim({ diuresis: val })}
              />
              <ClinicalOptionGroup
                label="Via Urinária"
                options={['SVD', 'Espontânea', 'Cistostomia', 'Fralda']}
                value={form.eliminationsAndFluidBalance.urinaryRoute}
                onChange={(val) => updateElim({ urinaryRoute: val })}
              />
            </div>

            {form.eliminationsAndFluidBalance.urinaryRoute === 'SVD' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Calibre SVD (nº)"
                  value={form.eliminationsAndFluidBalance.svdCaliber || ''}
                  onChange={(val) => updateElim({ svdCaliber: val })}
                  placeholder="Ex: 16"
                />
                <ClinicalOptionGroup
                  label="Permeabilidade"
                  options={['Sim', 'Não']}
                  value={form.eliminationsAndFluidBalance.svdPermeable}
                  onChange={(val) => updateElim({ svdPermeable: val as any })}
                />
                <ClinicalTextInput
                  label="Coloração"
                  value={form.eliminationsAndFluidBalance.diuresisColor || ''}
                  onChange={(val) => updateElim({ diuresisColor: val })}
                  placeholder="Ex: amarelo claro"
                />
                <ClinicalNumericInput
                  label="Débito no Período"
                  value={form.eliminationsAndFluidBalance.diuresisVolume || ''}
                  onChange={(val) => updateElim({ diuresisVolume: val })}
                  unit="mL"
                  placeholder="Ex: 500"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Eliminações Intestinais (Evacuação)"
                options={['Ausente', 'Presente', 'Não avaliada']}
                value={form.eliminationsAndFluidBalance.bowelMovement}
                onChange={(val) => updateElim({ bowelMovement: val })}
              />
              {form.eliminationsAndFluidBalance.bowelMovement === 'Presente' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <ClinicalTextInput
                    label="Aspecto / Consistência"
                    value={form.eliminationsAndFluidBalance.bowelAspect || ''}
                    onChange={(val) => updateElim({ bowelAspect: val })}
                    placeholder="Ex: pastosa, líquida"
                  />
                  <ClinicalTextInput
                    label="Quantidade / Frequência"
                    value={form.eliminationsAndFluidBalance.bowelQuantity || ''}
                    onChange={(val) => updateElim({ bowelQuantity: val })}
                    placeholder="Ex: moderada, 1 episódio"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Controle de Balanço Hídrico?"
                options={['Não', 'Sim']}
                value={form.eliminationsAndFluidBalance.hasFluidBalance}
                onChange={(val) => updateElim({ hasFluidBalance: val as any })}
              />
              {form.eliminationsAndFluidBalance.hasFluidBalance === 'Sim' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3.5 bg-cyan-50/50 rounded-xl border border-cyan-200">
                  <ClinicalNumericInput
                    label="Entradas Totais"
                    value={form.eliminationsAndFluidBalance.fluidIntake || ''}
                    onChange={(val) => updateElim({ fluidIntake: val })}
                    unit="mL"
                    placeholder="Ex: 1400"
                  />
                  <ClinicalNumericInput
                    label="Saídas Totais"
                    value={form.eliminationsAndFluidBalance.fluidOutput || ''}
                    onChange={(val) => updateElim({ fluidOutput: val })}
                    unit="mL"
                    placeholder="Ex: 1100"
                  />
                  <ClinicalTextInput
                    label="Balanço Acumulado (informado)"
                    value={form.eliminationsAndFluidBalance.fluidBalanceResult || ''}
                    onChange={(val) => updateElim({ fluidBalanceResult: val })}
                    placeholder="Ex: +300 mL"
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 10: Dispositivos Invasivos e Drenos */}
        <ClinicalSection
          id="section-10"
          title="11. Dispositivos Invasivos e Drenos"
          subtitle="AVP, CVC, PICC, PAI, CDL, SVD, SNE e Drenos cirúrgicos com débito e aspecto"
          status={sectionStatuses[10]}
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Dispositivos e Drenos em Manutenção ({(form.devices.list || []).length})
              </span>
              <button
                type="button"
                onClick={addDevice}
                className="px-2.5 py-1 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Dispositivo / Dreno
              </button>
            </div>

            {(form.devices.list || []).map((dev, idx) => (
              <div key={dev.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Dispositivo #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDevice(dev.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <ClinicalOptionGroup
                    label="Tipo de Dispositivo"
                    options={['AVP', 'CVC', 'PICC', 'PAI', 'CDL', 'Dreno', 'Outro']}
                    value={dev.type}
                    onChange={(val) => updateDeviceItem(dev.id, { type: val })}
                  />
                  <ClinicalTextInput
                    label="Sítio / Localização"
                    value={dev.location}
                    onChange={(val) => updateDeviceItem(dev.id, { location: val })}
                    placeholder="Ex: subclávia D, MSE"
                  />
                  <ClinicalOptionGroup
                    label="Permeabilidade"
                    options={['Pérvio', 'Não pérvio', 'Não avaliado']}
                    value={dev.permeability}
                    onChange={(val) => updateDeviceItem(dev.id, { permeability: val })}
                  />
                </div>

                {dev.type === 'Dreno' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <ClinicalTextInput
                      label="Tipo do Dreno"
                      value={dev.drainType || ''}
                      onChange={(val) => updateDeviceItem(dev.id, { drainType: val })}
                      placeholder="Ex: Portovac, Blake, Tórax"
                    />
                    <ClinicalNumericInput
                      label="Débito no Período"
                      value={dev.drainOutputVolume || ''}
                      onChange={(val) => updateDeviceItem(dev.id, { drainOutputVolume: val })}
                      unit="mL"
                      placeholder="Ex: 80"
                    />
                    <ClinicalTextInput
                      label="Aspecto da Secreção"
                      value={dev.drainContentAspect || ''}
                      onChange={(val) => updateDeviceItem(dev.id, { drainContentAspect: val })}
                      placeholder="Ex: seroso, serossanguinolento"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 11: Pele e Integridade Cutânea */}
        <ClinicalSection
          id="section-11"
          title="12. Pele e Integridade Cutânea"
          subtitle="Integridade da pele, hidratação, lesões por pressão e curativos mantidos"
          status={sectionStatuses[11]}
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Integridade Cutânea"
              options={['Íntegra', 'Com alteração/lesão', 'Não avaliada']}
              value={form.skinAndIntegrity.integrity}
              onChange={(val) => updateSkin({ integrity: val })}
            />

            {form.skinAndIntegrity.integrity === 'Com alteração/lesão' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Localização da Lesão"
                  value={form.skinAndIntegrity.lesionLocation || ''}
                  onChange={(val) => updateSkin({ lesionLocation: val })}
                  placeholder="Ex: região sacral, calcâneo D"
                />
                <ClinicalTextInput
                  label="Descrição / Estágio"
                  value={form.skinAndIntegrity.lesionDescription || ''}
                  onChange={(val) => updateSkin({ lesionDescription: val })}
                  placeholder="Ex: LPP estágio 2, hiperemia"
                />
                <ClinicalOptionGroup
                  label="Curativo Presente?"
                  options={['Sim', 'Não']}
                  value={form.skinAndIntegrity.lesionDressingPresent}
                  onChange={(val) => updateSkin({ lesionDressingPresent: val as any })}
                />
                <ClinicalTextInput
                  label="Cuidados com Curativo Executados"
                  value={form.skinAndIntegrity.lesionCareDone || ''}
                  onChange={(val) => updateSkin({ lesionCareDone: val })}
                  placeholder="Ex: troca de cobertura estéril"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 12: Mobilidade, Posicionamento e Segurança */}
        <ClinicalSection
          id="section-12"
          title="13. Mobilidade, Posicionamento e Segurança"
          subtitle="Mudança de decúbito, elevação de cabeceira em graus e grades no leito"
          status={sectionStatuses[12]}
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Mobilidade no Leito"
              options={['Restrito ao leito', 'Movimenta-se no leito', 'Sentado em poltrona', 'Deambula', 'Outro']}
              value={form.mobilityAndPositioning.mobility}
              onChange={(val) => updateMobility({ mobility: val })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Mudança de Decúbito Realizada no Período?"
                options={['Sim', 'Não', 'Não aplicável']}
                value={form.mobilityAndPositioning.decubitusChangeDone}
                onChange={(val) => updateMobility({ decubitusChangeDone: val as any })}
              />
              <ClinicalOptionGroup
                label="Grades de Proteção do Leito"
                options={['Elevadas', 'Rebaixadas', 'Não informado']}
                value={form.mobilityAndPositioning.sideRails}
                onChange={(val) => updateMobility({ sideRails: val })}
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Cabeceira Elevada?"
                options={['Sim', 'Não', 'Não informado']}
                value={form.mobilityAndPositioning.bedHeadElevated}
                onChange={(val) => updateMobility({ bedHeadElevated: val as any })}
              />
              {form.mobilityAndPositioning.bedHeadElevated === 'Sim' && (
                <div className="mt-3">
                  <ClinicalOptionGroup
                    label="Ângulo de Elevação da Cabeceira"
                    options={['30°', '45°', '15°', '0° (horizontal)', 'Outro']}
                    value={form.mobilityAndPositioning.bedHeadAngle}
                    onChange={(val) => updateMobility({ bedHeadAngle: val })}
                  />
                  {form.mobilityAndPositioning.bedHeadAngle === 'Outro' && (
                    <div className="mt-2">
                      <ClinicalTextInput
                        label="Especificar ângulo"
                        value={form.mobilityAndPositioning.bedHeadAngleCustom || ''}
                        onChange={(val) => updateMobility({ bedHeadAngleCustom: val })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 13: Higiene e Banho */}
        <ClinicalSection
          id="section-13"
          title="14. Higiene e Banho"
          subtitle="Higiene corporal, banho no leito e tolerância do paciente"
          status={sectionStatuses[13]}
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Tipo de Banho Realizado"
              options={['Banho no leito', 'Banho de aspersão', 'Não realizado', 'Outro']}
              value={form.hygieneAndBath.bathType}
              onChange={(val) => updateHygiene({ bathType: val })}
            />

            {form.hygieneAndBath.bathType && form.hygieneAndBath.bathType !== 'Não realizado' && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <ClinicalOptionGroup
                  label="Tolerância ao Banho"
                  options={['Boa tolerância', 'Alteração/intercorrência', 'Não informado']}
                  value={form.hygieneAndBath.bathTolerance}
                  onChange={(val) => updateHygiene({ bathTolerance: val })}
                />
                {form.hygieneAndBath.bathTolerance === 'Alteração/intercorrência' && (
                  <ClinicalTextInput
                    label="Detalhes da alteração durante o banho"
                    value={form.hygieneAndBath.bathToleranceDetails || ''}
                    onChange={(val) => updateHygiene({ bathToleranceDetails: val })}
                    placeholder="Ex: dessaturação transitória, hipotensão"
                  />
                )}
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 14: Cuidados Realizados */}
        <ClinicalSection
          id="section-14"
          title="15. Cuidados Realizados"
          subtitle="Checklist de intervenções de enfermagem executadas no período"
          status={sectionStatuses[14]}
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Intervenções Executadas no Período"
              options={[
                'Monitorização de sinais vitais contínua',
                'Higiene oral com clorexidina',
                'Aspiração de vias aéreas',
                'Troca de fixação de TOT/TQT',
                'Administração de medicações prescritas',
                'Troca de curativo de dispositivo invasivo',
                'Coleta de exames laboratoriais',
                'Manutenção de balanço hídrico',
              ]}
              selectedValues={form.nursingCareDone.careItems}
              onChange={(vals) => updateCare({ careItems: vals })}
            />
            <ClinicalTextInput
              label="Outros cuidados executados"
              value={form.nursingCareDone.otherCareDescription || ''}
              onChange={(val) => updateCare({ otherCareDescription: val })}
              placeholder="Ex: instalação de nova bolsa de infusão"
            />
          </div>
        </ClinicalSection>

        {/* SEÇÃO 15: Intercorrências e Comunicação */}
        <ClinicalSection
          id="section-15"
          title="16. Intercorrências e Comunicação"
          subtitle="Registro de eventos não previstos, condutas imediatas e contato com equipe"
          status={sectionStatuses[15]}
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Intercorrência no Período?"
              options={['Não', 'Sim', 'Não informado']}
              value={form.complicationsAndCommunication.hasComplication}
              onChange={(val) => updateComplications({ hasComplication: val })}
            />

            {form.complicationsAndCommunication.hasComplication === 'Sim' && (
              <div className="space-y-3 p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Horário do Evento"
                    value={form.complicationsAndCommunication.complicationTime || ''}
                    onChange={(val) => updateComplications({ complicationTime: val })}
                    placeholder="Ex: 14:30"
                  />
                  <ClinicalTextInput
                    label="Descrição da Intercorrência"
                    value={form.complicationsAndCommunication.complicationDescription || ''}
                    onChange={(val) => updateComplications({ complicationDescription: val })}
                    placeholder="Ex: pico hipertensivo, extubação acidental"
                  />
                </div>
                <ClinicalTextInput
                  label="Condutas Tomadas Imediatas"
                  value={form.complicationsAndCommunication.nursingActionsTaken || ''}
                  onChange={(val) => updateComplications({ nursingActionsTaken: val })}
                  placeholder="Ex: comunicado plantonista, ajustada sedação"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Comunicação com a Equipe"
                options={['Enfermeiro de plantão', 'Médico plantonista', 'Fisioterapeuta', 'Não realizada', 'Outro profissional']}
                value={form.complicationsAndCommunication.communicatedTo}
                onChange={(val) => updateComplications({ communicatedTo: val })}
              />
              <ClinicalTextInput
                label="Horário da Comunicação"
                value={form.complicationsAndCommunication.communicationTime || ''}
                onChange={(val) => updateComplications({ communicationTime: val })}
                placeholder="Ex: 14:35"
              />
            </div>
          </div>
        </ClinicalSection>

        {/* SEÇÃO 16: Alterações Observadas no Período */}
        <ClinicalSection
          id="section-16"
          title="17. Alterações Observadas no Período"
          subtitle="Comparações objetivas em relação ao período anterior (sem inferir melhora/piora)"
          status={sectionStatuses[16]}
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Comparação com Registro Anterior"
              options={['Sem alterações observadas', 'Houve alteração observada', 'Sem comparação disponível']}
              value={form.observedChangesInPeriod.comparisonStatus}
              onChange={(val) => updateChanges({ comparisonStatus: val })}
            />
            {form.observedChangesInPeriod.comparisonStatus === 'Houve alteração observada' && (
              <ClinicalTextInput
                label="Descrição objetiva da alteração"
                value={form.observedChangesInPeriod.changeDescription || ''}
                onChange={(val) => updateChanges({ changeDescription: val })}
                placeholder="Ex: aumento do débito urinário nas últimas 2 horas"
              />
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 17: Situação Final */}
        <ClinicalSection
          id="section-17"
          title="18. Situação Final"
          subtitle="Condição ao término do plantão ou encaminhamento"
          status={sectionStatuses[17]}
          isOpen={activeSection === 17}
          onToggle={() => toggleSection(17)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Condição Final"
              options={[
                'Permanece em leito de UTI sob cuidados intensivos de enfermagem',
                'Transferido para enfermaria',
                'Transferido para centro cirúrgico',
                'Outra',
              ]}
              value={form.finalStatus.condition}
              onChange={(val) => updateFinal({ condition: val })}
            />
            {form.finalStatus.condition === 'Outra' && (
              <ClinicalTextInput
                label="Especificar situação final"
                value={form.finalStatus.conditionCustom || ''}
                onChange={(val) => updateFinal({ conditionCustom: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* SEÇÃO 18: Informações Adicionais */}
        <ClinicalSection
          id="section-18"
          title="19. Informações Adicionais"
          subtitle="Observações livres relevantes"
          status={sectionStatuses[18]}
          isOpen={activeSection === 18}
          onToggle={() => toggleSection(18)}
        >
          <div className="space-y-4">
            <ClinicalTextarea
              label="Observações Adicionais"
              value={form.additionalInfo.observations || ''}
              onChange={(val) => updateAdditional({ observations: val })}
              placeholder="Descreva detalhes adicionais observados durante o período..."
            />
          </div>
        </ClinicalSection>
      </div>

      {/* Floating Bottom Bar / Generate Note button */}
      <div className="sticky bottom-4 z-20 pt-4">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Sparkles className="w-4 h-4 text-cyan-700" />
            <span>
              Preenchimento pronto para geração determinística da anotação de UTI e verificação por Locks.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Anotação de Enfermagem UTI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
