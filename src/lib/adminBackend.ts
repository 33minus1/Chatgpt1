import { isSupabaseConfigured, supabase } from './supabase'

export type AdminJobStatus = 'pending_review' | 'active' | 'rejected' | 'closed'
export type AdminCompanyStatus = 'pending' | 'verified' | 'blocked'

export type AdminJobItem = {
  id: string
  title: string
  company: string
  city: string
  status: AdminJobStatus
  createdAt: string
  expiresAt?: string
  daysLeft?: number
}

export type AdminReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned'
export type AdminReportItem = {
  id: string
  jobId: string
  jobTitle: string
  company: string
  reason: string
  details: string
  status: AdminReportStatus
  reporter: string
  createdAt: string
}

export type AdminCompanyItem = {
  id: string
  name: string
  city: string
  industry: string
  phone: string
  status: AdminCompanyStatus
  createdAt: string
}

export type AdminUserItem = {
  id: string
  name: string
  phone: string
  city: string
  roles: string[]
  createdAt: string
}

const PREVIEW_JOBS: AdminJobItem[] = [
  { id: 'pj1', title: 'چرخکار راسته‌دوز', company: 'ترۆپک', city: 'تهران', status: 'pending_review', createdAt: 'امروز' },
  { id: 'pj2', title: 'فروشنده حضوری', company: 'پوشاک آرا', city: 'کرج', status: 'pending_review', createdAt: 'امروز' },
  { id: 'pj3', title: 'انباردار', company: 'پخش نوین', city: 'تهران', status: 'active', createdAt: 'دیروز', expiresAt: '۲۹ روز دیگر', daysLeft: 29 },
]

const PREVIEW_COMPANIES: AdminCompanyItem[] = [
  { id: 'pc1', name: 'ترۆپک', city: 'تهران', industry: 'تولید پوشاک', phone: '09120000000', status: 'pending', createdAt: 'امروز' },
  { id: 'pc2', name: 'پوشاک آرا', city: 'کرج', industry: 'فروش پوشاک', phone: '09350000000', status: 'pending', createdAt: 'دیروز' },
  { id: 'pc3', name: 'پخش نوین', city: 'تهران', industry: 'پخش و لجستیک', phone: '09210000000', status: 'verified', createdAt: '۳ روز پیش' },
]

const PREVIEW_USERS: AdminUserItem[] = [
  { id: 'pu1', name: 'محمد احمدی', phone: '09121234567', city: 'تهران', roles: ['کارجو'], createdAt: 'امروز' },
  { id: 'pu2', name: 'سارا کریمی', phone: '09351234567', city: 'کرج', roles: ['کارجو'], createdAt: 'دیروز' },
  { id: 'pu3', name: 'مدیر ترۆپک', phone: '09120000000', city: 'تهران', roles: ['کارفرما'], createdAt: '۳ روز پیش' },
]

const PREVIEW_REPORTS: AdminReportItem[] = [
  { id: 'pr1', jobId: '2', jobTitle: 'انباردار', company: 'پارس لجستیک', reason: 'suspicious', details: 'شماره تماس آگهی با نام شرکت همخوانی نداشت.', status: 'pending', reporter: 'یک کارجو', createdAt: 'امروز' },
]


const JOBS_KEY = 'kar-yabi-admin-jobs-v1'
const COMPANIES_KEY = 'kar-yabi-admin-companies-v1'
const REPORTS_KEY = 'kar-yabi-admin-reports-v1'

function readLocal<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : initial
  } catch {
    return initial
  }
}

function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export async function isAdminBackend() {
  if (!isSupabaseConfigured || !supabase) return true
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return Boolean(data)
}

export async function listAdminJobs(): Promise<AdminJobItem[]> {
  if (!supabase) return readLocal(JOBS_KEY, PREVIEW_JOBS)
  const { data, error } = await supabase
    .from('jobs')
    .select('id,title,city,status,created_at,expires_at,companies(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => {
    const company = Array.isArray(row.companies) ? row.companies[0] : row.companies
    return {
      id: row.id,
      title: row.title,
      company: company?.name ?? 'شرکت',
      city: row.city,
      status: row.status,
      createdAt: new Date(row.created_at).toLocaleDateString('fa-IR'),
      expiresAt: row.expires_at ? new Date(row.expires_at).toLocaleDateString('fa-IR') : '',
      daysLeft: row.expires_at ? Math.max(0, Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 86400000)) : undefined,
    }
  })
}

export async function updateAdminJobStatus(id: string, status: AdminJobStatus) {
  if (!supabase) {
    const rows = readLocal(JOBS_KEY, PREVIEW_JOBS).map((row) => row.id === id ? { ...row, status, ...(status === 'active' ? { expiresAt: '۳۰ روز دیگر', daysLeft: 30 } : {}) } : row)
    writeLocal(JOBS_KEY, rows)
    return
  }
  const patch: Record<string, unknown> = { status }
  const { error } = await supabase.from('jobs').update(patch).eq('id', id)
  if (error) throw error
}

export async function listAdminCompanies(): Promise<AdminCompanyItem[]> {
  if (!supabase) return readLocal(COMPANIES_KEY, PREVIEW_COMPANIES)
  const { data, error } = await supabase
    .from('companies')
    .select('id,name,city,industry,phone,status,created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    city: row.city ?? '',
    industry: row.industry ?? '',
    phone: row.phone ?? '',
    status: row.status,
    createdAt: new Date(row.created_at).toLocaleDateString('fa-IR'),
  }))
}

export async function updateAdminCompanyStatus(id: string, status: AdminCompanyStatus) {
  if (!supabase) {
    const rows = readLocal(COMPANIES_KEY, PREVIEW_COMPANIES).map((row) => row.id === id ? { ...row, status } : row)
    writeLocal(COMPANIES_KEY, rows)
    return
  }
  const { error } = await supabase.from('companies').update({ status }).eq('id', id)
  if (error) throw error
}

export async function listAdminUsers(): Promise<AdminUserItem[]> {
  if (!supabase) return PREVIEW_USERS
  const { data, error } = await supabase
    .from('profiles')
    .select('id,full_name,phone,city,is_job_seeker,is_employer,created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.full_name || 'کاربر',
    phone: row.phone ?? '',
    city: row.city ?? '',
    roles: [row.is_job_seeker ? 'کارجو' : '', row.is_employer ? 'کارفرما' : ''].filter(Boolean),
    createdAt: new Date(row.created_at).toLocaleDateString('fa-IR'),
  }))
}


export async function listAdminReports(): Promise<AdminReportItem[]> {
  if (!supabase) return readLocal(REPORTS_KEY, PREVIEW_REPORTS)
  const { data, error } = await supabase
    .from('job_reports')
    .select('id,job_id,reason,details,status,created_at,jobs(id,title,companies(name)),profiles(full_name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs
    const company = Array.isArray(job?.companies) ? job.companies[0] : job?.companies
    const reporter = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    return {
      id: row.id,
      jobId: row.job_id,
      jobTitle: job?.title ?? 'آگهی',
      company: company?.name ?? 'شرکت',
      reason: row.reason,
      details: row.details ?? '',
      status: row.status,
      reporter: reporter?.full_name || 'یک کارجو',
      createdAt: new Date(row.created_at).toLocaleDateString('fa-IR'),
    }
  })
}

export async function updateAdminReportStatus(id: string, status: AdminReportStatus) {
  if (!supabase) {
    const rows = readLocal(REPORTS_KEY, PREVIEW_REPORTS).map((row) => row.id === id ? { ...row, status } : row)
    writeLocal(REPORTS_KEY, rows)
    return
  }
  const { error } = await supabase.from('job_reports').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function closeReportedJob(reportId: string, jobId: string) {
  if (!supabase) {
    const reports = readLocal(REPORTS_KEY, PREVIEW_REPORTS).map((row) => row.id === reportId ? { ...row, status: 'actioned' as const } : row)
    writeLocal(REPORTS_KEY, reports)
    const jobs = readLocal(JOBS_KEY, PREVIEW_JOBS).map((row) => row.id === jobId ? { ...row, status: 'closed' as const } : row)
    writeLocal(JOBS_KEY, jobs)
    const closed = JSON.parse(localStorage.getItem('kar-yabi-closed-public-jobs') || '[]') as string[]
    if (!closed.includes(jobId)) localStorage.setItem('kar-yabi-closed-public-jobs', JSON.stringify([...closed, jobId]))
    return
  }
  const { error: jobError } = await supabase.from('jobs').update({ status: 'closed' }).eq('id', jobId)
  if (jobError) throw jobError
  const { error: reportError } = await supabase.from('job_reports').update({ status: 'actioned', reviewed_at: new Date().toISOString() }).eq('id', reportId)
  if (reportError) throw reportError
}

export async function getAdminStats() {
  const [jobs, companies, users, reports] = await Promise.all([listAdminJobs(), listAdminCompanies(), listAdminUsers(), listAdminReports()])
  return {
    pendingJobs: jobs.filter((job) => job.status === 'pending_review').length,
    pendingCompanies: companies.filter((company) => company.status === 'pending').length,
    activeJobs: jobs.filter((job) => job.status === 'active').length,
    users: users.length,
    pendingReports: reports.filter((report) => report.status === 'pending').length,
  }
}
