import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { DollarSign, Users, CalendarX, TrendingUp, Printer } from "lucide-react";
import Link from "next/link";

export default async function ReportesPage({ params }: { params: Promise<{ clinic_id: string }> }) {
  const { clinic_id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = serviceKey
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    : supabase;

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const [dailyPayments, monthlyPayments, appointmentsToday, cancelledThisMonth, completedThisMonth] = await Promise.all([
    supabaseAdmin
      .from("payments")
      .select("amount")
      .eq("clinic_id", clinic_id)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .eq("status", "paid"),
    supabaseAdmin
      .from("payments")
      .select("amount")
      .eq("clinic_id", clinic_id)
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth)
      .eq("status", "paid"),
    supabaseAdmin
      .from("appointments")
      .select("id", { count: "exact" })
      .eq("clinic_id", clinic_id)
      .gte("appointment_date", startOfDay)
      .lte("appointment_date", endOfDay)
      .eq("status", "scheduled"),
    supabaseAdmin
      .from("appointments")
      .select("id", { count: "exact" })
      .eq("clinic_id", clinic_id)
      .gte("appointment_date", startOfMonth)
      .lte("appointment_date", endOfMonth)
      .eq("status", "cancelled"),
    supabaseAdmin
      .from("appointments")
      .select("id", { count: "exact" })
      .eq("clinic_id", clinic_id)
      .gte("appointment_date", startOfMonth)
      .lte("appointment_date", endOfMonth)
      .eq("status", "completed"),
  ]);

  const dailyIncome = dailyPayments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const monthlyIncome = monthlyPayments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const appointmentsTodayCount = appointmentsToday.count || 0;
  const cancelledCount = cancelledThisMonth.count || 0;
  const completedCount = completedThisMonth.count || 0;

  const stats = [
    {
      title: "Ingresos de Hoy",
      value: `$${dailyIncome.toLocaleString("es-AR")}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Ingresos del Mes",
      value: `$${monthlyIncome.toLocaleString("es-AR")}`,
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      title: "Turnos Hoy",
      value: appointmentsTodayCount.toString(),
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Turnos Cancelados (Mes)",
      value: cancelledCount.toString(),
      icon: CalendarX,
      color: "bg-red-500",
    },
    {
      title: "Pacientes Atendidos (Mes)",
      value: completedCount.toString(),
      icon: Users,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href={`reportes/dia`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <Printer size={20} /> Imprimir Reporte del Día
        </Link>
      </div>
    </div>
  );
}
