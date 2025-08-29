import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "";

export function DialogoPrestarLlaves({ open, onClose, onSuccess, estancia }) {
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
  const [filtroProfesor, setFiltroProfesor] = useState("");

  useEffect(() => {
    if (open && estancia) {
      console.log("👉 Estancia recibida en DialogoPrestarLlaves:", estancia);
    }
  }, [open, estancia]);

  // Resetear estados al abrir
  useEffect(() => {
    if (open) {
      setProfesorSeleccionado("");
      setFiltroProfesor("");
    }
  }, [open]);

  // Cargar profesores desde LDAP
  useEffect(() => {
    if (!open) return;
    fetch(`${API_URL}/ldap/usuarios?tipo=teachers`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const ordenados = data.sort((a, b) => {
          if (a.sn === b.sn) return a.givenName.localeCompare(b.givenName);
          return a.sn.localeCompare(b.sn);
        });
        setProfesores(ordenados);
      })
      .catch(() => toast.error("Error al obtener profesores"));
  }, [open]);

  // Filtrado de profesores
  const profesoresFiltrados = profesores.filter((p) => {
    const busqueda = filtroProfesor.toLowerCase();
    return (
      p.sn.toLowerCase().includes(busqueda) ||
      p.givenName.toLowerCase().includes(busqueda) ||
      p.uid.toLowerCase().includes(busqueda)
    );
  });

  const handlePrestar = async () => {
    if (!profesorSeleccionado) {
      toast.error("Selecciona un profesor");
      return;
    }
    if (!estancia?.id) {
      toast.error("Estancia no definida");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/prestamos-llaves/prestar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: profesorSeleccionado,
          idestancia: estancia.id,
          unidades: 1,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Error al prestar llave");
      }

      toast.success("Llave prestada correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al prestar llave");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Prestar llave — {estancia?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Campo filtro */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Filtrar profesor
            </label>
            <Input
              type="text"
              placeholder="Buscar por apellido, nombre o uid"
              value={filtroProfesor}
              onChange={(e) => setFiltroProfesor(e.target.value)}
            />
          </div>

          {/* Lista de profesores */}
          <div className="max-h-64 overflow-auto border border-gray-200 rounded-md p-3 shadow-sm mt-2">
            {profesoresFiltrados.length === 0 && (
              <p className="text-xs italic text-gray-500">No hay profesores</p>
            )}
            {profesoresFiltrados.map((p) => (
              <div
                key={p.uid}
                onClick={() => setProfesorSeleccionado(p.uid)}
                className={`cursor-pointer p-2 rounded-md mb-1 select-none
                  ${
                    profesorSeleccionado === p.uid
                      ? "bg-green-200"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                {p.sn}, {p.givenName} ({p.uid})
              </div>
            ))}
          </div>

          <div>
            <p>
              Total llaves: <strong>{estancia?.keysTotales || 1}</strong>
            </p>
            <p>
              Prestadas: <strong>{estancia?.prestadas || 0}</strong>
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handlePrestar} disabled={!profesorSeleccionado}>
            Prestar llave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
