"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";
import { registerSchema } from "@/lib/schemas/auth";

export const RegisterForm = () => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit(formData) {
    setIsLoading(true);
    setErrors({});

    const data = {
      firstName: formData.get("firstName"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = registerSchema.safeParse(data);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setIsLoading(false);
      return;
    }

    // CAMBIO AQUÍ: Llamamos a la acción de servidor en lugar de supabase.auth.signUp
    const response = await registerEmployee(data);

    if (response.error) {
      setErrors({ general: response.error });
      setIsLoading(false);
      return;
    }

    // Si todo sale bien, puedes limpiar el form o avisar que se creó
    alert("Empleado creado con éxito");
    window.location.href = "/front/auth/login";
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-2xl w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Crea tu cuenta
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
              Nombre completo
            </label>
            <input
              name="firstName"
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              className={`w-full bg-gray-50 border-2 rounded-2xl p-3 outline-none transition-all ${errors.firstName ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1 ml-2">
                {errors.firstName}
              </p>
            )}
          </div>

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
            {isLoading ? "Procesando..." : "Registrarse"}
          </button>
        </form>

        <footer className="mt-8 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <button
            onClick={() => router.push("/front/auth/login")}
            className="text-blue-600 font-bold hover:underline"
          >
            Inicia sesión
          </button>
        </footer>
      </div>
    </main>
  );
};
