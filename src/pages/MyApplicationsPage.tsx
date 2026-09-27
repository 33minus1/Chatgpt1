import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listMyApplicationsBackend, type ApplicationListItem } from '../lib/backend'

const statusText: Record<string,string> = { submitted: 'ارسال شد', viewed: 'دیده شد', shortlisted: 'تماس می‌گیرند', rejected: 'این موقعیت ادامه پیدا نکرد' }

export function MyApplicationsPage() {
  const [items, setItems] = useState<ApplicationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { listMyApplicationsBackend().then(setItems).catch((e) => setError(e instanceof Error ? e.message : 'درخواست‌ها بارگذاری نشدند.')).finally(() => setLoading(false)) }, [])
  return <main className="page-shell container"><div className="page-heading"><h1>درخواست‌های من</h1><p>وضعیت درخواست‌هایی که فرستاده‌ای.</p></div>{loading ? <div className="empty-state"><p>در حال بارگذاری...</p></div> : error ? <div className="empty-state"><h2>درخواست‌ها بارگذاری نشدند.</h2><p>{error}</p><button className="btn btn-secondary" onClick={() => window.location.reload()}>تلاش دوباره</button></div> : items.length ? <div className="application-list">{items.map((item) => <article className="application-card" key={`${item.jobId}-${item.appliedAt}`}><div><h2>{item.jobTitle}</h2><p>{item.company}</p></div><div className="application-status"><span>{statusText[item.status] ?? 'ارسال شد'}</span><small>{item.appliedAt}</small></div><Link className="text-link" to={`/jobs/${item.jobId}`}>مشاهده آگهی</Link></article>)}</div> : <div className="empty-state application-empty"><h2>هنوز درخواستی نداری.</h2><p>یک فرصت شغلی پیدا کن و درخواست همکاری بفرست.</p><Link className="btn btn-primary" to="/jobs">پیدا کردن کار</Link></div>}</main>
}
