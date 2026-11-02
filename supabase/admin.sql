-- socialmarket ADMIN PANEL setup.
-- Paste this whole file in Supabase > SQL Editor > New query > Run.
-- Run it AFTER schema.sql. It is safe to run more than once.

-- 1) WHO IS AN ADMIN -------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;   -- nobody can read or change it from the website

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2) LIST SELLER VERIFICATIONS (admins only; anyone else gets an empty list) --
create or replace function public.admin_verifications(p_status text default 'pending')
returns table (user_id uuid, email text, full_name text, phone text, id_type text, id_number text,
               payout text, front_path text, back_path text, submitted_at timestamptz, kyc_status text)
language sql stable security definer set search_path = public as $$
  select v.user_id, p.email, v.full_name, v.phone, v.id_type, v.id_number,
         v.payout, v.front_path, v.back_path, v.submitted_at, p.kyc_status
  from public.seller_verifications v
  join public.profiles p on p.id = v.user_id
  where public.is_admin() and p.kyc_status = p_status
  order by v.submitted_at desc
$$;
revoke all on function public.admin_verifications(text) from public, anon;
grant execute on function public.admin_verifications(text) to authenticated;

-- 3) LIST LISTINGS (admins only), including the private account link ---------
create or replace function public.admin_listings(p_status text default 'pending')
returns table (id uuid, seller_id uuid, seller_name text, seller_email text, seller_kyc text,
               platform text, niche text, title text, description text, followers integer,
               income numeric, price numeric, account_link text, shots text[], status text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.id, l.seller_id, p.full_name, p.email, p.kyc_status,
         l.platform, l.niche, l.title, l.description, l.followers,
         l.income, l.price, l.account_link, l.shots, l.status, l.created_at
  from public.listings l
  join public.profiles p on p.id = l.seller_id
  where public.is_admin() and l.status = p_status
  order by l.created_at desc
$$;
revoke all on function public.admin_listings(text) from public, anon;
grant execute on function public.admin_listings(text) to authenticated;

-- 4) APPROVE / REJECT -----------------------------------------------------------
create or replace function public.admin_set_kyc(p_user uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if p_status not in ('verified','rejected','pending') then raise exception 'Bad status'; end if;
  update public.profiles set kyc_status = p_status where id = p_user;
end $$;
revoke all on function public.admin_set_kyc(uuid, text) from public, anon;
grant execute on function public.admin_set_kyc(uuid, text) to authenticated;

create or replace function public.admin_set_listing(p_id uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if p_status not in ('pending','live','sold','rejected') then raise exception 'Bad status'; end if;
  update public.listings set status = p_status where id = p_id;
end $$;
revoke all on function public.admin_set_listing(uuid, text) from public, anon;
grant execute on function public.admin_set_listing(uuid, text) to authenticated;

-- 5) LET ADMINS OPEN THE PRIVATE ID PHOTOS ------------------------------------
drop policy if exists "kyc admin read" on storage.objects;
create policy "kyc admin read" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and public.is_admin());

-- 6) MAKE YOURSELF THE FIRST ADMIN ----------------------------------------------
-- First create your normal account on the website (Sign up).
-- Then change the email below to YOUR email and run just this last part.
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'PUT_YOUR_EMAIL_HERE'
-- on conflict do nothing;
