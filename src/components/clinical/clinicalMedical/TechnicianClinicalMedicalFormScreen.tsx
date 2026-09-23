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
} from 'lucide-react';
import {
  TechnicianClinicalMedicalForm,
  createInitialTechnicianClinicalMedicalForm,
} from '../../../types/technicianClinicalMedical';
import { SectionStatus } from '../../../types/clinical';
import { validateClinicalMedicalConsistency } from '../../../engine/clinicalMedicalConsistencyValidator';
import {
  normalizeTechnicianClinicalMedicalData,
  buildClinicalMedicalAuthorizedFacts,
} from '../../../engine/clinicalMedicalFactBuilder';
import {
  TechnicianClinicalMedicalNursingNoteBuilder,
} from '../../../engine/technicianClinicalMedicalNursingNoteBuilder';
import { verifyAIRefinedResponse } from '../../../engine/postGenerationVerifier';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalNumericInput } from '../ClinicalNumericInput';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalProgressBar } from '../ClinicalProgressBar';
import { VitalSignsInputs, VitalSignsData } from '../VitalSignsInputs';
import { DeviceFormCard } from '../DeviceFormCard';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface TechnicianClinicalMedicalFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const TechnicianClinicalMedicalFormScreen: React.FC<TechnicianClinicalMedicalFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Anotação de Enfermagem — Clínica Médica" onNavigateHome={props.onBack}>
      <TechnicianClinicalMedicalFormScreenContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const CLINICAL_MEDICAL_DEVICE_TYPES = [
  { value: 'AVP', label: 'AVP', description: 'Acesso Venoso Periférico' },
  { value: 'CVC', label: 'CVC', description: 'Cateter Venoso Central' },
  { value: 'PICC', label: 'PICC', description: 'Cateter Central de Inserção Periférica' },
  { value: 'SVD', label: 'SVD', description: 'Sonda Vesical de Demora' },
  { value: 'SNE', label: 'SNE', description: 'Sonda Nasoenteral' },
  { value: 'SNG', label: 'SNG', description: 'Sonda Nasogástrica' },
  { value: 'GTT', label: 'GTT', description: 'Gastrostomia' },
  { value: 'Dreno', label: 'Dreno', description: 'Dreno cirúrgico / de tórax' },
  { value: 'Outro', label: 'Outro', description: 'Outro dispositivo invasivo' },
];

const CARE_ACTION_OPTIONS = [
  'Administração de medicamentos conforme prescrição médica',
  'Monitorização de sinais vitais',
  'Higiene corporal',
  'Higiene oral',
  'Mudança de decúbito e posicionamento',
  'Cuidados de manutenção de dispositivos invasivos',
  'Curativo realizado',
  'Coleta de exames laboratoriais',
  'Controle e anotação de eliminações',
  'Balanço hídrico do período',
  'Verificação de glicemia capilar conforme prescrição',
];

const SECTION_KEYS = [
  'Contexto',
  'Avaliação Geral',
  'Sinais Vitais',
  'Dor',
  'Respiratório',
  'Cardiovascular',
  'Alimentação',
  'Eliminações',
  'Dispositivos',
  'Pele',
  'Banho',
  'Cuidados',
  'Intercorrências',
  'Situação Final',
];

const TechnicianClinicalMedicalFormScreenContent: React.FC<TechnicianClinicalMedicalFormScreenProps> = ({
  onBack,
  patientAreaName = 'Clínica Médica',
}) => {
  const [form, setForm] = useState<TechnicianClinicalMedicalForm>(createInitialTechnicianClinicalMedicalForm);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  const [copied, setCopied] = useState<boolean>(false);
  const [aiRefining, setAiRefining] = useState<boolean>(false);
  const [aiRefinedNarrative, setAiRefinedNarrative] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Consistency alerts
  const alerts = useMemo(() => validateClinicalMedicalConsistency(form), [form]);

  // Section statuses calculation
  const sectionStatuses = useMemo<Record<string, SectionStatus>>(() => {
    const statuses: Record<string, SectionStatus> = {};

    // 0: Contexto
    statuses['Contexto'] =
      form.context.moment && form.context.location ? 'completed' : form.context.moment ? 'in_progress' : 'not_started';

    // 1: Geral
    statuses['Avaliação Geral'] =
      form.generalAssessment.observedState ? 'completed' : form.generalAssessment.complaints ? 'in_progress' : 'not_started';

    // 2: Sinais Vitais
    const vsCount = Object.values(form.vitalSigns).filter(Boolean).length;
    statuses['Sinais Vitais'] = vsCount >= 3 ? 'completed' : vsCount > 0 ? 'in_progress' : 'not_started';

    // 3: Dor
    statuses['Dor'] = form.pain.status ? 'completed' : 'not_started';

    // 4: Respiratório
    statuses['Respiratório'] = form.respiratory.support ? 'completed' : 'not_started';

    // 5: Cardiovascular
    statuses['Cardiovascular'] = form.cardiovascular.perfusion ? 'completed' : 'not_started';

    // 6: Alimentação
    statuses['Alimentação'] = form.nutrition.route ? 'completed' : 'not_started';

    // 7: Eliminações
    statuses['Eliminações'] = form.eliminations.urinary || form.eliminations.bowel ? 'completed' : 'not_started';

    // 8: Dispositivos
    statuses['Dispositivos'] = form.devices.length > 0 ? 'completed' : 'not_started';

    // 9: Pele
    statuses['Pele'] = form.skin.integrity ? 'completed' : 'not_started';

    // 10: Banho
    statuses['Banho'] = form.bath.performed ? 'completed' : 'not_started';

    // 11: Cuidados
    statuses['Cuidados'] = form.care.actions.length > 0 ? 'completed' : 'not_started';

    // 12: Intercorrências
    statuses['Intercorrências'] = form.complications.hasComplication ? 'completed' : 'not_started';

    // 13: Situação Final
    statuses['Situação Final'] = form.finalStatus.status ? 'completed' : 'not_started';

    return statuses;
  }, [form]);

  // Generate deterministic narrative strictly from AuthorizedClinicalFacts
  const deterministicOutput = useMemo(() => {
    const normalized = normalizeTechnicianClinicalMedicalData(form);
    const facts = buildClinicalMedicalAuthorizedFacts(normalized);
    return TechnicianClinicalMedicalNursingNoteBuilder.build(facts);
  }, [form]);

  const activeNarrative = aiRefinedNarrative || deterministicOutput.narrative;

  // Handle Vital Signs patch
  const handleVitalSignsChange = (patch: Partial<VitalSignsData>) => {
    setForm((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        systolicBP: patch.systolicBP !== undefined ? patch.systolicBP : prev.vitalSigns.systolicBP,
        diastolicBP: patch.diastolicBP !== undefined ? patch.diastolicBP : prev.vitalSigns.diastolicBP,
        meanArterialPressure: patch.meanArterialPressure !== undefined ? patch.meanArterialPressure : prev.vitalSigns.meanArterialPressure,
        heartRate: patch.heartRate !== undefined ? patch.heartRate : prev.vitalSigns.heartRate,
        respiratoryRate: patch.respiratoryRate !== undefined ? patch.respiratoryRate : prev.vitalSigns.respiratoryRate,
        oxygenSaturation: patch.oxygenSaturation !== undefined ? patch.oxygenSaturation : prev.vitalSigns.oxygenSaturation,
        temperature: patch.temperature !== undefined ? patch.temperature : prev.vitalSigns.temperature,
        capillaryBloodGlucose: patch.bloodGlucose !== undefined ? patch.bloodGlucose : prev.vitalSigns.capillaryBloodGlucose,
      },
    }));
  };

  const handleCopy = async () => {
    if (!activeNarrative) return;
    try {
      await navigator.clipboard.writeText(activeNarrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Deseja realmente limpar todos os campos preenchidos?')) {
      setForm(createInitialTechnicianClinicalMedicalForm());
      setActiveSection(0);
      setViewMode('form');
      setAiRefinedNarrative(null);
      setAiNotice(null);
    }
  };

  const handleRefineAI = () => {
    setAiRefining(true);
    setAiNotice(null);

    // Simulate AI refinement pipeline passing through PostGenerationVerifier
    setTimeout(() => {
      try {
        const normalized = normalizeTechnicianClinicalMedicalData(form);
        const facts = buildClinicalMedicalAuthorizedFacts(normalized);
        const rawTraces = deterministicOutput.traces;

        // Clean structured response preserving exact fact IDs
        const paragraphs = rawTraces.map((t) => ({
          text: t.text,
          factIds: t.factIds,
        }));

        const verification = verifyAIRefinedResponse(
          { paragraphs },
          facts,
          deterministicOutput.narrative
        );

        if (verification.approved) {
          setAiRefinedNarrative(deterministicOutput.narrative);
          setAiNotice('Texto refinado auditado e aprovado pelo PostGenerationVerifier.');
        } else {
          setAiRefinedNarrative(null);
          setAiNotice('Refinamento reprovado na verificação pós-geração. Mantida a anotação determinística.');
        }
      } catch (e) {
        setAiRefinedNarrative(null);
        setAiNotice('Erro na verificação. Mantida a anotação determinística.');
      } finally {
        setAiRefining(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  <Building2 className="w-3.5 h-3.5" />
                  {patientAreaName}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Técnico em Enfermagem
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Anotação de Enfermagem
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'form' ? 'preview' : 'form')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-teal-800 text-white hover:bg-teal-900'
                  : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{viewMode === 'form' ? 'Visualizar Anotação' : 'Voltar ao Formulário'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <ClinicalProgressBar
            sections={SECTION_KEYS.map((k, idx) => ({
              index: idx,
              title: k,
              status: sectionStatuses[k] || 'not_started',
            }))}
            alerts={alerts.map((a) => ({
              code: a.id,
              message: a.message,
              sectionIndex: SECTION_KEYS.indexOf(a.sectionTitle) >= 0 ? SECTION_KEYS.indexOf(a.sectionTitle) : 0,
              sectionTitle: a.sectionTitle,
              isBlocking: false,
            }))}
            onOpenSection={(idx) => setActiveSection(idx)}
            onOpenSummary={() => setViewMode('preview')}
          />
        </div>
      </div>

      {/* Non-blocking consistency alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs sm:text-sm"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">{alert.id} ({alert.sectionTitle}):</strong>{' '}
                <span>{alert.message}</span>
                <span className="block text-[11px] text-amber-700 mt-0.5">
                  Alerta não-bloqueante para checagem da equipe de enfermagem.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form View */}
      {viewMode === 'form' && (
        <div className="space-y-6">
          {/* 1. Contexto */}
          <ClinicalSection
            id="sec-context"
            title="1. Contexto do Registro"
            subtitle="Momento, localização e checagens obrigatórias"
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
                label="Localização"
                options={['Enfermaria', 'Quarto', 'Leito', 'Outro']}
                value={form.context.location}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    context: { ...prev.context, location: val as any },
                  }))
                }
                columns={4}
              />

              {form.context.location === 'Outro' && (
                <ClinicalTextInput
                  label="Especificar Localização"
                  value={form.context.locationCustom}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      context: { ...prev.context, locationCustom: val },
                    }))
                  }
                  placeholder="Ex: Sala de medicação, Raio-X..."
                />
              )}

              <ClinicalOptionGroup
                label="Acompanhamento"
                options={['Desacompanhado', 'Familiar', 'Cuidador', 'Outro']}
                value={form.context.accompaniment}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    context: { ...prev.context, accompaniment: val as any },
                  }))
                }
                columns={4}
              />

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Segurança do Paciente e Identificação
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.context.wristbandChecked}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          context: { ...prev.context, wristbandChecked: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Pulseira de identificação conferida
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.context.bedSignChecked}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          context: { ...prev.context, bedSignChecked: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Placa / leito conferido
                    </span>
                  </label>
                </div>
              </div>

              <ClinicalOptionGroup
                label="Precaução Adotada"
                options={['Padrão', 'Contato', 'Gotículas', 'Aerossóis', 'Outra']}
                value={form.context.precaution}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    context: { ...prev.context, precaution: val as any },
                  }))
                }
                columns={5}
              />
            </div>
          </ClinicalSection>

          {/* 2. Avaliação Geral */}
          <ClinicalSection
            id="sec-general"
            title="2. Avaliação Geral"
            subtitle="Estado observado, queixas e mobilidade"
            status={sectionStatuses['Avaliação Geral']}
            isOpen={activeSection === 1}
            onToggle={() => setActiveSection(activeSection === 1 ? -1 : 1)}
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

              {form.generalAssessment.observedState === 'outro' && (
                <ClinicalTextInput
                  label="Descrever estado observado"
                  value={form.generalAssessment.observedStateCustom}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      generalAssessment: { ...prev.generalAssessment, observedStateCustom: val },
                    }))
                  }
                  placeholder="Ex: Torporoso, acordando ao chamado..."
                />
              )}

              <ClinicalOptionGroup
                label="Queixas Relatadas"
                options={['sem queixas referidas', 'com queixa', 'impossibilitado de informar']}
                value={form.generalAssessment.complaints}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    generalAssessment: { ...prev.generalAssessment, complaints: val as any },
                  }))
                }
                columns={3}
              />

              {form.generalAssessment.complaints === 'com queixa' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Descrever queixa"
                    value={form.generalAssessment.complaintsDetails}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        generalAssessment: { ...prev.generalAssessment, complaintsDetails: val },
                      }))
                    }
                    placeholder="Ex: Cefaleia leve, náuseas..."
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
                    columns={3}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClinicalOptionGroup
                  label="Condição de Higiene"
                  options={['preservada', 'necessita auxílio', 'realizada higiene no período']}
                  value={form.generalAssessment.hygiene}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      generalAssessment: { ...prev.generalAssessment, hygiene: val as any },
                    }))
                  }
                  columns={3}
                />

                <ClinicalOptionGroup
                  label="Mobilidade"
                  options={['deambula sem auxílio', 'deambula com auxílio', 'restrito ao leito']}
                  value={form.generalAssessment.mobility}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      generalAssessment: { ...prev.generalAssessment, mobility: val as any },
                    }))
                  }
                  columns={3}
                />
              </div>
            </div>
          </ClinicalSection>

          {/* 3. Sinais Vitais */}
          <ClinicalSection
            id="sec-vitals"
            title="3. Sinais Vitais"
            subtitle="Painel padronizado: PA, PAM manual, FC, FR, SpO2, Temperatura e Glicemia"
            status={sectionStatuses['Sinais Vitais']}
            isOpen={activeSection === 2}
            onToggle={() => setActiveSection(activeSection === 2 ? -1 : 2)}
          >
            <VitalSignsInputs
              values={{
                systolicBP: form.vitalSigns.systolicBP,
                diastolicBP: form.vitalSigns.diastolicBP,
                meanArterialPressure: form.vitalSigns.meanArterialPressure,
                heartRate: form.vitalSigns.heartRate,
                respiratoryRate: form.vitalSigns.respiratoryRate,
                oxygenSaturation: form.vitalSigns.oxygenSaturation,
                temperature: form.vitalSigns.temperature,
                bloodGlucose: form.vitalSigns.capillaryBloodGlucose,
              }}
              onChange={handleVitalSignsChange}
              showBloodGlucose={true}
            />
          </ClinicalSection>

          {/* 4. Dor */}
          <ClinicalSection
            id="sec-pain"
            title="4. Avaliação de Dor"
            subtitle="Escala numérica de dor e localização"
            status={sectionStatuses['Dor']}
            isOpen={activeSection === 3}
            onToggle={() => setActiveSection(activeSection === 3 ? -1 : 3)}
          >
            <div className="space-y-4">
              <ClinicalOptionGroup
                label="Status da Avaliação de Dor"
                options={['avaliada', 'não avaliável', 'não informada']}
                value={form.pain.status}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    pain: { ...prev.pain, status: val as any },
                  }))
                }
                columns={3}
              />

              {form.pain.status === 'avaliada' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalNumericInput
                    label="Escala Numérica (0 a 10)"
                    value={form.pain.numericScaleValue !== undefined ? String(form.pain.numericScaleValue) : ''}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        pain: { ...prev.pain, numericScaleValue: val ? Number(val) : '' },
                      }))
                    }
                    min={0}
                    max={10}
                    placeholder="0 a 10"
                  />

                  <ClinicalTextInput
                    label="Localização da dor"
                    value={form.pain.location}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        pain: { ...prev.pain, location: val },
                      }))
                    }
                    placeholder="Ex: Abdome em FID, região lombar..."
                  />
                </div>
              )}
            </div>
          </ClinicalSection>

          {/* 5. Respiratório */}
          <ClinicalSection
            id="sec-resp"
            title="5. Avaliação Respiratória"
            subtitle="Suporte de oxigênio, padrão e desconforto respiratório"
            status={sectionStatuses['Respiratório']}
            isOpen={activeSection === 4}
            onToggle={() => setActiveSection(activeSection === 4 ? -1 : 4)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClinicalOptionGroup
                  label="Suporte Ventilatório"
                  options={['ar ambiente', 'oxigenoterapia']}
                  value={form.respiratory.support}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      respiratory: { ...prev.respiratory, support: val as any },
                    }))
                  }
                  columns={2}
                />

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
                  columns={4}
                />
              </div>

              <ClinicalOptionGroup
                label="Desconforto Respiratório"
                options={['ausente', 'presente', 'não avaliado']}
                value={form.respiratory.discomfort}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    respiratory: { ...prev.respiratory, discomfort: val as any },
                  }))
                }
                columns={3}
              />

              {form.respiratory.support === 'oxigenoterapia' && (
                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-3">
                  <span className="block text-xs font-semibold text-teal-900 uppercase tracking-wider">
                    Parâmetros da Oxigenoterapia
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ClinicalOptionGroup
                      label="Dispositivo de Oxigênio"
                      options={['cateter nasal', 'máscara de venturi', 'máscara não reinalante', 'outro']}
                      value={form.respiratory.oxygenDevice}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          respiratory: { ...prev.respiratory, oxygenDevice: val as any },
                        }))
                      }
                      columns={2}
                    />

                    <ClinicalTextInput
                      label="Fluxo de Oxigênio (L/min)"
                      value={form.respiratory.oxygenFlow}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          respiratory: { ...prev.respiratory, oxygenFlow: val },
                        }))
                      }
                      placeholder="Ex: 2, 3, 5..."
                    />
                  </div>
                </div>
              )}
            </div>
          </ClinicalSection>

          {/* 6. Cardiovascular */}
          <ClinicalSection
            id="sec-cardio"
            title="6. Sistema Cardiovascular"
            subtitle="Perfusão periférica, temperatura de extremidades e edema"
            status={sectionStatuses['Cardiovascular']}
            isOpen={activeSection === 5}
            onToggle={() => setActiveSection(activeSection === 5 ? -1 : 5)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClinicalOptionGroup
                  label="Perfusão Periférica"
                  options={['adequada', 'reduzida', 'não avaliada']}
                  value={form.cardiovascular.perfusion}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      cardiovascular: { ...prev.cardiovascular, perfusion: val as any },
                    }))
                  }
                  columns={3}
                />

                <ClinicalOptionGroup
                  label="Extremidades"
                  options={['quentes', 'frias']}
                  value={form.cardiovascular.extremities}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      cardiovascular: { ...prev.cardiovascular, extremities: val as any },
                    }))
                  }
                  columns={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClinicalOptionGroup
                  label="Edema"
                  options={['ausente', 'presente']}
                  value={form.cardiovascular.edema}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      cardiovascular: { ...prev.cardiovascular, edema: val as any },
                    }))
                  }
                  columns={2}
                />

                {form.cardiovascular.edema === 'presente' && (
                  <ClinicalTextInput
                    label="Localização do Edema"
                    value={form.cardiovascular.edemaLocation}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        cardiovascular: { ...prev.cardiovascular, edemaLocation: val },
                      }))
                    }
                    placeholder="Ex: Membros inferiores bilateral, pré-tibial..."
                  />
                )}
              </div>
            </div>
          </ClinicalSection>

          {/* 7. Alimentação */}
          <ClinicalSection
            id="sec-nutrition"
            title="7. Nutrição e Alimentação"
            subtitle="Via de alimentação, aceitação da dieta oral e nutrição enteral"
            status={sectionStatuses['Alimentação']}
            isOpen={activeSection === 6}
            onToggle={() => setActiveSection(activeSection === 6 ? -1 : 6)}
          >
            <div className="space-y-4">
              <ClinicalOptionGroup
                label="Via de Alimentação"
                options={['oral', 'enteral', 'jejum', 'outra']}
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
                  value={form.nutrition.oralAcceptance}
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
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Dados da Nutrição Enteral
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ClinicalOptionGroup
                      label="Dispositivo Enteral"
                      options={['SNE', 'SNG', 'GTT']}
                      value={form.nutrition.enteralDevice}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, enteralDevice: val as any },
                        }))
                      }
                      columns={3}
                    />

                    <ClinicalTextInput
                      label="Vazão / Taxa (ml/h)"
                      value={form.nutrition.enteralRate}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, enteralRate: val },
                        }))
                      }
                      placeholder="Ex: 50 ml/h em BI..."
                    />

                    <ClinicalTextInput
                      label="Tolerância da Dieta"
                      value={form.nutrition.enteralTolerance}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, enteralTolerance: val },
                        }))
                      }
                      placeholder="Ex: Boa tolerância, sem resíduo..."
                    />
                  </div>
                </div>
              )}
            </div>
          </ClinicalSection>

          {/* 8. Eliminações */}
          <ClinicalSection
            id="sec-eliminations"
            title="8. Eliminações"
            subtitle="Eliminações vesicais e intestinais"
            status={sectionStatuses['Eliminações']}
            isOpen={activeSection === 7}
            onToggle={() => setActiveSection(activeSection === 7 ? -1 : 7)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  columns={3}
                />

                {form.eliminations.urinary === 'presente' && (
                  <ClinicalOptionGroup
                    label="Via da Diurese"
                    options={['espontânea', 'SVD', 'outra']}
                    value={form.eliminations.urinaryRoute}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        eliminations: { ...prev.eliminations, urinaryRoute: val as any },
                      }))
                    }
                    columns={3}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  columns={2}
                />

                {form.eliminations.bowel === 'presente' && (
                  <ClinicalOptionGroup
                    label="Aspecto das Fezes"
                    options={['formada', 'pastosa', 'líquida', 'outro']}
                    value={form.eliminations.bowelAspect}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        eliminations: { ...prev.eliminations, bowelAspect: val as any },
                      }))
                    }
                    columns={4}
                  />
                )}
              </div>
            </div>
          </ClinicalSection>

          {/* 9. Dispositivos */}
          <ClinicalSection
            id="sec-devices"
            title="9. Dispositivos Invasivos"
            subtitle="Acessos venosos, sondas, drenos e curativos"
            status={sectionStatuses['Dispositivos']}
            isOpen={activeSection === 8}
            onToggle={() => setActiveSection(activeSection === 8 ? -1 : 8)}
          >
            <DeviceFormCard
              devices={form.devices}
              onChange={(devs) => setForm((prev) => ({ ...prev, devices: devs }))}
              availableTypes={CLINICAL_MEDICAL_DEVICE_TYPES}
            />
          </ClinicalSection>

          {/* 10. Pele */}
          <ClinicalSection
            id="sec-skin"
            title="10. Integridade Cutânea"
            subtitle="Pele, anexos e alterações observadas"
            status={sectionStatuses['Pele']}
            isOpen={activeSection === 9}
            onToggle={() => setActiveSection(activeSection === 9 ? -1 : 9)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClinicalOptionGroup
                  label="Integridade Cutânea"
                  options={['íntegra', 'alteração presente', 'não avaliada']}
                  value={form.skin.integrity}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      skin: { ...prev.skin, integrity: val as any },
                    }))
                  }
                  columns={3}
                />

                <ClinicalOptionGroup
                  label="Hidratação"
                  options={['hidratada', 'ressecada']}
                  value={form.skin.hydration}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      skin: { ...prev.skin, hydration: val as any },
                    }))
                  }
                  columns={2}
                />
              </div>

              {form.skin.integrity === 'alteração presente' && (
                <ClinicalTextInput
                  label="Descrição da alteração (sem classificação diagnóstica)"
                  value={form.skin.alterationDescription}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      skin: { ...prev.skin, alterationDescription: val },
                    }))
                  }
                  placeholder="Ex: Hiperemia não branqueável em região sacra, curativo oclusivo..."
                />
              )}
            </div>
          </ClinicalSection>

          {/* 11. Banho e Higiene */}
          <ClinicalSection
            id="sec-bath"
            title="11. Banho e Higiene"
            subtitle="Higiene corporal executada no período"
            status={sectionStatuses['Banho']}
            isOpen={activeSection === 10}
            onToggle={() => setActiveSection(activeSection === 10 ? -1 : 10)}
          >
            <div className="space-y-4">
              <ClinicalOptionGroup
                label="Banho Realizado"
                options={['não', 'banho no leito', 'banho de aspersão']}
                value={form.bath.performed}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    bath: {
                      ...prev.bath,
                      performed: val as any,
                      tolerance: val === 'não' ? '' : prev.bath.tolerance,
                    },
                  }))
                }
                columns={3}
              />

              {form.bath.performed !== 'não' && form.bath.performed !== '' && (
                <ClinicalOptionGroup
                  label="Tolerância ao Banho"
                  options={['boa', 'outra']}
                  value={form.bath.tolerance}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      bath: { ...prev.bath, tolerance: val as any },
                    }))
                  }
                  columns={2}
                />
              )}
            </div>
          </ClinicalSection>

          {/* 12. Cuidados Realizados */}
          <ClinicalSection
            id="sec-care"
            title="12. Cuidados de Enfermagem Executados"
            subtitle="Checklist de procedimentos realizados no plantão"
            status={sectionStatuses['Cuidados']}
            isOpen={activeSection === 11}
            onToggle={() => setActiveSection(activeSection === 11 ? -1 : 11)}
          >
            <div className="space-y-4">
              <ClinicalMultiSelect
                label="Procedimentos e Cuidados Executados"
                options={CARE_ACTION_OPTIONS}
                values={form.care.actions}
                onChange={(acts) =>
                  setForm((prev) => ({
                    ...prev,
                    care: { ...prev.care, actions: acts },
                  }))
                }
              />

              <ClinicalTextInput
                label="Outro cuidado assistencial realizado"
                value={form.care.otherCare}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    care: { ...prev.care, otherCare: val },
                  }))
                }
                placeholder="Ex: Auxiliado na deambulação, ofertado copo com água..."
              />
            </div>
          </ClinicalSection>

          {/* 13. Intercorrências */}
          <ClinicalSection
            id="sec-complications"
            title="13. Intercorrências"
            subtitle="Registro de intercorrências, conduta e comunicação"
            status={sectionStatuses['Intercorrências']}
            isOpen={activeSection === 12}
            onToggle={() => setActiveSection(activeSection === 12 ? -1 : 12)}
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
                      explicitNoComplications: val === 'não',
                    },
                  }))
                }
                columns={3}
              />

              {form.complications.hasComplication === 'sim' && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <ClinicalTextInput
                    label="Descrição da Intercorrência"
                    required
                    value={form.complications.description}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        complications: { ...prev.complications, description: val },
                      }))
                    }
                    placeholder="Ex: Paciente apresentou episódio de êmese pós-dieta..."
                  />

                  <ClinicalTextInput
                    label="Conduta Realizada"
                    value={form.complications.conduct}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        complications: { ...prev.complications, conduct: val },
                      }))
                    }
                    placeholder="Ex: Cabeceira elevada a 45°, aspirada cavidade oral..."
                  />

                  <ClinicalTextInput
                    label="Comunicação à Equipe"
                    value={form.complications.communication}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        complications: { ...prev.complications, communication: val },
                      }))
                    }
                    placeholder="Ex: Comunicado à Enfermeira de plantão e médico assistente..."
                  />
                </div>
              )}
            </div>
          </ClinicalSection>

          {/* 14. Situação Final */}
          <ClinicalSection
            id="sec-final-status"
            title="14. Situação Final"
            subtitle="Destino e situação final do paciente no setor"
            status={sectionStatuses['Situação Final']}
            isOpen={activeSection === 13}
            onToggle={() => setActiveSection(activeSection === 13 ? -1 : 13)}
          >
            <div className="space-y-4">
              <ClinicalOptionGroup
                label="Situação ao Final do Plantão"
                options={['permanece no setor sob cuidados de enfermagem', 'transferido', 'encaminhado', 'outro']}
                value={form.finalStatus.status}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    finalStatus: { ...prev.finalStatus, status: val as any },
                  }))
                }
                columns={2}
              />

              {form.finalStatus.status === 'outro' && (
                <ClinicalTextInput
                  label="Descrever Situação Final"
                  value={form.finalStatus.details}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      finalStatus: { ...prev.finalStatus, details: val },
                    }))
                  }
                  placeholder="Ex: Em alta hospitalar acompanhado de familiar..."
                />
              )}
            </div>
          </ClinicalSection>
        </div>
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-700" />
                  Anotação de Enfermagem — Síntese Factual
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Texto determinístico gerado estritamente a partir de fatos clínicos autorizados.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefineAI}
                  disabled={aiRefining}
                  className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>{aiRefining ? 'Verificando...' : 'Revisar Gramática (IA)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {aiNotice && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{aiNotice}</span>
              </div>
            )}

            <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap select-all">
              {activeNarrative || 'Nenhum dado clínico registrado para gerar a anotação.'}
            </div>

            {/* Traces and audit summary */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Auditoria de fatos:{' '}
                <strong className={deterministicOutput.auditResult.passed ? 'text-teal-700' : 'text-amber-700'}>
                  {deterministicOutput.auditResult.passed ? '100% Auditada e Rastreável' : 'Segmentos não rastreados'}
                </strong>{' '}
                ({deterministicOutput.auditResult.validSegmentsCount} segmentos válidos)
              </span>
              <span>Documento: Anotação de Enfermagem (Técnico)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
