'use client'

import { useState, useRef } from 'react'

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  return match?.[1] ?? ''
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match?.[1] ?? ''
}

interface VideoFormSectionProps {
  initialVideoUrl: string
  eventId: string
  inputClass: string
  onUploadingChange: (uploading: boolean) => void
}

export function VideoFormSection({ initialVideoUrl, eventId, inputClass, onUploadingChange }: VideoFormSectionProps) {
  const initialMode = initialVideoUrl
    ? (initialVideoUrl.includes('youtube') || initialVideoUrl.includes('youtu.be') || initialVideoUrl.includes('vimeo')
      ? 'url' : 'upload')
    : 'url'
  const [videoMode, setVideoMode] = useState<'url' | 'upload'>(initialMode)
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState('')
  const [videoUploadProgress, setVideoUploadProgress] = useState('')
  const videoFileInputRef = useRef<HTMLInputElement>(null)

  async function handleVideoUpload(file: File) {
    setVideoUploadError('')
    setVideoUploading(true)
    onUploadingChange(true)
    setVideoUploadProgress('Subiendo video...')

    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('eventId', eventId)

    try {
      const res = await fetch('/api/upload/event-video', {
        method: 'POST',
        body: uploadData,
      })
      const result = await res.json()

      if (!res.ok) {
        setVideoUploadError(result.error || 'Error al subir el video')
        return
      }

      setVideoUrl(result.url)
      setVideoUploadProgress('')
    } catch {
      setVideoUploadError('Error de conexion al subir el video')
    } finally {
      setVideoUploading(false)
      onUploadingChange(false)
    }
  }

  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    handleVideoUpload(file)
  }

  function clearVideo() {
    setVideoUrl('')
    setVideoUploadProgress('')
    if (videoFileInputRef.current) videoFileInputRef.current.value = ''
  }

  return (
    <div className="card-elevated p-6 space-y-6">
      <h2 className="text-display-xs">Video del Evento</h2>
      <p className="text-sm text-foreground-secondary -mt-3">
        Anade un video que se mostrara en la landing publica del evento
      </p>

      <input type="hidden" name="video_url" value={videoUrl} />

      <div className="flex rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => { setVideoMode('url'); clearVideo() }}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            videoMode === 'url'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-foreground-secondary hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          URL de video
        </button>
        <button
          type="button"
          onClick={() => { setVideoMode('upload'); setVideoUrl('') }}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            videoMode === 'upload'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-foreground-secondary hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Subir video
        </button>
      </div>

      {videoMode === 'url' && (
        <div>
          <label htmlFor="video_url_input" className="block text-sm font-medium mb-2">URL del video</label>
          <input
            id="video_url_input"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={inputClass}
            placeholder="https://www.youtube.com/watch?v=... o URL directa de video"
          />
          <p className="text-xs text-foreground-muted mt-1">
            Soporta YouTube, Vimeo o URLs directas de video (MP4, WebM)
          </p>
        </div>
      )}

      {videoMode === 'upload' && (
        <div className="space-y-3">
          {videoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-border bg-black">
              <video
                src={videoUrl}
                className="w-full h-48 sm:h-64 object-contain"
                controls
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={clearVideo}
                  className="px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              disabled={videoUploading}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary-500 hover:bg-primary-50/50 transition-colors cursor-pointer"
            >
              {videoUploading ? (
                <div className="flex items-center gap-2 text-foreground-secondary text-sm">
                  <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                  {videoUploadProgress}
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Subir video del evento</p>
                    <p className="text-xs text-foreground-muted mt-1">MP4, WebM, MOV o AVI. Maximo 100MB.</p>
                  </div>
                </>
              )}
            </button>
          )}

          <input
            ref={videoFileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            onChange={handleVideoFileChange}
            className="hidden"
          />

          {videoUploadError && (
            <p className="text-sm text-error-600">{videoUploadError}</p>
          )}
        </div>
      )}

      {/* URL preview */}
      {videoMode === 'url' && videoUrl && (
        <div className="rounded-xl overflow-hidden border border-border bg-black">
          {videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/') ? (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
              className="w-full h-48 sm:h-64"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : videoUrl.includes('vimeo.com/') ? (
            <iframe
              src={`https://player.vimeo.com/video/${extractVimeoId(videoUrl)}`}
              className="w-full h-48 sm:h-64"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={videoUrl} className="w-full h-48 sm:h-64 object-contain" controls />
          )}
        </div>
      )}
    </div>
  )
}
