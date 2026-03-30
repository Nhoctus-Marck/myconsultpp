"use client";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";

export default function ComprobantePage({ params }: { params: Promise<{ clinic_id: string; payment_id: string }> }) {
  const { clinic_id, payment_id } = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/payments?payment_id=${payment_id}&clinic_id=${clinic_id}`);
      const data = await res.json();

      if (data.error) {
        setLoading(false);
        return;
      }

      setPayment(data.payment);
      setClinic(data.clinic);
      setLoading(false);
    }
    fetchData();
  }, [payment_id, clinic_id]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!payment) return <div className="p-6">Pago no encontrado</div>;

  const today = new Date();
  const receiptNumber = `REC-${payment.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6 no-print">
          <Link href="../pagos" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft size={20} /> Volver
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer size={20} /> Imprimir
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 print:border-0 print:shadow-none">
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold text-slate-800">{clinic?.name || "Clínica"}</h1>
            <p className="text-sm text-slate-500">{clinic?.address || ""}</p>
            <p className="text-sm text-slate-500">{clinic?.phone || ""}</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">COMPROBANTE DE PAGO</h2>
            <p className="text-sm text-slate-500">N° {receiptNumber}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha:</span>
              <span className="font-medium">{new Date(payment.created_at).toLocaleDateString("es-AR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hora:</span>
              <span className="font-medium">{new Date(payment.created_at).toLocaleTimeString("es-AR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Método de Pago:</span>
              <span className="font-medium capitalize">{payment.payment_method}</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Paciente:</span>
              <span className="font-medium">{payment.appointments?.patients?.name || "Sin paciente"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DNI:</span>
              <span className="font-medium">{payment.appointments?.patients?.dni || "N/A"}</span>
            </div>
          </div>

          <div className="border-t-2 border-slate-800 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800">TOTAL ABONADO:</span>
              <span className="text-2xl font-bold text-green-600">${Number(payment.amount).toLocaleString("es-AR")}</span>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-slate-500">
            <p>Gracias por su preferencia</p>
            <p>{today.toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
