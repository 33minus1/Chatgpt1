const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  ''

export const runtimeConfig = {
  supabaseUrl,
  supabasePublishableKey,
  siteUrl: import.meta.env.VITE_SITE_URL?.trim() || '',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)
export const isDemoMode = !isSupabaseConfigured
