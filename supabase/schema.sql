-- socialmarket database. Paste this whole file in Supabase > SQL Editor > New query > Run.
-- Safe to run once on a new project.

-- 1) TABLES ---------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        text not null default 'member' check (role in ('member','seller')),
  kyc_status  text not null default 'none'   check (kyc_status in ('none','pending','verified','rejected')),
  created_at  timestamptz not null default now()
);

create table public.seller_verifications (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  full_name    text not null,
  phone        text not null,
  id_type      text not null,
  id_number    text not null,
  payout       text not null,
  front_path   text not null,
  back_path    text not null,
  submitted_at timestamptz not null default now()
);

create table public.listings (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  platform     text not null check (platform in ('YouTube','Instagram','TikTok','Facebook','Gaming')),
  niche        text not null,
  title        text not null check (char_length(title) between 5 and 80),
  description  text not null check (char_length(description) >= 20),
  followers    integer not null check (followers >= 0),
  income       numeric not null default 0 check (income >= 0),
  price        numeric not null check (price > 0),
  account_link text not null,
  shots        text[] not null default '{}',
  status       text not null default 'pending' check (status in ('pending','live','sold','rejected')),
  created_at   timestamptz not null default now()
);

create table public.saved_items (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  item_key text not null,
  primary key (user_id, item_key)
);

create table public.conversations (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references public.listings(id) on delete set null,
  listing_title text not null,
  buyer_id      uuid not null references public.profiles(id) on delete cascade,
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  buyer_name    text not null,
  seller_name   text not null,
  updated_at    timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

create table public.messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 2000),
  created_at      timestamptz not null default now()
);

-- 2) NEW SIGN UP -> PROFILE ROW --------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- 3) SELLER VERIFICATION (only way to become a seller) ----------------------
create function public.submit_verification(
  p_full_name text, p_phone text, p_id_type text, p_id_number text,
  p_payout text, p_front text, p_back text
) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not signed in'; end if;
  if p_front not like uid::text || '/%' or p_back not like uid::text || '/%' then
    raise exception 'Invalid file path';
  end if;
  insert into public.seller_verifications (user_id, full_name, phone, id_type, id_number, payout, front_path, back_path)
  values (uid, p_full_name, p_phone, p_id_type, p_id_number, p_payout, p_front, p_back)
  on conflict (user_id) do update set
    full_name = excluded.full_name, phone = excluded.phone, id_type = excluded.id_type,
    id_number = excluded.id_number, payout = excluded.payout,
    front_path = excluded.front_path, back_path = excluded.back_path, submitted_at = now();
  update public.profiles
     set full_name = p_full_name, phone = p_phone, role = 'seller', kyc_status = 'pending'
   where id = uid and kyc_status in ('none','rejected');
end $$;

revoke all on function public.submit_verification(text,text,text,text,text,text,text) from public, anon;
grant execute on function public.submit_verification(text,text,text,text,text,text,text) to authenticated;

-- 3b) CONTACT SELLER (buyer opens a chat about a live listing) --------------
create function public.start_conversation(p_listing uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); l public.listings; bn text; sn text; cid uuid;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into l from public.listings where id = p_listing and status = 'live';
  if not found then raise exception 'This listing is not available'; end if;
  if l.seller_id = uid then raise exception 'This is your own listing'; end if;
  select coalesce(full_name, 'Buyer') into bn from public.profiles where id = uid;
  select coalesce(full_name, 'Seller') into sn from public.profiles where id = l.seller_id;
  insert into public.conversations (listing_id, listing_title, buyer_id, seller_id, buyer_name, seller_name)
  values (l.id, l.title, uid, l.seller_id, bn, sn)
  on conflict (listing_id, buyer_id) do nothing;
  select id into cid from public.conversations where listing_id = l.id and buyer_id = uid;
  return cid;
end $$;
revoke all on function public.start_conversation(uuid) from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;

create function public.touch_conversation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end $$;
create trigger on_message_added after insert on public.messages for each row execute function public.touch_conversation();

-- 4) WHAT THE PUBLIC CAN SEE (live listings only, no account link, no ID data)
create view public.public_listings as
select l.id, l.seller_id, l.platform, l.niche, l.title, l.description, l.followers, l.income, l.price, l.shots, l.created_at,
       trim(split_part(p.full_name,' ',1) || ' ' || coalesce(left(nullif(split_part(p.full_name,' ',2),''),1) || '.', '')) as seller_name,
       (p.kyc_status = 'verified') as seller_verified
from public.listings l
join public.profiles p on p.id = l.seller_id
where l.status = 'live';

-- 5) ACCESS RULES (Row Level Security) ---------------------------------------
alter table public.profiles             enable row level security;
alter table public.seller_verifications enable row level security;
alter table public.listings             enable row level security;
alter table public.saved_items          enable row level security;
alter table public.conversations        enable row level security;
alter table public.messages             enable row level security;

revoke all on public.profiles, public.seller_verifications, public.listings, public.saved_items, public.conversations, public.messages from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy "own profile read"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- seller_verifications: no direct access at all (only submit_verification() and you, in the dashboard)

grant select, insert, delete on public.listings to authenticated;
create policy "own listings read" on public.listings for select to authenticated using (seller_id = auth.uid());
create policy "own listings add"  on public.listings for insert to authenticated with check (
  seller_id = auth.uid() and status = 'pending'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kyc_status in ('pending','verified'))
);
create policy "own listings delete" on public.listings for delete to authenticated using (seller_id = auth.uid() and status = 'pending');

grant select, insert, delete on public.saved_items to authenticated;
create policy "own saved" on public.saved_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select on public.conversations to authenticated;
create policy "own conversations" on public.conversations for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid());

grant select, insert on public.messages to authenticated;
create policy "read my messages" on public.messages for select to authenticated using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "send my messages" on public.messages for insert to authenticated with check (
  sender_id = auth.uid() and exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));

grant select on public.public_listings to anon, authenticated;

-- 6) FILE STORAGE -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('kyc',           'kyc',           false, 8388608, array['image/jpeg','image/png','image/webp','image/heic']),
  ('listing-shots', 'listing-shots', true,  8388608, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

create policy "kyc upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kyc read own" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "shots upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-shots' and (storage.foldername(name))[1] = auth.uid()::text);
