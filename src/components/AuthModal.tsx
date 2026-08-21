import React, { useState } from 'react';
import { 
  Cloud, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Globe
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    supabaseUser, 
    loginWithSupabase, 
    signupWithSupabase, 
    logoutSupabase,
    syncLocalToCloud,
    isCloudConnected 
  } = useFinancial();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginWithSupabase(email.trim(), password);
        if (!res.success) {
          setErrorMsg(res.error || 'Error al iniciar sesión. Verifica tu email y contraseña.');
        } else {
          setSuccessMsg('¡Sesión iniciada con éxito! Sincronizando tus datos...');
          setTimeout(() => setIsAuthModalOpen(false), 1200);
        }
      } else {
        const res = await signupWithSupabase(email.trim(), password, displayName.trim());
        if (!res.success) {
          setErrorMsg(res.error || 'Error al crear la cuenta en Supabase.');
        } else {
          setSuccessMsg('¡Cuenta creada con éxito! Tus datos ahora están en la nube.');
          setTimeout(() => setIsAuthModalOpen(false), 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 my-auto text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <Cloud size={14} className="text-emerald-400" />
            <span>Supabase Cloud Sync</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {supabaseUser ? 'Tu Cuenta en la Nube' : mode === 'login' ? 'Iniciar Sesión en GastFin' : 'Crear Cuenta Multiusuario'}
          </h2>

          <p className="text-xs text-slate-400">
            {supabaseUser
              ? 'Tus datos están conectados y protegidos en tiempo real con Supabase PostgreSQL.'
              : 'Accede a tus movimientos, presupuestos y metas desde tu PC, celular o web.'}
          </p>
        </div>

        {/* If Already Logged In */}
        {supabaseUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Estado de Conexión:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>En Línea (Supabase)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{supabaseUser.email}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={syncLocalToCloud}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-2"
              >
                <Database size={15} />
                <span>Sincronizar Todos los Datos a la Nube</span>
              </button>

              <button
                onClick={logoutSupabase}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-slate-700 hover:border-rose-500/40 transition-colors"
              >
                Cerrar Sesión (Volver a Modo Local)
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-800 border border-slate-700 text-xs mb-5 font-bold">
              <button
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`py-2 rounded-xl transition-all ${
                  mode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`py-2 rounded-xl transition-all ${
                  mode === 'signup' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Nombre o Alias</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Gustavo"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Conectando con Supabase...</span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Acceder a mi Cuenta' : 'Registrar y Sincronizar'}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-white transition-colors underline"
                >
                  Continuar en Modo Local / Sin Conexión
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
