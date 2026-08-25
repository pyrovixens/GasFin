import React, { useState } from 'react';
import { Coins, Sparkles, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { SUPPORTED_CURRENCIES } from '../data/initialData';

export const CurrencySetupModal: React.FC = () => {
  const { 
    isCurrencySetupModalOpen, 
    setIsCurrencySetupModalOpen,
    currentCurrency, 
    userName,
    lockAndSetCurrencyAndName 
  } = useFinancial();

  const [inputName, setInputName] = useState(userName || '');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currentCurrency.code);

  if (!isCurrencySetupModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = inputName.trim() || 'Usuario';
    lockAndSetCurrencyAndName(selectedCurrencyCode, finalName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-emerald-950/50 my-auto">
        
        {/* Top-right close X */}
        <button
          type="button"
          onClick={() => setIsCurrencySetupModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          ✕
        </button>

        {/* Top Badge & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Perfil & Divisa Contable</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Personalización de Cuenta
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Configura tu nombre de titular y la divisa principal para el cálculo de balances y presupuestos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* Alias / Name Input Box */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/90 space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <User size={15} className="text-emerald-400" />
              <span>Nombre o Titular de la Cuenta</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ingresa tu nombre o empresa..."
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
                <span>Divisa Principal del Libro Mayor</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_CURRENCIES.map((curr) => {
                const isSelected = selectedCurrencyCode === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setSelectedCurrencyCode(curr.code)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-glow-emerald ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-emerald-400">{curr.symbol}</span>
                      <span className="text-[10px] font-bold text-slate-400">{curr.code}</span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1 truncate">{curr.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-glow-emerald transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Guardar Configuración</span>
            <ArrowRight size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};
