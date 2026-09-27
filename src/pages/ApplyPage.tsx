import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Job } from '../data/mock'
import { backendMode, createApplicationBackend, getJobBackend, loadSeekerProfile, saveSeekerProfileBackend, sendPhoneOtp, verifyPhoneOtp, ensureRole } from '../lib/backend'
import { getSession, saveSession, type SeekerProfile } from '../lib/session'
import { cleanShortText, isValidIranMobile, normalizePhone, toEnglishDigits } from '../lib/validation'

type Step = 'loading' | 'phone' | 'code' | 'profile' | 'confirm' | 'success'

export function ApplyPage() {
  const { jobId } = useParams()
  const session = getSession()
  const [job, setJob] = useState<Job | null>(null)
  const [step, setStep] = useState<Step>('loading')
  const [phone, setPhone] = useState(session?.role === 'seeker' ? session.phone : '')
  const [code, setCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Promise.all([getJobBackend(jobId), loadSeekerProfile().catch(() => null)]).then(([foundJob, profile]) => {
      setJob(foundJob)
      if (profile) { setFullName(profile.fullName); setCity(profile.city || foundJob?.city || ''); setExperience(profile.experience); setSkills(profile.skills); if (!phone && profile.phone) setPhone(profile.phone) }
      const complete = session?.role === 'seeker' && profile?.fullName && profile?.city && profile?.experience
      setStep(complete ? 'confirm' : session?.role === 'seeker' ? 'profile' : 'phone')
    })
  }, [jobId])

  const progress = useMemo(() => step === 'phone' ? 1 : step === 'code' ? 2 : 3, [step])
  if (step === 'loading') return <main className="page-shell container"><div className="empty-state"><p>در حال آماده‌کردن درخواست...</p></div></main>
  if (!job) return <main className="page-shell container"><div className="empty-state"><h1>آگهی پیدا نشد.</h1><Link className="btn btn-primary" to="/jobs">بازگشت</Link></div></main>

  async function submitPhone(e: FormEvent) { e.preventDefault(); const normalized = normalizePhone(phone); if (!isValidIranMobile(normalized)) return setError('شماره موبایل را با 09 و ۱۱ رقم وارد کن.'); setPhone(normalized); setBusy(true); setError(''); try { await sendPhoneOtp(normalized); setStep('code') } catch (err) { setError(err instanceof Error ? err.message : 'ارسال کد انجام نشد.') } finally { setBusy(false) } }
  async function submitCode(e: FormEvent) { e.preventDefault(); const normalizedCode = toEnglishDigits(code).trim(); if (normalizedCode.length < 4) return setError('کد تأیید را وارد کن.'); setBusy(true); setError(''); try { await verifyPhoneOtp(phone, normalizedCode); saveSession({ phone, role: 'seeker' }); await ensureRole('seeker'); setStep('profile') } catch (err) { setError(err instanceof Error ? err.message : 'تأیید شماره انجام نشد.') } finally { setBusy(false) } }
  async function submitProfile(e: FormEvent) { e.preventDefault(); const cleanedName = cleanShortText(fullName, 80); if (cleanedName.length < 2) return setError('نام و نام خانوادگی را کامل‌تر وارد کن.'); if (!city) return setError('شهرت را انتخاب کن.'); if (!experience) return setError('میزان سابقه را انتخاب کن.'); setBusy(true); setError(''); try { await saveSeekerProfileBackend({ fullName: cleanedName, phone, city, experience, skills: cleanShortText(skills, 180) }); setFullName(cleanedName); setStep('confirm') } catch (err) { setError(err instanceof Error ? err.message : 'ذخیره اطلاعات انجام نشد.') } finally { setBusy(false) } }
  async function storeApplication() { setBusy(true); setError(''); const profile: SeekerProfile = { fullName: cleanShortText(fullName, 80), phone, city, experience, skills: cleanShortText(skills, 180) }; try { await createApplicationBackend(job!, profile); setStep('success'); window.scrollTo(0, 0) } catch (err) { setError(err instanceof Error ? err.message : 'ارسال درخواست انجام نشد.') } finally { setBusy(false) } }

  return <main className="apply-page"><div className="container apply-wrap">{step !== 'success' && <Link className="back-link" to={`/jobs/${job.id}`}>→ بازگشت به آگهی</Link>}<section className="apply-card">{step !== 'success' && <div className="apply-job-mini"><strong>{job.title}</strong><span>{job.company}</span></div>}{(step === 'phone' || step === 'code' || step === 'profile') && <><div className="progress-head"><span>مرحله {progress} از ۳</span><span>{progress === 1 ? 'شماره موبایل' : progress === 2 ? 'تأیید شماره' : 'اطلاعات کوتاه'}</span></div><div className="progress-track"><span style={{ width: `${progress / 3 * 100}%` }} /></div></>}{step === 'phone' && <form className="simple-form" onSubmit={submitPhone}><div className="form-heading"><h1>شماره موبایلت را وارد کن</h1><p>{backendMode === 'supabase' ? 'برای ورود، کد پیامکی ارسال می‌شود.' : 'در نسخه پیش‌نمایش پیامک واقعی ارسال نمی‌شود.'}</p></div><label><span>شماره موبایل</span><input dir="ltr" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09123456789" /></label>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary btn-large">{busy ? 'در حال ارسال...' : 'ادامه'}</button></form>}{step === 'code' && <form className="simple-form" onSubmit={submitCode}><div className="form-heading"><h1>کد تأیید</h1><p>{backendMode === 'supabase' ? `کد ارسال‌شده به ${phone}` : 'هر کد ۴ رقمی یا بیشتر قابل قبول است.'}</p></div><label><span>کد</span><input dir="ltr" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} /></label>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary btn-large">تأیید</button></form>}{step === 'profile' && <form className="simple-form" onSubmit={submitProfile}><div className="form-heading"><h1>اطلاعات کوتاه</h1><p>فقط چیزی که کارفرما برای تماس اولیه لازم دارد.</p></div><label><span>نام و نام خانوادگی</span><input value={fullName} onChange={(e) => setFullName(e.target.value)} /></label><label><span>شهر</span><select value={city} onChange={(e) => setCity(e.target.value)}><option value="">انتخاب کن</option><option>تهران</option><option>کرج</option><option>تبریز</option><option>سنندج</option><option>ارومیه</option></select></label><fieldset className="radio-group"><legend>چقدر سابقه داری؟</legend>{['بدون سابقه','کمتر از ۱ سال','۱ تا ۳ سال','بیشتر از ۳ سال'].map((item) => <label key={item} className={experience === item ? 'selected' : ''}><input type="radio" name="experience" value={item} checked={experience === item} onChange={(e) => setExperience(e.target.value)} /><span>{item}</span></label>)}</fieldset><label><span>چه کارهایی بلدی؟ <small>اختیاری</small></span><input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="مثال: راسته‌دوز، سردوز" /></label>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary btn-large">ادامه</button></form>}{step === 'confirm' && <div className="confirm-application"><div className="form-heading"><h1>درخواست آماده ارسال است</h1><p>اطلاعاتت را یک‌بار نگاه کن.</p></div><div className="confirm-facts"><div><span>نام</span><strong>{fullName}</strong></div><div><span>شهر</span><strong>{city}</strong></div><div><span>سابقه</span><strong>{experience}</strong></div>{skills && <div><span>مهارت‌ها</span><strong>{skills}</strong></div>}</div>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn btn-primary btn-large" onClick={storeApplication}>{busy ? 'در حال ارسال...' : 'ارسال درخواست'}</button><button className="btn btn-secondary btn-large" onClick={() => setStep('profile')}>ویرایش اطلاعات</button></div>}{step === 'success' && <div className="success-state"><div className="success-icon">✓</div><h1>درخواستت ارسال شد</h1><p>درخواست همکاری برای <strong>{job.title}</strong> به {job.company} ثبت شد.</p><div className="success-note">وقتی کارفرما درخواستت را بررسی کند، وضعیت در «درخواست‌های من» به‌روز می‌شود.</div><Link className="btn btn-primary btn-large" to="/my-applications">دیدن درخواست‌های من</Link><Link className="btn btn-secondary btn-large" to="/jobs">پیدا کردن کار دیگر</Link></div>}</section></div></main>
}
