import { useEffect, useState } from 'react'
import { AdminGate } from './AdminGate'
import { listAdminUsers, type AdminUserItem } from '../lib/adminBackend'
import { deleteAdminUser } from '../lib/adminDeleteBackend'

export function AdminUsersPage() {
  const [rows,setRows] = useState<AdminUserItem[]>([])
  const [busy,setBusy] = useState('')
  const [error,setError] = useState('')
  const load = () => listAdminUsers().then(setRows)

  useEffect(() => { load().catch(() => {}) }, [])

  async function remove(row: AdminUserItem) {
    const first = window.confirm(`حساب «${row.name}» حذف شود؟\n\nپروفایل، درخواست‌ها، اعلان‌ها و دسترسی‌های داخل سایت حذف می‌شوند و این حساب دیگر نمی‌تواند در کارزان دوباره پروفایل بسازد.\n\nشرکت‌های ثبت‌شده توسط این کاربر خودکار حذف نمی‌شوند.`)
    if (!first) return
    const typed = window.prompt(`برای تأیید نهایی، شماره موبایل کاربر را دقیق وارد کن:\n${row.phone}`)
    if (typed?.trim() !== row.phone.trim()) return setError('حذف لغو شد؛ شماره موبایل مطابق نبود.')

    setBusy(row.id + 'delete'); setError('')
    try { await deleteAdminUser(row.id); await load() }
    catch (err) { setError(err instanceof Error ? err.message : 'حذف حساب کاربر انجام نشد.') }
    finally { setBusy('') }
  }

  return <AdminGate><main className="admin-page"><div className="container admin-wrap">
    <header className="admin-head"><div><h1>کاربران</h1><p>کاربران ثبت‌شده را مشاهده کن یا در صورت نیاز حسابشان را حذف کن.</p></div></header>
    {error && <p className="field-error admin-page-error">{error}</p>}
    <div className="admin-list">{rows.map(row => <article className="admin-card admin-user-card" key={row.id}>
      <div><h2>{row.name}</h2><p>{row.phone} · {row.city || 'شهر نامشخص'}</p><div className="chips small-chips">{row.roles.map(role => <span key={role}>{role}</span>)}</div></div>
      <div className="admin-user-actions"><small>{row.createdAt}</small><button className="btn btn-danger-soft admin-delete-btn" disabled={!!busy} onClick={() => remove(row)}>{busy === row.id + 'delete' ? 'در حال حذف...' : 'حذف حساب کاربر'}</button></div>
    </article>)}</div>
  </div></main></AdminGate>
}
