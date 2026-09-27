import { useEffect, useState } from 'react'
import { AdminGate } from './AdminGate'
import { listAdminJobs, updateAdminJobStatus, type AdminJobItem } from '../lib/adminBackend'

const label: Record<string,string> = { pending_review: 'در انتظار بررسی', active: 'فعال', rejected: 'رد شده', closed: 'بسته‌شده' }
export function AdminJobsPage() {
  const [rows, setRows] = useState<AdminJobItem[]>([])
  const [busy, setBusy] = useState('')
  const load = () => listAdminJobs().then(setRows)
  useEffect(() => { load().catch(() => {}) }, [])
  async function setStatus(id: string, status: 'active'|'rejected') { setBusy(id + status); try { await updateAdminJobStatus(id, status); await load() } finally { setBusy('') } }
  return <AdminGate><main className="admin-page"><div className="container admin-wrap">
    <header className="admin-head"><div><h1>آگهی‌ها</h1><p>آگهی‌های جدید را تأیید یا رد کن.</p></div></header>
    <div className="admin-list">{rows.map((row) => <article className="admin-card" key={row.id}>
      <div className="admin-card-main"><div><span className={`admin-state ${row.status}`}>{label[row.status]}</span><h2>{row.title}</h2><p>{row.company} · {row.city}</p>{row.status === 'active' && row.expiresAt && <p className="admin-expiry">پایان آگهی: {row.expiresAt} · {row.daysLeft?.toLocaleString('fa-IR')} روز مانده</p>}</div><small>{row.createdAt}</small></div>
      {row.status === 'pending_review' && <div className="admin-actions"><button className="btn btn-success" disabled={!!busy} onClick={() => setStatus(row.id,'active')}>تأیید و انتشار</button><button className="btn btn-danger-soft" disabled={!!busy} onClick={() => setStatus(row.id,'rejected')}>رد آگهی</button></div>}
    </article>)}</div>
  </div></main></AdminGate>
}
