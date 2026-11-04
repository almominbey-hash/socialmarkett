-- OPTIONAL: run this once in Supabase > SQL Editor. It lets "Trending" rank by real saves and sales.
-- Without it, Trending still works (it ranks by verified seller and audience size).
create or replace view public.trending_scores as
select l.id as listing_id,
       (select count(*) from public.saved_items s where s.item_key = l.title) as saves,
       (select count(*) from public.listings x where x.seller_id = l.seller_id and x.status = 'sold') as seller_sold
from public.listings l
where l.status = 'live';

grant select on public.trending_scores to anon, authenticated;
