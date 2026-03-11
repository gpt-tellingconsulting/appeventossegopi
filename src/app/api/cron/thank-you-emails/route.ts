import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import type { SmtpConfig } from '@/lib/email'
import { attendanceThankYouEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const supabase = createServiceClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Find attendees who checked in >24h ago and haven't been thanked
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: registrations, error } = await supabase
    .from('registrations')
    .select('id, first_name, last_name, email, checked_in_at, event:events(title, event_date, city, company_code)')
    .eq('attendance_status', 'attended')
    .is('thanked_at', null)
    .lt('checked_in_at', cutoff)
    .limit(50)

  if (error) {
    console.error('Thank-you query error:', error)
    return NextResponse.json({ error: 'Error al consultar registros' }, { status: 500 })
  }

  if (!registrations || registrations.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No hay correos pendientes' })
  }

  let sent = 0
  const errors: string[] = []

  // Cache SMTP configs by company_code to avoid repeated queries
  const smtpCache = new Map<number, SmtpConfig | null>()

  for (const reg of registrations) {
    const event = reg.event as unknown as { title: string; event_date: string; city: string; company_code: number | null }
    if (!event) continue

    const eventDate = new Date(event.event_date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    try {
      // Obtener config SMTP de la empresa del evento
      let smtpConfig: SmtpConfig | undefined
      if (event.company_code) {
        if (!smtpCache.has(event.company_code)) {
          const { data: company } = await supabase
            .from('companies')
            .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from')
            .eq('company_code', event.company_code)
            .single()
          if (company?.smtp_host && company?.smtp_user && company?.smtp_pass) {
            smtpCache.set(event.company_code, {
              host: company.smtp_host,
              port: company.smtp_port ?? 465,
              user: company.smtp_user,
              pass: company.smtp_pass,
              from: company.smtp_from ?? company.smtp_user,
            })
          } else {
            smtpCache.set(event.company_code, null)
          }
        }
        smtpConfig = smtpCache.get(event.company_code) ?? undefined
      }

      const html = attendanceThankYouEmail({
        firstName: reg.first_name,
        lastName: reg.last_name,
        eventTitle: event.title,
        eventDate,
        city: event.city,
        siteUrl,
      })

      await sendEmail({
        to: reg.email,
        subject: `Gracias por asistir a ${event.title}`,
        html,
        smtpConfig,
      })

      await supabase
        .from('registrations')
        .update({ thanked_at: new Date().toISOString() })
        .eq('id', reg.id)

      sent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`${reg.email}: ${msg}`)
      console.error(`Thank-you email error for ${reg.email}:`, err)
    }
  }

  return NextResponse.json({
    sent,
    total: registrations.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
