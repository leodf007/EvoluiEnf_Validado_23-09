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
  NurseICUEvolutionForm,
  createInitialNurseICUEvolutionForm,
} from '../../../types/nurseICUEvolution';
import {
  normalizeNurseICUEvolutionForm,
  validateNurseICUConsistency,
  NurseICUConsistencyAlert,
} from '../../../engine/nurseICUClinicalFactBuilder';
import { NurseICUEvolutionPreviewView } from './NurseICUEvolutionPreviewView';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface NurseICUEvolutionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const NurseICUEvolutionFormScreen: React.FC<NurseICUEvolutionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Evolução de Enfermagem — UTI" onNavigateHome={props.onBack}>
      <NurseICUEvolutionFormContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const NurseICUEvolutionFormContent: React.FC<NurseICUEvolutionFormScreenProps> = ({
  onBack,
  patientAreaName = 'UTI',
}) => {
  const [form, setForm] = useState<NurseICUEvolutionForm>(() => createInitialNurseICUEvolutionForm());
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  const normalizedForm = useMemo(() => normalizeNurseICUEvolutionForm(form), [form]);
  const consistencyAlerts: NurseICUConsistencyAlert[] = useMemo(
    () => validateNurseICUConsistency(normalizedForm),
    [normalizedForm]
  );

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? null : idx));
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja limpar todos os campos da evolução de enfermagem de UTI?')) {
      setForm(createInitialNurseICUEvolutionForm());
      setActiveSection(0);
    }
  };

  // Updaters for each section
  const updateContext = (patch: Partial<NurseICUEvolutionForm['context']>) => {
    setForm((p) => ({ ...p, context: { ...p.context, ...patch } }));
  };

  const updateGeneral = (patch: Partial<NurseICUEvolutionForm['generalAssessment']>) => {
    setForm((p) => ({ ...p, generalAssessment: { ...p.generalAssessment, ...patch } }));
  };

  const updateVitals = (patch: Partial<NurseICUEvolutionForm['vitalSigns']>) => {
    setForm((p) => ({ ...p, vitalSigns: { ...p.vitalSigns, ...patch } }));
  };

  const updatePain = (patch: Partial<NurseICUEvolutionForm['pain']>) => {
    setForm((p) => ({ ...p, pain: { ...p.pain, ...patch } }));
  };

  const updateNeurological = (patch: Partial<NurseICUEvolutionForm['neurological']>) => {
    setForm((p) => ({ ...p, neurological: { ...p.neurological, ...patch } }));
  };

  const updateSedationAssessment = (patch: Partial<NurseICUEvolutionForm['sedationAssessment']>) => {
    setForm((p) => ({ ...p, sedationAssessment: { ...p.sedationAssessment, ...patch } }));
  };

  const updateRespiratory = (patch: Partial<NurseICUEvolutionForm['respiratory']>) => {
    setForm((p) => ({ ...p, respiratory: { ...p.respiratory, ...patch } }));
  };

  const updateMV = (patch: Partial<NurseICUEvolutionForm['mechanicalVentilation']>) => {
    setForm((p) => ({ ...p, mechanicalVentilation: { ...p.mechanicalVentilation, ...patch } }));
  };

  const updateCardiovascular = (patch: Partial<NurseICUEvolutionForm['cardiovascular']>) => {
    setForm((p) => ({ ...p, cardiovascular: { ...p.cardiovascular, ...patch } }));
  };

  const updateVasoactive = (patch: Partial<NurseICUEvolutionForm['vasoactiveDrugs']>) => {
    setForm((p) => ({ ...p, vasoactiveDrugs: { ...p.vasoactiveDrugs, ...patch } }));
  };

  const updateSedationAnalgesiaInfusions = (patch: Partial<NurseICUEvolutionForm['sedationAnalgesiaInfusions']>) => {
    setForm((p) => ({ ...p, sedationAnalgesiaInfusions: { ...p.sedationAnalgesiaInfusions, ...patch } }));
  };

  const updateGI = (patch: Partial<NurseICUEvolutionForm['gastrointestinalAndNutrition']>) => {
    setForm((p) => ({ ...p, gastrointestinalAndNutrition: { ...p.gastrointestinalAndNutrition, ...patch } }));
  };

  const updateEliminations = (patch: Partial<NurseICUEvolutionForm['eliminations']>) => {
    setForm((p) => ({ ...p, eliminations: { ...p.eliminations, ...patch } }));
  };

  const updateWaterBalance = (patch: Partial<NurseICUEvolutionForm['waterBalance']>) => {
    setForm((p) => ({ ...p, waterBalance: { ...p.waterBalance, ...patch } }));
  };

  const updateSkin = (patch: Partial<NurseICUEvolutionForm['skin']>) => {
    setForm((p) => ({ ...p, skin: { ...p.skin, ...patch } }));
  };

  const updateMobility = (patch: Partial<NurseICUEvolutionForm['mobilityAndSafety']>) => {
    setForm((p) => ({ ...p, mobilityAndSafety: { ...p.mobilityAndSafety, ...patch } }));
  };

  const updateRisks = (patch: Partial<NurseICUEvolutionForm['riskAssessment']>) => {
    setForm((p) => ({ ...p, riskAssessment: { ...p.riskAssessment, ...patch } }));
  };

  const updateCare = (patch: Partial<NurseICUEvolutionForm['careDone']>) => {
    setForm((p) => ({ ...p, careDone: { ...p.careDone, ...patch } }));
  };

  const updateResponse = (patch: Partial<NurseICUEvolutionForm['responseToCare']>) => {
    setForm((p) => ({ ...p, responseToCare: { ...p.responseToCare, ...patch } }));
  };

  const updateComplications = (patch: Partial<NurseICUEvolutionForm['complications']>) => {
    setForm((p) => ({ ...p, complications: { ...p.complications, ...patch } }));
  };

  const updateCommunication = (patch: Partial<NurseICUEvolutionForm['communication']>) => {
    setForm((p) => ({ ...p, communication: { ...p.communication, ...patch } }));
  };

  const updateEvolutionState = (patch: Partial<NurseICUEvolutionForm['evolutionState']>) => {
    setForm((p) => ({ ...p, evolutionState: { ...p.evolutionState, ...patch } }));
  };

  // Helper for DVA items
  const addDvaItem = () => {
    setForm((p) => ({
      ...p,
      vasoactiveDrugs: {
        ...p.vasoactiveDrugs,
        vasoactiveDrugsList: [
          ...p.vasoactiveDrugs.vasoactiveDrugsList,
          {
            id: `dva-${Date.now()}`,
            medication: '',
            doseOrRate: '',
            unit: 'mcg/kg/min',
            concentration: '',
            observation: '',
          },
        ],
      },
    }));
  };

  const updateDvaItem = (idx: number, field: string, val: string) => {
    setForm((p) => {
      const list = [...p.vasoactiveDrugs.vasoactiveDrugsList];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...p,
        vasoactiveDrugs: { ...p.vasoactiveDrugs, vasoactiveDrugsList: list },
      };
    });
  };

  const removeDvaItem = (idx: number) => {
    setForm((p) => ({
      ...p,
      vasoactiveDrugs: {
        ...p.vasoactiveDrugs,
        vasoactiveDrugsList: p.vasoactiveDrugs.vasoactiveDrugsList.filter((_, i) => i !== idx),
      },
    }));
  };

  // Helper for Device items
  const addDeviceItem = () => {
    setForm((p) => ({
      ...p,
      devices: {
        ...p.devices,
        list: [
          ...p.devices.list,
          {
            id: `dev-${Date.now()}`,
            type: 'AVP',
            location: '',
            permeability: 'Pérvio',
            functioning: 'Funcionante',
            dressingClean: true,
            dressingDry: true,
            dressingIntact: true,
            phlogisticSigns: 'Ausentes',
            observations: '',
          },
        ],
      },
    }));
  };

  const updateDeviceItem = (idx: number, field: string, val: string) => {
    setForm((p) => {
      const list = [...p.devices.list];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...p,
        devices: { ...p.devices, list },
      };
    });
  };

  const removeDeviceItem = (idx: number) => {
    setForm((p) => ({
      ...p,
      devices: {
        ...p.devices,
        list: p.devices.list.filter((_, i) => i !== idx),
      },
    }));
  };

  if (viewMode === 'preview') {
    return (
      <NurseICUEvolutionPreviewView
        form={normalizedForm}
        onBackToEdit={() => setViewMode('form')}
        patientAreaName={patientAreaName}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar às áreas</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Perfil Enfermeiro • UTI
          </span>
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100"
            title="Limpar campos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Evolução de Enfermagem — {patientAreaName}
          </h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 self-start sm:self-auto">
            Clinical Module Factory V1
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Preencha a avaliação intensiva do paciente. Suporte a parâmetros ventilatórios avançados, monitorização hemodinâmica, drogas vasoativas e síntese privativa do Enfermeiro.
        </p>
      </div>

      {/* Consistency Alerts if any */}
      {consistencyAlerts.length > 0 && (
        <div className="space-y-2">
          {consistencyAlerts.map((alt, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                alt.severity === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${alt.severity === 'error' ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <strong className="font-semibold">{alt.severity === 'error' ? 'Alerta Crítico:' : 'Atenção Clínica:'}</strong> {alt.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 1: Contexto e Identificação */}
      <ClinicalSection
        index={0}
        title="1. Contexto do Registro e Identificação"
        subtitle="Momento, localização na UTI, conferência de identificação e precauções"
        status={form.context.moment ? 'completed' : 'not_started'}
        isOpen={activeSection === 0}
        onToggle={() => toggleSection(0)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Momento da Avaliação"
            options={['Admissão na UTI', 'Início do plantão', 'Meio do plantão', 'Final do plantão', 'Pós-procedimento', 'Intercorrência']}
            value={form.context.moment}
            onChange={(val) => updateContext({ moment: val })}
            required
          />
          <ClinicalTextInput
            label="Localização / Leito"
            value={form.context.location}
            onChange={(val) => updateContext({ location: val })}
            placeholder="Ex: Leito 04 - UTI Geral"
          />
          <ClinicalOptionGroup
            label="Pulseira de Identificação"
            options={['Conferida no paciente', 'Ausente', 'Danificada', 'Não informado']}
            value={form.context.wristbandIdentification}
            onChange={(val) => updateContext({ wristbandIdentification: val })}
          />
          <ClinicalOptionGroup
            label="Placa de Identificação no Leito"
            options={['Presente e conferida', 'Ausente', 'Incorreta', 'Não informado']}
            value={form.context.bedIdentification}
            onChange={(val) => updateContext({ bedIdentification: val })}
          />
          <ClinicalOptionGroup
            label="Precaução Assistencial"
            options={['Padrão', 'Contato', 'Gotículas', 'Aerossóis', 'Reversa', 'Não informado']}
            value={form.context.precaution}
            onChange={(val) => updateContext({ precaution: val })}
          />
          <div className="space-y-2">
            <ClinicalOptionGroup
              label="Alergias Referidas / Registradas"
              options={['Não referidas / Desconhecidas', 'Sim', 'Não informado']}
              value={form.context.hasAllergies}
              onChange={(val) => updateContext({ hasAllergies: val })}
            />
            {form.context.hasAllergies === 'Sim' && (
              <ClinicalTextInput
                label="Discriminação das Alergias"
                value={form.context.allergyDescription}
                onChange={(val) => updateContext({ allergyDescription: val })}
                placeholder="Ex: Dipirona, penicilina"
              />
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 2: Avaliação Geral */}
      <ClinicalSection
        index={1}
        title="2. Avaliação Geral e Queixas"
        subtitle="Estado geral, comportamento observado e fonte das informações"
        status={form.generalAssessment.behavior.length > 0 ? 'completed' : 'not_started'}
        isOpen={activeSection === 1}
        onToggle={() => toggleSection(1)}
      >
        <div className="space-y-4">
          <ClinicalMultiSelect
            label="Comportamento e Estado Geral"
            options={['Calmo / Tranquilo', 'Sonolento', 'Sedado', 'Agitado / Inquieto', 'Torporoso', 'Comatoso', 'Cooperativo', 'Confuso']}
            values={form.generalAssessment.behavior}
            onChange={(vals) => updateGeneral({ behavior: vals })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Status de Queixas"
              options={['Sem queixas no momento', 'Com queixa', 'Não avaliável (sedado/comatoso)', 'Não informado']}
              value={form.generalAssessment.complaintStatus}
              onChange={(val) => updateGeneral({ complaintStatus: val })}
            />
            <ClinicalOptionGroup
              label="Fonte da Informação"
              options={['Paciente', 'Familiar / Acompanhante', 'Equipe multiprofissional', 'Prontuário']}
              value={form.generalAssessment.informationSource}
              onChange={(val) => updateGeneral({ informationSource: val })}
            />
          </div>
          {form.generalAssessment.complaintStatus === 'Com queixa' && (
            <ClinicalTextInput
              label="Descrição da Queixa Observada ou Referida"
              value={form.generalAssessment.complaintDescription}
              onChange={(val) => updateGeneral({ complaintDescription: val })}
              placeholder="Ex: Desconforto em sítio de punção, sede referida..."
            />
          )}
        </div>
      </ClinicalSection>

      {/* SECTION 3: Sinais Vitais & Dor */}
      <ClinicalSection
        index={2}
        title="3. Sinais Vitais e Avaliação de Dor"
        subtitle="PA, PAM aferida, FC, FR, SpO2, temperatura, glicemia e escala álgica"
        status={form.vitalSigns.systolicBP ? 'completed' : 'not_started'}
        isOpen={activeSection === 2}
        onToggle={() => toggleSection(2)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ClinicalTextInput
              label="PA Sistólica (mmHg)"
              value={form.vitalSigns.systolicBP}
              onChange={(val) => updateVitals({ systolicBP: val })}
              placeholder="120"
            />
            <ClinicalTextInput
              label="PA Diastólica (mmHg)"
              value={form.vitalSigns.diastolicBP}
              onChange={(val) => updateVitals({ diastolicBP: val })}
              placeholder="80"
            />
            <div className="col-span-2 sm:col-span-2">
              <ClinicalTextInput
                label="PAM Manual / PAI Aferida (mmHg)"
                value={form.vitalSigns.meanArterialPressure}
                onChange={(val) => updateVitals({ meanArterialPressure: val })}
                placeholder="Ex: 85 (Somente se aferida/monitorizada)"
              />
              <span className="text-[11px] text-slate-400">Nunca calculada automaticamente pelo sistema.</span>
            </div>
            <ClinicalTextInput
              label="FC (bpm)"
              value={form.vitalSigns.heartRate}
              onChange={(val) => updateVitals({ heartRate: val })}
              placeholder="78"
            />
            <ClinicalTextInput
              label="FR (irpm)"
              value={form.vitalSigns.respiratoryRate}
              onChange={(val) => updateVitals({ respiratoryRate: val })}
              placeholder="18"
            />
            <ClinicalTextInput
              label="SpO₂ (%)"
              value={form.vitalSigns.oxygenSaturation}
              onChange={(val) => updateVitals({ oxygenSaturation: val })}
              placeholder="98"
            />
            <ClinicalTextInput
              label="Temperatura (°C)"
              value={form.vitalSigns.temperature}
              onChange={(val) => updateVitals({ temperature: val })}
              placeholder="36.5"
            />
            <ClinicalTextInput
              label="Glicemia (mg/dL)"
              value={form.vitalSigns.capillaryBloodGlucose}
              onChange={(val) => updateVitals({ capillaryBloodGlucose: val })}
              placeholder="110"
            />
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Avaliação de Dor
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ClinicalOptionGroup
                label="Instrumento / Escala"
                options={['Escala Numérica (0-10)', 'BPS (Intubados)', 'CPOT (Críticos)', 'Não avaliável', 'Não avaliada']}
                value={form.pain.painScaleType}
                onChange={(val) => updatePain({ painScaleType: val })}
              />
              <ClinicalTextInput
                label="Escore de Dor"
                value={form.pain.painScore}
                onChange={(val) => updatePain({ painScore: val })}
                placeholder="Ex: 3 ou 0"
              />
              <ClinicalTextInput
                label="Localização / Características"
                value={form.pain.painLocation}
                onChange={(val) => updatePain({ painLocation: val })}
                placeholder="Ex: Incisão cirúrgica"
              />
            </div>
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 4: Neurológico e Sedação */}
      <ClinicalSection
        index={3}
        title="4. Avaliação Neurológica e Sedação"
        subtitle="Nível de consciência, Glasgow, RASS, pupilas, déficit motor e sedação"
        status={form.neurological.consciousnessLevel ? 'completed' : 'not_started'}
        isOpen={activeSection === 3}
        onToggle={() => toggleSection(3)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Nível de Consciência"
              options={['Alerta / Vigil', 'Sedado', 'Sonolento', 'Torporoso', 'Comatoso']}
              value={form.neurological.consciousnessLevel}
              onChange={(val) => updateNeurological({ consciousnessLevel: val })}
              required
            />
            <ClinicalOptionGroup
              label="Orientação"
              options={['Orientado têmporo-espacialmente', 'Desorientado', 'Não avaliável (sedado)']}
              value={form.neurological.orientation}
              onChange={(val) => updateNeurological({ orientation: val })}
            />
            <ClinicalTextInput
              label="Escala de Coma de Glasgow (3-15)"
              value={form.neurological.glasgowScore}
              onChange={(val) => updateNeurological({ glasgowScore: val })}
              placeholder="Ex: 15 ou Não aplicado (sedado)"
            />
            <ClinicalOptionGroup
              label="Escala RASS (-5 a +4)"
              options={['-5 (Não responsivo)', '-4 (Sedação profunda)', '-3 (Sedação moderada)', '-2 (Sedação leve)', '-1 (Sonolento)', '0 (Alerta e calmo)', '+1 (Inquieto)', '+2 (Agitado)', '+3 (Muito agitado)', '+4 (Combativo)']}
              value={form.neurological.rassScore}
              onChange={(val) => updateNeurological({ rassScore: val })}
            />
            <ClinicalOptionGroup
              label="Pupilas"
              options={['Isocóricas', 'Anisocóricas', 'Mióticas', 'Midriáticas', 'Não avaliadas']}
              value={form.neurological.pupils}
              onChange={(val) => updateNeurological({ pupils: val })}
            />
            <ClinicalOptionGroup
              label="Fotorreação Pupilar"
              options={['Fotorreagentes bilateralmente', 'Fotorreação lenta', 'Arreativas', 'Não avaliada']}
              value={form.neurological.photoreaction}
              onChange={(val) => updateNeurological({ photoreaction: val })}
            />
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Status de Sedação
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Sedação Avaliada"
                options={['Não sedado', 'Sedado', 'Em desmame de sedação', 'Janela de sedação realizada']}
                value={form.sedationAssessment.sedationStatus}
                onChange={(val) => updateSedationAssessment({ sedationStatus: val })}
              />
              <ClinicalTextInput
                label="Observações da Sedação"
                value={form.sedationAssessment.sedationObservations}
                onChange={(val) => updateSedationAssessment({ sedationObservations: val })}
                placeholder="Ex: Responde ao chamado verbal"
              />
            </div>
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 5: Respiratório e VMI */}
      <ClinicalSection
        index={4}
        title="5. Suporte Respiratório, VMI e Ausculta"
        subtitle="Via aérea, suporte ventilatório, parâmetros de VMI e ausculta pulmonar"
        status={form.respiratory.respiratorySupport ? 'completed' : 'not_started'}
        isOpen={activeSection === 4}
        onToggle={() => toggleSection(4)}
      >
        <div className="space-y-4">
          <ClinicalOptionGroup
            label="Suporte Respiratório"
            options={['Ar ambiente', 'Oxigenoterapia', 'VNI', 'VMI (Ventilação Mecânica Invasiva)']}
            value={form.respiratory.respiratorySupport}
            onChange={(val) => updateRespiratory({ respiratorySupport: val })}
            required
          />

          {/* Se Oxigenoterapia */}
          {form.respiratory.respiratorySupport === 'Oxigenoterapia' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <ClinicalTextInput
                label="Dispositivo de O₂"
                value={form.respiratory.oxygenDevice}
                onChange={(val) => updateRespiratory({ oxygenDevice: val })}
                placeholder="Ex: Cateter nasal, Máscara de Venturi 35%"
              />
              <ClinicalTextInput
                label="Fluxo (L/min)"
                value={form.respiratory.oxygenFlowRate}
                onChange={(val) => updateRespiratory({ oxygenFlowRate: val })}
                placeholder="Ex: 3"
              />
            </div>
          )}

          {/* Se VMI: Parâmetros Ventilatórios */}
          {form.respiratory.respiratorySupport === 'VMI' && (
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                <Wind className="w-4 h-4 text-sky-700" />
                <span>Parâmetros de Ventilação Mecânica Invasiva (VMI)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ClinicalOptionGroup
                  label="Via Aérea Artificial"
                  options={['TOT (Tubo Orotraqueal)', 'Traqueostomia (TQT)', 'Outro']}
                  value={form.mechanicalVentilation.vmiAirway}
                  onChange={(val) => updateMV({ vmiAirway: val })}
                  required
                />
                <ClinicalTextInput
                  label="Modo Ventilatório"
                  value={form.mechanicalVentilation.vmiMode}
                  onChange={(val) => updateMV({ vmiMode: val })}
                  placeholder="Ex: VCV, PCV, PSV"
                />
                <ClinicalTextInput
                  label="FiO₂ (%)"
                  value={form.mechanicalVentilation.vmiFiO2}
                  onChange={(val) => updateMV({ vmiFiO2: val })}
                  placeholder="Ex: 40"
                />
                <ClinicalTextInput
                  label="PEEP (cmH₂O)"
                  value={form.mechanicalVentilation.vmiPeep}
                  onChange={(val) => updateMV({ vmiPeep: val })}
                  placeholder="Ex: 8"
                />
                <ClinicalTextInput
                  label="FR Ventilador (rpm)"
                  value={form.mechanicalVentilation.vmiRrSet}
                  onChange={(val) => updateMV({ vmiRrSet: val })}
                  placeholder="Ex: 16"
                />
                <ClinicalTextInput
                  label="Volume Corrente / VC (mL)"
                  value={form.mechanicalVentilation.vmiTidalVolume}
                  onChange={(val) => updateMV({ vmiTidalVolume: val })}
                  placeholder="Ex: 420"
                />
                <ClinicalTextInput
                  label="Pressão de Suporte / PS (cmH₂O)"
                  value={form.mechanicalVentilation.vmiSupportPressure}
                  onChange={(val) => updateMV({ vmiSupportPressure: val })}
                  placeholder="Ex: 12"
                />
                <ClinicalTextInput
                  label="Pressão Inspiratória (cmH₂O)"
                  value={form.mechanicalVentilation.vmiInspiratoryPressure}
                  onChange={(val) => updateMV({ vmiInspiratoryPressure: val })}
                  placeholder="Ex: 18"
                />
                <ClinicalTextInput
                  label="Outros Parâmetros"
                  value={form.mechanicalVentilation.vmiOtherParameters}
                  onChange={(val) => updateMV({ vmiOtherParameters: val })}
                  placeholder="Ex: Sensibilidade, relação I:E"
                />
              </div>
            </div>
          )}

          {/* Ausculta Pulmonar */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <ClinicalOptionGroup
              label="Ausculta Pulmonar Realizada?"
              options={['Sim', 'Não realizada']}
              value={form.respiratory.pulmonaryAuscultationPerformed}
              onChange={(val) => updateRespiratory({ pulmonaryAuscultationPerformed: val })}
            />
            {form.respiratory.pulmonaryAuscultationPerformed === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <ClinicalOptionGroup
                  label="Murmúrio Vesicular (MV)"
                  options={['Presente universalmente', 'Diminuído em bases', 'Diminuído globalmente', 'Abolido']}
                  value={form.respiratory.vesicularMurmur}
                  onChange={(val) => updateRespiratory({ vesicularMurmur: val })}
                />
                <ClinicalOptionGroup
                  label="Ruídos Adventícios"
                  options={['Ausentes', 'Presentes']}
                  value={form.respiratory.adventitiousSounds}
                  onChange={(val) => updateRespiratory({ adventitiousSounds: val })}
                />
                {form.respiratory.adventitiousSounds === 'Presentes' && (
                  <>
                    <ClinicalMultiSelect
                      label="Tipos de Ruídos"
                      options={['Roncos', 'Sibilos', 'Estertores finos', 'Estertores grossos', 'Estridor']}
                      values={form.respiratory.adventitiousSoundTypes}
                      onChange={(vals) => updateRespiratory({ adventitiousSoundTypes: vals })}
                    />
                    <ClinicalTextInput
                      label="Localização dos Ruídos"
                      value={form.respiratory.adventitiousSoundLocation}
                      onChange={(val) => updateRespiratory({ adventitiousSoundLocation: val })}
                      placeholder="Ex: Bases pulmonares bilateralmente"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 6: Cardiovascular, Perfusão e Infusões */}
      <ClinicalSection
        index={5}
        title="6. Cardiovascular, Drogas Vasoativas e Infusões"
        subtitle="Perfusão, TEC, ausculta cardíaca, DVA e sedação contínua"
        status={form.cardiovascular.peripheralPerfusion ? 'completed' : 'not_started'}
        isOpen={activeSection === 5}
        onToggle={() => toggleSection(5)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ClinicalOptionGroup
              label="Perfusão Periférica"
              options={['Adequada', 'Diminuída / Prejudicada', 'Não avaliada']}
              value={form.cardiovascular.peripheralPerfusion}
              onChange={(val) => updateCardiovascular({ peripheralPerfusion: val })}
            />
            <ClinicalOptionGroup
              label="Tempo Enchimento Capilar (TEC)"
              options={['< 3 segundos', '≥ 3 segundos', 'Não avaliado']}
              value={form.cardiovascular.capillaryRefillTime}
              onChange={(val) => updateCardiovascular({ capillaryRefillTime: val })}
            />
            <ClinicalOptionGroup
              label="Extremidades"
              options={['Aquecidas', 'Frias / Hipotérmicas', 'Cianóticas', 'Não avaliadas']}
              value={form.cardiovascular.extremities}
              onChange={(val) => updateCardiovascular({ extremities: val })}
            />
          </div>

          {/* Ausculta Cardíaca */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <ClinicalOptionGroup
              label="Ausculta Cardíaca Realizada?"
              options={['Sim', 'Não realizada']}
              value={form.cardiovascular.cardiacAuscultationPerformed}
              onChange={(val) => updateCardiovascular({ cardiacAuscultationPerformed: val })}
            />
            {form.cardiovascular.cardiacAuscultationPerformed === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <ClinicalOptionGroup
                  label="Bulhas Cardíacas"
                  options={['Normofonéticas', 'Hipofonéticas', 'Hiperfonéticas']}
                  value={form.cardiovascular.heartSounds}
                  onChange={(val) => updateCardiovascular({ heartSounds: val })}
                />
                <ClinicalOptionGroup
                  label="Ritmo Cardíaco"
                  options={['Regular', 'Irregular']}
                  value={form.cardiovascular.rhythm}
                  onChange={(val) => updateCardiovascular({ rhythm: val })}
                />
                <ClinicalOptionGroup
                  label="Tempos"
                  options={['2T (Dois tempos)', '3T (Três tempos)']}
                  value={form.cardiovascular.times}
                  onChange={(val) => updateCardiovascular({ times: val })}
                />
              </div>
            )}
          </div>

          {/* Drogas Vasoativas (DVA) */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-amber-700" />
                <span>Drogas Vasoativas (DVA) em Infusão Contínua</span>
              </div>
              <ClinicalOptionGroup
                label=""
                options={['Não', 'Sim']}
                value={form.vasoactiveDrugs.vasoactiveDrugsInUse}
                onChange={(val) => updateVasoactive({ vasoactiveDrugsInUse: val })}
              />
            </div>

            {form.vasoactiveDrugs.vasoactiveDrugsInUse === 'Sim' && (
              <div className="space-y-3 pt-2">
                {form.vasoactiveDrugs.vasoactiveDrugsList.map((dva, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white border border-amber-200 flex flex-col sm:flex-row items-center gap-2">
                    <ClinicalTextInput
                      label="Droga Vasoativa"
                      value={dva.medication}
                      onChange={(val) => updateDvaItem(idx, 'medication', val)}
                      placeholder="Ex: Noradrenalina, Vasopressina"
                    />
                    <ClinicalTextInput
                      label="Vazão / Dose"
                      value={dva.doseOrRate}
                      onChange={(val) => updateDvaItem(idx, 'doseOrRate', val)}
                      placeholder="Ex: 0.15 ou 10"
                    />
                    <ClinicalTextInput
                      label="Unidade"
                      value={dva.unit}
                      onChange={(val) => updateDvaItem(idx, 'unit', val)}
                      placeholder="mcg/kg/min ou mL/h"
                    />
                    <button
                      type="button"
                      onClick={() => removeDvaItem(idx)}
                      className="text-rose-600 hover:text-rose-800 p-2 mt-4 self-end sm:self-center"
                      title="Remover droga"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDvaItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-amber-400 text-amber-900 hover:bg-amber-100 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Droga Vasoativa</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 7: Gastrointestinal, Eliminações & Balanço Hídrico */}
      <ClinicalSection
        index={6}
        title="7. Nutrição, Abdome, Eliminações e Balanço Hídrico"
        subtitle="Via alimentar, palpação, RHA, diurese, evacuações e balanço"
        status={form.eliminations.diuresis ? 'completed' : 'not_started'}
        isOpen={activeSection === 6}
        onToggle={() => toggleSection(6)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Via Nutricional"
              options={['Oral', 'Dieta enteral', 'Nutrição Parenteral Total (NPT)', 'Jejum']}
              value={form.gastrointestinalAndNutrition.nutritionalRoute}
              onChange={(val) => updateGI({ nutritionalRoute: val })}
              required
            />
            {form.gastrointestinalAndNutrition.nutritionalRoute === 'Dieta enteral' && (
              <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <ClinicalOptionGroup
                  label="Dispositivo da Dieta"
                  options={['SNE (Sonda Nasoenteral)', 'SNG', 'GTT (Gastrostomia)']}
                  value={form.gastrointestinalAndNutrition.enteralDevice}
                  onChange={(val) => updateGI({ enteralDevice: val })}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <ClinicalTextInput
                    label="Vazão (mL/h)"
                    value={form.gastrointestinalAndNutrition.enteralRate}
                    onChange={(val) => updateGI({ enteralRate: val })}
                    placeholder="Ex: 50"
                  />
                  <ClinicalOptionGroup
                    label="Tolerância"
                    options={['Boa tolerância', 'Resíduo gástrico elevado', 'Pausa']}
                    value={form.gastrointestinalAndNutrition.enteralTolerance}
                    onChange={(val) => updateGI({ enteralTolerance: val })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <ClinicalOptionGroup
              label="Abdome: Forma"
              options={['Plano', 'Globoso', 'Distendido', 'Escavado']}
              value={form.gastrointestinalAndNutrition.abdomenForm}
              onChange={(val) => updateGI({ abdomenForm: val })}
            />
            <ClinicalOptionGroup
              label="Abdome: Palpação"
              options={['Indolor', 'Doloroso à palpação', 'Tenso', 'Não realizada']}
              value={form.gastrointestinalAndNutrition.abdomenPalpation}
              onChange={(val) => updateGI({ abdomenPalpation: val })}
            />
            <ClinicalOptionGroup
              label="Ruídos Hidroaéreos (RHA)"
              options={['Presentes / Normoativos', 'Diminuídos / Hipoativos', 'Ausentes', 'Não avaliados']}
              value={form.gastrointestinalAndNutrition.bowelSounds}
              onChange={(val) => updateGI({ bowelSounds: val })}
            />
          </div>

          {/* Eliminações */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ClinicalOptionGroup
              label="Diurese"
              options={['Presente', 'Oligúrica', 'Anúrica', 'Não avaliada']}
              value={form.eliminations.diuresis}
              onChange={(val) => updateEliminations({ diuresis: val })}
              required
            />
            <ClinicalOptionGroup
              label="Via de Eliminação Urinária"
              options={['Espontânea', 'SVD (Sonda Vesical de Demora)', 'Cistostomia', 'Fralda']}
              value={form.eliminations.urinaryRoute}
              onChange={(val) => updateEliminations({ urinaryRoute: val })}
              required
            />
            <ClinicalTextInput
              label="Volume Urinário Acumulado (mL)"
              value={form.eliminations.urineVolume}
              onChange={(val) => updateEliminations({ urineVolume: val })}
              placeholder="Ex: 850"
            />
          </div>

          {/* Balanço Hídrico */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Controle de Balanço Hídrico
              </span>
              <ClinicalOptionGroup
                label=""
                options={['Não realizado', 'Realizado']}
                value={form.waterBalance.controlPerformed}
                onChange={(val) => updateWaterBalance({ controlPerformed: val })}
              />
            </div>
            {form.waterBalance.controlPerformed === 'Realizado' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <ClinicalTextInput
                  label="Entradas Totais (mL)"
                  value={form.waterBalance.inputs}
                  onChange={(val) => updateWaterBalance({ inputs: val })}
                  placeholder="Ex: 1400"
                />
                <ClinicalTextInput
                  label="Saídas Totais (mL)"
                  value={form.waterBalance.outputs}
                  onChange={(val) => updateWaterBalance({ outputs: val })}
                  placeholder="Ex: 1100"
                />
                <ClinicalTextInput
                  label="Balanço Informado (mL)"
                  value={form.waterBalance.reportedBalance}
                  onChange={(val) => updateWaterBalance({ reportedBalance: val })}
                  placeholder="Ex: +300 (sem cálculo)"
                />
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 8: Dispositivos Invasivos, Pele & Mobilidade */}
      <ClinicalSection
        index={7}
        title="8. Dispositivos Invasivos, Pele e Mobilidade"
        subtitle="Acessos vasculares, sondas, drenos, lesões por pressão e grades"
        status={form.devices.list.length > 0 ? 'completed' : 'not_started'}
        isOpen={activeSection === 7}
        onToggle={() => toggleSection(7)}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Dispositivos Invasivos (AVP, CVC, PICC, PAI, SVD, Drenos)
              </h4>
              <button
                type="button"
                onClick={addDeviceItem}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-teal-300 text-teal-800 hover:bg-teal-50 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Dispositivo</span>
              </button>
            </div>

            {form.devices.list.map((dev, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                <ClinicalTextInput
                  label="Tipo"
                  value={dev.type}
                  onChange={(val) => updateDeviceItem(idx, 'type', val)}
                  placeholder="Ex: CVC, PAI, SVD"
                />
                <ClinicalTextInput
                  label="Localização / Sítio"
                  value={dev.location}
                  onChange={(val) => updateDeviceItem(idx, 'location', val)}
                  placeholder="Ex: Subclávia D, Radial E"
                />
                <ClinicalOptionGroup
                  label="Permeabilidade"
                  options={['Pérvio', 'Obstruído', 'Salinizado']}
                  value={dev.permeability}
                  onChange={(val) => updateDeviceItem(idx, 'permeability', val)}
                />
                <div className="flex items-center gap-2">
                  <ClinicalOptionGroup
                    label="Curativo Limpo/Seco/Íntegro"
                    options={['Sim', 'Não']}
                    value={dev.dressingClean && dev.dressingDry && dev.dressingIntact ? 'Sim' : 'Não'}
                    onChange={(val) => {
                      const isOk = val === 'Sim';
                      setForm((p) => {
                        const list = [...p.devices.list];
                        list[idx] = { ...list[idx], dressingClean: isOk, dressingDry: isOk, dressingIntact: isOk };
                        return { ...p, devices: { ...p.devices, list } };
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeDeviceItem(idx)}
                    className="text-rose-600 hover:text-rose-800 p-2 mt-4"
                    title="Remover dispositivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pele e Integridade */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Integridade Cutânea"
              options={['Íntegra', 'Com alteração/lesão', 'Não avaliada']}
              value={form.skin.integrity}
              onChange={(val) => updateSkin({ integrity: val })}
              required
            />
            <ClinicalOptionGroup
              label="Turgor e Hidratação"
              options={['Preservado / Hidratada', 'Diminuído / Desidratada', 'Não avaliada']}
              value={form.skin.hydration}
              onChange={(val) => updateSkin({ hydration: val })}
            />
          </div>

          {/* Mobilidade e Posicionamento */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ClinicalOptionGroup
              label="Mobilidade no Leito"
              options={['Acamado', 'Mobiliza membros no leito', 'Deambula com auxílio', 'Deambula sem auxílio']}
              value={form.mobilityAndSafety.mobility}
              onChange={(val) => updateMobility({ mobility: val })}
              required
            />
            <ClinicalOptionGroup
              label="Mudança de Decúbito"
              options={['Realizada', 'Não realizada', 'Contraindicada']}
              value={form.mobilityAndSafety.repositioning}
              onChange={(val) => updateMobility({ repositioning: val })}
            />
            <ClinicalOptionGroup
              label="Grades do Leito"
              options={['Elevadas', 'Rebaixadas', 'Não informado']}
              value={form.mobilityAndSafety.bedRails}
              onChange={(val) => updateMobility({ bedRails: val })}
            />
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 9: Riscos, Cuidados e Resposta aos Cuidados */}
      <ClinicalSection
        index={8}
        title="9. Riscos, Cuidados Realizados e Resposta"
        subtitle="Escalas assistenciais, banho, intervenções e resposta factual observada"
        status={form.careDone.careItems.length > 0 ? 'completed' : 'not_started'}
        isOpen={activeSection === 8}
        onToggle={() => toggleSection(8)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ClinicalOptionGroup
              label="Risco de Queda (Escala)"
              options={['Não avaliado', 'Avaliado']}
              value={form.riskAssessment.fallRiskStatus}
              onChange={(val) => updateRisks({ fallRiskStatus: val })}
            />
            {form.riskAssessment.fallRiskStatus === 'Avaliado' && (
              <ClinicalTextInput
                label="Classificação de Queda"
                value={form.riskAssessment.fallRiskClassification}
                onChange={(val) => updateRisks({ fallRiskClassification: val })}
                placeholder="Ex: Alto risco (Morse)"
              />
            )}
            <ClinicalOptionGroup
              label="Risco de Lesão por Pressão (LPP)"
              options={['Não avaliado', 'Avaliado']}
              value={form.riskAssessment.pressureInjuryRiskStatus}
              onChange={(val) => updateRisks({ pressureInjuryRiskStatus: val })}
            />
            {form.riskAssessment.pressureInjuryRiskStatus === 'Avaliado' && (
              <ClinicalTextInput
                label="Classificação de LPP"
                value={form.riskAssessment.pressureInjuryClassification}
                onChange={(val) => updateRisks({ pressureInjuryClassification: val })}
                placeholder="Ex: Alto risco (Braden)"
              />
            )}
            <ClinicalOptionGroup
              label="Risco de Broncoaspiração"
              options={['Presente', 'Ausente', 'Não avaliado']}
              value={form.riskAssessment.aspirationRiskStatus}
              onChange={(val) => updateRisks({ aspirationRiskStatus: val })}
            />
          </div>

          <div className="pt-3 border-t border-slate-100">
            <ClinicalMultiSelect
              label="Cuidados e Intervenções de Enfermagem Executados"
              options={[
                'Higiene oral com clorexidina 0,12%',
                'Aspiração de vias aéreas com sistema fechado',
                'Curativo de acesso vascular trocado',
                'Fixação de tubo orotraqueal trocada',
                'Cabeceira mantida elevada a 30-45°',
                'Hidratação de pele e proteção de proeminências',
                'Passagem de plantão à beira do leito',
                'Sinais vitais monitorizados continuamente',
              ]}
              values={form.careDone.careItems}
              onChange={(vals) => updateCare({ careItems: vals })}
            />
          </div>

          {/* Banho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <ClinicalOptionGroup
              label="Banho"
              options={['No leito', 'Não realizado', 'Aspersão']}
              value={form.careDone.bath}
              onChange={(val) => updateCare({ bath: val })}
            />
            {form.careDone.bath !== 'Não realizado' && form.careDone.bath && (
              <ClinicalOptionGroup
                label="Tolerância ao Banho"
                options={['Boa tolerância', 'Instabilidade hemodinâmica durante banho', 'Queda de saturação']}
                value={form.careDone.bathTolerance}
                onChange={(val) => updateCare({ bathTolerance: val })}
              />
            )}
          </div>

          {/* Resposta aos Cuidados */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <ClinicalOptionGroup
              label="Resposta aos Cuidados Avaliada?"
              options={['Não avaliada', 'Resposta observada']}
              value={form.responseToCare.responseEvaluated}
              onChange={(val) => updateResponse({ responseEvaluated: val })}
            />
            {form.responseToCare.responseEvaluated === 'Resposta observada' && (
              <ClinicalTextarea
                label="Descrição Factual da Resposta aos Cuidados"
                value={form.responseToCare.structuredResponseText}
                onChange={(val) => updateResponse({ structuredResponseText: val })}
                placeholder="Ex: Paciente manteve estabilidade pressórica e respiratória após mudança de decúbito e aspiração traqueal..."
              />
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SECTION 10: Intercorrências, Síntese do Enfermeiro & Desfecho */}
      <ClinicalSection
        index={9}
        title="10. Intercorrências, Síntese de Enfermagem e Situação Final"
        subtitle="Intercorrências, comparação com avaliação prévia e julgamento privativo"
        status={form.evolutionState.nursingSynthesis ? 'completed' : 'not_started'}
        isOpen={activeSection === 9}
        onToggle={() => toggleSection(9)}
      >
        <div className="space-y-4">
          <ClinicalOptionGroup
            label="Intercorrências no Período"
            options={['Não', 'Sim']}
            value={form.complications.hasComplication}
            onChange={(val) => updateComplications({ hasComplication: val })}
            required
          />

          {form.complications.hasComplication === 'Sim' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <ClinicalTextInput
                label="Descrição da Intercorrência"
                value={form.complications.description}
                onChange={(val) => updateComplications({ description: val })}
                placeholder="Ex: Queda transitória de SpO2 para 86% com secreção abundante em TOT"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <ClinicalTextInput
                  label="Conduta / Intervenção Realizada"
                  value={form.complications.interventionDone}
                  onChange={(val) => updateComplications({ interventionDone: val })}
                  placeholder="Ex: Aspiração em sistema fechado e aumento temporário de FiO2"
                />
                <ClinicalTextInput
                  label="Resposta Observada"
                  value={form.complications.responseObserved}
                  onChange={(val) => updateComplications({ responseObserved: val })}
                  placeholder="Ex: Recuperação de SpO2 para 97%"
                />
              </div>
            </div>
          )}

          {/* Comparação com Avaliação Anterior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <ClinicalOptionGroup
              label="Alterações em Relação à Avaliação Anterior"
              options={['Sem alteração clínica significativa', 'Melhora registrada pelo Enfermeiro', 'Piora registrada pelo Enfermeiro', 'Houve alteração observada', 'Sem comparação disponível']}
              value={form.evolutionState.statusChange}
              onChange={(val) => updateEvolutionState({ statusChange: val })}
            />
            {form.evolutionState.statusChange !== 'Sem alteração clínica significativa' &&
              form.evolutionState.statusChange !== 'Sem comparação disponível' && (
                <ClinicalTextInput
                  label="Descrição das Alterações"
                  value={form.evolutionState.changeDescription}
                  onChange={(val) => updateEvolutionState({ changeDescription: val })}
                  placeholder="Ex: Desmame de noradrenalina de 0.2 para 0.08 mcg/kg/min"
                />
              )}
          </div>

          {/* Síntese Privativa do Enfermeiro */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Síntese de Enfermagem (Privativa do Enfermeiro)</span>
            </div>
            <ClinicalTextarea
              label="Avaliação Clínica e Julgamento Profissional"
              value={form.evolutionState.nursingSynthesis}
              onChange={(val) => updateEvolutionState({ nursingSynthesis: val })}
              placeholder="Ex: Paciente crítico em ventilação mecânica e suporte vasoativo em redução. Mantém plano de vigilância respiratória e balanço hídrico rigoroso..."
              rows={4}
            />
            <span className="text-[11px] text-teal-800">
              Campo privativo do Enfermeiro conforme Resolução COFEN. Preservado fielmente no texto final.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <ClinicalOptionGroup
              label="Situação Final"
              options={['Permanece no leito sob cuidados intensivos', 'Transferência para enfermaria', 'Transferência externa', 'Encaminhado ao CC / Hemodinâmica']}
              value={form.evolutionState.currentStatus}
              onChange={(val) => updateEvolutionState({ currentStatus: val })}
              required
            />
            <ClinicalTextInput
              label="Informações Adicionais"
              value={form.evolutionState.additionalNotes}
              onChange={(val) => updateEvolutionState({ additionalNotes: val })}
              placeholder="Ex: Aguardando resultado de gasometria arterial"
            />
          </div>
        </div>
      </ClinicalSection>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 hidden sm:block">
            {consistencyAlerts.some((a) => a.severity === 'error') ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Existem inconsistências críticas a corrigir
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dados consistentes para validação
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className="w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            <span>Visualizar Evolução Estruturada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
