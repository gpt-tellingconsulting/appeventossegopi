'use client'

import { useState, useRef, useActionState } from 'react'
import { createEventAction, updateEventAction } from '@/actions/events'
import { VideoFormSection } from './VideoFormSection'
import type { Event } from '@/types/database'

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const isEditing = !!event

  const action = isEditing
    ? async (_prevState: unknown, formData: FormData) => updateEventAction(event.id, formData)
    : async (_prevState: unknown, formData: FormData) => createEventAction(formData)

  const [state, formAction, isPending] = useActionState(action, null)

  // Location display mode: 'map' or 'image'
  const initialMode = event?.venue_image_url ? 'image' : 'map'
  const [locationMode, setLocationMode] = useState<'map' | 'image'>(initialMode)
  const [venueImageUrl, setVenueImageUrl] = useState(event?.venue_image_url ?? '')
  const [imagePreview, setImagePreview] = useState(event?.venue_image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Video uploading state (controlled by VideoFormSection)
  const [videoUploading, setVideoUploading] = useState(false)

  async function handleImageUpload(file: File) {
    setUploadError('')
    setUploading(true)

    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('eventId', event?.id ?? 'draft')

    try {
      const res = await fetch('/api/upload/venue-image', {
        method: 'POST',
        body: uploadData,
      })
      const result = await res.json()

      if (!res.ok) {
        setUploadError(result.error || 'Error al subir la imagen')
        return
      }

      setVenueImageUrl(result.url)
      setImagePreview(result.url)
    } catch {
      setUploadError('Error de conexion al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    handleImageUpload(file)
  }

  function clearImage() {
    setVenueImageUrl('')
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all'

  return (
    <form action={formAction} className="space-y-8">
      {state && typeof state === 'object' && 'error' in state && (
        <div className="p-4 rounded-xl bg-error-50 border border-error-500/20 text-error-700 text-sm">
          {(state as { error: string }).error}
        </div>
      )}

      {/* Informacion basica */}
      <div className="card-elevated p-6 space-y-6">
        <h2 className="text-display-xs">Informacion Basica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium mb-2">Titulo del Evento *</label>
            <input id="title" name="title" type="text" required defaultValue={event?.title} className={inputClass} placeholder="Feria de Pintura Valladolid 2026" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="subtitle" className="block text-sm font-medium mb-2">Subtitulo</label>
            <input id="subtitle" name="subtitle" type="text" defaultValue={event?.subtitle ?? ''} className={inputClass} placeholder="Las ultimas tendencias en pintura decorativa" />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">Slug (URL)</label>
            <input id="slug" name="slug" type="text" defaultValue={event?.slug} className={inputClass} placeholder="feria-pintura-valladolid-2026" />
            <p className="text-xs text-foreground-muted mt-1">Se genera automaticamente si se deja vacio</p>
          </div>

          <div>
            <label htmlFor="max_capacity" className="block text-sm font-medium mb-2">Capacidad maxima</label>
            <input id="max_capacity" name="max_capacity" type="number" defaultValue={event?.max_capacity ?? ''} className={inputClass} placeholder="500" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-2">Descripcion *</label>
            <textarea id="description" name="description" required rows={5} defaultValue={event?.description} className={`${inputClass} resize-y`} placeholder="Describe el evento: que es, para quien, que se obtiene asistiendo..." />
          </div>
        </div>
      </div>

      {/* Fecha y ubicacion */}
      <div className="card-elevated p-6 space-y-6">
        <h2 className="text-display-xs">Fecha y Ubicacion</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="event_date" className="block text-sm font-medium mb-2">Fecha *</label>
            <input id="event_date" name="event_date" type="date" required defaultValue={event?.event_date} className={inputClass} />
          </div>
          <div>
            <label htmlFor="event_start_time" className="block text-sm font-medium mb-2">Hora inicio *</label>
            <input id="event_start_time" name="event_start_time" type="time" required defaultValue={event?.event_start_time} className={inputClass} />
          </div>
          <div>
            <label htmlFor="event_end_time" className="block text-sm font-medium mb-2">Hora fin *</label>
            <input id="event_end_time" name="event_end_time" type="time" required defaultValue={event?.event_end_time} className={inputClass} />
          </div>

          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium mb-2">Nombre del lugar *</label>
            <input id="venue_name" name="venue_name" type="text" required defaultValue={event?.venue_name} className={inputClass} placeholder="Centro de Exposiciones" />
          </div>
          <div>
            <label htmlFor="venue_address" className="block text-sm font-medium mb-2">Direccion *</label>
            <input id="venue_address" name="venue_address" type="text" required defaultValue={event?.venue_address} className={inputClass} placeholder="Calle Principal 1" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2">Ciudad *</label>
            <input id="city" name="city" type="text" required defaultValue={event?.city} className={inputClass} placeholder="Valladolid" />
          </div>
        </div>

        {/* Location display mode toggle */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">Ubicacion en la landing</label>

          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => { setLocationMode('map'); clearImage() }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                locationMode === 'map'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-foreground-secondary hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Google Maps
            </button>
            <button
              type="button"
              onClick={() => setLocationMode('image')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                locationMode === 'image'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-foreground-secondary hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imagen personalizada
            </button>
          </div>

          {/* Google Maps URL input */}
          {locationMode === 'map' && (
            <div>
              <label htmlFor="google_maps_embed_url" className="block text-sm font-medium mb-2">URL de Google Maps Embed</label>
              <input
                id="google_maps_embed_url"
                name="google_maps_embed_url"
                type="url"
                defaultValue={event?.google_maps_embed_url ?? ''}
                className={inputClass}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-foreground-muted mt-1">
                Si se deja vacio, se genera automaticamente desde la direccion
              </p>
              <input type="hidden" name="venue_image_url" value="" />
            </div>
          )}

          {/* Venue image upload */}
          {locationMode === 'image' && (
            <div className="space-y-3">
              <input type="hidden" name="venue_image_url" value={venueImageUrl} />
              <input type="hidden" name="google_maps_embed_url" value="" />

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt="Vista previa del lugar"
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Subiendo...
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary-500 hover:bg-primary-50/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Subir imagen del lugar</p>
                    <p className="text-xs text-foreground-muted mt-1">JPG, PNG, WebP o GIF. Maximo 5MB.</p>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadError && (
                <p className="text-sm text-error-600">{uploadError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video */}
      <VideoFormSection
        initialVideoUrl={event?.video_url ?? ''}
        eventId={event?.id ?? 'draft'}
        inputClass={inputClass}
        onUploadingChange={setVideoUploading}
      />

      {/* SEO */}
      <div className="card-elevated p-6 space-y-6">
        <h2 className="text-display-xs">SEO y Redes Sociales</h2>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="seo_title" className="block text-sm font-medium mb-2">Titulo SEO</label>
            <input id="seo_title" name="seo_title" type="text" defaultValue={event?.seo_title ?? ''} className={inputClass} placeholder="Se usa el titulo del evento si se deja vacio" />
          </div>
          <div>
            <label htmlFor="seo_description" className="block text-sm font-medium mb-2">Meta Descripcion</label>
            <textarea id="seo_description" name="seo_description" rows={2} defaultValue={event?.seo_description ?? ''} className={`${inputClass} resize-y`} placeholder="Descripcion para buscadores (max 160 caracteres)" />
          </div>
        </div>
      </div>

      {/* Status (solo en edicion) */}
      {isEditing && (
        <div className="card-elevated p-6 space-y-6">
          <h2 className="text-display-xs">Estado</h2>
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">Estado del evento</label>
            <select id="status" name="status" defaultValue={event.status} className={inputClass}>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="closed">Inscripciones cerradas</option>
              <option value="completed">Finalizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || uploading || videoUploading}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-xl font-medium transition-colors"
        >
          {isPending ? 'Guardando...' : uploading ? 'Subiendo imagen...' : videoUploading ? 'Subiendo video...' : isEditing ? 'Actualizar Evento' : 'Crear Evento'}
        </button>
      </div>
    </form>
  )
}
