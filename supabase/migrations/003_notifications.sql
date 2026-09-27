-- KarYabi MVP v0.8 — simple in-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'info',
  title text not null,
  body text not null default '',
  href text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, is_read) where is_read = false;

alter table public.notifications enable row level security;

create policy "notifications_read_own" on public.notifications
for select to authenticated using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Trigger helpers run as database owner so users never need direct INSERT access to notifications.
create or replace function public.notify_application_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_title text;
  v_company_id uuid;
  v_member record;
begin
  select title, company_id into v_job_title, v_company_id from public.jobs where id = new.job_id;

  if tg_op = 'INSERT' then
    for v_member in select user_id from public.company_members where company_id = v_company_id loop
      insert into public.notifications(user_id, kind, title, body, href)
      values (v_member.user_id, 'new_application', 'متقاضی جدید داری', 'یک کارجو برای آگهی «' || coalesce(v_job_title,'آگهی') || '» درخواست همکاری فرستاده است.', '/employer/jobs/' || new.job_id || '/applicants');
    end loop;
    return new;
  end if;

  if old.status is distinct from new.status then
    if new.status = 'viewed' then
      insert into public.notifications(user_id, kind, title, body, href)
      values (new.applicant_id, 'application_viewed', 'درخواستت دیده شد', 'کارفرما درخواست تو برای «' || coalesce(v_job_title,'آگهی') || '» را مشاهده کرده است.', '/my-applications');
    elsif new.status = 'shortlisted' then
      insert into public.notifications(user_id, kind, title, body, href)
      values (new.applicant_id, 'application_shortlisted', 'کارفرما مایل است با تو صحبت کند', 'وضعیت درخواست تو برای «' || coalesce(v_job_title,'آگهی') || '» تغییر کرده است.', '/my-applications');
    elsif new.status = 'rejected' then
      insert into public.notifications(user_id, kind, title, body, href)
      values (new.applicant_id, 'application_rejected', 'وضعیت درخواستت تغییر کرد', 'درخواست تو برای «' || coalesce(v_job_title,'آگهی') || '» ادامه پیدا نکرد.', '/my-applications');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists applications_notify_change on public.applications;
create trigger applications_notify_change
after insert or update of status on public.applications
for each row execute function public.notify_application_change();

create or replace function public.notify_job_review_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member record;
begin
  if old.status is not distinct from new.status then return new; end if;
  if new.status not in ('active','rejected') then return new; end if;
  for v_member in select user_id from public.company_members where company_id = new.company_id loop
    insert into public.notifications(user_id, kind, title, body, href)
    values (
      v_member.user_id,
      case when new.status='active' then 'job_approved' else 'job_rejected' end,
      case when new.status='active' then 'آگهی منتشر شد' else 'آگهی تأیید نشد' end,
      case when new.status='active' then 'آگهی «' || new.title || '» پس از بررسی منتشر شد.' else 'آگهی «' || new.title || '» پس از بررسی منتشر نشد.' end,
      '/employer/jobs'
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists jobs_notify_review_change on public.jobs;
create trigger jobs_notify_review_change
after update of status on public.jobs
for each row execute function public.notify_job_review_change();
