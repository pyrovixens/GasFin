import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Coins
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { supabase } from '../services/supabase';
import { timingSafeEqual, securityRateLimiter, maskEmail } from '../services/securityService';

interface AuthModalProps {
  isFullScreen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isFullScreen = false }) => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    supabaseUser, 
    setSupabaseUser,
    loadCloudData,
    loginWithSupabase, 
    signupWithSupabase, 
    fullSignOut,
    userPIN,
    savedAuthEmail,
    setUserName,
    triggerCelebration,
    unlockApp
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

  const effectivePin = userPIN || (typeof window !== 'undefined' ? localStorage.getItem('gastfin_user_pin_v1') : null);
  const effectiveEmail = savedAuthEmail || (typeof window !== 'undefined' ? localStorage.getItem('gastfin_saved_auth_email') : '') || '';

  // Initialize: if device has a saved PIN, open in PIN mode by default
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEnteredPin('');
    setEmail(''); // Blank by default for native browser autofill
    
    if (effectivePin) {
      setAuthMode('pin');
    } else {
      setAuthMode('login');
    }
  }, [isAuthModalOpen, isFullScreen, effectivePin]);

  if (!isFullScreen && !isAuthModalOpen) return null;

  // Handle Quick PIN Login: verifies PIN with rate limiting, loads cloud data, and enters immediately
  const processPinCheck = async (pinToTest: string) => {
    if (!effectivePin) return;

    // Check rate limit
    const lockStatus = securityRateLimiter.isLocked('pin_auth');
    if (lockStatus.locked) {
      setErrorMsg(`Demasiados intentos fallidos. Por seguridad, espera ${lockStatus.waitSeconds} segundos.`);
      setEnteredPin('');
      return;
    }

    if (timingSafeEqual(pinToTest, effectivePin)) {
      securityRateLimiter.recordSuccess('pin_auth');
      setErrorMsg(null);
      setSuccessMsg('¡PIN verificado! Accediendo...');
      
      // Ensure Supabase session is attached and load full cloud data
      try {
        const { data: sessData } = await supabase.auth.getSession();
        if (sessData?.session?.user) {
          setSupabaseUser(sessData.session.user);
          await loadCloudData(sessData.session.user.id);
        }
      } catch (err) {
        console.warn('Session verify on PIN warning:', err);
      }

      unlockApp();
      triggerCelebration();
    } else {
      securityRateLimiter.recordFailure('pin_auth', 5, 30000);
      const updatedLock = securityRateLimiter.isLocked('pin_auth');
      if (updatedLock.locked) {
        setErrorMsg(`Demasiados intentos fallidos. Bloqueado temporalmente por ${updatedLock.waitSeconds}s.`);
      } else {
        setErrorMsg('PIN incorrecto. Intenta de nuevo o ingresa con contraseña.');
      }
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

  // Handle Email & Password Submit: logs in directly without PIN
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
          setSuccessMsg('¡Acceso concedido! Entrando...');
          unlockApp();
          triggerCelebration();
        }
      } else {
        // Signup
        const res = await signupWithSupabase(cleanEmail, cleanPassword, displayName.trim());
        if (!res.success) {
          setErrorMsg(res.error || 'Error al crear la cuenta financiera.');
        } else {
          if (displayName.trim()) setUserName(displayName.trim());
          setSuccessMsg('¡Cuenta creada con éxito! Bienvenido.');
          unlockApp();
          triggerCelebration();
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
          {authMode === 'pin' 
            ? 'Acceso Rápido con PIN' 
            : authMode === 'login' 
              ? 'Iniciar Sesión' 
              : 'Crear Cuenta Financiera'}
        </h2>

        <p className="text-xs text-slate-400">
          {authMode === 'pin'
            ? 'Digita tu PIN de 4 dígitos para consultar tus finanzas.'
            : 'Ingresa tu correo y contraseña para acceder a tus registros.'}
        </p>
      </div>

      {authMode === 'pin' ? (
        
        /* ---------------- MODE 1: QUICK PIN LOGIN (NO PASSWORD PROMPT) ---------------- */
        <form onSubmit={handlePinLogin} className="space-y-4">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
              <User size={15} className="text-emerald-400 flex-shrink-0" />
              <span className="font-bold truncate">{effectiveEmail || 'Usuario Registrado'}</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await fullSignOut();
                setAuthMode('login');
                setErrorMsg(null);
              }}
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
              onClick={async () => { 
                await fullSignOut(); 
                setAuthMode('login'); 
                setErrorMsg(null); 
              }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Mail size={13} className="text-emerald-400" />
              <span>O ingresar con correo electrónico y contraseña</span>
            </button>
          </div>
        </form>

      ) : (

        /* ---------------- MODE 2 & 3: EMAIL & PASSWORD (NO PIN PROMPT) ---------------- */
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
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Nombre o Titular de la Cuenta</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="text"
                  required
                  placeholder="Ingresa tu nombre o empresa..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Email: Completely Blank by Default */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="email"
                required
                autoComplete="email"
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
                autoComplete="current-password"
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
                  <span>{authMode === 'login' ? 'Ingresar al Sistema' : 'Registrar Cuenta'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {effectivePin && (
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
