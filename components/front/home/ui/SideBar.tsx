"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, CreditCard, BarChart3, ChevronLeft, ChevronRight, Building2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const menuItems = [
  { name: "Dashboard", href: "dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist"] },
  { name: "Doctores", href: "dashboard/doctors", icon: Stethoscope, roles: ["admin"] },
  { name: "Patients", href: "dashboard/patients", icon: Users, roles: ["admin", "doctor", "receptionist"] },
  { name: "Turnos", href: "dashboard/turnos", icon: CalendarDays, roles: ["admin", "doctor", "receptionist"] },
  { name: "Pagos", href: "dashboard/pagos", icon: CreditCard, roles: ["admin", "receptionist"] },
  { name: "Reportes", href: "dashboard/reportes", icon: BarChart3, roles: ["admin", "receptionist"] },
];

// 1. Agregamos 'clinicName' a las props
export function Sidebar({ 
  role, 
  clinicId, 
  clinicName // <--- Nueva prop recibida desde el layout
}: { 
  role: string | null; 
  clinicId: string; 
  clinicName: string; // <--- Tipado
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(role?.toLowerCase() || "")
  );

  if (!mounted) return <div className="w-64 border-r h-screen bg-white" />;

  return (
    <aside className={cn(
      "relative flex flex-col border-r bg-white transition-all duration-300 h-full", 
      isCollapsed ? "w-[80px]" : "w-64"
    )}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* SECCIÓN DEL NOMBRE DE LA CLÍNICA */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          {/* Un icono pequeño de edificio para cuando esté colapsado */}
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shrink-0">
            <Building2 size={18} />
          </div>
          {!isCollapsed && (
            <h2 className="font-bold text-gray-900 truncate text-lg uppercase tracking-tight">
              {clinicName || "E.R.M.I.S"}
            </h2>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {filteredItems.map((item) => {
          const fullHref = `/${clinicId}/${item.href}`;
          const isActive = pathname === fullHref || pathname?.startsWith(`${fullHref}/`);

          return (
            <Link
              key={item.name}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all group",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
              )} />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <>
          {role === "admin" && (
            <div className="px-3 pb-2">
              <Link 
                href="/auth/register" 
                className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
                + Nuevo Empleado
              </Link>
            </div>
          )}
          <div className="p-4 border-t bg-gray-50/50">
            <Link 
              href="/select_clinic" 
              className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
            >
              ← Cambiar de Clínica
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}