"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";
import { loginSchema } from "@/lib/schemas/auth";

export const LoginForm = () => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  //funcion que recibira la informacion del form
  //sera enviada  y guardada a los actions de supaBase
  async function handleSubmit(formData) {
    setIsLoading(true);
    setErrors({});

    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = loginSchema.safeParse(data);

    if (!result.success) {
      // flatten() organiza todo por nombre de campo automáticamente
      setErrors(result.error.flatten().fieldErrors);
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      setErrors({ general: error.message });
      setIsLoading(false);
      return;
    }
    router.push("/select_clinic");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-2xl w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Inicia sesión
          </h1>
        </header>
        <form action={handleSubmit} className="flex flex-col gap-5">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errors.general}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold mb-2 ml-2 text-gray-700">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              className={`w-full bg-gray-50 border-2 rounded-2xl p-3 outline-none transition-all ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 ml-2">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 ml-2 text-gray-700">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className={`w-full bg-gray-50 border-2 rounded-2xl p-3 outline-none transition-all ${errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 ml-2">
                {errors.password}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all mt-2"
          >
            {isLoading ? "Procesando..." : "Iniciar sesión"}
          </button>
          <footer className="mt-8 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <button
              type="button" // <--- AGREGA ESTO
              onClick={() => router.push("/auth/register")}
              className="text-blue-600 font-bold hover:underline"
            >
              Regístrate
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
};
export default LoginForm;
