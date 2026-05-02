/**
 * DialogoEditarAusenciaManual.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente de diálogo para la edición de ausencias manuales
 *     del profesorado.
 * 
 * Permite modificar los datos de una ausencia previamente registrada,
 * incluyendo tipo, fechas, tramos horarios y observaciones, con
 * actualización en backend y refresco automático de datos.
 *
 */

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SelectorFecha } from "@/modules/Comunes/SelectorFecha";

const TIPOS_AUSENCIA_MANUAL = [
  { id: "Aviso telefónico", label: "📞 Aviso telefónico" },
  { id: "Aviso presencial", label: "🚶 Aviso presencial" },
  { id: "Ausencia imprevista", label: "⚠️ Imprevisto / Emergencia" },
  { id: "Otro", label: "📝 Otro motivo" },
];

export function DialogoEditarAusenciaManual({
  open,
  onClose,
  ausencia,
  periodos_horarios,
}) {
  const [uidProfesor, setUidProfesor] = useState("");
  const [nombreProfesor, setNombreProfesor] = useState(""); // Para mostrar en el input readOnly
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [periodoInicio, setPeriodoInicio] = useState(null);
  const [periodoFin, setPeriodoFin] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open && ausencia) {
      setUidProfesor(ausencia.uid_profesor);
      setNombreProfesor(ausencia.nombreProfesor || "Profesor seleccionado");
      setDescripcion(ausencia.descripcion || "");
      setTipo(ausencia.tipo_ausencia || "Aviso telefónico");

      const esDiaCompleto = !ausencia.idperiodo_inicio;
      setDiaCompleto(esDiaCompleto);

      setFechaInicio(new Date(ausencia.fecha_inicio));
      setFechaFin(new Date(ausencia.fecha_fin));
      setPeriodoInicio(ausencia.idperiodo_inicio?.toString() || null);
      setPeriodoFin(ausencia.idperiodo_fin?.toString() || null);
    }
  }, [open, ausencia]);

  const mutation = useMutation({
    mutationFn: async (ausenciaEditada) => {
      const res = await fetch(`${API_URL}/db/ausencias/${ausencia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(ausenciaEditada),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      return data;
    },
    onSuccess: () => {
      toast.success("Ausencia actualizada correctamente");
      queryClient.invalidateQueries(["ausencias"]);
      queryClient.invalidateQueries(["cuadranteGuardias"]);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGuardar = () => {
    mutation.mutate({
      uid_profesor: uidProfesor,
      fecha_inicio: format(fechaInicio, "yyyy-MM-dd"),
      fecha_fin: diaCompleto
        ? format(fechaFin, "yyyy-MM-dd")
        : format(fechaInicio, "yyyy-MM-dd"),
      idperiodo_inicio: diaCompleto ? null : Number(periodoInicio),
      idperiodo_fin: diaCompleto ? null : Number(periodoFin),
      tipo_ausencia: tipo,
      descripcion: descripcion,
    });
  };

  if (!ausencia) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Editar Registro de Ausencia
          </DialogTitle>
          <span className="text-xs opacity-90 font-medium">
            Modificando registro ID: {ausencia.id}
          </span>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* PROFESOR (NO EDITABLE) */}
          <div className="space-y-2 flex flex-col">
            <Label className="text-muted-foreground">
              Profesor (no modificable)
            </Label>
            <Input
              value={nombreProfesor}
              readOnly
              className="bg-gray-100 cursor-not-allowed font-medium"
            />
          </div>

          {/* TIPO DE AVISO  */}
          <div className="space-y-2">
            <Label>Tipo de aviso</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_AUSENCIA_MANUAL.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 py-1">
            <Checkbox
              id="editFullDay"
              checked={diaCompleto}
              onCheckedChange={setDiaCompleto}
            />
            <Label htmlFor="editFullDay" className="cursor-pointer">
              Ausencia de día completo
            </Label>
          </div>

          {!diaCompleto ? (
            <div className="grid grid-cols-2 gap-4 border-l-4 border-green-200 pl-4 py-1 animate-in slide-in-from-left-2 duration-300">
              <div className="space-y-2">
                <Label className="text-xs">Desde tramo</Label>
                <Select value={periodoInicio} onValueChange={setPeriodoInicio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Inicio..." />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos_horarios.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Hasta tramo</Label>
                <Select value={periodoFin} onValueChange={setPeriodoFin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos_horarios.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <SelectorFecha
                label="Fecha de finalización"
                fecha={fechaFin}
                setFecha={setFechaFin}
                minDate={fechaInicio}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Observaciones adicionales</Label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Añade más detalles si es necesario..."
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={mutation.isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {mutation.isLoading ? "Actualizando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
