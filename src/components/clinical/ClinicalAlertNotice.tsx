import React from 'react';
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { ValidationAlert } from '../../types/clinical';

interface ClinicalAlertNoticeProps {
  alerts: ValidationAlert[];
  onNavigateToSection: (sectionIndex: number) => void;
  onDismissAlert?: (code: string) => void;
  className?: string;
}

export const ClinicalAlertNotice: React.FC<ClinicalAlertNoticeProps> = ({
  alerts,
  onNavigateToSection,
  className = '',
}) => {
  if (alerts.length === 0) {
    return (
      <div className={`p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3 text-emerald-900 ${className}`}>
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold">Consistência Clínica Verificada</h4>
          <p className="text-xs text-emerald-800/90">
            Nenhuma inconsistência lógica ou dado mandatório pendente foi detectado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <h4 className="text-xs sm:text-sm font-bold">
          Pontos de Atenção na Evolução ({alerts.length})
        </h4>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.code}
            className="p-3 rounded-xl bg-white border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
          >
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 block sm:inline mr-2">
                [{alert.sectionTitle}]
              </span>
              <span className="text-slate-700">{alert.message}</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToSection(alert.sectionIndex)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-semibold text-xs transition-colors shrink-0 self-start sm:self-center cursor-pointer"
            >
              <span>Revisar seção</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
