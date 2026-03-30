"use client";
import { use, useState, useEffect } from "react";

export default function EmpleadosPage({ params }: { params: Promise<{ clinic_id: string }> }) {
  const { clinic_id } = use(params);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>("all");

  useEffect(() => {
    fetchEmpleados();
  }, [clinic_id, filtro]);

  async function fetchEmpleados() {
    setLoading(true);
    
    const res = await fetch(`/api/empleados?clinic_id=${clinic_id}`);
    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      setLoading(false);
      return;
    }

    let filtered = data.empleados || [];
    if (filtro === "receptionist") {
      filtered = filtered.filter((m: any) => m.role === "receptionist");
    } else if (filtro === "doctor") {
      filtered = filtered.filter((m: any) => m.role === "doctor");
    }

    setEmpleados(filtered);
    setLoading(false);
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    doctor: "Doctor",
    receptionist: "Recepcionista",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Empleados</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFiltro("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filtro === "all" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro("receptionist")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filtro === "receptionist" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Recepcionistas
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : empleados.length === 0 ? (
        <p className="text-slate-500">No hay empleados</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Nombre</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Rol</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Especialidad</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp: any) => (
                <tr key={emp.id} className="border-t border-slate-100">
                  <td className="p-4 font-medium">{emp.nombre}</td>
                  <td className="p-4 text-sm text-slate-600">{emp.email}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      emp.role === "admin" ? "bg-purple-100 text-purple-700" :
                      emp.role === "doctor" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {roleLabels[emp.role] || emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{emp.especialidad || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
