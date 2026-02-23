import nodemailer from 'nodemailer'

// Lazy initialize SMTP transporter
let transporterInstance: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.segopi.es',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: {
        user: process.env.SMTP_USER || 'eventos@segopi.es',
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporterInstance
}

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.SMTP_FROM || 'Eventos SEGOPI <eventos@segopi.es>',
  replyTo: 'eventos@segopi.es',
}

// Unified send function
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    cid: string
    contentType?: string
  }>
}): Promise<void> {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: EMAIL_CONFIG.from,
    to: options.to,
    replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      cid: a.cid,
      contentType: a.contentType || 'image/png',
      contentDisposition: 'inline' as const,
    })),
  })
}
