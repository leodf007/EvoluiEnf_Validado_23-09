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
} from 'lucide-react';
import { TechnicianAdmissionForm } from '../../../types/admissionClinical';
import { SectionStatus, InvasiveDeviceItem } from '../../../types/clinical';
import {
  createInitialAdmissionForm,
  createSampleAdmissionForm,
  getAdmissionSectionStatuses,
} from '../../../utils/admissionValidator';
import { validateAdmissionClinicalConsistency } from '../../../engine/admissionConsistencyValidator';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalNumericInput } from '../ClinicalNumericInput';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalProgressBar } from '../ClinicalProgressBar';
import { ClinicalAlertNotice } from '../ClinicalAlertNotice';
import { DeviceFormCard } from '../DeviceFormCard';
import { TechnicianAdmissionPreviewView } from './TechnicianAdmissionPreviewView';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface TechnicianAdmissionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const TechnicianAdmissionFormScreen: React.FC<TechnicianAdmissionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Admissão — Anotação de Enfermagem (Técnico)" onNavigateHome={props.onBack}>
      <TechnicianAdmissionFormScreenContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const TechnicianAdmissionFormScreenContent: React.FC<TechnicianAdmissionFormScreenProps> = ({
  onBack,
  patientAreaName = 'PS / Emergência',
}) => {
  const [form, setForm] = useState<TechnicianAdmissionForm>(createInitialAdmissionForm);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  // Consistency alerts & section statuses
  const consistencyAlerts = useMemo(() => validateAdmissionClinicalConsistency(form), [form]);
  const sectionStatuses = useMemo(() => getAdmissionSectionStatuses(form), [form]);

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
    if (window.confirm('Deseja realmente limpar todos os campos da anotação de admissão?')) {
      setForm(createInitialAdmissionForm());
      setActiveSection(0);
      setViewMode('form');
    }
  };

  const handleFillSample = () => {
    setForm(createSampleAdmissionForm());
    setActiveSection(0);
  };

  // State updaters
  const updateContext = (updates: Partial<TechnicianAdmissionForm['context']>) =>
    setForm((prev) => ({ ...prev, context: { ...prev.context, ...updates } }));

  const updateOrigin = (updates: Partial<TechnicianAdmissionForm['origin']>) =>
    setForm((prev) => ({ ...prev, origin: { ...prev.origin, ...updates } }));

  const updateId = (updates: Partial<TechnicianAdmissionForm['identification']>) =>
    setForm((prev) => ({ ...prev, identification: { ...prev.identification, ...updates } }));

  const updateRep = (updates: Partial<TechnicianAdmissionForm['reportedInformation']>) =>
    setForm((prev) => ({ ...prev, reportedInformation: { ...prev.reportedInformation, ...updates } }));

  const updateArr = (updates: Partial<TechnicianAdmissionForm['arrivalCondition']>) =>
    setForm((prev) => ({ ...prev, arrivalCondition: { ...prev.arrivalCondition, ...updates } }));

  const updateVitals = (updates: Partial<TechnicianAdmissionForm['vitalSigns']>) =>
    setForm((prev) => ({ ...prev, vitalSigns: { ...prev.vitalSigns, ...updates } }));

  const updatePain = (updates: Partial<TechnicianAdmissionForm['pain']>) =>
    setForm((prev) => ({ ...prev, pain: { ...prev.pain, ...updates } }));

  const updateNeuro = (updates: Partial<TechnicianAdmissionForm['neurological']>) =>
    setForm((prev) => ({ ...prev, neurological: { ...prev.neurological, ...updates } }));

  const updateResp = (updates: Partial<TechnicianAdmissionForm['respiratory']>) =>
    setForm((prev) => ({ ...prev, respiratory: { ...prev.respiratory, ...updates } }));

  const updateCardio = (updates: Partial<TechnicianAdmissionForm['cardiovascular']>) =>
    setForm((prev) => ({ ...prev, cardiovascular: { ...prev.cardiovascular, ...updates } }));

  const updateNut = (updates: Partial<TechnicianAdmissionForm['nutrition']>) =>
    setForm((prev) => ({ ...prev, nutrition: { ...prev.nutrition, ...updates } }));

  const updateGastro = (updates: Partial<TechnicianAdmissionForm['gastrointestinal']>) =>
    setForm((prev) => ({ ...prev, gastrointestinal: { ...prev.gastrointestinal, ...updates } }));

  const updateElim = (updates: Partial<TechnicianAdmissionForm['elimination']>) =>
    setForm((prev) => ({ ...prev, elimination: { ...prev.elimination, ...updates } }));

  const updateSkin = (updates: Partial<TechnicianAdmissionForm['skin']>) =>
    setForm((prev) => ({ ...prev, skin: { ...prev.skin, ...updates } }));

  const updateMob = (updates: Partial<TechnicianAdmissionForm['mobility']>) =>
    setForm((prev) => ({ ...prev, mobility: { ...prev.mobility, ...updates } }));

  const updateHyg = (updates: Partial<TechnicianAdmissionForm['hygiene']>) =>
    setForm((prev) => ({ ...prev, hygiene: { ...prev.hygiene, ...updates } }));

  const updateCare = (updates: Partial<TechnicianAdmissionForm['admissionCare']>) =>
    setForm((prev) => ({ ...prev, admissionCare: { ...prev.admissionCare, ...updates } }));

  const updateBel = (updates: Partial<TechnicianAdmissionForm['belongings']>) =>
    setForm((prev) => ({ ...prev, belongings: { ...prev.belongings, ...updates } }));

  const updateComp = (updates: Partial<TechnicianAdmissionForm['complications']>) =>
    setForm((prev) => ({ ...prev, complications: { ...prev.complications, ...updates } }));

  const updateComm = (updates: Partial<TechnicianAdmissionForm['communications']>) =>
    setForm((prev) => ({ ...prev, communications: { ...prev.communications, ...updates } }));

  const updateFinal = (updates: Partial<TechnicianAdmissionForm['finalStatus']>) =>
    setForm((prev) => ({ ...prev, finalStatus: { ...prev.finalStatus, ...updates } }));

  // Existing devices management
  const addExistingDevice = () => {
    const newDev: InvasiveDeviceItem = {
      id: `dev-exist-${Date.now()}`,
      type: 'AVP',
      location: 'MSD',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: 'Ausentes',
    };
    setForm((prev) => ({
      ...prev,
      existingDevices: {
        list: [...prev.existingDevices.list, newDev],
      },
    }));
  };

  const updateExistingDevice = (index: number, dev: InvasiveDeviceItem) => {
    setForm((prev) => {
      const copy = [...prev.existingDevices.list];
      copy[index] = dev;
      return { ...prev, existingDevices: { list: copy } };
    });
  };

  const removeExistingDevice = (index: number) => {
    setForm((prev) => ({
      ...prev,
      existingDevices: {
        list: prev.existingDevices.list.filter((_, i) => i !== index),
      },
    }));
  };

  // Installed devices in admission management
  const addInstalledDevice = () => {
    const newDev: InvasiveDeviceItem = {
      id: `dev-inst-${Date.now()}`,
      type: 'AVP',
      location: 'MSE',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: 'Ausentes',
    };
    setForm((prev) => ({
      ...prev,
      installedDevices: {
        installedInAdmission: 'Sim',
        list: [...prev.installedDevices.list, newDev],
      },
    }));
  };

  const updateInstalledDevice = (index: number, dev: InvasiveDeviceItem) => {
    setForm((prev) => {
      const copy = [...prev.installedDevices.list];
      copy[index] = dev;
      return { ...prev, installedDevices: { ...prev.installedDevices, list: copy } };
    });
  };

  const removeInstalledDevice = (index: number) => {
    setForm((prev) => ({
      ...prev,
      installedDevices: {
        ...prev.installedDevices,
        list: prev.installedDevices.list.filter((_, i) => i !== index),
      },
    }));
  };

  if (viewMode === 'preview') {
    return (
      <TechnicianAdmissionPreviewView
        form={form}
        patientAreaName={patientAreaName}
        onEditSection={openSection}
        onBackToForm={() => setViewMode('form')}
        onRestart={() => {
          setForm(createInitialAdmissionForm());
          setViewMode('form');
          setActiveSection(0);
        }}
        onBackToDashboard={onBack}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para áreas</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillSample}
            className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Preenche um caso clínico completo de exemplo para testes"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preencher Exemplo</span>
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Técnico em Enfermagem</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Admissão — Anotação de Enfermagem
            </h1>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80">
            {patientAreaName}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Estruture a anotação do momento de admissão e recebimento do paciente. Preencha as seções abaixo de forma progressiva.
        </p>

        {/* Scope and Privacy Reminder */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
          <span>
            <strong>Diretriz de Segurança:</strong> Não insira nome, CPF ou número de prontuário nos campos abertos. O sistema protege automaticamente a privacidade do paciente.
          </span>
        </div>
      </div>

      {/* Consistency Warnings (Non-blocking) */}
      {consistencyAlerts.length > 0 && (
        <div className="space-y-2">
          {consistencyAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-950">{alert.sectionTitle} ({alert.ruleId}):</p>
                <p className="mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress and Collapsible Actions */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
        <span className="font-medium">20 Seções Clínicas Estruturadas</span>
        <button
          type="button"
          onClick={() => setActiveSection((curr) => (curr === -1 ? 0 : -1))}
          className="text-cyan-700 hover:text-cyan-800 font-semibold"
        >
          {activeSection === -1 ? 'Expandir Seção Atual' : 'Recolher Todas'}
        </button>
      </div>

      {/* 20 Progressive & Recollapsible Sections */}
      <div className="space-y-3">
        {/* ==========================================
            1. Contexto da admissão
        ========================================== */}
        <ClinicalSection
          index={0}
          title="Contexto da Admissão"
          status={sectionStatuses[0]}
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Momento / Ação Inicial"
              value={form.context.moment}
              options={[{ value: 'Admito/Recebo paciente', label: 'Admito / Recebo paciente' }]}
              onChange={(val) => updateContext({ moment: val as any })}
            />

            <ClinicalOptionGroup
              label="Local da Admissão"
              value={form.context.location}
              options={[
                { value: 'Sala Vermelha', label: 'Sala Vermelha' },
                { value: 'Sala Amarela', label: 'Sala Amarela' },
                { value: 'Sala Verde', label: 'Sala Verde' },
                { value: 'Observação', label: 'Observação' },
                { value: 'Box', label: 'Box' },
                { value: 'Leito', label: 'Leito' },
                { value: 'Outro', label: 'Outro' },
              ]}
              onChange={(val) => updateContext({ location: val as any })}
            />
            {form.context.location === 'Outro' && (
              <ClinicalTextInput
                label="Especificar Local"
                value={form.context.locationCustom || ''}
                onChange={(val) => updateContext({ locationCustom: val })}
                placeholder="Ex: Sala de Emergência 2"
              />
            )}

            <ClinicalOptionGroup
              label="Acompanhamento na Entrada"
              value={form.context.accompaniment}
              options={[
                { value: 'Desacompanhado', label: 'Desacompanhado' },
                { value: 'Familiar', label: 'Familiar' },
                { value: 'Responsável', label: 'Responsável' },
                { value: 'Cuidador', label: 'Cuidador' },
                { value: 'Equipe assistencial', label: 'Equipe assistencial' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateContext({ accompaniment: val as any })}
            />
            {form.context.accompaniment === 'Outro' && (
              <ClinicalTextInput
                label="Especificar Acompanhante"
                value={form.context.accompanimentCustom || ''}
                onChange={(val) => updateContext({ accompanimentCustom: val })}
                placeholder="Ex: Vizinho / Terceiro (sem inserir nomes próprios)"
              />
            )}
          </div>
        </ClinicalSection>

        {/* ==========================================
            2. Procedência e forma de chegada
        ========================================== */}
        <ClinicalSection
          index={1}
          title="Procedência e Forma de Chegada"
          status={sectionStatuses[1]}
          isOpen={activeSection === 1}
          onToggle={() => toggleSection(1)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Procedência do Paciente"
              value={form.origin.patientOrigin}
              options={[
                { value: 'Domicílio', label: 'Domicílio' },
                { value: 'SAMU', label: 'SAMU' },
                { value: 'Corpo de Bombeiros', label: 'Corpo de Bombeiros' },
                { value: 'UPA', label: 'UPA' },
                { value: 'Unidade Básica de Saúde', label: 'UBS' },
                { value: 'Outro hospital', label: 'Outro hospital' },
                { value: 'Outro setor da instituição', label: 'Outro setor' },
                { value: 'Instituição de longa permanência', label: 'ILPI / Asilo' },
                { value: 'Clínica', label: 'Clínica' },
                { value: 'Transferência inter-hospitalar', label: 'Transferência' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateOrigin({ patientOrigin: val as any })}
            />
            {form.origin.patientOrigin === 'Outro' && (
              <ClinicalTextInput
                label="Especificar Procedência"
                value={form.origin.originCustom || ''}
                onChange={(val) => updateOrigin({ originCustom: val })}
                placeholder="Ex: Via pública"
              />
            )}

            <ClinicalMultiSelect
              label="Forma de Chegada ao Setor (seleção múltipla permitida)"
              values={form.origin.arrivalModes}
              options={[
                { value: 'Deambulando', label: 'Deambulando' },
                { value: 'Cadeira de rodas', label: 'Cadeira de rodas' },
                { value: 'Maca', label: 'Maca' },
                { value: 'Ambulância', label: 'Ambulância' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(vals) => updateOrigin({ arrivalModes: vals })}
            />
            {form.origin.arrivalModes.includes('Outro') && (
              <ClinicalTextInput
                label="Especificar Forma de Chegada"
                value={form.origin.arrivalModesCustom || ''}
                onChange={(val) => updateOrigin({ arrivalModesCustom: val })}
                placeholder="Ex: Nos braços do responsável"
              />
            )}

            <ClinicalOptionGroup
              label="Transporte Acompanhado por Equipe de Resgate / Transporte?"
              value={form.origin.accompaniedByTransportTeam}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Sim', label: 'Sim' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateOrigin({ accompaniedByTransportTeam: val as any })}
            />

            {form.origin.accompaniedByTransportTeam === 'Sim' && (
              <ClinicalOptionGroup
                label="Tipo da Equipe de Transporte"
                value={form.origin.transportTeamType || ''}
                options={[
                  { value: 'SAMU', label: 'SAMU' },
                  { value: 'Bombeiros', label: 'Corpo de Bombeiros' },
                  { value: 'Ambulância particular', label: 'Ambulância particular' },
                  { value: 'Equipe institucional', label: 'Equipe institucional' },
                  { value: 'Outra', label: 'Outra' },
                ]}
                onChange={(val) => updateOrigin({ transportTeamType: val as any })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* ==========================================
            3. Identificação e segurança
        ========================================== */}
        <ClinicalSection
          index={2}
          title="Identificação e Segurança"
          status={sectionStatuses[2]}
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Pulseira de Identificação Conferida?"
              value={form.identification.wristbandChecked}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
                { value: 'Não se aplica', label: 'Não se aplica' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateId({ wristbandChecked: val as any })}
            />

            <ClinicalOptionGroup
              label="Placa de Identificação do Leito Conferida?"
              value={form.identification.bedSignChecked}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
                { value: 'Não se aplica', label: 'Não se aplica' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateId({ bedSignChecked: val as any })}
            />

            <ClinicalOptionGroup
              label="Alergias Referidas"
              value={form.identification.allergies}
              options={[
                { value: 'Não referidas', label: 'Não referidas' },
                { value: 'Sim', label: 'Sim' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateId({ allergies: val as any })}
            />
            {form.identification.allergies === 'Sim' && (
              <ClinicalTextInput
                label="Alergia(s) Informada(s)"
                value={form.identification.allergiesDetails || ''}
                onChange={(val) => updateId({ allergiesDetails: val })}
                placeholder="Ex: Dipirona, iodo, penicilina"
              />
            )}

            <ClinicalOptionGroup
              label="Tipo de Precaução"
              value={form.identification.precaution}
              options={[
                { value: 'Padrão', label: 'Padrão' },
                { value: 'Contato', label: 'Contato' },
                { value: 'Gotículas', label: 'Gotículas' },
                { value: 'Aerossóis', label: 'Aerossóis' },
                { value: 'Outra', label: 'Outra' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateId({ precaution: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            4. Informações referidas
        ========================================== */}
        <ClinicalSection
          index={3}
          title="Informações Referidas"
          status={sectionStatuses[3]}
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
        >
          <div className="space-y-4">
            <ClinicalTextInput
              label="Motivo Informado da Admissão / Atendimento"
              value={form.reportedInformation.admissionReason || ''}
              onChange={(val) => updateRep({ admissionReason: val })}
              placeholder="Ex: dor torácica, queda da própria altura, dispneia (sem formular diagnóstico)"
            />

            <ClinicalTextInput
              label="Comorbidades Previamente Informadas"
              value={form.reportedInformation.relevantComorbidities || ''}
              onChange={(val) => updateRep({ relevantComorbidities: val })}
              placeholder="Ex: HAS, DM2, cardiopatia"
            />

            <ClinicalOptionGroup
              label="Queixas no Momento da Admissão"
              value={form.reportedInformation.complaints}
              options={[
                { value: 'Sem queixas referidas no momento', label: 'Sem queixas referidas no momento' },
                { value: 'Com queixa', label: 'Com queixa' },
                { value: 'Impossibilitado de informar', label: 'Impossibilitado de informar' },
                { value: 'Não avaliado', label: 'Não avaliado' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateRep({ complaints: val as any })}
            />
            {form.reportedInformation.complaints === 'Com queixa' && (
              <ClinicalTextInput
                label="Detalhe da Queixa Informada"
                value={form.reportedInformation.complaintsDetails || ''}
                onChange={(val) => updateRep({ complaintsDetails: val })}
                placeholder="Ex: dor em hipocôndrio direito"
              />
            )}

            <ClinicalOptionGroup
              label="Fonte da Informação"
              value={form.reportedInformation.informationSource}
              options={[
                { value: 'Paciente', label: 'Paciente' },
                { value: 'Acompanhante', label: 'Acompanhante' },
                { value: 'Equipe de origem', label: 'Equipe de origem / resgate' },
                { value: 'Documento/encaminhamento', label: 'Documento de encaminhamento' },
                { value: 'Outra', label: 'Outra' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateRep({ informationSource: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            5. Condições observadas na chegada
        ========================================== */}
        <ClinicalSection
          index={4}
          title="Condições Observadas na Chegada"
          status={sectionStatuses[4]}
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Comportamento Observado"
              values={form.arrivalCondition.behavior}
              options={[
                { value: 'Calmo', label: 'Calmo' },
                { value: 'Cooperativo', label: 'Cooperativo' },
                { value: 'Agitado', label: 'Agitado' },
                { value: 'Ansioso', label: 'Ansioso' },
                { value: 'Choroso', label: 'Choroso' },
                { value: 'Inquieto', label: 'Inquieto' },
                { value: 'Hipoativo', label: 'Hipoativo' },
                { value: 'Sonolento', label: 'Sonolento' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não avaliado', label: 'Não avaliado' },
              ]}
              onChange={(vals) => updateArr({ behavior: vals })}
            />

            <ClinicalOptionGroup
              label="Condição de Higiene Observada"
              value={form.arrivalCondition.hygiene}
              options={[
                { value: 'Preservada', label: 'Preservada' },
                { value: 'Necessita cuidados', label: 'Necessita cuidados' },
                { value: 'Higiene prejudicada', label: 'Higiene prejudicada' },
                { value: 'Não avaliada', label: 'Não avaliada' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateArr({ hygiene: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            6. Sinais vitais e dor
        ========================================== */}
        <ClinicalSection
          index={5}
          title="Sinais Vitais e Dor"
          status={sectionStatuses[5]}
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <ClinicalTextInput
                label="PA Sistólica (mmHg)"
                value={form.vitalSigns.systolicBP || ''}
                onChange={(val) => updateVitals({ systolicBP: val })}
                placeholder="Ex: 120"
              />
              <ClinicalTextInput
                label="PA Diastólica (mmHg)"
                value={form.vitalSigns.diastolicBP || ''}
                onChange={(val) => updateVitals({ diastolicBP: val })}
                placeholder="Ex: 80"
              />
              <ClinicalTextInput
                label="PAM (mmHg)"
                value={form.vitalSigns.meanArterialPressure || ''}
                onChange={(val) => updateVitals({ meanArterialPressure: val })}
                placeholder="Ex: 93"
              />
              <ClinicalTextInput
                label="FC (bpm)"
                value={form.vitalSigns.heartRate || ''}
                onChange={(val) => updateVitals({ heartRate: val })}
                placeholder="Ex: 78"
              />
              <ClinicalTextInput
                label="FR (irpm)"
                value={form.vitalSigns.respiratoryRate || ''}
                onChange={(val) => updateVitals({ respiratoryRate: val })}
                placeholder="Ex: 16"
              />
              <ClinicalTextInput
                label="SpO₂ (%)"
                value={form.vitalSigns.oxygenSaturation || ''}
                onChange={(val) => updateVitals({ oxygenSaturation: val })}
                placeholder="Ex: 98"
              />
              <ClinicalTextInput
                label="Temperatura (°C)"
                value={form.vitalSigns.temperature || ''}
                onChange={(val) => updateVitals({ temperature: val })}
                placeholder="Ex: 36.4"
              />
            </div>

            <div className="pt-3 border-t border-slate-200/80">
              <ClinicalOptionGroup
                label="Avaliação de Dor na Entrada"
                value={form.pain.assessmentType}
                options={[
                  { value: 'Escala numérica 0–10', label: 'Escala numérica 0–10' },
                  { value: 'Outra escala', label: 'Outra escala' },
                  { value: 'Não avaliável', label: 'Não avaliável' },
                  { value: 'Não avaliada', label: 'Não avaliada' },
                  { value: 'Não informado', label: 'Não informado' },
                ]}
                onChange={(val) => updatePain({ assessmentType: val as any })}
              />

              {form.pain.assessmentType === 'Escala numérica 0–10' && (
                <div className="mt-3 space-y-3">
                  <ClinicalNumericInput
                    label="Intensidade da Dor (0 a 10)"
                    value={form.pain.numericScaleValue}
                    min={0}
                    max={10}
                    onChange={(val) => updatePain({ numericScaleValue: val === '' ? undefined : Number(val) })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ClinicalTextInput
                      label="Localização da Dor"
                      value={form.pain.location || ''}
                      onChange={(val) => updatePain({ location: val })}
                      placeholder="Ex: abdome, membro inferior direito"
                    />
                    <ClinicalTextInput
                      label="Característica / Tipo de Dor"
                      value={form.pain.characteristics || ''}
                      onChange={(val) => updatePain({ characteristics: val })}
                      placeholder="Ex: em pontada, em cólica, queimação"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* ==========================================
            7. Neurológico
        ========================================== */}
        <ClinicalSection
          index={6}
          title="Neurológico"
          status={sectionStatuses[6]}
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
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
                { value: 'Outro', label: 'Outro' },
                { value: 'Não avaliado', label: 'Não avaliado' },
              ]}
              onChange={(val) => updateNeuro({ consciousnessLevel: val as any })}
            />

            <ClinicalOptionGroup
              label="Orientação"
              value={form.neurological.orientation}
              options={[
                { value: 'Orientado em tempo e espaço', label: 'Orientado em tempo e espaço' },
                { value: 'Parcialmente orientado', label: 'Parcialmente orientado' },
                { value: 'Desorientado', label: 'Desorientado' },
                { value: 'Não avaliável', label: 'Não avaliável' },
                { value: 'Não avaliado', label: 'Não avaliado' },
              ]}
              onChange={(val) => updateNeuro({ orientation: val as any })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escala de Coma de Glasgow (3 a 15)
                </label>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={form.neurological.glasgowScore !== undefined ? form.neurological.glasgowScore : ''}
                  onChange={(e) => {
                    const v = e.target.value ? Number(e.target.value) : undefined;
                    updateNeuro({ glasgowType: v !== undefined ? 'score' : 'not_applied', glasgowScore: v });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900"
                  placeholder="3 a 15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escala RASS (-5 a +4)
                </label>
                <input
                  type="number"
                  min={-5}
                  max={4}
                  value={form.neurological.rassScore !== undefined ? form.neurological.rassScore : ''}
                  onChange={(e) => {
                    const v = e.target.value !== '' ? Number(e.target.value) : undefined;
                    updateNeuro({ rassType: v !== undefined ? 'score' : 'not_applied', rassScore: v });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900"
                  placeholder="-5 a +4"
                />
              </div>
            </div>
          </div>
        </ClinicalSection>

        {/* ==========================================
            8. Respiratório
        ========================================== */}
        <ClinicalSection
          index={7}
          title="Respiratório"
          status={sectionStatuses[7]}
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Suporte Ventilatório na Admissão"
              value={form.respiratory.respiratorySupport}
              options={[
                { value: 'Ar ambiente', label: 'Ar ambiente' },
                { value: 'Oxigenoterapia', label: 'Oxigenoterapia' },
                { value: 'VNI', label: 'VNI' },
                { value: 'VMI', label: 'VMI' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateResp({ respiratorySupport: val as any })}
            />

            {form.respiratory.respiratorySupport === 'Oxigenoterapia' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Dispositivo de Oxigênio"
                  value={form.respiratory.oxygenDevice || ''}
                  onChange={(val) => updateResp({ oxygenDevice: val })}
                  placeholder="Ex: Cateter nasal, Máscara de Venturi"
                />
                <ClinicalTextInput
                  label="Fluxo (L/min)"
                  value={form.respiratory.oxygenFlowRate || ''}
                  onChange={(val) => updateResp({ oxygenFlowRate: val })}
                  placeholder="Ex: 3"
                />
              </div>
            )}

            {form.respiratory.respiratorySupport === 'VMI' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalOptionGroup
                  label="Via Aérea Artificial"
                  value={form.respiratory.vmiAirway || ''}
                  options={[
                    { value: 'TOT', label: 'TOT' },
                    { value: 'Traqueostomia', label: 'Traqueostomia' },
                    { value: 'Outro', label: 'Outro' },
                  ]}
                  onChange={(val) => updateResp({ vmiAirway: val as any })}
                />
                <ClinicalTextInput
                  label="Calibre"
                  value={form.respiratory.vmiCaliber || ''}
                  onChange={(val) => updateResp({ vmiCaliber: val })}
                  placeholder="Ex: 7.5"
                />
              </div>
            )}

            <ClinicalOptionGroup
              label="Padrão Respiratório"
              value={form.respiratory.respiratoryPattern}
              options={[
                { value: 'Eupneico', label: 'Eupneico' },
                { value: 'Taquipneico', label: 'Taquipneico' },
                { value: 'Bradipneico', label: 'Bradipneico' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não avaliado', label: 'Não avaliado' },
              ]}
              onChange={(val) => updateResp({ respiratoryPattern: val as any })}
            />

            <ClinicalOptionGroup
              label="Sinais Observados de Desconforto Respiratório"
              value={form.respiratory.respiratoryDistress}
              options={[
                { value: 'Ausente', label: 'Ausente' },
                { value: 'Presente', label: 'Presente' },
                { value: 'Não avaliado', label: 'Não avaliado' },
              ]}
              onChange={(val) => updateResp({ respiratoryDistress: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            9. Cardiovascular / Perfusão
        ========================================== */}
        <ClinicalSection
          index={8}
          title="Cardiovascular / Perfusão"
          status={sectionStatuses[8]}
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Perfusão Periférica"
              value={form.cardiovascular.peripheralPerfusion}
              options={[
                { value: 'Adequada', label: 'Adequada' },
                { value: 'Reduzida', label: 'Reduzida' },
                { value: 'Não avaliada', label: 'Não avaliada' },
              ]}
              onChange={(val) => updateCardio({ peripheralPerfusion: val as any })}
            />

            <ClinicalOptionGroup
              label="Extremidades"
              value={form.cardiovascular.extremities}
              options={[
                { value: 'Quentes', label: 'Quentes' },
                { value: 'Frias', label: 'Frias' },
                { value: 'Outra', label: 'Outra' },
                { value: 'Não avaliadas', label: 'Não avaliadas' },
              ]}
              onChange={(val) => updateCardio({ extremities: val as any })}
            />

            <ClinicalOptionGroup
              label="Tempo de Enchimento Capilar (TEC)"
              value={form.cardiovascular.capillaryRefillTime}
              options={[
                { value: '< 3 segundos', label: '< 3 segundos' },
                { value: '≥ 3 segundos', label: '≥ 3 segundos' },
                { value: 'Informar valor', label: 'Informar valor em segundos' },
                { value: 'Não avaliado', label: 'Não avaliado' },
              ]}
              onChange={(val) => updateCardio({ capillaryRefillTime: val as any })}
            />
            {form.cardiovascular.capillaryRefillTime === 'Informar valor' && (
              <ClinicalTextInput
                label="Valor do TEC (segundos)"
                value={form.cardiovascular.capillaryRefillTimeValue || ''}
                onChange={(val) => updateCardio({ capillaryRefillTimeValue: val })}
                placeholder="Ex: 2"
              />
            )}

            <ClinicalOptionGroup
              label="Edema"
              value={form.cardiovascular.edema}
              options={[
                { value: 'Ausente', label: 'Ausente' },
                { value: 'Presente', label: 'Presente' },
                { value: 'Não avaliado', label: 'Não avaliado' },
              ]}
              onChange={(val) => updateCardio({ edema: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            10. Nutrição e gastrointestinal
        ========================================== */}
        <ClinicalSection
          index={9}
          title="Nutrição e Gastrointestinal"
          status={sectionStatuses[9]}
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Status Nutricional na Admissão"
              value={form.nutrition.status}
              options={[
                { value: 'Dieta por via oral', label: 'Dieta por via oral' },
                { value: 'Dieta enteral', label: 'Dieta enteral' },
                { value: 'Jejum', label: 'Jejum' },
                { value: 'Dieta parenteral', label: 'Dieta parenteral' },
                { value: 'Não informado', label: 'Não informado' },
                { value: 'Outro', label: 'Outro' },
              ]}
              onChange={(val) => updateNut({ status: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            11. Eliminações
        ========================================== */}
        <ClinicalSection
          index={10}
          title="Eliminações"
          status={sectionStatuses[10]}
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Diurese"
              value={form.elimination.diuresis}
              options={[
                { value: 'Presente', label: 'Presente' },
                { value: 'Oligúrica', label: 'Oligúrica' },
                { value: 'Anúrica', label: 'Anúrica' },
                { value: 'Não avaliada', label: 'Não avaliada' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateElim({ diuresis: val as any })}
            />

            <ClinicalOptionGroup
              label="Via Urinária"
              value={form.elimination.urinaryRoute}
              options={[
                { value: 'Espontânea', label: 'Espontânea' },
                { value: 'SVD', label: 'SVD' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateElim({ urinaryRoute: val as any })}
            />

            <ClinicalOptionGroup
              label="Evacuação / Eliminação Intestinal na Chegada"
              value={form.elimination.bowelMovement}
              options={[
                { value: 'Presente', label: 'Presente' },
                { value: 'Ausente', label: 'Ausente / Sem relato' },
                { value: 'Não avaliada', label: 'Não avaliada' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateElim({ bowelMovement: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            12. Dispositivos já presentes na admissão
        ========================================== */}
        <ClinicalSection
          index={11}
          title="Dispositivos Já Presentes na Admissão"
          status={sectionStatuses[11]}
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Registre aqui apenas os dispositivos invasivos que o paciente <strong>já trazia na chegada</strong> (ex: AVP, CVC, SVD, TOT, etc.).
            </div>

            {form.existingDevices.list.map((dev, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Dispositivo #{idx + 1}: {dev.type} ({dev.location})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExistingDevice(idx)}
                    className="text-rose-600 hover:text-rose-800 p-1 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
                <DeviceFormCard
                  device={dev}
                  onChange={(updated) => updateExistingDevice(idx, updated)}
                  onRemove={() => removeExistingDevice(idx)}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addExistingDevice}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-600 text-slate-700 hover:text-cyan-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors bg-slate-50/50"
            >
              <Plus className="w-4 h-4" /> Adicionar Dispositivo Já Presente na Admissão
            </button>
          </div>
        </ClinicalSection>

        {/* ==========================================
            13. Pele e integridade cutânea
        ========================================== */}
        <ClinicalSection
          index={12}
          title="Pele e Integridade Cutânea"
          status={sectionStatuses[12]}
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Integridade da Pele"
              value={form.skin.integrity}
              options={[
                { value: 'Íntegra', label: 'Íntegra' },
                { value: 'Com alteração/lesão', label: 'Com alteração/lesão' },
                { value: 'Não avaliada', label: 'Não avaliada' },
              ]}
              onChange={(val) => updateSkin({ integrity: val as any })}
            />

            {form.skin.integrity === 'Com alteração/lesão' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Localização da Lesão"
                  value={form.skin.lesionLocation || ''}
                  onChange={(val) => updateSkin({ lesionLocation: val })}
                  placeholder="Ex: região sacra, calcâneo direito"
                />
                <ClinicalTextInput
                  label="Descrição / Detalhes"
                  value={form.skin.lesionDescription || ''}
                  onChange={(val) => updateSkin({ lesionDescription: val })}
                  placeholder="Ex: escoriação, lesão por pressão"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* ==========================================
            14. Mobilidade e segurança
        ========================================== */}
        <ClinicalSection
          index={13}
          title="Mobilidade e Segurança"
          status={sectionStatuses[13]}
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Mobilidade na Chegada"
              value={form.mobility.condition}
              options={[
                { value: 'Deambula sem auxílio', label: 'Deambula sem auxílio' },
                { value: 'Deambula com auxílio', label: 'Deambula com auxílio' },
                { value: 'Cadeira de rodas', label: 'Cadeira de rodas' },
                { value: 'Em maca', label: 'Em maca' },
                { value: 'Restrito ao leito', label: 'Restrito ao leito' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não avaliada', label: 'Não avaliada' },
              ]}
              onChange={(val) => updateMob({ condition: val as any })}
            />

            <ClinicalOptionGroup
              label="Grades de Proteção Elevadas?"
              value={form.mobility.bedRailsUsed}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateMob({ bedRailsUsed: val as any })}
            />

            <ClinicalOptionGroup
              label="Cabeceira Elevada?"
              value={form.mobility.headOfBedElevated}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateMob({ headOfBedElevated: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            15. Higiene e banho na admissão
        ========================================== */}
        <ClinicalSection
          index={14}
          title="Higiene e Banho na Admissão"
          status={sectionStatuses[14]}
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Banho Realizado Durante a Admissão?"
              value={form.hygiene.bathPerformed}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Banho no leito', label: 'Banho no leito' },
                { value: 'Banho de aspersão', label: 'Banho de aspersão' },
                { value: 'Banho de aspersão com auxílio', label: 'Aspersão com auxílio' },
                { value: 'Banho independente', label: 'Banho independente' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateHyg({ bathPerformed: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            16. Cuidados realizados na admissão
        ========================================== */}
        <ClinicalSection
          index={15}
          title="Cuidados Realizados na Admissão"
          status={sectionStatuses[15]}
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Marque somente os cuidados que foram <strong>efetivamente prestados</strong> na admissão.
            </div>

            <ClinicalMultiSelect
              label="Cuidados Executados"
              values={form.admissionCare.careItems}
              options={[
                { value: 'Acomodação no leito', label: 'Acomodação no leito' },
                { value: 'Orientações iniciais conforme rotina institucional', label: 'Orientações iniciais' },
                { value: 'Monitorização de sinais vitais', label: 'Monitorização de sinais vitais' },
                { value: 'Instalação de monitorização multiparamétrica', label: 'Monitorização multiparamétrica' },
                { value: 'Administração de medicamentos conforme prescrição', label: 'Administração de medicamentos' },
                { value: 'Instalação/troca de soroterapia', label: 'Instalação/troca de soroterapia' },
                { value: 'Cuidados com dispositivos', label: 'Cuidados com dispositivos' },
                { value: 'Higiene corporal', label: 'Higiene corporal' },
                { value: 'Higiene oral', label: 'Higiene oral' },
                { value: 'Mudança de decúbito', label: 'Mudança de decúbito' },
                { value: 'Aspiração de vias aéreas', label: 'Aspiração de vias aéreas' },
                { value: 'Controle de balanço hídrico', label: 'Controle de balanço hídrico' },
                { value: 'Coleta de exames laboratoriais', label: 'Coleta de exames' },
                { value: 'Curativo', label: 'Curativo' },
                { value: 'Cabeceira elevada', label: 'Cabeceira elevada' },
                { value: 'Grades de proteção elevadas', label: 'Grades de proteção elevadas' },
              ]}
              onChange={(vals) => updateCare({ careItems: vals })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            17. Dispositivos instalados durante a admissão
        ========================================== */}
        <ClinicalSection
          index={16}
          title="Dispositivos Instalados na Admissão"
          status={sectionStatuses[16]}
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Foi realizada punção ou instalação de dispositivo durante o atendimento de admissão?"
              value={form.installedDevices.installedInAdmission}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Sim', label: 'Sim' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  installedDevices: { ...prev.installedDevices, installedInAdmission: val as any },
                }))
              }
            />

            {form.installedDevices.installedInAdmission === 'Sim' && (
              <div className="space-y-3 pt-2">
                {form.installedDevices.list.map((dev, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Dispositivo Instalado #{idx + 1}: {dev.type} ({dev.location})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeInstalledDevice(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    </div>
                    <DeviceFormCard
                      device={dev}
                      onChange={(updated) => updateInstalledDevice(idx, updated)}
                      onRemove={() => removeInstalledDevice(idx)}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addInstalledDevice}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-cyan-300 hover:border-cyan-600 text-cyan-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors bg-cyan-50/50"
                >
                  <Plus className="w-4 h-4" /> Adicionar Dispositivo Instalado Durante a Admissão
                </button>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* ==========================================
            18. Pertences
        ========================================== */}
        <ClinicalSection
          index={17}
          title="Pertences do Paciente"
          status={sectionStatuses[17]}
          isOpen={activeSection === 17}
          onToggle={() => toggleSection(17)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Destino dos Pertences na Admissão"
              value={form.belongings.status}
              options={[
                { value: 'Sem pertences informados', label: 'Sem pertences informados' },
                { value: 'Pertences permanecem com paciente', label: 'Permanecem com o paciente' },
                { value: 'Entregues ao acompanhante/responsável', label: 'Entregues ao acompanhante' },
                { value: 'Entregues conforme rotina institucional', label: 'Rotina institucional' },
                { value: 'Outro', label: 'Outro' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateBel({ status: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* ==========================================
            19. Intercorrências e comunicação
        ========================================== */}
        <ClinicalSection
          index={18}
          title="Intercorrências e Comunicação"
          status={sectionStatuses[18]}
          isOpen={activeSection === 18}
          onToggle={() => toggleSection(18)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Intercorrência Durante a Admissão?"
              value={form.complications.hasComplication}
              options={[
                { value: 'Não', label: 'Não (Sem intercorrências)' },
                { value: 'Sim', label: 'Sim' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(val) => updateComp({ hasComplication: val as any })}
            />

            {form.complications.hasComplication === 'Sim' && (
              <div className="space-y-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Horário da Ocorrência"
                    value={form.complications.time || ''}
                    onChange={(val) => updateComp({ time: val })}
                    placeholder="Ex: 14:30"
                  />
                  <ClinicalTextInput
                    label="Descrição da Intercorrência"
                    value={form.complications.description || ''}
                    onChange={(val) => updateComp({ description: val })}
                    placeholder="Ex: episódio de êmese, pico hipertensivo"
                  />
                </div>
                <ClinicalTextInput
                  label="Condutas / Ações Imediatas Realizadas"
                  value={form.complications.actionsTaken || ''}
                  onChange={(val) => updateComp({ actionsTaken: val })}
                  placeholder="Ex: decúbito lateralizado, aspiração, sinais aferidos"
                />
                <ClinicalTextInput
                  label="Resposta Observada do Paciente"
                  value={form.complications.patientResponse || ''}
                  onChange={(val) => updateComp({ patientResponse: val })}
                  placeholder="Ex: quadro estabilizado"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-200">
              <ClinicalOptionGroup
                label="Houve Comunicação Assistencial Imediata?"
                value={form.communications.communicationNeeded}
                options={[
                  { value: 'Não', label: 'Não' },
                  { value: 'Sim', label: 'Sim' },
                  { value: 'Não informado', label: 'Não informado' },
                ]}
                onChange={(val) => updateComm({ communicationNeeded: val as any })}
              />

              {form.communications.communicationNeeded === 'Sim' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <ClinicalOptionGroup
                    label="Profissional / Equipe Comunicada"
                    value={form.communications.professionalType || ''}
                    options={[
                      { value: 'Enfermeiro responsável', label: 'Enfermeiro responsável' },
                      { value: 'Equipe médica', label: 'Equipe médica' },
                      { value: 'Outra equipe', label: 'Outra equipe' },
                      { value: 'Outro profissional', label: 'Outro profissional' },
                    ]}
                    onChange={(val) => updateComm({ professionalType: val as any })}
                  />
                  <ClinicalTextInput
                    label="Horário da Comunicação"
                    value={form.communications.time || ''}
                    onChange={(val) => updateComm({ time: val })}
                    placeholder="Ex: 14:40"
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* ==========================================
            20. Situação após admissão e informações adicionais
        ========================================== */}
        <ClinicalSection
          index={19}
          title="Situação Final e Informações Adicionais"
          status={sectionStatuses[19]}
          isOpen={activeSection === 19}
          onToggle={() => toggleSection(19)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Situação do Paciente Após a Admissão"
              values={form.finalStatus.conditions}
              options={[
                { value: 'Permanece no setor sob cuidados', label: 'Permanece no setor sob cuidados' },
                { value: 'Mantido em monitorização', label: 'Mantido em monitorização' },
                { value: 'Encaminhado para outro setor', label: 'Encaminhado para outro setor' },
                { value: 'Transferência em andamento', label: 'Transferência em andamento' },
                { value: 'Outra situação', label: 'Outra situação' },
                { value: 'Não informado', label: 'Não informado' },
              ]}
              onChange={(vals) => updateFinal({ conditions: vals })}
            />

            <ClinicalTextarea
              label="Informações Adicionais / Observações Objetivas"
              value={form.additionalInformation}
              onChange={(val) => setForm((prev) => ({ ...prev, additionalInformation: val }))}
              placeholder="Registre outras observações pontuais e objetivas observadas durante o atendimento."
              rows={3}
            />
          </div>
        </ClinicalSection>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200/90 shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600 hidden sm:block">
            {consistencyAlerts.length > 0 ? (
              <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {consistencyAlerts.length} alerta(s) não impeditivo(s)
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Dados consistentes
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar e Visualizar Anotação de Admissão</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
