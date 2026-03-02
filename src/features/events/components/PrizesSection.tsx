import Image from 'next/image'
import type { EventPrize } from '@/types/database'

interface Props {
  prizes: EventPrize[]
  raffleConditions?: string | null
}

export function PrizesSection({ prizes, raffleConditions }: Props) {
  if (prizes.length === 0 && !raffleConditions) return null

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-primary-50/50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Sorteos
          </span>
          <h2 className="text-display-sm text-foreground mb-3">
            Premios que puedes ganar
          </h2>
          <p className="text-foreground-secondary text-body-md max-w-2xl mx-auto">
            Al inscribirte en el evento puedes participar en el sorteo de estos increibles premios
          </p>
        </div>

        {prizes.length > 0 && (
          <div className={`grid gap-6 ${prizes.length === 1 ? 'max-w-md mx-auto' : prizes.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="group bg-white rounded-2xl border border-border-light shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                {prize.image_url ? (
                  <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
                    <Image
                      src={prize.image_url}
                      alt={prize.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {prize.estimated_value && (
                      <div className="absolute top-3 right-3 bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        {Number(prize.estimated_value).toFixed(0)} EUR
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    {prize.estimated_value && (
                      <div className="absolute top-3 right-3 bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        {Number(prize.estimated_value).toFixed(0)} EUR
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg mb-1">{prize.name}</h3>
                  {prize.description && (
                    <p className="text-foreground-secondary text-sm leading-relaxed">
                      {prize.description}
                    </p>
                  )}
                  {prize.estimated_value && !prize.image_url && (
                    <p className="mt-2 text-primary-600 font-semibold text-sm">
                      Valorado en {Number(prize.estimated_value).toFixed(2)} EUR
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Condiciones del sorteo */}
        {raffleConditions && (
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-border-light shadow-card p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-semibold text-foreground text-lg">Condiciones del Sorteo</h3>
              </div>
              <p className="text-foreground-secondary text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {raffleConditions}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
