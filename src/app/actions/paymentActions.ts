'use server'
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function createPayment(data: {
  clinic_id: string
  patient_id: string
  appointment_id: string | null
  amount: number
  payment_method: string
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
    .from("payments")
    .insert({
      clinic_id: data.clinic_id,
      patient_id: data.patient_id,
      appointment_id: data.appointment_id,
      amount: data.amount,
      payment_method: data.payment_method,
      status: "paid"
    })

  if (error) return { error: error.message }

  return { success: true }
}
