import { Sidebar } from "../../../components/front/home/ui/SideBar";  // <-- ASEGÚRATE DE ESTA RUTA
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

import { NavBar } from "../../../components/front/home/NavBar";
import { Footer } from "../../../components/front/home/Footer";

import { notFound } from "next/navigation";
export default async function ClinicLayout({ children, params }: { children: React.ReactNode, params: Promise<{clinic_id: string}> }) {
  const { clinic_id } = await params;
  const cookieStore = await cookies();
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(clinic_id)) {
    return notFound(); // Esto muestra la página 404 oficial de Next.js
  }
const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // NUEVA CONSULTA: Obtener el nombre de la clínica
  const { data: clinic } = await supabase
    .from("clinics")
    .select("name")
    .eq("id", clinic_id)
    .single();

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user?.id)
    .eq("clinic_id", clinic_id)
    .single();

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="flex-none z-50 bg-white border-b shadow-sm">
        <NavBar user={user} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex-none border-r bg-white">
          {/* PASAMOS EL NOMBRE DE LA CLÍNICA AQUÍ */}
          <Sidebar 
            clinicId={clinic_id} 
            clinicName={clinic?.name || "E.R.M.I.S"} 
            role={membership?.role || "doctor"} 
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}