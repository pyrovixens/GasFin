import React, { useState } from 'react';
import { ShieldCheck, KeyRound, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const PinSetupPromptModal: React.FC = () => {
  const { 
    isPinPromptOpen, 
    setIsPinPromptOpen, 
    setUserPIN, 
    triggerCelebration,
    userName 
  } = useFinancial();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isPinPromptOpen) return null;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setErrorMsg('El PIN debe contener exactamente 4 dígitos numéricos.');
      return;
    }
    if (confirmPin && pin !== confirmPin) {
      setErrorMsg('Los códigos PIN no coinciden.');
      return;
    }

    setUserPIN(pin);
    triggerCelebration();
    setIsPinPromptOpen(false);
  };

  const handleSkip = () => {
    setIsPinPromptOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 my-auto text-slate-100 text-center space-y-5">
        
        {/* Close / Skip button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center shadow-glow-emerald">
          <KeyRound className="w-8 h-8 text-emerald-400" />
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Acceso Rápido y Seguro</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ¿Deseas crear un PIN de 4 dígitos?
          </h2>

          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Hola <strong className="text-white">{userName || 'Usuario'}</strong>, puedes activar un código PIN numérico de 4 dígitos para ingresar a tu cuenta de forma instantánea sin escribir tu contraseña completa cada vez.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSavePin} className="space-y-4 pt-1">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Escribe tu nuevo PIN (4 dígitos)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              autoFocus
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setErrorMsg(null);
              }}
              className="w-44 mx-auto px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-center text-2xl tracking-widest focus:outline-none focus:border-emerald-500"
            />
          </div>

          {pin.length === 4 && (
            <div className="space-y-2 animate-fade-in">
              <label className="block text-xs font-bold text-slate-300">
                Confirma tu PIN de 4 dígitos
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, ''));
                  setErrorMsg(null);
                }}
                className="w-44 mx-auto px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-center text-2xl tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-400 font-bold animate-shake">{errorMsg}</p>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={pin.length !== 4 || (confirmPin.length > 0 && pin !== confirmPin)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-glow-emerald transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>Guardar PIN y Activar Acceso Rápido</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Omitir por ahora (ingresar con contraseña)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
