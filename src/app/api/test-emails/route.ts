import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
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
    .select('title, event_date, event_start_time, event_end_time, venue_name, venue_address, city')

  if (eventId) {
    eventQuery = eventQuery.eq('id', eventId)
  } else {
    eventQuery = eventQuery.eq('status', 'published').limit(1)
  }

  const { data: eventData } = await eventQuery.single()

  if (!eventData) {
    return NextResponse.json({ error: 'No se encontro un evento publicado' }, { status: 404 })
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
      })

      await sendEmail({
        to: email,
        subject: `[TEST] Confirmacion de Inscripcion - ${eventData.title}`,
        html: confirmationHtml,
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
      })
      result.thankYou = 'sent'
    } catch (err) {
      result.thankYou = `error: ${err instanceof Error ? err.message : 'unknown'}`
    }

    results.push(result)
  }

  return NextResponse.json({ success: true, eventUsed: eventData.title, results })
}
