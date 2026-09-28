import { useEffect, useState } from 'react'
import { AdminGate } from './AdminGate'
import { listAdminJobs, updateAdminJobStatus, type AdminJobItem } from '../lib/adminBackend'
import { deleteAdminJob } from '../lib/adminDeleteBackend'

const label: Record<string,string> = { pending_review: 'در انتظار بررسی', active: 'فعال', rejected: 'رد شده', closed: 'بسته‌شده' }

export function AdminJobsPage() {
  const [rows, setRows] = useState<AdminJobItem[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const load = () => listAdminJobs().then(setRows)

  useEffect(() => { load().catch(() => {}) }, [])

  async function setStatus(id: string, status: 'active'|'rejected') {
    setBusy(id + status); setError('')
    try { await updateAdminJobStatus(id, status); await load() }
    catch (err) { setError(err instanceof Error ? err.message : 'تغییر وضعیت انجام نشد.') }
    finally { setBusy('') }
  }

  async function remove(row: AdminJobItem) {
    const first = window.confirm(`آگهی «${row.title}» برای همیشه حذف شود؟\n\nدرخواست‌ها و گزارش‌های مربوط به این آگهی هم حذف می‌شوند.`)
    if (!first) return
    const typed = window.prompt(`برای تأیید نهایی، عنوان آگهی را دقیق وارد کن:\n${row.title}`)
    if (typed?.trim() !== row.title.trim()) return setError('حذف لغو شد؛ عنوان واردشده مطابق نبود.')

    setBusy(row.id + 'delete'); setError('')
    try { await deleteAdminJob(row.id); await load() }
    catch (err) { setError(err instanceof Error ? err.message : 'حذف آگهی انجام نشد.') }
    finally { setBusy('') }
  }

  return <AdminGate><main className="admin-page"><div className="container admin-wrap">
    <header className="admin-head"><div><h1>آگهی‌ها</h1><p>آگهی‌ها را تأیید، رد یا در صورت نیاز برای همیشه حذف کن.</p></div></header>
    {error && <p className="field-error admin-page-error">{error}</p>}
    <div className="admin-list">{rows.map((row) => <article className="admin-card" key={row.id}>
      <div className="admin-card-main"><div><span className={`admin-state ${row.status}`}>{label[row.status]}</span><h2>{row.title}</h2><p>{row.company} · {row.city}</p>{row.status === 'active' && row.expiresAt && <p className="admin-expiry">پایان آگهی: {row.expiresAt} · {row.daysLeft?.toLocaleString('fa-IR')} روز مانده</p>}</div><small>{row.createdAt}</small></div>
      <div className="admin-actions">
        {row.status === 'pending_review' && <><button className="btn btn-success" disabled={!!busy} onClick={() => setStatus(row.id,'active')}>تأیید و انتشار</button><button className="btn btn-danger-soft" disabled={!!busy} onClick={() => setStatus(row.id,'rejected')}>رد آگهی</button></>}
        <button className="btn btn-danger-soft admin-delete-btn" disabled={!!busy} onClick={() => remove(row)}>{busy === row.id + 'delete' ? 'در حال حذف...' : 'حذف کامل آگهی'}</button>
      </div>
    </article>)}</div>
  </div></main></AdminGate>
}
