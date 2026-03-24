import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Obtener usuario
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Obtener membresía/rol
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("id", user?.id)
    .single();

  const isLoginPage = request.nextUrl.pathname === "/login";
  const isRegisterPage = request.nextUrl.pathname === "/register";
  const isRootPage = request.nextUrl.pathname === "/";

  // --- LÓGICA DE REDIRECCIÓN ---

  // REGLA 1: Si no está logueado y quiere ir a la Home o Registro -> al Login
//   if (!user && (isRootPage || isRegisterPage)) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

  // REGLA 2: Si ya está logueado e intenta ir al Login -> a la Home
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // REGLA 3: Si intenta ir a Registro pero NO es Admin -> a la Home
  // (Esto permite que solo el Admin use la ruta de creación de empleados)
  if (isRegisterPage && membership?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/login", 
    "/register",
    "/dashboard/:path*", // Protege el dashboard y sus subrutas
    "/pacientes/:path*", // Ejemplo de otra ruta que quieras proteger
  ],
};