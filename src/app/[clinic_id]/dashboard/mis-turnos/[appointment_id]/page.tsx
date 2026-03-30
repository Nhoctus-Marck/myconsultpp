"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save } from "lucide-react";

export default function ConsultaDetallePage({ params }: { params: Promise<{ clinic_id: string; appointment_id: string }> }) {
  const { clinic_id, appointment_id } = use(params);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchAppointment();
  }, [appointment_id]);

  async function fetchAppointment() {
    setLoading(true);
    const res = await fetch(`/api/appointment-detalle?appointment_id=${appointment_id}`);
    const data = await res.json();
    
    if (data.appointment) {
      setAppointment(data.appointment);
      const record = data.medicalRecord;
      setDiagnosis(record?.diagnosis || "");
      setTreatment(record?.treatment || "");
      setNotes(record?.notes || "");
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    const res = await fetch("/api/consulta-guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_id: appointment_id,
        clinic_id: clinic_id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        diagnosis,
        treatment,
        notes,
      }),
    });

    const result = await res.json();

    if (result.error) {
      alert("Error: " + result.error);
    } else {
      alert("Consulta guardada correctamente");
      window.location.href = `../mis-turnos`;
    }
    setSaving(false);
  }

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!appointment) return <div className="p-6">Turno no encontrado</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="../mis-turnos" className="flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <ArrowLeft size={20} /> Volver a Mis Turnos
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Detalle de Consulta</h1>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Paciente</p>
            <p className="text-lg font-medium">{appointment.patients?.name || "Sin paciente"}</p>
            <p className="text-sm text-slate-500">DNI: {appointment.patients?.dni || "N/A"}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Fecha y Hora</p>
            <p className="text-lg font-medium">
              {new Date(appointment.appointment_date).toLocaleDateString("es-AR")} -{" "}
              {new Date(appointment.appointment_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-lg"
              placeholder="Diagnóstico del paciente..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tratamiento</label>
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-lg"
              placeholder="Tratamiento indicado..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full p-2 border border-slate-300 rounded-lg"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            <Save size={20} />
            {saving ? "Guardando..." : "Guardar Consulta"}
          </button>
        </div>
      </div>
    </div>
  );
}
