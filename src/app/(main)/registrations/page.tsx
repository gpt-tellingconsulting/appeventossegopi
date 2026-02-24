import Link from 'next/link'
import { getAllRegistrations } from '@/features/registrations/services/registrationService'
import { getAllEvents } from '@/features/events/services/eventService'
import { EventFilterSelect } from '@/features/registrations/components/EventFilterSelect'

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string; eventId?: string }>
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos',
  registered: 'Registrado',
  confirmed: 'Confirmado',
  attended: 'Acudió',
  no_show: 'NO Acudió',
  cancelled: 'Cancelado',
}

const STATUS_BADGE: Record<string, string> = {
  registered: 'badge-registered',
  confirmed: 'badge-confirmed',
  attended: 'badge-attended',
  no_show: 'badge-no-show',
  cancelled: 'badge-cancelled',
}

function buildUrl(params: Record<string, string>) {
  const filtered = Object.entries(params).filter(([, v]) => v && v !== 'all' && v !== '')
  return `/registrations${filtered.length ? '?' + new URLSearchParams(filtered).toString() : ''}`
}

export default async function RegistrationsPage({ searchParams }: PageProps) {
  const { status = 'all', search = '', page = '1', eventId = '' } = await searchParams

  const [registrationsResult, events] = await Promise.all([
    getAllRegistrations({
      attendance_status: status,
      search,
      eventId: eventId || undefined,
      page: Number(page),
      pageSize: 30,
    }),
    getAllEvents(),
  ])

  const { data: registrations, total, totalPages, page: currentPage } = registrationsResult

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-display-sm">Inscripción</h1>
          <p className="text-foreground-secondary mt-1">
            {total} inscripcion{total !== 1 ? 'es' : ''} en total
          </p>
        </div>
        <a
          href="/api/export/registrations"
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </a>
      </div>

      {/* Filter Bar */}
      <div className="card-elevated p-4 mb-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form className="flex-1 flex gap-3" method="GET">
            {eventId && <input type="hidden" name="eventId" value={eventId} />}
            {status !== 'all' && <input type="hidden" name="status" value={status} />}
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre, email..."
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Buscar
            </button>
          </form>
          {/* Event filter dropdown */}
          <EventFilterSelect
            events={events.map((e) => ({ id: e.id, title: e.title }))}
            currentEventId={eventId}
            baseParams={{ status, search }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={buildUrl({ status: key, search, eventId })}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                status === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-border hover:border-primary-200 text-foreground-secondary'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden overflow-x-auto">
        {registrations.length === 0 ? (
          <div className="p-12 text-center text-foreground-secondary">
            <svg className="w-12 h-12 mx-auto mb-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <p className="font-medium">No hay inscripciones</p>
            <p className="text-sm mt-1">No se encontraron inscripciones con los filtros actuales</p>
          </div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Asistente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider hidden md:table-cell">Evento</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{reg.first_name} {reg.last_name}</p>
                    <p className="text-xs text-foreground-secondary">{reg.email}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {reg.event ? (
                      <Link
                        href={`/events/${reg.event.id}/registrations`}
                        className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {reg.event.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-foreground-secondary">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[reg.attendance_status] ?? ''}`}>
                      {STATUS_LABELS[reg.attendance_status] ?? reg.attendance_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-foreground-secondary">
                      {new Date(reg.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/registrations/${reg.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-foreground-secondary">
              Mostrando {((currentPage - 1) * 30) + 1}–{Math.min(currentPage * 30, total)} de {total}
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildUrl({ status, search, eventId, page: String(currentPage - 1) })}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm hover:border-primary-200 transition-colors"
                >
                  Anterior
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={buildUrl({ status, search, eventId, page: String(currentPage + 1) })}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm hover:border-primary-200 transition-colors"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
