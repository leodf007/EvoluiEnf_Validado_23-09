import React from 'react';

export interface OptionItem {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

interface ClinicalOptionGroupProps {
  label: string;
  sublabel?: string;
  options: (string | OptionItem)[];
  value?: string;
  selectedValue?: string;
  onChange: (val: string) => void;
  columns?: 2 | 3 | 4 | 5 | string | number;
  required?: boolean;
  className?: string;
}

export const ClinicalOptionGroup: React.FC<ClinicalOptionGroupProps> = ({
  label,
  sublabel,
  options,
  value,
  selectedValue,
  onChange,
  columns,
  required = false,
  className = '',
}) => {
  const activeValue = value ?? selectedValue ?? '';
  const normalizedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

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
          {required && <span className="text-teal-700 ml-1">*</span>}
        </label>
        {sublabel && <span className="text-[11px] text-slate-400">{sublabel}</span>}
      </div>

      <div className={getGridClass()} role="radiogroup" aria-label={label}>
        {normalizedOptions.map((opt) => {
          const isSelected = activeValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                // Allow unselecting if same is clicked
                if (isSelected) {
                  onChange('');
                } else {
                  onChange(opt.value);
                }
              }}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between gap-2 border text-left cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? 'bg-teal-800 text-white border-teal-800 shadow-xs ring-2 ring-teal-800/20'
                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="block leading-snug">{opt.label}</span>
                {opt.description && (
                  <span
                    className={`block text-[11px] mt-0.5 leading-tight ${
                      isSelected ? 'text-teal-100/90' : 'text-slate-500'
                    }`}
                  >
                    {opt.description}
                  </span>
                )}
              </div>
              {opt.badge && (
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-teal-700 text-teal-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
