-- KarYabi MVP v1.0 — job expiry + suspicious job reports
-- Active jobs are published for 30 days. Expired jobs are hidden immediately by RLS,
-- cannot receive new applications, and are closed automatically when Supabase Cron is enabled.

alter table public.jobs
  add column if not exists expires_at timestamptz;

create index if not exists jobs_expires_at_idx on public.jobs(expires_at);

update public.jobs
set expires_at = coalesce(published_at, created_at, now()) + interval '30 days'
where status = 'active' and expires_at is null;

create or replace function public.set_job_publication_window()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'active' then
    if tg_op = 'INSERT' then
      new.published_at := coalesce(new.published_at, now());
      new.expires_at := coalesce(new.expires_at, now() + interval '30 days');
    elsif old.status is distinct from 'active' or new.expires_at is null then
      new.published_at := now();
      new.expires_at := now() + interval '30 days';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_set_publication_window on public.jobs;
create trigger jobs_set_publication_window
before insert or update on public.jobs
for each row execute function public.set_job_publication_window();

drop policy if exists "jobs_public_or_member_read" on public.jobs;
create policy "jobs_public_or_member_read" on public.jobs
for select using (
  (
    status = 'active'
    and (expires_at is null or expires_at > now())
  )
  or exists (
    select 1 from public.company_members cm
    where cm.company_id = jobs.company_id and cm.user_id = auth.uid()
  )
);

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own" on public.applications
for insert to authenticated with check (
  applicant_id = auth.uid()
  and exists (
    select 1 from public.jobs j
    where j.id = applications.job_id
      and j.status = 'active'
      and (j.expires_at is null or j.expires_at > now())
  )
);

create or replace function public.close_expired_jobs()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.jobs
  set status = 'closed'
  where status = 'active'
    and expires_at is not null
    and expires_at <= now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.close_expired_jobs() from public, anon, authenticated;

do $$
begin
  if to_regprocedure('cron.schedule(text,text,text)') is not null then
    execute $sql$
      select cron.schedule(
        'kar-yabi-close-expired-jobs',
        '5 * * * *',
        'select public.close_expired_jobs();'
      )
    $sql$;
  end if;
exception when others then
  raise notice 'Supabase Cron is not enabled yet; expired jobs remain safely hidden and can be scheduled later.';
end $$;

create table if not exists public.job_reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('misleading','money_request','suspicious','duplicate','other')),
  details text not null default '',
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed','actioned')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique(job_id, reporter_id)
);

create index if not exists job_reports_status_idx on public.job_reports(status);
create index if not exists job_reports_job_idx on public.job_reports(job_id);

alter table public.job_reports enable row level security;

create policy "job_reports_insert_own" on public.job_reports
for insert to authenticated with check (
  reporter_id = auth.uid()
  and exists (
    select 1 from public.jobs j
    where j.id = job_reports.job_id
      and j.status = 'active'
      and (j.expires_at is null or j.expires_at > now())
  )
);

create policy "job_reports_read_own" on public.job_reports
for select to authenticated using (reporter_id = auth.uid());

create policy "job_reports_admin_read" on public.job_reports
for select to authenticated using (public.is_admin());

create policy "job_reports_admin_update" on public.job_reports
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.notify_admins_on_job_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  job_title text;
begin
  select title into job_title from public.jobs where id = new.job_id;

  insert into public.notifications(user_id, kind, title, body, href)
  select
    a.user_id,
    'job_reported',
    'گزارش جدید برای آگهی',
    'یک کاربر آگهی «' || coalesce(job_title, 'آگهی') || '» را گزارش کرده است.',
    '/admin/reports'
  from public.admin_users a;

  return new;
end;
$$;

drop trigger if exists job_report_notify_admins on public.job_reports;
create trigger job_report_notify_admins
after insert on public.job_reports
for each row execute function public.notify_admins_on_job_report();
