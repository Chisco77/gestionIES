/**
 * DialogoImportarHorarios.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Proyecto: gestionIES
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Diálogo para importar horarios de profesores desde un fichero .csv
 * generado por UNTIS. Permite seleccionar el archivo y subirlo
 * al backend con feedback visual y control de errores detallado.
 */

/*import { useState, useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { toast } from "sonner";

export function DialogoImportarHorariosUNTIS({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [archivoHorarios, setArchivoHorarios] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resumen, setResumen] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const horariosRef = useRef(null);

  const resetDialog = () => {
    setArchivoHorarios(null);
    setCargando(false);
    setProgreso(0);
    setResumen(null);

    if (horariosRef.current) horariosRef.current.value = "";
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setTimeout(() => {
        resetDialog();
      }, 200);
    }
    onOpenChange(isOpen);
  };

  const handleImportar = async () => {
    if (!archivoHorarios) {
      toast.error("Debes seleccionar el archivo de horarios de UNTIS");
      return;
    }

    setCargando(true);
    setProgreso(0);

    const formData = new FormData();
    formData.append("horarios", archivoHorarios);

    try {
      const response = await fetch(`${API_URL}/import/horarios-untis`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error importando");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          if (part.includes("event: end")) {
            const rawData = part.split("data: ")[1];
            const info = JSON.parse(rawData);

            setResumen(info);
            setCargando(false);
            setProgreso(100);
            toast.success("Horarios importados correctamente");
            return;
          }

          if (part.startsWith("data: ")) {
            const data = JSON.parse(part.replace("data: ", ""));
            const perc = Math.round((data.procesadas / data.totalFilas) * 100);
            setProgreso(perc);
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCargando(false);
      toast.error("Error durante la importación");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Importar Horarios UNTIS</DialogTitle>
          </DialogHeader>

          <Card className="border-none shadow-none">
            <CardContent className="space-y-4">
              <div>
                <Label>Fichero de Horarios UNTIS (.csv)</Label>
                <Input
                  ref={horariosRef}
                  type="file"
                  accept=".csv"
                  disabled={cargando}
                  onChange={(e) => setArchivoHorarios(e.target.files[0])}
                />
              </div>

              {cargando && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Procesando...</span>
                    <span>{progreso}%</span>
                  </div>
                  <Progress value={progreso} />
                </div>
              )}

              {resumen && (
                <div className="bg-blue-50 border rounded-lg p-4">
                  <p className="font-semibold">Resultado importación</p>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-white p-3 rounded border">
                      <p>Total</p>
                      <p className="font-bold">{resumen.total}</p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <p>Insertadas</p>
                      <p className="font-bold text-green-600">
                        {resumen.insertadas}
                      </p>
                    </div>
                  </div>

                  {resumen.incidencias?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold text-red-600 mb-2">
                        Incidencias ({resumen.incidencias.length})
                      </p>
                      <div className="max-h-48 overflow-auto text-xs space-y-1">
                        {resumen.incidencias.map((i, index) => (
                          <div
                            key={index}
                            className="border rounded p-2 bg-white"
                          >
                            <strong>{i.tipo}</strong>
                            <pre>{JSON.stringify(i, null, 2)}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              variant="ghost"
              disabled={cargando}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>

            {!resumen && (
              <Button
                disabled={cargando || !archivoHorarios}
                onClick={() => setConfirmOpen(true)}
              >
                Importar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar importación</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los horarios actuales y se cargarán los nuevos
              desde el fichero.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                handleImportar();
              }}
            >
              Sí, importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
*/

import { useState, useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { toast } from "sonner";

export function DialogoImportarHorariosUNTIS({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [archivoHorarios, setArchivoHorarios] = useState(null);
  const [cursoAcademico, setCursoAcademico] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resumen, setResumen] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const horariosRef = useRef(null);

  // ======================================================
  // Cursos académicos disponibles
  // ======================================================
  const obtenerCursoActual = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;

    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const generarCursos = () => {
    const cursoActual = obtenerCursoActual();
    const yearInicial = parseInt(cursoActual.substring(0, 4), 10);

    return Array.from({ length: 5 }, (_, i) => {
      const year = yearInicial - 2 + i;
      return `${year}-${year + 1}`;
    });
  };

  const cursos = generarCursos();

  // ======================================================
  // Reset
  // ======================================================
  const resetDialog = () => {
    setArchivoHorarios(null);
    setCursoAcademico(obtenerCursoActual());
    setCargando(false);
    setProgreso(0);
    setResumen(null);
    setConfirmOpen(false);

    if (horariosRef.current) {
      horariosRef.current.value = "";
    }
  };

  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setCursoAcademico(obtenerCursoActual());
    }

    if (!isOpen) {
      setTimeout(() => {
        resetDialog();
      }, 200);
    }

    onOpenChange(isOpen);
  };

  // ======================================================
  // Importación
  // ======================================================
  const handleImportar = async () => {
    if (!cursoAcademico) {
      toast.error("Debes seleccionar el curso académico");
      return;
    }

    if (!archivoHorarios) {
      toast.error("Debes seleccionar el archivo de horarios de UNTIS");
      return;
    }

    setCargando(true);
    setProgreso(0);

    const formData = new FormData();

    formData.append("horarios", archivoHorarios);
    formData.append("curso_academico", cursoAcademico);

    try {
      const response = await fetch(`${API_URL}/import/horarios-untis`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error importando");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          if (part.includes("event: end")) {
            const rawData = part.split("data: ")[1];
            const info = JSON.parse(rawData);

            if (info.error) {
              throw new Error(info.error);
            }

            setResumen(info);
            setCargando(false);
            setProgreso(100);

            toast.success(
              `Horarios del curso ${cursoAcademico} importados correctamente`
            );

            return;
          }

          if (part.startsWith("data: ")) {
            const data = JSON.parse(part.replace("data: ", ""));

            if (data.totalFilas > 0) {
              const perc = Math.round(
                (data.procesadas / data.totalFilas) * 100
              );

              setProgreso(perc);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);

      setCargando(false);
      toast.error(error.message || "Error durante la importación");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Importar Horarios UNTIS</DialogTitle>
          </DialogHeader>

          <Card className="border-none shadow-none">
            <CardContent className="space-y-4">
              {/* ==================================================
                  Curso académico
              ================================================== */}
              <div className="space-y-2">
                <Label htmlFor="curso-academico">Curso académico</Label>

                <select
                  id="curso-academico"
                  value={cursoAcademico}
                  onChange={(e) => setCursoAcademico(e.target.value)}
                  disabled={cargando}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecciona un curso académico</option>

                  {cursos.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </div>

              {/* ==================================================
                  Fichero UNTIS
              ================================================== */}
              <div className="space-y-2">
                <Label htmlFor="horarios-untis">
                  Fichero de Horarios UNTIS (.csv)
                </Label>

                <Input
                  id="horarios-untis"
                  ref={horariosRef}
                  type="file"
                  accept=".csv"
                  disabled={cargando}
                  onChange={(e) => setArchivoHorarios(e.target.files[0])}
                />
              </div>

              {/* ==================================================
                  Progreso
              ================================================== */}
              {cargando && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Procesando...</span>
                    <span>{progreso}%</span>
                  </div>

                  <Progress value={progreso} />
                </div>
              )}

              {/* ==================================================
                  Resumen
              ================================================== */}
              {resumen && (
                <div className="bg-blue-50 border rounded-lg p-4">
                  <p className="font-semibold">Resultado importación</p>

                  <p className="text-sm mt-1">
                    Curso académico: <strong>{cursoAcademico}</strong>
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-white p-3 rounded border">
                      <p>Total</p>
                      <p className="font-bold">{resumen.total}</p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <p>Insertadas</p>
                      <p className="font-bold text-green-600">
                        {resumen.insertadas}
                      </p>
                    </div>
                  </div>

                  {resumen.incidencias?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold text-red-600 mb-2">
                        Incidencias ({resumen.incidencias.length})
                      </p>

                      <div className="max-h-48 overflow-auto text-xs space-y-1">
                        {resumen.incidencias.map((i, index) => (
                          <div
                            key={index}
                            className="border rounded p-2 bg-white"
                          >
                            <strong>{i.tipo}</strong>

                            <pre>{JSON.stringify(i, null, 2)}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ======================================================
              Footer
          ====================================================== */}
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={cargando}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>

            {!resumen && (
              <Button
                disabled={cargando || !archivoHorarios || !cursoAcademico}
                onClick={() => setConfirmOpen(true)}
              >
                Importar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          Confirmación
      ======================================================== */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar importación</AlertDialogTitle>

            <AlertDialogDescription>
              Se eliminarán los horarios existentes del curso{" "}
              <strong>{cursoAcademico}</strong> y se sustituirán por los
              horarios del fichero UNTIS.
              <br />
              <br />
              Los horarios de otros cursos académicos no se modificarán.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                handleImportar();
              }}
            >
              Sí, importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
