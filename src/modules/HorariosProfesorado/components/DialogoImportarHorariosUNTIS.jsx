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

  const [archivoProfesores, setArchivoProfesores] = useState(null);

  const [archivoMaterias, setArchivoMaterias] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const [resumen, setResumen] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const horariosRef = useRef(null);
  const profesoresRef = useRef(null);
  const materiasRef = useRef(null);

  const resetDialog = () => {
    setArchivoHorarios(null);
    setArchivoProfesores(null);
    setArchivoMaterias(null);

    setCargando(false);
    setProgreso(0);

    setResumen(null);

    if (horariosRef.current) horariosRef.current.value = "";

    if (profesoresRef.current) profesoresRef.current.value = "";

    if (materiasRef.current) materiasRef.current.value = "";
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
    if (!archivoHorarios || !archivoProfesores || !archivoMaterias) {
      toast.error("Debes seleccionar todos los archivos");
      return;
    }

    setCargando(true);
    setProgreso(0);

    const formData = new FormData();

    formData.append("horarios", archivoHorarios);

    formData.append("profesores", archivoProfesores);

    formData.append("materias", archivoMaterias);

    console.log ("Horarios: ", archivoHorarios);
    console.log ("Profesores: ", archivoProfesores);
    console.log ("Materias: ", archivoMaterias);

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

        buffer += decoder.decode(value, {
          stream: true,
        });

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
                <Label>Horarios UNTIS</Label>

                <Input
                  ref={horariosRef}
                  type="file"
                  accept=".csv"
                  disabled={cargando}
                  onChange={(e) => setArchivoHorarios(e.target.files[0])}
                />
              </div>

              <div>
                <Label>Profesores UNTIS</Label>

                <Input
                  ref={profesoresRef}
                  type="file"
                  accept=".csv"
                  disabled={cargando}
                  onChange={(e) => setArchivoProfesores(e.target.files[0])}
                />
              </div>

              <div>
                <Label>Materias UNTIS</Label>

                <Input
                  ref={materiasRef}
                  type="file"
                  accept=".csv"
                  disabled={cargando}
                  onChange={(e) => setArchivoMaterias(e.target.files[0])}
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
                        Incidencias
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
                disabled={
                  cargando ||
                  !archivoHorarios ||
                  !archivoProfesores ||
                  !archivoMaterias
                }
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
              Se eliminarán todos los horarios actuales.
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
