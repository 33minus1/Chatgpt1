import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getJobBackend, submitJobReportBackend, type JobReportReason } from '../lib/backend'
import type { Job } from '../data/mock'

const reportReasons: { value: JobReportReason; label: string }[] = [
  { value: 'misleading', label: 'اطلاعات آگهی نادرست یا گمراه‌کننده است' },
  { value: 'money_request', label: 'از کارجو درخواست پول شده است' },
  { value: 'suspicious', label: 'آگهی یا رفتار کارفرما مشکوک است' },
  { value: 'duplicate', label: 'آگهی تکراری است' },
  { value: 'other', label: 'دلیل دیگر' },
]

export function JobDetailPage() {
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState<JobReportReason>('misleading')
  const [details, setDetails] = useState('')
  const [reportBusy, setReportBusy] = useState(false)
  const [reportError, setReportError] = useState('')
  const [reported, setReported] = useState(false)

  useEffect(() => { getJobBackend(id).then(setJob).catch((e) => setLoadError(e instanceof Error ? e.message : 'بارگذاری آگهی انجام نشد.')).finally(() => setLoading(false)) }, [id])

  async function submitReport(e: FormEvent) {
    e.preventDefault()
    if (!job) return
    setReportBusy(true)
    setReportError('')
    try {
      await submitJobReportBackend(job.id, reason, details)
      setReported(true)
      setReportOpen(false)
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'ثبت گزارش انجام نشد.')
    } finally {
      setReportBusy(false)
    }
  }

  if (loading) return <main className="page-shell container"><div className="empty-state"><p>در حال بارگذاری آگهی...</p></div></main>
  if (loadError) return <main className="page-shell container"><div className="empty-state"><h1>آگهی بارگذاری نشد.</h1><p>{loadError}</p><button className="btn btn-secondary" onClick={() => window.location.reload()}>تلاش دوباره</button></div></main>
  if (!job) return <main className="page-shell container"><div className="empty-state"><h1>این آگهی فعال نیست.</h1><p>ممکن است بسته شده یا زمان آن به پایان رسیده باشد.</p><Link className="btn btn-primary" to="/jobs">بازگشت به فرصت‌های شغلی</Link></div></main>

  return <main className="job-detail-page"><div className="container detail-wrap">
    <Link className="back-link" to="/jobs">→ بازگشت به فرصت‌های شغلی</Link>
    <section className="detail-hero-card"><div><span className="status-badge">آگهی فعال</span><h1>{job.title}</h1><p className="detail-company"><Link to={`/companies/${job.companyId}`}>{job.company}</Link></p><div className="detail-meta"><span>{job.city}</span><span>·</span><span>{job.type}</span></div><p className="detail-salary">{job.salary}</p>{job.expiresAt && <p className="job-expiry-note">⏳ {job.daysLeft === 0 ? 'آخرین روز آگهی' : `${job.daysLeft?.toLocaleString('fa-IR')} روز تا پایان آگهی`} · تا {job.expiresAt}</p>}</div><Link className="btn btn-primary btn-large detail-apply-desktop" to={`/apply/${job.id}`}>درخواست همکاری</Link></section>
    <div className="detail-sections">
      <section className="detail-section"><h2>درباره این کار</h2><p>{job.description}</p></section>
      {job.requirements.length > 0 && <section className="detail-section"><h2>شرایط</h2><ul>{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      {job.schedule && <section className="detail-section"><h2>ساعت کار</h2><p>{job.schedule}</p></section>}
      {job.benefits.length > 0 && <section className="detail-section"><h2>مزایا</h2><div className="chips">{job.benefits.map((item) => <span key={item}>{item}</span>)}</div></section>}
      <section className="detail-section"><h2>درباره شرکت</h2><strong>{job.company}</strong>{job.companyDescription && <p>{job.companyDescription}</p>}<Link className="text-link company-detail-link" to={`/companies/${job.companyId}`}>مشاهده صفحه شرکت</Link></section>
      <section className="job-safety-box">
        <div><strong>مشکلی در این آگهی دیدی؟</strong><p>اگر اطلاعات نادرست است، درخواست پول شده یا مورد مشکوکی وجود دارد، به مدیر سایت گزارش بده.</p></div>
        {!reported && <button className="text-button danger-text" onClick={() => setReportOpen((v) => !v)}>{reportOpen ? 'بستن فرم' : 'گزارش این آگهی'}</button>}
        {reported && <p className="report-success">✓ گزارش ثبت شد و برای مدیر سایت ارسال شد.</p>}
        {reportOpen && !reported && <form className="report-form" onSubmit={submitReport}>
          <label>دلیل گزارش<select value={reason} onChange={(e) => setReason(e.target.value as JobReportReason)}>{reportReasons.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label>توضیح بیشتر <small>اختیاری</small><textarea maxLength={500} rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="اگر لازم است، خیلی کوتاه توضیح بده." /></label>
          {reportError && <div><p className="field-error">{reportError}</p>{reportError.includes('وارد حساب') && <Link className="text-link" to="/login">ورود / ثبت‌نام</Link>}</div>}
          <button disabled={reportBusy} className="btn btn-danger-soft">{reportBusy ? 'در حال ارسال...' : 'ارسال گزارش'}</button>
        </form>}
      </section>
    </div>
  </div><div className="sticky-apply-bar"><Link className="btn btn-primary btn-large" to={`/apply/${job.id}`}>درخواست همکاری</Link></div></main>
}
