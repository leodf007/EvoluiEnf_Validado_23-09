import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'button' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Se já estiver rodando instalado, não exibe o prompt
  if (isInstalled) {
    return null;
  }

  // Fluxo Desktop / Android Chromium
  if (isInstallable) {
    if (variant === 'header') {
      return (
        <button
          type="button"
          id="pwa-btn-install-header"
          onClick={install}
          title="Instalar EvoluiEnf no seu dispositivo"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        id="pwa-btn-install"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Instalar Aplicativo (PWA)</span>
      </button>
    );
  }

  // Fluxo iOS Safari (WebKit)
  if (isIOS) {
    return (
      <>
        {variant === 'header' ? (
          <button
            type="button"
            id="pwa-btn-install-ios-header"
            onClick={() => setShowIOSGuide(true)}
            title="Instalar no iPhone / iPad"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Instalar no iOS</span>
          </button>
        ) : (
          <button
            type="button"
            id="pwa-btn-install-ios"
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer ${className}`}
          >
            <Smartphone className="w-4 h-4 text-teal-700" />
            <span>Instalar no iPhone/iPad</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-teal-700" />
                  <span>Instalar EvoluiEnf no iOS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  Para usar o <strong>EvoluiEnf</strong> em tela cheia com acesso offline no seu iPhone ou iPad:
                </p>
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra do Safari.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Role as opções para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="pwa-btn-close-ios-guide"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
