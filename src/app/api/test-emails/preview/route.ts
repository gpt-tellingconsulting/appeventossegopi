import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { registrationConfirmationEmail, attendanceThankYouEmail } from '@/lib/email/templates'
import { generateBrandedQR } from '@/lib/qr'

// Test endpoint that does NOT need Supabase - uses hardcoded event data
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Solo disponible en desarrollo' }, { status: 403 })
  }

  const body = await request.json()
  const email: string = body.email || 'marques@tellingconsulting.es'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const qrBuffer = await generateBrandedQR(`${siteUrl}/api/checkin?token=test-preview`)

  const raffleConditions = `1. La empresa Segopi Centro S.L. con CIF.B78295300 y direccion en calle San Roque 37 Guadarrama (Madrid), con motivo de la celebracion de una feria del profesional los dias 25 y 26 de marzo de 2026 en el estadio de futbol Santo Domingo de Alcorcon.
2. Organiza el sorteo de 1 Iphone 17
3. Podran participar en el sorteo aquellos clientes del Grupo Segopi que formalicen por escrito un pedido relacionado con el evento denominado "Exposegopi".
4. Por cada tramo de 300 euros de compra formalizada durante el evento, el cliente recibira una papeleta de participacion. Las papeletas deberan ser depositadas en las urnas habilitadas a tal efecto en el recinto ferial.
5. Los pedidos formalizados que participen en el sorteo no podran ser anulados ni modificados total o parcialmente, salvo en caso de defecto o tara del producto. En ningun caso el premio podra ser canjeado por su valor en metalico ni por otro bien o servicio distinto al indicado.
6. El sorteo se celebrara el Jueves 26 de marzo de 2026 a las 16h:00h en el lugar del evento.
7. La seleccion del ganador se realizara mediante extraccion aleatoria de una papeleta entre todas las participaciones validas.
8. La participacion en el presente sorteo implica la aceptacion integra de las presentes bases legales asi como el criterio interpretativo de la entidad organizadora en caso de controversia.`

  const results: { confirmation: string; thankYou: string } = {
    confirmation: 'pending',
    thankYou: 'pending',
  }

  // Confirmation email
  try {
    const html = registrationConfirmationEmail({
      firstName: 'Nombre',
      lastName: 'Apellido',
      eventTitle: 'Feria Segopi Centro 2026',
      eventDate: 'miercoles, 25 de marzo de 2026',
      eventTime: '09:00 - 18:00',
      venueName: 'Estadio Municipal de Santo Domingo',
      venueAddress: 'Av. de Esteban Marquez, S/N',
      city: 'Alcorcon',
      qrCodeDataUrl: 'cid:qr-code',
      raffleConditions,
    })

    await sendEmail({
      to: email,
      subject: '[TEST v2] Confirmacion de Inscripcion - Feria Segopi Centro 2026',
      html,
      attachments: [{ filename: 'qr-invitacion.png', content: qrBuffer, cid: 'qr-code' }],
    })
    results.confirmation = 'sent'
  } catch (err) {
    results.confirmation = `error: ${err instanceof Error ? err.message : 'unknown'}`
  }

  // Thank-you email
  try {
    const html = attendanceThankYouEmail({
      firstName: 'Nombre',
      lastName: 'Apellido',
      eventTitle: 'Feria Segopi Centro 2026',
      eventDate: 'miercoles, 25 de marzo de 2026',
      city: 'Alcorcon',
      siteUrl,
    })

    await sendEmail({
      to: email,
      subject: '[TEST v2] Gracias por asistir - Feria Segopi Centro 2026',
      html,
    })
    results.thankYou = 'sent'
  } catch (err) {
    results.thankYou = `error: ${err instanceof Error ? err.message : 'unknown'}`
  }

  return NextResponse.json({ success: true, email, results })
}
