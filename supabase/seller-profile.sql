-- AVIBIX SELLER PROFILE (run once in Supabase > SQL Editor > New query > Run). Safe to run twice.
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

-- 5) SELLERS WHO ALREADY APPLIED: their seller name, country, city and "about you" appear in the profile automatically ---
-- The seller application form saved these in one of your tables (it has a "display_name" column). This finds that table by itself.
-- It never touches the ID name, phone, ID number or ID photos, and it never overwrites what the seller already wrote in the profile.
create or replace function public._app_table() returns text language sql stable security definer set search_path = public as $$
  select c.table_name::text from information_schema.columns c
  where c.table_schema = 'public' and c.column_name = 'display_name' and c.table_name not in ('profiles')
  order by (c.table_name like '%applic%') desc, c.table_name limit 1
$$;
revoke all on function public._app_table() from public, anon, authenticated;

create or replace function public._app_key(t text) returns text language sql stable security definer set search_path = public as $$
  select c.column_name::text from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = t and c.column_name in ('user_id','profile_id','applicant_id','id')
  order by array_position(array['user_id','profile_id','applicant_id','id'], c.column_name::text) limit 1
$$;
revoke all on function public._app_key(text) from public, anon, authenticated;

-- what the signed-in person gave when applying (only these four things)
create or replace function public.seller_profile_defaults() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); t text := public._app_table(); k text; r jsonb;
begin
  if uid is null or t is null then return null; end if;
  k := public._app_key(t); if k is null then return null; end if;
  execute format('select to_jsonb(x) from public.%I x where x.%I = $1 limit 1', t, k) into r using uid;
  if r is null then return null; end if;
  return jsonb_build_object('display_name', r->>'display_name', 'country', r->>'country', 'city', r->>'city', 'bio', r->>'bio');
end $$;
revoke all on function public.seller_profile_defaults() from public, anon;
grant execute on function public.seller_profile_defaults() to authenticated;

-- keeps the profile filled for new applications too
create or replace function public._sync_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare j jsonb := to_jsonb(new); uid uuid;
begin
  begin
    uid := coalesce(nullif(j->>'user_id',''), nullif(j->>'profile_id',''), nullif(j->>'applicant_id',''), nullif(j->>'id',''))::uuid;
    update public.profiles set
      seller_name = coalesce(nullif(trim(seller_name), ''), nullif(left(trim(j->>'display_name'), 40), '')),
      country     = coalesce(nullif(country, ''), nullif(left(trim(j->>'country'), 60), '')),
      city        = coalesce(nullif(city, ''), nullif(left(trim(j->>'city'), 60), '')),
      about       = coalesce(nullif(about, ''), nullif(left(trim(j->>'bio'), 600), ''))
    where id = uid;
  exception when others then null;   -- never block an application
  end;
  return new;
end $$;

-- fill the profiles of everybody who already applied, and attach the trigger
do $$
declare t text := public._app_table(); k text;
begin
  if t is null then raise notice 'No seller application table with a display_name column was found. Profiles stay blank until sellers type them.'; return; end if;
  k := public._app_key(t);
  if k is null then raise notice 'Found table %, but no user id column.', t; return; end if;
  raise notice 'Seller application table found: % (user column: %)', t, k;
  execute format($f$
    update public.profiles p set
      seller_name = coalesce(nullif(trim(p.seller_name), ''), nullif(left(trim(to_jsonb(x)->>'display_name'), 40), '')),
      country     = coalesce(nullif(p.country, ''), nullif(left(trim(to_jsonb(x)->>'country'), 60), '')),
      city        = coalesce(nullif(p.city, ''), nullif(left(trim(to_jsonb(x)->>'city'), 60), '')),
      about       = coalesce(nullif(p.about, ''), nullif(left(trim(to_jsonb(x)->>'bio'), 600), ''))
    from public.%I x where p.id = x.%I$f$, t, k);
  execute format('drop trigger if exists sm_sync_application on public.%I', t);
  execute format('create trigger sm_sync_application after insert or update on public.%I for each row execute function public._sync_application()', t);
exception when others then
  raise notice 'Skipped automatic fill: %', sqlerrm;
end $$;
