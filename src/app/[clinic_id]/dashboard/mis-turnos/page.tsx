"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function MisTurnosPage({ params }: { params: Promise<{ clinic_id: string }> }) {
  const { clinic_id } = use(params);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAppointments();
  }, [clinic_id]);

  async function fetchAppointments() {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .eq("clinic_id", clinic_id)
      .single();

    if (!doctor) {
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/doctor-turnos?clinic_id=${clinic_id}&doctor_id=${doctor.id}`);
    const data = await res.json();
    
    setAppointments(data || []);
    setLoading(false);
  }

  const statusLabels: Record<string, { label: string; class: string }> = {
    scheduled: { label: "Pendiente", class: "bg-blue-100 text-blue-700" },
    completed: { label: "Atendido", class: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelado", class: "bg-red-100 text-red-700" },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mis Turnos</h1>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : appointments.length === 0 ? (
        <p className="text-slate-500">No hay turnos asignados</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Hora</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Paciente</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt: any) => (
                <tr key={apt.id} className="border-t border-slate-100">
                  <td className="p-4">
                    {new Date(apt.appointment_date).toLocaleDateString("es-AR")}
                  </td>
                  <td className="p-4">
                    {new Date(apt.appointment_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-4 font-medium">{apt.patients?.name || "Sin paciente"}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${statusLabels[apt.status]?.class || "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[apt.status]?.label || apt.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`mis-turnos/${apt.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
