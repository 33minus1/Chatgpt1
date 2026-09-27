import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { changeEmployerJobLifecycleBackend, listEmployerJobsBackend } from '../lib/backend'
import type { EmployerJob } from '../data/employerMock'

export function EmployerJobsPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  async function load() { setLoading(true); try { setJobs(await listEmployerJobsBackend()) } catch (err) { setError(err instanceof Error ? err.message : 'بارگذاری آگهی‌ها انجام نشد.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  async function lifecycle(job: EmployerJob, action: 'close' | 'resubmit') {
    if (action === 'close' && !window.confirm(`آگهی «${job.title}» بسته شود؟ کارجوها دیگر نمی‌توانند درخواست جدید بفرستند.`)) return
    setBusy(job.id + action); setError('')
    try { await changeEmployerJobLifecycleBackend(job.id, action); await load() } catch (err) { setError(err instanceof Error ? err.message : 'تغییر وضعیت آگهی انجام نشد.') } finally { setBusy('') }
  }
  return <main className="employer-page"><div className="container employer-wrap"><div className="employer-page-head inline-head"><div><span className="status-badge">کارفرما</span><h1>آگهی‌های من</h1><p>آگهی را ویرایش کن، ببند یا برای بررسی دوباره بفرست.</p></div><Link className="btn btn-primary" to="/employer/jobs/new">+ ثبت آگهی</Link></div>{error && <p className="field-error">{error}</p>}{loading ? <div className="empty-state"><p>در حال بارگذاری...</p></div> : <div className="employer-job-list">{jobs.length === 0 ? <div className="empty-state"><h2>هنوز آگهی نداری</h2><p>اولین آگهی استخدام را ثبت کن.</p><Link className="btn btn-primary" to="/employer/jobs/new">ثبت آگهی</Link></div> : jobs.map((job) => <article className="employer-job-card" key={job.id}><div><div className="card-title-row"><h3>{job.title}</h3><span className={`job-state ${job.status === 'فعال' ? 'active' : job.status === 'ردشده' ? 'rejected' : job.status === 'بسته‌شده' ? 'closed' : ''}`}>{job.status}</span></div><p>{job.city} · {job.type}</p><div className="job-card-facts"><span>{job.salary}</span><span>{job.applicants.length} متقاضی</span></div>{job.status === 'در انتظار بررسی' && <p className="job-inline-note">تا زمان تأیید مدیر، این آگهی برای کارجوها نمایش داده نمی‌شود.</p>}{job.status === 'فعال' && job.expiresAt && <p className="job-inline-note expiry">⏳ {job.daysLeft?.toLocaleString('fa-IR')} روز مانده · پایان {job.expiresAt}</p>}{job.status === 'بسته‌شده' && <p className="job-inline-note">آگهی بسته است و درخواست جدید نمی‌گیرد.</p>}{job.status === 'ردشده' && <p className="job-inline-note">می‌توانی آگهی را ویرایش و دوباره برای بررسی ارسال کنی.</p>}</div><div className="employer-job-actions"><Link className="btn btn-secondary compact" to={`/employer/jobs/${job.id}/applicants`}>متقاضیان</Link><Link className="btn btn-ghost compact" to={`/employer/jobs/${job.id}/edit`}>ویرایش</Link>{job.status === 'فعال' && <button disabled={busy === job.id + 'close'} className="btn btn-ghost compact danger-soft" onClick={() => lifecycle(job, 'close')}>{busy === job.id + 'close' ? '...' : 'بستن آگهی'}</button>}{(job.status === 'بسته‌شده' || job.status === 'ردشده') && <button disabled={busy === job.id + 'resubmit'} className="btn btn-primary compact" onClick={() => lifecycle(job, 'resubmit')}>{busy === job.id + 'resubmit' ? '...' : 'ارسال برای بررسی'}</button>}</div></article>)}</div>}</div></main>
}
