import { Link } from 'react-router-dom'
import type { Job } from '../data/mock'

export function JobCard({ job }: { job: Job }) {
  const companyInitial = job.company?.trim()?.[0] || 'ک'

  return (
    <article className="job-card">
      <div className="job-card-top">
        <div className="company-mark" aria-hidden="true">{companyInitial}</div>
        <div>
          <h3>{job.title}</h3>
          <p className="company-name">{job.company}</p>
        </div>
      </div>
      <div className="job-meta">
        <span>{job.city}</span>
        <span className="meta-dot">·</span>
        <span>{job.type}</span>
      </div>
      <p className="salary">{job.salary}</p>
      <div className="job-card-footer">
        <span className="muted">{job.publishedAt}</span>
        <Link className="btn btn-secondary" to={`/jobs/${job.id}`}>مشاهده شغل</Link>
      </div>
    </article>
  )
}
