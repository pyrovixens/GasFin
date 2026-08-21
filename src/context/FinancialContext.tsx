import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Transaction, 
  Debt, 
  Goal, 
  SavingsTip, 
  CurrencyConfig, 
  FinancialMetrics, 
  ActiveView 
} from '../types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_DEBTS, 
  INITIAL_GOALS, 
  INITIAL_SAVINGS_TIPS, 
  SUPPORTED_CURRENCIES 
} from '../data/initialData';

export const MOTIVATIONAL_QUOTES = [
  "«Cada peso bien administrado hoy es un paso firme hacia tu libertad financiera.»",
  "«La disciplina financiera convierte tus metas y proyectos en realidades alcanzables.»",
  "«El éxito no es solo cuánto ganas, sino cuánto conservas y haces crecer inteligentemente.»",
  "«Un presupuesto claro y controlado es el mapa hacia tus mayores triunfos económicos.»",
  "«Controla tus gastos antes de que ellos controlen tus decisiones futuras.»",
  "«El ahorro constante es el motor que impulsa tu tranquilidad y crecimiento empresarial.»"
];

interface FinancialContextType {
  // Navigation & UI
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // User Profile & Personalized Greeting
  userName: string;
  setUserName: (name: string) => void;
  motivationalQuote: string;

  // Currency & Permanent Selection
  currentCurrency: CurrencyConfig;
  setCurrency: (code: string) => void;
  isCurrencySetupModalOpen: boolean;
  setIsCurrencySetupModalOpen: (open: boolean) => void;
  lockAndSetCurrencyAndName: (code: string, name: string) => void;
  unlockCurrencySelector: () => void;
  formatMoney: (amount: number, overrideSymbol?: string) => string;
  formatPercent: (value: number) => string;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Debts
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  makeDebtPayment: (id: string, amount: number) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  // Savings Tips
  savingsTips: SavingsTip[];
  toggleSavingsTip: (id: string) => void;
  addSavingsTip: (tip: Omit<SavingsTip, 'id'>) => void;

  // Calculated Metrics
  metrics: FinancialMetrics;
  
  // Floating Transaction Modal / Drawer
  isTransactionModalOpen: boolean;
  openTransactionModal: (type?: 'income' | 'expense', initialData?: Transaction) => void;
  closeTransactionModal: () => void;
  isTransactionMinimized: boolean;
  toggleTransactionMinimized: () => void;
  editingTransaction: Transaction | null;
  
  isDeficitModalOpen: boolean;
  setIsDeficitModalOpen: (open: boolean) => void;

  isDebtModalOpen: boolean;
  openDebtModal: (debt?: Debt) => void;
  closeDebtModal: () => void;
  editingDebt: Debt | null;

  isGoalModalOpen: boolean;
  openGoalModal: (goal?: Goal) => void;
  closeGoalModal: () => void;
  editingGoal: Goal | null;

  // System actions & Excel Export
  clearAllDataToZero: () => void;
  resetToDemoData: () => void;
  exportDataAsJSON: () => void;
  exportDataToExcel: () => void;
  importDataFromJSON: (jsonData: string) => boolean;
  triggerCelebration: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_NAME: 'gastfin_user_name_v3',
  TRANSACTIONS: 'gastfin_transactions_v3_store',
  DEBTS: 'gastfin_debts_v3_store',
  GOALS: 'gastfin_goals_v3_store',
  SAVINGS_TIPS: 'gastfin_savings_tips_v3_store',
  CURRENCY: 'gastfin_currency_v3_store',
  CURRENCY_LOCKED: 'gastfin_currency_locked_v3',
  THEME: 'gastfin_theme_v3_store',
  SIDEBAR: 'gastfin_sidebar_collapsed_v3',
};

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User name
  const [userName, setUserNameState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    return saved || '';
  });

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  };

  // Motivational quote of the session
  const motivationalQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Active View
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Currency & Lock state
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(() => {
    const savedCode = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
    return found || SUPPORTED_CURRENCIES[0]; // Default CLP/USD
  });

  const [isCurrencySetupModalOpen, setIsCurrencySetupModalOpen] = useState<boolean>(() => {
    const isLocked = localStorage.getItem(STORAGE_KEYS.CURRENCY_LOCKED);
    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    return isLocked !== 'true' || !savedName; // Open on first launch to ask user for name & currency
  });

  // Data collections
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [savingsTips, setSavingsTips] = useState<SavingsTip[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS_TIPS);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_TIPS;
  });

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransactionMinimized, setIsTransactionMinimized] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isDeficitModalOpen, setIsDeficitModalOpen] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_TIPS, JSON.stringify(savingsTips));
  }, [savingsTips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currentCurrency.code);
  }, [currentCurrency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const setCurrency = (code: string) => {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (found) setCurrentCurrency(found);
  };

  const lockAndSetCurrencyAndName = (code: string, name: string) => {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrentCurrency(found);
      localStorage.setItem(STORAGE_KEYS.CURRENCY, found.code);
      localStorage.setItem(STORAGE_KEYS.CURRENCY_LOCKED, 'true');
      if (name.trim()) {
        setUserName(name.trim());
      }
      setIsCurrencySetupModalOpen(false);
      triggerCelebration();
    }
  };

  const unlockCurrencySelector = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENCY_LOCKED);
    setIsCurrencySetupModalOpen(true);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6366F1', '#3B82F6', '#F59E0B', '#EC4899']
      });
    } catch {
      // ignore
    }
  };

  // Custom Amount Formatter
  const formatMoney = (amount: number, overrideSymbol?: string) => {
    const symbol = overrideSymbol !== undefined ? overrideSymbol : currentCurrency.symbol;
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);

    let formattedNumber = '';

    if (currentCurrency.code === 'CLP' || currentCurrency.code === 'COP') {
      const hasDecimals = absVal % 1 !== 0;
      if (hasDecimals) {
        const parts = absVal.toFixed(2).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        formattedNumber = `${integerPart},${parts[1]}`;
      } else {
        formattedNumber = Math.round(absVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
    }

    if (currentCurrency.code === 'EUR') {
      const parts = absVal.toFixed(2).split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formattedNumber = `${integerPart},${parts[1]}`;
      return `${isNegative ? '-' : ''}${formattedNumber} ${symbol}`;
    }

    if (currentCurrency.code === 'ARS') {
      const parts = absVal.toFixed(2).split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formattedNumber = `${integerPart},${parts[1]}`;
      return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
    }

    const parts = absVal.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedNumber = `${integerPart}.${parts[1]}`;
    return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Metrics
  const metrics = useMemo<FinancialMetrics>(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);

    const netCashFlow = totalIncome - totalExpense;
    
    const savingsRate = totalIncome > 0 
      ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) 
      : 0;

    const totalDebt = debts.reduce((acc, d) => acc + d.remainingAmount, 0);
    const monthlyDebtObligation = debts.reduce((acc, d) => acc + d.minimumPayment, 0);

    const isDeficit = totalExpense > totalIncome && totalExpense > 0;
    const deficitAmount = isDeficit ? totalExpense - totalIncome : 0;
    const liquidityRatio = totalExpense > 0 ? totalIncome / totalExpense : (totalIncome > 0 ? 1 : 0);
    
    const runwayMonths = totalExpense > 0 
      ? Number((Math.max(0, netCashFlow + (totalIncome * 2)) / totalExpense).toFixed(1)) 
      : 0;

    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      savingsRate,
      totalDebt,
      monthlyDebtObligation,
      isDeficit,
      deficitAmount,
      liquidityRatio,
      runwayMonths,
    };
  }, [transactions, debts]);

  // Transaction CRUD
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newTx: Transaction = {
      ...tx,
      date: tx.date || now.toISOString().split('T')[0],
      time: tx.time || currentTimeStr,
      createdAt: tx.createdAt || now.toISOString(),
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    triggerCelebration();
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Debt CRUD
  const addDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: `debt-${Date.now()}`,
    };
    setDebts(prev => [...prev, newDebt]);
    triggerCelebration();
  };

  const updateDebt = (id: string, updated: Partial<Debt>) => {
    setDebts(prev => prev.map(d => (d.id === id ? { ...d, ...updated } : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const makeDebtPayment = (id: string, amount: number) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const newRemaining = Math.max(0, d.remainingAmount - amount);
        return {
          ...d,
          remainingAmount: newRemaining,
        };
      }
      return d;
    }));

    const targetDebt = debts.find(d => d.id === id);
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (targetDebt) {
      addTransaction({
        type: 'expense',
        amount: amount,
        category: 'Amortización de Deuda',
        description: `Abono a deuda: ${targetDebt.name}`,
        date: now.toISOString().split('T')[0],
        time: currentTimeStr,
        createdAt: now.toISOString(),
        paymentMethod: 'transfer',
        status: 'completed',
        isRecurring: false,
        tags: ['Deuda', 'Amortización'],
      });
    }
  };

  // Goal CRUD
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals(prev => [...prev, newGoal]);
    triggerCelebration();
  };

  const updateGoal = (id: string, updated: Partial<Goal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const newAmount = g.currentAmount + amount;
        return {
          ...g,
          currentAmount: newAmount,
        };
      }
      return g;
    }));

    const targetGoal = goals.find(g => g.id === id);
    if (targetGoal) {
      addTransaction({
        type: 'expense',
        amount: amount,
        category: 'Aporte a Metas',
        description: `Aporte a meta: ${targetGoal.title}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'transfer',
        status: 'completed',
        isRecurring: false,
        tags: ['Ahorro', 'Meta'],
      });
    }
  };

  // Savings Tips Actions
  const toggleSavingsTip = (id: string) => {
    setSavingsTips(prev => prev.map(tip => {
      if (tip.id === id) {
        const updated = !tip.isApplied;
        if (updated) triggerCelebration();
        return { ...tip, isApplied: updated };
      }
      return tip;
    }));
  };

  const addSavingsTip = (tip: Omit<SavingsTip, 'id'>) => {
    const newTip: SavingsTip = {
      ...tip,
      id: `tip-${Date.now()}`,
    };
    setSavingsTips(prev => [newTip, ...prev]);
    triggerCelebration();
  };

  // Modals
  const openTransactionModal = (_defaultType: 'income' | 'expense' = 'expense', initialData?: Transaction) => {
    setEditingTransaction(initialData || null);
    setIsTransactionModalOpen(true);
    setIsTransactionMinimized(false);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
    setIsTransactionMinimized(false);
  };

  const toggleTransactionMinimized = () => {
    setIsTransactionMinimized(prev => !prev);
  };

  const openDebtModal = (debt?: Debt) => {
    setEditingDebt(debt || null);
    setIsDebtModalOpen(true);
  };

  const closeDebtModal = () => {
    setIsDebtModalOpen(false);
    setEditingDebt(null);
  };

  const openGoalModal = (goal?: Goal) => {
    setEditingGoal(goal || null);
    setIsGoalModalOpen(true);
  };

  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const clearAllDataToZero = () => {
    setTransactions([]);
    setDebts([]);
    setGoals([]);
    setSavingsTips([]);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS_TIPS);
    triggerCelebration();
  };

  const resetToDemoData = () => {
    clearAllDataToZero();
  };

  const exportDataAsJSON = () => {
    const exportBundle = {
      exportedAt: new Date().toISOString(),
      userName: userName || 'Usuario GastFin',
      version: '3.0.0',
      currency: currentCurrency.code,
      transactions,
      debts,
      goals,
      savingsTips,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gastfin_respaldo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to Excel / CSV with UTF-8 BOM
  const exportDataToExcel = () => {
    const lines: string[] = [];

    // Header & User Info
    lines.push(`REPORTE FINANCIERO EJECUTIVO - GASTFIN`);
    lines.push(`Usuario:;${userName || 'Usuario'}`);
    lines.push(`Fecha de Exportación:;${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
    lines.push(`Moneda Principal:;${currentCurrency.code} (${currentCurrency.name})`);
    lines.push(``);

    // Executive KPI Summary
    lines.push(`RESUMEN GENERAL`);
    lines.push(`Métrica;Monto / Valor`);
    lines.push(`Ingresos Totales;${metrics.totalIncome}`);
    lines.push(`Gastos Totales;${metrics.totalExpense}`);
    lines.push(`Flujo Neto;${metrics.netCashFlow}`);
    lines.push(`Tasa de Ahorro;${metrics.savingsRate.toFixed(1)}%`);
    lines.push(`Deuda Total Activa;${metrics.totalDebt}`);
    lines.push(`Cuotas Mínimas Mensuales;${metrics.monthlyDebtObligation}`);
    lines.push(``);

    // Transactions Table
    lines.push(`LIBRO DE INGRESOS Y GASTOS`);
    lines.push(`ID;Tipo;Fecha;Hora;Concepto;Categoría;Monto;Método de Pago;Estado`);
    transactions.forEach(t => {
      lines.push(`${t.id};${t.type === 'income' ? 'Ingreso (+)' : 'Gasto (-)'};${t.date};${t.time || '12:00'};"${t.description.replace(/"/g, '""')}";${t.category};${t.amount};${t.paymentMethod};${t.status}`);
    });
    lines.push(``);

    // Debts Table
    lines.push(`REGISTRO DE DEUDAS`);
    lines.push(`ID;Nombre / Crédito;Acreedor;Saldo Pendiente;Tasa APR (%);Cuota Mínima;Fecha Límite`);
    debts.forEach(d => {
      lines.push(`${d.id};"${d.name.replace(/"/g, '""')}";"${d.creditor.replace(/"/g, '""')}";${d.remainingAmount};${d.interestRate}%;${d.minimumPayment};${d.dueDate}`);
    });
    lines.push(``);

    // Goals Table
    lines.push(`METAS Y FONDOS FINANCIEROS`);
    lines.push(`ID;Meta;Monto Objetivo;Ahorro Actual;% Progreso;Fecha Límite`);
    goals.forEach(g => {
      const pct = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(0) : 0;
      lines.push(`${g.id};"${g.title.replace(/"/g, '""')}";${g.targetAmount};${g.currentAmount};${pct}%;${g.targetDate}`);
    });

    const csvContent = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `GastFin_Reporte_${userName ? userName.replace(/\s+/g, '_') : 'Finanzas'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    triggerCelebration();
  };

  const importDataFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.userName) setUserName(parsed.userName);
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.debts)) setDebts(parsed.debts);
      if (Array.isArray(parsed.goals)) setGoals(parsed.goals);
      if (Array.isArray(parsed.savingsTips)) setSavingsTips(parsed.savingsTips);
      if (parsed.currency) setCurrency(parsed.currency);
      triggerCelebration();
      return true;
    } catch (e) {
      console.error("Error importing data:", e);
      return false;
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        activeView,
        setActiveView,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isDarkMode,
        toggleDarkMode,
        userName,
        setUserName,
        motivationalQuote,
        currentCurrency,
        setCurrency,
        isCurrencySetupModalOpen,
        setIsCurrencySetupModalOpen,
        lockAndSetCurrencyAndName,
        unlockCurrencySelector,
        formatMoney,
        formatPercent,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        makeDebtPayment,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        savingsTips,
        toggleSavingsTip,
        addSavingsTip,
        metrics,
        isTransactionModalOpen,
        openTransactionModal,
        closeTransactionModal,
        isTransactionMinimized,
        toggleTransactionMinimized,
        editingTransaction,
        isDeficitModalOpen,
        setIsDeficitModalOpen,
        isDebtModalOpen,
        openDebtModal,
        closeDebtModal,
        editingDebt,
        isGoalModalOpen,
        openGoalModal,
        closeGoalModal,
        editingGoal,
        clearAllDataToZero,
        resetToDemoData,
        exportDataAsJSON,
        exportDataToExcel,
        importDataFromJSON,
        triggerCelebration,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
