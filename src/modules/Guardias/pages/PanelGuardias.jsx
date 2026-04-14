import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useGuardiasDia } from "@/hooks/useGuardiasDia";
import { useAuth } from "@/context/AuthContext";

export function PanelGuardias({ fecha = new Date() }) {
  const queryClient = useQueryClient();
  const fechaFmt = format(fecha, "yyyy-MM-dd");
  const { user } = useAuth();
  const { data, isLoading } = useGuardiasDia(fechaFmt);

  const mutationAuto = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/db/guardias/autoasignar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      // Si el backend responde con error (401, 403, 409, 500...),
      // lanzamos el error con el mensaje que viene del backend
      if (!res.ok) {
        throw new Error(result.error || "No se pudo asignar la guardia");
      }

      return result;
    },
    onSuccess: (data) => {
      // Mostramos el mensaje de éxito que viene del backend
      toast.success(data.mensaje || "Guardia asignada correctamente");
      // Refrescamos los datos para que desaparezca el botón de "Cubrir"
      queryClient.invalidateQueries({ queryKey: ["guardias-dia"] });
    },
    onError: (error) => {
      // Mostramos el error específico (ej: "No tienes guardia en este periodo")
      toast.error(error.message);
    },
  });

  const mutationCancelar = useMutation({
    mutationFn: async (idAsignacion) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/db/guardias/cancelar/${idAsignacion}`,
        { method: "DELETE", credentials: "include" }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al liberar");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.mensaje);
      queryClient.invalidateQueries({ queryKey: ["guardias-dia"] });
    },
    onError: (error) => toast.error(error.message),
  });

  // Agrupamos y ordenamos periodos
  const periodosUnicos = useMemo(() => {
    if (!data?.simulacion) return [];

    const mapaPeriodos = new Map();
    data.simulacion.forEach((s) => {
      // Si el mapa no tiene este ID, lo guardamos con su nombre descriptivo
      if (!mapaPeriodos.has(s.periodo)) {
        mapaPeriodos.set(s.periodo, s.nombre_periodo || `${s.periodo}º Hora`);
      }
    });

    return Array.from(mapaPeriodos.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.id - b.id);
  }, [data]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">
          Cargando cuadrante...
        </p>
      </div>
    );

  if (periodosUnicos.length === 0)
    return (
      <div className="text-center p-20 border-2 border-dashed rounded-xl">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
        <h3 className="mt-4 text-lg font-medium">No hay ausencias</h3>
        <p className="text-muted-foreground">
          No se han registrado ausencias para el día seleccionado.
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Panel de Guardias
          </h2>
          <p className="text-muted-foreground">
            Gestión de sustituciones y avisos
          </p>
        </div>
        <Badge
          variant="secondary"
          className="text-md py-1.5 px-4 shadow-sm w-fit"
        >
          {format(fecha, "EEEE, d 'de' MMMM", { locale: es })}
        </Badge>
      </div>

      {/* SISTEMA DE PESTAÑAS */}
      <Tabs defaultValue={String(periodosUnicos[0]?.id)} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="h-12 p-1 bg-muted/50 border overflow-x-auto flex-nowrap">
            {periodosUnicos.map((p) => (
              <TabsTrigger
                key={p.id}
                value={String(p.id)}
                className="px-6 font-bold"
              >
                {p.nombre}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {periodosUnicos.map((p) => {
          const ausenciasEnPeriodo = data.simulacion.filter(
            (s) => s.periodo === p.id
          );

          return (
            <TabsContent
              key={p.id}
              value={String(p.id)}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ausenciasEnPeriodo.map((item, idx) => (
                  <GuardiaCard
                    key={idx}
                    item={item}
                    uidUsuarioActual={user?.username}
                    onAsignar={() =>
                      mutationAuto.mutate({
                        fecha: fechaFmt,
                        idperiodo: item.periodo,
                        uid_profesor_ausente: item.uid_ausente,
                      })
                    }
                    onCancelar={() => mutationCancelar.mutate(item.id)}
                    // Y actualizamos el loading para que bloquee el botón en ambas acciones:
                    loading={
                      mutationAuto.isLoading || mutationCancelar.isLoading
                    }
                  />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function GuardiaCard({
  item,
  onAsignar,
  onCancelar,
  loading,
  uidUsuarioActual,
}) {
  const esConfirmada = item.tipo === "confirmada";
  // Verificamos si la guardia la he cubierto YO
  const esMia = esConfirmada && item.uid_profesor_cubridor === uidUsuarioActual;

  return (
    <Card
      className={`group relative transition-all duration-200 border-none shadow-sm hover:shadow-md ring-1 ${
        esConfirmada
          ? esMia
            ? "ring-blue-200 bg-blue-50/20" // Un tono azul si es mía para diferenciar
            : "ring-green-200 bg-green-50/20"
          : "ring-orange-200 bg-orange-50/20"
      }`}
    >
      <CardContent className="p-5 flex items-center gap-4">
        {/* INDICADOR VISUAL IZQUIERDO */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${
            esConfirmada
              ? esMia
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {esConfirmada ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>

        {/* CONTENIDO PRINCIPAL (Sin cambios significativos, solo color de badge) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                esConfirmada
                  ? esMia
                    ? "bg-blue-200/50 text-blue-700"
                    : "bg-green-200/50 text-green-700"
                  : "bg-orange-200/50 text-orange-700"
              }`}
            >
              {esConfirmada ? (esMia ? "Tuya" : "Cubierta") : "Pendiente"}
            </span>
          </div>
          <h4 className="font-bold text-lg truncate text-slate-800">
            {item.nombre_ausente || item.uid_ausente}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1 rounded-sm bg-white/50"
            >
              {item.aula || "---"}
            </Badge>
            <span className="truncate italic">
              {item.materia || "Sin materia"}
            </span>
          </div>
        </div>

        {/* SECCIÓN DE ACCIÓN (Cambios aquí) */}
        <div className="ml-2">
          {esConfirmada ? (
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white ${
                  esMia ? "bg-blue-600" : "bg-green-600"
                }`}
              >
                <UserCheck className="w-4 h-4 text-white" />
              </div>

              {/* Si es mía, permito cancelar. Si no, solo muestro el UID */}
              {esMia ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelar}
                  disabled={loading}
                  className="h-7 px-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {loading ? "..." : "Liberar"}
                </Button>
              ) : (
                <span className="text-[9px] font-bold text-green-700 mt-1 uppercase">
                  {item.uid_profesor_cubridor}
                </span>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={onAsignar}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
            >
              {loading ? "Asignando..." : "Cubrir"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
