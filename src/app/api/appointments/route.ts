import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinic_id");
  const type = searchParams.get("type");

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

  if (type === "form") {
    const { data: patients } = await supabaseAdmin
      .from("patients")
      .select("id, name, dni")
      .eq("clinic_id", clinicId);

    const { data: doctors } = await supabaseAdmin
      .from("doctors")
      .select("id, specialty")
      .eq("clinic_id", clinicId);

    return NextResponse.json({ 
      patients: patients || [], 
      doctors: doctors || [] 
    });
  }

  const startOfMonth = searchParams.get("month") && searchParams.get("year")
    ? new Date(parseInt(searchParams.get("year")!), parseInt(searchParams.get("month")!) - 1, 1).toISOString()
    : undefined;
  const endOfMonth = searchParams.get("month") && searchParams.get("year")
    ? new Date(parseInt(searchParams.get("year")!), parseInt(searchParams.get("month")!), 0, 23, 59, 59).toISOString()
    : undefined;

  let query = supabaseAdmin
    .from("appointments")
    .select("*, patients(name, dni), doctors(id, specialty)")
    .eq("clinic_id", clinicId);

  if (startOfMonth && endOfMonth) {
    query = query.gte("appointment_date", startOfMonth).lte("appointment_date", endOfMonth);
  }

  const { data, error } = await query.order("appointment_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clinic_id, patient_id, doctor_id, appointment_date, notes } = body;

  if (!clinic_id || !patient_id || !doctor_id || !appointment_date) {
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

  const { error } = await supabaseAdmin.from("appointments").insert({
    clinic_id,
    patient_id,
    doctor_id,
    appointment_date,
    status: "scheduled",
    notes: notes || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
