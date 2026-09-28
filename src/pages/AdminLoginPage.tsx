import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendPhoneOtp, verifyPhoneOtp } from '../lib/backend'
import { isAdminBackend } from '../lib/adminBackend'
import { isValidIranMobile, normalizePhone, toEnglishDigits } from '../lib/validation'

type Step = 'phone' | 'code' | 'waiting'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitPhone(e: FormEvent) {
    e.preventDefault()
    const normalized = normalizePhone(phone)
    if (!isValidIranMobile(normalized)) return setError('شماره موبایل را با 09 و ۱۱ رقم وارد کن.')
    setPhone(normalized)
    setBusy(true)
    setError('')
    try {
      await sendPhoneOtp(normalized)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال کد انجام نشد. دوباره تلاش کن.')
    } finally {
      setBusy(false)
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault()
    if (code.trim().length < 4) return setError('کد تأیید را وارد کن.')
    setBusy(true)
    setError('')
    try {
      await verifyPhoneOtp(phone, toEnglishDigits(code).trim())
      const allowed = await isAdminBackend()
      if (allowed) return navigate('/admin')
      setStep('waiting')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'کد تأیید درست نیست یا منقضی شده است.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="apply-page login-page">
      <div className="container auth-wrap">
        <Link className="back-link" to="/">→ بازگشت به سایت</Link>
        <section className="apply-card auth-card">
          {step === 'phone' && (
            <form className="simple-form" onSubmit={submitPhone}>
              <div className="form-heading">
                <h1>ورود مدیریت</h1>
                <p>این بخش فقط برای حساب‌های مدیر سایت است.</p>
              </div>
              <label>
                <span>شماره موبایل مدیر</span>
                <input dir="ltr" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" />
              </label>
              {error && <p className="field-error">{error}</p>}
              <button disabled={busy} className="btn btn-primary btn-large">{busy ? 'در حال ارسال...' : 'دریافت کد'}</button>
            </form>
          )}

          {step === 'code' && (
            <form className="simple-form" onSubmit={submitCode}>
              <div className="form-heading">
                <h1>تأیید شماره مدیر</h1>
                <p>کد ارسال‌شده به {phone} را وارد کن.</p>
              </div>
              <label>
                <span>کد تأیید</span>
                <input dir="ltr" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
              </label>
              {error && <p className="field-error">{error}</p>}
              <button disabled={busy} className="btn btn-primary btn-large">{busy ? 'در حال بررسی...' : 'ورود مدیریت'}</button>
              <button className="text-button" type="button" onClick={() => setStep('phone')}>تغییر شماره</button>
            </form>
          )}

          {step === 'waiting' && (
            <div className="form-heading">
              <h1>شماره تأیید شد</h1>
              <p>این حساب هنوز دسترسی مدیریت ندارد. پس از فعال‌شدن دسترسی، همین صفحه را دوباره باز کن.</p>
              <Link className="btn btn-primary btn-large" to="/admin">بررسی دسترسی مدیریت</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
