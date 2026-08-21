import React from 'react';
import { 
  Plus, 
  Menu, 
  Sun, 
  Moon, 
  ShieldAlert, 
  CheckCircle2, 
  Coins,
  FileSpreadsheet,
  User
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const Navbar: React.FC = () => {
  const { 
    userName,
    activeView, 
    isDarkMode, 
    toggleDarkMode, 
    openTransactionModal,
    setIsSidebarCollapsed,
    metrics,
    formatMoney,
    currentCurrency,
    setIsCurrencySetupModalOpen,
    setIsDeficitModalOpen,
    exportDataToExcel
  } = useFinancial();

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return { title: 'Dashboard Ejecutivo', subtitle: 'Vista general de tesorería, liquidez y balance financiero' };
      case 'transactions': return { title: 'Libro de Ingresos y Gastos', subtitle: 'Registro cronológico y auditoría de movimientos' };
      case 'debts': return { title: 'Optimizador y Calculadora de Deudas', subtitle: 'Estrategias Bola de Nieve vs Avalancha y amortizaciones' };
      case 'savings': return { title: 'Asesor Inteligente de Ahorro', subtitle: 'Detección de fugas de dinero y distribución 50/30/20' };
      case 'goals': return { title: 'Metas y Fondos Financieros', subtitle: 'Planificación de reservas, ahorro e inversiones' };
      case 'scenarios': return { title: 'Simulador Financiero What-If', subtitle: 'Proyecciones estratégicas basadas en tu sueldo' };
      case 'settings': return { title: 'Configuración & Respaldos', subtitle: 'Preferencias de divisa fija, backups y control' };
      default: return { title: 'GastFin', subtitle: 'Control de Costos' };
    }
  };

  const { title, subtitle } = getTitle();

  return (
    <header className="sticky top-0 z-20 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white md:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg lg:text-xl font-extrabold text-white tracking-tight truncate flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        {/* User Pill if Name Set */}
        {userName && (
          <button
            onClick={() => setIsCurrencySetupModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-bold transition-colors"
            title="Haz clic para editar tu perfil o divisa"
          >
            <User size={14} className="text-emerald-400" />
            <span className="truncate max-w-[120px]">{userName}</span>
          </button>
        )}

        {/* Real-time Health / Deficit Status Badge */}
        {metrics.isDeficit ? (
          <button
            onClick={() => setIsDeficitModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-glow-rose text-xs font-bold transition-all animate-pulse"
          >
            <ShieldAlert size={16} className="text-rose-400" />
            <span className="hidden sm:inline">Déficit: -{formatMoney(metrics.deficitAmount)}</span>
            <span className="sm:hidden">Déficit</span>
          </button>
        ) : (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Moneda: {currentCurrency.code} ({currentCurrency.symbol})</span>
          </div>
        )}

        {/* Currency Quick Click */}
        <button
          onClick={() => setIsCurrencySetupModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs font-bold transition-colors"
          title="Ver o cambiar divisa principal"
        >
          <Coins size={15} className="text-amber-400" />
          <span>{currentCurrency.code} ({currentCurrency.symbol})</span>
        </button>

        {/* Export to Excel Quick Button */}
        <button
          onClick={exportDataToExcel}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs transition-all shadow-sm"
          title="Exportar base de datos completa a Excel / CSV"
        >
          <FileSpreadsheet size={16} />
          <span className="hidden sm:inline">Excel</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
        >
          {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-400" />}
        </button>

        {/* Primary Action Button: "Ingreso" */}
        <button
          onClick={() => openTransactionModal('income')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-glow-emerald hover:shadow-lg transition-all active:scale-95"
        >
          <span>Ingreso</span>
        </button>
      </div>
    </header>
  );
};
