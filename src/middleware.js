// middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });
  const url = request.nextUrl.clone();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = url.pathname === "/login";
  const isRegisterPage = url.pathname === "/register";
  const isRootPage = url.pathname === "/";

  // --- NUEVA REGLA DE PROTECCIÓN ---
  // Si NO está logueado y NO está en login ni registro -> MANDAR A LOGIN
  // if (!user && !isLoginPage && !isRegisterPage) {
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  // 1. REGLA: Si YA está logueado e intenta ir al Login o a la Raíz (/)
  if (user && (isLoginPage || isRootPage)) {
    const { data: memberships } = await supabase
      .from("memberships")
      .select("clinic_id")
      .eq("user_id", user.id);

    if (memberships && memberships.length === 1) {
      url.pathname = `/${memberships[0].clinic_id}/dashboard`;
      return NextResponse.redirect(url);
    } else if (memberships && memberships.length > 1) {
      url.pathname = "/select_clinic";
      return NextResponse.redirect(url);
    }
    // Si no tiene clínicas aún, podrías mandarlo a una página de error o creación
  }

  // 2. REGLA: Tu lógica de Admin para el Registro
  if (isRegisterPage && user) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (membership?.role !== "admin") {
      url.pathname = "/"; 
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",                // <--- INDISPENSABLE para que el middleware actúe al entrar
    "/auth/login",
    "/auth/register",
    "/select_clinic",
    "/:clinic_id/dashboard/:path*", 
  ],
};