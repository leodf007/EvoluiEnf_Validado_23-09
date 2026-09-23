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
  NurseMedicalEvolutionForm,
  createInitialNurseMedicalEvolutionForm,
  InvasiveDeviceItem,
} from '../../../types/nurseMedicalEvolution';
import {
  normalizeNurseMedicalEvolutionForm,
  validateNurseMedicalEvolutionConsistency,
  NurseMedicalEvolutionConsistencyAlert,
} from '../../../engine/nurseMedicalEvolutionFactBuilder';
import { NurseMedicalEvolutionPreviewView } from './NurseMedicalEvolutionPreviewView';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface NurseMedicalEvolutionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const NurseMedicalEvolutionFormScreen: React.FC<NurseMedicalEvolutionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Evolução de Enfermagem — Clínica Médica" onNavigateHome={props.onBack}>
      <NurseMedicalEvolutionFormContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const NurseMedicalEvolutionFormContent: React.FC<NurseMedicalEvolutionFormScreenProps> = ({
  onBack,
  patientAreaName = 'Clínica Médica',
}) => {
  const [form, setForm] = useState<NurseMedicalEvolutionForm>(() => createInitialNurseMedicalEvolutionForm());
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  const normalizedForm = useMemo(() => normalizeNurseMedicalEvolutionForm(form), [form]);
  const consistencyAlerts: NurseMedicalEvolutionConsistencyAlert[] = useMemo(
    () => validateNurseMedicalEvolutionConsistency(normalizedForm),
    [normalizedForm]
  );

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? null : idx));
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja limpar todos os campos da evolução de enfermagem de Clínica Médica?')) {
      setForm(createInitialNurseMedicalEvolutionForm());
      setActiveSection(0);
    }
  };

  // Updaters
  const updateContext = (patch: Partial<NurseMedicalEvolutionForm['context']>) => {
    setForm((p) => ({ ...p, context: { ...p.context, ...patch } }));
  };

  const updateGeneral = (patch: Partial<NurseMedicalEvolutionForm['generalAssessment']>) => {
    setForm((p) => ({ ...p, generalAssessment: { ...p.generalAssessment, ...patch } }));
  };

  const updateVitals = (patch: Partial<NurseMedicalEvolutionForm['vitalSigns']>) => {
    setForm((p) => ({ ...p, vitalSigns: { ...p.vitalSigns, ...patch } }));
  };

  const updatePain = (patch: Partial<NurseMedicalEvolutionForm['pain']>) => {
    setForm((p) => ({ ...p, pain: { ...p.pain, ...patch } }));
  };

  const updateNeurological = (patch: Partial<NurseMedicalEvolutionForm['neurological']>) => {
    setForm((p) => ({ ...p, neurological: { ...p.neurological, ...patch } }));
  };

  const updateRespiratory = (patch: Partial<NurseMedicalEvolutionForm['respiratory']>) => {
    setForm((p) => ({ ...p, respiratory: { ...p.respiratory, ...patch } }));
  };

  const updateCardio = (patch: Partial<NurseMedicalEvolutionForm['cardiovascular']>) => {
    setForm((p) => ({ ...p, cardiovascular: { ...p.cardiovascular, ...patch } }));
  };

  const updateGI = (patch: Partial<NurseMedicalEvolutionForm['gastrointestinal']>) => {
    setForm((p) => ({ ...p, gastrointestinal: { ...p.gastrointestinal, ...patch } }));
  };

  const updateNutrition = (patch: Partial<NurseMedicalEvolutionForm['nutrition']>) => {
    setForm((p) => ({ ...p, nutrition: { ...p.nutrition, ...patch } }));
  };

  const updateEliminations = (patch: Partial<NurseMedicalEvolutionForm['eliminations']>) => {
    setForm((p) => ({ ...p, eliminations: { ...p.eliminations, ...patch } }));
  };

  const addDevice = () => {
    const newDev: InvasiveDeviceItem = {
      id: `dev-${Date.now()}`,
      type: 'Acesso Venoso Periférico (AVP)',
      anatomicalSite: 'MSE',
      laterality: 'Esquerdo',
      siteCondition: 'Sem sinais flogísticos',
      dressingCondition: 'Limpo e seco',
      permeability: 'Pérvio',
    };
    setForm((p) => ({ ...p, devices: { ...p.devices, list: [...p.devices.list, newDev] } }));
  };

  const updateDevice = (index: number, patch: Partial<InvasiveDeviceItem>) => {
    setForm((p) => {
      const list = [...p.devices.list];
      list[index] = { ...list[index], ...patch };
      return { ...p, devices: { ...p.devices, list } };
    });
  };

  const removeDevice = (index: number) => {
    setForm((p) => {
      const list = p.devices.list.filter((_, i) => i !== index);
      return { ...p, devices: { ...p.devices, list } };
    });
  };

  const updateSkin = (patch: Partial<NurseMedicalEvolutionForm['skin']>) => {
    setForm((p) => ({ ...p, skin: { ...p.skin, ...patch } }));
  };

  const updateMobility = (patch: Partial<NurseMedicalEvolutionForm['mobility']>) => {
    setForm((p) => ({ ...p, mobility: { ...p.mobility, ...patch } }));
  };

  const updateHygiene = (patch: Partial<NurseMedicalEvolutionForm['hygiene']>) => {
    setForm((p) => ({ ...p, hygiene: { ...p.hygiene, ...patch } }));
  };

  const updateRisks = (patch: Partial<NurseMedicalEvolutionForm['riskAssessment']>) => {
    setForm((p) => ({ ...p, riskAssessment: { ...p.riskAssessment, ...patch } }));
  };

  const updateCare = (patch: Partial<NurseMedicalEvolutionForm['careDone']>) => {
    setForm((p) => ({ ...p, careDone: { ...p.careDone, ...patch } }));
  };

  const updateResponseToCare = (patch: Partial<NurseMedicalEvolutionForm['responseToCare']>) => {
    setForm((p) => ({ ...p, responseToCare: { ...p.responseToCare, ...patch } }));
  };

  const updateComplications = (patch: Partial<NurseMedicalEvolutionForm['complications']>) => {
    setForm((p) => ({ ...p, complications: { ...p.complications, ...patch } }));
  };

  const updateCommunication = (patch: Partial<NurseMedicalEvolutionForm['communication']>) => {
    setForm((p) => ({ ...p, communication: { ...p.communication, ...patch } }));
  };

  const updateComparison = (patch: Partial<NurseMedicalEvolutionForm['comparisonWithPrevious']>) => {
    setForm((p) => ({ ...p, comparisonWithPrevious: { ...p.comparisonWithPrevious, ...patch } }));
  };

  const updateSynthesis = (patch: Partial<NurseMedicalEvolutionForm['nursingSynthesis']>) => {
    setForm((p) => ({ ...p, nursingSynthesis: { ...p.nursingSynthesis, ...patch } }));
  };

  const updateStatus = (patch: Partial<NurseMedicalEvolutionForm['currentStatus']>) => {
    setForm((p) => ({ ...p, currentStatus: { ...p.currentStatus, ...patch } }));
  };

  if (viewMode === 'preview') {
    return (
      <NurseMedicalEvolutionPreviewView
        form={normalizedForm}
        onBackToEdit={() => setViewMode('form')}
        patientAreaName={patientAreaName}
      />
    );
  }

  const standardCareOptions = [
    'Mudança de decúbito',
    'Higiene e conforto',
    'Curativo realizado',
    'Administração de medicamentos prescritos',
    'Controle hídrico',
    'Orientações ao paciente/acompanhante',
    'Manutenção de dispositivos invasivos',
    'Elevação de cabeceira 30-45°',
    'Auxílio na alimentação',
    'Auxílio na deambulação',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar às Áreas</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Evolução</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Evolução de Enfermagem — {patientAreaName}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Enfermeiro
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              NURSE_EVOLUTION_MEDICAL_CLINIC
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Preencha os campos abaixo com os achados clínicos observados na enfermaria. O sistema
          gerará a evolução canônica com rastreabilidade integral.
        </p>
      </div>

      {/* Consistency Alerts Banner */}
      {consistencyAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Verificação de Consistência Clínica ({consistencyAlerts.length} alertas):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {consistencyAlerts.map((alert, i) => (
              <li key={i} className={alert.severity === 'error' ? 'font-semibold text-rose-800' : ''}>
                {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SEÇÃO 1: Contexto do Atendimento */}
      <ClinicalSection
        title="1. Contexto do Atendimento"
        status={form.context.moment ? 'completed' : 'not_started'}
        isOpen={activeSection === 0}
        onToggle={() => toggleSection(0)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Momento do Registro"
            options={['Início do plantão', 'Meio do plantão', 'Término do plantão', 'Admissão no setor', 'Transferência', 'Outro']}
            value={form.context.moment}
            onChange={(val) => updateContext({ moment: val })}
          />
          <ClinicalOptionGroup
            label="Setor / Localização"
            options={['Enfermaria Clínica', 'Apartamento', 'Leito de observação', 'Outro']}
            value={form.context.location}
            onChange={(val) => updateContext({ location: val })}
          />
          <ClinicalOptionGroup
            label="Acompanhamento"
            options={['Desacompanhado', 'Familiar', 'Acompanhante contratado', 'Outro']}
            value={form.context.escort}
            onChange={(val) => updateContext({ escort: val })}
          />
          <ClinicalOptionGroup
            label="Pulseira de Identificação"
            options={['Conferida', 'Ausente', 'Danificada', 'Não checada']}
            value={form.context.wristbandIdentification}
            onChange={(val) => updateContext({ wristbandIdentification: val })}
          />
          <ClinicalOptionGroup
            label="Identificação do Leito"
            options={['Conferida', 'Ausente', 'Incorreta', 'Não checada']}
            value={form.context.bedIdentification}
            onChange={(val) => updateContext({ bedIdentification: val })}
          />
          <ClinicalOptionGroup
            label="Precaução Específica"
            options={['Padrão', 'Contato', 'Gotículas', 'Aerossóis', 'Reversa', 'Outra']}
            value={form.context.precaution}
            onChange={(val) => updateContext({ precaution: val })}
          />
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Alergias Referidas"
              options={['Não referidas', 'Sim', 'Não foi possível avaliar']}
              value={form.context.hasAllergies}
              onChange={(val) => updateContext({ hasAllergies: val })}
            />
            {form.context.hasAllergies === 'Sim' && (
              <div className="mt-3">
                <ClinicalTextInput
                  label="Descreva as Alergias (medicamentos, alimentos, látex)"
                  value={form.context.allergyDescription}
                  onChange={(val) => updateContext({ allergyDescription: val })}
                />
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 2: Avaliação Geral */}
      <ClinicalSection
        title="2. Avaliação Geral e Queixas"
        status={form.generalAssessment.generalState ? 'completed' : 'not_started'}
        isOpen={activeSection === 1}
        onToggle={() => toggleSection(1)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Estado Geral"
            options={['Bom', 'Regular', 'Grave', 'Instável']}
            value={form.generalAssessment.generalState}
            onChange={(val) => updateGeneral({ generalState: val })}
          />
          <ClinicalOptionGroup
            label="Nível de Consciência Geral"
            options={['Lúcido', 'Sonolento', 'Torporoso', 'Comatoso', 'Sedado', 'Outro']}
            value={form.generalAssessment.consciousness}
            onChange={(val) => updateGeneral({ consciousness: val })}
          />
          <div className="sm:col-span-2">
            <ClinicalMultiSelect
              label="Comportamento / Interação"
              options={['Calmo', 'Orientado', 'Cooperativo', 'Ansioso', 'Agitado', 'Confuso', 'Agressivo', 'Sedado']}
              values={form.generalAssessment.behavior}
              onChange={(val) => updateGeneral({ behavior: val })}
            />
          </div>
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Queixas Relatadas"
              options={['Sem queixas referidas', 'Com queixa', 'Não informado']}
              value={form.generalAssessment.complaintStatus}
              onChange={(val) => updateGeneral({ complaintStatus: val })}
            />
            {form.generalAssessment.complaintStatus === 'Com queixa' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <ClinicalTextInput
                  label="Descrição da Queixa"
                  value={form.generalAssessment.complaintDescription}
                  onChange={(val) => updateGeneral({ complaintDescription: val })}
                />
                <ClinicalOptionGroup
                  label="Fonte da Informação"
                  options={['Paciente', 'Acompanhante', 'Equipe']}
                  value={form.generalAssessment.informationSource}
                  onChange={(val) => updateGeneral({ informationSource: val })}
                />
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 3: Sinais Vitais */}
      <ClinicalSection
        title="3. Sinais Vitais"
        status={form.vitalSigns.systolicBP || form.vitalSigns.heartRate ? 'completed' : 'not_started'}
        isOpen={activeSection === 2}
        onToggle={() => toggleSection(2)}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ClinicalTextInput
            label="PA Sistólica (mmHg)"
            value={form.vitalSigns.systolicBP}
            onChange={(val) => updateVitals({ systolicBP: val })}
            placeholder="Ex: 120"
          />
          <ClinicalTextInput
            label="PA Diastólica (mmHg)"
            value={form.vitalSigns.diastolicBP}
            onChange={(val) => updateVitals({ diastolicBP: val })}
            placeholder="Ex: 80"
          />
          <ClinicalTextInput
            label="PAM Manual (opcional)"
            value={form.vitalSigns.meanArterialPressure}
            onChange={(val) => updateVitals({ meanArterialPressure: val })}
            placeholder="Não auto-calculada"
          />
          <ClinicalTextInput
            label="FC (bpm)"
            value={form.vitalSigns.heartRate}
            onChange={(val) => updateVitals({ heartRate: val })}
            placeholder="Ex: 78"
          />
          <ClinicalTextInput
            label="FR (irpm)"
            value={form.vitalSigns.respiratoryRate}
            onChange={(val) => updateVitals({ respiratoryRate: val })}
            placeholder="Ex: 16"
          />
          <ClinicalTextInput
            label="SpO2 (%)"
            value={form.vitalSigns.oxygenSaturation}
            onChange={(val) => updateVitals({ oxygenSaturation: val })}
            placeholder="Ex: 98"
          />
          <ClinicalTextInput
            label="Temperatura (°C)"
            value={form.vitalSigns.temperature}
            onChange={(val) => updateVitals({ temperature: val })}
            placeholder="Ex: 36.5"
          />
          <ClinicalTextInput
            label="Glicemia Capilar (mg/dL)"
            value={form.vitalSigns.capillaryBloodGlucose}
            onChange={(val) => updateVitals({ capillaryBloodGlucose: val })}
            placeholder="Ex: 110"
          />
        </div>
      </ClinicalSection>

      {/* SEÇÃO 4: Avaliação da Dor */}
      <ClinicalSection
        title="4. Avaliação da Dor"
        status={form.pain.painScaleType ? 'completed' : 'not_started'}
        isOpen={activeSection === 3}
        onToggle={() => toggleSection(3)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Escala Utilizada"
            options={['Sem dor (0/10)', 'Escala Numérica (0-10)', 'Escala Visual Analógica (EVA)', 'Escala Verbal/Descritiva', 'Não avaliada']}
            value={form.pain.painScaleType}
            onChange={(val) => updatePain({ painScaleType: val })}
          />
          <ClinicalTextInput
            label="Escore da Dor"
            value={form.pain.painScore}
            onChange={(val) => updatePain({ painScore: val })}
            placeholder="Ex: 4/10 ou moderada"
          />
          <ClinicalTextInput
            label="Localização da Dor"
            value={form.pain.painLocation}
            onChange={(val) => updatePain({ painLocation: val })}
            placeholder="Ex: Região lombar, ferida operatória..."
          />
          <ClinicalTextInput
            label="Características da Dor"
            value={form.pain.painCharacteristic}
            onChange={(val) => updatePain({ painCharacteristic: val })}
            placeholder="Ex: Em pontada, queimação, contínua..."
          />
          <div className="sm:col-span-2">
            <ClinicalTextInput
              label="Observações sobre a Dor"
              value={form.pain.painObservation}
              onChange={(val) => updatePain({ painObservation: val })}
            />
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 5: Avaliação Neurológica */}
      <ClinicalSection
        title="5. Avaliação Neurológica"
        status={form.neurological.consciousnessLevel ? 'completed' : 'not_started'}
        isOpen={activeSection === 4}
        onToggle={() => toggleSection(4)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Nível de Consciência"
            options={['Alerta', 'Sonolento', 'Torporoso', 'Comatoso', 'Sedado']}
            value={form.neurological.consciousnessLevel}
            onChange={(val) => updateNeurological({ consciousnessLevel: val })}
          />
          <ClinicalOptionGroup
            label="Orientação Têmporo-Espacial"
            options={['Orientado no tempo e espaço', 'Desorientado no tempo', 'Desorientado no espaço', 'Totalmente desorientado']}
            value={form.neurological.orientation}
            onChange={(val) => updateNeurological({ orientation: val })}
          />
          <ClinicalTextInput
            label="Escala de Coma de Glasgow (pontos)"
            value={form.neurological.glasgowScore}
            onChange={(val) => updateNeurological({ glasgowScore: val })}
            placeholder="Ex: 15"
          />
          <ClinicalOptionGroup
            label="Pupilas"
            options={['Isocóricas', 'Anisocóricas', 'Midriáticas', 'Mióticas', 'Não avaliadas']}
            value={form.neurological.pupils}
            onChange={(val) => updateNeurological({ pupils: val })}
          />
          <ClinicalOptionGroup
            label="Fotorreatividade"
            options={['Reagentes', 'Não reagentes', 'Diminuída', 'Não avaliada']}
            value={form.neurological.photoreaction}
            onChange={(val) => updateNeurological({ photoreaction: val })}
          />
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Déficit Motor"
              options={['Ausente', 'Presente', 'Não avaliado']}
              value={form.neurological.motorDeficit}
              onChange={(val) => updateNeurological({ motorDeficit: val })}
            />
            {form.neurological.motorDeficit === 'Presente' && (
              <div className="mt-3">
                <ClinicalTextInput
                  label="Descrição do Déficit Motor"
                  value={form.neurological.motorDeficitDescription}
                  onChange={(val) => updateNeurological({ motorDeficitDescription: val })}
                  placeholder="Ex: Hemiparesia à direita..."
                />
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 6: Sistema Respiratório */}
      <ClinicalSection
        title="6. Sistema Respiratório"
        status={form.respiratory.respiratorySupport ? 'completed' : 'not_started'}
        isOpen={activeSection === 5}
        onToggle={() => toggleSection(5)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Suporte Respiratório"
            options={['Ar ambiente', 'Oxigenoterapia', 'VNI', 'VMI', 'Traqueostomia', 'Outro']}
            value={form.respiratory.respiratorySupport}
            onChange={(val) => updateRespiratory({ respiratorySupport: val })}
          />
          {form.respiratory.respiratorySupport === 'Oxigenoterapia' && (
            <>
              <ClinicalOptionGroup
                label="Dispositivo de Oxigênio"
                options={['Cateter nasal', 'Máscara de Venturi', 'Máscara com reservatório', 'Cânula de alto fluxo']}
                value={form.respiratory.oxygenDevice}
                onChange={(val) => updateRespiratory({ oxygenDevice: val })}
              />
              <ClinicalTextInput
                label="Fluxo (L/min)"
                value={form.respiratory.oxygenFlowRate}
                onChange={(val) => updateRespiratory({ oxygenFlowRate: val })}
                placeholder="Ex: 2"
              />
              <ClinicalTextInput
                label="FiO2 (%)"
                value={form.respiratory.oxygenFiO2}
                onChange={(val) => updateRespiratory({ oxygenFiO2: val })}
                placeholder="Ex: 28"
              />
            </>
          )}
          <ClinicalOptionGroup
            label="Padrão Ventilatório"
            options={['Eupneico', 'Taquipneico', 'Bradipneico', 'Dispneico', 'Outro']}
            value={form.respiratory.respiratoryPattern}
            onChange={(val) => updateRespiratory({ respiratoryPattern: val })}
          />
          <ClinicalOptionGroup
            label="Desconforto Respiratório"
            options={['Ausente', 'Tiragem intercostal', 'Batimento de asa de nariz', 'Uso de musculatura acessória']}
            value={form.respiratory.respiratoryDistress}
            onChange={(val) => updateRespiratory({ respiratoryDistress: val })}
          />
          <div className="sm:col-span-2 border-t border-slate-100 pt-3">
            <ClinicalOptionGroup
              label="Ausculta Pulmonar Realizada?"
              options={['Sim', 'Não']}
              value={form.respiratory.pulmonaryAuscultationPerformed}
              onChange={(val) => updateRespiratory({ pulmonaryAuscultationPerformed: val })}
            />
            {form.respiratory.pulmonaryAuscultationPerformed === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <ClinicalOptionGroup
                  label="Murmúrio Vesicular"
                  options={['Presente universalmente', 'Diminuído em bases', 'Diminuído difusamente', 'Ausente']}
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
                      options={['Roncos', 'Sibilos', 'Estertores creptantes', 'Estertores subcreptantes', 'Estridor']}
                      values={form.respiratory.adventitiousSoundTypes}
                      onChange={(val) => updateRespiratory({ adventitiousSoundTypes: val })}
                    />
                    <ClinicalTextInput
                      label="Localização dos Ruídos"
                      value={form.respiratory.adventitiousSoundLocation}
                      onChange={(val) => updateRespiratory({ adventitiousSoundLocation: val })}
                      placeholder="Ex: Em terço inferior bilateral..."
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 7: Sistema Cardiovascular */}
      <ClinicalSection
        title="7. Sistema Cardiovascular"
        status={form.cardiovascular.peripheralPerfusion ? 'completed' : 'not_started'}
        isOpen={activeSection === 6}
        onToggle={() => toggleSection(6)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Perfusão Periférica"
            options={['Adequada', 'Diminuída', 'Prejudicada']}
            value={form.cardiovascular.peripheralPerfusion}
            onChange={(val) => updateCardio({ peripheralPerfusion: val })}
          />
          <ClinicalOptionGroup
            label="Extremidades"
            options={['Aquecidas', 'Frias', 'Cianóticas']}
            value={form.cardiovascular.extremities}
            onChange={(val) => updateCardio({ extremities: val })}
          />
          <ClinicalOptionGroup
            label="Tempo de Enchimento Capilar (TEC)"
            options={['< 2 segundos (normal)', '2 a 3 segundos', '> 3 segundos (lentificado)']}
            value={form.cardiovascular.capillaryRefillTime}
            onChange={(val) => updateCardio({ capillaryRefillTime: val })}
          />
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Edema Periférico"
              options={['Ausente', 'Presente']}
              value={form.cardiovascular.edema}
              onChange={(val) => updateCardio({ edema: val })}
            />
            {form.cardiovascular.edema === 'Presente' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <ClinicalTextInput
                  label="Localização do Edema"
                  value={form.cardiovascular.edemaLocation}
                  onChange={(val) => updateCardio({ edemaLocation: val })}
                  placeholder="Ex: Membros inferiores bilateralmente..."
                />
                <ClinicalOptionGroup
                  label="Intensidade / Cacifo"
                  options={['+1/4+', '+2/4+', '+3/4+', '+4/4+']}
                  value={form.cardiovascular.edemaGrade}
                  onChange={(val) => updateCardio({ edemaGrade: val })}
                />
              </div>
            )}
          </div>
          <div className="sm:col-span-2 border-t border-slate-100 pt-3">
            <ClinicalOptionGroup
              label="Ausculta Cardíaca Realizada?"
              options={['Sim', 'Não']}
              value={form.cardiovascular.cardiacAuscultationPerformed}
              onChange={(val) => updateCardio({ cardiacAuscultationPerformed: val })}
            />
            {form.cardiovascular.cardiacAuscultationPerformed === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <ClinicalOptionGroup
                  label="Bulhas Cardíacas"
                  options={['Normofonéticas em 2T', 'Hipofonéticas', 'Hiperfonéticas', 'Com sopro']}
                  value={form.cardiovascular.heartSounds}
                  onChange={(val) => updateCardio({ heartSounds: val })}
                />
                <ClinicalOptionGroup
                  label="Ritmo Cardíaco"
                  options={['Ritmo regular', 'Ritmo irregular']}
                  value={form.cardiovascular.rhythm}
                  onChange={(val) => updateCardio({ rhythm: val })}
                />
              </div>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 8: Gastrointestinal */}
      <ClinicalSection
        title="8. Sistema Gastrointestinal"
        status={form.gastrointestinal.abdomenForm ? 'completed' : 'not_started'}
        isOpen={activeSection === 7}
        onToggle={() => toggleSection(7)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Forma do Abdome"
            options={['Plano', 'Globoso', 'Distendido', 'Escavado', 'Semigloboso']}
            value={form.gastrointestinal.abdomenForm}
            onChange={(val) => updateGI({ abdomenForm: val })}
          />
          <ClinicalOptionGroup
            label="Consistência do Abdome"
            options={['Flácido', 'Tenso', 'Rígido em tábua', 'Depressível']}
            value={form.gastrointestinal.abdomenConsistency}
            onChange={(val) => updateGI({ abdomenConsistency: val })}
          />
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Palpação Abdominal"
              options={['Indolor', 'Dolorosa']}
              value={form.gastrointestinal.abdomenPalpation}
              onChange={(val) => updateGI({ abdomenPalpation: val })}
            />
            {form.gastrointestinal.abdomenPalpation === 'Dolorosa' && (
              <div className="mt-3">
                <ClinicalTextInput
                  label="Localização da Dor à Palpação"
                  value={form.gastrointestinal.abdomenPainLocation}
                  onChange={(val) => updateGI({ abdomenPainLocation: val })}
                  placeholder="Ex: Em fossa ilíaca direita, epigástrio..."
                />
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Ruídos Hidroaéreos (RHA)"
              options={['Presentes e normoativos', 'Hiperativos', 'Hipoativos', 'Ausentes', 'Não avaliados']}
              value={form.gastrointestinal.bowelSounds}
              onChange={(val) => updateGI({ bowelSounds: val })}
            />
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 9: Nutrição */}
      <ClinicalSection
        title="9. Nutrição e Dieta"
        status={form.nutrition.nutritionalRoute ? 'completed' : 'not_started'}
        isOpen={activeSection === 8}
        onToggle={() => toggleSection(8)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Via Nutricional"
            options={['Via oral', 'Dieta enteral', 'Nutrição parenteral', 'Jejum']}
            value={form.nutrition.nutritionalRoute}
            onChange={(val) => updateNutrition({ nutritionalRoute: val })}
          />
          {form.nutrition.nutritionalRoute === 'Via oral' && (
            <ClinicalOptionGroup
              label="Aceitação Alimentar"
              options={['Boa aceitação (> 75%)', 'Aceitação parcial (50-75%)', 'Baixa aceitação (< 50%)', 'Recusa alimentar']}
              value={form.nutrition.oralAcceptance}
              onChange={(val) => updateNutrition({ oralAcceptance: val })}
            />
          )}
          {form.nutrition.nutritionalRoute === 'Dieta enteral' && (
            <>
              <ClinicalOptionGroup
                label="Dispositivo Enteral"
                options={['SNG', 'SNE', 'Gastrostomia (GTT)', 'Jejunostomia']}
                value={form.nutrition.enteralDevice}
                onChange={(val) => updateNutrition({ enteralDevice: val })}
              />
              <ClinicalTextInput
                label="Velocidade de Infusão (mL/h)"
                value={form.nutrition.enteralRate}
                onChange={(val) => updateNutrition({ enteralRate: val })}
                placeholder="Ex: 60"
              />
              <ClinicalOptionGroup
                label="Tolerância à Dieta Enteral"
                options={['Boa tolerância', 'Náuseas/vômitos', 'Diarreia', 'Resíduo gástrico elevado']}
                value={form.nutrition.enteralTolerance}
                onChange={(val) => updateNutrition({ enteralTolerance: val })}
              />
            </>
          )}
          <div className="sm:col-span-2">
            <ClinicalTextInput
              label="Observações Nutricionais"
              value={form.nutrition.nutritionObservation}
              onChange={(val) => updateNutrition({ nutritionObservation: val })}
            />
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 10: Eliminações */}
      <ClinicalSection
        title="10. Eliminações Fisiológicas"
        status={form.eliminations.diuresis ? 'completed' : 'not_started'}
        isOpen={activeSection === 9}
        onToggle={() => toggleSection(9)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Diurese"
            options={['Presente', 'Ausente', 'Não avaliada']}
            value={form.eliminations.diuresis}
            onChange={(val) => updateEliminations({ diuresis: val })}
          />
          <ClinicalOptionGroup
            label="Via Urinária"
            options={['Espontânea', 'SVD', 'Cistostomia', 'Urostomia', 'Outra']}
            value={form.eliminations.urinaryRoute}
            onChange={(val) => updateEliminations({ urinaryRoute: val })}
          />
          <ClinicalTextInput
            label="Aspecto da Urina"
            value={form.eliminations.urineAspect}
            onChange={(val) => updateEliminations({ urineAspect: val })}
            placeholder="Ex: Clara, colúrica, piúrica, hematúrica..."
          />
          <div className="sm:col-span-2 border-t border-slate-100 pt-3">
            <ClinicalOptionGroup
              label="Evacuação"
              options={['Presente', 'Ausente', 'Não avaliada']}
              value={form.eliminations.bowelElimination}
              onChange={(val) => updateEliminations({ bowelElimination: val })}
            />
            <div className="mt-3">
              <ClinicalTextInput
                label="Aspecto / Consistência das Fezes"
                value={form.eliminations.bowelAspect}
                onChange={(val) => updateEliminations({ bowelAspect: val })}
                placeholder="Ex: Pastosas, líquidas, ressecadas, melena..."
              />
            </div>
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 11: Dispositivos Invasivos */}
      <ClinicalSection
        title="11. Dispositivos Invasivos"
        status={form.devices.list.length > 0 ? 'completed' : 'not_started'}
        isOpen={activeSection === 10}
        onToggle={() => toggleSection(10)}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-slate-600">
              Registre acessos venosos, sondas, cateteres e drenos ativos.
            </p>
            <button
              type="button"
              onClick={addDevice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Dispositivo</span>
            </button>
          </div>

          {form.devices.list.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              Nenhum dispositivo invasivo registrado.
            </div>
          ) : (
            form.devices.list.map((dev, idx) => (
              <div key={dev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Dispositivo #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeDevice(idx)}
                    className="text-rose-600 hover:text-rose-800 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ClinicalTextInput
                    label="Tipo do Dispositivo"
                    value={dev.type}
                    onChange={(val) => updateDevice(idx, { type: val })}
                  />
                  <ClinicalTextInput
                    label="Sítio Anatômico"
                    value={dev.anatomicalSite}
                    onChange={(val) => updateDevice(idx, { anatomicalSite: val })}
                  />
                  <ClinicalOptionGroup
                    label="Lateralidade"
                    options={['Direito', 'Esquerdo', 'Bilateral', 'Não se aplica']}
                    value={dev.laterality}
                    onChange={(val) => updateDevice(idx, { laterality: val })}
                  />
                  <ClinicalOptionGroup
                    label="Condição do Sítio"
                    options={['Sem sinais flogísticos', 'Hiperemia', 'Edema', 'Secreção purulenta']}
                    value={dev.siteCondition}
                    onChange={(val) => updateDevice(idx, { siteCondition: val })}
                  />
                  <ClinicalOptionGroup
                    label="Curativo"
                    options={['Limpo e seco', 'Úmido', 'Sujo', 'Com sangue']}
                    value={dev.dressingCondition}
                    onChange={(val) => updateDevice(idx, { dressingCondition: val })}
                  />
                  <ClinicalOptionGroup
                    label="Perviedade"
                    options={['Pérvio', 'Obstruído', 'Com refluxo']}
                    value={dev.permeability}
                    onChange={(val) => updateDevice(idx, { permeability: val })}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </ClinicalSection>

      {/* SEÇÃO 12: Pele e Integridade */}
      <ClinicalSection
        title="12. Pele e Integridade Cutânea"
        status={form.skin.integrity ? 'completed' : 'not_started'}
        isOpen={activeSection === 11}
        onToggle={() => toggleSection(11)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Integridade Cutânea"
            options={['Íntegra', 'Com alteração/lesão', 'Não avaliada']}
            value={form.skin.integrity}
            onChange={(val) => updateSkin({ integrity: val })}
          />
          <ClinicalOptionGroup
            label="Hidratação da Pele"
            options={['Hidratada', 'Ressecada', 'Descamação']}
            value={form.skin.hydration}
            onChange={(val) => updateSkin({ hydration: val })}
          />
          {form.skin.integrity === 'Com alteração/lesão' && (
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-3">
              <ClinicalTextInput
                label="Localização da Lesão"
                value={form.skin.lesionLocation}
                onChange={(val) => updateSkin({ lesionLocation: val })}
                placeholder="Ex: Região sacra, calcâneo direito..."
              />
              <ClinicalTextInput
                label="Características da Lesão"
                value={form.skin.lesionCharacteristics}
                onChange={(val) => updateSkin({ lesionCharacteristics: val })}
                placeholder="Ex: Lesão por pressão estágio 2, hiperemia..."
              />
              <ClinicalTextInput
                label="Curativo Aplicado"
                value={form.skin.lesionDressing}
                onChange={(val) => updateSkin({ lesionDressing: val })}
                placeholder="Ex: Placa de hidrocoloide limpa e íntegra..."
              />
            </div>
          )}
        </div>
      </ClinicalSection>

      {/* SEÇÃO 13: Mobilidade */}
      <ClinicalSection
        title="13. Mobilidade e Posicionamento"
        status={form.mobility.mobility ? 'completed' : 'not_started'}
        isOpen={activeSection === 12}
        onToggle={() => toggleSection(12)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Mobilidade do Paciente"
            options={['Deambula sem auxílio', 'Deambula com auxílio', 'Restrito ao leito', 'Restrito à poltrona']}
            value={form.mobility.mobility}
            onChange={(val) => updateMobility({ mobility: val })}
          />
          <ClinicalOptionGroup
            label="Mudança de Decúbito"
            options={['Realizada pela equipe', 'Realizada pelo paciente', 'Não realizada']}
            value={form.mobility.repositioning}
            onChange={(val) => updateMobility({ repositioning: val })}
          />
          {form.mobility.repositioning === 'Realizada pela equipe' && (
            <div className="sm:col-span-2">
              <ClinicalOptionGroup
                label="Intervalo de Mudança de Decúbito"
                options={['A cada 2 horas', 'A cada 3 horas', 'Conforme tolerância']}
                value={form.mobility.repositioningInterval}
                onChange={(val) => updateMobility({ repositioningInterval: val })}
              />
            </div>
          )}
        </div>
      </ClinicalSection>

      {/* SEÇÃO 14: Higiene */}
      <ClinicalSection
        title="14. Higiene e Autocuidado"
        status={form.hygiene.hygieneStatus ? 'completed' : 'not_started'}
        isOpen={activeSection === 13}
        onToggle={() => toggleSection(13)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClinicalOptionGroup
            label="Condição de Higiene"
            options={['Satisfatória', 'Prejudicada', 'Necessita de auxílio']}
            value={form.hygiene.hygieneStatus}
            onChange={(val) => updateHygiene({ hygieneStatus: val })}
          />
          <ClinicalOptionGroup
            label="Banho"
            options={['De aspersão com auxílio', 'De aspersão independente', 'No leito', 'Não realizado']}
            value={form.hygiene.bath}
            onChange={(val) => updateHygiene({ bath: val })}
          />
          {form.hygiene.bath !== 'Não realizado' && form.hygiene.bath !== '' && (
            <div className="sm:col-span-2">
              <ClinicalOptionGroup
                label="Tolerância ao Banho"
                options={['Boa tolerância sem intercorrências', 'Cansaço/fadiga ao esforço', 'Desconforto relatado']}
                value={form.hygiene.bathTolerance}
                onChange={(val) => updateHygiene({ bathTolerance: val })}
              />
            </div>
          )}
        </div>
      </ClinicalSection>

      {/* SEÇÃO 15: Riscos Assistenciais */}
      <ClinicalSection
        title="15. Riscos Assistenciais (Escalas)"
        status={form.riskAssessment.fallRiskStatus ? 'completed' : 'not_started'}
        isOpen={activeSection === 14}
        onToggle={() => toggleSection(14)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Risco de Queda</span>
            <ClinicalOptionGroup
              label="Status da Avaliação"
              options={['Avaliado', 'Não avaliado']}
              value={form.riskAssessment.fallRiskStatus}
              onChange={(val) => updateRisks({ fallRiskStatus: val })}
            />
            {form.riskAssessment.fallRiskStatus === 'Avaliado' && (
              <>
                <ClinicalOptionGroup
                  label="Escala"
                  options={['Morse', 'Humpty Dumpty', 'Outra']}
                  value={form.riskAssessment.fallRiskScale}
                  onChange={(val) => updateRisks({ fallRiskScale: val })}
                />
                <ClinicalTextInput
                  label="Escore"
                  value={form.riskAssessment.fallRiskScore}
                  onChange={(val) => updateRisks({ fallRiskScore: val })}
                  placeholder="Ex: 45"
                />
                <ClinicalOptionGroup
                  label="Classificação"
                  options={['Baixo risco', 'Médio risco', 'Alto risco']}
                  value={form.riskAssessment.fallRiskClassification}
                  onChange={(val) => updateRisks({ fallRiskClassification: val })}
                />
              </>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Risco de Lesão por Pressão</span>
            <ClinicalOptionGroup
              label="Status da Avaliação"
              options={['Avaliado', 'Não avaliado']}
              value={form.riskAssessment.pressureInjuryRiskStatus}
              onChange={(val) => updateRisks({ pressureInjuryRiskStatus: val })}
            />
            {form.riskAssessment.pressureInjuryRiskStatus === 'Avaliado' && (
              <>
                <ClinicalOptionGroup
                  label="Escala"
                  options={['Braden', 'Waterlow', 'Outra']}
                  value={form.riskAssessment.pressureInjuryScale}
                  onChange={(val) => updateRisks({ pressureInjuryScale: val })}
                />
                <ClinicalTextInput
                  label="Escore"
                  value={form.riskAssessment.pressureInjuryScore}
                  onChange={(val) => updateRisks({ pressureInjuryScore: val })}
                  placeholder="Ex: 14"
                />
                <ClinicalOptionGroup
                  label="Classificação"
                  options={['Sem risco', 'Baixo risco', 'Risco moderado', 'Alto risco', 'Risco muito alto']}
                  value={form.riskAssessment.pressureInjuryClassification}
                  onChange={(val) => updateRisks({ pressureInjuryClassification: val })}
                />
              </>
            )}
          </div>
          <div className="sm:col-span-2">
            <ClinicalTextInput
              label="Outros Riscos Registrados"
              value={form.riskAssessment.otherRisks}
              onChange={(val) => updateRisks({ otherRisks: val })}
              placeholder="Ex: Risco de broncoaspiração, risco de flebite..."
            />
          </div>
        </div>
      </ClinicalSection>

      {/* SEÇÃO 16: Cuidados Realizados */}
      <ClinicalSection
        title="16. Cuidados Realizados"
        status={form.careDone.careItems.length > 0 ? 'completed' : 'not_started'}
        isOpen={activeSection === 15}
        onToggle={() => toggleSection(15)}
      >
        <div className="space-y-4">
          <ClinicalMultiSelect
            label="Condutas e Cuidados Executados no Período"
            options={standardCareOptions}
            values={form.careDone.careItems}
            onChange={(val) => updateCare({ careItems: val })}
          />
          <ClinicalTextarea
            label="Detalhes ou Cuidados Adicionais"
            value={form.careDone.customCareDetails}
            onChange={(val) => updateCare({ customCareDetails: val })}
            placeholder="Descreva condutas específicas executadas pela equipe de enfermagem..."
          />
        </div>
      </ClinicalSection>

      {/* SEÇÃO 17: Resposta aos Cuidados */}
      <ClinicalSection
        title="17. Resposta aos Cuidados"
        status={form.responseToCare.evaluated ? 'completed' : 'not_started'}
        isOpen={activeSection === 16}
        onToggle={() => toggleSection(16)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Resposta Avaliada?"
              options={['Sim', 'Não']}
              value={form.responseToCare.evaluated}
              onChange={(val) => updateResponseToCare({ evaluated: val })}
            />
          </div>
          {form.responseToCare.evaluated === 'Sim' && (
            <>
              <ClinicalTextInput
                label="Intervenção Associada"
                value={form.responseToCare.interventionDone}
                onChange={(val) => updateResponseToCare({ interventionDone: val })}
                placeholder="Ex: administração de analgésico prescrito..."
              />
              <ClinicalTextInput
                label="Resposta Factual Observada"
                value={form.responseToCare.observedResponse}
                onChange={(val) => updateResponseToCare({ observedResponse: val })}
                placeholder="Ex: alívio da dor, escore reduziu de 7 para 2..."
              />
            </>
          )}
        </div>
      </ClinicalSection>

      {/* SEÇÃO 18: Intercorrências */}
      <ClinicalSection
        title="18. Intercorrências no Plantão"
        status={form.complications.hasComplication ? 'completed' : 'not_started'}
        isOpen={activeSection === 17}
        onToggle={() => toggleSection(17)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Houve Intercorrência?"
              options={['Não', 'Sim']}
              value={form.complications.hasComplication}
              onChange={(val) => updateComplications({ hasComplication: val })}
            />
          </div>
          {form.complications.hasComplication === 'Sim' && (
            <>
              <ClinicalTextInput
                label="Horário da Intercorrência"
                value={form.complications.time}
                onChange={(val) => updateComplications({ time: val })}
                placeholder="Ex: 14:30"
              />
              <ClinicalTextInput
                label="Descrição Factual do Evento"
                value={form.complications.description}
                onChange={(val) => updateComplications({ description: val })}
                placeholder="Ex: Episódio de pico hipertensivo..."
              />
              <ClinicalTextInput
                label="Ações Imediatas Executadas"
                value={form.complications.actionsTaken}
                onChange={(val) => updateComplications({ actionsTaken: val })}
                placeholder="Ex: Posicionado em repouso, aferidos sinais vitais..."
              />
              <ClinicalOptionGroup
                label="Comunicado à Equipe?"
                options={['Sim', 'Não']}
                value={form.complications.communicatedToTeam}
                onChange={(val) => updateComplications({ communicatedToTeam: val })}
              />
              {form.complications.communicatedToTeam === 'Sim' && (
                <ClinicalTextInput
                  label="Para quem foi comunicado"
                  value={form.complications.communicatedWho}
                  onChange={(val) => updateComplications({ communicatedWho: val })}
                  placeholder="Ex: Dr. plantonista..."
                />
              )}
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  label="Evolução / Resposta do Paciente"
                  value={form.complications.patientResponse}
                  onChange={(val) => updateComplications({ patientResponse: val })}
                  placeholder="Ex: PA normalizada após conduta médica..."
                />
              </div>
            </>
          )}
        </div>
      </ClinicalSection>

      {/* SEÇÃO 19: Comunicação */}
      <ClinicalSection
        title="19. Comunicação Assistencial"
        status={form.communication.hasCommunication ? 'completed' : 'not_started'}
        isOpen={activeSection === 18}
        onToggle={() => toggleSection(18)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <ClinicalOptionGroup
              label="Comunicação Relevante Realizada?"
              options={['Não', 'Sim']}
              value={form.communication.hasCommunication}
              onChange={(val) => updateCommunication({ hasCommunication: val })}
            />
          </div>
          {form.communication.hasCommunication === 'Sim' && (
            <>
              <ClinicalTextInput
                label="Destinatário"
                value={form.communication.target}
                onChange={(val) => updateCommunication({ target: val })}
                placeholder="Ex: Equipe médica, fisioterapia, nutricionista..."
              />
              <ClinicalTextInput
                label="Horário"
                value={form.communication.time}
                onChange={(val) => updateCommunication({ time: val })}
                placeholder="Ex: 11:00"
              />
              <ClinicalTextInput
                label="Motivo da Comunicação"
                value={form.communication.reason}
                onChange={(val) => updateCommunication({ reason: val })}
                placeholder="Ex: Ajuste de dieta enteral..."
              />
              <ClinicalTextInput
                label="Resposta / Alinhamento"
                value={form.communication.responseObserved}
                onChange={(val) => updateCommunication({ responseObserved: val })}
                placeholder="Ex: Conduta orientada mantida..."
              />
            </>
          )}
        </div>
      </ClinicalSection>

      {/* SEÇÃO 20: Comparação */}
      <ClinicalSection
        title="20. Comparação com Avaliação Anterior"
        status={form.comparisonWithPrevious.statusChange ? 'completed' : 'not_started'}
        isOpen={activeSection === 19}
        onToggle={() => toggleSection(19)}
      >
        <div className="space-y-4">
          <ClinicalOptionGroup
            label="Evolução do Quadro Clínico"
            options={['Quadro clínico estável', 'Quadro clínico em melhora', 'Quadro clínico em piora', 'Novo sintoma/achado', 'Não informado']}
            value={form.comparisonWithPrevious.statusChange}
            onChange={(val) => updateComparison({ statusChange: val })}
          />
          <ClinicalTextarea
            label="Descrição Detalhada da Mudança"
            value={form.comparisonWithPrevious.changeDescription}
            onChange={(val) => updateComparison({ changeDescription: val })}
            placeholder="Descreva as alterações em relação ao plantão ou avaliação anterior..."
          />
        </div>
      </ClinicalSection>

      {/* SEÇÃO 21: Síntese de Enfermagem */}
      <ClinicalSection
        title="21. Síntese de Enfermagem (Privativo do Enfermeiro)"
        status={form.nursingSynthesis.synthesisText ? 'completed' : 'not_started'}
        isOpen={activeSection === 20}
        onToggle={() => toggleSection(20)}
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Campo de julgamento profissional privativo do Enfermeiro. Nunca preenchido automaticamente.
          </p>
          <ClinicalTextarea
            label="Síntese Clínica e Raciocínio de Enfermagem"
            value={form.nursingSynthesis.synthesisText}
            onChange={(val) => updateSynthesis({ synthesisText: val })}
            placeholder="Registre aqui a sua síntese clínica sobre a estabilidade, riscos prioritários e plano assistencial..."
          />
        </div>
      </ClinicalSection>

      {/* SEÇÃO 22: Situação Atual */}
      <ClinicalSection
        title="22. Situação Atual e Desfecho"
        status={form.currentStatus.status ? 'completed' : 'not_started'}
        isOpen={activeSection === 21}
        onToggle={() => toggleSection(21)}
      >
        <div className="space-y-4">
          <ClinicalOptionGroup
            label="Condição do Paciente ao Término do Registro"
            options={['Mantém-se no leito em repouso', 'Permanece estável na enfermaria', 'Aguardando alta hospitalar', 'Aguardando transferência', 'Outro']}
            value={form.currentStatus.status}
            onChange={(val) => updateStatus({ status: val })}
          />
        </div>
      </ClinicalSection>
    </div>
  );
};
