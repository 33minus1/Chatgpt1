import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categories, type Job } from '../data/mock'
import { JobCard } from '../components/JobCard'
import { listJobs } from '../lib/backend'

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [latest, setLatest] = useState<Job[]>([])
  const [loadingLatest, setLoadingLatest] = useState(true)
  const [latestError, setLatestError] = useState(false)
  useEffect(() => { listJobs({ limit: 4 }).then((rows) => { setLatest(rows); setLatestError(false) }).catch(() => { setLatest([]); setLatestError(true) }).finally(() => setLoadingLatest(false)) }, [])

  function submitSearch(event: FormEvent) {
    event.preventDefault(); const params = new URLSearchParams(); if (query.trim()) params.set('q', query.trim()); if (city) params.set('city', city); navigate(`/jobs${params.size ? `?${params.toString()}` : ''}`)
  }

  return <main><section className="hero"><div className="container hero-content"><div className="hero-copy"><p className="eyebrow">ساده، سریع و بدون فرم‌های پیچیده</p><h1>دنبال کار می‌گردی؟</h1><p>کار مناسب خودت را پیدا کن و در چند مرحله کوتاه درخواست بده.</p></div><form className="search-panel" onSubmit={submitSearch}><label><span>چه کاری بلدی یا دنبال چه کاری هستی؟</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثال: خیاط، راننده، فروشنده" /></label><label><span>شهرت کجاست؟</span><select value={city} onChange={(e) => setCity(e.target.value)}><option value="">همه شهرها</option><option>تهران</option><option>کرج</option><option>تبریز</option><option>سنندج</option><option>ارومیه</option></select></label><button className="btn btn-primary btn-large">پیدا کردن کار</button></form></div></section><section className="section container"><div className="section-heading"><div><h2>شغلت را انتخاب کن</h2><p>اگر نمی‌دانی چه چیزی جستجو کنی، از اینجا شروع کن.</p></div><Link className="text-link desktop-only" to="/jobs">همه شغل‌ها</Link></div><div className="category-grid">{categories.map((category) => <Link className="category-card" key={category.label} to={`/jobs?category=${encodeURIComponent(category.label)}`}><span className="category-icon">{category.icon}</span><strong>{category.label}</strong></Link>)}</div><Link className="btn btn-secondary mobile-wide desktop-hidden" to="/jobs">مشاهده همه شغل‌ها</Link></section><section className="section section-soft"><div className="container"><div className="section-heading"><div><h2>فرصت‌های شغلی جدید</h2><p>چند مورد از تازه‌ترین آگهی‌ها.</p></div><Link className="text-link desktop-only" to="/jobs">مشاهده همه</Link></div><div className="jobs-grid">{loadingLatest ? <div className="empty-state"><p>در حال بارگذاری آگهی‌های جدید...</p></div> : latestError ? <div className="empty-state"><p>آگهی‌های جدید فعلاً بارگذاری نشدند.</p><Link className="text-link" to="/jobs">مشاهده همه فرصت‌ها</Link></div> : latest.length ? latest.map((job) => <JobCard key={job.id} job={job} />) : <div className="empty-state"><p>فعلاً آگهی فعالی وجود ندارد.</p></div>}</div><Link className="btn btn-secondary mobile-wide desktop-hidden" to="/jobs">مشاهده همه فرصت‌های شغلی</Link></div></section><section className="section container"><div className="employer-cta"><div><p className="eyebrow">برای کارفرماها</p><h2>دنبال نیروی مناسب هستید؟</h2><p>آگهی استخدام را در چند مرحله کوتاه ثبت کنید و متقاضیان را ببینید.</p></div><Link className="btn btn-primary btn-large" to="/employer/jobs/new">ثبت آگهی استخدام</Link></div></section><section className="section container how-it-works"><div className="section-heading simple"><div><h2>چطور کار پیدا کنم؟</h2><p>فقط سه قدم.</p></div></div><div className="steps-grid"><div className="step-card"><span>۱</span><strong>شغلت را پیدا کن</strong><p>عنوان کار یا شهر را جستجو کن.</p></div><div className="step-card"><span>۲</span><strong>اطلاعات کوتاهت را وارد کن</strong><p>بدون ساخت رزومه پیچیده.</p></div><div className="step-card"><span>۳</span><strong>درخواستت را بفرست</strong><p>بعداً وضعیت را از حساب خودت ببین.</p></div></div></section></main>
}
