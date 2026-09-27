-- KarYabi MVP v0.5 — initial Supabase schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  full_name text,
  city text,
  experience_level text,
  skills text[] not null default '{}',
  is_job_seeker boolean not null default false,
  is_employer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  industry text,
  description text,
  phone text,
  status text not null default 'pending' check (status in ('pending','verified','blocked')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  category text not null default 'سایر',
  city text not null,
  employment_type text not null check (employment_type in ('تمام‌وقت','پاره‌وقت','پروژه‌ای')),
  experience_level text,
  description text not null default '',
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  schedule text,
  salary_min bigint,
  salary_max bigint,
  salary_negotiable boolean not null default false,
  benefits text[] not null default '{}',
  contact_phone text,
  status text not null default 'pending_review' check (status in ('pending_review','active','closed','rejected')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','viewed','shortlisted','rejected')),
  profile_snapshot jsonb not null default '{}'::jsonb,
  applied_at timestamptz not null default now(),
  viewed_at timestamptz,
  unique(job_id, applicant_id)
);

create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_city_idx on public.jobs(city);
create index if not exists jobs_company_idx on public.jobs(company_id);
create index if not exists applications_job_idx on public.applications(job_id);
create index if not exists applications_applicant_idx on public.applications(applicant_id);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- Profiles: own profile, or applicants to a job belonging to the current employer.
create policy "profiles_select_own_or_employer_applicant" on public.profiles
for select using (
  id = auth.uid()
  or exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.company_members cm on cm.company_id = j.company_id
    where a.applicant_id = profiles.id and cm.user_id = auth.uid()
  )
);
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Companies are public only after verification; members can always read their own company.
create policy "companies_public_or_member_read" on public.companies
for select using (
  status = 'verified'
  or created_by = auth.uid()
  or exists (select 1 from public.company_members cm where cm.company_id = companies.id and cm.user_id = auth.uid())
);
create policy "companies_create_authenticated" on public.companies
for insert to authenticated with check (created_by = auth.uid());
create policy "companies_member_update" on public.companies
for update using (exists (select 1 from public.company_members cm where cm.company_id = companies.id and cm.user_id = auth.uid()));

create policy "company_members_read_own" on public.company_members
for select using (user_id = auth.uid());
create policy "company_members_owner_bootstrap" on public.company_members
for insert to authenticated with check (
  user_id = auth.uid()
  and exists (select 1 from public.companies c where c.id = company_members.company_id and c.created_by = auth.uid())
);

-- Public sees active jobs. Company members see all of their own jobs.
create policy "jobs_public_or_member_read" on public.jobs
for select using (
  status = 'active'
  or exists (select 1 from public.company_members cm where cm.company_id = jobs.company_id and cm.user_id = auth.uid())
);
create policy "jobs_member_create" on public.jobs
for insert to authenticated with check (
  created_by = auth.uid()
  and exists (select 1 from public.company_members cm where cm.company_id = jobs.company_id and cm.user_id = auth.uid())
);
create policy "jobs_member_update" on public.jobs
for update using (exists (select 1 from public.company_members cm where cm.company_id = jobs.company_id and cm.user_id = auth.uid()));

-- Applicants can create/read their own applications. Employers can read/update applications to their own jobs.
create policy "applications_insert_own" on public.applications
for insert to authenticated with check (
  applicant_id = auth.uid()
  and exists (select 1 from public.jobs j where j.id = applications.job_id and j.status = 'active')
);
create policy "applications_read_own_or_employer" on public.applications
for select using (
  applicant_id = auth.uid()
  or exists (
    select 1 from public.jobs j
    join public.company_members cm on cm.company_id = j.company_id
    where j.id = applications.job_id and cm.user_id = auth.uid()
  )
);
create policy "applications_employer_update" on public.applications
for update using (
  exists (
    select 1 from public.jobs j
    join public.company_members cm on cm.company_id = j.company_id
    where j.id = applications.job_id and cm.user_id = auth.uid()
  )
);

-- Keep updated_at current.
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies for each row execute function public.set_updated_at();
