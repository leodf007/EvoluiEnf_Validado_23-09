import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PrivacyNoticeProps {
  className?: string;
  compact?: boolean;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  className = '',
  compact = false,
}) => {
  return (
    <div
      id="privacy-notice"
      className={`rounded-xl border border-teal-200/80 bg-teal-50/70 p-3.5 sm:p-4 text-slate-700 shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-teal-100/90 p-1.5 text-teal-800 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>
        <div className="space-y-1 text-left">
          <h4 className="text-xs sm:text-sm font-semibold text-teal-950 tracking-tight flex items-center gap-1.5">
            Privacidade do paciente
          </h4>
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600">
            O EvoluiEnf não necessita de nome, CPF, número de prontuário ou outros
            identificadores diretos do paciente para auxiliar na elaboração do
            registro. Evite inserir informações que permitam identificar o paciente.
          </p>
        </div>
      </div>
    </div>
  );
};
