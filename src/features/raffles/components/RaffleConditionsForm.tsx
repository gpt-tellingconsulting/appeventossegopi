'use client'

import { useTransition, useState } from 'react'
import { updateRaffleConditionsAction } from '@/actions/prizes'

interface Props {
  eventId: string
  defaultValue: string
}

export function RaffleConditionsForm({ eventId, defaultValue }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateRaffleConditionsAction(eventId, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form action={handleSubmit} className="card-elevated p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="font-semibold text-foreground">Condiciones del Sorteo</h3>
      </div>
      <p className="text-sm text-foreground-secondary">
        Define las condiciones y normativa del sorteo. Este texto se mostrara en la pagina publica del evento junto a los premios.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <textarea
        name="raffle_conditions"
        rows={6}
        defaultValue={defaultValue}
        placeholder="Ej: El sorteo de regalos se llevara a cabo entre aquellas empresas que realicen pedidos de compra durante el periodo de promociones especiales..."
        className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar condiciones'}
        </button>
        {saved && (
          <span className="text-sm text-success-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardado
          </span>
        )}
      </div>
    </form>
  )
}
