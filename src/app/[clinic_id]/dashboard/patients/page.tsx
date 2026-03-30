"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientsPage({ params }: { params: Promise<{ clinic_id: string }> }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicId, setClinicId] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      setClinicId(p.clinic_id);
      fetchPatients(p.clinic_id);
    });
  }, []);

  async function fetchPatients(clinic_id: string) {
    const res = await fetch(`/api/patients?clinic_id=${clinic_id}`);
    const data = await res.json();
    setPatients(data.patients || []);
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    const patientData = {
      name: formData.get("name"),
      dni: formData.get("dni"),
      birth_date: formData.get("birth_date") || null,
      clinic_id: clinicId,
    };

    const { error } = await supabase.from("patients").insert(patientData);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      setShowForm(false);
      fetchPatients(clinicId);
    }
    setIsLoading(false);
  }

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nuevo Paciente"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Paciente</h2>
          <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                name="name"
                required
                className="w-full p-2 border border-slate-300 rounded-lg"
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
              <input
                name="dni"
                className="w-full p-2 border border-slate-300 rounded-lg"
                placeholder="12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
              <input
                name="birth_date"
                type="date"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? "Guardando..." : "Guardar Paciente"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar pacientes por nombre o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg"
        />
      </div>

      {filteredPatients.length > 0 ? (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Link
              key={patient.id}
              href={`patients/${patient.id}`}
              className="block p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{patient.name}</h3>
                  <p className="text-sm text-slate-500">DNI: {patient.dni || "No registrado"}</p>
                </div>
                <div className="text-right text-sm text-slate-400">
                  {patient.birth_date && (
                    <p>Nacimiento: {new Date(patient.birth_date).toLocaleDateString("es-AR")}</p>
                  )}
                  <p>Creado: {new Date(patient.created_at).toLocaleDateString("es-AR")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
        </div>
      )}
    </div>
  );
}
