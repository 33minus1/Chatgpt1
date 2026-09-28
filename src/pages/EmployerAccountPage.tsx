import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CitySelect } from '../components/CitySelect'
import { loadEmployerProfile, saveEmployerProfileBackend, signOutBackend } from '../lib/backend'
import { clearSession, getSession, type EmployerProfile } from '../lib/session'
import { cleanShortText } from '../lib/validation'

export function EmployerAccountPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [profile, setProfile] = useState<EmployerProfile>({ companyName: '', phone: session?.phone ?? '', city: 'سقز', industry: '', description: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { loadEmployerProfile().then((p) => { if (p) setProfile({ ...p, city: p.city || 'سقز' }) }).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (!session) return <main className="page-shell container"><div className="empty-state"><h1>ابتدا وارد شوید</h1><Link className="btn btn-primary" to="/login">ورود کارفرما</Link></div></main>
  if (session.role !== 'employer') return <main className="page-shell container"><div className="empty-state"><h1>با حساب کارجو وارد شده‌ای</h1><Link className="btn btn-primary" to="/account">حساب کارجو</Link></div></main>

  async function submit(e: FormEvent) { e.preventDefault(); setError(''); const companyName = cleanShortText(profile.companyName, 100); if (companyName.length < 2) return setError('نام شرکت یا مجموعه را کامل‌تر وارد کن.'); if (!profile.city) return setError('شهر شرکت را انتخاب کن.'); setBusy(true); try { await saveEmployerProfileBackend({ ...profile, companyName, industry: cleanShortText(profile.industry, 100), description: (profile.description ?? '').trim().slice(0, 500), phone: session!.phone }); setProfile((prev) => ({ ...prev, companyName })); setSaved(true); window.setTimeout(() => setSaved(false), 2200) } catch (err) { setError(err instanceof Error ? err.message : 'ذخیره اطلاعات شرکت انجام نشد.') } finally { setBusy(false) } }
  async function logout() { try { await signOutBackend() } finally { clearSession(); navigate('/') } }

  return <main className="account-page page-shell"><div className="container account-wrap"><div className="account-head"><div><span className="status-badge">کارفرما</span><h1>حساب شرکت</h1><p>اطلاعات اصلی مجموعه را ساده نگه می‌داریم.</p></div></div>{loading ? <div className="empty-state"><p>در حال بارگذاری...</p></div> : <form className="account-card simple-form" onSubmit={submit}><label><span>نام شرکت یا مجموعه</span><input value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} /></label><label><span>شماره تماس</span><input dir="ltr" value={session.phone} disabled /></label><label><span>شهر</span><CitySelect value={profile.city} onChange={(city) => setProfile({ ...profile, city })} /></label><label><span>حوزه فعالیت <small>اختیاری</small></span><input value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} placeholder="مثال: تولید پوشاک" /></label><label><span>معرفی کوتاه شرکت <small>اختیاری</small></span><textarea rows={4} value={profile.description ?? ''} onChange={(e) => setProfile({ ...profile, description: e.target.value })} placeholder="در چند جمله کوتاه بگو مجموعه چه کاری انجام می‌دهد." /></label>{saved && <div className="inline-success">✓ اطلاعات ذخیره شد</div>}{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary">{busy ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button></form>}<button className="btn btn-secondary logout-btn" onClick={logout}>خروج از حساب</button></div></main>
}
