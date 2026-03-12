import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { siteConfig } from '@/config/siteConfig'
import { getEventBySlug } from '@/features/events/services/eventService'
import { getActivePrizesByEvent } from '@/features/raffles/services/prizeService'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ n?: string; e?: string }>
}

export default async function ConfirmationPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { n: fullName, e: email } = await searchParams
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const prizes = await getActivePrizesByEvent(event.id)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-display-sm mb-3">Inscripcion exitosa</h1>
        <p className="text-foreground-secondary mb-2">
          {fullName && email
            ? <>Estimado/a <strong>{fullName}</strong>, muchas gracias por inscribirte. Hemos enviado un email de confirmacion a tu correo <strong>{email}</strong>.</>
            : <>Gracias por inscribirte. Hemos enviado un email de confirmacion a tu correo electronico.</>
          }
        </p>
        <p className="text-foreground-muted text-sm mb-8">
          Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y confirma tu email para completar el proceso.
        </p>

        <div className="card-elevated p-6 mb-6 text-left">
          <h3 className="font-heading font-semibold mb-3">Proximos pasos:</h3>
          <ul className="space-y-3 text-sm text-foreground-secondary">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Confirma tu email haciendo clic en el enlace que te hemos enviado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>Recibiras un email con los detalles del evento y archivo de calendario</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>48 horas antes del evento recibiras un recordatorio con informacion practica</span>
            </li>
          </ul>
        </div>

        {/* Premios del sorteo */}
        {prizes.length > 0 && (
          <div className="card-elevated p-6 mb-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <h3 className="font-heading font-semibold">Premios en juego</h3>
            </div>
            <div className="space-y-3">
              {prizes.map((prize) => (
                <div key={prize.id} className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                  {prize.image_url ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image src={prize.image_url} alt={prize.name} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{prize.name}</p>
                    {prize.estimated_value && (
                      <p className="text-xs text-primary-600 font-medium">
                        Valorado en {Number(prize.estimated_value).toFixed(0)} EUR
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/eventos/${slug}`}
          className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          Volver al evento
        </Link>

        <p className="text-xs text-foreground-muted mt-6">
          &copy; {new Date().getFullYear()} {siteConfig.companyName}
        </p>
      </div>
    </div>
  )
}
