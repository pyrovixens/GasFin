import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  FileSpreadsheet, 
  FileText, 
  CreditCard, 
  PieChart, 
  Calendar, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Settings, 
  Upload, 
  Clock, 
  ShieldCheck, 
  X,
  Layers
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { ActiveView } from '../types';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveView,
    openTransactionModal,
    isDarkMode,
    toggleDarkMode,
    isPrivacyMode,
    togglePrivacyMode,
    setIsCSVImporterOpen,
    setIsReportPrintModalOpen,
    exportDataToExcel,
    transactions,
    formatMoney
  } = useFinancial();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'new_income',
      title: 'Registrar Nuevo Ingreso',
      subtitle: 'Añadir sueldo, venta o cobro al libro mayor',
      icon: Plus,
      category: 'Acciones Rápidas',
      perform: () => {
        setIsCommandPaletteOpen(false);
        openTransactionModal('income');
      }
    },
    {
      id: 'new_expense',
      title: 'Registrar Nuevo Gasto',
      subtitle: 'Añadir compra, factura o egreso',
      icon: Plus,
      category: 'Acciones Rápidas',
      perform: () => {
        setIsCommandPaletteOpen(false);
        openTransactionModal('expense');
      }
    },
    {
      id: 'import_csv',
      title: 'Importar Cartola Bancaria CSV',
      subtitle: 'Subir archivo de movimientos de tu banco en 2 seg',
      icon: Upload,
      category: 'Acciones Rápidas',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setIsCSVImporterOpen(true);
      }
    },
    {
      id: 'toggle_privacy',
      title: isPrivacyMode ? 'Desactivar Modo Privacidad' : 'Activar Modo Privacidad (Ocultar Saldos)',
      subtitle: 'Ocultar montos con asteriscos en pantalla pública',
      icon: isPrivacyMode ? Eye : EyeOff,
      category: 'Seguridad & Vista',
      perform: () => {
        setIsCommandPaletteOpen(false);
        togglePrivacyMode();
      }
    },
    {
      id: 'toggle_theme',
      title: isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro',
      subtitle: 'Alternar esquema de colores visual',
      icon: isDarkMode ? Sun : Moon,
      category: 'Seguridad & Vista',
      perform: () => {
        setIsCommandPaletteOpen(false);
        toggleDarkMode();
      }
    },
    {
      id: 'view_net_worth',
      title: 'Monitor de Patrimonio Neto (Activos vs Pasivos)',
      subtitle: 'Ver riqueza neta y balance de propiedades y cuentas',
      icon: TrendingUp,
      category: 'Navegación Pro',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('net_worth');
      }
    },
    {
      id: 'view_subscriptions',
      title: 'Radar de Suscripciones & Costo Anual',
      subtitle: 'Auditar Netflix, Spotify, software y cobros recurrentes',
      icon: Clock,
      category: 'Navegación Pro',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('subscriptions');
      }
    },
    {
      id: 'export_pdf',
      title: 'Generar Informe Ejecutivo Imprimible / PDF',
      subtitle: 'Estado de Resultados formal listo para descargar o imprimir',
      icon: FileText,
      category: 'Informes & Respaldos',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setIsReportPrintModalOpen(true);
      }
    },
    {
      id: 'export_excel',
      title: 'Exportar Base de Datos a Excel (.csv)',
      subtitle: 'Descargar libro contable completo',
      icon: FileSpreadsheet,
      category: 'Informes & Respaldos',
      perform: () => {
        setIsCommandPaletteOpen(false);
        exportDataToExcel();
      }
    },
    {
      id: 'view_dashboard',
      title: 'Ir a Panel Principal (Dashboard)',
      subtitle: 'Métricas clave de liquidez, ahorro e ingresos',
      icon: PieChart,
      category: 'Navegación',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('dashboard');
      }
    },
    {
      id: 'view_debts',
      title: 'Ir a Estrategias de Deuda (Bola de Nieve)',
      subtitle: 'Acelerador de amortización y reducción de intereses',
      icon: CreditCard,
      category: 'Navegación',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('debts');
      }
    },
    {
      id: 'view_calendar',
      title: 'Ir a Calendario & Gastos Programados',
      subtitle: 'Recordatorios automáticos de vencimientos',
      icon: Calendar,
      category: 'Navegación',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('calendar');
      }
    },
    {
      id: 'view_settings',
      title: 'Ir a Configuración & Seguridad',
      subtitle: 'Ajustes de PIN, moneda y respaldos',
      icon: Settings,
      category: 'Navegación',
      perform: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('settings');
      }
    }
  ];

  // Filter actions and matching transactions
  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-950/50">
          <Search size={20} className="text-emerald-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="¿Qué deseas hacer? (ej. 'gasto', 'patrimonio', 'privacidad', 'excel')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none text-white text-sm sm:text-base font-semibold focus:outline-none placeholder-slate-500"
          />
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700">ESC</kbd>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No se encontraron comandos para &quot;{query}&quot;
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const IconComp = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.perform}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all text-left cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white shadow-sm' 
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <IconComp size={16} />
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">{action.title}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {action.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{action.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight size={14} className={`flex-shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-emerald-400' : 'text-slate-600'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span>Navega con <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↓</kbd> y presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd></span>
          <span className="hidden sm:inline">GastFin Pro Command Palette</span>
        </div>

      </div>
    </div>
  );
};
