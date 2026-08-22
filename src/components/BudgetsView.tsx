import React, { useState, useMemo } from 'react';
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
  Sliders
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { CATEGORY_COLORS } from '../data/initialData';

export const BudgetsView: React.FC = () => {
  const { 
    budgets, 
    addBudget, 
    updateBudget, 
    deleteBudget, 
    transactions, 
    formatMoney, 
    metrics,
    openTransactionModal 
  } = useFinancial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [limitInput, setLimitInput] = useState('');

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
    const totalBudget = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + (spendingByCategory[b.category] || 0), 0);
    const remaining = totalBudget - totalSpent;
    const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remaining,
      overallPct
    };
  }, [budgets, spendingByCategory]);

  const handleOpenAdd = () => {
    setEditingBudgetId(null);
    setCategoryInput('');
    setLimitInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: { id: string; category: string; limitAmount: number }) => {
    setEditingBudgetId(b.id);
    setCategoryInput(b.category);
    setLimitInput((b.limitAmount ?? 0).toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0 || !categoryInput.trim()) return;

    if (editingBudgetId) {
      updateBudget(editingBudgetId, limit);
    } else {
      addBudget({
        category: categoryInput.trim(),
        limitAmount: limit,
        period: 'monthly'
      });
    }

    setIsModalOpen(false);
  };

  // Quick preset 50/30/20 distribution
  const handleApply503020Preset = () => {
    if (metrics.totalIncome <= 0) {
      alert('Registra primero tus ingresos para calcular presupuestos basados en tu sueldo real.');
      return;
    }
    const income = metrics.totalIncome;
    const presets = [
      { category: 'Alimentación & Supermercado', limitAmount: Math.round(income * 0.25) },
      { category: 'Servicios Básicos & Hogar', limitAmount: Math.round(income * 0.15) },
      { category: 'Transporte & Movilidad', limitAmount: Math.round(income * 0.10) },
      { category: 'Restaurantes & Ocio', limitAmount: Math.round(income * 0.18) },
      { category: 'Compras & Personales', limitAmount: Math.round(income * 0.12) },
    ];

    presets.forEach(p => {
      addBudget({
        category: p.category,
        limitAmount: p.limitAmount,
        period: 'monthly'
      });
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow-indigo">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Control de Presupuestos Mensuales</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Límites Preventivos
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fija topes máximos de gasto por categoría para evitar sobregiros y mantener disciplina financiera.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApply503020Preset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-indigo-500 transition-all flex items-center gap-1.5"
              title="Calcular presupuestos automáticos con la Regla 50/30/20"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span>Sugerir Presupuestos IA</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={16} strokeWidth={3} />
              <span>+ Nuevo Presupuesto</span>
            </button>
          </div>
        </div>

        {/* Big KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Presupuesto Asignado</span>
            <p className="text-2xl font-black text-white mt-1">{formatMoney(totals.totalBudget)}</p>
            <span className="text-[11px] text-slate-400">{budgets.length} categorías controladas</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Gasto Real Ejecutado</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{formatMoney(totals.totalSpent)}</p>
            <span className="text-[11px] text-rose-300/80">{totals.overallPct.toFixed(1)}% del límite total</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-400">Margen Disponible</span>
            <p className={`text-2xl font-black mt-1 ${totals.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totals.remaining >= 0 ? '+' : ''}{formatMoney(totals.remaining)}
            </p>
            <span className="text-[11px] text-slate-400">{totals.remaining >= 0 ? 'Disponible para gastar' : 'Exceso de presupuesto'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30">
            <span className="text-xs text-indigo-300 font-bold">Estado del Presupuesto</span>
            <p className="text-2xl font-black text-white mt-1">{totals.overallPct.toFixed(0)}%</p>
            <div className="w-full h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  totals.overallPct >= 100 ? 'bg-rose-500' : totals.overallPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, totals.overallPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budgets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
            <BarChart3 className="mx-auto text-slate-500" size={36} />
            <h3 className="text-lg font-bold text-white">No has configurado presupuestos por categoría</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Establece topes mensuales para tus gastos frecuentes o presiona "Sugerir Presupuestos IA" para generarlos automáticamente.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all"
            >
              Crear Primer Presupuesto
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const spent = spendingByCategory[b.category] || 0;
            const pct = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;
            const remaining = b.limitAmount - spent;
            const isExceeded = remaining < 0;
            const isWarning = pct >= 80 && !isExceeded;

            const categoryColor = CATEGORY_COLORS[b.category] || '#6366F1';

            return (
              <div 
                key={b.id}
                className={`p-5 rounded-3xl bg-slate-900/90 border transition-all duration-300 shadow-card-soft relative flex flex-col justify-between ${
                  isExceeded 
                    ? 'border-rose-500/60 shadow-glow-rose' 
                    : isWarning 
                    ? 'border-amber-500/50' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Category and Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: categoryColor }}
                      />
                      <h4 className="font-extrabold text-white text-sm truncate max-w-[170px]">
                        {b.category}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Modificar límite"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el presupuesto para "${b.category}"?`)) {
                            deleteBudget(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar presupuesto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="space-y-1 my-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Gastado:</span>
                      <span className="font-black text-lg text-white font-mono">{formatMoney(spent)}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500">Límite mensual:</span>
                      <span className="text-slate-300 font-semibold font-mono">{formatMoney(b.limitAmount)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={isExceeded ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                        {pct.toFixed(0)}% consumido
                      </span>
                      <span className={isExceeded ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {isExceeded ? `Exceso: ${formatMoney(Math.abs(remaining))}` : `Quedan: ${formatMoney(remaining)}`}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Periodo: Mensual</span>
                  <button
                    onClick={() => openTransactionModal('expense', { category: b.category } as any)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>+ Gasto</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-lg font-black text-white">
              {editingBudgetId ? 'Editar Límite de Presupuesto' : 'Nuevo Presupuesto por Categoría'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Alimentación, Ocio, Servicios..."
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Tope Máximo Mensual</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej: 250000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
                >
                  {editingBudgetId ? 'Guardar Cambios' : 'Fijar Presupuesto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
