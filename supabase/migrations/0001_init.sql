create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'it_staff');
create type public.asset_status as enum ('in_stock', 'assigned', 'maintenance', 'retired', 'lost');
create type public.asset_condition as enum ('new', 'good', 'fair', 'poor', 'damaged');
create type public.employee_status as enum ('active', 'inactive');
create type public.assignment_status as enum ('active', 'returned');
create type public.maintenance_status as enum ('open', 'closed');
create type public.activity_entity as enum (
  'asset',
  'employee',
  'assignment',
  'maintenance',
  'document',
  'user'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'it_staff',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  full_name text not null,
  email text not null unique,
  department text not null,
  designation text not null,
  location text not null,
  phone text not null,
  status public.employee_status not null default 'active',
  notes text not null default '',
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_tag text not null unique,
  name text not null,
  category text not null,
  brand text not null,
  model text not null,
  serial_number text not null unique,
  purchase_date date,
  warranty_expiry date,
  location text not null,
  condition public.asset_condition not null default 'good',
  status public.asset_status not null default 'in_stock',
  notes text not null default '',
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  current_employee_id uuid references public.employees (id) on delete set null
);

create table public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete restrict,
  assigned_at timestamptz not null default timezone('utc', now()),
  due_date date,
  returned_at timestamptz,
  assigned_condition public.asset_condition not null,
  return_condition public.asset_condition,
  return_notes text not null default '',
  notes text not null default '',
  status public.assignment_status not null default 'active'
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  issue_type text not null,
  notes text not null default '',
  vendor text not null default '',
  cost numeric(12, 2),
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  resolution text not null default '',
  status public.maintenance_status not null default 'open'
);

create table public.asset_documents (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  name text not null,
  content_type text not null,
  size bigint not null check (size >= 0),
  storage_path text not null unique,
  url text not null default '',
  uploaded_at timestamptz not null default timezone('utc', now()),
  uploaded_by text not null default ''
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type public.activity_entity not null,
  entity_id text not null,
  asset_id uuid references public.assets (id) on delete set null,
  action text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_name text not null default 'System',
  actor_email text not null default ''
);

create index employees_status_idx on public.employees (status);
create index assets_status_idx on public.assets (status);
create index assets_current_employee_id_idx on public.assets (current_employee_id);
create index assets_warranty_expiry_idx on public.assets (warranty_expiry);
create index asset_assignments_asset_id_idx on public.asset_assignments (asset_id);
create index asset_assignments_employee_id_idx on public.asset_assignments (employee_id);
create index asset_assignments_status_idx on public.asset_assignments (status);
create index maintenance_records_asset_id_idx on public.maintenance_records (asset_id);
create index maintenance_records_status_idx on public.maintenance_records (status);
create index asset_documents_asset_id_idx on public.asset_documents (asset_id);
create index activity_logs_asset_id_idx on public.activity_logs (asset_id);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);
create index activity_logs_created_at_idx on public.activity_logs (created_at desc);

create unique index asset_assignments_one_active_per_asset_idx
  on public.asset_assignments (asset_id)
  where status = 'active';

create unique index maintenance_records_one_open_per_asset_idx
  on public.maintenance_records (asset_id)
  where status = 'open';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_employees_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

create trigger set_assets_updated_at
before update on public.assets
for each row
execute function public.set_updated_at();

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
      and role = 'admin'
  );
$$;

create or replace function public.log_activity(
  p_entity_type public.activity_entity,
  p_entity_id text,
  p_asset_id uuid,
  p_action text,
  p_message text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
begin
  select *
  into v_profile
  from public.profiles
  where id = auth.uid();

  insert into public.activity_logs (
    entity_type,
    entity_id,
    asset_id,
    action,
    message,
    metadata,
    actor_id,
    actor_name,
    actor_email
  )
  values (
    p_entity_type,
    p_entity_id,
    p_asset_id,
    p_action,
    p_message,
    coalesce(p_metadata, '{}'::jsonb),
    v_profile.id,
    coalesce(v_profile.full_name, 'System'),
    coalesce(v_profile.email, '')
  );
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    'it_staff',
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        active = true;

  return new;
end;
$$;

create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = coalesce(new.email, profiles.email),
      full_name = coalesce(
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        profiles.full_name
      )
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
execute function public.handle_auth_user_updated();

create or replace function public.archive_asset(p_asset_id uuid)
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
    raise exception 'Return the asset before archiving it.';
  end if;

  update public.assets
  set status = 'retired',
      archived_at = coalesce(archived_at, timezone('utc', now())),
      current_employee_id = null
  where id = p_asset_id;

  perform public.log_activity(
    'asset',
    v_asset.id::text,
    v_asset.id,
    'asset_archived',
    format('Archived asset %s.', v_asset.asset_tag),
    jsonb_build_object('asset_tag', v_asset.asset_tag)
  );
end;
$$;

create or replace function public.assign_asset(
  p_asset_id uuid,
  p_employee_id uuid,
  p_due_date date default null,
  p_notes text default null
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_asset public.assets%rowtype;
  v_employee public.employees%rowtype;
  v_assignment_id uuid;
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

  select *
  into v_employee
  from public.employees
  where id = p_employee_id
  for update;

  if not found then
    raise exception 'Employee not found.';
  end if;

  if v_asset.archived_at is not null then
    raise exception 'Archived assets cannot be assigned.';
  end if;

  if v_employee.status <> 'active' or v_employee.archived_at is not null then
    raise exception 'Only active employees can receive assets.';
  end if;

  if v_asset.status <> 'in_stock' then
    raise exception 'Only in-stock assets can be assigned.';
  end if;

  if exists (
    select 1
    from public.maintenance_records
    where asset_id = p_asset_id
      and status = 'open'
  ) then
    raise exception 'Close maintenance before assigning this asset.';
  end if;

  insert into public.asset_assignments (
    asset_id,
    employee_id,
    due_date,
    assigned_condition,
    notes,
    status
  )
  values (
    p_asset_id,
    p_employee_id,
    p_due_date,
    v_asset.condition,
    coalesce(p_notes, ''),
    'active'
  )
  returning id into v_assignment_id;

  update public.assets
  set status = 'assigned',
      current_employee_id = p_employee_id
  where id = p_asset_id;

  perform public.log_activity(
    'assignment',
    v_assignment_id::text,
    v_asset.id,
    'asset_assigned',
    format('Assigned %s to %s.', v_asset.asset_tag, v_employee.full_name),
    jsonb_build_object(
      'asset_id', v_asset.id,
      'employee_id', v_employee.id
    )
  );
end;
$$;

create or replace function public.return_asset(
  p_assignment_id uuid,
  p_return_condition public.asset_condition,
  p_send_to_maintenance boolean default false,
  p_return_notes text default null
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_assignment public.asset_assignments%rowtype;
  v_asset public.assets%rowtype;
  v_maintenance_id uuid;
begin
  if not public.is_active_user() then
    raise exception 'You must be signed in to continue.';
  end if;

  select *
  into v_assignment
  from public.asset_assignments
  where id = p_assignment_id
  for update;

  if not found then
    raise exception 'Assignment not found.';
  end if;

  if v_assignment.status <> 'active' then
    raise exception 'This assignment has already been returned.';
  end if;

  select *
  into v_asset
  from public.assets
  where id = v_assignment.asset_id
  for update;

  if not found then
    raise exception 'Asset not found.';
  end if;

  update public.asset_assignments
  set status = 'returned',
      returned_at = timezone('utc', now()),
      return_condition = p_return_condition,
      return_notes = coalesce(p_return_notes, '')
  where id = p_assignment_id;

  update public.assets
  set current_employee_id = null,
      condition = p_return_condition,
      status = case when p_send_to_maintenance then 'maintenance' else 'in_stock' end
  where id = v_asset.id;

  perform public.log_activity(
    'assignment',
    v_assignment.id::text,
    v_asset.id,
    'asset_returned',
    format('Returned %s.', v_asset.asset_tag),
    jsonb_build_object(
      'asset_id', v_asset.id,
      'employee_id', v_assignment.employee_id,
      'send_to_maintenance', p_send_to_maintenance
    )
  );

  if p_send_to_maintenance then
    insert into public.maintenance_records (
      asset_id,
      issue_type,
      notes,
      vendor,
      status
    )
    values (
      v_asset.id,
      'Return inspection',
      coalesce(nullif(p_return_notes, ''), 'Returned for IT inspection.'),
      'Internal IT',
      'open'
    )
    returning id into v_maintenance_id;

    perform public.log_activity(
      'maintenance',
      v_maintenance_id::text,
      v_asset.id,
      'maintenance_opened',
      format('Opened maintenance for %s after return.', v_asset.asset_tag),
      jsonb_build_object(
        'asset_id', v_asset.id,
        'source', 'return_flow'
      )
    );
  end if;
end;
$$;

create or replace function public.open_maintenance(
  p_asset_id uuid,
  p_issue_type text,
  p_notes text,
  p_vendor text
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_asset public.assets%rowtype;
  v_maintenance_id uuid;
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

  if v_asset.status = 'assigned' then
    raise exception 'Return the asset before sending it to maintenance.';
  end if;

  if exists (
    select 1
    from public.maintenance_records
    where asset_id = p_asset_id
      and status = 'open'
  ) then
    raise exception 'This asset already has an open maintenance record.';
  end if;

  insert into public.maintenance_records (
    asset_id,
    issue_type,
    notes,
    vendor,
    status
  )
  values (
    p_asset_id,
    p_issue_type,
    p_notes,
    p_vendor,
    'open'
  )
  returning id into v_maintenance_id;

  update public.assets
  set status = 'maintenance'
  where id = p_asset_id;

  perform public.log_activity(
    'maintenance',
    v_maintenance_id::text,
    v_asset.id,
    'maintenance_opened',
    format('Opened maintenance for %s.', v_asset.asset_tag),
    jsonb_build_object('asset_id', v_asset.id)
  );
end;
$$;

create or replace function public.close_maintenance(
  p_maintenance_id uuid,
  p_resolution text,
  p_cost numeric default null
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_record public.maintenance_records%rowtype;
  v_asset public.assets%rowtype;
begin
  if not public.is_active_user() then
    raise exception 'You must be signed in to continue.';
  end if;

  select *
  into v_record
  from public.maintenance_records
  where id = p_maintenance_id
  for update;

  if not found then
    raise exception 'Maintenance record not found.';
  end if;

  if v_record.status <> 'open' then
    raise exception 'This maintenance record is already closed.';
  end if;

  select *
  into v_asset
  from public.assets
  where id = v_record.asset_id
  for update;

  if not found then
    raise exception 'Asset not found.';
  end if;

  update public.maintenance_records
  set status = 'closed',
      closed_at = timezone('utc', now()),
      resolution = p_resolution,
      cost = p_cost
  where id = p_maintenance_id;

  update public.assets
  set status = 'in_stock'
  where id = v_asset.id;

  perform public.log_activity(
    'maintenance',
    v_record.id::text,
    v_asset.id,
    'maintenance_closed',
    format('Closed maintenance for %s.', v_asset.asset_tag),
    jsonb_build_object('asset_id', v_asset.id)
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.assets enable row level security;
alter table public.asset_assignments enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.asset_documents enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self_or_admin"
on public.profiles
for insert
to authenticated
with check (
  (id = auth.uid() and role = 'it_staff' and active = true)
  or public.is_admin()
);

create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "employees_active_user_access"
on public.employees
for all
to authenticated
using (public.is_active_user())
with check (public.is_active_user());

create policy "assets_active_user_access"
on public.assets
for all
to authenticated
using (public.is_active_user())
with check (public.is_active_user());

create policy "asset_assignments_active_user_access"
on public.asset_assignments
for all
to authenticated
using (public.is_active_user())
with check (public.is_active_user());

create policy "maintenance_records_active_user_access"
on public.maintenance_records
for all
to authenticated
using (public.is_active_user())
with check (public.is_active_user());

create policy "asset_documents_active_user_access"
on public.asset_documents
for all
to authenticated
using (public.is_active_user())
with check (public.is_active_user());

create policy "activity_logs_active_user_access"
on public.activity_logs
for all
to authenticated
using (public.is_active_user())
with check (public.is_active_user());

insert into storage.buckets (id, name, public)
values ('asset-files', 'asset-files', false)
on conflict (id) do update
  set public = excluded.public;

create policy "asset_files_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'asset-files'
  and public.is_active_user()
);

create policy "asset_files_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'asset-files'
  and public.is_active_user()
);

create policy "asset_files_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'asset-files'
  and public.is_active_user()
)
with check (
  bucket_id = 'asset-files'
  and public.is_active_user()
);

create policy "asset_files_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'asset-files'
  and public.is_active_user()
);
