import React from 'react';
import { Printer, ChevronLeft, Download, X, FileText, CheckCircle2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const FinancialReportPrintModal: React.FC = () => {
  const { 
    isReportPrintModalOpen, 
    setIsReportPrintModalOpen, 
    userName, 
    currentCurrency, 
    metrics, 
    transactions, 
    assets, 
    debts, 
    formatMoney 
  } = useFinancial();

  if (!isReportPrintModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const totalAssets = assets.reduce((acc, a) => acc + a.value, 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.remainingAmount, 0);
  const netWorth = totalAssets - totalDebts;

  // Categories expense aggregation
  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl my-auto overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsReportPrintModalOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Volver"
            >
              <ChevronLeft size={18} className="text-emerald-400" />
            </button>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Informe Financiero Ejecutivo</h3>
              <p className="text-[11px] text-slate-400">Listo para descargar como PDF o imprimir en papel A4.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReportPrintModalOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 bg-slate-900 print:bg-white print:text-black print:p-0 print:m-0 print:border-none">
          
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 print:border-black/20 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight">GastFin Pro</span>
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 print:text-black border border-emerald-500/30">
                  Estado Financiero
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-300 print:text-black/80 mt-1">
                Titular: {userName || 'Mi Cuenta'}
              </h2>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 print:text-black/60">
              <p>Fecha de emisión: <strong>{currentDate}</strong></p>
              <p>Moneda de referencia: <strong>{currentCurrency.name} ({currentCurrency.code})</strong></p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/60 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-black/60">Ingresos Totales</span>
              <p className="text-lg font-black text-emerald-400 print:text-emerald-700 mt-0.5">{formatMoney(metrics.totalIncome)}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/60 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-black/60">Gastos Totales</span>
              <p className="text-lg font-black text-rose-400 print:text-rose-700 mt-0.5">{formatMoney(metrics.totalExpense)}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/60 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-black/60">Flujo Neto de Caja</span>
              <p className={`text-lg font-black mt-0.5 ${metrics.netCashFlow >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                {formatMoney(metrics.netCashFlow)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/60 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-black/60">Tasa de Ahorro</span>
              <p className="text-lg font-black text-indigo-400 print:text-indigo-700 mt-0.5">{metrics.savingsRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Balance Sheet: Assets, Liabilities & Net Worth */}
          <div className="p-4 rounded-2xl bg-slate-800/40 print:bg-slate-50 border border-slate-700/60 print:border-slate-300 space-y-3">
            <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider">
              Balance Patrimonial Consolidado
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 print:text-black/60">Total en Activos & Bienes:</span>
                <p className="font-mono font-bold text-emerald-400 print:text-emerald-700 text-sm mt-0.5">{formatMoney(totalAssets)}</p>
              </div>
              <div>
                <span className="text-slate-400 print:text-black/60">Total en Deudas & Pasivos:</span>
                <p className="font-mono font-bold text-rose-400 print:text-rose-700 text-sm mt-0.5">{formatMoney(totalDebts)}</p>
              </div>
              <div>
                <span className="text-slate-400 print:text-black/60">Patrimonio Neto Real:</span>
                <p className="font-mono font-black text-white print:text-black text-sm mt-0.5">{formatMoney(netWorth)}</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown by Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider">
              Desglose de Gastos por Categoría
            </h4>
            {sortedCategories.length === 0 ? (
              <p className="text-xs text-slate-400">Sin gastos registrados en el periodo.</p>
            ) : (
              <div className="rounded-2xl border border-slate-800 print:border-slate-300 overflow-hidden divide-y divide-slate-800 print:divide-slate-200 text-xs">
                {sortedCategories.map(([cat, val]) => {
                  const pct = metrics.totalExpense > 0 ? (val / metrics.totalExpense) * 100 : 0;
                  return (
                    <div key={cat} className="p-2.5 flex items-center justify-between bg-slate-800/30 print:bg-white">
                      <span className="font-semibold text-slate-200 print:text-black">{cat}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 print:text-black/60 text-[11px]">{pct.toFixed(1)}%</span>
                        <span className="font-mono font-bold text-white print:text-black">{formatMoney(val)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer certification */}
          <div className="pt-6 border-t border-slate-800 print:border-black/20 text-center text-[10px] text-slate-400 print:text-black/50 space-y-1">
            <p>Generado automáticamente por el motor de gestión financiera de GastFin Pro.</p>
            <p>Documento de control personal y empresarial confidencial.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
