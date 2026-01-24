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
import { ResumenAsuntosDia } from "./ResumenAsuntosDia";


export function DialogoInsertarAsunto({ open, onClose, fecha }) {
  const [descripcion, setDescripcion] = useState("");
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [asuntoCreado, setAsuntoCreado] = useState(null);

  useEffect(() => {
    if (open) {
      setDescripcion("");
      setShowPdfDialog(false);
      setAsuntoCreado(null);
    }
  }, [open]);

  // --------------------------
  // Mutation con React Query
  // --------------------------
  const mutation = useMutation({
    mutationFn: async (nuevoAsunto) => {
      const res = await fetch(`${API_URL}/db/permisos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevoAsunto),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Error insertando asunto");
      return data.asunto;
    },
    onSuccess: (asuntoInsertado, variables) => {
      const nuevoAsunto = {
        uid: variables.uid,
        fecha: variables.fecha,
        descripcion: variables.descripcion,
        tipo: variables.tipo,
      };

      setAsuntoCreado(nuevoAsunto);

      toast.success("Asunto propio insertado correctamente");

      queryClient.invalidateQueries(["panel", "permisos", user.username]);

      const month = new Date(fecha).getMonth();
      const year = new Date(fecha).getFullYear();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

      queryClient.invalidateQueries({ queryKey: ["asuntosMes", start, end] });

      setShowPdfDialog(true);
    },

    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Error al insertar asunto propio");
    },
  });

  const handleConfirmarPdf = async () => {
    if (!asuntoCreado) return;

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

      await generatePermisosPdf({ empleado, permiso: asuntoCreado });

      setShowPdfDialog(false);
      onClose();
    } catch (error) {
      console.error("Error generando el PDF:", error);
      toast.error("Error generando el PDF");
    }
  };

  const handleGuardar = () => {
    if (!descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }
    if (!user?.username) {
      toast.error("Usuario no autenticado");
      return;
    }
    mutation.mutate({ uid: user.username, fecha, descripcion, tipo: 13 });
  };

  return (
    <>
      {/* Diálogo principal */}
      <Dialog open={open} onOpenChange={onClose} modal={true}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 overflow-hidden rounded-lg"
        >
          <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
            <DialogTitle className="text-lg font-semibold text-center leading-snug">
              Solicitud de Asunto Propio (
              {new Date(fecha).toLocaleDateString("es-ES")})
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4 p-6">
            {/* Resumen de asuntos del día */}
            <ResumenAsuntosDia fecha={fecha} />
            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <Input
                placeholder="Descripción del asunto propio"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50">
            <Button
              variant="outline"
              onClick={handleGuardar}
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Guardando..." : "Solicitar Asunto Propio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo secundario (confirmación de PDF) */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              Petición de Asunto Propio registrada correctamente
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-gray-600">
            ¿Desea generar el documento PDF del asunto propio ahora?
          </p>
          <DialogFooter className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowPdfDialog(false); // cerrar diálogo secundario
                onClose(); // cerrar también el diálogo principal
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
