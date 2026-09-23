import React from 'react';
import { TechnicianSurgicalClinicSurgicalContext } from '../../../types/technicianSurgicalClinic';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalTextInput } from '../ClinicalInputs';
import { FileText, AlertCircle } from 'lucide-react';

interface SurgicalContextInputsProps {
  value: TechnicianSurgicalClinicSurgicalContext;
  onChange: (value: TechnicianSurgicalClinicSurgicalContext) => void;
}

const SURGICAL_SITUATION_OPTIONS = [
  { value: 'pré-operatório', label: 'Pré-operatório', description: 'Preparo ou aguardo de procedimento cirúrgico' },
  { value: 'pós-operatório imediato', label: 'Pós-operatório imediato', description: 'Primeiras 24 horas pós-cirurgia' },
  { value: 'pós-operatório mediato', label: 'Pós-operatório mediato', description: 'Após 24h pós-cirurgia até a alta hospitalar' },
  { value: 'acompanhamento clínico pós-cirúrgico', label: 'Acompanhamento pós-cirúrgico', description: 'Internação em enfermaria cirúrgica' },
];

export const SurgicalContextInputs: React.FC<SurgicalContextInputsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
        <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Diretriz COFEN / EvoluiEnf:</span> Registrar estritamente as informações fornecidas no prontuário ou pela equipe. Não realizar diagnóstico médico nem interpretar o procedimento.
        </div>
      </div>

      <ClinicalOptionGroup
        label="Situação Cirúrgica"
        options={SURGICAL_SITUATION_OPTIONS}
        value={value.situation}
        onChange={(val) => onChange({ ...value, situation: val as any })}
        columns={2}
      />

      <ClinicalTextInput
        label="Procedimento cirúrgico informado"
        sublabel="Texto livre - registrar conforme informado no prontuário/equipe"
        value={value.surgicalProcedure}
        onChange={(val) => onChange({ ...value, surgicalProcedure: val })}
        placeholder="Ex: Apendicectomia videolaparoscópica, Colecistectomia, Artroplastia total de quadril D..."
      />

      {Boolean(value.situation && !value.surgicalProcedure.trim()) && (
        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>TECH-SC-CONS-001: Pós-operatório informado sem procedimento cirúrgico preenchido.</span>
        </div>
      )}
    </div>
  );
};
