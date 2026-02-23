'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateRegistration } from '@/features/registrations/services/registrationService'
import type { AttendanceStatus, LeadStatus } from '@/types/database'

export async function updateAttendanceStatusAction(
  registrationId: string,
  status: AttendanceStatus
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  try {
    const updates: Record<string, unknown> = { attendance_status: status }
    if (status === 'attended') {
      updates.checked_in_at = new Date().toISOString()
    }

    await updateRegistration(registrationId, updates)
    revalidatePath(`/registrations/${registrationId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar estado'
    return { error: message }
  }
}

export async function updateNotesAction(registrationId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  try {
    await updateRegistration(registrationId, { internal_notes: notes })
    revalidatePath(`/registrations/${registrationId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al guardar notas'
    return { error: message }
  }
}

export async function updateTagsAction(registrationId: string, tags: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  try {
    await updateRegistration(registrationId, { tags })
    revalidatePath(`/registrations/${registrationId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar etiquetas'
    return { error: message }
  }
}

export async function updateLeadStatusAction(
  registrationId: string,
  lead_status: LeadStatus
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  try {
    await updateRegistration(registrationId, { lead_status })
    revalidatePath(`/registrations/${registrationId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar lead status'
    return { error: message }
  }
}

export async function deleteRegistrationAction(registrationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  try {
    // Use service client to bypass RLS (no DELETE policy exists)
    const serviceClient = createServiceClient()

    // Delete raffle_entries first (no CASCADE)
    await serviceClient
      .from('raffle_entries')
      .delete()
      .eq('registration_id', registrationId)

    // Delete registration (consents cascade automatically)
    const { error } = await serviceClient
      .from('registrations')
      .delete()
      .eq('id', registrationId)

    if (error) return { error: error.message }

    revalidatePath('/registrations')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al eliminar inscripcion'
    return { error: message }
  }

  redirect('/registrations')
}
