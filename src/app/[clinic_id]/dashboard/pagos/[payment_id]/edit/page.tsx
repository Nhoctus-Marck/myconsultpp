"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export default function EditPagoPage({ params }: { params: Promise<{ clinic_id: string; payment_id: string }> }) {
  const { clinic_id, payment_id } = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPayment();
  }, [payment_id]);

  async function fetchPayment() {
    setLoading(true);
    const res = await fetch(`/api/payment-detalle?payment_id=${payment_id}&clinic_id=${clinic_id}`);
    const data = await res.json();
    
    if (data.payment) {
      setPayment(data.payment);
      setAmount(String(data.payment.amount));
      setPaymentMethod(data.payment.payment_method);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    const res = await fetch("/api/pago-editar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_id: payment_id,
        amount: Number(amount),
        payment_method: paymentMethod,
      }),
    });

    const result = await res.json();

    if (result.error) {
      alert("Error: " + result.error);
    } else {
      alert("Pago actualizado correctamente");
      router.push(`../pagos`);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este pago?")) return;
    
    setSaving(true);
    const res = await fetch("/api/pago-eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id }),
    });

    const result = await res.json();

    if (result.error) {
      alert("Error: " + result.error);
    } else {
      router.push("../pagos");
    }
    setSaving(false);
  }

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!payment) return <div className="p-6">Pago no encontrado</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="../pagos" className="flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <ArrowLeft size={20} /> Volver a Pagos
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Pago</h1>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Paciente</p>
            <p className="text-lg font-medium">{payment.appointments?.patients?.name || "Sin paciente"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="insurance">Seguro</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleDelete}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
          >
            <Trash2 size={20} /> Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            <Save size={20} />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
