"use client";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  patients?: {
    name: string;
    dni: string | null;
  };
}

export default function NewPagoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clinicId = params.clinic_id as string;
  const appointmentIdFromUrl = searchParams.get("appointment_id") as string;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(appointmentIdFromUrl || "");
  const router = useRouter();

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId]);

  async function fetchData() {
    try {
      const response = await fetch(`/api/patients?clinic_id=${clinicId}`);
      const data = await response.json();
      
      if (data.error) {
        console.error("API Error:", data.error);
        return;
      }
      
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clinic_id: clinicId,
        appointment_id: formData.get("appointment_id"),
        amount: Number(formData.get("amount")),
        payment_method: formData.get("payment_method"),
      }),
    });

    const result = await response.json();

    if (result.error) {
      alert("Error: " + result.error);
      setIsLoading(false);
    } else {
      router.push("../pagos");
      router.refresh();
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link 
        href="../pagos" 
        className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft size={20} />
        Volver a pagos
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Pago</h1>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
            <select 
              name="appointment_id" 
              required 
              defaultValue={selectedAppointment}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              <option value="">Seleccionar turno</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {new Date(a.appointment_date).toLocaleString("es-AR")} - {a.patients?.name || "Sin paciente"} - {a.status === "completed" ? "Atendido" : "Pendiente"}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              className="w-full p-2 border border-slate-300 rounded-lg"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
            <select name="payment_method" required className="w-full p-2 border border-slate-300 rounded-lg">
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="insurance">Seguro</option>
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Link
              href="../pagos"
              className="flex-1 py-2 text-center border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? "Guardando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
