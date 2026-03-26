import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function ClinicDashboard({ 
  params 
}: { 
  params: Promise<{ clinic_id: string }> 
}) {
  // 1. Desempaquetar params y cookies con await
  const { clinic_id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  // 2. Traer datos de la clínica
  const { data: clinic } = await supabase
    .from("clinics")
    .select("name")
    .eq("id", clinic_id)
    .single();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Panel de Control: {clinic?.name || "Cargando..."}
      </h1>
      <p className="text-sm text-slate-500 mt-2">ID Clínico: {clinic_id}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-400 text-sm font-medium uppercase">Citas Hoy</h3>
          <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
        </div>
        {/* Agrega más tarjetas aquí */}
      </div>
    </div>
  );
}