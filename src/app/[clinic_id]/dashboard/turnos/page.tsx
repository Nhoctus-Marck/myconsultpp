"use client";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function TurnosPage({ params }: { params: Promise<{ clinic_id: string }> }) {
  const { clinic_id } = use(params);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const clinicId = clinic_id;

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const res = await fetch(`/api/appointments?clinic_id=${clinicId}&month=${month}&year=${year}`);
      const data = await res.json();
      
      setAppointments(data || []);
      setLoading(false);
    }

    fetchAppointments();
  }, [currentDate, clinicId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getAppointmentsForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const targetDateStr = targetDate.toISOString().split("T")[0];
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointment_date).toISOString().split("T")[0];
      return aptDate === targetDateStr && apt.status === "scheduled";
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const today = new Date();
  const isToday = (day: number) => 
    today.getDate() === day && 
    today.getMonth() === currentDate.getMonth() && 
    today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Turnos</h1>
        <Link
          href={`turnos/new`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Nuevo Turno
        </Link>
      </div>

        {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b bg-slate-50">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r bg-slate-50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayAppointments = getAppointmentsForDay(day);

            return (
              <div
                key={day}
                className="min-h-[100px] border-b border-r p-1 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-medium ${isToday(day) ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : "text-slate-700"}`}>
                    {day}
                  </div>
                  <a
                    href={`turnos/new?date=${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    +
                  </a>
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt: any) => (
                    <Link
                      key={apt.id}
                      href={`turnos/${apt.id}`}
                      className={`block text-xs p-1 rounded truncate ${
                        apt.status === "completed" ? "bg-green-100 text-green-700" :
                        apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {new Date(apt.appointment_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} - {apt.patients?.name}
                    </Link>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-slate-500">+{dayAppointments.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de turnos */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Todos los Turnos</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Hora</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Paciente</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Doctor</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(appointments || []).map((apt: any) => (
                <tr key={apt.id} className="border-t border-slate-100">
                  <td className="p-4">
                    {new Date(apt.appointment_date).toLocaleDateString("es-AR")}
                  </td>
                  <td className="p-4">
                    {new Date(apt.appointment_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-4 font-medium">{apt.patients?.name || "Sin paciente"}</td>
                  <td className="p-4">{apt.doctors?.specialty || "Sin asignar"}</td>
                  <td className="p-4">
                    <Link
                      href={`turnos/${apt.id}`}
                      className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                        apt.status === "completed" ? "bg-green-100 text-green-700" :
                        apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {apt.status === "completed" ? "Atendido" : apt.status === "cancelled" ? "Cancelado" : "Pendiente"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
