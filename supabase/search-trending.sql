-- Run this ONCE in Supabase > SQL Editor (safe to run again).
-- It saves what people search for, so popular searches push matching accounts up in "Trending".

create table if not exists public.search_log (
  id bigserial primary key,
  term text not null,
  created_at timestamptz not null default now()
);
alter table public.search_log enable row level security;
-- no public policies: nobody can read or write this table directly

-- the website calls this when someone searches
create or replace function public.log_search(p_term text) returns void
language plpgsql security definer set search_path = public as $$
declare t text := lower(trim(coalesce(p_term,'')));
begin
  if length(t) between 2 and 60 then
    insert into public.search_log(term) values (t);
  end if;
end $$;
grant execute on function public.log_search(text) to anon, authenticated;

-- the website reads this: most searched words in the last 7 days
create or replace function public.top_searches() returns table(term text, hits bigint)
language sql security definer set search_path = public as $$
  select term, count(*) as hits from public.search_log
  where created_at > now() - interval '7 days'
  group by term order by hits desc limit 20;
$$;
grant execute on function public.top_searches() to anon, authenticated;
