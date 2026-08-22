import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  FileSpreadsheet,
  PieChart as PieChartIcon,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { CATEGORY_COLORS } from '../data/initialData';

export const ReportsView: React.FC = () => {
  const { 
    userName, 
    currentCurrency, 
    formatMoney, 
    metrics, 
    transactions, 
    debts, 
    goals, 
    exportDataToExcel 
  } = useFinancial();

  const [period, setPeriod] = useState<'current_month' | 'last_month' | 'year' | 'all'>('current_month');

  // Filter transactions by selected period
  const filteredTxs = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return transactions.filter(t => {
      if (!t.date) return false;
      const [y, m] = t.date.split('-').map(Number);

      if (period === 'current_month') {
        return y === currentYear && m === currentMonth;
      }
      if (period === 'last_month') {
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        return y === lastYear && m === lastMonth;
      }
      if (period === 'year') {
        return y === currentYear;
      }
      return true;
    });
  }, [transactions, period]);

  // Aggregated totals for this report period
  const periodTotals = useMemo(() => {
    const income = filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    const rate = income > 0 ? Math.max(0, (balance / income) * 100) : 0;

    const catMap: Record<string, number> = {};
    filteredTxs.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(catMap)
      .map(([name, amount]) => ({ name, amount, pct: expense > 0 ? (amount / expense) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    return {
      income,
      expense,
      balance,
      rate,
      topCategories,
      count: filteredTxs.length
    };
  }, [filteredTxs]);

  const handlePrintPDF = () => {
    window.print();
  };

  const periodLabels = {
    current_month: 'Mes Actual (Periodo en Curso)',
    last_month: 'Mes Anterior (Cierre Mensual)',
    year: `Año Fiscal ${new Date().getFullYear()}`,
    all: 'Histórico Completo'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Control Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-glow-teal">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Reportes y Descargas</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Descarga o imprime un resumen ordenado de tus ingresos, gastos y deudas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-800 border border-slate-700 text-xs">
              {(['current_month', 'last_month', 'year', 'all'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    period === p ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p === 'current_month' ? 'Mes Actual' : p === 'last_month' ? 'Mes Anterior' : p === 'year' ? 'Año' : 'Todo'}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Printer size={15} />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL FINANCIAL STATEMENT REPORT CONTAINER */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-8 print:p-0 print:bg-white print:text-slate-900 print:border-none print:shadow-none">
        
        {/* Report Official Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-500/60 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                GF
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white print:text-slate-900">
                Gast<span className="text-emerald-400 print:text-emerald-700">Fin</span> • Resumen Financiero
              </h1>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Informe detallado de tus ingresos, gastos y ahorros
            </p>
          </div>

          <div className="text-left sm:text-right space-y-0.5 text-xs text-slate-300 print:text-slate-700">
            <p><strong className="text-white print:text-slate-900">Titular / Empresa:</strong> {userName || 'Usuario Principal'}</p>
            <p><strong className="text-white print:text-slate-900">Periodo:</strong> {periodLabels[period]}</p>
            <p><strong className="text-white print:text-slate-900">Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong className="text-white print:text-slate-900">Moneda:</strong> {currentCurrency.code} ({currentCurrency.name})</p>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700 print:border-slate-300">
            <span className="text-xs font-bold text-slate-400 print:text-slate-600 uppercase">Ingresos del Periodo</span>
            <p className="text-2xl font-black text-emerald-400 print:text-emerald-700 mt-1">{formatMoney(periodTotals.income)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700 print:border-slate-300">
            <span className="text-xs font-bold text-slate-400 print:text-slate-600 uppercase">Gastos Operativos</span>
            <p className="text-2xl font-black text-rose-400 print:text-rose-700 mt-1">{formatMoney(periodTotals.expense)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700 print:border-slate-300">
            <span className="text-xs font-bold text-slate-400 print:text-slate-600 uppercase">Flujo Neto (Balance)</span>
            <p className={`text-2xl font-black mt-1 ${periodTotals.balance >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
              {formatMoney(periodTotals.balance)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 print:bg-slate-100 border border-slate-700 print:border-slate-300">
            <span className="text-xs font-bold text-slate-400 print:text-slate-600 uppercase">Tasa de Ahorro</span>
            <p className="text-2xl font-black text-white print:text-slate-900 mt-1">{periodTotals.rate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Detailed Breakdown: Top Categories & Structure */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-2">
            Desglose de Gastos por Categoría
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 bg-slate-950/60 print:bg-slate-200 text-slate-400 print:text-slate-700 font-bold uppercase">
                  <th className="py-2.5 px-3">Categoría de Gasto</th>
                  <th className="py-2.5 px-3 text-right">Monto Total</th>
                  <th className="py-2.5 px-3 text-right">% del Gasto Total</th>
                  <th className="py-2.5 px-3">Participación Visual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                {periodTotals.topCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">No hay gastos registrados en este periodo.</td>
                  </tr>
                ) : (
                  periodTotals.topCategories.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">{c.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400 print:text-rose-700">{formatMoney(c.amount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-slate-700">{c.pct.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 w-40">
                        <div className="w-full h-2 rounded-full bg-slate-800 print:bg-slate-300 overflow-hidden">
                          <div className="h-full bg-emerald-500 print:bg-emerald-700" style={{ width: `${c.pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consolidated Financial Liabilities & Assets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          
          {/* Debts Table */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white print:text-slate-900">Estado de Deudas & Obligaciones</h4>
            <div className="p-4 rounded-2xl bg-slate-800/40 print:bg-slate-100 border border-slate-700 print:border-slate-300 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 print:text-slate-600">Deuda Total Pendiente:</span>
                <span className="font-mono font-bold text-rose-400 print:text-rose-700">{formatMoney(metrics.totalDebt)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 print:text-slate-600">Compromiso Mensual Mínimo:</span>
                <span className="font-mono font-bold text-slate-200 print:text-slate-800">{formatMoney(metrics.monthlyDebtObligation)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-700 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-600">Créditos Activos:</span>
                <span className="font-bold text-white print:text-slate-900">{debts.length} compromisos</span>
              </div>
            </div>
          </div>

          {/* Goals and Reserves */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white print:text-slate-900">Fondos de Reserva & Metas</h4>
            <div className="p-4 rounded-2xl bg-slate-800/40 print:bg-slate-100 border border-slate-700 print:border-slate-300 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 print:text-slate-600">Capital Acumulado en Metas:</span>
                <span className="font-mono font-bold text-emerald-400 print:text-emerald-700">
                  {formatMoney(goals.reduce((acc, g) => acc + g.currentAmount, 0))}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 print:text-slate-600">Objetivo Total Planificado:</span>
                <span className="font-mono font-bold text-slate-200 print:text-slate-800">
                  {formatMoney(goals.reduce((acc, g) => acc + g.targetAmount, 0))}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-700 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-600">Metas en Desarrollo:</span>
                <span className="font-bold text-white print:text-slate-900">{goals.length} fondos</span>
              </div>
            </div>
          </div>

        </div>

        {/* Official Report Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-400 text-center text-slate-500 print:text-slate-600 text-[11px] space-y-1">
          <p>Documento generado automáticamente por GastFin Pro. Los cálculos corresponden a los registros contables ingresados por el titular.</p>
          <p>© {new Date().getFullYear()} GastFin Pro • Sistema de Control Financiero Inteligente</p>
        </div>

      </div>

    </div>
  );
};
