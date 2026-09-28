-- Central city management.
-- Initial launch scope is Saghez only; admins can add more cities later.

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cities_name_length check (char_length(trim(name)) between 2 and 80)
);

create index if not exists cities_active_sort_idx
  on public.cities (is_active, sort_order, name);

insert into public.cities (name, is_active, sort_order)
values ('سقز', true, 0)
on conflict (name) do update
set is_active = true,
    sort_order = 0,
    updated_at = now();

-- At this stage only Saghez should be available to users.
update public.cities
set is_active = false,
    updated_at = now()
where name <> 'سقز';

-- Normalize existing production records so legacy cities no longer appear.
update public.profiles set city = 'سقز' where city is distinct from 'سقز';
update public.companies set city = 'سقز' where city is distinct from 'سقز';
update public.jobs set city = 'سقز' where city is distinct from 'سقز';

alter table public.cities enable row level security;

grant select on public.cities to anon, authenticated;
grant insert, update, delete on public.cities to authenticated;

create policy "cities_public_read_active"
on public.cities
for select
to anon, authenticated
using (is_active = true);

create policy "cities_admin_read_all"
on public.cities
for select
to authenticated
using (public.is_admin());

create policy "cities_admin_insert"
on public.cities
for insert
to authenticated
with check (public.is_admin());

create policy "cities_admin_update"
on public.cities
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cities_admin_delete"
on public.cities
for delete
to authenticated
using (public.is_admin());
