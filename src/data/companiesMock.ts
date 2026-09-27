export type Company = {
  id: string
  name: string
  city: string
  industry: string
  description: string
  status: 'verified' | 'pending' | 'blocked'
  activeJobs: number
}

export const companies: Company[] = [
  {
    id: 'tropk',
    name: 'ترۆپک',
    city: 'تهران',
    industry: 'پوشاک و تولید',
    description: 'تولیدکننده پوشاک و محصولات فضای باز با تمرکز بر تولید صنعتی و توسعه محصول.',
    status: 'verified',
    activeJobs: 1,
  },
  {
    id: 'pars-logistics',
    name: 'پارس لجستیک',
    city: 'کرج',
    industry: 'لجستیک و توزیع',
    description: 'مجموعه فعال در انبارداری، توزیع و جابه‌جایی کالا.',
    status: 'verified',
    activeJobs: 1,
  },
  {
    id: 'bazar-no',
    name: 'بازارنو',
    city: 'تهران',
    industry: 'فروش و خرده‌فروشی',
    description: 'فروشگاه محصولات مصرفی با تمرکز بر فروش حضوری و خدمات مشتری.',
    status: 'verified',
    activeJobs: 1,
  },
  {
    id: 'aria-industries',
    name: 'صنایع آریا',
    city: 'تبریز',
    industry: 'صنعت و تولید',
    description: 'مجموعه تولیدی صنعتی با واحد نگهداری و تعمیرات داخلی.',
    status: 'verified',
    activeJobs: 1,
  },
]
