create or replace function public.delete_asset(p_asset_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_asset public.assets%rowtype;
begin
  if not public.is_active_user() then
    raise exception 'You must be signed in to continue.';
  end if;

  select *
  into v_asset
  from public.assets
  where id = p_asset_id
  for update;

  if not found then
    raise exception 'Asset not found.';
  end if;

  if exists (
    select 1
    from public.asset_assignments
    where asset_id = p_asset_id
      and status = 'active'
  ) then
    raise exception 'Return the asset before deleting it.';
  end if;

  perform public.log_activity(
    'asset',
    v_asset.id::text,
    v_asset.id,
    'asset_deleted',
    format('Deleted asset %s.', v_asset.asset_tag),
    jsonb_build_object('asset_tag', v_asset.asset_tag)
  );

  delete from public.assets
  where id = p_asset_id;
end;
$$;
