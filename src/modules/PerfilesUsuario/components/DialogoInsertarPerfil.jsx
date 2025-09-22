/*import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function DialogoInsertarPerfil({ open, onClose, onSuccess }) {
  const [uid, setUid] = useState("");
  const [perfil, setPerfil] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const opcionesPerfiles = [
    "administrador",
    "directiva",
    "profesor",
    "educadora",
    "ordenanza",
  ];

  const handleGuardar = async () => {
    if (!uid || !perfil) {
      toast.error("UID y perfil son obligatorios");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/db/perfiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uid, perfil }),
      });

      if (!res.ok) throw new Error("Error al insertar perfil");

      toast.success("Perfil insertado");
      setUid("");
      setPerfil("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Error al insertar perfil");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insertar perfil</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="mb-2"
        />

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

        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
*/
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
    "profesor",
    "educadora",
    "ordenanza",
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
    const nombreCompleto = `${u.givenName ?? ""} ${u.sn ?? ""} ${u.uid}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Asignar perfil a usuarios</DialogTitle>
        </DialogHeader>

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
            <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
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

        <DialogFooter>
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
