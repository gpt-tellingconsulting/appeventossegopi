'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import type { EventPrize } from '@/types/database'
import { createPrizeAction, updatePrizeAction, deletePrizeAction } from '@/actions/prizes'

interface Props {
  prizes: EventPrize[]
  eventId: string
}

export function PrizeList({ prizes, eventId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createPrizeAction(eventId, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setShowForm(false)
      }
    })
  }

  function handleUpdate(prizeId: string, formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updatePrizeAction(prizeId, eventId, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditingId(null)
      }
    })
  }

  function handleDelete(prizeId: string) {
    if (!confirm('¿Eliminar este premio?')) return
    setError(null)
    startTransition(async () => {
      const result = await deletePrizeAction(prizeId, eventId)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Prize cards */}
      {prizes.length === 0 && !showForm && (
        <div className="card-elevated p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3 className="heading text-lg mb-2">No hay premios configurados</h3>
          <p className="text-foreground-secondary text-sm mb-4">
            Anade premios para mostrarlos en la landing del evento y promocionar los sorteos
          </p>
        </div>
      )}

      {prizes.map((prize) =>
        editingId === prize.id ? (
          <PrizeForm
            key={prize.id}
            prize={prize}
            eventId={eventId}
            isPending={isPending}
            onSubmit={(fd) => handleUpdate(prize.id, fd)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={prize.id} className="card-elevated p-5">
            <div className="flex gap-4">
              {prize.image_url && (
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={prize.image_url}
                    alt={prize.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{prize.name}</h3>
                    {prize.description && (
                      <p className="text-sm text-foreground-secondary mt-0.5">{prize.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!prize.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Oculto</span>
                    )}
                    {prize.estimated_value && (
                      <span className="text-sm font-semibold text-primary-600">
                        {Number(prize.estimated_value).toFixed(2)} EUR
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingId(prize.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(prize.id)}
                    disabled={isPending}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* New prize form */}
      {showForm ? (
        <PrizeForm
          eventId={eventId}
          isPending={isPending}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-foreground-secondary hover:border-primary-400 hover:text-primary-600 transition-colors"
        >
          + Anadir premio
        </button>
      )}
    </div>
  )
}

// ============================================
// Prize Form (inline) with image upload
// ============================================

interface PrizeFormProps {
  prize?: EventPrize
  eventId: string
  isPending: boolean
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}

function PrizeForm({ prize, eventId, isPending, onSubmit, onCancel }: PrizeFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(prize?.image_url ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageUrlRef = useRef<HTMLInputElement>(null)
  const fileInputId = `prize-image-${prize?.id ?? 'new'}`

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageUrlRef.current) imageUrlRef.current.value = ''
  }

  async function handleSubmit(formData: FormData) {
    setUploadError(null)

    // If there's a new file, upload it first
    if (imageFile) {
      setUploading(true)
      try {
        const uploadData = new FormData()
        uploadData.append('file', imageFile)
        uploadData.append('eventId', eventId)

        const res = await fetch('/api/upload/prize-image', {
          method: 'POST',
          body: uploadData,
        })

        const result = await res.json()

        if (!res.ok) {
          setUploadError(result.error || 'Error al subir imagen')
          setUploading(false)
          return
        }

        // Set the uploaded URL in formData
        formData.set('image_url', result.url)
      } catch {
        setUploadError('Error de conexión al subir la imagen')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    onSubmit(formData)
  }

  const isBusy = isPending || uploading

  return (
    <form action={handleSubmit} className="card-elevated p-5 space-y-4 border-2 border-primary-200">
      <h3 className="font-semibold text-foreground">
        {prize ? 'Editar premio' : 'Nuevo premio'}
      </h3>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nombre del premio *</label>
          <input
            name="name"
            required
            defaultValue={prize?.name}
            placeholder="iPad Pro 12.9"
            className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Valor estimado (EUR)</label>
          <input
            name="estimated_value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={prize?.estimated_value ? Number(prize.estimated_value) : undefined}
            placeholder="999.99"
            className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Descripcion</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={prize?.description ?? ''}
          placeholder="Descripcion detallada del premio..."
          className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Imagen del premio</label>
        <input type="hidden" name="image_url" ref={imageUrlRef} defaultValue={prize?.image_url ?? ''} />

        {imagePreview ? (
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-border-light">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor={fileInputId}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
              >
                Cambiar imagen
              </label>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Quitar imagen
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={fileInputId}
            className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-sm text-foreground-secondary hover:border-primary-400 hover:text-primary-600 transition-colors flex flex-col items-center gap-1 cursor-pointer"
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            Seleccionar imagen (JPG, PNG, WebP - Max 5MB)
          </label>
        )}

        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={handleFileChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Orden</label>
          <input
            name="sort_order"
            type="number"
            min="0"
            defaultValue={prize?.sort_order ?? 0}
            className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-end pb-1">
          <div className="flex items-center gap-2">
            <input type="hidden" name="is_active" value="false" />
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={prize?.is_active ?? true}
              value="true"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="text-sm text-foreground">Visible en la landing</label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isBusy}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? 'Subiendo imagen...' : isPending ? 'Guardando...' : prize ? 'Actualizar' : 'Crear premio'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-foreground text-sm font-medium rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
