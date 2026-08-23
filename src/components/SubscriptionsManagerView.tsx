import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Tv, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  X,
  CreditCard,
  Zap,
  Repeat
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Subscription } from '../types';

export const SubscriptionsManagerView: React.FC = () => {
  const { 
    subscriptions, 
    addSubscription, 
    updateSubscription, 
    deleteSubscription, 
    toggleSubscription, 
    formatMoney, 
    formatInputLive, 
    parseRawFromDisplay, 
    currentCurrency,
    triggerCelebration 
  } = useFinancial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [renewalDay, setRenewalDay] = useState('1');
  const [category, setCategory] = useState('Streaming & Ocio');
  const [notes, setNotes] = useState('');

  // Calculations
  const monthlyTotal = useMemo(() => {
    return subscriptions
      .filter(s => s.active)
      .reduce((acc, s) => {
        return acc + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12);
      }, 0);
  }, [subscriptions]);

  const yearlyTotal = monthlyTotal * 12;

  const openCreateModal = () => {
    setEditingSub(null);
    setName('');
    setDisplayAmount('');
    setBillingCycle('monthly');
    setRenewalDay('1');
    setCategory('Streaming & Ocio');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setDisplayAmount(formatInputLive(sub.amount));
    setBillingCycle(sub.billingCycle);
    setRenewalDay(sub.renewalDay.toString());
    setCategory(sub.category);
    setNotes(sub.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseRawFromDisplay(displayAmount);
    if (rawVal <= 0 || !name.trim()) return;

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name: name.trim(),
        amount: rawVal,
        billingCycle,
        renewalDay: parseInt(renewalDay) || 1,
        category,
        notes: notes.trim() || undefined
      });
    } else {
      addSubscription({
        name: name.trim(),
        amount: rawVal,
        billingCycle,
        renewalDay: parseInt(renewalDay) || 1,
        category,
        active: true,
        notes: notes.trim() || undefined
      });
      triggerCelebration();
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow-indigo">
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Radar de Suscripciones & Cobros Recurrentes</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Auditoría Automática
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Detecta y controla tus pagos fijos (Netflix, Spotify, seguros, software) y calcula el costo anual acumulado.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 text-white font-black text-xs shadow-glow-indigo transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ Nueva Suscripción</span>
          </button>
        </div>

        {/* Annualized Cost Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              <Repeat size={14} className="text-indigo-400" />
              <span>Gasto Mensual en Suscripciones</span>
            </span>
            <p className="text-2xl font-black text-indigo-400">{formatMoney(monthlyTotal)}</p>
            <span className="text-[11px] text-slate-400">{subscriptions.filter(s => s.active).length} activas</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              <span>Costo Anual Proyectado</span>
            </span>
            <p className="text-2xl font-black text-amber-400">{formatMoney(yearlyTotal)}</p>
            <span className="text-[11px] text-slate-400">Total en 12 meses</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-1">
            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Oportunidad de Ahorro Estimada</span>
            </span>
            <p className="text-2xl font-black text-emerald-400">
              {formatMoney(yearlyTotal * 0.25)}
            </p>
            <span className="text-[11px] text-slate-300">Ahorro al año cancelando suscripciones no usadas</span>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tus Suscripciones Activas</h3>

        {subscriptions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">No tienes suscripciones registradas aún.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold cursor-pointer"
            >
              + Añadir Primera Suscripción
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {subscriptions.map((sub) => (
              <div 
                key={sub.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  sub.active 
                    ? 'bg-slate-800/70 border-slate-700/80 hover:border-indigo-500/40' 
                    : 'bg-slate-900/50 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
                      <Tv size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{sub.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{sub.category}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSubscription(sub.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      sub.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {sub.active ? 'Activa' : 'Pausada'}
                  </button>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-700/60">
                  <div>
                    <span className="text-xs text-slate-400">Renovación día {sub.renewalDay}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-indigo-300 text-base">{formatMoney(sub.amount)}</span>
                    <span className="text-[10px] text-slate-400 block">/{sub.billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(sub)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-750"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-750"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingSub ? 'Editar Suscripción' : 'Registrar Suscripción'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Netflix, Spotify, iCloud, ChatGPT Plus, Gym..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Costo ({currentCurrency.symbol})</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={displayAmount}
                    onChange={(e) => setDisplayAmount(formatInputLive(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Frecuencia</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Día de Cobro (1-31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={renewalDay}
                    onChange={(e) => setRenewalDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Streaming & Ocio">Streaming & Ocio</option>
                    <option value="Software & Productividad">Software & Trabajo</option>
                    <option value="Gimnasio & Salud">Gimnasio & Salud</option>
                    <option value="Seguros & Finanzas">Seguros & Finanzas</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 text-white font-black shadow-glow-indigo cursor-pointer"
                >
                  {editingSub ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
