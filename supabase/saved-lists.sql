-- Saved lists (Recently saved + named lists).
-- Run this ONE time in Supabase: SQL Editor -> New query -> paste -> Run.
-- It does not change or delete anything that already exists.

-- 1) when an account was saved (used for "Recently saved")
alter table public.saved_items add column if not exists saved_at timestamptz not null default now();

-- 2) the lists a person makes
create table if not exists public.saved_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- 3) which accounts are inside which list
create table if not exists public.saved_list_items (
  list_id  uuid not null references public.saved_lists(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  item_key text not null,
  saved_at timestamptz not null default now(),
  primary key (list_id, item_key)
);

-- 4) privacy: each person can only see and change their own lists
alter table public.saved_lists      enable row level security;
alter table public.saved_list_items enable row level security;

revoke all on public.saved_lists, public.saved_list_items from anon, authenticated;
grant select, insert, update, delete on public.saved_lists      to authenticated;
grant select, insert, delete          on public.saved_list_items to authenticated;

drop policy if exists "own lists"      on public.saved_lists;
drop policy if exists "own list items" on public.saved_list_items;
create policy "own lists"      on public.saved_lists      for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own list items" on public.saved_list_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
