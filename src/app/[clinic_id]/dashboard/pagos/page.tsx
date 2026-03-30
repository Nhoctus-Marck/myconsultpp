import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Plus, X, DollarSign } from "lucide-react";

export default async function PagosPage({ params }: { params: Promise<{ clinic_id: string }> }) {
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

  const { data: payments, error: paymentsError } = await supabaseAdmin
    .from("payments")
    .select("*, appointments(patients(name, dni))")
    .eq("clinic_id", clinic_id)
    .order("created_at", { ascending: false });

  const { data: patients } = await supabaseAdmin
    .from("patients")
    .select("id, name, dni")
    .eq("clinic_id", clinic_id);

  const { data: appointmentsWithPayments } = await supabaseAdmin
    .from("appointments")
    .select("id, appointment_date, status, doctors(id, specialty), patients(name, dni), payments(id)")
    .eq("clinic_id", clinic_id)
    .eq("status", "completed");

  const unpaidAppointments = (appointmentsWithPayments || []).filter(apt => !apt.payments || apt.payments.length === 0);
  const paidAppointments = (appointmentsWithPayments || []).filter(apt => apt.payments && apt.payments.length > 0);

  const totalPaid = (payments || [])
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = (payments || [])
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div className="p-6 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pagos</h1>
        <a
          href={`pagos/new`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Nuevo Pago
        </a>
      </div>

      {/* Stats */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total Pagado</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString("es-AR")}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total Pendiente</p>
          <p className="text-2xl font-bold text-orange-500">${totalPending.toLocaleString("es-AR")}</p>
        </div>
      </div>

      {/* Payments List */}
      <div className="px-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Paciente</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Monto</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Método</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(payments || []).length > 0 ? (
                (payments || []).map((payment: any) => (
                  <tr key={payment.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <p className="font-medium">{payment.appointments?.patients?.name || "Sin paciente"}</p>
                      <p className="text-sm text-slate-500">DNI: {payment.appointments?.patients?.dni || "N/A"}</p>
                    </td>
                    <td className="p-4 font-medium">${Number(payment.amount).toLocaleString("es-AR")}</td>
                    <td className="p-4 text-sm capitalize">{payment.payment_method}</td>
                    <td className="p-4 text-sm">
                      {new Date(payment.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-4">
                      {payment.status === "paid" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Pagado
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No hay pagos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Turnos sin pagar */}
      {unpaidAppointments.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Turnos sin Abonar</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Fecha</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Hora</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Paciente</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Doctor</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Acción</th>
                </tr>
              </thead>
              <tbody>
                {unpaidAppointments.map((apt: any) => (
                  <tr key={apt.id} className="border-t border-slate-100">
                    <td className="p-4">
                      {new Date(apt.appointment_date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-4">
                      {new Date(apt.appointment_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-4 font-medium">{apt.patients?.name || "Sin paciente"}</td>
                    <td className="p-4">{apt.doctors?.specialty || "Sin asignar"}</td>
                    <td className="p-4">
                      <a
                        href={`pagos/new?appointment_id=${apt.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Cobrar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
