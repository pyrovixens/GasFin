import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  Percent, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  Calculator,
  PieChart,
  Flame,
  CheckCircle2
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

export const CompoundInterestView: React.FC = () => {
  const { metrics, formatMoney, formatInputLive, parseRawFromDisplay, currentCurrency } = useFinancial();

  // Inputs
  const [initialCapital, setInitialCapital] = useState<number>(1000000);
  const [initialCapitalDisplay, setInitialCapitalDisplay] = useState<string>(() => formatInputLive(1000000));

  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => {
    return metrics.netCashFlow > 0 ? Math.round(metrics.netCashFlow * 0.5) : 100000;
  });
  const [monthlyContributionDisplay, setMonthlyContributionDisplay] = useState<string>(() => {
    const init = metrics.netCashFlow > 0 ? Math.round(metrics.netCashFlow * 0.5) : 100000;
    return formatInputLive(init);
  });

  const [annualRate, setAnnualRate] = useState<number>(8); // 8% APR average
  const [years, setYears] = useState<number>(10);

  // Compound Interest Calculation
  const simulation = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;

    const yearlyData = [];
    let currentBalance = initialCapital;
    let totalInvested = initialCapital;

    // Push Year 0
    yearlyData.push({
      year: 'Año 0',
      TotalAcumulado: Math.round(currentBalance),
      CapitalAportado: Math.round(totalInvested),
      InteresGanado: 0
    });

    for (let m = 1; m <= totalMonths; m++) {
      currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
      totalInvested += monthlyContribution;

      if (m % 12 === 0) {
        const y = m / 12;
        const interestEarned = Math.max(0, currentBalance - totalInvested);
        yearlyData.push({
          year: `Año ${y}`,
          TotalAcumulado: Math.round(currentBalance),
          CapitalAportado: Math.round(totalInvested),
          InteresGanado: Math.round(interestEarned)
        });
      }
    }

    const finalTotal = Math.round(currentBalance);
    const finalInvested = Math.round(totalInvested);
    const finalInterest = Math.max(0, finalTotal - finalInvested);
    const interestMultiplier = finalInvested > 0 ? (finalTotal / finalInvested).toFixed(2) : '1.0';

    return {
      yearlyData,
      finalTotal,
      finalInvested,
      finalInterest,
      interestMultiplier
    };
  }, [initialCapital, monthlyContribution, annualRate, years]);

  // FIRE (Financial Independence) Target based on Real Expenses
  const fireAnalysis = useMemo(() => {
    const annualExpenses = metrics.totalExpense > 0 ? metrics.totalExpense * 12 : 800000 * 12;
    const fireTargetNumber = annualExpenses * 25; // 4% Safe Withdrawal Rule
    const monthlyPassiveIncomeAtEnd = (simulation.finalTotal * (annualRate / 100)) / 12;
    const isFireAchieved = simulation.finalTotal >= fireTargetNumber;

    return {
      annualExpenses,
      fireTargetNumber,
      monthlyPassiveIncomeAtEnd,
      isFireAchieved
    };
  }, [metrics.totalExpense, simulation.finalTotal, annualRate]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-glow-amber">
            <Zap size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Calculadora de Ahorro e Inversión</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Interés Compuesto
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Mira cómo crece tu dinero si ahorras un poco cada mes y lo pones a rentar con el tiempo.
            </p>
          </div>
        </div>

        {/* 3 Result Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Lo que pusiste de tu bolsillo</span>
            <p className="text-2xl font-black text-slate-200 mt-1">{formatMoney(simulation.finalInvested)}</p>
            <span className="text-[11px] text-slate-400">Ahorro total aportado</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-glow-emerald">
            <span className="text-xs text-emerald-300 font-bold">Ganancia generada (Intereses)</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">+{formatMoney(simulation.finalInterest)}</p>
            <span className="text-[11px] text-emerald-300/80">Tu plata creció x{simulation.interestMultiplier}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30">
            <span className="text-xs text-indigo-300 font-bold">Tu dinero total en {years} Años</span>
            <p className="text-2xl font-black text-white mt-1">{formatMoney(simulation.finalTotal)}</p>
            <span className="text-[11px] text-indigo-300/80">Ahorros + Rentabilidad</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Ingreso mensual estimado</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{formatMoney(Math.round(fireAnalysis.monthlyPassiveIncomeAtEnd))}</p>
            <span className="text-[11px] text-slate-400">Si vives de los intereses</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-5">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Calculator size={18} className="text-emerald-400" />
            <span>Tus números para la simulación</span>
          </h3>

          {/* Capital Inicial */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Capital Inicial ({currentCurrency.symbol})</label>
            <input
              type="text"
              inputMode="numeric"
              value={initialCapitalDisplay}
              onChange={(e) => {
                const formatted = formatInputLive(e.target.value);
                setInitialCapitalDisplay(formatted);
                setInitialCapital(parseRawFromDisplay(formatted));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Aporte Mensual */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Aporte Mensual Recurrente</span>
              <button
                onClick={() => {
                  const calculated = Math.max(0, Math.round(metrics.netCashFlow * 0.5));
                  setMonthlyContribution(calculated);
                  setMonthlyContributionDisplay(formatInputLive(calculated));
                }}
                className="text-[10px] text-emerald-400 hover:underline"
              >
                Usar 50% de mi flujo libre
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyContributionDisplay}
              onChange={(e) => {
                const formatted = formatInputLive(e.target.value);
                setMonthlyContributionDisplay(formatted);
                setMonthlyContribution(parseRawFromDisplay(formatted));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Rentabilidad Anual */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Rentabilidad Anual Estimada</span>
              <span className="text-emerald-400 font-mono">{annualRate}% APR</span>
            </div>
            <input
              type="range"
              min="3"
              max="18"
              step="0.5"
              value={annualRate}
              onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>3% (Conservador)</span>
              <span>8% (Index S&P500)</span>
              <span>18% (Agresivo)</span>
            </div>
          </div>

          {/* Plazo en Años */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Horizonte de Tiempo</span>
              <span className="text-white font-mono">{years} años</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 año</span>
              <span>15 años</span>
              <span>30 años</span>
            </div>
          </div>

          {/* FIRE Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2 text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Meta de Libertad Financiera (FIRE):</span>
            <p className="text-slate-300 leading-relaxed">
              Para cubrir tus gastos anuales actuales ({formatMoney(fireAnalysis.annualExpenses)}/año), tu número de libertad financiera es <strong>{formatMoney(fireAnalysis.fireTargetNumber)}</strong>.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-slate-200">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>En {years} años cubrirás el <strong>{((simulation.finalTotal / fireAnalysis.fireTargetNumber) * 100).toFixed(0)}%</strong> de tu meta.</span>
            </div>
          </div>

        </div>

        {/* Growth Area Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">Curva Exponencial de Crecimiento Patrimonial</h3>
            <p className="text-xs text-slate-400 mt-0.5">Observa cómo los intereses compuestos superan tus aportes con el paso de los años.</p>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulation.yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(val: number) => formatMoney(val)}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="TotalAcumulado" name="Total Acumulado" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="CapitalAportado" name="Capital Aportado" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Consejo GastFin:</strong> La clave del interés compuesto no es el monto inicial, sino la <strong>consistencia del aporte mensual</strong> y el <strong>tiempo</strong>.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
