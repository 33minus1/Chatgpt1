import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEmployerJobsBackend } from '../lib/backend'
import type { EmployerJob } from '../data/employerMock'

export function EmployerApplicantsOverviewPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([])
  useEffect(() => { listEmployerJobsBackend().then(setJobs) }, [])

  return <main className="employer-page"><div className="container employer-wrap">
    <div className="employer-page-head"><div><span className="status-badge">کارفرما</span><h1>متقاضیان</h1><p>آگهی را انتخاب کن تا متقاضی‌های همان شغل را ببینی.</p></div></div>

    <div className="employer-job-list">{jobs.map((job) => <article className="employer-job-card employer-job-card-v2" key={job.id}>
      <header className="employer-job-title-bar"><h3>{job.title}</h3><span className={`job-state ${job.status === 'فعال' ? 'active' : ''}`}>{job.status}</span></header>
      <div className="employer-job-body">
        <p className="employer-job-meta">{job.city} · {job.type}</p>
        <div className="employer-job-applicants-count"><span>متقاضی</span><strong>{job.applicants.length}</strong></div>
      </div>
      <footer className="employer-job-actions employer-job-footer"><Link className="btn btn-secondary compact" to={`/employer/jobs/${job.id}/applicants`}>مشاهده متقاضیان</Link></footer>
    </article>)}</div>
  </div></main>
}
