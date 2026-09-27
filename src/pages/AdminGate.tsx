import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isAdminBackend } from '../lib/adminBackend'

export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'allowed' | 'denied'>('loading')
  useEffect(() => { isAdminBackend().then((ok) => setState(ok ? 'allowed' : 'denied')).catch(() => setState('denied')) }, [])
  if (state === 'loading') return <main className="admin-page"><div className="container admin-wrap"><div className="admin-empty">در حال بررسی دسترسی…</div></div></main>
  if (state === 'denied') return <main className="admin-page"><div className="container admin-wrap"><div className="admin-empty"><h1>دسترسی مدیریت ندارید</h1><p>این بخش فقط برای مدیر سایت قابل مشاهده است.</p><Link className="btn btn-primary" to="/">بازگشت به سایت</Link></div></div></main>
  return <>{children}</>
}
