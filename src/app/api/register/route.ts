import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { registrationSchema } from '@/features/registrations/types/schemas'
import crypto from 'crypto'
import { generateBrandedQR } from '@/lib/qr'
import { sendEmail } from '@/lib/email'
import { registrationConfirmationEmail } from '@/lib/email/templates'

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    // En desarrollo sin Turnstile, permitir
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification')
    return true
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      remoteip: ip,
    }),
  })

  const data = await response.json()
  return data.success === true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar con Zod
    const parsed = registrationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? '0.0.0.0'
    const userAgent = request.headers.get('user-agent') ?? ''

    // Verificar Turnstile
    const turnstileValid = await verifyTurnstile(data.turnstileToken, ip)
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Verificacion de seguridad fallida. Intenta de nuevo.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verificar lista de supresion
    const { data: suppressed } = await supabase
      .from('suppression_list')
      .select('id')
      .eq('email', data.email)
      .single()

    if (suppressed) {
      return NextResponse.json(
        { error: 'Este email no puede ser registrado. Contacta con el organizador.' },
        { status: 400 }
      )
    }

    // Verificar si ya esta registrado para este evento
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', data.eventId)
      .eq('email', data.email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya estas registrado para este evento.' },
        { status: 409 }
      )
    }

    // Verificar que el evento existe y acepta inscripciones
    const { data: event } = await supabase
      .from('events')
      .select('id, status, max_capacity, registration_deadline')
      .eq('id', data.eventId)
      .single()

    if (!event || event.status !== 'published') {
      return NextResponse.json(
        { error: 'Este evento no acepta inscripciones.' },
        { status: 400 }
      )
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json(
        { error: 'El plazo de inscripción ha finalizado.' },
        { status: 400 }
      )
    }

    // Verificar capacidad
    if (event.max_capacity) {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', data.eventId)
        .neq('attendance_status', 'cancelled')

      if (count && count >= event.max_capacity) {
        return NextResponse.json(
          { error: 'El evento ha alcanzado su capacidad maxima.' },
          { status: 400 }
        )
      }
    }

    // Generar token de verificacion de email y token unico de QR para check-in
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const qrToken = crypto.randomUUID()

    // Crear inscripcion
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        event_id: data.eventId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        email_verification_token: verificationToken,
        qr_token: qrToken,
        phone: data.phone,
        phone_country_code: data.phoneCountryCode,
        company: data.company ?? null,
        position: data.position ?? null,
        company_cif: data.companyCif ?? null,
        invitation_number: data.invitationNumber ?? null,
        registration_ip: ip,
        user_agent: userAgent,
        tags: [],
      })
      .select()
      .single()

    if (regError) {
      console.error('Registration error:', regError)
      return NextResponse.json(
        { error: 'Error al procesar la inscripción. Inténtalo de nuevo.' },
        { status: 500 }
      )
    }

    // Registrar consentimientos RGPD
    const consents = [
      {
        registration_id: registration.id,
        consent_type: 'privacy_policy',
        granted: true,
        consent_ip: ip,
        consent_user_agent: userAgent,
        policy_version: '1.0',
      },
      {
        registration_id: registration.id,
        consent_type: 'commercial_communications',
        granted: data.commercialAccepted,
        consent_ip: ip,
        consent_user_agent: userAgent,
        policy_version: '1.0',
      },
      {
        registration_id: registration.id,
        consent_type: 'raffle_participation',
        granted: data.raffleAccepted ?? false,
        consent_ip: ip,
        consent_user_agent: userAgent,
        policy_version: '1.0',
      },
    ]

    await supabase.from('consents').insert(consents)

    // Marcar como elegible para sorteos si acepto
    if (data.raffleAccepted) {
      await supabase
        .from('registrations')
        .update({ raffle_eligible: true })
        .eq('id', registration.id)
    }

    // Obtener detalles completos del evento para el email de confirmacion
    const { data: eventDetails } = await supabase
      .from('events')
      .select('title, event_date, event_start_time, event_end_time, venue_name, venue_address, city, raffle_conditions')
      .eq('id', data.eventId)
      .single()

    if (eventDetails) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const checkinUrl = `${siteUrl}/api/checkin?token=${qrToken}`
        const qrBuffer = await generateBrandedQR(checkinUrl)

        const eventDate = new Date(eventDetails.event_date).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        const startTime = eventDetails.event_start_time?.slice(0, 5) ?? ''
        const endTime = eventDetails.event_end_time?.slice(0, 5) ?? ''
        const eventTime = endTime ? `${startTime} - ${endTime}` : startTime

        const emailHtml = registrationConfirmationEmail({
          firstName: data.firstName,
          lastName: data.lastName,
          eventTitle: eventDetails.title,
          eventDate,
          eventTime,
          venueName: eventDetails.venue_name ?? '',
          venueAddress: eventDetails.venue_address ?? '',
          city: eventDetails.city ?? '',
          qrCodeDataUrl: 'cid:qr-code',
          raffleConditions: eventDetails.raffle_conditions,
        })

        await sendEmail({
          to: registration.email,
          subject: `Confirmacion de Inscripcion - ${eventDetails.title}`,
          html: emailHtml,
          attachments: [{
            filename: 'qr-invitacion.png',
            content: qrBuffer,
            cid: 'qr-code',
          }],
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // No se falla el registro si el envio de email falla
      }
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      message: 'Inscripcion exitosa. Revisa tu email para confirmar.',
    })

  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
