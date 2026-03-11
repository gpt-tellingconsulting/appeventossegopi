import nodemailer from 'nodemailer'

export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

// Default transporter from env vars (fallback)
let defaultTransporter: nodemailer.Transporter | null = null

function getDefaultTransporter(): nodemailer.Transporter {
  if (!defaultTransporter) {
    defaultTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.segopi.es',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: {
        user: process.env.SMTP_USER || 'eventos@segopi.es',
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return defaultTransporter
}

// Cache of company-specific transporters keyed by "host:port:user"
const companyTransporters = new Map<string, nodemailer.Transporter>()

function getCompanyTransporter(smtp: SmtpConfig): nodemailer.Transporter {
  const key = `${smtp.host}:${smtp.port}:${smtp.user}`
  let transporter = companyTransporters.get(key)
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    })
    companyTransporters.set(key, transporter)
  }
  return transporter
}

// Email configuration (default fallback)
export const EMAIL_CONFIG = {
  from: process.env.SMTP_FROM || 'Eventos SEGOPI <eventos@segopi.es>',
  replyTo: 'eventos@segopi.es',
}

// Unified send function with optional company SMTP config
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  smtpConfig?: SmtpConfig
  attachments?: Array<{
    filename: string
    content: Buffer
    cid: string
    contentType?: string
  }>
}): Promise<void> {
  const { smtpConfig } = options

  const transporter = smtpConfig
    ? getCompanyTransporter(smtpConfig)
    : getDefaultTransporter()

  const from = smtpConfig?.from || EMAIL_CONFIG.from
  const replyTo = options.replyTo || (smtpConfig?.user || EMAIL_CONFIG.replyTo)

  await transporter.sendMail({
    from,
    to: options.to,
    replyTo,
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
