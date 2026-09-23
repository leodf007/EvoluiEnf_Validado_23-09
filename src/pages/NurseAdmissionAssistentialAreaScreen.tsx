import React from 'react';
import { AreaCard } from '../components/AreaCard';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AppScreen } from '../types';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { MODULE_REGISTRY } from '../engine/moduleRegistry';

interface NurseAdmissionAssistentialAreaScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const NurseAdmissionAssistentialAreaScreen: React.FC<NurseAdmissionAssistentialAreaScreenProps> = ({
  onNavigate,
  onShowNotice,
}) => {
  const developmentMessage =
    'O módulo de Admissão de Enfermagem para esta área será disponibilizado nas próximas etapas.';

  const admissionAreas = MODULE_REGISTRY.nurse_admission.areas;

  const areas = [
    {
      id: 'nurse-adm-er',
      name: 'PS / Emergência',
      description: 'Admissão de enfermagem: acolhimento, histórico, exame físico por sistemas, riscos assistenciais e cuidados iniciais.',
      status: admissionAreas.emergency.status,
      statusLabel: admissionAreas.emergency.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'emergency' as const,
      action: () => onNavigate('nurse-admission-clinical'),
    },
    {
      id: 'nurse-adm-icu',
      name: 'UTI',
      description: 'Admissão intensiva de enfermagem, suporte ventilatório avançado, monitorização invasiva e cuidados críticos.',
      status: admissionAreas.icu.status,
      statusLabel: admissionAreas.icu.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'icu' as const,
      action: () =>
        admissionAreas.icu.status === 'available'
          ? onNavigate('nurse-admission-icu')
          : onShowNotice(developmentMessage),
    },
    {
      id: 'nurse-adm-medical-clinic',
      name: 'Clínica Médica',
      description: 'Admissão de enfermagem em enfermaria clínica, avaliação integral, riscos e plano de cuidados.',
      status: admissionAreas.medicalClinic.status,
      statusLabel: admissionAreas.medicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'medical-clinic' as const,
      action: () => onShowNotice(developmentMessage),
    },
    {
      id: 'nurse-adm-surgical-clinic',
      name: 'Clínica Cirúrgica',
      description: 'Admissão cirúrgica de enfermagem, checklist de segurança perioperatória, jejum e riscos.',
      status: admissionAreas.surgicalClinic.status,
      statusLabel: admissionAreas.surgicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'surgical-clinic' as const,
      action: () => onShowNotice(developmentMessage),
    },
    {
      id: 'nurse-adm-pediatrics',
      name: 'Pediatria',
      description: 'Admissão pediátrica de enfermagem, acolhimento com responsável, parâmetros por faixa etária e riscos.',
      status: admissionAreas.pediatrics.status,
      statusLabel: admissionAreas.pediatrics.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'pediatrics' as const,
      action: () => onShowNotice(developmentMessage),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb / Back button */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao painel</span>
        </button>
      </div>

      {/* Header section */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Admissão de Enfermagem
          </h1>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Perfil Enfermeiro
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Selecione o setor assistencial para iniciar a Admissão de Enfermagem. Estruturação completa com exame físico por sistemas, histórico e riscos assistenciais.
        </p>
        <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center gap-2.5 text-xs text-teal-900">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong>Competência do Enfermeiro:</strong> Coleta de dados clínicos estruturados, avaliação de riscos e planejamento inicial de cuidados.
          </span>
        </div>
      </div>

      {/* 5 Admission Areas List */}
      <div className="space-y-3">
        {areas.map((area) => (
          <AreaCard
            key={area.id}
            id={area.id}
            name={area.name}
            description={area.description}
            status={area.status}
            statusLabel={area.statusLabel}
            iconName={area.iconName}
            onClick={area.action}
          />
        ))}
      </div>

      {/* Patient Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
};
