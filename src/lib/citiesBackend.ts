import { supabase } from './supabase'

const PREVIEW_CITY_KEY = 'kar-yabi-cities-v1'
const DEFAULT_CITIES = ['سقز']

export async function listActiveCities(): Promise<string[]> {
  if (!supabase) {
    try {
      const raw = localStorage.getItem(PREVIEW_CITY_KEY)
      if (!raw) return DEFAULT_CITIES
      const rows = JSON.parse(raw) as { name: string; isActive: boolean; sortOrder: number }[]
      const active = rows.filter((row) => row.isActive).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fa')).map((row) => row.name)
      return active.length ? active : DEFAULT_CITIES
    } catch {
      return DEFAULT_CITIES
    }
  }

  const { data, error } = await supabase
    .from('cities')
    .select('name,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  const names = (data ?? []).map((row: any) => String(row.name ?? '').trim()).filter(Boolean)
  return names.length ? names : DEFAULT_CITIES
}
