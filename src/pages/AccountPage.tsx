import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CitySelect } from '../components/CitySelect'
import { loadSeekerProfile, saveSeekerProfileBackend, signOutBackend } from '../lib/backend'
import { assertAccountNotDeleted } from '../lib/deletedAccount'
import { clearSession, getSession, type SeekerProfile } from '../lib/session'
import { cleanShortText } from '../lib/validation'

export function AccountPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [profile, setProfile] = useState<SeekerProfile>({ fullName: '', phone: session?.phone ?? '', city: 'سقز', experience: '', skills: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    assertAccountNotDeleted()
      .then(() => loadSeekerProfile())
      .then((p) => { if (p) setProfile({ ...p, city: p.city || 'سقز' }) })
      .catch((err) => setError(err instanceof Error ? err.message : 'بارگذاری حساب انجام نشد.'))
      .finally(() => setLoading(false))
  }, [])

  if (!session) return <main className="page-shell container"><div className="empty-state"><h1>هنوز وارد نشده‌ای</h1><p>برای نگهداری اطلاعات و پیگیری درخواست‌ها وارد حساب شو.</p><Link className="btn btn-primary" to="/login">ورود با شماره موبایل</Link></div></main>
  if (session.role === 'employer') return <main className="page-shell container"><div className="empty-state"><h1>با حساب کارفرما وارد شده‌ای</h1><p>برای مدیریت شرکت و آگهی‌ها وارد بخش کارفرما شو.</p><Link className="btn btn-primary" to="/employer">رفتن به بخش کارفرما</Link></div></main>

  async function submit(e: FormEvent) {
    e.preventDefault(); setError('')
    const fullName = cleanShortText(profile.fullName, 80)
    if (fullName.length < 2) return setError('نام و نام خانوادگی را کامل‌تر وارد کن.')
    if (!profile.city) return setError('شهر را انتخاب کن.')
    if (!profile.experience) return setError('سابقه کار را انتخاب کن.')
    setBusy(true)
    try {
      await assertAccountNotDeleted()
      await saveSeekerProfileBackend({ ...profile, fullName, skills: cleanShortText(profile.skills, 180), phone: session!.phone })
      setProfile((prev) => ({ ...prev, fullName })); setSaved(true); window.setTimeout(() => setSaved(false), 2200)
    } catch (err) { setError(err instanceof Error ? err.message : 'ذخیره اطلاعات انجام نشد.') }
    finally { setBusy(false) }
  }

  async function logout() { try { await signOutBackend() } finally { clearSession(); navigate('/') } }

  return <main className="account-page page-shell"><div className="container account-wrap"><div className="account-head"><div><span className="status-badge">کارجو</span><h1>حساب من</h1><p>اطلاعاتی که کارفرما هنگام درخواست می‌بیند.</p></div></div>{loading ? <div className="empty-state"><p>در حال بارگذاری اطلاعات...</p></div> : <form className="account-card simple-form" onSubmit={submit}><label><span>نام و نام خانوادگی</span><input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></label><label><span>شماره موبایل</span><input dir="ltr" value={session.phone} disabled /></label><label><span>شهر</span><CitySelect value={profile.city} onChange={(city) => setProfile({ ...profile, city })} /></label><label><span>سابقه کار</span><select value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })}><option value="">انتخاب کن</option><option>بدون سابقه</option><option>کمتر از ۱ سال</option><option>۱ تا ۳ سال</option><option>بیشتر از ۳ سال</option></select></label><label><span>مهارت‌ها <small>اختیاری</small></span><input value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} placeholder="مثال: راسته‌دوز، سردوز" /></label>{saved && <div className="inline-success">✓ اطلاعات ذخیره شد</div>}{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary">{busy ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button></form>}<button className="btn btn-secondary logout-btn" onClick={logout}>خروج از حساب</button></div></main>
}
