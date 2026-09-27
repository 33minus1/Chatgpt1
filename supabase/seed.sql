-- Optional demo data for development. Do not run on production if you want an empty launch.
with demo_company as (
  insert into public.companies (name, city, industry, description, phone, status)
  values ('ترۆپک', 'تهران', 'تولید پوشاک', 'نمونه شرکت برای تست نسخه اولیه.', '09120000000', 'verified')
  returning id
)
insert into public.jobs (
  company_id, title, category, city, employment_type, experience_level, description,
  requirements, skills, schedule, salary_min, salary_max, benefits, contact_phone, status, published_at
)
select id, 'چرخکار راسته‌دوز', 'خیاطی و پوشاک', 'تهران', 'تمام‌وقت', '۱ تا ۳ سال',
       'برای خط تولید پوشاک به چرخکار راسته‌دوز نیاز داریم.',
       array['حداقل یک سال سابقه کار','آشنایی با چرخ صنعتی'], array['راسته‌دوز','سردوز'],
       'شنبه تا پنجشنبه، ۸ صبح تا ۴ عصر', 20000000, 25000000, array['بیمه','ناهار','اضافه‌کاری'],
       '09120000000', 'active', now()
from demo_company;
