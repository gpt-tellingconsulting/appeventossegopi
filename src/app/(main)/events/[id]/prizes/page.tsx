import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/features/events/services/eventService'
import { getPrizesByEvent } from '@/features/raffles/services/prizeService'
import { PrizeList } from '@/features/raffles/components/PrizeList'
import { RaffleConditionsForm } from '@/features/raffles/components/RaffleConditionsForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrizesPage({ params }: PageProps) {
  const { id } = await params
  const event = await getEventById(id)
  if (!event) notFound()

  const prizes = await getPrizesByEvent(id)

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/events/${id}`}
          className="text-sm text-foreground-secondary hover:text-foreground flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al evento
        </Link>
        <div>
          <h1 className="heading text-2xl text-foreground">Premios del Sorteo</h1>
          <p className="text-foreground-secondary mt-1">{event.title}</p>
        </div>
      </div>

      {/* Condiciones del sorteo */}
      <div className="mb-8">
        <RaffleConditionsForm eventId={id} defaultValue={event.raffle_conditions ?? ''} />
      </div>

      <PrizeList prizes={prizes} eventId={id} />
    </div>
  )
}
