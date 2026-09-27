import React from 'react'

export class ErrorBoundary extends React.Component<React.PropsWithChildren, { crashed: boolean }> {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  componentDidCatch(error: unknown) { console.error('App crash', error) }
  render() {
    if (this.state.crashed) return <main className="page-shell container"><div className="empty-state release-error"><h1>مشکلی پیش آمد</h1><p>صفحه درست بارگذاری نشد. اطلاعاتی که وارد کرده‌ای را دوباره بررسی کن یا به صفحه اصلی برگرد.</p><a className="btn btn-primary" href="/">بازگشت به خانه</a><button className="btn btn-secondary" onClick={() => window.location.reload()}>تلاش دوباره</button></div></main>
    return this.props.children
  }
}
