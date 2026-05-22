import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  FileText,
  CheckCircle2,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { useReservasUid } from "@/hooks/Reservas/useReservasUid";
import { usePermisosUid } from "@/hooks/Permisos/usePermisosUid";
import { useExtraescolaresUid } from "@/hooks/Extraescolares/useExtraescolaresUid";
import { useEmpleados } from "@/hooks/useEmpleados";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { formatDatePretty } from "@/utils/fechasHoras";
import { formatDate } from "date-fns";

export function PanelContadoresUsuario({ uid }) {
  const { data: reservas = [], isLoading: loadingR } = useReservasUid(uid);
  const { data: asuntos = [], isLoading: loadingA } = usePermisosUid(uid);
  const { data: extraescolares = [], isLoading: loadingE } =
    useExtraescolaresUid(uid);
  const { data: empleados = [] } = useEmpleados();
  const empleado = empleados.find((e) => e.uid === uid) || {
    asuntos_propios: 4,
  };
  const totalDisponibles = empleado.asuntos_propios || 4;

  const getBadgeStyles = (estado) => {
    switch (Number(estado)) {
      case 1:
        return "bg-emerald-100 text-emerald-700 border-emerald-200"; // Aceptado
      case 2:
        return "bg-red-100 text-red-700 border-red-200"; // Rechazado
      default:
        return "bg-amber-100 text-amber-700 border-amber-200"; // Pendiente
    }
  };

  const getEstadoLabel = (estado) => {
    switch (Number(estado)) {
      case 1:
        return "Aceptado";
      case 2:
        return "Rechazado";
      default:
        return "Pendiente";
    }
  };

  const stats = useMemo(() => {
    const asuntosPropios = asuntos.filter((a) => a.tipo === 13);
    const otrosPermisos = asuntos.filter((a) => a.tipo !== 13);

    return {
      reservas: reservas.length,
      extraescolares: extraescolares.length,
      asuntos: {
        total: asuntosPropios.length,
        aceptados: asuntosPropios.filter((a) => a.estado === 1).length,
      },
      permisos: {
        total: otrosPermisos.length,
        aceptados: otrosPermisos.filter((a) => a.estado === 1).length,
      },
    };
  }, [reservas, asuntos, extraescolares]);

  if (loadingR || loadingA || loadingE) {
    return (
      <div className="h-[76px] flex items-center justify-center border rounded-xl bg-slate-50/50">
        <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {/* Bloque Reservas */}
      <AccordionItem
        value="item-1"
        className="border rounded-lg overflow-hidden"
      >
        <AccordionTrigger className="hover:no-underline p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-purple-50 text-purple-600">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Mis Reservas de aulas
              </p>
              <span className="text-sm font-bold text-slate-700">
                {stats.reservas}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3 border-t">
          {reservas.map((r) => (
            <div
              key={r.id}
              className="flex flex-col py-2 border-b last:border-0 text-left"
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {formatDatePretty(r.fecha)}
              </span>
              <span className="text-xs text-slate-700 font-medium">
                {r.nombre_estancia} - {r.descripcion}
              </span>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* Bloque Extraescolares */}
      <AccordionItem
        value="item-2"
        className="border rounded-lg overflow-hidden"
      >
        <AccordionTrigger className="hover:no-underline p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-orange-50 text-orange-600">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Extraescolares y Complementarias
              </p>
              <span className="text-sm font-bold text-slate-700">
                {stats.extraescolares}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3 border-t">
          {extraescolares.map((e) => (
            <div className="flex flex-col py-2 border-b last:border-0 text-left gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {formatDatePretty(e.fecha_inicio)} al{" "}
                {formatDatePretty(e.fecha_fin)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 font-medium">
                  {e.descripcion || "Sin descripción"}
                </span>
                {e.estado !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] border font-medium whitespace-nowrap ${getBadgeStyles(e.estado)}`}
                  >
                    {getEstadoLabel(e.estado)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* Bloque Asuntos Propios */}
      <AccordionItem
        value="item-3"
        className="border rounded-lg overflow-hidden"
      >
        <AccordionTrigger className="hover:no-underline p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Asuntos Propios
              </p>
              <div className="flex gap-2 text-[10px] text-slate-600">
                <span>{stats.asuntos.total} Solicitados</span>
                <span>{stats.asuntos.aceptados} Aceptados</span>
                <span className="font-bold text-blue-600">
                  {totalDisponibles - stats.asuntos.aceptados} Disponibles
                </span>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3 border-t">
          {asuntos
            .filter((a) => a.tipo === 13)
            .map((a) => (
              <div className="flex flex-col py-2 border-b last:border-0 text-left gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {formatDatePretty(a.fecha)} al {formatDatePretty(a.fecha_fin)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-700 font-medium">
                    {a.descripcion || "Sin descripción"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] border font-medium whitespace-nowrap ${getBadgeStyles(a.estado)}`}
                  >
                    {getEstadoLabel(a.estado)}
                  </span>
                </div>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>

      {/* Bloque Otros Permisos */}
      <AccordionItem
        value="item-4"
        className="border rounded-lg overflow-hidden"
      >
        <AccordionTrigger className="hover:no-underline p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Otros Permisos
              </p>
              <span className="text-sm font-bold text-slate-700">
                {stats.permisos.total}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3 border-t">
          {asuntos
            .filter((a) => a.tipo !== 13)
            .map((a) => (
              <div className="flex flex-col py-2 border-b last:border-0 text-left gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {formatDatePretty(a.fecha)} al {formatDatePretty(a.fecha_fin)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-700 font-medium">
                    {a.descripcion || "Sin descripción"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] border font-medium whitespace-nowrap ${getBadgeStyles(a.estado)}`}
                  >
                    {getEstadoLabel(a.estado)}
                  </span>
                </div>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
