import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Flame, 
  TrendingDown, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const DeficitAlertModal: React.FC = () => {
  const { 
    isDeficitModalOpen, 
    setIsDeficitModalOpen, 
    metrics, 
    formatMoney, 
    setActiveView 
  } = useFinancial();

  if (!isDeficitModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-8 shadow-glow-rose max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsDeficitModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0 animate-pulse">
            <ShieldAlert size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                Protocolo de Emergencia Financiera
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Plan de Recuperación de Liquidez
            </h2>
          </div>
        </div>

        {/* Deficit Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-xs text-slate-400">Ingresos Totales</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatMoney(metrics.totalIncome)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-xs text-slate-400">Gastos Totales</span>
            <p className="text-lg font-bold text-rose-400 mt-0.5">{formatMoney(metrics.totalExpense)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50">
            <span className="text-xs text-rose-300 font-semibold">Déficit a Cubrir</span>
            <p className="text-lg font-black text-rose-200 mt-0.5">-{formatMoney(metrics.deficitAmount)}</p>
          </div>
        </div>

        {/* Action Guide */}
        <div className="space-y-3.5 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3 Acciones Inmediatas de Mitigación:
          </h4>

          {/* Action 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 transition-colors flex gap-3.5 items-start">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5 font-bold text-xs">
              01
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Congelar Gastos Discrecionales y No Esenciales</span>
                <Flame size={14} className="text-amber-400" />
              </h5>
              <p className="text-xs text-slate-300 mt-1">
                Pausa suscripciones redundantes de software, cenas corporativas y presupuestos de marketing de baja conversión. Ahorro potencial estimado: <strong>15% a 25% del gasto mensual</strong>.
              </p>
            </div>
          </div>

          {/* Action 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/40 transition-colors flex gap-3.5 items-start">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 flex-shrink-0 mt-0.5 font-bold text-xs">
              02
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-100">
                Renegociación de Cuentas por Pagar & Deuda
              </h5>
              <p className="text-xs text-slate-300 mt-1">
                Contacta a tus 3 proveedores principales para extender los plazos de 30 a 45-60 días y utiliza el método Avalancha en tus tarjetas de crédito con mayor tasa de interés.
              </p>
            </div>
          </div>

          {/* Action 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-emerald-500/40 transition-colors flex gap-3.5 items-start">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5 font-bold text-xs">
              03
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Inyección Rápida: Descuentos por Pronto Pago a Clientes</span>
                <Sparkles size={14} className="text-emerald-400" />
              </h5>
              <p className="text-xs text-slate-300 mt-1">
                Ofrece a tus clientes con facturas pendientes un 3% a 5% de descuento si liquidan su saldo en las próximas 48 horas para recuperar liquidez inmediata.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsDeficitModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Entendido, cerrar
          </button>
          <button
            onClick={() => {
              setIsDeficitModalOpen(false);
              setActiveView('savings');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-2"
          >
            <span>Ir al Asesor de Ahorros IA</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
};
