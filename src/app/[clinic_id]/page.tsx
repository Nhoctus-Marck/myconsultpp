// app/select-clinic/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function SelectClinicPage() {
  // CORRECCIÓN: await cookies()
  const cookieStore = await cookies(); 
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(), // Ahora funcionará porque cookieStore ya está resuelto
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("memberships")
    .select(`clinic_id, role, clinics ( name, address )`)
    .eq("user_id", user?.id);

  // ... resto del return igual
}