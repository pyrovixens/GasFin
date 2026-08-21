import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Filter, 
  Plus, 
  ArrowRight,
  PieChart as PieChartIcon,
  AlertTriangle,
  Flame,
  Check,
  Calculator,
  RefreshCw,
  Target,
  CreditCard,
  Building2,
  TrendingDown,
  Clock
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { SavingsTip } from '../types';

export const SavingsAdvisorView: React.FC = () => {
  const { 
    savingsTips, 
    toggleSavingsTip, 
    addSavingsTip, 
    formatMoney, 
    metrics, 
    transactions,
    goals,
    debts,
    setActiveView,
    openGoalModal,
    currentCurrency
  } = useFinancial();

  // Category filter for savings tips
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // New Custom Tip Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Suscripciones & Servicios');
  const [newDescription, setNewDescription] = useState('');
  const [newMonthly, setNewMonthly] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'high'>('easy');

  // ==========================================
  // 1. DYNAMIC AUDIT OF REAL USER TRANSACTIONS
  // ==========================================

  // Total Real Income & Expenses (No artificial defaults)
  const realIncome = metrics.totalIncome;
  const realExpense = metrics.totalExpense;
  const baseIncome = realIncome;

  // Categorize Real Expenses into 50/30/20 buckets
  const realExpensesAudit = useMemo(() => {
    const expenseList = transactions.filter(t => t.type === 'expense');

    let needsAmount = 0;
    let wantsAmount = 0;
    const catMap: Record<string, number> = {};
    let recurringAmount = 0;

    const needsKeywords = ['vivienda', 'arriendo', 'dividendo', 'luz', 'agua', 'gas', 'servicios', 'supermercado', 'salud', 'transporte', 'educacion', 'comida basica'];

    expenseList.forEach(t => {
      const catLower = (t.category || '').toLowerCase();
      const descLower = (t.description || '').toLowerCase();

      catMap[t.category] = (catMap[t.category] || 0) + t.amount;

      if (t.isRecurring || catLower.includes('suscrip') || catLower.includes('streaming') || descLower.includes('netflix') || descLower.includes('spotify') || descLower.includes('gimnasio')) {
        recurringAmount += t.amount;
      }

      const isNeed = needsKeywords.some(k => catLower.includes(k) || descLower.includes(k));
      if (isNeed) {
        needsAmount += t.amount;
      } else {
        wantsAmount += t.amount;
      }
    });

    const sortedCategories = Object.entries(catMap)
      .map(([name, amount]) => ({
        name,
        amount,
        pctOfTotal: realExpense > 0 ? (amount / realExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const highestCategory = sortedCategories[0] || null;

    // Real Percentages vs Income
    const realNeedsPct = baseIncome > 0 ? (needsAmount / baseIncome) * 100 : 0;
    const realWantsPct = baseIncome > 0 ? (wantsAmount / baseIncome) * 100 : 0;
    const realSavingsPct = baseIncome > 0 ? Math.max(0, (metrics.netCashFlow / baseIncome) * 100) : 0;

    return {
      needsAmount,
      wantsAmount,
      recurringAmount,
      sortedCategories,
      highestCategory,
      realNeedsPct,
      realWantsPct,
      realSavingsPct
    };
  }, [transactions, realExpense, baseIncome, metrics.netCashFlow]);

  // Ideal 50/30/20 targets
  const budget503020 = useMemo(() => {
    return {
      needs50: baseIncome * 0.50,
      wants30: baseIncome * 0.30,
      savings20: baseIncome * 0.20,
    };
  }, [baseIncome]);

  // ====================================================
  // 2. DYNAMIC AI PROPOSALS BASED ON REAL DATA CHANGES
  // ====================================================
  const dynamicAiProposals = useMemo(() => {
    const proposals: Array<{
      id: string;
      title: string;
      category: string;
      description: string;
      impactMonthly: number;
      impactAnnual: number;
      urgency: 'alta' | 'media' | 'optimizacion';
      icon: any;
      actionText?: string;
      onAction?: () => void;
    }> = [];

    // Proposal 1: Highest spending category optimization
    if (realExpensesAudit.highestCategory && realExpensesAudit.highestCategory.amount > 0) {
      const topCat = realExpensesAudit.highestCategory;
      const suggestedCut = Math.round(topCat.amount * 0.12); // 12% optimization
      proposals.push({
        id: 'top-cat-proposal',
        title: `Optimización en ${topCat.name} (Gasto Mayor)`,
        category: topCat.name,
        description: `Representa el ${topCat.pctOfTotal.toFixed(0)}% de todos tus egresos (${formatMoney(topCat.amount)}). Reducir un 12% mediante cotizaciones o compras mayoristas liberará capital inmediatamente.`,
        impactMonthly: suggestedCut,
        impactAnnual: suggestedCut * 12,
        urgency: topCat.pctOfTotal > 35 ? 'alta' : 'media',
        icon: TrendingDown,
      });
    }

    // Proposal 2: Recurring payments / Subscriptions leak
    if (realExpensesAudit.recurringAmount > 0) {
      const recPotential = Math.round(realExpensesAudit.recurringAmount * 0.30); // 30% cut on unused services
      proposals.push({
        id: 'recurring-leak-proposal',
        title: `Auditoría de Suscripciones y Pagos Fijos`,
        category: 'Suscripciones & Servicios',
        description: `Tienes ${formatMoney(realExpensesAudit.recurringAmount)}/mes en cobros recurrentes (${formatMoney(realExpensesAudit.recurringAmount * 12)} al año). Cancelar servicios poco usados o migrar a planes familiares ahorra hasta un 30%.`,
        impactMonthly: recPotential,
        impactAnnual: recPotential * 12,
        urgency: 'media',
        icon: RefreshCw,
      });
    }

    // Proposal 3: Wants / Flexible Spending exceeds 30%
    if (realExpensesAudit.realWantsPct > 30) {
      const wantsOverload = Math.round(realExpensesAudit.wantsAmount - budget503020.wants30);
      proposals.push({
        id: 'wants-overload-proposal',
        title: `Ajuste en Gastos Flexibles y Deseos`,
        category: 'Ocio & Gastos Variables',
        description: `Tus gastos no esenciales representan el ${realExpensesAudit.realWantsPct.toFixed(0)}% del ingreso (ideal máximo 30%). Moderar compras de impulso y salidas puede recuperar hasta ${formatMoney(wantsOverload > 0 ? wantsOverload : budget503020.wants30 * 0.15)} al mes.`,
        impactMonthly: wantsOverload > 0 ? wantsOverload : Math.round(budget503020.wants30 * 0.15),
        impactAnnual: (wantsOverload > 0 ? wantsOverload : Math.round(budget503020.wants30 * 0.15)) * 12,
        urgency: 'alta',
        icon: Flame,
      });
    }

    // Proposal 4: Deficit Emergency Plan OR Surplus Accelerator
    if (metrics.isDeficit) {
      proposals.push({
        id: 'deficit-recovery-plan',
        title: `Plan de Choque por Déficit de Caja`,
        category: 'Urgencia Financiera',
        description: `Tus egresos superan tus ingresos por ${formatMoney(metrics.deficitAmount)}. Se recomienda congelar compras extraordinarias y transferir el balance a equilibrio.`,
        impactMonthly: metrics.deficitAmount,
        impactAnnual: metrics.deficitAmount * 12,
        urgency: 'alta',
        icon: AlertTriangle,
      });
    } else if (metrics.netCashFlow > 0) {
      const investSurplus = Math.round(metrics.netCashFlow * 0.50);
      proposals.push({
        id: 'surplus-accelerator-plan',
        title: `Inyección Automática a Metas y Fondos`,
        category: 'Crecimiento de Capital',
        description: `Cuentas con un superávit mensual de ${formatMoney(metrics.netCashFlow)}. Programar el 50% (${formatMoney(investSurplus)}) hacia tus Metas Financieras acelerará tu libertad financiera.`,
        impactMonthly: investSurplus,
        impactAnnual: investSurplus * 12,
        urgency: 'optimizacion',
        icon: Target,
        actionText: '+ Crear Meta',
        onAction: () => openGoalModal(),
      });
    }

    // Proposal 5: Debt Snowball Opportunity if debts exist
    if (debts.length > 0 && metrics.netCashFlow > 0) {
      const topDebt = [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];
      const extraPayment = Math.round(metrics.netCashFlow * 0.30);
      proposals.push({
        id: 'debt-avalanche-proposal',
        title: `Amortización Acelerada de Deuda: ${topDebt.creditor}`,
        category: 'Deudas & Créditos',
        description: `Tu deuda con mayor costo es ${topDebt.creditor} (${topDebt.interestRate || 0}% interés). Destinar un abono extra de ${formatMoney(extraPayment)} al mes reducirá meses de intereses.`,
        impactMonthly: extraPayment,
        impactAnnual: extraPayment * 12,
        urgency: 'optimizacion',
        icon: CreditCard,
        actionText: 'Ver Deudas',
        onAction: () => setActiveView('debts'),
      });
    }

    return proposals;
  }, [realExpensesAudit, metrics, debts, budget503020, formatMoney, openGoalModal, setActiveView]);

  // Combined totals of all proposals + custom tips
  const totalMonthlyPotential = useMemo(() => {
    const customTotal = savingsTips.reduce((acc, t) => acc + t.estimatedMonthlySavings, 0);
    const dynamicTotal = dynamicAiProposals.reduce((acc, p) => acc + p.impactMonthly, 0);
    return customTotal + dynamicTotal;
  }, [savingsTips, dynamicAiProposals]);

  const totalAnnualPotential = totalMonthlyPotential * 12;

  const appliedMonthlySavings = useMemo(() => {
    return savingsTips
      .filter(t => t.isApplied)
      .reduce((acc, t) => acc + t.estimatedMonthlySavings, 0);
  }, [savingsTips]);

  // Filtered custom tips
  const filteredCustomTips = useMemo(() => {
    if (selectedFilter === 'all') return savingsTips;
    if (selectedFilter === 'applied') return savingsTips.filter(t => t.isApplied);
    if (selectedFilter === 'pending') return savingsTips.filter(t => !t.isApplied);
    return savingsTips.filter(t => t.category === selectedFilter);
  }, [savingsTips, selectedFilter]);

  const handleAddTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthly = parseFloat(newMonthly);
    if (isNaN(monthly) || monthly <= 0 || !newTitle.trim()) return;

    addSavingsTip({
      title: newTitle,
      category: newCategory,
      description: newDescription || 'Optimización personalizada creada por el usuario.',
      estimatedMonthlySavings: monthly,
      estimatedAnnualSavings: monthly * 12,
      difficulty: newDifficulty,
      actionType: 'operational_efficiency',
      isApplied: false,
    });

    setIsCustomModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewMonthly('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner: AI Dynamic Savings Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <Lightbulb size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Asesor Inteligente de Ahorro en Vivo</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Adaptable a tus Movimientos
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analiza tus ingresos y gastos reales en tiempo real, recalculando sugerencias y metas automáticamente con cada cambio.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ Nueva Idea Personalizada</span>
          </button>
        </div>

        {/* Big Savings Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/30">
            <span className="text-xs text-slate-300">Potencial de Ahorro Detectado</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">+{formatMoney(totalMonthlyPotential)}/mes</p>
            <span className="text-[11px] text-emerald-300/80">{dynamicAiProposals.length} propuestas activas en vivo</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30">
            <span className="text-xs text-slate-300">Impacto Anual Proyectado</span>
            <p className="text-2xl font-black text-indigo-300 mt-1">+{formatMoney(totalAnnualPotential)}/año</p>
            <span className="text-[11px] text-indigo-300/80">Capital extra recuperable</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
            <span className="text-xs text-slate-300">Ahorro ya Aplicado</span>
            <p className="text-2xl font-black text-white mt-1">+{formatMoney(appliedMonthlySavings)}/mes</p>
            <span className="text-[11px] text-teal-400 font-semibold">
              {savingsTips.filter(t => t.isApplied).length} optimizaciones fijadas
            </span>
          </div>
        </div>
      </div>

      {/* DYNAMIC AI PROPOSALS SECTION (BASED ON LIVE TRANSACTIONS) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-400" size={20} />
            <h3 className="text-base font-extrabold text-white">Propuestas Dinámicas IA (Calculadas con tus Datos Reales)</h3>
          </div>
          <span className="text-[11px] text-emerald-300/90 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            ⚡ Se actualizan con cada ingreso o gasto
          </span>
        </div>

        {dynamicAiProposals.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-800/40 text-center text-slate-400 text-xs">
            Ingresa tus primeros movimientos en el libro de gastos para que el Asesor IA genere propuestas personalizadas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {dynamicAiProposals.map((prop) => {
              const Icon = prop.icon;
              const isUrgent = prop.urgency === 'alta';

              return (
                <div 
                  key={prop.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isUrgent 
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-glow-rose' 
                      : 'bg-slate-800/50 border-slate-700/80 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${isUrgent ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isUrgent ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {prop.category}
                          </span>
                          <h4 className="font-bold text-white text-sm mt-1">{prop.title}</h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">+{formatMoney(prop.impactMonthly)}/mes</span>
                        <p className="text-[10px] text-slate-400 font-mono">+{formatMoney(prop.impactAnnual)}/año</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {prop.description}
                    </p>
                  </div>

                  {prop.actionText && prop.onAction && (
                    <div className="pt-3 mt-2 border-t border-slate-700/50 flex justify-end">
                      <button
                        onClick={prop.onAction}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>{prop.actionText}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 50/30/20 REAL AUDIT COMPARISON */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChartIcon size={18} className="text-emerald-400" />
              <span>Auditoría Real: Regla 50 / 30 / 20</span>
            </h3>
            <p className="text-xs text-slate-400">
              Compara tus gastos reales registrados frente a la distribución financiera óptima.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-xs text-slate-400">Base Mensual:</span>
            <span className={`font-extrabold text-sm font-mono ${baseIncome > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {formatMoney(baseIncome)}
            </span>
            {baseIncome === 0 && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Esperando ingresos
              </span>
            )}
          </div>
        </div>

        {baseIncome === 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/70 text-xs text-slate-300 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400 flex-shrink-0" />
            <span>
              Aún no tienes ingresos registrados. En cuanto ingreses tu sueldo o cobros, la <strong>Regla 50/30/20</strong> calculará automáticamente tus presupuestos ideales de Necesidades (50%), Deseos (30%) y Ahorro (20%).
            </span>
          </div>
        )}

        {/* 3 Categories Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 50% Needs */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  50% Necesidades
                </span>
                <h4 className="font-bold text-white text-sm mt-1.5">Gastos Fijos & Esenciales</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-rose-400">{formatMoney(budget503020.needs50)}</span>
                <p className="text-[10px] text-slate-400">Real: {formatMoney(realExpensesAudit.needsAmount)} ({realExpensesAudit.realNeedsPct.toFixed(0)}%)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Vivienda, luz, agua, supermercado, salud y transporte.
            </p>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${Math.min(100, realExpensesAudit.realNeedsPct)}%` }} />
            </div>
          </div>

          {/* 30% Wants */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  30% Deseos
                </span>
                <h4 className="font-bold text-white text-sm mt-1.5">Gastos Flexibles & Ocio</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-amber-400">{formatMoney(budget503020.wants30)}</span>
                <p className="text-[10px] text-slate-400">Real: {formatMoney(realExpensesAudit.wantsAmount)} ({realExpensesAudit.realWantsPct.toFixed(0)}%)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Recreación, salidas a comer, compras, streaming y hobbies.
            </p>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, realExpensesAudit.realWantsPct)}%` }} />
            </div>
          </div>

          {/* 20% Savings & Debt */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  20% Ahorro & Metas
                </span>
                <h4 className="font-bold text-white text-sm mt-1.5">Fondos & Inversiones</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400">{formatMoney(budget503020.savings20)}</span>
                <p className="text-[10px] text-slate-400">Real: {formatMoney(Math.max(0, metrics.netCashFlow))} ({realExpensesAudit.realSavingsPct.toFixed(0)}%)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Fondo de reserva, metas financieras y aportes a capital.
            </p>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, realExpensesAudit.realSavingsPct)}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* CATALOG OF PRACTICAL SAVINGS IDEAS */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Catálogo de Ideas de Ahorro y Optimización</h3>
            <p className="text-xs text-slate-400">Marca las estrategias implementadas para registrar tu ahorro mensual retenido.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'applied', label: 'Implementadas' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedFilter === f.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCustomTips.map(tip => (
            <div
              key={tip.id}
              onClick={() => toggleSavingsTip(tip.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                tip.isApplied
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-glow-emerald'
                  : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70'
              }`}
            >
              <div className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                tip.isApplied
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-700 border border-slate-600 text-transparent'
              }`}>
                {tip.isApplied && <Check size={14} strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600">
                    {tip.category}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    +{formatMoney(tip.estimatedMonthlySavings)}/mes
                  </span>
                </div>
                <h4 className={`font-bold text-sm mt-1.5 ${tip.isApplied ? 'text-emerald-300' : 'text-white'}`}>
                  {tip.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE CUSTOM SAVINGS IDEA MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Nueva Idea de Ahorro Personalizada</h3>
            
            <form onSubmit={handleAddTipSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Título de la Optimización</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Renegociar plan de internet hogar"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Categoría</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Ahorro Mensual Estimado ({currentCurrency.symbol})</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej: 15000"
                  value={newMonthly}
                  onChange={(e) => setNewMonthly(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Detalle o Estrategia</label>
                <textarea
                  rows={2}
                  placeholder="Pasos para implementar este ahorro..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-glow-emerald transition-all"
                >
                  Guardar Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
