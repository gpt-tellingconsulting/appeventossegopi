import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  user_type: string
  company_access: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as UserProfile[]
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data as UserProfile) ?? null
}
