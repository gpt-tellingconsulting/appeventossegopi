import Link from 'next/link'
import type { Event } from '@/types/database'

interface Props {
  events: Event[]
  currentSlug: string
}

export function UpcomingEventsSection({ events, currentSlug }: Props) {
  // Filter out the current event
  const otherEvents = events.filter(e => e.slug !== currentSlug)

  if (otherEvents.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Agenda
          </span>
          <h2 className="text-display-sm text-foreground mb-3">
            Proximos Eventos
          </h2>
          <p className="text-foreground-secondary text-body-md max-w-2xl mx-auto">
            Descubre otros eventos que pueden interesarte
          </p>
        </div>

        <div className={`grid gap-6 ${otherEvents.length === 1 ? 'max-w-lg mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {otherEvents.map((evt) => {
            const eventDate = new Date(evt.event_date)
            const formattedDate = eventDate.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })

            return (
              <Link
                key={evt.id}
                href={`/eventos/${evt.slug}`}
                className="group bg-white rounded-2xl border border-border-light shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {evt.status === 'published' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-success-50 text-success-700 text-xs font-semibold">
                        Inscripcion abierta
                      </span>
                    )}
                    {evt.status === 'closed' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        Inscripcion cerrada
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary-600 transition-colors">
                    {evt.title}
                  </h3>

                  {evt.subtitle && (
                    <p className="text-foreground-secondary text-sm mb-4 line-clamp-2">
                      {evt.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {evt.city}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Ver detalles
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
