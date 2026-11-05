-- socialmarket ORDERS (step 1: database).
-- Paste this whole file in Supabase > SQL Editor > New query > Run. Safe to run once.
--
-- How money works here:
--   buyer pays (gateway webhook calls mark_order_paid)  -> order is "in progress", payout is HELD
--   seller delivers                                      -> 24 hour hold starts (release_at)
--   after release_at, YOUR TEAM runs release_order()     -> seller is paid, order is "completed"
-- Buyer can report a problem during the hold; that blocks release until you decide.

-- 1) TABLES ---------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_no           bigint generated always as identity (start with 1001) unique,
  listing_id         uuid references public.listings(id) on delete set null,
  listing_title      text not null,
  platform           text not null,
  buyer_id           uuid not null references public.profiles(id) on delete restrict,
  seller_id          uuid not null references public.profiles(id) on delete restrict,
  buyer_name         text not null,
  seller_name        text not null,
  amount             numeric(12,2) not null check (amount > 0),
  fee                numeric(12,2) not null default 0 check (fee >= 0),
  currency           text not null default 'USD',
  status             text not null default 'awaiting_payment'
                     check (status in ('awaiting_payment','in_progress','delivered','completed','cancelled')),
  payment_status     text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  gateway            text,
  gateway_ref        text,
  paid_at            timestamptz,
  delivered_at       timestamptz,
  completed_at       timestamptz,
  cancelled_at       timestamptz,
  release_at         timestamptz,
  payout_status      text not null default 'none' check (payout_status in ('none','held','released','refunded')),
  payout_released_at timestamptz,
  payout_note        text,
  disputed           boolean not null default false,
  dispute_note       text,
  needs_refund       boolean not null default false,
  created_at         timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

create unique index if not exists orders_gateway_ref_uq on public.orders (gateway, gateway_ref) where gateway_ref is not null;
create unique index if not exists orders_one_unpaid_uq  on public.orders (listing_id, buyer_id) where status = 'awaiting_payment';
create index if not exists orders_buyer_idx  on public.orders (buyer_id,  created_at desc);
create index if not exists orders_seller_idx on public.orders (seller_id, created_at desc);

create table if not exists public.order_events (
  id         bigint generated always as identity primary key,
  order_id   uuid not null references public.orders(id) on delete cascade,
  kind       text not null,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- 2) SMALL HELPERS (not callable from the website) ----------------------------
create or replace function public._short_name(p_user uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select nullif(trim(split_part(full_name,' ',1) || ' ' ||
              coalesce(left(nullif(split_part(full_name,' ',2),''),1) || '.', '')), '')
       from public.profiles where id = p_user),
    'User')
$$;

-- Adds a bell notification. If the notifications table ever differs, the order still works.
create or replace function public._notify(p_user uuid, p_kind text, p_title text, p_body text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, kind, title, body, link)
  values (p_user, p_kind, p_title, p_body, '/order');
exception when others then
  null;
end $$;

revoke all on function public._short_name(uuid) from public, anon, authenticated;
revoke all on function public._notify(uuid,text,text,text) from public, anon, authenticated;

-- 3) WHAT BUYERS AND SELLERS CAN DO -------------------------------------------
-- Buyer taps "Buy now": creates the order and its Order ID.
create or replace function public.create_order(p_listing uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); l public.listings; oid uuid;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into l from public.listings where id = p_listing and status = 'live';
  if not found then raise exception 'This listing is not available'; end if;
  if l.seller_id = uid then raise exception 'This is your own listing'; end if;

  select id into oid from public.orders
   where listing_id = l.id and buyer_id = uid and status = 'awaiting_payment' limit 1;
  if oid is not null then return oid; end if;

  insert into public.orders (listing_id, listing_title, platform, buyer_id, seller_id, buyer_name, seller_name, amount)
  values (l.id, l.title, l.platform, uid, l.seller_id, public._short_name(uid), public._short_name(l.seller_id), l.price)
  returning id into oid;
  insert into public.order_events (order_id, kind, note) values (oid, 'created', 'Order created');
  return oid;
end $$;

-- Buyer cancels an order that is not paid yet.
create or replace function public.cancel_order(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); o public.orders;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into o from public.orders where id = p_order and buyer_id = uid for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status <> 'awaiting_payment' then raise exception 'Only an unpaid order can be cancelled here'; end if;
  update public.orders set status = 'cancelled', cancelled_at = now() where id = o.id;
  insert into public.order_events (order_id, kind, note) values (o.id, 'cancelled', 'Cancelled by buyer');
end $$;

-- Seller says "I gave the account". The 24 hour hold starts now.
create or replace function public.mark_delivered(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); o public.orders;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into o from public.orders where id = p_order and seller_id = uid for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status <> 'in_progress' or o.payment_status <> 'paid' then raise exception 'This order cannot be delivered yet'; end if;
  update public.orders set status = 'delivered', delivered_at = now(), release_at = now() + interval '24 hours' where id = o.id;
  insert into public.order_events (order_id, kind, note) values (o.id, 'delivered', 'Seller delivered the account');
  perform public._notify(o.buyer_id, 'order', 'Order delivered',
    'Order SM-' || o.order_no || ' was delivered. Please check it and confirm.');
end $$;

-- Buyer says "I got the account and it is fine".
create or replace function public.confirm_received(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); o public.orders;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into o from public.orders where id = p_order and buyer_id = uid for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status <> 'delivered' then raise exception 'This order is not waiting for your confirmation'; end if;
  if o.disputed then raise exception 'A problem was reported on this order'; end if;
  update public.orders set status = 'completed', completed_at = now() where id = o.id;
  insert into public.order_events (order_id, kind, note) values (o.id, 'completed', 'Buyer confirmed');
  perform public._notify(o.buyer_id, 'order_done', 'Order completed', 'Thank you! Order SM-' || o.order_no || ' is completed.');
  perform public._notify(o.seller_id, 'order_done', 'Buyer confirmed',
    'Order SM-' || o.order_no || ' is confirmed. Your payout is released after the 24 hour hold.');
end $$;

-- Buyer reports a problem while the money is still held.
create or replace function public.report_problem(p_order uuid, p_note text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); o public.orders;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into o from public.orders where id = p_order and buyer_id = uid for update;
  if not found then raise exception 'Order not found'; end if;
  if o.payout_status <> 'held' or o.status not in ('delivered','completed') then
    raise exception 'A problem can only be reported while the payment is held';
  end if;
  update public.orders set disputed = true, dispute_note = left(coalesce(p_note,''), 1000) where id = o.id;
  insert into public.order_events (order_id, kind, note) values (o.id, 'dispute', left(coalesce(p_note,''), 300));
  perform public._notify(o.seller_id, 'order', 'Problem reported',
    'The buyer reported a problem on order SM-' || o.order_no || '. Our team will contact you.');
end $$;

-- 4) CALLED BY THE PAYMENT GATEWAY WEBHOOK (service role only) ---------------
create or replace function public.mark_order_paid(p_order uuid, p_gateway text, p_ref text, p_amount numeric)
returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders; n int;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if o.payment_status = 'paid' then return; end if;               -- webhook sent twice: ignore

  if o.status <> 'awaiting_payment' or p_amount < o.amount then   -- money arrived but order cannot proceed
    update public.orders set needs_refund = true, gateway = p_gateway, gateway_ref = p_ref,
           payout_note = 'Payment ' || p_amount || ' received, order status ' || o.status || ', expected ' || o.amount
     where id = o.id;
    insert into public.order_events (order_id, kind, note) values (o.id, 'review', 'Payment needs team review');
    return;
  end if;

  update public.listings set status = 'sold' where id = o.listing_id and status = 'live';
  get diagnostics n = row_count;

  if o.listing_id is not null and n = 0 then                      -- someone else bought it first
    update public.orders set status = 'cancelled', cancelled_at = now(), payment_status = 'paid', paid_at = now(),
           gateway = p_gateway, gateway_ref = p_ref, needs_refund = true,
           payout_note = 'Account was already sold: refund the buyer'
     where id = o.id;
    insert into public.order_events (order_id, kind, note) values (o.id, 'cancelled', 'Account no longer available');
    perform public._notify(o.buyer_id, 'order', 'Order cancelled',
      'Sorry, this account was sold to someone else. You will be refunded.');
    return;
  end if;

  update public.orders set status = 'in_progress', payment_status = 'paid', paid_at = now(),
         payout_status = 'held', gateway = p_gateway, gateway_ref = p_ref
   where id = o.id;
  insert into public.order_events (order_id, kind, note) values (o.id, 'paid', 'Payment received');
  perform public._notify(o.buyer_id, 'payment', 'Payment received',
    'We received your payment for order SM-' || o.order_no || '. The seller will deliver soon.');
  perform public._notify(o.seller_id, 'order', 'New paid order',
    'Order SM-' || o.order_no || ' is paid. Please deliver the account and mark it as delivered.');
end $$;

-- 5) FOR YOUR TEAM (run in the SQL Editor; the website cannot call these) -----
-- After the 24 hour hold: pay the seller, finish the order.
create or replace function public.release_order(p_order uuid) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if o.payout_status <> 'held' then raise exception 'Payout is not held'; end if;
  if o.release_at is null or o.release_at > now() then raise exception 'The 24 hour hold is not over yet'; end if;
  if o.disputed then raise exception 'This order has a reported problem'; end if;
  update public.orders set payout_status = 'released', payout_released_at = now(), status = 'completed',
         completed_at = coalesce(completed_at, now()) where id = o.id;
  insert into public.order_events (order_id, kind, note) values (o.id, 'released', 'Payout released to seller');
  perform public._notify(o.seller_id, 'payment', 'Payout released', 'Your payout for order SM-' || o.order_no || ' was released.');
  perform public._notify(o.buyer_id, 'order_done', 'Order completed', 'Order SM-' || o.order_no || ' is completed.');
end $$;

-- Give the money back to the buyer (you send the refund from the gateway; this records it).
create or replace function public.refund_order(p_order uuid, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'Order not found'; end if;
  if o.payment_status <> 'paid' then raise exception 'This order was not paid'; end if;
  update public.orders set payment_status = 'refunded', payout_status = 'refunded', status = 'cancelled',
         cancelled_at = coalesce(cancelled_at, now()), needs_refund = false, disputed = false,
         payout_note = coalesce(p_note, payout_note) where id = o.id;
  update public.listings set status = 'live'
   where id = o.listing_id and status = 'sold'
     and not exists (select 1 from public.orders x where x.listing_id = o.listing_id and x.id <> o.id
                      and x.payment_status = 'paid' and x.status <> 'cancelled');
  insert into public.order_events (order_id, kind, note) values (o.id, 'refunded', 'Payment refunded to buyer');
  perform public._notify(o.buyer_id, 'payment', 'Refund', 'Order SM-' || o.order_no || ' was refunded.');
  perform public._notify(o.seller_id, 'order', 'Order cancelled', 'Order SM-' || o.order_no || ' was cancelled and refunded.');
end $$;

-- Lists for your team
create or replace view public.orders_ready_to_release as
select id, 'SM-' || order_no as order_id, seller_id, seller_name, listing_title, amount, fee, (amount - fee) as pay_seller, release_at
from public.orders
where payout_status = 'held' and not disputed and release_at <= now()
order by release_at;

create or replace view public.orders_needing_attention as
select id, 'SM-' || order_no as order_id, status, payment_status, disputed, dispute_note, needs_refund, payout_note, amount, created_at
from public.orders
where disputed or needs_refund
order by created_at;

-- 6) ACCESS RULES --------------------------------------------------------------
alter table public.orders       enable row level security;
alter table public.order_events enable row level security;

revoke all on public.orders, public.order_events from anon, authenticated;
revoke all on public.orders_ready_to_release, public.orders_needing_attention from anon, authenticated;

grant select (id, order_no, listing_id, listing_title, platform, buyer_id, seller_id, buyer_name, seller_name,
              amount, currency, status, payment_status, paid_at, delivered_at, completed_at, cancelled_at,
              release_at, payout_status, disputed, created_at)
  on public.orders to authenticated;
create policy "own orders" on public.orders for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

grant select (order_id, kind, note, created_at) on public.order_events to authenticated;
create policy "own order events" on public.order_events for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())));

revoke all on function public.create_order(uuid)              from public, anon, authenticated;
revoke all on function public.cancel_order(uuid)              from public, anon, authenticated;
revoke all on function public.mark_delivered(uuid)            from public, anon, authenticated;
revoke all on function public.confirm_received(uuid)          from public, anon, authenticated;
revoke all on function public.report_problem(uuid,text)       from public, anon, authenticated;
revoke all on function public.mark_order_paid(uuid,text,text,numeric) from public, anon, authenticated;
revoke all on function public.release_order(uuid)             from public, anon, authenticated;
revoke all on function public.refund_order(uuid,text)         from public, anon, authenticated;

grant execute on function public.create_order(uuid)        to authenticated;
grant execute on function public.cancel_order(uuid)        to authenticated;
grant execute on function public.mark_delivered(uuid)      to authenticated;
grant execute on function public.confirm_received(uuid)    to authenticated;
grant execute on function public.report_problem(uuid,text) to authenticated;
grant execute on function public.mark_order_paid(uuid,text,text,numeric) to service_role;
