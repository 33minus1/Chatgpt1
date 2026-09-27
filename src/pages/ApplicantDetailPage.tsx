import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApplicantBackend, getEmployerJobBackend, updateApplicationStatusBackend } from '../lib/backend'
import type { Applicant, EmployerJob } from '../data/employerMock'

export function ApplicantDetailPage() {
  const { id, applicantId } = useParams()
  const [job, setJob] = useState<EmployerJob | null>(null)
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [status, setStatus] = useState<Applicant['status']>('جدید')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { if (!id || !applicantId) return; Promise.all([getEmployerJobBackend(id), getApplicantBackend(id, applicantId)]).then(([j,a]) => { setJob(j); setApplicant(a); if (a) setStatus(a.status) }).finally(() => setLoading(false)) }, [id, applicantId])
  if (loading) return <main className="page-shell container"><div className="empty-state"><p>در حال بارگذاری...</p></div></main>
  if (!job || !applicant) return <main className="page-shell"><div className="container"><p>متقاضی پیدا نشد.</p></div></main>
  async function changeStatus(next: 'مناسب'|'مناسب نیست') { setError(''); try { await updateApplicationStatusBackend(applicant!.id, next); setStatus(next) } catch (err) { setError(err instanceof Error ? err.message : 'تغییر وضعیت انجام نشد.') } }
  return <main className="employer-page"><div className="container employer-wrap applicant-detail-wrap"><Link className="back-link" to={`/employer/jobs/${job.id}/applicants`}>→ بازگشت به متقاضیان</Link><section className="candidate-profile"><div className="candidate-profile-head"><div className="avatar large">{applicant.name.slice(0,1)}</div><div><h1>{applicant.name}</h1><p>متقاضی {job.title}</p></div></div><dl className="candidate-facts"><div><dt>شهر</dt><dd>{applicant.city}</dd></div><div><dt>سابقه</dt><dd>{applicant.experience}</dd></div><div><dt>شماره تماس</dt><dd dir="ltr">{applicant.phone}</dd></div></dl>{applicant.skills.length > 0 && <div className="candidate-skill-block"><h2>مهارت‌ها</h2><div className="chips">{applicant.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>}<div className="candidate-actions"><a className="btn btn-primary" href={`tel:${applicant.phone}`}>تماس با متقاضی</a><button className={`btn ${status === 'مناسب' ? 'btn-success' : 'btn-secondary'}`} onClick={() => changeStatus('مناسب')}>مناسب است</button><button className={`btn ${status === 'مناسب نیست' ? 'btn-danger-soft' : 'btn-secondary'}`} onClick={() => changeStatus('مناسب نیست')}>مناسب نیست</button></div>{error && <p className="field-error">{error}</p>}<p className="candidate-status-note">وضعیت فعلی: <strong>{status}</strong></p></section></div></main>
}
