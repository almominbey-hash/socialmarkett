-- AVIBIX ADMIN FIX (run once in Supabase > SQL Editor). Safe to run twice.
-- Fixes: listing list / approve / reject no longer fail when the status column is an enum,
-- and a failed notification can no longer block an approval. "unlisted" is an allowed status.

create or replace function public.admin_listings(p_status text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform _chk();
  return coalesce((select jsonb_agg(to_jsonb(l) || jsonb_build_object('seller_email', p.email, 'seller_name', p.full_name) order by l.created_at desc)
    from listings l join profiles p on p.id = l.seller_id
    where p_status is null or p_status = '' or l.status::text = p_status), '[]'::jsonb);
end $$;

create or replace function public.admin_listing_decide(p_id uuid, p_status text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare s uuid; t text; n int;
begin
  perform _chk('admin');
  if p_status not in ('live','rejected','pending','unlisted') then raise exception 'Bad status'; end if;
  execute format('update public.listings set status = %L where id = %L returning seller_id, title', p_status, p_id) into s, t;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'Listing not found'; end if;
  perform _log('listing_' || p_status, p_id::text, p_note);
  if p_status in ('live','rejected') and s is not null then
    begin
      perform _notify(s, 'listing', case when p_status = 'live' then 'Listing is live' else 'Listing not approved' end,
        '"' || coalesce(t, '') || '" ' || case when p_status = 'live' then 'is now visible to buyers.' else 'was not approved. ' || coalesce(p_note, '') end);
    exception when others then null; -- a notification problem must never block the decision
    end;
  end if;
end $$;

revoke all on function public.admin_listings(text), public.admin_listing_decide(uuid,text,text) from public, anon;
grant execute on function public.admin_listings(text), public.admin_listing_decide(uuid,text,text) to authenticated;
