import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Transaction, 
  Debt, 
  Goal, 
  CategoryBudget,
  ScheduledPayment,
  SavingsTip, 
  CurrencyConfig, 
  FinancialMetrics, 
  ActiveView,
  Asset,
  Subscription
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
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  hasPaymentBeenNotifiedToday,
  markPaymentAsNotifiedToday
} from '../services/notificationService';
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
  clearAllBudgetsFromSupabase,
  syncUserMetadataToSupabase,
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
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;

  // Pro Suite: Net Worth & Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  isAssetModalOpen: boolean;
  setIsAssetModalOpen: (open: boolean) => void;
  editingAsset: Asset | null;
  openAssetModal: (asset?: Asset) => void;
  closeAssetModal: () => void;

  // Pro Suite: Subscriptions Radar
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscription: (id: string) => void;

  // Pro Suite: Command Palette & Modals
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isCSVImporterOpen: boolean;
  setIsCSVImporterOpen: (open: boolean) => void;
  isReportPrintModalOpen: boolean;
  setIsReportPrintModalOpen: (open: boolean) => void;

  // Pro Suite: Security PIN
  userPIN: string | null;
  setUserPIN: (pin: string | null) => void;
  isPinPromptOpen: boolean;
  setIsPinPromptOpen: (open: boolean) => void;
  savedAuthEmail: string;
  setSavedAuthEmail: (email: string) => void;
  
  // User Profile & Personalized Greeting
  userName: string;
  setUserName: (name: string) => void;
  motivationalQuote: string;

  // Supabase Cloud Sync & Multi-user
  supabaseUser: any;
  isCloudConnected: boolean;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string; hasPin: boolean; pin?: string | null }>;
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
  clearAllBudgets: () => void;

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

  // Session Security & Inactivity Locking
  isSessionLocked: boolean;
  unlockSession: () => void;
  logoutUser: () => void;

  isDebtModalOpen: boolean;
  openDebtModal: (debt?: Debt) => void;
  closeDebtModal: () => void;
  editingDebt: Debt | null;

  isGoalModalOpen: boolean;
  openGoalModal: (goal?: Goal) => void;
  closeGoalModal: () => void;
  editingGoal: Goal | null;

  // Scheduled Payments & Reminders / Gastos Programados
  scheduledPayments: ScheduledPayment[];
  addScheduledPayment: (payment: Omit<ScheduledPayment, 'id' | 'createdAt'>) => void;
  updateScheduledPayment: (id: string, payment: Partial<Omit<ScheduledPayment, 'id' | 'createdAt'>>) => void;
  deleteScheduledPayment: (id: string) => void;
  markScheduledPaymentAsPaid: (id: string, createExpenseTx?: boolean) => void;
  notificationPermission: NotificationPermission;
  requestPushPermission: () => Promise<NotificationPermission>;
  testPushNotification: (payment?: ScheduledPayment) => void;

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
  // ==========================================
  // 1. ALL USE_STATE HOOKS (TOP LEVEL ORDER)
  // ==========================================

  // User Identity & PIN
  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem('gastfin_user_name_v6') || '';
  });

  const [savedAuthEmail, setSavedAuthEmailState] = useState<string>(() => {
    return localStorage.getItem('gastfin_saved_auth_email') || '';
  });

  const [userPIN, setUserPINState] = useState<string | null>(() => {
    return localStorage.getItem('gastfin_user_pin_v1');
  });

  const [isPinPromptOpen, setIsPinPromptOpen] = useState<boolean>(false);

  // Navigation, Theme & Security UI
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('gastfin_theme_v6');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('gastfin_sidebar_v6');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    try {
      const hash = window.location.hash.replace('#', '') as ActiveView;
      const validViews: ActiveView[] = [
        'dashboard', 'transactions', 'budgets', 'calendar', 'debts', 
        'savings', 'goals', 'scenarios', 'compound', 'reports', 'settings'
      ];
      if (hash && validViews.includes(hash)) {
        return hash;
      }
      const saved = localStorage.getItem('gastfin_active_view_v1') as ActiveView;
      if (saved && validViews.includes(saved)) {
        return saved;
      }
    } catch {}
    return 'dashboard';
  });

  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem('gastfin_privacy_v1') === 'true';
  });

  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(() => {
    const savedPin = localStorage.getItem('gastfin_user_pin_v1');
    const unlockedThisSession = sessionStorage.getItem('gastfin_unlocked_current_session');
    if (savedPin && unlockedThisSession !== 'true') {
      return true;
    }
    const lastActive = localStorage.getItem('gastfin_last_active_time');
    if (savedPin && lastActive) {
      const elapsed = Date.now() - parseInt(lastActive, 10);
      if (elapsed > 2 * 60 * 1000) return true;
    }
    return false;
  });

  // Currency configuration
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(() => {
    const savedCode = localStorage.getItem('gastfin_currency_v6');
    const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
    return found || SUPPORTED_CURRENCIES[0];
  });

  const [isCurrencySetupModalOpen, setIsCurrencySetupModalOpen] = useState<boolean>(() => {
    const isLocked = localStorage.getItem('gastfin_curr_locked_v6');
    const savedName = localStorage.getItem('gastfin_user_name_v6');
    return isLocked !== 'true' || !savedName;
  });

  // Data Collections
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
    try {
      localStorage.removeItem('gastfin_budgets_v9');
      localStorage.removeItem('gastfin_budgets_v8');
      localStorage.removeItem('gastfin_budgets_v7');
      localStorage.removeItem('gastfin_budgets_v6');
      localStorage.removeItem('gastfin_custom_budget_base');
      localStorage.removeItem('gastfin_custom_budget_base_v7');
    } catch {}

    const saved = localStorage.getItem('gastfin_budgets_v10');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const total = parsed.reduce((acc: number, b: any) => acc + (b.limitAmount || 0), 0);
          if (total === 1900000 && parsed.length >= 7) {
            localStorage.removeItem('gastfin_budgets_v10');
            return [];
          }
          return parsed;
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const stored = localStorage.getItem('gastfin_assets_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const stored = localStorage.getItem('gastfin_subscriptions_v1');
      return stored ? JSON.parse(stored) : [
        {
          id: 'sub-netflix',
          name: 'Netflix Premium 4K',
          amount: 11990,
          billingCycle: 'monthly',
          renewalDay: 15,
          category: 'Streaming & Ocio',
          active: true
        },
        {
          id: 'sub-spotify',
          name: 'Spotify Familiar',
          amount: 6490,
          billingCycle: 'monthly',
          renewalDay: 5,
          category: 'Streaming & Ocio',
          active: true
        }
      ];
    } catch {
      return [];
    }
  });

  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>(() => {
    try {
      localStorage.removeItem('gastfin_scheduled_payments_v6');
    } catch {}

    const saved = localStorage.getItem('gastfin_scheduled_payments_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => p && !['sp-1', 'sp-2', 'sp-3', 'sp-4'].includes(p.id));
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  const [savingsTips, setSavingsTips] = useState<SavingsTip[]>(() => {
    const saved = localStorage.getItem('gastfin_tips_v6');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_TIPS;
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return getNotificationPermission();
  });

  // Cloud Sync State
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Modals and Drawers
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isTransactionMinimized, setIsTransactionMinimized] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState<boolean>(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDeficitModalOpen, setIsDeficitModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isCSVImporterOpen, setIsCSVImporterOpen] = useState<boolean>(false);
  const [isReportPrintModalOpen, setIsReportPrintModalOpen] = useState<boolean>(false);

  // ==========================================
  // 2. HELPER FUNCTIONS & SETTERS
  // ==========================================

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6366F1', '#3B82F6', '#F59E0B', '#EC4899']
      });
    } catch {}
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('gastfin_user_name_v6', name);
  };

  const setSavedAuthEmail = (email: string) => {
    setSavedAuthEmailState(email);
    if (email) {
      localStorage.setItem('gastfin_saved_auth_email', email);
    } else {
      localStorage.removeItem('gastfin_saved_auth_email');
    }
  };

  const setUserPIN = (pin: string | null) => {
    setUserPINState(pin);
    if (pin) {
      localStorage.setItem('gastfin_user_pin_v1', pin);
    } else {
      localStorage.removeItem('gastfin_user_pin_v1');
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = supabaseUser?.id || session?.user?.id;
      if (uid) {
        syncUserMetadataToSupabase(uid, { pin });
      }
    });
  };

  const setActiveView = (view: ActiveView) => {
    setActiveViewState(view);
    try {
      localStorage.setItem('gastfin_active_view_v1', view);
      window.history.replaceState(null, '', `#${view}`);
    } catch {}
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const togglePrivacyMode = () => {
    setIsPrivacyMode(prev => {
      const next = !prev;
      localStorage.setItem('gastfin_privacy_v1', String(next));
      return next;
    });
  };

  const unlockSession = () => {
    sessionStorage.setItem('gastfin_unlocked_current_session', 'true');
    localStorage.setItem('gastfin_last_active_time', Date.now().toString());
    setIsSessionLocked(false);
    triggerCelebration();
  };

  const logoutUser = async () => {
    if (supabaseUser) {
      await logoutSupabase();
    }
    sessionStorage.removeItem('gastfin_unlocked_current_session');
    localStorage.removeItem('gastfin_last_active_time');
    setIsSessionLocked(false);
    setTransactions([]);
    setDebts([]);
    setGoals([]);
    setBudgets([]);
    setAssets([]);
    setSubscriptions([]);
    setActiveView('dashboard');
    setIsAuthModalOpen(true);
  };

  const motivationalQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  // ==========================================
  // 3. CLOUD LOAD & SYNC FUNCTIONS
  // ==========================================

  const loadCloudData = async (userId: string): Promise<{ success: boolean; pin: string | null }> => {
    try {
      const res = await fetchUserDataFromSupabase(userId);
      let cloudPin: string | null = null;
      if (res.success && res.data) {
        if (res.data.transactions.length > 0) setTransactions(res.data.transactions);
        if (res.data.debts.length > 0) setDebts(res.data.debts);
        if (res.data.goals.length > 0) setGoals(res.data.goals);
        if (res.data.budgets.length > 0) {
          const totalPreset = res.data.budgets.reduce((acc: number, b: any) => acc + (b.limit_amount || b.limitAmount || 0), 0);
          if (totalPreset === 1900000 && res.data.budgets.length >= 7) {
            clearAllBudgetsFromSupabase(userId);
            setBudgets([]);
          } else {
            setBudgets(res.data.budgets);
          }
        }
        
        // Multi-device PIN sync
        const resolvedPin = res.data.pin || localStorage.getItem('gastfin_user_pin_v1');
        if (resolvedPin) {
          cloudPin = resolvedPin;
          setUserPINState(resolvedPin);
          localStorage.setItem('gastfin_user_pin_v1', resolvedPin);
          const unlockedThisSession = sessionStorage.getItem('gastfin_unlocked_current_session');
          if (unlockedThisSession !== 'true') {
            setIsSessionLocked(true);
          }
        }

        // Multi-device Assets sync
        if (res.data.assets && res.data.assets.length > 0) {
          setAssets(res.data.assets);
          localStorage.setItem('gastfin_assets_v1', JSON.stringify(res.data.assets));
        }

        // Multi-device Subscriptions sync
        if (res.data.subscriptions && res.data.subscriptions.length > 0) {
          setSubscriptions(res.data.subscriptions);
          localStorage.setItem('gastfin_subscriptions_v1', JSON.stringify(res.data.subscriptions));
        }

        // Multi-device Currency sync
        if (res.data.currency) {
          const found = SUPPORTED_CURRENCIES.find(c => c.code === res.data.currency);
          if (found) {
            setCurrentCurrency(found);
            localStorage.setItem('gastfin_currency_v6', found.code);
          }
        }

        // Multi-device Profile Name sync
        if (res.data.displayName || res.data.profile?.display_name) {
          const cleanName = res.data.displayName || res.data.profile?.display_name;
          setUserNameState(cleanName);
          localStorage.setItem('gastfin_user_name_v6', cleanName);
        }
      }
      return { success: true, pin: cloudPin };
    } catch (e) {
      console.warn('Cloud sync fetch error:', e);
      return { success: false, pin: null };
    }
  };

  const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string; hasPin: boolean; pin?: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message, hasPin: false };
      if (data.user) {
        setSupabaseUser(data.user);
        setIsCloudConnected(true);
        const cloudRes = await loadCloudData(data.user.id);
        const effectivePin = cloudRes.pin || data.user.user_metadata?.pin || localStorage.getItem('gastfin_user_pin_v1') || null;
        if (effectivePin) {
          setUserPINState(effectivePin);
          localStorage.setItem('gastfin_user_pin_v1', effectivePin);
          sessionStorage.removeItem('gastfin_unlocked_current_session');
          setIsSessionLocked(true);
        }
        triggerCelebration();
        return { success: true, hasPin: Boolean(effectivePin), pin: effectivePin };
      }
      return { success: false, error: 'No se pudo iniciar sesión.', hasPin: false };
    } catch (e: any) {
      return { success: false, error: e.message, hasPin: false };
    }
  };

  const signupWithSupabase = async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            display_name: displayName || 'Usuario',
            pin: userPIN,
            assets,
            subscriptions,
            currency: currentCurrency.code
          }
        }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setSupabaseUser(data.user);
        setIsCloudConnected(true);
        if (displayName) setUserName(displayName);
        await syncFullDatasetToSupabase(data.user.id, {
          transactions,
          debts,
          goals,
          budgets,
          assets,
          subscriptions,
          pin: userPIN,
          displayName: displayName || userName,
          currency: currentCurrency.code,
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
      budgets,
      assets,
      subscriptions,
      pin: userPIN,
      displayName: userName,
      currency: currentCurrency.code,
    });
    triggerCelebration();
  };

  // ==========================================
  // 4. ENTITY MUTATIONS (ASSETS, SUBSCRIPTIONS, BUDGETS, ETC)
  // ==========================================

  const addAsset = (asset: Omit<Asset, 'id'>) => {
    const newAsset: Asset = { ...asset, id: `asset-${Date.now()}` };
    setAssets(prev => {
      const updated = [newAsset, ...prev];
      if (supabaseUser) syncUserMetadataToSupabase(supabaseUser.id, { assets: updated });
      return updated;
    });
    triggerCelebration();
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      if (supabaseUser) syncUserMetadataToSupabase(supabaseUser.id, { assets: updated });
      return updated;
    });
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => {
      const updated = prev.filter(a => a.id !== id);
      if (supabaseUser) syncUserMetadataToSupabase(supabaseUser.id, { assets: updated });
      return updated;
    });
  };

  const openAssetModal = (asset?: Asset) => {
    setEditingAsset(asset || null);
    setIsAssetModalOpen(true);
  };

  const closeAssetModal = () => {
    setEditingAsset(null);
    setIsAssetModalOpen(false);
  };

  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = { ...sub, id: `sub-${Date.now()}` };
    setSubscriptions(prev => {
      const updated = [newSub, ...prev];
      if (supabaseUser) syncUserMetadataToSupabase(supabaseUser.id, { subscriptions: updated });
      return updated;
    });
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      if (supabaseUser) syncUserMetadataToSupabase(supabaseUser.id, { subscriptions: updated });
      return updated;
    });
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (supabaseUser) syncUserMetadataToSupabase(supabaseUser.id, { subscriptions: updated });
      return updated;
    });
  };

  const toggleSubscription = (id: string) => {
    setSubscriptions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, active: !s.active } : s);
      if (supabaseUser) syncUserMetadataToSupabase(supabaseUser.id, { subscriptions: updated });
      return updated;
    });
  };

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

  const deleteBudget = (idOrCategory: string) => {
    if (!idOrCategory) return;
    const normalized = idOrCategory.trim().toLowerCase();
    setBudgets(prev => {
      const updated = prev.filter(b => 
        b.id !== idOrCategory && 
        b.category !== idOrCategory && 
        b.category.trim().toLowerCase() !== normalized
      );
      try {
        localStorage.setItem('gastfin_budgets_v10', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (supabaseUser) deleteBudgetFromSupabase(idOrCategory, supabaseUser.id);
  };

  const clearAllBudgets = () => {
    setBudgets([]);
    localStorage.removeItem('gastfin_budgets_v10');
    localStorage.removeItem('gastfin_budgets_v9');
    localStorage.removeItem('gastfin_budgets_v8');
    localStorage.removeItem('gastfin_budgets_v7');
    localStorage.removeItem('gastfin_budgets_v6');
    localStorage.removeItem('gastfin_custom_budget_base');
    localStorage.removeItem('gastfin_custom_budget_base_v7');
    if (supabaseUser) {
      clearAllBudgetsFromSupabase(supabaseUser.id);
    }
    triggerCelebration();
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
      supabase.auth.getSession().then(({ data: { session } }) => {
        const uid = supabaseUser?.id || session?.user?.id;
        if (uid) {
          syncUserMetadataToSupabase(uid, { currency: found.code, displayName: cleanName });
        }
      });
      triggerCelebration();
    }
  };

  const unlockCurrencySelector = () => {
    localStorage.removeItem('gastfin_curr_locked_v6');
    setIsCurrencySetupModalOpen(true);
  };

  // Custom Amount Formatter with Stealth Privacy Mask
  const formatMoney = (amount: number | undefined | null, overrideSymbol?: string) => {
    const symbol = overrideSymbol !== undefined ? overrideSymbol : (currentCurrency?.symbol || '$');
    if (isPrivacyMode) {
      return `${symbol} ••••••`;
    }
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

  // Scheduled Payments & Reminders Actions
  const checkAndTriggerPaymentNotifications = () => {
    if (!scheduledPayments || scheduledPayments.length === 0) return;
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    scheduledPayments.forEach(p => {
      if (p.status === 'paid' || !p.autoNotifyPush) return;
      if (!p.dueDate) return;

      const [pYear, pMonth, pDay] = p.dueDate.split('-').map(Number);
      const dueMidnight = new Date(pYear, pMonth - 1, pDay).getTime();
      const diffDays = Math.ceil((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

      if (diffDays <= (p.notifyDaysBefore ?? 5) && diffDays >= 0) {
        if (!hasPaymentBeenNotifiedToday(p.id)) {
          const daysText = diffDays === 0 ? '¡VENCE HOY!' : `Vence en ${diffDays} ${diffDays === 1 ? 'día' : 'días'} (${p.dueDate})`;
          const formattedAmt = formatMoney(p.amount);
          
          sendBrowserNotification({
            title: `🔔 Recordatorio de Pago: ${p.title}`,
            body: `${daysText} • Monto: ${formattedAmt}. Recuerda realizar tu pago a tiempo.`,
            tag: `payment-due-${p.id}`,
            data: { paymentId: p.id }
          });
          
          markPaymentAsNotifiedToday(p.id);
        }
      }
    });
  };

  const requestPushPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification({
        title: '✅ Notificaciones de GastFin Activadas',
        body: 'Te avisaremos oportunamente sobre tus gastos y pagos programados antes de su vencimiento.',
        tag: 'gastfin-activated'
      });
      checkAndTriggerPaymentNotifications();
    }
    return perm;
  };

  const testPushNotification = (payment?: ScheduledPayment) => {
    const p = payment || scheduledPayments[0];
    const formattedAmt = p ? formatMoney(p.amount) : formatMoney(50000);
    const title = p ? p.title : 'Cuenta de Servicios';
    sendBrowserNotification({
      title: `🔔 Prueba de Recordatorio: ${title}`,
      body: `¡Vence en ${p?.notifyDaysBefore ?? 5} días! Monto: ${formattedAmt}. Esta es una alerta de prueba de GastFin.`,
      tag: `test-${Date.now()}`
    });
  };

  const addScheduledPayment = (payment: Omit<ScheduledPayment, 'id' | 'createdAt'>) => {
    const newPayment: ScheduledPayment = {
      ...payment,
      id: `sp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setScheduledPayments(prev => [newPayment, ...prev]);
    triggerCelebration();
  };

  const updateScheduledPayment = (id: string, payment: Partial<Omit<ScheduledPayment, 'id' | 'createdAt'>>) => {
    setScheduledPayments(prev => prev.map(p => p.id === id ? { ...p, ...payment } : p));
  };

  const deleteScheduledPayment = (id: string) => {
    setScheduledPayments(prev => prev.filter(p => p.id !== id));
  };

  const markScheduledPaymentAsPaid = (id: string, createExpenseTx: boolean = true) => {
    const found = scheduledPayments.find(p => p.id === id);
    if (!found) return;

    if (createExpenseTx) {
      addTransaction({
        type: 'expense',
        amount: found.amount,
        category: found.category,
        description: `Pago programado: ${found.title}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'transfer',
        status: 'completed',
        isRecurring: found.recurrence !== 'once',
        tags: ['pago-programado'],
        notes: found.notes,
      });
    }

    setScheduledPayments(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.recurrence === 'once') {
        return { ...p, status: 'paid', lastPaidDate: new Date().toISOString().split('T')[0] };
      }
      const [y, m, d] = p.dueDate.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d);
      if (p.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (p.recurrence === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
      else if (p.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (p.recurrence === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      const nextDueStr = nextDate.toISOString().split('T')[0];
      return {
        ...p,
        dueDate: nextDueStr,
        status: 'pending',
        lastPaidDate: new Date().toISOString().split('T')[0]
      };
    }));

    triggerCelebration();
  };

  const clearAllDataToZero = () => {
    setTransactions([]);
    setDebts([]);
    setGoals([]);
    setSavingsTips([]);
    setScheduledPayments([]);
    setBudgets([]);
    localStorage.removeItem('gastfin_tx_v6');
    localStorage.removeItem('gastfin_debts_v6');
    localStorage.removeItem('gastfin_goals_v6');
    localStorage.removeItem('gastfin_tips_v6');
    localStorage.removeItem('gastfin_budgets_v10');
    localStorage.removeItem('gastfin_budgets_v9');
    localStorage.removeItem('gastfin_budgets_v8');
    localStorage.removeItem('gastfin_budgets_v7');
    localStorage.removeItem('gastfin_budgets_v6');
    localStorage.removeItem('gastfin_custom_budget_base');
    localStorage.removeItem('gastfin_scheduled_payments_v7');
    localStorage.removeItem('gastfin_scheduled_payments_v6');
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
      scheduledPayments,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gastfin_respaldo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportDataToExcel = () => {
    const lines: string[] = [];

    lines.push(`REPORTE FINANCIERO EJECUTIVO - GASTFIN`);
    lines.push(`Usuario:;${userName || 'Usuario'}`);
    lines.push(`Fecha de Exportación:;${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
    lines.push(`Moneda Principal:;${currentCurrency.code} (${currentCurrency.name})`);
    lines.push(``);

    lines.push(`RESUMEN GENERAL`);
    lines.push(`Métrica;Monto / Valor`);
    lines.push(`Ingresos Totales;${metrics.totalIncome}`);
    lines.push(`Gastos Totales;${metrics.totalExpense}`);
    lines.push(`Flujo Neto;${metrics.netCashFlow}`);
    lines.push(`Tasa de Ahorro;${metrics.savingsRate.toFixed(1)}%`);
    lines.push(`Deuda Total Activa;${metrics.totalDebt}`);
    lines.push(`Cuotas Mínimas Mensuales;${metrics.monthlyDebtObligation}`);
    lines.push(``);

    const sanitizeCsvField = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      let str = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    lines.push(`LIBRO DE INGRESOS Y GASTOS`);
    lines.push(`ID;Tipo;Fecha;Hora;Concepto;Categoría;Monto;Método de Pago;Estado`);
    transactions.forEach(t => {
      lines.push(`${t.id};${t.type === 'income' ? 'Ingreso (+)' : 'Gasto (-)'};${t.date};${t.time || '12:00'};${sanitizeCsvField(t.description)};${sanitizeCsvField(t.category)};${t.amount};${t.paymentMethod};${t.status}`);
    });
    lines.push(``);

    lines.push(`REGISTRO DE DEUDAS`);
    lines.push(`ID;Nombre / Crédito;Acreedor;Saldo Pendiente;Tasa APR (%);Cuota Mínima;Fecha Límite`);
    debts.forEach(d => {
      lines.push(`${d.id};${sanitizeCsvField(d.name)};${sanitizeCsvField(d.creditor)};${d.remainingAmount};${d.interestRate}%;${d.minimumPayment};${d.dueDate}`);
    });
    lines.push(``);

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
      if (Array.isArray(parsed.scheduledPayments)) {
        const validScheduled = parsed.scheduledPayments.slice(0, 500).filter((p: any) => 
          p && typeof p.id === 'string' && !isNaN(Number(p.amount))
        ).map((p: any) => ({
          ...p,
          amount: Math.abs(Number(p.amount)),
          title: String(p.title || '').slice(0, 100),
          category: String(p.category || 'Varios').slice(0, 100),
          dueDate: String(p.dueDate || '').slice(0, 10),
          recurrence: p.recurrence || 'monthly',
          notifyDaysBefore: typeof p.notifyDaysBefore === 'number' ? p.notifyDaysBefore : 5,
          autoNotifyPush: typeof p.autoNotifyPush === 'boolean' ? p.autoNotifyPush : true,
          status: p.status || 'pending'
        }));
        if (validScheduled.length > 0) setScheduledPayments(validScheduled);
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

  // ==========================================
  // 5. ALL USE_EFFECT HOOKS
  // ==========================================

  // Session & Auth State Listeners
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setIsCloudConnected(true);
        const cloudRes = await loadCloudData(session.user.id);
        const effectivePin = cloudRes.pin || session.user.user_metadata?.pin || localStorage.getItem('gastfin_user_pin_v1');
        if (effectivePin) {
          setUserPINState(effectivePin);
          localStorage.setItem('gastfin_user_pin_v1', effectivePin);
          const unlockedThisSession = sessionStorage.getItem('gastfin_unlocked_current_session');
          if (unlockedThisSession !== 'true') {
            setIsSessionLocked(true);
          }
        }
      } else {
        setSupabaseUser(null);
        setIsCloudConnected(false);
      }
      setIsAuthLoading(false);
    }).catch(() => {
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setIsCloudConnected(true);
        const cloudRes = await loadCloudData(session.user.id);
        const effectivePin = cloudRes.pin || session.user.user_metadata?.pin || localStorage.getItem('gastfin_user_pin_v1');
        if (effectivePin) {
          setUserPINState(effectivePin);
          localStorage.setItem('gastfin_user_pin_v1', effectivePin);
        }
      } else {
        setSupabaseUser(null);
        setIsCloudConnected(false);
      }
      setIsAuthLoading(false);
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

  // Automatic online reconnect & background cloud synchronization
  useEffect(() => {
    const handleOnlineSync = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          setIsCloudConnected(true);
          loadCloudData(session.user.id);
        }
      });
    };
    window.addEventListener('online', handleOnlineSync);
    return () => window.removeEventListener('online', handleOnlineSync);
  }, []);

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
    localStorage.setItem('gastfin_budgets_v10', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('gastfin_assets_v1', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('gastfin_subscriptions_v1', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('gastfin_scheduled_payments_v7', JSON.stringify(scheduledPayments));
  }, [scheduledPayments]);

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
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Check scheduled payments on mount or data changes
  useEffect(() => {
    checkAndTriggerPaymentNotifications();
    const timer = setInterval(() => {
      checkAndTriggerPaymentNotifications();
    }, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, [scheduledPayments]);

  // Banking Session Security: Inactivity & Multi-Device PIN Protection
  useEffect(() => {
    let timeoutId: any = null;
    const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes of continuous inactivity

    const recordActivity = () => {
      localStorage.setItem('gastfin_last_active_time', Date.now().toString());
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsSessionLocked(true);
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Handle Smartphone App Minimize / Tab Switch / Backgrounding
    const handleVisibilityOrResume = () => {
      if (document.hidden) {
        localStorage.setItem('gastfin_last_active_time', Date.now().toString());
      } else {
        const lastActive = localStorage.getItem('gastfin_last_active_time');
        const savedPin = localStorage.getItem('gastfin_user_pin_v1');
        if (savedPin) {
          if (!lastActive) {
            sessionStorage.removeItem('gastfin_unlocked_current_session');
            setIsSessionLocked(true);
          } else {
            const elapsed = Date.now() - parseInt(lastActive, 10);
            if (elapsed > 2 * 60 * 1000) {
              sessionStorage.removeItem('gastfin_unlocked_current_session');
              setIsSessionLocked(true);
            }
          }
        }
        recordActivity();
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchend', 'scroll', 'click'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityOrResume);
    window.addEventListener('focus', handleVisibilityOrResume);
    window.addEventListener('pageshow', handleVisibilityOrResume);

    recordActivity();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, recordActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityOrResume);
      window.removeEventListener('focus', handleVisibilityOrResume);
      window.removeEventListener('pageshow', handleVisibilityOrResume);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.shiftKey && e.key.toUpperCase() === 'P') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        togglePrivacyMode();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // ==========================================
  // 6. PROVIDER RENDER
  // ==========================================

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
        isAuthLoading,
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
        clearAllBudgets,
        scheduledPayments,
        addScheduledPayment,
        updateScheduledPayment,
        deleteScheduledPayment,
        markScheduledPaymentAsPaid,
        notificationPermission,
        requestPushPermission,
        testPushNotification,
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
        isSessionLocked,
        unlockSession,
        logoutUser,
        isPrivacyMode,
        togglePrivacyMode,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        isAssetModalOpen,
        setIsAssetModalOpen,
        editingAsset,
        openAssetModal,
        closeAssetModal,
        subscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleSubscription,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isCSVImporterOpen,
        setIsCSVImporterOpen,
        isReportPrintModalOpen,
        setIsReportPrintModalOpen,
        userPIN,
        setUserPIN,
        isPinPromptOpen,
        setIsPinPromptOpen,
        savedAuthEmail,
        setSavedAuthEmail,
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
