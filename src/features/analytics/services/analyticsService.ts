import { createClient } from '@/lib/supabase/server'
import type { Event, Registration, Profile } from '@/types/database'

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

async function getAccessibleEventIds(): Promise<string[] | null> {
  const profile = await getCurrentProfile()
  if (!profile || profile.user_type === 'admin') return null // null = no filter

  if (!profile.company_access?.length) return [] // empty = no access

  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('id')
    .in('company_code', profile.company_access)
  return (data ?? []).map(e => e.id)
}

export interface GlobalStats {
  totalRegistrations: number
  totalEvents: number
  attendanceRate: number
  emailOpenRate: number
  avgNps: number | null
}

export interface EventStats {
  event: Event
  totalRegistrations: number
  confirmed: number
  attended: number
  noShow: number
  cancelled: number
  emailsSent: number
  emailsOpened: number
  openRate: number
  avgNps: number | null
  leadNew: number
  leadContacted: number
  leadQualified: number
  leadConverted: number
  recentRegistrations: Registration[]
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = await createClient()
  const eventIds = await getAccessibleEventIds()

  let regQuery = supabase.from('registrations').select('attendance_status, nps_score', { count: 'exact' })
  let eventsQuery = supabase.from('events').select('id', { count: 'exact' })
  let metricsQuery = supabase.from('event_metrics').select('emails_sent, emails_opened')

  if (eventIds !== null) {
    if (eventIds.length === 0) {
      return { totalRegistrations: 0, totalEvents: 0, attendanceRate: 0, emailOpenRate: 0, avgNps: null }
    }
    regQuery = regQuery.in('event_id', eventIds)
    eventsQuery = eventsQuery.in('id', eventIds)
    metricsQuery = metricsQuery.in('event_id', eventIds)
  }

  const [registrationsResult, eventsResult, metricsResult] = await Promise.all([
    regQuery,
    eventsQuery,
    metricsQuery,
  ])

  const registrations = registrationsResult.data ?? []
  const totalReg = registrationsResult.count ?? 0
  const totalEvents = eventsResult.count ?? 0

  const attended = registrations.filter(r => r.attendance_status === 'attended').length
  const attendanceRate = totalReg > 0 ? Math.round((attended / totalReg) * 100) : 0

  const metrics = metricsResult.data ?? []
  const totalSent = metrics.reduce((acc, m) => acc + (m.emails_sent ?? 0), 0)
  const totalOpened = metrics.reduce((acc, m) => acc + (m.emails_opened ?? 0), 0)
  const emailOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

  const npsScores = registrations
    .map(r => r.nps_score)
    .filter((s): s is number => s !== null)
  const avgNps =
    npsScores.length > 0
      ? Math.round((npsScores.reduce((a, b) => a + b, 0) / npsScores.length) * 10) / 10
      : null

  return {
    totalRegistrations: totalReg,
    totalEvents,
    attendanceRate,
    emailOpenRate,
    avgNps,
  }
}

export async function getEventStats(eventId: string): Promise<EventStats | null> {
  const supabase = await createClient()

  const [eventResult, registrationsResult, metricsResult] = await Promise.all([
    supabase.from('events').select('*').eq('id', eventId).single(),
    supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false }),
    supabase
      .from('event_metrics')
      .select('emails_sent, emails_opened, avg_nps_score')
      .eq('event_id', eventId),
  ])

  if (eventResult.error && eventResult.error.code !== 'PGRST116') throw eventResult.error
  if (!eventResult.data) return null

  const regs = (registrationsResult.data ?? []) as Registration[]
  const metrics = metricsResult.data ?? []

  const totalSent = metrics.reduce((acc, m) => acc + (m.emails_sent ?? 0), 0)
  const totalOpened = metrics.reduce((acc, m) => acc + (m.emails_opened ?? 0), 0)
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

  const npsValues = metrics
    .map(m => m.avg_nps_score)
    .filter((v): v is number => v !== null)
  const avgNps =
    npsValues.length > 0
      ? Math.round((npsValues.reduce((a, b) => a + b, 0) / npsValues.length) * 10) / 10
      : null

  return {
    event: eventResult.data as Event,
    totalRegistrations: regs.length,
    confirmed: regs.filter(r => r.attendance_status === 'confirmed').length,
    attended: regs.filter(r => r.attendance_status === 'attended').length,
    noShow: regs.filter(r => r.attendance_status === 'no_show').length,
    cancelled: regs.filter(r => r.attendance_status === 'cancelled').length,
    emailsSent: totalSent,
    emailsOpened: totalOpened,
    openRate,
    avgNps,
    leadNew: regs.filter(r => r.lead_status === 'new').length,
    leadContacted: regs.filter(r => r.lead_status === 'contacted').length,
    leadQualified: regs.filter(r => r.lead_status === 'qualified').length,
    leadConverted: regs.filter(r => r.lead_status === 'converted').length,
    recentRegistrations: regs.slice(0, 10),
  }
}

export interface EventSummary {
  event: Event
  totalRegistrations: number
  attended: number
  attendanceRate: number
}

export async function getAllEventsSummary(): Promise<EventSummary[]> {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  let query = supabase.from('events').select('*').order('event_date', { ascending: false })

  if (profile && profile.user_type !== 'admin' && profile.company_access?.length > 0) {
    query = query.in('company_code', profile.company_access)
  } else if (profile && profile.user_type !== 'admin') {
    return []
  }

  const { data: events, error } = await query

  if (error) throw error

  const summaries = await Promise.all(
    (events ?? []).map(async (event) => {
      const { data: regs } = await supabase
        .from('registrations')
        .select('attendance_status')
        .eq('event_id', event.id)

      const total = regs?.length ?? 0
      const attended = regs?.filter(r => r.attendance_status === 'attended').length ?? 0
      return {
        event: event as Event,
        totalRegistrations: total,
        attended,
        attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0,
      }
    })
  )

  return summaries
}
