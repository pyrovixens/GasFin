import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Trash2, 
  DollarSign, 
  ShieldCheck,
  Zap,
  RotateCcw,
  Sliders,
  Wallet,
  AlertCircle,
  Percent,
  Search,
  Filter,
  ArrowRight,
  Info,
  Check,
  Tag
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { CATEGORY_COLORS, DEFAULT_EXPENSE_CATEGORIES } from '../data/initialData';
import { CategoryBudget } from '../types';

export const BudgetsView: React.FC = () => {
  const { 
    budgets, 
    addBudget, 
    updateBudget, 
    deleteBudget, 
    transactions, 
    formatMoney, 
    metrics,
    currentCurrency,
    openTransactionModal 
  } = useFinancial();

  // Custom base money in account (if user wants to customize instead of total income)
  const [customBaseMoney, setCustomBaseMoney] = useState<number | null>(() => {
    const saved = localStorage.getItem('gastfin_custom_budget_base');
    return saved ? parseFloat(saved) : null;
  });
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [tempBaseInput, setTempBaseInput] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  
  // Form State
  const [categoryInput, setCategoryInput] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [notesInput, setNotesInput] = useState('');
  
  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<'all' | 'exceeded' | 'warning' | 'ok'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Effective Base Money to calculate against
  const effectiveBaseMoney = useMemo(() => {
    if (customBaseMoney !== null && customBaseMoney > 0) {
      return customBaseMoney;
    }
    return metrics.totalIncome > 0 ? metrics.totalIncome : 0;
  }, [customBaseMoney, metrics.totalIncome]);

  // Calculate actual spending per category
  const spendingByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  // Total budgeted vs Total spent in budgeted categories
  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((acc, b) => acc + (b.limitAmount || 0), 0);
    const totalSpent = budgets.reduce((acc, b) => acc + (spendingByCategory[b.category] || 0), 0);
    const remainingInBudget = totalBudget - totalSpent;
    const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Base money allocation
    const unallocatedMoney = effectiveBaseMoney > 0 ? effectiveBaseMoney - totalBudget : 0;
    const budgetPctOfBase = effectiveBaseMoney > 0 ? (totalBudget / effectiveBaseMoney) * 100 : 0;
    const isOverAllocated = effectiveBaseMoney > 0 && totalBudget > effectiveBaseMoney;
    const overAllocatedAmount = isOverAllocated ? totalBudget - effectiveBaseMoney : 0;

    return {
      totalBudget,
      totalSpent,
      remainingInBudget,
      overallPct,
      unallocatedMoney,
      budgetPctOfBase,
      isOverAllocated,
      overAllocatedAmount
    };
  }, [budgets, spendingByCategory, effectiveBaseMoney]);

  // Detailed Analysis of each budget with alerts
  const analyzedBudgets = useMemo(() => {
    return budgets.map(b => {
      const spent = spendingByCategory[b.category] || 0;
      const limit = b.limitAmount || 0;
      const pct = limit > 0 ? (spent / limit) * 100 : 0;
      const remaining = limit - spent;
      const threshold = b.warningThresholdPct ?? 80;
      
      const isExceeded = spent > limit;
      const isWarning = !isExceeded && pct >= threshold;
      const isOk = !isExceeded && !isWarning;

      // Status label and colors
      let status: 'exceeded' | 'warning' | 'ok' = 'ok';
      if (isExceeded) status = 'exceeded';
      else if (isWarning) status = 'warning';

      return {
        ...b,
        spent,
        pct,
        remaining,
        threshold,
        isExceeded,
        isWarning,
        isOk,
        status,
        color: CATEGORY_COLORS[b.category] || '#6366F1'
      };
    });
  }, [budgets, spendingByCategory]);

  // Counts for filters
  const exceededCount = useMemo(() => analyzedBudgets.filter(b => b.isExceeded).length, [analyzedBudgets]);
  const warningCount = useMemo(() => analyzedBudgets.filter(b => b.isWarning).length, [analyzedBudgets]);
  const okCount = useMemo(() => analyzedBudgets.filter(b => b.isOk).length, [analyzedBudgets]);

  // Filtered budgets
  const filteredBudgets = useMemo(() => {
    return analyzedBudgets.filter(b => {
      // Status filter
      if (statusFilter === 'exceeded' && !b.isExceeded) return false;
      if (statusFilter === 'warning' && !b.isWarning) return false;
      if (statusFilter === 'ok' && !b.isOk) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return b.category.toLowerCase().includes(q) || (b.notes && b.notes.toLowerCase().includes(q));
      }

      return true;
    });
  }, [analyzedBudgets, statusFilter, searchQuery]);

  // Handle Base Money Editing
  const handleSaveBaseMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBaseInput);
    if (!isNaN(val) && val > 0) {
      setCustomBaseMoney(val);
      localStorage.setItem('gastfin_custom_budget_base', val.toString());
    } else {
      setCustomBaseMoney(null);
      localStorage.removeItem('gastfin_custom_budget_base');
    }
    setIsEditingBase(false);
  };

  const handleResetBaseMoneyToIncome = () => {
    setCustomBaseMoney(null);
    localStorage.removeItem('gastfin_custom_budget_base');
    setIsEditingBase(false);
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingBudget(null);
    setCategoryInput('');
    setLimitInput('');
    setWarningThreshold(80);
    setNotesInput('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (b: CategoryBudget) => {
    setEditingBudget(b);
    setCategoryInput(b.category);
    setLimitInput((b.limitAmount ?? 0).toString());
    setWarningThreshold(b.warningThresholdPct ?? 80);
    setNotesInput(b.notes || '');
    setIsModalOpen(true);
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0 || !categoryInput.trim()) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        category: categoryInput.trim(),
        limitAmount: limit,
        warningThresholdPct: warningThreshold,
        notes: notesInput.trim()
      });
    } else {
      addBudget({
        category: categoryInput.trim(),
        limitAmount: limit,
        period: 'monthly',
        warningThresholdPct: warningThreshold,
        notes: notesInput.trim()
      });
    }

    setIsModalOpen(false);
  };

  // Quick Preset 50/30/20 Distribution
  const handleApply503020Preset = () => {
    const base = effectiveBaseMoney > 0 ? effectiveBaseMoney : metrics.totalIncome;
    if (base <= 0) {
      alert('Anota primero tus ingresos o define una base de dinero disponible para calcular tus límites.');
      return;
    }

    const presets = [
      { category: 'Supermercado & Alimentos', limitAmount: Math.round(base * 0.25), warningThresholdPct: 80, notes: 'Alimentación familiar del mes' },
      { category: 'Luz & Electricidad', limitAmount: Math.round(base * 0.08), warningThresholdPct: 85, notes: 'Cuenta de luz' },
      { category: 'Internet & Teléfono', limitAmount: Math.round(base * 0.07), warningThresholdPct: 90, notes: 'Planes de telecomunicaciones' },
      { category: 'Transporte & Combustible', limitAmount: Math.round(base * 0.10), warningThresholdPct: 80, notes: 'Bencina o pasajes' },
      { category: 'Recreación & Salidas', limitAmount: Math.round(base * 0.15), warningThresholdPct: 75, notes: 'Restaurantes, cine y salidas' },
      { category: 'Suscripciones & Streaming', limitAmount: Math.round(base * 0.05), warningThresholdPct: 90, notes: 'Streaming y apps' },
    ];

    presets.forEach(p => {
      addBudget({
        category: p.category,
        limitAmount: p.limitAmount,
        period: 'monthly',
        warningThresholdPct: p.warningThresholdPct,
        notes: p.notes
      });
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* 1. PRINCIPAL CARD: BASE MONEY & ALLOCATION DASHBOARD */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-5">
        
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow-indigo">
              <BarChart3 size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white">Tus Límites de Gasto del Mes</h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Control & Alertas
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fija topes máximos por categoría calculados con tu dinero real y recibe avisos automáticos antes de pasarte.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {budgets.length === 0 && (
              <button
                onClick={handleApply503020Preset}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-indigo-500/30 transition-all flex items-center gap-1.5 active:scale-95"
                title="Generar topes sugeridos según tus ingresos"
              >
                <Sparkles size={15} className="text-amber-400" />
                <span>Sugerir Topes Automáticos</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={16} strokeWidth={3} />
              <span>+ Nuevo Tope de Gasto</span>
            </button>
          </div>
        </div>

        {/* Base Money in Account Calculator Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                Dinero Base en Cuenta a Distribuir:
              </span>
              <span className="text-base font-black font-mono text-emerald-400">
                {effectiveBaseMoney > 0 ? formatMoney(effectiveBaseMoney) : 'Sin ingresos registrados'}
              </span>
              {customBaseMoney !== null && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Personalizado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isEditingBase ? (
                <form onSubmit={handleSaveBaseMoney} className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    placeholder="Monto base ($)"
                    value={tempBaseInput}
                    onChange={(e) => setTempBaseInput(e.target.value)}
                    className="w-32 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
                  >
                    Fijar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBase(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTempBaseInput(effectiveBaseMoney > 0 ? effectiveBaseMoney.toString() : '');
                      setIsEditingBase(true);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Sliders size={13} />
                    <span>{customBaseMoney !== null ? 'Cambiar Base' : 'Ajustar Monto Base'}</span>
                  </button>
                  {customBaseMoney !== null && (
                    <button
                      onClick={handleResetBaseMoneyToIncome}
                      className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                      title="Volver a usar ingresos reales automáticos"
                    >
                      (Restablecer a sueldo real)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Key Distribution Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: Total Topes */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold">Total en Topes Fijados</span>
              <p className="text-lg font-black text-white font-mono">{formatMoney(totals.totalBudget)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{budgets.length} categorías</span>
                {effectiveBaseMoney > 0 && (
                  <span className={`font-bold ${totals.isOverAllocated ? 'text-rose-400' : 'text-indigo-300'}`}>
                    {totals.budgetPctOfBase.toFixed(0)}% del dinero
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Gasto Real */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold">Gasto Real que Llevas</span>
              <p className="text-lg font-black text-rose-400 font-mono">{formatMoney(totals.totalSpent)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{totals.overallPct.toFixed(0)}% de los topes</span>
                <span className="text-slate-400">Consumido</span>
              </div>
            </div>

            {/* Card 3: Dinero Restante por Gastar en Topes */}
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              totals.remainingInBudget >= 0 ? 'bg-slate-900/80 border-slate-800' : 'bg-rose-950/20 border-rose-500/40'
            }`}>
              <span className="text-[11px] text-slate-400 font-semibold">
                {totals.remainingInBudget >= 0 ? 'Disponible en tus Topes' : 'Excedido de los Topes'}
              </span>
              <p className={`text-lg font-black font-mono ${
                totals.remainingInBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {totals.remainingInBudget >= 0 ? '+' : '-'}{formatMoney(Math.abs(totals.remainingInBudget))}
              </p>
              <span className="text-[11px] text-slate-400 block">
                {totals.remainingInBudget >= 0 ? 'Aún puedes gastar esto' : 'Te pasaste del presupuesto'}
              </span>
            </div>

            {/* Card 4: Margen Libre para Ahorro / No Comprometido */}
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              totals.isOverAllocated 
                ? 'bg-rose-950/30 border-rose-500/50' 
                : 'bg-emerald-950/20 border-emerald-500/30'
            }`}>
              <span className="text-[11px] text-slate-400 font-semibold">
                {totals.isOverAllocated ? '⚠️ Falta para cubrir topes' : 'Margen Libre para Ahorro'}
              </span>
              <p className={`text-lg font-black font-mono ${
                totals.isOverAllocated ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {totals.isOverAllocated 
                  ? `-${formatMoney(totals.overAllocatedAmount)}` 
                  : `+${formatMoney(totals.unallocatedMoney)}`}
              </p>
              <span className="text-[11px] text-slate-400 block">
                {totals.isOverAllocated 
                  ? 'Tus topes superan tus ingresos' 
                  : 'Plata libre no comprometida'}
              </span>
            </div>

          </div>

          {/* Visual Distribution Progress Bar */}
          {effectiveBaseMoney > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Distribución del Dinero del Mes</span>
                <span>
                  {totals.isOverAllocated 
                    ? `⚠️ Topes asignados al ${totals.budgetPctOfBase.toFixed(0)}% del ingreso`
                    : `${totals.budgetPctOfBase.toFixed(0)}% asignado a gastos • ${(100 - totals.budgetPctOfBase).toFixed(0)}% libre para ahorro`}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  className="h-full bg-rose-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, effectiveBaseMoney > 0 ? (totals.totalSpent / effectiveBaseMoney) * 100 : 0)}%` }}
                  title={`Gastado real: ${formatMoney(totals.totalSpent)}`}
                />
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, effectiveBaseMoney > 0 ? (Math.max(0, totals.totalBudget - totals.totalSpent) / effectiveBaseMoney) * 100 : 0)}%` }}
                  title={`Disponible en topes: ${formatMoney(Math.max(0, totals.totalBudget - totals.totalSpent))}`}
                />
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.max(0, 100 - totals.budgetPctOfBase)}%` }}
                  title={`Margen libre para ahorro: ${formatMoney(totals.unallocatedMoney)}`}
                />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Gastado ({formatMoney(totals.totalSpent)})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Por gastar en topes ({formatMoney(Math.max(0, totals.totalBudget - totals.totalSpent))})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Libre para Ahorro ({formatMoney(totals.unallocatedMoney)})</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 2. DYNAMIC INTELLIGENT ALERT BANNER (IF REACHING OR EXCEEDED) */}
      {(exceededCount > 0 || warningCount > 0) && (
        <div className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
          exceededCount > 0 
            ? 'bg-gradient-to-r from-rose-950/90 via-red-900/60 to-slate-900 border-rose-500 shadow-glow-rose' 
            : 'bg-gradient-to-r from-amber-950/90 via-yellow-900/60 to-slate-900 border-amber-500 shadow-glow-amber'
        }`}>
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-3 rounded-2xl flex-shrink-0 animate-pulse ${
              exceededCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  exceededCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  {exceededCount > 0 ? '🚨 Alerta de Límite Superado' : '⚠️ Alerta Temprana de Tope'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {exceededCount > 0 
                  ? `Tienes ${exceededCount} ${exceededCount === 1 ? 'categoría que ha sobrepasado' : 'categorías que han sobrepasado'} su límite.` 
                  : `Tienes ${warningCount} ${warningCount === 1 ? 'categoría cerca' : 'categorías cerca'} de alcanzar el tope fijado.`}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {exceededCount > 0 
                  ? 'Revisa tus gastos en estas áreas para evitar un desbalance en tu saldo mensual.' 
                  : 'Estás a punto de copar el límite establecido. Modera los gastos en estas categorías.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {exceededCount > 0 && (
              <button
                onClick={() => setStatusFilter('exceeded')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all"
              >
                Ver Sobrepasadas ({exceededCount})
              </button>
            )}
            {warningCount > 0 && (
              <button
                onClick={() => setStatusFilter('warning')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition-all"
              >
                Ver Cerca del Tope ({warningCount})
              </button>
            )}
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Mostrar Todas
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. FILTER BAR & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Todas ({budgets.length})
          </button>
          
          <button
            onClick={() => setStatusFilter('exceeded')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'exceeded' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-slate-800/80 text-rose-300/80 hover:text-rose-200'
            }`}
          >
            <span>🚨 Sobrepasadas</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px]">{exceededCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('warning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'warning' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'bg-slate-800/80 text-amber-300/80 hover:text-amber-200'
            }`}
          >
            <span>⚠️ Cerca del Tope</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px]">{warningCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('ok')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'ok' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-slate-800/80 text-emerald-300/80 hover:text-emerald-200'
            }`}
          >
            <span>🟢 Bajo Control</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px]">{okCount}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

      </div>

      {/* 4. BUDGET CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBudgets.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
            <BarChart3 className="mx-auto text-slate-500" size={38} />
            <h3 className="text-lg font-bold text-white">
              {budgets.length === 0 
                ? 'No has fijado ningún tope de gasto todavía' 
                : 'No hay categorías que coincidan con el filtro seleccionado'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {budgets.length === 0 
                ? 'Ponle un límite mensual a tus salidas, supermercado o cuentas para no pasarte y recibir alertas automáticas.'
                : 'Prueba cambiando de pestaña o limpiando el buscador.'}
            </p>
            {budgets.length === 0 ? (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all"
              >
                + Crear Primer Tope de Gasto
              </button>
            ) : (
              <button
                onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white"
              >
                Ver Todas las Categorías
              </button>
            )}
          </div>
        ) : (
          filteredBudgets.map((b) => {
            return (
              <div 
                key={b.id}
                className={`p-5 rounded-3xl bg-slate-900/90 border-2 transition-all duration-300 shadow-card-soft relative flex flex-col justify-between ${
                  b.isExceeded 
                    ? 'border-rose-500/70 bg-gradient-to-b from-rose-950/20 to-slate-900/90 shadow-glow-rose' 
                    : b.isWarning 
                    ? 'border-amber-500/60 bg-gradient-to-b from-amber-950/20 to-slate-900/90 shadow-glow-amber' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Category Header & Top Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: b.color }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-white text-sm truncate" title={b.category}>
                          {b.category}
                        </h4>
                        {b.notes && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{b.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Modificar límite o alerta"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el tope de gasto para "${b.category}"?`)) {
                            deleteBudget(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar tope"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Alert Banner Inside Card */}
                  {b.isExceeded && (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
                      <span>🚨 ¡Te pasaste por {formatMoney(Math.abs(b.remaining))}!</span>
                    </div>
                  )}

                  {b.isWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
                      <span>⚠️ Cerca del tope: Te quedan {formatMoney(b.remaining)}</span>
                    </div>
                  )}

                  {/* Amounts */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400 font-semibold">Gastado este mes:</span>
                      <span className={`font-black text-lg font-mono ${
                        b.isExceeded ? 'text-rose-400' : b.isWarning ? 'text-amber-400' : 'text-white'
                      }`}>
                        {formatMoney(b.spent)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500">Tope máximo fijado:</span>
                      <span className="text-slate-200 font-bold font-mono">{formatMoney(b.limitAmount)}</span>
                    </div>
                  </div>

                  {/* Progress Bar & Threshold Marker */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={b.isExceeded ? 'text-rose-400' : b.isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                        {b.pct.toFixed(0)}% consumido
                      </span>
                      <span className="text-slate-400 font-normal">
                        Alerta al {b.threshold}%
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.isExceeded ? 'bg-rose-500 shadow-glow-rose' : b.isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.pct)}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {b.remaining >= 0 ? `Quedan: ${formatMoney(b.remaining)}` : `Sobregiro: ${formatMoney(Math.abs(b.remaining))}`}
                  </span>
                  <button
                    onClick={() => openTransactionModal('expense', { category: b.category } as any)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline active:scale-95"
                  >
                    <span>+ Anotar Gasto</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 5. ADD / EDIT BUDGET MODAL (FULLY CUSTOMIZABLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div>
              <h3 className="text-xl font-black text-white">
                {editingBudget ? 'Editar Tope de Gasto' : 'Configurar Nuevo Tope de Gasto'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajusta el límite mensual a tu gusto y define cuándo quieres que te avisemos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Field */}
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>Categoría</span>
                  <span className="text-[11px] text-slate-400 font-normal">Elige o escribe una nueva</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    list="expense-categories-list"
                    placeholder="Ej: Supermercado, Salidas, Cuentas..."
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="expense-categories-list">
                    {DEFAULT_EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>

                  {/* Quick Category Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Supermercado & Alimentos', 'Recreación & Salidas', 'Luz & Electricidad', 'Transporte & Combustible'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setCategoryInput(chip)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                          categoryInput === chip 
                            ? 'bg-indigo-600 border-indigo-400 text-white font-bold' 
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Limit Amount Field with Quick % of Base Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-slate-300 font-bold">
                    Tope Máximo Mensual ({currentCurrency.symbol})
                  </label>
                  {effectiveBaseMoney > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Base disponible: {formatMoney(effectiveBaseMoney)}
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej: 200000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-indigo-500"
                />

                {/* Quick Percentage Calculator Buttons */}
                {effectiveBaseMoney > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Calcular %:</span>
                    {[10, 15, 20, 25, 30, 50].map(pct => {
                      const calculated = Math.round(effectiveBaseMoney * (pct / 100));
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setLimitInput(calculated.toString())}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-indigo-300 border border-slate-700 hover:border-indigo-500 transition-all"
                          title={`${pct}% de ${formatMoney(effectiveBaseMoney)} = ${formatMoney(calculated)}`}
                        >
                          {pct}%
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Early Warning Threshold Selector */}
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>¿Cuándo quieres que te alertemos?</span>
                  <span className="text-amber-400 font-bold text-xs">{warningThreshold}% consumido</span>
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { pct: 70, label: 'Al 70%', sub: 'Aviso temprano' },
                    { pct: 80, label: 'Al 80%', sub: 'Recomendado' },
                    { pct: 90, label: 'Al 90%', sub: 'Último momento' },
                    { pct: 100, label: 'Al 100%', sub: 'Solo si me paso' },
                  ].map(item => (
                    <button
                      key={item.pct}
                      type="button"
                      onClick={() => setWarningThreshold(item.pct)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        warningThreshold === item.pct
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="font-bold text-xs text-white">{item.label}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{item.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">
                  Nota o Recordatorio <span className="text-slate-500 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Incluye salidas de fin de semana..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all active:scale-95"
                >
                  {editingBudget ? 'Guardar Cambios' : 'Fijar Tope de Gasto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
