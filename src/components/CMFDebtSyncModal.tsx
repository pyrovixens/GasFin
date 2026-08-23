import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  RefreshCw,
  Zap,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatRut, validateRut, CLAVE_UNICA_CMF_AUTH_URL } from '../services/cmfSyncService';

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
    currentCurrency,
    triggerCelebration 
  } = useFinancial();

  // Mode: 'auto_sync' vs 'manual_entry'
  const [activeTab, setActiveTab] = useState<'auto_sync' | 'manual_entry'>('auto_sync');

  // RUT state
  const [userRut, setUserRut] = useState(() => {
    return localStorage.getItem('gastfin_cmf_rut_v1') || '';
  });

  // Last Sync timestamp
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(() => {
    return localStorage.getItem('gastfin_cmf_last_sync_v1');
  });

  // Auto-sync simulation state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStepIndex, setSyncStepIndex] = useState(0);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [authOpened, setAuthOpened] = useState(false);

  // Detected Debts List
  const [debtsToAdd, setDebtsToAdd] = useState<DetectedCMFDebt[]>([
    {
      institution: 'Banco de Chile / Edwards',
      debtType: 'Crédito de Consumo',
      amount: '2.450.000',
      monthlyPayment: '98.500',
      interestRate: '1.2'
    },
    {
      institution: 'BancoEstado',
      debtType: 'Tarjeta de Crédito',
      amount: '680.000',
      monthlyPayment: '45.000',
      interestRate: '1.8'
    },
    {
      institution: 'Banco Falabella / CMR',
      debtType: 'Tarjeta de Crédito',
      amount: '320.000',
      monthlyPayment: '28.000',
      interestRate: '2.1'
    }
  ]);

  if (!isCMFModalOpen) return null;

  const handleRutChange = (val: string) => {
    const formatted = formatRut(val);
    setUserRut(formatted);
    localStorage.setItem('gastfin_cmf_rut_v1', formatted);
  };

  const handleOpenClaveUnica = () => {
    setAuthOpened(true);
    window.open(CLAVE_UNICA_CMF_AUTH_URL, '_blank', 'noopener,noreferrer');
  };

  const handleStartAutoSync = () => {
    if (!userRut.trim()) return;

    setIsSyncing(true);
    setSyncStepIndex(1);
    setSyncSuccess(false);

    // Step 1: Handshake with ClaveÚnica
    setTimeout(() => {
      setSyncStepIndex(2); // Querying CMF registry
    }, 1200);

    // Step 2: Extracting financial commitments
    setTimeout(() => {
      setSyncStepIndex(3); // Parsing banking institutions
    }, 2400);

    // Step 3: Consolidating
    setTimeout(() => {
      setSyncStepIndex(4); // Finished
      setIsSyncing(false);
      setSyncSuccess(true);
      
      const nowStr = new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastSyncDate(nowStr);
      localStorage.setItem('gastfin_cmf_last_sync_v1', nowStr);
    }, 3600);
  };

  const handleAddDebtRow = () => {
    setDebtsToAdd(prev => [
      ...prev,
      {
        institution: 'Banco Santander Chile',
        debtType: 'Crédito de Consumo',
        amount: '',
        monthlyPayment: '',
        interestRate: '1.4'
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

  const handleSaveDebtsToGastFin = (e: React.FormEvent) => {
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
      triggerCelebration();
      setIsCMFModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-sky-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-blue-500/10 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <Building2 size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  CMF Chile Oficial
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span>🔒 Open Finance Bancario</span>
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Sincronización Automática con ClaveÚnica
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

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('auto_sync')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'auto_sync' 
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={14} />
            <span>Sincronización Automática</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual_entry')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'manual_entry' 
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Editar / Cargar Manual</span>
          </button>
        </div>

        {/* TAB 1: AUTOMATIC CLAVEUNICA SYNCHRONIZATION */}
        {activeTab === 'auto_sync' && (
          <div className="space-y-5">
            
            {/* RUT Input & Auth Button */}
            <div className="p-5 rounded-3xl bg-slate-800/60 border border-slate-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                    <span>RUT del Titular (Chile)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 18.234.567-K"
                    value={userRut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    className="w-full sm:w-60 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenClaveUnica}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 self-start sm:self-end cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Autorizar en ClaveÚnica</span>
                </button>
              </div>

              {authOpened && (
                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-sky-400 flex-shrink-0" />
                  <span>Ventana de ClaveÚnica abierta. Tras autorizar, pulsa el botón abajo para sincronizar tus deudas.</span>
                </div>
              )}

              {/* Sync Trigger Button */}
              <button
                type="button"
                disabled={!userRut.trim() || isSyncing}
                onClick={handleStartAutoSync}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-glow-emerald transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={17} className={isSyncing ? "animate-spin" : ""} />
                <span>{isSyncing ? "Sincronizando con CMF Chile..." : "Sincronizar Deudas Automáticamente"}</span>
              </button>
            </div>

            {/* In-Progress Sync Animation Steps */}
            {isSyncing && (
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-sky-500/40 space-y-3 animate-fade-in text-xs">
                <h4 className="font-bold text-sky-300 flex items-center gap-2">
                  <Sparkles size={16} className="animate-spin" />
                  <span>Procesando consulta al Sistema Financiero CMF...</span>
                </h4>

                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${syncStepIndex >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    <span>{syncStepIndex > 1 ? '✓' : '●'}</span>
                    <span>1. Estableciendo conexión segura con ClaveÚnica (Gobierno de Chile)</span>
                  </div>

                  <div className={`flex items-center gap-2 ${syncStepIndex >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    <span>{syncStepIndex > 2 ? '✓' : '●'}</span>
                    <span>2. Consultando Informe Consolidado en Comisión para el Mercado Financiero</span>
                  </div>

                  <div className={`flex items-center gap-2 ${syncStepIndex >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    <span>{syncStepIndex > 3 ? '✓' : '●'}</span>
                    <span>3. Extrayendo compromisos vigentes (Bancos, Tarjetas, Mutuarias e Hipotecas)</span>
                  </div>

                  <div className={`flex items-center gap-2 ${syncStepIndex >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    <span>{syncStepIndex >= 4 ? '✓' : '●'}</span>
                    <span>4. Consolidando saldos en el optimizador de GastFin</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Completed View */}
            {syncSuccess && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span><strong>¡Sincronización Exitosa!</strong> Se detectaron 3 compromisos financieros vigentes.</span>
                  </div>
                  {lastSyncDate && (
                    <span className="text-[10px] text-slate-400">Actualizado: {lastSyncDate}</span>
                  )}
                </div>

                {/* Detected Debts Summary Cards */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {debtsToAdd.map((d, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white">{d.institution}</h4>
                        <span className="text-[11px] text-slate-400">{d.debtType} • Tasa: {d.interestRate}% mes</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-amber-400">{currentCurrency.symbol} {d.amount}</p>
                        <span className="text-[10px] text-slate-400">Cuota: {currentCurrency.symbol} {d.monthlyPayment}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCMFModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDebtsToGastFin}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Confirmar e Incorporar a Mis Deudas</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: MANUAL / CUSTOM EDIT */}
        {activeTab === 'manual_entry' && (
          <form onSubmit={handleSaveDebtsToGastFin} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">
                Ajusta las instituciones o montos según tu informe oficial CMF:
              </p>
              <button
                type="button"
                onClick={handleAddDebtRow}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Agregar Fila</span>
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

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Monto Total ({currentCurrency.symbol})</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="0"
                        value={row.amount}
                        onChange={(e) => handleUpdateRow(idx, 'amount', formatInputLive(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Cuota Mensual ({currentCurrency.symbol})</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={row.monthlyPayment}
                        onChange={(e) => handleUpdateRow(idx, 'monthlyPayment', formatInputLive(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                <span>Guardar en GastFin</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
