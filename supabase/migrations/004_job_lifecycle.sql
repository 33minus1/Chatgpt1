-- KarYabi MVP v0.9 — safe employer job lifecycle
-- Employers may create/edit/close jobs, but may never self-publish or self-reject.

drop policy if exists "jobs_member_create" on public.jobs;
create policy "jobs_member_create" on public.jobs
for insert to authenticated
with check (
  created_by = auth.uid()
  and status = 'pending_review'
  and exists (select 1 from public.company_members cm where cm.company_id = jobs.company_id and cm.user_id = auth.uid())
);

drop policy if exists "jobs_member_update" on public.jobs;
create policy "jobs_member_update" on public.jobs
for update to authenticated
using (exists (select 1 from public.company_members cm where cm.company_id = jobs.company_id and cm.user_id = auth.uid()))
with check (
  status in ('pending_review', 'closed')
  and exists (select 1 from public.company_members cm where cm.company_id = jobs.company_id and cm.user_id = auth.uid())
);

-- applications_insert_own from 001_initial_schema.sql already requires the job to be active.
