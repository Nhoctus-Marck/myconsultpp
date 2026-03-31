import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Check, X, Calendar, FileText, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";

async function updateAppointmentStatus(appointmentId: string, status: string, clinicId: string) {
  "use server"
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )

  await supabaseAdmin
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)

  redirect(`/${clinicId}/dashboard/turnos`)
}

export default async function TurnoDetailPage({ params }: { 
  params: Promise<{ clinic_id: string; appointment_id: string }> 
}) {
  const { clinic_id, appointment_id } = await params;
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

  const { data: appointment } = await supabaseAdmin
    .from("appointments")
    .select("*, patients(name, dni, birth_date), doctors(id, specialty)")
    .eq("id", appointment_id)
    .eq("clinic_id", clinic_id)
    .single();

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, amount, payment_method, status")
    .eq("appointment_id", appointment_id)
    .single();

  if (!appointment) {
    return (
      <div className="p-6">
        <Link href="../turnos" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft size={20} /> Volver a turnos
        </Link>
        <p className="mt-4">Turno no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link 
        href="../turnos" 
        className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft size={20} />
        Volver a turnos
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Turno</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            appointment.status === "scheduled" ? "bg-blue-100 text-blue-700" :
            appointment.status === "completed" ? "bg-green-100 text-green-700" :
            "bg-red-100 text-red-700"
          }`}>
            {appointment.status === "scheduled" ? "Pendiente" :
             appointment.status === "completed" ? "Atendido" : "Cancelado"}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <Calendar className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-slate-500">Fecha y Hora</p>
              <p className="font-medium">
                {new Date(appointment.appointment_date).toLocaleString("es-AR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Paciente</p>
            <p className="font-medium text-lg">{appointment.patients?.name}</p>
            <p className="text-sm text-slate-500">DNI: {appointment.patients?.dni || "No registrado"}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Doctor</p>
            <p className="font-medium">{appointment.doctors?.specialty || "Sin asignar"}</p>
          </div>

          {appointment.notes && (
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <FileText className="text-slate-500 mt-1" size={20} />
              <div>
                <p className="text-sm text-slate-500">Notas</p>
                <p className="font-medium">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>

        {appointment.status === "scheduled" && (
          <div className="flex gap-4 mt-6">
            <form action={updateAppointmentStatus.bind(null, appointment_id, "completed", clinic_id)}>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Check size={20} /> Marcar como Atendido
              </button>
            </form>
            <form action={updateAppointmentStatus.bind(null, appointment_id, "cancelled", clinic_id)}>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <X size={20} /> Cancelar Turno
              </button>
            </form>
          </div>
        )}

        {appointment.status === "completed" && !payment && (
          <div className="mt-6">
            <Link
              href={`../pagos/new?appointment_id=${appointment_id}`}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <DollarSign size={20} /> Registrar Pago
            </Link>
          </div>
        )}

        {payment && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Pago Registrado</p>
                <p className="font-bold text-green-800">${Number(payment.amount).toLocaleString("es-AR")}</p>
                <p className="text-sm text-green-600 capitalize">{payment.payment_method}</p>
              </div>
              <Link
                href={`../pagos/${payment.id}`}
                className="text-green-700 hover:underline text-sm"
              >
                Ver Comprobante
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
