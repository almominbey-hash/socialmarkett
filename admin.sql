-- socialmarket ADMIN DASHBOARD (database part). Run ONCE in Supabase > SQL Editor > New query > Run. Safe to run again.
-- Run it AFTER schema.sql and orders.sql. Nothing here is callable by normal users: every function checks is_admin().

-- 1) WHO IS AN ADMIN -------------------------------------------------------------
alter table public.profiles add column if not exists is_admin boolean not null default false;
-- (normal users can only update full_name, so nobody can make themselves admin from the website)

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

create or replace function public._admin_check() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'Not allowed'; end if;
end $$;

-- 2) OVERVIEW NUMBERS --------------------------------------------------------------
create or replace function public.admin_stats() returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  perform public._admin_check();
  select jsonb_build_object(
    'users',         (select count(*) from profiles),
    'new_users_7d',  (select count(*) from profiles where created_at > now() - interval '7 days'),
    'sellers',       (select count(*) from profiles where kyc_status = 'verified'),
    'kyc_pending',   (select count(*) from profiles where kyc_status = 'pending'),
    'listings',      (select coalesce(jsonb_object_agg(status, c), '{}') from (select status, count(*) c from listings group by 1) x),
    'orders',        (select coalesce(jsonb_object_agg(status, c), '{}') from (select status, count(*) c from orders group by 1) x),
    'gmv',           (select coalesce(sum(amount), 0) from orders where payment_status = 'paid' and status <> 'cancelled'),
    'fees',          (select coalesce(sum(fee), 0)    from orders where payment_status = 'paid' and status <> 'cancelled'),
    'held',          (select coalesce(sum(amount - fee), 0) from orders where payout_status = 'held'),
    'ready',         (select count(*) from orders where payout_status = 'held' and not disputed and release_at <= now()),
    'attention',     (select count(*) from orders where disputed or needs_refund),
    'conversations', (select count(*) from conversations),
    'messages_24h',  (select count(*) from messages where created_at > now() - interval '24 hours'),
    'views',         (select coalesce(sum(views), 0) from listings),
    'platforms',     (select coalesce(jsonb_object_agg(platform, c), '{}') from (select platform, count(*) c from listings where status = 'live' group by 1) x),
    'signups',       (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by d), '[]') from (
                        select g::date d, (select count(*) from profiles where created_at::date = g::date) n
                        from generate_series(current_date - 29, current_date, '1 day'::interval) g) x),
    'sales',         (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by d), '[]') from (
                        select g::date d, (select coalesce(sum(amount), 0) from orders where paid_at::date = g::date) n
                        from generate_series(current_date - 29, current_date, '1 day'::interval) g) x)
  ) into r;
  return r;
end $$;

-- 3) PEOPLE ----------------------------------------------------------------------------
-- p_kyc: null = everyone, 'any' = anyone who applied to sell, or one of pending / verified / rejected / none
create or replace function public.admin_users(p_q text default null, p_kyc text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  perform public._admin_check();
  select coalesce(jsonb_agg(row order by (row->>'created_at') desc), '[]') into r from (
    select to_jsonb(p) || jsonb_build_object(
             'listings', (select count(*) from listings l where l.seller_id = p.id),
             'bought',   (select count(*) from orders o where o.buyer_id = p.id and o.payment_status = 'paid'),
             'sold',     (select count(*) from orders o where o.seller_id = p.id and o.payment_status = 'paid')) as row
    from profiles p
    where (coalesce(p_q, '') = '' or p.email ilike '%' || p_q || '%' or p.full_name ilike '%' || p_q || '%' or p.phone ilike '%' || p_q || '%')
      and (p_kyc is null or (p_kyc = 'any' and p.kyc_status <> 'none') or p.kyc_status = p_kyc)
    order by p.created_at desc limit 300) t;
  return r;
end $$;

-- everything the seller sent when applying (works with seller_verifications or seller_applications, whichever you have)
create or replace function public.admin_kyc_detail(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  perform public._admin_check();
  begin
    if to_regclass('public.seller_applications') is not null then
      execute 'select to_jsonb(a) from public.seller_applications a where a.user_id = $1 limit 1' into r using p_user;
    end if;
  exception when others then r := null; end;
  if r is null then
    begin
      if to_regclass('public.seller_verifications') is not null then
        execute 'select to_jsonb(a) from public.seller_verifications a where a.user_id = $1 limit 1' into r using p_user;
      end if;
    exception when others then r := null; end;
  end if;
  return coalesce(r, '{}'::jsonb);
end $$;

-- approve / reject a seller
create or replace function public.admin_set_kyc(p_user uuid, p_status text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_check();
  if p_status not in ('verified', 'rejected', 'pending') then raise exception 'Bad status'; end if;
  update public.profiles
     set kyc_status = p_status, role = case when p_status = 'verified' then 'seller' else role end
   where id = p_user;
  begin
    insert into public.notifications (user_id, kind, title, body, link) values (
      p_user, 'kyc',
      case p_status when 'verified' then 'You are approved as a seller' when 'rejected' then 'Seller verification was not approved' else 'Seller verification is in review' end,
      case p_status when 'verified' then 'You can now list your accounts.' else coalesce(nullif(p_note, ''), 'Please check your details and apply again.') end,
      '/start-selling');
  exception when others then null; end;
end $$;

-- 4) LISTINGS --------------------------------------------------------------------------
create or replace function public.admin_listings(p_status text default null, p_q text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  perform public._admin_check();
  select coalesce(jsonb_agg(row order by (row->>'created_at') desc), '[]') into r from (
    select to_jsonb(l) || jsonb_build_object('seller_name', p.full_name, 'seller_email', p.email, 'seller_kyc', p.kyc_status) as row
    from listings l join profiles p on p.id = l.seller_id
    where (p_status is null or l.status = p_status)
      and (coalesce(p_q, '') = '' or l.title ilike '%' || p_q || '%' or p.full_name ilike '%' || p_q || '%')
    order by l.created_at desc limit 300) t;
  return r;
end $$;

create or replace function public.admin_set_listing(p_id uuid, p_status text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare l public.listings;
begin
  perform public._admin_check();
  if p_status not in ('pending', 'live', 'rejected') then raise exception 'Bad status'; end if;
  update public.listings set status = p_status where id = p_id and status <> 'sold' returning * into l;
  if l.id is null then raise exception 'Listing not found or already sold'; end if;
  begin
    insert into public.notifications (user_id, kind, title, body, link) values (
      l.seller_id, 'listing',
      case p_status when 'live' then 'Your listing is live' when 'rejected' then 'Your listing was not approved' else 'Your listing is in review' end,
      l.title || case when p_status = 'rejected' and coalesce(p_note, '') <> '' then ': ' || p_note else '' end,
      '/seller-dashboard');
  exception when others then null; end;
end $$;

-- 5) ORDERS AND PAYOUTS ----------------------------------------------------------------
-- p_filter: all | active | attention | ready
create or replace function public.admin_orders(p_filter text default 'all') returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  perform public._admin_check();
  select coalesce(jsonb_agg(row order by (row->>'created_at') desc), '[]') into r from (
    select to_jsonb(o) || jsonb_build_object('label', 'SM-' || o.order_no) as row
    from orders o
    where coalesce(p_filter, 'all') = 'all'
       or (p_filter = 'active'    and o.status in ('awaiting_payment', 'in_progress', 'delivered'))
       or (p_filter = 'attention' and (o.disputed or o.needs_refund))
       or (p_filter = 'ready'     and o.payout_status = 'held' and not o.disputed and o.release_at <= now())
    order by o.created_at desc limit 300) t;
  return r;
end $$;

create or replace function public.admin_order_events(p_order uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_check();
  return (select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at), '[]') from order_events e where e.order_id = p_order);
end $$;

create or replace function public.admin_release_order(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
begin perform public._admin_check(); perform public.release_order(p_order); end $$;

create or replace function public.admin_refund_order(p_order uuid, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin perform public._admin_check(); perform public.refund_order(p_order, p_note); end $$;

-- you decided the buyer's complaint is not valid: remove the block so the payout can be released
create or replace function public.admin_dismiss_dispute(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_check();
  update public.orders set disputed = false where id = p_order;
  insert into public.order_events (order_id, kind, note) values (p_order, 'dispute_closed', 'Team closed the reported problem');
end $$;

-- 6) ACCESS: only signed-in admins may call these -------------------------------------
do $$
declare f text;
begin
  foreach f in array array[
    'is_admin()', '_admin_check()', 'admin_stats()', 'admin_users(text,text)', 'admin_kyc_detail(uuid)',
    'admin_set_kyc(uuid,text,text)', 'admin_listings(text,text)', 'admin_set_listing(uuid,text,text)',
    'admin_orders(text)', 'admin_order_events(uuid)', 'admin_release_order(uuid)',
    'admin_refund_order(uuid,text)', 'admin_dismiss_dispute(uuid)']
  loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- admins may open the ID photos in the private "kyc" bucket
drop policy if exists "kyc admin read" on storage.objects;
create policy "kyc admin read" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and public.is_admin());

-- 7) MAKE YOURSELF ADMIN (replace the email with the one you sign in with, then run this one line) ------
-- update public.profiles set is_admin = true where email = 'YOUR-EMAIL@example.com';
