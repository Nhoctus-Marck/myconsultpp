import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinic_id");

  if (!clinicId) {
    return NextResponse.json({ error: "Missing clinic_id" }, { status: 400 });
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("clinic_id", clinicId)
    .single();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = serviceKey
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    : supabase;

  if (membership?.role === "doctor") {
    const { data: doctor } = await supabaseAdmin
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinicId)
      .single();

    if (!doctor) {
      return NextResponse.json({ patients: [] });
    }

    const { data: appointments } = await supabaseAdmin
      .from("appointments")
      .select("patient_id")
      .eq("doctor_id", doctor.id)
      .eq("clinic_id", clinicId);

    const patientIds = [...new Set(appointments?.map((a) => a.patient_id) || [])];

    if (patientIds.length === 0) {
      return NextResponse.json({ patients: [], role: "doctor" });
    }

    const { data: patients } = await supabaseAdmin
      .from("patients")
      .select("*")
      .in("id", patientIds)
      .order("created_at", { ascending: false });

    return NextResponse.json({ patients: patients || [], role: "doctor" });
  }

  const { data: patients } = await supabaseAdmin
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ patients: patients || [], role: membership?.role || "user" });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clinic_id, name, dni, birth_date } = body;

  if (!clinic_id || !name || !dni) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return Response.json({ error: "Service key not configured" }, { status: 500 });
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { error } = await supabaseAdmin.from("patients").insert({
    clinic_id,
    name,
    dni,
    birth_date: birth_date || null,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
