-- KarYabi MVP v0.6 — minimal admin access
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;

create policy "admin_users_read_self" on public.admin_users
for select to authenticated using (user_id = auth.uid());

create policy "profiles_admin_read" on public.profiles
for select to authenticated using (public.is_admin());

create policy "companies_admin_read" on public.companies
for select to authenticated using (public.is_admin());
create policy "companies_admin_update" on public.companies
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "jobs_admin_read" on public.jobs
for select to authenticated using (public.is_admin());
create policy "jobs_admin_update" on public.jobs
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "applications_admin_read" on public.applications
for select to authenticated using (public.is_admin());
