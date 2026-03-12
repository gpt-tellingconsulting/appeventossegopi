'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrationSchema, phoneCountryCodes } from '../types/schemas'
import type { Event } from '@/types/database'

interface RegistrationFormProps {
  event: Event
}

interface FieldErrors {
  [key: string]: string[] | undefined
}

export function RegistrationForm({ event }: RegistrationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setServerError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      phoneCountryCode: formData.get('phoneCountryCode') as string,
      company: formData.get('company') as string,
      position: (formData.get('position') as string) || undefined,
      companyCif: (formData.get('companyCif') as string) || undefined,
      invitationNumber: (formData.get('invitationNumber') as string) || undefined,
      eventId: event.id,
      privacyAccepted: formData.get('privacyAccepted') === 'on',
      commercialAccepted: formData.get('commercialAccepted') === 'on',
      raffleAccepted: formData.get('raffleAccepted') === 'on',
      turnstileToken: 'dev-bypass', // TODO: Integrate real Turnstile widget
    }

    // Validacion client-side
    const parsed = registrationSchema.safeParse(data)
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as FieldErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setServerError(result.error || 'Error al procesar la inscripción')
        setIsSubmitting(false)
        return
      }

      const confirmParams = new URLSearchParams({
        n: data.firstName + ' ' + data.lastName,
        e: data.email,
      })
      router.push(`/eventos/${event.slug}/confirmacion?${confirmParams.toString()}`)
    } catch {
      setServerError('Error de conexión. Inténtalo de nuevo.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="p-4 rounded-xl bg-error-50 border border-error-500/20 text-error-700 text-sm">
          {serverError}
        </div>
      )}

      {/* Nombre y Apellidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">Nombre *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="Juan"
          />
          {fieldErrors.firstName && <p className="text-error-600 text-xs mt-1">{fieldErrors.firstName[0]}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">Apellidos *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="García López"
          />
          {fieldErrors.lastName && <p className="text-error-600 text-xs mt-1">{fieldErrors.lastName[0]}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="juan@empresa.es"
        />
        {fieldErrors.email && <p className="text-error-600 text-xs mt-1">{fieldErrors.email[0]}</p>}
      </div>

      {/* Telefono */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Teléfono móvil *</label>
        <div className="flex gap-2">
          <select
            name="phoneCountryCode"
            defaultValue="+34"
            className="w-24 sm:w-36 px-2 sm:px-3 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
          >
            {phoneCountryCodes.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="612345678"
          />
        </div>
        {fieldErrors.phone && <p className="text-error-600 text-xs mt-1">{fieldErrors.phone[0]}</p>}
      </div>

      {/* Empresa y Cargo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1.5">Empresa / Organización *</label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="Mi Empresa S.L."
          />
          {fieldErrors.company && <p className="text-error-600 text-xs mt-1">{fieldErrors.company[0]}</p>}
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium mb-1.5">Cargo</label>
          <input
            id="position"
            name="position"
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="Director Comercial"
          />
        </div>
      </div>

      {/* CIF Empresa y Numero de Invitacion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="companyCif" className="block text-sm font-medium mb-1.5">
            CIF Empresa <span className="text-foreground-muted font-normal">(opcional)</span>
          </label>
          <input
            id="companyCif"
            name="companyCif"
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="B12345678"
          />
        </div>

        <div>
          <label htmlFor="invitationNumber" className="block text-sm font-medium mb-1.5">
            N.º de Invitación <span className="text-foreground-muted font-normal">(opcional)</span>
          </label>
          <input
            id="invitationNumber"
            name="invitationNumber"
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="INV-001"
          />
        </div>
      </div>

      {/* Consentimientos RGPD */}
      <div className="space-y-4 p-5 rounded-xl bg-primary-50/50 border border-primary-100">
        <h3 className="text-sm font-semibold text-primary-800">Protección de Datos</h3>

        {/* Politica de Privacidad - OBLIGATORIO */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="privacyAccepted"
            className="mt-1 w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20"
          />
          <span className="text-sm text-foreground-secondary">
            He leido y acepto la{' '}
            <a href="/privacidad" target="_blank" className="text-primary-600 underline hover:text-primary-700">
              Política de Privacidad
            </a>
            {' '}* (obligatorio)
          </span>
        </label>
        {fieldErrors.privacyAccepted && <p className="text-error-600 text-xs">{fieldErrors.privacyAccepted[0]}</p>}

        {/* Comunicaciones Comerciales - OPCIONAL */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="commercialAccepted"
            className="mt-1 w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20"
          />
          <span className="text-sm text-foreground-secondary">
            Acepto recibir comunicaciones comerciales y promociones de próximos eventos.
            <span className="text-foreground-muted"> (opcional)</span>
          </span>
        </label>

        {/* Participacion en Sorteos - OPCIONAL */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="raffleAccepted"
            className="mt-1 w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20"
          />
          <span className="text-sm text-foreground-secondary">
            Quiero participar en los sorteos de premios del evento.
            <span className="text-foreground-muted"> (opcional)</span>
          </span>
        </label>

        {/* Aviso de aforo y limite de asistentes */}
        <p className="text-xs text-foreground-muted leading-relaxed mt-2">
          Por motivos de aforo, la empresa se reserva el derecho de admisión hasta completar el número máximo de participantes permitidos en el evento.
          Asimismo, por razones operativas, se establece un límite máximo de dos (2) asistentes por empresa. En caso de requerir invitaciones adicionales, estas deberán solicitarse a través del correo electrónico{' '}
          <a href="mailto:eventos@segopi.es" className="text-primary-500 underline">eventos@segopi.es</a>, quedando sujetas a valoración y posible aprobación por parte de la organización.
        </p>
      </div>

      {/* TODO: Cloudflare Turnstile widget here */}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
      >
        {isSubmitting ? 'Procesando...' : 'Completar Inscripción'}
      </button>

      <p className="text-xs text-foreground-muted text-center">
        Tus datos se trataran conforme al RGPD. Puedes ejercer tus derechos contactando a{' '}
        <a href="mailto:rgpd@tellingconsulting.es" className="text-primary-500">rgpd@tellingconsulting.es</a>
      </p>
    </form>
  )
}
