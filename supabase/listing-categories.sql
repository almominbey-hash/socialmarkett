-- socialmarket LISTING CATEGORIES (run once in Supabase > SQL Editor > New query > Run). Safe to run twice.
-- 1) Listings remember their categories (Monetized / Fresh / Aged, USA audience ...) so that clicking
--    YouTube > Monetized on the website shows exactly those accounts.
-- 2) Any platform name is allowed, so a new platform added in js/01-config.js works without more SQL.
-- 3) Description limit (about 500 words) and PKR as the money currency for orders.
-- Run supabase/audience-and-views.sql first if you have not (it adds the audience column).

alter table public.listings add column if not exists tags text[] not null default '{}';

-- allow any platform name (the old rule allowed only 5 names)
do $$
declare c record;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.listings'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%platform%' loop
    execute format('alter table public.listings drop constraint %I', c.conname);
  end loop;
end $$;

-- description: 500 words is about 3500 letters; 6000 leaves room (the website itself enforces 500 words)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_desc_max' and conrelid = 'public.listings'::regclass) then
    alter table public.listings add constraint listings_desc_max check (char_length(description) <= 6000) not valid;
  end if;
end $$;

-- the public view now also carries the tags
create or replace view public.public_listings as
select l.id, l.seller_id, l.platform, l.niche, l.title, l.description, l.followers, l.income, l.price, l.shots, l.created_at,
       trim(split_part(p.full_name,' ',1) || ' ' || coalesce(left(nullif(split_part(p.full_name,' ',2),''),1) || '.', '')) as seller_name,
       (p.kyc_status = 'verified') as seller_verified,
       l.audience,
       l.views,
       l.tags
from public.listings l
join public.profiles p on p.id = l.seller_id
where l.status = 'live';
grant select on public.public_listings to anon, authenticated;

-- money is shown in PKR everywhere: new orders are PKR, and existing orders (priced from Rs. listings) are marked PKR
alter table public.orders alter column currency set default 'PKR';
update public.orders set currency = 'PKR' where currency = 'USD';
