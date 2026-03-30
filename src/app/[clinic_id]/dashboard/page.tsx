import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export default async function ClinicDashboard({ 
  params 
}: { 
  params: Promise<{ clinic_id: string }> 
}) {
  const { clinic_id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = serviceKey 
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    : supabase;

  const { data: clinic } = await supabase
    .from("clinics")
    .select("name")
    .eq("id", clinic_id)
    .single();

  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuario";

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user?.id)
    .eq("clinic_id", clinic_id)
    .single();

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    doctor: "Doctor",
    receptionist: "Recepcionista"
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data: appointmentsToday } = await supabaseAdmin
    .from("appointments")
    .select("*")
    .eq("clinic_id", clinic_id)
    .gte("appointment_date", todayStart)
    .lt("appointment_date", todayEnd);

  const { data: paymentsToday } = await supabaseAdmin
    .from("payments")
    .select("amount")
    .eq("clinic_id", clinic_id)
    .gte("created_at", todayStart)
    .lt("created_at", todayEnd)
    .eq("status", "paid");

  const totalIncome = paymentsToday?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

  const { data: patientsToday } = await supabaseAdmin
    .from("appointments")
    .select("patient_id")
    .eq("clinic_id", clinic_id)
    .gte("appointment_date", todayStart)
    .lt("appointment_date", todayEnd)
    .eq("status", "completed");

  const patientsAttended = patientsToday?.length || 0;

  const { data: pendingAppointments } = await supabaseAdmin
    .from("appointments")
    .select("*")
    .eq("clinic_id", clinic_id)
    .eq("status", "scheduled");

  const pendingCount = pendingAppointments?.length || 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500">Bienvenido, {userName}</p>
          <h1 className="text-2xl font-bold text-slate-800">
            Panel de Control: {clinic?.name || "Cargando..."}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          membership?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
          membership?.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {roleLabels[membership?.role] || 'Usuario'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-400 text-sm font-medium uppercase">Turnos Hoy</h3>
          <p className="text-3xl font-bold text-slate-900 mt-1">{appointmentsToday?.length || 0}</p>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-400 text-sm font-medium uppercase">Turnos Pendientes</h3>
          <p className="text-3xl font-bold text-orange-500 mt-1">{pendingCount}</p>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-400 text-sm font-medium uppercase">Ingresos del Día</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">${totalIncome.toLocaleString('es-AR')}</p>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-400 text-sm font-medium uppercase">Pacientes Atendidos</h3>
          <p className="text-3xl font-bold text-blue-600 mt-1">{patientsAttended}</p>
        </div>
      </div>
    </div>
  );
}