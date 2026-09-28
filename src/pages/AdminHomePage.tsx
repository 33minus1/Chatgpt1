import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminGate } from './AdminGate'
import { getAdminStats } from '../lib/adminBackend'

export function AdminHomePage() {
  const [stats, setStats] = useState({ pendingJobs: 0, pendingCompanies: 0, activeJobs: 0, users: 0, pendingReports: 0 })
  useEffect(() => { getAdminStats().then(setStats).catch(() => {}) }, [])
  return <AdminGate><main className="admin-page"><div className="container admin-wrap">
    <header className="admin-head"><div><span className="status-badge">مدیریت</span><h1>خلاصه سایت</h1><p>فقط مواردی که نیاز به بررسی دارند.</p></div></header>
    <div className="admin-stats">
      <Link to="/admin/jobs" className="admin-stat attention"><strong>{stats.pendingJobs.toLocaleString('fa-IR')}</strong><span>آگهی منتظر بررسی</span></Link>
      <Link to="/admin/companies" className="admin-stat attention"><strong>{stats.pendingCompanies.toLocaleString('fa-IR')}</strong><span>شرکت منتظر تأیید</span></Link>
      <Link to="/admin/jobs" className="admin-stat"><strong>{stats.activeJobs.toLocaleString('fa-IR')}</strong><span>آگهی فعال</span></Link>
      <Link to="/admin/users" className="admin-stat"><strong>{stats.users.toLocaleString('fa-IR')}</strong><span>کاربر</span></Link>
      <Link to="/admin/reports" className={`admin-stat ${stats.pendingReports ? 'attention' : ''}`}><strong>{stats.pendingReports.toLocaleString('fa-IR')}</strong><span>گزارش آگهی</span></Link>
    </div>
    <section className="admin-quick"><h2>مدیریت سایت</h2>
      <Link to="/admin/jobs"><span>بررسی آگهی‌های جدید</span><strong>{stats.pendingJobs.toLocaleString('fa-IR')}</strong></Link>
      <Link to="/admin/companies"><span>بررسی شرکت‌های جدید</span><strong>{stats.pendingCompanies.toLocaleString('fa-IR')}</strong></Link>
      <Link to="/admin/reports"><span>بررسی گزارش‌های کارجوها</span><strong>{stats.pendingReports.toLocaleString('fa-IR')}</strong></Link>
      <Link to="/admin/cities"><span>مدیریت شهرهای سایت</span><strong>›</strong></Link>
    </section>
  </div></main></AdminGate>
}
