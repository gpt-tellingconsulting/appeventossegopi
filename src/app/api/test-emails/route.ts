import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import type { SmtpConfig } from '@/lib/email'
import { registrationConfirmationEmail, attendanceThankYouEmail } from '@/lib/email/templates'
import { generateBrandedQR } from '@/lib/qr'

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const body = await request.json()
  const recipients: string[] = body.recipients || [
    'jfranco@tellingconsulting.es',
    'gustavodl@segopi.es',
    'marques@tellingconsulting.es',
  ]
  const eventId: string | undefined = body.eventId

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = createServiceClient()

  // Fetch real event data (use provided eventId or get the first published event)
  let eventQuery = supabase
    .from('events')
    .select('title, event_date, event_start_time, event_end_time, venue_name, venue_address, city, raffle_conditions, company_code')

  if (eventId) {
    eventQuery = eventQuery.eq('id', eventId)
  } else {
    eventQuery = eventQuery.eq('status', 'published').limit(1)
  }

  const { data: eventData, error: eventError } = await eventQuery.single()

  if (eventError || !eventData) {
    console.error('Test emails event query error:', eventError)
    return NextResponse.json({ error: 'No se encontro un evento publicado', details: eventError?.message }, { status: 404 })
  }

  const eventDate = new Date(eventData.event_date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const startTime = eventData.event_start_time?.slice(0, 5) ?? ''
  const endTime = eventData.event_end_time?.slice(0, 5) ?? ''
  const eventTime = endTime ? `${startTime} - ${endTime}` : startTime

  // Obtener config SMTP de la empresa del evento
  let smtpConfig: SmtpConfig | undefined
  if ((eventData as Record<string, unknown>).company_code) {
    const { data: company } = await supabase
      .from('companies')
      .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from')
      .eq('company_code', (eventData as Record<string, unknown>).company_code as number)
      .single()
    if (company?.smtp_host && company?.smtp_user && company?.smtp_pass) {
      smtpConfig = {
        host: company.smtp_host,
        port: company.smtp_port ?? 465,
        user: company.smtp_user,
        pass: company.smtp_pass,
        from: company.smtp_from ?? company.smtp_user,
      }
    }
  }

  const results: Array<{ email: string; confirmation: string; thankYou: string }> = []

  // Generate a sample QR code
  const sampleQrUrl = `${siteUrl}/api/checkin?token=test-sample-token`
  const qrBuffer = await generateBrandedQR(sampleQrUrl)

  for (const email of recipients) {
    const result: { email: string; confirmation: string; thankYou: string } = {
      email,
      confirmation: 'pending',
      thankYou: 'pending',
    }

    // Send confirmation email with QR
    try {
      const confirmationHtml = registrationConfirmationEmail({
        firstName: 'Nombre',
        lastName: 'Apellido',
        eventTitle: eventData.title,
        eventDate,
        eventTime,
        venueName: eventData.venue_name,
        venueAddress: eventData.venue_address,
        city: eventData.city,
        qrCodeDataUrl: 'cid:qr-code',
        raffleConditions: eventData.raffle_conditions,
      })

      await sendEmail({
        to: email,
        subject: `[TEST] Confirmacion de Inscripcion - ${eventData.title}`,
        html: confirmationHtml,
        smtpConfig,
        attachments: [{
          filename: 'qr-invitacion.png',
          content: qrBuffer,
          cid: 'qr-code',
        }],
      })
      result.confirmation = 'sent'
    } catch (err) {
      result.confirmation = `error: ${err instanceof Error ? err.message : 'unknown'}`
    }

    // Send thank-you email
    try {
      const thankYouHtml = attendanceThankYouEmail({
        firstName: 'Nombre',
        lastName: 'Apellido',
        eventTitle: eventData.title,
        eventDate,
        city: eventData.city,
        siteUrl,
      })

      await sendEmail({
        to: email,
        subject: `[TEST] Gracias por asistir - ${eventData.title}`,
        html: thankYouHtml,
        smtpConfig,
      })
      result.thankYou = 'sent'
    } catch (err) {
      result.thankYou = `error: ${err instanceof Error ? err.message : 'unknown'}`
    }

    results.push(result)
  }

  return NextResponse.json({ success: true, eventUsed: eventData.title, results })
}
