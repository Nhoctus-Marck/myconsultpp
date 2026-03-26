"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/client";
import { registerSchema } from "@/lib/schemas/auth";
import { registerEmployee } from "@/app/actions/adminActions";

export const RegisterForm = ({ clinicId }) => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [clinics, setClinics] = useState([]);
  const [selectedRole, setSelectedRole] = useState("doctor");

  useEffect(() => {
    async function fetchClinics() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from("memberships")
        .select("clinics(id, name)")
        .eq("user_id", user.id)
        .eq("role", "admin");
      
      if (data) {
        const clinicList = data.map(m => m.clinics).flat();
        setClinics(clinicList);
      }
    }
    fetchClinics();
  }, []);

  async function handleSubmit(formData) {
    setIsLoading(true);
    setErrors({});

    const data = {
      firstName: formData.get("firstName"),
      email: formData.get("email"),
      password: formData.get("password"),
      clinicId: formData.get("clinicId"),
      role: formData.get("role"),
      specialty: formData.get("specialty") || null,
      licenseNumber: formData.get("license_number") || null,
    };

    const result = registerSchema.safeParse(data);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setIsLoading(false);
      return;
    }

    const response = await registerEmployee(data);

    if (response.error) {
      setErrors({ general: response.error });
      setIsLoading(false);
      return;
    }

    alert("Empleado creado con éxito");
    window.location.href = "/select_clinic";
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-2xl w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Registrar empleado
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
              Clínica
            </label>
            <select
              name="clinicId"
              required
              defaultValue={clinicId || ""}
              className="w-full bg-gray-50 border-2 rounded-2xl p-3 outline-none transition-all border-gray-200 focus:border-blue-500"
            >
              <option value="" disabled>Selecciona una clínica</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 ml-2 text-gray-700">
              Rol
            </label>
            <select
              name="role"
              required
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-gray-50 border-2 rounded-2xl p-3 outline-none transition-all border-gray-200 focus:border-blue-500"
            >
              <option value="doctor">Doctor</option>
              <option value="receptionist">Recepcionista</option>
            </select>
          </div>

          {selectedRole === "doctor" && (
            <>
              <div>
                <label className="block text-sm font-bold mb-2 ml-2 text-gray-700">
                  Especialidad
                </label>
                <input
                  name="specialty"
                  type="text"
                  placeholder="Ej. Cardiología"
                  className="w-full bg-gray-50 border-2 rounded-2xl p-3 outline-none transition-all border-gray-200 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 ml-2 text-gray-700">
                  Número de licencia
                </label>
                <input
                  name="license_number"
                  type="text"
                  placeholder="Ej. MP-12345"
                  className="w-full bg-gray-50 border-2 rounded-2xl p-3 outline-none transition-all border-gray-200 focus:border-blue-500"
                />
              </div>
            </>
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

          <button
            type="button"
            onClick={() => router.push("/select_clinic")}
            className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all"
          >
            Volver
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
