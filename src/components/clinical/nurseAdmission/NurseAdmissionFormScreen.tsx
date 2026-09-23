import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { NurseAdmissionForm } from '../../../types/nurseAdmissionClinical';
import {
  createInitialNurseAdmissionForm,
  createSampleNurseAdmissionForm,
  normalizeNurseAdmissionForm,
  getNurseAdmissionSectionStatuses,
} from '../../../utils/nurseAdmissionValidator';
import { validateNurseAdmissionClinicalConsistency } from '../../../engine/nurseAdmissionConsistencyValidator';
import { NurseAdmissionPreviewView } from './NurseAdmissionPreviewView';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalNumericInput } from '../ClinicalNumericInput';
import { DeviceFormCard } from '../DeviceFormCard';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';
import { InvasiveDeviceItem } from '../../../types/clinical';

interface NurseAdmissionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const NurseAdmissionFormScreen: React.FC<NurseAdmissionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Admissão de Enfermagem (Enfermeiro)" onNavigateHome={props.onBack}>
      <NurseAdmissionFormContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const NurseAdmissionFormContent: React.FC<NurseAdmissionFormScreenProps> = ({
  onBack,
  patientAreaName = 'PS / Emergência',
}) => {
  const [form, setForm] = useState<NurseAdmissionForm>(() => createInitialNurseAdmissionForm());
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  const normalizedForm = useMemo(() => normalizeNurseAdmissionForm(form), [form]);
  const sectionStatuses = useMemo(() => getNurseAdmissionSectionStatuses(normalizedForm), [normalizedForm]);
  const consistencyAlerts = useMemo(() => validateNurseAdmissionClinicalConsistency(normalizedForm), [normalizedForm]);

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? null : idx));
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja limpar todos os dados preenchidos da admissão?')) {
      setForm(createInitialNurseAdmissionForm());
      setActiveSection(0);
    }
  };

  const handleFillSample = () => {
    setForm(createSampleNurseAdmissionForm());
    setActiveSection(0);
  };

  // Sub-handlers for state immutability
  const updateCtx = (patch: Partial<NurseAdmissionForm['context']>) => {
    setForm((p) => ({ ...p, context: { ...p.context, ...patch } }));
  };
  const updateOrig = (patch: Partial<NurseAdmissionForm['origin']>) => {
    setForm((p) => ({ ...p, origin: { ...p.origin, ...patch } }));
  };
  const updateIden = (patch: Partial<NurseAdmissionForm['identification']>) => {
    setForm((p) => ({ ...p, identification: { ...p.identification, ...patch } }));
  };
  const updateHist = (patch: Partial<NurseAdmissionForm['nursingHistory']>) => {
    setForm((p) => ({ ...p, nursingHistory: { ...p.nursingHistory, ...patch } }));
  };
  const updateVitals = (patch: Partial<NurseAdmissionForm['vitalSignsAndPain']>) => {
    setForm((p) => ({ ...p, vitalSignsAndPain: { ...p.vitalSignsAndPain, ...patch } }));
  };
  const updateNeuro = (patch: Partial<NurseAdmissionForm['neurological']>) => {
    setForm((p) => ({ ...p, neurological: { ...p.neurological, ...patch } }));
  };
  const updateResp = (patch: Partial<NurseAdmissionForm['respiratory']>) => {
    setForm((p) => ({ ...p, respiratory: { ...p.respiratory, ...patch } }));
  };
  const updateCardio = (patch: Partial<NurseAdmissionForm['cardiovascular']>) => {
    setForm((p) => ({ ...p, cardiovascular: { ...p.cardiovascular, ...patch } }));
  };
  const updateGastro = (patch: Partial<NurseAdmissionForm['gastrointestinal']>) => {
    setForm((p) => ({ ...p, gastrointestinal: { ...p.gastrointestinal, ...patch } }));
  };
  const updateElim = (patch: Partial<NurseAdmissionForm['elimination']>) => {
    setForm((p) => ({ ...p, elimination: { ...p.elimination, ...patch } }));
  };
  const updateSkin = (patch: Partial<NurseAdmissionForm['skin']>) => {
    setForm((p) => ({ ...p, skin: { ...p.skin, ...patch } }));
  };
  const updateRisk = (patch: Partial<NurseAdmissionForm['riskAssessment']>) => {
    setForm((p) => ({ ...p, riskAssessment: { ...p.riskAssessment, ...patch } }));
  };
  const updateCare = (patch: Partial<NurseAdmissionForm['initialNursingCare']>) => {
    setForm((p) => ({ ...p, initialNursingCare: { ...p.initialNursingCare, ...patch } }));
  };
  const updateBel = (patch: Partial<NurseAdmissionForm['belongings']>) => {
    setForm((p) => ({ ...p, belongings: { ...p.belongings, ...patch } }));
  };
  const updateComp = (patch: Partial<NurseAdmissionForm['complicationsAndCommunication']>) => {
    setForm((p) => ({ ...p, complicationsAndCommunication: { ...p.complicationsAndCommunication, ...patch } }));
  };
  const updatePlan = (patch: Partial<NurseAdmissionForm['nursingPlan']>) => {
    setForm((p) => ({ ...p, nursingPlan: { ...p.nursingPlan, ...patch } }));
  };
  const updateFinal = (patch: Partial<NurseAdmissionForm['finalStatus']>) => {
    setForm((p) => ({ ...p, finalStatus: { ...p.finalStatus, ...patch } }));
  };

  // Existing devices handlers
  const addExistingDevice = () => {
    const newDev: InvasiveDeviceItem = {
      id: `nurse-dev-${Date.now()}`,
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
      existingDevices: { list: [...p.existingDevices.list, newDev] },
    }));
  };

  const updateExistingDevice = (idx: number, updated: InvasiveDeviceItem) => {
    setForm((p) => {
      const copy = [...p.existingDevices.list];
      copy[idx] = updated;
      return { ...p, existingDevices: { list: copy } };
    });
  };

  const removeExistingDevice = (idx: number) => {
    setForm((p) => ({
      ...p,
      existingDevices: { list: p.existingDevices.list.filter((_, i) => i !== idx) },
    }));
  };

  // Installed devices handlers
  const addInstalledDevice = () => {
    const newDev: InvasiveDeviceItem = {
      id: `nurse-inst-${Date.now()}`,
      type: 'AVP',
      location: 'MSE',
      permeability: 'Pérvio',
      functioning: 'Funcionante',
      dressingClean: true,
      dressingDry: true,
      dressingIntact: true,
      phlogisticSigns: 'Ausentes',
    };
    setForm((p) => ({
      ...p,
      installedDevices: { ...p.installedDevices, list: [...p.installedDevices.list, newDev] },
    }));
  };

  const updateInstalledDevice = (idx: number, updated: InvasiveDeviceItem) => {
    setForm((p) => {
      const copy = [...p.installedDevices.list];
      copy[idx] = updated;
      return { ...p, installedDevices: { ...p.installedDevices, list: copy } };
    });
  };

  const removeInstalledDevice = (idx: number) => {
    setForm((p) => ({
      ...p,
      installedDevices: { ...p.installedDevices, list: p.installedDevices.list.filter((_, i) => i !== idx) },
    }));
  };

  if (viewMode === 'preview') {
    return (
      <NurseAdmissionPreviewView
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
              Admissão de Enfermagem — {patientAreaName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Roteiro estruturado de acolhimento, exame físico, histórico, riscos e cuidados iniciais privativos do Enfermeiro.
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
              <strong>Diretriz Profissional:</strong> Registro focado em dados fáticos e estruturados do exame de admissão. A IA do EvoluiEnf é exclusivamente um refinador de coesão textual, sem geração automática de diagnósticos ou prescrições não preenchidas pelo profissional.
            </span>
          </div>
        </div>
      </div>

      {/* Consistency Warnings (if any) */}
      {consistencyAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Observações de Consistência Clínica ({consistencyAlerts.length})</span>
          </div>
          <ul className="text-xs text-amber-800 space-y-1.5 list-disc pl-5">
            {consistencyAlerts.map((alt) => (
              <li key={alt.id}>
                <strong>{alt.message}</strong> {alt.suggestedFix && <span className="text-amber-700">({alt.suggestedFix})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 20 Accordion Sections for Nurse Admission */}
      <div className="space-y-3">
        {/* 1. Contexto */}
        <ClinicalSection
          index={0}
          title="Contexto da Admissão"
          status={sectionStatuses[0]}
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Momento do Registro"
              value={form.context.moment}
              options={[
                { value: 'Admissão de Enfermagem realizada', label: 'Admissão de Enfermagem realizada' },
                { value: 'Recebimento de paciente no setor', label: 'Recebimento de paciente no setor' },
                { value: 'Admissão imediata na chegada', label: 'Admissão imediata na chegada' },
              ]}
              onChange={(val) => updateCtx({ moment: val as any })}
            />
            <ClinicalOptionGroup
              label="Local da Recepção / Atendimento"
              value={form.context.location}
              options={[
                { value: 'Sala Vermelha', label: 'Sala Vermelha' },
                { value: 'Sala Amarela', label: 'Sala Amarela' },
                { value: 'Leito de Emergência', label: 'Leito de Emergência' },
                { value: 'Box de Atendimento', label: 'Box de Atendimento' },
                { value: 'Outro', label: 'Outro' },
              ]}
              onChange={(val) => updateCtx({ location: val as any })}
            />
            {form.context.location === 'Outro' && (
              <ClinicalTextInput
                label="Especifique o Local"
                value={form.context.locationCustom || ''}
                onChange={(val) => updateCtx({ locationCustom: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Presença de Acompanhante na Recepção"
              value={form.context.accompaniment}
              options={[
                { value: 'Desacompanhado', label: 'Desacompanhado' },
                { value: 'Familiar', label: 'Familiar' },
                { value: 'Responsável', label: 'Responsável legal' },
                { value: 'Cuidador', label: 'Cuidador' },
                { value: 'Equipe assistencial', label: 'Equipe assistencial' },
              ]}
              onChange={(val) => updateCtx({ accompaniment: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* 2. Procedência e Chegada */}
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
                { value: 'Via pública', label: 'Via pública' },
                { value: 'UPA', label: 'UPA' },
                { value: 'UBS / Posto de Saúde', label: 'UBS / Posto de Saúde' },
                { value: 'Outro Hospital', label: 'Outro Hospital' },
                { value: 'SAMU', label: 'SAMU' },
                { value: 'Residencial terapêutico', label: 'Residencial terapêutico' },
                { value: 'Outro', label: 'Outro' },
              ]}
              onChange={(val) => updateOrig({ patientOrigin: val as any })}
            />
            <ClinicalMultiSelect
              label="Forma / Meio de Chegada ao Setor"
              values={form.origin.arrivalModes}
              options={[
                { value: 'Maca', label: 'Maca' },
                { value: 'Cadeira de rodas', label: 'Cadeira de rodas' },
                { value: 'Deambulando', label: 'Deambulando' },
                { value: 'Ambulância', label: 'Ambulância' },
              ]}
              onChange={(vals) => updateOrig({ arrivalModes: vals })}
            />
            <ClinicalOptionGroup
              label="Transporte Assistido por Equipe?"
              value={form.origin.accompaniedByTransportTeam}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Sim', label: 'Sim' },
              ]}
              onChange={(val) => updateOrig({ accompaniedByTransportTeam: val as any })}
            />
            {form.origin.accompaniedByTransportTeam === 'Sim' && (
              <ClinicalTextInput
                label="Identificação da Equipe de Transporte"
                value={form.origin.transportTeamType || ''}
                onChange={(val) => updateOrig({ transportTeamType: val })}
                placeholder="Ex: SAMU USA-04, Resgate Bombeiros"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 3. Identificação e Segurança */}
        <ClinicalSection
          index={2}
          title="Identificação e Segurança do Paciente"
          status={sectionStatuses[2]}
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Pulseira de Identificação Conferida?"
              value={form.identification.wristbandChecked}
              options={[
                { value: 'Sim', label: 'Sim (Conferida e instalada)' },
                { value: 'Não', label: 'Não' },
                { value: 'Não se aplica', label: 'Não se aplica' },
              ]}
              onChange={(val) => updateIden({ wristbandChecked: val as any })}
            />
            <ClinicalOptionGroup
              label="Placa de Identificação do Leito Conferida?"
              value={form.identification.bedSignChecked}
              options={[
                { value: 'Sim', label: 'Sim' },
                { value: 'Não', label: 'Não' },
                { value: 'Não se aplica', label: 'Não se aplica' },
              ]}
              onChange={(val) => updateIden({ bedSignChecked: val as any })}
            />
            <ClinicalOptionGroup
              label="Alergias Referidas"
              value={form.identification.allergies}
              options={[
                { value: 'Não referidas', label: 'Não referidas / Nega alergias' },
                { value: 'Sim', label: 'Sim (Alergia referida)' },
                { value: 'Não informado', label: 'Não informado / Desconhecido' },
              ]}
              onChange={(val) => updateIden({ allergies: val as any })}
            />
            {form.identification.allergies === 'Sim' && (
              <ClinicalTextInput
                label="Qual(is) alergia(s)?"
                value={form.identification.allergiesDetails || ''}
                onChange={(val) => updateIden({ allergiesDetails: val })}
                placeholder="Ex: Dipirona, Penicilina, Iodo"
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
              ]}
              onChange={(val) => updateIden({ precaution: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* 4. Histórico de Enfermagem */}
        <ClinicalSection
          index={3}
          title="Histórico de Enfermagem e Informações Referidas"
          status={sectionStatuses[3]}
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
        >
          <div className="space-y-4">
            <ClinicalTextInput
              label="Motivo da Admissão / Queixa Principal Referida"
              value={form.nursingHistory.admissionReason}
              onChange={(val) => updateHist({ admissionReason: val })}
              placeholder="Ex: dor torácica de início súbito, cefaleia intensa"
            />
            <ClinicalTextarea
              label="Histórico Atual da Queixa (Relato da Moléstia Atual)"
              value={form.nursingHistory.historyOfPresentIllness || ''}
              onChange={(val) => updateHist({ historyOfPresentIllness: val })}
              placeholder="Descreva a cronologia e características relatadas pelo paciente ou acompanhante..."
              rows={2}
            />
            <ClinicalTextInput
              label="Antecedentes Pessoais / Comorbidades Informadas"
              value={form.nursingHistory.pastMedicalHistory || ''}
              onChange={(val) => updateHist({ pastMedicalHistory: val })}
              placeholder="Ex: HAS, DM2, tabagismo"
            />
            <ClinicalTextInput
              label="Medicações de Uso Domiciliar Referidas"
              value={form.nursingHistory.homeMedicationsReported || ''}
              onChange={(val) => updateHist({ homeMedicationsReported: val })}
              placeholder="Ex: Losartana 50mg, Metformina 850mg"
            />
            <ClinicalOptionGroup
              label="Fonte da Informação"
              value={form.nursingHistory.informationSource}
              options={[
                { value: 'Paciente', label: 'Próprio paciente' },
                { value: 'Acompanhante', label: 'Acompanhante / Familiar' },
                { value: 'Equipe de transporte', label: 'Equipe de transporte' },
                { value: 'Prontuário', label: 'Documentação / Prontuário' },
              ]}
              onChange={(val) => updateHist({ informationSource: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* 5. Sinais Vitais e Dor */}
        <ClinicalSection
          index={4}
          title="Sinais Vitais e Avaliação da Dor"
          status={sectionStatuses[4]}
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ClinicalTextInput
                label="PA Sistólica (mmHg)"
                value={form.vitalSignsAndPain.systolicBP || ''}
                onChange={(val) => updateVitals({ systolicBP: val })}
                placeholder="Ex: 120"
              />
              <ClinicalTextInput
                label="PA Diastólica (mmHg)"
                value={form.vitalSignsAndPain.diastolicBP || ''}
                onChange={(val) => updateVitals({ diastolicBP: val })}
                placeholder="Ex: 80"
              />
              <ClinicalTextInput
                label="PAM (mmHg)"
                value={form.vitalSignsAndPain.meanArterialPressure || ''}
                onChange={(val) => updateVitals({ meanArterialPressure: val })}
                placeholder="Ex: 93"
              />
              <ClinicalTextInput
                label="FC (bpm)"
                value={form.vitalSignsAndPain.heartRate || ''}
                onChange={(val) => updateVitals({ heartRate: val })}
                placeholder="Ex: 80"
              />
              <ClinicalTextInput
                label="FR (irpm)"
                value={form.vitalSignsAndPain.respiratoryRate || ''}
                onChange={(val) => updateVitals({ respiratoryRate: val })}
                placeholder="Ex: 18"
              />
              <ClinicalTextInput
                label="SpO₂ (%)"
                value={form.vitalSignsAndPain.oxygenSaturation || ''}
                onChange={(val) => updateVitals({ oxygenSaturation: val })}
                placeholder="Ex: 98"
              />
              <ClinicalTextInput
                label="Temp (°C)"
                value={form.vitalSignsAndPain.temperature || ''}
                onChange={(val) => updateVitals({ temperature: val })}
                placeholder="Ex: 36.5"
              />
              <ClinicalTextInput
                label="Glicemia Capilar (mg/dL)"
                value={form.vitalSignsAndPain.bloodGlucose || ''}
                onChange={(val) => updateVitals({ bloodGlucose: val })}
                placeholder="Ex: 110"
              />
            </div>

            <ClinicalOptionGroup
              label="Avaliação da Dor na Admissão"
              value={form.vitalSignsAndPain.painAssessmentType}
              options={[
                { value: 'Sem queixa de dor', label: 'Sem queixa de dor' },
                { value: 'Escala numérica 0–10', label: 'Escala numérica 0–10' },
                { value: 'Não avaliável', label: 'Não avaliável' },
              ]}
              onChange={(val) => updateVitals({ painAssessmentType: val as any })}
            />
            {form.vitalSignsAndPain.painAssessmentType === 'Escala numérica 0–10' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Nota da dor (0 a 10)"
                  value={form.vitalSignsAndPain.painScaleValue !== undefined ? String(form.vitalSignsAndPain.painScaleValue) : ''}
                  onChange={(val) => updateVitals({ painScaleValue: val ? Number(val) : undefined })}
                  placeholder="Ex: 6"
                />
                <ClinicalTextInput
                  label="Localização da dor"
                  value={form.vitalSignsAndPain.painLocation || ''}
                  onChange={(val) => updateVitals({ painLocation: val })}
                  placeholder="Ex: precórdio, flanco direito"
                />
                <ClinicalTextInput
                  label="Características"
                  value={form.vitalSignsAndPain.painCharacteristics || ''}
                  onChange={(val) => updateVitals({ painCharacteristics: val })}
                  placeholder="Ex: em queimação, aperto"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 6. Exame Neurológico */}
        <ClinicalSection
          index={5}
          title="Exame Físico — Neurológico"
          status={sectionStatuses[5]}
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
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
              onChange={(val) => updateNeuro({ consciousnessLevel: val as any })}
            />
            <ClinicalOptionGroup
              label="Orientação"
              value={form.neurological.orientation}
              options={[
                { value: 'Orientado em tempo e espaço', label: 'Orientado em tempo e espaço' },
                { value: 'Desorientado', label: 'Desorientado' },
                { value: 'Não avaliável', label: 'Não avaliável' },
              ]}
              onChange={(val) => updateNeuro({ orientation: val as any })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Pupilas"
                value={form.neurological.pupils}
                options={[
                  { value: 'Isocóricas', label: 'Isocóricas' },
                  { value: 'Anisocóricas', label: 'Anisocóricas' },
                  { value: 'Midriáticas', label: 'Midriáticas' },
                  { value: 'Mióticas', label: 'Mióticas' },
                ]}
                onChange={(val) => updateNeuro({ pupils: val as any })}
              />
              <ClinicalOptionGroup
                label="Fotorreagência"
                value={form.neurological.photoreaction}
                options={[
                  { value: 'Fotorreagentes', label: 'Fotorreagentes' },
                  { value: 'Não fotorreagentes', label: 'Não fotorreagentes' },
                ]}
                onChange={(val) => updateNeuro({ photoreaction: val as any })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalTextInput
                label="Escala de Glasgow (se aplicável)"
                value={form.neurological.glasgowScore !== undefined ? String(form.neurological.glasgowScore) : ''}
                onChange={(val) => updateNeuro({ glasgowScore: val ? Number(val) : undefined })}
                placeholder="Ex: 15"
              />
              <ClinicalTextInput
                label="Resposta Motora / Déficits"
                value={form.neurological.motorResponse || ''}
                onChange={(val) => updateNeuro({ motorResponse: val })}
                placeholder="Ex: preservada bilateralmente, hemiparesia à D"
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 7. Exame Respiratório */}
        <ClinicalSection
          index={6}
          title="Exame Físico — Respiratório"
          status={sectionStatuses[6]}
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
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
              onChange={(val) => updateResp({ respiratorySupport: val as any })}
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
                  onChange={(val) => updateResp({ oxygenDevice: val as any })}
                />
                <ClinicalTextInput
                  label="Fluxo (L/min)"
                  value={form.respiratory.oxygenFlowRate || ''}
                  onChange={(val) => updateResp({ oxygenFlowRate: val })}
                  placeholder="Ex: 3"
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
                { value: 'Dispneico', label: 'Dispneico' },
              ]}
              onChange={(val) => updateResp({ respiratoryPattern: val as any })}
            />
            <ClinicalOptionGroup
              label="Desconforto Respiratório"
              value={form.respiratory.respiratoryDistress}
              options={[
                { value: 'Ausente', label: 'Ausente' },
                { value: 'Presente', label: 'Presente' },
              ]}
              onChange={(val) => updateResp({ respiratoryDistress: val as any })}
            />
            <ClinicalTextInput
              label="Ausculta Pulmonar"
              value={form.respiratory.breathSounds || ''}
              onChange={(val) => updateResp({ breathSounds: val })}
              placeholder="Ex: murmúrio vesicular presente bilateralmente sem ruídos adventícios"
            />
          </div>
        </ClinicalSection>

        {/* 8. Exame Cardiovascular */}
        <ClinicalSection
          index={7}
          title="Exame Físico — Cardiovascular e Hemodinâmico"
          status={sectionStatuses[7]}
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Perfusão Periférica"
              value={form.cardiovascular.peripheralPerfusion}
              options={[
                { value: 'Adequada', label: 'Adequada' },
                { value: 'Diminuída / Lentificada', label: 'Diminuída / Lentificada' },
              ]}
              onChange={(val) => updateCardio({ peripheralPerfusion: val as any })}
            />
            <ClinicalOptionGroup
              label="Extremidades"
              value={form.cardiovascular.extremities}
              options={[
                { value: 'Aquecidas', label: 'Aquecidas' },
                { value: 'Frias', label: 'Frias' },
                { value: 'Cianóticas', label: 'Cianóticas' },
              ]}
              onChange={(val) => updateCardio({ extremities: val as any })}
            />
            <ClinicalTextInput
              label="Pulsos Periféricos"
              value={form.cardiovascular.peripheralPulses || ''}
              onChange={(val) => updateCardio({ peripheralPulses: val })}
              placeholder="Ex: cheios e simétricos, filiformes"
            />
            <ClinicalOptionGroup
              label="Edema"
              value={form.cardiovascular.edema}
              options={[
                { value: 'Ausente', label: 'Ausente' },
                { value: 'Presente', label: 'Presente' },
              ]}
              onChange={(val) => updateCardio({ edema: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* 9. Exame Gastrointestinal */}
        <ClinicalSection
          index={8}
          title="Exame Físico — Gastrointestinal e Nutricional"
          status={sectionStatuses[8]}
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Status Nutricional / Dieta"
              value={form.gastrointestinal.nutritionalStatus}
              options={[
                { value: 'Jejum', label: 'Jejum' },
                { value: 'Dieta por via oral', label: 'Dieta por via oral' },
                { value: 'Dieta enteral', label: 'Dieta enteral' },
              ]}
              onChange={(val) => updateGastro({ nutritionalStatus: val as any })}
            />
            <ClinicalTextInput
              label="Inspeção e Palpação Abdominal"
              value={form.gastrointestinal.abdomenPalpation || ''}
              onChange={(val) => updateGastro({ abdomenPalpation: val })}
              placeholder="Ex: plano, flácido, indolor à palpação"
            />
            <ClinicalTextInput
              label="Ruídos Hidroaéreos (RHA)"
              value={form.gastrointestinal.bowelSounds || ''}
              onChange={(val) => updateGastro({ bowelSounds: val })}
              placeholder="Ex: presentes e normoativos, aumentados"
            />
          </div>
        </ClinicalSection>

        {/* 10. Geniturinário e Eliminações */}
        <ClinicalSection
          index={9}
          title="Exame Físico — Eliminações"
          status={sectionStatuses[9]}
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Diurese"
              value={form.elimination.diuresis}
              options={[
                { value: 'Presente', label: 'Presente' },
                { value: 'Ausente', label: 'Ausente' },
                { value: 'Não avaliada', label: 'Não avaliada' },
              ]}
              onChange={(val) => updateElim({ diuresis: val as any })}
            />
            <ClinicalOptionGroup
              label="Via Urinária"
              value={form.elimination.urinaryRoute}
              options={[
                { value: 'Espontânea', label: 'Espontânea' },
                { value: 'SVD', label: 'SVD' },
                { value: 'Fralda', label: 'Fralda' },
              ]}
              onChange={(val) => updateElim({ urinaryRoute: val as any })}
            />
            <ClinicalTextInput
              label="Aspecto da Diurese"
              value={form.elimination.urinaryAspect || ''}
              onChange={(val) => updateElim({ urinaryAspect: val })}
              placeholder="Ex: límpida, colúrica, hematúrica"
            />
          </div>
        </ClinicalSection>

        {/* 11. Tegumentar e Pele */}
        <ClinicalSection
          index={10}
          title="Exame Físico — Pele e Integridade Cutânea"
          status={sectionStatuses[10]}
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Integridade Cutânea"
              value={form.skin.integrity}
              options={[
                { value: 'Íntegra', label: 'Íntegra' },
                { value: 'Com alteração/lesão', label: 'Com alteração / lesão' },
              ]}
              onChange={(val) => updateSkin({ integrity: val as any })}
            />
            {form.skin.integrity === 'Com alteração/lesão' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ClinicalTextInput
                  label="Localização da Lesão"
                  value={form.skin.lesionLocation || ''}
                  onChange={(val) => updateSkin({ lesionLocation: val })}
                  placeholder="Ex: região sacra, calcâneo D"
                />
                <ClinicalTextInput
                  label="Descrição / Estadiamento"
                  value={form.skin.lesionDescription || ''}
                  onChange={(val) => updateSkin({ lesionDescription: val })}
                  placeholder="Ex: LPP estágio 2, escoriação superficial"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 12. Dispositivos Já Presentes */}
        <ClinicalSection
          index={11}
          title="Dispositivos Já Presentes na Admissão"
          status={sectionStatuses[11]}
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
        >
          <div className="space-y-4">
            {form.existingDevices.list.map((dev, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Dispositivo #{idx + 1}: {dev.type} ({dev.location})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExistingDevice(idx)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
                <DeviceFormCard
                  device={dev}
                  onChange={(up) => updateExistingDevice(idx, up)}
                  onRemove={() => removeExistingDevice(idx)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addExistingDevice}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-600 text-teal-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors bg-teal-50/50"
            >
              <Plus className="w-4 h-4" /> Adicionar Dispositivo Já Presente
            </button>
          </div>
        </ClinicalSection>

        {/* 13. Avaliação de Riscos Assistenciais */}
        <ClinicalSection
          index={12}
          title="Avaliação de Riscos de Enfermagem"
          status={sectionStatuses[12]}
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Risco de Queda"
                value={form.riskAssessment.fallRisk}
                options={[
                  { value: 'Baixo risco', label: 'Baixo risco' },
                  { value: 'Médio risco', label: 'Médio risco' },
                  { value: 'Alto risco', label: 'Alto risco' },
                ]}
                onChange={(val) => updateRisk({ fallRisk: val as any })}
              />
              <ClinicalOptionGroup
                label="Risco de Lesão por Pressão (LPP)"
                value={form.riskAssessment.pressureInjuryRisk}
                options={[
                  { value: 'Baixo risco', label: 'Baixo risco' },
                  { value: 'Risco moderado', label: 'Risco moderado' },
                  { value: 'Alto risco', label: 'Alto risco' },
                ]}
                onChange={(val) => updateRisk({ pressureInjuryRisk: val as any })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ClinicalOptionGroup
                label="Risco de Broncoaspiração"
                value={form.riskAssessment.aspirationRisk}
                options={[
                  { value: 'Ausente', label: 'Ausente' },
                  { value: 'Presente', label: 'Presente' },
                ]}
                onChange={(val) => updateRisk({ aspirationRisk: val as any })}
              />
              <ClinicalOptionGroup
                label="Risco de Perda / Tração de Dispositivos"
                value={form.riskAssessment.deviceDislodgementRisk}
                options={[
                  { value: 'Baixo risco', label: 'Baixo risco' },
                  { value: 'Presente', label: 'Presente' },
                ]}
                onChange={(val) => updateRisk({ deviceDislodgementRisk: val as any })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 14. Cuidados Iniciais Realizados */}
        <ClinicalSection
          index={13}
          title="Cuidados e Procedimentos Executados na Admissão"
          status={sectionStatuses[13]}
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Cuidados Executados"
              values={form.initialNursingCare.careItems}
              options={[
                { value: 'Acolhimento e acomodação no leito com cabeceira elevada a 30°', label: 'Acolhimento no leito com cabeceira elevada' },
                { value: 'Monitorização multiparamétrica contínua e ECG inicial', label: 'Monitorização contínua e ECG' },
                { value: 'Instalação de acesso venoso periférico', label: 'Instalação de AVP' },
                { value: 'Coleta de exames laboratoriais e marcadores', label: 'Coleta de exames laboratoriais' },
                { value: 'Orientação ao paciente e acompanhante quanto aos fluxos do setor', label: 'Orientações assistenciais aos familiares' },
                { value: 'Elevação de grades bilaterais para prevenção de quedas', label: 'Grades bilaterais elevadas' },
              ]}
              onChange={(vals) => updateCare({ careItems: vals })}
            />
          </div>
        </ClinicalSection>

        {/* 15. Dispositivos Instalados */}
        <ClinicalSection
          index={14}
          title="Dispositivos Instalados na Admissão"
          status={sectionStatuses[14]}
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Foi realizada punção ou procedimento invasivo durante a admissão?"
              value={form.installedDevices.installedInAdmission}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Sim', label: 'Sim' },
              ]}
              onChange={(val) =>
                setForm((p) => ({
                  ...p,
                  installedDevices: { ...p.installedDevices, installedInAdmission: val as any },
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
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    </div>
                    <DeviceFormCard
                      device={dev}
                      onChange={(up) => updateInstalledDevice(idx, up)}
                      onRemove={() => removeInstalledDevice(idx)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInstalledDevice}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-600 text-teal-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors bg-teal-50/50"
                >
                  <Plus className="w-4 h-4" /> Adicionar Dispositivo Instalado
                </button>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 16. Pertences */}
        <ClinicalSection
          index={15}
          title="Pertences do Paciente"
          status={sectionStatuses[15]}
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Destino dos Pertences"
              value={form.belongings.status}
              options={[
                { value: 'Sem pertences informados', label: 'Sem pertences informados' },
                { value: 'Pertences permanecem com paciente', label: 'Permanecem com paciente' },
                { value: 'Entregues ao acompanhante/responsável', label: 'Entregues ao acompanhante' },
              ]}
              onChange={(val) => updateBel({ status: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* 17. Intercorrências e Comunicação Médica */}
        <ClinicalSection
          index={16}
          title="Intercorrências e Comunicação Multiprofissional"
          status={sectionStatuses[16]}
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Intercorrência na Admissão?"
              value={form.complicationsAndCommunication.hasComplication}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Sim', label: 'Sim' },
              ]}
              onChange={(val) => updateComp({ hasComplication: val as any })}
            />
            {form.complicationsAndCommunication.hasComplication === 'Sim' && (
              <div className="space-y-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <ClinicalTextInput
                  label="Descrição da Intercorrência"
                  value={form.complicationsAndCommunication.complicationDescription || ''}
                  onChange={(val) => updateComp({ complicationDescription: val })}
                  placeholder="Ex: pico hipertensivo, náuseas e vômitos"
                />
                <ClinicalTextInput
                  label="Condutas Imediatas Realizadas"
                  value={form.complicationsAndCommunication.nursingActionsTaken || ''}
                  onChange={(val) => updateComp({ nursingActionsTaken: val })}
                  placeholder="Ex: decúbito elevado, sinais aferidos"
                />
              </div>
            )}
            <ClinicalOptionGroup
              label="Caso Discutido com Equipe Médica?"
              value={form.complicationsAndCommunication.communicatedToMedicalTeam}
              options={[
                { value: 'Não', label: 'Não' },
                { value: 'Sim', label: 'Sim' },
              ]}
              onChange={(val) => updateComp({ communicatedToMedicalTeam: val as any })}
            />
          </div>
        </ClinicalSection>

        {/* 18. Plano Inicial de Cuidados de Enfermagem */}
        <ClinicalSection
          index={17}
          title="Condutas e Plano Inicial de Cuidados de Enfermagem"
          status={sectionStatuses[17]}
          isOpen={activeSection === 17}
          onToggle={() => toggleSection(17)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Condutas e Plano Assistencial"
              values={form.nursingPlan.planItems}
              options={[
                { value: 'Manter monitorização eletrocardiográfica contínua', label: 'Manter monitorização eletrocardiográfica' },
                { value: 'Vigilância rigorosa de padrão respiratório e dor', label: 'Vigilância de padrão respiratório e dor' },
                { value: 'Manter grades do leito elevadas para prevenção de quedas', label: 'Grades do leito elevadas' },
                { value: 'Garantir permeabilidade do acesso venoso periférico', label: 'Manutenção de acesso venoso pérvio' },
                { value: 'Acompanhar resultados de exames laboratoriais de urgência', label: 'Acompanhar exames de urgência' },
              ]}
              onChange={(vals) => updatePlan({ planItems: vals })}
            />
          </div>
        </ClinicalSection>

        {/* 19. Situação Final */}
        <ClinicalSection
          index={18}
          title="Situação Final da Admissão"
          status={sectionStatuses[18]}
          isOpen={activeSection === 18}
          onToggle={() => toggleSection(18)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Situação do Paciente Após a Admissão"
              values={form.finalStatus.conditions}
              options={[
                { value: 'Permanece no setor sob cuidados de enfermagem', label: 'Permanece no setor sob cuidados de enfermagem' },
                { value: 'Mantido em monitorização contínua', label: 'Mantido em monitorização contínua' },
                { value: 'Transferência em andamento', label: 'Transferência em andamento' },
              ]}
              onChange={(vals) => updateFinal({ conditions: vals })}
            />
          </div>
        </ClinicalSection>

        {/* 20. Informações Adicionais */}
        <ClinicalSection
          index={19}
          title="Informações Adicionais"
          status={sectionStatuses[19]}
          isOpen={activeSection === 19}
          onToggle={() => toggleSection(19)}
        >
          <div className="space-y-4">
            <ClinicalTextarea
              label="Observações Objetivas Complementares"
              value={form.additionalInformation}
              onChange={(val) => setForm((p) => ({ ...p, additionalInformation: val }))}
              placeholder="Registre outras observações pontuais e objetivas do acolhimento..."
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar e Visualizar Admissão de Enfermagem</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
