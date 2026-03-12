// Email templates for Eventos SEGOPI
// ALL styles are inline for Outlook compatibility (Outlook strips <style> tags)

export interface EventEmailData {
  firstName: string
  lastName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venueName: string
  venueAddress: string
  city: string
  verificationUrl?: string
  unsubscribeUrl?: string
  siteUrl?: string
  qrCodeDataUrl?: string
  venueImageCid?: string
  raffleConditions?: string | null
}

const BRAND_NAME = 'Eventos SEGOPI'
const COMPANY_NAME = 'TELLING CONSULTING, S.L.'
const PRIMARY = '#E6007E'  // Magenta corporativo SEGOPI
const ACCENT = '#F97316'

function htmlWrap(title: string, headerSub: string, body: string, unsubscribeUrl?: string): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style>table,td{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}</style>
  <![endif]-->
</head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f3f4f6;margin:0;padding:20px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.12);">
          <!-- Gold bar top -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${PRIMARY},${ACCENT},#FBBF24);font-size:0;line-height:0;" bgcolor="${PRIMARY}">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${PRIMARY} 0%,#B8006A 100%);padding:32px;text-align:center;" bgcolor="${PRIMARY}">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">${BRAND_NAME}</h1>
              <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">${headerSub}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:11px;margin:3px 0;">&copy; ${year} ${COMPANY_NAME}</p>
              <p style="color:#9ca3af;font-size:11px;margin:3px 0;">Este correo fue enviado autom&aacute;ticamente por ${BRAND_NAME}</p>
              ${unsubscribeUrl ? `<p style="color:#9ca3af;font-size:11px;margin:3px 0;"><a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Cancelar suscripci&oacute;n</a></p>` : ''}
            </td>
          </tr>
          <!-- Gold bar bottom -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${PRIMARY},${ACCENT},#FBBF24);font-size:0;line-height:0;" bgcolor="${PRIMARY}">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function eventDetailsCard(data: EventEmailData): string {
  const rows = [
    ['Evento', data.eventTitle],
    ['Fecha', data.eventDate],
    ['Hora', data.eventTime],
    ['Lugar', data.venueName],
    ['Direcci&oacute;n', `${data.venueAddress}, ${data.city}`],
  ]
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f8bbd0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}:</td>
      <td style="padding:8px 0 8px 12px;border-bottom:1px solid #f8bbd0;color:#111827;font-weight:600;font-size:13px;vertical-align:top;">${value}</td>
    </tr>
  `).join('')

  return `
    <div style="background:#fce4ec;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid ${PRIMARY};">
      <h3 style="color:${PRIMARY};margin:0 0 14px;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;">Detalles del Evento</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${rowsHtml}
      </table>
    </div>
  `
}

export function registrationConfirmationEmail(data: EventEmailData): string {
  const qrBlock = data.qrCodeDataUrl
    ? `
    <div style="text-align:center;margin:24px 0;padding:24px;background:#f0fdf4;border-radius:12px;border:2px dashed #22c55e;">
      <p style="color:#15803d;font-weight:700;font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Tu Invitaci&oacute;n Personal</p>
      <img src="cid:qr-code" alt="QR de Invitaci&oacute;n" width="200" height="200" style="display:block;margin:0 auto;border-radius:8px;" />
      <p style="color:#4b5563;font-size:12px;margin:12px 0 0;">Presenta este c&oacute;digo QR a la entrada del evento</p>
    </div>`
    : ''

  const venueBlock = data.venueImageCid
    ? `
    <div style="text-align:center;margin:24px 0;padding:0;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,${PRIMARY} 0%,#B8006A 100%);padding:12px 16px;text-align:center;" bgcolor="${PRIMARY}">
        <p style="color:#ffffff;font-weight:700;font-size:14px;margin:0;text-transform:uppercase;letter-spacing:0.5px;">&#128205; Ubicaci&oacute;n del Evento</p>
      </div>
      <img src="cid:venue-image" alt="Ubicacion: ${data.venueName}" width="536" style="display:block;width:100%;max-width:536px;height:auto;" />
      <div style="padding:12px 16px;background:#f9fafb;">
        <p style="color:#111827;font-weight:600;font-size:13px;margin:0 0 2px;">${data.venueName}</p>
        <p style="color:#6b7280;font-size:12px;margin:0;">${data.venueAddress}, ${data.city}</p>
      </div>
    </div>`
    : ''

  const body = `
    <p style="font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;">Hola ${data.firstName} ${data.lastName},</p>
    <p style="color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;">
      Tu inscripci&oacute;n al evento ha sido confirmada. Te esperamos el d&iacute;a del evento.
    </p>
    ${eventDetailsCard(data)}
    ${qrBlock}
    ${venueBlock}
    <p style="color:#6b7280;line-height:1.65;margin-bottom:20px;font-size:13px;">
      Si tienes alguna pregunta, resp&oacute;ndenos a este correo.
    </p>
    <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:11px;line-height:1.6;margin:0;">
        <strong style="color:#6b7280;">Observaci&oacute;n:</strong> Por motivos de aforo, la empresa se reserva el derecho de admisi&oacute;n hasta completar el n&uacute;mero m&aacute;ximo de participantes permitidos en el evento. Asimismo, por razones operativas, se establece un l&iacute;mite m&aacute;ximo de dos (2) asistentes por empresa. En caso de requerir invitaciones adicionales, estas deber&aacute;n solicitarse a trav&eacute;s del correo electr&oacute;nico <a href="mailto:eventos@segopi.es" style="color:${PRIMARY};">eventos@segopi.es</a>, quedando sujetas a valoraci&oacute;n y posible aprobaci&oacute;n por parte de la organizaci&oacute;n.
      </p>
    </div>
    ${data.raffleConditions ? `
    <div style="margin-top:24px;padding:20px;background:#fffbeb;border-radius:12px;border:1px solid #fde68a;border-left:4px solid ${ACCENT};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td style="font-size:18px;padding-right:8px;vertical-align:middle;">&#128220;</td>
          <td><h3 style="color:#92400e;margin:0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Condiciones del Sorteo</h3></td>
        </tr>
      </table>
      <p style="color:#78350f;font-size:11px;line-height:1.7;margin:0;white-space:pre-line;">${data.raffleConditions}</p>
    </div>` : ''}
  `
  return htmlWrap(
    `Inscripcion Confirmada - ${data.eventTitle}`,
    'Tu inscripcion ha sido registrada',
    body,
    data.unsubscribeUrl
  )
}

export function preEventReminderEmail(data: EventEmailData): string {
  const body = `
    <p style="font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;">Hola ${data.firstName},</p>
    <p style="color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;">
      Te recordamos que el evento <strong>${data.eventTitle}</strong> es ma&ntilde;ana.
      Aqu&iacute; tienes los detalles para que no te pierdas nada.
    </p>
    ${eventDetailsCard(data)}
    <p style="color:#6b7280;line-height:1.65;margin-bottom:20px;font-size:13px;">
      Por favor, llega con 10 minutos de antelaci&oacute;n para el registro.
    </p>
  `
  return htmlWrap(
    `Recordatorio - ${data.eventTitle}`,
    'El evento es manana',
    body,
    data.unsubscribeUrl
  )
}

export function postEventThankYouEmail(data: EventEmailData & { npsUrl: string }): string {
  const body = `
    <p style="font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;">Hola ${data.firstName},</p>
    <p style="color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;">
      Gracias por asistir a <strong>${data.eventTitle}</strong>. Fue un placer tenerte con nosotros.
      Tu opini&oacute;n nos ayuda a mejorar cada edici&oacute;n.
    </p>
    <div style="text-align:center;">
      <a href="${data.npsUrl}" style="display:inline-block;background:linear-gradient(135deg,${ACCENT} 0%,#EA580C 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;margin:16px 0;" bgcolor="${ACCENT}">Valorar el Evento</a>
    </div>
    <p style="color:#6b7280;line-height:1.65;margin-top:24px;font-size:13px;">
      Estar&eacute; al tanto de pr&oacute;ximos eventos. &iexcl;Hasta pronto!
    </p>
  `
  return htmlWrap(
    `Gracias por asistir - ${data.eventTitle}`,
    'Nos alegra que hayas venido',
    body,
    data.unsubscribeUrl
  )
}

export function salesNotificationEmail(data: {
  eventTitle: string
  attendees: Array<{ name: string; email: string; company: string | null }>
}): string {
  const rows = data.attendees.map((a) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${a.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">${a.email}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#4b5563;">${a.company ?? '—'}</td>
    </tr>
  `).join('')

  const body = `
    <p style="font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;">Nuevas inscripciones</p>
    <p style="color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;">
      Se han registrado <strong>${data.attendees.length}</strong> nuevos asistentes al evento
      <strong>${data.eventTitle}</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#fce4ec;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:${PRIMARY};text-transform:uppercase;">Nombre</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:${PRIMARY};text-transform:uppercase;">Email</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:${PRIMARY};text-transform:uppercase;">Empresa</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
  return htmlWrap(
    `Nuevas inscripciones - ${data.eventTitle}`,
    'Notificacion de ventas',
    body
  )
}

export function commercialFollowUpEmail(data: EventEmailData & { offerText: string }): string {
  const body = `
    <p style="font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;">Hola ${data.firstName},</p>
    <p style="color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;">
      Gracias por tu inter&eacute;s en <strong>${data.eventTitle}</strong>.
      Queremos compartir contigo una oferta especial.
    </p>
    <div style="background:#fff7ed;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid ${ACCENT};">
      <h3 style="color:${ACCENT};margin:0 0 14px;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;">Oferta Especial</h3>
      <p style="color:#374151;margin:0;line-height:1.65;">${data.offerText}</p>
    </div>
    ${eventDetailsCard(data)}
    <div style="text-align:center;">
      <a href="${data.siteUrl ?? '#'}" style="display:inline-block;background:linear-gradient(135deg,${ACCENT} 0%,#EA580C 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;margin:16px 0;" bgcolor="${ACCENT}">Inscribirme Ahora</a>
    </div>
  `
  return htmlWrap(
    `Oferta especial - ${data.eventTitle}`,
    'Una propuesta para ti',
    body,
    data.unsubscribeUrl
  )
}

export function emailVerificationEmail(data: { firstName: string; verificationUrl: string }): string {
  const body = `
    <p style="font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;">Hola ${data.firstName},</p>
    <p style="color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;">
      Gracias por registrarte en <strong>${BRAND_NAME}</strong>.
      Verifica tu direcci&oacute;n de correo para activar tu cuenta.
    </p>
    <div style="text-align:center;">
      <a href="${data.verificationUrl}" style="display:inline-block;background:linear-gradient(135deg,${ACCENT} 0%,#EA580C 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;margin:16px 0;" bgcolor="${ACCENT}">Verificar mi Correo</a>
    </div>
    <p style="color:#6b7280;line-height:1.65;margin-top:24px;font-size:13px;">
      Este enlace caducar&aacute; en 24 horas. Si no solicitaste esta cuenta, ignora este mensaje.
    </p>
  `
  return htmlWrap(
    `Verifica tu correo - ${BRAND_NAME}`,
    'Activa tu cuenta',
    body
  )
}

export function unsubscribeConfirmationEmail(data: { firstName: string }): string {
  const body = `
    <p style="font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;">Hola ${data.firstName},</p>
    <p style="color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;">
      Has sido eliminado correctamente de nuestra lista de comunicaciones.
      Ya no recibir&aacute;s correos de <strong>${BRAND_NAME}</strong>.
    </p>
    <p style="color:#6b7280;line-height:1.65;font-size:13px;">
      Si esto fue un error, puedes ponerte en contacto con nosotros respondiendo a este correo.
    </p>
  `
  return htmlWrap(
    `Baja confirmada - ${BRAND_NAME}`,
    'Has cancelado tu suscripcion',
    body
  )
}

export function attendanceThankYouEmail(data: {
  firstName: string
  lastName: string
  eventTitle: string
  eventDate: string
  city: string
  siteUrl: string
}): string {
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Gracias por tu asistencia - ${data.eventTitle}</title>
  <!--[if mso]>
  <style>table,td{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f0e17;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0e17;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,0.4);">
          <!-- Gold bar top -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${PRIMARY},${ACCENT},#FBBF24);font-size:0;line-height:0;" bgcolor="${PRIMARY}">&nbsp;</td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(145deg,#880E4F 0%,#AD1457 40%,${PRIMARY} 80%,#B8006A 100%);padding:56px 40px 48px;text-align:center;" bgcolor="#AD1457">
              <div style="width:80px;height:4px;background:linear-gradient(90deg,${ACCENT},#FBBF24);border-radius:2px;margin:0 auto 28px;"></div>
              <h1 style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;opacity:0.7;">${BRAND_NAME}</h1>
              <h2 style="color:#ffffff;font-size:32px;font-weight:800;margin:0 0 8px;line-height:1.2;letter-spacing:-0.5px;">Gracias por estar presente</h2>
              <p style="color:rgba(255,255,255,0.65);font-size:14px;margin:0;">${data.eventTitle} &middot; ${data.city}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:22px;color:#111827;font-weight:700;margin:0 0 16px;">Estimado/a ${data.firstName} ${data.lastName},</p>
              <p style="color:#4b5563;font-size:15px;line-height:1.75;margin:0 0 32px;">
                Ha sido un honor contar con su presencia en <strong>${data.eventTitle}</strong>,
                celebrado el <strong>${data.eventDate}</strong> en <strong>${data.city}</strong>.
                Su participaci&oacute;n contribuy&oacute; a hacer de este evento un espacio de encuentro
                excepcional para el sector de la pintura y la construcci&oacute;n en Espa&ntilde;a.
              </p>

              <!-- Highlight block -->
              <div style="background:linear-gradient(135deg,#f8bbd0 0%,#fce4ec 100%);border-radius:16px;padding:32px;margin:32px 0;border:1px solid #f48fb1;text-align:center;">
                <span style="font-size:36px;margin:0 0 12px;display:block;">&#127941;</span>
                <h3 style="color:#C2185B;font-size:18px;font-weight:700;margin:0 0 8px;">Formaste parte de algo especial</h3>
                <p style="color:#6b7280;font-size:14px;line-height:1.65;margin:0;">
                  Junto a los dem&aacute;s asistentes, contribuiste a construir un espacio de
                  di&aacute;logo, formaci&oacute;n y conexi&oacute;n que impulsa el futuro del sector.
                  Cada participante es parte esencial de este proyecto com&uacute;n.
                </p>
              </div>

              <div style="height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:32px 0;"></div>

              <!-- Stats -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
                <tr>
                  <td style="text-align:center;padding:20px 12px;vertical-align:top;width:33.333%;">
                    <span style="font-size:28px;font-weight:800;color:${PRIMARY};display:block;line-height:1;">&#10003;</span>
                    <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;margin-top:4px;display:block;">Asistencia<br/>confirmada</span>
                  </td>
                  <td style="text-align:center;padding:20px 12px;vertical-align:top;width:33.333%;">
                    <span style="font-size:28px;font-weight:800;color:${ACCENT};display:block;line-height:1;">&#9733;</span>
                    <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;margin-top:4px;display:block;">Experiencia<br/>premium</span>
                  </td>
                  <td style="text-align:center;padding:20px 12px;vertical-align:top;width:33.333%;">
                    <span style="font-size:28px;font-weight:800;color:#B8006A;display:block;line-height:1;">&#8734;</span>
                    <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;margin-top:4px;display:block;">Red de<br/>contactos</span>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:32px 0;"></div>

              <!-- Stay connected -->
              <div style="background:#0f0e17;border-radius:16px;padding:32px;margin:32px 0;text-align:center;">
                <h3 style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;">Mant&eacute;ngase conectado</h3>
                <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0 0 20px;line-height:1.6;">
                  No pierda la oportunidad de estar al tanto de las pr&oacute;ximas jornadas,
                  publicaciones y oportunidades de networking del sector.
                </p>
                <a href="${data.siteUrl}" style="display:inline-block;background:linear-gradient(135deg,${ACCENT} 0%,#EA580C 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.3px;" bgcolor="${ACCENT}">Ver pr&oacute;ximos eventos</a>
              </div>

              <p style="color:#4b5563;font-size:15px;line-height:1.75;margin:32px 0 0;">
                Esperamos volver a contar con su presencia en futuras ediciones. Quedamos a su
                disposici&oacute;n para cualquier consulta o comentario que desee hacernos llegar.
              </p>

              <div style="margin:24px 0 0;">
                <strong style="color:#111827;font-size:15px;display:block;">El equipo de ${BRAND_NAME}</strong>
                <span style="color:#9ca3af;font-size:13px;">${COMPANY_NAME}</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:11px;margin:3px 0;line-height:1.6;">&copy; ${year} ${COMPANY_NAME}. Todos los derechos reservados.</p>
              <p style="color:#9ca3af;font-size:11px;margin:3px 0;line-height:1.6;">Este mensaje fue enviado a los asistentes de <em>${data.eventTitle}</em>.</p>
              <p style="margin:3px 0;">
                <a href="${data.siteUrl}" style="color:#6b7280;text-decoration:underline;font-size:11px;">Visitar sitio web</a>
              </p>
            </td>
          </tr>

          <!-- Gold bar bottom -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${PRIMARY},${ACCENT},#FBBF24);font-size:0;line-height:0;" bgcolor="${PRIMARY}">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
