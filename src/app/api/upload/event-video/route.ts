import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const eventId = formData.get('eventId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado archivo' }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Usa MP4, WebM, MOV o AVI.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Maximo 100MB.' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
    const timestamp = Date.now()
    const filePath = `${eventId}/${timestamp}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('event-videos')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir el video: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-videos')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
