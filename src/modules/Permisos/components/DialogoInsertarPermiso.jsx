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
import { generatePermisosPdf } from "@/utils/Informes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function DialogoInsertarPermiso({ open, onClose, fecha }) {
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [permisoCreado, setPermisoCreado] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
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
        tipo: variables.tipo, // ahora sí es un número
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
      await generatePermisosPdf({ empleado, permiso: permisoCreado });
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

    mutation.mutate({
      uid: user.username,
      fecha,
      descripcion,
      tipo: tipoNumber,
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
                  {Object.entries({
                    2: "(Art. 2) Fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica",
                    3: "(Art. 3) Enfermedad propia",
                    4: "(Art. 4) Traslado de domicilio",
                    7: "(Art. 7) Exámenes prenatales y técnicas de preparación al parto",
                    11: "(Art. 11) Deber inexcusable de carácter público o personal",
                    14: "(Art. 14) Funciones sindicales / representación del personal",
                    15: "(Art. 15) Exámenes finales o pruebas selectivas",
                    32: "(Art. 32) Reducción de jornada para mayores de 55 años",
                    0: "Otros",
                  }).map(([key, label]) => (
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
