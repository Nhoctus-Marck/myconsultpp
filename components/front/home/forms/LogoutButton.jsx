"use client";
import React from "react";
import { createClient } from "@/lib/supabase/client"; // Ajusta tu ruta de cliente

export const LogoutButton = () => {
  const supabase = createClient();

  const handleLogout = async () => {
    // 1. Cerramos sesión en Supabase
    await supabase.auth.signOut();
    
    // 2. Limpiamos caché y redirigimos al login
    // Usamos window.location para asegurar que el middleware detecte el cambio de cookie
    window.location.href = "/auth/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-red-100 group"
    >
      <svg 
        xmlns="http://www.w3.org" 
        className="h-4 w-4 transition-transform group-hover:translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Cerrar sesión
    </button>
  );
};