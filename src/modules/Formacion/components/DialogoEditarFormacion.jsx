import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { format } from "date-fns";
import { SelectorFecha } from "@/modules/Comunes/SelectorFecha";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function DialogoEditarFormacion({
  open,
  onClose,
  permiso,
  periodos_horarios,
  onSuccess,
}) {
  const [descripcion, setDescripcion] = useState("");
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [periodoInicio, setPeriodoInicio] = useState(null);
  const [periodoFin, setPeriodoFin] = useState(null);
  const [fechaFin, setFechaFin] = useState(new Date());
  const [fechaFinStr, setFechaFinStr] = useState("");

  const TIPO_FORMACION = 10;
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && permiso) {
      setDescripcion(permiso.descripcion || "");
      const esDiaCompleto = permiso.dia_completo ?? true;
      setDiaCompleto(esDiaCompleto);

      setPeriodoInicio(
        permiso.idperiodo_inicio ? String(permiso.idperiodo_inicio) : null,
      );
      setPeriodoFin(
        permiso.idperiodo_fin ? String(permiso.idperiodo_fin) : null,
      );
      setFechaFin(permiso.fecha_fin || permiso.fecha);
    }
  }, [open, permiso]);

  useEffect(() => {
    if (!diaCompleto && permiso) {
      setFechaFin(permiso.fecha);
    }
  }, [diaCompleto, permiso]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API_URL}/db/permisos/${permiso.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(result.error || "Error actualizando permiso");
      return result.permiso;
    },
    onSuccess: () => {
      toast.success("Solicitud actualizada correctamente");
      queryClient.invalidateQueries(["panel", "permisos", user.username]);
      const fechaObj = new Date(permiso.fecha);
      const month = fechaObj.getMonth();
      const year = fechaObj.getFullYear();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
      queryClient.invalidateQueries({ queryKey: ["permisosMes", start, end] });

      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Error al actualizar solicitud de formación");
    },
  });

  const handleGuardar = () => {
    if (!descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }

    if (!diaCompleto) {
      if (!periodoInicio || !periodoFin) {
        toast.error("Debe seleccionar periodo inicio y fin");
        return;
      }
      if (Number(periodoInicio) > Number(periodoFin)) {
        toast.error("El periodo inicio no puede ser mayor que el fin");
        return;
      }
    }

    const fechaFinStr = fechaFin
      ? format(
          fechaFin instanceof Date ? fechaFin : new Date(fechaFin),
          "yyyy-MM-dd",
        ) + " 00:00:00"
      : null;

    mutation.mutate({
      descripcion,
      tipo: TIPO_FORMACION, // Forzado a 10
      uid: user.username,
      fecha_fin: diaCompleto ? fechaFinStr : permiso.fecha,
      dia_completo: diaCompleto,
      idperiodo_inicio: diaCompleto ? null : Number(periodoInicio),
      idperiodo_fin: diaCompleto ? null : Number(periodoFin),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg border-none"
      >
        <DialogHeader className="bg-green-600 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle>Editar Solicitud de Formación</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-6 p-6">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Descripción
            </Label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del permiso"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="diaCompleto"
              checked={diaCompleto}
              onCheckedChange={(value) => setDiaCompleto(!!value)}
            />
            <Label htmlFor="diaCompleto" className="text-sm cursor-pointer">
              Permiso de día completo
            </Label>
          </div>

          {diaCompleto && (
            <SelectorFecha
              label="Fecha fin del permiso (inclusive)"
              fecha={fechaFin}
              setFecha={setFechaFin}
              setFechaStr={setFechaFinStr}
              minDate={permiso?.fecha ? new Date(permiso.fecha) : undefined}
            />
          )}

          {!diaCompleto && (
            <div className="grid grid-cols-2 gap-4">
              {/* Periodo inicio */}
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Desde ...
                </Label>
                <Select
                  value={periodoInicio}
                  onValueChange={(v) => setPeriodoInicio(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos_horarios.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre} - {p.inicio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Periodo fin */}
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  ... hasta (inclusive)
                </Label>
                <Select
                  value={periodoFin}
                  onValueChange={(v) => setPeriodoFin(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos_horarios.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre} - {p.fin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {/* RadioGroup de tipo eliminado */}
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button onClick={handleGuardar} disabled={mutation.isLoading}>
            {mutation.isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
