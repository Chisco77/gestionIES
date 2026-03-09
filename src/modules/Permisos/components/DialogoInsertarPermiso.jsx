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
import { generatePermisosPdf } from "@/Informes/permisos";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { MAPEO_TIPOS_PERMISOS } from "@/utils/mapeoTiposPermisos";

export function DialogoInsertarPermiso({
  open,
  onClose,
  fecha,
  periodos_horarios,
}) {
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [permisoCreado, setPermisoCreado] = useState(null);
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [periodoInicio, setPeriodoInicio] = useState(null);
  const [periodoFin, setPeriodoFin] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: periodos = [] } = usePeriodosHorarios();

  useEffect(() => {
    if (open) {
      setDiaCompleto(true);
      setPeriodoInicio(null);
      setPeriodoFin(null);
      setDescripcion("");
      setShowPdfDialog(false);
      setTipo(null);
      setPermisoCreado(null);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: async (nuevoPermiso) => {
      const res = await fetch(`${API_URL}/db/permisos/generico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevoPermiso),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Error insertando permiso");
      return data.asunto;
    },
    // `variables` contiene los datos pasados a mutate()
    onSuccess: (asuntoCreado, variables) => {
      const nuevoPermiso = {
        uid: variables.uid,
        fecha: variables.fecha,
        descripcion: variables.descripcion,
        tipo: variables.tipo,
        dia_completo: variables.dia_completo,
        idperiodo_inicio: variables.idperiodo_inicio,
        idperiodo_fin: variables.idperiodo_fin,
      };
      setPermisoCreado(nuevoPermiso);

      toast.success("Permiso insertado correctamente");

      queryClient.invalidateQueries(["asuntosPropios", user.username]);

      const month = new Date(fecha).getMonth();
      const year = new Date(fecha).getFullYear();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(
        year,
        month + 1,
        0
      ).getDate()}`;
      queryClient.invalidateQueries({ queryKey: ["asuntosMes", start, end] });
      queryClient.invalidateQueries(["notificacionesDirectiva"]);

      setShowPdfDialog(true);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Error al insertar permiso");
    },
  });

  const handleConfirmarPdf = async () => {
    if (!permisoCreado) return;
    try {
      const res = await fetch(`/api/db/empleados/${user.username}`);
      if (!res.ok) throw new Error("Error obteniendo empleado");
      let empleado = await res.json();
      empleado = {
        ...empleado,
        givenName: user.givenName,
        sn: user.sn,
        nombre_completo: `${user.givenName} ${user.sn}`,
      };
      await generatePermisosPdf({ empleado, permiso: permisoCreado, periodos });
      setShowPdfDialog(false);
      onClose();
    } catch (error) {
      console.error("Error generando el PDF:", error);
      toast.error("Error generando el PDF");
    }
  };

  const handleGuardar = () => {
    if (!descripcion.trim())
      return toast.error("La descripción no puede estar vacía");
    if (!user?.username) return toast.error("Usuario no autenticado");

    // Validación y conversión de tipo
    const tipoNumber = tipo !== null ? Number(tipo) : null;
    if (!tipoNumber && tipoNumber !== 0)
      return toast.error("Debe seleccionar un tipo de permiso");
    if (!diaCompleto) {
      if (!periodoInicio || !periodoFin)
        return toast.error("Debe seleccionar periodo inicio y fin");

      if (Number(periodoInicio) > Number(periodoFin))
        return toast.error("El periodo inicio no puede ser mayor que el fin");
    }

    mutation.mutate({
      uid: user.username,
      fecha,
      descripcion,
      tipo: tipoNumber,
      dia_completo: diaCompleto,
      idperiodo_inicio: diaCompleto ? null : Number(periodoInicio),
      idperiodo_fin: diaCompleto ? null : Number(periodoFin),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} modal={true}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 overflow-hidden rounded-lg"
        >
          <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
            <DialogTitle className="text-lg font-semibold text-center leading-snug">
              Solicitud de Permiso (
              {new Date(fecha).toLocaleDateString("es-ES")})
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-6 p-6">
            {/* Descripción */}
            <div>
              <Label
                htmlFor="descripcion"
                className="mb-2 block text-sm font-medium"
              >
                Descripción
              </Label>
              <Input
                id="descripcion"
                placeholder="Descripción del permiso"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full"
              />
            </div>
            {/* Día completo */}
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
            {/* Tipo de permiso */}
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Tipo de permiso
              </Label>
              <div className="border rounded-md p-2 hover:bg-gray-50">
                <RadioGroup
                  value={tipo}
                  onValueChange={setTipo}
                  className="space-y-3"
                >
                  {Object.entries(MAPEO_TIPOS_PERMISOS)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([key, label]) => (
                      <div key={key} className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={key}
                          id={`tipo-${key}`}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`tipo-${key}`}
                          className="text-sm cursor-pointer leading-tight"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50">
            <Button
              variant="outline"
              onClick={handleGuardar}
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo PDF */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              Permiso insertado correctamente
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-gray-600">
            ¿Desea generar el documento PDF del permiso ahora?
          </p>
          <DialogFooter className="flex justify-center mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPdfDialog(false);
                onClose();
              }}
            >
              No
            </Button>
            <Button onClick={handleConfirmarPdf}>Sí</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
