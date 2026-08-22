import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Wallet, 
  AlertCircle, 
  X,
  Sliders,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sparkles,
  LayoutGrid,
  Check
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
    clearAllBudgets,
    transactions, 
    formatMoney, 
    formatInputLive,
    parseRawFromDisplay,
    metrics,
    currentCurrency,
    openTransactionModal
  } = useFinancial();

  // Custom base money in account (if user wants to customize instead of total income)
  const [customBaseMoney, setCustomBaseMoney] = useState<number | null>(() => {
    const saved = localStorage.getItem('gastfin_custom_budget_base_v7');
    return saved ? parseFloat(saved) : null;
  });
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [tempBaseInput, setTempBaseInput] = useState('');

  // Floating Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  
  // Floating Modal State for Delete Confirmations
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; category: string } | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  // Form State
  const [categoryInput, setCategoryInput] = useState(DEFAULT_EXPENSE_CATEGORIES[0] || 'Alimentación & Supermercado');
  const [limitInput, setLimitInput] = useState('');
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [notesInput, setNotesInput] = useState('');

  // Toggle to view only active categories vs all available categories
  const [showAllCategories, setShowAllCategories] = useState<boolean>(true);

  // Effective Base Money: Real total income or user custom base
  const effectiveBaseMoney = useMemo(() => {
    if (customBaseMoney !== null && customBaseMoney >= 0) {
      return customBaseMoney;
    }
    return metrics.totalIncome > 0 ? metrics.totalIncome : 0;
  }, [customBaseMoney, metrics.totalIncome]);

  // 1. Calculate actual spending per category from real transactions
  const spendingByCategory = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Otros Egresos';
        if (!map[cat]) {
          map[cat] = { total: 0, count: 0 };
        }
        map[cat].total += t.amount;
        map[cat].count += 1;
      });
    return map;
  }, [transactions]);

  // 2. Build Unified Category Items: combines categories with real expenses, topes, and available standard categories with 0
  const unifiedCategories = useMemo(() => {
    const categoriesSet = new Set<string>();

    // If showAllCategories is true, include all default categories starting at 0
    if (showAllCategories) {
      DEFAULT_EXPENSE_CATEGORIES.forEach(cat => categoriesSet.add(cat));
    }

    // Always include categories with actual expenses or saved budgets
    Object.keys(spendingByCategory).forEach(cat => categoriesSet.add(cat));
    budgets.forEach(b => categoriesSet.add(b.category));

    const budgetMap = new Map<string, CategoryBudget>();
    budgets.forEach(b => budgetMap.set(b.category, b));

    const list = Array.from(categoriesSet).map(catName => {
      const budget = budgetMap.get(catName) || null;
      const spentData = spendingByCategory[catName] || { total: 0, count: 0 };
      const spent = spentData.total;
      const limit = budget ? budget.limitAmount : 0;
      const hasBudget = budget !== null && limit > 0;
      const pct = hasBudget ? (spent / limit) * 100 : 0;
      const remaining = hasBudget ? limit - spent : 0;
      const threshold = budget?.warningThresholdPct ?? 80;
      const isExceeded = hasBudget && spent > limit;
      const isWarning = hasBudget && !isExceeded && pct >= threshold;

      return {
        category: catName,
        budget,
        hasBudget,
        spent,
        txCount: spentData.count,
        limit,
        pct,
        remaining,
        threshold,
        isExceeded,
        isWarning,
        notes: budget?.notes || '',
      };
    });

    // Sort: categories with budget first, then by spent descending
    return list.sort((a, b) => {
      if (a.hasBudget && !b.hasBudget) return -1;
      if (!a.hasBudget && b.hasBudget) return 1;
      return b.spent - a.spent;
    });
  }, [spendingByCategory, budgets, showAllCategories]);

  // Totals calculations
  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((acc, b) => acc + (b.limitAmount || 0), 0);
    const totalSpentInBudgets = budgets.reduce((acc, b) => acc + (spendingByCategory[b.category]?.total || 0), 0);
    const totalRealExpenses = metrics.totalExpense;
    const remainingInBudget = totalBudget - totalSpentInBudgets;
    const overallPct = totalBudget > 0 ? (totalSpentInBudgets / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpentInBudgets,
      totalRealExpenses,
      remainingInBudget,
      overallPct
    };
  }, [budgets, spendingByCategory, metrics.totalExpense]);

  // Handlers for Base Money
  const handleSaveBaseMoney = () => {
    const val = parseRawFromDisplay(tempBaseInput);
    if (!isNaN(val) && val >= 0) {
      setCustomBaseMoney(val);
      localStorage.setItem('gastfin_custom_budget_base_v7', val.toString());
    }
    setIsEditingBase(false);
  };

  const handleResetBaseToIncome = () => {
    setCustomBaseMoney(null);
    localStorage.removeItem('gastfin_custom_budget_base_v7');
    setIsEditingBase(false);
  };

  // Floating Modal Handlers
  const handleOpenAdd = (presetCategory?: string, presetLimit?: number) => {
    setEditingBudget(null);
    setCategoryInput(presetCategory || DEFAULT_EXPENSE_CATEGORIES[0] || 'Alimentación & Supermercado');
    setLimitInput(presetLimit ? formatInputLive(presetLimit) : '');
    setWarningThreshold(80);
    setNotesInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget: CategoryBudget) => {
    setEditingBudget(budget);
    setCategoryInput(budget.category);
    setLimitInput(formatInputLive(budget.limitAmount));
    setWarningThreshold(budget.warningThresholdPct ?? 80);
    setNotesInput(budget.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawLimit = parseRawFromDisplay(limitInput);
    if (!categoryInput.trim() || rawLimit <= 0) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        category: categoryInput.trim(),
        limitAmount: rawLimit,
        warningThresholdPct: warningThreshold,
        notes: notesInput.trim(),
      });
    } else {
      addBudget({
        category: categoryInput.trim(),
        limitAmount: rawLimit,
        period: 'monthly',
        warningThresholdPct: warningThreshold,
        notes: notesInput.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteBudget(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. HEADER WITH ACTIONS */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald flex-shrink-0">
              <BarChart3 size={26} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Límites & Topes de Gasto</h2>
              <p className="text-xs text-slate-400 mt-1">
                Todas las categorías están listas en $0 para que asignes tus topes y controles tus egresos reales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {budgets.length > 0 && (
              <button
                onClick={() => setIsConfirmingClearAll(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                title="Vaciar todos los topes fijados"
              >
                <Trash2 size={15} />
                <span>Vaciar Topes a $0</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAdd()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Nuevo Tope de Gasto</span>
            </button>
          </div>
        </div>

        {/* 2. THREE REAL FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
          
          {/* Card 1: Dinero Base */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Wallet size={14} className="text-emerald-400" />
                Dinero Base / Ingresos
              </span>
              <button
                onClick={() => {
                  setTempBaseInput(formatInputLive(effectiveBaseMoney));
                  setIsEditingBase(true);
                }}
                className="text-[10px] text-emerald-400 hover:underline font-bold"
              >
                Ajustar
              </button>
            </div>

            <div className="mt-2">
              <p className="text-lg sm:text-xl font-black text-white font-mono">
                {formatMoney(effectiveBaseMoney)}
              </p>
              <span className="text-[10px] text-slate-400">
                {customBaseMoney !== null ? 'Monto manual configurado' : `${metrics.totalIncome > 0 ? 'Tus ingresos reales' : 'Sin ingresos registrados ($0)'}`}
              </span>
            </div>
          </div>

          {/* Card 2: Total Real de Egresos */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <TrendingDown size={14} className="text-rose-400" />
              Total Egresos Reales
            </span>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-black text-rose-400 font-mono">
                {formatMoney(totals.totalRealExpenses)}
              </p>
              <span className="text-[10px] text-slate-400">
                {transactions.filter(t => t.type === 'expense').length} gastos registrados en la app
              </span>
            </div>
          </div>

          {/* Card 3: Total en Topes Fijados */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <Sliders size={14} className="text-indigo-400" />
              Total en Topes Fijados
            </span>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-black text-indigo-300 font-mono">
                {formatMoney(totals.totalBudget)}
              </p>
              <span className="text-[10px] text-slate-400">
                {budgets.length} {budgets.length === 1 ? 'categoría con tope asignado' : 'categorías con tope asignado'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. CATEGORIES GRID WITH FLOATING ACTIONS */}
      <div className="space-y-4">
        
        {/* Toggle Bar */}
        <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllCategories(true)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                showAllCategories ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas las Categorías ({DEFAULT_EXPENSE_CATEGORIES.length})
            </button>
            <button
              onClick={() => setShowAllCategories(false)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                !showAllCategories ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Solo con Topes o Gastos ({budgets.length + Object.keys(spendingByCategory).filter(c => !budgets.some(b => b.category === c)).length})
            </button>
          </div>

          <span className="text-slate-400 hidden sm:inline">
            Haz clic en <strong>Fijar Tope</strong> o en el lápiz para ingresar tu monto
          </span>
        </div>

        {/* Grid of Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unifiedCategories.map(item => {
            const hasBudget = item.hasBudget;

            return (
              <div 
                key={item.category}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  item.isExceeded
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-glow-rose'
                    : item.isWarning
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-glow-amber'
                    : hasBudget
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-900/40 border-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#10B981' }}
                      />
                      <h4 className="text-sm font-bold text-white truncate max-w-[180px]">{item.category}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasBudget && item.budget ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(item.budget!)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Editar tope"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: item.budget!.id, category: item.category })}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Eliminar tope"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenAdd(item.category, item.spent > 0 ? item.spent : 50000)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Fijar tope a esta categoría"
                        >
                          <Plus size={12} />
                          <span>Fijar Tope</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex justify-between items-baseline mt-3 text-xs">
                    <span className="text-slate-400">
                      Gasto Real: <strong className={item.isExceeded ? 'text-rose-400 font-mono' : 'text-white font-mono'}>{formatMoney(item.spent)}</strong>
                    </span>
                    <span className="text-slate-400">
                      Tope: {hasBudget ? (
                        <strong className="text-emerald-400 font-mono">{formatMoney(item.limit)}</strong>
                      ) : (
                        <span className="text-slate-500 italic text-[11px] font-mono">$ 0 (Sin fijar)</span>
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {hasBudget ? (
                    <>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.isExceeded 
                              ? 'bg-rose-500' 
                              : item.isWarning 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(item.pct, 100)}%` }}
                        />
                      </div>

                      {/* Status footer */}
                      <div className="flex justify-between items-center text-[11px] mt-2">
                        <span className={`font-bold ${item.isExceeded ? 'text-rose-400' : item.isWarning ? 'text-amber-400' : 'text-slate-400'}`}>
                          {item.pct.toFixed(0)}% consumido
                        </span>
                        <span className={`font-bold ${item.isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.isExceeded ? `Excedido por ${formatMoney(Math.abs(item.remaining))}` : `Quedan ${formatMoney(item.remaining)}`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-800/30 border border-slate-700/30 flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400">Gasto actual en $0.</span>
                      <button
                        onClick={() => handleOpenAdd(item.category, 50000)}
                        className="text-[10px] text-emerald-400 hover:underline font-bold whitespace-nowrap ml-2"
                      >
                        + Asignar Tope
                      </button>
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-2">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. FLOATING MODAL: ADD / EDIT CATEGORY BUDGET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingBudget ? 'Editar Tope de Gasto' : 'Nuevo Tope de Gasto'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define el gasto mensual máximo para esta categoría.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Category Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoría <span className="text-rose-400">*</span>
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {DEFAULT_EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amount with Live Dot Formatting */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Límite Máximo Mensual ({currentCurrency.symbol}) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={limitInput}
                  onChange={(e) => setLimitInput(formatInputLive(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {/* Warning Threshold */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Avisar cuando llegue al:
                  </label>
                  <span className="text-xs font-bold text-amber-400">{warningThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Solo compras del mes, no incluye salidas..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
                >
                  {editingBudget ? 'Guardar Cambios' : 'Guardar Tope'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. FLOATING CONFIRMATION MODAL: DELETE INDIVIDUAL TOPE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Eliminar Tope?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Se eliminará el límite de gasto fijado para <strong className="text-white">"{deleteTarget.category}"</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-glow-rose"
              >
                Eliminar Tope
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FLOATING CONFIRMATION MODAL: CLEAR ALL TOPES */}
      {isConfirmingClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Vaciar todos los Topes?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Todos los límites de gasto se resetearán a <strong className="text-white">$ 0</strong> para que ingreses tus datos desde cero.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllBudgets();
                  setIsConfirmingClearAll(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-glow-rose"
              >
                Vaciar a $0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FLOATING MODAL: ADJUST BASE MONEY */}
      {isEditingBase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Ajustar Dinero Base a Distribuir</h3>
              <button onClick={() => setIsEditingBase(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto Base en Cuenta ({currentCurrency.symbol})
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={tempBaseInput}
                onChange={(e) => setTempBaseInput(formatInputLive(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                placeholder="0"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetBaseToIncome}
                className="text-[11px] text-slate-400 hover:text-rose-400"
              >
                Usar Ingresos Reales
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBase(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBaseMoney}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
