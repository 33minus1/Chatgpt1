import { NavLink, useLocation } from 'react-router-dom'

const seekerItems = [
  { to: '/', label: 'خانه', icon: '⌂' },
  { to: '/jobs', label: 'کارها', icon: '⌕' },
  { to: '/my-applications', label: 'درخواست‌ها', icon: '▣' },
  { to: '/account', label: 'حساب', icon: '◯' },
]
const adminItems = [
  { to: '/admin', label: 'خلاصه', icon: '⌂' },
  { to: '/admin/jobs', label: 'آگهی‌ها', icon: '▤' },
  { to: '/admin/companies', label: 'شرکت‌ها', icon: '▦' },
  { to: '/admin/users', label: 'کاربران', icon: '♙' },
]
const employerItems = [
  { to: '/employer', label: 'خانه', icon: '⌂' },
  { to: '/employer/jobs', label: 'آگهی‌ها', icon: '▤' },
  { to: '/employer/applicants', label: 'متقاضیان', icon: '♙' },
  { to: '/employer/account', label: 'حساب', icon: '◯' },
]
export function BottomNav() {
  const location = useLocation()
  const adminMode = location.pathname.startsWith('/admin')
  const employerMode = location.pathname.startsWith('/employer')
  const items = adminMode ? adminItems : employerMode ? employerItems : seekerItems
  if (location.pathname === '/login') return null
  return <nav className="bottom-nav" aria-label="ناوبری موبایل">{items.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/' || item.to === '/employer' || item.to === '/admin'}><span aria-hidden="true">{item.icon}</span><small>{item.label}</small></NavLink>)}</nav>
}
