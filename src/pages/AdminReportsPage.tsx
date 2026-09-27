import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminGate } from './AdminGate'
import { closeReportedJob, listAdminReports, updateAdminReportStatus, type AdminReportItem, type AdminReportStatus } from '../lib/adminBackend'

const reasonLabel: Record<string,string> = {
  misleading: 'اطلاعات نادرست یا گمراه‌کننده',
  money_request: 'درخواست پول از کارجو',
  suspicious: 'مورد مشکوک',
  duplicate: 'آگهی تکراری',
  other: 'دلیل دیگر',
}
const statusLabel: Record<string,string> = { pending: 'منتظر بررسی', reviewed: 'بررسی شد', dismissed: 'رد گزارش', actioned: 'اقدام شد' }

export function AdminReportsPage() {
  const [rows, setRows] = useState<AdminReportItem[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const load = () => listAdminReports().then(setRows)
  useEffect(() => { load().catch(() => setError('بارگذاری گزارش‌ها انجام نشد.')) }, [])

  async function setStatus(row: AdminReportItem, status: AdminReportStatus) {
    setBusy(row.id + status); setError('')
    try { await updateAdminReportStatus(row.id, status); await load() }
    catch { setError('ذخیره نتیجه بررسی انجام نشد.') }
    finally { setBusy('') }
  }

  async function closeJob(row: AdminReportItem) {
    if (!window.confirm(`آگهی «${row.jobTitle}» بسته شود؟`)) return
    setBusy(row.id + 'close'); setError('')
    try { await closeReportedJob(row.id, row.jobId); await load() }
    catch { setError('بستن آگهی انجام نشد.') }
    finally { setBusy('') }
  }

  return <AdminGate><main className="admin-page"><div className="container admin-wrap">
    <header className="admin-head"><div><h1>گزارش‌های آگهی</h1><p>گزارش کارجوها را ببین و فقط در صورت نیاز اقدام کن.</p></div></header>
    {error && <p className="field-error">{error}</p>}
    <div className="admin-list">{rows.length === 0 ? <div className="admin-empty"><h1>گزارشی وجود ندارد</h1><p>گزارش‌های جدید اینجا نمایش داده می‌شوند.</p></div> : rows.map((row) => <article className="admin-card report-admin-card" key={row.id}>
      <div className="admin-card-main"><div><span className={`admin-state report-${row.status}`}>{statusLabel[row.status]}</span><h2>{row.jobTitle}</h2><p>{row.company} · {reasonLabel[row.reason] ?? row.reason}</p><p className="reporter-line">گزارش‌دهنده: {row.reporter}</p>{row.details && <blockquote>{row.details}</blockquote>}</div><small>{row.createdAt}</small></div>
      <div className="admin-actions reports-actions">
        <Link className="btn btn-secondary compact" to={`/jobs/${row.jobId}`}>مشاهده آگهی</Link>
        {row.status === 'pending' && <button className="btn btn-success compact" disabled={!!busy} onClick={() => setStatus(row, 'reviewed')}>بررسی شد</button>}
        {row.status === 'pending' && <button className="btn btn-ghost compact" disabled={!!busy} onClick={() => setStatus(row, 'dismissed')}>رد گزارش</button>}
        {row.status === 'pending' && <button className="btn btn-danger-soft compact" disabled={!!busy} onClick={() => closeJob(row)}>بستن آگهی</button>}
      </div>
    </article>)}</div>
  </div></main></AdminGate>
}
