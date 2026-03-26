import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export default async function DoctorsPage({ 
  params 
}: { 
  params: Promise<{ clinic_id: string }> 
}) {
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

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error: Falta configuración del servidor</p>
      </div>
    );
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data: doctors } = await supabaseAdmin
    .from("doctors")
    .select("*")
    .eq("clinic_id", clinic_id);

  let usersMap: Record<string, any> = {};
  if (doctors && doctors.length > 0) {
    const doctorUserIds = doctors.map((d: any) => d.user_id).filter(Boolean);
    
    if (doctorUserIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id, name, email")
        .in("id", doctorUserIds);
      
      if (users) {
        usersMap = users.reduce((acc: Record<string, any>, user: any) => {
          acc[user.id] = user;
          return acc;
        }, {});
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Doctores</h1>
      </div>

      {doctors && doctors.length > 0 ? (
        <div className="grid gap-4">
          {doctors.map((doctor: any) => {
            const user = usersMap?.[doctor.user_id];
            return (
              <div 
                key={doctor.id} 
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">
                      {user?.name || "Sin nombre"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {user?.email || "Sin email"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      {doctor.specialty || "Sin especialidad"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Licencia: {doctor.license_number || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          No hay doctores registrados en esta clínica.
        </div>
      )}
    </div>
  );
}
