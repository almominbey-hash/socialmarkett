-- READ ONLY. Run in Supabase > SQL Editor, then send me the one result cell (or a screenshot). It changes nothing.
select jsonb_pretty(jsonb_build_object(
  'listings_columns', (select jsonb_agg(column_name || ':' || case when data_type = 'USER-DEFINED' then udt_name else data_type end order by ordinal_position) from information_schema.columns where table_schema = 'public' and table_name = 'listings'),
  'orders_columns',   (select jsonb_agg(column_name || ':' || case when data_type = 'USER-DEFINED' then udt_name else data_type end order by ordinal_position) from information_schema.columns where table_schema = 'public' and table_name = 'orders'),
  'listing_statuses', (select jsonb_agg(jsonb_build_object('status', s, 'n', n)) from (select status::text s, count(*) n from public.listings group by 1) x),
  'order_statuses',   (select jsonb_agg(jsonb_build_object('status', a, 'payment', b, 'payout', c, 'currency', d, 'n', n)) from (select status::text a, payment_status::text b, payout_status::text c, currency::text d, count(*) n from public.orders group by 1,2,3,4) x),
  'checks',           (select jsonb_agg(conrelid::regclass::text || ': ' || pg_get_constraintdef(oid)) from pg_constraint where contype = 'c' and conrelid::regclass::text in ('listings','orders','notifications','public.listings','public.orders','public.notifications')),
  'notify_function',  (select jsonb_agg(p.oid::regprocedure::text) from pg_proc p where p.proname = '_notify' and p.pronamespace = 'public'::regnamespace),
  'order_views',      (select jsonb_agg(table_name) from information_schema.views where table_schema = 'public' and table_name in ('orders_ready_to_release','orders_needing_attention'))
)) as result;
