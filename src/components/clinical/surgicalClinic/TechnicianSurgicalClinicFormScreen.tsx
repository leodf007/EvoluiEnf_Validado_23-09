import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import {
  TechnicianSurgicalClinicForm,
  createInitialTechnicianSurgicalClinicForm,
  SURGICAL_CLINIC_CARE_ACTIONS,
} from '../../../types/technicianSurgicalClinic';
import { SectionStatus } from '../../../types/clinical';
import {
  validateTechnicianSurgicalClinicConsistency,
  normalizeTechnicianSurgicalClinicData,
  buildSurgicalClinicAuthorizedFacts,
} from '../../../engine/surgicalClinicFactBuilder';
import {
  TechnicianSurgicalClinicalNursingNoteBuilder,
} from '../../../engine/technicianSurgicalClinicalNursingNoteBuilder';
import { verifyAIRefinedResponse } from '../../../engine/postGenerationVerifier';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalNumericInput } from '../ClinicalNumericInput';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalProgressBar } from '../ClinicalProgressBar';
import { VitalSignsInputs, VitalSignsData } from '../VitalSignsInputs';
import { DeviceFormCard } from '../DeviceFormCard';
import { SurgicalContextInputs } from './SurgicalContextInputs';
import { SurgicalWoundInputs } from './SurgicalWoundInputs';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface TechnicianSurgicalClinicFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const TechnicianSurgicalClinicFormScreen: React.FC<TechnicianSurgicalClinicFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Anotação de Enfermagem — Clínica Cirúrgica" onNavigateHome={props.onBack}>
      <TechnicianSurgicalClinicFormScreenContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const SURGICAL_CLINIC_DEVICE_TYPES = [
  { value: 'Dreno de tórax', label: 'Dreno de tórax', description: 'Dreno torácico tubular' },
  { value: 'Dreno abdominal', label: 'Dreno abdominal', description: 'Dreno abdominal tubular/sucção' },
  { value: 'Dreno cirúrgico', label: 'Dreno cirúrgico', description: 'Dreno cirúrgico (ex: Portovac, Penrose)' },
  { value: 'AVP', label: 'AVP', description: 'Acesso Venoso Periférico' },
  { value: 'CVC', label: 'CVC', description: 'Cateter Venoso Central' },
  { value: 'PICC', label: 'PICC', description: 'Cateter Central de Inserção Periférica' },
  { value: 'SVD', label: 'SVD', description: 'Sonda Vesical de Demora' },
  { value: 'SNE', label: 'SNE', description: 'Sonda Nasoenteral' },
  { value: 'SNG', label: 'SNG', description: 'Sonda Nasogástrica' },
  { value: 'GTT', label: 'GTT', description: 'Gastrostomia' },
  { value: 'Outro', label: 'Outro', description: 'Outro dispositivo invasivo' },
];

const SECTION_KEYS = [
  'Contexto',
  'Contexto Cirúrgico',
  'Avaliação Geral',
  'Dor Pós-Operatória',
  'Sinais Vitais',
  'Respiratório',
  'Ferida / Curativo',
  'Drenos e Dispositivos',
  'Alimentação',
  'Eliminações',
  'Mobilidade',
  'Banho e Higiene',
  'Cuidados Realizados',
  'Intercorrências',
  'Situação Final',
];

const CATEGORY_TO_SECTION: Record<string, { index: number; title: string }> = {
  vitals: { index: 4, title: 'Sinais Vitais' },
  wound: { index: 6, title: 'Ferida / Curativo' },
  devices: { index: 7, title: 'Drenos e Dispositivos' },
  nutrition: { index: 8, title: 'Alimentação' },
  bath: { index: 11, title: 'Banho e Higiene' },
  complications: { index: 13, title: 'Intercorrências' },
  mobility: { index: 10, title: 'Mobilidade' },
  pain: { index: 3, title: 'Dor Pós-Operatória' },
  respiratory: { index: 5, title: 'Respiratório' },
};

const TechnicianSurgicalClinicFormScreenContent: React.FC<TechnicianSurgicalClinicFormScreenProps> = ({
  onBack,
  patientAreaName = 'Clínica Cirúrgica',
}) => {
  const [form, setForm] = useState<TechnicianSurgicalClinicForm>(createInitialTechnicianSurgicalClinicForm);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  const [copied, setCopied] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [aiRefinedNarrative, setAiRefinedNarrative] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Consistency alerts
  const consistencyAlerts = useMemo(() => {
    return validateTechnicianSurgicalClinicConsistency(form);
  }, [form]);

  // Authorized Facts
  const authorizedFacts = useMemo(() => {
    return buildSurgicalClinicAuthorizedFacts(form);
  }, [form]);

  // Deterministic Narrative Result with Traces
  const deterministicResult = useMemo(() => {
    return TechnicianSurgicalClinicalNursingNoteBuilder.build(authorizedFacts);
  }, [authorizedFacts]);

  // Section completion statuses
  const sectionStatuses = useMemo<Record<string, SectionStatus>>(() => {
    return {
      'Contexto': form.context.moment && form.context.location ? 'completed' : form.context.moment || form.context.location ? 'in_progress' : 'not_started',
      'Contexto Cirúrgico': form.surgicalContext.situation ? 'completed' : 'not_started',
      'Avaliação Geral': form.generalAssessment.observedState ? 'completed' : 'not_started',
      'Dor Pós-Operatória': form.pain.status ? 'completed' : 'not_started',
      'Sinais Vitais': form.vitalSigns.systolicBP || form.vitalSigns.heartRate ? 'completed' : 'not_started',
      'Respiratório': form.respiratory.support ? 'completed' : 'not_started',
      'Ferida / Curativo': form.wound.hasDressing ? 'completed' : 'not_started',
      'Drenos e Dispositivos': form.devices.length > 0 ? 'completed' : 'not_started',
      'Alimentação': form.nutrition.route ? 'completed' : 'not_started',
      'Eliminações': form.eliminations.urinary || form.eliminations.bowel ? 'completed' : 'not_started',
      'Mobilidade': form.mobility.ambulation ? 'completed' : 'not_started',
      'Banho e Higiene': form.bath.performed ? 'completed' : 'not_started',
      'Cuidados Realizados': form.care.actions.length > 0 ? 'completed' : 'not_started',
      'Intercorrências': form.complications.hasComplication ? 'completed' : 'not_started',
      'Situação Final': form.finalStatus.status ? 'completed' : 'not_started',
    };
  }, [form]);

  const completedCount = useMemo(() => {
    return Object.values(sectionStatuses).filter((s) => s === 'completed').length;
  }, [sectionStatuses]);

  const handleCopy = () => {
    const textToCopy = aiRefinedNarrative || deterministicResult.narrative;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Deseja realmente limpar todos os campos da anotação cirúrgica?')) {
      setForm(createInitialTechnicianSurgicalClinicForm());
      setAiRefinedNarrative(null);
      setAiError(null);
      setActiveSection(0);
    }
  };

  // Convert VitalSigns to component format
  const vitalsData: VitalSignsData = useMemo(() => ({
    systolicBP: form.vitalSigns.systolicBP || '',
    diastolicBP: form.vitalSigns.diastolicBP || '',
    meanArterialPressure: form.vitalSigns.meanArterialPressure || '',
    heartRate: form.vitalSigns.heartRate || '',
    respiratoryRate: form.vitalSigns.respiratoryRate || '',
    oxygenSaturation: form.vitalSigns.oxygenSaturation || '',
    temperature: form.vitalSigns.temperature || '',
    bloodGlucose: form.vitalSigns.capillaryBloodGlucose || '',
  }), [form.vitalSigns]);

  const handleVitalsChange = (patch: Partial<VitalSignsData>) => {
    setForm((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        ...patch,
        capillaryBloodGlucose:
          patch.bloodGlucose !== undefined ? patch.bloodGlucose : prev.vitalSigns.capillaryBloodGlucose,
      },
    }));
  };

  return (
    <div id="surgical-clinic-form-screen" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  Anotação de Enfermagem — Clínica Cirúrgica
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 rounded-full">
                  Técnico
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Documentação estritamente factual e observacional para enfermaria cirúrgica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Limpar formulário"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'form' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Formulário
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Prévia</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress & Non-blocking Alerts Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <ClinicalProgressBar
            sections={SECTION_KEYS.map((k, idx) => ({
              index: idx,
              title: k,
              status: sectionStatuses[k] || 'not_started',
            }))}
            alerts={consistencyAlerts.map((a) => {
              const meta = CATEGORY_TO_SECTION[a.category] || { index: 0, title: 'Geral' };
              return {
                code: a.code,
                message: a.message,
                sectionIndex: meta.index,
                sectionTitle: meta.title,
                isBlocking: a.isBlocking,
              };
            })}
            onOpenSection={(idx) => setActiveSection(idx)}
            onOpenSummary={() => setViewMode('preview')}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {viewMode === 'form' ? (
          <>
            {/* Sections Nav Desktop */}
            <nav className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-1 bg-white p-3 rounded-2xl border border-slate-200 self-start sticky top-24">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Seções Clínicas
              </div>
              {SECTION_KEYS.map((key, idx) => {
                const status = sectionStatuses[key];
                const isActive = activeSection === idx;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveSection(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-800 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}. {key}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status === 'completed'
                          ? isActive ? 'bg-white' : 'bg-emerald-500'
                          : status === 'in_progress'
                          ? isActive ? 'bg-amber-300' : 'bg-amber-400'
                          : 'bg-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Form Panels */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* 1. Context */}
              <div className={activeSection === 0 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-context"
                  title="1. Contexto do Registro"
                  subtitle="Momento do atendimento, setor cirúrgico e checagem de pulseira e leito"
                  status={sectionStatuses['Contexto']}
                  isOpen={activeSection === 0}
                  onToggle={() => setActiveSection(activeSection === 0 ? -1 : 0)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Momento do Registro"
                      options={['Recebo paciente', 'Avalio paciente', 'Reavalio paciente']}
                      value={form.context.moment}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          context: { ...prev.context, moment: val as any },
                        }))
                      }
                      columns={3}
                    />

                    <ClinicalOptionGroup
                      label="Localização / Setor"
                      options={['Enfermaria cirúrgica', 'Pós-operatório', 'Recuperação anestésica', 'Leito', 'Outro']}
                      value={form.context.location}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          context: { ...prev.context, location: val as any },
                        }))
                      }
                      columns={3}
                    />

                    {form.context.location === 'Outro' && (
                      <ClinicalTextInput
                        label="Descrição do setor"
                        value={form.context.locationCustom || ''}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            context: { ...prev.context, locationCustom: val },
                          }))
                        }
                        placeholder="Ex: Leito 204-B, Bloco cirúrgico..."
                      />
                    )}

                    <ClinicalOptionGroup
                      label="Acompanhamento"
                      options={['desacompanhado', 'familiar', 'cuidador', 'outro']}
                      value={form.context.accompaniment}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          context: { ...prev.context, accompaniment: val as any },
                        }))
                      }
                      columns={4}
                    />

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Checagem de Identificação do Paciente
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 text-xs">
                          <input
                            type="checkbox"
                            checked={form.context.wristbandChecked}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                context: { ...prev.context, wristbandChecked: e.target.checked },
                              }))
                            }
                            className="rounded text-teal-800 focus:ring-teal-700"
                          />
                          <span>Pulseira de identificação conferida</span>
                        </label>
                        <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 text-xs">
                          <input
                            type="checkbox"
                            checked={form.context.bedSignChecked}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                context: { ...prev.context, bedSignChecked: e.target.checked },
                              }))
                            }
                            className="rounded text-teal-800 focus:ring-teal-700"
                          />
                          <span>Identificação no leito conferida</span>
                        </label>
                      </div>
                    </div>

                    <ClinicalOptionGroup
                      label="Tipo de Precaução Adotada"
                      options={['padrão', 'contato', 'gotículas', 'aerossóis', 'outra']}
                      value={form.context.precaution}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          context: { ...prev.context, precaution: val as any },
                        }))
                      }
                      columns={3}
                    />
                  </div>
                </ClinicalSection>
              </div>

              {/* 2. Surgical Context */}
              <div className={activeSection === 1 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-surgical-context"
                  title="2. Informações Cirúrgicas Registradas"
                  subtitle="Situação cirúrgica observada e procedimento cirúrgico fornecido"
                  status={sectionStatuses['Contexto Cirúrgico']}
                  isOpen={activeSection === 1}
                  onToggle={() => setActiveSection(activeSection === 1 ? -1 : 1)}
                >
                  <SurgicalContextInputs
                    value={form.surgicalContext}
                    onChange={(val) => setForm((prev) => ({ ...prev, surgicalContext: val }))}
                  />
                </ClinicalSection>
              </div>

              {/* 3. General Assessment */}
              <div className={activeSection === 2 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-general"
                  title="3. Avaliação Geral do Paciente"
                  subtitle="Estado observado, relato de queixas com fonte, higiene e mobilidade"
                  status={sectionStatuses['Avaliação Geral']}
                  isOpen={activeSection === 2}
                  onToggle={() => setActiveSection(activeSection === 2 ? -1 : 2)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Estado Observado"
                      options={['consciente', 'sonolento', 'agitado', 'calmo', 'colaborativo', 'choroso', 'hipoativo', 'outro']}
                      value={form.generalAssessment.observedState}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          generalAssessment: { ...prev.generalAssessment, observedState: val as any },
                        }))
                      }
                      columns={4}
                    />

                    <ClinicalOptionGroup
                      label="Queixas Referidas"
                      options={['sem queixas', 'dor', 'náusea', 'outro']}
                      value={form.generalAssessment.complaints}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          generalAssessment: { ...prev.generalAssessment, complaints: val as any },
                        }))
                      }
                      columns={4}
                    />

                    {form.generalAssessment.complaints && form.generalAssessment.complaints !== 'sem queixas' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <ClinicalTextInput
                          label="Detalhes da queixa referida"
                          value={form.generalAssessment.complaintsDetails || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              generalAssessment: { ...prev.generalAssessment, complaintsDetails: val },
                            }))
                          }
                          placeholder="Ex: Dor em pontada no abdome, náuseas pós-alimentação..."
                        />
                        <ClinicalOptionGroup
                          label="Fonte da Informação"
                          options={['paciente', 'acompanhante', 'equipe']}
                          value={form.generalAssessment.source}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              generalAssessment: { ...prev.generalAssessment, source: val as any },
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ClinicalOptionGroup
                        label="Higiene Corporal"
                        options={['preservada', 'necessita auxílio', 'realizada no período']}
                        value={form.generalAssessment.hygiene}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            generalAssessment: { ...prev.generalAssessment, hygiene: val as any },
                          }))
                        }
                      />

                      <ClinicalOptionGroup
                        label="Mobilidade Inicial Observada"
                        options={['deambula sem auxílio', 'deambula com auxílio', 'restrito ao leito']}
                        value={form.generalAssessment.mobility}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            generalAssessment: { ...prev.generalAssessment, mobility: val as any },
                          }))
                        }
                      />
                    </div>
                  </div>
                </ClinicalSection>
              </div>

              {/* 4. Pain */}
              <div className={activeSection === 3 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-pain"
                  title="4. Dor Pós-Operatória"
                  subtitle="Escala numérica de dor e localização informada pelo paciente"
                  status={sectionStatuses['Dor Pós-Operatória']}
                  isOpen={activeSection === 3}
                  onToggle={() => setActiveSection(activeSection === 3 ? -1 : 3)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Status da Avaliação de Dor"
                      options={['sem dor', 'avaliada', 'não avaliada']}
                      value={form.pain.status}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          pain: {
                            ...prev.pain,
                            status: val as any,
                            ...(val !== 'avaliada' ? { numericScaleValue: undefined, location: '' } : {}),
                          },
                        }))
                      }
                      columns={3}
                    />

                    {form.pain.status === 'avaliada' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <ClinicalNumericInput
                          label="Escala Numérica de Dor (0 a 10)"
                          value={form.pain.numericScaleValue}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              pain: { ...prev.pain, numericScaleValue: val },
                            }))
                          }
                          min={0}
                          max={10}
                          step={1}
                          unit="/10"
                        />
                        <ClinicalTextInput
                          label="Localização da dor referida"
                          value={form.pain.location || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              pain: { ...prev.pain, location: val },
                            }))
                          }
                          placeholder="Ex: Incisional abdominal, ferida cirúrgica em joelho..."
                        />
                      </div>
                    )}
                  </div>
                </ClinicalSection>
              </div>

              {/* 5. Vital Signs */}
              <div className={activeSection === 4 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-vitals"
                  title="5. Sinais Vitais"
                  subtitle="PA, PAM manual aferida (sem cálculo), FC, FR, SpO2, Temperatura e Glicemia capilar"
                  status={sectionStatuses['Sinais Vitais']}
                  isOpen={activeSection === 4}
                  onToggle={() => setActiveSection(activeSection === 4 ? -1 : 4)}
                >
                  <VitalSignsInputs
                    values={vitalsData}
                    onChange={handleVitalsChange}
                    showBloodGlucose={true}
                  />
                </ClinicalSection>
              </div>

              {/* 6. Respiratory */}
              <div className={activeSection === 5 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-resp"
                  title="6. Suporte Ventilatório e Padrão Respiratório"
                  subtitle="Suporte de oxigênio e padrão observado"
                  status={sectionStatuses['Respiratório']}
                  isOpen={activeSection === 5}
                  onToggle={() => setActiveSection(activeSection === 5 ? -1 : 5)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Suporte Ventilatório"
                      options={['ar ambiente', 'oxigenoterapia']}
                      value={form.respiratory.support}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          respiratory: {
                            ...prev.respiratory,
                            support: val as any,
                            ...(val === 'ar ambiente' ? { oxygenDevice: '', oxygenFlow: '' } : {}),
                          },
                        }))
                      }
                      columns={2}
                    />

                    {form.respiratory.support === 'oxigenoterapia' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <ClinicalOptionGroup
                          label="Dispositivo de Oxigenoterapia"
                          options={['cateter nasal', 'máscara de venturi', 'máscara não reinalante', 'outro']}
                          value={form.respiratory.oxygenDevice || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              respiratory: { ...prev.respiratory, oxygenDevice: val as any },
                            }))
                          }
                        />
                        <ClinicalTextInput
                          label="Fluxo de Oxigênio (L/min)"
                          value={form.respiratory.oxygenFlow || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              respiratory: { ...prev.respiratory, oxygenFlow: val },
                            }))
                          }
                          placeholder="Ex: 2, 3, 5..."
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ClinicalOptionGroup
                        label="Padrão Respiratório"
                        options={['eupneico', 'taquipneico', 'bradipneico', 'outro']}
                        value={form.respiratory.pattern}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            respiratory: { ...prev.respiratory, pattern: val as any },
                          }))
                        }
                      />

                      <ClinicalOptionGroup
                        label="Desconforto Respiratório"
                        options={['ausente', 'presente']}
                        value={form.respiratory.discomfort}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            respiratory: { ...prev.respiratory, discomfort: val as any },
                          }))
                        }
                      />
                    </div>
                  </div>
                </ClinicalSection>
              </div>

              {/* 7. Wound & Dressing */}
              <div className={activeSection === 6 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-wound"
                  title="7. Ferida e Curativo Cirúrgico Observado"
                  subtitle="Inspeção da incisão cirúrgica, presença de curativo e condições objetivas"
                  status={sectionStatuses['Ferida / Curativo']}
                  isOpen={activeSection === 6}
                  onToggle={() => setActiveSection(activeSection === 6 ? -1 : 6)}
                >
                  <SurgicalWoundInputs
                    value={form.wound}
                    onChange={(val) => setForm((prev) => ({ ...prev, wound: val }))}
                  />
                </ClinicalSection>
              </div>

              {/* 8. Drains and Devices */}
              <div className={activeSection === 7 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-devices"
                  title="8. Drenos e Dispositivos Invasivos"
                  subtitle="Drenos (tórax, abdominal, cirúrgico), acessos vasculares, sondas e curativos"
                  status={sectionStatuses['Drenos e Dispositivos']}
                  isOpen={activeSection === 7}
                  onToggle={() => setActiveSection(activeSection === 7 ? -1 : 7)}
                >
                  <DeviceFormCard
                    devices={form.devices}
                    onChange={(devs) => setForm((prev) => ({ ...prev, devices: devs }))}
                    availableTypes={SURGICAL_CLINIC_DEVICE_TYPES}
                  />
                </ClinicalSection>
              </div>

              {/* 9. Nutrition */}
              <div className={activeSection === 8 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-nutrition"
                  title="9. Alimentação"
                  subtitle="Via de alimentação, jejum pós-operatório e aceitação"
                  status={sectionStatuses['Alimentação']}
                  isOpen={activeSection === 8}
                  onToggle={() => setActiveSection(activeSection === 8 ? -1 : 8)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Via de Alimentação"
                      options={['jejum', 'oral', 'enteral', 'outra']}
                      value={form.nutrition.route}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, route: val as any },
                        }))
                      }
                      columns={4}
                    />

                    {form.nutrition.route === 'oral' && (
                      <ClinicalOptionGroup
                        label="Aceitação da Dieta Oral"
                        options={['boa', 'moderada', 'baixa']}
                        value={form.nutrition.oralAcceptance || ''}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            nutrition: { ...prev.nutrition, oralAcceptance: val as any },
                          }))
                        }
                        columns={3}
                      />
                    )}

                    {form.nutrition.route === 'enteral' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <ClinicalOptionGroup
                          label="Dispositivo"
                          options={['SNE', 'SNG', 'GTT', 'outra']}
                          value={form.nutrition.enteralDevice || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              nutrition: { ...prev.nutrition, enteralDevice: val as any },
                            }))
                          }
                        />
                        <ClinicalTextInput
                          label="Vazão de infusão"
                          value={form.nutrition.enteralRate || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              nutrition: { ...prev.nutrition, enteralRate: val },
                            }))
                          }
                          placeholder="Ex: 50 mL/h"
                        />
                        <ClinicalTextInput
                          label="Tolerância relatada"
                          value={form.nutrition.enteralTolerance || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              nutrition: { ...prev.nutrition, enteralTolerance: val },
                            }))
                          }
                          placeholder="Ex: Sem resíduo gástrico"
                        />
                      </div>
                    )}
                  </div>
                </ClinicalSection>
              </div>

              {/* 10. Eliminations */}
              <div className={activeSection === 9 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-eliminations"
                  title="10. Eliminações"
                  subtitle="Eliminações vesicais e intestinais"
                  status={sectionStatuses['Eliminações']}
                  isOpen={activeSection === 9}
                  onToggle={() => setActiveSection(activeSection === 9 ? -1 : 9)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <ClinicalOptionGroup
                        label="Diurese"
                        options={['presente', 'ausente', 'não avaliada']}
                        value={form.eliminations.urinary}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            eliminations: { ...prev.eliminations, urinary: val as any },
                          }))
                        }
                      />
                      {form.eliminations.urinary === 'presente' && (
                        <ClinicalOptionGroup
                          label="Via da Diurese"
                          options={['espontânea', 'SVD', 'outra']}
                          value={form.eliminations.urinaryRoute || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              eliminations: { ...prev.eliminations, urinaryRoute: val as any },
                            }))
                          }
                        />
                      )}
                    </div>

                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <ClinicalOptionGroup
                        label="Evacuação"
                        options={['presente', 'ausente']}
                        value={form.eliminations.bowel}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            eliminations: { ...prev.eliminations, bowel: val as any },
                          }))
                        }
                      />
                      {form.eliminations.bowel === 'presente' && (
                        <ClinicalOptionGroup
                          label="Aspecto Fecal"
                          options={['formada', 'pastosa', 'líquida', 'outro']}
                          value={form.eliminations.bowelAspect || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              eliminations: { ...prev.eliminations, bowelAspect: val as any },
                            }))
                          }
                        />
                      )}
                    </div>
                  </div>
                </ClinicalSection>
              </div>

              {/* 11. Mobility */}
              <div className={activeSection === 10 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-mobility"
                  title="11. Mobilidade e Pós-Operatório"
                  subtitle="Deambulação precoce pós-cirúrgica, auxílio e posicionamento"
                  status={sectionStatuses['Mobilidade']}
                  isOpen={activeSection === 10}
                  onToggle={() => setActiveSection(activeSection === 10 ? -1 : 10)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Deambulação no Período"
                      options={['realizada', 'não realizada', 'restrito ao leito']}
                      value={form.mobility.ambulation}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          mobility: {
                            ...prev.mobility,
                            ambulation: val as any,
                            ...(val !== 'realizada' ? { assistance: '' } : {}),
                          },
                        }))
                      }
                      columns={3}
                    />

                    {form.mobility.ambulation === 'realizada' && (
                      <ClinicalOptionGroup
                        label="Auxílio na Deambulação"
                        options={['sem auxílio', 'com auxílio']}
                        value={form.mobility.assistance || ''}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            mobility: { ...prev.mobility, assistance: val as any },
                          }))
                        }
                        columns={2}
                      />
                    )}
                  </div>
                </ClinicalSection>
              </div>

              {/* 12. Bath & Hygiene */}
              <div className={activeSection === 11 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-bath"
                  title="12. Banho e Higiene"
                  subtitle="Tipo de banho realizado no plantão e tolerância do paciente"
                  status={sectionStatuses['Banho e Higiene']}
                  isOpen={activeSection === 11}
                  onToggle={() => setActiveSection(activeSection === 11 ? -1 : 11)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Banho Realizado"
                      options={['banho no leito', 'banho de aspersão', 'não realizado']}
                      value={form.bath.performed}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          bath: {
                            ...prev.bath,
                            performed: val as any,
                            ...(val === 'não realizado' ? { tolerance: '' } : {}),
                          },
                        }))
                      }
                      columns={3}
                    />

                    {form.bath.performed && form.bath.performed !== 'não realizado' && (
                      <ClinicalTextInput
                        label="Tolerância ao banho relatada / observada"
                        value={form.bath.tolerance || ''}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            bath: { ...prev.bath, tolerance: val },
                          }))
                        }
                        placeholder="Ex: Boa tolerância sem queixas de tontura ou dor..."
                      />
                    )}
                  </div>
                </ClinicalSection>
              </div>

              {/* 13. Nursing Care */}
              <div className={activeSection === 12 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-care"
                  title="13. Cuidados Realizados"
                  subtitle="Checklist padronizado de ações do Técnico em Enfermagem"
                  status={sectionStatuses['Cuidados Realizados']}
                  isOpen={activeSection === 12}
                  onToggle={() => setActiveSection(activeSection === 12 ? -1 : 12)}
                >
                  <div className="space-y-4">
                    <ClinicalMultiSelect
                      label="Cuidados de Enfermagem Executados"
                      options={SURGICAL_CLINIC_CARE_ACTIONS as unknown as string[]}
                      selectedValues={form.care.actions}
                      onChange={(acts) =>
                        setForm((prev) => ({
                          ...prev,
                          care: { ...prev.care, actions: acts },
                        }))
                      }
                    />

                    <ClinicalTextInput
                      label="Outros cuidados prestados (se houver)"
                      value={form.care.otherCare || ''}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          care: { ...prev.care, otherCare: val },
                        }))
                      }
                      placeholder="Ex: Auxílio na troca de camisola, instalação de coxim..."
                    />
                  </div>
                </ClinicalSection>
              </div>

              {/* 14. Complications */}
              <div className={activeSection === 13 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-complications"
                  title="14. Intercorrências no Período"
                  subtitle="Registro pontual de eventos, conduta e comunicação à equipe"
                  status={sectionStatuses['Intercorrências']}
                  isOpen={activeSection === 13}
                  onToggle={() => setActiveSection(activeSection === 13 ? -1 : 13)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Houve Intercorrência no Plantão?"
                      options={['não', 'sim', 'não informado']}
                      value={form.complications.hasComplication}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          complications: {
                            ...prev.complications,
                            hasComplication: val as any,
                            ...(val !== 'sim' ? { description: '', conduct: '', communication: '' } : {}),
                          },
                        }))
                      }
                      columns={3}
                    />

                    {form.complications.hasComplication === 'sim' && (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <ClinicalTextInput
                          label="Descrição factual da intercorrência"
                          required
                          value={form.complications.description || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              complications: { ...prev.complications, description: val },
                            }))
                          }
                          placeholder="Ex: Episódio de náusea e vômito alimentar após o almoço..."
                        />
                        <ClinicalTextInput
                          label="Conduta imediata executada"
                          value={form.complications.conduct || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              complications: { ...prev.complications, conduct: val },
                            }))
                          }
                          placeholder="Ex: Posicionado em decúbito elevado, administrada medicação prescrita..."
                        />
                        <ClinicalTextInput
                          label="Comunicação à equipe"
                          value={form.complications.communication || ''}
                          onChange={(val) =>
                            setForm((prev) => ({
                              ...prev,
                              complications: { ...prev.complications, communication: val },
                            }))
                          }
                          placeholder="Ex: Enfermeiro de plantão e médico assistente comunicados..."
                        />
                      </div>
                    )}
                  </div>
                </ClinicalSection>
              </div>

              {/* 15. Final Status */}
              <div className={activeSection === 14 ? 'block' : 'hidden lg:block'}>
                <ClinicalSection
                  id="sec-final-status"
                  title="15. Situação Final"
                  subtitle="Destino e condição ao final do atendimento ou passagem de plantão"
                  status={sectionStatuses['Situação Final']}
                  isOpen={activeSection === 14}
                  onToggle={() => setActiveSection(activeSection === 14 ? -1 : 14)}
                >
                  <div className="space-y-4">
                    <ClinicalOptionGroup
                      label="Situação do Paciente"
                      options={[
                        'permanece no setor sob cuidados de enfermagem',
                        'transferido',
                        'encaminhado',
                        'alta do setor',
                        'outro',
                      ]}
                      value={form.finalStatus.status}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          finalStatus: { ...prev.finalStatus, status: val as any },
                        }))
                      }
                      columns={2}
                    />

                    {form.finalStatus.status && form.finalStatus.status !== 'permanece no setor sob cuidados de enfermagem' && (
                      <ClinicalTextInput
                        label="Detalhes da situação final"
                        value={form.finalStatus.details || ''}
                        onChange={(val) =>
                          setForm((prev) => ({
                            ...prev,
                            finalStatus: { ...prev.finalStatus, details: val },
                          }))
                        }
                        placeholder="Ex: Transferido para UTI cirúrgica, alta para domicílio..."
                      />
                    )}
                  </div>
                </ClinicalSection>
              </div>
            </div>
          </>
        ) : (
          /* Preview Panel */
          <div className="col-span-12 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-800" />
                    <span>Anotação de Enfermagem Gerada</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Construção 100% determinística a partir de AuthorizedClinicalFacts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!deterministicResult.narrative}
                    className="min-h-[44px] px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>

              {/* Narrative Content */}
              {deterministicResult.narrative ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {aiRefinedNarrative || deterministicResult.narrative}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum dado clínico registrado para gerar o texto da anotação.
                </div>
              )}

              {/* Traces Audit Information */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Auditoria Determinística: {deterministicResult.traces.length} segmento(s) rastreado(s) com sucesso.
                  </span>
                </div>
                <span>Zero dados alucinados</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
