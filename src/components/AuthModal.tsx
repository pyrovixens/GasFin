import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  KeyRound,
  X, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Coins,
  RefreshCw
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

interface AuthModalProps {
  isFullScreen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isFullScreen = false }) => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    supabaseUser, 
    loginWithSupabase, 
    signupWithSupabase, 
    logoutSupabase,
    syncLocalToCloud,
    userPIN,
    savedAuthEmail,
    setSavedAuthEmail,
    userName,
    setUserName,
    triggerCelebration
  } = useFinancial();

  // Mode: 'pin' (if configured), 'login' (email + password), 'signup' (create account)
  const [authMode, setAuthMode] = useState<'pin' | 'login' | 'signup'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize mode and email
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEnteredPin('');
    
    const remembered = savedAuthEmail || (supabaseUser?.email ?? '') || (userName !== 'Usuario' ? userName : '');
    if (remembered) {
      setEmail(remembered);
    }

    setAuthMode('login');
  }, [isAuthModalOpen, isFullScreen, savedAuthEmail, supabaseUser, userName]);

  if (!isFullScreen && !isAuthModalOpen) return null;

  // Handle Quick PIN Login with auto-check
  const processPinCheck = (pinToTest: string) => {
    const effectivePin = userPIN || localStorage.getItem('gastfin_user_pin_v1');
    if (!effectivePin) return;

    if (pinToTest === effectivePin) {
      setErrorMsg(null);
      setSuccessMsg('¡PIN verificado! Accediendo...');
      sessionStorage.setItem('gastfin_unlocked_current_session', 'true');
      triggerCelebration();
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 400);
    } else {
      setErrorMsg('PIN incorrecto. Intenta de nuevo o ingresa con contraseña.');
      setEnteredPin('');
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setEnteredPin(val);
    setErrorMsg(null);
    if (val.length === 4) {
      processPinCheck(val);
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.length === 4) {
      processPinCheck(enteredPin);
    }
  };

  // Handle Standard Email & Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password;

    try {
      if (authMode === 'login') {
        const res = await loginWithSupabase(cleanEmail, cleanPassword);
        if (!res.success) {
          if (res.error?.includes('rate limit')) {
            setErrorMsg('Límite de intentos alcanzado. Por favor espera unos instantes.');
          } else {
            setErrorMsg(res.error || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
          }
        } else {
          setSavedAuthEmail(cleanEmail);
          setSuccessMsg('¡Acceso concedido! Cargando estado de cuenta...');
          sessionStorage.setItem('gastfin_unlocked_current_session', 'true');
          triggerCelebration();
          
          setTimeout(() => {
            setIsAuthModalOpen(false);
          }, 500);
        }
      } else {
        // Signup
        const res = await signupWithSupabase(cleanEmail, cleanPassword, displayName.trim());
        if (!res.success) {
          setErrorMsg(res.error || 'Error al crear la cuenta financiera.');
        } else {
          setSavedAuthEmail(cleanEmail);
          if (displayName.trim()) setUserName(displayName.trim());
          setSuccessMsg('¡Cuenta financiera creada con éxito! Bienvenido a GastFin.');
          sessionStorage.setItem('gastfin_unlocked_current_session', 'true');
          triggerCelebration();
          
          setTimeout(() => {
            setIsAuthModalOpen(false);
          }, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión. Verifica tu red e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerClass = isFullScreen
    ? "relative w-full max-w-md bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/80 text-slate-100 backdrop-blur-2xl animate-fade-in"
    : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto select-none";

  const modalBody = (
    <div className={isFullScreen ? "" : "relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 my-auto text-slate-100"}>
      
      {/* Close Button (only if not fullscreen gatekeeper) */}
      {!isFullScreen && (
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X size={18} />
        </button>
      )}

      {/* Header Icon & Title */}
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center shadow-glow-emerald">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
          <Lock size={12} className="text-emerald-400" />
          <span>Acceso Bancario Seguro</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {supabaseUser 
            ? 'Estado de Cuenta Activo' 
            : authMode === 'pin' 
              ? 'Acceso Rápido con PIN' 
              : authMode === 'login' 
                ? 'Iniciar Sesión' 
                : 'Crear Cuenta Financiera'}
        </h2>

        <p className="text-xs text-slate-400">
          {authMode === 'pin'
            ? 'Digita tu PIN de 4 dígitos para consultar tus finanzas.'
            : 'Ingresa tu correo y clave de seguridad para consultar tus registros.'}
        </p>
      </div>

      {/* If Already Logged In */}
      {supabaseUser ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Estado de Seguridad:</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 size={14} />
                <span>Sesión Protegida y Activa</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Titular de Cuenta:</span>
              <span className="text-xs font-mono font-bold text-white truncate max-w-[200px]">
                {supabaseUser.email}
              </span>
            </div>
            {(userPIN || localStorage.getItem('gastfin_user_pin_v1')) && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-xs text-slate-400">Acceso Rápido:</span>
                <span className="text-xs font-bold text-emerald-300">PIN de 4 dígitos configurado</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                syncLocalToCloud();
                triggerCelebration();
              }}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700"
            >
              <RefreshCw size={14} className="text-emerald-400" />
              <span>Actualizar Estado de Cuenta</span>
            </button>

            <button
              type="button"
              onClick={logoutSupabase}
              className="w-full py-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-rose-500/30"
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      ) : authMode === 'pin' ? (
        
        /* ---------------- MODE 1: QUICK PIN LOGIN ---------------- */
        <form onSubmit={handlePinLogin} className="space-y-4">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
              <User size={15} className="text-emerald-400 flex-shrink-0" />
              <span className="font-bold truncate">{email || userName || 'Usuario'}</span>
            </div>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="text-[11px] text-emerald-400 hover:underline font-bold flex-shrink-0 ml-2 cursor-pointer"
            >
              Cambiar
            </button>
          </div>

          <div className="space-y-2 text-center">
            <label className="block text-xs font-bold text-slate-300">
              PIN de Seguridad (4 dígitos):
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              autoFocus
              placeholder="••••"
              value={enteredPin}
              onChange={handlePinChange}
              className="w-44 mx-auto px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-center text-2xl tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-bold text-center animate-shake">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 font-bold text-center">{successMsg}</p>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={enteredPin.length !== 4}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-glow-emerald transition-all cursor-pointer disabled:opacity-40"
            >
              Ingresar al Sistema
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              O ingresar con correo y contraseña
            </button>
          </div>
        </form>

      ) : (

        /* ---------------- MODE 2 & 3: EMAIL & PASSWORD ---------------- */
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          
          {/* Mode Toggle (Login vs Signup) */}
          <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Display Name (Only on Signup) */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Nombre o Titular</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="text"
                  required
                  placeholder="Ej. Gustavo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Contraseña de Seguridad</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-bold text-center animate-shake">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 font-bold text-center">{successMsg}</p>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-glow-emerald transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Acceder a mi Cuenta' : 'Registrar Cuenta'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {(userPIN || localStorage.getItem('gastfin_user_pin_v1')) && (
              <button
                type="button"
                onClick={() => { setAuthMode('pin'); setErrorMsg(null); }}
                className="w-full py-2 text-xs text-emerald-400 hover:underline font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <KeyRound size={13} />
                <span>Ingresar con PIN de 4 dígitos</span>
              </button>
            )}
          </div>

        </form>
      )}

    </div>
  );

  if (isFullScreen) {
    return (
      <div className={containerClass}>
        {modalBody}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {modalBody}
    </div>
  );
};
