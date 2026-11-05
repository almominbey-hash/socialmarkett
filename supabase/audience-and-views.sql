-- Run this ONCE in Supabase > SQL Editor (it is safe to run again).
-- 1) Adds an "audience" tag (Pakistan, United Kingdom, ...) and a view counter to every listing.
-- 2) Shows both in the public listings view, so filters, cards, Trending and "An audience worth building on" can use them.

alter table public.listings add column if not exists audience text;
alter table public.listings add column if not exists views integer not null default 0;

create or replace view public.public_listings as
select l.id, l.seller_id, l.platform, l.niche, l.title, l.description, l.followers, l.income, l.price, l.shots, l.created_at,
       trim(split_part(p.full_name,' ',1) || ' ' || coalesce(left(nullif(split_part(p.full_name,' ',2),''),1) || '.', '')) as seller_name,
       (p.kyc_status = 'verified') as seller_verified,
       l.audience,
       l.views
from public.listings l
join public.profiles p on p.id = l.seller_id
where l.status = 'live';

grant select on public.public_listings to anon, authenticated;

-- Counts one view when someone opens a listing (the website calls this once per visitor per listing).
create or replace function public.bump_listing_view(listing uuid) returns void
language sql security definer set search_path = public as $$
  update public.listings set views = views + 1 where id = listing and status = 'live';
$$;
grant execute on function public.bump_listing_view(uuid) to anon, authenticated;

-- Trending ranking (saves + sales + views). Replaces trending.sql, you do not need to run both.
create or replace view public.trending_scores as
select l.id as listing_id,
       (select count(*) from public.saved_items s where s.item_key = l.title) as saves,
       (select count(*) from public.listings x where x.seller_id = l.seller_id and x.status = 'sold') as seller_sold
from public.listings l
where l.status = 'live';
grant select on public.trending_scores to anon, authenticated;
