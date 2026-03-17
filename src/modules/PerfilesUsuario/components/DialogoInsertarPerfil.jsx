// DialogoInsertarPerfil.jsx
import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useProfesoresStaff } from "@/hooks/useProfesoresStaff";

export function DialogoInsertarPerfil({ open, onClose, onSuccess }) {
  const [uidsSeleccionados, setUidsSeleccionados] = useState([]);
  const [perfil, setPerfil] = useState("");
  const [busqueda, setBusqueda] = useState("");

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

  // Usamos hook para obtener profesores y staff activos
  const {
    data: usuarios = [],
    isLoading,
    error,
    refetch,
  } = useProfesoresStaff();

  // Filtrado por búsqueda, memoizado para rendimiento
  const usuariosFiltrados = useMemo(() => {
    if (!usuarios.length) return [];
    const q = busqueda.toLowerCase();
    return usuarios.filter((u) =>
      `${u.givenName ?? ""} ${u.sn ?? ""} ${u.uid}`.toLowerCase().includes(q)
    );
  }, [usuarios, busqueda]);

  const handleToggleUid = (uid) => {
    setUidsSeleccionados((prev) =>
      prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]
    );
  };

  const handleGuardar = async () => {
    if (uidsSeleccionados.length === 0 || !perfil) {
      toast.error("Debes seleccionar al menos un usuario y un perfil");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/perfiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uids: uidsSeleccionados, perfil }),
      });

      if (!res.ok) throw new Error("Error al insertar perfil");

      toast.success("Perfil asignado correctamente");
      setUidsSeleccionados([]);
      setPerfil("");
      setBusqueda("");
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

        <div className="flex flex-col space-y-4 p-6">
          <Input
            placeholder="Buscar por nombre, apellidos o UID"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mb-2"
          />

          <div className="max-h-64 overflow-y-auto border p-2 rounded mb-2">
            {isLoading && <p className="text-sm">Cargando usuarios...</p>}
            {error && (
              <p className="text-sm text-red-500">
                Error al cargar usuarios.{" "}
                <button className="underline" onClick={() => refetch()}>
                  Reintentar
                </button>
              </p>
            )}

            {usuariosFiltrados.map((u) => (
              <label
                key={u.uid}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={uidsSeleccionados.includes(u.uid)}
                  onChange={() => handleToggleUid(u.uid)}
                />
                <span>
                  {u.givenName} {u.sn} ({u.uid})
                </span>
              </label>
            ))}

            {!isLoading && usuariosFiltrados.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No se encontraron usuarios
              </p>
            )}
          </div>

          <Select value={perfil} onValueChange={setPerfil}>
            <SelectTrigger className="w-full mb-2">
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

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button variant="outline" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
