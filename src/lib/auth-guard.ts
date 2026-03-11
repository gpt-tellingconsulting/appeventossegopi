import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifica que el usuario actual es admin.
 * Redirige a /dashboard si no lo es.
 * Usar en pages de /companies y /users.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    redirect('/dashboard')
  }

  return user
}
