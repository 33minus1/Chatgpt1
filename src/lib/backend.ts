import { jobs as mockJobs, type Job } from '../data/mock'
import { companies as mockCompanies, type Company } from '../data/companiesMock'
import { employerJobs as mockEmployerJobs, type Applicant, type EmployerJob } from '../data/employerMock'
import {
  getEmployerProfile as getEmployerProfileLocal,
  getSeekerProfile as getSeekerProfileLocal,
  saveEmployerProfile as saveEmployerProfileLocal,
  saveSeekerProfile as saveSeekerProfileLocal,
  type EmployerProfile,
  type SeekerProfile,
  type UserRole,
} from './session'
import { isSupabaseConfigured, normalizeIranPhone, supabase } from './supabase'

export const backendMode = isSupabaseConfigured ? 'supabase' : 'preview'


export type NotificationItem = {
  id: string
  title: string
  body: string
  href: string
  isRead: boolean
  createdAt: string
  kind: string
}

const notificationKey = (employer: boolean) => employer ? 'kar-yabi-notifications-employer' : 'kar-yabi-notifications-seeker'

function defaultPreviewNotifications(employer: boolean): NotificationItem[] {
  return employer ? [
    { id: 'emp-1', title: 'متقاضی جدید داری', body: 'یک کارجو برای آگهی «چرخکار راسته‌دوز» درخواست همکاری فرستاده است.', href: '/employer/jobs/1/applicants', isRead: false, createdAt: 'امروز', kind: 'new_application' },
    { id: 'emp-2', title: 'آگهی منتشر شد', body: 'آگهی «انباردار» پس از بررسی منتشر شد.', href: '/employer/jobs', isRead: true, createdAt: 'دیروز', kind: 'job_approved' },
  ] : [
    { id: 'seek-1', title: 'درخواستت دیده شد', body: 'کارفرما درخواست تو برای «چرخکار راسته‌دوز» را مشاهده کرده است.', href: '/my-applications', isRead: false, createdAt: 'امروز', kind: 'application_viewed' },
    { id: 'seek-2', title: 'درخواست همکاری ارسال شد', body: 'درخواستت با موفقیت برای کارفرما ارسال شده است.', href: '/my-applications', isRead: true, createdAt: 'دیروز', kind: 'application_submitted' },
  ]
}

function getPreviewNotifications(employer: boolean) {
  const key = notificationKey(employer)
  const raw = localStorage.getItem(key)
  if (raw) return JSON.parse(raw) as NotificationItem[]
  const rows = defaultPreviewNotifications(employer)
  localStorage.setItem(key, JSON.stringify(rows))
  return rows
}

function pushPreviewNotification(employer: boolean, row: Omit<NotificationItem, 'id'|'createdAt'|'isRead'>) {
  const key = notificationKey(employer)
  const rows = getPreviewNotifications(employer)
  const item: NotificationItem = { ...row, id: `local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, createdAt: 'همین حالا', isRead: false }
  localStorage.setItem(key, JSON.stringify([item, ...rows].slice(0, 30)))
}

export async function listNotificationsBackend(employer = false): Promise<NotificationItem[]> {
  if (!supabase) return getPreviewNotifications(employer)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('notifications')
    .select('id,kind,title,body,href,is_read,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    kind: row.kind ?? 'info',
    title: row.title ?? 'اعلان',
    body: row.body ?? '',
    href: row.href ?? '',
    isRead: Boolean(row.is_read),
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('fa-IR') : 'جدید',
  }))
}

export async function markNotificationReadBackend(id: string) {
  if (!supabase) {
    for (const employer of [false, true]) {
      const key = notificationKey(employer)
      const rows = getPreviewNotifications(employer)
      if (rows.some((row) => row.id === id)) localStorage.setItem(key, JSON.stringify(rows.map((row) => row.id === id ? { ...row, isRead: true } : row)))
    }
    return
  }
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsReadBackend() {
  if (!supabase) {
    for (const employer of [false, true]) {
      const key = notificationKey(employer)
      const rows = getPreviewNotifications(employer)
      localStorage.setItem(key, JSON.stringify(rows.map((row) => ({ ...row, isRead: true }))))
    }
    return
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
  if (error) throw error
}

const faDigits = '۰۱۲۳۴۵۶۷۸۹'
const arDigits = '٠١٢٣٤٥٦٧٨٩'

function latinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arDigits.indexOf(d)))
}

function parseMoney(value: string) {
  const digits = latinDigits(value).replace(/[^0-9]/g, '')
  if (!digits) return null
  const n = Number(digits)
  if (!Number.isFinite(n)) return null
  // If the UI value looks like "20" or "۲۰ میلیون", interpret as millions of tomans.
  return n < 100000 ? n * 1_000_000 : n
}

function formatMoney(value: number | string | null | undefined) {
  if (value == null || value === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `${Math.round(n / 1_000_000).toLocaleString('fa-IR')} میلیون تومان`
}

function salaryLabel(row: any) {
  if (row.salary_negotiable) return 'حقوق توافقی'
  if (row.salary_min != null && row.salary_max != null) return `${formatMoney(row.salary_min).replace(' تومان', '')} تا ${formatMoney(row.salary_max)}`
  if (row.salary_min != null) return `از ${formatMoney(row.salary_min)}`
  if (row.salary_max != null) return `تا ${formatMoney(row.salary_max)}`
  return 'حقوق توافقی'
}

function mapDbJob(row: any): Job {
  const company = Array.isArray(row.companies) ? row.companies[0] : row.companies
  return {
    id: row.id,
    title: row.title,
    company: company?.name ?? 'شرکت',
    companyId: company?.id ?? row.company_id ?? '',
    city: row.city,
    type: row.employment_type,
    salary: salaryLabel(row),
    publishedAt: row.published_at ? new Date(row.published_at).toLocaleDateString('fa-IR') : 'جدید',
    category: row.category ?? 'سایر',
    description: row.description ?? '',
    requirements: row.requirements ?? [],
    benefits: row.benefits ?? [],
    schedule: row.schedule ?? '',
    skills: row.skills ?? [],
    companyDescription: company?.description ?? '',
    expiresAt: row.expires_at ? new Date(row.expires_at).toLocaleDateString('fa-IR') : '',
    daysLeft: row.expires_at ? Math.max(0, Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 86400000)) : undefined,
  }
}


export type PublicCompany = Company

function mapDbCompany(row: any, activeJobs = 0): PublicCompany {
  return {
    id: row.id,
    name: row.name ?? 'شرکت',
    city: row.city ?? '',
    industry: row.industry ?? 'سایر',
    description: row.description ?? '',
    status: row.status ?? 'pending',
    activeJobs,
  }
}

export async function listCompaniesBackend(): Promise<PublicCompany[]> {
  if (!supabase) return mockCompanies.filter((company) => company.status === 'verified')

  const { data: companies, error } = await supabase
    .from('companies')
    .select('id,name,city,industry,description,status')
    .eq('status', 'verified')
    .order('name', { ascending: true })
  if (error) throw error

  const ids = (companies ?? []).map((company: any) => company.id)
  if (!ids.length) return []
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('company_id')
    .eq('status', 'active')
    .in('company_id', ids)
  if (jobsError) throw jobsError

  const counts = new Map<string, number>()
  for (const job of jobs ?? []) counts.set(job.company_id, (counts.get(job.company_id) ?? 0) + 1)
  return (companies ?? []).map((company: any) => mapDbCompany(company, counts.get(company.id) ?? 0))
}

export async function getCompanyBackend(id?: string): Promise<PublicCompany | null> {
  if (!id) return null
  if (!supabase) return mockCompanies.find((company) => company.id === id && company.status === 'verified') ?? null

  const { data: company, error } = await supabase
    .from('companies')
    .select('id,name,city,industry,description,status')
    .eq('id', id)
    .eq('status', 'verified')
    .maybeSingle()
  if (error) throw error
  if (!company) return null

  const { count, error: countError } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', id)
    .eq('status', 'active')
  if (countError) throw countError
  return mapDbCompany(company, count ?? 0)
}

export async function sendPhoneOtp(phone: string) {
  if (!supabase) return
  const { error } = await supabase.auth.signInWithOtp({ phone: normalizeIranPhone(phone) })
  if (error) throw error
}

export async function verifyPhoneOtp(phone: string, token: string) {
  if (!supabase) return
  const { error } = await supabase.auth.verifyOtp({ phone: normalizeIranPhone(phone), token, type: 'sms' })
  if (error) throw error
}

export async function ensureRole(role: UserRole) {
  if (!supabase) return
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw userError ?? new Error('کاربر وارد نشده است.')
  const patch = role === 'seeker'
    ? { id: user.id, phone: user.phone ?? '', is_job_seeker: true }
    : { id: user.id, phone: user.phone ?? '', is_employer: true }
  const { error } = await supabase.from('profiles').upsert(patch, { onConflict: 'id' })
  if (error) throw error
}

export async function signOutBackend() {
  if (supabase) {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}

export async function listJobs(filters?: { q?: string; city?: string; category?: string; companyId?: string; limit?: number }) {
  if (!supabase) {
    const q = filters?.q?.trim() ?? ''
    const closed = JSON.parse(localStorage.getItem('kar-yabi-closed-public-jobs') || '[]') as string[]
    return mockJobs
      .filter((job) => !closed.includes(job.id) && (!q || job.title.includes(q) || job.company.includes(q)) && (!filters?.city || job.city === filters.city) && (!filters?.category || job.category === filters.category) && (!filters?.companyId || job.companyId === filters.companyId))
      .slice(0, filters?.limit ?? 100)
  }
  let query = supabase
    .from('jobs')
    .select('id,title,city,employment_type,salary_min,salary_max,salary_negotiable,published_at,expires_at,category,description,requirements,benefits,schedule,skills,companies(id,name,description,status)')
    .eq('status', 'active')
    .order('published_at', { ascending: false })
  if (filters?.city) query = query.eq('city', filters.city)
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.companyId) query = query.eq('company_id', filters.companyId)
  if (filters?.q?.trim()) query = query.ilike('title', `%${filters.q.trim()}%`)
  if (filters?.limit) query = query.limit(filters.limit)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapDbJob)
}

export async function getJobBackend(id?: string) {
  if (!id) return null
  if (!supabase) {
    const closed = JSON.parse(localStorage.getItem('kar-yabi-closed-public-jobs') || '[]') as string[]
    return closed.includes(id) ? null : mockJobs.find((job) => job.id === id) ?? null
  }
  const { data, error } = await supabase
    .from('jobs')
    .select('id,title,city,employment_type,salary_min,salary_max,salary_negotiable,published_at,expires_at,category,description,requirements,benefits,schedule,skills,status,companies(id,name,description,status)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return mapDbJob(data)
}

export async function loadSeekerProfile(): Promise<SeekerProfile | null> {
  if (!supabase) return getSeekerProfileLocal()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null
  const { data, error } = await supabase.from('profiles').select('full_name,phone,city,experience_level,skills').eq('id', user.id).maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    fullName: data.full_name ?? '',
    phone: data.phone ?? user.phone ?? '',
    city: data.city ?? '',
    experience: data.experience_level ?? '',
    skills: (data.skills ?? []).join('، '),
  }
}

export async function saveSeekerProfileBackend(profile: SeekerProfile) {
  saveSeekerProfileLocal(profile)
  if (!supabase) return
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw userError ?? new Error('کاربر وارد نشده است.')
  const skills = profile.skills.split(/[،,]/).map((x) => x.trim()).filter(Boolean)
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    phone: user.phone ?? profile.phone,
    full_name: profile.fullName,
    city: profile.city,
    experience_level: profile.experience,
    skills,
    is_job_seeker: true,
  }, { onConflict: 'id' })
  if (error) throw error
}

async function getMyCompanyRow() {
  if (!supabase) return null
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null
  const { data, error } = await supabase
    .from('company_members')
    .select('company_id,companies(id,name,city,industry,description,phone,status)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  const companies: any = data?.companies
  return Array.isArray(companies) ? companies[0] ?? null : companies ?? null
}

export async function loadEmployerProfile(): Promise<EmployerProfile | null> {
  if (!supabase) return getEmployerProfileLocal()
  const company = await getMyCompanyRow()
  if (!company) return null
  return { companyName: company.name ?? '', phone: company.phone ?? '', city: company.city ?? '', industry: company.industry ?? '', description: company.description ?? '' }
}

export async function saveEmployerProfileBackend(profile: EmployerProfile) {
  saveEmployerProfileLocal(profile)
  if (!supabase) return
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw userError ?? new Error('کاربر وارد نشده است.')
  const existing = await getMyCompanyRow()
  if (existing) {
    const { error } = await supabase.from('companies').update({ name: profile.companyName, phone: profile.phone, city: profile.city, industry: profile.industry, description: profile.description ?? '' }).eq('id', existing.id)
    if (error) throw error
    return
  }
  const { data: company, error } = await supabase.from('companies').insert({
    name: profile.companyName,
    phone: profile.phone,
    city: profile.city,
    industry: profile.industry,
    description: profile.description ?? '',
    status: 'pending',
    created_by: user.id,
  }).select('id').single()
  if (error) throw error
  const { error: memberError } = await supabase.from('company_members').insert({ company_id: company.id, user_id: user.id, role: 'owner' })
  if (memberError) throw memberError
}

export type EmployerJobDraftPayload = {
  title: string
  city: string
  type: string
  experience: string
  description: string
  salaryMin: string
  salaryMax: string
  negotiable: boolean
  benefits: string[]
  phone: string
}

const employerOverrideKey = 'kar-yabi-employer-job-overrides'

function getPreviewEmployerOverrides(): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(employerOverrideKey) || '{}') } catch { return {} }
}

function savePreviewEmployerOverride(id: string, patch: any) {
  const rows = getPreviewEmployerOverrides()
  rows[id] = { ...(rows[id] || {}), ...patch }
  localStorage.setItem(employerOverrideKey, JSON.stringify(rows))
}

function salaryPartsFromLabel(label: string) {
  if (label.includes('توافقی')) return { salaryMin: '', salaryMax: '', negotiable: true }
  const nums = latinDigits(label).match(/\d+/g) || []
  return { salaryMin: nums[0] || '', salaryMax: nums[1] || '', negotiable: false }
}

export async function createJobBackend(draft: EmployerJobDraftPayload) {
  if (!supabase) {
    localStorage.setItem('kar-employer-draft-job', JSON.stringify({ ...draft, status: 'در انتظار بررسی' }))
    return
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw userError ?? new Error('ابتدا وارد حساب کارفرما شوید.')
  const company = await getMyCompanyRow()
  if (!company) throw new Error('ابتدا اطلاعات شرکت را تکمیل کنید.')
  const { error } = await supabase.from('jobs').insert({
    company_id: company.id,
    created_by: user.id,
    title: draft.title,
    city: draft.city,
    employment_type: draft.type,
    experience_level: draft.experience,
    description: draft.description,
    salary_min: draft.negotiable ? null : parseMoney(draft.salaryMin),
    salary_max: draft.negotiable ? null : parseMoney(draft.salaryMax),
    salary_negotiable: draft.negotiable,
    benefits: draft.benefits,
    contact_phone: draft.phone,
    status: 'pending_review',
  })
  if (error) throw error
}

function mapStatus(status: string): EmployerJob['status'] {
  if (status === 'active') return 'فعال'
  if (status === 'closed') return 'بسته‌شده'
  if (status === 'rejected') return 'ردشده'
  return 'در انتظار بررسی'
}

function previewEmployerJobs(): EmployerJob[] {
  const raw = localStorage.getItem('kar-employer-draft-job')
  const draft = raw ? JSON.parse(raw) : null
  const saved: EmployerJob[] = draft ? [{ id: 'draft', title: draft.title || 'آگهی جدید', city: draft.city || '—', type: draft.type || '—', experience: draft.experience || '—', salary: draft.negotiable ? 'حقوق توافقی' : `${draft.salaryMin || '—'} تا ${draft.salaryMax || '—'}`, benefits: draft.benefits || [], description: draft.description || '', status: draft.status || 'در انتظار بررسی', applicants: [] }] : []
  const overrides = getPreviewEmployerOverrides()
  const base = mockEmployerJobs.map((job) => ({ ...job, ...(overrides[job.id] || {}) }))
  return [...saved, ...base]
}

export async function listEmployerJobsBackend(): Promise<EmployerJob[]> {
  if (!supabase) return previewEmployerJobs()
  const company = await getMyCompanyRow()
  if (!company) return []
  const { data, error } = await supabase
    .from('jobs')
    .select('id,title,city,employment_type,experience_level,description,salary_min,salary_max,salary_negotiable,benefits,status,contact_phone,expires_at,applications(id)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    city: row.city,
    type: row.employment_type,
    experience: row.experience_level ?? '',
    salary: salaryLabel(row),
    benefits: row.benefits ?? [],
    description: row.description ?? '',
    status: mapStatus(row.status),
    expiresAt: row.expires_at ? new Date(row.expires_at).toLocaleDateString('fa-IR') : '',
    daysLeft: row.expires_at ? Math.max(0, Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 86400000)) : undefined,
    applicants: Array.from({ length: row.applications?.length ?? 0 }, (_, i) => ({ id: `count-${i}`, name: '', city: '', experience: '', skills: [], phone: '', status: 'جدید' as const })),
  }))
}

export async function getEmployerJobDraftBackend(jobId: string): Promise<EmployerJobDraftPayload | null> {
  if (!supabase) {
    if (jobId === 'draft') {
      const raw = localStorage.getItem('kar-employer-draft-job')
      if (!raw) return null
      const d = JSON.parse(raw)
      return { title: d.title || '', city: d.city || 'تهران', type: d.type || 'تمام‌وقت', experience: d.experience || '', description: d.description || '', salaryMin: d.salaryMin || '', salaryMax: d.salaryMax || '', negotiable: Boolean(d.negotiable), benefits: d.benefits || [], phone: d.phone || '' }
    }
    const job = previewEmployerJobs().find((j) => j.id === jobId)
    if (!job) return null
    const salary = salaryPartsFromLabel(job.salary)
    const overrides = getPreviewEmployerOverrides()[jobId] || {}
    return { title: job.title, city: job.city, type: job.type, experience: job.experience, description: job.description, salaryMin: overrides.salaryMin || salary.salaryMin, salaryMax: overrides.salaryMax || salary.salaryMax, negotiable: overrides.negotiable ?? salary.negotiable, benefits: job.benefits, phone: overrides.phone || '09123456789' }
  }
  const company = await getMyCompanyRow()
  if (!company) return null
  const { data, error } = await supabase.from('jobs').select('id,title,city,employment_type,experience_level,description,salary_min,salary_max,salary_negotiable,benefits,contact_phone').eq('id', jobId).eq('company_id', company.id).maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    title: data.title ?? '',
    city: data.city ?? 'تهران',
    type: data.employment_type ?? 'تمام‌وقت',
    experience: data.experience_level ?? '',
    description: data.description ?? '',
    salaryMin: data.salary_min == null ? '' : String(Math.round(Number(data.salary_min) / 1_000_000)),
    salaryMax: data.salary_max == null ? '' : String(Math.round(Number(data.salary_max) / 1_000_000)),
    negotiable: Boolean(data.salary_negotiable),
    benefits: data.benefits ?? [],
    phone: data.contact_phone ?? '',
  }
}

export async function updateEmployerJobBackend(jobId: string, draft: EmployerJobDraftPayload) {
  if (!supabase) {
    if (jobId === 'draft') {
      localStorage.setItem('kar-employer-draft-job', JSON.stringify({ ...draft, status: 'در انتظار بررسی' }))
    } else {
      savePreviewEmployerOverride(jobId, {
        title: draft.title, city: draft.city, type: draft.type, experience: draft.experience, description: draft.description,
        salary: draft.negotiable ? 'حقوق توافقی' : `${draft.salaryMin || '—'} تا ${draft.salaryMax || '—'} میلیون تومان`,
        salaryMin: draft.salaryMin, salaryMax: draft.salaryMax, negotiable: draft.negotiable, benefits: draft.benefits, phone: draft.phone,
        status: 'در انتظار بررسی',
      })
    }
    return
  }
  const company = await getMyCompanyRow()
  if (!company) throw new Error('اطلاعات شرکت پیدا نشد.')
  const { error } = await supabase.from('jobs').update({
    title: draft.title,
    city: draft.city,
    employment_type: draft.type,
    experience_level: draft.experience,
    description: draft.description,
    salary_min: draft.negotiable ? null : parseMoney(draft.salaryMin),
    salary_max: draft.negotiable ? null : parseMoney(draft.salaryMax),
    salary_negotiable: draft.negotiable,
    benefits: draft.benefits,
    contact_phone: draft.phone,
    status: 'pending_review',
  }).eq('id', jobId).eq('company_id', company.id)
  if (error) throw error
}

export async function changeEmployerJobLifecycleBackend(jobId: string, action: 'close' | 'resubmit') {
  const nextFa: EmployerJob['status'] = action === 'close' ? 'بسته‌شده' : 'در انتظار بررسی'
  if (!supabase) {
    if (jobId === 'draft') {
      const raw = localStorage.getItem('kar-employer-draft-job')
      if (!raw) return
      const d = JSON.parse(raw)
      localStorage.setItem('kar-employer-draft-job', JSON.stringify({ ...d, status: nextFa }))
    } else savePreviewEmployerOverride(jobId, { status: nextFa })
    return
  }
  const company = await getMyCompanyRow()
  if (!company) throw new Error('اطلاعات شرکت پیدا نشد.')
  const nextStatus = action === 'close' ? 'closed' : 'pending_review'
  const { error } = await supabase.from('jobs').update({ status: nextStatus }).eq('id', jobId).eq('company_id', company.id)
  if (error) throw error
}

export async function createApplicationBackend(job: Job, profile: SeekerProfile) {
  const localApplication = { jobId: job.id, jobTitle: job.title, company: job.company, status: 'submitted', appliedAt: 'امروز', fullName: profile.fullName, phone: profile.phone, city: profile.city, experience: profile.experience, skills: profile.skills }
  if (!supabase) {
    const previous = JSON.parse(localStorage.getItem('kar-yabi-applications') || '[]') as any[]
    localStorage.setItem('kar-yabi-applications', JSON.stringify([localApplication, ...previous.filter((item) => item.jobId !== job.id)]))
    pushPreviewNotification(false, { kind: 'application_submitted', title: 'درخواست همکاری ارسال شد', body: `درخواستت برای «${job.title}» ارسال شد.`, href: '/my-applications' })
    pushPreviewNotification(true, { kind: 'new_application', title: 'متقاضی جدید داری', body: `${profile.fullName || 'یک کارجو'} برای آگهی «${job.title}» درخواست همکاری فرستاده است.`, href: '/employer/applicants' })
    return
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw userError ?? new Error('ابتدا وارد حساب شوید.')
  await saveSeekerProfileBackend(profile)
  const snapshot = { full_name: profile.fullName, phone: user.phone ?? profile.phone, city: profile.city, experience_level: profile.experience, skills: profile.skills.split(/[،,]/).map((x) => x.trim()).filter(Boolean) }
  const { error } = await supabase.from('applications').insert({ job_id: job.id, applicant_id: user.id, status: 'submitted', profile_snapshot: snapshot })
  if (error) {
    if (error.code === '23505') throw new Error('قبلاً برای این شغل درخواست فرستاده‌ای.')
    throw error
  }
}


export type JobReportReason = 'misleading' | 'money_request' | 'suspicious' | 'duplicate' | 'other'

export async function submitJobReportBackend(jobId: string, reason: JobReportReason, details: string) {
  if (!supabase) {
    const rows = JSON.parse(localStorage.getItem('kar-yabi-job-reports') || '[]') as any[]
    if (rows.some((row) => row.jobId === jobId)) throw new Error('این آگهی را قبلاً گزارش کرده‌ای.')
    rows.unshift({ id: `local-${Date.now()}`, jobId, reason, details: details.trim(), status: 'pending', createdAt: new Date().toISOString() })
    localStorage.setItem('kar-yabi-job-reports', JSON.stringify(rows))
    return
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('برای گزارش آگهی ابتدا وارد حساب شو.')

  const { error } = await supabase.from('job_reports').insert({
    job_id: jobId,
    reporter_id: user.id,
    reason,
    details: details.trim().slice(0, 500),
  })
  if (error) {
    if (error.code === '23505') throw new Error('این آگهی را قبلاً گزارش کرده‌ای.')
    throw error
  }
}

export type ApplicationListItem = { jobId: string; jobTitle: string; company: string; appliedAt: string; status: string }

export async function listMyApplicationsBackend(): Promise<ApplicationListItem[]> {
  if (!supabase) return JSON.parse(localStorage.getItem('kar-yabi-applications') || '[]')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('applications')
    .select('status,applied_at,jobs(id,title,companies(name))')
    .eq('applicant_id', user.id)
    .order('applied_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs
    const company = Array.isArray(job?.companies) ? job.companies[0] : job?.companies
    return { jobId: job?.id ?? '', jobTitle: job?.title ?? 'آگهی', company: company?.name ?? 'شرکت', appliedAt: new Date(row.applied_at).toLocaleDateString('fa-IR'), status: row.status }
  })
}

function applicantStatusFa(status: string): Applicant['status'] {
  if (status === 'shortlisted') return 'مناسب'
  if (status === 'rejected') return 'مناسب نیست'
  return 'جدید'
}

export async function listApplicantsBackend(jobId: string): Promise<Applicant[]> {
  if (!supabase) return mockEmployerJobs.find((j) => j.id === jobId)?.applicants ?? []
  const { data, error } = await supabase
    .from('applications')
    .select('id,status,profile_snapshot,profiles(full_name,phone,city,experience_level,skills)')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => {
    const p = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) ?? row.profile_snapshot ?? {}
    return { id: row.id, name: p.full_name ?? 'متقاضی', city: p.city ?? '', experience: p.experience_level ?? '', skills: p.skills ?? [], phone: p.phone ?? '', status: applicantStatusFa(row.status) }
  })
}

export async function getApplicantBackend(jobId: string, applicationId: string) {
  if (supabase) {
    const { error } = await supabase.from('applications').update({ status: 'viewed', viewed_at: new Date().toISOString() }).eq('id', applicationId).eq('status', 'submitted')
    if (error) throw error
  }
  const list = await listApplicantsBackend(jobId)
  return list.find((a) => a.id === applicationId) ?? null
}

export async function getEmployerJobBackend(jobId: string): Promise<EmployerJob | null> {
  const all = await listEmployerJobsBackend()
  const found = all.find((j) => j.id === jobId)
  if (!found) return null
  found.applicants = await listApplicantsBackend(jobId)
  return found
}

export async function updateApplicationStatusBackend(applicationId: string, status: 'مناسب' | 'مناسب نیست') {
  if (!supabase) {
    pushPreviewNotification(false, { kind: status === 'مناسب' ? 'application_shortlisted' : 'application_rejected', title: status === 'مناسب' ? 'کارفرما مایل است با تو صحبت کند' : 'وضعیت درخواستت تغییر کرد', body: status === 'مناسب' ? 'یکی از کارفرماها درخواستت را مناسب تشخیص داده است.' : 'یکی از درخواست‌های همکاری تو ادامه پیدا نکرد.', href: '/my-applications' })
    return
  }
  const dbStatus = status === 'مناسب' ? 'shortlisted' : 'rejected'
  const { error } = await supabase.from('applications').update({ status: dbStatus }).eq('id', applicationId)
  if (error) throw error
}
