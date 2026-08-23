import React from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  ShieldAlert, 
  CheckCircle2, 
  Coins, 
  FileSpreadsheet, 
  Scan, 
  Cloud, 
  User,
  LogOut,
  Eye,
  EyeOff,
  Search,
  Command
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    isDarkMode, 
    toggleDarkMode, 
    isPrivacyMode,
    togglePrivacyMode,
    setIsCommandPaletteOpen,
    openTransactionModal,
    setIsReceiptScannerOpen,
    setIsSidebarCollapsed,
    metrics,
    formatMoney,
    currentCurrency,
    userName,
    supabaseUser,
    setIsAuthModalOpen,
    setIsCurrencySetupModalOpen,
    setIsDeficitModalOpen,
    exportDataToExcel,
    logoutUser
  } = useFinancial();

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return { title: 'Resumen del Mes', subtitle: 'Vista general de tus ingresos, gastos y ahorros' };
      case 'transactions': return { title: 'Ingresos y Gastos', subtitle: 'Registro y detalle de todos tus movimientos' };
      case 'budgets': return { title: 'Límites de Gasto', subtitle: 'Topes mensuales por categoría para no sobregirarte' };
      case 'calendar': return { title: 'Calendario de Pagos', subtitle: 'Vencimientos de cuentas, servicios y recordatorios' };
      case 'debts': return { title: 'Control de Deudas', subtitle: 'Plan para pagar tus deudas más rápido' };
      case 'net_worth': return { title: 'Patrimonio Neto', subtitle: 'Tus bienes y ahorros menos lo que debes' };
      case 'subscriptions': return { title: 'Suscripciones', subtitle: 'Control de pagos mensuales como Netflix, Spotify y otros' };
      case 'savings': return { title: 'Consejos de Ahorro', subtitle: 'Recomendaciones para hacer rendir más tu dinero' };
      case 'goals': return { title: 'Mis Metas de Ahorro', subtitle: 'Objetivos para tus proyectos y reservas' };
      case 'scenarios': return { title: 'Simulador de Sueldo', subtitle: 'Proyecta cómo cambia tu dinero si varían tus ingresos' };
      case 'compound': return { title: 'Calculadora de Inversión', subtitle: 'Mira cómo crece tu dinero en el tiempo' };
      case 'reports': return { title: 'Reportes y Descargas', subtitle: 'Informes listos para imprimir o guardar' };
      case 'settings': return { title: 'Ajustes y Respaldo', subtitle: 'Configura tu cuenta, PIN, moneda y respaldos' };
      default: return { title: 'GastFin', subtitle: 'Control de Costos' };
    }
  };

  const { title, subtitle } = getTitle();

  return (
    <header className="sticky top-0 z-20 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-5 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* Title Section (with human text and no icon overlap) */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-shrink">
        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white md:hidden flex-shrink-0"
          title="Menú de navegación"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 truncate">
          <h1 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate leading-tight mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Right Actions Group (Compact, sleek & non-overlapping) */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        
        {/* User Alias */}
        <button
          onClick={() => setIsCurrencySetupModalOpen(true)}
          className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-bold transition-all shadow-sm group flex-shrink-0"
          title="Editar alias y divisa principal"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px] sm:text-xs">
            {userName ? userName.charAt(0).toUpperCase() : 'G'}
          </div>
          <span className="hidden xl:inline text-xs font-bold text-white max-w-[90px] truncate">{userName || 'Mi Cuenta'}</span>
        </button>

        {/* Real-time Deficit Status Badge */}
        {metrics.isDeficit && (
          <button
            onClick={() => setIsDeficitModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-glow-rose text-xs font-bold transition-all animate-pulse flex-shrink-0"
            title="Déficit detectado"
          >
            <ShieldAlert size={14} className="text-rose-400" />
            <span className="hidden md:inline text-[11px]">Déficit</span>
          </button>
        )}

        {/* Cloud Sync Button */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-bold transition-all shadow-sm flex items-center gap-1 flex-shrink-0 ${
            supabaseUser
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title={supabaseUser ? `Conectado a la Nube (${supabaseUser.email})` : 'Conectar con la Nube'}
        >
          <Cloud size={14} className={supabaseUser ? 'text-emerald-400' : 'text-slate-400'} />
          <span className="hidden 2xl:inline text-[11px]">{supabaseUser ? 'Nube' : 'Sincronizar'}</span>
        </button>

        {/* OCR Receipt Scanner */}
        <button
          onClick={() => setIsReceiptScannerOpen(true)}
          className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs transition-all shadow-sm flex items-center gap-1 flex-shrink-0"
          title="Escanear o subir foto de boleta / factura"
        >
          <Scan size={14} className="text-indigo-400" />
          <span className="hidden 2xl:inline text-[11px]">Boleta</span>
        </button>

        {/* Currency Selector */}
        <button
          onClick={() => setIsCurrencySetupModalOpen(true)}
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs font-bold transition-colors flex-shrink-0"
          title="Ver o cambiar divisa principal"
        >
          <Coins size={13} className="text-amber-400" />
          <span className="text-[11px]">{currentCurrency.code}</span>
        </button>

        {/* Command Palette Quick Search Button (Cmd+K) */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1 flex-shrink-0"
          title="Abrir paleta de comandos rápida (Cmd + K / Ctrl + K)"
        >
          <Search size={14} className="text-emerald-400" />
          <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-slate-900 text-slate-400 font-mono text-[9px] border border-slate-700">⌘K</kbd>
        </button>

        {/* Privacy Stealth Mode Toggle (Ocultar Saldos) */}
        <button
          type="button"
          onClick={togglePrivacyMode}
          title={isPrivacyMode ? 'Desactivar modo privacidad (mostrar saldos)' : 'Activar modo privacidad (ocultar saldos con asteriscos)'}
          className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
            isPrivacyMode 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber' 
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
          }`}
        >
          {isPrivacyMode ? <EyeOff size={14} className="text-amber-400" /> : <Eye size={14} className="text-slate-400" />}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer flex-shrink-0"
        >
          {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
        </button>

        {/* Cerrar Sesión */}
        <button
          type="button"
          onClick={logoutUser}
          title="Cerrar sesión de forma segura"
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer flex-shrink-0"
        >
          <LogOut size={14} />
        </button>

        {/* Primary Action Button: "Ingreso" */}
        <button
          type="button"
          onClick={() => openTransactionModal('income')}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-glow-emerald hover:shadow-lg transition-all active:scale-95 cursor-pointer flex-shrink-0"
        >
          <span>+ Ingreso</span>
        </button>
      </div>
    </header>
  );
};
