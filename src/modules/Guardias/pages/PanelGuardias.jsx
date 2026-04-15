import { useState, useMemo, useEffect } from "react";
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
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useGuardiasDia } from "@/hooks/useGuardiasDia";
import { useAuth } from "@/context/AuthContext";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios"; // Importamos tu hook

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // Nuevos iconos
import { Calendar } from "@/components/ui/calendar"; // El componente Calendar de Shadcn
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, subDays, startOfDay } from "date-fns"; // Ayudantes de fecha

import { useProfesoresGuardia } from "@/hooks/useProfesoresGuardia";

export function PanelGuardias({
  fechaInicial = new Date(),
  modoTV = false,
  publicToken = null,
}) {
  const queryClient = useQueryClient();

  // 1. Estado para controlar la fecha seleccionada
  const [fecha, setFecha] = useState(startOfDay(fechaInicial));

  const fechaFmt = format(fecha, "yyyy-MM-dd");
  const { user } = useAuth();
  const { data: todosLosPeriodos, isLoading: loadingPeriodos } =
    usePeriodosHorarios();
  const { data, isLoading: loadingGuardias } = useGuardiasDia(fechaFmt, {
    tokenTV: publicToken, // <--- ESTO ES LO QUE FALTABA
    refetchInterval: modoTV ? 30000 : false,
  });

  const [tabActiva, setTabActiva] = useState("");

  // Agrupamos y ordenamos periodos
  const periodosUnicos = useMemo(() => {
    if (!data?.simulacion) return [];
    const mapaPeriodos = new Map();
    data.simulacion.forEach((s) => {
      if (!mapaPeriodos.has(s.periodo)) {
        mapaPeriodos.set(s.periodo, s.nombre_periodo || `${s.periodo}º Hora`);
      }
    });
    return Array.from(mapaPeriodos.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.id - b.id);
  }, [data]);

  const isLoading = loadingPeriodos || loadingGuardias;

  // 2. Lógica para detectar el periodo actual dinámicamente
  useEffect(() => {
    // Solo ejecutamos si tenemos ambos datos: los periodos maestros y las ausencias de hoy
    if (todosLosPeriodos && data?.simulacion && periodosUnicos.length > 0) {
      const ahora = format(new Date(), "HH:mm:ss"); // Formato compatible con 'time' de SQL

      // Buscamos en TODOS los periodos del centro cuál es el actual
      const periodoActual = todosLosPeriodos.find((p) => {
        return ahora >= p.inicio && ahora <= p.fin;
      });

      // Si hay un periodo actual Y ese periodo tiene ausencias hoy, lo seleccionamos
      if (
        periodoActual &&
        periodosUnicos.some((p) => p.id === periodoActual.id)
      ) {
        setTabActiva(String(periodoActual.id));
      } else {
        // Si no estamos en horario escolar o el periodo actual no tiene ausencias,
        // ponemos la primera pestaña disponible
        setTabActiva(String(periodosUnicos[0].id));
      }
    }
    // 2. LÓGICA DE ROTACIÓN AUTOMÁTICA (Solo para modo TV)
    if (modoTV && periodosUnicos.length > 1) {
      const intervaloRotacion = setInterval(() => {
        setTabActiva((currentTab) => {
          // Encontramos el índice de la pestaña actual
          const currentIndex = periodosUnicos.findIndex(
            (p) => String(p.id) === currentTab
          );
          // Calculamos el siguiente índice (y volvemos al principio si es el último)
          const nextIndex = (currentIndex + 1) % periodosUnicos.length;
          return String(periodosUnicos[nextIndex].id);
        });
      }, 15000); // 15 segundos

      // Limpiamos el intervalo si el componente se desmonta o cambian los periodos
      return () => clearInterval(intervaloRotacion);
    }
  }, [todosLosPeriodos, data, periodosUnicos, modoTV]);

  // Handlers para navegar rápido
  const irAyer = () => setFecha((prev) => subDays(prev, 1));
  const irMañana = () => setFecha((prev) => addDays(prev, 1));

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
      toast.success(data.mensaje || "Guardia asignada correctamente");
      queryClient.invalidateQueries({ queryKey: ["guardias-dia"] });
      queryClient.invalidateQueries({ queryKey: ["profes-guardia"] });
    },
    onError: (error) => {
      // Mostramos el error específico (ej: "No tienes guardia en este periodo")
      toast.error(error.message);
      queryClient.invalidateQueries({ queryKey: ["guardias-dia"] });
      queryClient.invalidateQueries({ queryKey: ["profes-guardia"] });
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
      queryClient.invalidateQueries({ queryKey: ["profes-guardia"] });
    },
    onError: (error) => {
      toast.error(error.message);
      queryClient.invalidateQueries({ queryKey: ["guardias-dia"] });
      queryClient.invalidateQueries({ queryKey: ["profes-guardia"] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* --- CABECERA CON SELECTOR DE FECHA --- */}
      {!modoTV && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              onClick={irAyer}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[240px] justify-start text-left font-bold shadow-sm border-none bg-white hover:bg-slate-50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {format(fecha, "EEEE, d 'de' MMMM", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={(d) => d && setFecha(d)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={irMañana}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* --- ESTADOS DE CARGA Y VACÍO --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">
            Sincronizando cuadrante y horarios...
          </p>
        </div>
      ) : periodosUnicos.length === 0 ? (
        <div className="text-center p-20 border-2 border-dashed rounded-xl bg-slate-50/50">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-medium text-slate-600">
            No hay ausencias
          </h3>
          <p className="text-muted-foreground">
            No se han registrado ausencias para el día{" "}
            {format(fecha, "dd/MM/yyyy")}.
          </p>
        </div>
      ) : (
        /* --- SISTEMA DE PESTAÑAS DINÁMICO --- */
        <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="h-15 p-1.5 bg-muted/50 border overflow-x-auto flex-nowrap gap-2">
              {periodosUnicos.map((p) => {
                const ahora = format(new Date(), "HH:mm:ss");
                const infoPeriodo = todosLosPeriodos?.find(
                  (tp) => tp.id === p.id
                );
                const esElActual =
                  infoPeriodo &&
                  ahora >= infoPeriodo.inicio &&
                  ahora <= infoPeriodo.fin;

                return (
                  <TabsTrigger
                    key={p.id}
                    value={String(p.id)}
                    className={`
          px-6 font-bold transition-all duration-300 relative overflow-hidden
          ${
            esElActual
              ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-primary/20 shadow-sm"
              : ""
          }
        `}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm">{p.nombre}</span>
                      {esElActual && (
                        <span
                          className={`
              text-[9px] uppercase tracking-tighter px-1.5 py-0 rounded-full
              ${
                tabActiva === String(p.id)
                  ? "bg-primary-foreground/20 text-white animate-pulse"
                  : "bg-primary/10 text-primary animate-pulse"
              }
            `}
                        >
                          Ahora
                        </span>
                      )}
                    </div>

                    {/* Glow sutil de fondo solo para el periodo actual */}
                    {esElActual && (
                      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    )}
                  </TabsTrigger>
                );
              })}
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* COLUMNA IZQUIERDA: Profesores de Guardia */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-2 px-1 text-slate-700">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">
                        Profesores de Guardia
                      </h3>
                    </div>
                    <ListaProfesGuardia fecha={fechaFmt} idPeriodo={p.id} />
                  </div>

                  {/* COLUMNA DERECHA: Ausencias */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-2 px-1 text-slate-700">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <h3 className="font-bold text-lg">Ausencias a cubrir</h3>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {ausenciasEnPeriodo.map((item, idx) => (
                        <GuardiaCard
                          key={idx}
                          item={item}
                          modoTV={modoTV}
                          uidUsuarioActual={user?.username}
                          onAsignar={() =>
                            mutationAuto.mutate({
                              fecha: fechaFmt,
                              idperiodo: item.periodo,
                              uid_profesor_ausente: item.uid_ausente,
                            })
                          }
                          onCancelar={() => mutationCancelar.mutate(item.id)}
                          loading={
                            mutationAuto.isPending || mutationCancelar.isPending
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

function GuardiaCard({
  item,
  onAsignar,
  onCancelar,
  loading,
  uidUsuarioActual,
  modoTV,
}) {
  const esConfirmada = item.tipo === "confirmada";
  const esMia = esConfirmada && item.uid_profesor_cubridor === uidUsuarioActual;

  return (
    <Card
      className={`group relative transition-all duration-200 border-none shadow-sm hover:shadow-md ring-1 ${
        esConfirmada
          ? esMia
            ? "ring-blue-200 bg-blue-50/20"
            : "ring-green-200 bg-green-50/20"
          : "ring-orange-200 bg-orange-50/20"
      }`}
    >
      {/* Reducimos el padding de p-5 a p-3 para ganar espacio */}
      <CardContent className="p-3 flex items-center gap-3">
        {/* Indicador visual más pequeño (w-10 h-10) */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${
            esConfirmada
              ? esMia
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {esConfirmada ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
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

          <h4 className="font-bold text-base truncate text-slate-800 leading-tight">
            {item.nombre_ausente || item.uid_ausente}
          </h4>

          <div className="flex flex-wrap items-center gap-1 mt-1">
            <Badge
              variant="outline"
              className="text-[9px] h-4 px-1 bg-white/50 border-slate-200"
            >
              Aula: {item.aula || "---"}
            </Badge>
            <Badge
              variant="outline"
              className="text-[9px] h-4 px-1 bg-white/50 border-slate-200"
            >
              Grupos: {item.grupo || "---"}
            </Badge>
            <span className="text-[10px] italic text-slate-500 truncate max-w-[100px]">
              {item.materia || "Sin materia"}
            </span>
          </div>
        </div>

        {/* Botones de acción: Solo si NO es modoTV */}
        {!modoTV && (
          <div className="ml-1">
            {esConfirmada ? (
              <div className="flex flex-col items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shadow-md ${
                    esMia ? "bg-blue-600" : "bg-green-600"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-white" />
                </div>
                {esMia && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancelar}
                    disabled={loading}
                    className="h-6 px-1 text-[9px] text-red-600"
                  >
                    Liberar
                  </Button>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={onAsignar}
                disabled={loading}
                className="h-8 px-3 bg-orange-600 text-xs text-white"
              >
                Cubrir
              </Button>
            )}
          </div>
        )}

        {/* Si es modoTV y está cubierta, mostramos quién la cubre sutilmente */}
        {modoTV && esConfirmada && (
          <div className="flex flex-col items-end">
            <div className="bg-green-600 p-1.5 rounded-full shadow-sm">
              <UserCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-[8px] font-black text-green-700 mt-1 uppercase">
              {item.uid_profesor_cubridor}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ListaProfesGuardia({ fecha, idPeriodo }) {
  const { data: profes, isLoading } = useProfesoresGuardia(fecha, idPeriodo);

  if (isLoading) return <div className="animate-pulse space-y-2">...</div>;

  return (
    <div className="space-y-3">
      {profes?.map((profe) => {
        const estaOcupado = profe.ya_asignado;

        return (
          <Card
            key={profe.uid}
            className={`transition-all duration-300 border shadow-none ${
              estaOcupado
                ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <CardContent className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                {/* Indicador de estado */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    estaOcupado ? "bg-blue-500 animate-pulse" : "bg-slate-300"
                  }`}
                />

                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${estaOcupado ? "text-blue-900" : "text-slate-700"}`}
                  >
                    {profe.apellido1}
                    {profe.nombre ? `, ${profe.nombre}` : ""}
                  </p>
                  {estaOcupado && (
                    <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-tight">
                      Guardia asignada
                    </p>
                  )}
                </div>
              </div>

              <Badge
                variant="outline"
                className={`ml-2 font-mono h-6 ${
                  estaOcupado
                    ? "bg-blue-600 text-white border-transparent"
                    : "bg-slate-100"
                }`}
              >
                {profe.total_guardias} <Clock className="w-3 h-3 ml-1" />
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
