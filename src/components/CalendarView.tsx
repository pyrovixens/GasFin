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
  CreditCard,
  Bell,
  BellRing,
  Trash2,
  Edit3,
  Check,
  CalendarCheck,
  AlertTriangle,
  Layers,
  X
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { ScheduledPayment, ScheduledRecurrence } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES } from '../data/initialData';

export const CalendarView: React.FC = () => {
  const { 
    transactions, 
    debts, 
    goals, 
    scheduledPayments,
    addScheduledPayment,
    updateScheduledPayment,
    deleteScheduledPayment,
    markScheduledPaymentAsPaid,
    notificationPermission,
    requestPushPermission,
    testPushNotification,
    formatMoney, 
    formatInputLive,
    parseRawFromDisplay,
    openTransactionModal,
    openDebtModal,
    currentCurrency
  } = useFinancial();

  // Tab: 'calendar' vs 'scheduled_list'
  const [activeTab, setActiveTab] = useState<'calendar' | 'scheduled_list'>('calendar');

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  // Filter for scheduled payments list
  const [listFilter, setListFilter] = useState<'all' | 'due_soon' | 'overdue' | 'paid'>('all');

  // Modal State for Scheduled Payment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ScheduledPayment | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAmountInput, setFormAmountInput] = useState('');
  const [formCategory, setFormCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0] || 'Servicios Básicos & Hogar');
  const [formDueDate, setFormDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formRecurrence, setFormRecurrence] = useState<ScheduledRecurrence>('monthly');
  const [formNotifyDays, setFormNotifyDays] = useState<number>(5);
  const [formAutoPush, setFormAutoPush] = useState<boolean>(true);
  const [formNotes, setFormNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 = Mon, 6 = Sun

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayMidnight = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }, []);

  // Calculate days difference helper
  const getDaysUntil = (dueDateStr: string) => {
    if (!dueDateStr) return 0;
    const [y, m, d] = dueDateStr.split('-').map(Number);
    const dueMidnight = new Date(y, m - 1, d).getTime();
    return Math.ceil((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
  };

  // Group items by day of the current month
  const itemsByDay = useMemo(() => {
    const map: Record<number, {
      incomes: number;
      expenses: number;
      txs: typeof transactions;
      dueDebts: typeof debts;
      targetGoals: typeof goals;
      scheduled: ScheduledPayment[];
    }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = {
        incomes: 0,
        expenses: 0,
        txs: [],
        dueDebts: [],
        targetGoals: [],
        scheduled: []
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

    // Map debt due dates
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

    // Map scheduled payments
    scheduledPayments.forEach(sp => {
      if (sp.dueDate && sp.dueDate.startsWith(prefix)) {
        const dayNum = parseInt(sp.dueDate.split('-')[2], 10);
        if (map[dayNum]) {
          map[dayNum].scheduled.push(sp);
        }
      }
    });

    return map;
  }, [transactions, debts, goals, scheduledPayments, year, month, daysInMonth]);

  // Selected Day Details
  const selectedDayData = itemsByDay[selectedDay] || {
    incomes: 0,
    expenses: 0,
    txs: [],
    dueDebts: [],
    targetGoals: [],
    scheduled: []
  };

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  // Analyze upcoming and overdue scheduled payments
  const analyzedPayments = useMemo(() => {
    return scheduledPayments.map(p => {
      const diff = getDaysUntil(p.dueDate);
      const isPaid = p.status === 'paid';
      const isOverdue = !isPaid && diff < 0;
      const isDueToday = !isPaid && diff === 0;
      const isDueSoon = !isPaid && diff > 0 && diff <= (p.notifyDaysBefore ?? 5);

      return {
        ...p,
        diffDays: diff,
        isPaid,
        isOverdue,
        isDueToday,
        isDueSoon,
      };
    }).sort((a, b) => a.diffDays - b.diffDays);
  }, [scheduledPayments, todayMidnight]);

  // Filtered payments for the list tab
  const filteredPayments = useMemo(() => {
    return analyzedPayments.filter(p => {
      if (listFilter === 'due_soon') return p.isDueSoon || p.isDueToday;
      if (listFilter === 'overdue') return p.isOverdue;
      if (listFilter === 'paid') return p.isPaid;
      return true;
    });
  }, [analyzedPayments, listFilter]);

  // Urgent alerts for top banner
  const urgentPayments = useMemo(() => {
    return analyzedPayments.filter(p => !p.isPaid && (p.isOverdue || p.isDueToday || p.diffDays <= (p.notifyDaysBefore ?? 5)));
  }, [analyzedPayments]);

  // Modal Handlers
  const handleOpenAddModal = (initialDate?: string) => {
    setEditingPayment(null);
    setFormTitle('');
    setFormAmountInput('');
    setFormCategory(DEFAULT_EXPENSE_CATEGORIES[0] || 'Servicios Básicos & Hogar');
    setFormDueDate(initialDate || todayStr);
    setFormRecurrence('monthly');
    setFormNotifyDays(5);
    setFormAutoPush(true);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (payment: ScheduledPayment) => {
    setEditingPayment(payment);
    setFormTitle(payment.title);
    setFormAmountInput(formatInputLive(payment.amount));
    setFormCategory(payment.category);
    setFormDueDate(payment.dueDate);
    setFormRecurrence(payment.recurrence);
    setFormNotifyDays(payment.notifyDaysBefore ?? 5);
    setFormAutoPush(payment.autoNotifyPush ?? true);
    setFormNotes(payment.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmt = parseRawFromDisplay(formAmountInput);
    if (!formTitle.trim() || rawAmt <= 0) return;

    if (editingPayment) {
      updateScheduledPayment(editingPayment.id, {
        title: formTitle.trim(),
        amount: rawAmt,
        category: formCategory,
        dueDate: formDueDate,
        recurrence: formRecurrence,
        notifyDaysBefore: formNotifyDays,
        autoNotifyPush: formAutoPush,
        notes: formNotes.trim(),
      });
    } else {
      addScheduledPayment({
        title: formTitle.trim(),
        amount: rawAmt,
        category: formCategory,
        dueDate: formDueDate,
        recurrence: formRecurrence,
        notifyDaysBefore: formNotifyDays,
        autoNotifyPush: formAutoPush,
        status: 'pending',
        notes: formNotes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. TOP HEADER & TABS */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow-indigo flex-shrink-0">
              <CalendarIcon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Calendario & Gastos Programados</h2>
                {notificationPermission === 'granted' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Recordatorios Push Activos
                  </span>
                ) : (
                  <button
                    onClick={() => requestPushPermission()}
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-colors"
                  >
                    <BellRing size={11} />
                    Activar Notificaciones Push
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Registra tus cuentas y gastos con recordatorios automáticos 5 días antes o en la fecha de vencimiento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarIcon size={14} />
                <span>Vista Calendario</span>
              </button>
              <button
                onClick={() => setActiveTab('scheduled_list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'scheduled_list'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>Gastos Programados ({scheduledPayments.length})</span>
              </button>
            </div>

            {/* Test Notification Button */}
            <button
              onClick={() => testPushNotification()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors"
              title="Probar notificación push ahora"
            >
              <Bell size={16} />
            </button>

            {/* Add Scheduled Payment Button */}
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Programar Gasto</span>
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC EARLY WARNING ALERT BANNER */}
        {urgentPayments.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 shadow-glow-amber">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0 animate-pulse">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>Tienes {urgentPayments.length} {urgentPayments.length === 1 ? 'cuenta o gasto por vencer' : 'cuentas o gastos por vencer'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                      ALERTA ACTIVA
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Notificaciones automáticas activadas con anticipación de 5 días para evitar atrasos.
                  </p>
                </div>
              </div>

              {/* Quick Action Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {urgentPayments.slice(0, 3).map(p => (
                  <div 
                    key={p.id}
                    className="p-2 px-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-2.5 flex-shrink-0"
                  >
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[130px]">{p.title}</p>
                      <p className="text-[10px] font-mono text-amber-300">
                        {formatMoney(p.amount)} • {p.diffDays === 0 ? '¡Hoy!' : p.diffDays < 0 ? `Vencido hace ${Math.abs(p.diffDays)}d` : `En ${p.diffDays} días`}
                      </p>
                    </div>
                    <button
                      onClick={() => markScheduledPaymentAsPaid(p.id, true)}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors"
                      title="Pagar y registrar gasto"
                    >
                      Pagar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* TAB 1: VISUAL MONTHLY CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          
          {/* Month Navigation Header */}
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                Hoy
              </button>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                Día seleccionado: <strong>{selectedDay} de {monthNames[month]} {year}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 font-black text-sm text-white min-w-[150px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Grid Layout: Calendar (2 cols) & Day Details (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Calendar Grid (2 Columns) */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
              
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-slate-400 pb-2 border-b border-slate-800 uppercase tracking-wider">
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

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const data = itemsByDay[day];
                  const isSelected = selectedDay === day;
                  const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                  const hasIncome = data.incomes > 0;
                  const hasExpense = data.expenses > 0;
                  const hasDebts = data.dueDebts.length > 0;
                  const hasScheduled = data.scheduled.length > 0;

                  return (
                    <div
                      key={`day-${day}`}
                      onClick={() => setSelectedDay(day)}
                      className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-glow-emerald ring-1 ring-emerald-500'
                          : isToday
                          ? 'bg-slate-800/90 border-indigo-500/60'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black rounded-lg px-1.5 py-0.5 ${
                          isToday ? 'bg-indigo-500 text-white' : isSelected ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                        }`}>
                          {day}
                        </span>

                        <div className="flex items-center gap-1">
                          {hasScheduled && (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-indigo-400/30 animate-pulse" title="Gasto Programado" />
                          )}
                          {hasDebts && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30" title="Vencimiento de Deuda" />
                          )}
                        </div>
                      </div>

                      {/* Summary Indicators */}
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
                        {hasScheduled && (
                          <div className="font-bold text-indigo-300 truncate flex items-center gap-0.5">
                            <Clock size={10} className="text-indigo-400 flex-shrink-0" />
                            <span>{data.scheduled.length} prog.</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Selected Day Details Panel (1 Column) */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Detalle del Día</span>
                    <h3 className="text-lg font-black text-white">
                      {selectedDay} de {monthNames[month]}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAddModal(selectedDateStr)}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-colors"
                      title="Programar gasto en este día"
                    >
                      <Bell size={16} />
                    </button>
                    <button
                      onClick={() => openTransactionModal('expense', { date: selectedDateStr } as any)}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      title="Añadir movimiento manual"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Day Summary Totals */}
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

                {/* Items List of this day */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  
                  {/* Scheduled Payments on this day */}
                  {selectedDayData.scheduled.map(sp => (
                    <div 
                      key={sp.id} 
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        sp.status === 'paid' 
                          ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75' 
                          : 'bg-indigo-950/30 border-indigo-500/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <BellRing size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-xs text-white">{sp.title}</p>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                              Avisa {sp.notifyDaysBefore}d antes
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-indigo-300">{formatMoney(sp.amount)} • {sp.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {sp.status !== 'paid' ? (
                          <button
                            onClick={() => markScheduledPaymentAsPaid(sp.id, true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold shadow-sm"
                          >
                            Pagar
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <Check size={12} /> Pagado
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(sp)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

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

                  {/* Real Transactions */}
                  {selectedDayData.txs.map(t => (
                    <div key={t.id} className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {t.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
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
                  ))}

                  {selectedDayData.txs.length === 0 && selectedDayData.dueDebts.length === 0 && selectedDayData.scheduled.length === 0 && (
                    <div className="py-8 text-center space-y-1">
                      <CalendarCheck size={28} className="mx-auto text-slate-600" />
                      <p className="text-xs text-slate-500">
                        No hay movimientos ni vencimientos programados para este día.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Bell size={14} />
                  <span>Programar Pago con Aviso 5 Días</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED EXPENSES & REMINDERS LIST */}
      {activeTab === 'scheduled_list' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setListFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  listFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({scheduledPayments.length})
              </button>
              <button
                onClick={() => setListFilter('due_soon')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  listFilter === 'due_soon' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                ⚠️ Próximos a Vencer (≤ 5 Días)
              </button>
              <button
                onClick={() => setListFilter('overdue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  listFilter === 'overdue' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                🚨 Vencidos
              </button>
              <button
                onClick={() => setListFilter('paid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  listFilter === 'paid' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                ✓ Pagados
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Total programado mensual: <strong className="text-white font-mono">{formatMoney(scheduledPayments.reduce((acc, p) => acc + p.amount, 0))}</strong>
            </span>
          </div>

          {/* Cards Grid */}
          {filteredPayments.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Clock size={36} className="mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">No hay gastos programados</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No tienes gastos programados registrados. Agrega tus cuentas para que GastFin te recuerde 5 días antes de cada vencimiento.
              </p>
              <button
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Programar Mi Primer Gasto</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPayments.map(p => {
                return (
                  <div
                    key={p.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      p.isPaid
                        ? 'bg-slate-900/40 border-slate-800 opacity-80'
                        : p.isOverdue
                        ? 'bg-gradient-to-b from-rose-950/30 to-slate-900 border-rose-500/50 shadow-glow-rose'
                        : p.isDueToday || p.isDueSoon
                        ? 'bg-gradient-to-b from-amber-950/30 to-slate-900 border-amber-500/50 shadow-glow-amber'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Badge and Status Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          p.isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.isOverdue
                            ? 'bg-rose-500 text-white'
                            : p.isDueToday
                            ? 'bg-amber-500 text-slate-950'
                            : p.isDueSoon
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {p.isPaid
                            ? '✓ Pagado'
                            : p.isOverdue
                            ? `🚨 Vencido hace ${Math.abs(p.diffDays)}d`
                            : p.isDueToday
                            ? '⚠️ ¡VENCE HOY!'
                            : `Vence en ${p.diffDays} días`}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Editar gasto programado"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el gasto programado "${p.title}"?`)) {
                                deleteScheduledPayment(p.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Eliminar gasto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Main Title & Amount */}
                      <h4 className="text-base font-bold text-white">{p.title}</h4>
                      <span className="text-xs text-slate-400">{p.category}</span>

                      {/* Complete Clean Information Card */}
                      <div className="mt-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Monto a Pagar:</span>
                          <span className="font-extrabold text-emerald-400 font-mono text-sm">{formatMoney(p.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Fecha de Vencimiento:</span>
                          <span className="font-bold text-white font-mono">{p.dueDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Frecuencia:</span>
                          <span className="font-semibold text-indigo-300 capitalize">
                            {p.recurrence === 'monthly' ? 'Mensual' : p.recurrence === 'biweekly' ? 'Quincenal' : p.recurrence === 'weekly' ? 'Semanal' : p.recurrence === 'yearly' ? 'Anual' : 'Una sola vez'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-700/50">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Bell size={12} className="text-amber-400" />
                            Recordatorio Push:
                          </span>
                          <span className="font-bold text-amber-300">
                            {p.autoNotifyPush ? `Avisa ${p.notifyDaysBefore ?? 5} días antes` : 'Desactivado'}
                          </span>
                        </div>
                        {p.notes && (
                          <div className="pt-1.5 border-t border-slate-700/50">
                            <span className="text-slate-400 block text-[10px]">Notas de Pago:</span>
                            <span className="text-slate-200 text-[11px] break-words">{p.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {p.status !== 'paid' ? (
                        <button
                          onClick={() => markScheduledPaymentAsPaid(p.id, true)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check size={15} strokeWidth={2.5} />
                          <span>Pagar y Registrar Gasto</span>
                        </button>
                      ) : (
                        <div className="py-2 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          ✓ Al día (Próximo ciclo listo)
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 3. MODAL: CREATE / EDIT SCHEDULED EXPENSE (SIMPLE, CLEAR & COMPREHENSIVE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <BellRing size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingPayment ? 'Editar Gasto Programado' : 'Programar Gasto / Cuenta'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ingresa los datos para recibir alertas antes del vencimiento.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Gasto o Proveedor <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Arriendo, Plan Celular, Dividendo, Luz, Agua..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {/* Amount with Live Dot Formatting */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto a Pagar ({currentCurrency.symbol}) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={formAmountInput}
                  onChange={(e) => setFormAmountInput(formatInputLive(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {DEFAULT_EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fecha de Vencimiento <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Recurrence Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Frecuencia de Pago</label>
                <select
                  value={formRecurrence}
                  onChange={(e) => setFormRecurrence(e.target.value as ScheduledRecurrence)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="monthly">Mensual (Se repite cada mes)</option>
                  <option value="biweekly">Quincenal (Cada 14 días)</option>
                  <option value="weekly">Semanal (Cada 7 días)</option>
                  <option value="yearly">Anual (Cada año)</option>
                  <option value="once">Una sola vez (Sin repetición)</option>
                </select>
              </div>

              {/* Push Notification Anticipation Settings */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-white">Recordatorio de Vencimiento</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formAutoPush}
                      onChange={(e) => setFormAutoPush(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {formAutoPush && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Avisar con anticipación de:</label>
                    <select
                      value={formNotifyDays}
                      onChange={(e) => setFormNotifyDays(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value={5}>5 días antes (Recomendado)</option>
                      <option value={3}>3 días antes</option>
                      <option value={1}>1 día antes</option>
                      <option value={0}>El mismo día del vencimiento</option>
                      <option value={7}>7 días antes (1 semana)</option>
                      <option value={10}>10 días antes</option>
                      <option value={15}>15 días antes</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas de Pago (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Código de cliente, link de pago o detalles..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
                >
                  {editingPayment ? 'Guardar Cambios' : 'Guardar Gasto Programado'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
