// Email templates for Eventos SEGOPI

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
}

const BRAND_NAME = 'Eventos SEGOPI'
const COMPANY_NAME = 'TELLING CONSULTING, S.L.'
const PRIMARY = '#4F46E5'
const ACCENT = '#F97316'

const baseStyles = `
  body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f3f4f6;margin:0;padding:20px;}
  .wrap{max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.12);}
  .header{background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;}
  .header p{color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;}
  .content{padding:32px;}
  .greeting{font-size:18px;color:#111827;margin-bottom:12px;font-weight:600;}
  .message{color:#4b5563;line-height:1.65;margin-bottom:20px;font-size:15px;}
  .card{background:#f5f3ff;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid #4F46E5;}
  .card h3{color:#4F46E5;margin:0 0 14px;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ede9fe;}
  .row:last-child{border-bottom:none;}
  .label{color:#6b7280;font-size:13px;}
  .value{color:#111827;font-weight:600;font-size:13px;}
  .btn{display:inline-block;background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;margin:16px 0;}
  .footer{background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;}
  .footer p{color:#9ca3af;font-size:11px;margin:3px 0;}
  .footer a{color:#6b7280;text-decoration:underline;}
`

function htmlWrap(title: string, headerSub: string, body: string, unsubscribeUrl?: string): string {
  const year = new Date().getFullYear()
  const footer = `
    <div class="footer">
      <p>&copy; ${year} ${COMPANY_NAME}</p>
      <p>Este correo fue enviado autom&aacute;ticamente por ${BRAND_NAME}</p>
      ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}">Cancelar suscripci&oacute;n</a></p>` : ''}
    </div>
  `
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p>${headerSub}</p>
    </div>
    <div class="content">${body}</div>
    ${footer}
  </div>
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
      <td style="padding:8px 0;border-bottom:1px solid #ede9fe;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}:</td>
      <td style="padding:8px 0 8px 12px;border-bottom:1px solid #ede9fe;color:#111827;font-weight:600;font-size:13px;vertical-align:top;">${value}</td>
    </tr>
  `).join('')

  return `
    <div style="background:#f5f3ff;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid #4F46E5;">
      <h3 style="color:#4F46E5;margin:0 0 14px;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;">Detalles del Evento</h3>
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

  const body = `
    <p class="greeting">Hola ${data.firstName} ${data.lastName},</p>
    <p class="message">
      Tu inscripci&oacute;n al evento ha sido confirmada. Te esperamos el d&iacute;a del evento.
    </p>
    ${eventDetailsCard(data)}
    ${qrBlock}
    <p class="message" style="font-size:13px;color:#6b7280;">
      Si tienes alguna pregunta, resp&oacute;ndenos a este correo.
    </p>
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
    <p class="greeting">Hola ${data.firstName},</p>
    <p class="message">
      Te recordamos que el evento <strong>${data.eventTitle}</strong> es ma&ntilde;ana.
      Aqu&iacute; tienes los detalles para que no te pierdas nada.
    </p>
    ${eventDetailsCard(data)}
    <p class="message" style="font-size:13px;color:#6b7280;">
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
    <p class="greeting">Hola ${data.firstName},</p>
    <p class="message">
      Gracias por asistir a <strong>${data.eventTitle}</strong>. Fue un placer tenerte con nosotros.
      Tu opini&oacute;n nos ayuda a mejorar cada edici&oacute;n.
    </p>
    <div style="text-align:center;">
      <a href="${data.npsUrl}" class="btn">Valorar el Evento</a>
    </div>
    <p class="message" style="margin-top:24px;font-size:13px;color:#6b7280;">
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
    <p class="greeting">Nuevas inscripciones</p>
    <p class="message">
      Se han registrado <strong>${data.attendees.length}</strong> nuevos asistentes al evento
      <strong>${data.eventTitle}</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#f5f3ff;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#4F46E5;text-transform:uppercase;">Nombre</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#4F46E5;text-transform:uppercase;">Email</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#4F46E5;text-transform:uppercase;">Empresa</th>
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
    <p class="greeting">Hola ${data.firstName},</p>
    <p class="message">
      Gracias por tu inter&eacute;s en <strong>${data.eventTitle}</strong>.
      Queremos compartir contigo una oferta especial.
    </p>
    <div class="card" style="border-left-color:#F97316;background:#fff7ed;">
      <h3 style="color:#F97316;">Oferta Especial</h3>
      <p style="color:#374151;margin:0;line-height:1.65;">${data.offerText}</p>
    </div>
    ${eventDetailsCard(data)}
    <div style="text-align:center;">
      <a href="${data.siteUrl ?? '#'}" class="btn">Inscribirme Ahora</a>
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
    <p class="greeting">Hola ${data.firstName},</p>
    <p class="message">
      Gracias por registrarte en <strong>${BRAND_NAME}</strong>.
      Verifica tu direcci&oacute;n de correo para activar tu cuenta.
    </p>
    <div style="text-align:center;">
      <a href="${data.verificationUrl}" class="btn">Verificar mi Correo</a>
    </div>
    <p class="message" style="margin-top:24px;font-size:13px;color:#6b7280;">
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
    <p class="greeting">Hola ${data.firstName},</p>
    <p class="message">
      Has sido eliminado correctamente de nuestra lista de comunicaciones.
      Ya no recibir&aacute;s correos de <strong>${BRAND_NAME}</strong>.
    </p>
    <p class="message" style="font-size:13px;color:#6b7280;">
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
  <style>
    body{margin:0;padding:0;background-color:#0f0e17;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}
    .outer{width:100%;background-color:#0f0e17;padding:40px 0;}
    .wrap{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,0.4);}
    .hero{background:linear-gradient(145deg,#1e1b4b 0%,#312e81 40%,#4F46E5 80%,#7C3AED 100%);padding:56px 40px 48px;text-align:center;position:relative;}
    .hero-accent{width:80px;height:4px;background:linear-gradient(90deg,#F97316,#FBBF24);border-radius:2px;margin:0 auto 28px;}
    .hero h1{color:#ffffff;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;opacity:0.7;}
    .hero h2{color:#ffffff;font-size:32px;font-weight:800;margin:0 0 8px;line-height:1.2;letter-spacing:-0.5px;}
    .hero p{color:rgba(255,255,255,0.65);font-size:14px;margin:0;}
    .body-section{padding:40px;}
    .salutation{font-size:22px;color:#111827;font-weight:700;margin:0 0 16px;}
    .intro{color:#4b5563;font-size:15px;line-height:1.75;margin:0 0 32px;}
    .divider{height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:32px 0;}
    .highlight-box{background:linear-gradient(135deg,#ede9fe 0%,#f5f3ff 100%);border-radius:16px;padding:32px;margin:32px 0;border:1px solid #ddd6fe;text-align:center;}
    .highlight-box .icon{font-size:36px;margin:0 0 12px;display:block;}
    .highlight-box h3{color:#4338ca;font-size:18px;font-weight:700;margin:0 0 8px;}
    .highlight-box p{color:#6b7280;font-size:14px;line-height:1.65;margin:0;}
    .stats-row{display:table;width:100%;margin:32px 0;}
    .stat-cell{display:table-cell;text-align:center;padding:20px 12px;vertical-align:top;width:33.333%;}
    .stat-number{font-size:28px;font-weight:800;color:#4F46E5;display:block;line-height:1;}
    .stat-label{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;margin-top:4px;display:block;}
    .stay-connected{background:#0f0e17;border-radius:16px;padding:32px;margin:32px 0;text-align:center;}
    .stay-connected h3{color:#ffffff;font-size:16px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;}
    .stay-connected p{color:rgba(255,255,255,0.55);font-size:13px;margin:0 0 20px;line-height:1.6;}
    .cta-btn{display:inline-block;background:linear-gradient(135deg,#F97316 0%,#EA580C 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.3px;}
    .closing{color:#4b5563;font-size:15px;line-height:1.75;margin:32px 0 0;}
    .signature{margin:24px 0 0;}
    .signature strong{color:#111827;font-size:15px;display:block;}
    .signature span{color:#9ca3af;font-size:13px;}
    .email-footer{background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;}
    .email-footer p{color:#9ca3af;font-size:11px;margin:3px 0;line-height:1.6;}
    .email-footer a{color:#6b7280;text-decoration:underline;}
    .gold-bar{height:4px;background:linear-gradient(90deg,#4F46E5,#F97316,#FBBF24);}
  </style>
</head>
<body>
  <div class="outer">
    <div class="wrap">
      <div class="gold-bar"></div>

      <!-- Hero -->
      <div class="hero">
        <div class="hero-accent"></div>
        <h1>${BRAND_NAME}</h1>
        <h2>Gracias por estar presente</h2>
        <p>${data.eventTitle} &middot; ${data.city}</p>
      </div>

      <!-- Body -->
      <div class="body-section">
        <p class="salutation">Estimado/a ${data.firstName} ${data.lastName},</p>
        <p class="intro">
          Ha sido un honor contar con su presencia en <strong>${data.eventTitle}</strong>,
          celebrado el <strong>${data.eventDate}</strong> en <strong>${data.city}</strong>.
          Su participaci&oacute;n contribuy&oacute; a hacer de este evento un espacio de encuentro
          excepcional para el sector de la seguridad privada en Espa&ntilde;a.
        </p>

        <!-- Highlight block -->
        <div class="highlight-box">
          <span class="icon">&#127941;</span>
          <h3>Formaste parte de algo especial</h3>
          <p>
            Junto a los dem&aacute;s asistentes, contribuiste a construir un espacio de
            di&aacute;logo, formaci&oacute;n y conexi&oacute;n que impulsa el futuro del sector.
            Cada participante es parte esencial de este proyecto com&uacute;n.
          </p>
        </div>

        <div class="divider"></div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-cell">
            <span class="stat-number">&#10003;</span>
            <span class="stat-label">Asistencia<br/>confirmada</span>
          </div>
          <div class="stat-cell">
            <span class="stat-number" style="color:#F97316;">&#9733;</span>
            <span class="stat-label">Experiencia<br/>premium</span>
          </div>
          <div class="stat-cell">
            <span class="stat-number" style="color:#7C3AED;">&#8734;</span>
            <span class="stat-label">Red de<br/>contactos</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Stay connected -->
        <div class="stay-connected">
          <h3>Mant&eacute;ngase conectado</h3>
          <p>
            No pierda la oportunidad de estar al tanto de las pr&oacute;ximas jornadas,
            publicaciones y oportunidades de networking del sector.
          </p>
          <a href="${data.siteUrl}" class="cta-btn">Ver pr&oacute;ximos eventos</a>
        </div>

        <p class="closing">
          Esperamos volver a contar con su presencia en futuras ediciones. Quedamos a su
          disposici&oacute;n para cualquier consulta o comentario que desee hacernos llegar.
        </p>

        <div class="signature">
          <strong>El equipo de ${BRAND_NAME}</strong>
          <span>${COMPANY_NAME}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>&copy; ${year} ${COMPANY_NAME}. Todos los derechos reservados.</p>
        <p>Este mensaje fue enviado a los asistentes de <em>${data.eventTitle}</em>.</p>
        <p>
          <a href="${data.siteUrl}">Visitar sitio web</a>
        </p>
      </div>

      <div class="gold-bar"></div>
    </div>
  </div>
</body>
</html>`
}
