export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'transfer' | 'card' | 'cash' | 'check' | 'crypto' | 'other';

export type TransactionStatus = 'completed' | 'pending' | 'scheduled';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm:ss
  createdAt?: string; // ISO String timestamp
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  tags: string[];
  notes?: string;
  vendorOrClient?: string;
  userId?: string;
}

export type DebtCategory = 'bank_loan' | 'credit_card' | 'mortgage' | 'supplier' | 'tax' | 'personal';

export interface Debt {
  id: string;
  name: string;
  creditor: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number; // APR %
  minimumPayment: number;
  dueDate: string;
  category: DebtCategory;
  notes?: string;
  startDate?: string;
  userId?: string;
}

export type GoalCategory = 'emergency_fund' | 'expansion' | 'equipment' | 'investment' | 'tax_reserve' | 'personal' | 'savings';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
  iconName: string;
  notes?: string;
  createdAt: string;
  userId?: string;
}

export type ScheduledRecurrence = 'once' | 'monthly' | 'biweekly' | 'weekly' | 'yearly';

export type ScheduledStatus = 'pending' | 'paid' | 'overdue';

export interface ScheduledPayment {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string; // YYYY-MM-DD
  recurrence: ScheduledRecurrence;
  notifyDaysBefore: number; // 0 for same day, 1, 3, 5, 7, 10, 15 days before
  autoNotifyPush: boolean;
  status: ScheduledStatus;
  notes?: string;
  createdAt: string;
  lastPaidDate?: string;
  userId?: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  limitAmount: number;
  period: 'monthly';
  warningThresholdPct?: number; // percentage at which early warning alert triggers (defaults to 80%)
  notes?: string;
  createdAt: string;
}

export interface SavingsTip {
  id: string;
  title: string;
  category: string;
  description: string;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  difficulty: 'easy' | 'medium' | 'high';
  actionType: 'subscription_audit' | 'supplier_renegotiation' | 'operational_efficiency' | 'energy_telecom' | 'discretionary_cut';
  isApplied: boolean;
  userId?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  country: string;
  locale: string;
  decimals: number;
  thousandSeparator: '.' | ',';
  decimalSeparator: ',' | '.';
  example: string;
  rateToUSD: number;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  savingsRate: number;
  totalDebt: number;
  monthlyDebtObligation: number;
  isDeficit: boolean;
  deficitAmount: number;
  liquidityRatio: number;
  runwayMonths: number;
}

export type AssetCategory = 'bank' | 'cash' | 'investment' | 'real_estate' | 'vehicle' | 'crypto' | 'other';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  institution?: string;
  notes?: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDay: number;
  category: string;
  icon?: string;
  active: boolean;
  notes?: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'calendar'
  | 'debts'
  | 'net_worth'
  | 'subscriptions'
  | 'savings'
  | 'goals'
  | 'scenarios'
  | 'compound'
  | 'reports'
  | 'settings';

// Multi-user & Authentication Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'password' | 'guest';
  createdAt: string;
  lastLoginAt: string;
  preferredCurrencyCode?: string;
}

export interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
}
