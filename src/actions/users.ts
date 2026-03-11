'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createUserAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const first_name = (formData.get('first_name') as string).trim()
  const last_name = (formData.get('last_name') as string).trim()
  const user_type = formData.get('user_type') as string
  const companyAccessRaw = formData.getAll('company_access')
  const company_access = companyAccessRaw.map(v => Number(v)).filter(v => !isNaN(v))

  // Use service client to create auth user (bypasses RLS)
  const serviceClient = createServiceClient()
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return { error: authError.message }

  // Update the auto-created profile with our fields
  const { error: profileError } = await serviceClient
    .from('profiles')
    .update({
      first_name,
      last_name,
      full_name: `${first_name} ${last_name}`,
      user_type,
      company_access,
      is_active: true,
    })
    .eq('id', authData.user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath('/users')
  redirect('/users')
}

export async function updateUserAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const first_name = (formData.get('first_name') as string).trim()
  const last_name = (formData.get('last_name') as string).trim()
  const user_type = formData.get('user_type') as string
  const companyAccessRaw = formData.getAll('company_access')
  const company_access = companyAccessRaw.map(v => Number(v)).filter(v => !isNaN(v))

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name,
      last_name,
      full_name: `${first_name} ${last_name}`,
      user_type,
      company_access,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/users')
  redirect('/users')
}

export async function toggleUserActiveAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  // Get current state
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_active')
    .eq('id', id)
    .single()

  if (!profile) return { error: 'Usuario no encontrado' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !profile.is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/users')
}

export async function deleteUserAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  // Don't allow deleting yourself
  if (user.id === id) return { error: 'No puedes eliminar tu propio usuario' }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient.auth.admin.deleteUser(id)
  if (error) return { error: error.message }

  revalidatePath('/users')
  redirect('/users')
}
