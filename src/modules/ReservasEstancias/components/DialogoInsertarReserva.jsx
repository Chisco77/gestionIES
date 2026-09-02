/**
 * DialogoInsertarReserva.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Muestra un diálogo para insertar una nueva reserva en una estancia
 * determinada en una fecha concreta. Permite seleccionar periodo de inicio
 * y fin, añadir descripción y guarda la reserva mediante React Query.
 *
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function DialogoInsertarReserva({
  open,
  onClose,
  fecha,
  onSuccess,
  periodos,
  idestancia,
  descripcionEstancia = "",
  inicioSeleccionado,
  finSeleccionado,
  estancias = [],
}) {
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  const [necesidadesAula, setNecesidadesAula] = useState("aula");

  const [dialogConfirmacion, setDialogConfirmacion] = useState({
    open: false,
    estancias: [],
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const queryClient = useQueryClient(); // React Query

  const getDescripcionEstancia = (id) => {
    const estancia = estancias.find((e) => e.id === id);
    return estancia?.descripcion || `Estancia ${id}`;
  };

  const confirmarReserva = () => {
    setDialogConfirmacion({ open: false, estancias: [] });
    mutation.mutate({ confirmar: true });
  };

  // Reset de estado al abrir
  useEffect(() => {
    if (open) {
      setDescripcion("");
      setInicio(inicioSeleccionado?.toString() || "");
      setFin(finSeleccionado?.toString() || "");
      setNecesidadesAula("aula");
    }
  }, [open, inicioSeleccionado, finSeleccionado]);

  const reservarEnOtraEstancia = (id) => {
    setDialogConfirmacion({ open: false, estancias: [] });

    mutation.mutate({
      idestanciaOverride: id,
      confirmar: true,
    });
  };

  const mutation = useMutation({
    mutationFn: async ({
      confirmar = false,
      idestanciaOverride = null,
    } = {}) => {
      if (!inicio || !fin) {
        throw new Error("Selecciona periodo de inicio y fin");
      }

      if (parseInt(fin) < parseInt(inicio)) {
        throw new Error("El periodo final no puede ser anterior al inicial");
      }

      if (!user?.username) {
        throw new Error("Usuario no autenticado");
      }

      const estanciaFinal = idestanciaOverride ?? idestancia;

      const res = await fetch(`${API_URL}/db/reservas-estancias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idestancia: estanciaFinal,
          idperiodo_inicio: parseInt(inicio),
          idperiodo_fin: parseInt(fin),
          uid: user.username,
          fecha,
          descripcion,
          confirmar,
        }),
      });

      const data = await res.json();

      if (data.requiereConfirmacion) {
        const error = new Error("Requiere confirmación");
        error.tipo = "confirmacion";
        error.estanciasLibres = data.estanciasLibres;
        throw error;
      }

      if (!res.ok) {
        throw new Error(data.error || "Error desconocido al insertar reserva");
      }

      return data;
    },

    onSuccess: () => {
      toast.success("Reserva insertada correctamente");

      queryClient.invalidateQueries(["reservas", "dia", fecha]);
      queryClient.invalidateQueries(["reservas", "uid", user.username]);
      queryClient.invalidateQueries([
        "reservas",
        "curso-actual",
        user?.username,
      ]);

      onSuccess?.();
      onClose();
    },

    onError: (err) => {
      if (err.tipo === "confirmacion") {
        setDialogConfirmacion({
          open: true,
          estancias: err.estanciasLibres,
        });
        return;
      }

      toast.error(err.message || "Error al insertar reserva");
    },
  });

  const handleGuardar = () => mutation.mutate();

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg border-none"
      >
        {/* ENCABEZADO */}
        <DialogHeader className="bg-blue-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Nueva Reserva ({new Date(fecha).toLocaleDateString("es-ES")}) –{" "}
            <span className="font-bold">{descripcionEstancia}</span>
          </DialogTitle>
        </DialogHeader>

        {/* CUERPO */}
        <div className="flex flex-col space-y-4 p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Periodo Inicio
              </label>
              <Select value={inicio} onValueChange={setInicio}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar inicio" />
                </SelectTrigger>
                <SelectContent>
                  {periodos?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} ({p.inicio} - {p.fin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Periodo Fin
              </label>
              <Select value={fin} onValueChange={setFin}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fin" />
                </SelectTrigger>
                <SelectContent>
                  {periodos?.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} ({p.inicio} - {p.fin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <Input
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {Number(idestancia) === 47 && (
            <div className="border rounded-lg bg-gray-50/50 p-4">
              <label className="block text-sm font-medium mb-3">
                Necesidades del aula
              </label>

              <RadioGroup
                value={necesidadesAula}
                onValueChange={setNecesidadesAula}
                className="space-y-2"
              >
                <label
                  htmlFor="solo-aula"
                  className={`flex items-center gap-3 border rounded-md px-3 py-2.5 cursor-pointer transition-colors ${
                    necesidadesAula === "aula"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="aula" id="solo-aula" />
                  <span className="text-sm">Solo necesito el aula</span>
                </label>

                <label
                  htmlFor="ordenadores"
                  className={`flex items-center gap-3 border rounded-md px-3 py-2.5 cursor-pointer transition-colors ${
                    necesidadesAula === "ordenadores"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="ordenadores" id="ordenadores" />
                  <span className="text-sm">Necesito los ordenadores</span>
                </label>

                <label
                  htmlFor="todo-material"
                  className={`flex items-center gap-3 border rounded-md px-3 py-2.5 cursor-pointer transition-colors ${
                    necesidadesAula === "todo"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="todo" id="todo-material" />
                  <span className="text-sm">Necesito todo el material</span>
                </label>
              </RadioGroup>
            </div>
          )}
        </div>

        {/* PIE */}
        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog
        open={dialogConfirmacion.open}
        onOpenChange={(open) =>
          setDialogConfirmacion((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Aula {descripcionEstancia} disponible, pero hay otras aulas libres
            </AlertDialogTitle>

            <AlertDialogDescription>
              El aula <span className="font-bold">{descripcionEstancia}</span>{" "}
              está libre, pero existen otros infolabs libres en ese periodo:
              <ul className="mt-3 space-y-2">
                {dialogConfirmacion.estancias
                  .sort((a, b) => {
                    const descA = getDescripcionEstancia(a).toLowerCase();
                    const descB = getDescripcionEstancia(b).toLowerCase();
                    return descA.localeCompare(descB);
                  })
                  .map((id) => {
                    const estancia = estancias.find((e) => e.id === id);
                    const descripcionCompleta = `${estancia?.descripcion || `Estancia ${id}`} (${
                      estancia?.numero_ordenadores ?? 0
                    } ordenadores)`;

                    return (
                      <li
                        key={id}
                        className="flex items-center justify-between border rounded px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          {/* Icono verde */}
                          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                          <span className="font-medium">
                            {descripcionCompleta}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => reservarEnOtraEstancia(id)}
                        >
                          Reservar aquí
                        </Button>
                      </li>
                    );
                  })}
              </ul>
              <div className="mt-3">¿Deseas reservar igualmente este aula?</div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarReserva}>
              Reservar igualmente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
