import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { listJobs } from '../lib/backend'
import type { Job } from '../data/mock'

export function JobsPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? '')
  const [items, setItems] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true); setError('')
    listJobs({ q: params.get('q') ?? '', city: params.get('city') ?? '', category: params.get('category') ?? '' })
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'بارگذاری آگهی‌ها انجام نشد.'))
      .finally(() => setLoading(false))
  }, [params])

  function search() {
    const next = new URLSearchParams(params)
    query.trim() ? next.set('q', query.trim()) : next.delete('q')
    city ? next.set('city', city) : next.delete('city')
    setParams(next)
  }

  return <main className="page-shell container jobs-page"><div className="page-heading"><h1>فرصت‌های شغلی</h1><p>کار مناسب خودت را پیدا کن.</p></div><div className="jobs-searchbar"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="عنوان شغل" /><select value={city} onChange={(e) => setCity(e.target.value)}><option value="">همه شهرها</option><option>تهران</option><option>کرج</option><option>تبریز</option><option>سنندج</option></select><button className="btn btn-primary" onClick={search}>جستجو</button></div>{loading ? <div className="empty-state"><p>در حال بارگذاری فرصت‌ها...</p></div> : error ? <div className="empty-state"><h2>آگهی‌ها بارگذاری نشد.</h2><p>{error}</p></div> : <><div className="result-summary"><strong>{items.length}</strong> فرصت شغلی</div><div className="jobs-grid">{items.length ? items.map((job) => <JobCard job={job} key={job.id} />) : <div className="empty-state"><h2>شغلی با این مشخصات پیدا نکردیم.</h2><p>شهر یا عبارت جستجو را تغییر بده.</p><button className="btn btn-secondary" onClick={() => { setQuery(''); setCity(''); setParams({}) }}>پاک کردن جستجو</button></div>}</div></>}</main>
}
