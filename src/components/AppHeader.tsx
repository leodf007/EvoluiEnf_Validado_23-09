import React from 'react';
import { UserRole, AppScreen, NavigationTab } from '../types';
import { Logo } from './Logo';
import { User, Shield, RefreshCw } from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface AppHeaderProps {
  userRole: UserRole;
  userName: string;
  currentScreen: AppScreen;
  activeTab: NavigationTab;
  onNavigateTab: (tab: NavigationTab) => void;
  onNavigateScreen: (screen: AppScreen) => void;
  onSwitchRole: () => void;
  isAuthenticated: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userRole,
  userName,
  currentScreen,
  activeTab,
  onNavigateTab,
  onNavigateScreen,
  onSwitchRole,
  isAuthenticated,
}) => {
  const roleLabel =
    userRole === 'nurse'
      ? 'Enfermeiro(a)'
      : userRole === 'technician'
      ? 'Técnico(a) em Enfermagem'
      : '';

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and branding */}
        <button
          type="button"
          onClick={() => {
            if (isAuthenticated) {
              onNavigateTab('inicio');
            } else {
              onNavigateScreen('welcome');
            }
          }}
          className="flex items-center gap-2 cursor-pointer text-left focus:outline-none"
          aria-label="Ir para o início"
        >
          <Logo size="sm" showSubtitle={false} />
        </button>

        {/* User / Role info and actions */}
        {isAuthenticated && userRole && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão de Instalação PWA */}
            <PWAInstallButton variant="header" />

            {/* Professional Role Pill with quick switch */}
            <button
              type="button"
              onClick={onSwitchRole}
              title="Clique para alternar categoria profissional"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/90 hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
              <span className="hidden sm:inline">{roleLabel}</span>
              <span className="sm:hidden">
                {userRole === 'nurse' ? 'Enfermeiro' : 'Técnico'}
              </span>
              <RefreshCw className="w-3 h-3 text-teal-600 ml-0.5 opacity-70" />
            </button>

            {/* Profile Avatar button */}
            <button
              type="button"
              onClick={() => onNavigateTab('conta')}
              className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'conta'
                  ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-medium text-slate-800">
                {userName}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
