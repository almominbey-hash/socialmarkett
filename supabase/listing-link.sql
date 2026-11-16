-- Shows the account link / username the seller entered on the listing page (visible to everyone).
-- Paste this whole file in Supabase > SQL Editor > New query > Run. Safe to run again.
-- Run it AFTER supabase/filters.sql (it keeps every column and adds account_link at the end).

create or replace view public.public_listings as
select l.id, l.seller_id, l.platform, l.niche, l.title, l.description, l.followers, l.income, l.price, l.shots, l.created_at,
       trim(split_part(p.full_name,' ',1) || ' ' || coalesce(left(nullif(split_part(p.full_name,' ',2),''),1) || '.', '')) as seller_name,
       (p.kyc_status = 'verified') as seller_verified,
       l.audience,
       l.views,
       l.tags,
       l.monetization,
       l.account_age,
       l.account_link
from public.listings l
join public.profiles p on p.id = l.seller_id
where l.status = 'live';
grant select on public.public_listings to anon, authenticated;
