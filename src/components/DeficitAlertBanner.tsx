import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const DeficitAlertBanner: React.FC = () => {
  const { metrics, formatMoney, setIsDeficitModalOpen, setActiveView } = useFinancial();

  if (!metrics.isDeficit) return null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-900/60 to-slate-900/90 border-2 border-rose-500/60 p-4 sm:p-5 text-white shadow-glow-rose animate-slide-up relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex-shrink-0 animate-pulse">
            <ShieldAlert size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                Alerta Crítica de Tesorería
              </span>
              <span className="text-xs text-rose-200/80 font-medium">
                Los gastos superan los ingresos en el periodo
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Déficit operativo acumulado de <span className="text-rose-400 font-extrabold">{formatMoney(metrics.deficitAmount)}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Tasa de cobertura: <strong className="text-rose-300">{(metrics.liquidityRatio * 100).toFixed(0)}%</strong> de los compromisos cubiertos. Se requiere ajuste de liquidez inmediato.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setActiveView('savings')}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Zap size={14} className="text-amber-400" />
            <span>Recortar Gastos</span>
          </button>

          <button
            onClick={() => setIsDeficitModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span>Plan de Contingencia</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
