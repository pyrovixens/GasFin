import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  Sparkles,
  Building2,
  X,
  LogOut
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { ActiveView } from '../types';

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { 
    activeView, 
    setActiveView, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed,
    metrics,
    debts,
    savingsTips,
    currentCurrency,
    setCurrency
  } = useFinancial();

  const menuItems = [
    {
      id: 'dashboard' as ActiveView,
      label: 'Dashboard Ejecutivo',
      icon: LayoutDashboard,
      badge: metrics.isDeficit ? '⚠️ Alerta' : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'transactions' as ActiveView,
      label: 'Ingresos y Gastos',
      icon: ArrowLeftRight,
    },
    {
      id: 'debts' as ActiveView,
      label: 'Optimizador de Deudas',
      icon: CreditCard,
      badge: debts.length > 0 ? `${debts.length}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'savings' as ActiveView,
      label: 'Asesor de Ahorros IA',
      icon: Lightbulb,
      badge: `${savingsTips.filter(t => !t.isApplied).length} ideas`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'goals' as ActiveView,
      label: 'Metas Financieras',
      icon: Target,
    },
    {
      id: 'scenarios' as ActiveView,
      label: 'Simulador & Escenarios',
      icon: TrendingUp,
    },
    {
      id: 'settings' as ActiveView,
      label: 'Configuración & Datos',
      icon: Settings,
    },
  ];

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    // On mobile, auto-close sidebar drawer when navigating
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {!isSidebarCollapsed && (
        <div 
          onClick={() => setIsSidebarCollapsed(true)}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        />
      )}

      {/* Sidebar Container: Drawer on mobile/tablet, Fixed side on desktop */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 flex flex-col bg-slate-900/95 dark:bg-slate-950/95 border-r border-slate-800 backdrop-blur-xl transition-all duration-300 ease-in-out z-50 select-none ${
          // Mobile state
          isSidebarCollapsed 
            ? '-translate-x-full md:translate-x-0 md:w-20' 
            : 'translate-x-0 w-72 md:w-72'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleSelectView('dashboard')}>
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-glow-emerald text-white font-bold text-xl flex-shrink-0">
              GF
            </div>
            {(!isSidebarCollapsed || window.innerWidth < 768) && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    Gast<span className="text-emerald-400">Fin</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-xs text-slate-400 truncate">Control Financiero Inteligente</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            title={isSidebarCollapsed ? 'Expandir Menú' : 'Colapsar Menú'}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/50 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="flex md:hidden items-center justify-center w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Deficit Alert Warning Pill in Sidebar */}
        {metrics.isDeficit && (
          <div className="px-3 pt-3">
            <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 shadow-glow-rose animate-pulse-subtle ${isSidebarCollapsed && window.innerWidth >= 768 ? 'justify-center' : ''}`}>
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              {(!isSidebarCollapsed || window.innerWidth < 768) && (
                <div className="text-xs">
                  <p className="font-bold text-rose-200">Déficit Detectado</p>
                  <p className="text-[11px] text-rose-300/80">Gastos superan ingresos</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } ${isSidebarCollapsed && window.innerWidth >= 768 ? 'justify-center px-0' : ''}`}
              >
                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                
                {(!isSidebarCollapsed || window.innerWidth < 768) && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Currency in Sidebar */}
        {(!isSidebarCollapsed || window.innerWidth < 768) && (
          <div className="px-4 pb-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-emerald-950/30 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-1.5 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salud Financiera</span>
              </div>
              <p className="text-xs text-slate-300 mb-2.5">
                {metrics.isDeficit 
                  ? 'Prioriza reducir costos no esenciales en el Asesor IA.'
                  : `Tasa de ahorro saludable: ${metrics.savingsRate.toFixed(1)}% este mes.`}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Moneda:</span>
                <select
                  value={currentCurrency.code}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="MXN">MXN ($)</option>
                  <option value="COP">COP ($)</option>
                  <option value="CLP">CLP ($)</option>
                  <option value="PEN">PEN (S/)</option>
                  <option value="ARS">ARS ($)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Organization / User Profile Footer with Cerrar Sesión */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className={`flex items-center gap-2.5 ${isSidebarCollapsed && window.innerWidth >= 768 ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-8 h-8 rounded-full border border-emerald-500/50 flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs flex-shrink-0">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'GF'}
                </div>
              )}
              {(!isSidebarCollapsed || window.innerWidth < 768) && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.displayName || 'Usuario'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'Sin sesión'}</p>
                </div>
              )}
            </div>

            {(!isSidebarCollapsed || window.innerWidth < 768) && (
              <button
                onClick={logout}
                title="Cerrar Sesión y cambiar de usuario"
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1 text-[11px] font-bold flex-shrink-0"
              >
                <LogOut size={14} />
                <span className="hidden xl:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
