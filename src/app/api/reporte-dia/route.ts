import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinic_id");
  const fecha = searchParams.get("fecha");

  if (!clinicId || !fecha) {
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

  const startOfDay = new Date(fecha + "T00:00:00").toISOString();
  const endOfDay = new Date(fecha + "T23:59:59").toISOString();

  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("*, appointments(patients(name))")
    .eq("clinic_id", clinicId)
    .eq("status", "paid")
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: true });

  const { data: clinic } = await supabaseAdmin
    .from("clinics")
    .select("name, address, phone")
    .eq("id", clinicId)
    .single();

  return NextResponse.json({ payments: payments || [], clinic });
}
