import { createClient } from '@/lib/supabase/server'

export interface Company {
  company_code: number
  name: string
  cif: string
  fiscal_address: string | null
  physical_address: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAllCompanies(): Promise<Company[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('company_code', { ascending: true })
  if (error) throw error
  return (data ?? []) as Company[]
}

export async function getCompanyByCode(code: number): Promise<Company | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('company_code', code)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data as Company) ?? null
}

export async function createCompany(dto: {
  company_code: number
  name: string
  cif: string
  fiscal_address?: string
  physical_address?: string
  email?: string
}): Promise<Company> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .insert(dto)
    .select()
    .single()
  if (error) throw error
  return data as Company
}

export async function updateCompany(code: number, dto: Partial<{
  name: string
  cif: string
  fiscal_address: string
  physical_address: string
  email: string
  is_active: boolean
}>): Promise<Company> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .update({ ...dto, updated_at: new Date().toISOString() })
    .eq('company_code', code)
    .select()
    .single()
  if (error) throw error
  return data as Company
}

export async function deleteCompany(code: number): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('company_code', code)
  if (error) throw error
}
