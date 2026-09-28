import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CitySelect } from '../components/CitySelect'
import {
  createJobBackend,
  getEmployerJobDraftBackend,
  updateEmployerJobBackend,
  type EmployerJobDraftPayload,
} from '../lib/backend'
import { cleanShortText, isMeaningfulText, isValidIranMobile, normalizePhone } from '../lib/validation'

type Draft = EmployerJobDraftPayload
const initialDraft: Draft = { title: '', city: 'سقز', type: 'تمام‌وقت', experience: '', description: '', salaryMin: '', salaryMax: '', negotiable: false, benefits: [], phone: '' }
const benefitOptions = ['بیمه', 'ناهار', 'اضافه‌کاری', 'سرویس', 'پاداش']

export function NewEmployerJobPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState(initialDraft)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(editing)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getEmployerJobDraftBackend(id)
      .then((row) => {
        if (!row) setError('آگهی پیدا نشد یا به آن دسترسی نداری.')
        else setDraft({ ...row, city: row.city || 'سقز' })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'بارگذاری آگهی انجام نشد.'))
      .finally(() => setLoading(false))
  }, [id])

  function set<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((prev) => ({ ...prev, [key]: value })) }
  function next(e: FormEvent) {
    e.preventDefault(); setError('')
    if (step === 1 && cleanShortText(draft.title, 100).length < 3) return setError('عنوان شغل را کمی کامل‌تر وارد کن.')
    if (step === 1 && !draft.city) return setError('شهر را انتخاب کن.')
    if (step === 2 && !draft.experience) return setError('میزان سابقه موردنیاز را انتخاب کن.')
    if (step === 2 && !isMeaningfulText(draft.description, 12)) return setError('توضیح کار باید حداقل یک جمله کوتاه و روشن باشد.')
    if (step === 3 && !draft.negotiable && !draft.salaryMin.trim() && !draft.salaryMax.trim()) return setError('حداقل یک مبلغ حقوق وارد کن یا «حقوق توافقی» را بزن.')
    if (step === 3 && !isValidIranMobile(draft.phone)) return setError('شماره تماس را با 09 و ۱۱ رقم وارد کن.')
    if (step === 3) set('phone', normalizePhone(draft.phone))
    setStep((s) => Math.min(4, s + 1))
  }
  function toggleBenefit(value: string) { set('benefits', draft.benefits.includes(value) ? draft.benefits.filter((b) => b !== value) : [...draft.benefits, value]) }
  async function publish() {
    setBusy(true); setError('')
    try {
      const payload = { ...draft, title: cleanShortText(draft.title, 100), description: draft.description.trim(), phone: normalizePhone(draft.phone) }
      if (editing && id) await updateEmployerJobBackend(id, payload)
      else await createJobBackend(payload)
      navigate('/employer/jobs')
    } catch (err) { setError(err instanceof Error ? err.message : 'ذخیره آگهی انجام نشد.') }
    finally { setBusy(false) }
  }

  if (loading) return <main className="employer-page"><div className="container employer-form-wrap"><div className="empty-state"><p>در حال بارگذاری آگهی...</p></div></div></main>

  return <main className="employer-page new-job-page"><div className="container employer-form-wrap"><Link className="back-link" to="/employer/jobs">→ بازگشت به آگهی‌ها</Link><div className="apply-card employer-form-card">{editing && <div className="review-warning"><strong>ویرایش آگهی</strong><span>بعد از ذخیره، آگهی برای بررسی مجدد ارسال می‌شود و تا تأیید دوباره در فهرست عمومی نمایش داده نمی‌شود.</span></div>}<div className="progress-head"><span>{step === 4 ? 'پیش‌نمایش' : `مرحله ${step} از ۳`}</span><span>{editing ? 'ویرایش آگهی' : 'ثبت آگهی استخدام'}</span></div><div className="progress-track"><span style={{ width: `${step === 4 ? 100 : (step / 3) * 100}%` }} /></div>
  {step === 1 && <form className="simple-form" onSubmit={next}><div className="form-heading"><h1>دنبال چه کسی هستید؟</h1><p>فقط اطلاعات اصلی شغل را وارد کن.</p></div><label>عنوان شغل<input value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="مثال: چرخکار راسته‌دوز" /></label><label>شهر<CitySelect value={draft.city} onChange={(city) => set('city', city)} /></label><fieldset className="radio-group"><legend>نوع همکاری</legend>{['تمام‌وقت','پاره‌وقت','پروژه‌ای'].map((v) => <label key={v} className={draft.type === v ? 'selected' : ''}><input type="radio" name="type" checked={draft.type === v} onChange={() => set('type', v)} />{v}</label>)}</fieldset>{error && <p className="field-error">{error}</p>}<button className="btn btn-primary">ادامه</button></form>}
  {step === 2 && <form className="simple-form" onSubmit={next}><div className="form-heading"><h1>شرایط کار</h1><p>کوتاه و واضح بنویس.</p></div><fieldset className="radio-group"><legend>چقدر سابقه لازم است؟</legend>{['بدون سابقه','کمتر از ۱ سال','۱ تا ۳ سال','بیشتر از ۳ سال'].map((v) => <label key={v} className={draft.experience === v ? 'selected' : ''}><input type="radio" name="experience" checked={draft.experience === v} onChange={() => set('experience', v)} />{v}</label>)}</fieldset><label>توضیح کوتاه درباره کار<textarea value={draft.description} onChange={(e) => set('description', e.target.value)} rows={5} placeholder="مثال: برای خط تولید پوشاک به چرخکار راسته‌دوز نیاز داریم." /></label>{error && <p className="field-error">{error}</p>}<div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>بازگشت</button><button className="btn btn-primary">ادامه</button></div></form>}
  {step === 3 && <form className="simple-form" onSubmit={next}><div className="form-heading"><h1>حقوق و تماس</h1><p>اگر حقوق مشخص نیست، «توافقی» را انتخاب کن.</p></div><label className="check-row"><input type="checkbox" checked={draft.negotiable} onChange={(e) => set('negotiable', e.target.checked)} /> حقوق توافقی</label>{!draft.negotiable && <div className="salary-fields"><label>از<input inputMode="numeric" value={draft.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} placeholder="مثال: ۲۰ میلیون" /></label><label>تا<input inputMode="numeric" value={draft.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} placeholder="مثال: ۲۵ میلیون" /></label></div>}<div><span className="field-label">مزایا</span><div className="benefit-grid">{benefitOptions.map((b) => <button type="button" key={b} className={draft.benefits.includes(b) ? 'benefit-chip selected' : 'benefit-chip'} onClick={() => toggleBenefit(b)}>{b}</button>)}</div></div><label>شماره تماس<input dir="ltr" inputMode="numeric" value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="09123456789" /></label>{error && <p className="field-error">{error}</p>}<div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>بازگشت</button><button className="btn btn-primary">پیش‌نمایش</button></div></form>}
  {step === 4 && <div className="job-preview"><span className="status-badge">پیش‌نمایش آگهی</span><h1>{draft.title}</h1><p>{draft.city} · {draft.type}</p><div className="preview-facts"><div><span>سابقه</span><strong>{draft.experience}</strong></div><div><span>حقوق</span><strong>{draft.negotiable ? 'توافقی' : `${draft.salaryMin || '—'} تا ${draft.salaryMax || '—'} میلیون تومان`}</strong></div></div><section><h2>درباره کار</h2><p>{draft.description}</p></section>{draft.benefits.length > 0 && <section><h2>مزایا</h2><div className="chips">{draft.benefits.map((b) => <span key={b}>{b}</span>)}</div></section>}{error && <p className="field-error">{error}</p>}<div className="form-actions stacked-mobile"><button className="btn btn-secondary" onClick={() => setStep(3)}>ویرایش</button><button disabled={busy} className="btn btn-primary" onClick={publish}>{busy ? 'در حال ذخیره...' : editing ? 'ذخیره و ارسال برای بررسی' : 'ثبت آگهی'}</button></div></div>}
  </div></div></main>
}
