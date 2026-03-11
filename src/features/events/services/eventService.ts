import { createClient } from '@/lib/supabase/server'
import type { Event, CreateEventDTO, UpdateEventDTO, EventStatus, Profile } from '@/types/database'

/**
 * Returns the current authenticated user's profile.
 * Used to filter data by company_access in admin pages.
 */
async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return (data as Profile) ?? null
}

/**
 * Returns events accessible to the current user.
 * Admin: all events. User: only events matching their company_access.
 * Use this in admin pages instead of getAllEvents().
 */
export async function getAccessibleEvents(status?: EventStatus): Promise<Event[]> {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  let query = supabase.from('events').select('*').order('event_date', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (profile && profile.user_type !== 'admin' && profile.company_access?.length > 0) {
    query = query.in('company_code', profile.company_access)
  } else if (profile && profile.user_type !== 'admin') {
    return []
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Event[]
}

export async function getPublishedEvents(): Promise<Event[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('status', ['published', 'closed'])
    .order('event_date', { ascending: true })

  if (error) throw error
  return (data ?? []) as Event[]
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('event_date', today)
    .order('event_date', { ascending: true })

  if (error) throw error
  return (data ?? []) as Event[]
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Event) ?? null
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Event) ?? null
}

export async function getAllEvents(status?: EventStatus): Promise<Event[]> {
  const supabase = await createClient()
  let query = supabase.from('events').select('*').order('event_date', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as Event[]
}

export async function createEvent(dto: CreateEventDTO, userId: string): Promise<Event> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .insert({
      ...dto,
      created_by: userId,
      benefits: dto.benefits ?? [],
      speakers: dto.speakers ?? [],
      gallery_images: dto.gallery_images ?? [],
    })
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function updateEvent(id: string, dto: UpdateEventDTO): Promise<Event> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getRegistrationCount(eventId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .neq('attendance_status', 'cancelled')

  if (error) throw error
  return count ?? 0
}
