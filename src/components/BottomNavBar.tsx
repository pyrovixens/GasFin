import React from 'react';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Menu, Plus } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const BottomNavBar: React.FC = () => {
  const { activeView, setActiveView, openTransactionModal, setIsSidebarCollapsed } = useFinancial();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around text-[10px] select-none shadow-2xl">
      <button
        onClick={() => setActiveView('dashboard')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeView === 'dashboard' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard size={18} />
        <span>Inicio</span>
      </button>

      <button
        onClick={() => setActiveView('transactions')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeView === 'transactions' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ArrowLeftRight size={18} />
        <span>Movimientos</span>
      </button>

      {/* Center Primary Action: Ingreso */}
      <button
        onClick={() => openTransactionModal('income')}
        className="flex flex-col items-center justify-center -mt-6 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-glow-emerald font-black active:scale-90 transition-transform border-2 border-slate-950"
        title="Nuevo Ingreso o Gasto"
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      <button
        onClick={() => setActiveView('debts')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          activeView === 'debts' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <CreditCard size={18} />
        <span>Deudas</span>
      </button>

      <button
        onClick={() => setIsSidebarCollapsed(false)}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200"
      >
        <Menu size={18} />
        <span>Menú</span>
      </button>
    </div>
  );
};
