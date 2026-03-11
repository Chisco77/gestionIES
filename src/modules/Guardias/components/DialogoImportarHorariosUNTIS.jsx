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

import { useState, useRef } from "react";
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

export function DialogoImportarHorariosUNTIS({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resumen, setResumen] = useState(null);

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
                const perc = Math.round((data.procesadas / data.totalFilas) * 100);
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
      <DialogContent className="p-0 rounded-lg w-[500px] flex flex-col overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
        {/* Header */}
        <DialogHeader className="bg-blue-600 text-white flex items-center justify-center py-4 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Importar Horarios de Profesores
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
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

            {/* Resumen Final */}
            {resumen && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in zoom-in duration-300">
                <p className="text-sm font-bold text-blue-900 mb-2 flex items-center">
                  <span className="mr-2">📊</span> Resultado de la importación
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Total filas</p>
                    <p className="text-lg font-semibold text-blue-700">{resumen.total}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Insertadas</p>
                    <p className="text-lg font-semibold text-green-600">{resumen.insertadas}</p>
                  </div>
                </div>
                {resumen.errores > 0 && (
                  <p className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ Se omitieron {resumen.errores} filas por errores de validación.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={cargando}
          >
            {resumen ? "Cerrar" : "Cancelar"}
          </Button>
          {!resumen && (
            <Button onClick={handleImportar} disabled={cargando || !archivo}>
              {cargando ? "Importando..." : "Comenzar Importación"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}