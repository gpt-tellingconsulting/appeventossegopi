import Link from 'next/link'
import { getAccessibleEvents } from '@/features/events/services/eventService'
import { EventStatusBadge } from '@/features/events/components/EventStatusBadge'

export default async function EventsPage() {
  const events = await getAccessibleEvents()

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display-sm">Eventos</h1>
          <p className="text-foreground-secondary mt-1">Gestiona tus ferias y eventos</p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Evento
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-display-xs mb-2">No hay eventos</h3>
          <p className="text-foreground-secondary mb-6">Crea tu primer evento para comenzar</p>
          <Link
            href="/events/new"
            className="inline-flex items-center px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            Crear Evento
          </Link>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-4 sm:px-6 py-4 text-body-sm font-medium text-foreground-secondary">Evento</th>
                <th className="text-left px-4 sm:px-6 py-4 text-body-sm font-medium text-foreground-secondary hidden sm:table-cell">Fecha</th>
                <th className="text-left px-4 sm:px-6 py-4 text-body-sm font-medium text-foreground-secondary hidden md:table-cell">Ciudad</th>
                <th className="text-left px-4 sm:px-6 py-4 text-body-sm font-medium text-foreground-secondary">Estado</th>
                <th className="text-right px-4 sm:px-6 py-4 text-body-sm font-medium text-foreground-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border-light hover:bg-primary-50/30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <Link href={`/events/${event.id}`} className="font-medium hover:text-primary-600 transition-colors">
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-foreground-secondary hidden sm:table-cell">
                    {new Date(event.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-foreground-secondary hidden md:table-cell">{event.city}</td>
                  <td className="px-4 sm:px-6 py-4"><EventStatusBadge status={event.status} /></td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-sm text-primary-500 hover:text-primary-700 font-medium"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/events/${event.id}/registrations`}
                        className="text-sm text-foreground-secondary hover:text-foreground font-medium hidden sm:inline"
                      >
                        Inscripciones
                      </Link>
                      <Link
                        href={`/events/${event.id}/checkin`}
                        className="text-sm text-accent-500 hover:text-accent-700 font-medium hidden sm:inline"
                      >
                        Check-in
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
