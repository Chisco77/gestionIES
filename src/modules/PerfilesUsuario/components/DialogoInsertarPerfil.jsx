// DialogoInsertarPerfil.jsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Añadido para mejor semántica
import { toast } from "sonner";
import { useProfesoresStaff } from "@/hooks/useProfesoresStaff";
import { SelectEntidadSimple } from "@/modules/Utilidades/components/SelectEntidadSimple";

export function DialogoInsertarPerfil({ open, onClose, onSuccess }) {
  // Ahora manejamos un único UID seleccionado para mantener la coherencia con el Select
  const [uidSeleccionado, setUidSeleccionado] = useState("");
  const [perfil, setPerfil] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const opcionesPerfiles = [
    "administrador",
    "directiva",
    "educadora",
    "extraescolares",
    "ordenanza",
    "profesor",
    "administrativo",
  ];

  // Usamos tu hook combinado
  const { data: usuarios = [], isLoading, error } = useProfesoresStaff();

  const handleGuardar = async () => {
    // Validamos que haya selección
    if (!uidSeleccionado || !perfil) {
      toast.error("Debes seleccionar un usuario y un perfil");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/perfiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // Enviamos el UID como array para mantener compatibilidad con tu backend
        body: JSON.stringify({ uids: [uidSeleccionado], perfil }),
      });

      if (!res.ok) throw new Error("Error al insertar perfil");

      toast.success("Perfil asignado correctamente");
      setUidSeleccionado("");
      setPerfil("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al insertar perfil");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="p-0 overflow-hidden rounded-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Asignar perfil a usuario
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-5 p-6">
          {/* SELECCIÓN DE USUARIO (Nuevo componente) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">
              Usuario
            </Label>
            <SelectEntidadSimple
              value={uidSeleccionado}
              onChange={setUidSeleccionado}
              options={usuarios}
              isLoading={isLoading}
              placeholder="Buscar usuario ..."
            />
            {error && (
              <p className="text-[10px] text-red-500">
                Error al cargar la lista de usuarios.
              </p>
            )}
          </div>

          {/* SELECCIÓN DE PERFIL */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">
              Perfil a asignar
            </Label>
            <Select value={perfil} onValueChange={setPerfil}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un perfil" />
              </SelectTrigger>
              <SelectContent>
                {opcionesPerfiles.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
