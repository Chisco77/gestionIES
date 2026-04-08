import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, ChevronsUpDown } from "lucide-react";

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfesoresActivos } from "@/hooks/useProfesoresActivos";
import { SelectorFecha } from "@/modules/Comunes/SelectorFecha";
import { cn } from "@/lib/utils";
import { SelectProfesoresSimple } from "@/modules/Utilidades/components/SelectProfesoresSimple";

const TIPOS_AUSENCIA_MANUAL = [
  { id: "Aviso telefónico", label: "📞 Aviso telefónico" },
  { id: "Aviso presencial", label: "🚶 Aviso presencial" },
  { id: "Ausencia imprevista", label: "⚠️ Imprevisto / Emergencia" },
  { id: "Otro", label: "📝 Otro motivo" },
];

export function DialogoInsertarAusenciaManual({
  open,
  onClose,
  fecha,
  periodos_horarios,
}) {
  const [uidProfesor, setUidProfesor] = useState("");
  const [openCombo, setOpenCombo] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Aviso telefónico");
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [periodoInicio, setPeriodoInicio] = useState(null);
  const [periodoFin, setPeriodoFin] = useState(null);
  const [fechaFin, setFechaFin] = useState(fecha);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profesores = [], isLoading: loadingProfes } =
    useProfesoresActivos();
  const API_URL = import.meta.env.VITE_API_URL;

  // Texto de la fecha para que sepa qué día está editando
  const fechaLegible = useMemo(() => {
    if (!fecha) return "";
    return format(new Date(fecha), "EEEE, d 'de' MMMM", { locale: es });
  }, [fecha]);

  useEffect(() => {
    if (open) {
      setUidProfesor("");
      setDescripcion("");
      setTipo("Aviso telefónico");
      setDiaCompleto(true);
      setFechaFin(fecha);
    }
  }, [open, fecha]);

  const mutation = useMutation({
    mutationFn: async (nuevaAusencia) => {
      const res = await fetch(`${API_URL}/db/ausencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevaAusencia),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al insertar");
      return data;
    },
    onSuccess: () => {
      toast.success("Ausencia registrada");
      queryClient.invalidateQueries(["ausencias"]);
      queryClient.invalidateQueries(["cuadranteGuardias"]);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGuardar = () => {
    if (!uidProfesor) return toast.error("Seleccione un profesor");
    if (!diaCompleto && (!periodoInicio || !periodoFin))
      return toast.error("Seleccione los tramos horarios");

    mutation.mutate({
      uid_profesor: uidProfesor,
      fecha_inicio: format(new Date(fecha), "yyyy-MM-dd"),
      fecha_fin: diaCompleto
        ? format(new Date(fechaFin), "yyyy-MM-dd")
        : format(new Date(fecha), "yyyy-MM-dd"),
      idperiodo_inicio: diaCompleto ? null : Number(periodoInicio),
      idperiodo_fin: diaCompleto ? null : Number(periodoFin),
      tipo_ausencia: tipo,
      creada_por: user.username,
      descripcion: descripcion || tipo,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        {/* HEADER ORIGINAL CON TU COLOR AZUL */}
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex flex-col items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Registrar Ausencia de Última Hora
          </DialogTitle>
          <span className="text-xs opacity-90 capitalize font-medium">
            Para el {fechaLegible}
          </span>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* BUSCADOR INCREMENTAL DE PROFESOR */}
          <div className="space-y-2 flex flex-col">
            <Label>Profesor que se ausenta</Label>
            {/* AQUÍ ESTÁ TU NUEVO COMPONENTE */}
            <SelectProfesoresSimple
              value={uidProfesor}
              onChange={setUidProfesor}
            />
          </div>

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

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="fullDay"
              checked={diaCompleto}
              onCheckedChange={setDiaCompleto}
            />
            <Label htmlFor="fullDay" className="cursor-pointer">
              Ausencia de día completo
            </Label>
          </div>

          {!diaCompleto ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Select onValueChange={setPeriodoInicio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hora..." />
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
                <Label>Hasta</Label>
                <Select onValueChange={setPeriodoFin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hora..." />
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
            <SelectorFecha
              label="Fecha de finalización"
              fecha={fechaFin}
              setFecha={setFechaFin}
              minDate={new Date(fecha)}
            />
          )}

          <div className="space-y-2">
            <Label>Observaciones adicionales</Label>
            <Input
              placeholder="Ej: Ha llamado a las 8:05..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        {/* FOOTER ORIGINAL */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={mutation.isLoading}
            className="bg-slate-800 hover:bg-slate-900"
          >
            {mutation.isLoading ? "Guardando..." : "Registrar Ausencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
