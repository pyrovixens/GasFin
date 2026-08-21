import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Debt, DebtCategory } from '../types';

export const DebtModal: React.FC = () => {
  const { 
    isDebtModalOpen, 
    closeDebtModal, 
    editingDebt, 
    addDebt, 
    updateDebt, 
    currentCurrency 
  } = useFinancial();

  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [displayTotal, setDisplayTotal] = useState('');
  const [rawTotal, setRawTotal] = useState<number>(0);
  const [interestRate, setInterestRate] = useState('14.5');
  const [displayMinPay, setDisplayMinPay] = useState('');
  const [rawMinPay, setRawMinPay] = useState<number>(0);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<DebtCategory>('bank_loan');
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
    if (editingDebt) {
      setName(editingDebt.name);
      setCreditor(editingDebt.creditor);
      setRawTotal(editingDebt.remainingAmount);
      setDisplayTotal(formatInputLive(editingDebt.remainingAmount.toString(), currentCurrency.code));
      setInterestRate(editingDebt.interestRate.toString());
      setRawMinPay(editingDebt.minimumPayment);
      setDisplayMinPay(formatInputLive(editingDebt.minimumPayment.toString(), currentCurrency.code));
      setDueDate(editingDebt.dueDate);
      setCategory(editingDebt.category);
      setNotes(editingDebt.notes || '');
    } else {
      setName('');
      setCreditor('');
      setRawTotal(0);
      setDisplayTotal('');
      setInterestRate('14.5');
      setRawMinPay(0);
      setDisplayMinPay('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setCategory('bank_loan');
      setNotes('');
    }
  }, [editingDebt, isDebtModalOpen, currentCurrency.code]);

  if (!isDebtModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawTotal <= 0 || !name.trim()) return;

    if (editingDebt) {
      updateDebt(editingDebt.id, {
        name,
        creditor,
        totalAmount: rawTotal,
        remainingAmount: rawTotal,
        interestRate: parseFloat(interestRate) || 0,
        minimumPayment: rawMinPay,
        dueDate,
        category,
        notes,
      });
    } else {
      addDebt({
        name,
        creditor: creditor || 'Institución Financiera',
        totalAmount: rawTotal,
        remainingAmount: rawTotal,
        interestRate: parseFloat(interestRate) || 0,
        minimumPayment: rawMinPay,
        dueDate,
        category,
        notes,
      });
    }
    closeDebtModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingDebt ? 'Editar Deuda' : 'Registrar Deuda / Crédito'}
              </h3>
              <p className="text-xs text-slate-400">Datos para el cálculo óptimo de amortización</p>
            </div>
          </div>
          <button onClick={closeDebtModal} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nombre / Identificador</label>
            <input
              type="text"
              required
              placeholder="Ej: Tarjeta Santander / Crédito Consumo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Saldo ({currentCurrency.symbol})
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={displayTotal}
                onChange={(e) => {
                  const fmt = formatInputLive(e.target.value, currentCurrency.code);
                  setDisplayTotal(fmt);
                  setRawTotal(parseRaw(fmt, currentCurrency.code));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tasa Anual (APR %)</label>
              <input
                type="number"
                step="0.1"
                required
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Cuota Mínima ({currentCurrency.symbol})</label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={displayMinPay}
                onChange={(e) => {
                  const fmt = formatInputLive(e.target.value, currentCurrency.code);
                  setDisplayMinPay(fmt);
                  setRawMinPay(parseRaw(fmt, currentCurrency.code));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Fecha de Pago</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeDebtModal}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-amber transition-all"
            >
              {editingDebt ? 'Actualizar Deuda' : 'Guardar Deuda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
