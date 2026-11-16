-- Account settings page: name, phone (shown with dots) and ID card status.
-- NEW RULE: if the person's ID card is "pending" or "verified" and they change their name or phone,
-- the ID card goes back to "pending" (review again) and the change is also saved in their ID application.
-- Paste this whole file in Supabase > SQL Editor > New query > Run. Safe to run again.

create or replace function public.get_my_personal_info() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); pj jsonb; vj jsonb; nm text; ph text;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select to_jsonb(p) into pj from profiles p where p.id = uid;
  begin
    select to_jsonb(v) into vj from seller_verifications v where v.user_id = uid;
  exception when others then vj := null;
  end;
  nm := coalesce(nullif(vj->>'full_name',''), nullif(pj->>'full_name',''), '');
  ph := coalesce(nullif(vj->>'phone',''), nullif(pj->>'phone',''), '');
  return jsonb_build_object(
    'name', nm,
    'phone_masked', repeat('•', greatest(length(ph) - 4, 0)) || right(ph, least(length(ph), 4)),
    'has_phone', ph <> '',
    'kyc', coalesce(pj->>'kyc_status', 'none'),
    'email', pj->>'email');
end $$;
revoke all on function public.get_my_personal_info() from public, anon;
grant execute on function public.get_my_personal_info() to authenticated;

-- the old version returned nothing (void); the new one tells the page if the ID went back to review
drop function if exists public.update_my_personal_info(text, text);
create or replace function public.update_my_personal_info(p_name text, p_phone text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); k text; old_nm text; old_ph text; changed boolean := false; review boolean := false;
  nm text := nullif(trim(regexp_replace(coalesce(p_name,''), '\s+', ' ', 'g')), '');
  ph text := nullif(trim(coalesce(p_phone,'')), '');
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select kyc_status, full_name, phone into k, old_nm, old_ph from profiles where id = uid;
  if nm is not null then
    if char_length(nm) not between 3 and 80 then raise exception 'Name must be 3 to 80 characters'; end if;
    if nm is distinct from old_nm then
      changed := true;
      update profiles set full_name = nm where id = uid;
      begin update seller_verifications set full_name = nm where user_id = uid; exception when others then null; end;
    end if;
  end if;
  if ph is not null then
    if ph !~ '^\+?[0-9 ]{8,18}$' then raise exception 'Enter a valid phone number'; end if;
    ph := regexp_replace(ph, '\s', '', 'g');
    if ph is distinct from old_ph then
      changed := true;
      update profiles set phone = ph where id = uid;
      begin update seller_verifications set phone = ph where user_id = uid; exception when others then null; end;
    end if;
  end if;
  -- ID card already sent or approved + name/phone changed -> review again
  if changed and k in ('pending','verified') then
    update profiles set kyc_status = 'pending' where id = uid;
    review := true;
  end if;
  return jsonb_build_object('review', review);
end $$;
revoke all on function public.update_my_personal_info(text, text) from public, anon;
grant execute on function public.update_my_personal_info(text, text) to authenticated;
