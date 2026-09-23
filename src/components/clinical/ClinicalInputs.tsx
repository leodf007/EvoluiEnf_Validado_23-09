import React from 'react';
import { Lock } from 'lucide-react';

interface ClinicalTextInputProps {
  id?: string;
  label: string;
  sublabel?: string;
  value: string | undefined;
  onChange: (val: string) => void;
  placeholder?: string;
  privacyReminder?: boolean;
  required?: boolean;
  className?: string;
}

export const ClinicalTextInput: React.FC<ClinicalTextInputProps> = ({
  id,
  label,
  sublabel,
  value,
  onChange,
  placeholder,
  privacyReminder = false,
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

      <div className="relative">
        <input
          id={id}
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
        />
      </div>

      {privacyReminder && (
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Não insira nome do paciente, CPF ou dados identificadores.</span>
        </p>
      )}
    </div>
  );
};

interface ClinicalTextareaProps {
  id?: string;
  label: string;
  sublabel?: string;
  value: string | undefined;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  privacyReminder?: boolean;
  required?: boolean;
  className?: string;
}

export const ClinicalTextarea: React.FC<ClinicalTextareaProps> = ({
  id,
  label,
  sublabel,
  value,
  onChange,
  placeholder,
  rows = 3,
  privacyReminder = true,
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

      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors resize-y leading-relaxed"
      />

      {privacyReminder && (
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Foco estritamente descritivo. Evite dados de identificação pessoal.</span>
        </p>
      )}
    </div>
  );
};
