export type Job = {
  id: string
  title: string
  company: string
  companyId: string
  city: string
  type: string
  salary: string
  publishedAt: string
  category: string
  description: string
  requirements: string[]
  benefits: string[]
  schedule: string
  skills: string[]
  companyDescription: string
  expiresAt?: string
  daysLeft?: number
}

export const categories = [
  { label: 'خیاطی و پوشاک', icon: '🧵' },
  { label: 'تولید و کارخانه', icon: '🏭' },
  { label: 'فروشندگی', icon: '🛒' },
  { label: 'رانندگی', icon: '🚚' },
  { label: 'انبار و لجستیک', icon: '📦' },
  { label: 'فنی و تعمیرات', icon: '🔧' },
  { label: 'خدمات', icon: '🧹' },
  { label: 'اداری و کامپیوتر', icon: '💻' },
]

export const jobs: Job[] = [
  {
    id: '1',
    title: 'چرخکار راسته‌دوز',
    company: 'ترۆپک',
    companyId: 'tropk',
    city: 'تهران',
    type: 'تمام‌وقت',
    salary: '۲۰ تا ۲۵ میلیون تومان',
    publishedAt: 'امروز',
    expiresAt: '۳ آبان ۱۴۰۵',
    daysLeft: 29,
    category: 'خیاطی و پوشاک',
    description: 'برای خط تولید پوشاک به چرخکار راسته‌دوز نیاز داریم. محیط کار منظم است و آموزش اولیه عملیات خط در محل انجام می‌شود.',
    requirements: ['حداقل یک سال سابقه کار', 'آشنایی با چرخ راسته‌دوز صنعتی', 'نظم و مسئولیت‌پذیری'],
    benefits: ['بیمه', 'ناهار', 'اضافه‌کاری'],
    schedule: 'شنبه تا پنجشنبه، ۸ صبح تا ۴ عصر',
    skills: ['راسته‌دوز', 'سردوز', 'اتو'],
    companyDescription: 'تولیدکننده پوشاک و محصولات فضای باز.',
  },
  {
    id: '2',
    title: 'انباردار',
    company: 'پارس لجستیک',
    companyId: 'pars-logistics',
    city: 'کرج',
    type: 'تمام‌وقت',
    salary: 'حقوق توافقی',
    publishedAt: 'امروز',
    expiresAt: '۱ آبان ۱۴۰۵',
    daysLeft: 27,
    category: 'انبار و لجستیک',
    description: 'برای انبار مرکزی به نیروی منظم جهت تحویل، ثبت و چیدمان کالا نیاز داریم.',
    requirements: ['توانایی کار با لیست کالا', 'دقت در شمارش و ثبت', 'حداقل شش ماه سابقه مرتبط'],
    benefits: ['بیمه', 'سرویس'],
    schedule: 'شنبه تا پنجشنبه، ۸:۳۰ تا ۱۷',
    skills: ['انبارداری', 'ثبت کالا'],
    companyDescription: 'فعال در زمینه توزیع و لجستیک کالا.',
  },
  {
    id: '3',
    title: 'فروشنده',
    company: 'بازارنو',
    companyId: 'bazar-no',
    city: 'تهران',
    type: 'تمام‌وقت',
    salary: '۱۸ تا ۲۲ میلیون تومان',
    publishedAt: '۱ روز پیش',
    expiresAt: '۲۸ مهر ۱۴۰۵',
    daysLeft: 24,
    category: 'فروشندگی',
    description: 'برای فروشگاه حضوری به فروشنده خوش‌برخورد و منظم نیاز داریم.',
    requirements: ['روابط عمومی مناسب', 'توانایی پاسخ‌گویی به مشتری', 'سابقه الزامی نیست'],
    benefits: ['بیمه', 'پاداش فروش'],
    schedule: 'شیفت ثابت روزانه',
    skills: ['فروش', 'ارتباط با مشتری'],
    companyDescription: 'فروشگاه زنجیره‌ای محصولات مصرفی.',
  },
  {
    id: '4',
    title: 'تکنسین تعمیرات',
    company: 'صنایع آریا',
    companyId: 'aria-industries',
    city: 'تبریز',
    type: 'تمام‌وقت',
    salary: '۲۵ تا ۳۰ میلیون تومان',
    publishedAt: '۳ روز پیش',
    expiresAt: '۲۲ مهر ۱۴۰۵',
    daysLeft: 18,
    category: 'فنی و تعمیرات',
    description: 'برای نگهداری و تعمیر تجهیزات تولیدی به تکنسین فنی نیاز داریم.',
    requirements: ['آشنایی با تعمیرات مکانیکی', 'توانایی عیب‌یابی اولیه'],
    benefits: ['بیمه', 'اضافه‌کاری'],
    schedule: 'شنبه تا پنجشنبه، شیفت روز',
    skills: ['تعمیرات', 'مکانیک'],
    companyDescription: 'مجموعه تولیدی صنعتی.',
  },
]

export function getJob(id?: string) {
  return jobs.find((job) => job.id === id)
}
