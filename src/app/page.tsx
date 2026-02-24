import Link from 'next/link'
import { PublicPageWrapper } from '@/components/public/PublicPageWrapper'
import { HeroSection } from '@/components/public/HeroSection'
import { CTABanner } from '@/components/public/CTABanner'
import { SectionHeading } from '@/components/public/SectionHeading'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/types/database'
import { CalendarIcon, MapPinIcon, ArrowRightIcon } from '@/components/public/icons'

// ============================================================
// Helpers
// ============================================================

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function truncateDescription(text: string, maxLength = 140): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

// ============================================================
// Event Card Component
// ============================================================

function EventCard({ event }: { event: Event }) {
  const isPublished = event.status === 'published'

  return (
    <article className="card-elevated flex flex-col overflow-hidden hover:shadow-elevated transition-shadow duration-200 group">
      {/* Status badge strip */}
      <div className={`h-1 w-full ${isPublished ? 'bg-gradient-primary' : 'bg-gray-200'}`} />

      <div className="flex flex-col flex-1 p-6">
        {/* Status badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-body-xs font-semibold uppercase tracking-wide ${
              event.status === 'published'
                ? 'bg-primary-50 text-primary-700'
                : event.status === 'closed'
                ? 'bg-error-100 text-error-700'
                : event.status === 'completed'
                ? 'bg-success-100 text-success-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {event.status === 'published'
              ? 'Inscripcion abierta'
              : event.status === 'closed'
              ? 'Inscripcion cerrada'
              : event.status === 'completed'
              ? 'Finalizado'
              : event.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-display-xs text-foreground mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Subtitle */}
        {event.subtitle && (
          <p className="text-body-sm text-foreground-secondary mb-3 line-clamp-1">
            {event.subtitle}
          </p>
        )}

        {/* Description excerpt */}
        <p className="text-body-sm text-foreground-secondary leading-relaxed mb-4 flex-1">
          {truncateDescription(event.description)}
        </p>

        {/* Meta: date + city */}
        <div className="flex flex-col gap-2 mb-5 border-t border-border-light pt-4">
          <div className="flex items-center gap-2 text-body-sm text-foreground-secondary">
            <CalendarIcon className="w-4 h-4 text-primary-400 shrink-0" />
            <span>{formatEventDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-foreground-secondary">
            <MapPinIcon className="w-4 h-4 text-primary-400 shrink-0" />
            <span className="truncate">{event.city}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/eventos/${event.slug}`}
          className="inline-flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold text-body-sm py-3 px-4 rounded-xl transition-colors"
          aria-label={`Ver detalles del evento: ${event.title}`}
        >
          Ver detalles
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </article>
  )
}

// ============================================================
// Events Section (fetches from Supabase server-side)
// ============================================================

async function EventsSection() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true })
    .limit(9)

  if (error) {
    return (
      <section id="eventos" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Próximos eventos"
            title="Agenda de Eventos"
            subtitle="Ferias y eventos para profesionales del Grupo Segopi."
          />
          <div className="mt-12 text-center py-16 bg-error-50 rounded-2xl border border-error-100">
            <p className="text-body-md text-error-600">
              No se pudieron cargar los eventos. Por favor, inténtalo de nuevo más tarde.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const typedEvents = (events ?? []) as Event[]

  return (
    <section id="eventos" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Próximos eventos"
          title="Agenda de Eventos"
          subtitle="Ferias y eventos para profesionales del Grupo Segopi."
        />

        {typedEvents.length === 0 ? (
          <div className="mt-12 text-center py-20">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="font-heading text-display-xs text-foreground mb-2">
              Próximos eventos en preparación
            </h3>
            <p className="text-body-md text-foreground-secondary max-w-md mx-auto">
              Estamos preparando la próxima edición. Vuelve pronto o contacta con nosotros para más información.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 mt-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Contactar
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {typedEvents.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-body-md transition-colors"
            >
              Ver todos los eventos
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ============================================================
// Homepage
// ============================================================

export default function HomePage() {
  return (
    <PublicPageWrapper>
      <HeroSection />
      <EventsSection />
      <CTABanner />
    </PublicPageWrapper>
  )
}
