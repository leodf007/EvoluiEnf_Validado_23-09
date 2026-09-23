import React from 'react';
import { TechnicianSurgicalClinicWound } from '../../../types/technicianSurgicalClinic';
import { ClinicalOptionGroup } from '../ClinicalOptionGroup';
import { ClinicalTextInput } from '../ClinicalInputs';
import { ShieldAlert, AlertCircle } from 'lucide-react';

interface SurgicalWoundInputsProps {
  value: TechnicianSurgicalClinicWound;
  onChange: (value: TechnicianSurgicalClinicWound) => void;
}

const WOUND_CONDITION_OPTIONS = [
  { value: 'limpo', label: 'Limpo' },
  { value: 'seco', label: 'Seco' },
  { value: 'íntegro', label: 'Íntegro' },
  { value: 'presença de secreção', label: 'Presença de secreção' },
  { value: 'outro', label: 'Outro' },
];

export const SurgicalWoundInputs: React.FC<SurgicalWoundInputsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
        <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Observação Factual:</span> Registrar estritamente o aspecto objetivo inspecionado. É vedada a conclusão de infecção, deiscência ou complicação cirúrgica nesta anotação técnica.
        </div>
      </div>

      <ClinicalOptionGroup
        label="Possui curativo em ferida cirúrgica?"
        options={['sim', 'não']}
        value={value.hasDressing}
        onChange={(val) =>
          onChange({
            ...value,
            hasDressing: val as any,
            // Clear details if no dressing
            ...(val === 'não' ? { location: '', condition: '', conditionDetails: '' } : {}),
          })
        }
        columns={2}
      />

      {value.hasDressing === 'sim' && (
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <ClinicalTextInput
            label="Localização da ferida/curativo cirúrgico"
            required
            value={value.location || ''}
            onChange={(val) => onChange({ ...value, location: val })}
            placeholder="Ex: Incisão em fossa ilíaca direita, Linha média abdominal, Joelho E..."
          />

          <ClinicalOptionGroup
            label="Condição observada do curativo"
            options={WOUND_CONDITION_OPTIONS}
            value={value.condition || ''}
            onChange={(val) => onChange({ ...value, condition: val as any })}
            columns={3}
          />

          {Boolean(
            value.condition === 'presença de secreção' ||
            value.condition === 'outro'
          ) && (
            <ClinicalTextInput
              label="Detalhes da secreção / aspecto observado"
              sublabel="Opcional - registrar puramente o aspecto (ex: serosa, sero-hemática, hemática)"
              value={value.conditionDetails || ''}
              onChange={(val) => onChange({ ...value, conditionDetails: val })}
              placeholder="Ex: Secreção serosa em pequena quantidade sem odor fétido..."
            />
          )}

          {!value.location?.trim() && (
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>TECH-SC-CONS-002: Curativo informado sem localização anatômica preenchida.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
