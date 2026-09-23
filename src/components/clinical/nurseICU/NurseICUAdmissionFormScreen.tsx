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
  NurseICUAdmissionForm,
  createInitialNurseICUAdmissionForm,
  NurseICUVasoactiveDrugItem,
  NurseICUSedationItem,
  NurseICUInvasiveDeviceItem,
} from '../../../types/nurseICUAdmission';
import {
  normalizeNurseICUAdmissionForm,
  validateNurseICUAdmissionConsistency,
} from '../../../engine/nurseICUAdmissionFactBuilder';
import { NurseICUAdmissionPreviewView } from './NurseICUAdmissionPreviewView';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface NurseICUAdmissionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const NurseICUAdmissionFormScreen: React.FC<NurseICUAdmissionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Admissão de Enfermagem — UTI" onNavigateHome={props.onBack}>
      <NurseICUAdmissionFormContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const NurseICUAdmissionFormContent: React.FC<NurseICUAdmissionFormScreenProps> = ({
  onBack,
  patientAreaName = 'UTI',
}) => {
  const [form, setForm] = useState<NurseICUAdmissionForm>(() => createInitialNurseICUAdmissionForm());
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  const normalizedForm = useMemo(() => normalizeNurseICUAdmissionForm(form), [form]);
  const consistencyResult = useMemo(
    () => validateNurseICUAdmissionConsistency(normalizedForm),
    [normalizedForm]
  );

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? null : idx));
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja limpar todos os campos da admissão de enfermagem de UTI?')) {
      setForm(createInitialNurseICUAdmissionForm());
      setActiveSection(0);
    }
  };

  // Helper updates
  const updateSection = <K extends keyof NurseICUAdmissionForm>(
    key: K,
    patch: Partial<NurseICUAdmissionForm[K]>
  ) => {
    setForm((p) => ({
      ...p,
      [key]: {
        ...(p[key] as any),
        ...patch,
      },
    }));
  };

  // Vasoactive drugs management
  const addVasoactiveDrug = () => {
    const newDrug: NurseICUVasoactiveDrugItem = {
      drugName: '',
      concentration: '',
      flowRate: '',
      rateUnit: 'mL/h',
      route: 'CVC',
    };
    setForm((p) => ({
      ...p,
      vasoactiveDrugs: {
        ...p.vasoactiveDrugs,
        drugs: [...p.vasoactiveDrugs.drugs, newDrug],
      },
    }));
  };

  const updateVasoactiveDrug = (index: number, patch: Partial<NurseICUVasoactiveDrugItem>) => {
    setForm((p) => {
      const list = [...p.vasoactiveDrugs.drugs];
      list[index] = { ...list[index], ...patch };
      return {
        ...p,
        vasoactiveDrugs: { ...p.vasoactiveDrugs, drugs: list },
      };
    });
  };

  const removeVasoactiveDrug = (index: number) => {
    setForm((p) => ({
      ...p,
      vasoactiveDrugs: {
        ...p.vasoactiveDrugs,
        drugs: p.vasoactiveDrugs.drugs.filter((_, i) => i !== index),
      },
    }));
  };

  // Sedation management
  const addSedation = () => {
    const newSed: NurseICUSedationItem = {
      drugName: '',
      flowRate: '',
      rateUnit: 'mL/h',
      indication: '',
    };
    setForm((p) => ({
      ...p,
      sedationAnalgesia: {
        ...p.sedationAnalgesia,
        continuousInfusions: [...p.sedationAnalgesia.continuousInfusions, newSed],
      },
    }));
  };

  const updateSedation = (index: number, patch: Partial<NurseICUSedationItem>) => {
    setForm((p) => {
      const list = [...p.sedationAnalgesia.continuousInfusions];
      list[index] = { ...list[index], ...patch };
      return {
        ...p,
        sedationAnalgesia: { ...p.sedationAnalgesia, continuousInfusions: list },
      };
    });
  };

  const removeSedation = (index: number) => {
    setForm((p) => ({
      ...p,
      sedationAnalgesia: {
        ...p.sedationAnalgesia,
        continuousInfusions: p.sedationAnalgesia.continuousInfusions.filter((_, i) => i !== index),
      },
    }));
  };

  // Invasive device management
  const addInvasiveDevice = () => {
    const newDev: NurseICUInvasiveDeviceItem = {
      deviceType: 'AVP',
      anatomicalSite: '',
      insertionSide: 'direito',
      permeability: 'permeável',
      functioningStatus: 'em funcionamento',
      dressingCondition: 'limpo e seco',
    };
    setForm((p) => ({
      ...p,
      invasiveDevices: {
        ...p.invasiveDevices,
        devices: [...p.invasiveDevices.devices, newDev],
      },
    }));
  };

  const updateInvasiveDevice = (index: number, patch: Partial<NurseICUInvasiveDeviceItem>) => {
    setForm((p) => {
      const list = [...p.invasiveDevices.devices];
      list[index] = { ...list[index], ...patch };
      return {
        ...p,
        invasiveDevices: { ...p.invasiveDevices, devices: list },
      };
    });
  };

  const removeInvasiveDevice = (index: number) => {
    setForm((p) => ({
      ...p,
      invasiveDevices: {
        ...p.invasiveDevices,
        devices: p.invasiveDevices.devices.filter((_, i) => i !== index),
      },
    }));
  };

  if (viewMode === 'preview') {
    return (
      <NurseICUAdmissionPreviewView
        form={normalizedForm}
        onBackToEdit={() => setViewMode('form')}
        patientAreaName={patientAreaName}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos setores</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Formulário</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Visualizar Admissão</span>
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Admissão de Enfermagem — UTI
              </h1>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Registro admissional estruturado com 32 seções clínicas, suporte avançado, monitorização intensiva e conformidade com o COFEN.
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Perfil Enfermeiro
          </span>
        </div>

        {/* Consistency alerts banner */}
        {consistencyResult.errors.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Avisos de Consistência Clínica ({consistencyResult.errors.length}):</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {consistencyResult.errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Form Accordion Sections */}
      <div className="space-y-3">
        {/* 1. Contexto da admissão */}
        <ClinicalSection
          title="1. Contexto da Admissão"
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
          isFilled={Boolean(form.admissionContext.bedLocation)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Momento de Admissão"
              value={form.admissionContext.moment}
              options={['Admito paciente', 'Recebo paciente', 'Outro']}
              onChange={(v) => updateSection('admissionContext', { moment: v as any })}
            />
            {form.admissionContext.moment === 'Outro' && (
              <ClinicalTextInput
                label="Descreva o momento"
                value={form.admissionContext.customMoment || ''}
                onChange={(v) => updateSection('admissionContext', { customMoment: v })}
                placeholder="Ex: Recebo paciente em leito de UTI pós-PCR..."
              />
            )}
            <ClinicalTextInput
              label="Identificação do Leito / Box"
              value={form.admissionContext.bedLocation}
              onChange={(v) => updateSection('admissionContext', { bedLocation: v })}
              placeholder="Ex: Leito 04, Box 12, Isolamento 01"
            />
          </div>
        </ClinicalSection>

        {/* 2. Origem / Procedência */}
        <ClinicalSection
          title="2. Origem e Procedência"
          isOpen={activeSection === 1}
          onToggle={() => toggleSection(1)}
          isFilled={Boolean(form.origin.patientOrigin)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Procedência"
              value={form.origin.patientOrigin}
              options={['PS', 'Centro cirúrgico', 'Enfermaria', 'UPA', 'Outro']}
              onChange={(v) => updateSection('origin', { patientOrigin: v as any })}
            />
            <ClinicalTextInput
              label="Detalhamento da Origem"
              value={form.origin.originDetails || ''}
              onChange={(v) => updateSection('origin', { originDetails: v })}
              placeholder="Ex: Transferência externa via SAMU, RPA Centro Cirúrgico..."
            />
          </div>
        </ClinicalSection>

        {/* 3. Transporte e Chegada */}
        <ClinicalSection
          title="3. Transporte e Chegada"
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
          isFilled={Boolean(form.arrivalTransport.arrivalMode)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Meio de Chegada"
              value={form.arrivalTransport.arrivalMode}
              options={['maca', 'cadeira de rodas', 'leito', 'ambulância', 'outro']}
              onChange={(v) => updateSection('arrivalTransport', { arrivalMode: v as any })}
            />
            <ClinicalTextInput
              label="Suporte durante Transporte"
              value={form.arrivalTransport.transportSupport || ''}
              onChange={(v) => updateSection('arrivalTransport', { transportSupport: v })}
              placeholder="Ex: sob monitorização cardíaca e O2 contínuo, sem intercorrências..."
            />
          </div>
        </ClinicalSection>

        {/* 4. Identificação e Segurança */}
        <ClinicalSection
          title="4. Identificação e Segurança"
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
          isFilled={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Pulseira de Identificação Conferida"
              value={form.safetyIdentification.wristbandChecked}
              options={['Sim', 'Não']}
              onChange={(v) => updateSection('safetyIdentification', { wristbandChecked: v as any })}
            />
            <ClinicalOptionGroup
              label="Placa de Identificação no Leito"
              value={form.safetyIdentification.bedSignChecked}
              options={['Sim', 'Não']}
              onChange={(v) => updateSection('safetyIdentification', { bedSignChecked: v as any })}
            />
          </div>
        </ClinicalSection>

        {/* 5. Acompanhante */}
        <ClinicalSection
          title="5. Acompanhante"
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Vínculo do Acompanhante (sem identificação nominal)"
              value={form.companion.companionType}
              options={['desacompanhado', 'familiar', 'cuidador', 'equipe de transporte', 'outro']}
              onChange={(v) => updateSection('companion', { companionType: v as any })}
            />
            {form.companion.companionType === 'outro' && (
              <ClinicalTextInput
                label="Descreva o Vínculo"
                value={form.companion.customCompanionType || ''}
                onChange={(v) => updateSection('companion', { customCompanionType: v })}
                placeholder="Ex: acompanhante institucional"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 6. Alergias */}
        <ClinicalSection
          title="6. Alergias"
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Histórico de Alergias"
              value={form.allergies.hasAllergies}
              options={['Nega', 'Sim', 'Não informado']}
              onChange={(v) => updateSection('allergies', { hasAllergies: v as any })}
            />
            {form.allergies.hasAllergies === 'Sim' && (
              <ClinicalTextInput
                label="Substâncias Alergênicas e Manifestações"
                value={form.allergies.allergiesDetails || ''}
                onChange={(v) => updateSection('allergies', { allergiesDetails: v })}
                placeholder="Ex: Dipirona, penicilina, contraste iodado..."
              />
            )}
          </div>
        </ClinicalSection>

        {/* 7. Precauções / Isolamento */}
        <ClinicalSection
          title="7. Precauções e Isolamento"
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Medida de Precaução Institucional"
              value={form.precautions.precautionType}
              options={['Padrão', 'Contato', 'Gotículas', 'Aerossóis', 'Outra']}
              onChange={(v) => updateSection('precautions', { precautionType: v as any })}
            />
            {form.precautions.precautionType === 'Outra' && (
              <ClinicalTextInput
                label="Descreva a Medida de Precaução"
                value={form.precautions.customPrecaution || ''}
                onChange={(v) => updateSection('precautions', { customPrecaution: v })}
                placeholder="Ex: Precaução reversa / protetora"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 8. Motivo Informado da Internação */}
        <ClinicalSection
          title="8. Motivo Informado da Internação"
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
          isFilled={Boolean(form.admissionReason.reasonText)}
        >
          <ClinicalTextarea
            label="Motivo Informado para Internação em UTI"
            value={form.admissionReason.reasonText}
            onChange={(v) => updateSection('admissionReason', { reasonText: v })}
            placeholder="Ex: Pós-operatório imediato de cirurgia cardíaca para monitorização hemodinâmica contínua..."
          />
        </ClinicalSection>

        {/* 9. Histórico Informado */}
        <ClinicalSection
          title="9. Histórico Informado e Comorbidades"
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
          isFilled={Boolean(form.reportedHistory.pastHistoryText || form.reportedHistory.comorbidities)}
        >
          <div className="space-y-4">
            <ClinicalTextInput
              label="Antecedentes Cirúrgicos / Clínicos"
              value={form.reportedHistory.pastHistoryText || ''}
              onChange={(v) => updateSection('reportedHistory', { pastHistoryText: v })}
              placeholder="Ex: Revascularização prévia em 2021, colecistectomia..."
            />
            <ClinicalTextInput
              label="Comorbidades Informadas"
              value={form.reportedHistory.comorbidities || ''}
              onChange={(v) => updateSection('reportedHistory', { comorbidities: v })}
              placeholder="Ex: HAS, DM2, fibrilação atrial..."
            />
            <ClinicalTextInput
              label="Medicamentos de Uso Domiciliar Referidos"
              value={form.reportedHistory.homeMedications || ''}
              onChange={(v) => updateSection('reportedHistory', { homeMedications: v })}
              placeholder="Ex: Losartana 50mg 1x/dia, Metformina 850mg..."
            />
          </div>
        </ClinicalSection>

        {/* 10. Avaliação Geral */}
        <ClinicalSection
          title="10. Avaliação Geral"
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Estado Geral"
              value={form.generalAssessment.generalState}
              options={['Grave', 'Estável', 'Regular', 'Crítico estável']}
              onChange={(v) => updateSection('generalAssessment', { generalState: v as any })}
            />
            <ClinicalOptionGroup
              label="Queixas"
              value={form.generalAssessment.complaints}
              options={['Sem queixas', 'Queixa referida', 'Não contactante']}
              onChange={(v) => updateSection('generalAssessment', { complaints: v as any })}
            />
            {form.generalAssessment.complaints === 'Queixa referida' && (
              <ClinicalTextInput
                label="Descrição da Queixa Referida"
                value={form.generalAssessment.complaintsDescription || ''}
                onChange={(v) => updateSection('generalAssessment', { complaintsDescription: v })}
                placeholder="Ex: desconforto precordial, náuseas, sede..."
              />
            )}
          </div>
        </ClinicalSection>

        {/* 11. Nível de Consciência */}
        <ClinicalSection
          title="11. Nível de Consciência"
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Estado de Consciência"
              value={form.neurologicalState.consciousness}
              options={['consciente', 'sonolento', 'sedado', 'rebaixado', 'outro']}
              onChange={(v) => updateSection('neurologicalState', { consciousness: v as any })}
            />
            {form.neurologicalState.consciousness === 'outro' && (
              <ClinicalTextInput
                label="Descreva o Estado Neurológico"
                value={form.neurologicalState.customConsciousness || ''}
                onChange={(v) => updateSection('neurologicalState', { customConsciousness: v })}
                placeholder="Ex: torporoso com abertura ocular a estímulo verbal"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 12. Escala de Glasgow */}
        <ClinicalSection
          title="12. Escala de Coma de Glasgow"
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
          isFilled={Boolean(form.glasgow.score)}
        >
          <div className="space-y-3">
            <ClinicalTextInput
              label="Escore de Glasgow Informado"
              value={form.glasgow.score || ''}
              onChange={(v) => updateSection('glasgow', { score: v })}
              placeholder="Ex: 15, 14, 11 ou Não avaliável (sedado/intubado)"
            />
            <p className="text-2xs text-slate-500">
              * O escore é mantido fielmente conforme aferição clínica informada, sem cálculos automatizados.
            </p>
          </div>
        </ClinicalSection>

        {/* 13. Escala RASS */}
        <ClinicalSection
          title="13. Escala de Sedação e Agitação (RASS)"
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
          isFilled={Boolean(form.rass.score)}
        >
          <ClinicalTextInput
            label="Escore RASS"
            value={form.rass.score || ''}
            onChange={(v) => updateSection('rass', { score: v })}
            placeholder="Ex: 0 (alerta e calmo), -2 (sedação leve), -4 (sedação profunda), Não avaliado"
          />
        </ClinicalSection>

        {/* 14. Pupilas */}
        <ClinicalSection
          title="14. Avaliação Pupilar"
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
          isFilled={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Simetria Pupilar"
              value={form.pupils.equality}
              options={['isocóricas', 'anisocóricas', 'midriáticas', 'mióticas']}
              onChange={(v) => updateSection('pupils', { equality: v as any })}
            />
            <ClinicalOptionGroup
              label="Fotorreatividade"
              value={form.pupils.reactivity}
              options={['fotorreagentes', 'não reagentes', 'reação lenta']}
              onChange={(v) => updateSection('pupils', { reactivity: v as any })}
            />
          </div>
        </ClinicalSection>

        {/* 15. Dor */}
        <ClinicalSection
          title="15. Avaliação da Dor"
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Escala de Avaliação"
              value={form.pain.scale}
              options={['numérica (0-10)', 'BPS', 'CPOT', 'não avaliável']}
              onChange={(v) => updateSection('pain', { scale: v as any })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalTextInput
                label="Escore Álgico"
                value={form.pain.score || ''}
                onChange={(v) => updateSection('pain', { score: v })}
                placeholder="Ex: 0, 4, 2/12"
              />
              <ClinicalTextInput
                label="Localização da Dor"
                value={form.pain.location || ''}
                onChange={(v) => updateSection('pain', { location: v })}
                placeholder="Ex: incisão cirúrgica torácica, epigástrio..."
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 16. Sinais Vitais */}
        <ClinicalSection
          title="16. Sinais Vitais Admissionais"
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
          isFilled={Boolean(form.vitalSigns.systolicBP && form.vitalSigns.heartRate)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ClinicalTextInput
                label="PA Sistólica (mmHg)"
                value={form.vitalSigns.systolicBP || ''}
                onChange={(v) => updateSection('vitalSigns', { systolicBP: v })}
                placeholder="120"
              />
              <ClinicalTextInput
                label="PA Diastólica (mmHg)"
                value={form.vitalSigns.diastolicBP || ''}
                onChange={(v) => updateSection('vitalSigns', { diastolicBP: v })}
                placeholder="80"
              />
              <ClinicalTextInput
                label="PAM Manual (mmHg)"
                value={form.vitalSigns.meanArterialPressure || ''}
                onChange={(v) => updateSection('vitalSigns', { meanArterialPressure: v })}
                placeholder="85 (direta/manual)"
              />
              <ClinicalTextInput
                label="FC (bpm)"
                value={form.vitalSigns.heartRate || ''}
                onChange={(v) => updateSection('vitalSigns', { heartRate: v })}
                placeholder="82"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ClinicalTextInput
                label="FR (rpm)"
                value={form.vitalSigns.respiratoryRate || ''}
                onChange={(v) => updateSection('vitalSigns', { respiratoryRate: v })}
                placeholder="18"
              />
              <ClinicalTextInput
                label="SpO₂ (%)"
                value={form.vitalSigns.oxygenSaturation || ''}
                onChange={(v) => updateSection('vitalSigns', { oxygenSaturation: v })}
                placeholder="97"
              />
              <ClinicalTextInput
                label="Temperatura (°C)"
                value={form.vitalSigns.temperature || ''}
                onChange={(v) => updateSection('vitalSigns', { temperature: v })}
                placeholder="36.5"
              />
              <ClinicalTextInput
                label="Glicemia (mg/dL)"
                value={form.vitalSigns.bloodGlucose || ''}
                onChange={(v) => updateSection('vitalSigns', { bloodGlucose: v })}
                placeholder="110"
              />
            </div>
            <p className="text-2xs text-slate-500">
              * A Pressão Arterial Média (PAM) aceita exclusivamente valor manual direto. Não há cálculo derivado automatizado.
            </p>
          </div>
        </ClinicalSection>

        {/* 17. Suporte Respiratório */}
        <ClinicalSection
          title="17. Suporte Respiratório"
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Modalidade de Suporte"
              value={form.respiratorySupport.supportType}
              options={['ar ambiente', 'oxigenoterapia', 'VNI', 'VMI', 'traqueostomia']}
              onChange={(v) => updateSection('respiratorySupport', { supportType: v as any })}
            />
            {form.respiratorySupport.supportType === 'oxigenoterapia' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ClinicalTextInput
                  label="Dispositivo de Oxigênio"
                  value={form.respiratorySupport.deviceDetails || ''}
                  onChange={(v) => updateSection('respiratorySupport', { deviceDetails: v })}
                  placeholder="Ex: cateter nasal tipo óculos, máscara de Venturi..."
                />
                <ClinicalTextInput
                  label="Fluxo de O₂ (L/min)"
                  value={form.respiratorySupport.oxygenFlowRate || ''}
                  onChange={(v) => updateSection('respiratorySupport', { oxygenFlowRate: v })}
                  placeholder="Ex: 3 L/min"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 18. Ventilação Mecânica Invasiva */}
        {form.respiratorySupport.supportType === 'VMI' && (
          <ClinicalSection
            title="18. Parâmetros de Ventilação Mecânica Invasiva (VMI)"
            isOpen={activeSection === 17}
            onToggle={() => toggleSection(17)}
            isFilled={Boolean(form.mechanicalVentilation.ventilationMode)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ClinicalOptionGroup
                  label="Via Aérea Artificial"
                  value={form.mechanicalVentilation.airwayType}
                  options={['TOT', 'TQT']}
                  onChange={(v) => updateSection('mechanicalVentilation', { airwayType: v as any })}
                />
                <ClinicalTextInput
                  label="Calibre do Tubo / Cânula"
                  value={form.mechanicalVentilation.tubeCaliber || ''}
                  onChange={(v) => updateSection('mechanicalVentilation', { tubeCaliber: v })}
                  placeholder="Ex: 7.5, 8.0"
                />
                <ClinicalTextInput
                  label="Marcação da Fixação (rima labial)"
                  value={form.mechanicalVentilation.fixationMark || ''}
                  onChange={(v) => updateSection('mechanicalVentilation', { fixationMark: v })}
                  placeholder="Ex: 22 cm na rima labial"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ClinicalTextInput
                  label="Modo Ventilatório"
                  value={form.mechanicalVentilation.ventilationMode || ''}
                  onChange={(v) => updateSection('mechanicalVentilation', { ventilationMode: v })}
                  placeholder="Ex: VCV, PCV, PSV"
                />
                <ClinicalTextInput
                  label="FiO₂ (%)"
                  value={form.mechanicalVentilation.fio2 || ''}
                  onChange={(v) => updateSection('mechanicalVentilation', { fio2: v })}
                  placeholder="Ex: 40"
                />
                <ClinicalTextInput
                  label="PEEP (cmH₂O)"
                  value={form.mechanicalVentilation.peep || ''}
                  onChange={(v) => updateSection('mechanicalVentilation', { peep: v })}
                  placeholder="Ex: 6"
                />
                <ClinicalTextInput
                  label="Volume Corrente (VC / mL)"
                  value={form.mechanicalVentilation.tidalVolume || ''}
                  onChange={(v) => updateSection('mechanicalVentilation', { tidalVolume: v })}
                  placeholder="Ex: 420"
                />
              </div>

              <ClinicalTextInput
                label="FR Ajustada (rpm)"
                value={form.mechanicalVentilation.respiratoryRateSet || ''}
                onChange={(v) => updateSection('mechanicalVentilation', { respiratoryRateSet: v })}
                placeholder="Ex: 14"
              />
            </div>
          </ClinicalSection>
        )}

        {/* 19. Avaliação Cardiovascular */}
        <ClinicalSection
          title="19. Avaliação Cardiovascular e Hemodinâmica"
          isOpen={activeSection === 18}
          onToggle={() => toggleSection(18)}
          isFilled={true}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ClinicalOptionGroup
                label="Perfusão Periférica"
                value={form.cardiovascularAssessment.perfusion}
                options={['adequada', 'reduzida', 'prejudicada']}
                onChange={(v) => updateSection('cardiovascularAssessment', { perfusion: v as any })}
              />
              <ClinicalOptionGroup
                label="Extremidades"
                value={form.cardiovascularAssessment.extremities}
                options={['aquecidas', 'frias', 'cianóticas']}
                onChange={(v) => updateSection('cardiovascularAssessment', { extremities: v as any })}
              />
              <ClinicalTextInput
                label="Tempo de Enchimento Capilar (TEC)"
                value={form.cardiovascularAssessment.capillaryRefillTime || ''}
                onChange={(v) => updateSection('cardiovascularAssessment', { capillaryRefillTime: v })}
                placeholder="Ex: < 2 segundos, 3 segundos"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Edema Periférico"
                value={form.cardiovascularAssessment.edema}
                options={['Ausente', 'Presente']}
                onChange={(v) => updateSection('cardiovascularAssessment', { edema: v as any })}
              />
              {form.cardiovascularAssessment.edema === 'Presente' && (
                <ClinicalTextInput
                  label="Localização e Graduação do Edema"
                  value={form.cardiovascularAssessment.edemaDetails || ''}
                  onChange={(v) => updateSection('cardiovascularAssessment', { edemaDetails: v })}
                  placeholder="Ex: +1/4+ em MMII, cacifo positivo"
                />
              )}
            </div>

            <ClinicalTextInput
              label="Ritmo Cardíaco / Monitorização"
              value={form.cardiovascularAssessment.heartRhythm || ''}
              onChange={(v) => updateSection('cardiovascularAssessment', { heartRhythm: v })}
              placeholder="Ex: ritmo sinusal, normocárdico ao monitor..."
            />
          </div>
        </ClinicalSection>

        {/* 20. Drogas Vasoativas */}
        <ClinicalSection
          title="20. Drogas Vasoativas em Infusão Contínua"
          isOpen={activeSection === 19}
          onToggle={() => toggleSection(19)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Paciente em Uso de Drogas Vasoativas?"
              value={form.vasoactiveDrugs.hasVasoactiveDrugs}
              options={['Não', 'Sim']}
              onChange={(v) => updateSection('vasoactiveDrugs', { hasVasoactiveDrugs: v as any })}
            />

            {form.vasoactiveDrugs.hasVasoactiveDrugs === 'Sim' && (
              <div className="space-y-3">
                {form.vasoactiveDrugs.drugs.map((drug, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Droga Vasoativa #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVasoactiveDrug(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <ClinicalTextInput
                        label="Medicamento"
                        value={drug.drugName}
                        onChange={(v) => updateVasoactiveDrug(idx, { drugName: v })}
                        placeholder="Ex: Noradrenalina, Dobutamina"
                      />
                      <ClinicalTextInput
                        label="Concentração / Diluição"
                        value={drug.concentration || ''}
                        onChange={(v) => updateVasoactiveDrug(idx, { concentration: v })}
                        placeholder="Ex: 4mg/250mL SG5%"
                      />
                      <div className="grid grid-cols-2 gap-1">
                        <ClinicalTextInput
                          label="Vazão"
                          value={drug.flowRate}
                          onChange={(v) => updateVasoactiveDrug(idx, { flowRate: v })}
                          placeholder="Ex: 8"
                        />
                        <ClinicalTextInput
                          label="Unidade"
                          value={drug.rateUnit}
                          onChange={(v) => updateVasoactiveDrug(idx, { rateUnit: v })}
                          placeholder="mL/h"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVasoactiveDrug}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Droga Vasoativa</span>
                </button>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 21. Sedação e Analgesia Contínua */}
        <ClinicalSection
          title="21. Sedação e Analgesia Contínua"
          isOpen={activeSection === 20}
          onToggle={() => toggleSection(20)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Infusão Contínua de Sedativos / Analgésicos?"
              value={form.sedationAnalgesia.hasSedationAnalgesia}
              options={['Não', 'Sim']}
              onChange={(v) => updateSection('sedationAnalgesia', { hasSedationAnalgesia: v as any })}
            />

            {form.sedationAnalgesia.hasSedationAnalgesia === 'Sim' && (
              <div className="space-y-3">
                {form.sedationAnalgesia.continuousInfusions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Infusão Contínua #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeSedation(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <ClinicalTextInput
                        label="Medicamento"
                        value={item.drugName}
                        onChange={(v) => updateSedation(idx, { drugName: v })}
                        placeholder="Ex: Fentanil, Midazolam, Propofol"
                      />
                      <div className="grid grid-cols-2 gap-1">
                        <ClinicalTextInput
                          label="Vazão"
                          value={item.flowRate}
                          onChange={(v) => updateSedation(idx, { flowRate: v })}
                          placeholder="Ex: 5"
                        />
                        <ClinicalTextInput
                          label="Unidade"
                          value={item.rateUnit}
                          onChange={(v) => updateSedation(idx, { rateUnit: v })}
                          placeholder="mL/h"
                        />
                      </div>
                      <ClinicalTextInput
                        label="Indicação Clínica"
                        value={item.indication || ''}
                        onChange={(v) => updateSedation(idx, { indication: v })}
                        placeholder="Ex: sincronia na VM, analgesia"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSedation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Sedação / Analgesia</span>
                </button>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 22. Avaliação Gastrointestinal */}
        <ClinicalSection
          title="22. Avaliação Gastrointestinal"
          isOpen={activeSection === 21}
          onToggle={() => toggleSection(21)}
          isFilled={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ClinicalOptionGroup
              label="Aspecto Abdominal"
              value={form.gastrointestinal.abdomenAspect}
              options={['plano', 'globoso', 'distendido', 'flácido']}
              onChange={(v) => updateSection('gastrointestinal', { abdomenAspect: v as any })}
            />
            <ClinicalOptionGroup
              label="Ruídos Hidroaéreos (RHA)"
              value={form.gastrointestinal.bowelSounds}
              options={['presentes', 'diminuídos', 'ausentes', 'aumentados']}
              onChange={(v) => updateSection('gastrointestinal', { bowelSounds: v as any })}
            />
            <ClinicalOptionGroup
              label="Náuseas e Vômitos"
              value={form.gastrointestinal.nauseaVomiting}
              options={['ausentes', 'presentes']}
              onChange={(v) => updateSection('gastrointestinal', { nauseaVomiting: v as any })}
            />
          </div>
        </ClinicalSection>

        {/* 23. Nutrição */}
        <ClinicalSection
          title="23. Suporte Nutricional"
          isOpen={activeSection === 22}
          onToggle={() => toggleSection(22)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Tipo de Dieta"
              value={form.nutrition.dietType}
              options={['jejum', 'oral', 'enteral', 'parenteral']}
              onChange={(v) => updateSection('nutrition', { dietType: v as any })}
            />

            {form.nutrition.dietType === 'enteral' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ClinicalOptionGroup
                  label="Dispositivo de Acesso Enteral"
                  value={form.nutrition.enteralDevice || 'SNE'}
                  options={['SNE', 'SNG', 'GTT']}
                  onChange={(v) => updateSection('nutrition', { enteralDevice: v as any })}
                />
                <ClinicalTextInput
                  label="Velocidade de Infusão"
                  value={form.nutrition.infusionRate || ''}
                  onChange={(v) => updateSection('nutrition', { infusionRate: v })}
                  placeholder="Ex: 40 mL/h"
                />
                <ClinicalTextInput
                  label="Tolerância da Dieta"
                  value={form.nutrition.tolerance || ''}
                  onChange={(v) => updateSection('nutrition', { tolerance: v })}
                  placeholder="Ex: boa tolerância, resíduo ausente"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 24. Eliminações */}
        <ClinicalSection
          title="24. Eliminações e Diurese"
          isOpen={activeSection === 23}
          onToggle={() => toggleSection(23)}
          isFilled={true}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Tipo de Diurese"
                value={form.eliminations.diuresisType}
                options={['espontânea', 'SVD', 'outro']}
                onChange={(v) => updateSection('eliminations', { diuresisType: v as any })}
              />
              <ClinicalTextInput
                label="Aspecto e Características da Diurese"
                value={form.eliminations.diuresisCharacteristics || ''}
                onChange={(v) => updateSection('eliminations', { diuresisCharacteristics: v })}
                placeholder="Ex: clara, sem sedimentos, débito inicial..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Evacuação"
                value={form.eliminations.bowelElimination}
                options={['ausente', 'presente']}
                onChange={(v) => updateSection('eliminations', { bowelElimination: v as any })}
              />
              {form.eliminations.bowelElimination === 'presente' && (
                <ClinicalTextInput
                  label="Características das Fezes"
                  value={form.eliminations.bowelCharacteristics || ''}
                  onChange={(v) => updateSection('eliminations', { bowelCharacteristics: v })}
                  placeholder="Ex: pastosa, quantidade moderada"
                />
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 25. Balanço Hídrico Inicial */}
        <ClinicalSection
          title="25. Balanço Hídrico Inicial"
          isOpen={activeSection === 24}
          onToggle={() => toggleSection(24)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Status do Balanço Hídrico"
              value={form.initialWaterBalance.status}
              options={['Zerado na admissão', 'Parcial informado', 'Não mensurado']}
              onChange={(v) => updateSection('initialWaterBalance', { status: v as any })}
            />
            {form.initialWaterBalance.status === 'Parcial informado' && (
              <ClinicalTextInput
                label="Valor do Balanço Parcial (mL)"
                value={form.initialWaterBalance.balanceValue || ''}
                onChange={(v) => updateSection('initialWaterBalance', { balanceValue: v })}
                placeholder="Ex: +350"
              />
            )}
            <ClinicalTextInput
              label="Observações do Balanço"
              value={form.initialWaterBalance.observations || ''}
              onChange={(v) => updateSection('initialWaterBalance', { observations: v })}
              placeholder="Ex: controle estrito iniciado neste plantão"
            />
          </div>
        </ClinicalSection>

        {/* 26. Dispositivos Invasivos */}
        <ClinicalSection
          title="26. Dispositivos Invasivos"
          isOpen={activeSection === 25}
          onToggle={() => toggleSection(25)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Dispositivos Invasivos Instalados / Presentes?"
              value={form.invasiveDevices.hasInvasiveDevices}
              options={['Não', 'Sim']}
              onChange={(v) => updateSection('invasiveDevices', { hasInvasiveDevices: v as any })}
            />

            {form.invasiveDevices.hasInvasiveDevices === 'Sim' && (
              <div className="space-y-3">
                {form.invasiveDevices.devices.map((dev, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Dispositivo #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeInvasiveDevice(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <ClinicalOptionGroup
                        label="Tipo"
                        value={dev.deviceType}
                        options={['AVP', 'CVC', 'PAI', 'PICC', 'CDL', 'SVD', 'Dreno', 'Outro']}
                        onChange={(v) => updateInvasiveDevice(idx, { deviceType: v as any })}
                      />
                      <ClinicalTextInput
                        label="Sítio Anatômico"
                        value={dev.anatomicalSite}
                        onChange={(v) => updateInvasiveDevice(idx, { anatomicalSite: v })}
                        placeholder="Ex: veia jugular interna, artéria radial..."
                      />
                      <ClinicalOptionGroup
                        label="Lado"
                        value={dev.insertionSide || 'direito'}
                        options={['direito', 'esquerdo', 'linha média']}
                        onChange={(v) => updateInvasiveDevice(idx, { insertionSide: v as any })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <ClinicalOptionGroup
                        label="Permeabilidade"
                        value={dev.permeability || 'permeável'}
                        options={['permeável', 'obstruído']}
                        onChange={(v) => updateInvasiveDevice(idx, { permeability: v as any })}
                      />
                      <ClinicalOptionGroup
                        label="Funcionamento"
                        value={dev.functioningStatus || 'em funcionamento'}
                        options={['em funcionamento', 'em pausa']}
                        onChange={(v) => updateInvasiveDevice(idx, { functioningStatus: v as any })}
                      />
                      <ClinicalTextInput
                        label="Curativo"
                        value={dev.dressingCondition || ''}
                        onChange={(v) => updateInvasiveDevice(idx, { dressingCondition: v })}
                        placeholder="Ex: limpo e oclusivo"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addInvasiveDevice}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Dispositivo Invasivo</span>
                </button>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 27. Pele e Integridade Cutânea */}
        <ClinicalSection
          title="27. Pele e Integridade Cutânea"
          isOpen={activeSection === 26}
          onToggle={() => toggleSection(26)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Integridade Cutânea na Admissão"
              value={form.skinIntegrity.integrity}
              options={['íntegra', 'lesão']}
              onChange={(v) => updateSection('skinIntegrity', { integrity: v as any })}
            />

            {form.skinIntegrity.integrity === 'lesão' && (
              <div className="space-y-3">
                <ClinicalTextInput
                  label="Localização da Lesão"
                  value={form.skinIntegrity.lesionLocation || ''}
                  onChange={(v) => updateSection('skinIntegrity', { lesionLocation: v })}
                  placeholder="Ex: região sacra, calcâneo direito..."
                />
                <ClinicalTextInput
                  label="Descrição e Estadiamento Factual da Lesão"
                  value={form.skinIntegrity.lesionDescription || ''}
                  onChange={(v) => updateSection('skinIntegrity', { lesionDescription: v })}
                  placeholder="Ex: hiperemia não branqueável / LPP grau 2 com exsudato seroso..."
                />
                <ClinicalTextInput
                  label="Curativo / Cobertura Aplicada"
                  value={form.skinIntegrity.dressingApplied || ''}
                  onChange={(v) => updateSection('skinIntegrity', { dressingApplied: v })}
                  placeholder="Ex: placa de hidrocoloide estéril..."
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 28. Riscos Assistenciais */}
        <ClinicalSection
          title="28. Riscos Assistenciais"
          isOpen={activeSection === 27}
          onToggle={() => toggleSection(27)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Riscos Assistenciais Identificados"
              values={form.careRisks.risksList}
              options={[
                'Risco de queda',
                'Risco de lesão por pressão (LPP)',
                'Risco de broncoaspiração',
                'Risco de perda de dispositivos invasivos',
                'Risco de sangramento',
              ]}
              onChange={(list) => updateSection('careRisks', { risksList: list })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Grades do Leito Elevadas"
                value={form.careRisks.bedRailsRaised}
                options={['Sim', 'Não']}
                onChange={(v) => updateSection('careRisks', { bedRailsRaised: v as any })}
              />
              <ClinicalTextInput
                label="Medidas Preventivas Adotadas"
                value={form.careRisks.preventativeMeasures || ''}
                onChange={(v) => updateSection('careRisks', { preventativeMeasures: v })}
                placeholder="Ex: cabeceira elevada a 30°, coxins posicionados..."
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 29. Cuidados Realizados na Admissão */}
        <ClinicalSection
          title="29. Cuidados Realizados na Admissão"
          isOpen={activeSection === 28}
          onToggle={() => toggleSection(28)}
          isFilled={form.admissionCare.actions.length > 0}
        >
          <div className="space-y-4">
            <p className="text-2xs text-slate-500">
              * Sem pré-seleção forçada. Marque apenas as ações efetivamente executadas pela equipe de enfermagem.
            </p>
            <ClinicalMultiSelect
              label="Ações de Enfermagem Executadas"
              values={form.admissionCare.actions}
              options={[
                'Instalação de monitorização cardíaca contínua multiparamétrica',
                'Aferição e checagem de sinais vitais na admissão',
                'Conferência de acessos vasculares e dispositivos invasivos',
                'Instalação / conferência de ventilação mecânica',
                'Elevação de cabeceira a 30°',
                'Instalação de bomba de infusão contínua',
                'Checagem e identificação de pulseira e leito',
                'Orientações gerais de segurança do leito',
              ]}
              onChange={(actions) => updateSection('admissionCare', { actions })}
            />
            <ClinicalTextInput
              label="Outros Cuidados Executados"
              value={form.admissionCare.customActions || ''}
              onChange={(v) => updateSection('admissionCare', { customActions: v })}
              placeholder="Ex: aspiração endotraqueal realizada na admissão com saída de secreção fluida..."
            />
          </div>
        </ClinicalSection>

        {/* 30. Intercorrências na Admissão */}
        <ClinicalSection
          title="30. Intercorrências na Admissão"
          isOpen={activeSection === 29}
          onToggle={() => toggleSection(29)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Intercorrência durante a Admissão?"
              value={form.complications.hasComplication}
              options={['Não', 'Sim', 'Não informado']}
              onChange={(v) => updateSection('complications', { hasComplication: v as any })}
            />

            {form.complications.hasComplication === 'Sim' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Horário do Evento"
                    value={form.complications.complicationTime || ''}
                    onChange={(v) => updateSection('complications', { complicationTime: v })}
                    placeholder="Ex: 14h30"
                  />
                  <ClinicalTextInput
                    label="Equipe Comunicada"
                    value={form.complications.communicationDone || ''}
                    onChange={(v) => updateSection('complications', { communicationDone: v })}
                    placeholder="Ex: médico plantonista da UTI"
                  />
                </div>
                <ClinicalTextInput
                  label="Descrição Factual da Intercorrência"
                  value={form.complications.description || ''}
                  onChange={(v) => updateSection('complications', { description: v })}
                  placeholder="Ex: queda transitória de saturação para 88% na transferência..."
                />
                <ClinicalTextInput
                  label="Conduta Imediata Adotada"
                  value={form.complications.immediateAction || ''}
                  onChange={(v) => updateSection('complications', { immediateAction: v })}
                  placeholder="Ex: reposicionada cânula, hiperoxigenado a 100% com melhora imediata..."
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 31. Comunicação Multiprofissional */}
        <ClinicalSection
          title="31. Comunicação Multiprofissional"
          isOpen={activeSection === 30}
          onToggle={() => toggleSection(30)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Comunicação Multiprofissional Realizada?"
              value={form.multiprofessionalCommunication.hasCommunication}
              options={['Não', 'Sim']}
              onChange={(v) => updateSection('multiprofessionalCommunication', { hasCommunication: v as any })}
            />

            {form.multiprofessionalCommunication.hasCommunication === 'Sim' && (
              <div className="space-y-3">
                <ClinicalTextInput
                  label="Profissional / Equipe Alinhada"
                  value={form.multiprofessionalCommunication.targetTeam || ''}
                  onChange={(v) => updateSection('multiprofessionalCommunication', { targetTeam: v })}
                  placeholder="Ex: médico plantonista da UTI, fisioterapia respiratória..."
                />
                <ClinicalTextInput
                  label="Motivo do Contato"
                  value={form.multiprofessionalCommunication.reason || ''}
                  onChange={(v) => updateSection('multiprofessionalCommunication', { reason: v })}
                  placeholder="Ex: passagem de plantão admissional e ajuste de metas..."
                />
                <ClinicalTextInput
                  label="Alinhamento e Resposta Observada"
                  value={form.multiprofessionalCommunication.observedResponse || ''}
                  onChange={(v) => updateSection('multiprofessionalCommunication', { observedResponse: v })}
                  placeholder="Ex: condutas pactuadas e plano terapêutico inicial confirmado..."
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 32. Situação Após Admissão */}
        <ClinicalSection
          title="32. Situação Após Admissão"
          isOpen={activeSection === 31}
          onToggle={() => toggleSection(31)}
          isFilled={true}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Condição Atual do Paciente no Leito"
              value={form.postAdmissionStatus.patientStatus}
              options={[
                'Permanece no leito em monitorização contínua',
                'Permanece no leito aos cuidados da equipe',
                'Outro',
              ]}
              onChange={(v) => updateSection('postAdmissionStatus', { patientStatus: v as any })}
            />
            {form.postAdmissionStatus.patientStatus === 'Outro' && (
              <ClinicalTextInput
                label="Descreva a Condição de Permanência"
                value={form.postAdmissionStatus.customStatus || ''}
                onChange={(v) => updateSection('postAdmissionStatus', { customStatus: v })}
                placeholder="Ex: leito em isolamento respiratório, vigilância intensiva contínua..."
              />
            )}
            <ClinicalTextInput
              label="Pendências Assistenciais"
              value={form.postAdmissionStatus.pendingIssues || ''}
              onChange={(v) => updateSection('postAdmissionStatus', { pendingIssues: v })}
              placeholder="Ex: aguarda resultado de exames laboratoriais admissionais..."
            />
          </div>
        </ClinicalSection>
      </div>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 z-10 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          {consistencyResult.errors.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Consistência Clínica Conforme
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {consistencyResult.errors.length} pendência(s) de consistência
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setViewMode('preview')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 transition-colors shadow-2xs"
        >
          <FileText className="w-4 h-4" />
          <span>Visualizar e Concluir Admissão</span>
        </button>
      </div>
    </div>
  );
};
