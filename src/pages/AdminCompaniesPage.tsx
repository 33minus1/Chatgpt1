import { useEffect, useState } from 'react'
import { AdminGate } from './AdminGate'
import { listAdminCompanies, updateAdminCompanyStatus, type AdminCompanyItem } from '../lib/adminBackend'
import { deleteAdminCompany } from '../lib/adminDeleteBackend'

const label: Record<string,string> = { pending:'در انتظار تأیید', verified:'تأیید شده', blocked:'مسدود' }

export function AdminCompaniesPage() {
  const [rows,setRows] = useState<AdminCompanyItem[]>([])
  const [busy,setBusy] = useState('')
  const [error,setError] = useState('')
  const load = () => listAdminCompanies().then(setRows)

  useEffect(() => { load().catch(() => {}) }, [])

  async function setStatus(id:string,status:'verified'|'blocked') {
    setBusy(id+status); setError('')
    try { await updateAdminCompanyStatus(id,status); await load() }
    catch (err) { setError(err instanceof Error ? err.message : 'تغییر وضعیت شرکت انجام نشد.') }
    finally { setBusy('') }
  }

  async function remove(row: AdminCompanyItem) {
    const first = window.confirm(`شرکت «${row.name}» برای همیشه حذف شود؟\n\nتمام آگهی‌ها، درخواست‌ها و گزارش‌های وابسته به این شرکت نیز حذف می‌شوند.`)
    if (!first) return
    const typed = window.prompt(`برای تأیید نهایی، نام شرکت را دقیق وارد کن:\n${row.name}`)
    if (typed?.trim() !== row.name.trim()) return setError('حذف لغو شد؛ نام شرکت مطابق نبود.')

    setBusy(row.id + 'delete'); setError('')
    try { await deleteAdminCompany(row.id); await load() }
    catch (err) { setError(err instanceof Error ? err.message : 'حذف شرکت انجام نشد.') }
    finally { setBusy('') }
  }

  return <AdminGate><main className="admin-page"><div className="container admin-wrap">
    <header className="admin-head"><div><h1>شرکت‌ها</h1><p>شرکت‌ها را تأیید، مسدود یا در صورت نیاز برای همیشه حذف کن.</p></div></header>
    {error && <p className="field-error admin-page-error">{error}</p>}
    <div className="admin-list">{rows.map(row => <article className="admin-card" key={row.id}>
      <div className="admin-card-main"><div><span className={`admin-state ${row.status}`}>{label[row.status]}</span><h2>{row.name}</h2><p>{row.industry || 'بدون حوزه فعالیت'} · {row.city || 'شهر نامشخص'}</p><p className="admin-phone">{row.phone || 'شماره ثبت نشده'}</p></div><small>{row.createdAt}</small></div>
      <div className="admin-actions">
        {row.status === 'pending' && <><button className="btn btn-success" disabled={!!busy} onClick={() => setStatus(row.id,'verified')}>تأیید شرکت</button><button className="btn btn-danger-soft" disabled={!!busy} onClick={() => setStatus(row.id,'blocked')}>مسدود کردن</button></>}
        <button className="btn btn-danger-soft admin-delete-btn" disabled={!!busy} onClick={() => remove(row)}>{busy === row.id + 'delete' ? 'در حال حذف...' : 'حذف کامل شرکت'}</button>
      </div>
    </article>)}</div>
  </div></main></AdminGate>
}
