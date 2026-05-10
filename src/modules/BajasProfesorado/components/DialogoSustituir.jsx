import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfesoresActivos } from "@/hooks/useProfesoresActivos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getCursoActual } from "@/utils/fechasHoras";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react"; // Para darle un toque visual de advertencia

export function DialogoSustituir({ open, onOpenChange, onSuccess }) {
  const queryClient = useQueryClient(); // 2. Inicializamos el cliente
  const { data: profesores = [] } = useProfesoresActivos();
  const [titularUid, setTitularUid] = useState("");
  const [sustitutoUid, setSustitutoUid] = useState("");
  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [observaciones, setObservaciones] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cursoAcademico] = useState(getCursoActual().label);

  // Nuevo estado para controlar el diálogo de confirmación final
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!open) {
      setTitularUid("");
      setSustitutoUid("");
      setObservaciones("");
      setCargando(false);
      setMostrarConfirmacion(false);
    }
  }, [open]);

  // Paso 1: Validar campos y abrir confirmación
  const preGuardarSustitucion = () => {
    if (!titularUid || !sustitutoUid || !fechaInicio) {
      return toast.error("Por favor, rellena los campos obligatorios");
    }
    setMostrarConfirmacion(true);
  };

  // Paso 2: Ejecución real del proceso
  // Asegúrate de tener esta línea al principio de tu componente:
  // const queryClient = useQueryClient();

  const ejecutarSustitucion = async () => {
    // 1. Cerramos el diálogo de confirmación y activamos el estado de carga
    setMostrarConfirmacion(false);
    setCargando(true);

    try {
      // PASO 1: Registrar la sustitución en la BD
      // Este endpoint también se encarga de limpiar las guardias del titular
      const resSust = await fetch(`${API_URL}/db/sustituciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid_titular: titularUid,
          uid_sustituto: sustitutoUid,
          fecha_inicio: fechaInicio,
          observaciones,
        }),
      });

      const dataSust = await resSust.json();
      if (!dataSust.ok) {
        throw new Error(dataSust.error || "Error al crear la sustitución");
      }

      // PASO 2: Duplicar el horario del titular al sustituto
      const resHorario = await fetch(
        `${API_URL}/db/horario-profesorado/duplicar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uidOrigen: titularUid,
            uidDestino: sustitutoUid,
            curso_academico: cursoAcademico,
          }),
        },
      );

      const dataHorario = await resHorario.json();
      if (!dataHorario.ok) {
        // Opcional: Podrías lanzar error o simplemente avisar que el horario falló
        console.warn(
          "La sustitución se creó pero hubo problemas con el horario",
        );
      }

      // PASO 3: Invalidar la caché de React Query
      // Esto hace que la tabla de sustituciones se refresque automáticamente
      await queryClient.invalidateQueries({ queryKey: ["sustituciones"] });

      // Opcional: Si tienes otras pantallas abiertas que dependan de esto:
      await queryClient.invalidateQueries({ queryKey: ["horario-profesorado"] });

      // Feedback visual al usuario
      toast.success(
        `Sustitución registrada con éxito. Se han asignado ${dataHorario.total || 0} sesiones de horario al sustituto.`,
      );

      // PASO 4: Notificar al padre y cerrar el diálogo principal
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Error en el proceso de sustitución:", err);
      toast.error(err.message || "Ocurrió un error inesperado");
    } finally {
      setCargando(false);
    }
  };

  // Obtener nombres para el diálogo de confirmación
  const nombreTitular = profesores.find((p) => p.uid === titularUid);
  const nombreSustituto = profesores.find((p) => p.uid === sustitutoUid);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 overflow-hidden sm:max-w-[500px] border-none"
        >
          <DialogHeader className="bg-green-600 text-white py-4 px-6">
            <DialogTitle>Registrar Nueva Sustitución</DialogTitle>
          </DialogHeader>

          <Card className="border-none shadow-none">
            <CardContent className="py-6 space-y-4">
              <div className="space-y-1">
                <Label>Profesor Titular (Sale)</Label>
                <Select value={titularUid} onValueChange={setTitularUid}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el profesor ausente" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesores.map((p) => (
                      <SelectItem key={p.uid} value={p.uid}>
                        {p.givenName} {p.sn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Profesor Sustituto (Entra)</Label>
                <Select value={sustitutoUid} onValueChange={setSustitutoUid}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el sustituto" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesores
                      .filter((p) => p.uid !== titularUid)
                      .map((p) => (
                        <SelectItem key={p.uid} value={p.uid}>
                          {p.givenName} {p.sn}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Fecha Inicio</Label>
                  <Input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Curso</Label>
                  <Input
                    value={cursoAcademico}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Observaciones</Label>
                <Input
                  placeholder="Ej: Sustitución por IT larga duración"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground italic">
                * Al confirmar, se clonará el horario y se eliminarán las
                guardias asignadas al titular.
              </p>
            </CardContent>
          </Card>

          <DialogFooter className="px-6 py-4 bg-gray-50">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={preGuardarSustitucion}
              disabled={cargando}
              className="bg-green-600 hover:bg-green-700"
            >
              {cargando ? "Procesando..." : "Confirmar Sustitución"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMACIÓN CRÍTICA */}
      <Dialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-[450px]"
        >
          <DialogHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle>¿Estás seguro de continuar?</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm">
            <p>Se va a proceder con la siguiente acción:</p>
            <ul className="list-disc pl-5 space-y-1 font-medium">
              <li>
                Registrar a{" "}
                <span className="text-green-700">
                  {nombreSustituto?.givenName} {nombreSustituto?.sn}
                </span>{" "}
                como sustituto/a de{" "}
                <span className="text-red-700">
                  {nombreTitular?.givenName} {nombreTitular?.sn}
                </span>{" "}
              </li>
              <li>
                Eliminar todas las guardias activas de{" "}
                <span className="text-red-700">
                  {nombreTitular?.givenName} {nombreTitular?.sn}
                </span>{" "}
                desde el {fechaInicio}.
              </li>
              <li>Sobrescribir el horario del sustituto con el del titular.</li>
            </ul>
            <p className="text-muted-foreground">Esta acción es irreversible</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setMostrarConfirmacion(false)}
            >
              No, revisar
            </Button>
            <Button
              onClick={ejecutarSustitucion}
              className="bg-green-600 hover:bg-green-700"
            >
              Sí, proceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
