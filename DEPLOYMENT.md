# راهنمای انتشار — نسخه 1.2

این پروژه یک SPA مبتنی بر React + Vite است. مسیر پیشنهادی برای اولین انتشار عمومی، Vercel است؛ Cloudflare Pages نیز بدون تغییر معماری قابل استفاده است.

## حالت‌های اجرا

### 1) Demo
اگر متغیرهای Supabase تنظیم نشده باشند، پروژه با داده آزمایشی اجرا می‌شود. در build تولیدی یک نوار هشدار واضح نمایش داده می‌شود تا کسی آن را با سرویس واقعی اشتباه نگیرد.

### 2) Real backend
برای استفاده واقعی، این متغیرها باید در محیط هاست تنظیم شوند:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_SITE_URL=https://YOUR_DOMAIN
```

کلید `service_role` یا هر secret key دیگری نباید داخل متغیرهای `VITE_*` قرار گیرد؛ این متغیرها به مرورگر کاربر می‌رسند.

## انتشار روی Vercel

1. سورس را در یک Git repository قرار دهید.
2. repository را در Vercel Import کنید.
3. Framework باید Vite تشخیص داده شود.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. در Settings > Environment Variables مقادیر Supabase بالا را وارد کنید.
7. Deploy را اجرا کنید.
8. بعد از Deploy، مسیرهای مستقیم مثل `/jobs`، `/companies/...` و `/account` را جداگانه باز کنید تا SPA rewrite تست شود.

فایل `vercel.json` در پروژه rewrite لازم برای routeهای React را از قبل دارد.

## انتشار روی Cloudflare Pages

1. repository را به Cloudflare Pages متصل کنید.
2. Build Command: `npm run build`
3. Build Output Directory: `dist`
4. همان Environment Variables را اضافه کنید.
5. Deploy کنید.

Cloudflare Pages وقتی top-level `404.html` وجود نداشته باشد و `index.html` موجود باشد، SPA fallback را به‌صورت پیش‌فرض انجام می‌دهد؛ بنابراین در این پروژه عمداً `404.html` استاتیک قرار داده نشده است.

## قبل از عمومی‌کردن لینک

- migrationهای Supabase باید به ترتیب اجرا شده باشند.
- RLS باید با سه نقش کارجو، کارفرما و مدیر تست شود.
- Phone Auth و SMS provider باید واقعی و تست‌شده باشد.
- یک درخواست همکاری واقعی end-to-end تست شود.
- یک آگهی توسط مدیر تأیید، ویرایش، بسته و منقضی شود.
- گزارش آگهی تست شود.
- دامنه نهایی و متن حریم خصوصی بازبینی شوند.
