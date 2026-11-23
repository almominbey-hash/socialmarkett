-- AVIBIX FILTERS (run once in Supabase > SQL Editor > New query > Run). Safe to run twice.
-- Run supabase/listing-categories.sql first.
-- Adds two things to every listing: monetization status (enabled / eligible / none) and account age (new / 1plus / 3plus).
-- The browse filters "Monetization" and "Account Age" use them.

alter table public.listings add column if not exists monetization text;
alter table public.listings add column if not exists account_age text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_monetization_chk' and conrelid = 'public.listings'::regclass) then
    alter table public.listings add constraint listings_monetization_chk check (monetization is null or monetization in ('enabled','eligible','none'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'listings_account_age_chk' and conrelid = 'public.listings'::regclass) then
    alter table public.listings add constraint listings_account_age_chk check (account_age is null or account_age in ('new','1plus','3plus'));
  end if;
end $$;

-- the public view now also carries both (new columns are added at the end)
create or replace view public.public_listings as
select l.id, l.seller_id, l.platform, l.niche, l.title, l.description, l.followers, l.income, l.price, l.shots, l.created_at,
       trim(split_part(p.full_name,' ',1) || ' ' || coalesce(left(nullif(split_part(p.full_name,' ',2),''),1) || '.', '')) as seller_name,
       (p.kyc_status = 'verified') as seller_verified,
       l.audience,
       l.views,
       l.tags,
       l.monetization,
       l.account_age
from public.listings l
join public.profiles p on p.id = l.seller_id
where l.status = 'live';
grant select on public.public_listings to anon, authenticated;
