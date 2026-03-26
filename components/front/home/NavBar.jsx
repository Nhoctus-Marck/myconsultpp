import React from "react";
import { LogoutButton } from "../home/forms/LogoutButton";
import Link from "next/link"; 

export const NavBar = ({ user }) => {
  return (
    <div className="sticky top-0 z-50 flex flex-col md:flex-row h-auto md:h-20 border-b-2 border-lime-800/30 items-center bg-neutral-50 px-4 py-2 md:py-0">
      
      {/* Logo */}
      <div className="w-full md:w-1/6 h-12 md:h-15 flex items-center justify-center bg-white/90 text-lime-800 font-mono uppercase tracking-widest text-2xl md:text-3xl border-2 md:border-y md:border-l border-lime-800/30 rounded-sm">
        E.R.M.I.S
      </div>

      {/* Links Centrales */}
      <div className="w-full md:w-1/2 mx-0 md:mx-auto my-2 md:my-0 h-12 md:h-16 flex items-center justify-center bg-white/90 text-lime-800 border-y border-lime-800 rounded-sm">
        <section className="flex flex-row justify-between w-full px-4 md:px-8 font-mono uppercase tracking-widest text-xs md:text-sm">
          <a href="#" className="hover:underline">Turnos</a>
          <a href="#" className="hover:underline">Horarios</a>
          <a href="#" className="hover:underline">Doctores</a>
        </section>
      </div>

      {/* Sección de Botón Dinámico */}
      <div className="w-full md:w-1/4 h-10 md:h-15 flex items-center justify-center bg-white/90 text-lime-800 font-mono uppercase tracking-widest text-xs md:text-sm border-2 border-lime-800/30 rounded-sm">
        {user ? (
          <LogoutButton />
        ) : (
          <Link 
            href="/auth/login" 
            className="w-full h-full flex items-center justify-center hover:bg-lime-800 hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
      
    </div>
  );
};