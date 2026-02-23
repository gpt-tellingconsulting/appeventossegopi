import { createClient } from '@/lib/supabase/server'
import type {
  RegistrationFilters,
  RegistrationStats,
  UpdateRegistrationDTO,
  RegistrationWithConsents,
  PaginatedRegistrations,
} from '../types'

export async function getRegistrationsByEvent(
  eventId: string,
  filters: RegistrationFilters = {}
): Promise<PaginatedRegistrations> {
  const supabase = await createClient()
  const {
    search,
    attendance_status,
    page = 1,
    pageSize = 25,
  } = filters

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  if (attendance_status && attendance_status !== 'all') {
    query = query.eq('attendance_status', attendance_status)
  }

  const { data, error, count } = await query

  if (error) throw error

  const total = count ?? 0
  return {
    data: (data ?? []) as RegistrationWithConsents[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getAllRegistrations(
  filters: RegistrationFilters = {}
): Promise<PaginatedRegistrations> {
  const supabase = await createClient()
  const {
    search,
    attendance_status,
    eventId,
    page = 1,
    pageSize = 25,
  } = filters

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('registrations')
    .select('*, event:events(id, title, event_date)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    )
  }

  if (attendance_status && attendance_status !== 'all') {
    query = query.eq('attendance_status', attendance_status)
  }

  const { data, error, count } = await query

  if (error) throw error

  const total = count ?? 0
  return {
    data: (data ?? []) as RegistrationWithConsents[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getRegistration(id: string): Promise<RegistrationWithConsents | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      event:events(id, title, event_date),
      consents(id, consent_type, granted, consent_timestamp, consent_ip, withdrawn_at, policy_version)
    `)
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as RegistrationWithConsents) ?? null
}

export async function updateRegistration(
  id: string,
  dto: UpdateRegistrationDTO
): Promise<RegistrationWithConsents> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('registrations')
    .update({ ...dto, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as RegistrationWithConsents
}

export async function getRegistrationStats(eventId: string): Promise<RegistrationStats> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('registrations')
    .select('attendance_status')
    .eq('event_id', eventId)

  if (error) throw error

  const rows = data ?? []
  const stats: RegistrationStats = {
    total: rows.length,
    registered: rows.filter((r) => r.attendance_status === 'registered').length,
    confirmed: rows.filter((r) => r.attendance_status === 'confirmed').length,
    attended: rows.filter((r) => r.attendance_status === 'attended').length,
    no_show: rows.filter((r) => r.attendance_status === 'no_show').length,
    cancelled: rows.filter((r) => r.attendance_status === 'cancelled').length,
  }

  return stats
}
