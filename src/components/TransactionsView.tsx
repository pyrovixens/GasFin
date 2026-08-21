import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag,
  CreditCard,
  Printer,
  FileSpreadsheet,
  Clock
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

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(transactions.map(t => t.category));
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.vendorOrClient && t.vendorOrClient.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

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

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tipo', 'Monto', 'Categoría', 'Descripción', 'Fecha', 'Método', 'Estado', 'Entidad / Cliente', 'Notas'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.amount,
      `"${t.category}"`,
      `"${t.description}"`,
      t.date,
      t.paymentMethod,
      t.status,
      `"${t.vendorOrClient || ''}"`,
      `"${t.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gastfin_movimientos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-lg font-bold">🏛️</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Libro de Movimientos Bancarios</h1>
                <p className="text-xs text-slate-400 mt-0.5">Cartola de transacciones con fecha y hora en tiempo real.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportDataToExcel}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Descargar Libro Completo en Excel"
            >
              <FileSpreadsheet size={16} />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              title="Imprimir resumen"
            >
              <Printer size={16} className="text-slate-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={() => openTransactionModal('income')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold shadow-glow-emerald transition-all flex items-center gap-1.5"
            >
              <span>Ingreso</span>
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
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las Categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los Métodos</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta Débito/Crédito</option>
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
            <span className="text-[11px] font-semibold text-slate-400">Balance del Rango</span>
            <p className={`text-sm sm:text-base font-black mt-0.5 ${totals.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(totals.balance)}
            </p>
          </div>
        </div>

      </div>

      {/* Transactions Data Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft overflow-hidden">
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-300">No se encontraron movimientos con los filtros actuales.</p>
                    <p className="text-xs text-slate-500 mt-1">Prueba cambiando los criterios de búsqueda o crea un nuevo registro.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
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
                          <span>{bankDate.timeFormatted || tx.time || '12:00 hrs'}</span>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
