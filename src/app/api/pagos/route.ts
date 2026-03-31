import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clinic_id, appointment_id, amount, payment_method } = body;

  if (!clinic_id || !amount || !payment_method) {
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
    .from("payments")
    .insert({
      clinic_id,
      appointment_id: appointment_id || null,
      amount,
      payment_method,
      status: "paid",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
