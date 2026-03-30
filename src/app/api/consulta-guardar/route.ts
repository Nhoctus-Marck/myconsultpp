import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { appointment_id, clinic_id, patient_id, doctor_id, diagnosis, treatment, notes } = body;

  if (!appointment_id || !clinic_id || !patient_id || !doctor_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { error } = await supabaseAdmin
    .from("medical_records")
    .insert({
      clinic_id,
      patient_id,
      doctor_id,
      appointment_id,
      diagnosis: diagnosis || null,
      treatment: treatment || null,
      notes: notes || null,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin
    .from("appointments")
    .update({ status: "completed" })
    .eq("id", appointment_id);

  return NextResponse.json({ success: true });
}
