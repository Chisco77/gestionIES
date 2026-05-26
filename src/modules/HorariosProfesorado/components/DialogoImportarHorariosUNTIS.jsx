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

/**
 * DialogoImportarHorarios.jsx
 */

/*import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Alert Dialog previo a importacion
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

export function DialogoImportarHorariosUNTIS({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resumen, setResumen] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Referencia al input para poder resetearlo manualmente
  const fileInputRef = useRef(null);

  // ---------------------------------------------------
  // Resetear estados al cerrar o abrir el diálogo
  // ---------------------------------------------------
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      // Si estamos cerrando, reseteamos todo tras un pequeño delay (para que no se vea el salto en la transición)
      setTimeout(() => {
        setArchivo(null);
        setProgreso(0);
        setResumen(null);
        setCargando(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 200);
    }
    onOpenChange(isOpen);
  };

  // ---------------------------------------------------
  // Selección del archivo
  // ---------------------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("El archivo debe ser .csv");
      e.target.value = ""; // Limpiamos el input
      return;
    }
    setResumen(null); // Si eligen un nuevo archivo, quitamos el resumen anterior
    setArchivo(file);
  };

  // ---------------------------------------------------
  // Subida del archivo (Fetch + ReadableStream)
  // ---------------------------------------------------
  const handleImportar = async () => {
    if (!archivo) return;

    setCargando(true);
    setProgreso(0);
    setResumen(null);

    const formData = new FormData();
    formData.append("file", archivo);

    try {
      const response = await fetch(`${API_URL}/import/horarios-profesores`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

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
          // --- EVENTO: FINALIZADO ---
          if (part.includes("event: end")) {
            const rawData = part.split("data: ")[1];
            const info = JSON.parse(rawData);

            setResumen(info);
            setProgreso(100);
            setCargando(false);
            setArchivo(null);
            // Opcional: limpiar input file tras éxito
            if (fileInputRef.current) fileInputRef.current.value = "";

            toast.success(`Importación finalizada con éxito.`);
            return;
          }

          // --- EVENTO: PROGRESO ---
          if (part.startsWith("data: ")) {
            try {
              const data = JSON.parse(part.replace("data: ", ""));
              if (data.totalFilas > 0) {
                const perc = Math.round(
                  (data.procesadas / data.totalFilas) * 100
                );
                setProgreso(perc);
              }
            } catch (e) {
              console.error("Error parseando fragmento:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCargando(false);
      toast.error("Error al procesar la importación");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent
        className="p-0 rounded-lg w-[500px] flex flex-col overflow-hidden border-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-blue-600 text-white flex items-center justify-center py-4 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Importar Horarios de Profesores
          </DialogTitle>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="py-6 px-6 space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Archivo UNTIS (.csv)
              </Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={cargando}
                className="cursor-pointer"
              />

              {cargando && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Procesando datos...</span>
                    <span>{progreso}%</span>
                  </div>
                  <Progress value={progreso} className="h-2" />
                </div>
              )}
            </div>

            {resumen && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in zoom-in duration-300">
                <p className="text-sm font-bold text-blue-900 mb-2 flex items-center">
                  <span className="mr-2">📊</span> Resultado de la importación
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">
                      Total filas
                    </p>
                    <p className="text-lg font-semibold text-blue-700">
                      {resumen.total}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">
                      Insertadas
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {resumen.insertadas}
                    </p>
                  </div>
                </div>
                {resumen.errores > 0 && (
                  <p className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ Se omitieron {resumen.errores} filas por errores de
                    validación.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={cargando}
          >
            {resumen ? "Cerrar" : "Cancelar"}
          </Button>
          {!resumen && (
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={cargando || !archivo}
            >
              {cargando ? "Importando..." : "Comenzar Importación"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ⚠️ Confirmar importación de horarios
            </AlertDialogTitle>

            <AlertDialogDescription className="space-y-2">
              <p>
                Se importarán todos los horarios contenidos en el archivo
                seleccionado.
              </p>

              <p className="font-semibold text-red-600">
                Esta acción eliminará previamente todos los horarios existentes
                en la aplicación.
              </p>
              <p className="text-sm text-muted-foreground">
                Archivo: <strong>{archivo?.name}</strong>
              </p>

              <p>¿Deseas continuar con la importación?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={cargando}>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                handleImportar();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, importar horarios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
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
