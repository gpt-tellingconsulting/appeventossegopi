import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventBySlug, getUpcomingEvents } from '@/features/events/services/eventService'
import { CountdownTimer } from '@/features/events/components/CountdownTimer'
import { BenefitsSection } from '@/features/events/components/BenefitsSection'
import { SpeakersSection } from '@/features/events/components/SpeakersSection'
import { GallerySection } from '@/features/events/components/GallerySection'
import { MapEmbed } from '@/features/events/components/MapEmbed'
import { PrizesSection } from '@/features/events/components/PrizesSection'
import { VideoSection } from '@/features/events/components/VideoSection'
import { UpcomingEventsSection } from '@/features/events/components/UpcomingEventsSection'
import { getActivePrizesByEvent } from '@/features/raffles/services/prizeService'
import { siteConfig } from '@/config/siteConfig'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return { title: 'Evento no encontrado' }

  const title = event.seo_title ?? event.title
  const description = event.seo_description ?? event.description.slice(0, 160)

  return {
    title: `${title} | ${siteConfig.platformName}`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_ES',
      images: event.og_image_url ? [{ url: event.og_image_url }] : undefined,
    },
  }
}

export default async function EventLandingPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event || !['published', 'closed'].includes(event.status)) {
    notFound()
  }

  const eventDate = new Date(event.event_date)
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const isRegistrationOpen = event.status === 'published' &&
    (!event.registration_deadline || new Date(event.registration_deadline) > new Date())

  const [prizes, upcomingEvents] = await Promise.all([
    getActivePrizesByEvent(event.id),
    getUpcomingEvents(),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-primary py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] bg-primary-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-accent-300 font-medium mb-4 uppercase tracking-wider text-sm">
            {event.city} &middot; {formattedDate}
          </p>

          <h1 className="text-display-lg sm:text-display-xl text-white mb-6">
            {event.title}
          </h1>

          {event.subtitle && (
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {event.subtitle}
            </p>
          )}

          {/* Countdown */}
          <div className="mb-10">
            <CountdownTimer
              eventDate={event.event_date}
              eventStartTime={event.event_start_time}
            />
          </div>

          {/* CTA */}
          {isRegistrationOpen && (
            <Link
              href={`/eventos/${event.slug}/inscripcion`}
              className="inline-flex items-center px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              Inscribirme Ahora
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}

          {!isRegistrationOpen && event.status === 'closed' && (
            <p className="text-white/70 text-lg">Las inscripciones estan cerradas</p>
          )}
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-display-sm mb-6">Sobre el evento</h2>
          <div className="prose prose-lg text-foreground-secondary whitespace-pre-line">
            {event.description}
          </div>

          {/* Event details card */}
          <div className="mt-8 card-elevated p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-heading font-semibold">{formattedDate}</p>
              <p className="text-sm text-foreground-secondary">{event.event_start_time?.slice(0, 5)} - {event.event_end_time?.slice(0, 5)}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-heading font-semibold">{event.venue_name}</p>
              <p className="text-sm text-foreground-secondary">{event.city}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-heading font-semibold">Entrada Gratuita</p>
              <p className="text-sm text-foreground-secondary">Plazas limitadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video */}
      {event.video_url && <VideoSection videoUrl={event.video_url} />}

      {/* Benefits */}
      <BenefitsSection benefits={event.benefits} />

      {/* Speakers */}
      <SpeakersSection speakers={event.speakers} />

      {/* Gallery */}
      <GallerySection images={event.gallery_images} />

      {/* Map / Ubicacion */}
      <MapEmbed
        embedUrl={event.google_maps_embed_url}
        venueImageUrl={event.venue_image_url}
        venueName={event.venue_name}
        venueAddress={event.venue_address}
        city={event.city}
      />

      {/* Prizes / Sorteos */}
      <PrizesSection prizes={prizes} raffleConditions={event.raffle_conditions} />

      {/* CTA final */}
      {isRegistrationOpen && (
        <section className="py-16 gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-display-sm text-white mb-4">No te lo pierdas</h2>
            <p className="text-white/70 text-lg mb-8">
              Reserva tu plaza ahora y forma parte de este evento unico
            </p>
            <Link
              href={`/eventos/${event.slug}/inscripcion`}
              className="inline-flex items-center px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              Inscribirme Ahora
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Proximos Eventos */}
      <UpcomingEventsSection events={upcomingEvents} currentSlug={event.slug} />

      {/* Footer minimal */}
      <footer className="bg-primary-900 text-white/60 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {siteConfig.companyName}. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-6 mt-3">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
