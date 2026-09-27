import { Link, useLocation } from 'react-router-dom'

export function Footer() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div><strong>کاریابی</strong><p>پیدا کردن کار و نیرو، بدون فرم‌های پیچیده.</p></div>
        <nav aria-label="پیوندهای راهنما">
          <Link to="/help">راهنما</Link>
          <Link to="/terms">قوانین استفاده</Link>
          <Link to="/privacy">حریم خصوصی</Link>
        </nav>
      </div>
    </footer>
  )
}
