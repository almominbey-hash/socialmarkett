-- v9: seller reviews. Run once in Supabase > SQL Editor.
-- A buyer can review the seller once, only after the order is completed.
-- Everybody can see a seller's reviews and how many accounts the seller has sold.

create table if not exists public.seller_reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null unique references public.orders(id) on delete cascade,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  buyer_id    uuid not null references public.profiles(id) on delete cascade,
  rating      int  not null check (rating between 1 and 5),
  comment     text check (comment is null or char_length(comment) <= 500),
  created_at  timestamptz not null default now()
);
create index if not exists seller_reviews_seller_idx on public.seller_reviews (seller_id, created_at desc);

alter table public.seller_reviews enable row level security;
revoke all on public.seller_reviews from anon, authenticated;

-- buyer leaves a review (one per order, completed orders only)
create or replace function public.leave_review(p_order uuid, p_rating int, p_comment text default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Please log in first'; end if;
  select * into o from public.orders where id = p_order;
  if not found or o.buyer_id <> uid then raise exception 'You can only review your own orders'; end if;
  if o.status <> 'completed' then raise exception 'You can review the seller once the order is completed'; end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then raise exception 'Choose 1 to 5 stars'; end if;
  if exists (select 1 from public.seller_reviews where order_id = o.id) then raise exception 'You already reviewed this order'; end if;
  insert into public.seller_reviews (order_id, seller_id, buyer_id, rating, comment)
  values (o.id, o.seller_id, uid, p_rating, nullif(left(trim(coalesce(p_comment, '')), 500), ''));
end $$;
revoke all on function public.leave_review(uuid, int, text) from public, anon, authenticated;
grant execute on function public.leave_review(uuid, int, text) to authenticated;

-- the buyer's own review of an order (null if none yet)
create or replace function public.my_review(p_order uuid) returns jsonb
language sql security definer set search_path = public stable as $$
  select to_jsonb(r) - 'id' - 'order_id' - 'seller_id' - 'buyer_id'
  from public.seller_reviews r where r.order_id = p_order and r.buyer_id = auth.uid()
$$;
revoke all on function public.my_review(uuid) from public, anon, authenticated;
grant execute on function public.my_review(uuid) to authenticated;

-- public seller card for a listing: accounts sold, average, and the latest reviews
create or replace function public.seller_card(p_listing uuid) returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare sid uuid; sold int; cnt int; avg_r numeric; rv jsonb;
begin
  select seller_id into sid from public.listings where id = p_listing;
  if sid is null then return null; end if;
  select count(*) into sold from public.orders where seller_id = sid and status = 'completed';
  select count(*), round(avg(rating)::numeric, 1) into cnt, avg_r from public.seller_reviews where seller_id = sid;
  select coalesce(jsonb_agg(x order by x.created_at desc), '[]'::jsonb) into rv from (
    select public._short_name(r.buyer_id) as name, r.rating, r.comment, r.created_at
    from public.seller_reviews r where r.seller_id = sid order by r.created_at desc limit 30) x;
  return jsonb_build_object('sold', sold, 'count', cnt, 'avg', avg_r, 'reviews', rv);
end $$;
revoke all on function public.seller_card(uuid) from public;
grant execute on function public.seller_card(uuid) to anon, authenticated;
