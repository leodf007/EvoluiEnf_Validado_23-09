import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { ProfessionalTypeCard } from '../components/ProfessionalTypeCard';
import { UserRole } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  currentRole?: UserRole;
  isChangingRole?: boolean;
  onCancel?: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRole,
  currentRole,
  isChangingRole = false,
  onCancel,
}) => {
  const [selected, setSelected] = useState<'nurse' | 'technician' | null>(
    currentRole || null
  );

  const handleSelect = (role: 'nurse' | 'technician') => {
    setSelected(role);
    onSelectRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between">
        <Logo size="sm" showSubtitle={false} />
        {isChangingRole && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Qual é sua categoria profissional?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
            O EvoluiEnf adapta as ferramentas conforme sua atuação profissional.
          </p>
        </div>

        {/* 2 Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Enfermeiro Card */}
          <ProfessionalTypeCard
            role="nurse"
            title="Enfermeiro"
            badgeText="Nível Superior"
            description="Acesso às ferramentas destinadas aos registros privativos e específicos do enfermeiro."
            selected={selected === 'nurse'}
            onSelect={handleSelect}
          />

          {/* Técnico em Enfermagem Card */}
          <ProfessionalTypeCard
            role="technician"
            title="Técnico em Enfermagem"
            badgeText="Nível Técnico"
            description="Acesso às ferramentas de anotação e registro compatíveis com a atuação do técnico em enfermagem."
            selected={selected === 'technician'}
            onSelect={handleSelect}
          />
        </div>

        {/* Helpful Info Notice */}
        <div className="mt-8 p-4 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-start gap-3 text-left">
          <Info className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Você poderá alterar sua categoria profissional a qualquer momento na
            aba <span className="font-semibold text-slate-800">Conta</span>. As
            funcionalidades são organizadas estritamente de acordo com as
            competências da categoria.
          </p>
        </div>
      </main>

      <footer className="max-w-2xl w-full mx-auto text-center py-2 text-xs text-slate-400">
        <p>© EvoluiEnf</p>
      </footer>
    </div>
  );
};
