import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEmployerJobBackend } from '../lib/backend'
import type { EmployerJob } from '../data/employerMock'

export function ApplicantsPage() {
  const { id } = useParams()
  const [job, setJob] = useState<EmployerJob | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { if (id) getEmployerJobBackend(id).then(setJob).finally(() => setLoading(false)) }, [id])
  if (loading) return <main className="page-shell container"><div className="empty-state"><p>در حال بارگذاری...</p></div></main>
  if (!job) return <main className="page-shell"><div className="container"><p>آگهی پیدا نشد.</p></div></main>
  return <main className="employer-page"><div className="container employer-wrap"><Link className="back-link" to="/employer/jobs">→ بازگشت به آگهی‌ها</Link><div className="employer-page-head"><div><span className="status-badge">{job.applicants.length} متقاضی</span><h1>{job.title}</h1><p>{job.city} · {job.type}</p></div></div>{job.applicants.length ? <div className="applicant-list">{job.applicants.map((applicant) => <article className="applicant-card" key={applicant.id}><div className="applicant-main"><div className="avatar">{applicant.name.slice(0,1)}</div><div><div className="card-title-row"><h2>{applicant.name}</h2><span className={`candidate-state ${applicant.status === 'مناسب' ? 'good' : applicant.status === 'مناسب نیست' ? 'bad' : ''}`}>{applicant.status}</span></div><p>{applicant.city} · {applicant.experience} سابقه</p><div className="chips small-chips">{applicant.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></div><Link className="btn btn-secondary compact" to={`/employer/jobs/${job.id}/applicants/${applicant.id}`}>مشاهده</Link></article>)}</div> : <div className="empty-state"><h2>هنوز متقاضی‌ای ثبت نشده است.</h2></div>}</div></main>
}
