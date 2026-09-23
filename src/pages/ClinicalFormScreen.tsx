import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { ClinicalEvolutionForm, SectionStatus } from '../types/clinical';
import { Atendimento, ProfessionalUser } from '../types';
import {
  createInitialClinicalForm,
  ClinicalFormValidator,
  getSectionStatuses,
} from '../utils/clinicalValidator';
import { ClinicalSection } from '../components/clinical/ClinicalSection';
import { ClinicalOptionGroup } from '../components/clinical/ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../components/clinical/ClinicalMultiSelect';
import { ClinicalNumericInput } from '../components/clinical/ClinicalNumericInput';
import { ClinicalTextInput, ClinicalTextarea } from '../components/clinical/ClinicalInputs';
import { VasoactiveDrugCard, SedationAnalgesiaCard } from '../components/clinical/MedicationCards';
import { DeviceFormCard } from '../components/clinical/DeviceFormCard';
import { ClinicalProgressBar } from '../components/clinical/ClinicalProgressBar';
import { ClinicalAlertNotice } from '../components/clinical/ClinicalAlertNotice';
import { ClinicalSummaryView } from '../components/clinical/ClinicalSummaryView';
import { ClinicalCompletedView } from '../components/clinical/ClinicalCompletedView';
import { ClinicalEvolutionPreviewView } from '../components/clinical/ClinicalEvolutionPreviewView';

interface ClinicalFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
  atendimento?: Atendimento;
  usuario?: ProfessionalUser;
  onNavigateHistorico?: () => void;
}

export const ClinicalFormScreen: React.FC<ClinicalFormScreenProps> = ({
  onBack,
  patientAreaName = 'PS / Emergência',
  atendimento,
  usuario,
  onNavigateHistorico,
}) => {
  const [form, setForm] = useState<ClinicalEvolutionForm>(() => {
    const initial = createInitialClinicalForm();
    if (atendimento?.leito) {
      initial.context.location = 'Leito';
      initial.context.locationCustom = `Leito ${atendimento.leito}`;
    }
    return initial;
  });
  const [activeSection, setActiveSection] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'form' | 'summary' | 'preview' | 'completed'>('form');

  // Compute validation alerts and section statuses
  const alerts = useMemo(() => ClinicalFormValidator.validate(form), [form]);
  const sectionStatuses = useMemo(() => getSectionStatuses(form), [form]);

  // Section toggle helper
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
    if (window.confirm('Deseja realmente limpar todos os campos preenchidos?')) {
      setForm(createInitialClinicalForm());
      setActiveSection(0);
      setViewMode('form');
    }
  };

  // State updater helpers
  const updateContext = (updates: Partial<ClinicalEvolutionForm['context']>) =>
    setForm((prev) => ({ ...prev, context: { ...prev.context, ...updates } }));

  const updateGeneral = (updates: Partial<ClinicalEvolutionForm['generalAssessment']>) =>
    setForm((prev) => ({ ...prev, generalAssessment: { ...prev.generalAssessment, ...updates } }));

  const updateVitals = (updates: Partial<ClinicalEvolutionForm['vitalSigns']>) =>
    setForm((prev) => ({ ...prev, vitalSigns: { ...prev.vitalSigns, ...updates } }));

  const updatePain = (updates: Partial<ClinicalEvolutionForm['pain']>) =>
    setForm((prev) => ({ ...prev, pain: { ...prev.pain, ...updates } }));

  const updateNeurological = (updates: Partial<ClinicalEvolutionForm['neurological']>) =>
    setForm((prev) => ({ ...prev, neurological: { ...prev.neurological, ...updates } }));

  const updateRespiratory = (updates: Partial<ClinicalEvolutionForm['respiratory']>) =>
    setForm((prev) => ({ ...prev, respiratory: { ...prev.respiratory, ...updates } }));

  const updateCardiovascular = (updates: Partial<ClinicalEvolutionForm['cardiovascular']>) =>
    setForm((prev) => ({ ...prev, cardiovascular: { ...prev.cardiovascular, ...updates } }));

  const updateGastro = (updates: Partial<ClinicalEvolutionForm['gastrointestinal']>) =>
    setForm((prev) => ({ ...prev, gastrointestinal: { ...prev.gastrointestinal, ...updates } }));

  const updateNutrition = (updates: Partial<ClinicalEvolutionForm['nutrition']>) =>
    setForm((prev) => ({ ...prev, nutrition: { ...prev.nutrition, ...updates } }));

  const updateBowel = (updates: Partial<ClinicalEvolutionForm['bowelElimination']>) =>
    setForm((prev) => ({ ...prev, bowelElimination: { ...prev.bowelElimination, ...updates } }));

  const updateUrinary = (updates: Partial<ClinicalEvolutionForm['urinary']>) =>
    setForm((prev) => ({ ...prev, urinary: { ...prev.urinary, ...updates } }));

  const updateSkin = (updates: Partial<ClinicalEvolutionForm['skin']>) =>
    setForm((prev) => ({ ...prev, skin: { ...prev.skin, ...updates } }));

  const updateNursingCare = (updates: Partial<ClinicalEvolutionForm['nursingCare']>) =>
    setForm((prev) => ({ ...prev, nursingCare: { ...prev.nursingCare, ...updates } }));

  const updateBath = (updates: Partial<ClinicalEvolutionForm['bath']>) =>
    setForm((prev) => ({ ...prev, bath: { ...prev.bath, ...updates } }));

  const updateComplications = (updates: Partial<ClinicalEvolutionForm['complications']>) =>
    setForm((prev) => ({ ...prev, complications: { ...prev.complications, ...updates } }));

  const updateComparison = (updates: Partial<ClinicalEvolutionForm['comparison']>) =>
    setForm((prev) => ({ ...prev, comparison: { ...prev.comparison, ...updates } }));

  const updateFinalStatus = (updates: Partial<ClinicalEvolutionForm['finalStatus']>) =>
    setForm((prev) => ({ ...prev, finalStatus: { ...prev.finalStatus, ...updates } }));

  const updateAdditionalInfo = (val: string) =>
    setForm((prev) => ({
      ...prev,
      additionalInformation: val,
    }));

  if (viewMode === 'completed') {
    return (
      <ClinicalCompletedView
        form={form}
        atendimento={atendimento}
        atendimentoId={atendimento?.id}
        usuarioId={usuario?.id}
        usuarioResponsavel={usuario?.nome || 'Profissional de Enfermagem'}
        perfilProfissional={usuario?.profissao || 'Técnico em Enfermagem'}
        categoriaClinica={patientAreaName}
        setor={atendimento?.setor || 'Geral'}
        leito={atendimento?.leito || ''}
        identificacao={atendimento?.identificacao}
        usuario={usuario}
        onRestart={() => {
          setForm(createInitialClinicalForm());
          setViewMode('form');
          setActiveSection(0);
        }}
        onBackToDashboard={onBack}
        onNavigateHistorico={onNavigateHistorico}
      />
    );
  }

  if (viewMode === 'preview') {
    return (
      <ClinicalEvolutionPreviewView
        form={form}
        patientAreaName={patientAreaName}
        atendimento={atendimento}
        usuarioResponsavel={usuario?.nome || 'Profissional de Enfermagem'}
        perfilProfissional={usuario?.profissao || 'Técnico em Enfermagem'}
        onEditSection={openSection}
        onBackToForm={() => setViewMode('form')}
        onRestart={() => {
          setForm(createInitialClinicalForm());
          setViewMode('form');
          setActiveSection(0);
        }}
        onBackToDashboard={onBack}
        onComplete={() => setViewMode('completed')}
      />
    );
  }

  if (viewMode === 'summary') {
    return (
      <ClinicalSummaryView
        form={form}
        alerts={alerts}
        onBackToForm={() => setViewMode('form')}
        onEditSection={openSection}
        onConfirmComplete={() => setViewMode('preview')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Seleção de Áreas</span>
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Anotação de Enfermagem
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
              {patientAreaName}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Técnico em Enfermagem
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de observações, sinais vitais, dispositivos, cuidados executados e intercorrências assistenciais.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetForm}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            title="Limpar formulário"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('summary')}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-cyan-800 hover:bg-cyan-900 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Revisar Anotação</span>
          </button>
        </div>
      </div>

      {/* Professional Scope & Competency Notice */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start sm:items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong>Aviso de Competência Profissional:</strong> Registre somente avaliações, parâmetros e procedimentos realizados ou obtidos conforme sua habilitação, capacitação e protocolos da instituição onde atua.
        </p>
      </div>

      {/* Progress & Quick Jumps */}
      <ClinicalProgressBar
        sections={sectionStatuses}
        alerts={alerts}
        onOpenSection={openSection}
        onOpenSummary={() => setViewMode('summary')}
      />

      {/* Dynamic Alert Banner if any errors present */}
      {alerts.length > 0 && (
        <ClinicalAlertNotice alerts={alerts} onNavigateToSection={openSection} />
      )}

      {/* 17 SECTIONS ACCORDION */}
      <div className="space-y-3">
        {/* 1. Contexto do registro */}
        <ClinicalSection
          id="section-0"
          number={1}
          title="Contexto do Registro"
          subtitle="Momento, localização, checagens de segurança e precauções"
          status={sectionStatuses[0].status}
          isOpen={activeSection === 0}
          onToggle={() => toggleSection(0)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Momento do Registro"
                options={['Recebo paciente', 'Avalio paciente']}
                value={form.context.moment}
                onChange={(val) => updateContext({ moment: val as any })}
              />

              <ClinicalOptionGroup
                label="Localização no Setor"
                options={['Leito', 'Box', 'Sala Vermelha', 'Observação', 'Outro']}
                value={form.context.location}
                onChange={(val) => updateContext({ location: val as any })}
              />
            </div>

            {form.context.location === 'Outro' && (
              <ClinicalTextInput
                label="Especificar Localização"
                value={form.context.locationCustom}
                onChange={(val) => updateContext({ locationCustom: val })}
                placeholder="Ex: Sala de Sutura, Triagem..."
              />
            )}

            <ClinicalOptionGroup
              label="Acompanhamento"
              options={[
                'Desacompanhado',
                'Familiar',
                'Responsável',
                'Cuidador',
                'Equipe',
                'Outro',
                'Não informado',
              ]}
              value={form.context.accompaniment}
              onChange={(val) => updateContext({ accompaniment: val as any })}
              columns={4}
            />

            {form.context.accompaniment === 'Outro' && (
              <ClinicalTextInput
                label="Especificar Acompanhante"
                value={form.context.accompanimentCustom}
                onChange={(val) => updateContext({ accompanimentCustom: val })}
                placeholder="Ex: Amigo, Policial..."
              />
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Metas Internacionais de Segurança
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClinicalOptionGroup
                  label="Pulseira de Identificação Checada"
                  options={['Sim', 'Não', 'Não se aplica', 'Não informado']}
                  value={form.context.wristbandChecked}
                  onChange={(val) => updateContext({ wristbandChecked: val as any })}
                />
                <ClinicalOptionGroup
                  label="Placa de Identificação do Leito"
                  options={['Sim', 'Não', 'Não se aplica', 'Não informado']}
                  value={form.context.bedSignChecked}
                  onChange={(val) => updateContext({ bedSignChecked: val as any })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ClinicalOptionGroup
                  label="Alergias Conhecidas"
                  options={['Não referidas', 'Sim', 'Não informado']}
                  value={form.context.allergies}
                  onChange={(val) => updateContext({ allergies: val as any })}
                />
                {form.context.allergies === 'Sim' && (
                  <ClinicalTextInput
                    label="Descrever alergias"
                    required
                    value={form.context.allergiesDetails}
                    onChange={(val) => updateContext({ allergiesDetails: val })}
                    placeholder="Ex: Dipirona, Penicilina, Látex..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <ClinicalOptionGroup
                  label="Tipo de Precaução"
                  options={[
                    'Padrão',
                    'Contato',
                    'Gotículas',
                    'Aerossóis',
                    'Outra',
                    'Não informado',
                  ]}
                  value={form.context.precaution}
                  onChange={(val) => updateContext({ precaution: val as any })}
                />
                {form.context.precaution === 'Outra' && (
                  <ClinicalTextInput
                    label="Especificar Precaução"
                    value={form.context.precautionCustom}
                    onChange={(val) => updateContext({ precautionCustom: val })}
                    placeholder="Ex: Reversa / Protetora..."
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <ClinicalTextInput
                label="Motivo da Admissão / Queixa Principal"
                sublabel="Opcional"
                value={form.context.admissionReason}
                onChange={(val) => updateContext({ admissionReason: val })}
                placeholder="Ex: Dor torácica opressiva, dispneia súbita..."
                privacyReminder
              />
              <ClinicalTextInput
                label="Comorbidades Relevantes Informadas"
                sublabel="Opcional"
                value={form.context.relevantComorbidities}
                onChange={(val) => updateContext({ relevantComorbidities: val })}
                placeholder="Ex: HAS, DM2, ICC, DPOC..."
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 2. Avaliação geral */}
        <ClinicalSection
          id="section-1"
          number={2}
          title="Avaliação Geral"
          subtitle="Estado geral, comportamento, queixas clínicas, higiene e mobilidade"
          status={sectionStatuses[1].status}
          isOpen={activeSection === 1}
          onToggle={() => toggleSection(1)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Estado Geral"
              options={['Bom', 'Regular', 'Mau', 'Não informado']}
              value={form.generalAssessment.generalState}
              onChange={(val) => updateGeneral({ generalState: val as any })}
              columns={4}
            />

            <ClinicalMultiSelect
              label="Comportamento / Atitude"
              options={[
                'Calmo',
                'Agitado',
                'Combativo',
                'Sonolento',
                'Cooperativo',
                'Ansioso',
                'Choroso',
                'Irritado',
                'Hipoativo',
                'Não avaliado',
              ]}
              selectedValues={form.generalAssessment.behavior}
              onChange={(vals) => updateGeneral({ behavior: vals })}
              exclusiveValue="Não avaliado"
              columns={4}
            />

            <div className="space-y-2">
              <ClinicalOptionGroup
                label="Queixas Atuais"
                options={[
                  'Sem queixas no momento',
                  'Com queixa',
                  'Impossibilitado de informar',
                  'Não avaliado',
                  'Não informado',
                ]}
                value={form.generalAssessment.complaints}
                onChange={(val) => updateGeneral({ complaints: val as any })}
                columns={3}
              />
              {form.generalAssessment.complaints === 'Com queixa' && (
                <ClinicalTextInput
                  label="Descrever Queixa"
                  value={form.generalAssessment.complaintsDetails}
                  onChange={(val) => updateGeneral({ complaintsDetails: val })}
                  placeholder="Ex: Refere cefaleia frontal e náuseas leves..."
                  privacyReminder
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Condição de Higiene"
                options={[
                  'Preservada',
                  'Necessita cuidados',
                  'Higiene realizada no período',
                  'Não avaliada',
                  'Não informado',
                ]}
                value={form.generalAssessment.hygiene}
                onChange={(val) => updateGeneral({ hygiene: val as any })}
              />

              <div className="space-y-2">
                <ClinicalOptionGroup
                  label="Mobilidade / Locomoção"
                  options={[
                    'Deambula sem auxílio',
                    'Deambula com auxílio',
                    'Cadeira de rodas',
                    'Em maca',
                    'Restrito ao leito',
                    'Outro',
                    'Não avaliada',
                  ]}
                  value={form.generalAssessment.mobility}
                  onChange={(val) => updateGeneral({ mobility: val as any })}
                />
                {form.generalAssessment.mobility === 'Outro' && (
                  <ClinicalTextInput
                    label="Especificar Mobilidade"
                    value={form.generalAssessment.mobilityCustom}
                    onChange={(val) => updateGeneral({ mobilityCustom: val })}
                    placeholder="Ex: Restrição temporária por protocolo de trauma..."
                  />
                )}
              </div>
            </div>
          </div>
        </ClinicalSection>

        {/* 3. Sinais vitais e dor */}
        <ClinicalSection
          id="section-2"
          number={3}
          title="Sinais Vitais e Avaliação de Dor"
          subtitle="PA, FC, FR, SpO2, Temperatura e Escala de Dor (EVA / Numérica)"
          status={sectionStatuses[2].status}
          isOpen={activeSection === 2}
          onToggle={() => toggleSection(2)}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <ClinicalNumericInput
                label="PA Sistólica"
                value={form.vitalSigns.systolicBP}
                onChange={(val) => updateVitals({ systolicBP: val })}
                unit="mmHg"
                placeholder="120"
                min={30}
                max={300}
              />
              <ClinicalNumericInput
                label="PA Diastólica"
                value={form.vitalSigns.diastolicBP}
                onChange={(val) => updateVitals({ diastolicBP: val })}
                unit="mmHg"
                placeholder="80"
                min={20}
                max={200}
              />
              <ClinicalNumericInput
                label="PAM"
                value={form.vitalSigns.meanArterialPressure}
                onChange={(val) => updateVitals({ meanArterialPressure: val })}
                unit="mmHg"
                placeholder="93"
                min={20}
                max={250}
              />
              <ClinicalNumericInput
                label="Frequência Cardíaca"
                value={form.vitalSigns.heartRate}
                onChange={(val) => updateVitals({ heartRate: val })}
                unit="bpm"
                placeholder="78"
                min={20}
                max={280}
              />
              <ClinicalNumericInput
                label="Frequência Resp."
                value={form.vitalSigns.respiratoryRate}
                onChange={(val) => updateVitals({ respiratoryRate: val })}
                unit="irpm"
                placeholder="16"
                min={4}
                max={70}
              />
              <ClinicalNumericInput
                label="Saturação O₂"
                value={form.vitalSigns.oxygenSaturation}
                onChange={(val) => updateVitals({ oxygenSaturation: val })}
                unit="%"
                placeholder="98"
                min={40}
                max={100}
              />
              <ClinicalNumericInput
                label="Temperatura"
                value={form.vitalSigns.temperature}
                onChange={(val) => updateVitals({ temperature: val })}
                unit="°C"
                placeholder="36.5"
                mode="decimal"
                step="0.1"
                min={30}
                max={44}
              />
            </div>

            {/* Pain Assessment */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Avaliação da Dor (5º Sinal Vital)
              </span>

              <ClinicalOptionGroup
                label="Método de Avaliação"
                options={[
                  'Escala numérica 0–10',
                  'Outra escala',
                  'Não avaliável',
                  'Não avaliada',
                  'Não informado',
                ]}
                value={form.pain.assessmentType}
                onChange={(val) => updatePain({ assessmentType: val as any })}
                columns={3}
              />

              {form.pain.assessmentType === 'Escala numérica 0–10' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Intensidade da Dor (0 = Sem dor, 10 = Pior dor imaginável)
                    </span>
                    <span className="text-sm font-black text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {form.pain.numericScaleValue !== undefined
                        ? `${form.pain.numericScaleValue}/10`
                        : 'Selecione'}
                    </span>
                  </div>
                  <div className="grid grid-cols-11 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updatePain({ numericScaleValue: num })}
                        className={`min-h-[44px] rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                          form.pain.numericScaleValue === num
                            ? num > 6
                              ? 'bg-rose-600 text-white shadow-xs'
                              : num > 3
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-teal-800 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.pain.assessmentType === 'Outra escala' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Nome da escala"
                    value={form.pain.otherScaleName}
                    onChange={(val) => updatePain({ otherScaleName: val })}
                    placeholder="Ex: BPS, CPOT, Escala de Faces..."
                  />
                  <ClinicalTextInput
                    label="Resultado obtido"
                    value={form.pain.otherScaleResult}
                    onChange={(val) => updatePain({ otherScaleResult: val })}
                    placeholder="Ex: 4/12, Moderada..."
                  />
                </div>
              )}

              {['Escala numérica 0–10', 'Outra escala'].includes(
                form.pain.assessmentType
              ) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <ClinicalTextInput
                    label="Localização da dor"
                    value={form.pain.location}
                    onChange={(val) => updatePain({ location: val })}
                    placeholder="Ex: Precordial com irradiação para MSE..."
                  />
                  <ClinicalTextInput
                    label="Características da dor"
                    value={form.pain.characteristics}
                    onChange={(val) => updatePain({ characteristics: val })}
                    placeholder="Ex: Queimação, pontada, contínua..."
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 4. Neurológico */}
        <ClinicalSection
          id="section-3"
          number={4}
          title="Neurológico"
          subtitle="Consciência, orientação, Glasgow, RASS, pupilas e déficits focais"
          status={sectionStatuses[3].status}
          isOpen={activeSection === 3}
          onToggle={() => toggleSection(3)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Nível de Consciência"
                options={[
                  'Consciente',
                  'Sonolento',
                  'Torporoso',
                  'Comatoso',
                  'Sedado',
                  'Outro',
                  'Não avaliado',
                ]}
                value={form.neurological.consciousnessLevel}
                onChange={(val) => updateNeurological({ consciousnessLevel: val as any })}
              />

              <ClinicalOptionGroup
                label="Orientação Têmporo-Espacial"
                options={[
                  'Orientado em tempo e espaço',
                  'Parcialmente orientado',
                  'Desorientado',
                  'Não avaliável',
                  'Não avaliado',
                ]}
                value={form.neurological.orientation}
                onChange={(val) => updateNeurological({ orientation: val as any })}
              />
            </div>

            {/* Glasgow Scale Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Escala de Coma de Glasgow (3 a 15)
                </span>
                {form.neurological.glasgowScore !== undefined && (
                  <span className="text-xs font-black text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    ECG {form.neurological.glasgowScore}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateNeurological({ glasgowType: 'not_applied', glasgowScore: undefined })
                  }
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${
                    form.neurological.glasgowType === 'not_applied'
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Não aplicada
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateNeurological({ glasgowType: 'not_assessed', glasgowScore: undefined })
                  }
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${
                    form.neurological.glasgowType === 'not_assessed'
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Não avaliada
                </button>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-13 gap-1 pt-1">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      updateNeurological({ glasgowType: 'score', glasgowScore: val })
                    }
                    className={`min-h-[40px] rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      form.neurological.glasgowScore === val
                        ? val <= 8
                          ? 'bg-rose-600 text-white shadow-xs'
                          : val <= 12
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* RASS Scale Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Escala de Agitação e Sedação de Richmond (RASS: -5 a +4)
                </span>
                {form.neurological.rassScore !== undefined && (
                  <span className="text-xs font-black text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    RASS {form.neurological.rassScore > 0 ? `+${form.neurological.rassScore}` : form.neurological.rassScore}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      updateNeurological({
                        rassType: 'score',
                        rassScore: form.neurological.rassScore === val ? undefined : val,
                      })
                    }
                    className={`min-h-[40px] rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      form.neurological.rassScore === val
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Pupilas"
                options={[
                  'Isocóricas',
                  'Anisocóricas',
                  'Mióticas',
                  'Midriáticas',
                  'Outra alteração',
                  'Não avaliadas',
                ]}
                value={form.neurological.pupils}
                onChange={(val) => updateNeurological({ pupils: val as any })}
              />

              <ClinicalOptionGroup
                label="Fotorreatividade"
                options={[
                  'Fotorreagentes',
                  'Fotorreatividade lentificada',
                  'Não reagentes',
                  'Outra',
                  'Não avaliada',
                ]}
                value={form.neurological.photoreaction}
                onChange={(val) => updateNeurological({ photoreaction: val as any })}
              />
            </div>

            <div className="space-y-2">
              <ClinicalOptionGroup
                label="Déficit ou Alteração Neurológica Focal"
                options={['Não', 'Sim', 'Não avaliado']}
                value={form.neurological.identifiedNeurologicalAlteration}
                onChange={(val) =>
                  updateNeurological({ identifiedNeurologicalAlteration: val as any })
                }
              />
              {form.neurological.identifiedNeurologicalAlteration === 'Sim' && (
                <ClinicalTextInput
                  label="Descrever déficit/alteração"
                  value={form.neurological.neurologicalAlterationDetails}
                  onChange={(val) =>
                    updateNeurological({ neurologicalAlterationDetails: val })
                  }
                  placeholder="Ex: Hemiparesia à direita, afasia motora, desvio de rima..."
                />
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 5. Respiratório */}
        <ClinicalSection
          id="section-4"
          number={5}
          title="Respiratório"
          subtitle="Suporte de oxigênio, VNI/VMI, padrão respiratório, secreções e ausculta"
          status={sectionStatuses[4].status}
          isOpen={activeSection === 4}
          onToggle={() => toggleSection(4)}
        >
          <div className="space-y-5">
            <ClinicalOptionGroup
              label="Suporte Respiratório"
              options={[
                'Ar ambiente',
                'Oxigenoterapia',
                'Ventilação não invasiva',
                'Ventilação mecânica invasiva',
                'Outro',
                'Não informado',
              ]}
              value={form.respiratory.respiratorySupport}
              onChange={(val) => updateRespiratory({ respiratorySupport: val as any })}
              columns={3}
            />

            {/* Oxigenoterapia conditional */}
            {form.respiratory.respiratorySupport === 'Oxigenoterapia' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Parâmetros da Oxigenoterapia
                </span>
                <ClinicalOptionGroup
                  label="Dispositivo de Oxigênio"
                  required
                  options={[
                    'Cateter nasal',
                    'Máscara simples',
                    'Máscara de Venturi',
                    'Máscara com reservatório',
                    'Cateter nasal de alto fluxo',
                    'Outro',
                  ]}
                  value={form.respiratory.oxygenDevice || ''}
                  onChange={(val) => updateRespiratory({ oxygenDevice: val as any })}
                  columns={3}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalNumericInput
                    label="Fluxo de O₂"
                    required
                    value={form.respiratory.oxygenFlowRate}
                    onChange={(val) => updateRespiratory({ oxygenFlowRate: val })}
                    unit="L/min"
                    placeholder="Ex: 3"
                  />
                  <ClinicalNumericInput
                    label="FiO₂ estimada"
                    sublabel="Opcional"
                    value={form.respiratory.oxygenFiO2}
                    onChange={(val) => updateRespiratory({ oxygenFiO2: val })}
                    unit="%"
                    placeholder="Ex: 32"
                  />
                </div>
              </div>
            )}

            {/* VNI conditional */}
            {form.respiratory.respiratorySupport === 'Ventilação não invasiva' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Parâmetros da VNI
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <ClinicalTextInput
                    label="Interface"
                    value={form.respiratory.vniInterface}
                    onChange={(val) => updateRespiratory({ vniInterface: val })}
                    placeholder="Ex: Máscara Facial Total, Orofacial"
                  />
                  <ClinicalNumericInput
                    label="IPAP / Pinsp"
                    value={form.respiratory.vniIpapPinsp}
                    onChange={(val) => updateRespiratory({ vniIpapPinsp: val })}
                    unit="cmH₂O"
                    placeholder="12"
                  />
                  <ClinicalNumericInput
                    label="EPAP / PEEP"
                    value={form.respiratory.vniPeepEpap}
                    onChange={(val) => updateRespiratory({ vniPeepEpap: val })}
                    unit="cmH₂O"
                    placeholder="6"
                  />
                  <ClinicalNumericInput
                    label="FiO₂"
                    value={form.respiratory.vniFiO2}
                    onChange={(val) => updateRespiratory({ vniFiO2: val })}
                    unit="%"
                    placeholder="40"
                  />
                </div>
              </div>
            )}

            {/* VMI conditional */}
            {form.respiratory.respiratorySupport === 'Ventilação mecânica invasiva' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Parâmetros da Ventilação Mecânica Invasiva (VMI)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ClinicalOptionGroup
                    label="Via Aérea Artificial"
                    options={['TOT', 'Traqueostomia', 'Outro']}
                    value={form.respiratory.vmiAirway || ''}
                    onChange={(val) => updateRespiratory({ vmiAirway: val as any })}
                  />
                  <ClinicalTextInput
                    label="Calibre e Fixação (cm na rima)"
                    value={form.respiratory.vmiCaliber}
                    onChange={(val) => updateRespiratory({ vmiCaliber: val })}
                    placeholder="Ex: TOT 7.5 fixado em 22cm"
                  />
                  <ClinicalTextInput
                    label="Modo Ventilatório"
                    value={form.respiratory.vmiVentilatoryMode}
                    onChange={(val) => updateRespiratory({ vmiVentilatoryMode: val })}
                    placeholder="Ex: PCV, VCV, PSV"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ClinicalNumericInput
                    label="PEEP"
                    value={form.respiratory.vmiPeep}
                    onChange={(val) => updateRespiratory({ vmiPeep: val })}
                    unit="cmH₂O"
                    placeholder="8"
                  />
                  <ClinicalNumericInput
                    label="FiO₂"
                    value={form.respiratory.vmiFiO2}
                    onChange={(val) => updateRespiratory({ vmiFiO2: val })}
                    unit="%"
                    placeholder="50"
                  />
                  <ClinicalNumericInput
                    label="FR Programada"
                    value={form.respiratory.vmiProgrammedRR}
                    onChange={(val) => updateRespiratory({ vmiProgrammedRR: val })}
                    unit="irpm"
                    placeholder="16"
                  />
                  <ClinicalNumericInput
                    label="Volume Corrente / PS"
                    value={form.respiratory.vmiTidalVolume}
                    onChange={(val) => updateRespiratory({ vmiTidalVolume: val })}
                    unit="mL"
                    placeholder="420"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ClinicalOptionGroup
                label="Padrão Respiratório"
                options={['Eupneico', 'Taquipneico', 'Bradipneico', 'Outro', 'Não avaliado']}
                value={form.respiratory.respiratoryPattern}
                onChange={(val) => updateRespiratory({ respiratoryPattern: val as any })}
              />

              <ClinicalOptionGroup
                label="Desconforto Respiratório"
                options={['Ausente', 'Presente', 'Não avaliado']}
                value={form.respiratory.respiratoryDistress}
                onChange={(val) => updateRespiratory({ respiratoryDistress: val as any })}
              />

              <ClinicalOptionGroup
                label="Uso de Musculatura Acessória"
                options={['Ausente', 'Presente', 'Não avaliado']}
                value={form.respiratory.accessoryMuscles}
                onChange={(val) => updateRespiratory({ accessoryMuscles: val as any })}
              />
            </div>

            <div className="space-y-3">
              <ClinicalOptionGroup
                label="Presença de Secreção em Vias Aéreas"
                options={['Ausente', 'Presente', 'Não avaliada']}
                value={form.respiratory.secretion}
                onChange={(val) => updateRespiratory({ secretion: val as any })}
              />
              {form.respiratory.secretion === 'Presente' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <ClinicalTextInput
                    label="Quantidade"
                    value={form.respiratory.secretionQuantity}
                    onChange={(val) => updateRespiratory({ secretionQuantity: val })}
                    placeholder="Ex: Discreta, Moderada, Abundante"
                  />
                  <ClinicalTextInput
                    label="Aspecto / Coloração"
                    value={form.respiratory.secretionColor}
                    onChange={(val) => updateRespiratory({ secretionColor: val })}
                    placeholder="Ex: Hialina, Amarelada, Esverdeada, Hemática"
                  />
                  <ClinicalTextInput
                    label="Consistência"
                    value={form.respiratory.secretionConsistency}
                    onChange={(val) => updateRespiratory({ secretionConsistency: val })}
                    placeholder="Ex: Fluida, Espessa"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <ClinicalOptionGroup
                label="Murmúrio Vesicular"
                options={[
                  'Presente bilateralmente',
                  'Diminuído',
                  'Ausente em região específica',
                  'Outra alteração',
                  'Não avaliado',
                ]}
                value={form.respiratory.breathSounds}
                onChange={(val) => updateRespiratory({ breathSounds: val as any })}
              />

              <ClinicalMultiSelect
                label="Ruídos Adventícios"
                options={[
                  'Ausentes',
                  'Roncos',
                  'Sibilos',
                  'Estertores creptantes',
                  'Estertores bolhosos',
                  'Estridor',
                  'Outro',
                  'Não avaliado',
                ]}
                selectedValues={form.respiratory.adventitiousSounds}
                onChange={(vals) => updateRespiratory({ adventitiousSounds: vals })}
                exclusiveValue="Ausentes"
                columns={4}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 6. Cardiovascular e hemodinâmico */}
        <ClinicalSection
          id="section-5"
          number={6}
          title="Cardiovascular e Hemodinâmico"
          subtitle="Condição hemodinâmica, perfusão periférica, extremidades, TEC e edemas"
          status={sectionStatuses[5].status}
          isOpen={activeSection === 5}
          onToggle={() => toggleSection(5)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ClinicalOptionGroup
                label="Condição Hemodinâmica"
                options={['Estável', 'Instável', 'Não avaliada', 'Não informado']}
                value={form.cardiovascular.hemodynamicCondition}
                onChange={(val) => updateCardiovascular({ hemodynamicCondition: val as any })}
              />
              <ClinicalOptionGroup
                label="Perfusão Periférica"
                options={['Adequada', 'Reduzida', 'Não avaliada']}
                value={form.cardiovascular.peripheralPerfusion}
                onChange={(val) => updateCardiovascular({ peripheralPerfusion: val as any })}
              />
              <ClinicalOptionGroup
                label="Temperatura das Extremidades"
                options={['Quentes', 'Frias', 'Outra', 'Não avaliadas']}
                value={form.cardiovascular.extremities}
                onChange={(val) => updateCardiovascular({ extremities: val as any })}
              />
            </div>

            <ClinicalOptionGroup
              label="Tempo de Enchimento Capilar (TEC)"
              options={[
                'Menor que 3 segundos',
                'Maior ou igual a 3 segundos',
                'Informar valor',
                'Não avaliado',
              ]}
              value={form.cardiovascular.capillaryRefillTime}
              onChange={(val) => updateCardiovascular({ capillaryRefillTime: val as any })}
            />

            {form.cardiovascular.capillaryRefillTime === 'Informar valor' && (
              <ClinicalNumericInput
                label="Valor do TEC"
                value={form.cardiovascular.capillaryRefillTimeValue}
                onChange={(val) => updateCardiovascular({ capillaryRefillTimeValue: val })}
                unit="segundos"
                placeholder="Ex: 4"
              />
            )}

            <div className="space-y-3">
              <ClinicalOptionGroup
                label="Presença de Edema"
                options={['Ausente', 'Presente', 'Não avaliado']}
                value={form.cardiovascular.edema}
                onChange={(val) => {
                  if (val === 'Ausente') {
                    updateCardiovascular({
                      edema: val as any,
                      edemaLocations: [],
                      edemaIntensity: '',
                    });
                  } else {
                    updateCardiovascular({ edema: val as any });
                  }
                }}
              />

              {form.cardiovascular.edema === 'Presente' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <ClinicalMultiSelect
                    label="Localização do Edema"
                    options={[
                      'MMII (Membros inferiores)',
                      'MMSS (Membros superiores)',
                      'Sacral / Região lombar',
                      'Facial / Periorbital',
                      'Anasarca',
                      'Outro',
                    ]}
                    selectedValues={form.cardiovascular.edemaLocations}
                    onChange={(vals) => updateCardiovascular({ edemaLocations: vals })}
                    columns={3}
                  />

                  <ClinicalOptionGroup
                    label="Intensidade / Cacifo"
                    options={['1+/4+', '2+/4+', '3+/4+', '4+/4+', 'Não graduado']}
                    value={form.cardiovascular.edemaIntensity || ''}
                    onChange={(val) => updateCardiovascular({ edemaIntensity: val as any })}
                    columns={5}
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 7. Drogas vasoativas, sedação e analgesia */}
        <ClinicalSection
          id="section-6"
          number={7}
          title="Drogas Vasoativas, Sedação e Analgesia"
          subtitle="Noradrenalina, Dobutamina, Fentanil, Midazolam, doses e vazões"
          status={sectionStatuses[6].status}
          isOpen={activeSection === 6}
          onToggle={() => toggleSection(6)}
        >
          <div className="space-y-6">
            {/* Vasoactive Drugs */}
            <div className="space-y-3">
              <ClinicalOptionGroup
                label="Uso de Drogas Vasoativas (DVA)"
                options={['Não', 'Sim', 'Não informado']}
                value={form.vasoactiveDrugs.inUse}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    vasoactiveDrugs: {
                      ...prev.vasoactiveDrugs,
                      inUse: val as any,
                      drugsList: val === 'Não' ? [] : prev.vasoactiveDrugs.drugsList,
                    },
                  }))
                }
              />

              {form.vasoactiveDrugs.inUse === 'Sim' && (
                <VasoactiveDrugCard
                  drugs={form.vasoactiveDrugs.drugsList}
                  onChange={(drugs) =>
                    setForm((prev) => ({
                      ...prev,
                      vasoactiveDrugs: { ...prev.vasoactiveDrugs, drugsList: drugs },
                    }))
                  }
                />
              )}
            </div>

            {/* Sedation & Analgesia */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <ClinicalOptionGroup
                label="Uso de Sedação e/ou Analgesia Contínua / Frequente"
                options={['Não', 'Sim', 'Não informado']}
                value={form.sedationAnalgesia.inUse}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    sedationAnalgesia: {
                      ...prev.sedationAnalgesia,
                      inUse: val as any,
                      medicationsList:
                        val === 'Não' ? [] : prev.sedationAnalgesia.medicationsList,
                    },
                  }))
                }
              />

              {form.sedationAnalgesia.inUse === 'Sim' && (
                <SedationAnalgesiaCard
                  medications={form.sedationAnalgesia.medicationsList}
                  onChange={(meds) =>
                    setForm((prev) => ({
                      ...prev,
                      sedationAnalgesia: {
                        ...prev.sedationAnalgesia,
                        medicationsList: meds,
                      },
                    }))
                  }
                />
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 8. Gastrointestinal e nutrição */}
        <ClinicalSection
          id="section-7"
          number={8}
          title="Gastrointestinal e Nutrição"
          subtitle="Formato abdominal, consistência, dor à palpação, RHA, dieta e náuseas"
          status={sectionStatuses[7].status}
          isOpen={activeSection === 7}
          onToggle={() => toggleSection(7)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Formato do Abdome"
                options={['Plano', 'Globoso', 'Distendido', 'Ascítico', 'Outro', 'Não avaliado']}
                value={form.gastrointestinal.abdominalShape}
                onChange={(val) => updateGastro({ abdominalShape: val as any })}
              />

              <ClinicalOptionGroup
                label="Consistência Abdominal"
                options={['Flácido', 'Tenso', 'Outro', 'Não avaliado']}
                value={form.gastrointestinal.consistency}
                onChange={(val) => updateGastro({ consistency: val as any })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ClinicalOptionGroup
                  label="Palpação Abdominal"
                  options={['Indolor', 'Doloroso', 'Não realizada']}
                  value={form.gastrointestinal.palpation}
                  onChange={(val) => updateGastro({ palpation: val as any })}
                />
                {form.gastrointestinal.palpation === 'Doloroso' && (
                  <ClinicalTextInput
                    label="Localização da dor à palpação"
                    value={form.gastrointestinal.palpationLocation}
                    onChange={(val) => updateGastro({ palpationLocation: val })}
                    placeholder="Ex: Epigástrio, Fossa Ilíaca Direita, Difusa..."
                  />
                )}
              </div>

              <ClinicalOptionGroup
                label="Ruídos Hidroaéreos (RHA)"
                options={[
                  'Presentes/normoativos',
                  'Hipoativos',
                  'Hiperativos',
                  'Ausentes',
                  'Não avaliados',
                ]}
                value={form.gastrointestinal.bowelSounds}
                onChange={(val) => updateGastro({ bowelSounds: val as any })}
              />
            </div>

            {/* Nutrição */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Suporte Nutricional
              </span>

              <ClinicalOptionGroup
                label="Via e Condição Nutricional"
                options={[
                  'Dieta por via oral',
                  'Dieta enteral',
                  'Jejum',
                  'Dieta parenteral',
                  'Outra',
                  'Não informado',
                ]}
                value={form.nutrition.status}
                onChange={(val) => updateNutrition({ status: val as any })}
                columns={3}
              />

              {form.nutrition.status === 'Dieta por via oral' && (
                <ClinicalOptionGroup
                  label="Aceitação da Dieta Oral"
                  options={['Boa', 'Moderada', 'Baixa', 'Recusou', 'Não avaliada']}
                  value={form.nutrition.oralAcceptance || ''}
                  onChange={(val) => updateNutrition({ oralAcceptance: val as any })}
                  columns={5}
                />
              )}

              {form.nutrition.status === 'Dieta enteral' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ClinicalOptionGroup
                    label="Dispositivo"
                    options={['SNE', 'SNG', 'GTT', 'Outro']}
                    value={form.nutrition.enteralDevice || ''}
                    onChange={(val) => updateNutrition({ enteralDevice: val as any })}
                  />
                  <ClinicalNumericInput
                    label="Vazão"
                    value={form.nutrition.enteralRate}
                    onChange={(val) => updateNutrition({ enteralRate: val })}
                    unit="mL/h"
                    placeholder="Ex: 50"
                  />
                  <ClinicalOptionGroup
                    label="Tolerância"
                    options={['Boa', 'Alterada', 'Não avaliada']}
                    value={form.nutrition.enteralTolerance || ''}
                    onChange={(val) => updateNutrition({ enteralTolerance: val as any })}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <ClinicalOptionGroup
                  label="Presença de Náuseas"
                  options={['Ausentes', 'Presentes', 'Não avaliadas']}
                  value={form.nutrition.nausea}
                  onChange={(val) => updateNutrition({ nausea: val as any })}
                />
                <div className="space-y-2">
                  <ClinicalOptionGroup
                    label="Episódios de Vômitos"
                    options={['Ausentes', 'Presentes', 'Não avaliados']}
                    value={form.nutrition.vomiting}
                    onChange={(val) => updateNutrition({ vomiting: val as any })}
                  />
                  {form.nutrition.vomiting === 'Presentes' && (
                    <ClinicalTextInput
                      label="Aspecto e frequência do vômito"
                      value={form.nutrition.vomitingDetails}
                      onChange={(val) => updateNutrition({ vomitingDetails: val })}
                      placeholder="Ex: 1 episódio de vômito alimentar..."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </ClinicalSection>

        {/* 9. Eliminações intestinais */}
        <ClinicalSection
          id="section-8"
          number={9}
          title="Eliminações Intestinais"
          subtitle="Evacuações, aspecto das fezes e ostomias de eliminação"
          status={sectionStatuses[8].status}
          isOpen={activeSection === 8}
          onToggle={() => toggleSection(8)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Evacuação no Período"
              options={['Presente', 'Ausente', 'Não avaliada', 'Não informado']}
              value={form.bowelElimination.bowelMovement}
              onChange={(val) => updateBowel({ bowelMovement: val as any })}
              columns={4}
            />

            {form.bowelElimination.bowelMovement === 'Presente' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <ClinicalOptionGroup
                  label="Aspecto das Fezes"
                  options={[
                    'Formada',
                    'Pastosa',
                    'Líquida',
                    'Diarreica',
                    'Outro',
                    'Não avaliado',
                  ]}
                  value={form.bowelElimination.aspect || ''}
                  onChange={(val) => updateBowel({ aspect: val as any })}
                  columns={3}
                />
                <ClinicalTextInput
                  label="Frequência / Quantidade estimada"
                  value={form.bowelElimination.frequencyOrQuantity}
                  onChange={(val) => updateBowel({ frequencyOrQuantity: val })}
                  placeholder="Ex: 2 episódios no plantão, quantidade moderada"
                />
              </div>
            )}

            <div className="space-y-3">
              <ClinicalOptionGroup
                label="Presença de Ostomia Intestinal (Colostomia / Ileostomia)"
                options={['Não', 'Sim', 'Não avaliada']}
                value={form.bowelElimination.ostomy}
                onChange={(val) => updateBowel({ ostomy: val as any })}
              />

              {form.bowelElimination.ostomy === 'Sim' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Tipo de Ostomia"
                    value={form.bowelElimination.ostomyType}
                    onChange={(val) => updateBowel({ ostomyType: val })}
                    placeholder="Ex: Colostomia em FIE"
                  />
                  <ClinicalTextInput
                    label="Aspecto do Efluente e Estoma"
                    value={form.bowelElimination.ostomyStomaCondition}
                    onChange={(val) => updateBowel({ ostomyStomaCondition: val })}
                    placeholder="Ex: Estoma róseo e protruso, efluente semipastoso"
                  />
                </div>
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 10. Sistema urinário */}
        <ClinicalSection
          id="section-9"
          number={10}
          title="Sistema Urinário"
          subtitle="Diurese, via de eliminação espontânea ou por SVD/cistostomia e débito"
          status={sectionStatuses[9].status}
          isOpen={activeSection === 9}
          onToggle={() => toggleSection(9)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Condição da Diurese"
                options={['Presente', 'Oligúrica', 'Anúrica', 'Não avaliada', 'Não informado']}
                value={form.urinary.diuresis}
                onChange={(val) => updateUrinary({ diuresis: val as any })}
              />

              <ClinicalOptionGroup
                label="Via de Eliminação Urinária"
                options={['Espontânea', 'SVD', 'Outro dispositivo', 'Não informado']}
                value={form.urinary.eliminationRoute}
                onChange={(val) => updateUrinary({ eliminationRoute: val as any })}
              />
            </div>

            {form.urinary.eliminationRoute === 'Espontânea' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ClinicalTextInput
                  label="Coloração"
                  value={form.urinary.spontaneousColor}
                  onChange={(val) => updateUrinary({ spontaneousColor: val })}
                  placeholder="Ex: Amarelo citrino, âmbar, colúria"
                />
                <ClinicalTextInput
                  label="Aspecto"
                  value={form.urinary.spontaneousAspect}
                  onChange={(val) => updateUrinary({ spontaneousAspect: val })}
                  placeholder="Ex: Límpido, turvo, com grumos"
                />
                <ClinicalTextInput
                  label="Volume / Frequência"
                  value={form.urinary.spontaneousVolume}
                  onChange={(val) => updateUrinary({ spontaneousVolume: val })}
                  placeholder="Ex: Diurese espontânea presente no período"
                />
              </div>
            )}

            {form.urinary.eliminationRoute === 'SVD' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Avaliação da Sonda Vesical de Demora (SVD)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ClinicalTextInput
                    label="Calibre da Sonda"
                    value={form.urinary.svdCaliber}
                    onChange={(val) => updateUrinary({ svdCaliber: val })}
                    placeholder="Ex: Folley nº 16 Fr"
                  />
                  <ClinicalOptionGroup
                    label="Perviedade / Drenagem"
                    options={['Sim', 'Não', 'Não avaliada']}
                    value={form.urinary.svdPatent || ''}
                    onChange={(val) => updateUrinary({ svdPatent: val as any })}
                  />
                  <ClinicalNumericInput
                    label="Débito Urinário Coletado"
                    value={form.urinary.svdOutputVolume}
                    onChange={(val) => updateUrinary({ svdOutputVolume: val })}
                    unit="mL"
                    placeholder="Ex: 450"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Coloração da urina"
                    value={form.urinary.svdColor}
                    onChange={(val) => updateUrinary({ svdColor: val })}
                    placeholder="Ex: Amarelo claro, hematúrica..."
                  />
                  <ClinicalTextInput
                    label="Aspecto / Observações"
                    value={form.urinary.svdAspect}
                    onChange={(val) => updateUrinary({ svdAspect: val })}
                    placeholder="Ex: Drenando livremente em sistema fechado..."
                  />
                </div>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 11. Dispositivos */}
        <ClinicalSection
          id="section-10"
          number={11}
          title="Dispositivos Invasivos"
          subtitle="AVP, CVC, PAI, CDL, PICC, localização anatômica e integridade dos curativos"
          status={sectionStatuses[10].status}
          isOpen={activeSection === 10}
          onToggle={() => toggleSection(10)}
        >
          <div className="space-y-4">
            <DeviceFormCard
              devices={form.devices.list}
              onChange={(devs) =>
                setForm((prev) => ({ ...prev, devices: { list: devs } }))
              }
            />
          </div>
        </ClinicalSection>

        {/* 12. Pele e integridade cutânea */}
        <ClinicalSection
          id="section-11"
          number={12}
          title="Pele e Integridade Cutânea"
          subtitle="Integridade, hidratação, lesões por pressão, feridas cirúrgicas e curativos"
          status={sectionStatuses[11].status}
          isOpen={activeSection === 11}
          onToggle={() => toggleSection(11)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Integridade da Pele"
                options={['Íntegra', 'Com alteração/lesão', 'Não avaliada']}
                value={form.skin.integrity}
                onChange={(val) => updateSkin({ integrity: val as any })}
              />

              <ClinicalOptionGroup
                label="Hidratação / Turgor"
                options={['Hidratada', 'Ressecada', 'Outra', 'Não avaliada']}
                value={form.skin.hydration}
                onChange={(val) => updateSkin({ hydration: val as any })}
              />
            </div>

            {form.skin.integrity === 'Com alteração/lesão' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Descrição da Lesão / Alteração Cutânea
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Localização Anatômica"
                    required
                    value={form.skin.lesionLocation}
                    onChange={(val) => updateSkin({ lesionLocation: val })}
                    placeholder="Ex: Região sacral, Calcâneo D, Incisão cirúrgica..."
                  />
                  <ClinicalOptionGroup
                    label="Presença de Curativo"
                    options={['Sim', 'Não', 'Não informado']}
                    value={form.skin.lesionDressingPresent || ''}
                    onChange={(val) => updateSkin({ lesionDressingPresent: val as any })}
                  />
                </div>
                <ClinicalTextarea
                  label="Descrição da Lesão e Cuidados Realizados"
                  value={form.skin.lesionDescription}
                  onChange={(val) => updateSkin({ lesionDescription: val })}
                  placeholder="Ex: LPP estágio 2 de 2x3cm com leito de tecido de granulação, realizada limpeza com SF 0,9% e cobertura com hidrocoloide..."
                  rows={2}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 13. Cuidados realizados */}
        <ClinicalSection
          id="section-12"
          number={13}
          title="Cuidados Realizados"
          subtitle="Procedimentos de enfermagem executados no período e tipo de banho"
          status={sectionStatuses[12].status}
          isOpen={activeSection === 12}
          onToggle={() => toggleSection(12)}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Ações e Cuidados de Enfermagem Prestados"
              options={[
                'Mudança de decúbito de 2/2h',
                'Cabeceira elevada a 30°-45°',
                'Curativo realizado',
                'Aspiração de vias aéreas',
                'Administração de medicamentos conforme prescrição médica',
                'Coleta de exames laboratoriais',
                'Instalação/troca de soroterapia',
                'Controle rigoroso de balanço hídrico',
                'Manutenção de grades de proteção elevadas',
                'Instalação de oxigenoterapia',
                'Sondagem vesical de alívio/demora',
                'Sondagem nasoenteral/nasogástrica',
                'Outro cuidado',
              ]}
              selectedValues={form.nursingCare.careItems}
              onChange={(vals) => updateNursingCare({ careItems: vals })}
              columns={3}
            />

            {form.nursingCare.careItems.includes('Outro cuidado') && (
              <ClinicalTextInput
                label="Descrever outro cuidado"
                value={form.nursingCare.otherCareDescription}
                onChange={(val) => updateNursingCare({ otherCareDescription: val })}
                placeholder="Ex: Realizado curativo compressivo em MSE..."
              />
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Higiene Corporal / Banho
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ClinicalOptionGroup
                  label="Tipo de Banho Realizado"
                  options={[
                    'Não realizado',
                    'Banho no leito',
                    'Banho de aspersão',
                    'Banho de aspersão com auxílio',
                    'Banho independente',
                    'Outro',
                    'Não informado',
                  ]}
                  value={form.bath.bathType}
                  onChange={(val) => updateBath({ bathType: val as any })}
                />
                <ClinicalOptionGroup
                  label="Tolerância ao Banho"
                  options={[
                    'Boa tolerância',
                    'Apresentou alteração/intercorrência',
                    'Não avaliada',
                    'Não informar',
                  ]}
                  value={form.bath.tolerance}
                  onChange={(val) => updateBath({ tolerance: val as any })}
                />
              </div>
            </div>
          </div>
        </ClinicalSection>

        {/* 14. Intercorrências */}
        <ClinicalSection
          id="section-13"
          number={14}
          title="Intercorrências no Plantão"
          subtitle="Registro de eventos agudos, condutas tomadas, resposta e comunicação à equipe"
          status={sectionStatuses[13].status}
          isOpen={activeSection === 13}
          onToggle={() => toggleSection(13)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Intercorrência no Período?"
              options={['Não', 'Sim', 'Não informado']}
              value={form.complications.hasComplication}
              onChange={(val) => updateComplications({ hasComplication: val as any })}
            />

            {form.complications.hasComplication === 'Sim' && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClinicalTextInput
                    label="Horário da Intercorrência"
                    value={form.complications.time}
                    onChange={(val) => updateComplications({ time: val })}
                    placeholder="Ex: 14h30"
                  />
                  <ClinicalTextInput
                    label="Descrição Sucinta do Evento"
                    value={form.complications.description}
                    onChange={(val) => updateComplications({ description: val })}
                    placeholder="Ex: Pico hipertensivo (PA 200x110 mmHg), queda da saturação para 85%..."
                  />
                </div>

                <ClinicalTextarea
                  label="Condutas de Enfermagem Tomadas"
                  required
                  value={form.complications.actionsTaken}
                  onChange={(val) => updateComplications({ actionsTaken: val })}
                  placeholder="Ex: Posicionado em Fowler a 45°, instalado O₂ a 4 L/min via cateter nasal, administrada medicação conforme prescrição médica..."
                  rows={2}
                />

                <ClinicalTextInput
                  label="Resposta do Paciente às Condutas"
                  value={form.complications.patientResponse}
                  onChange={(val) => updateComplications({ patientResponse: val })}
                  placeholder="Ex: Melhora do padrão respiratório com SpO₂ 96%, PA estabilizada em 140x80 mmHg"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/80">
                  <ClinicalOptionGroup
                    label="Comunicado à Equipe?"
                    options={['Não', 'Sim', 'Não informado']}
                    value={form.complications.communicatedToTeam}
                    onChange={(val) =>
                      updateComplications({ communicatedToTeam: val as any })
                    }
                  />

                  {form.complications.communicatedToTeam === 'Sim' && (
                    <>
                      <ClinicalOptionGroup
                        label="Quem foi comunicado"
                        required
                        options={[
                          'Equipe médica',
                          'Enfermeiro responsável',
                          'Outra equipe',
                          'Outro profissional',
                        ]}
                        value={form.complications.communicatedWho || ''}
                        onChange={(val) =>
                          updateComplications({ communicatedWho: val as any })
                        }
                      />
                      <ClinicalTextInput
                        label="Horário da comunicação"
                        value={form.complications.communicationTime}
                        onChange={(val) =>
                          updateComplications({ communicationTime: val })
                        }
                        placeholder="Ex: 14h35"
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 15. Alterações observadas em relação ao registro/período anterior */}
        <ClinicalSection
          id="section-14"
          number={15}
          title="Alterações Observadas em Relação ao Registro Anterior"
          subtitle="Comparativo observacional objetivo em relação ao período ou plantão anterior"
          status={sectionStatuses[14].status}
          isOpen={activeSection === 14}
          onToggle={() => toggleSection(14)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Alterações em Relação ao Registro/Período Anterior"
              options={[
                'Sem alteração observada',
                'Houve alteração observada',
                'Sem comparação disponível',
                'Não informado',
              ]}
              value={form.comparison.observationComparison || ''}
              onChange={(val) =>
                updateComparison({
                  observationComparison: val as any,
                  // Keep backwards compatibility
                  hasPreviousEvaluation:
                    val === 'Sem alteração observada' || val === 'Houve alteração observada'
                      ? 'Sim'
                      : val === 'Sem comparação disponível'
                      ? 'Não'
                      : (val as any),
                })
              }
              columns={2}
            />

            {form.comparison.observationComparison === 'Houve alteração observada' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <ClinicalTextarea
                  label="Descreva Objetivamente a Alteração Observada"
                  required
                  value={form.comparison.observedChangesDescription || ''}
                  onChange={(val) =>
                    updateComparison({
                      observedChangesDescription: val,
                      evidenceDescription: val,
                    })
                  }
                  placeholder="Ex: Apresentou aumento de secreção em vias aéreas necessitando aspiração; retirado cateter nasal de O2 após estabilização da SpO2 em 97%..."
                  rows={2}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 16. Situação final */}
        <ClinicalSection
          id="section-15"
          number={16}
          title="Situação Final do Paciente"
          subtitle="Desfecho do período (permanência no setor, transferência ou alta)"
          status={sectionStatuses[15].status}
          isOpen={activeSection === 15}
          onToggle={() => toggleSection(15)}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Condição / Desfecho Final"
              options={[
                'Permanece no setor sob cuidados',
                'Transferência realizada',
                'Transferência em andamento',
                'Alta do setor',
                'Outra situação',
                'Não informado',
              ]}
              value={form.finalStatus.condition}
              onChange={(val) => updateFinalStatus({ condition: val as any })}
              columns={3}
            />

            {form.finalStatus.condition === 'Outra situação' && (
              <ClinicalTextInput
                label="Especificar Situação"
                value={form.finalStatus.conditionCustom}
                onChange={(val) => updateFinalStatus({ conditionCustom: val })}
                placeholder="Ex: Encaminhado para centro cirúrgico, ecocardiograma..."
              />
            )}
          </div>
        </ClinicalSection>

        {/* 17. Informações adicionais */}
        <ClinicalSection
          id="section-16"
          number={17}
          title="Informações Adicionais"
          subtitle="Observações clínicas complementares relevantes para a passagem de plantão"
          status={sectionStatuses[16].status}
          isOpen={activeSection === 16}
          onToggle={() => toggleSection(16)}
        >
          <div className="space-y-3">
            <ClinicalTextarea
              label="Notas e Observações Complementares"
              sublabel="Opcional"
              value={form.additionalInformation}
              onChange={(val) => updateAdditionalInfo(val)}
              placeholder="Ex: Paciente aguarda resultado de tomografia de crânio. Equipe da CCIH ciente sobre isolamento."
              rows={3}
              privacyReminder
            />
          </div>
        </ClinicalSection>
      </div>

      {/* Bottom Floating Bar / Action Button */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center font-bold text-xs">
            {sectionStatuses.filter((s) => s.status === 'completed').length}/17
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Anotação em Andamento
            </div>
            <div className="text-[11px] text-slate-500">
              {alerts.length > 0
                ? `${alerts.length} ponto(s) de atenção detectado(s)`
                : 'Estrutura consistente'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-cyan-800 hover:bg-cyan-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Revisar Anotação</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
