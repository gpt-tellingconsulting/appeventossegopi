export { sendEmail, EMAIL_CONFIG } from './resend'
export type { SmtpConfig } from './resend'
export {
  registrationConfirmationEmail,
  preEventReminderEmail,
  postEventThankYouEmail,
  salesNotificationEmail,
  commercialFollowUpEmail,
  emailVerificationEmail,
  unsubscribeConfirmationEmail,
  attendanceThankYouEmail,
} from './templates'
export type { EventEmailData } from './templates'
