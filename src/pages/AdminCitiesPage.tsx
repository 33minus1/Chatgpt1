import { FormEvent, useEffect, useState } from 'react'
import { AdminGate } from './AdminGate'
import { addAdminCity, listAdminCities, setAdminCityActive, type AdminCityItem } from '../lib/cityAdminBackend'

export function AdminCitiesPage() {
  const [items, setItems] = useState<AdminCityItem[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      setItems(await listAdminCities())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'بارگذاری شهرها انجام نشد.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy('add')
    try {
      await addAdminCity(name)
      setName('')
      setSuccess('شهر جدید اضافه و فعال شد.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'افزودن شهر انجام نشد.')
    } finally {
      setBusy('')
    }
  }

  async function toggle(city: AdminCityItem) {
    setError('')
    setSuccess('')
    setBusy(city.id)
    try {
      await setAdminCityActive(city.id, !city.isActive)
      setSuccess(city.isActive ? 'شهر غیرفعال شد.' : 'شهر فعال شد و در فرم‌ها نمایش داده می‌شود.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تغییر وضعیت شهر انجام نشد.')
    } finally {
      setBusy('')
    }
  }

  return (
    <AdminGate>
      <main className="admin-page">
        <div className="container admin-wrap admin-cities-page">
          <header className="admin-head">
            <div>
              <span className="status-badge">مدیریت</span>
              <h1>مدیریت شهرها</h1>
              <p>شهرهای فعال در جستجو، ثبت‌نام، حساب کاربری و ثبت آگهی نمایش داده می‌شوند.</p>
            </div>
          </header>

          <section className="admin-city-create">
            <div>
              <h2>افزودن شهر</h2>
              <p>نام شهر را وارد کن؛ شهر جدید بلافاصله فعال می‌شود.</p>
            </div>
            <form onSubmit={submit} className="admin-city-form">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: بانه" maxLength={80} />
              <button className="btn btn-primary" disabled={busy === 'add'}>{busy === 'add' ? 'در حال افزودن...' : '+ افزودن شهر'}</button>
            </form>
          </section>

          {success && <div className="inline-success">✓ {success}</div>}
          {error && <p className="field-error">{error}</p>}

          <section className="admin-city-list-section">
            <div className="section-head-row">
              <h2>شهرهای سایت</h2>
              <span className="muted">{items.filter((item) => item.isActive).length.toLocaleString('fa-IR')} شهر فعال</span>
            </div>

            {loading ? <div className="empty-state"><p>در حال بارگذاری شهرها...</p></div> : (
              <div className="admin-city-list">
                {items.map((city) => (
                  <article className={`admin-city-card ${city.isActive ? 'active' : 'inactive'}`} key={city.id}>
                    <div>
                      <div className="admin-city-title-row">
                        <h3>{city.name}</h3>
                        <span className={`admin-state ${city.isActive ? 'active' : 'blocked'}`}>{city.isActive ? 'فعال' : 'غیرفعال'}</span>
                      </div>
                      <p>{city.isActive ? 'در فرم‌ها و فیلترهای سایت نمایش داده می‌شود.' : 'فعلاً به کاربران نمایش داده نمی‌شود.'}</p>
                    </div>
                    <button className={city.isActive ? 'btn btn-secondary compact' : 'btn btn-primary compact'} disabled={busy === city.id} onClick={() => toggle(city)}>
                      {busy === city.id ? '...' : city.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminGate>
  )
}
