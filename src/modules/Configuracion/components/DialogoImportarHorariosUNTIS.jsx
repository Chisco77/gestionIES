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
 * al backend con feedback visual.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function DialogoImportarHorariosUNTIS({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  // ---------------------------------------------------
  // Selección del archivo
  // ---------------------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("El archivo debe ser .csv");
      return;
    }
    setArchivo(file);
  };

  // ---------------------------------------------------
  // Subida del archivo
  // ---------------------------------------------------
  const importarHorariosMutation = useMutation({
    mutationFn: async () => {
      if (!archivo) throw new Error("No se ha seleccionado ningún archivo");
      setCargando(true);
      const formData = new FormData();
      formData.append("file", archivo);

      const res = await fetch(`${API_URL}/import/horarios-profesores`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al importar el archivo");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Archivo importado correctamente");
      queryClient.invalidateQueries(["horarios_profesores"]);
      setArchivo(null);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setCargando(false),
  });

  const handleImportar = () => {
    importarHorariosMutation.mutate();
  };

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg w-[500px] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="bg-blue-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Importar Horarios de Profesores
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="py-6 px-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Selecciona el archivo .csv generado por UNTIS
              </Label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="border px-2 py-1 rounded w-full"
              />
              {archivo && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: <strong>{archivo.name}</strong>
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                El archivo debe contener los horarios de los profesores en el formato estándar de UNTIS.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImportar}
            disabled={cargando || !archivo}
          >
            {cargando ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}