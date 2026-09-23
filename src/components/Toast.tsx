import React, { useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        id="toast-notification"
        className="flex items-center justify-between gap-3 bg-slate-900 text-slate-100 px-4 py-3 rounded-xl shadow-lg border border-slate-800"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-teal-500/20 text-teal-400 rounded-lg shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium leading-snug">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Fechar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
