import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Minus, 
  Maximize2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Move, 
  Clock, 
  Calendar 
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { TransactionType, PaymentMethod } from '../types';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../data/initialData';

export const TransactionModal: React.FC = () => {
  const { 
    isTransactionModalOpen, 
    closeTransactionModal, 
    isTransactionMinimized,
    toggleTransactionMinimized,
    editingTransaction, 
    addTransaction, 
    updateTransaction,
    currentCurrency 
  } = useFinancial();

  const getCurrentDateStr = () => new Date().toISOString().split('T')[0];
  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const [type, setType] = useState<TransactionType>('income');
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [rawAmount, setRawAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('Sueldo / Salario');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getCurrentDateStr());
  const [time, setTime] = useState<string>(getCurrentTimeStr());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Custom Categories
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Draggable state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  // Helper to format live string as user types
  const formatInputLive = (valStr: string, currCode: string) => {
    if (currCode === 'CLP' || currCode === 'COP' || currCode === 'EUR' || currCode === 'ARS') {
      const clean = valStr.replace(/[^\d,]/g, '');
      const parts = clean.split(',');
      const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      if (parts.length > 1) {
        return `${intPart},${parts[1].slice(0, 2)}`;
      }
      return intPart;
    }

    const clean = valStr.replace(/[^\d.]/g, '');
    const parts = clean.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      return `${intPart}.${parts[1].slice(0, 2)}`;
    }
    return intPart;
  };

  const parseRawFromDisplay = (valStr: string, currCode: string): number => {
    if (!valStr) return 0;
    if (currCode === 'CLP' || currCode === 'COP' || currCode === 'EUR' || currCode === 'ARS') {
      const normalized = valStr.replace(/\./g, '').replace(',', '.');
      return parseFloat(normalized) || 0;
    }
    const normalized = valStr.replace(/,/g, '');
    return parseFloat(normalized) || 0;
  };

  // Sync editing transaction or reset with fresh current date & time
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setRawAmount(editingTransaction.amount);
      const formatted = formatInputLive(editingTransaction.amount.toString(), currentCurrency.code);
      setDisplayAmount(formatted);
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || getCurrentTimeStr());
      setPaymentMethod(editingTransaction.paymentMethod);
      setIsRecurring(editingTransaction.isRecurring);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('income');
      setRawAmount(0);
      setDisplayAmount('');
      setCategory('Sueldo / Salario');
      setDescription('');
      setDate(getCurrentDateStr());
      setTime(getCurrentTimeStr());
      setPaymentMethod('transfer');
      setIsRecurring(false);
      setNotes('');
    }
  }, [editingTransaction, isTransactionModalOpen, currentCurrency.code]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatInputLive(rawVal, currentCurrency.code);
    setDisplayAmount(formatted);
    const parsed = parseRawFromDisplay(formatted, currentCurrency.code);
    setRawAmount(parsed);
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    setIsDragging(true);
    const windowElement = document.getElementById('floating-tx-window');
    const rect = windowElement?.getBoundingClientRect();
    
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect ? rect.left : window.innerWidth - 440,
      initialY: rect ? rect.top : window.innerHeight - 560,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 420, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 300, dragStartRef.current.initialY + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isTransactionModalOpen) return null;

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const targetCats = newType === 'income' ? incomeCategories : expenseCategories;
    setCategory(targetCats[0]);
    setIsCreatingNewCategory(false);
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    if (type === 'income') {
      if (!incomeCategories.includes(trimmed)) setIncomeCategories(prev => [...prev, trimmed]);
    } else {
      if (!expenseCategories.includes(trimmed)) setExpenseCategories(prev => [...prev, trimmed]);
    }
    setCategory(trimmed);
    setNewCategoryName('');
    setIsCreatingNewCategory(false);
  };

  const handleSubmit = (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (rawAmount <= 0 || !description.trim()) return;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: rawAmount,
        category,
        description,
        date,
        time,
        paymentMethod,
        isRecurring,
        notes,
      });
      closeTransactionModal();
    } else {
      addTransaction({
        type,
        amount: rawAmount,
        category,
        description,
        date,
        time: time || getCurrentTimeStr(),
        createdAt: new Date().toISOString(),
        paymentMethod,
        status: 'completed',
        isRecurring,
        tags: [category],
        notes,
      });

      if (addAnother) {
        setDisplayAmount('');
        setRawAmount(0);
        setDescription('');
        setNotes('');
        setTime(getCurrentTimeStr());
      } else {
        closeTransactionModal();
      }
    }
  };

  if (isTransactionMinimized) {
    return (
      <div 
        className="fixed z-40 animate-slide-up"
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : { bottom: '24px', right: '24px' }}
      >
        <button
          onClick={toggleTransactionMinimized}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-500 text-white shadow-glow-emerald hover:bg-slate-800 transition-all font-bold text-xs"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{type === 'income' ? 'Ingreso' : 'Gasto'}</span>
          <Maximize2 size={15} className="text-emerald-400 ml-1" />
        </button>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const windowStyle: React.CSSProperties = isMobile
    ? { bottom: '0px', left: '0px', right: '0px', width: '100%', position: 'fixed', maxHeight: '90vh' }
    : (position 
        ? { left: `${position.x}px`, top: `${position.y}px`, position: 'fixed' }
        : { bottom: '24px', right: '24px', position: 'fixed' });

  return (
    <div 
      id="floating-tx-window"
      style={windowStyle}
      className={`z-40 ${isMobile ? 'rounded-t-3xl border-t-2' : 'w-[94vw] sm:w-[430px] rounded-3xl border-2'} max-h-[90vh] bg-slate-900/98 border-emerald-500/50 shadow-2xl backdrop-blur-2xl animate-slide-up flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10`}
    >
      {/* Draggable Header */}
      <div 
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80 cursor-move select-none"
        title="Arrastra para mover la ventana a tu gusto"
      >
        <div className="flex items-center gap-2">
          <Move size={14} className="text-slate-400" />
          <span className="font-black text-xs text-white uppercase tracking-wider">
            {editingTransaction ? 'Editar Registro' : (type === 'income' ? 'Ingreso' : 'Gasto')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTransactionMinimized}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Minimizar ventana"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={closeTransactionModal}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Cerrar"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
        
        {/* Type selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              type === 'income'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-glow-emerald font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight size={14} />
            <span>Ingreso</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              type === 'expense'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-glow-rose font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight size={14} />
            <span>Gasto</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Monto ({currentCurrency.code} {currentCurrency.symbol})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              {currentCurrency.symbol}
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              autoFocus
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-black text-lg focus:outline-none focus:border-emerald-500 font-mono tracking-wide"
            />
          </div>
        </div>

        {/* Concept / Description */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Concepto / Descripción</label>
          <input
            type="text"
            required
            placeholder={type === 'income' ? "Ej: Sueldo mensual / Bono proyecto" : "Ej: Pago de luz / Arriendo mes"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category & New Category */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-300">Categoría Predeterminada</label>
            <button
              type="button"
              onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <Plus size={12} />
              <span>{isCreatingNewCategory ? 'Elegir existente' : '+ Nueva Categoría'}</span>
            </button>
          </div>

          {isCreatingNewCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre de la nueva categoría..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-emerald-500 text-white text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Agregar
              </button>
            </div>
          ) : (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* Quick Category Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {currentCategories.slice(0, 5).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                  category === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Método de Pago</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="transfer">Transferencia Bancaria</option>
            <option value="card">Tarjeta Débito / Crédito</option>
            <option value="cash">Efectivo</option>
            <option value="check">Cheque</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
          >
            {editingTransaction ? 'Guardar Cambios' : (type === 'income' ? 'Guardar Ingreso' : 'Guardar Gasto')}
          </button>
        </div>

      </form>
    </div>
  );
};
