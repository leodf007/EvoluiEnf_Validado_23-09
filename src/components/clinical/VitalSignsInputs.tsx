import React from 'react';
import { ClinicalNumericInput } from './ClinicalNumericInput';

export interface VitalSignsData {
  systolicBP?: string;
  diastolicBP?: string;
  meanArterialPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  temperature?: string;
  bloodGlucose?: string;
}

export interface VitalSignsInputsProps {
  values: VitalSignsData;
  onChange: (patch: Partial<VitalSignsData>) => void;
  showBloodGlucose?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Reusable Vital Signs component for all clinical sectors:
 * Emergency/PS, ICU/UTI, Medical Clinic, Surgical Clinic, Pediatrics, and Nurse/Technician Evolutions.
 *
 * Ordered as:
 * 1. Pressão Arterial (PAS / PAD) [mmHg]
 * 2. PAM - Pressão Arterial Média [mmHg] (opcional, sem pré-preenchimento, sem cálculo automático)
 * 3. FC - Frequência Cardíaca [bpm]
 * 4. FR - Frequência Respiratória [irpm]
 * 5. SpO₂ - Saturação de Oxigênio [%]
 * 6. Temperatura [°C]
 * 7. Glicemia Capilar [mg/dL] (opcional, quando aplicável ao setor)
 */
export const VitalSignsInputs: React.FC<VitalSignsInputsProps> = ({
  values,
  onChange,
  showBloodGlucose = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. PAS */}
        <ClinicalNumericInput
          label="PA Sistólica"
          sublabel="PAS"
          value={values.systolicBP || ''}
          onChange={(val) => onChange({ systolicBP: val })}
          unit="mmHg"
          placeholder="Ex: 120"
          min={30}
          max={300}
        />

        {/* 1b. PAD */}
        <ClinicalNumericInput
          label="PA Diastólica"
          sublabel="PAD"
          value={values.diastolicBP || ''}
          onChange={(val) => onChange({ diastolicBP: val })}
          unit="mmHg"
          placeholder="Ex: 80"
          min={20}
          max={200}
        />

        {/* 2. PAM */}
        <ClinicalNumericInput
          label="PAM"
          sublabel="Média (opcional)"
          value={values.meanArterialPressure || ''}
          onChange={(val) => onChange({ meanArterialPressure: val })}
          unit="mmHg"
          placeholder="Ex: 93"
          min={20}
          max={250}
        />

        {/* 3. FC */}
        <ClinicalNumericInput
          label="Freq. Cardíaca"
          sublabel="FC"
          value={values.heartRate || ''}
          onChange={(val) => onChange({ heartRate: val })}
          unit="bpm"
          placeholder="Ex: 78"
          min={20}
          max={280}
        />

        {/* 4. FR */}
        <ClinicalNumericInput
          label="Freq. Resp."
          sublabel="FR"
          value={values.respiratoryRate || ''}
          onChange={(val) => onChange({ respiratoryRate: val })}
          unit="irpm"
          placeholder="Ex: 16"
          min={4}
          max={70}
        />

        {/* 5. SpO2 */}
        <ClinicalNumericInput
          label="Saturação O₂"
          sublabel="SpO₂"
          value={values.oxygenSaturation || ''}
          onChange={(val) => onChange({ oxygenSaturation: val })}
          unit="%"
          placeholder="Ex: 98"
          min={40}
          max={100}
        />

        {/* 6. Temp */}
        <ClinicalNumericInput
          label="Temperatura"
          sublabel="Tax"
          value={values.temperature || ''}
          onChange={(val) => onChange({ temperature: val })}
          unit="°C"
          placeholder="Ex: 36.5"
          mode="decimal"
          step="0.1"
          min={30}
          max={44}
        />

        {/* 7. Glicemia Capilar (quando aplicável) */}
        {showBloodGlucose && (
          <div className="col-span-2 sm:col-span-1">
            <ClinicalNumericInput
              label="Glicemia Capilar"
              sublabel="HGT / Glicemia"
              value={values.bloodGlucose || ''}
              onChange={(val) => onChange({ bloodGlucose: val })}
              unit="mg/dL"
              placeholder="Ex: 110"
              min={10}
              max={800}
            />
          </div>
        )}
      </div>
    </div>
  );
};
