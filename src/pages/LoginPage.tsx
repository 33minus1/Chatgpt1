import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CitySelect } from '../components/CitySelect'
import { backendMode, ensureRole, loadEmployerProfile, loadSeekerProfile, saveEmployerProfileBackend, saveSeekerProfileBackend, sendPhoneOtp, verifyPhoneOtp } from '../lib/backend'
import { assertAccountNotDeleted } from '../lib/deletedAccount'
import { getSession, saveSession, type UserRole } from '../lib/session'
import { cleanShortText, isValidIranMobile, normalizePhone, toEnglishDigits } from '../lib/validation'

type Step = 'role' | 'phone' | 'code' | 'profile'

export function LoginPage() {
  const navigate = useNavigate()
  const existing = getSession()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<UserRole>('seeker')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [city, setCity] = useState('سقز')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function chooseRole(value: UserRole) {
    setRole(value); setStep('phone'); setError('')
  }

  async function submitPhone(e: FormEvent) {
    e.preventDefault()
    const normalized = normalizePhone(phone)
    if (!isValidIranMobile(normalized)) return setError('شماره موبایل را با 09 و ۱۱ رقم وارد کن.')
    setPhone(normalized)
    setBusy(true); setError('')
    try {
      await sendPhoneOtp(normalized)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال کد انجام نشد. دوباره تلاش کن.')
    } finally { setBusy(false) }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault()
    if (code.trim().length < 4) return setError('کد تأیید را وارد کن.')
    setBusy(true); setError('')
    try {
      const normalizedCode = toEnglishDigits(code).trim()
      await verifyPhoneOtp(phone, normalizedCode)
      await assertAccountNotDeleted()
      saveSession({ phone, role })
      await ensureRole(role)
      if (role === 'seeker') {
        const profile = await loadSeekerProfile()
        if (profile?.fullName) return navigate('/account')
      } else {
        const profile = await loadEmployerProfile()
        if (profile?.companyName) return navigate('/employer')
      }
      setStep('profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'کد تأیید درست نیست یا منقضی شده است.')
    } finally { setBusy(false) }
  }

  async function submitProfile(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await assertAccountNotDeleted()
      if (role === 'seeker') {
        const fullName = cleanShortText(name, 80)
        if (fullName.length < 2) { setBusy(false); return setError('نام و نام خانوادگی را کامل‌تر وارد کن.') }
        await saveSeekerProfileBackend({ fullName, phone, city, experience: '', skills: '' })
        navigate('/account')
      } else {
        const company = cleanShortText(companyName, 100)
        if (company.length < 2) { setBusy(false); return setError('نام شرکت یا مجموعه را کامل‌تر وارد کن.') }
        await saveEmployerProfileBackend({ companyName: company, phone, city, industry: '' })
        navigate('/employer')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره اطلاعات انجام نشد.')
    } finally { setBusy(false) }
  }

  return (
    <main className="apply-page login-page">
      <div className="container auth-wrap">
        <Link className="back-link" to="/">→ بازگشت به خانه</Link>
        <section className="apply-card auth-card">
          {step === 'role' && <div className="auth-role-step"><div className="form-heading"><h1>برای چه کاری وارد می‌شوی؟</h1><p>مسیر ساده و جدا برای کارجو و کارفرما.</p></div><button className="role-choice" onClick={() => chooseRole('seeker')}><span>👤</span><div><strong>دنبال کار هستم</strong><small>پیدا کردن شغل و پیگیری درخواست‌ها</small></div></button><button className="role-choice" onClick={() => chooseRole('employer')}><span>🏢</span><div><strong>می‌خواهم نیرو استخدام کنم</strong><small>ثبت آگهی و دیدن متقاضیان</small></div></button></div>}

          {step === 'phone' && <form className="simple-form" onSubmit={submitPhone}><div className="progress-head"><span>مرحله ۱ از ۲</span><span>{role === 'seeker' ? 'ورود کارجو' : 'ورود کارفرما'}</span></div><div className="progress-track"><span style={{ width: '50%' }} /></div><div className="form-heading"><h1>شماره موبایل</h1><p>{backendMode === 'supabase' ? 'کد ورود با پیامک برایت ارسال می‌شود.' : 'نسخه پیش‌نمایش: پیامک واقعی ارسال نمی‌شود.'}</p></div><label><span>شماره موبایل</span><input dir="ltr" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" /></label>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary btn-large">{busy ? 'در حال ارسال...' : 'دریافت کد'}</button><button className="text-button" type="button" onClick={() => setStep('role')}>تغییر نوع حساب</button></form>}

          {step === 'code' && <form className="simple-form" onSubmit={submitCode}><div className="progress-head"><span>مرحله ۲ از ۲</span><span>تأیید شماره</span></div><div className="progress-track"><span style={{ width: '100%' }} /></div><div className="form-heading"><h1>کد تأیید را وارد کن</h1><p>{backendMode === 'supabase' ? `کد ارسال‌شده به ${phone}` : 'در پیش‌نمایش، هر کد ۴ رقمی یا بیشتر قابل قبول است.'}</p></div><label><span>کد تأیید</span><input dir="ltr" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="1234" /></label>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary btn-large">{busy ? 'در حال بررسی...' : 'ورود'}</button><button className="text-button" type="button" onClick={() => setStep('phone')}>تغییر شماره {phone}</button></form>}

          {step === 'profile' && <form className="simple-form" onSubmit={submitProfile}><div className="form-heading"><h1>{role === 'seeker' ? 'فقط یک معرفی کوتاه' : 'اطلاعات مجموعه'}</h1><p>این اطلاعات را بعداً از «حساب من» می‌توانی ویرایش کنی.</p></div>{role === 'seeker' ? <label><span>نام و نام خانوادگی</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: محمد احمدی" /></label> : <label><span>نام شرکت یا مجموعه</span><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="مثال: ترۆپک" /></label>}<label><span>شهر</span><CitySelect value={city} onChange={setCity} /></label>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary btn-large">{busy ? 'در حال ذخیره...' : 'ادامه'}</button></form>}
        </section>
      </div>
    </main>
  )
}
