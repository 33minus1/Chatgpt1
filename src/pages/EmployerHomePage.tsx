import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEmployerJobsBackend } from '../lib/backend'
import type { EmployerJob } from '../data/employerMock'

export function EmployerHomePage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { listEmployerJobsBackend().then(setJobs).finally(() => setLoading(false)) }, [])
  const activeJobs = jobs.filter((job) => job.status === 'فعال')
  const applicantsCount = jobs.reduce((sum, job) => sum + job.applicants.length, 0)
  return <main className="employer-page"><div className="container employer-wrap"><div className="employer-page-head"><div><span className="status-badge">کارفرما</span><h1>سلام 👋</h1><p>آگهی‌ها و متقاضی‌ها را از همین‌جا مدیریت کن.</p></div><Link className="btn btn-primary" to="/employer/jobs/new">+ ثبت آگهی استخدام</Link></div><section className="employer-stats"><div className="stat-card"><strong>{loading ? '—' : activeJobs.length}</strong><span>آگهی فعال</span></div><div className="stat-card"><strong>{loading ? '—' : applicantsCount}</strong><span>متقاضی</span></div></section><section className="employer-section"><div className="section-head-row"><h2>آگهی‌های من</h2><Link to="/employer/jobs">مشاهده همه</Link></div>{loading ? <div className="empty-state"><p>در حال بارگذاری...</p></div> : jobs.length ? <div className="employer-job-list">{jobs.slice(0,3).map((job) => <article className="employer-job-card" key={job.id}><div><div className="card-title-row"><h3>{job.title}</h3><span className={`job-state ${job.status === 'فعال' ? 'active' : ''}`}>{job.status}</span></div><p>{job.city} · {job.type}</p><strong>{job.applicants.length} متقاضی</strong></div><Link className="btn btn-secondary compact" to={`/employer/jobs/${job.id}/applicants`}>مشاهده متقاضیان</Link></article>)}</div> : <div className="empty-state"><h2>هنوز آگهی نداری.</h2><Link className="btn btn-primary" to="/employer/jobs/new">ثبت اولین آگهی</Link></div>}</section></div></main>
}
