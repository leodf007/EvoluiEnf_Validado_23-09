import React, { useState, useMemo } from 'react';
import {
  FileText,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Info,
  Plus,
  Trash2,
  Activity,
  Heart,
  Stethoscope,
  ClipboardList,
  ShieldAlert,
} from 'lucide-react';
import {
  NurseSoapForm,
  createInitialNurseSoapForm,
  SoapAttendanceType,
  SoapInformationSource,
} from '../../../types/nurseSoap';
import { Atendimento } from '../../../types';
import { validateNurseSoapConsistency } from '../../../engine/nurseSoapFactBuilder';
import { NurseSoapPreviewView } from './NurseSoapPreviewView';
import { AIAssistantPanel } from '../aiAssistant/AIAssistantPanel';

interface NurseSoapFormScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  patientAreaName?: string;
  atendimento?: Atendimento;
}

export const NurseSoapFormScreen: React.FC<NurseSoapFormScreenProps> = ({
  onBack,
  patientAreaName = 'Ambulatório / Consulta',
  atendimento,
}) => {
  const [form, setForm] = useState<NurseSoapForm>(() => {
    const initial = createInitialNurseSoapForm();
    if (atendimento) {
      if (atendimento.setor) {
        initial.context.unit = atendimento.setor;
      }
      if (atendimento.leito) {
        initial.context.bedOrRoom = `Leito ${atendimento.leito}`;
      }
      if (atendimento.identificacao) {
        initial.identification.reasonForVisit = initial.identification.reasonForVisit || `Atendimento [${atendimento.identificacao}]`;
      }
    }
    return initial;
  });
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Quick inputs for tags
  const [newDeviceInput, setNewDeviceInput] = useState<string>('');
  const [newMedInput, setNewMedInput] = useState<string>('');
  const [newDiagInput, setNewDiagInput] = useState<string>('');
  const [newIntervInput, setNewIntervInput] = useState<string>('');

  const consistencyResult = useMemo(() => validateNurseSoapConsistency(form), [form]);

  const handleReset = () => {
    if (window.confirm('Deseja realmente limpar todos os campos do formulário SOAP?')) {
      setForm(createInitialNurseSoapForm());
      setActiveStep(1);
    }
  };

  const updateSubField = <K extends keyof NurseSoapForm>(
    section: K,
    fields: Partial<NurseSoapForm[K]>
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        ...fields,
      },
    }));
  };

  const updateNestedField = (
    section: 'objective',
    subKey: 'vitalSigns' | 'physicalExam',
    field: string,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      objective: {
        ...prev.objective,
        [subKey]: {
          ...(prev.objective[subKey] as any),
          [field]: value,
        },
      },
    }));
  };

  const handleAddDevice = () => {
    const trimmed = newDeviceInput.trim();
    if (trimmed && !form.objective.devices.includes(trimmed)) {
      updateSubField('objective', {
        devices: [...form.objective.devices, trimmed],
      });
      setNewDeviceInput('');
    }
  };

  const handleRemoveDevice = (dev: string) => {
    updateSubField('objective', {
      devices: form.objective.devices.filter((d) => d !== dev),
    });
  };

  const handleAddMedication = () => {
    const trimmed = newMedInput.trim();
    if (trimmed && !form.objective.medicationsInUse.includes(trimmed)) {
      updateSubField('objective', {
        medicationsInUse: [...form.objective.medicationsInUse, trimmed],
      });
      setNewMedInput('');
    }
  };

  const handleRemoveMedication = (med: string) => {
    updateSubField('objective', {
      medicationsInUse: form.objective.medicationsInUse.filter((m) => m !== med),
    });
  };

  const handleAddDiagnosis = () => {
    const trimmed = newDiagInput.trim();
    if (trimmed && !form.nursingDiagnoses.diagnoses.includes(trimmed)) {
      updateSubField('nursingDiagnoses', {
        diagnoses: [...form.nursingDiagnoses.diagnoses, trimmed],
      });
      setNewDiagInput('');
    }
  };

  const handleRemoveDiagnosis = (diag: string) => {
    updateSubField('nursingDiagnoses', {
      diagnoses: form.nursingDiagnoses.diagnoses.filter((d) => d !== diag),
    });
  };

  const handleAddIntervention = () => {
    const trimmed = newIntervInput.trim();
    if (trimmed && !form.interventions.executedInterventions.includes(trimmed)) {
      updateSubField('interventions', {
        executedInterventions: [...form.interventions.executedInterventions, trimmed],
      });
      setNewIntervInput('');
    }
  };

  const handleRemoveIntervention = (it: string) => {
    updateSubField('interventions', {
      executedInterventions: form.interventions.executedInterventions.filter((x) => x !== it),
    });
  };

  if (showPreview) {
    return (
      <NurseSoapPreviewView
        form={form}
        onBackToEdit={() => setShowPreview(false)}
        patientAreaName={patientAreaName}
        atendimento={atendimento}
      />
    );
  }

  const steps = [
    { num: 1, label: 'Contexto & Demanda' },
    { num: 2, label: 'S - Subjetivo' },
    { num: 3, label: 'O - Objetivo' },
    { num: 4, label: 'A - Avaliação' },
    { num: 5, label: 'P - Plano & Ações' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Anonymous Attendance Banner if linked */}
      {atendimento && (
        <div className="bg-teal-50 border border-teal-200/90 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm text-teal-950">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>
              <strong>Atendimento Anônimo Vinculado:</strong> {atendimento.identificacao} • {atendimento.setor} {atendimento.leito ? `(Leito ${atendimento.leito})` : ''}
            </span>
          </div>
          <span className="text-[11px] font-semibold bg-teal-200/70 text-teal-900 px-2 py-0.5 rounded-full">
            Privacy by Default
          </span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel do Enfermeiro
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            Registro de Enfermagem — Método SOAP
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Documentação clínica sistematizada para consultas e atendimentos ambulatoriais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            id="btn-reset-soap"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            id="btn-preview-soap"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Visualizar Nota SOAP
          </button>
        </div>
      </div>

      {/* Consistency Warnings / Errors */}
      {consistencyResult.errors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Pendências de Validação Clínica
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
            {consistencyResult.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 9) Assistente Inteligente de Enfermagem (Copiloto IA) */}
      <AIAssistantPanel
        form={form}
        modeloNome={atendimento?.modeloNome}
        currentNarrative={form.subjective.reportedSymptoms || form.subjective.chiefComplaint}
        onApplySuggestion={(sugText) => {
          updateSubField('subjective', {
            reportedSymptoms: form.subjective.reportedSymptoms
              ? `${form.subjective.reportedSymptoms}\n[Nota complementar]: ${sugText}`
              : `[Nota complementar]: ${sugText}`,
          });
        }}
        onApplyImprovedNarrative={(improvedText) => {
          updateSubField('subjective', {
            reportedSymptoms: improvedText,
          });
        }}
      />

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-200 pb-3">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => setActiveStep(s.num)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeStep === s.num
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeStep === s.num ? 'bg-white text-emerald-700 font-bold' : 'bg-slate-200 text-slate-700'
            }`}>
              {s.num}
            </span>
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step Contents */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* ============================================================== */}
        {/* STEP 1: CONTEXTO E IDENTIFICAÇÃO */}
        {/* ============================================================== */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Contexto do Registro & Identificação
              </h2>
              <p className="text-xs text-slate-500">
                Informações administrativas e motivo do contato assistencial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Data da Avaliação
                </label>
                <input
                  type="date"
                  value={form.context.date}
                  onChange={(e) => updateSubField('context', { date: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={form.context.time}
                  onChange={(e) => updateSubField('context', { time: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unidade / Setor
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Ambulatório de Cardiologia"
                  value={form.context.unit}
                  onChange={(e) => updateSubField('context', { unit: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Consultório / Leito
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Consultório 02"
                  value={form.context.bedOrRoom}
                  onChange={(e) => updateSubField('context', { bedOrRoom: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de Atendimento
                </label>
                <select
                  value={form.identification.attendanceType}
                  onChange={(e) => updateSubField('identification', { attendanceType: e.target.value as SoapAttendanceType })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="consulta de enfermagem">Consulta de Enfermagem</option>
                  <option value="ambulatorial">Ambulatorial</option>
                  <option value="retorno">Retorno Ambulatorial</option>
                  <option value="visita domiciliar">Visita Domiciliar</option>
                  <option value="parecer">Parecer</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Motivo da Consulta / Demanda Clínica
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Acompanhamento de hipertensão arterial e diabetes"
                  value={form.identification.reasonForVisit}
                  onChange={(e) => updateSubField('identification', { reasonForVisit: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: S - SUBJETIVO */}
        {/* ============================================================== */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                S - Subjetivo (Relato do Paciente ou Acompanhante)
              </h2>
              <p className="text-xs text-slate-500">
                Informações prestadas pelo próprio paciente ou familiares sobre sintomas, sentimentos e queixas.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Queixa Principal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex.: Relata dor de cabeça de forte intensidade há 2 dias, com piora ao final da tarde."
                  value={form.subjective.chiefComplaint}
                  onChange={(e) => updateSubField('subjective', { chiefComplaint: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fonte da Informação
                  </label>
                  <select
                    value={form.subjective.informationSource}
                    onChange={(e) => updateSubField('subjective', { informationSource: e.target.value as SoapInformationSource })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="paciente">O Próprio Paciente</option>
                    <option value="familiar">Familiar / Acompanhante</option>
                    <option value="cuidador">Cuidador</option>
                    <option value="equipe">Equipe de Saúde</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Detalhes da Fonte / Acompanhante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Filha presente e prestando informações"
                    value={form.subjective.sourceDetails}
                    onChange={(e) => updateSubField('subjective', { sourceDetails: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sintomas e Histórico Relatado
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex.: Nega febre, náuseas ou alterações visuais. Refere estresse recente no trabalho."
                  value={form.subjective.reportedSymptoms}
                  onChange={(e) => updateSubField('subjective', { reportedSymptoms: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Percepção do Paciente e Adesão ao Tratamento
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Refere esquecer de tomar o anti-hipertensivo aos fins de semana."
                  value={form.subjective.patientPerception}
                  onChange={(e) => updateSubField('subjective', { patientPerception: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Informações da Família / Contexto Social
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Familiar expressa preocupação com a alimentação rica em sal."
                  value={form.subjective.familyInformation}
                  onChange={(e) => updateSubField('subjective', { familyInformation: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: O - OBJETIVO */}
        {/* ============================================================== */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                O - Objetivo (Sinais Vitais, Exame Físico, Dispositivos e Medicações)
              </h2>
              <p className="text-xs text-slate-500">
                Achados mensuráveis e observáveis pelo exame clínico e instrumentos de aferição.
              </p>
            </div>

            {/* Sinais Vitais */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Sinais Vitais Aferidos
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    PA (mmHg)
                  </label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={form.objective.vitalSigns.bloodPressure}
                    onChange={(e) => updateNestedField('objective', 'vitalSigns', 'bloodPressure', e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    PAM (mmHg)
                  </label>
                  <input
                    type="text"
                    placeholder="93"
                    value={form.objective.vitalSigns.meanArterialPressure}
                    onChange={(e) => updateNestedField('objective', 'vitalSigns', 'meanArterialPressure', e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    FC (bpm)
                  </label>
                  <input
                    type="text"
                    placeholder="78"
                    value={form.objective.vitalSigns.heartRate}
                    onChange={(e) => updateNestedField('objective', 'vitalSigns', 'heartRate', e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    FR (rpm)
                  </label>
                  <input
                    type="text"
                    placeholder="18"
                    value={form.objective.vitalSigns.respiratoryRate}
                    onChange={(e) => updateNestedField('objective', 'vitalSigns', 'respiratoryRate', e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    SpO2 (%)
                  </label>
                  <input
                    type="text"
                    placeholder="98"
                    value={form.objective.vitalSigns.oxygenSaturation}
                    onChange={(e) => updateNestedField('objective', 'vitalSigns', 'oxygenSaturation', e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Tax (°C)
                  </label>
                  <input
                    type="text"
                    placeholder="36.5"
                    value={form.objective.vitalSigns.temperature}
                    onChange={(e) => updateNestedField('objective', 'vitalSigns', 'temperature', e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Glicemia (mg/dL)
                  </label>
                  <input
                    type="text"
                    placeholder="105"
                    value={form.objective.vitalSigns.bloodGlucose}
                    onChange={(e) => updateNestedField('objective', 'vitalSigns', 'bloodGlucose', e.target.value)}
                    className="w-full text-sm px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Exame Físico por Sistemas */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Exame Físico Direcionado
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Neurológico
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Lúcido, orientado em tempo e espaço, sem déficits"
                    value={form.objective.physicalExam.neurological}
                    onChange={(e) => updateNestedField('objective', 'physicalExam', 'neurological', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Respiratório
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Murmúrio vesicular universalmente audível, sem ruídos"
                    value={form.objective.physicalExam.respiratory}
                    onChange={(e) => updateNestedField('objective', 'physicalExam', 'respiratory', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cardiovascular
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: RCR em 2T, bulhas normofonéticas, pulsos periféricos cheios"
                    value={form.objective.physicalExam.cardiovascular}
                    onChange={(e) => updateNestedField('objective', 'physicalExam', 'cardiovascular', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gastrointestinal / Abdome
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Abdome plano, flácido, indolor à palpação, RHA presentes"
                    value={form.objective.physicalExam.gastrointestinal}
                    onChange={(e) => updateNestedField('objective', 'physicalExam', 'gastrointestinal', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Urinário / Eliminações
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Diurese espontânea, clara, sem queixas disúricas"
                    value={form.objective.physicalExam.urinary}
                    onChange={(e) => updateNestedField('objective', 'physicalExam', 'urinary', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pele, Mucosas e Extremidades
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Corado, hidratado, perfusão capilar < 2s, sem edemas"
                    value={form.objective.physicalExam.skin}
                    onChange={(e) => updateNestedField('objective', 'physicalExam', 'skin', e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dispositivos */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Dispositivos Invasivos / Suporte em Uso
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex.: Acesso venoso periférico, Sonda vesical, etc."
                  value={newDeviceInput}
                  onChange={(e) => setNewDeviceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDevice())}
                  className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDevice}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {form.objective.devices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.objective.devices.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs border border-emerald-200"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => handleRemoveDevice(d)}
                        className="text-emerald-700 hover:text-emerald-950"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Detalhes dos dispositivos (ex.: Sítio de inserção, data de punção, aspecto do curativo)"
                  value={form.objective.deviceDetails}
                  onChange={(e) => updateSubField('objective', { deviceDetails: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                />
              </div>
            </div>

            {/* Medicamentos em Uso */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Medicamentos em Uso pelo Paciente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex.: Losartana 50mg, Metformina 850mg, etc."
                  value={newMedInput}
                  onChange={(e) => setNewMedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                  className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {form.objective.medicationsInUse.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.objective.medicationsInUse.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs border border-slate-300"
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(m)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Detalhes farmacológicos (ex.: Posologia e adesão informada)"
                  value={form.objective.medicationDetails}
                  onChange={(e) => updateSubField('objective', { medicationDetails: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: A - AVALIAÇÃO */}
        {/* ============================================================== */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                A - Avaliação Clínica Privativa do Enfermeiro
              </h2>
              <p className="text-xs text-slate-500">
                Interpretação e raciocínio do enfermeiro baseados nos dados subjetivos e objetivos (Lei 7.498/86).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Síntese Clínica do Enfermeiro
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex.: Paciente hipertenso com adesão irregular à terapêutica, apresentando níveis pressóricos limítrofes associados a queixa de cefaleia. Sem sinais de alarme ou déficits neurológicos focais."
                  value={form.assessment.nurseClinicalSynthesis}
                  onChange={(e) => updateSubField('assessment', { nurseClinicalSynthesis: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Diagnósticos de Enfermagem */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Diagnósticos de Enfermagem (Inserção Manual)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex.: Controle ineficaz da saúde, Risco de pressão arterial instável"
                    value={newDiagInput}
                    onChange={(e) => setNewDiagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiagnosis())}
                    className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDiagnosis}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {form.nursingDiagnoses.diagnoses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.nursingDiagnoses.diagnoses.map((dg) => (
                      <span
                        key={dg}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs border border-emerald-200"
                      >
                        {dg}
                        <button
                          type="button"
                          onClick={() => handleRemoveDiagnosis(dg)}
                          className="text-emerald-700 hover:text-emerald-950"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <textarea
                    rows={2}
                    placeholder="Diagnósticos de enfermagem complementares em texto descritivo..."
                    value={form.nursingDiagnoses.diagnosesText}
                    onChange={(e) => updateSubField('nursingDiagnoses', { diagnosesText: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Raciocínio Clínico e Justificativa Diagnóstica
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Justificado pelo relato do paciente de falhas frequentes na ingestão da medicação nos finais de semana."
                  value={form.nursingDiagnoses.clinicalReasoning}
                  onChange={(e) => updateSubField('nursingDiagnoses', { clinicalReasoning: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: P - PLANO & AÇÕES */}
        {/* ============================================================== */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                P - Plano de Cuidados & Intervenções
              </h2>
              <p className="text-xs text-slate-500">
                Plano assistencial, monitorização programada, orientações, condutas e resposta observada.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Plano Assistencial de Enfermagem
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex.: Manter acompanhamento ambulatorial regular; incentivar adesão farmacológica rigorosa; promover práticas de autocuidado."
                  value={form.plan.carePlan}
                  onChange={(e) => updateSubField('plan', { carePlan: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Monitorização Programada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Aferição diária de PA na UBS ou domicílio"
                    value={form.plan.plannedMonitoring}
                    onChange={(e) => updateSubField('plan', { plannedMonitoring: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Retorno e Reavaliações Agendadas
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Retorno agendado para 30 dias para reavaliação"
                    value={form.plan.scheduledEvaluations}
                    onChange={(e) => updateSubField('plan', { scheduledEvaluations: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Orientações Fornecidas ao Paciente / Família
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex.: Orientado sobre dieta hipossódica, sinais de alarme para procurar emergência (dor no peito, alteração visual) e importância de não interromper o tratamento."
                  value={form.plan.patientOrientations}
                  onChange={(e) => updateSubField('plan', { patientOrientations: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Intervenções Executadas */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Intervenções / Condutas Já Realizadas na Consulta
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex.: Aferição de dados vitais, Orientação verbal, Teste de glicemia capilar"
                    value={newIntervInput}
                    onChange={(e) => setNewIntervInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIntervention())}
                    className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddIntervention}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {form.interventions.executedInterventions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.interventions.executedInterventions.map((it) => (
                      <span
                        key={it}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs border border-slate-300"
                      >
                        {it}
                        <button
                          type="button"
                          onClick={() => handleRemoveIntervention(it)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Detalhamento das intervenções realizadas..."
                    value={form.interventions.interventionDetails}
                    onChange={(e) => updateSubField('interventions', { interventionDetails: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Resposta Observada do Paciente
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Demonstrou compreensão e expressou compromisso com as orientações."
                  value={form.responseToCare.observedResponse}
                  onChange={(e) => updateSubField('responseToCare', { observedResponse: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Informações Adicionais / Observações Gerais
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex.: Paciente retira medicações regularmente na farmácia da UBS."
                  value={form.additionalInfo.notes}
                  onChange={(e) => updateSubField('additionalInfo', { notes: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Stepper Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Anterior
          </button>

          <div className="text-xs text-slate-400">
            Passo {activeStep} de {steps.length}
          </div>

          {activeStep < steps.length ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.min(steps.length, prev + 1))}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
            >
              Próximo
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Visualizar Registro SOAP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
