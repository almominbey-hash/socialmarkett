-- ONLY run this if you already ran listing-link.sql and want everything back exactly as before.
-- It removes the extra account_link view and puts your original public_listings view back. Safe to run twice.
do $$
begin
  if exists (select 1 from pg_views where schemaname = 'public' and viewname = 'public_listings_base') then
    drop view if exists public.public_listings;
    alter view public.public_listings_base rename to public_listings;
    grant select on public.public_listings to anon, authenticated;
  end if;
end $$;
