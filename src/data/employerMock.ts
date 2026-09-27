export type Applicant = {
  id: string
  name: string
  city: string
  experience: string
  skills: string[]
  phone: string
  status: 'جدید' | 'مناسب' | 'مناسب نیست'
}

export type EmployerJob = {
  id: string
  title: string
  city: string
  type: string
  experience: string
  salary: string
  benefits: string[]
  description: string
  status: 'فعال' | 'در انتظار بررسی' | 'بسته‌شده' | 'ردشده'
  expiresAt?: string
  daysLeft?: number
  applicants: Applicant[]
}

export const employerJobs: EmployerJob[] = [
  {
    id: 'e1',
    title: 'چرخکار راسته‌دوز',
    city: 'تهران',
    type: 'تمام‌وقت',
    experience: '۱ تا ۳ سال',
    salary: '۲۰ تا ۲۵ میلیون تومان',
    benefits: ['بیمه', 'ناهار', 'اضافه‌کاری'],
    description: 'برای خط تولید پوشاک به چرخکار راسته‌دوز نیاز داریم.',
    status: 'فعال',
    expiresAt: '۳ آبان ۱۴۰۵',
    daysLeft: 29,
    applicants: [
      { id: 'a1', name: 'محمد احمدی', city: 'تهران', experience: '۳ سال', skills: ['راسته‌دوز', 'سردوز'], phone: '09121234567', status: 'جدید' },
      { id: 'a2', name: 'سارا کریمی', city: 'کرج', experience: '۲ سال', skills: ['راسته‌دوز'], phone: '09351234567', status: 'مناسب' },
      { id: 'a3', name: 'علی مرادی', city: 'تهران', experience: 'کمتر از ۱ سال', skills: ['راسته‌دوز', 'اتو'], phone: '09191234567', status: 'جدید' },
    ],
  },
  {
    id: 'e2',
    title: 'انباردار',
    city: 'تهران',
    type: 'تمام‌وقت',
    experience: '۱ تا ۳ سال',
    salary: 'حقوق توافقی',
    benefits: ['بیمه'],
    description: 'برای انبار مواد اولیه به نیروی دقیق و منظم نیاز داریم.',
    status: 'فعال',
    expiresAt: '۲۸ مهر ۱۴۰۵',
    daysLeft: 24,
    applicants: [
      { id: 'a4', name: 'رضا حسینی', city: 'تهران', experience: '۲ سال', skills: ['انبارداری', 'ثبت کالا'], phone: '09211234567', status: 'جدید' },
    ],
  },
]

export function getEmployerJob(id?: string) {
  return employerJobs.find((job) => job.id === id)
}

export function getApplicant(jobId?: string, applicantId?: string) {
  return getEmployerJob(jobId)?.applicants.find((applicant) => applicant.id === applicantId)
}

export function getSavedEmployerJob(): EmployerJob | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('kar-employer-draft-job')
    if (!raw) return null
    const draft = JSON.parse(raw) as {
      title?: string
      city?: string
      type?: string
      experience?: string
      description?: string
      salaryMin?: string
      salaryMax?: string
      negotiable?: boolean
      benefits?: string[]
      status?: EmployerJob['status']
    }
    return {
      id: 'draft',
      title: draft.title || 'آگهی جدید',
      city: draft.city || '—',
      type: draft.type || '—',
      experience: draft.experience || '—',
      description: draft.description || '',
      salary: draft.negotiable ? 'حقوق توافقی' : `${draft.salaryMin || '—'} تا ${draft.salaryMax || '—'}`,
      benefits: draft.benefits || [],
      status: draft.status || 'در انتظار بررسی',
      applicants: [],
    }
  } catch {
    return null
  }
}
