'use client'

import { useRouter } from 'next/navigation'

interface EventFilterSelectProps {
  events: Array<{ id: string; title: string }>
  currentEventId: string
  baseParams: { status: string; search: string }
}

export function EventFilterSelect({ events, currentEventId, baseParams }: EventFilterSelectProps) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams()
    if (baseParams.status && baseParams.status !== 'all') params.set('status', baseParams.status)
    if (baseParams.search) params.set('search', baseParams.search)
    if (e.target.value) params.set('eventId', e.target.value)
    const qs = params.toString()
    router.push(`/registrations${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex-shrink-0">
      <select
        value={currentEventId}
        onChange={handleChange}
        className="w-full sm:w-56 px-4 py-2 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
      >
        <option value="">Todos los eventos</option>
        {events.map((evt) => (
          <option key={evt.id} value={evt.id}>{evt.title}</option>
        ))}
      </select>
    </div>
  )
}
