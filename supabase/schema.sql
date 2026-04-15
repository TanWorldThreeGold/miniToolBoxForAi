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

-- ========== daily_plans ==========
create table if not exists public.daily_plans (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  note text default '' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, date)
);

alter table public.daily_plans enable row level security;
create policy "Users manage own daily_plans" on public.daily_plans
  for all using (auth.uid() = user_id);

-- ========== daily_reports ==========
create table if not exists public.daily_reports (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id bigint references public.daily_plans(id) on delete set null,
  date date not null,
  auto_summary text default '' not null,
  content text default '' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, date)
);

alter table public.daily_reports enable row level security;
create policy "Users manage own daily_reports" on public.daily_reports
  for all using (auth.uid() = user_id);

-- ========== plan_items ==========
create table if not exists public.plan_items (
  id bigint generated always as identity primary key,
  plan_id bigint references public.daily_plans(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false not null,
  sort_order int default 0 not null,
  carried_from_report_id bigint references public.daily_reports(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.plan_items enable row level security;
create policy "Users manage own plan_items" on public.plan_items
  for all using (auth.uid() = user_id);

-- ========== photos ==========
create table if not exists public.photos (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text default '' not null,
  description text default '' not null,
  created_at timestamptz default now() not null
);

alter table public.photos enable row level security;
create policy "Users manage own photos" on public.photos
  for all using (auth.uid() = user_id);

-- ========== photos storage bucket ==========
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict do nothing;

create policy "Users can upload photos" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own photos" on storage.objects
  for select using (bucket_id = 'photos');

create policy "Users can delete own photos" on storage.objects
  for delete using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
