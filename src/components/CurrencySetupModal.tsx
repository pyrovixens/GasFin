import React, { useState } from 'react';
import { Coins, Sparkles, User, ArrowRight, Cloud, Lock } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { SUPPORTED_CURRENCIES } from '../data/initialData';

export const CurrencySetupModal: React.FC = () => {
  const { 
    isCurrencySetupModalOpen, 
    setIsCurrencySetupModalOpen,
    currentCurrency, 
    userName,
    supabaseUser,
    setIsAuthModalOpen,
    lockAndSetCurrencyAndName 
  } = useFinancial();

  // Clean empty input for first launch
  const [inputName, setInputName] = useState(userName || '');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currentCurrency.code);

  if (!isCurrencySetupModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = inputName.trim() || 'Usuario';
    lockAndSetCurrencyAndName(selectedCurrencyCode, finalName);
  };

  const handleOpenAuth = () => {
    setIsCurrencySetupModalOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-emerald-950/50 my-auto">
        
        {/* Top Badge & Header */}
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-emerald-400" />
            <span>¡Bienvenido a GastFin!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configuración de Acceso
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Puedes sincronizar tus datos en la nube de GastFin o comenzar de inmediato en modo local.
          </p>
        </div>

        {/* Cloud Login / Register Banner */}
        {!supabaseUser && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-800/80 to-emerald-950/50 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-indigo-400" />
                <span className="font-extrabold text-white text-xs">¿Deseas acceder desde cualquier dispositivo?</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Recomendado
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Inicia sesión o crea tu cuenta gratuita para guardar tus finanzas en el servidor seguro en tiempo real.
            </p>
            <button
              type="button"
              onClick={handleOpenAuth}
              className="w-full mt-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Lock size={14} />
              <span>🔐 Iniciar Sesión o Registrarse en la Nube</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          <div className="flex items-center gap-2">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">o continúa en modo local</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Alias / Name Input Box */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/90 space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <User size={15} className="text-emerald-400" />
              <span>¿Cuál es tu Alias o Nombre?</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ingresa tu alias o nombre aquí..."
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 text-white font-black text-base placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Currency Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Coins size={15} className="text-amber-400" />
                <span>¿En qué divisa prefieres trabajar?</span>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">Formato con puntos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {SUPPORTED_CURRENCIES.map((curr) => {
                const isSelected = selectedCurrencyCode === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setSelectedCurrencyCode(curr.code)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500 shadow-glow-emerald text-white ring-1 ring-emerald-500'
                        : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">{curr.code} ({curr.symbol})</span>
                      <span className="text-[11px] font-semibold text-slate-400">{curr.country}</span>
                    </div>
                    <div className="mt-1 pt-1 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Ejemplo:</span>
                      <span className="font-mono font-bold text-emerald-400">{curr.example}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              🔒 Tus datos se guardan de forma privada.
            </span>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-glow-emerald hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>¡Comenzar con GastFin!</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
