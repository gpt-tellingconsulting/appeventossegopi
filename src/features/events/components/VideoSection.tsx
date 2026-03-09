interface VideoSectionProps {
  videoUrl: string
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  return match?.[1] ?? null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match?.[1] ?? null
}

export function VideoSection({ videoUrl }: VideoSectionProps) {
  const youtubeId = extractYouTubeId(videoUrl)
  const vimeoId = extractVimeoId(videoUrl)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-display-sm mb-8 text-center">Video del Evento</h2>
        <div className="rounded-2xl overflow-hidden shadow-lg bg-black aspect-video">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?loop=1&playlist=${youtubeId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video del evento"
            />
          ) : vimeoId ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Video del evento"
            />
          ) : (
            <video
              src={videoUrl}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
            >
              Tu navegador no soporta la reproduccion de video.
            </video>
          )}
        </div>
      </div>
    </section>
  )
}
