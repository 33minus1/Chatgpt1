import { isSupabaseConfigured, supabase } from './supabase'
import { clearSession } from './session'

export async function assertAccountNotDeleted() {
  if (!isSupabaseConfigured || !supabase) return
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return

  const { data, error } = await supabase
    .from('deleted_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  if (data) {
    clearSession()
    await supabase.auth.signOut().catch(() => {})
    throw new Error('این حساب توسط مدیریت حذف شده است.')
  }
}
