import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen"> 
        {/* Dejamos que cada página (Home o Dashboard) defina su fondo */}
        {children}
      </body>  
    </html>
  );
}