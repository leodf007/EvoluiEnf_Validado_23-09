import React from 'react';
import { AreaCard } from '../components/AreaCard';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AppScreen } from '../types';
import { ArrowLeft } from 'lucide-react';
import { MODULE_REGISTRY } from '../engine/moduleRegistry';

interface AssistentialAreaScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const AssistentialAreaScreen: React.FC<AssistentialAreaScreenProps> = ({
  onNavigate,
  onShowNotice,
}) => {
  const developmentMessage =
    'Este módulo será disponibilizado nas próximas etapas do desenvolvimento.';

  const noteAreas = MODULE_REGISTRY.technician_nursing_note.areas;

  const areas = [
    {
      id: 'er',
      name: 'PS / Emergência',
      description: 'Atendimento inicial, urgências, emergências e estabilização clínica.',
      status: noteAreas.emergency.status,
      statusLabel: noteAreas.emergency.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'emergency' as const,
      action: () => onNavigate('clinical-evolution'),
    },
    {
      id: 'icu',
      name: 'UTI',
      description: 'Terapia intensiva, monitorização hemodinâmica contínua e ventilação mecânica.',
      status: noteAreas.icu.status,
      statusLabel: noteAreas.icu.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'icu' as const,
      action: () => onNavigate('icu-clinical-evolution'),
    },
    {
      id: 'medical-clinic',
      name: 'Clínica Médica',
      description: 'Internação em enfermarias clínicas e acompanhamento de patologias crônicas.',
      status: noteAreas.medicalClinic.status,
      statusLabel: noteAreas.medicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'medical-clinic' as const,
      action: () => {
        if (noteAreas.medicalClinic.status === 'available') {
          onNavigate('medical-clinic-evolution');
        } else {
          onShowNotice(developmentMessage);
        }
      },
    },
    {
      id: 'surgical-clinic',
      name: 'Clínica Cirúrgica',
      description: 'Cuidados pré e pós-operatórios, drenos, feridas cirúrgicas e recuperação.',
      status: noteAreas.surgicalClinic.status,
      statusLabel: noteAreas.surgicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'surgical-clinic' as const,
      action: () => {
        if (noteAreas.surgicalClinic.status === 'available') {
          onNavigate('surgical-clinic-evolution');
        } else {
          onShowNotice(developmentMessage);
        }
      },
    },
    {
      id: 'pediatrics',
      name: 'Pediatria',
      description: 'Assistência a pacientes pediátricos, marcos de desenvolvimento e acolhimento.',
      status: noteAreas.pediatrics.status,
      statusLabel: noteAreas.pediatrics.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'pediatrics' as const,
      action: () => {
        if (noteAreas.pediatrics.status === 'available') {
          onNavigate('pediatric-clinic-evolution');
        } else {
          onShowNotice(developmentMessage);
        }
      },
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Anotação de Enfermagem
          </h1>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
            Técnico em Enfermagem
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Selecione a área assistencial para registrar a anotação do paciente.
        </p>
      </div>

      {/* 5 Area Cards List */}
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
