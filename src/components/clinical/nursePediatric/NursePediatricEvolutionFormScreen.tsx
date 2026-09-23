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
  NursePediatricEvolutionForm,
  createInitialNursePediatricEvolutionForm,
  NursePediatricInvasiveDeviceItem,
} from '../../../types/nursePediatricEvolution';
import {
  normalizeNursePediatricEvolutionForm,
  validateNursePediatricEvolutionConsistency,
} from '../../../engine/nursePediatricEvolutionFactBuilder';
import { NursePediatricEvolutionPreviewView } from './NursePediatricEvolutionPreviewView';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface NursePediatricEvolutionFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const NursePediatricEvolutionFormScreen: React.FC<NursePediatricEvolutionFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Evolução de Enfermagem — Pediatria" onNavigateHome={props.onBack}>
      <NursePediatricEvolutionFormContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const NursePediatricEvolutionFormContent: React.FC<NursePediatricEvolutionFormScreenProps> = ({
  onBack,
  patientAreaName = 'Pediatria',
}) => {
  const [form, setForm] = useState<NursePediatricEvolutionForm>(() => createInitialNursePediatricEvolutionForm());
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  const normalizedForm = useMemo(() => normalizeNursePediatricEvolutionForm(form), [form]);
  const consistency = useMemo(
    () => validateNursePediatricEvolutionConsistency(normalizedForm),
    [normalizedForm]
  );

  const toggleSection = (idx: number) => {
    setActiveSection((curr) => (curr === idx ? null : idx));
  };

  const handleResetForm = () => {
    if (window.confirm('Deseja limpar todos os campos da evolução de enfermagem de Pediatria?')) {
      setForm(createInitialNursePediatricEvolutionForm());
      setActiveSection(0);
    }
  };

  // Updaters
  const updateContext = (patch: Partial<NursePediatricEvolutionForm['context']>) => {
    setForm((p) => ({ ...p, context: { ...p.context, ...patch } }));
  };

  const updateSafety = (patch: Partial<NursePediatricEvolutionForm['safety']>) => {
    setForm((p) => ({ ...p, safety: { ...p.safety, ...patch } }));
  };

  const updatePediatricData = (patch: Partial<NursePediatricEvolutionForm['pediatricData']>) => {
    setForm((p) => ({ ...p, pediatricData: { ...p.pediatricData, ...patch } }));
  };

  const updateGuardian = (patch: Partial<NursePediatricEvolutionForm['guardian']>) => {
    setForm((p) => ({ ...p, guardian: { ...p.guardian, ...patch } }));
  };

  const updateInfoSource = (patch: Partial<NursePediatricEvolutionForm['infoSource']>) => {
    setForm((p) => ({ ...p, infoSource: { ...p.infoSource, ...patch } }));
  };

  const updateGeneral = (patch: Partial<NursePediatricEvolutionForm['generalAssessment']>) => {
    setForm((p) => ({ ...p, generalAssessment: { ...p.generalAssessment, ...patch } }));
  };

  const updateBehavior = (patch: Partial<NursePediatricEvolutionForm['behavior']>) => {
    setForm((p) => ({ ...p, behavior: { ...p.behavior, ...patch } }));
  };

  const updatePain = (patch: Partial<NursePediatricEvolutionForm['pain']>) => {
    setForm((p) => ({ ...p, pain: { ...p.pain, ...patch } }));
  };

  const updateVitals = (patch: Partial<NursePediatricEvolutionForm['vitalSigns']>) => {
    setForm((p) => ({ ...p, vitalSigns: { ...p.vitalSigns, ...patch } }));
  };

  const updateNeurological = (patch: Partial<NursePediatricEvolutionForm['neurological']>) => {
    setForm((p) => ({ ...p, neurological: { ...p.neurological, ...patch } }));
  };

  const updateRespiratory = (patch: Partial<NursePediatricEvolutionForm['respiratory']>) => {
    setForm((p) => ({ ...p, respiratory: { ...p.respiratory, ...patch } }));
  };

  const updateCardiovascular = (patch: Partial<NursePediatricEvolutionForm['cardiovascular']>) => {
    setForm((p) => ({ ...p, cardiovascular: { ...p.cardiovascular, ...patch } }));
  };

  const updateGastrointestinal = (patch: Partial<NursePediatricEvolutionForm['gastrointestinal']>) => {
    setForm((p) => ({ ...p, gastrointestinal: { ...p.gastrointestinal, ...patch } }));
  };

  const updateNutrition = (patch: Partial<NursePediatricEvolutionForm['nutrition']>) => {
    setForm((p) => ({ ...p, nutrition: { ...p.nutrition, ...patch } }));
  };

  const updateEliminations = (patch: Partial<NursePediatricEvolutionForm['eliminations']>) => {
    setForm((p) => ({ ...p, eliminations: { ...p.eliminations, ...patch } }));
  };

  const updateSkin = (patch: Partial<NursePediatricEvolutionForm['skin']>) => {
    setForm((p) => ({ ...p, skin: { ...p.skin, ...patch } }));
  };

  const updateDevices = (patch: Partial<NursePediatricEvolutionForm['devices']>) => {
    setForm((p) => ({ ...p, devices: { ...p.devices, ...patch } }));
  };

  const addDevice = () => {
    const newDev: NursePediatricInvasiveDeviceItem = {
      id: `dev-${Date.now()}`,
      type: '',
      anatomicalSite: '',
      laterality: '',
      siteCondition: 'Sem sinais flogísticos',
      dressingCondition: 'Limpo e oclusivo',
      permeability: 'Pérvio',
    };
    updateDevices({ list: [...form.devices.list, newDev], hasDevices: 'Sim' });
  };

  const removeDevice = (id: string) => {
    const nextList = form.devices.list.filter((d) => d.id !== id);
    updateDevices({ list: nextList, hasDevices: nextList.length > 0 ? 'Sim' : 'Não' });
  };

  const updateDeviceItem = (id: string, patch: Partial<NursePediatricInvasiveDeviceItem>) => {
    const nextList = form.devices.list.map((d) => (d.id === id ? { ...d, ...patch } : d));
    updateDevices({ list: nextList });
  };

  const updateMobility = (patch: Partial<NursePediatricEvolutionForm['mobility']>) => {
    setForm((p) => ({ ...p, mobility: { ...p.mobility, ...patch } }));
  };

  const updateHygiene = (patch: Partial<NursePediatricEvolutionForm['hygiene']>) => {
    setForm((p) => ({ ...p, hygiene: { ...p.hygiene, ...patch } }));
  };

  const updateSleep = (patch: Partial<NursePediatricEvolutionForm['sleep']>) => {
    setForm((p) => ({ ...p, sleep: { ...p.sleep, ...patch } }));
  };

  const updateRisks = (patch: Partial<NursePediatricEvolutionForm['risks']>) => {
    setForm((p) => ({ ...p, risks: { ...p.risks, ...patch } }));
  };

  const updateCare = (patch: Partial<NursePediatricEvolutionForm['care']>) => {
    setForm((p) => ({ ...p, care: { ...p.care, ...patch } }));
  };

  const updateResponseToCare = (patch: Partial<NursePediatricEvolutionForm['responseToCare']>) => {
    setForm((p) => ({ ...p, responseToCare: { ...p.responseToCare, ...patch } }));
  };

  const updateComplications = (patch: Partial<NursePediatricEvolutionForm['complications']>) => {
    setForm((p) => ({ ...p, complications: { ...p.complications, ...patch } }));
  };

  const updateCommunication = (patch: Partial<NursePediatricEvolutionForm['communication']>) => {
    setForm((p) => ({ ...p, communication: { ...p.communication, ...patch } }));
  };

  const updateComparison = (patch: Partial<NursePediatricEvolutionForm['comparison']>) => {
    setForm((p) => ({ ...p, comparison: { ...p.comparison, ...patch } }));
  };

  const updateSynthesis = (patch: Partial<NursePediatricEvolutionForm['nursingSynthesis']>) => {
    setForm((p) => ({ ...p, nursingSynthesis: { ...p.nursingSynthesis, ...patch } }));
  };

  const updateCurrentStatus = (patch: Partial<NursePediatricEvolutionForm['currentStatus']>) => {
    setForm((p) => ({ ...p, currentStatus: { ...p.currentStatus, ...patch } }));
  };

  if (viewMode === 'preview') {
    return (
      <NursePediatricEvolutionPreviewView
        form={form}
        onBackToEdit={() => setViewMode('form')}
        patientAreaName={patientAreaName}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-back-to-areas"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Áreas
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-reset-form"
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
          <button
            id="btn-preview-evolution"
            type="button"
            onClick={() => setViewMode('preview')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            Visualizar Evolução
          </button>
        </div>
      </div>

      {/* Title Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privativo do Enfermeiro • COFEN
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Evolução de Enfermagem — Pediatria
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Registro clínico sistematizado e fidedigno por sistemas, sinais vitais, dispositivos e síntese profissional.
            </p>
          </div>
        </div>

        {/* Consistency Errors */}
        {!consistency.valid && (
          <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Inconsistências no preenchimento clínico ({consistency.errors.length}):
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
              {consistency.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 28 Clinical Sections */}
      <div className="space-y-4">
        {/* 1. Contexto */}
        <ClinicalSection
          id="sec-ped-context"
          title="1. Contexto da Evolução"
          description="Momento do registro e setor pediátrico"
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
          isFilled={Boolean(form.context.moment || form.context.location)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Momento da Evolução"
              options={['Recebo paciente', 'Avalio paciente', 'Reavalio paciente', 'Evolução do plantão', 'Início do plantão', 'Outro']}
              selectedValue={form.context.moment}
              onChange={(val) => updateContext({ moment: val })}
            />
            {form.context.moment === 'Outro' && (
              <ClinicalTextInput
                label="Especifique o momento"
                value={form.context.customMoment || ''}
                onChange={(val) => updateContext({ customMoment: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Localização / Setor"
              options={['Enfermaria Pediátrica', 'Unidade Pediátrica', 'Leito', 'Berçário', 'Observação', 'Outro']}
              selectedValue={form.context.location}
              onChange={(val) => updateContext({ location: val })}
            />
            {form.context.location === 'Outro' && (
              <ClinicalTextInput
                label="Especifique o setor"
                value={form.context.customLocation || ''}
                onChange={(val) => updateContext({ customLocation: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 2. Segurança e Identificação */}
        <ClinicalSection
          id="sec-ped-safety"
          title="2. Identificação e Segurança Pediátrica"
          description="Conferência de identificação, precauções e alergias"
          isOpen={activeSection === 1}
          onToggle={() => toggleSection(1)}
          isFilled={Boolean(form.safety.wristband || form.safety.bedIdentification || form.safety.precautions || form.safety.allergies)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Pulseira de Identificação"
              options={['Presente e conferida', 'Ausente', 'Não se aplica', 'Não informado']}
              selectedValue={form.safety.wristband}
              onChange={(val) => updateSafety({ wristband: val })}
            />
            <ClinicalOptionGroup
              label="Identificação no Leito / Berço"
              options={['Presente e conferida', 'Ausente', 'Não se aplica', 'Não informado']}
              selectedValue={form.safety.bedIdentification}
              onChange={(val) => updateSafety({ bedIdentification: val })}
            />
            <ClinicalOptionGroup
              label="Precauções Assistenciais"
              options={['Padrão', 'Contato', 'Gotículas', 'Aerossóis', 'Outra', 'Não informado']}
              selectedValue={form.safety.precautions}
              onChange={(val) => updateSafety({ precautions: val })}
            />
            {form.safety.precautions === 'Outra' && (
              <ClinicalTextInput
                label="Especifique a precaução"
                value={form.safety.customPrecautions || ''}
                onChange={(val) => updateSafety({ customPrecautions: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Alergias Conhecidas"
              options={['Não referidas', 'Sim', 'Não informado']}
              selectedValue={form.safety.allergies}
              onChange={(val) => updateSafety({ allergies: val })}
            />
            {form.safety.allergies === 'Sim' && (
              <ClinicalTextInput
                label="Descrição das alergias"
                placeholder="Ex: Alergia a amoxicilina e dipirona"
                value={form.safety.allergyDescription || ''}
                onChange={(val) => updateSafety({ allergyDescription: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 3. Dados Pediátricos */}
        <ClinicalSection
          id="sec-ped-data"
          title="3. Dados Pediátricos (Idade, Peso e Estatura)"
          description="Valores informados manualmente. Nunca interpretados ou calculados"
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
          isFilled={Boolean(form.pediatricData.age || form.pediatricData.weight || form.pediatricData.height)}
        >
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Diretriz de Segurança:</strong> Não é permitido o cálculo de IMC, percentis ou escore-z. Os dados antropométricos são registrados fidedignamente sem rotulagem de adequação nutricional.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ClinicalTextInput
                label="Idade Informada"
                placeholder="Ex: 8 meses, 3 anos"
                value={form.pediatricData.age}
                onChange={(val) => updatePediatricData({ age: val })}
              />
              <div className="grid grid-cols-2 gap-2">
                <ClinicalTextInput
                  label="Peso Informado"
                  placeholder="Ex: 8.5"
                  value={form.pediatricData.weight}
                  onChange={(val) => updatePediatricData({ weight: val })}
                />
                <ClinicalOptionGroup
                  label="Unidade"
                  options={['kg']}
                  selectedValue={form.pediatricData.weightUnit}
                  onChange={(val) => updatePediatricData({ weightUnit: val })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ClinicalTextInput
                  label="Estatura / Comprimento"
                  placeholder="Ex: 72"
                  value={form.pediatricData.height}
                  onChange={(val) => updatePediatricData({ height: val })}
                />
                <ClinicalOptionGroup
                  label="Unidade"
                  options={['cm']}
                  selectedValue={form.pediatricData.heightUnit}
                  onChange={(val) => updatePediatricData({ heightUnit: val })}
                />
              </div>
            </div>
            <ClinicalOptionGroup
              label="Sexo Biológico"
              options={['Masculino', 'Feminino', 'Não informado']}
              selectedValue={form.pediatricData.sex}
              onChange={(val) => updatePediatricData({ sex: val })}
            />
          </div>
        </ClinicalSection>

        {/* 4. Responsável e Acompanhante */}
        <ClinicalSection
          id="sec-ped-guardian"
          title="4. Responsável e Acompanhante"
          description="Presença e vínculo sem identificação de nome (Privacidade)"
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
          isFilled={Boolean(form.guardian.presence || form.guardian.guardianType)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Presença de Acompanhante"
              options={['Acompanhado', 'Desacompanhado', 'Não informado']}
              selectedValue={form.guardian.presence}
              onChange={(val) => updateGuardian({ presence: val })}
            />
            {form.guardian.presence === 'Acompanhado' && (
              <ClinicalOptionGroup
                label="Vínculo do Acompanhante"
                options={['Mãe', 'Pai', 'Responsável legal', 'Cuidador', 'Familiar', 'Outro']}
                selectedValue={form.guardian.guardianType}
                onChange={(val) => updateGuardian({ guardianType: val })}
              />
            )}
            {form.guardian.guardianType === 'Outro' && (
              <ClinicalTextInput
                label="Especifique o vínculo"
                value={form.guardian.customGuardianType || ''}
                onChange={(val) => updateGuardian({ customGuardianType: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 5. Fonte das Informações */}
        <ClinicalSection
          id="sec-ped-source"
          title="5. Fonte das Informações"
          description="Origem dos dados prestados no momento"
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
          isFilled={Boolean(form.infoSource.source)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Fonte Principal"
              options={['Paciente', 'Responsável', 'Equipe', 'Outro', 'Não informado']}
              selectedValue={form.infoSource.source}
              onChange={(val) => updateInfoSource({ source: val })}
            />
            {form.infoSource.source === 'Outro' && (
              <ClinicalTextInput
                label="Especifique a fonte"
                value={form.infoSource.customSource || ''}
                onChange={(val) => updateInfoSource({ customSource: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 6. Avaliação Geral */}
        <ClinicalSection
          id="sec-ped-general"
          title="6. Avaliação Geral e Queixas"
          description="Estado geral observado e queixas informadas"
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
          isFilled={Boolean(form.generalAssessment.generalState || form.generalAssessment.complaint)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Estado Geral Observado"
              options={['Bom', 'Regular', 'Mau', 'Não informado']}
              selectedValue={form.generalAssessment.generalState}
              onChange={(val) => updateGeneral({ generalState: val })}
            />
            <ClinicalOptionGroup
              label="Queixas Registradas"
              options={['Sem queixas', 'Com queixa', 'Não avaliado', 'Não informado']}
              selectedValue={form.generalAssessment.complaint}
              onChange={(val) => updateGeneral({ complaint: val })}
            />
            {form.generalAssessment.complaint === 'Com queixa' && (
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  label="Descrição da queixa"
                  placeholder="Ex: Irritabilidade com dor abdominal referida pela mãe"
                  value={form.generalAssessment.complaintDescription || ''}
                  onChange={(val) => updateGeneral({ complaintDescription: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 7. Comportamento */}
        <ClinicalSection
          id="sec-ped-behavior"
          title="7. Comportamento e Nível de Atividade"
          description="Comportamento factual observado, sem interpretação de maturidade"
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
          isFilled={Boolean(form.behavior.behavior.length > 0 || form.behavior.activity)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Comportamento Observado"
              options={['Tranquilo', 'Choroso', 'Irritado', 'Agitado', 'Sonolento', 'Hipoativo', 'Cooperativo', 'Outro']}
              selectedValues={form.behavior.behavior}
              onChange={(vals) => updateBehavior({ behavior: vals })}
            />
            {form.behavior.behavior.includes('Outro') && (
              <ClinicalTextInput
                label="Especifique o comportamento"
                value={form.behavior.customBehavior || ''}
                onChange={(val) => updateBehavior({ customBehavior: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Nível de Atividade"
              options={['Ativa', 'Reduzida', 'Restrita', 'Outro', 'Não avaliada']}
              selectedValue={form.behavior.activity}
              onChange={(val) => updateBehavior({ activity: val })}
            />
            {form.behavior.activity === 'Outro' && (
              <ClinicalTextInput
                label="Especifique a atividade"
                value={form.behavior.customActivity || ''}
                onChange={(val) => updateBehavior({ customActivity: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 8. Dor Pediátrica */}
        <ClinicalSection
          id="sec-ped-pain"
          title="8. Avaliação de Dor Pediátrica"
          description="Escala numérica, Escala de Faces ou FLACC"
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
          isFilled={Boolean(form.pain.scale || form.pain.score)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Instrumento de Avaliação de Dor"
              options={['Escala numérica 0–10', 'Escala de faces', 'FLACC', 'Outra', 'Não avaliável', 'Sem dor']}
              selectedValue={form.pain.scale}
              onChange={(val) => updatePain({ scale: val })}
            />
            {form.pain.scale && form.pain.scale !== 'Sem dor' && form.pain.scale !== 'Não avaliável' && (
              <ClinicalTextInput
                label="Pontuação / Escore da Dor"
                placeholder="Ex: 3, 4/10, FLACC 2"
                value={form.pain.score}
                onChange={(val) => updatePain({ score: val })}
              />
            )}
            <ClinicalTextInput
              label="Localização da dor (se informada)"
              placeholder="Ex: Abdominal, pós-operatória, membro inferior"
              value={form.pain.location || ''}
              onChange={(val) => updatePain({ location: val })}
            />
            <ClinicalOptionGroup
              label="Analgesia Administrada"
              options={['Sim', 'Não', 'Não se aplica']}
              selectedValue={form.pain.analgesiaAdministered}
              onChange={(val) => updatePain({ analgesiaAdministered: val })}
            />
            {form.pain.analgesiaAdministered === 'Sim' && (
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  label="Detalhes da analgesia"
                  placeholder="Ex: Dipirona administrada conforme prescrição às 14h"
                  value={form.pain.analgesiaDetails || ''}
                  onChange={(val) => updatePain({ analgesiaDetails: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 9. Sinais Vitais */}
        <ClinicalSection
          id="sec-ped-vitals"
          title="9. Sinais Vitais"
          description="Parâmetros aferidos. PAM manual fidedigna (sem cálculo automático)"
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
          isFilled={Boolean(form.vitalSigns.heartRate || form.vitalSigns.respiratoryRate || form.vitalSigns.temperature)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ClinicalTextInput
              label="PA Sistólica (mmHg)"
              placeholder="Ex: 95"
              value={form.vitalSigns.systolicBP}
              onChange={(val) => updateVitals({ systolicBP: val })}
            />
            <ClinicalTextInput
              label="PA Diastólica (mmHg)"
              placeholder="Ex: 60"
              value={form.vitalSigns.diastolicBP}
              onChange={(val) => updateVitals({ diastolicBP: val })}
            />
            <ClinicalTextInput
              label="PAM Manual (mmHg)"
              placeholder="Ex: 72 (aferida)"
              value={form.vitalSigns.meanArterialPressure}
              onChange={(val) => updateVitals({ meanArterialPressure: val })}
            />
            <ClinicalTextInput
              label="FC (bpm)"
              placeholder="Ex: 110"
              value={form.vitalSigns.heartRate}
              onChange={(val) => updateVitals({ heartRate: val })}
            />
            <ClinicalTextInput
              label="FR (irpm)"
              placeholder="Ex: 24"
              value={form.vitalSigns.respiratoryRate}
              onChange={(val) => updateVitals({ respiratoryRate: val })}
            />
            <ClinicalTextInput
              label="SpO2 (%)"
              placeholder="Ex: 98"
              value={form.vitalSigns.oxygenSaturation}
              onChange={(val) => updateVitals({ oxygenSaturation: val })}
            />
            <ClinicalTextInput
              label="Temperatura (°C)"
              placeholder="Ex: 36.8"
              value={form.vitalSigns.temperature}
              onChange={(val) => updateVitals({ temperature: val })}
            />
            <ClinicalTextInput
              label="Glicemia (mg/dL)"
              placeholder="Ex: 94"
              value={form.vitalSigns.capillaryBloodGlucose}
              onChange={(val) => updateVitals({ capillaryBloodGlucose: val })}
            />
          </div>
        </ClinicalSection>

        {/* 10. Neurológico */}
        <ClinicalSection
          id="sec-ped-neuro"
          title="10. Avaliação Neurológica"
          description="Nível de consciência, pupilas e reatividade observada"
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
          isFilled={Boolean(form.neurological.consciousness || form.neurological.pupils)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Nível de Consciência"
              options={['Consciente', 'Sonolento', 'Torporoso', 'Comatoso', 'Outro', 'Não avaliado']}
              selectedValue={form.neurological.consciousness}
              onChange={(val) => updateNeurological({ consciousness: val })}
            />
            <ClinicalOptionGroup
              label="Orientação"
              options={['Orientado', 'Desorientado', 'Não se aplica', 'Não avaliado']}
              selectedValue={form.neurological.orientation}
              onChange={(val) => updateNeurological({ orientation: val })}
            />
            <ClinicalOptionGroup
              label="Pupilas"
              options={['Isocóricas e fotorreagentes', 'Anisocóricas', 'Midriáticas', 'Mióticas', 'Não avaliadas']}
              selectedValue={form.neurological.pupils}
              onChange={(val) => updateNeurological({ pupils: val })}
            />
            <ClinicalTextInput
              label="Reatividade / Resposta observada"
              placeholder="Ex: Reage ativamente aos estímulos sonoros e visuais"
              value={form.neurological.observedResponse}
              onChange={(val) => updateNeurological({ observedResponse: val })}
            />
          </div>
        </ClinicalSection>

        {/* 11. Respiratório */}
        <ClinicalSection
          id="sec-ped-resp"
          title="11. Sistema Respiratório"
          description="Suporte de oxigênio, ausculta pulmonar e sinais de desconforto"
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
          isFilled={Boolean(form.respiratory.support || form.respiratory.auscultation)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Suporte Respiratório"
              options={['Ar ambiente', 'Oxigenoterapia', 'VNI', 'VMI', 'Traqueostomia', 'Outro']}
              selectedValue={form.respiratory.support}
              onChange={(val) => updateRespiratory({ support: val })}
            />
            {form.respiratory.support !== 'Ar ambiente' && form.respiratory.support && (
              <ClinicalTextInput
                label="Detalhes do suporte"
                placeholder="Ex: Cateter nasal a 1 L/min"
                value={form.respiratory.supportDetails || ''}
                onChange={(val) => updateRespiratory({ supportDetails: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Padrão Respiratório"
              options={['Eupneico', 'Taquipneico', 'Bradipneico', 'Dispneico', 'Outro']}
              selectedValue={form.respiratory.pattern}
              onChange={(val) => updateRespiratory({ pattern: val })}
            />
            <ClinicalOptionGroup
              label="Sinais de Desconforto Respiratório"
              options={['Ausente', 'Tiragem intercostal', 'Batimento de asa de nariz', 'Retração subcostal', 'Gemência', 'Presente']}
              selectedValue={form.respiratory.discomfort}
              onChange={(val) => updateRespiratory({ discomfort: val })}
            />
            <div className="sm:col-span-2">
              <ClinicalOptionGroup
                label="Ausculta Pulmonar"
                options={[
                  'Murmúrio vesicular presente bilateralmente sem ruídos adventícios',
                  'Ruídos adventícios presentes',
                  'Não avaliada',
                ]}
                selectedValue={form.respiratory.auscultation}
                onChange={(val) => updateRespiratory({ auscultation: val })}
              />
            </div>
            {form.respiratory.auscultation === 'Ruídos adventícios presentes' && (
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  label="Detalhes da ausculta"
                  placeholder="Ex: Roncos de transmissão e estertores subcrepitantes em bases"
                  value={form.respiratory.adventitiousDetails || ''}
                  onChange={(val) => updateRespiratory({ adventitiousDetails: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 12. Cardiovascular */}
        <ClinicalSection
          id="sec-ped-cardio"
          title="12. Sistema Cardiovascular"
          description="Ausculta cardíaca, perfusão periférica, pulsos e edema"
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
          isFilled={Boolean(form.cardiovascular.auscultation || form.cardiovascular.perfusion)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Ausculta Cardíaca"
              options={['Bulhas normofonéticas e rítmicas', 'Sopro cardíaco', 'Bulhas alteradas', 'Não avaliada']}
              selectedValue={form.cardiovascular.auscultation}
              onChange={(val) => updateCardiovascular({ auscultation: val })}
            />
            <ClinicalOptionGroup
              label="Perfusão Periférica"
              options={['Boa / Preservada (TEC < 2s)', 'Lentificada (TEC > 2s)', 'Não avaliada']}
              selectedValue={form.cardiovascular.perfusion}
              onChange={(val) => updateCardiovascular({ perfusion: val })}
            />
            <ClinicalOptionGroup
              label="Extremidades"
              options={['Aquecidas', 'Frias', 'Cianóticas', 'Pálidas']}
              selectedValue={form.cardiovascular.extremities}
              onChange={(val) => updateCardiovascular({ extremities: val })}
            />
            <ClinicalOptionGroup
              label="Pulsos Periféricos"
              options={['Cheios e simétricos', 'Filiformes', 'Diminuídos', 'Não avaliados']}
              selectedValue={form.cardiovascular.pulses}
              onChange={(val) => updateCardiovascular({ pulses: val })}
            />
            <ClinicalOptionGroup
              label="Edema"
              options={['Ausente', 'Presente', 'Não avaliado']}
              selectedValue={form.cardiovascular.edema}
              onChange={(val) => updateCardiovascular({ edema: val })}
            />
            {form.cardiovascular.edema === 'Presente' && (
              <ClinicalTextInput
                label="Localização e graduação do edema"
                placeholder="Ex: Edema maleolar +/4+"
                value={form.cardiovascular.edemaDetails || ''}
                onChange={(val) => updateCardiovascular({ edemaDetails: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 13. Gastrointestinal */}
        <ClinicalSection
          id="sec-ped-gi"
          title="13. Sistema Gastrointestinal"
          description="Condição abdominal, ruídos e queixas gástricas"
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
          isFilled={Boolean(form.gastrointestinal.abdomen || form.gastrointestinal.bowelSounds)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Condição Abdominal"
              options={['Plano, flácido e indolor', 'Distendido', 'Globoso', 'Doloroso à palpação', 'Outro']}
              selectedValue={form.gastrointestinal.abdomen}
              onChange={(val) => updateGastrointestinal({ abdomen: val })}
            />
            <ClinicalOptionGroup
              label="Ruídos Hidroaéreos"
              options={['Presentes e normoativos', 'Aumentados', 'Diminuídos', 'Ausentes', 'Não avaliados']}
              selectedValue={form.gastrointestinal.bowelSounds}
              onChange={(val) => updateGastrointestinal({ bowelSounds: val })}
            />
            <ClinicalOptionGroup
              label="Dor à Palpação"
              options={['Ausente', 'Presente', 'Não avaliada']}
              selectedValue={form.gastrointestinal.palpationPain}
              onChange={(val) => updateGastrointestinal({ palpationPain: val })}
            />
            {form.gastrointestinal.palpationPain === 'Presente' && (
              <ClinicalTextInput
                label="Localização da dor"
                placeholder="Ex: Fossa ilíaca direita, epigástrio"
                value={form.gastrointestinal.palpationPainLocation || ''}
                onChange={(val) => updateGastrointestinal({ palpationPainLocation: val })}
              />
            )}
            <ClinicalOptionGroup
              label="Episódios Gástricos"
              options={['Ausente', 'Náuseas', 'Vômitos', 'Regurgitação', 'Outro']}
              selectedValue={form.gastrointestinal.vomitingRegurgitation}
              onChange={(val) => updateGastrointestinal({ vomitingRegurgitation: val })}
            />
            {form.gastrointestinal.vomitingRegurgitation !== 'Ausente' && form.gastrointestinal.vomitingRegurgitation && (
              <ClinicalTextInput
                label="Detalhes (frequência, aspecto)"
                placeholder="Ex: 1 episódio de vômito alimentar pós-mamadeira"
                value={form.gastrointestinal.vomitingDetails || ''}
                onChange={(val) => updateGastrointestinal({ vomitingDetails: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 14. Nutrição e Alimentação */}
        <ClinicalSection
          id="sec-ped-nutrition"
          title="14. Nutrição e Alimentação Pediátrica"
          description="Aleitamento, fórmulas, dieta enteral ou parenteral e aceitação"
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
          isFilled={Boolean(form.nutrition.feedingType || form.nutrition.acceptance)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Tipo de Alimentação"
              options={[
                'Aleitamento materno exclusivo',
                'Aleitamento materno complementar',
                'Fórmula infantil',
                'Via oral',
                'Enteral',
                'Parenteral',
                'Jejum',
                'Outro',
              ]}
              selectedValue={form.nutrition.feedingType}
              onChange={(val) => updateNutrition({ feedingType: val })}
            />
            <ClinicalOptionGroup
              label="Aceitação / Tolerância"
              options={['Boa aceitação', 'Aceitação parcial', 'Recusa alimentar', 'Não se aplica']}
              selectedValue={form.nutrition.acceptance}
              onChange={(val) => updateNutrition({ acceptance: val })}
            />
            {form.nutrition.feedingType === 'Enteral' && (
              <>
                <ClinicalOptionGroup
                  label="Dispositivo Enteral"
                  options={['SNE', 'SNG', 'GTT']}
                  selectedValue={form.nutrition.enteralDevice || ''}
                  onChange={(val) => updateNutrition({ enteralDevice: val })}
                />
                <ClinicalTextInput
                  label="Taxa de Infusão"
                  placeholder="Ex: 35 mL/h contínuo"
                  value={form.nutrition.enteralRate || ''}
                  onChange={(val) => updateNutrition({ enteralRate: val })}
                />
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    label="Tolerância da Dieta Enteral"
                    placeholder="Ex: Sem resíduo gástrico, sem distensão"
                    value={form.nutrition.enteralTolerance || ''}
                    onChange={(val) => updateNutrition({ enteralTolerance: val })}
                  />
                </div>
              </>
            )}
          </div>
        </ClinicalSection>

        {/* 15. Eliminações */}
        <ClinicalSection
          id="sec-ped-eliminations"
          title="15. Eliminações Vesicais e Intestinais"
          description="Diurese e aspecto das fezes"
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
          isFilled={Boolean(form.eliminations.diuresis || form.eliminations.bowel)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Diurese"
              options={['Espontânea em fralda', 'Espontânea no vaso/comadre', 'SVD', 'Ausente/anúria', 'Não informado']}
              selectedValue={form.eliminations.diuresis}
              onChange={(val) => updateEliminations({ diuresis: val })}
            />
            <ClinicalOptionGroup
              label="Aspecto da Diurese"
              options={['Amarelo claro', 'Concentrada', 'Hematúrica', 'Outro']}
              selectedValue={form.eliminations.diuresisAspect}
              onChange={(val) => updateEliminations({ diuresisAspect: val })}
            />
            <ClinicalTextInput
              label="Volume informado (se mensurado)"
              placeholder="Ex: 350 mL ou 4 fraldas pesadas"
              value={form.eliminations.diuresisVolume || ''}
              onChange={(val) => updateEliminations({ diuresisVolume: val })}
            />
            <ClinicalOptionGroup
              label="Evacuação"
              options={['Presente', 'Ausente no plantão', 'Constipação', 'Diarreia', 'Não informado']}
              selectedValue={form.eliminations.bowel}
              onChange={(val) => updateEliminations({ bowel: val })}
            />
            {form.eliminations.bowel === 'Presente' && (
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  label="Características das fezes"
                  placeholder="Ex: Pastosas, cor amarelada, sem muco ou sangue"
                  value={form.eliminations.bowelCharacteristics || ''}
                  onChange={(val) => updateEliminations({ bowelCharacteristics: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 16. Pele e Integridade */}
        <ClinicalSection
          id="sec-ped-skin"
          title="16. Pele e Integridade Cutânea"
          description="Turgor, assaduras, dermatites, lesões e curativos"
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
          isFilled={Boolean(form.skin.integrity || form.skin.dressings)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Integridade Cutânea"
              options={['Íntegra', 'Lesão presente', 'Assadura / dermatite', 'Hematoma / equimose', 'Não avaliada']}
              selectedValue={form.skin.integrity}
              onChange={(val) => updateSkin({ integrity: val })}
            />
            {form.skin.integrity !== 'Íntegra' && form.skin.integrity && (
              <>
                <ClinicalTextInput
                  label="Localização da alteração"
                  placeholder="Ex: Região perineal, dorso da mão"
                  value={form.skin.lesionLocation || ''}
                  onChange={(val) => updateSkin({ lesionLocation: val })}
                />
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    label="Descrição da lesão / assadura"
                    placeholder="Ex: Hiperemia perineal moderada sem sangramento ativo"
                    value={form.skin.lesionDescription || ''}
                    onChange={(val) => updateSkin({ lesionDescription: val })}
                  />
                </div>
              </>
            )}
            <ClinicalOptionGroup
              label="Presença de Curativos"
              options={['Ausentes', 'Presentes']}
              selectedValue={form.skin.dressings}
              onChange={(val) => updateSkin({ dressings: val })}
            />
            {form.skin.dressings === 'Presentes' && (
              <div className="sm:col-span-2">
                <ClinicalTextInput
                  label="Detalhes dos curativos"
                  placeholder="Ex: Curativo microporado limpo em antebraço E"
                  value={form.skin.dressingDetails || ''}
                  onChange={(val) => updateSkin({ dressingDetails: val })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 17. Dispositivos Invasivos */}
        <ClinicalSection
          id="sec-ped-devices"
          title="17. Dispositivos Invasivos"
          description="Acessos vasculares pediátricos, cateteres e sondas"
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
          isFilled={form.devices.hasDevices === 'Sim' || form.devices.list.length > 0}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <ClinicalOptionGroup
                label="Paciente possui dispositivos invasivos?"
                options={['Não', 'Sim']}
                selectedValue={form.devices.hasDevices}
                onChange={(val) => {
                  updateDevices({
                    hasDevices: val,
                    list: val === 'Não' ? [] : form.devices.list,
                  });
                }}
              />
              {form.devices.hasDevices === 'Sim' && (
                <button
                  type="button"
                  onClick={addDevice}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Dispositivo
                </button>
              )}
            </div>

            {form.devices.hasDevices === 'Sim' && form.devices.list.map((dev, idx) => (
              <div key={dev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Dispositivo #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeDevice(dev.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ClinicalTextInput
                    label="Tipo de Dispositivo"
                    placeholder="Ex: AVP, PICC, SNE, SVD"
                    value={dev.type}
                    onChange={(val) => updateDeviceItem(dev.id, { type: val })}
                  />
                  <ClinicalTextInput
                    label="Sítio Anatômico"
                    placeholder="Ex: MSD, veia basílica"
                    value={dev.anatomicalSite}
                    onChange={(val) => updateDeviceItem(dev.id, { anatomicalSite: val })}
                  />
                  <ClinicalOptionGroup
                    label="Lateralidade"
                    options={['Direito', 'Esquerdo', 'Não se aplica']}
                    selectedValue={dev.laterality}
                    onChange={(val) => updateDeviceItem(dev.id, { laterality: val })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ClinicalTextInput
                    label="Condição do Sítio"
                    placeholder="Ex: Sem sinais flogísticos"
                    value={dev.siteCondition}
                    onChange={(val) => updateDeviceItem(dev.id, { siteCondition: val })}
                  />
                  <ClinicalTextInput
                    label="Curativo / Fixação"
                    placeholder="Ex: Filme transparente estéril"
                    value={dev.dressingCondition}
                    onChange={(val) => updateDeviceItem(dev.id, { dressingCondition: val })}
                  />
                  <ClinicalOptionGroup
                    label="Permeabilidade"
                    options={['Pérvio', 'Obstruído', 'Com infusão contínua', 'Salinizado']}
                    selectedValue={dev.permeability}
                    onChange={(val) => updateDeviceItem(dev.id, { permeability: val })}
                  />
                </div>
              </div>
            ))}
          </div>
        </ClinicalSection>

        {/* 18. Mobilidade */}
        <ClinicalSection
          id="sec-ped-mobility"
          title="18. Mobilidade"
          description="Deambulação, repouso no leito, berço ou colo"
          isOpen={activeSection === 17}
          onToggle={() => toggleSection(17)}
          isFilled={Boolean(form.mobility.mobility)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Mobilidade do Paciente"
              options={[
                'No leito',
                'Deambula sem auxílio',
                'Deambula com auxílio',
                'No colo do acompanhante',
                'Em berço',
                'Restrito',
                'Outro',
              ]}
              selectedValue={form.mobility.mobility}
              onChange={(val) => updateMobility({ mobility: val })}
            />
            {form.mobility.mobility === 'Outro' && (
              <ClinicalTextInput
                label="Especifique a mobilidade"
                value={form.mobility.customMobility || ''}
                onChange={(val) => updateMobility({ customMobility: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 19. Higiene e Autocuidado */}
        <ClinicalSection
          id="sec-ped-hygiene"
          title="19. Higiene e Autocuidado"
          description="Tipo de banho e tolerância da criança"
          isOpen={activeSection === 18}
          onToggle={() => toggleSection(18)}
          isFilled={Boolean(form.hygiene.bath)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Banho Realizado"
              options={['Não realizado', 'Banho no leito', 'Banho de aspersão', 'Banho de imersão/banheira', 'Outro']}
              selectedValue={form.hygiene.bath}
              onChange={(val) => updateHygiene({ bath: val, bathTolerance: val === 'Não realizado' ? '' : form.hygiene.bathTolerance })}
            />
            {form.hygiene.bath && form.hygiene.bath !== 'Não realizado' && (
              <ClinicalOptionGroup
                label="Tolerância Observada"
                options={['Boa tolerância', 'Choro / irritabilidade', 'Instabilidade', 'Outro']}
                selectedValue={form.hygiene.bathTolerance || ''}
                onChange={(val) => updateHygiene({ bathTolerance: val })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 20. Sono e Repouso */}
        <ClinicalSection
          id="sec-ped-sleep"
          title="20. Sono e Repouso"
          description="Padrão de sono durante o período assistencial"
          isOpen={activeSection === 19}
          onToggle={() => toggleSection(19)}
          isFilled={Boolean(form.sleep.pattern)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Padrão de Sono"
              options={['Repousou tranquilamente', 'Sono entrecortado', 'Agitação noturna', 'Sonolência excessiva', 'Não observado']}
              selectedValue={form.sleep.pattern}
              onChange={(val) => updateSleep({ pattern: val })}
            />
            <ClinicalTextInput
              label="Observações sobre o sono"
              placeholder="Ex: Acordou para mamadas a cada 3 horas"
              value={form.sleep.details || ''}
              onChange={(val) => updateSleep({ details: val })}
            />
          </div>
        </ClinicalSection>

        {/* 21. Riscos Assistenciais */}
        <ClinicalSection
          id="sec-ped-risks"
          title="21. Riscos Assistenciais"
          description="Queda (grades mantidas elevadas), broncoaspiração e lesões"
          isOpen={activeSection === 20}
          onToggle={() => toggleSection(20)}
          isFilled={Boolean(form.risks.fallRisk || form.risks.aspirationRisk || form.risks.pressureUlcerRisk)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ClinicalOptionGroup
              label="Risco de Queda / Grades"
              options={['Baixo', 'Moderado', 'Alto', 'Grade elevada mantida', 'Não avaliado']}
              selectedValue={form.risks.fallRisk}
              onChange={(val) => updateRisks({ fallRisk: val })}
            />
            <ClinicalOptionGroup
              label="Risco de Broncoaspiração"
              options={['Presente', 'Ausente', 'Não avaliado']}
              selectedValue={form.risks.aspirationRisk}
              onChange={(val) => updateRisks({ aspirationRisk: val })}
            />
            <ClinicalOptionGroup
              label="Risco de Lesão por Pressão"
              options={['Baixo', 'Moderado', 'Alto', 'Não avaliado']}
              selectedValue={form.risks.pressureUlcerRisk}
              onChange={(val) => updateRisks({ pressureUlcerRisk: val })}
            />
          </div>
        </ClinicalSection>

        {/* 22. Cuidados Realizados */}
        <ClinicalSection
          id="sec-ped-care"
          title="22. Cuidados Realizados"
          description="Intervenções e procedimentos de enfermagem executados"
          isOpen={activeSection === 21}
          onToggle={() => toggleSection(21)}
          isFilled={form.care.performed.length > 0}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Checklist de Cuidados Executados"
              options={[
                'Higiene e conforto',
                'Administração de medicamentos prescritos',
                'Mudança de decúbito',
                'Cuidados com acessos e dispositivos',
                'Controle glicêmico',
                'Coleta de exames laboratoriais',
                'Pesagem / antropometria',
                'Aferição de sinais vitais',
                'Orientação aos pais e familiares',
              ]}
              selectedValues={form.care.performed}
              onChange={(vals) => updateCare({ performed: vals })}
            />
            <ClinicalTextInput
              label="Cuidados adicionais"
              placeholder="Ex: Realizada inalação prescrita com SF 0,9%"
              value={form.care.customCare || ''}
              onChange={(val) => updateCare({ customCare: val })}
            />
          </div>
        </ClinicalSection>

        {/* 23. Resposta aos Cuidados */}
        <ClinicalSection
          id="sec-ped-response"
          title="23. Resposta aos Cuidados"
          description="Resposta factual observada após intervenções de enfermagem"
          isOpen={activeSection === 22}
          onToggle={() => toggleSection(22)}
          isFilled={Boolean(form.responseToCare.evaluated === 'Sim')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Avaliar Resposta às Intervenções"
              options={['Sim', 'Não', 'Não se aplica']}
              selectedValue={form.responseToCare.evaluated}
              onChange={(val) => updateResponseToCare({ evaluated: val })}
            />
            {form.responseToCare.evaluated === 'Sim' && (
              <>
                <ClinicalTextInput
                  label="Intervenção Avaliada"
                  placeholder="Ex: Administração de analgésico / inalação"
                  value={form.responseToCare.interventionTarget}
                  onChange={(val) => updateResponseToCare({ interventionTarget: val })}
                />
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    label="Resposta Clínica Observada"
                    placeholder="Ex: Paciente adormeceu tranquilamente, cessando choro"
                    value={form.responseToCare.observedResponse}
                    onChange={(val) => updateResponseToCare({ observedResponse: val })}
                  />
                </div>
              </>
            )}
          </div>
        </ClinicalSection>

        {/* 24. Intercorrências */}
        <ClinicalSection
          id="sec-ped-complications"
          title="24. Intercorrências no Plantão"
          description="Alterações clínicas agudas, condutas adotadas e resposta"
          isOpen={activeSection === 23}
          onToggle={() => toggleSection(23)}
          isFilled={form.complications.hasComplication === 'Sim'}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve intercorrência no período?"
              options={['Não', 'Sim']}
              selectedValue={form.complications.hasComplication}
              onChange={(val) => updateComplications({ hasComplication: val })}
            />
            {form.complications.hasComplication === 'Sim' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    label="Descrição da Intercorrência"
                    placeholder="Ex: Pico febril de 38.8 °C às 16h acompanhado de taquicardia"
                    value={form.complications.description || ''}
                    onChange={(val) => updateComplications({ description: val })}
                  />
                </div>
                <ClinicalTextInput
                  label="Conduta Imediata Adotada"
                  placeholder="Ex: Administrado antitérmico prescrito e aplicada compressa morna"
                  value={form.complications.immediateAction || ''}
                  onChange={(val) => updateComplications({ immediateAction: val })}
                />
                <ClinicalTextInput
                  label="Comunicação à Equipe Médica"
                  placeholder="Ex: Comunicado Dr. Pediatra de plantão"
                  value={form.complications.communicationDone || ''}
                  onChange={(val) => updateComplications({ communicationDone: val })}
                />
                <div className="sm:col-span-2">
                  <ClinicalTextInput
                    label="Evolução Pós-Conduta"
                    placeholder="Ex: Temperatura reduziu para 36.9 °C após 40 minutos"
                    value={form.complications.responseObserved || ''}
                    onChange={(val) => updateComplications({ responseObserved: val })}
                  />
                </div>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 25. Comunicação com Família e Equipe */}
        <ClinicalSection
          id="sec-ped-communication"
          title="25. Comunicação com Família e Equipe"
          description="Orientações aos responsáveis e passagem de plantão"
          isOpen={activeSection === 24}
          onToggle={() => toggleSection(24)}
          isFilled={Boolean(form.communication.familyOrientation || form.communication.shiftHandover)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Orientação ao Responsável"
              options={['Sim, responsável orientado', 'Não', 'Não se aplica']}
              selectedValue={form.communication.familyOrientation}
              onChange={(val) => updateCommunication({ familyOrientation: val })}
            />
            <ClinicalOptionGroup
              label="Passagem de Plantão"
              options={['Realizada passagem de plantão', 'Não realizada']}
              selectedValue={form.communication.shiftHandover}
              onChange={(val) => updateCommunication({ shiftHandover: val })}
            />
            <div className="sm:col-span-2">
              <ClinicalTextInput
                label="Contato Multiprofissional (se houver)"
                placeholder="Ex: Alinhado plano terapêutico com fisioterapia respiratória"
                value={form.communication.multiprofessionalContact || ''}
                onChange={(val) => updateCommunication({ multiprofessionalContact: val })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 26. Comparação com Avaliação Anterior */}
        <ClinicalSection
          id="sec-ped-comparison"
          title="26. Comparação com Avaliação Anterior"
          description="Evolução em relação ao plantão ou avaliação anterior"
          isOpen={activeSection === 25}
          onToggle={() => toggleSection(25)}
          isFilled={Boolean(form.comparison.status)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Evolução Clínica Comparada"
              options={['Melhora clínica', 'Quadro estável', 'Piora clínica', 'Primeira avaliação', 'Não informado']}
              selectedValue={form.comparison.status}
              onChange={(val) => updateComparison({ status: val })}
            />
            <ClinicalTextInput
              label="Detalhes da Comparação"
              placeholder="Ex: Melhora do padrão ventilatório após inalações"
              value={form.comparison.details || ''}
              onChange={(val) => updateComparison({ details: val })}
            />
          </div>
        </ClinicalSection>

        {/* 27. Síntese de Enfermagem (Privativa) */}
        <ClinicalSection
          id="sec-ped-synthesis"
          title="27. Síntese de Enfermagem (Privativa do Enfermeiro)"
          description="Raciocínio clínico, julgamento diagnóstico e plano de cuidados"
          isOpen={activeSection === 26}
          onToggle={() => toggleSection(26)}
          isFilled={Boolean(form.nursingSynthesis.synthesisText)}
        >
          <div className="space-y-2">
            <ClinicalTextarea
              label="Síntese Clínica e Julgamento Profissional"
              placeholder="Ex: Paciente pediátrico mantendo estabilidade hemodinâmica, sob oxigenoterapia de baixo fluxo com boa resposta. Mantidos cuidados de enfermagem, vigilância de esforço respiratório e suporte ao acompanhante."
              value={form.nursingSynthesis.synthesisText}
              onChange={(val) => updateSynthesis({ synthesisText: val })}
              rows={4}
            />
          </div>
        </ClinicalSection>

        {/* 28. Situação Atual */}
        <ClinicalSection
          id="sec-ped-status"
          title="28. Situação Atual e Pendências"
          description="Condição ao término da avaliação e pendências assistenciais"
          isOpen={activeSection === 27}
          onToggle={() => toggleSection(27)}
          isFilled={Boolean(form.currentStatus.patientStatus || form.currentStatus.pendingIssues)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalOptionGroup
              label="Condição Atual"
              options={[
                'Permanece no leito em repouso',
                'Permanece no colo do acompanhante',
                'Permanece no berço estável',
                'Aguardando alta hospitalar',
                'Outro',
              ]}
              selectedValue={form.currentStatus.patientStatus}
              onChange={(val) => updateCurrentStatus({ patientStatus: val })}
            />
            {form.currentStatus.patientStatus === 'Outro' && (
              <ClinicalTextInput
                label="Especifique a condição"
                value={form.currentStatus.customPatientStatus || ''}
                onChange={(val) => updateCurrentStatus({ customPatientStatus: val })}
              />
            )}
            <div className="sm:col-span-2">
              <ClinicalTextInput
                label="Pendências Assistenciais"
                placeholder="Ex: Aguardando resultado de hemograma e reavaliação médica"
                value={form.currentStatus.pendingIssues}
                onChange={(val) => updateCurrentStatus({ pendingIssues: val })}
              />
            </div>
          </div>
        </ClinicalSection>
      </div>

      {/* Bottom Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-200 z-10 flex items-center justify-between max-w-4xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={handleResetForm}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
        >
          Limpar campos
        </button>

        <button
          type="button"
          onClick={() => setViewMode('preview')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md transition-colors"
        >
          <FileText className="w-4 h-4" />
          Visualizar e Refinar Evolução
        </button>
      </div>
    </div>
  );
};
