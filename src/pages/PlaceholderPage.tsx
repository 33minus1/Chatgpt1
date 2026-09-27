import { Link } from 'react-router-dom'

export function PlaceholderPage({ title, text }: { title: string; text: string }) {
  return (
    <main className="page-shell container">
      <div className="placeholder-card">
        <span className="status-badge">مرحله بعد</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <Link className="btn btn-primary" to="/">بازگشت به صفحه اصلی</Link>
      </div>
    </main>
  )
}
