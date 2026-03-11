'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { CreateEventDTO, UpdateEventDTO } from '@/types/database'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function createEventAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string || generateSlug(title)

  const dto: CreateEventDTO = {
    slug,
    title,
    subtitle: (formData.get('subtitle') as string) || undefined,
    description: formData.get('description') as string,
    seo_title: (formData.get('seo_title') as string) || undefined,
    seo_description: (formData.get('seo_description') as string) || undefined,
    event_date: formData.get('event_date') as string,
    event_start_time: formData.get('event_start_time') as string,
    event_end_time: formData.get('event_end_time') as string,
    venue_name: formData.get('venue_name') as string,
    venue_address: formData.get('venue_address') as string,
    city: formData.get('city') as string,
    google_maps_embed_url: (formData.get('google_maps_embed_url') as string) || undefined,
    venue_image_url: (formData.get('venue_image_url') as string) || undefined,
    video_url: (formData.get('video_url') as string) || undefined,
    max_capacity: formData.get('max_capacity') ? Number(formData.get('max_capacity')) : undefined,
    company_code: formData.get('company_code') ? Number(formData.get('company_code')) : undefined,
  }

  const { error } = await supabase
    .from('events')
    .insert({ ...dto, created_by: user.id })

  if (error) {
    return { error: error.message }
  }

  redirect('/events')
}

export async function updateEventAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const slug = formData.get('slug') as string
  const dto: UpdateEventDTO = {
    title: formData.get('title') as string,
    slug: slug || undefined,
    subtitle: (formData.get('subtitle') as string) || undefined,
    description: formData.get('description') as string,
    seo_title: (formData.get('seo_title') as string) || undefined,
    seo_description: (formData.get('seo_description') as string) || undefined,
    event_date: formData.get('event_date') as string,
    event_start_time: formData.get('event_start_time') as string,
    event_end_time: formData.get('event_end_time') as string,
    venue_name: formData.get('venue_name') as string,
    venue_address: formData.get('venue_address') as string,
    city: formData.get('city') as string,
    google_maps_embed_url: (formData.get('google_maps_embed_url') as string) || undefined,
    venue_image_url: (formData.get('venue_image_url') as string) || undefined,
    video_url: (formData.get('video_url') as string) || undefined,
    max_capacity: formData.get('max_capacity') ? Number(formData.get('max_capacity')) : undefined,
    company_code: formData.get('company_code') ? Number(formData.get('company_code')) : undefined,
    status: (formData.get('status') as UpdateEventDTO['status']) || undefined,
  }

  const { error } = await supabase
    .from('events')
    .update(dto)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  redirect('/events')
}

export async function publishEventAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const { error } = await supabase
    .from('events')
    .update({ status: 'published' })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  redirect('/events')
}

export async function deleteEventAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  redirect('/events')
}
