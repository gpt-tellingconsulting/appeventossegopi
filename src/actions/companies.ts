'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCompanyAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const dto = {
    company_code: Number(formData.get('company_code')),
    name: (formData.get('name') as string).trim(),
    cif: (formData.get('cif') as string).trim(),
    fiscal_address: (formData.get('fiscal_address') as string)?.trim() || null,
    physical_address: (formData.get('physical_address') as string)?.trim() || null,
    email: (formData.get('email') as string)?.trim() || null,
    smtp_host: (formData.get('smtp_host') as string)?.trim() || null,
    smtp_port: Number(formData.get('smtp_port')) || 465,
    smtp_user: (formData.get('smtp_user') as string)?.trim() || null,
    smtp_pass: (formData.get('smtp_pass') as string) || null,
    smtp_from: (formData.get('smtp_from') as string)?.trim() || null,
  }

  const { error } = await supabase.from('companies').insert(dto)
  if (error) return { error: error.message }

  revalidatePath('/companies')
  redirect('/companies')
}

export async function updateCompanyAction(code: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const dto = {
    name: (formData.get('name') as string).trim(),
    cif: (formData.get('cif') as string).trim(),
    fiscal_address: (formData.get('fiscal_address') as string)?.trim() || null,
    physical_address: (formData.get('physical_address') as string)?.trim() || null,
    email: (formData.get('email') as string)?.trim() || null,
    smtp_host: (formData.get('smtp_host') as string)?.trim() || null,
    smtp_port: Number(formData.get('smtp_port')) || 465,
    smtp_user: (formData.get('smtp_user') as string)?.trim() || null,
    smtp_pass: (formData.get('smtp_pass') as string) || null,
    smtp_from: (formData.get('smtp_from') as string)?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('companies').update(dto).eq('company_code', code)
  if (error) return { error: error.message }

  revalidatePath('/companies')
  redirect('/companies')
}

export async function deleteCompanyAction(code: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const { error } = await supabase.from('companies').delete().eq('company_code', code)
  if (error) return { error: error.message }

  revalidatePath('/companies')
  redirect('/companies')
}
