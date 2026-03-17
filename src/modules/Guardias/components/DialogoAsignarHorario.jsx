import { useState, useMemo, useEffect } from "react";
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

export function DialogoAsignarHorario({ profesorOrigen, open, onOpenChange }) {
  const { data: profesores = [] } = useProfesoresActivos();
  const [profesorDestinoUid, setProfesorDestinoUid] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cursoAcademico, setCursoAcademico] = useState(getCursoActual().label);

  // Estado para diálogo de confirmación
  const [abrirConfirmacion, setAbrirConfirmacion] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open) {
      setCursoAcademico(getCursoActual().label);
    } else {
      setProfesorDestinoUid(null);
      setCargando(false);
      setAbrirConfirmacion(false);
    }
  }, [open]);

  const profesoresFiltrados = useMemo(
    () => profesores.filter((p) => p.uid !== profesorOrigen?.uid),
    [profesores, profesorOrigen]
  );

  const cursos = useMemo(
    () => [
      "2020-2021",
      "2021-2022",
      "2022-2023",
      "2023-2024",
      "2024-2025",
      "2025-2026",
      "2026-2027",
      "2027-2028",
      "2028-2029",
      "2029-2030",
      "2030-2031",
    ],
    []
  );

  const handleAsignar = () => {
    if (!profesorDestinoUid) return;
    // Abrimos el diálogo de confirmación
    setAbrirConfirmacion(true);
  };

  const handleConfirmarAsignacion = async () => {
    setAbrirConfirmacion(false);
    setCargando(true);

    try {
      const res = await fetch(
        `${API_URL}/db/horario-profesorado/duplicar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uidOrigen: profesorOrigen.uid,
            uidDestino: profesorDestinoUid,
            curso_academico: cursoAcademico,
          }),
        }
      );

      // Leemos primero como texto para ver la respuesta cruda
      const text = await res.text();
      console.log("Respuesta cruda del backend:", text);

      // Intentamos parsear JSON, si falla atrapamos el error
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(`Respuesta no JSON del backend: ${text}`);
      }

      if (!data.ok) throw new Error(data.error || "Error duplicando horario");

      toast.success(
        `Horario duplicado con éxito (${data.total} filas copiadas).`
      );
      onOpenChange(false);
    } catch (err) {
      console.error("Error duplicando horario del profesor:", err);
      toast.error(`No se pudo duplicar el horario: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* Diálogo principal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 rounded-lg w-[500px] flex flex-col overflow-hidden"
        >
          <DialogHeader className="bg-blue-600 text-white flex items-center justify-center py-4 px-6">
            <DialogTitle className="text-lg font-semibold text-center">
              Asignar horario de{" "}
              {profesorOrigen
                ? `${profesorOrigen.givenName} ${profesorOrigen.sn}`
                : ""}
            </DialogTitle>
          </DialogHeader>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="py-6 px-6 space-y-4">
              <div className="grid gap-4 py-2">
                <div className="grid gap-1">
                  <Label htmlFor="profesorDestino">Profesor destino</Label>
                  <Select
                    id="profesorDestino"
                    value={profesorDestinoUid || ""}
                    onValueChange={setProfesorDestinoUid}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un profesor" />
                    </SelectTrigger>
                    <SelectContent>
                      {profesoresFiltrados.map((p) => (
                        <SelectItem key={p.uid} value={p.uid}>
                          {p.givenName} {p.sn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="cursoAcademico">Curso académico</Label>
                  {open && (
                    <Select
                      id="cursoAcademico"
                      value={cursoAcademico}
                      onValueChange={setCursoAcademico}
                    >
                      <SelectTrigger>
                        <SelectValue value={cursoAcademico} />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="px-6 py-4 bg-gray-50">
            <DialogClose asChild>
              <Button variant="outline" disabled={cargando}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleAsignar}
              disabled={!profesorDestinoUid || cargando}
            >
              {cargando ? "Duplicando..." : "Asignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog open={abrirConfirmacion} onOpenChange={setAbrirConfirmacion}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-[400px]"
        >
          <DialogHeader>
            <DialogTitle>Confirmar duplicación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Se sobrescribirá el horario existente del profesor destino.
              ¿Deseas continuar?
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleConfirmarAsignacion}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
