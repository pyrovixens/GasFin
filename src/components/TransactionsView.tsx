import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag,
  CreditCard,
  Printer,
  FileSpreadsheet,
  Clock,
  Plus,
  Inbox,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Transaction, TransactionType } from '../types';

export const TransactionsView: React.FC = () => {
  const { 
    transactions, 
    formatMoney, 
    deleteTransaction, 
    openTransactionModal,
    exportDataToExcel 
  } = useFinancial();

  // Helper for bank-style date and time formatting
  const formatBankDateTime = (dateStr: string, timeStr?: string) => {
    try {
      if (!dateStr) return { dateFormatted: 'Fecha pendiente', timeFormatted: '12:00 hrs' };
      const [year, month, day] = dateStr.split('-').map(Number);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dateFormatted = `${day || 1} ${months[(month || 1) - 1]} ${year || 2026}`;
      const timeFormatted = timeStr ? `${timeStr} hrs` : '12:00 hrs';
      return { dateFormatted, timeFormatted };
    } catch {
      return { dateFormatted: dateStr, timeFormatted: timeStr || '12:00 hrs' };
    }
  };

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Extract unique categories safely
  const categories = useMemo(() => {
    const set = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const desc = t.description || '';
      const cat = t.category || '';
      const vendor = t.vendorOrClient || '';
      const tags = t.tags || [];

      const matchesSearch = 
        desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;

      return matchesSearch && matchesType && matchesCategory && matchesMethod;
    }).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(`${a.date}T${a.time || '12:00:00'}`).getTime();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(`${b.date}T${b.time || '12:00:00'}`).getTime();
      return timeB - timeA;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, methodFilter]);

  // Totals for filtered view
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setMethodFilter('all');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xl font-bold border border-emerald-500/20 shadow-glow-emerald">
                🏛️
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Cartola & Libro de Movimientos</h1>
                <p className="text-xs text-slate-400 mt-0.5">Auditoría contable y registro en tiempo real de ingresos y gastos.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportDataToExcel}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Descargar Libro Completo en Excel"
            >
              <FileSpreadsheet size={16} />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              title="Imprimir cartola"
            >
              <Printer size={16} className="text-slate-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={() => openTransactionModal('income')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black shadow-glow-emerald transition-all flex items-center gap-1.5"
            >
              <span>+ Nuevo Movimiento</span>
            </button>
          </div>
        </div>

        {/* Search & Multi Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar movimiento, concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los Tipos</option>
              <option value="income">Solo Ingresos (+)</option>
              <option value="expense">Solo Gastos (-)</option>
            </select>
          </div>

          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los Canales de Pago</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta Débito / Crédito</option>
              <option value="cash">Efectivo</option>
              <option value="check">Cheque</option>
            </select>
          </div>
        </div>

        {/* Quick KPI Bar for Filtered Results */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Ingresos Filtrados</span>
            <p className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
              +{formatMoney(totals.income)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Gastos Filtrados</span>
            <p className="text-sm sm:text-base font-black text-rose-400 mt-0.5">
              -{formatMoney(totals.expense)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Balance Contable</span>
            <p className={`text-sm sm:text-base font-black mt-0.5 ${totals.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(totals.balance)}
            </p>
          </div>
        </div>

      </div>

      {/* Transactions Data Table or Bank-Style Empty State */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft overflow-hidden">
        {filteredTransactions.length === 0 ? (
          /* Bank-Style Empty State */
          <div className="p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-glow-emerald">
              <Inbox size={32} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-white">
                {transactions.length === 0 ? 'Sin movimientos registrados en tu cuenta' : 'No hay resultados con los filtros seleccionados'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {transactions.length === 0 
                  ? 'Tu cartola bancaria está lista y en cero. Registra tu primer ingreso (sueldo, ventas) o gasto operativo para comenzar el balance.'
                  : 'Prueba restableciendo los filtros de búsqueda para ver todos los movimientos.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5 justify-center">
              {transactions.length === 0 ? (
                <button
                  onClick={() => openTransactionModal('income')}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>Registrar Primer Ingreso</span>
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Restablecer Filtros</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Fecha & Hora</th>
                  <th className="py-4 px-5">Detalle / Concepto</th>
                  <th className="py-4 px-4">Categoría</th>
                  <th className="py-4 px-4">Medio / Canal</th>
                  <th className="py-4 px-5 text-right">Monto</th>
                  <th className="py-4 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const bankDate = formatBankDateTime(tx.date, tx.time);

                  return (
                    <tr 
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Bank Date & Time */}
                      <td className="py-4 px-5 text-xs text-slate-300">
                        <div className="font-bold text-slate-200">{bankDate.dateFormatted}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Clock size={11} className="text-amber-400" />
                          <span>{bankDate.timeFormatted}</span>
                        </div>
                      </td>

                      {/* Concept & Type */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${
                            isIncome 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{tx.description}</p>
                            {tx.notes && (
                              <p className="text-xs text-slate-400 truncate max-w-xs">{tx.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Tags */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                            {tx.category}
                          </span>
                          {tx.isRecurring && (
                            <span className="block text-[10px] text-teal-400 font-medium">
                              ↻ Recurrente ({tx.recurringFrequency || 'mensual'})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method & Client */}
                      <td className="py-4 px-4 text-xs text-slate-300">
                        <div>
                          <p className="capitalize font-medium">{tx.paymentMethod}</p>
                          {tx.vendorOrClient && (
                            <p className="text-[11px] text-slate-400 truncate">{tx.vendorOrClient}</p>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 text-right font-black">
                        <span className={`text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openTransactionModal(tx.type, tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Editar movimiento"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el movimiento "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar movimiento"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
