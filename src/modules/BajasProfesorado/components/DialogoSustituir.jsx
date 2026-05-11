import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { getFechaHoyMadridISO } from "@/utils/fechasHoras";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { SelectEntidadSimple } from "@/modules/Utilidades/components/SelectEntidadSimple";

export function DialogoSustituir({ open, onOpenChange, onSuccess }) {
  const queryClient = useQueryClient();
  const { data: profesores = [], isLoading: loadingProfes } =
    useProfesoresActivos();

  const [fechaInicio, setFechaInicio] = useState(getFechaHoyMadridISO());
  const [titularUid, setTitularUid] = useState("");
  const [sustitutoUid, setSustitutoUid] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cargando, setCargando] = useState(false);



  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!open) {
      setTitularUid("");
      setSustitutoUid("");
      setObservaciones("");
      setCargando(false);
      setMostrarConfirmacion(false);
      setFechaInicio(getFechaHoyMadridISO());
    }
  }, [open]);

  const preGuardarSustitucion = () => {
    if (!titularUid || !sustitutoUid || !fechaInicio) {
      return toast.error("Por favor, rellena los campos obligatorios");
    }
    if (titularUid === sustitutoUid) {
      return toast.error(
        "El titular y el sustituto no pueden ser la misma persona"
      );
    }
    setMostrarConfirmacion(true);
  };

  const ejecutarSustitucion = async () => {
    setMostrarConfirmacion(false);
    setCargando(true);

    try {
      // 1. Registro de sustitución
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
      if (!dataSust.ok)
        throw new Error(dataSust.error || "Error al crear la sustitución");

      // 2. Duplicar Horario
      const resHorario = await fetch(
        `${API_URL}/db/horario-profesorado/duplicar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uidOrigen: titularUid,
            uidDestino: sustitutoUid,
          }),
        }
      );

      const dataHorario = await resHorario.json();

      // 3. Invalidar cachés
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sustituciones"] }),
        queryClient.invalidateQueries({ queryKey: ["horario-profesorado"] }),
      ]);

      toast.success(`Sustitución registrada con éxito. Horario clonado.`);

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Ocurrió un error inesperado");
    } finally {
      setCargando(false);
    }
  };

  const nombreTitular = profesores.find((p) => p.uid === titularUid);
  const nombreSustituto = profesores.find((p) => p.uid === sustitutoUid);

  const fechaParaMostrar = () => {
    if (!fechaInicio) return "";
    const [y, m, d] = fechaInicio.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 overflow-hidden rounded-lg border-none"
        >
          <DialogHeader className="bg-green-600 text-white py-3 px-6">
            <DialogTitle className="text-lg font-semibold text-center">
              Registrar profesor sustituto
            </DialogTitle>
          </DialogHeader>

          <Card className="border-none shadow-none">
            <CardContent className="py-6 space-y-4">
              <div className="space-y-1">
                <Label>Profesor Titular (Sale)</Label>
                <SelectEntidadSimple
                  value={titularUid}
                  onChange={setTitularUid}
                  options={profesores}
                  isLoading={loadingProfes}
                  placeholder="Buscar profesor que sale..."
                />
              </div>

              <div className="space-y-1">
                <Label>Profesor Sustituto (Entra)</Label>
                <SelectEntidadSimple
                  value={sustitutoUid}
                  onChange={setSustitutoUid}
                  options={profesores.filter((p) => p.uid !== titularUid)}
                  isLoading={loadingProfes}
                  placeholder="Buscar profesor que entra..."
                />
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
               
              </div>

              <div className="space-y-1">
                <Label>Observaciones</Label>
                <Input
                  placeholder="Ej: Sustitución por IT larga duración"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
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

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      <Dialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-[450px]"
        >
          <DialogHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle>Confirmar sustitución</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 text-sm">
            <p>
              Se registrará a{" "}
              <strong>
                {nombreSustituto?.sn}, {nombreSustituto?.givenName}
              </strong>{" "}
              para sustituir a{" "}
              <strong>
                {nombreTitular?.sn}, {nombreTitular?.givenName}
              </strong>
              .
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Inicio: {fechaParaMostrar()}</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMostrarConfirmacion(false)}
            >
              Revisar
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
