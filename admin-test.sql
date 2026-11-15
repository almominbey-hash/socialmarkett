-- READ ONLY. Run in Supabase > SQL Editor. It tries the inside of every admin tab and tells you which one breaks and why.
-- Send me the result table (or a screenshot). It changes nothing.
create or replace function pg_temp.t() returns table(tab text, result text) language plpgsql as $$
begin
  begin perform json_build_object('users',(select count(*) from profiles),'sellers',(select count(*) from profiles where kyc_status='verified'),
    'kyc_pending',(select count(*) from profiles where kyc_status='pending'),'listings_pending',(select count(*) from listings where status::text='pending'),
    'listings_live',(select count(*) from listings where status::text='live'),'orders_total',(select count(*) from orders),
    'orders_active',(select count(*) from orders where status::text in ('in_progress','delivered')),
    'paid_total',(select coalesce(sum(amount),0) from orders where payment_status::text='paid'),
    'fees_total',(select coalesce(sum(fee),0) from orders where payout_status::text='released'),
    'held',(select coalesce(sum(amount-fee),0) from orders where payout_status::text='held'),
    'ready',(select count(*) from orders_ready_to_release),'attention',(select count(*) from orders_needing_attention));
    return query select 'Overview'::text, 'OK'::text;
  exception when others then return query select 'Overview'::text, sqlerrm::text; end;

  begin perform jsonb_agg(to_jsonb(v) || jsonb_build_object('email',p.email,'kyc_status',p.kyc_status) order by p.created_at desc)
    from seller_verifications v join profiles p on p.id=v.user_id;
    return query select 'Seller verification'::text, 'OK'::text;
  exception when others then return query select 'Seller verification'::text, sqlerrm::text; end;

  begin perform jsonb_agg(to_jsonb(l) || jsonb_build_object('seller_email',p.email,'seller_name',p.full_name) order by l.created_at desc)
    from listings l join profiles p on p.id=l.seller_id where l.status::text='pending';
    return query select 'Listings'::text, 'OK'::text;
  exception when others then return query select 'Listings'::text, sqlerrm::text; end;

  begin perform jsonb_agg(to_jsonb(o) order by o.created_at desc) from (select * from orders order by created_at desc limit 500) o;
    return query select 'Orders'::text, 'OK'::text;
  exception when others then return query select 'Orders'::text, sqlerrm::text; end;

  begin perform jsonb_agg(to_jsonb(c) order by c.updated_at desc) from (select id,listing_title,buyer_name,seller_name,updated_at from conversations order by updated_at desc limit 200) c;
    return query select 'Chats'::text, 'OK'::text;
  exception when others then return query select 'Chats'::text, sqlerrm::text; end;

  begin perform jsonb_agg(jsonb_build_object('sender',coalesce(p.full_name,'User'),'body',m.body,'at',m.created_at) order by m.created_at)
    from messages m join profiles p on p.id=m.sender_id;
    return query select 'Chat messages'::text, 'OK'::text;
  exception when others then return query select 'Chat messages'::text, sqlerrm::text; end;

  begin perform jsonb_agg(to_jsonb(u) order by u.created_at desc) from (
    select p.id,p.email,p.full_name,p.phone,p.role,p.kyc_status,p.created_at,
      (select count(*) from listings l where l.seller_id=p.id) as listings,
      (select count(*) from orders o where o.buyer_id=p.id) as bought,
      (select count(*) from orders o where o.seller_id=p.id) as sold
    from profiles p order by p.created_at desc limit 200) u;
    return query select 'Users'::text, 'OK'::text;
  exception when others then return query select 'Users'::text, sqlerrm::text; end;

  begin perform jsonb_agg(to_jsonb(g) order by g.id desc) from (select * from admin_log order by id desc limit 300) g;
    return query select 'Audit log'::text, 'OK'::text;
  exception when others then return query select 'Audit log'::text, sqlerrm::text; end;

  begin if (select count(*) from pg_proc where proname='_notify' and pronamespace='public'::regnamespace) = 0 then
      return query select 'Notifications (_notify)'::text, 'MISSING function _notify'::text;
    else return query select 'Notifications (_notify)'::text, 'OK'::text; end if;
  exception when others then return query select 'Notifications (_notify)'::text, sqlerrm::text; end;
end $$;
select * from pg_temp.t();
