import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const appointmentId = searchParams.get("appointment_id");

  if (!appointmentId) {
    return NextResponse.json({ error: "Missing appointment_id" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data: appointment, error } = await supabaseAdmin
    .from("appointments")
    .select("*, patients(name, dni, birth_date), doctors(id, specialty)")
    .eq("id", appointmentId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: medicalRecord } = await supabaseAdmin
    .from("medical_records")
    .select("diagnosis, treatment, notes")
    .eq("appointment_id", appointmentId)
    .single();

  return NextResponse.json({ 
    appointment,
    medicalRecord: medicalRecord || null 
  });
}
