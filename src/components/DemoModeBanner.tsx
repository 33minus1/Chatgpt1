import { isDemoMode, runtimeConfig } from '../lib/runtimeConfig'

export function DemoModeBanner() {
  if (!isDemoMode || !runtimeConfig.isProduction) return null

  return (
    <div className="demo-mode-banner" role="status">
      نسخه آزمایشی است؛ دیتابیس واقعی هنوز متصل نیست و اطلاعات فقط برای تست استفاده می‌شوند.
    </div>
  )
}
