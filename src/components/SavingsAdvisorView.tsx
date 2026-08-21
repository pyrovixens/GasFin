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
  DollarSign, 
  ArrowRight,
  PieChart as PieChartIcon,
  AlertTriangle,
  Flame,
  Check,
  Calculator
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
    currentCurrency
  } = useFinancial();

  // Category filter for savings tips
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Manual Income slider for 50/30/20 simulation if transactions are empty or for planning
  const [simulatedIncome, setSimulatedIncome] = useState<number>(() => {
    return metrics.totalIncome > 0 ? metrics.totalIncome : 1200000;
  });

  // New Custom Tip Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Suscripciones & Streaming');
  const [newDescription, setNewDescription] = useState('');
  const [newMonthly, setNewMonthly] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'high'>('easy');

  // Total potential savings
  const totalMonthlyPotential = useMemo(() => {
    return savingsTips.reduce((acc, t) => acc + t.estimatedMonthlySavings, 0);
  }, [savingsTips]);

  const totalAnnualPotential = totalMonthlyPotential * 12;

  const appliedMonthlySavings = useMemo(() => {
    return savingsTips
      .filter(t => t.isApplied)
      .reduce((acc, t) => acc + t.estimatedMonthlySavings, 0);
  }, [savingsTips]);

  // 50/30/20 Rule Analysis based on actual or simulated income
  const baseIncome = metrics.totalIncome > 0 ? metrics.totalIncome : simulatedIncome;

  const budget503020 = useMemo(() => {
    const needs50 = baseIncome * 0.50;  // Arriendo, Luz, Agua, Supermercado
    const wants30 = baseIncome * 0.30;  // Recreación, Salidas, Streaming
    const savings20 = baseIncome * 0.20; // Ahorro, Metas, Deuda

    return {
      needs50,
      wants30,
      savings20,
    };
  }, [baseIncome]);

  // Filtered tips
  const filteredTips = useMemo(() => {
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
      
      {/* Top Banner: AI Savings Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <Lightbulb size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Asesor Inteligente de Ahorro y Costos</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Optimizador IA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculadora de la regla 50/30/20, auditoría de fugas de dinero y catálogo de ideas prácticas de ahorro.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nueva Idea de Ahorro</span>
          </button>
        </div>

        {/* Big Savings Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/30">
            <span className="text-xs text-slate-300">Potencial de Ahorro Mensual</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">+{formatMoney(totalMonthlyPotential)}/mes</p>
            <span className="text-[11px] text-emerald-300/80">Identificado en auditorías</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30">
            <span className="text-xs text-slate-300">Impacto Anual Proyectado</span>
            <p className="text-2xl font-black text-indigo-300 mt-1">+{formatMoney(totalAnnualPotential)}/año</p>
            <span className="text-[11px] text-indigo-300/80">Dinero extra que retendrás</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
            <span className="text-xs text-slate-300">Ahorro ya Implementado</span>
            <p className="text-2xl font-black text-white mt-1">+{formatMoney(appliedMonthlySavings)}/mes</p>
            <span className="text-[11px] text-teal-400 font-semibold">
              {savingsTips.filter(t => t.isApplied).length} de {savingsTips.length} ideas activadas
            </span>
          </div>
        </div>
      </div>

      {/* 50/30/20 INTERACTIVE BUDGET PLANNER */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChartIcon size={18} className="text-emerald-400" />
              <span>Planificador y Auditoría: Regla 50 / 30 / 20</span>
            </h3>
            <p className="text-xs text-slate-400">
              Distribución financiera ideal para mantener estabilidad, disfrute y capacidad de ahorro.
            </p>
          </div>

          {/* Income Slider Controller */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-xs text-slate-400">Ingreso Mensual Base:</span>
            <span className="font-extrabold text-sm text-emerald-400 font-mono">{formatMoney(baseIncome)}</span>
          </div>
        </div>

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
              <span className="text-lg font-black text-rose-400">{formatMoney(budget503020.needs50)}</span>
            </div>
            <p className="text-xs text-slate-400">
              Arriendo / dividendo, luz, agua, gas, supermercado básico, transporte y salud.
            </p>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-rose-500 w-1/2" />
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
              <span className="text-lg font-black text-amber-400">{formatMoney(budget503020.wants30)}</span>
            </div>
            <p className="text-xs text-slate-400">
              Recreación, salidas a comer, compras personales, streaming, hobbies y vacaciones.
            </p>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500 w-[30%]" />
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
              <span className="text-lg font-black text-emerald-400">{formatMoney(budget503020.savings20)}</span>
            </div>
            <p className="text-xs text-slate-400">
              Fondo de emergencia, aportes a metas, inversiones y abonos extraordinarios a deuda.
            </p>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 w-[20%]" />
            </div>
          </div>

        </div>
      </div>

      {/* CATALOG OF PRACTICAL SAVINGS IDEAS */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Catálogo de Oportunidades y Sugerencias de Recorte</h3>
            <p className="text-xs text-slate-400">Activa cada ahorro para monitorear tu capacidad de ahorro mensual</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${selectedFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Todas ({savingsTips.length})
            </button>
            <button
              onClick={() => setSelectedFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-colors ${selectedFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pendientes ({savingsTips.filter(t => !t.isApplied).length})
            </button>
            <button
              onClick={() => setSelectedFilter('applied')}
              className={`px-3 py-1 rounded-lg transition-colors ${selectedFilter === 'applied' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Aplicadas ({savingsTips.filter(t => t.isApplied).length})
            </button>
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTips.map((tip) => (
            <div 
              key={tip.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                tip.isApplied 
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-emerald' 
                  : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {tip.category}
                  </span>
                  
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    tip.difficulty === 'easy' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : tip.difficulty === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    Dificultad: {tip.difficulty === 'easy' ? 'Fácil' : tip.difficulty === 'medium' ? 'Media' : 'Alta'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-2 leading-snug">{tip.title}</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{tip.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-700/60">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ahorro Mensual</span>
                    <span className="text-base font-black text-emerald-400">+{formatMoney(tip.estimatedMonthlySavings)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Ahorro Anual</span>
                    <span className="text-xs font-bold text-slate-300">+{formatMoney(tip.estimatedAnnualSavings)}/año</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleSavingsTip(tip.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    tip.isApplied
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-glow-emerald'
                  }`}
                >
                  {tip.isApplied ? (
                    <>
                      <Check size={14} strokeWidth={3} />
                      <span>✓ Ahorro Implementado</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Aplicar este Ahorro</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* CREATE CUSTOM SAVINGS TIP MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Crear Nueva Idea de Ahorro</h3>
            <p className="text-xs text-slate-400 mb-4">Registra una optimización de costos para monitorear su impacto</p>

            <form onSubmit={handleAddTipSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Idea</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Cambio a plan familiar de internet con 25% de ahorro"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Suscripciones & Streaming">Suscripciones & Streaming</option>
                    <option value="Luz & Electricidad">Luz & Electricidad</option>
                    <option value="Internet & Teléfono">Internet & Teléfono</option>
                    <option value="Supermercado & Alimentos">Supermercado & Alimentos</option>
                    <option value="Recreación & Salidas">Recreación & Salidas</option>
                    <option value="Arriendo & Hogar">Arriendo & Hogar</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dificultad</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="easy">Fácil (Inmediato)</option>
                    <option value="medium">Media (1-2 semanas)</option>
                    <option value="high">Alta (Requiere negociación)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ahorro Mensual Estimado ({currentCurrency.symbol})</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={newMonthly}
                  onChange={(e) => setNewMonthly(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción y Pasos a Seguir</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explica en dónde recortar y cómo implementarlo..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-glow-emerald"
                >
                  Guardar Sugerencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
