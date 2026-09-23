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
  Baby,
  ShieldCheck,
} from 'lucide-react';
import {
  TechnicianPediatricNursingNoteForm,
  createInitialTechnicianPediatricNursingNoteForm,
  PEDIATRIC_CARE_ACTIONS,
  PediatricAgeGroup,
  PediatricAccompanimentPresence,
  PediatricAccompanimentRelationship,
  PediatricInformationSource,
  PediatricPainAssessmentMethod,
  PediatricCommunication,
  PediatricBehavior,
  PediatricBreastfeeding,
  PediatricMobility,
  PediatricGuardRails,
  PediatricHeadOfBed,
} from '../../../types/technicianPediatricNursingNote';
import { SectionStatus } from '../../../types/clinical';
import {
  validateTechnicianPediatricConsistency,
  normalizeTechnicianPediatricForm,
  buildPediatricAuthorizedFacts,
  buildTechnicianPediatricNursingNoteWithTrace,
  auditPediatricNarrative,
  PediatricConsistencyAlert,
} from '../../../engine/pediatricClinicalFactBuilder';
import { ClinicalSection } from '../ClinicalSection';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalMultiSelect } from '../ClinicalMultiSelect';
import { ClinicalTextInput, ClinicalTextarea } from '../ClinicalInputs';
import { VitalSignsInputs, VitalSignsData } from '../VitalSignsInputs';
import { DeviceFormCard } from '../DeviceFormCard';
import { ClinicalErrorBoundary } from '../../common/ClinicalErrorBoundary';

interface TechnicianPediatricFormScreenProps {
  onBack: () => void;
  patientAreaName?: string;
}

export const TechnicianPediatricFormScreen: React.FC<TechnicianPediatricFormScreenProps> = (props) => {
  return (
    <ClinicalErrorBoundary areaTitle="Anotação de Enfermagem — Pediatria" onNavigateHome={props.onBack}>
      <TechnicianPediatricFormScreenContent {...props} />
    </ClinicalErrorBoundary>
  );
};

const TechnicianPediatricFormScreenContent: React.FC<TechnicianPediatricFormScreenProps> = ({
  onBack,
  patientAreaName = 'Pediatria',
}) => {
  const [formData, setFormData] = useState<TechnicianPediatricNursingNoteForm>(
    createInitialTechnicianPediatricNursingNoteForm()
  );
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);
  const [consistencyAlerts, setConsistencyAlerts] = useState<PediatricConsistencyAlert[]>([]);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'sec-ped-context': true,
    'sec-ped-accompaniment': true,
    'sec-ped-characteristics': true,
    'sec-ped-vitals': true,
    'sec-ped-pain': true,
    'sec-ped-neuro': true,
    'sec-ped-resp': true,
    'sec-ped-cardio': true,
    'sec-ped-nut': true,
    'sec-ped-elim': true,
    'sec-ped-dev': true,
    'sec-ped-skin': true,
    'sec-ped-mob': true,
    'sec-ped-hyg': true,
    'sec-ped-care': true,
    'sec-ped-med': true,
    'sec-ped-comp': true,
    'sec-ped-comm': true,
    'sec-ped-final': true,
    'sec-ped-add': true,
  });

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Field change helpers
  const updateField = <K extends keyof TechnicianPediatricNursingNoteForm>(
    section: K,
    patch: Partial<TechnicianPediatricNursingNoteForm[K]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        ...patch,
      },
    }));
  };

  // Vital signs mapping
  const vitalSignsData: VitalSignsData = useMemo(() => {
    return {
      systolicBP: formData.vitalSigns.systolicBP || '',
      diastolicBP: formData.vitalSigns.diastolicBP || '',
      meanArterialPressure: formData.vitalSigns.meanArterialPressure || '',
      heartRate: formData.vitalSigns.heartRate || '',
      respiratoryRate: formData.vitalSigns.respiratoryRate || '',
      oxygenSaturation: formData.vitalSigns.oxygenSaturation || '',
      temperature: formData.vitalSigns.temperature || '',
      bloodGlucose: formData.vitalSigns.capillaryBloodGlucose || '',
    };
  }, [formData.vitalSigns]);

  const handleVitalsChange = (patch: Partial<VitalSignsData>) => {
    setFormData((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        ...patch,
        ...(patch.bloodGlucose !== undefined ? { capillaryBloodGlucose: patch.bloodGlucose } : {}),
      },
    }));
  };

  // Section completion status
  const sectionStatuses: Record<string, SectionStatus> = useMemo(() => {
    const isCompleted = (val: any) => Boolean(val && String(val).trim().length > 0);
    return {
      context: isCompleted(formData.context.moment) || isCompleted(formData.context.location) ? 'completed' : 'not_started',
      accompaniment: isCompleted(formData.accompaniment.present) ? 'completed' : 'not_started',
      characteristics: isCompleted(formData.generalCharacteristics.ageGroup) || isCompleted(formData.generalCharacteristics.weight) ? 'completed' : 'not_started',
      vitals: Object.values(formData.vitalSigns).some(isCompleted) ? 'completed' : 'not_started',
      pain: isCompleted(formData.pain.method) ? 'completed' : 'not_started',
      neuro: isCompleted(formData.neuroBehavior.communication) || formData.neuroBehavior.behavior.length > 0 ? 'completed' : 'not_started',
      respiratory: isCompleted(formData.respiratory.support) ? 'completed' : 'not_started',
      cardio: isCompleted(formData.cardiovascular.perfusion) ? 'completed' : 'not_started',
      nutrition: isCompleted(formData.nutrition.route) ? 'completed' : 'not_started',
      eliminations: isCompleted(formData.eliminations.urinary) || isCompleted(formData.eliminations.bowel) ? 'completed' : 'not_started',
      devices: formData.devices.length > 0 ? 'completed' : 'not_started',
      skin: isCompleted(formData.skin.integrity) ? 'completed' : 'not_started',
      mobility: isCompleted(formData.mobilitySafety.mobility) ? 'completed' : 'not_started',
      hygiene: isCompleted(formData.hygieneBath.hygiene) || isCompleted(formData.hygieneBath.bathPerformed) ? 'completed' : 'not_started',
      care: formData.care.actions.length > 0 ? 'completed' : 'not_started',
      medications: formData.medications.administered.length > 0 ? 'completed' : 'not_started',
      complications: isCompleted(formData.complications.hasComplication) ? 'completed' : 'not_started',
      communication: isCompleted(formData.communication.hasCommunication) ? 'completed' : 'not_started',
      finalStatus: isCompleted(formData.finalStatus.status) ? 'completed' : 'not_started',
      additional: isCompleted(formData.additionalInfo?.notes) ? 'completed' : 'not_started',
    };
  }, [formData]);

  const completedCount = Object.values(sectionStatuses).filter((s) => s === 'completed').length;
  const progressPercentage = Math.round((completedCount / 20) * 100);

  // Note generation handler
  const handleGenerateNote = () => {
    // 1. Consistency check
    const alerts = validateTechnicianPediatricConsistency(formData);
    setConsistencyAlerts(alerts);

    // 2. Normalize and build facts
    const normalized = normalizeTechnicianPediatricForm(formData);
    const facts = buildPediatricAuthorizedFacts(normalized);

    // 3. Build deterministic narrative
    const { text, traces } = buildTechnicianPediatricNursingNoteWithTrace(facts);

    // 4. Audit
    auditPediatricNarrative(traces, facts);

    setGeneratedNote(text);
    setCopied(false);

    // Scroll to preview
    setTimeout(() => {
      document.getElementById('pediatric-preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCopy = () => {
    if (!generatedNote) return;
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFormData(createInitialTechnicianPediatricNursingNoteForm());
    setGeneratedNote(null);
    setConsistencyAlerts([]);
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Baby className="w-3.5 h-3.5" />
                {patientAreaName}
              </span>
              <span className="text-xs text-slate-500 font-medium">Técnico em Enfermagem</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Anotação de Enfermagem Pediátrica
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
          <span>Seções preenchidas: {completedCount} de 20</span>
          <span className="font-semibold text-teal-700">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-4">
        {/* 1. Contexto */}
        <ClinicalSection
          id="sec-ped-context"
          title="1. Contexto do Registro"
          subtitle="Momento, localização física e fonte da informação"
          status={sectionStatuses.context}
          isOpen={openSections['sec-ped-context'] ?? true}
          onToggle={() => toggleSection('sec-ped-context')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Momento do Registro"
              options={['Recebo paciente', 'Avalio paciente', 'Plantão diurno', 'Plantão noturno', 'Outro']}
              value={formData.context.moment}
              onChange={(val) => updateField('context', { moment: val as any })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Localização"
                options={['Enfermaria', 'Leito', 'Box', 'Berçário', 'Observação', 'Outro']}
                value={formData.context.location}
                onChange={(val) => updateField('context', { location: val as any })}
              />
              <ClinicalOptionGroup
                label="Fonte Principal da Informação"
                options={[
                  'Paciente',
                  'Responsável/acompanhante',
                  'Equipe assistencial',
                  'Documento/encaminhamento',
                  'Outra',
                  'Não informado',
                ]}
                value={formData.context.infoSource}
                onChange={(val) => updateField('context', { infoSource: val as any })}
              />
            </div>
            {formData.context.location === 'Outro' && (
              <ClinicalTextInput
                label="Especifique a localização"
                value={formData.context.locationCustom || ''}
                onChange={(val) => updateField('context', { locationCustom: val })}
                placeholder="Ex: Leito 12B - Isolamento"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 2. Identificação e Acompanhante */}
        <ClinicalSection
          id="sec-ped-accompaniment"
          title="2. Identificação e Acompanhante"
          subtitle="Presença e relação com acompanhante (sem identificação nominal)"
          status={sectionStatuses.accompaniment}
          isOpen={openSections['sec-ped-accompaniment'] ?? true}
          onToggle={() => toggleSection('sec-ped-accompaniment')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Presença de Acompanhante / Responsável no Leito"
              options={['Sim', 'Não', 'Não informado']}
              value={formData.accompaniment.present}
              onChange={(val) => updateField('accompaniment', { present: val as any })}
            />
            {formData.accompaniment.present === 'Sim' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <ClinicalOptionGroup
                  label="Relação / Vínculo com o Paciente"
                  options={['Mãe', 'Pai', 'Responsável legal', 'Familiar', 'Cuidador', 'Outro', 'Não informado']}
                  value={formData.accompaniment.relationship || ''}
                  onChange={(val) => updateField('accompaniment', { relationship: val as any })}
                />
                {formData.accompaniment.relationship === 'Outro' && (
                  <ClinicalTextInput
                    label="Especifique o vínculo (sem nomes de pessoas)"
                    value={formData.accompaniment.relationshipCustom || ''}
                    onChange={(val) => updateField('accompaniment', { relationshipCustom: val })}
                    placeholder="Ex: Tia materna"
                  />
                )}
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 3. Características Gerais */}
        <ClinicalSection
          id="sec-ped-characteristics"
          title="3. Características Gerais"
          subtitle="Faixa etária opcional, idade informada, peso e altura/comprimento"
          status={sectionStatuses.characteristics}
          isOpen={openSections['sec-ped-characteristics'] ?? true}
          onToggle={() => toggleSection('sec-ped-characteristics')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Faixa Etária Pediátrica (Opcional)"
              options={['Lactente', 'Criança', 'Adolescente']}
              value={formData.generalCharacteristics.ageGroup || ''}
              onChange={(val) => updateField('generalCharacteristics', { ageGroup: val as any })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ClinicalTextInput
                label="Idade Informada (Opcional)"
                value={formData.generalCharacteristics.reportedAge || ''}
                onChange={(val) => updateField('generalCharacteristics', { reportedAge: val })}
                placeholder="Ex: 4 anos, 8 meses"
              />
              <ClinicalTextInput
                label="Peso Informado/Aferido (Opcional)"
                value={formData.generalCharacteristics.weight || ''}
                onChange={(val) => updateField('generalCharacteristics', { weight: val })}
                placeholder="Ex: 15,2 kg"
              />
              <ClinicalTextInput
                label="Altura / Comprimento (Opcional)"
                value={formData.generalCharacteristics.height || ''}
                onChange={(val) => updateField('generalCharacteristics', { height: val })}
                placeholder="Ex: 102 cm"
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 4. Sinais Vitais */}
        <ClinicalSection
          id="sec-ped-vitals"
          title="4. Sinais Vitais"
          subtitle="PA, PAM manual, FC, FR, SpO2, Temperatura e Glicemia"
          status={sectionStatuses.vitals}
          isOpen={openSections['sec-ped-vitals'] ?? true}
          onToggle={() => toggleSection('sec-ped-vitals')}
        >
          <VitalSignsInputs values={vitalSignsData} onChange={handleVitalsChange} showBloodGlucose />
        </ClinicalSection>

        {/* 5. Avaliação da Dor */}
        <ClinicalSection
          id="sec-ped-pain"
          title="5. Avaliação da Dor"
          subtitle="Escala numérica, FLACC ou Faces com registro do escore"
          status={sectionStatuses.pain}
          isOpen={openSections['sec-ped-pain'] ?? true}
          onToggle={() => toggleSection('sec-ped-pain')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Método de Avaliação da Dor"
              options={[
                'Escala numérica 0–10',
                'FLACC',
                'Faces',
                'Outra escala',
                'Não avaliável',
                'Não avaliada',
                'Não informado',
              ]}
              value={formData.pain.method}
              onChange={(val) => updateField('pain', { method: val as any })}
            />

            {['Escala numérica 0–10', 'FLACC', 'Faces', 'Outra escala'].includes(formData.pain.method) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <ClinicalTextInput
                  label="Escore Aferido"
                  value={formData.pain.score || ''}
                  onChange={(val) => updateField('pain', { score: val })}
                  placeholder="Ex: 0, 3, 7"
                />
                <ClinicalOptionGroup
                  label="Fonte da Informação da Dor"
                  options={['Paciente', 'Responsável/acompanhante', 'Avaliação comportamental da equipe']}
                  value={formData.pain.infoSource || ''}
                  onChange={(val) => updateField('pain', { infoSource: val as any })}
                />
              </div>
            )}
            {formData.pain.method !== 'Não avaliada' && formData.pain.method !== '' && (
              <ClinicalTextInput
                label="Localização ou detalhes referidos da dor (opcional)"
                value={formData.pain.reportedDetails || ''}
                onChange={(val) => updateField('pain', { reportedDetails: val })}
                placeholder="Ex: Queixa de dor abdominal difusa ao toque"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 6. Neurológico e Comportamento */}
        <ClinicalSection
          id="sec-ped-neuro"
          title="6. Neurológico e Comportamento"
          subtitle="Comunicação, comportamento observado e queixas informadas"
          status={sectionStatuses.neuro}
          isOpen={openSections['sec-ped-neuro'] ?? true}
          onToggle={() => toggleSection('sec-ped-neuro')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Comunicação / Linguagem"
              options={[
                'Comunica verbalmente',
                'Comunicação limitada',
                'Não verbal',
                'Sonolento/sedado',
                'Não avaliável',
                'Não informado',
              ]}
              value={formData.neuroBehavior.communication}
              onChange={(val) => updateField('neuroBehavior', { communication: val as any })}
            />

            <ClinicalMultiSelect
              label="Comportamento Observado"
              options={[
                'Calmo',
                'Cooperativo',
                'Agitado',
                'Irritado',
                'Choroso',
                'Ansioso',
                'Sonolento',
                'Hipoativo',
                'Inquieto',
              ]}
              selectedValues={formData.neuroBehavior.behavior}
              onChange={(sel) => updateField('neuroBehavior', { behavior: sel as any })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalTextInput
                label="Queixas Relatadas (Factual)"
                value={formData.neuroBehavior.complaint || ''}
                onChange={(val) => updateField('neuroBehavior', { complaint: val })}
                placeholder="Ex: Relata náusea após alimentação"
              />
              <ClinicalOptionGroup
                label="Fonte da Queixa"
                options={['Paciente', 'Responsável/acompanhante', 'Equipe assistencial']}
                value={formData.neuroBehavior.complaintSource || ''}
                onChange={(val) => updateField('neuroBehavior', { complaintSource: val as any })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 7. Respiratório */}
        <ClinicalSection
          id="sec-ped-resp"
          title="7. Respiratório"
          subtitle="Padrão ventilatório e suporte de oxigênio"
          status={sectionStatuses.respiratory}
          isOpen={openSections['sec-ped-resp'] ?? true}
          onToggle={() => toggleSection('sec-ped-resp')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Suporte Ventilatório"
              options={['Ar ambiente', 'Oxigenoterapia', 'VNI', 'VMI', 'Traqueostomia', 'Não avaliado']}
              value={formData.respiratory.support}
              onChange={(val) => updateField('respiratory', { support: val as any })}
            />

            {formData.respiratory.support === 'Oxigenoterapia' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <ClinicalOptionGroup
                  label="Dispositivo de Oxigênio"
                  options={['Cateter nasal', 'Máscara de Venturi', 'Máscara com reservatório', 'Outro']}
                  value={formData.respiratory.oxygenDevice || ''}
                  onChange={(val) => updateField('respiratory', { oxygenDevice: val as any })}
                />
                <ClinicalTextInput
                  label="Fluxo (L/min)"
                  value={formData.respiratory.oxygenFlow || ''}
                  onChange={(val) => updateField('respiratory', { oxygenFlow: val })}
                  placeholder="Ex: 2 L/min"
                />
              </div>
            )}

            {formData.respiratory.support === 'VMI' && (
              <ClinicalTextInput
                label="Modo Ventilatório Informado"
                value={formData.respiratory.vmiMode || ''}
                onChange={(val) => updateField('respiratory', { vmiMode: val })}
                placeholder="Ex: PCV conforme registro anterior"
              />
            )}

            <ClinicalTextInput
              label="Observações respiratórias (opcional)"
              value={formData.respiratory.observations || ''}
              onChange={(val) => updateField('respiratory', { observations: val })}
              placeholder="Ex: Sem sinais de esforço ventilatório observados"
            />
          </div>
        </ClinicalSection>

        {/* 8. Cardiovascular */}
        <ClinicalSection
          id="sec-ped-cardio"
          title="8. Cardiovascular e Perfusão"
          subtitle="Perfusão periférica, extremidades e edema"
          status={sectionStatuses.cardio}
          isOpen={openSections['sec-ped-cardio'] ?? true}
          onToggle={() => toggleSection('sec-ped-cardio')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Perfusão Periférica"
                options={['Normal (TEC < 2s)', 'Lenta (TEC > 2s)', 'Não avaliada']}
                value={formData.cardiovascular.perfusion}
                onChange={(val) => updateField('cardiovascular', { perfusion: val as any })}
              />
              <ClinicalOptionGroup
                label="Extremidades"
                options={['Aquecidas', 'Frias', 'Cianose periférica', 'Pálidas', 'Outro', 'Não avaliado']}
                value={formData.cardiovascular.extremities}
                onChange={(val) => updateField('cardiovascular', { extremities: val as any })}
              />
            </div>
            <ClinicalOptionGroup
              label="Edema"
              options={['Ausente', 'Presente', 'Não avaliado']}
              value={formData.cardiovascular.edema}
              onChange={(val) => updateField('cardiovascular', { edema: val as any })}
            />
            {formData.cardiovascular.edema === 'Presente' && (
              <ClinicalTextInput
                label="Localização do Edema"
                value={formData.cardiovascular.edemaLocation || ''}
                onChange={(val) => updateField('cardiovascular', { edemaLocation: val })}
                placeholder="Ex: Membros inferiores (+/4+)"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 9. Nutrição e Alimentação */}
        <ClinicalSection
          id="sec-ped-nutrition"
          title="9. Nutrição e Alimentação"
          subtitle="Via alimentar, aceitação oral, dieta enteral e aleitamento"
          status={sectionStatuses.nutrition}
          isOpen={openSections['sec-ped-nutrition'] ?? true}
          onToggle={() => toggleSection('sec-ped-nutrition')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Via de Alimentação"
                options={['Oral', 'Enteral', 'Parenteral', 'Jejum', 'Outra', 'Não informado']}
                value={formData.nutrition.route}
                onChange={(val) => updateField('nutrition', { route: val as any })}
              />
              <ClinicalOptionGroup
                label="Nutrição Infantil / Aleitamento"
                options={[
                  'Não se aplica',
                  'Aleitamento materno',
                  'Aleitamento misto',
                  'Fórmula',
                  'Outro',
                  'Não informado',
                ]}
                value={formData.nutrition.breastfeeding || ''}
                onChange={(val) => updateField('nutrition', { breastfeeding: val as any })}
              />
            </div>

            {formData.nutrition.route === 'Oral' && (
              <ClinicalOptionGroup
                label="Aceitação da Dieta Oral"
                options={['Boa', 'Moderada', 'Baixa', 'Recusada', 'Não avaliada']}
                value={formData.nutrition.oralAcceptance || ''}
                onChange={(val) => updateField('nutrition', { oralAcceptance: val as any })}
              />
            )}

            {formData.nutrition.route === 'Enteral' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <ClinicalOptionGroup
                  label="Dispositivo Enteral"
                  options={['SNE', 'SNG', 'GTT', 'Outra']}
                  value={formData.nutrition.enteralDevice || ''}
                  onChange={(val) => updateField('nutrition', { enteralDevice: val as any })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClinicalTextInput
                    label="Velocidade de Infusão (mL/h)"
                    value={formData.nutrition.enteralRate || ''}
                    onChange={(val) => updateField('nutrition', { enteralRate: val })}
                    placeholder="Ex: 40 mL/h"
                  />
                  <ClinicalOptionGroup
                    label="Tolerância à Dieta Enteral"
                    options={['Boa tolerância', 'Apresentou resíduo/alteração', 'Não avaliada']}
                    value={formData.nutrition.enteralTolerance || ''}
                    onChange={(val) => updateField('nutrition', { enteralTolerance: val as any })}
                  />
                </div>
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 10. Eliminações */}
        <ClinicalSection
          id="sec-ped-eliminations"
          title="10. Eliminações Fisiológicas"
          subtitle="Diurese e evacuações observadas no período"
          status={sectionStatuses.eliminations}
          isOpen={openSections['sec-ped-eliminations'] ?? true}
          onToggle={() => toggleSection('sec-ped-eliminations')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Diurese"
                options={['Presente', 'Ausente', 'Não avaliada', 'Não informado']}
                value={formData.eliminations.urinary}
                onChange={(val) => updateField('eliminations', { urinary: val as any })}
              />
              {formData.eliminations.urinary === 'Presente' && (
                <ClinicalOptionGroup
                  label="Via da Diurese"
                  options={['Espontânea', 'Fralda', 'SVD', 'Outro']}
                  value={formData.eliminations.urinaryRoute || ''}
                  onChange={(val) => updateField('eliminations', { urinaryRoute: val as any })}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <ClinicalOptionGroup
                label="Evacuações"
                options={['Presentes', 'Ausentes', 'Não avaliadas']}
                value={formData.eliminations.bowel}
                onChange={(val) => updateField('eliminations', { bowel: val as any })}
              />
              {formData.eliminations.bowel === 'Presentes' && (
                <ClinicalOptionGroup
                  label="Aspecto das Fezes"
                  options={['Formadas', 'Pastosas', 'Líquidas', 'Outras']}
                  value={formData.eliminations.bowelAspect || ''}
                  onChange={(val) => updateField('eliminations', { bowelAspect: val as any })}
                />
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 11. Dispositivos */}
        <ClinicalSection
          id="sec-ped-devices"
          title="11. Dispositivos Invasivos"
          subtitle="Cateteres, sondas e drenos presentes (nenhum pré-selecionado)"
          status={sectionStatuses.devices}
          isOpen={openSections['sec-ped-devices'] ?? true}
          onToggle={() => toggleSection('sec-ped-devices')}
        >
          <DeviceFormCard
            devices={formData.devices}
            onChange={(devs) => setFormData((prev) => ({ ...prev, devices: devs }))}
          />
        </ClinicalSection>

        {/* 12. Pele e Integridade */}
        <ClinicalSection
          id="sec-ped-skin"
          title="12. Pele e Integridade Cutânea"
          subtitle="Integridade, hidratação, lesões observadas e curativos"
          status={sectionStatuses.skin}
          isOpen={openSections['sec-ped-skin'] ?? true}
          onToggle={() => toggleSection('sec-ped-skin')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Integridade Cutânea"
                options={['Íntegra', 'Com alteração/lesão', 'Não avaliada']}
                value={formData.skin.integrity}
                onChange={(val) => updateField('skin', { integrity: val as any })}
              />
              <ClinicalOptionGroup
                label="Hidratação"
                options={['Hidratada', 'Ressecada', 'Outra', 'Não avaliada']}
                value={formData.skin.hydration}
                onChange={(val) => updateField('skin', { hydration: val as any })}
              />
            </div>

            {formData.skin.integrity === 'Com alteração/lesão' && (
              <ClinicalTextInput
                label="Descrição observada da alteração/lesão"
                value={formData.skin.lesionDescription || ''}
                onChange={(val) => updateField('skin', { lesionDescription: val })}
                placeholder="Ex: Hiperemia em região perianal"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <ClinicalOptionGroup
                label="Presença de Curativo"
                options={['Sim', 'Não', 'Não informado']}
                value={formData.skin.dressingPresent || ''}
                onChange={(val) => updateField('skin', { dressingPresent: val as any })}
              />
              {formData.skin.dressingPresent === 'Sim' && (
                <ClinicalTextInput
                  label="Condição do Curativo"
                  value={formData.skin.dressingCondition || ''}
                  onChange={(val) => updateField('skin', { dressingCondition: val })}
                  placeholder="Ex: Limpo, seco e oclusivo"
                />
              )}
            </div>
          </div>
        </ClinicalSection>

        {/* 13. Mobilidade e Segurança */}
        <ClinicalSection
          id="sec-ped-mobility"
          title="13. Mobilidade e Segurança do Paciente"
          subtitle="Padrão de mobilidade, grades de proteção e segurança no leito"
          status={sectionStatuses.mobility}
          isOpen={openSections['sec-ped-mobility'] ?? true}
          onToggle={() => toggleSection('sec-ped-mobility')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Mobilidade Observada"
              options={[
                'Deambula sem auxílio',
                'Deambula com auxílio',
                'Restrito ao leito',
                'Em berço',
                'Em incubadora',
                'Em maca',
                'Cadeira de rodas',
                'Mobilização passiva',
                'Outro',
                'Não avaliada',
              ]}
              value={formData.mobilitySafety.mobility}
              onChange={(val) => updateField('mobilitySafety', { mobility: val as any })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <ClinicalOptionGroup
                label="Grades de Proteção (Leito/Berço)"
                options={['Elevadas', 'Não elevadas', 'Não informado']}
                value={formData.mobilitySafety.guardRails}
                onChange={(val) => updateField('mobilitySafety', { guardRails: val as any })}
              />
              <ClinicalOptionGroup
                label="Cabeceira do Leito/Berço"
                options={['Elevada', 'Não elevada', 'Não informado']}
                value={formData.mobilitySafety.headOfBed}
                onChange={(val) => updateField('mobilitySafety', { headOfBed: val as any })}
              />
              <ClinicalOptionGroup
                label="Acompanhante ao Leito"
                options={['Sim', 'Não', 'Não informado']}
                value={formData.mobilitySafety.bedsideAccompanist}
                onChange={(val) => updateField('mobilitySafety', { bedsideAccompanist: val as any })}
              />
            </div>
          </div>
        </ClinicalSection>

        {/* 14. Higiene e Banho */}
        <ClinicalSection
          id="sec-ped-hygiene"
          title="14. Higiene e Banho"
          subtitle="Condições de higiene, banho realizado e tolerância observada"
          status={sectionStatuses.hygiene}
          isOpen={openSections['sec-ped-hygiene'] ?? true}
          onToggle={() => toggleSection('sec-ped-hygiene')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClinicalOptionGroup
                label="Condição de Higiene"
                options={['Preservada', 'Necessita cuidados', 'Realizada higiene', 'Não avaliada']}
                value={formData.hygieneBath.hygiene}
                onChange={(val) => updateField('hygieneBath', { hygiene: val as any })}
              />
              <ClinicalOptionGroup
                label="Banho"
                options={[
                  'Não realizado',
                  'Banho no leito',
                  'Banho de aspersão',
                  'Banho de aspersão com auxílio',
                  'Banho independente',
                  'Outro',
                  'Não informado',
                ]}
                value={formData.hygieneBath.bathPerformed}
                onChange={(val) => updateField('hygieneBath', { bathPerformed: val as any })}
              />
            </div>

            {formData.hygieneBath.bathPerformed && formData.hygieneBath.bathPerformed !== 'Não realizado' && (
              <ClinicalOptionGroup
                label="Tolerância ao Banho"
                options={['Boa tolerância', 'Apresentou alteração/intercorrência', 'Não avaliada']}
                value={formData.hygieneBath.bathTolerance || ''}
                onChange={(val) => updateField('hygieneBath', { bathTolerance: val as any })}
              />
            )}
          </div>
        </ClinicalSection>

        {/* 15. Cuidados Realizados */}
        <ClinicalSection
          id="sec-ped-care"
          title="15. Cuidados Realizados"
          subtitle="Ações e intervenções de enfermagem executadas pelo técnico"
          status={sectionStatuses.care}
          isOpen={openSections['sec-ped-care'] ?? true}
          onToggle={() => toggleSection('sec-ped-care')}
        >
          <div className="space-y-4">
            <ClinicalMultiSelect
              label="Selecione os Cuidados Realizados"
              options={[...PEDIATRIC_CARE_ACTIONS]}
              selectedValues={formData.care.actions}
              onChange={(acts) => updateField('care', { actions: acts })}
            />
            <ClinicalTextInput
              label="Outro cuidado realizado (opcional)"
              value={formData.care.otherCare || ''}
              onChange={(val) => updateField('care', { otherCare: val })}
              placeholder="Ex: Auxílio na troca de vestuário e acolhimento"
            />
          </div>
        </ClinicalSection>

        {/* 16. Medicações Administradas */}
        <ClinicalSection
          id="sec-ped-medications"
          title="16. Medicações e Cuidados Relacionados"
          subtitle="Apenas medicações administradas pelo técnico conforme prescrição médica (sem cálculo de dose)"
          status={sectionStatuses.medications}
          isOpen={openSections['sec-ped-medications'] ?? true}
          onToggle={() => toggleSection('sec-ped-medications')}
        >
          <div className="space-y-4">
            <ClinicalTextInput
              label="Medicações Administradas Conforme Prescrição"
              value={formData.medications.administered.join(', ')}
              onChange={(val) =>
                updateField('medications', {
                  administered: val
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Ex: Dipirona EV, Ceftriaxona EV (separadas por vírgula)"
            />
            <ClinicalTextInput
              label="Observações da administração (opcional)"
              value={formData.medications.notes || ''}
              onChange={(val) => updateField('medications', { notes: val })}
              placeholder="Ex: Sem reações adversas imediatas observadas"
            />
          </div>
        </ClinicalSection>

        {/* 17. Intercorrências */}
        <ClinicalSection
          id="sec-ped-complications"
          title="17. Intercorrências"
          subtitle="Registro de intercorrências, cuidado prestado e comunicação"
          status={sectionStatuses.complications}
          isOpen={openSections['sec-ped-complications'] ?? true}
          onToggle={() => toggleSection('sec-ped-complications')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Intercorrência no Período?"
              options={['Sim', 'Não', 'Não informado']}
              value={formData.complications.hasComplication}
              onChange={(val) => updateField('complications', { hasComplication: val as any })}
            />

            {formData.complications.hasComplication === 'Sim' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <ClinicalTextInput
                  label="Descrição Factual da Intercorrência"
                  value={formData.complications.description || ''}
                  onChange={(val) => updateField('complications', { description: val })}
                  placeholder="Ex: Episódio de êmese em jato após alimentação"
                />
                <ClinicalTextInput
                  label="Cuidado Imediato Realizado"
                  value={formData.complications.carePerformed || ''}
                  onChange={(val) => updateField('complications', { carePerformed: val })}
                  placeholder="Ex: Decúbito lateralizado, aspiração de vias aéreas e higiene"
                />
                <ClinicalTextInput
                  label="Resposta Observada"
                  value={formData.complications.observedResponse || ''}
                  onChange={(val) => updateField('complications', { observedResponse: val })}
                  placeholder="Ex: Criança acalmou-se, sinais vitais estáveis"
                />
                <ClinicalOptionGroup
                  label="Comunicado à Equipe?"
                  options={['Sim', 'Não', 'Não informado']}
                  value={formData.complications.communicated || ''}
                  onChange={(val) => updateField('complications', { communicated: val as any })}
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 18. Comunicação com Responsável e Equipe */}
        <ClinicalSection
          id="sec-ped-communication"
          title="18. Comunicação com Responsável e Equipe"
          subtitle="Orientações e comunicações realizadas (sem nomes)"
          status={sectionStatuses.communication}
          isOpen={openSections['sec-ped-communication'] ?? true}
          onToggle={() => toggleSection('sec-ped-communication')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Houve Comunicação Relevante Registrada?"
              options={['Sim', 'Não', 'Não informado']}
              value={formData.communication.hasCommunication}
              onChange={(val) => updateField('communication', { hasCommunication: val as any })}
            />

            {formData.communication.hasCommunication === 'Sim' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClinicalOptionGroup
                    label="Destinatário"
                    options={[
                      'Responsável/acompanhante',
                      'Enfermeiro',
                      'Equipe médica',
                      'Outra equipe',
                      'Outro profissional',
                    ]}
                    value={formData.communication.recipient || ''}
                    onChange={(val) => updateField('communication', { recipient: val as any })}
                  />
                  <ClinicalTextInput
                    label="Horário (opcional)"
                    value={formData.communication.time || ''}
                    onChange={(val) => updateField('communication', { time: val })}
                    placeholder="Ex: 14:30"
                  />
                </div>
                <ClinicalTextInput
                  label="Motivo / Conteúdo Factual"
                  value={formData.communication.reason || ''}
                  onChange={(val) => updateField('communication', { reason: val })}
                  placeholder="Ex: Comunicada alteração de temperatura à enfermeira do plantão"
                />
              </div>
            )}
          </div>
        </ClinicalSection>

        {/* 19. Situação Final */}
        <ClinicalSection
          id="sec-ped-final-status"
          title="19. Situação Final"
          subtitle="Condição e destino do paciente ao encerramento do registro"
          status={sectionStatuses.finalStatus}
          isOpen={openSections['sec-ped-final-status'] ?? true}
          onToggle={() => toggleSection('sec-ped-final-status')}
        >
          <div className="space-y-4">
            <ClinicalOptionGroup
              label="Situação do Paciente"
              options={[
                'Permanece no setor sob cuidados de enfermagem',
                'Encaminhado',
                'Transferência',
                'Alta do setor',
                'Outro',
                'Não informado',
              ]}
              value={formData.finalStatus.status}
              onChange={(val) => updateField('finalStatus', { status: val as any })}
            />
            {formData.finalStatus.status === 'Outro' && (
              <ClinicalTextInput
                label="Especifique a situação final"
                value={formData.finalStatus.statusCustom || ''}
                onChange={(val) => updateField('finalStatus', { statusCustom: val })}
                placeholder="Ex: Aguardando transporte para exame"
              />
            )}
          </div>
        </ClinicalSection>

        {/* 20. Informações Adicionais */}
        <ClinicalSection
          id="sec-ped-additional"
          title="20. Informações Adicionais"
          subtitle="Observações factuais complementares com privacidade preservada"
          status={sectionStatuses.additional}
          isOpen={openSections['sec-ped-additional'] ?? true}
          onToggle={() => toggleSection('sec-ped-additional')}
        >
          <ClinicalTextarea
            label="Observações Fatuais Complementares"
            value={formData.additionalInfo?.notes || ''}
            onChange={(val) => setFormData((prev) => ({ ...prev, additionalInfo: { notes: val } }))}
            placeholder="Registre dados factuais observados adicionais..."
            rows={3}
          />
        </ClinicalSection>
      </div>

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={handleGenerateNote}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all hover:shadow"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gerar Anotação de Enfermagem</span>
        </button>
      </div>

      {/* Consistency Alerts */}
      {consistencyAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Alertas de Consistência Clínica ({consistencyAlerts.length})</span>
          </div>
          <ul className="space-y-1 text-xs text-amber-800">
            {consistencyAlerts.map((a, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="font-semibold text-amber-900">[{a.code}]</span>
                <span>{a.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generated Note Preview */}
      {generatedNote && (
        <div id="pediatric-preview-section" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Anotação Gerada (Factual e Auditada)</h2>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {generatedNote}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Registro técnico em conformidade com o COFEN. Sem diagnósticos, prognósticos ou cálculo de doses.</span>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <RotateCcw className="w-5 h-5" />
              <span>Limpar Formulário</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Tem certeza que deseja limpar todos os campos preenchidos? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Confirmar Limpeza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
