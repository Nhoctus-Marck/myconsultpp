import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Clinic {
  id: string;
  name: string;
  address: string;
}

interface Membership {
  clinic_id: string;
  role: string;
  clinics: Clinic;
}

export default async function SelectClinicPage() {
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select(`clinic_id, role, clinics (id, name, address)`)
    .eq("user_id", user.id) as { data: Membership[] | null };

  if (!memberships || memberships.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sin clínicas asignadas
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes acceso a ninguna clínica. Contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  if (memberships.length === 1) {
    const clinicData = memberships[0].clinics as unknown as { id: string; name: string; address: string };
    const clinic = Array.isArray(clinicData) ? clinicData[0] : clinicData;
    redirect(`/${clinic.id}/dashboard`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Selecciona una clínica
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Tienes acceso a {memberships.length} clínicas
        </p>

        <div className="space-y-3">
          {memberships.map((membership) => {
            const clinicData = membership.clinics as unknown as { id: string; name: string; address: string };
            const clinic = Array.isArray(clinicData) ? clinicData[0] : clinicData;
            return (
              <Link
                key={clinic.id}
                href={`/${clinic.id}/dashboard`}
                className="block p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{clinic.name}</h3>
                    <p className="text-sm text-gray-500">{clinic.address}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    membership.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {membership.role}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
