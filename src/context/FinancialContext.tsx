import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Transaction, 
  Debt, 
  Goal, 
  CategoryBudget,
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
  SUPPORTED_CURRENCIES,
  formatCurrencyInputLive,
  parseCurrencyInputRaw
} from '../data/initialData';
import { 
  supabase, 
  fetchUserDataFromSupabase, 
  subscribeToUserRealtimeChanges,
  syncTransactionToSupabase, 
  deleteTransactionFromSupabase, 
  syncDebtToSupabase, 
  deleteDebtFromSupabase, 
  syncGoalToSupabase, 
  deleteGoalFromSupabase, 
  syncBudgetToSupabase, 
  deleteBudgetFromSupabase, 
  syncFullDatasetToSupabase 
} from '../services/supabase';

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

  // Supabase Cloud Sync & Multi-user
  supabaseUser: any;
  isCloudConnected: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithSupabase: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logoutSupabase: () => Promise<void>;
  syncLocalToCloud: () => Promise<void>;

  // Currency & Permanent Selection
  currentCurrency: CurrencyConfig;
  setCurrency: (code: string) => void;
  lockAndSetCurrencyAndName: (code: string, name: string) => void;
  unlockCurrencySelector: () => void;
  isCurrencySetupModalOpen: boolean;
  setIsCurrencySetupModalOpen: (open: boolean) => void;

  // Formatter helpers
  formatMoney: (amount: number, overrideSymbol?: string) => string;
  formatPercent: (value: number) => string;
  formatInputLive: (valStr: string | number | undefined | null) => string;
  parseRawFromDisplay: (valStr: string | number | undefined | null) => number;

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

  // Category Budgets
  budgets: CategoryBudget[];
  addBudget: (budget: Omit<CategoryBudget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, updates: Partial<Omit<CategoryBudget, 'id' | 'createdAt'>> | number) => void;
  deleteBudget: (id: string) => void;

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

  // Receipt OCR Scanner Modal
  isReceiptScannerOpen: boolean;
  setIsReceiptScannerOpen: (open: boolean) => void;
  
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

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User name
  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem('gastfin_user_name_v6') || '';
  });

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('gastfin_user_name_v6', name);
  };

  // Motivational quote of the session
  const motivationalQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('gastfin_theme_v6');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('gastfin_sidebar_v6');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Active View
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Currency & Lock state
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(() => {
    const savedCode = localStorage.getItem('gastfin_currency_v6');
    const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
    return found || SUPPORTED_CURRENCIES[0]; // Default CLP/USD
  });

  const [isCurrencySetupModalOpen, setIsCurrencySetupModalOpen] = useState<boolean>(() => {
    const isLocked = localStorage.getItem('gastfin_curr_locked_v6');
    const savedName = localStorage.getItem('gastfin_user_name_v6');
    return isLocked !== 'true' || !savedName; // Open on first launch to ask user for alias & currency
  });

  // Data collections
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gastfin_tx_v6');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('gastfin_debts_v6');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('gastfin_goals_v6');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('gastfin_budgets_v6');
    return saved ? JSON.parse(saved) : [
      { id: 'b-1', category: 'Alimentación & Supermercado', limitAmount: 350000, period: 'monthly', createdAt: new Date().toISOString() },
      { id: 'b-2', category: 'Servicios Básicos & Hogar', limitAmount: 120000, period: 'monthly', createdAt: new Date().toISOString() },
      { id: 'b-3', category: 'Restaurantes & Salidas', limitAmount: 90000, period: 'monthly', createdAt: new Date().toISOString() },
      { id: 'b-4', category: 'Transporte & Combustible', limitAmount: 80000, period: 'monthly', createdAt: new Date().toISOString() },
      { id: 'b-5', category: 'Suscripciones & Ocio', limitAmount: 40000, period: 'monthly', createdAt: new Date().toISOString() },
    ];
  });

  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  
  // Supabase Cloud Sync State
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Load cloud data helper
  const loadCloudData = async (userId: string) => {
    try {
      const res = await fetchUserDataFromSupabase(userId);
      if (res.success && res.data) {
        if (res.data.transactions.length > 0) setTransactions(res.data.transactions);
        if (res.data.debts.length > 0) setDebts(res.data.debts);
        if (res.data.goals.length > 0) setGoals(res.data.goals);
        if (res.data.budgets.length > 0) setBudgets(res.data.budgets);
        if (res.data.profile?.display_name) setUserName(res.data.profile.display_name);
      }
    } catch (e) {
      console.warn('Cloud sync fetch error:', e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setIsCloudConnected(true);
        loadCloudData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setIsCloudConnected(true);
        loadCloudData(session.user.id);
      } else {
        setSupabaseUser(null);
        setIsCloudConnected(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime multi-device sync
  useEffect(() => {
    if (!supabaseUser?.id) return;
    const unsubscribe = subscribeToUserRealtimeChanges(supabaseUser.id, () => {
      loadCloudData(supabaseUser.id);
    });
    return () => unsubscribe();
  }, [supabaseUser]);

  const loginWithSupabase = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setSupabaseUser(data.user);
        setIsCloudConnected(true);
        await loadCloudData(data.user.id);
        triggerCelebration();
        return { success: true };
      }
      return { success: false, error: 'No se pudo iniciar sesión.' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const signupWithSupabase = async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || 'Usuario' }
        }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setSupabaseUser(data.user);
        setIsCloudConnected(true);
        if (displayName) setUserName(displayName);
        // Upload initial local data to the newly created user account
        await syncFullDatasetToSupabase(data.user.id, {
          transactions,
          debts,
          goals,
          budgets
        });
        triggerCelebration();
        return { success: true };
      }
      return { success: false, error: 'Error al crear cuenta.' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const logoutSupabase = async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setIsCloudConnected(false);
  };

  const syncLocalToCloud = async () => {
    if (!supabaseUser) return;
    await syncFullDatasetToSupabase(supabaseUser.id, {
      transactions,
      debts,
      goals,
      budgets
    });
    triggerCelebration();
  };

  const [savingsTips, setSavingsTips] = useState<SavingsTip[]>(() => {
    const saved = localStorage.getItem('gastfin_tips_v6');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_TIPS;
  });

  const addBudget = (budget: Omit<CategoryBudget, 'id' | 'createdAt'>) => {
    const newB: CategoryBudget = {
      ...budget,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBudgets(prev => [...prev.filter(b => b.category !== budget.category), newB]);
    if (supabaseUser) syncBudgetToSupabase(newB, supabaseUser.id);
    triggerCelebration();
  };

  const updateBudget = (id: string, updates: Partial<Omit<CategoryBudget, 'id' | 'createdAt'>> | number) => {
    setBudgets(prev => prev.map(b => {
      if (b.id === id) {
        const updated = typeof updates === 'number' ? { ...b, limitAmount: updates } : { ...b, ...updates };
        if (supabaseUser) syncBudgetToSupabase(updated, supabaseUser.id);
        return updated;
      }
      return b;
    }));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    if (supabaseUser) deleteBudgetFromSupabase(id, supabaseUser.id);
  };

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
    localStorage.setItem('gastfin_tx_v6', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('gastfin_debts_v6', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('gastfin_goals_v6', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('gastfin_tips_v6', JSON.stringify(savingsTips));
  }, [savingsTips]);

  useEffect(() => {
    localStorage.setItem('gastfin_budgets_v6', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('gastfin_currency_v6', currentCurrency.code);
  }, [currentCurrency]);

  useEffect(() => {
    localStorage.setItem('gastfin_sidebar_v6', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('gastfin_theme_v6', JSON.stringify(isDarkMode));
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
      localStorage.setItem('gastfin_currency_v6', found.code);
      localStorage.setItem('gastfin_curr_locked_v6', 'true');
      const cleanName = name.trim() || 'Usuario';
      setUserName(cleanName);
      setIsCurrencySetupModalOpen(false);
      triggerCelebration();
    }
  };

  const unlockCurrencySelector = () => {
    localStorage.removeItem('gastfin_curr_locked_v6');
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
  const formatMoney = (amount: number | undefined | null, overrideSymbol?: string) => {
    const symbol = overrideSymbol !== undefined ? overrideSymbol : (currentCurrency?.symbol || '$');
    const safeAmount = (amount === undefined || amount === null || isNaN(Number(amount))) ? 0 : Number(amount);
    const isNegative = safeAmount < 0;
    const absVal = Math.abs(safeAmount);

    let formattedNumber = '';

    if (currentCurrency?.code === 'CLP' || currentCurrency?.code === 'COP') {
      const hasDecimals = absVal % 1 !== 0;
      if (hasDecimals) {
        const parts = absVal.toFixed(2).split('.');
        const integerPart = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        formattedNumber = `${integerPart},${parts[1] || '00'}`;
      } else {
        formattedNumber = Math.round(absVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
    }

    if (currentCurrency?.code === 'EUR') {
      const parts = absVal.toFixed(2).split('.');
      const integerPart = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formattedNumber = `${integerPart},${parts[1] || '00'}`;
      return `${isNegative ? '-' : ''}${formattedNumber} ${symbol}`;
    }

    if (currentCurrency?.code === 'ARS') {
      const parts = absVal.toFixed(2).split('.');
      const integerPart = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formattedNumber = `${integerPart},${parts[1] || '00'}`;
      return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
    }

    const parts = absVal.toFixed(2).split('.');
    const integerPart = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedNumber = `${integerPart}.${parts[1] || '00'}`;
    return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatInputLive = (valStr: string | number | undefined | null) => {
    return formatCurrencyInputLive(valStr, currentCurrency?.code || 'CLP');
  };

  const parseRawFromDisplay = (valStr: string | number | undefined | null) => {
    return parseCurrencyInputRaw(valStr, currentCurrency?.code || 'CLP');
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
    if (supabaseUser) syncTransactionToSupabase(newTx, supabaseUser.id);
    triggerCelebration();
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const res = { ...t, ...updated };
        if (supabaseUser) syncTransactionToSupabase(res, supabaseUser.id);
        return res;
      }
      return t;
    }));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (supabaseUser) deleteTransactionFromSupabase(id, supabaseUser.id);
  };

  // Debt CRUD
  const addDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: `debt-${Date.now()}`,
    };
    setDebts(prev => [...prev, newDebt]);
    if (supabaseUser) syncDebtToSupabase(newDebt, supabaseUser.id);
    triggerCelebration();
  };

  const updateDebt = (id: string, updated: Partial<Debt>) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const res = { ...d, ...updated };
        if (supabaseUser) syncDebtToSupabase(res, supabaseUser.id);
        return res;
      }
      return d;
    }));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    if (supabaseUser) deleteDebtFromSupabase(id, supabaseUser.id);
  };

  const makeDebtPayment = (id: string, amount: number) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const newRemaining = Math.max(0, d.remainingAmount - amount);
        const updated = {
          ...d,
          remainingAmount: newRemaining,
        };
        if (supabaseUser) syncDebtToSupabase(updated, supabaseUser.id);
        return updated;
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
    if (supabaseUser) syncGoalToSupabase(newGoal, supabaseUser.id);
    triggerCelebration();
  };

  const updateGoal = (id: string, updated: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const res = { ...g, ...updated };
        if (supabaseUser) syncGoalToSupabase(res, supabaseUser.id);
        return res;
      }
      return g;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (supabaseUser) deleteGoalFromSupabase(id, supabaseUser.id);
  };

  const contributeToGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const newAmount = g.currentAmount + amount;
        const updated = {
          ...g,
          currentAmount: newAmount,
        };
        if (supabaseUser) syncGoalToSupabase(updated, supabaseUser.id);
        return updated;
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

    // CSV Formula Injection & Quotes Sanitizer
    const sanitizeCsvField = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      let str = String(val).replace(/"/g, '""');
      // Escape leading formula characters (=, +, -, @, tab, CR)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    // Transactions Table
    lines.push(`LIBRO DE INGRESOS Y GASTOS`);
    lines.push(`ID;Tipo;Fecha;Hora;Concepto;Categoría;Monto;Método de Pago;Estado`);
    transactions.forEach(t => {
      lines.push(`${t.id};${t.type === 'income' ? 'Ingreso (+)' : 'Gasto (-)'};${t.date};${t.time || '12:00'};${sanitizeCsvField(t.description)};${sanitizeCsvField(t.category)};${t.amount};${t.paymentMethod};${t.status}`);
    });
    lines.push(``);

    // Debts Table
    lines.push(`REGISTRO DE DEUDAS`);
    lines.push(`ID;Nombre / Crédito;Acreedor;Saldo Pendiente;Tasa APR (%);Cuota Mínima;Fecha Límite`);
    debts.forEach(d => {
      lines.push(`${d.id};${sanitizeCsvField(d.name)};${sanitizeCsvField(d.creditor)};${d.remainingAmount};${d.interestRate}%;${d.minimumPayment};${d.dueDate}`);
    });
    lines.push(``);

    // Goals Table
    lines.push(`METAS Y FONDOS FINANCIEROS`);
    lines.push(`ID;Meta;Monto Objetivo;Ahorro Actual;% Progreso;Fecha Límite`);
    goals.forEach(g => {
      const pct = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(0) : 0;
      lines.push(`${g.id};${sanitizeCsvField(g.title)};${g.targetAmount};${g.currentAmount};${pct}%;${g.targetDate}`);
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
      if (jsonData.length > 5 * 1024 * 1024) {
        console.error("Payload JSON excede el límite de 5MB");
        return false;
      }
      const parsed = JSON.parse(jsonData);
      if (typeof parsed !== 'object' || parsed === null) return false;

      if (typeof parsed.userName === 'string') {
        setUserName(parsed.userName.slice(0, 50).trim());
      }
      if (Array.isArray(parsed.transactions)) {
        const validTx = parsed.transactions.slice(0, 5000).filter((t: any) => 
          t && typeof t.id === 'string' && (t.type === 'income' || t.type === 'expense') && !isNaN(Number(t.amount))
        ).map((t: any) => ({
          ...t,
          amount: Math.abs(Number(t.amount)),
          description: String(t.description || '').slice(0, 200),
          category: String(t.category || 'Varios').slice(0, 100),
        }));
        if (validTx.length > 0) setTransactions(validTx);
      }
      if (Array.isArray(parsed.debts)) {
        const validDebts = parsed.debts.slice(0, 500).filter((d: any) => 
          d && typeof d.id === 'string' && !isNaN(Number(d.totalAmount))
        ).map((d: any) => ({
          ...d,
          totalAmount: Math.abs(Number(d.totalAmount)),
          remainingAmount: Math.abs(Number(d.remainingAmount || d.totalAmount)),
          name: String(d.name || '').slice(0, 100),
        }));
        if (validDebts.length > 0) setDebts(validDebts);
      }
      if (Array.isArray(parsed.goals)) {
        const validGoals = parsed.goals.slice(0, 500).filter((g: any) => 
          g && typeof g.id === 'string' && !isNaN(Number(g.targetAmount))
        ).map((g: any) => ({
          ...g,
          targetAmount: Math.abs(Number(g.targetAmount)),
          currentAmount: Math.abs(Number(g.currentAmount || 0)),
          title: String(g.title || '').slice(0, 100),
        }));
        if (validGoals.length > 0) setGoals(validGoals);
      }
      if (parsed.currency && typeof parsed.currency.code === 'string') {
        setCurrency(parsed.currency.code);
      }
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
        supabaseUser,
        isCloudConnected,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithSupabase,
        signupWithSupabase,
        logoutSupabase,
        syncLocalToCloud,
        currentCurrency,
        setCurrency,
        isCurrencySetupModalOpen,
        setIsCurrencySetupModalOpen,
        lockAndSetCurrencyAndName,
        unlockCurrencySelector,
        formatMoney,
        formatPercent,
        formatInputLive,
        parseRawFromDisplay,
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
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        isReceiptScannerOpen,
        setIsReceiptScannerOpen,
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
