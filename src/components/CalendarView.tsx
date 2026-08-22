import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  DollarSign,
  Target,
  CreditCard
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const CalendarView: React.FC = () => {
  const { 
    transactions, 
    debts, 
    goals, 
    formatMoney, 
    openTransactionModal,
    openDebtModal 
  } = useFinancial();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Convert Sunday (0) to Monday-based (0 = Mon, 6 = Sun)
  const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
  };

  // Group items by day of the current month
  const itemsByDay = useMemo(() => {
    const map: Record<number, {
      incomes: number;
      expenses: number;
      txs: typeof transactions;
      dueDebts: typeof debts;
      targetGoals: typeof goals;
    }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = {
        incomes: 0,
        expenses: 0,
        txs: [],
        dueDebts: [],
        targetGoals: []
      };
    }

    const currentMonthStr = String(month + 1).padStart(2, '0');
    const prefix = `${year}-${currentMonthStr}`;

    // Map transactions
    transactions.forEach(t => {
      if (t.date && t.date.startsWith(prefix)) {
        const dayNum = parseInt(t.date.split('-')[2], 10);
        if (map[dayNum]) {
          map[dayNum].txs.push(t);
          if (t.type === 'income') {
            map[dayNum].incomes += t.amount;
          } else {
            map[dayNum].expenses += t.amount;
          }
        }
      }
    });

    // Map debt due dates (match day of month)
    debts.forEach(d => {
      if (d.dueDate) {
        let dayNum = 1;
        if (d.dueDate.includes('-')) {
          dayNum = parseInt(d.dueDate.split('-')[2], 10);
        } else {
          dayNum = parseInt(d.dueDate, 10);
        }
        if (map[dayNum]) {
          map[dayNum].dueDebts.push(d);
        }
      }
    });

    // Map goal target dates
    goals.forEach(g => {
      if (g.targetDate && g.targetDate.startsWith(prefix)) {
        const dayNum = parseInt(g.targetDate.split('-')[2], 10);
        if (map[dayNum]) {
          map[dayNum].targetGoals.push(g);
        }
      }
    });

    return map;
  }, [transactions, debts, goals, year, month, daysInMonth]);

  // Selected Day Details
  const selectedDayData = itemsByDay[selectedDay] || {
    incomes: 0,
    expenses: 0,
    txs: [],
    dueDebts: [],
    targetGoals: []
  };

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  // Upcoming bills in the next 7 days
  const upcomingBills = useMemo(() => {
    const list: Array<{ title: string; amount: number; day: number; type: 'debt' | 'expense' }> = [];
    const todayNum = new Date().getDate();

    debts.forEach(d => {
      let dayNum = 1;
      if (d.dueDate && d.dueDate.includes('-')) {
        dayNum = parseInt(d.dueDate.split('-')[2], 10);
      }
      if (dayNum >= todayNum && dayNum <= todayNum + 7) {
        list.push({
          title: `Vencimiento: ${d.creditor}`,
          amount: d.minimumPayment || d.remainingAmount,
          day: dayNum,
          type: 'debt'
        });
      }
    });

    return list;
  }, [debts]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Month Navigation */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Calendario de Pagos y Cobros</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mira qué días cobras tu sueldo y qué días te toca pagar cuentas o cuotas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              Hoy
            </button>
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 font-extrabold text-sm text-white min-w-[140px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Bills Alert Bar */}
        {upcomingBills.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
              <span><strong>{upcomingBills.length} pagos próximos</strong> en los siguientes 7 días:</span>
            </div>
            <div className="flex items-center gap-3">
              {upcomingBills.slice(0, 2).map((bill, i) => (
                <span key={i} className="text-slate-300 font-mono">
                  {bill.title} ({formatMoney(bill.amount)}) día {bill.day}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Calendar Grid & Day Detail View (2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
          
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-800 uppercase tracking-wider">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span className="text-emerald-400">Sáb</span>
            <span className="text-emerald-400">Dom</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: startingDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20 sm:h-24 rounded-2xl bg-slate-950/30 border border-slate-900/50 opacity-20" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const data = itemsByDay[day];
              const isSelected = selectedDay === day;
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

              const hasIncome = data.incomes > 0;
              const hasExpense = data.expenses > 0;
              const hasDebts = data.dueDebts.length > 0;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-glow-emerald ring-1 ring-emerald-500'
                      : isToday
                      ? 'bg-slate-800/80 border-indigo-500/50'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black rounded-lg px-1.5 py-0.5 ${
                      isToday ? 'bg-indigo-500 text-white' : isSelected ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                    }`}>
                      {day}
                    </span>

                    {hasDebts && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Vencimiento de deuda" />
                    )}
                  </div>

                  {/* Indicator Pills */}
                  <div className="space-y-0.5 text-[10px]">
                    {hasIncome && (
                      <div className="font-mono font-bold text-emerald-400 truncate">
                        +{formatMoney(data.incomes)}
                      </div>
                    )}
                    {hasExpense && (
                      <div className="font-mono font-bold text-rose-400 truncate">
                        -{formatMoney(data.expenses)}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Day Details Panel */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Detalle del Día</span>
                <h3 className="text-lg font-black text-white">
                  {selectedDay} de {monthNames[month]}
                </h3>
              </div>

              <button
                onClick={() => openTransactionModal('expense', { date: selectedDateStr } as any)}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                title="Añadir movimiento en este día"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Day Summary Cards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-[10px] text-slate-400">Ingresos:</span>
                <p className="text-sm font-black text-emerald-400 mt-0.5">+{formatMoney(selectedDayData.incomes)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-[10px] text-slate-400">Gastos:</span>
                <p className="text-sm font-black text-rose-400 mt-0.5">-{formatMoney(selectedDayData.expenses)}</p>
              </div>
            </div>

            {/* List of items on this day */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              
              {/* Due Debts */}
              {selectedDayData.dueDebts.map(d => (
                <div key={d.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-amber-400" />
                    <div>
                      <p className="font-bold text-xs text-white">Vence: {d.creditor}</p>
                      <p className="text-[10px] text-amber-300">Pago mín: {formatMoney(d.minimumPayment || d.remainingAmount)}</p>
                    </div>
                  </div>
                  <button onClick={() => openDebtModal(d)} className="text-[10px] font-bold text-amber-400 hover:underline">
                    Ver
                  </button>
                </div>
              ))}

              {/* Transactions on this day */}
              {selectedDayData.txs.length === 0 && selectedDayData.dueDebts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No hay movimientos ni vencimientos programados para este día.
                </p>
              ) : (
                selectedDayData.txs.map(t => (
                  <div key={t.id} className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white truncate max-w-[120px]">{t.description}</p>
                        <p className="text-[10px] text-slate-400">{t.category}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-bold text-xs ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                    </span>
                  </div>
                ))
              )}

            </div>
          </div>

          <button
            onClick={() => openTransactionModal('income', { date: selectedDateStr } as any)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={15} />
            <span>Registrar Movimiento en este Día</span>
          </button>

        </div>

      </div>

    </div>
  );
};
