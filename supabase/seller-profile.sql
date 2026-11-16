-- socialmarket SELLER PROFILE (run once in Supabase > SQL Editor > New query > Run). Safe to run twice.
-- Gives every user a public "seller name", a profile picture and a short "About".
-- The name written on the ID card (profiles.full_name) is NEVER shown to buyers once a seller name is set.
-- Run it after supabase/listing-categories.sql, supabase/filters.sql and supabase/orders.sql (already part of your setup).

-- 1) NEW COLUMNS ---------------------------------------------------------------
alter table public.profiles add column if not exists seller_name text;
alter table public.profiles add column if not exists avatar_url  text;
alter table public.profiles add column if not exists about       text;
alter table public.profiles add column if not exists country     text;
alter table public.profiles add column if not exists city        text;

-- 2) PROFILE PICTURE STORAGE (public, 5 MB, one folder per user) -----------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "avatars upload own" on storage.objects;
create policy "avatars upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3) SAVE MY PROFILE (the only way to change these things) ----------------
-- p_avatar: null = keep the current picture, '' = remove it, a link = new picture (must be inside my own folder)
drop function if exists public.save_profile(text, text, text);
create or replace function public.save_profile(p_seller_name text, p_about text, p_avatar text default null, p_country text default null, p_city text default null)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); sn text := nullif(regexp_replace(trim(coalesce(p_seller_name, '')), '\s+', ' ', 'g'), '');
        ab text := nullif(trim(coalesce(p_about, '')), '');
begin
  if uid is null then raise exception 'Please log in first'; end if;
  if sn is null or char_length(sn) < 2 or char_length(sn) > 40 then raise exception 'Seller name must be 2 to 40 letters'; end if;
  if ab is not null and char_length(ab) > 600 then raise exception 'About can be up to 600 letters'; end if;
  if p_avatar is not null and p_avatar <> '' and p_avatar not like '%/storage/v1/object/public/avatars/' || uid::text || '/%' then
    raise exception 'Invalid picture';
  end if;
  update public.profiles
     set seller_name = sn,
         about       = ab,
         avatar_url  = case when p_avatar is null then avatar_url when p_avatar = '' then null else p_avatar end,
         country     = nullif(left(trim(coalesce(p_country, '')), 60), ''),
         city        = nullif(left(trim(coalesce(p_city, '')), 60), '')
   where id = uid;
end $$;
revoke all on function public.save_profile(text, text, text, text, text) from public, anon;
grant execute on function public.save_profile(text, text, text, text, text) to authenticated;

-- 4) BUYERS SEE THE SELLER NAME, NOT THE ID NAME --------------------------------
-- (used by orders and chats too)
create or replace function public._short_name(p_user uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select coalesce(nullif(trim(seller_name), ''),
              nullif(trim(split_part(full_name,' ',1) || ' ' ||
                coalesce(left(nullif(split_part(full_name,' ',2),''),1) || '.', '')), ''))
       from public.profiles where id = p_user),
    'User')
$$;

-- the public view: seller_name now comes from the profile (ID name only as a fallback); the picture is added at the end
create or replace view public.public_listings as
select l.id, l.seller_id, l.platform, l.niche, l.title, l.description, l.followers, l.income, l.price, l.shots, l.created_at,
       coalesce(nullif(trim(p.seller_name), ''),
                trim(split_part(p.full_name,' ',1) || ' ' || coalesce(left(nullif(split_part(p.full_name,' ',2),''),1) || '.', ''))) as seller_name,
       (p.kyc_status = 'verified') as seller_verified,
       l.audience,
       l.views,
       l.tags,
       l.monetization,
       l.account_age,
       p.avatar_url as seller_avatar
from public.listings l
join public.profiles p on p.id = l.seller_id
where l.status = 'live';
grant select on public.public_listings to anon, authenticated;
