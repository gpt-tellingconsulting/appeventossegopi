import Link from 'next/link'
import { getAccessibleEvents } from '@/features/events/services/eventService'

export default async function DashboardPage() {
  const events = await getAccessibleEvents()
  const publishedCount = events.filter(e => e.status === 'published').length
  const draftCount = events.filter(e => e.status === 'draft').length
  const completedCount = events.filter(e => e.status === 'completed').length

  const upcomingEvents = events
    .filter(e => e.status === 'published' && new Date(e.event_date) >= new Date())
    .slice(0, 5)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-display-sm">Dashboard</h1>
        <p className="text-foreground-secondary mt-1">Vision general de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="text-foreground-secondary text-sm mb-1">Total Eventos</p>
          <p className="text-display-sm">{events.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-foreground-secondary text-sm mb-1">Publicados</p>
          <p className="text-display-sm text-success-600">{publishedCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-foreground-secondary text-sm mb-1">Borradores</p>
          <p className="text-display-sm text-warning-600">{draftCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-foreground-secondary text-sm mb-1">Completados</p>
          <p className="text-display-sm text-primary-600">{completedCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card-elevated p-6">
          <h2 className="text-display-xs mb-4">Acciones Rapidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/events/new"
              className="p-4 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50/30 transition-all text-center"
            >
              <svg className="w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Nuevo Evento</span>
            </Link>
            <Link
              href="/registrations"
              className="p-4 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50/30 transition-all text-center"
            >
              <svg className="w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium">Inscripciones</span>
            </Link>
            <Link
              href="/workflows"
              className="p-4 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50/30 transition-all text-center"
            >
              <svg className="w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Workflows</span>
            </Link>
            <Link
              href="/analytics"
              className="p-4 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50/30 transition-all text-center"
            >
              <svg className="w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium">Analytics</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card-elevated p-6">
          <h2 className="text-display-xs mb-4">Próximos Eventos</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-foreground-secondary text-sm">No hay eventos próximos</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary-50/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600">
                      {new Date(event.event_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-sm text-foreground-secondary">{event.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
