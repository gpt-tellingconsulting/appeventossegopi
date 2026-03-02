'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPrizeAction(eventId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const { error } = await supabase
    .from('event_prizes')
    .insert({
      event_id: eventId,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      estimated_value: formData.get('estimated_value') ? Number(formData.get('estimated_value')) : null,
      sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
      is_active: formData.getAll('is_active').includes('true'),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}/prizes`)
}

export async function updatePrizeAction(prizeId: string, eventId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const { error } = await supabase
    .from('event_prizes')
    .update({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      estimated_value: formData.get('estimated_value') ? Number(formData.get('estimated_value')) : null,
      sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
      is_active: formData.getAll('is_active').includes('true'),
    })
    .eq('id', prizeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}/prizes`)
}

export async function deletePrizeAction(prizeId: string, eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const { error } = await supabase
    .from('event_prizes')
    .delete()
    .eq('id', prizeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}/prizes`)
}

export async function updateRaffleConditionsAction(eventId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  const raffle_conditions = (formData.get('raffle_conditions') as string)?.trim() || null

  const { error } = await supabase
    .from('events')
    .update({ raffle_conditions })
    .eq('id', eventId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}/prizes`)
}
