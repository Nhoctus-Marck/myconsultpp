"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default function ReporteDiaPage({ params }: { params: Promise<{ clinic_id: string }> }) {
  const { clinic_id } = use(params);
  const [payments, setPayments] = useState<any[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchData();
  }, [clinic_id, fecha]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/reporte-dia?clinic_id=${clinic_id}&fecha=${fecha}`);
    const data = await res.json();
    setPayments(data.payments || []);
    setClinic(data.clinic);
    setLoading(false);
  }

  const totalRecaudado = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <Link href="../reportes" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft size={20} /> Volver
          </Link>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg"
            />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer size={20} /> Imprimir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold text-slate-800">{clinic?.name || "Clínica"}</h1>
            <p className="text-sm text-slate-500">{clinic?.address || ""}</p>
            <p className="text-sm text-slate-500">{clinic?.phone || ""}</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">REPORTE DIARIO</h2>
            <p className="text-lg text-slate-600">
              {new Date(fecha).toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {loading ? (
            <p className="text-center text-slate-500">Cargando...</p>
          ) : payments.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay pagos registrados en esta fecha</p>
          ) : (
            <>
              <table className="w-full mb-6">
                <thead className="border-b-2 border-slate-800">
                  <tr>
                    <th className="text-left py-2 text-sm font-bold text-slate-800">Hora</th>
                    <th className="text-left py-2 text-sm font-bold text-slate-800">Paciente</th>
                    <th className="text-left py-2 text-sm font-bold text-slate-800">Método</th>
                    <th className="text-right py-2 text-sm font-bold text-slate-800">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100">
                      <td className="py-2 text-sm">
                        {new Date(payment.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2 text-sm">{payment.appointments?.patients?.name || "Sin paciente"}</td>
                      <td className="py-2 text-sm capitalize">{payment.payment_method}</td>
                      <td className="py-2 text-sm text-right">${Number(payment.amount).toLocaleString("es-AR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-slate-800 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">TOTAL RECAUDADO:</span>
                  <span className="text-2xl font-bold text-green-600">${totalRecaudado.toLocaleString("es-AR")}</span>
                </div>
              </div>
            </>
          )}

          <div className="text-center mt-8 text-sm text-slate-500">
            <p>Reporte generado automáticamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
