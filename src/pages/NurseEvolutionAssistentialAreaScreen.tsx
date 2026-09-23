import React from 'react';
import { AreaCard } from '../components/AreaCard';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AppScreen } from '../types';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { MODULE_REGISTRY } from '../engine/moduleRegistry';

interface NurseEvolutionAssistentialAreaScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const NurseEvolutionAssistentialAreaScreen: React.FC<NurseEvolutionAssistentialAreaScreenProps> = ({
  onNavigate,
  onShowNotice,
}) => {
  const developmentMessage =
    'O módulo de Evolução de Enfermagem para esta área será disponibilizado nas próximas etapas.';

  const evolutionAreas = MODULE_REGISTRY.nurse_evolution.areas;

  const areas = [
    {
      id: 'nurse-evo-er',
      name: 'PS / Emergência',
      description: 'Evolução de enfermagem: avaliação por sistemas, sinais vitais, auscultas, dispositivos, riscos e resposta aos cuidados.',
      status: evolutionAreas.emergency.status,
      statusLabel: evolutionAreas.emergency.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'emergency' as const,
      action: () => onNavigate('nurse-evolution-clinical'),
    },
    {
      id: 'nurse-evo-icu',
      name: 'UTI',
      description: 'Evolução intensiva de enfermagem: monitorização hemodinâmica invasiva, parâmetros ventilatórios avançados e drogas vasoativas.',
      status: evolutionAreas.icu.status,
      statusLabel: evolutionAreas.icu.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'icu' as const,
      action: () => onNavigate('nurse-evolution-icu'),
    },
    {
      id: 'nurse-evo-medical-clinic',
      name: 'Clínica Médica',
      description: 'Evolução de enfermagem em enfermaria clínica: avaliação integral, estabilidade clínica e acompanhamento de cuidados.',
      status: evolutionAreas.medicalClinic.status,
      statusLabel: evolutionAreas.medicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'medical-clinic' as const,
      action: () => {
        if (evolutionAreas.medicalClinic.status === 'available') {
          onNavigate('nurse-evolution-medical-clinic');
        } else {
          onShowNotice(developmentMessage);
        }
      },
    },
    {
      id: 'nurse-evo-surgical-clinic',
      name: 'Clínica Cirúrgica',
      description: 'Evolução cirúrgica de enfermagem: feridas operatórias, drenos, analgesia pós-operatória e recuperação.',
      status: evolutionAreas.surgicalClinic.status,
      statusLabel: evolutionAreas.surgicalClinic.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'surgical-clinic' as const,
      action: () => {
        if (evolutionAreas.surgicalClinic.status === 'available') {
          onNavigate('nurse-evolution-surgical-clinic');
        } else {
          onShowNotice(developmentMessage);
        }
      },
    },
    {
      id: 'nurse-evo-pediatrics',
      name: 'Pediatria',
      description: 'Evolução pediátrica de enfermagem: desenvolvimento, parâmetros vitais por faixa etária e resposta terapêutica.',
      status: evolutionAreas.pediatrics.status,
      statusLabel: evolutionAreas.pediatrics.status === 'available' ? 'Disponível' : 'Em desenvolvimento',
      iconName: 'pediatrics' as const,
      action: () =>
        evolutionAreas.pediatrics.status === 'available'
          ? onNavigate('nurse-evolution-pediatrics')
          : onShowNotice(developmentMessage),
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
            Evolução de Enfermagem
          </h1>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Perfil Enfermeiro
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Selecione o setor assistencial para registrar a Evolução de Enfermagem. Avaliação clínica detalhada por sistemas, auscultas, riscos e resposta às condutas.
        </p>
        <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center gap-2.5 text-xs text-teal-900">
          <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong>Competência do Enfermeiro:</strong> Avaliação física completa, monitorização clínica de resposta terapêutica e julgamento profissional.
          </span>
        </div>
      </div>

      {/* 5 Evolution Areas List */}
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
