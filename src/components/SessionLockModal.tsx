import React from 'react';
import { ShieldCheck, Lock, Unlock, LogOut, Clock, Sparkles } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const SessionLockModal: React.FC = () => {
  const { 
    isSessionLocked, 
    unlockSession, 
    logoutUser, 
    userName 
  } = useFinancial();

  if (!isSessionLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        {/* Banking Security Shield Icon */}
        <div className="mx-auto relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center shadow-glow-emerald">
          <Lock className="w-10 h-10 text-emerald-400" />
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400">
            <Clock size={14} />
          </div>
        </div>

        {/* Security Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck size={14} />
            <span>Protección de Seguridad Bancaria</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Sesión Bloqueada por Inactividad
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Hola <strong className="text-white">{userName || 'Usuario'}</strong>, por tu seguridad y privacidad financiera, la sesión se suspendió tras 15 minutos sin actividad.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={unlockSession}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-glow-emerald hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock size={18} strokeWidth={2.5} />
            <span>Reanudar Mi Sesión</span>
          </button>

          <button
            type="button"
            onClick={logoutUser}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/60"
          >
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Encryption footnote */}
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <span>🔒 Cifrado de grado bancario local activo</span>
        </p>

      </div>
    </div>
  );
};
