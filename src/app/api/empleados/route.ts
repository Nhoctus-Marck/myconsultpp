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

  const { data: memberships, error } = await supabaseAdmin
    .from("memberships")
    .select("*")
    .eq("clinic_id", clinicId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = memberships?.map(m => m.user_id) || [];
  
  if (userIds.length === 0) {
    return NextResponse.json({ empleados: [] });
  }

  const { data: doctors } = await supabaseAdmin
    .from("doctors")
    .select("user_id, specialty")
    .in("user_id", userIds);

  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.error("Error fetching users:", usersError);
  }

  const empleados = memberships?.map(m => {
    const user = usersData?.users.find(u => u.id === m.user_id);
    const doctor = doctors?.find(d => d.user_id === m.user_id);
    return {
      ...m,
      nombre: user?.user_metadata?.name || user?.email?.split("@")[0] || "Sin nombre",
      email: user?.email,
      especialidad: doctor?.specialty || null,
    };
  }) || [];

  return NextResponse.json({ empleados });
}
