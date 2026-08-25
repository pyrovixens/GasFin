import { createClient } from '@supabase/supabase-js';
import { Transaction, Debt, Goal, CategoryBudget, Asset, Subscription } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffbevhpesunzoghhbuff.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__MZ_pzWfB4XbBloJKglEIA_z0q1hPE5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ==========================================
// 1. SUPABASE DATABASE & METADATA FETCH HELPERS
// ==========================================

export const fetchUserDataFromSupabase = async (userId: string) => {
  try {
    const [txRes, debtsRes, goalsRes, budgetsRes, profileRes, authRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('debts').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.auth.getUser(),
    ]);

    const sessionRes = await supabase.auth.getSession();
    const sessionUser = sessionRes.data?.session?.user;
    const metadata = authRes.data?.user?.user_metadata || sessionUser?.user_metadata || {};
    const userPin: string | null = metadata.pin || profileRes.data?.pin_code || profileRes.data?.pin || profileRes.data?.pin_security || null;
    const userAssets: Asset[] = Array.isArray(metadata.assets) ? metadata.assets : [];
    const userSubscriptions: Subscription[] = Array.isArray(metadata.subscriptions) ? metadata.subscriptions : [];

    const transactions: Transaction[] = (txRes.data || []).map((t: any) => ({
      id: t.id,
      type: t.type || 'expense',
      amount: Number(t.amount || 0),
      category: t.category || 'Varios',
      description: t.description || '',
      date: t.date || new Date().toISOString().split('T')[0],
      time: t.time || '12:00',
      paymentMethod: t.payment_method || 'card',
      status: t.status || 'completed',
      isRecurring: Boolean(t.is_recurring),
      vendorOrClient: t.vendor_or_client || '',
      tags: [],
      userId: t.user_id,
    }));

    const debts: Debt[] = (debtsRes.data || []).map((d: any) => ({
      id: d.id,
      name: d.name || '',
      creditor: d.creditor || '',
      totalAmount: Number(d.total_amount || 0),
      remainingAmount: Number(d.remaining_amount ?? d.total_amount ?? 0),
      interestRate: Number(d.interest_rate || 0),
      minimumPayment: Number(d.minimum_payment || 0),
      dueDate: d.due_date || '15',
      category: d.category || 'personal',
      userId: d.user_id,
    }));

    const goals: Goal[] = (goalsRes.data || []).map((g: any) => ({
      id: g.id,
      title: g.title || '',
      category: g.category || 'personal',
      targetAmount: Number(g.target_amount || 0),
      currentAmount: Number(g.current_amount || 0),
      targetDate: g.target_date || '',
      color: g.color || '#10B981',
      iconName: 'target',
      createdAt: g.created_at || new Date().toISOString(),
      userId: g.user_id,
    }));

    const budgets: CategoryBudget[] = (budgetsRes.data || []).map((b: any) => ({
      id: b.id,
      category: b.category || '',
      limitAmount: Number(b.limit_amount || 0),
      period: 'monthly',
      createdAt: b.created_at || new Date().toISOString(),
    }));

    return {
      success: true,
      data: {
        transactions,
        debts,
        goals,
        budgets,
        profile: profileRes.data || null,
        pin: userPin,
        assets: userAssets,
        subscriptions: userSubscriptions,
        displayName: metadata.display_name || profileRes.data?.display_name || null,
        currency: metadata.currency || null,
      },
    };
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return { success: false, error };
  }
};

// ==========================================
// 2. REAL-TIME DB MUTATIONS (SYNC)
// ==========================================

export const syncTransactionToSupabase = async (tx: Transaction, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('transactions').upsert({
      id: tx.id,
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      date: tx.date,
      time: tx.time,
      payment_method: tx.paymentMethod,
      status: tx.status,
      is_recurring: tx.isRecurring,
      vendor_or_client: tx.vendorOrClient,
    });
  } catch (e) {
    console.warn('Supabase sync warning (tx):', e);
  }
};

export const deleteTransactionFromSupabase = async (txId: string, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('transactions').delete().eq('id', txId).eq('user_id', userId);
  } catch (e) {
    console.warn('Supabase delete warning (tx):', e);
  }
};

export const syncDebtToSupabase = async (debt: Debt, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('debts').upsert({
      id: debt.id,
      user_id: userId,
      name: debt.name,
      creditor: debt.creditor,
      total_amount: debt.totalAmount,
      remaining_amount: debt.remainingAmount,
      interest_rate: debt.interestRate,
      minimum_payment: debt.minimumPayment,
      due_date: debt.dueDate,
      category: debt.category,
    });
  } catch (e) {
    console.warn('Supabase sync warning (debt):', e);
  }
};

export const deleteDebtFromSupabase = async (debtId: string, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('debts').delete().eq('id', debtId).eq('user_id', userId);
  } catch (e) {
    console.warn('Supabase delete warning (debt):', e);
  }
};

export const syncGoalToSupabase = async (goal: Goal, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('goals').upsert({
      id: goal.id,
      user_id: userId,
      title: goal.title,
      category: goal.category,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      target_date: goal.targetDate || null,
      color: goal.color,
    });
  } catch (e) {
    console.warn('Supabase sync warning (goal):', e);
  }
};

export const deleteGoalFromSupabase = async (goalId: string, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
  } catch (e) {
    console.warn('Supabase delete warning (goal):', e);
  }
};

export const syncBudgetToSupabase = async (budget: CategoryBudget, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('budgets').upsert({
      id: budget.id,
      user_id: userId,
      category: budget.category,
      limit_amount: budget.limitAmount,
      period: budget.period,
    });
  } catch (e) {
    console.warn('Supabase sync warning (budget):', e);
  }
};

export const deleteBudgetFromSupabase = async (budgetId: string, userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('budgets').delete().eq('id', budgetId).eq('user_id', userId);
  } catch (e) {
    console.warn('Supabase delete warning (budget):', e);
  }
};

export const clearAllBudgetsFromSupabase = async (userId: string) => {
  if (!userId) return;
  try {
    await supabase.from('budgets').delete().eq('user_id', userId);
  } catch (e) {
    console.warn('Supabase delete all budgets warning:', e);
  }
};

// Cross-device User Metadata & PIN synchronization
export const syncUserMetadataToSupabase = async (
  userId: string,
  meta: {
    pin?: string | null;
    assets?: Asset[];
    subscriptions?: Subscription[];
    displayName?: string;
    currency?: string;
  }
) => {
  try {
    const userUpdatePayload: any = {};
    if (meta.pin !== undefined) userUpdatePayload.pin = meta.pin;
    if (meta.assets !== undefined) userUpdatePayload.assets = meta.assets;
    if (meta.subscriptions !== undefined) userUpdatePayload.subscriptions = meta.subscriptions;
    if (meta.displayName !== undefined) userUpdatePayload.display_name = meta.displayName;
    if (meta.currency !== undefined) userUpdatePayload.currency = meta.currency;

    await supabase.auth.updateUser({
      data: userUpdatePayload
    });

    const profilePayload: any = { id: userId, updated_at: new Date().toISOString() };
    if (meta.displayName !== undefined) profilePayload.display_name = meta.displayName;
    if (meta.pin !== undefined) {
      profilePayload.pin_code = meta.pin;
      profilePayload.pin = meta.pin;
    }
    
    await supabase.from('profiles').upsert(profilePayload);
  } catch (e) {
    console.warn('Supabase metadata sync warning:', e);
  }
};

export const syncFullDatasetToSupabase = async (
  userId: string,
  data: {
    transactions: Transaction[];
    debts: Debt[];
    goals: Goal[];
    budgets: CategoryBudget[];
    assets?: Asset[];
    subscriptions?: Subscription[];
    pin?: string | null;
    displayName?: string;
    currency?: string;
  }
) => {
  if (!userId) return;
  try {
    const promises = [
      ...data.transactions.map(t => syncTransactionToSupabase(t, userId)),
      ...data.debts.map(d => syncDebtToSupabase(d, userId)),
      ...data.goals.map(g => syncGoalToSupabase(g, userId)),
      ...data.budgets.map(b => syncBudgetToSupabase(b, userId)),
      syncUserMetadataToSupabase(userId, {
        pin: data.pin,
        assets: data.assets,
        subscriptions: data.subscriptions,
        displayName: data.displayName,
        currency: data.currency,
      })
    ];
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Error bulk uploading to Supabase:', error);
    return { success: false, error };
  }
};

// ==========================================
// 3. REALTIME CROSS-DEVICE SUBSCRIPTION
// ==========================================

export const subscribeToUserRealtimeChanges = (
  userId: string,
  onDataChanged: () => void
) => {
  if (!userId) return () => {};

  const channel = supabase
    .channel(`user-sync-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, () => {
      onDataChanged();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'debts', filter: `user_id=eq.${userId}` }, () => {
      onDataChanged();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${userId}` }, () => {
      onDataChanged();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` }, () => {
      onDataChanged();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, () => {
      onDataChanged();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
