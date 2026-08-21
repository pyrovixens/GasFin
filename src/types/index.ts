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

export type GoalCategory = 'emergency_fund' | 'expansion' | 'equipment' | 'investment' | 'tax_reserve' | 'personal';

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

export interface CategoryBudget {
  id: string;
  category: string;
  limitAmount: number;
  period: 'monthly';
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

export type ActiveView = 
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'calendar'
  | 'debts'
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
