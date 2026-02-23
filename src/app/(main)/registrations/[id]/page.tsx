import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRegistration } from '@/features/registrations/services/registrationService'
import {
  AttendanceStatusForm,
  LeadStatusForm,
  NotesForm,
  TagsForm,
  DeleteRegistrationButton,
} from '@/features/registrations/components/RegistrationActions'

interface PageProps {
  params: Promise<{ id: string }>
}

const CONSENT_LABELS: Record<string, string> = {
  privacy_policy: 'Politica de Privacidad',
  commercial_communications: 'Comunicaciones Comerciales',
  raffle_participation: 'Participacion en Sorteo',
}

export default async function RegistrationDetailPage({ params }: PageProps) {
  const { id } = await params
  const registration = await getRegistration(id)

  if (!registration) notFound()

  const fullName = `${registration.first_name} ${registration.last_name}`
  const eventId = registration.event?.id

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-6">
        <Link href="/registrations" className="hover:text-primary-600">Inscripciones</Link>
        <span>/</span>
        <span className="truncate max-w-xs">{fullName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary-600">
              {registration.first_name[0]}{registration.last_name[0]}
            </span>
          </div>
          <div>
            <h1 className="text-display-sm">{fullName}</h1>
            <p className="text-foreground-secondary">{registration.email}</p>
            {registration.event && (
              <Link
                href={`/events/${eventId}/registrations`}
                className="text-sm text-primary-600 hover:underline"
              >
                {registration.event.title}
              </Link>
            )}
          </div>
        </div>
        {eventId && (
          <Link
            href={`/events/${eventId}/registrations`}
            className="text-sm text-foreground-secondary hover:text-primary-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ver todos del evento
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Data */}
          <div className="card-elevated p-6">
            <h2 className="font-semibold mb-4">Datos personales</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground-secondary text-xs mb-0.5">Nombre</p>
                <p className="font-medium">{registration.first_name}</p>
              </div>
              <div>
                <p className="text-foreground-secondary text-xs mb-0.5">Apellidos</p>
                <p className="font-medium">{registration.last_name}</p>
              </div>
              <div>
                <p className="text-foreground-secondary text-xs mb-0.5">Email</p>
                <p className="font-medium break-all">{registration.email}</p>
                <span className={`text-xs ${registration.email_verified ? 'text-success-600' : 'text-warning-600'}`}>
                  {registration.email_verified ? 'Verificado' : 'Sin verificar'}
                </span>
              </div>
              <div>
                <p className="text-foreground-secondary text-xs mb-0.5">Telefono</p>
                <p className="font-medium">{registration.phone_country_code} {registration.phone}</p>
              </div>
              {registration.company && (
                <div>
                  <p className="text-foreground-secondary text-xs mb-0.5">Empresa</p>
                  <p className="font-medium">{registration.company}</p>
                </div>
              )}
              {registration.position && (
                <div>
                  <p className="text-foreground-secondary text-xs mb-0.5">Cargo</p>
                  <p className="font-medium">{registration.position}</p>
                </div>
              )}
              <div>
                <p className="text-foreground-secondary text-xs mb-0.5">Inscripcion</p>
                <p className="font-medium">
                  {new Date(registration.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {registration.checked_in_at && (
                <div>
                  <p className="text-foreground-secondary text-xs mb-0.5">Check-in</p>
                  <p className="font-medium text-success-700">
                    {new Date(registration.checked_in_at).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Consents Audit Trail */}
          {registration.consents && registration.consents.length > 0 && (
            <div className="card-elevated p-6">
              <h2 className="font-semibold mb-4">Auditoria de consentimientos RGPD</h2>
              <div className="space-y-3">
                {registration.consents.map((consent) => (
                  <div
                    key={consent.id}
                    className="flex items-start justify-between p-3 rounded-xl bg-background border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {CONSENT_LABELS[consent.consent_type] ?? consent.consent_type}
                      </p>
                      <p className="text-xs text-foreground-secondary mt-0.5">
                        Otorgado: {new Date(consent.consent_timestamp).toLocaleString('es-ES')}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        IP: {consent.consent_ip} | v{consent.policy_version}
                      </p>
                      {consent.withdrawn_at && (
                        <p className="text-xs text-error-600 mt-0.5">
                          Retirado: {new Date(consent.withdrawn_at).toLocaleString('es-ES')}
                        </p>
                      )}
                    </div>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                      consent.granted && !consent.withdrawn_at
                        ? 'bg-success-50 text-success-700'
                        : 'bg-error-50 text-error-700'
                    }`}>
                      {consent.granted && !consent.withdrawn_at ? 'Activo' : 'Retirado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - actions */}
        <div className="space-y-6">
          {/* CRM Stats */}
          <div className="stat-card">
            <p className="text-xs text-foreground-secondary mb-1">Lead Score</p>
            <p className="text-3xl font-bold text-primary-600">{registration.lead_score}</p>
            {registration.nps_score !== null && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-foreground-secondary mb-0.5">NPS Score</p>
                <p className="text-xl font-bold text-accent-500">{registration.nps_score}/10</p>
              </div>
            )}
          </div>

          {/* Attendance Status */}
          <div className="card-elevated p-6">
            <AttendanceStatusForm
              registrationId={registration.id}
              currentStatus={registration.attendance_status}
            />
          </div>

          {/* Lead Status */}
          <div className="card-elevated p-6">
            <LeadStatusForm
              registrationId={registration.id}
              currentStatus={registration.lead_status}
            />
          </div>

          {/* Tags */}
          <div className="card-elevated p-6">
            <TagsForm
              registrationId={registration.id}
              initialTags={registration.tags ?? []}
            />
          </div>

          {/* Export link */}
          <a
            href={`/api/export/registrations?eventId=${registration.event_id}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-border rounded-xl text-sm font-medium text-foreground-secondary hover:border-accent-300 hover:text-accent-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar evento CSV
          </a>

          {/* Delete */}
          <DeleteRegistrationButton
            registrationId={registration.id}
            attendeeName={fullName}
          />
        </div>
      </div>

      {/* Notes - full width */}
      <div className="card-elevated p-6 mt-6">
        <NotesForm
          registrationId={registration.id}
          initialNotes={registration.internal_notes}
        />
      </div>
    </div>
  )
}
