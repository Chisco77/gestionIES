import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SelectorFecha } from "@/modules/Comunes/SelectorFecha";
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
  fecha: fechaInicial, // La fecha que viene del componente padre (hoy por defecto)
  periodos_horarios,
}) {
  const [uidProfesor, setUidProfesor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Aviso telefónico");
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [periodoInicio, setPeriodoInicio] = useState(null);
  const [periodoFin, setPeriodoFin] = useState(null);

  // AHORA TENEMOS ESTADO PARA AMBAS FECHAS
  const [fechaInicio, setFechaInicio] = useState(fechaInicial);
  const [fechaFin, setFechaFin] = useState(fechaInicial);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL;

  // Sincronizar cuando el diálogo se abre
  useEffect(() => {
    if (open) {
      setUidProfesor("");
      setDescripcion("");
      setTipo("Aviso telefónico");
      setDiaCompleto(true);
      setFechaInicio(fechaInicial || new Date());
      setFechaFin(fechaInicial || new Date());
    }
  }, [open, fechaInicial]);

  // Si cambia la fecha de inicio, ajustamos la de fin si esta es anterior
  useEffect(() => {
    if (fechaInicio > fechaFin) {
      setFechaFin(fechaInicio);
    }
  }, [fechaInicio]);

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
      fecha_inicio: format(new Date(fechaInicio), "yyyy-MM-dd"),
      fecha_fin: diaCompleto
        ? format(new Date(fechaFin), "yyyy-MM-dd")
        : format(new Date(fechaInicio), "yyyy-MM-dd"),
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
        <DialogHeader className="bg-blue-600 text-white rounded-t-lg flex flex-col items-center justify-center py-4 px-6">
          <DialogTitle className="text-lg font-semibold text-center">
            Registrar Ausencia Manual
          </DialogTitle>
          <p className="text-xs opacity-80 italic">
            Usa este formulario para avisos imprevistos
          </p>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* PROFESOR */}
          <div className="space-y-2 flex flex-col">
            <Label>Profesor que se ausenta</Label>
            <SelectProfesoresSimple
              value={uidProfesor}
              onChange={setUidProfesor}
            />
          </div>

          {/* FILA DE FECHA DE INICIO Y TIPO  */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col space-y-2">
              <SelectorFecha
                label="Fecha de inicio"
                fecha={fechaInicio}
                setFecha={setFechaInicio}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="mb-[2px]">Tipo de aviso</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full">
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
          </div>

          <div className="flex items-center space-x-2 py-1">
            <Checkbox
              id="fullDay"
              checked={diaCompleto}
              onCheckedChange={setDiaCompleto}
            />
            <Label htmlFor="fullDay" className="cursor-pointer font-medium">
              Ausencia de día completo / Varios días
            </Label>
          </div>

          {!diaCompleto ? (
            <div className="grid grid-cols-2 gap-4 border-l-4 border-blue-200 pl-4 py-1 animate-in slide-in-from-left-2 duration-300">
              <div className="space-y-2">
                <Label className="text-xs">Desde hora</Label>
                <Select onValueChange={setPeriodoInicio}>
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
                <Label className="text-xs">Hasta hora</Label>
                <Select onValueChange={setPeriodoFin}>
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
                label="Fecha de finalización (inclusive)"
                fecha={fechaFin}
                setFecha={setFechaFin}
                minDate={fechaInicio}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Observaciones / Detalles</Label>
            <Input
              placeholder="Ej: Avisa por WhatsApp, se siente mal..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={mutation.isLoading}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {mutation.isLoading ? "Guardando..." : "Registrar Ausencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
