import { Link } from 'react-router-dom'
import type { Job } from '../data/mock'

export function JobCard({ job }: { job: Job }) {
  const companyInitial = job.company?.trim()?.[0] || 'ک'

  return (
    <article className="job-card job-card-v2">
      <header className="job-card-titlebar">
        <span className="job-card-titlebar-label">فرصت شغلی</span>
        <h3>{job.title}</h3>
      </header>

      <div className="job-card-body-v2">
        <div className="job-company-row">
          <div className="company-mark" aria-hidden="true">{companyInitial}</div>
          <div className="job-company-copy">
            <span>شرکت</span>
            <strong>{job.company}</strong>
          </div>
        </div>

        <div className="job-card-facts-v2" aria-label="مشخصات شغل">
          <span><b aria-hidden="true">⌖</b>{job.city}</span>
          <span><b aria-hidden="true">◷</b>{job.type}</span>
        </div>

        <div className="job-card-salary-box">
          <span>حقوق و مزایا</span>
          <strong>{job.salary}</strong>
        </div>

        <footer className="job-card-footer job-card-footer-v2">
          <div className="job-card-date">
            <span>تاریخ انتشار</span>
            <strong>{job.publishedAt}</strong>
          </div>
          <Link className="job-card-action" to={`/jobs/${job.id}`}>مشاهده آگهی <span aria-hidden="true">←</span></Link>
        </footer>
      </div>
    </article>
  )
}
