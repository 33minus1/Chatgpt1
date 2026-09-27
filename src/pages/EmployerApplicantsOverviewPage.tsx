import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEmployerJobsBackend } from '../lib/backend'
import type { EmployerJob } from '../data/employerMock'

export function EmployerApplicantsOverviewPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([])
  useEffect(() => { listEmployerJobsBackend().then(setJobs) }, [])
  return <main className="employer-page"><div className="container employer-wrap"><div className="employer-page-head"><div><span className="status-badge">کارفرما</span><h1>متقاضیان</h1><p>آگهی را انتخاب کن تا متقاضی‌های همان شغل را ببینی.</p></div></div><div className="employer-job-list">{jobs.map((job) => <article className="employer-job-card" key={job.id}><div><h3>{job.title}</h3><p>{job.city} · {job.type}</p><strong>{job.applicants.length} متقاضی</strong></div><Link className="btn btn-secondary compact" to={`/employer/jobs/${job.id}/applicants`}>مشاهده</Link></article>)}</div></div></main>
}
