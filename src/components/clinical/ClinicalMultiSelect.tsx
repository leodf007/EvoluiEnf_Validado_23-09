import React from 'react';
import { Check } from 'lucide-react';

export type MultiSelectOption = string | { value: string; label: string; description?: string };

interface ClinicalMultiSelectProps {
  label: string;
  sublabel?: string;
  options: MultiSelectOption[];
  selectedValues?: string[];
  values?: string[];
  onChange: (vals: string[]) => void;
  exclusiveValue?: string; // e.g. "Ausentes" or "Não avaliado"
  columns?: 2 | 3 | 4 | 5 | string | number;
  className?: string;
}

export const ClinicalMultiSelect: React.FC<ClinicalMultiSelectProps> = ({
  label,
  sublabel,
  options,
  selectedValues,
  values,
  onChange,
  exclusiveValue,
  columns,
  className = '',
}) => {
  const currentValues = selectedValues || values || [];
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const toggleOption = (val: string) => {
    let next: string[] = [];

    if (exclusiveValue && val === exclusiveValue) {
      // If exclusive value selected, clear everything else
      next = currentValues.includes(exclusiveValue) ? [] : [exclusiveValue];
    } else {
      // If regular value selected, remove exclusive value if present
      const withoutExclusive = currentValues.filter((v) => v !== exclusiveValue);
      if (withoutExclusive.includes(val)) {
        next = withoutExclusive.filter((v) => v !== val);
      } else {
        next = [...withoutExclusive, val];
      }
    }

    onChange(next);
  };

  const getGridClass = () => {
    const colStr = String(columns ?? 'auto');
    if (colStr === '2') {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-2';
    }
    if (colStr === '3') {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2';
    }
    if (colStr === '4') {
      return 'grid grid-cols-2 sm:grid-cols-4 gap-2';
    }
    if (colStr === '5') {
      return 'grid grid-cols-2 sm:grid-cols-5 gap-2';
    }
    return 'flex flex-wrap gap-2';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {sublabel && <span className="text-[11px] text-slate-400">{sublabel}</span>}
      </div>

      <div className={getGridClass()} role="group" aria-label={label}>
        {normalizedOptions.map((opt) => {
          const isSelected = currentValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleOption(opt.value)}
              aria-pressed={isSelected}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between gap-2 border text-left cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="leading-snug">{opt.label}</span>
                {opt.description && (
                  <span className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                    {opt.description}
                  </span>
                )}
              </div>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                  isSelected
                    ? 'bg-teal-600 border-teal-500 text-white'
                    : 'bg-white border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
