import React from 'react';
import { Home, PlusCircle, History, User, BookOpen } from 'lucide-react';
import { NavigationTab } from '../types';

interface MobileNavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    {
      id: 'inicio' as NavigationTab,
      label: 'Início',
      icon: Home,
    },
    {
      id: 'novo' as NavigationTab,
      label: 'Novo',
      icon: PlusCircle,
    },
    {
      id: 'modelos' as NavigationTab,
      label: 'Modelos',
      icon: BookOpen,
    },
    {
      id: 'atendimentos' as NavigationTab,
      label: 'Histórico',
      icon: History,
    },
    {
      id: 'conta' as NavigationTab,
      label: 'Conta',
      icon: User,
    },
  ];

  return (
    <nav
      id="mobile-navigation"
      aria-label="Navegação Principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2 pb-safe"
    >
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-2.5 min-h-[52px] rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-teal-800 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
