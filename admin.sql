-- socialmarket ADMIN (run once in Supabase > SQL Editor). Safe to run twice.
-- Every admin power lives in functions that first check "is this person in admin_users?".
-- Normal users can never call them successfully. Every action is written to admin_log.

-- 0) remove OLD admin functions with the same names (an earlier admin left some behind)
drop function if exists public.admin_me();
drop function if exists public.admin_stats();
drop function if exists public.admin_kyc(text);
drop function if exists public.admin_kyc_decide(uuid,boolean,text);
drop function if exists public.admin_listings(text);
drop function if exists public.admin_listing_decide(uuid,text,text);
drop function if exists public.admin_orders();
drop function if exists public.admin_order_act(uuid,text,text);
drop function if exists public.admin_users(text);
drop function if exists public.admin_chats();
drop function if exists public.admin_chat_messages(uuid);
drop function if exists public.admin_logs();

create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  level text not null default 'admin' check (level in ('owner','admin','support')),
  created_at timestamptz not null default now());
create table if not exists public.admin_log (
  id bigserial primary key, admin_id uuid, admin_email text, action text, target text, note text,
  created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
alter table public.admin_log   enable row level security;
revoke all on public.admin_users, public.admin_log from anon, authenticated;

-- support = view only. admin = approve, release, refund. owner = everything.
create or replace function public._chk(need text default 'support') returns void
language plpgsql stable security definer set search_path = public as $$
declare lv text; r int; n int;
begin
  select level into lv from admin_users where user_id = auth.uid();
  if lv is null then raise exception 'Not allowed'; end if;
  r := case lv when 'owner' then 3 when 'admin' then 2 else 1 end;
  n := case need when 'owner' then 3 when 'admin' then 2 else 1 end;
  if r < n then raise exception 'Your admin level cannot do this'; end if;
end $$;

create or replace function public._log(a text, t text, n text) returns void
language sql security definer set search_path = public as $$
  insert into admin_log(admin_id, admin_email, action, target, note)
  values (auth.uid(), (select email from profiles where id = auth.uid()), a, t, n) $$;

create or replace function public.admin_me() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('level', a.level, 'email', p.email) from admin_users a join profiles p on p.id = a.user_id where a.user_id = auth.uid() $$;

create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk();
  return json_build_object(
    'users', (select count(*) from profiles),
    'sellers', (select count(*) from profiles where kyc_status = 'verified'),
    'kyc_pending', (select count(*) from profiles where kyc_status = 'pending'),
    'listings_pending', (select count(*) from listings where status = 'pending'),
    'listings_live', (select count(*) from listings where status = 'live'),
    'orders_total', (select count(*) from orders),
    'orders_active', (select count(*) from orders where status in ('in_progress','delivered')),
    'paid_total', (select coalesce(sum(amount),0) from orders where payment_status = 'paid'),
    'fees_total', (select coalesce(sum(fee),0) from orders where payout_status = 'released'),
    'held', (select coalesce(sum(amount - fee),0) from orders where payout_status = 'held'),
    'ready', (select count(*) from orders_ready_to_release),
    'attention', (select count(*) from orders_needing_attention));
end $$;

create or replace function public.admin_kyc(p_status text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk();
  return coalesce((select jsonb_agg(to_jsonb(v) || jsonb_build_object('email', p.email, 'kyc_status', p.kyc_status) order by p.created_at desc)
    from seller_verifications v join profiles p on p.id = v.user_id
    where p_status is null or p.kyc_status = p_status), '[]'::jsonb);
end $$;

create or replace function public.admin_kyc_decide(p_user uuid, p_ok boolean, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _chk('admin');
  update profiles set kyc_status = case when p_ok then 'verified' else 'rejected' end where id = p_user;
  perform _log(case when p_ok then 'kyc_approve' else 'kyc_reject' end, p_user::text, p_note);
  perform _notify(p_user, 'kyc', case when p_ok then 'You are verified' else 'Verification not approved' end,
    case when p_ok then 'You can now sell on socialmarket.' else coalesce(p_note, 'Please check your details and submit again.') end);
end $$;

create or replace function public.admin_listings(p_status text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk();
  return coalesce((select jsonb_agg(to_jsonb(l) || jsonb_build_object('seller_email', p.email, 'seller_name', p.full_name) order by l.created_at desc)
    from listings l join profiles p on p.id = l.seller_id
    where p_status is null or l.status = p_status), '[]'::jsonb);
end $$;

create or replace function public.admin_listing_decide(p_id uuid, p_status text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare s uuid; t text;
begin
  perform _chk('admin');
  if p_status not in ('live','rejected','pending') then raise exception 'Bad status'; end if;
  update listings set status = p_status where id = p_id returning seller_id, title into s, t;
  perform _log('listing_' || p_status, p_id::text, p_note);
  if p_status in ('live','rejected') then
    perform _notify(s, 'listing', case when p_status = 'live' then 'Listing is live' else 'Listing not approved' end,
      '"' || t || '" ' || case when p_status = 'live' then 'is now visible to buyers.' else 'was not approved. ' || coalesce(p_note, '') end);
  end if;
end $$;

create or replace function public.admin_orders() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk();
  return coalesce((select jsonb_agg(to_jsonb(o) order by o.created_at desc) from (select * from orders order by created_at desc limit 500) o), '[]'::jsonb);
end $$;

-- act: paid (manual payment, e.g. JazzCash/Easypaisa), release, refund, dismiss (buyer complaint was wrong)
create or replace function public.admin_order_act(p_order uuid, p_act text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare o orders;
begin
  perform _chk('admin');
  select * into o from orders where id = p_order;
  if not found then raise exception 'Order not found'; end if;
  if p_act = 'paid' then perform mark_order_paid(p_order, 'manual', coalesce(nullif(p_note,''), 'manual-' || o.order_no), o.amount);
  elsif p_act = 'release' then perform release_order(p_order);
  elsif p_act = 'refund' then perform refund_order(p_order, p_note);
  elsif p_act = 'dismiss' then
    update orders set disputed = false, dispute_note = null where id = p_order;
    insert into order_events(order_id, kind, note) values (p_order, 'dispute_dismissed', p_note);
  else raise exception 'Unknown action'; end if;
  perform _log('order_' || p_act, 'SM-' || o.order_no, p_note);
end $$;

create or replace function public.admin_users(p_q text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk();
  return coalesce((select jsonb_agg(to_jsonb(u) order by u.created_at desc) from (
    select p.id, p.email, p.full_name, p.phone, p.role, p.kyc_status, p.created_at,
      (select count(*) from listings l where l.seller_id = p.id) as listings,
      (select count(*) from orders o where o.buyer_id = p.id) as bought,
      (select count(*) from orders o where o.seller_id = p.id) as sold
    from profiles p where p_q is null or p.email ilike '%' || p_q || '%' or p.full_name ilike '%' || p_q || '%'
    order by p.created_at desc limit 200) u), '[]'::jsonb);
end $$;

create or replace function public.admin_chats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk();
  return coalesce((select jsonb_agg(to_jsonb(c) order by c.updated_at desc) from (select id, listing_title, buyer_name, seller_name, updated_at from conversations order by updated_at desc limit 200) c), '[]'::jsonb);
end $$;

create or replace function public.admin_chat_messages(p_conv uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform _chk();
  perform _log('chat_view', p_conv::text, null);
  return coalesce((select jsonb_agg(jsonb_build_object('sender', coalesce(p.full_name, 'User'), 'body', m.body, 'at', m.created_at) order by m.created_at)
    from messages m join profiles p on p.id = m.sender_id where m.conversation_id = p_conv), '[]'::jsonb);
end $$;

create or replace function public.admin_logs() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk('admin');
  return coalesce((select jsonb_agg(to_jsonb(g) order by g.id desc) from (select * from admin_log order by id desc limit 300) g), '[]'::jsonb);
end $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where user_id = auth.uid()) $$;

-- admins may open ID photos in the private "kyc" folder
drop policy if exists "kyc read admin" on storage.objects;
create policy "kyc read admin" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and public.is_admin());

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where user_id = auth.uid()) $$;

-- lock everything, then open only what the admin page needs
revoke all on function public._chk(text), public._log(text,text,text) from public, anon, authenticated;
do $$ declare f text; begin
  foreach f in array array['is_admin()','admin_me()','admin_stats()','admin_kyc(text)','admin_kyc_decide(uuid,boolean,text)',
    'admin_listings(text)','admin_listing_decide(uuid,text,text)','admin_orders()','admin_order_act(uuid,text,text)',
    'admin_users(text)','admin_chats()','admin_chat_messages(uuid)','admin_logs()'] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop; end $$;

-- FIRST ADMIN: put your own email here and run this line once (sign up on the site first):
-- insert into public.admin_users(user_id, level) select id, 'owner' from public.profiles where email = 'YOUR@EMAIL.COM';
