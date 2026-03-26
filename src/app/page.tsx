import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700">
      {/* Sección Hero con Estilo */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 text-white">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-md">
          E.R.M.I.S
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-10 text-blue-100 font-light">
          Gestión clínica inteligente. Agende sus turnos, administre sus pacientes 
          y controle su consultorio desde un solo lugar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/auth/login" 
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-xl hover:bg-blue-50 transition-all transform hover:scale-105"
          >
            Iniciar Sesión
          </Link>
          
        </div>
      </main>

      {/* Tarjetas de Características Rápidas */}
      <section className="bg-white/10 backdrop-blur-md py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/20">
        <div className="text-center text-white p-4">
          <h3 className="font-bold text-lg">Multi-Sede</h3>
          <p className="text-sm text-blue-100">Administra múltiples clínicas con un solo usuario.</p>
        </div>
        <div className="text-center text-white p-4 border-x border-white/10">
          <h3 className="font-bold text-lg">Historias Clínicas</h3>
          <p className="text-sm text-blue-100">Seguridad total en el manejo de datos de pacientes.</p>
        </div>
        <div className="text-center text-white p-4">
          <h3 className="font-bold text-lg">Pagos y Reportes</h3>
          <p className="text-sm text-blue-100">Control financiero detallado de tu consultorio.</p>
        </div>
      </section>
    </div>
  );
}