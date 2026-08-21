import React, { useState } from 'react';
import { Coins, Check, Sparkles, User, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { SUPPORTED_CURRENCIES } from '../data/initialData';

export const CurrencySetupModal: React.FC = () => {
  const { 
    isCurrencySetupModalOpen, 
    currentCurrency, 
    userName,
    lockAndSetCurrencyAndName 
  } = useFinancial();

  const [inputName, setInputName] = useState(userName || 'Gustavo');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currentCurrency.code);

  if (!isCurrencySetupModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = inputName.trim() || 'Emprendedor';
    lockAndSetCurrencyAndName(selectedCurrencyCode, finalName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50">
        
        {/* Top Badge & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-emerald-400" />
            <span>¡Bienvenido a GastFin!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ¿Cómo quieres que te llamemos?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Personalizaremos tus dashboards ejecutivos, métricas y reportes con tu nombre o el de tu empresa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Large Name Input Box */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/90 space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <User size={15} className="text-emerald-400" />
              <span>Tu Nombre o Nombre de tu Proyecto / Empresa:</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: Carlos, María, Innova Tech, Mi Negocio..."
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
                <span>¿En qué divisa principal prefieres trabajar?</span>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">Formato con puntos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
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
                    <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Ejemplo:</span>
                      <span className="font-mono font-bold text-emerald-400">{curr.example}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              🔒 Tus datos se guardan de forma privada en tu navegador.
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
