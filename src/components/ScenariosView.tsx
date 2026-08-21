import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  DollarSign,
  Activity,
  Calculator,
  CheckCircle2,
  PieChart,
  Layers,
  Award,
  ArrowRight,
  Target,
  Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';

export const ScenariosView: React.FC = () => {
  const { metrics, formatMoney, transactions, debts, goals, currentCurrency } = useFinancial();

  // Extract Salary / Incomes and Expenses from real data if present
  const salaryFromData = useMemo(() => {
    const salaryTx = transactions.filter(t => t.type === 'income' && t.category.toLowerCase().includes('sueldo'));
    if (salaryTx.length > 0) {
      return salaryTx.reduce((acc, t) => acc + t.amount, 0);
    }
    return metrics.totalIncome > 0 ? metrics.totalIncome : 1200000;
  }, [transactions, metrics.totalIncome]);

  const expenseFromData = useMemo(() => {
    return metrics.totalExpense > 0 ? metrics.totalExpense : 850000;
  }, [metrics.totalExpense]);

  // User can adjust or use real data
  const [userSalary, setUserSalary] = useState<number>(salaryFromData);
  const [userExpense, setUserExpense] = useState<number>(expenseFromData);

  // Target savings goal percentage slider (e.g. want to save 20%, 25%, 35% of salary)
  const [targetSavingsPct, setTargetSavingsPct] = useState<number>(25);

  // Sync if data changes
  useEffect(() => {
    if (metrics.totalIncome > 0) setUserSalary(metrics.totalIncome);
    if (metrics.totalExpense > 0) setUserExpense(metrics.totalExpense);
  }, [metrics.totalIncome, metrics.totalExpense]);

  // Current real state
  const currentSavingsAmount = Math.max(0, userSalary - userExpense);
  const currentSavingsPct = userSalary > 0 ? (currentSavingsAmount / userSalary) * 100 : 0;

  // Optimized target plan
  const targetMonthlySavings = (userSalary * targetSavingsPct) / 100;
  const targetMaxExpense = Math.max(0, userSalary - targetMonthlySavings);
  const requiredExpenseAdjustment = Math.max(0, userExpense - targetMaxExpense);

  // Strategic Allocation of the target savings
  const allocation = useMemo(() => {
    return {
      emergencyFund: targetMonthlySavings * 0.40, // 40% Fondo de Emergencia
      goalsProjects: targetMonthlySavings * 0.30, // 30% Metas y Proyectos
      investmentDebt: targetMonthlySavings * 0.30, // 30% Inversión o Amortización de Deuda
    };
  }, [targetMonthlySavings]);

  // 12-Month Accumulation Projection
  const projectionData = useMemo(() => {
    const data = [];
    let baseAccumulated = 0;
    let plannedAccumulated = 0;

    for (let i = 1; i <= 12; i++) {
      baseAccumulated += currentSavingsAmount;
      plannedAccumulated += targetMonthlySavings;

      data.push({
        month: `Mes ${i}`,
        AhorroActual: Math.round(baseAccumulated),
        PlanOptimizado: Math.round(plannedAccumulated),
      });
    }

    return data;
  }, [currentSavingsAmount, targetMonthlySavings]);

  // Milestone Numbers
  const savings3m = Math.round(targetMonthlySavings * 3);
  const savings6m = Math.round(targetMonthlySavings * 6);
  const savings12m = Math.round(targetMonthlySavings * 12);
  const savings24m = Math.round(targetMonthlySavings * 24);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Simulador & Planificador Estratégico de Ahorro</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Basado en tu Sueldo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calcula tu margen de ahorro real a partir de tus ingresos y diseña un plan paso a paso para alcanzar tu meta.
            </p>
          </div>
        </div>

        {/* PASO 1: Diagnóstico de Ahorro en base a tu Sueldo */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Sueldo / Ingreso Base</span>
            <p className="text-2xl font-black text-white mt-1">{formatMoney(userSalary)}</p>
            <span className="text-[11px] text-emerald-400">Ingreso mensual disponible</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Gastos Registrados</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{formatMoney(userExpense)}</p>
            <span className="text-[11px] text-slate-400">Costos fijos y variables</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Ahorro Mensual Actual</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{formatMoney(currentSavingsAmount)}</p>
            <span className="text-[11px] text-slate-400">Tasa actual: <strong>{currentSavingsPct.toFixed(1)}%</strong></span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-glow-emerald">
            <span className="text-xs text-emerald-300 font-bold">Meta de Ahorro ({targetSavingsPct}%)</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">+{formatMoney(targetMonthlySavings)}/mes</p>
            <span className="text-[11px] text-emerald-300/80">Plan sugerido</span>
          </div>
        </div>
      </div>

      {/* PASO 2: CONTROLES INTERACTIVOS & PLANIFICACIÓN ESTRATÉGICA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Columna Izquierda: Slider de Meta de Ahorro (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajuste de Meta</h3>
              </div>
              <span className="text-base font-black text-emerald-400">{targetSavingsPct}% del Sueldo</span>
            </div>

            {/* Target Percentage Slider */}
            <div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={targetSavingsPct}
                onChange={(e) => setTargetSavingsPct(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5% (Mínimo)</span>
                <span>20% (Regla 50/30/20)</span>
                <span>35% (Avanzado)</span>
                <span>50% (FIRE)</span>
              </div>
            </div>

            {/* Gap to Bridge */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Gasto máximo permitido:</span>
                <span className="font-bold text-white font-mono">{formatMoney(targetMaxExpense)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Ajuste de costos requerido:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {requiredExpenseAdjustment > 0 ? `-${formatMoney(requiredExpenseAdjustment)}/mes` : '✓ Ya cumples la meta'}
                </span>
              </div>
            </div>

            {/* PASO 3: DISTRIBUCIÓN DEL AHORRO GANADO */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart size={15} className="text-emerald-400" />
                <span>¿Cómo distribuir el {targetSavingsPct}% de Ahorro?</span>
              </h4>

              {/* 40% Emergency Fund */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">40% Fondo de Emergencia</span>
                  <span className="text-[10px] text-slate-400">Reserva de liquidez inmediata</span>
                </div>
                <span className="font-black text-emerald-400 font-mono">+{formatMoney(allocation.emergencyFund)}/mes</span>
              </div>

              {/* 30% Goals */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">30% Metas & Proyectos</span>
                  <span className="text-[10px] text-slate-400">Vacaciones, auto o compras</span>
                </div>
                <span className="font-black text-teal-400 font-mono">+{formatMoney(allocation.goalsProjects)}/mes</span>
              </div>

              {/* 30% Inversión o Deuda */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">30% Inversión / Deuda</span>
                  <span className="text-[10px] text-slate-400">Abono extraordinario a créditos</span>
                </div>
                <span className="font-black text-indigo-400 font-mono">+{formatMoney(allocation.investmentDebt)}/mes</span>
              </div>
            </div>

          </div>
        </div>

        {/* Columna Derecha: Planificación de Cómo Ganar ese Ahorro (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Roadmap de 3 Fases */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Planificación: Cómo Ganar el {targetSavingsPct}% de Ahorro
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para retener <strong>{formatMoney(targetMonthlySavings)} mensuales</strong> sin sacrificar tu estilo de vida, ejecuta estas 3 fases prácticas:
            </p>

            {/* Fase 1 */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Fase 1: Optimización de Servicios Fijos
                </span>
                <span className="text-xs font-bold text-emerald-400">Ahorro: 10% a 15%</span>
              </div>
              <p className="text-xs text-slate-200 font-semibold mt-1">
                Auditar cuentas de luz, agua, gas y renegociar plan de internet y celular.
              </p>
              <p className="text-[11px] text-slate-400">
                Acción inmediata: Llama a tu compañía de telecomunicaciones para solicitar plan de retención y desconecta equipos vampiro en stand-by.
              </p>
            </div>

            {/* Fase 2 */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Fase 2: Control de Fugas en Gastos Variables
                </span>
                <span className="text-xs font-bold text-amber-400">Ahorro: 15% a 25%</span>
              </div>
              <p className="text-xs text-slate-200 font-semibold mt-1">
                Establecer tope semanal para recreación, delivery y compras impulsivas.
              </p>
              <p className="text-[11px] text-slate-400">
                Acción inmediata: Cancelar plataformas de streaming que no hayas abierto en 30 días y planificar menú de supermercado con lista cerrada.
              </p>
            </div>

            {/* Fase 3 */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Fase 3: Automatización del Aporte
                </span>
                <span className="text-xs font-bold text-indigo-400">Disciplina 100%</span>
              </div>
              <p className="text-xs text-slate-200 font-semibold mt-1">
                "Págate a ti mismo primero" apenas recibas tu sueldo.
              </p>
              <p className="text-[11px] text-slate-400">
                Acción inmediata: Transfiere automáticamente el {targetSavingsPct}% ({formatMoney(targetMonthlySavings)}) el mismo día del pago hacia tu cuenta de ahorro o meta.
              </p>
            </div>
          </div>

          {/* Gráfico de Crecimiento del Capital Acumulado */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              <span>Capital que Acumularás Siguiendo este Plan (12 Meses)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Crecimiento proyectado mes a mes</p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v > 999999 ? (v/1000000).toFixed(1)+'M' : (v/1000).toFixed(0)+'k'}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px' }}
                    formatter={(val: any) => [formatMoney(Number(val)), 'Acumulado']}
                  />
                  <Area type="monotone" dataKey="PlanOptimizado" stroke="#10B981" fillOpacity={1} fill="url(#gradPlanned)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Horizons Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-800/40">
                <span className="text-[10px] text-slate-400">A 3 meses</span>
                <p className="font-bold text-white text-xs mt-0.5">{formatMoney(savings3m)}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/40">
                <span className="text-[10px] text-slate-400">A 6 meses</span>
                <p className="font-bold text-white text-xs mt-0.5">{formatMoney(savings6m)}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/40">
                <span className="text-[10px] text-slate-400">A 12 meses</span>
                <p className="font-extrabold text-emerald-400 text-xs mt-0.5">{formatMoney(savings12m)}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/40">
                <span className="text-[10px] text-slate-400">A 24 meses</span>
                <p className="font-black text-teal-300 text-xs mt-0.5">{formatMoney(savings24m)}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
