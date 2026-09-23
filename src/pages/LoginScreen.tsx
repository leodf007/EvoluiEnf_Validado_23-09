import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, Loader2, CheckCircle2, X } from 'lucide-react';
import { AppScreen } from '../types';
import { AuthService } from '../services/authService';
import { ENV_CONFIG } from '../config/environment';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void> | void;
  onNavigate: (screen: AppScreen) => void;
  onShowNotice: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onNavigate,
  onShowNotice,
}) => {
  const [email, setEmail] = useState(ENV_CONFIG.isProduction ? '' : 'ana.enfermagem@exemplo.com');
  const [password, setPassword] = useState(ENV_CONFIG.isProduction ? '' : 'evolui123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de recuperação de senha
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err: any) {
      console.error('Erro de login:', err);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas sem sucesso. Tente novamente mais tarde.');
      } else {
        setError('Falha ao autenticar. Verifique seus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    const targetEmail = (recoveryEmail || email).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setRecoveryError('Informe um e-mail válido para redefinição.');
      return;
    }

    setRecoveryLoading(true);
    try {
      await AuthService.recuperarSenha(targetEmail);
      setRecoverySuccess(true);
    } catch (err: any) {
      setRecoveryError(err?.message || 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      setRecoveryLoading(false);
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

      {/* Main Form Container */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Entrar no EvoluiEnf
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Acesse sua conta profissional para gerenciar sua documentação clínica.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Senha
                </label>
                <button
                  type="button"
                  id="login-forgot-password-btn"
                  onClick={() => {
                    setRecoveryEmail(email);
                    setRecoverySuccess(false);
                    setRecoveryError(null);
                    setIsRecovering(true);
                  }}
                  className="text-xs font-medium text-teal-800 hover:text-teal-950 hover:underline cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 disabled:opacity-60 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Create Account Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-semibold text-teal-800 hover:text-teal-950 hover:underline cursor-pointer"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Discreet bottom security note */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Infraestrutura SaaS com isolamento seguro de dados</span>
        </div>
      </main>

      <footer className="max-w-md w-full mx-auto text-center py-2 text-xs text-slate-400">
        <p>© EvoluiEnf — Documentação Segura de Enfermagem</p>
      </footer>

      {/* Modal de Recuperação de Senha */}
      {isRecovering && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Recuperação de Senha</h3>
              <button
                type="button"
                onClick={() => setIsRecovering(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recoverySuccess ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">E-mail de redefinição enviado!</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  Enviamos as instruções para redefinir sua senha no e-mail:
                  <br />
                  <span className="font-semibold text-slate-800">{recoveryEmail}</span>
                </p>
                <button
                  type="button"
                  id="recovery-close-btn"
                  onClick={() => setIsRecovering(false)}
                  className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Concluir e voltar ao login
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordRecovery} className="pt-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digite seu e-mail cadastrado. Enviaremos um link de redefinição seguro para você criar uma nova senha.
                </p>

                {recoveryError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {recoveryError}
                  </div>
                )}

                <div>
                  <label htmlFor="recovery-email-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Seu e-mail profissional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="recovery-email-input"
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRecovering(false)}
                    className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    id="recovery-submit-btn"
                    type="submit"
                    disabled={recoveryLoading}
                    className="flex-1 py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {recoveryLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <span>Enviar link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
