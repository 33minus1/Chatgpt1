import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getEmployerProfile, getSession } from '../lib/session'
import { listNotificationsBackend } from '../lib/backend'

export function Header() {
  const location = useLocation()
  const adminMode = location.pathname.startsWith('/admin')
  const employerMode = location.pathname.startsWith('/employer')
  const session = getSession()
  const employer = getEmployerProfile()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (adminMode || !session) { setUnread(0); return }
    listNotificationsBackend(session.role === 'employer').then((items) => setUnread(items.filter((item) => !item.isRead).length)).catch(() => setUnread(0))
  }, [location.pathname, adminMode, session?.role])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to={adminMode ? '/admin' : employerMode ? '/employer' : '/'} aria-label="صفحه اصلی کاریابی">{adminMode ? 'مدیریت کاریابی' : 'کاریابی'}</Link>
        <nav className="desktop-nav" aria-label="ناوبری اصلی">
          {adminMode ? (
            <><Link to="/admin/jobs">آگهی‌ها</Link><Link to="/admin/companies">شرکت‌ها</Link><Link to="/admin/users">کاربران</Link><Link to="/">نمای سایت</Link></>
          ) : employerMode ? (
            <><Link to="/employer/jobs">آگهی‌های من</Link><Link to="/employer/applicants">متقاضیان</Link><Link to="/">بخش کارجو</Link></>
          ) : (
            <><Link to="/jobs">فرصت‌های شغلی</Link><Link to="/companies">شرکت‌ها</Link></>
          )}
        </nav>
        <div className="header-actions">
          {!adminMode && session && <Link className="notification-link" to={session.role === 'employer' ? '/employer/notifications' : '/notifications'} aria-label="اعلان‌ها"><span aria-hidden="true">◔</span>{unread > 0 && <b>{unread > 9 ? '9+' : unread}</b>}</Link>}
          {adminMode ? (
            <Link className="btn btn-ghost compact" to="/">نمای سایت</Link>
          ) : employerMode ? (
            <><Link className="btn btn-ghost desktop-only" to="/employer/account">{employer?.companyName || 'حساب شرکت'}</Link><Link className="btn btn-primary compact" to="/employer/jobs/new">+ ثبت آگهی</Link></>
          ) : session?.role === 'seeker' ? (
            <><Link className="btn btn-ghost desktop-only" to="/account">حساب من</Link><Link className="btn btn-primary compact" to="/jobs">پیدا کردن کار</Link></>
          ) : session?.role === 'employer' ? (
            <Link className="btn btn-primary compact" to="/employer">خانه کارفرما</Link>
          ) : (
            <><Link className="btn btn-ghost desktop-only" to="/login">ورود</Link><Link className="btn btn-primary compact" to="/login">ورود / ثبت‌نام</Link></>
          )}
        </div>
      </div>
    </header>
  )
}
