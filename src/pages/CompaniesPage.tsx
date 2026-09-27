import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCompaniesBackend, type PublicCompany } from '../lib/backend'

export function CompaniesPage() {
  const [items, setItems] = useState<PublicCompany[]>([])
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    listCompaniesBackend()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'بارگذاری شرکت‌ها انجام نشد.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => items.filter((company) => {
    const q = query.trim()
    return (!q || company.name.includes(q) || company.industry.includes(q)) && (!city || company.city === city)
  }), [items, query, city])

  return (
    <main className="page-shell container companies-page">
      <div className="page-heading">
        <h1>شرکت‌ها</h1>
        <p>کارفرماها و آگهی‌های فعالشان را ببین.</p>
      </div>

      <div className="company-searchbar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام شرکت یا حوزه فعالیت" />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">همه شهرها</option>
          <option>تهران</option><option>کرج</option><option>تبریز</option><option>سنندج</option>
        </select>
      </div>

      {loading ? <div className="empty-state"><p>در حال بارگذاری شرکت‌ها...</p></div> : error ? (
        <div className="empty-state"><h2>شرکت‌ها بارگذاری نشد.</h2><p>{error}</p></div>
      ) : (
        <div className="company-list">
          {visible.length ? visible.map((company) => (
            <Link className="company-card" key={company.id} to={`/companies/${company.id}`}>
              <div className="company-card-icon" aria-hidden="true">{company.name.slice(0, 1)}</div>
              <div className="company-card-main">
                <div className="company-card-title">
                  <h2>{company.name}</h2>
                  {company.status === 'verified' && <span className="verified-badge">تأیید شده</span>}
                </div>
                <p>{company.industry}</p>
                <div className="company-card-facts"><span>📍 {company.city}</span><span>{company.activeJobs} آگهی فعال</span></div>
              </div>
              <span className="company-card-arrow">‹</span>
            </Link>
          )) : <div className="empty-state"><h2>شرکتی پیدا نشد.</h2><p>عبارت جستجو یا شهر را تغییر بده.</p></div>}
        </div>
      )}
    </main>
  )
}
