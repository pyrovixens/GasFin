import React, { useState } from 'react';
import { 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  X, 
  CreditCard, 
  FileText, 
  Sparkles,
  Info,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

interface DetectedCMFDebt {
  institution: string;
  debtType: 'Crédito de Consumo' | 'Tarjeta de Crédito' | 'Línea de Sobregiro' | 'Crédito Hipotecario' | 'Crédito Automotriz' | 'Otro';
  amount: string;
  monthlyPayment: string;
  interestRate: string;
}

const COMMON_CHILEAN_BANKS = [
  'BancoEstado',
  'Banco de Chile / Edwards',
  'Banco Santander Chile',
  'BCI (Banco de Crédito e Inversiones)',
  'Scotiabank Chile',
  'Banco Itaú Chile',
  'Banco Falabella / CMR',
  'Tarjeta Cencosud Scotiabank',
  'Banco Ripley',
  'Tarjeta Lider Bci',
  'Crédito Hipotecario / Mutuaria',
  'Crédito Automotriz (Forum / Tanner)',
  'Coopeuch / Caja de Compensación',
  'Otra Institución Financiera'
];

export const CMFDebtSyncModal: React.FC = () => {
  const { 
    isCMFModalOpen, 
    setIsCMFModalOpen, 
    addDebt, 
    formatMoney, 
    formatInputLive, 
    parseRawFromDisplay, 
    currentCurrency 
  } = useFinancial();

  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Quick form items
  const [debtsToAdd, setDebtsToAdd] = useState<DetectedCMFDebt[]>([
    {
      institution: 'Banco de Chile / Edwards',
      debtType: 'Crédito de Consumo',
      amount: '',
      monthlyPayment: '',
      interestRate: '1.2'
    }
  ]);

  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  if (!isCMFModalOpen) return null;

  const handleAddDebtRow = () => {
    setDebtsToAdd(prev => [
      ...prev,
      {
        institution: 'BancoEstado',
        debtType: 'Tarjeta de Crédito',
        amount: '',
        monthlyPayment: '',
        interestRate: '1.5'
      }
    ]);
  };

  const handleRemoveDebtRow = (index: number) => {
    setDebtsToAdd(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof DetectedCMFDebt, value: string) => {
    setDebtsToAdd(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleImportToGastFin = (e: React.FormEvent) => {
    e.preventDefault();
    let count = 0;

    debtsToAdd.forEach(d => {
      const rawAmount = parseRawFromDisplay(d.amount);
      const rawMonthly = parseRawFromDisplay(d.monthlyPayment) || Math.round(rawAmount * 0.05);
      const rawRate = parseFloat(d.interestRate) || 1.5;

      if (rawAmount > 0) {
        addDebt({
          name: `${d.institution} - ${d.debtType}`,
          category: d.debtType.includes('Tarjeta') ? 'Tarjeta de Crédito' : d.debtType.includes('Hipotecario') ? 'Crédito Hipotecario' : 'Préstamo Bancario',
          totalAmount: rawAmount,
          remainingAmount: rawAmount,
          interestRate: rawRate,
          minimumPayment: rawMonthly > 0 ? rawMonthly : Math.round(rawAmount * 0.05),
          dueDate: 5,
        });
        count++;
      }
    });

    if (count > 0) {
      setIsSuccessMessage(true);
      setTimeout(() => {
        setIsSuccessMessage(false);
        setIsCMFModalOpen(false);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Header with CMF Badge and Close 'X' */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-blue-500/10 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  CMF Chile Oficial
                </span>
                <span className="text-[10px] text-slate-400">Conoce Tu Deuda</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                Enlace de Deudas Bancarias & Financieras
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCMFModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeStep === 1 
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>1. Obtener Informe CMF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeStep === 2 
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Incorporar Deudas a GastFin</span>
          </button>
        </div>

        {/* STEP 1: GUIDE TO OFFICIAL CMF PORTAL */}
        {activeStep === 1 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                <ShieldCheck size={18} className="text-sky-400" />
                <span>¿Cómo funciona el Informe de Deudas de la CMF?</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                La <strong>Comisión para el Mercado Financiero (CMF)</strong> emite el informe oficial que consolida todas las deudas vigentes que tienes en bancos, cooperativas e instituciones fiscalizadas de Chile (créditos de consumo, tarjetas, hipotecas y líneas de crédito).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-white text-sm">Pasos sencillos para obtener tu informe gratis:</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>Ingresa al portal oficial de la CMF pulsando el botón azul abajo.</li>
                <li>Inicia sesión de forma segura con tu <strong>ClaveÚnica del Estado</strong> o Clave CMF.</li>
                <li>Visualiza o descarga tu <strong>Informe de Deudas consolidado</strong> en PDF.</li>
                <li>Pasa al <strong>Paso 2</strong> aquí en GastFin para ingresar los montos y activar la estrategia Bola de Nieve.</li>
              </ol>
            </div>

            {/* Official Link Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://conocetudeuda.cmfchile.cl/informe-deudas/629/w4-contents.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Abrir «Conoce tu Deuda» en CMF Chile</span>
                <ExternalLink size={15} />
              </a>

              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Siguiente: Cargar Deudas</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REGISTER & LOAD CMF DEBTS */}
        {activeStep === 2 && (
          <form onSubmit={handleImportToGastFin} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">
                Registra las deudas que aparecen en tu informe oficial de la CMF:
              </p>
              <button
                type="button"
                onClick={handleAddDebtRow}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Agregar Otra Deuda</span>
              </button>
            </div>

            {/* Rows List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {debtsToAdd.map((row, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-sky-400">Deuda #{idx + 1}</span>
                    {debtsToAdd.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDebtRow(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                        title="Quitar"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Institution */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Institución / Banco</label>
                      <select
                        value={row.institution}
                        onChange={(e) => handleUpdateRow(idx, 'institution', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-sky-500"
                      >
                        {COMMON_CHILEAN_BANKS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Debt Type */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Tipo de Obligación</label>
                      <select
                        value={row.debtType}
                        onChange={(e) => handleUpdateRow(idx, 'debtType', e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-sky-500"
                      >
                        <option value="Crédito de Consumo">Crédito de Consumo</option>
                        <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                        <option value="Línea de Sobregiro">Línea de Sobregiro</option>
                        <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                        <option value="Crédito Automotriz">Crédito Automotriz</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Monto Total Deuda ({currentCurrency.symbol})</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="Ej: 1.500.000"
                        value={row.amount}
                        onChange={(e) => handleUpdateRow(idx, 'amount', formatInputLive(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Monthly Payment */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Cuota / Pago Mensual</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 65.000"
                        value={row.monthlyPayment}
                        onChange={(e) => handleUpdateRow(idx, 'monthlyPayment', formatInputLive(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Success feedback */}
            {isSuccessMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} />
                <span>¡Deudas incorporadas con éxito al optimizador de GastFin!</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCMFModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={15} />
                <span>Incorporar a Mis Deudas</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
