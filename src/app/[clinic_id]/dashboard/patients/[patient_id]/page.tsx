import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Calendar, CreditCard, FileText } from "lucide-react";

export default async function PatientDetailPage({ 
  params 
}: { 
  params: Promise<{ clinic_id: string; patient_id: string }> 
}) {
  const { clinic_id, patient_id } = await params;
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

  const { data: patient } = await supabaseAdmin
    .from("patients")
    .select("*")
    .eq("id", patient_id)
    .eq("clinic_id", clinic_id)
    .single();

  const { data: consultations } = await supabaseAdmin
    .from("medical_records")
    .select("*")
    .eq("patient_id", patient_id)
    .eq("clinic_id", clinic_id)
    .order("created_at", { ascending: false });

  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("patient_id", patient_id)
    .eq("clinic_id", clinic_id)
    .order("created_at", { ascending: false });

  const today = new Date().toISOString();
  const { data: appointments } = await supabaseAdmin
    .from("appointments")
    .select("*, doctors(users!doctors_user_id_fkey(name))")
    .eq("patient_id", patient_id)
    .eq("clinic_id", clinic_id)
    .gte("appointment_date", today)
    .eq("status", "scheduled")
    .order("appointment_date", { ascending: true });

  if (!patient) {
    return (
      <div className="p-6">
        <Link href="/patients" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft size={20} /> Volver a pacientes
        </Link>
        <p className="mt-4">Paciente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link 
        href={`../patients`}
        className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft size={20} />
        Volver a pacientes
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">{patient.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos Personales */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Datos Personales
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">DNI</p>
              <p className="font-medium">{patient.dni || "No registrado"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fecha de Nacimiento</p>
              <p className="font-medium">
                {patient.birth_date 
                  ? new Date(patient.birth_date).toLocaleDateString("es-AR")
                  : "No registrada"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fecha de Registro</p>
              <p className="font-medium">
                {new Date(patient.created_at).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
        </div>

        {/* Turnos Futuros */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Turnos Futuros
          </h2>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt: any) => (
                <div key={apt.id} className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">
                    {new Date(apt.appointment_date).toLocaleString("es-AR", {
                      dateStyle: "full",
                      timeStyle: "short"
                    })}
                  </p>
                  <p className="text-sm text-slate-600">
                    Doctor: {apt.doctors?.users?.name || "Sin asignar"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No hay turnos programados</p>
          )}
        </div>

        {/* Historial de Consultas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Historial de Consultas
          </h2>
          {consultations && consultations.length > 0 ? (
            <div className="space-y-3">
              {consultations.map((consultation: any) => (
                <div key={consultation.id} className="p-3 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">
                    {new Date(consultation.created_at).toLocaleDateString("es-AR")}
                  </p>
                  {consultation.diagnosis && (
                    <p className="font-medium">Diagnóstico: {consultation.diagnosis}</p>
                  )}
                  {consultation.treatment && (
                    <p className="text-sm text-slate-600">Tratamiento: {consultation.treatment}</p>
                  )}
                  {consultation.notes && (
                    <p className="text-sm text-slate-500">Notas: {consultation.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No hay consultas registradas</p>
          )}
        </div>

        {/* Pagos Realizados */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            Pagos Realizados
          </h2>
          {payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div key={payment.id} className="p-3 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">${Number(payment.amount).toLocaleString("es-AR")}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(payment.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {payment.status === "paid" ? "Pagado" : "Pendiente"}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200">
                <p className="font-bold text-right">
                  Total: ${payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No hay pagos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}
