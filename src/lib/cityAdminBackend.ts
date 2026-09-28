import { supabase } from './supabase'

export type AdminCityItem = {
  id: string
  name: string
  isActive: boolean
  sortOrder: number
  createdAt: string
}

const PREVIEW_CITY_KEY = 'kar-yabi-cities-v1'
const previewDefault: AdminCityItem[] = [
  { id: 'city-saghez', name: 'سقز', isActive: true, sortOrder: 0, createdAt: 'اکنون' },
]

function readPreview(): AdminCityItem[] {
  try {
    const raw = localStorage.getItem(PREVIEW_CITY_KEY)
    if (!raw) return previewDefault
    const rows = JSON.parse(raw) as AdminCityItem[]
    return rows.length ? rows : previewDefault
  } catch {
    return previewDefault
  }
}

function writePreview(rows: AdminCityItem[]) {
  localStorage.setItem(PREVIEW_CITY_KEY, JSON.stringify(rows))
}

export async function listAdminCities(): Promise<AdminCityItem[]> {
  if (!supabase) return readPreview().sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fa'))

  const { data, error } = await supabase
    .from('cities')
    .select('id,name,is_active,sort_order,created_at')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('fa-IR') : '',
  }))
}

export async function addAdminCity(name: string) {
  const clean = name.trim().replace(/\s+/g, ' ')
  if (clean.length < 2) throw new Error('نام شهر را کامل وارد کن.')
  if (clean.length > 80) throw new Error('نام شهر بیش از حد طولانی است.')

  if (!supabase) {
    const rows = readPreview()
    if (rows.some((row) => row.name === clean)) throw new Error('این شهر قبلاً اضافه شده است.')
    const nextOrder = rows.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1
    writePreview([...rows, { id: `city-${Date.now()}`, name: clean, isActive: true, sortOrder: nextOrder, createdAt: 'اکنون' }])
    return
  }

  const { data: maxRow, error: maxError } = await supabase
    .from('cities')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (maxError) throw maxError

  const { error } = await supabase.from('cities').insert({
    name: clean,
    is_active: true,
    sort_order: Number(maxRow?.sort_order ?? -1) + 1,
  })
  if (error) {
    if ((error as any).code === '23505') throw new Error('این شهر قبلاً اضافه شده است.')
    throw error
  }
}

export async function setAdminCityActive(id: string, isActive: boolean) {
  if (!supabase) {
    const rows = readPreview()
    if (!isActive && rows.filter((row) => row.isActive).length <= 1) throw new Error('حداقل یک شهر باید فعال بماند.')
    writePreview(rows.map((row) => row.id === id ? { ...row, isActive } : row))
    return
  }

  if (!isActive) {
    const { count, error: countError } = await supabase
      .from('cities')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
    if (countError) throw countError
    if ((count ?? 0) <= 1) throw new Error('حداقل یک شهر باید فعال بماند.')
  }

  const { error } = await supabase.from('cities').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}
