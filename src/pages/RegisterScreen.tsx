import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, Loader2, Stethoscope, UserCheck } from 'lucide-react';
import { AppScreen, ProfessionalCategory } from '../types';

interface RegisterScreenProps {
  onRegister: (
    name: string,
    email: string,
    password: string,
    category?: ProfessionalCategory
  ) => Promise<void> | void;
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onNavigate,
  onShowNotice,
}) => {
  const [name, setName] = useState('Ana');
  const [email, setEmail] = useState('ana.enfermagem@exemplo.com');
  const [password, setPassword] = useState('evolui123456');
  const [confirmPassword, setConfirmPassword] = useState('evolui123456');
  const [category, setCategory] = useState<ProfessionalCategory>('NURSE');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await onRegister(name.trim() || 'Profissional', email.trim(), password, category);
    } catch (err: any) {
      console.error('Erro de cadastro:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.');
      } else if (code === 'auth/weak-password') {
        setError('A senha informada é fraca. Use letras e números.');
      } else {
        setError('Falha ao registrar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('welcome')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <Logo size="sm" showSubtitle={false} />
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Criar sua conta
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cadastre-se para ter acesso às ferramentas de documentação profissional.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Field */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Nome
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* E-mail Field */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Senha Field */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha (mínimo 6 caracteres)"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha Field */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Categoria Profissional Field */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Categoria profissional
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="register-role-nurse-btn"
                  onClick={() => setCategory('NURSE')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    category === 'NURSE'
                      ? 'border-teal-700 bg-teal-50/70 text-teal-900 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-700" />
                      Enfermeiro
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        category === 'NURSE' ? 'border-teal-700 bg-teal-700' : 'border-slate-300'
                      }`}
                    >
                      {category === 'NURSE' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Admissão, SAE, Evolução, Feridas e SOAP
                  </span>
                </button>

                <button
                  type="button"
                  id="register-role-tech-btn"
                  onClick={() => setCategory('TECHNICIAN')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    category === 'TECHNICIAN'
                      ? 'border-cyan-700 bg-cyan-50/70 text-cyan-900 ring-2 ring-cyan-700/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-cyan-700" />
                      Técnico
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        category === 'TECHNICIAN' ? 'border-cyan-700 bg-cyan-700' : 'border-slate-300'
                      }`}
                    >
                      {category === 'TECHNICIAN' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Anotação de Enfermagem e Admissão Técnica
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 disabled:opacity-60 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <span>Criar conta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-semibold text-teal-800 hover:text-teal-950 hover:underline cursor-pointer"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Privacidade por Padrão — Sem armazenamento de dados de pacientes</span>
        </div>
      </main>

      <footer className="max-w-md w-full mx-auto text-center py-2 text-xs text-slate-400">
        <p>© EvoluiEnf — Infraestrutura Segura</p>
      </footer>
    </div>
  );
};
