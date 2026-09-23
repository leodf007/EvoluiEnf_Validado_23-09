import React from 'react';

interface ClinicalNumericInputProps {
  id?: string;
  label: string;
  sublabel?: string;
  value: string | number | undefined;
  onChange: (val: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  mode?: 'numeric' | 'decimal';
  required?: boolean;
  className?: string;
}

export const ClinicalNumericInput: React.FC<ClinicalNumericInputProps> = ({
  id,
  label,
  sublabel,
  value,
  onChange,
  unit,
  placeholder = '—',
  min,
  max,
  step = 'any',
  mode = 'numeric',
  required = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-1">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-teal-700 ml-1">*</span>}
        </label>
        {sublabel && <span className="text-[11px] text-slate-400">{sublabel}</span>}
      </div>

      <div className="relative rounded-xl shadow-2xs">
        <input
          id={id}
          type="number"
          inputMode={mode}
          min={min}
          max={max}
          step={step}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors pr-12"
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
};
