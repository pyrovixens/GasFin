import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Goal, GoalCategory } from '../types';

export const GoalModal: React.FC = () => {
  const { 
    isGoalModalOpen, 
    closeGoalModal, 
    editingGoal, 
    addGoal, 
    updateGoal, 
    currentCurrency 
  } = useFinancial();

  const [title, setTitle] = useState('');
  const [displayTarget, setDisplayTarget] = useState('');
  const [rawTarget, setRawTarget] = useState<number>(0);
  const [displayCurrent, setDisplayCurrent] = useState('');
  const [rawCurrent, setRawCurrent] = useState<number>(0);
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState<GoalCategory>('emergency_fund');
  const [color, setColor] = useState('#10B981');
  const [notes, setNotes] = useState('');

  const formatInputLive = (valStr: string, currCode: string) => {
    if (currCode === 'CLP' || currCode === 'COP' || currCode === 'EUR' || currCode === 'ARS') {
      const clean = valStr.replace(/[^\d,]/g, '');
      const parts = clean.split(',');
      const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      if (parts.length > 1) return `${intPart},${parts[1].slice(0, 2)}`;
      return intPart;
    }
    const clean = valStr.replace(/[^\d.]/g, '');
    const parts = clean.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) return `${intPart}.${parts[1].slice(0, 2)}`;
    return intPart;
  };

  const parseRaw = (valStr: string, currCode: string): number => {
    if (!valStr) return 0;
    if (currCode === 'CLP' || currCode === 'COP' || currCode === 'EUR' || currCode === 'ARS') {
      const norm = valStr.replace(/\./g, '').replace(',', '.');
      return parseFloat(norm) || 0;
    }
    const norm = valStr.replace(/,/g, '');
    return parseFloat(norm) || 0;
  };

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setRawTarget(editingGoal.targetAmount);
      setDisplayTarget(formatInputLive(editingGoal.targetAmount.toString(), currentCurrency.code));
      setRawCurrent(editingGoal.currentAmount);
      setDisplayCurrent(formatInputLive(editingGoal.currentAmount.toString(), currentCurrency.code));
      setTargetDate(editingGoal.targetDate);
      setCategory(editingGoal.category);
      setColor(editingGoal.color);
      setNotes(editingGoal.notes || '');
    } else {
      setTitle('');
      setRawTarget(0);
      setDisplayTarget('');
      setRawCurrent(0);
      setDisplayCurrent('');
      setTargetDate('2026-12-31');
      setCategory('emergency_fund');
      setColor('#10B981');
      setNotes('');
    }
  }, [editingGoal, isGoalModalOpen, currentCurrency.code]);

  if (!isGoalModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawTarget <= 0 || !title.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title,
        targetAmount: rawTarget,
        currentAmount: rawCurrent,
        targetDate,
        category,
        color,
        notes,
      });
    } else {
      addGoal({
        title,
        targetAmount: rawTarget,
        currentAmount: rawCurrent,
        targetDate,
        category,
        color,
        iconName: 'Target',
        notes,
      });
    }
    closeGoalModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingGoal ? 'Editar Meta' : 'Crear Meta Financiera'}
              </h3>
              <p className="text-xs text-slate-400">Planifica tus fondos de reserva e inversiones</p>
            </div>
          </div>
          <button onClick={closeGoalModal} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Título de la Meta</label>
            <input
              type="text"
              required
              placeholder="Ej: Fondo de Emergencia 6 Meses / Vacaciones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Meta ({currentCurrency.symbol})
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={displayTarget}
                onChange={(e) => {
                  const fmt = formatInputLive(e.target.value, currentCurrency.code);
                  setDisplayTarget(fmt);
                  setRawTarget(parseRaw(fmt, currentCurrency.code));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Ahorro Inicial ({currentCurrency.symbol})
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={displayCurrent}
                onChange={(e) => {
                  const fmt = formatInputLive(e.target.value, currentCurrency.code);
                  setDisplayCurrent(fmt);
                  setRawCurrent(parseRaw(fmt, currentCurrency.code));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Fecha Límite</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Color Identificador</label>
              <div className="flex items-center gap-1.5 pt-1">
                {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeGoalModal}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
            >
              {editingGoal ? 'Actualizar Meta' : 'Guardar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
