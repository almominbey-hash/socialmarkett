-- AVIBIX SUPPORT TICKETS (run once in Supabase > SQL Editor > New query > Run). Safe to run twice.
-- Run admin.sql first (this file uses its _chk and _log helpers).

create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  ticket_no  bigint generated always as identity,
  user_id    uuid not null references auth.users(id) on delete cascade,
  email      text,
  name       text,
  source     text not null default 'help_center' check (source in ('help_center','seller_help','trust_safety')),
  category   text not null,
  subject    text not null check (char_length(subject) between 5 and 120),
  status     text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.support_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  sender_id  uuid references auth.users(id) on delete set null,
  from_admin boolean not null default false,
  body       text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets(user_id, updated_at desc);
create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id, created_at);

alter table public.support_tickets  enable row level security;
alter table public.support_messages enable row level security;
drop policy if exists "tickets read own" on public.support_tickets;
create policy "tickets read own" on public.support_tickets for select to authenticated using (user_id = auth.uid());
drop policy if exists "messages read own" on public.support_messages;
create policy "messages read own" on public.support_messages for select to authenticated
  using (exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
revoke insert, update, delete on public.support_tickets, public.support_messages from anon, authenticated;

-- a member opens a ticket (max 5 per hour)
create or replace function public.create_ticket(p_source text, p_category text, p_subject text, p_body text) returns uuid
language plpgsql security definer set search_path = public as $$
declare tid uuid; pe text; pn text;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  if p_source not in ('help_center','seller_help','trust_safety') then raise exception 'Unknown topic'; end if;
  if char_length(trim(coalesce(p_subject,''))) < 5 then raise exception 'Subject is too short'; end if;
  if char_length(trim(coalesce(p_body,''))) < 20 then raise exception 'Message is too short'; end if;
  if (select count(*) from support_tickets where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many tickets. Please wait a little and try again.'; end if;
  select email, full_name into pe, pn from profiles where id = auth.uid();
  insert into support_tickets(user_id, email, name, source, category, subject)
    values (auth.uid(), pe, pn, p_source, left(p_category,60), trim(p_subject)) returning id into tid;
  insert into support_messages(ticket_id, sender_id, from_admin, body) values (tid, auth.uid(), false, trim(p_body));
  return tid;
end $$;

-- the member replies on their own ticket (re-opens it)
create or replace function public.ticket_reply(p_ticket uuid, p_body text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from support_tickets where id = p_ticket and user_id = auth.uid()) then raise exception 'Ticket not found'; end if;
  if char_length(trim(coalesce(p_body,''))) < 1 then raise exception 'Write your reply first'; end if;
  insert into support_messages(ticket_id, sender_id, from_admin, body) values (p_ticket, auth.uid(), false, trim(p_body));
  update support_tickets set status = 'open', updated_at = now() where id = p_ticket and status <> 'closed';
end $$;

-- ADMIN side (same levels as the rest of the admin page)
create or replace function public.admin_tickets(p_status text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin perform _chk('support');
  return coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at desc) from (select * from support_tickets where p_status is null or status = p_status order by updated_at desc limit 300) t), '[]'::jsonb);
end $$;

create or replace function public.admin_ticket_messages(p_ticket uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin perform _chk('support');
  return jsonb_build_object('ticket', (select to_jsonb(t) from support_tickets t where t.id = p_ticket),
    'messages', coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at) from support_messages m where m.ticket_id = p_ticket), '[]'::jsonb));
end $$;

create or replace function public.admin_ticket_reply(p_ticket uuid, p_body text, p_close boolean default false) returns void
language plpgsql security definer set search_path = public as $$
begin perform _chk('support');
  if char_length(trim(coalesce(p_body,''))) < 1 then raise exception 'Write the reply first'; end if;
  insert into support_messages(ticket_id, sender_id, from_admin, body) values (p_ticket, auth.uid(), true, trim(p_body));
  update support_tickets set status = case when p_close then 'closed' else 'answered' end, updated_at = now() where id = p_ticket;
  perform _log('ticket_reply', p_ticket::text, case when p_close then 'replied and closed' else 'replied' end);
end $$;

create or replace function public.admin_ticket_close(p_ticket uuid) returns void
language plpgsql security definer set search_path = public as $$
begin perform _chk('support');
  update support_tickets set status = 'closed', updated_at = now() where id = p_ticket;
  perform _log('ticket_close', p_ticket::text, null);
end $$;

do $$ declare f text; begin
  foreach f in array array['create_ticket(text,text,text,text)','ticket_reply(uuid,text)','admin_tickets(text)','admin_ticket_messages(uuid)','admin_ticket_reply(uuid,text,boolean)','admin_ticket_close(uuid)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop; end $$;
