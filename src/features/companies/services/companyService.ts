import { createClient } from '@/lib/supabase/server'

export interface Company {
  company_code: number
  name: string
  cif: string
  fiscal_address: string | null
  physical_address: string | null
  email: string | null
  smtp_host: string | null
  smtp_port: number | null
  smtp_user: string | null
  smtp_pass: string | null
  smtp_from: string | null
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

export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

export async function getSmtpConfigByEventId(eventId: string): Promise<SmtpConfig | null> {
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('company_code')
    .eq('id', eventId)
    .single()
  if (!event?.company_code) return null

  const { data: company } = await supabase
    .from('companies')
    .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from')
    .eq('company_code', event.company_code)
    .single()
  if (!company?.smtp_host || !company?.smtp_user || !company?.smtp_pass) return null

  return {
    host: company.smtp_host,
    port: company.smtp_port ?? 465,
    user: company.smtp_user,
    pass: company.smtp_pass,
    from: company.smtp_from ?? `${company.smtp_user}`,
  }
}

export async function deleteCompany(code: number): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('company_code', code)
  if (error) throw error
}
