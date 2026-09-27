import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listNotificationsBackend,
  markAllNotificationsReadBackend,
  markNotificationReadBackend,
  type NotificationItem,
} from '../lib/backend'

export function NotificationsPage({ employer = false }: { employer?: boolean }) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try { setItems(await listNotificationsBackend(employer)) }
    catch (err) { setError(err instanceof Error ? err.message : 'اعلان‌ها بارگذاری نشد.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void refresh() }, [employer])
  const unread = useMemo(() => items.filter((item) => !item.isRead).length, [items])

  async function openNotification(item: NotificationItem) {
    if (!item.isRead) {
      await markNotificationReadBackend(item.id)
      setItems((rows) => rows.map((row) => row.id === item.id ? { ...row, isRead: true } : row))
    }
  }

  async function markAll() {
    await markAllNotificationsReadBackend()
    setItems((rows) => rows.map((row) => ({ ...row, isRead: true })))
  }

  return (
    <main className="page-shell container notifications-page">
      <div className="notifications-head">
        <div className="page-heading">
          <h1>اعلان‌ها</h1>
          <p>{employer ? 'متقاضی‌های جدید و وضعیت آگهی‌ها.' : 'تغییر وضعیت درخواست‌های کاری تو.'}</p>
        </div>
        {unread > 0 && <button className="text-button" onClick={markAll}>همه را خوانده علامت بزن</button>}
      </div>

      {loading ? <div className="empty-state"><p>در حال بارگذاری...</p></div> : error ? <div className="empty-state"><p>{error}</p><button className="btn btn-secondary" onClick={refresh}>تلاش دوباره</button></div> : items.length ? (
        <div className="notification-list">
          {items.map((item) => (
            <article className={`notification-card ${item.isRead ? '' : 'unread'}`} key={item.id}>
              <div className="notification-dot" aria-hidden="true" />
              <div className="notification-main">
                <div className="notification-title-row"><h2>{item.title}</h2><small>{item.createdAt}</small></div>
                <p>{item.body}</p>
                {item.href ? <Link className="text-link" to={item.href} onClick={() => openNotification(item)}>مشاهده</Link> : !item.isRead ? <button className="text-button" onClick={() => openNotification(item)}>خواندم</button> : null}
              </div>
            </article>
          ))}
        </div>
      ) : <div className="empty-state application-empty"><h2>فعلاً اعلان جدیدی نداری.</h2><p>{employer ? 'وقتی متقاضی جدید یا نتیجه بررسی آگهی داشته باشی، اینجا می‌بینی.' : 'وقتی وضعیت درخواستت تغییر کند، اینجا نمایش داده می‌شود.'}</p></div>}
    </main>
  )
}
