-- =========================================================================
-- GASTFIN PRO - ESQUEMA DE BASE DE DATOS SUPABASE POSTGRESQL MULTIUSUARIO
-- =========================================================================

-- 1. TABLA DE PERFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  preferred_currency text default 'CLP',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. TABLA DE MOVIMIENTOS (INGRESOS Y GASTOS)
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category text not null,
  description text not null,
  date date not null,
  time text,
  payment_method text default 'card',
  status text default 'completed',
  is_recurring boolean default false,
  vendor_or_client text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. TABLA DE DEUDAS
create table if not exists public.debts (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  creditor text not null,
  total_amount numeric not null,
  remaining_amount numeric not null,
  interest_rate numeric default 0,
  minimum_payment numeric default 0,
  due_date text,
  category text default 'personal',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. TABLA DE METAS FINANCIERAS
create table if not exists public.goals (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text default 'personal',
  target_amount numeric not null,
  current_amount numeric default 0,
  target_date date,
  color text default '#10B981',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. TABLA DE PRESUPUESTOS POR CATEGORÍA
create table if not exists public.budgets (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  limit_amount numeric not null,
  period text default 'monthly',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =======================================================
-- ACTIVAR SEGURIDAD ESTRICTA RLS (ROW LEVEL SECURITY)
-- =======================================================
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;
alter table public.goals enable row level security;
alter table public.budgets enable row level security;

-- POLÍTICAS DE ACCESO AISLADO (LECTURA, MODIFICACIÓN E INSERCIÓN BLINDADAS)
drop policy if exists "Users can only access own profile" on public.profiles;
create policy "Users can only access own profile" on public.profiles 
  for all using (auth.uid() = id) 
  with check (auth.uid() = id);

drop policy if exists "Users can only access own transactions" on public.transactions;
create policy "Users can only access own transactions" on public.transactions 
  for all using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

drop policy if exists "Users can only access own debts" on public.debts;
create policy "Users can only access own debts" on public.debts 
  for all using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

drop policy if exists "Users can only access own goals" on public.goals;
create policy "Users can only access own goals" on public.goals 
  for all using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

drop policy if exists "Users can only access own budgets" on public.budgets;
create policy "Users can only access own budgets" on public.budgets 
  for all using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- =======================================================
-- TRIGGER AUTOMÁTICO PARA CREAR PERFIL AL REGISTRARSE
-- =======================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', 'Usuario'));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ACTIVAR PUBLICACIONES REALTIME
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.debts;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.budgets;
