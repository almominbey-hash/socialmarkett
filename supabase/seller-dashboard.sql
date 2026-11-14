-- socialmarket SELLER DASHBOARD (run once in Supabase > SQL Editor > New query > Run). Safe to run twice.
-- One function gives an approved seller all his numbers. It only ever reads HIS OWN rows
-- (orders where he is the seller, his listings, his chats), so nobody can see another seller's data.
-- Needs supabase/orders.sql, orders-2.sql and messages-upgrade.sql to be already run (they were part of your setup).

create or replace function public.seller_dashboard() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  o jsonb; m jsonb; ls jsonb; ro jsonb; rl jsonb;
  convs int := 0; unread int := 0; convlist jsonb := '[]'::jsonb;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  if not exists (select 1 from public.profiles where id = uid and kyc_status = 'verified') then
    raise exception 'Only approved sellers can open the seller dashboard';
  end if;

  -- orders (as seller)
  select jsonb_build_object(
    'total',      count(*),
    'unpaid',     count(*) filter (where status = 'awaiting_payment'),
    'paid',       count(*) filter (where payment_status = 'paid'),
    'to_deliver', count(*) filter (where status = 'in_progress'),
    'delivered',  count(*) filter (where status = 'delivered'),
    'completed',  count(*) filter (where status = 'completed'),
    'cancelled',  count(*) filter (where status = 'cancelled'),
    'disputed',   count(*) filter (where disputed and status <> 'cancelled'))
  into o from public.orders where seller_id = uid;

  -- money (all in PKR): released = already paid to him, held = waiting (escrow), gross = total value of paid sales
  select jsonb_build_object(
    'released', coalesce(sum(case when payout_status = 'released' then amount - fee end), 0),
    'held',     coalesce(sum(case when payout_status = 'held'     then amount - fee end), 0),
    'gross',    coalesce(sum(case when payment_status = 'paid' and status <> 'cancelled' then amount end), 0))
  into m from public.orders where seller_id = uid;

  -- listings
  select jsonb_build_object(
    'total',    count(*),
    'pending',  count(*) filter (where status = 'pending'),
    'live',     count(*) filter (where status = 'live'),
    'sold',     count(*) filter (where status = 'sold'),
    'rejected', count(*) filter (where status = 'rejected'))
  into ls from public.listings where seller_id = uid;

  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) into rl
  from (select id, title, platform, price, followers, status, created_at
        from public.listings where seller_id = uid order by created_at desc limit 8) x;

  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) into ro
  from (select id, order_no, listing_title, platform, buyer_name, amount, (amount - fee) as earning, currency,
               status, payment_status, payout_status, disputed, release_at, created_at
        from public.orders where seller_id = uid order by created_at desc limit 8) x;

  -- messages (people who wrote to him about his accounts)
  select count(*) into convs from public.conversations where seller_id = uid;
  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) into convlist
  from (select id, listing_title, buyer_name as other_name, updated_at, 0 as unread
        from public.conversations where seller_id = uid order by updated_at desc limit 6) x;
  begin
    select count(*) into unread
    from public.messages mm join public.conversations c on c.id = mm.conversation_id
    where c.seller_id = uid and mm.sender_id <> uid and mm.read_at is null;
    select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) into convlist
    from (select c.id, c.listing_title, c.buyer_name as other_name, c.updated_at,
                 (select count(*) from public.messages mm
                   where mm.conversation_id = c.id and mm.sender_id <> uid and mm.read_at is null) as unread
          from public.conversations c where c.seller_id = uid order by c.updated_at desc limit 6) x;
  exception when others then
    null; -- messages-upgrade.sql not run yet: dashboard still works, unread just shows 0
  end;

  return jsonb_build_object('orders', o, 'money', m, 'listings', ls,
    'recent_orders', ro, 'recent_listings', rl,
    'messages', jsonb_build_object('conversations', convs, 'unread', unread, 'recent', convlist));
end $$;

revoke all on function public.seller_dashboard() from public, anon;
grant execute on function public.seller_dashboard() to authenticated;
