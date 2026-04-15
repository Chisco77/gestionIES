import { useParams } from "react-router-dom";
import { PanelGuardias } from "./PanelGuardias";
import { Clock, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RelojPeriodo } from "@/modules/Utilidades/components/RelojPeriodo";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

export function PanelProyeccion() {
  const { token } = useParams();
  const [hora, setHora] = useState(new Date());
  const { data: periodosDB = [] } = usePeriodosHorarios();

  // Reloj en tiempo real para la pantalla
  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* CABECERA: Fondo blanco, sombras suaves y acentos primary */}
      <header className="relative flex h-[80px] items-center justify-between px-8 bg-blue-500 text-white shadow-lg z-10">
        {/* IZQUIERDA: Logo e Identificación */}
        <div className="flex items-center gap-4 min-w-[280px]">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">
              Panel de Guardias
            </h1>
            <p className="text-blue-100 text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">
              Gestión en tiempo real
            </p>
          </div>
        </div>

        {/* CENTRO: Reloj de Periodo (Asegúrate de que RelojPeriodo use text-white) */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md border border-white/10">
            <RelojPeriodo periodos={periodosDB} />
          </div>
        </div>

        {/* DERECHA: Fecha de Hoy */}
        <div className="flex items-center justify-end gap-4 min-w-[280px] text-right">
          <div className="h-10 w-[1px] bg-white/20 mr-2" />
          <div className="flex flex-col">
            <p className="text-xs font-black text-blue-100 uppercase tracking-widest opacity-90">
              {format(new Date(), "EEEE", { locale: es })}
            </p>
            <p className="text-lg font-extrabold leading-tight">
              {format(new Date(), "d 'de' MMMM", { locale: es })}
            </p>
          </div>
        </div>
      </header>

      {/* CUERPO: El PanelGuardias ya trae sus fondos blancos y bordes suaves */}
      <main className="p-8 pb-24">
        <div className="max-w-[1600px] mx-auto">
          {/* El modoTV={true} ocultará los botones de "Cubrir/Liberar" que pusimos en el componente hijo */}
          <PanelGuardias modoTV={true} publicToken={token} />
        </div>
      </main>

      {/* FOOTER: Sutil y profesional */}
      <footer className="fixed bottom-0 w-full py-4 px-10 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-between items-center text-slate-400">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
          IES Francisco de Orellana{" "}
          <span className="text-slate-300 mx-2">|</span> Trujillo
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Conexión Segura establecida
          </p>
        </div>
      </footer>
    </div>
  );
}
