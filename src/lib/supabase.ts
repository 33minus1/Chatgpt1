import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, runtimeConfig } from './runtimeConfig'

export { isSupabaseConfigured } from './runtimeConfig'

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function normalizeIranPhone(phone: string) {
  const clean = phone.replace(/[\s-]/g, '')
  if (/^09\d{9}$/.test(clean)) return `+98${clean.slice(1)}`
  return clean
}
