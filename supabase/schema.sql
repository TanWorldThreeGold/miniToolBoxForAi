-- ToolBox Supabase Schema
-- 运行前请确保已启用 Supabase Auth (auth.users 表已存在)

-- ========== todos ==========
create table if not exists public.todos (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false not null,
  priority text default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date date,
  parent_id bigint references public.todos(id) on delete cascade,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null
);

alter table public.todos enable row level security;
create policy "Users manage own todos" on public.todos
  for all using (auth.uid() = user_id);

-- ========== diaries ==========
create table if not exists public.diaries (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text default '' not null,
  mood text default '' not null,
  date date not null,
  created_at timestamptz default now() not null
);

alter table public.diaries enable row level security;
create policy "Users manage own diaries" on public.diaries
  for all using (auth.uid() = user_id);

-- ========== memos ==========
create table if not exists public.memos (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text default '' not null,
  encrypted boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.memos enable row level security;
create policy "Users manage own memos" on public.memos
  for all using (auth.uid() = user_id);

-- ========== expenses ==========
create table if not exists public.expenses (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  note text default '' not null,
  date date not null,
  created_at timestamptz default now() not null
);

alter table public.expenses enable row level security;
create policy "Users manage own expenses" on public.expenses
  for all using (auth.uid() = user_id);

-- ========== habits ==========
create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  archived boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.habits enable row level security;
create policy "Users manage own habits" on public.habits
  for all using (auth.uid() = user_id);

-- ========== habit_checks ==========
create table if not exists public.habit_checks (
  id bigint generated always as identity primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  unique (habit_id, date)
);

alter table public.habit_checks enable row level security;
create policy "Users manage own habit_checks" on public.habit_checks
  for all using (auth.uid() = user_id);

-- ========== pomodoros ==========
create table if not exists public.pomodoros (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  duration int not null check (duration > 0),
  created_at timestamptz default now() not null
);

alter table public.pomodoros enable row level security;
create policy "Users manage own pomodoros" on public.pomodoros
  for all using (auth.uid() = user_id);

-- ========== countdowns ==========
create table if not exists public.countdowns (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  date date not null,
  created_at timestamptz default now() not null
);
alter table public.countdowns enable row level security;
create policy "Users manage own countdowns" on public.countdowns
  for all using (auth.uid() = user_id);
