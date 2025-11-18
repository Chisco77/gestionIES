import { useState, useEffect } from "react";
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

export function DialogoInsertarPerfil({ open, onClose, onSuccess }) {
  const [usuarios, setUsuarios] = useState([]);
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
  ];

  // Cargar usuarios desde LDAP al abrir el diálogo
  useEffect(() => {
    if (!open) return;

    const fetchUsuarios = async () => {
      try {
        const res = await fetch(`${API_URL}/ldap/usuarios?tipo=all`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al cargar usuarios LDAP");
        const data = await res.json();
        setUsuarios(data);
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar los usuarios");
      }
    };

    fetchUsuarios();
  }, [open, API_URL]);

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

  // Filtrado por nombre y apellidos
  const usuariosFiltrados = usuarios.filter((u) => {
    const nombreCompleto =
      `${u.givenName ?? ""} ${u.sn ?? ""} ${u.uid}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

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
          {/* Campo de búsqueda */}
          <Input
            placeholder="Buscar por nombre, apellidos o UID"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mb-2"
          />

          {/* Listado de usuarios con checkboxes */}
          <div className="max-h-64 overflow-y-auto border p-2 rounded mb-2">
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
            {usuariosFiltrados.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No se encontraron usuarios
              </p>
            )}
          </div>

          {/* Selección de perfil */}
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
