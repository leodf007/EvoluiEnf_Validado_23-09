import React from 'react';
import { AreaCard } from '../components/AreaCard';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AppScreen } from '../types';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { MODULE_REGISTRY } from '../engine/moduleRegistry';

interface AdmissionAssistentialAreaScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const AdmissionAssistentialAreaScreen: React.FC<AdmissionAssistentialAreaScreenProps> = ({
  onNavigate,
  onShowNotice,
}) => {
  const developmentMessage =
    'O módulo de Admissão — Anotação de Enfermagem para esta área será disponibilizado nas próximas etapas.';

  const admissionModule = MODULE_REGISTRY.technician_admission;

  const admissionAreas = [
    {
      id: 'admission-er',
      name: 'PS / Emergência',
      description: 'Anotação de acolhimento, procedência, parâmetros iniciais, queixa informada, dispositivos e cuidados de entrada.',
      status: admissionModule.areas.emergency.status,
      statusLabel: admissionModule.areas.emergency.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'emergency' as const,
      action: () => onNavigate('admission-clinical-evolution'),
    },
    {
      id: 'admission-icu',
      name: 'UTI',
      description: 'Anotação de admissão intensiva, parâmetros de monitorização e cuidados executados na recepção do leito.',
      status: admissionModule.areas.icu.status,
      statusLabel: admissionModule.areas.icu.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'icu' as const,
      action: () => onShowNotice(developmentMessage),
    },
    {
      id: 'admission-medical-clinic',
      name: 'Clínica Médica',
      description: 'Anotação de internação na enfermaria clínica, pertences, dados informados e cuidados de recepção.',
      status: admissionModule.areas.medicalClinic.status,
      statusLabel: admissionModule.areas.medicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'medical-clinic' as const,
      action: () => onShowNotice(developmentMessage),
    },
    {
      id: 'admission-surgical-clinic',
      name: 'Clínica Cirúrgica',
      description: 'Anotação de admissão cirúrgica, preparos executados, jejum informado e sinais vitais.',
      status: admissionModule.areas.surgicalClinic.status,
      statusLabel: admissionModule.areas.surgicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'surgical-clinic' as const,
      action: () => onShowNotice(developmentMessage),
    },
    {
      id: 'admission-pediatrics',
      name: 'Pediatria',
      description: 'Anotação de acolhimento infantil, acompanhante presente, parâmetros e cuidados iniciais.',
      status: admissionModule.areas.pediatrics.status,
      statusLabel: admissionModule.areas.pediatrics.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
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
            Admissão — Anotação de Enfermagem
          </h1>
          <span className="self-start sm:self-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80">
            Módulo Operacional
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Selecione a área assistencial da admissão. Este módulo organizará exclusivamente informações observadas, aferidas, referidas e cuidados executados na recepção do paciente.
        </p>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
          <ShieldAlert className="w-4 h-4 text-cyan-700 shrink-0" />
          <span>
            <strong>Competência Técnica:</strong> Focado em registro objetivo de admissão, sem formulação de diagnóstico de enfermagem ou prescrição privativa.
          </span>
        </div>
      </div>

      {/* 5 Admission Areas List */}
      <div className="space-y-3">
        {admissionAreas.map((area) => (
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
