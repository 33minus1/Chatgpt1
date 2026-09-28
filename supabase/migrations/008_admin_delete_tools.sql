-- Karzan admin destructive actions
-- Admins can permanently delete jobs/companies and remove an app account.
-- Removed users are tombstoned so the same auth identity cannot recreate an app account.

create table if not exists public.deleted_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  deleted_at timestamptz not null default now(),
  deleted_by uuid references auth.users(id) on delete set null
);

alter table public.deleted_users enable row level security;

create policy "deleted_users_read_self_or_admin" on public.deleted_users
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "deleted_users_admin_insert" on public.deleted_users
for insert to authenticated
with check (public.is_admin() and deleted_by = auth.uid());

create policy "deleted_users_admin_delete" on public.deleted_users
for delete to authenticated
using (public.is_admin());

create policy "jobs_admin_delete" on public.jobs
for delete to authenticated
using (public.is_admin());

create policy "companies_admin_delete" on public.companies
for delete to authenticated
using (public.is_admin());

create policy "profiles_admin_delete" on public.profiles
for delete to authenticated
using (public.is_admin());

create policy "company_members_admin_delete" on public.company_members
for delete to authenticated
using (public.is_admin());

create policy "notifications_admin_delete" on public.notifications
for delete to authenticated
using (public.is_admin());
