'use server'
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function createAppointment(data: {
  clinic_id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  notes: string | null
}) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    return { error: "Service role key not configured" }
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )

  const { error } = await supabaseAdmin
    .from("appointments")
    .insert({
      clinic_id: data.clinic_id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      appointment_date: data.appointment_date,
      status: "scheduled",
      notes: data.notes
    })

  if (error) return { error: error.message }

  return { success: true }
}
