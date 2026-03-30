import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get("payment_id");
  const clinicId = searchParams.get("clinic_id");

  if (!paymentId || !clinicId) {
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

  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .select("*, appointments(patients(name, dni, birth_date))")
    .eq("id", paymentId)
    .eq("clinic_id", clinicId)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const { data: clinic } = await supabaseAdmin
    .from("clinics")
    .select("name, address, phone")
    .eq("id", clinicId)
    .single();

  return NextResponse.json({ payment, clinic });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clinic_id, appointment_id, amount, payment_method } = body;

  if (!clinic_id || !amount || !payment_method) {
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

  const { error } = await supabaseAdmin
    .from("payments")
    .insert({
      clinic_id,
      appointment_id: appointment_id || null,
      amount,
      payment_method,
      status: "paid",
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
