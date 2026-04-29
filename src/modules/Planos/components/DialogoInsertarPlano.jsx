/**
 * DialogoInsertarPlano.jsx
 * ------------------------------------------------------------
 * Componente para la subida de nuevos planos mediante Multer.
 * ------------------------------------------------------------
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
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Map, Upload, FileType, Save, Hash, Type } from "lucide-react";
import { useEffect } from "react";

export function DialogoInsertarPlano({ open, onOpenChange, onSuccess }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [archivo, setArchivo] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    orden: 0,
  });

  const resetForm = () => {
    setFormData({ label: "", orden: 0 });
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Forzamos que si es orden, se guarde como número
    setFormData((prev) => ({
      ...prev,
      [name]: name === "orden" ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".svg")) {
      return toast.error("El archivo debe ser SVG");
    }
    setArchivo(file);
  };

  const guardarMutation = useMutation({
    mutationFn: async (variables) => {
      const data = new FormData();
      data.append("svg_file", archivo);
      data.append("label", variables.label);
      data.append("orden", variables.orden);

      const res = await fetch(`${API_BASE}/planos`, {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!res.ok) {
        // Intentamos leer el mensaje de error enviado por el backend
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al subir el plano");
      }
      // -------------------

      return res.json();
    },
    onSuccess: () => {
      toast.success("Plano guardado con éxito");
      queryClient.invalidateQueries(["planos-centro"]);
      if (onSuccess) onSuccess();
      resetForm();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSave = () => {
    if (!formData.label.trim())
      return toast.error("La etiqueta es obligatoria");
    if (!archivo) return toast.error("Falta el archivo SVG");

    // Enviamos el objeto formData actual a la mutación
    guardarMutation.mutate(formData);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-lg max-w-md flex flex-col border-none shadow-2xl"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".svg"
          onChange={handleFileChange}
        />

        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6 text-blue-400" />
            <DialogTitle className="text-xl font-bold">
              Añadir Plano
            </DialogTitle>
          </div>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="py-6 px-8 space-y-6">
            <div
              className="flex flex-col items-center p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 gap-3 group hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <Label className="text-[9px] uppercase font-black text-slate-400">
                Archivo SVG
              </Label>
              {archivo ? (
                <div className="flex flex-col items-center text-green-600">
                  <FileType className="w-8 h-8" />
                  <span className="text-xs mt-1">{archivo.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-300">
                  <Upload className="w-8 h-8" />
                  <span className="text-xs uppercase font-bold">
                    Seleccionar
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" /> Nombre
                </Label>
                <Input
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="Ej: Planta Baja"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" /> Orden
                </Label>
                <Input
                  name="orden"
                  type="number"
                  value={formData.orden}
                  onChange={handleChange}
                  className="h-11"
                />
                {/* Texto explicativo elegante */}
                <p className="text-[11px] text-slate-500 italic leading-tight pl-1">
                  Define la posición de este plano en los menús y pestañas de la
                  aplicación.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="px-8 py-4 bg-slate-50 border-t gap-3 rounded-b-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={guardarMutation.isLoading}
            className="bg-blue-500 hover:bg-blue-600 min-w-[120px]"
          >
            {guardarMutation.isLoading ? "Subiendo..." : "Guardar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
