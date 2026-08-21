import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  LogOut, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    currentUser,
    isAuthModalOpen, 
    closeAuthModal, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    loginAsGuest,
    logout,
    savedAccounts,
    switchAccount,
    deleteAccountLocal,
    authError,
    isLoading 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'guest' | 'accounts'>(currentUser ? 'accounts' : 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen && currentUser) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await loginWithEmail(email, password);
    } else if (mode === 'register') {
      await registerWithEmail(name, email, password);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    loginAsGuest(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/60 my-auto text-slate-100">
        
        {/* Close Button (if user is already authenticated and just managing account) */}
        {currentUser && (
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles size={13} className="text-emerald-400" />
            <span>GastFin Cloud Multi-Usuario</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {currentUser 
              ? 'Gestión de Cuentas' 
              : mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Nueva Cuenta' : 'Acceso Rápido'}
          </h2>

          <p className="text-xs text-slate-400">
            {currentUser 
              ? `Sesión activa como ${currentUser.displayName}` 
              : 'Tus finanzas seguras y sincronizadas en todos tus dispositivos.'}
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* If user is logged in, show Current Account & Saved Accounts Switcher */}
        {currentUser && mode === 'accounts' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{currentUser.displayName}</h4>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">Activa</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Otras Cuentas Guardadas:</h4>
              {savedAccounts.filter(a => a.uid !== currentUser.uid).length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No hay otras cuentas registradas en este dispositivo.</p>
              ) : (
                savedAccounts.filter(a => a.uid !== currentUser.uid).map(acc => (
                  <div key={acc.uid} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500 transition-all">
                    <button onClick={() => switchAccount(acc.uid)} className="flex items-center gap-2.5 text-left flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
                        {acc.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-white">{acc.displayName}</p>
                        <p className="text-[10px] text-slate-400">{acc.email}</p>
                      </div>
                    </button>
                    <button onClick={() => deleteAccountLocal(acc.uid)} className="text-slate-500 hover:text-rose-400 text-xs px-2">✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => setMode('login')}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
              >
                + Agregar Cuenta
              </button>
              <button
                onClick={logout}
                className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 transition-colors flex items-center gap-1.5"
              >
                <LogOut size={15} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Google 1-Click Sign-In Button */}
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 active:scale-95 border border-slate-200"
            >
              {/* Official Google SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500 font-semibold uppercase">o con tu correo</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Form Modes Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-1.5 rounded-xl font-bold transition-all ${mode === 'login' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-1.5 rounded-xl font-bold transition-all ${mode === 'register' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Registro
              </button>
              <button
                type="button"
                onClick={() => setMode('guest')}
                className={`py-1.5 rounded-xl font-bold transition-all ${mode === 'guest' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Invitado
              </button>
            </div>

            {/* Forms */}
            {mode === 'guest' ? (
              <form onSubmit={handleGuestSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Alias o Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Ej: Gustavo, Mi Empresa..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
                >
                  Entrar como Invitado →
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Nombre o Alias</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        required
                        placeholder="Ej: Gustavo / Mi Negocio"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
                >
                  {isLoading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión →' : 'Crear Cuenta y Entrar →'}
                </button>
              </form>
            )}

            {/* Saved Accounts Quick Switch Link */}
            {savedAccounts.length > 0 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('accounts')}
                  className="text-xs text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <Users size={13} />
                  <span>Ver cuentas guardadas ({savedAccounts.length})</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
