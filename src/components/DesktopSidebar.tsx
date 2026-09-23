import React from 'react';
import { Home, FileText, User, Shield, HelpCircle, LogOut, PlusCircle, History, BookOpen } from 'lucide-react';
import { NavigationTab, UserRole } from '../types';

interface DesktopSidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  userName,
  onLogout,
}) => {
  const roleTitle =
    userRole === 'nurse' ? 'Enfermeiro(a)' : 'Técnico(a) em Enfermagem';

  const menuItems = [
    {
      id: 'inicio' as NavigationTab,
      label: 'Início',
      description: 'Painel principal',
      icon: Home,
    },
    {
      id: 'novo' as NavigationTab,
      label: 'Novo Atendimento',
      description: 'Documentação sem PII',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'modelos' as NavigationTab,
      label: 'Modelos',
      description: 'Biblioteca inteligente',
      icon: BookOpen,
    },
    {
      id: 'atendimentos' as NavigationTab,
      label: 'Histórico',
      description: 'Atendimentos do usuário',
      icon: History,
    },
    {
      id: 'registros' as NavigationTab,
      label: 'Módulos Clínicos',
      description:
        userRole === 'nurse' ? 'SOAP e avaliações' : 'Anotação técnica',
      icon: FileText,
    },
    {
      id: 'conta' as NavigationTab,
      label: 'Conta & Validações',
      description: 'Perfil, LGPD e testes',
      icon: User,
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-white border-r border-slate-200/80 p-5 min-h-[calc(100vh-4rem)]"
    >
      <div className="space-y-6">
        {/* User Card with SaaS Plan badge */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {userName}
              </h4>
              <p className="text-[11px] text-teal-800 font-medium truncate">
                {roleTitle}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 shrink-0">
            PRO
          </span>
        </div>

        {/* Navigation items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navegação
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-teal-700 text-white'
                      : item.highlight
                      ? 'bg-teal-50 text-teal-700 font-bold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm leading-tight">
                    {item.label}
                  </span>
                  <span className="block text-[11px] font-normal text-slate-400 truncate">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="px-3 py-2 text-[11px] text-slate-400 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span>Ambiente Seguro</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Encerrar sessão</span>
        </button>
      </div>
    </aside>
  );
};
