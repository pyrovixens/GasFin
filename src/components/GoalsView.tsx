import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Rocket, 
  Cpu, 
  Award,
  Palmtree,
  Car,
  Home
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Goal } from '../types';

const GOAL_TEMPLATES = [
  {
    title: 'Fondo de Emergencia (3 a 6 Meses)',
    category: 'emergency_fund' as const,
    targetAmount: 3000000,
    color: '#10B981',
    iconName: 'ShieldCheck',
    notes: 'Reserva para imprevistos médicos, laborales o del hogar.'
  },
  {
    title: 'Vacaciones & Recreación Familiar',
    category: 'personal' as const,
    targetAmount: 1500000,
    color: '#6366F1',
    iconName: 'Palmtree',
    notes: 'Presupuesto para viaje y descanso sin endeudamiento.'
  },
  {
    title: 'Renovación de Vehículo / Transporte',
    category: 'equipment' as const,
    targetAmount: 5000000,
    color: '#06B6D4',
    iconName: 'Car',
    notes: 'Pie o pago total para cambio de vehículo.'
  },
  {
    title: 'Fondo de Inversión / Pie Inmobiliario',
    category: 'investment' as const,
    targetAmount: 10000000,
    color: '#F59E0B',
    iconName: 'Home',
    notes: 'Capital para activos que generen rentas periódicas.'
  }
];

export const GoalsView: React.FC = () => {
  const { 
    goals, 
    addGoal,
    formatMoney, 
    openGoalModal, 
    deleteGoal, 
    contributeToGoal,
    metrics,
    currentCurrency 
  } = useFinancial();

  // Quick contribute modal state
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>('');

  // Overall totals
  const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + g.targetAmount, 0), [goals]);
  const totalSaved = useMemo(() => goals.reduce((acc, g) => acc + g.currentAmount, 0), [goals]);
  const overallProgress = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amt = parseFloat(contributionAmount);
    if (isNaN(amt) || amt <= 0) return;

    contributeToGoal(selectedGoal.id, amt);
    setSelectedGoal(null);
    setContributionAmount('');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return Rocket;
      case 'Cpu': return Cpu;
      case 'ShieldCheck': return ShieldCheck;
      case 'Palmtree': return Palmtree;
      case 'Car': return Car;
      case 'Home': return Home;
      default: return Target;
    }
  };

  const handleAddTemplate = (tpl: typeof GOAL_TEMPLATES[0]) => {
    // Adapt target amount according to currency
    const multiplier = currentCurrency.code === 'USD' || currentCurrency.code === 'EUR' ? 0.001 : 1;
    const target = Math.round(tpl.targetAmount * multiplier);

    const now = new Date();
    now.setMonth(now.getMonth() + 12);
    const targetDate = now.toISOString().split('T')[0];

    addGoal({
      title: tpl.title,
      category: tpl.category,
      targetAmount: target,
      currentAmount: 0,
      targetDate,
      color: tpl.color,
      iconName: tpl.iconName,
      notes: tpl.notes,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner: Goals Executive Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-glow-emerald">
              <Target size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Metas y Fondos Financieros</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Progreso Global: {overallProgress.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Planifica fondos de emergencia, recreación, compras importantes e inversiones con seguimiento de avance en tiempo real.
              </p>
            </div>
          </div>

          <button
            onClick={() => openGoalModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Crear Meta Personalizada</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Capital Acumulado en Metas</span>
            <span className="font-black text-emerald-400">{formatMoney(totalSaved)} de {formatMoney(totalTarget)}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-700 shadow-glow-emerald"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{goals.length} metas activas en seguimiento</span>
            <span>Tasa de Ahorro: {metrics.savingsRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* QUICK TEMPLATES IF FEW GOALS */}
      {goals.length === 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 shadow-card-soft">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Plantillas Rápidas para Comenzar en 1 Clic
            </h3>
          </div>
          <p className="text-xs text-slate-300 mb-4">Elige una meta predeterminada para activarla inmediatamente:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GOAL_TEMPLATES.map(tpl => (
              <button
                key={tpl.title}
                onClick={() => handleAddTemplate(tpl)}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400">{tpl.title}</span>
                  <Plus size={15} className="text-slate-400 group-hover:text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.notes}</p>
                <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  + Activar Meta
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE GOALS GRID */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const Icon = getIcon(goal.iconName);
            const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const isCompleted = percent >= 100;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            // Calculate required monthly pace
            const targetDateObj = new Date(goal.targetDate);
            const now = new Date();
            const monthsLeft = Math.max(1, Math.ceil((targetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
            const suggestedMonthly = remaining / monthsLeft;

            return (
              <div 
                key={goal.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden group ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/30 border-emerald-500/50 shadow-glow-emerald' 
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: goal.color || '#10B981' }}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="p-3 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: `${goal.color || '#10B981'}25`, color: goal.color || '#10B981' }}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                          <Award size={13} />
                          <span>¡Completada!</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {monthsLeft} meses restantes
                        </span>
                      )}

                      <button
                        onClick={() => openGoalModal(goal)}
                        className="p-1.5 text-slate-400 hover:text-white"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la meta "${goal.title}"?`)) deleteGoal(goal.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{goal.title}</h3>
                  {goal.notes && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{goal.notes}</p>
                  )}

                  {/* Progress Visual */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400 font-medium">Progreso</span>
                      <span className="text-lg font-black" style={{ color: goal.color || '#10B981' }}>
                        {percent.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: goal.color || '#10B981'
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-extrabold text-white">{formatMoney(goal.currentAmount)}</span>
                      <span className="text-slate-400">Meta: {formatMoney(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Pace */}
                  {!isCompleted && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span>Aporte sugerido:</span>
                        <strong className="text-emerald-400 font-mono">{formatMoney(suggestedMonthly)}/mes</strong>
                      </div>
                      <div className="flex justify-between mt-1 text-slate-400">
                        <span>Fecha objetivo:</span>
                        <span>{goal.targetDate}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Action */}
                <div className="mt-5 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setContributionAmount(suggestedMonthly > 0 ? Math.round(suggestedMonthly).toString() : '50000');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-1.5"
                  >
                    <DollarSign size={14} className="text-emerald-400" />
                    <span>Aportar Fondos a la Meta</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* QUICK CONTRIBUTION MODAL */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Aportar Fondos a la Meta</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedGoal.title}</p>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto del Aporte ({currentCurrency.symbol})</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Se actualizará el saldo de la meta y se registrará contablemente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-glow-emerald"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
