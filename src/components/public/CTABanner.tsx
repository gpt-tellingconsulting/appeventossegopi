import Link from 'next/link'
import { CalendarIcon, ArrowRightIcon } from './icons'

export function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-accent py-16 lg:py-20">
      {/* Decorative pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Decorative blur */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 bg-white/20 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/15 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <CalendarIcon className="w-4 h-4 text-white" />
              <span className="text-body-sm text-white font-medium">Próximos eventos</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl text-white font-bold mb-3">
              No te pierdas el próximo evento
            </h2>
            <p className="text-body-lg text-white/85 max-w-xl">
              Inscribete y forma parte de la comunidad de profesionales de la pintura y la construcción en Espana.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              href="/#eventos"
              className="flex items-center gap-2 bg-white text-accent-700 font-bold text-body-md px-8 py-4 rounded-xl hover:bg-accent-50 transition-colors shadow-lg"
            >
              Ver todos los eventos
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/contacto"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
