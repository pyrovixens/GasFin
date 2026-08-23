import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  TrendingDown, 
  Sparkles, 
  Plus, 
  Flame, 
  Snowflake, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Calculator,
  Trash2,
  Edit3,
  ShieldAlert,
  Percent,
  RefreshCw,
  Lightbulb,
  Copy,
  Check,
  Building2
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Debt } from '../types';

export const DebtCalculatorView: React.FC = () => {
  const { 
    debts, 
    formatMoney, 
    formatInputLive,
    parseRawFromDisplay,
    openDebtModal, 
    deleteDebt, 
    makeDebtPayment, 
    metrics,
    currentCurrency,
    addDebt,
    triggerCelebration,
    setIsCMFModalOpen
  } = useFinancial();

  // Selected Strategy: 'avalanche' (High APR first) vs 'snowball' (Lowest balance first)
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  
  // Extra monthly payment simulation slider
  const defaultExtra = currentCurrency.code === 'USD' || currentCurrency.code === 'EUR' ? 150 : 80000;
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(defaultExtra);

  // Quick Payment modal state
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState(false);

  // Total metrics
  const totalDebt = useMemo(() => debts.reduce((acc, d) => acc + d.remainingAmount, 0), [debts]);
  const totalMinimum = useMemo(() => debts.reduce((acc, d) => acc + d.minimumPayment, 0), [debts]);
  
  const weightedAPR = useMemo(() => {
    if (totalDebt === 0) return 0;
    const totalWeighted = debts.reduce((acc, d) => acc + (d.remainingAmount * d.interestRate), 0);
    return totalWeighted / totalDebt;
  }, [debts, totalDebt]);

  // Debt to income ratio
  const userIncome = metrics.totalIncome > 0 ? metrics.totalIncome : 1200000;
  const debtToIncomeRatio = (totalMinimum / userIncome) * 100;

  // Sorted debts according to strategy
  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (strategy === 'avalanche') {
        return b.interestRate - a.interestRate;
      } else {
        return a.remainingAmount - b.remainingAmount;
      }
    });
  }, [debts, strategy]);

  // Most expensive debt (Highest APR)
  const highestAprDebt = useMemo(() => {
    if (debts.length === 0) return null;
    return [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];
  }, [debts]);

  // Smallest balance debt (Quickest win)
  const smallestBalanceDebt = useMemo(() => {
    if (debts.length === 0) return null;
    return [...debts].sort((a, b) => a.remainingAmount - b.remainingAmount)[0];
  }, [debts]);

  // Simulation calculation
  const simulation = useMemo(() => {
    if (totalDebt === 0) {
      return { baseMonths: 0, optimizedMonths: 0, monthsSaved: 0, interestSaved: 0 };
    }

    const monthlyInterestRate = (weightedAPR / 100) / 12;
    const standardPayment = Math.max(totalMinimum, totalDebt * 0.035);
    const boostedPayment = standardPayment + extraMonthlyPayment;

    // Estimate months with standard minimum
    let baseMonths = 0;
    let bBalance = totalDebt;
    let baseTotalInterest = 0;
    while (bBalance > 0 && baseMonths < 360) {
      const interest = bBalance * monthlyInterestRate;
      baseTotalInterest += interest;
      const principal = Math.min(bBalance, standardPayment - interest);
      if (principal <= 0) {
        baseMonths = Math.ceil(totalDebt / Math.max(1, standardPayment * 0.7));
        baseTotalInterest = totalDebt * (weightedAPR / 100) * (baseMonths / 12) * 0.5;
        break;
      }
      bBalance -= principal;
      baseMonths++;
    }

    // Estimate months with extra payment
    let optMonths = 0;
    let optBalance = totalDebt;
    let optTotalInterest = 0;
    while (optBalance > 0 && optMonths < 360) {
      const interest = optBalance * monthlyInterestRate;
      optTotalInterest += interest;
      const principal = Math.min(optBalance, boostedPayment - interest);
      if (principal <= 0) break;
      optBalance -= principal;
      optMonths++;
    }

    const monthsSaved = Math.max(0, baseMonths - optMonths);
    const interestSaved = Math.max(0, baseTotalInterest - optTotalInterest);

    return {
      baseMonths: Math.min(baseMonths, 180),
      optimizedMonths: Math.min(optMonths, 180),
      monthsSaved: Math.min(monthsSaved, baseMonths),
      interestSaved: Math.round(interestSaved),
    };
  }, [totalDebt, totalMinimum, weightedAPR, extraMonthlyPayment]);

  const handleMakePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    const amt = parseRawFromDisplay(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    makeDebtPayment(payingDebt.id, amt);
    setPayingDebt(null);
    setPaymentAmount('');
    triggerCelebration();
  };

  const copyBankScript = () => {
    const script = `Estimado ejecutivo de ${highestAprDebt?.creditor || 'mi banco'}: Mantengo un crédito con ustedes con una tasa del ${highestAprDebt?.interestRate || 18}% APR. Dado mi historial de cumplimiento puntual, solicito una renegociación de tasa preferencial o consolidación a tasa fija competitiva para continuar centralizando mis productos con su institución. Quedo atento a su propuesta comercial.`;
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header & Strategy Selector */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-glow-amber">
                <Calculator size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">Optimizador & Estrategia de Deudas</h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Motor Dinámico IA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Genera recomendaciones personalizadas en tiempo real según las deudas e ingresos que vas ingresando.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setIsCMFModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              title="Enlazar con informe oficial de CMF Chile"
            >
              <Building2 size={15} />
              <span>Compilador CMF Chile</span>
            </button>

            <button
              type="button"
              onClick={() => openDebtModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-glow-amber transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>+ Registrar Deuda</span>
            </button>
          </div>
        </div>

        {/* CMF Chile Destácame-Style Live Compiler Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-800/60 to-blue-950/40 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  CMF Chile • Open Finance
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">● Sincronización Automática</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Extrae y compila automáticamente tus deudas de bancos y tarjetas con tu ClaveÚnica.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCMFModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <RefreshCw size={14} />
            <span>Sincronizar con ClaveÚnica</span>
          </button>
        </div>

        {/* Global Debt Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Deuda Total Activa</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{formatMoney(totalDebt)}</p>
            <span className="text-[11px] text-slate-400">{debts.length} compromisos registrados</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Cuotas Mínimas / Mes</span>
            <p className="text-2xl font-bold text-white mt-1">{formatMoney(totalMinimum)}</p>
            <span className="text-[11px] text-slate-400">Obligación mensual fija</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Tasa APR Ponderada</span>
            <p className="text-2xl font-bold text-rose-400 mt-1">{weightedAPR.toFixed(1)}%</p>
            <span className="text-[11px] text-slate-400">Costo promedio anual</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Carga sobre tu Sueldo</span>
            <p className={`text-2xl font-black mt-1 ${debtToIncomeRatio > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {debtToIncomeRatio.toFixed(1)}%
            </p>
            <span className="text-[11px] text-slate-400">
              {debtToIncomeRatio > 40 ? '⚠️ Alerta de endeudamiento' : '✓ Rango manejable'}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DINÁMICA DE IDEAS GENERADAS SEGÚN TUS DATOS REALES */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            <h3 className="text-base font-extrabold text-white">
              Ideas y Recomendaciones Generadas para tus Datos
            </h3>
          </div>
          <span className="text-xs text-indigo-300 font-semibold">
            Actualizado en tiempo real con tus movimientos
          </span>
        </div>

        {debts.length === 0 ? (
          /* Zero State with Fast Templates */
          <div className="py-6 text-center space-y-3">
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Aún no tienes deudas registradas. Ingresa tus créditos o tarjetas bancarias con el botón <strong>"+ Registrar Deuda"</strong> para que el motor genere tu plan de ahorro personalizado en intereses.
            </p>
            <button
              onClick={() => openDebtModal()}
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-glow-amber"
            >
              + Registrar mi Primera Deuda
            </button>
          </div>
        ) : (
          /* Dynamic Generated Action Cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Dynamic Idea 1: Highest APR Avalanche Recommendation */}
            {highestAprDebt && (
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      1. Deuda Más Costosa
                    </span>
                    <span className="text-xs font-bold text-rose-400">{highestAprDebt.interestRate}% APR</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1">{highestAprDebt.name}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    Esta es tu deuda con mayor tasa de interés ({highestAprDebt.creditor}). Cada peso extra abonado aquí te generará el <strong>mayor retorno en ahorro de intereses bancarios</strong>.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Saldo:</span>
                  <strong className="text-amber-400">{formatMoney(highestAprDebt.remainingAmount)}</strong>
                </div>
              </div>
            )}

            {/* Dynamic Idea 2: Quickest Win (Snowball) */}
            {smallestBalanceDebt && debts.length > 1 && (
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      2. Victoria Rápida (Bola de Nieve)
                    </span>
                    <span className="text-xs font-bold text-teal-400">Menor Saldo</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1">{smallestBalanceDebt.name}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    Es tu deuda más pequeña. Si la liquidas primero, liberarás inmediatamente <strong>{formatMoney(smallestBalanceDebt.minimumPayment)} al mes</strong> de cuota para atacar la siguiente deuda.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Cuota Liberable:</span>
                  <strong className="text-emerald-400">+{formatMoney(smallestBalanceDebt.minimumPayment)}/mes</strong>
                </div>
              </div>
            )}

            {/* Dynamic Idea 3: Debt Consolidation / Bank Script */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    3. Renegociación Bancaria
                  </span>
                  <span className="text-xs font-bold text-indigo-300">Guión Táctico</span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1">Llamada de Reducción de Tasa</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  Pide a tu banco una tasa preferencial fija. Copia el guión listo para enviar por email o ejecutivo bancario.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/50">
                <button
                  onClick={copyBankScript}
                  className="w-full py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedScript ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedScript ? '¡Guión Copiado!' : 'Copiar Mensaje para el Banco'}</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* STRATEGY OPTIMIZER & SIMULATOR (Interactive 2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Strategy Chooser & Extra Payment Slider (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Strategy Chooser */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
            <h3 className="text-base font-bold text-white mb-3">Elige tu Método de Pago Acelerado</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Avalanche */}
              <button
                onClick={() => setStrategy('avalanche')}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  strategy === 'avalanche'
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-glow-indigo text-white'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-amber-400" />
                    <span className="font-bold text-sm text-white">Método Avalancha</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Ahorro Máximo
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Prioriza deudas con <strong>mayor tasa de interés (APR)</strong>. Ahorra la mayor cantidad de dinero en intereses totales.
                </p>
              </button>

              {/* Snowball */}
              <button
                onClick={() => setStrategy('snowball')}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  strategy === 'snowball'
                    ? 'bg-teal-950/40 border-teal-500 shadow-sm text-white'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Snowflake size={18} className="text-teal-400" />
                    <span className="font-bold text-sm text-white">Método Bola de Nieve</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Motivacional
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Prioriza deudas con <strong>menor saldo restante</strong>. Liquida compromisos rápidamente para liberar flujo mensual.
                </p>
              </button>
            </div>

            {/* Extra Payment Slider */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold text-slate-300">Simulador de Aporte Extraordinario Mensual:</span>
                  <p className="text-[11px] text-slate-400">¿Cuánto dinero extra puedes destinar a la deuda #1?</p>
                </div>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  +{formatMoney(extraMonthlyPayment)}/mes
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={currentCurrency.code === 'USD' || currentCurrency.code === 'EUR' ? 1500 : 500000}
                step={currentCurrency.code === 'USD' || currentCurrency.code === 'EUR' ? 25 : 10000}
                value={extraMonthlyPayment}
                onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Simulation Impact Results Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/30 border border-emerald-500/30 shadow-card-soft">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Impacto Calculado de tu Estrategia
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400">Tiempo Ahorrado de Pagos</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {simulation.monthsSaved} meses menos
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quedarás libre en <strong>{simulation.optimizedMonths} meses</strong> en vez de {simulation.baseMonths}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400">Ahorro Directo en Intereses</span>
                <p className="text-2xl font-black text-teal-300 mt-1">
                  {formatMoney(simulation.interestSaved)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dinero retenido que no pagarás a entidades financieras.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Column 2: Specific Actionable Ideas to Reduce Debt (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              <span>Plan Táctico para Liquidar Deudas</span>
            </h3>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-200">1. Congelamiento de Nuevos Créditos</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Durante el plan acelerado, no utilices cupos de tarjetas para gastos cotidianos. Paga todo con débito o efectivo.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-200">2. Destinar Excedentes de Facturación / Aguinaldos</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cualquier ingreso extra (bonos, comisiones, devolución de impuestos) abónalo 100% al saldo de la Deuda Prioridad #1.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-200">3. Efecto "Eslabón": Reinversión de Cuotas</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cuando termines de pagar una deuda, no gastes esa cuota mensual; súmasela inmediatamente a la cuota de la siguiente deuda.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED DEBTS LIST WITH PROGRESS & ACTIONS */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Orden de Pago Prioritario ({strategy === 'avalanche' ? 'Avalancha: Mayor Interés Primero' : 'Bola de Nieve: Menor Saldo Primero'})
            </h3>
            <p className="text-xs text-slate-400">Paga el mínimo en todas y concentra el pago extra en la #1 de la lista</p>
          </div>
        </div>

        {debts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No hay deudas activas registradas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedDebts.map((debt, index) => {
              const isTopPriority = index === 0;
              const percentPaid = Math.max(0, Math.min(100, ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100));

              return (
                <div 
                  key={debt.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isTopPriority 
                      ? 'bg-gradient-to-b from-amber-950/20 via-slate-800/60 to-slate-900/80 border-amber-500/40 shadow-glow-amber' 
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isTopPriority 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        Prioridad #{index + 1} {isTopPriority ? '🔥 FOCO PRINCIPAL' : ''}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDebtModal(debt)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la deuda "${debt.name}"?`)) deleteDebt(debt.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">{debt.name}</h4>
                    <p className="text-xs text-slate-400">{debt.creditor}</p>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Saldo Pendiente:</span>
                        <span className="font-extrabold text-amber-400 font-mono">{formatMoney(debt.remainingAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tasa de Interés APR:</span>
                        <span className="font-bold text-rose-400">{debt.interestRate}% anual</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Pago Mínimo:</span>
                        <span className="font-medium text-slate-200">{formatMoney(debt.minimumPayment)}/mes</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{percentPaid.toFixed(0)}% amortizado</span>
                        <span>Total: {formatMoney(debt.totalAmount)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500" 
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Make Payment Action Button */}
                  <div className="mt-5 pt-3 border-t border-slate-700/60">
                    <button
                      onClick={() => {
                        setPayingDebt(debt);
                        setPaymentAmount(formatInputLive(debt.minimumPayment ?? 0));
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-1.5"
                    >
                      <DollarSign size={14} className="text-emerald-400" />
                      <span>Abonar Dinero a Capital</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK PAYMENT MODAL */}
      {payingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Registrar Abono a Deuda</h3>
            <p className="text-xs text-slate-400 mb-4">{payingDebt.name} ({payingDebt.creditor})</p>

            <form onSubmit={handleMakePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto del Abono ({currentCurrency.symbol})</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(formatInputLive(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(formatInputLive(payingDebt.minimumPayment ?? 0))}
                    className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cuota Mínima ({formatMoney(payingDebt.minimumPayment)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(formatInputLive(payingDebt.remainingAmount ?? 0))}
                    className="text-[11px] px-2 py-1 rounded bg-slate-800 text-emerald-400 hover:bg-slate-700"
                  >
                    Liquidar Todo ({formatMoney(payingDebt.remainingAmount)})
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPayingDebt(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-glow-emerald"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
