import { Link } from 'react-router-dom'
import type { Job } from '../data/mock'

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <div>
        <h3>{job.title}</h3>
        <p className="company-name">{job.company}</p>
      </div>
      <div className="job-meta">
        <span>{job.city}</span>
        <span>·</span>
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
