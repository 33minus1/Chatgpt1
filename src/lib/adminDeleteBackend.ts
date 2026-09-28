import { isSupabaseConfigured, supabase } from './supabase'

type DeleteKind = 'job' | 'company' | 'user'

function previewKey(kind: DeleteKind) {
  if (kind === 'job') return 'kar-yabi-admin-jobs-v1'
  if (kind === 'company') return 'kar-yabi-admin-companies-v1'
  return ''
}

function removePreviewRow(kind: 'job' | 'company', id: string) {
  const key = previewKey(kind)
  try {
    const rows = JSON.parse(localStorage.getItem(key) || '[]') as { id: string }[]
    localStorage.setItem(key, JSON.stringify(rows.filter((row) => row.id !== id)))
  } catch {
    // Preview mode only.
  }
}

export async function deleteAdminJob(id: string) {
  if (!isSupabaseConfigured || !supabase) {
    removePreviewRow('job', id)
    return
  }
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}

export async function deleteAdminCompany(id: string) {
  if (!isSupabaseConfigured || !supabase) {
    removePreviewRow('company', id)
    return
  }
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) throw error
}

export async function deleteAdminUser(id: string) {
  if (!isSupabaseConfigured || !supabase) return

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw userError ?? new Error('ابتدا وارد حساب مدیریت شوید.')
  if (user.id === id) throw new Error('مدیر نمی‌تواند حساب خودش را حذف کند.')

  const { error: tombstoneError } = await supabase.from('deleted_users').insert({
    user_id: id,
    deleted_by: user.id,
  })
  if (tombstoneError && tombstoneError.code !== '23505') throw tombstoneError

  const { error: memberError } = await supabase.from('company_members').delete().eq('user_id', id)
  if (memberError) throw memberError

  const { error: notificationError } = await supabase.from('notifications').delete().eq('user_id', id)
  if (notificationError) throw notificationError

  const { error: profileError } = await supabase.from('profiles').delete().eq('id', id)
  if (profileError) throw profileError
}
