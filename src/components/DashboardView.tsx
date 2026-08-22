import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  FilePlus,
  Compass,
  FileSpreadsheet,
  User
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { DeficitAlertBanner } from './DeficitAlertBanner';
import { CATEGORY_COLORS } from '../data/initialData';

export const DashboardView: React.FC = () => {
  const { 
    userName,
    motivationalQuote,
    exportDataToExcel,
    metrics, 
    formatMoney, 
    transactions, 
    debts, 
    goals, 
    savingsTips, 
    toggleSavingsTip,
    openTransactionModal, 
    openDebtModal, 
    openGoalModal,
    setActiveView 
  } = useFinancial();

  // Monthly Cash Flow Chart Data
  const monthlyData = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    return [
      { name: 'Periodo Actual', Ingresos: metrics.totalIncome, Gastos: metrics.totalExpense, FlujoNeto: metrics.netCashFlow },
    ];
  }, [metrics, transactions]);

  // Expenses by Category for Pie Chart
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#94A3B8',
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(`${a.date}T${a.time || '12:00:00'}`).getTime();
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(`${b.date}T${b.time || '12:00:00'}`).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [transactions]);

  // Savings Health Rating
  const getSavingsHealth = () => {
    if (transactions.length === 0) return { label: 'Esperando datos', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    if (metrics.isDeficit) return { label: 'En Déficit', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (metrics.savingsRate >= 25) return { label: 'Excelente (25%+)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (metrics.savingsRate >= 15) return { label: 'Saludable (15%-25%)', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    return { label: 'Requiere Atención (<15%)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  };

  const health = getSavingsHealth();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* PERSONALIZED GREETING & MOTIVATIONAL HERO CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/30 border border-emerald-500/40 shadow-card-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ¡Hola, {userName || 'amigo'}! 👋
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Al día
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-300/90 italic font-medium leading-relaxed">
            {motivationalQuote}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          <button
            onClick={exportDataToExcel}
            className="px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-2 shadow-sm"
            title="Descargar tus datos en formato Excel / CSV"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            <span>Descargar en Excel</span>
          </button>
        </div>
      </div>

      {/* Deficit Alert Banner if Gastos > Ingresos */}
      <DeficitAlertBanner />

      {/* TOP KPI CARDS ROW (5 Columns / Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Ingresos */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 shadow-card-soft group relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos del Mes</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatMoney(metrics.totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
            <span>{transactions.filter(t => t.type === 'income').length} cobros o sueldos</span>
          </div>
        </div>

        {/* Card 2: Gastos */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition-all duration-300 shadow-card-soft group relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastos del Mes</span>
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatMoney(metrics.totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
            <span>{metrics.totalIncome > 0 ? ((metrics.totalExpense / metrics.totalIncome) * 100).toFixed(0) : 0}% de lo que ganas</span>
          </div>
        </div>

        {/* Card 3: Flujo Neto */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 shadow-card-soft group relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plata que te Queda</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Wallet size={18} />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${metrics.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatMoney(metrics.netCashFlow)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
            <span>{metrics.runwayMonths} meses de respaldo</span>
          </div>
        </div>

        {/* Card 4: Tasa de Ahorro */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all duration-300 shadow-card-soft group relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ahorro del Mes</span>
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {metrics.savingsRate.toFixed(1)}%
          </div>
          <div className="mt-2">
            <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${health.color}`}>
              {health.label}
            </span>
          </div>
        </div>

        {/* Card 5: Pasivo / Deuda */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 shadow-card-soft group relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deuda por Pagar</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatMoney(metrics.totalDebt)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400 font-medium">
            <span>Cuotas mínimas: {formatMoney(metrics.monthlyDebtObligation)}/mes</span>
          </div>
        </div>

      </div>

      {/* MULTI-COLUMN INTERACTIVE CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT / CENTRAL MAIN COLUMN (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Cashflow Timeline Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  <span>Lo que Entra vs. Lo que Sale</span>
                </h3>
                <p className="text-xs text-slate-400">Revisa cómo van tus ingresos, gastos y lo que te sobra</p>
              </div>
            </div>

            {monthlyData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        borderColor: '#334155', 
                        borderRadius: '16px', 
                        color: '#F8FAFC',
                      }} 
                      formatter={(value: any) => [formatMoney(Number(value)), '']}
                    />
                    <Bar dataKey="Ingresos" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Gastos" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="FlujoNeto" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-slate-800/20 border border-dashed border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <FilePlus size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">Comienza anotando tus movimientos</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Todo está listo para ti. Agrega tu primer sueldo, venta o gasto para ver tus números claros.
                </p>
                <button
                  onClick={() => openTransactionModal('income')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold shadow-glow-emerald"
                >
                  + Anotar Primer Movimiento
                </button>
              </div>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Tus Movimientos Recientes</h3>
                <p className="text-xs text-slate-400">Lo último que has registrado</p>
              </div>
              {transactions.length > 0 && (
                <button
                  onClick={() => setActiveView('transactions')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <span>Ver Todos ({transactions.length})</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-2.5">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const formatBankDate = (dateStr: string, timeStr?: string) => {
                    if (!dateStr) return '';
                    try {
                      const parts = dateStr.split('-');
                      if (parts.length === 3) {
                        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                        const monthName = months[parseInt(parts[1], 10) - 1] || parts[1];
                        const dateFormatted = `${parseInt(parts[2], 10)} ${monthName} ${parts[0]}`;
                        const timeFormatted = timeStr ? `${timeStr} hrs` : '';
                        return `${dateFormatted} • ${timeFormatted}`.replace(/ • $/, '');
                      }
                      return `${dateStr} ${timeStr || ''}`;
                    } catch {
                      return `${dateStr} ${timeStr || ''}`;
                    }
                  };

                  return (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                              {tx.category}
                            </span>
                            <span>•</span>
                            <span className="text-slate-300 font-medium font-mono text-[10px]">
                              {formatBankDate(tx.date, tx.time)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-3">
                        <p className={`text-xs font-black ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-slate-800/20 text-slate-400 text-xs">
                Aún no tienes movimientos registrados este mes.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Expense Breakdown Pie / Donut Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">¿En qué se te va el dinero?</h3>
                <p className="text-xs text-slate-400">Tus gastos ordenados por categoría</p>
              </div>
            </div>

            {expenseByCategory.length > 0 ? (
              <>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [formatMoney(Number(val)), 'Gasto']}
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800">
                  {expenseByCategory.slice(0, 4).map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 truncate">{item.name}</span>
                      <span className="text-slate-400 font-bold ml-auto">{metrics.totalExpense > 0 ? ((item.value / metrics.totalExpense) * 100).toFixed(0) : 0}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-800/20 text-slate-400 text-xs">
                Anota tus gastos para ver el gráfico de tus categorías.
              </div>
            )}
          </div>

          {/* Active Goals Progress Widget */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target size={18} className="text-teal-400" />
                  <span>Tus Metas de Ahorro</span>
                </h3>
                <p className="text-xs text-slate-400">Cómo van tus proyectos personales</p>
              </div>
              <button
                onClick={() => openGoalModal()}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Nueva Meta de Ahorro"
              >
                <Plus size={16} />
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => {
                  const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 truncate">{goal.title}</span>
                        <span className="font-bold text-emerald-400">{percent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percent}%`,
                            background: `linear-gradient(90deg, #10B981, ${goal.color || '#6366F1'})`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{formatMoney(goal.currentAmount)}</span>
                        <span>Meta: {formatMoney(goal.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 text-center rounded-2xl bg-slate-800/20 text-slate-400 text-xs">
                <p className="mb-3">No tienes metas creadas aún.</p>
                <button
                  onClick={() => openGoalModal()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  + Crear Primera Meta
                </button>
              </div>
            )}
          </div>

          {/* Quick Debt Radar Widget */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard size={18} className="text-amber-400" />
                <span>Deudas y Compromisos</span>
              </h3>
              <button
                onClick={() => openDebtModal()}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Registrar Deuda"
              >
                <Plus size={16} />
              </button>
            </div>

            {debts.length > 0 ? (
              <div className="space-y-2.5">
                {debts.slice(0, 2).map((d) => (
                  <div key={d.id} className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{d.name}</p>
                      <span className="text-[11px] text-slate-400">{d.interestRate}% APR</span>
                    </div>
                    <span className="font-black text-amber-400">{formatMoney(d.remainingAmount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center rounded-2xl bg-slate-800/20 text-slate-400 text-xs">
                <p className="mb-3">¡Excelente! No tienes deudas registradas.</p>
                <button
                  onClick={() => openDebtModal()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  + Registrar Deuda / Crédito
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
