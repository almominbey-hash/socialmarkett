-- socialmarket MESSAGES UPGRADE
-- Run this ONCE in Supabase > SQL Editor > New query > Run. It is safe to run again.
-- Adds: unread messages, online / offline, file sending, and the seller details panel.

-- 1) NEW COLUMNS -------------------------------------------------------------
alter table public.profiles add column if not exists last_seen timestamptz;

-- "read_at": old messages are marked as read once, so nobody gets a pile of unread numbers
do $$ begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='messages' and column_name='read_at') then
    alter table public.messages add column read_at timestamptz;
    update public.messages set read_at = created_at;
  end if;
end $$;

alter table public.messages add column if not exists file_path text;
alter table public.messages add column if not exists file_name text;
alter table public.messages add column if not exists file_type text;
alter table public.messages add column if not exists file_size integer;

-- live updates for new messages
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when others then null; end $$;

-- 2) ONLINE / OFFLINE ---------------------------------------------------------
create or replace function public.touch_presence() returns void
language sql security definer set search_path = public as $$
  update public.profiles set last_seen = now() where id = auth.uid();
$$;
revoke all on function public.touch_presence() from public, anon;
grant execute on function public.touch_presence() to authenticated;

-- last seen time of the other person in each of my conversations
create or replace function public.my_chat_presence() returns table(conv_id uuid, last_seen timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id, p.last_seen
  from public.conversations c
  join public.profiles p on p.id = case when c.buyer_id = auth.uid() then c.seller_id else c.buyer_id end
  where c.buyer_id = auth.uid() or c.seller_id = auth.uid();
$$;
revoke all on function public.my_chat_presence() from public, anon;
grant execute on function public.my_chat_presence() to authenticated;

-- 3) MARK MESSAGES AS READ ------------------------------------------------------
create or replace function public.mark_chat_read(p_conv uuid) returns void
language sql security definer set search_path = public as $$
  update public.messages m set read_at = now()
  where m.conversation_id = p_conv and m.sender_id <> auth.uid() and m.read_at is null
    and exists (select 1 from public.conversations c
                where c.id = p_conv and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()));
$$;
revoke all on function public.mark_chat_read(uuid) from public, anon;
grant execute on function public.mark_chat_read(uuid) to authenticated;

-- 4) DETAILS PANEL (the other person + the account being discussed) -------------
create or replace function public.chat_peer(p_conv uuid) returns table(
  peer_name text, member_since timestamptz, last_seen timestamptz,
  listing_title text, platform text, niche text, followers integer, income numeric,
  price numeric, description text, listing_status text)
language sql stable security definer set search_path = public as $$
  select case when c.buyer_id = auth.uid() then c.seller_name else c.buyer_name end,
         p.created_at, p.last_seen,
         c.listing_title, l.platform, l.niche, l.followers, l.income, l.price, l.description, l.status
  from public.conversations c
  join public.profiles p on p.id = case when c.buyer_id = auth.uid() then c.seller_id else c.buyer_id end
  left join public.listings l on l.id = c.listing_id
  where c.id = p_conv and (c.buyer_id = auth.uid() or c.seller_id = auth.uid());
$$;
revoke all on function public.chat_peer(uuid) from public, anon;
grant execute on function public.chat_peer(uuid) to authenticated;

-- 5) FILES IN CHAT (private bucket, 10 MB each) ----------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('chat-files', 'chat-files', false, 10485760)
on conflict (id) do update set public = false, file_size_limit = 10485760;

drop policy if exists "chat files read"   on storage.objects;
drop policy if exists "chat files upload" on storage.objects;
create policy "chat files read" on storage.objects for select to authenticated
  using (bucket_id = 'chat-files' and exists (
    select 1 from public.conversations c
    where c.id::text = (storage.foldername(name))[1] and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "chat files upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-files' and exists (
    select 1 from public.conversations c
    where c.id::text = (storage.foldername(name))[1] and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
