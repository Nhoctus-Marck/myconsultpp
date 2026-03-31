import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
    .select("*, appointments(patients(name, dni))")
    .eq("id", paymentId)
    .eq("clinic_id", clinicId)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ payment });
}
