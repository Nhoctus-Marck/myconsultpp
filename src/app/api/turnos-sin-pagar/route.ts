import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinic_id");

  if (!clinicId) {
    return NextResponse.json({ error: "Missing clinic_id" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data: appointments, error } = await supabaseAdmin
    .from("appointments")
    .select("id, appointment_date, status, patients(name, dni)")
    .eq("clinic_id", clinicId)
    .order("appointment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("appointment_id")
    .eq("clinic_id", clinicId)
    .not("appointment_id", "is", null);

  const paidAppointmentIds = new Set(payments?.map(p => p.appointment_id) || []);
  
  const unpaidAppointments = (appointments || []).filter(
    apt => !paidAppointmentIds.has(apt.id)
  );

  return NextResponse.json({ appointments: unpaidAppointments });
}
