-- socialmarket ORDERS, part 2 (run AFTER orders.sql). Safe to run twice.
-- Adds: the account picture on each order, stars (Starred tab), and "You earned $X" for sellers.

-- 1) account picture saved on the order
alter table public.orders add column if not exists listing_image text;
grant select (listing_image) on public.orders to authenticated;

-- Buy now: same as before, but also remembers the first screenshot of the account.
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

  insert into public.orders (listing_id, listing_title, listing_image, platform, buyer_id, seller_id, buyer_name, seller_name, amount)
  values (l.id, l.title, l.shots[1], l.platform, uid, l.seller_id, public._short_name(uid), public._short_name(l.seller_id), l.price)
  returning id into oid;
  insert into public.order_events (order_id, kind, note) values (oid, 'created', 'Order created');
  return oid;
end $$;
revoke all on function public.create_order(uuid) from public, anon, authenticated;
grant execute on function public.create_order(uuid) to authenticated;

-- 2) what the seller earns (amount minus your fee). Only the seller of that order gets a number.
create or replace function public.order_earning(p_order uuid) returns numeric
language sql stable security definer set search_path = public as $$
  select amount - fee from public.orders where id = p_order and seller_id = auth.uid()
$$;
revoke all on function public.order_earning(uuid) from public, anon, authenticated;
grant execute on function public.order_earning(uuid) to authenticated;

-- 3) stars
create table if not exists public.order_stars (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  primary key (user_id, order_id)
);
alter table public.order_stars enable row level security;
revoke all on public.order_stars from anon, authenticated;
grant select, insert, delete on public.order_stars to authenticated;
drop policy if exists "own order stars" on public.order_stars;
create policy "own order stars" on public.order_stars for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (
    select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())));
