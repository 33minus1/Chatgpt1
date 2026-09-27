import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import type { Job } from '../data/mock'
import { getCompanyBackend, listJobs, type PublicCompany } from '../lib/backend'

export function CompanyDetailPage() {
  const { id } = useParams()
  const [company, setCompany] = useState<PublicCompany | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getCompanyBackend(id), listJobs({ companyId: id })])
      .then(([companyData, jobData]) => { setCompany(companyData); setJobs(jobData) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="page-shell container"><div className="empty-state"><p>در حال بارگذاری اطلاعات شرکت...</p></div></main>
  if (!company) return <main className="page-shell container"><div className="empty-state"><h1>شرکت پیدا نشد.</h1><Link className="btn btn-secondary" to="/companies">بازگشت به شرکت‌ها</Link></div></main>

  return (
    <main className="company-profile-page">
      <section className="company-profile-hero">
        <div className="container company-profile-head">
          <Link className="back-link" to="/companies">← شرکت‌ها</Link>
          <div className="company-profile-identity">
            <div className="company-logo-placeholder">{company.name.slice(0, 1)}</div>
            <div>
              <div className="company-name-row"><h1>{company.name}</h1>{company.status === 'verified' && <span className="verified-badge">✓ تأیید شده</span>}</div>
              <p>{company.industry}</p>
              <div className="company-profile-facts"><span>📍 {company.city}</span><span>{jobs.length} آگهی فعال</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="container company-profile-body">
        <section className="company-about-card">
          <h2>درباره شرکت</h2>
          <p>{company.description || 'این شرکت هنوز توضیح بیشتری ثبت نکرده است.'}</p>
        </section>

        <section className="company-jobs-section">
          <div className="section-heading simple"><div><h2>فرصت‌های شغلی فعال</h2><p>آگهی‌های منتشرشده این شرکت.</p></div></div>
          <div className="jobs-grid">
            {jobs.length ? jobs.map((job) => <JobCard key={job.id} job={job} />) : <div className="empty-state"><h2>فعلاً آگهی فعالی ندارد.</h2><p>می‌توانی فرصت‌های دیگر را ببینی.</p><Link className="btn btn-secondary" to="/jobs">مشاهده فرصت‌های شغلی</Link></div>}
          </div>
        </section>
      </div>
    </main>
  )
}
