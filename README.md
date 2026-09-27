# کاریابی MVP — نسخه 1.2

نسخه 1.2 پروژه را برای **Deploy واقعی روی یک URL ثابت** آماده می‌کند. قابلیت‌های MVP نسخه‌های قبل حفظ شده‌اند و تمرکز این نسخه روی تنظیمات محیط، SPA routing، حالت Demo امن و راهنمای انتشار است.

## پیش‌نیاز

Node.js باید با نیازمندی Vite سازگار باشد؛ در `package.json` محدوده نسخه Node مشخص شده است.

## اجرای محلی

```bash
npm install
npm run dev
```

## اتصال Supabase

فایل `.env.example` را به `.env.local` تبدیل کنید:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_SITE_URL=http://localhost:5173
```

اگر Supabase تنظیم نشده باشد، پروژه در حالت mock/demo اجرا می‌شود. در build تولیدی، این وضعیت با یک نوار هشدار به کاربر اعلام می‌شود.

برای سازگاری با پروژه‌های قبلی، `VITE_SUPABASE_ANON_KEY` نیز به‌عنوان fallback پذیرفته می‌شود؛ اما متغیر اصلی نسخه 1.2، `VITE_SUPABASE_PUBLISHABLE_KEY` است.

> هرگز `service_role` یا secret key را در متغیرهای `VITE_*` قرار ندهید.

## قابلیت‌های اصلی

- کارجو: جستجو، شرکت‌ها، ورود با موبایل، پروفایل کوتاه، درخواست همکاری، پیگیری و اعلان‌ها
- کارفرما: پروفایل شرکت، ثبت/ویرایش/بستن آگهی، متقاضیان و اعلان‌ها
- مدیر: تأیید آگهی و شرکت، کاربران، گزارش آگهی
- چرخه آگهی: بررسی، فعال، بسته، رد، انقضای ۳۰ روزه
- گزارش تخلف و محدودیت‌های RLS
- صفحات راهنما، قوانین استفاده و حریم خصوصی
- اعتبارسنجی و Error Boundary
- تنظیم آماده Vercel برای deep-linkهای React Router
- حالت Demo مشخص در production وقتی backend متصل نیست

## انتشار

راهنمای دقیق در `DEPLOYMENT.md` و چک‌لیست در `RELEASE_CHECKLIST.md` قرار دارد.

## نسخه‌های وابستگی

برای اینکه build آینده به تغییر ناگهانی `latest` وابسته نباشد، نسخه‌های مستقیم React، Vite، TypeScript، React Router و Supabase JS در `package.json` ثابت شده‌اند.
