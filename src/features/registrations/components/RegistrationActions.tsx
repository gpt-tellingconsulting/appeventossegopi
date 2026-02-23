'use client'

import { useState, useTransition } from 'react'
import {
  updateAttendanceStatusAction,
  updateNotesAction,
  updateTagsAction,
  updateLeadStatusAction,
  deleteRegistrationAction,
} from '@/actions/registrations'
import type { AttendanceStatus, LeadStatus } from '@/types/database'

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'registered', label: 'Registrado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'attended', label: 'Asistio' },
  { value: 'no_show', label: 'No asistio' },
  { value: 'cancelled', label: 'Cancelado' },
]

const LEAD_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'converted', label: 'Convertido' },
  { value: 'lost', label: 'Perdido' },
]

interface AttendanceStatusFormProps {
  registrationId: string
  currentStatus: string
}

export function AttendanceStatusForm({ registrationId, currentStatus }: AttendanceStatusFormProps) {
  const [selected, setSelected] = useState<AttendanceStatus>(currentStatus as AttendanceStatus)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleChange(value: AttendanceStatus) {
    setSelected(value)
    setMessage(null)
    startTransition(async () => {
      const result = await updateAttendanceStatusAction(registrationId, value)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        setSelected(currentStatus as AttendanceStatus)
      } else {
        setMessage({ type: 'success', text: 'Estado actualizado' })
      }
    })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground-secondary mb-2">Estado de asistencia</label>
      <div className="flex flex-wrap gap-2">
        {ATTENDANCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              selected === opt.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-background border border-border hover:border-primary-200 text-foreground-secondary'
            } disabled:opacity-60`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {message && (
        <p className={`text-xs mt-2 ${message.type === 'success' ? 'text-success-600' : 'text-error-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

interface LeadStatusFormProps {
  registrationId: string
  currentStatus: string
}

export function LeadStatusForm({ registrationId, currentStatus }: LeadStatusFormProps) {
  const [selected, setSelected] = useState<LeadStatus>(currentStatus as LeadStatus)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleChange(value: LeadStatus) {
    setSelected(value)
    setMessage(null)
    startTransition(async () => {
      const result = await updateLeadStatusAction(registrationId, value)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        setSelected(currentStatus as LeadStatus)
      } else {
        setMessage({ type: 'success', text: 'Lead status actualizado' })
      }
    })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground-secondary mb-2">Estado lead (CRM)</label>
      <div className="flex flex-wrap gap-2">
        {LEAD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              selected === opt.value
                ? 'bg-accent-500 text-white shadow-sm'
                : 'bg-background border border-border hover:border-accent-200 text-foreground-secondary'
            } disabled:opacity-60`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {message && (
        <p className={`text-xs mt-2 ${message.type === 'success' ? 'text-success-600' : 'text-error-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

interface NotesFormProps {
  registrationId: string
  initialNotes: string | null
}

export function NotesForm({ registrationId, initialNotes }: NotesFormProps) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleSave() {
    setMessage(null)
    startTransition(async () => {
      const result = await updateNotesAction(registrationId, notes)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Notas guardadas' })
      }
    })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground-secondary mb-2">Notas internas</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Notas internas del equipo (no visibles para el asistente)..."
        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        {message ? (
          <p className={`text-xs ${message.type === 'success' ? 'text-success-600' : 'text-error-600'}`}>
            {message.text}
          </p>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {isPending ? 'Guardando...' : 'Guardar notas'}
        </button>
      </div>
    </div>
  )
}

interface TagsFormProps {
  registrationId: string
  initialTags: string[]
}

export function TagsForm({ registrationId, initialTags }: TagsFormProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function addTag() {
    const trimmed = input.trim()
    if (!trimmed || tags.includes(trimmed)) return
    const newTags = [...tags, trimmed]
    setTags(newTags)
    setInput('')
    saveTags(newTags)
  }

  function removeTag(tag: string) {
    const newTags = tags.filter((t) => t !== tag)
    setTags(newTags)
    saveTags(newTags)
  }

  function saveTags(newTags: string[]) {
    setMessage(null)
    startTransition(async () => {
      const result = await updateTagsAction(registrationId, newTags)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Etiquetas actualizadas' })
      }
    })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground-secondary mb-2">Etiquetas</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              disabled={isPending}
              className="hover:text-primary-900 transition-colors"
            >
              x
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-foreground-muted">Sin etiquetas</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Nueva etiqueta..."
          className="flex-1 px-3 py-2 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
        />
        <button
          onClick={addTag}
          disabled={isPending || !input.trim()}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Anadir
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 ${message.type === 'success' ? 'text-success-600' : 'text-error-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

// Delete registration with confirmation modal

interface DeleteRegistrationButtonProps {
  registrationId: string
  attendeeName: string
}

export function DeleteRegistrationButton({ registrationId, attendeeName }: DeleteRegistrationButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteRegistrationAction(registrationId)
      if (result?.error) {
        setError(result.error)
        setShowConfirm(false)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-error-200 rounded-xl text-sm font-medium text-error-600 hover:bg-error-50 hover:border-error-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Eliminar inscripcion
      </button>

      {error && (
        <p className="text-xs text-error-600 mt-2 text-center">{error}</p>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Eliminar inscripcion</h3>
                <p className="text-sm text-foreground-secondary">Esta accion no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-foreground-secondary mb-6">
              Se eliminara la inscripcion de <strong>{attendeeName}</strong> junto
              con todos sus consentimientos y datos asociados.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-error-600 hover:bg-error-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
