import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinic_id");
  const doctorId = searchParams.get("doctor_id");

  if (!clinicId || !doctorId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Service key not configured" }, { status: 500 });
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("*, patients(name, dni, birth_date)")
    .eq("clinic_id", clinicId)
    .eq("doctor_id", doctorId)
    .order("appointment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
