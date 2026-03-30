"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export default function NewTurnoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clinicId = params.clinic_id as string;
  const dateFromUrl = searchParams.get("date") as string;
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (clinicId) {
      fetchData(clinicId);
    }
  }, [clinicId]);

  async function fetchData(clinic_id: string) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceKey) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
      );

      const { data: patientsData } = await supabaseAdmin
        .from("patients")
        .select("id, name, dni")
        .eq("clinic_id", clinic_id);
      setPatients(patientsData || []);

      const { data: doctorsData } = await supabaseAdmin
        .from("doctors")
        .select("id, specialty")
        .eq("clinic_id", clinic_id);
      setDoctors(doctorsData || []);
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey) {
      alert("Service role key not configured");
      setIsLoading(false);
      return;
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    const { error } = await supabaseAdmin.from("appointments").insert({
      clinic_id: clinicId,
      patient_id: formData.get("patient_id"),
      doctor_id: formData.get("doctor_id"),
      appointment_date: formData.get("appointment_date"),
      status: "scheduled",
      notes: formData.get("notes"),
    });

    if (error) {
      alert("Error: " + error.message);
      setIsLoading(false);
    } else {
      router.push("../turnos");
      router.refresh();
    }
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
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Turno</h1>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y Hora</label>
            <input
              name="appointment_date"
              type="datetime-local"
              required
              defaultValue={dateFromUrl ? `${dateFromUrl}T09:00` : ""}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
            <select name="patient_id" required className="w-full p-2 border border-slate-300 rounded-lg">
              <option value="">Seleccionar paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - {p.dni || "Sin DNI"}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
            <select name="doctor_id" required className="w-full p-2 border border-slate-300 rounded-lg">
              <option value="">Seleccionar doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.specialty || "Doctor"}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-lg"
              placeholder="Notas opcionales..."
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Link
              href="../turnos"
              className="flex-1 py-2 text-center border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? "Creando..." : "Crear Turno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
