/**
 * DialogoEditarUsuario.jsx - Componente de diálogo para editar un usuario (alumno o profesor)
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Componente que renderiza un diálogo para editar la información de un usuario.
 * - Campos editables: Nombre, Apellidos, Grupo, uid
 * - Si el usuario es alumno, se muestra su foto en la cabecera.
 * - Por ahora solo muestra toast de “No implementado” al guardar.
 *
 * Props:
 * - open: boolean, controla si el diálogo está abierto.
 * - onClose: función para cerrar el diálogo.
 * - usuarioSeleccionado: objeto con los datos del usuario a editar.
 * - esAlumno: boolean, indica si el usuario es alumno (para mostrar foto).
 *
 * Dependencias:
 * - React (useState, useEffect)
 * - @/components/ui/dialog
 * - @/components/ui/input
 * - @/components/ui/button
 * - sonner (toast)
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ...importaciones y props igual que antes

export function DialogoEditarUsuario({
  open,
  onClose,
  usuarioSeleccionado,
  esAlumno,
}) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [grupo, setGrupo] = useState(""); // aquí guardamos gidNumber
  const [uid, setUid] = useState("");
  const [fotoUrl, setFotoUrl] = useState(null);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    if (!usuarioSeleccionado || !open) return;

    setNombre(usuarioSeleccionado.givenName || "");
    setApellidos(usuarioSeleccionado.sn || "");
    setUid(usuarioSeleccionado.uid || "");
    setGrupo(usuarioSeleccionado.gidNumber || ""); // seleccionamos por gidNumber
    setFotoUrl(null);

    if (esAlumno) {
      const fetchFoto = async () => {
        const extensiones = ["jpg", "jpeg", "png"];
        const baseUrl = `${SERVER_URL}/uploads/alumnos/${usuarioSeleccionado.uid}`;
        for (const ext of extensiones) {
          try {
            const res = await fetch(`${baseUrl}.${ext}`, { method: "HEAD" });
            if (res.ok) {
              setFotoUrl(`${baseUrl}.${ext}`);
              return;
            }
          } catch (e) {}
        }
        setFotoUrl(null);
      };
      fetchFoto();
    }
  }, [open, usuarioSeleccionado, esAlumno, SERVER_URL]);

  // Cargar grupos disponibles según tipo de usuario
  useEffect(() => {
    if (!open) return;
    const groupType = esAlumno ? "school_class" : "school_department";

    fetch(`${API_URL}/ldap/grupos?groupType=${groupType}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setGruposDisponibles(data.sort((a, b) => a.cn.localeCompare(b.cn)));
      })
      .catch(() => toast.error("Error al obtener grupos"));
  }, [open, esAlumno, API_URL]);

  // Seleccionar grupo automáticamente cuando cambien usuario o grupos disponibles
  useEffect(() => {
    if (!usuarioSeleccionado || gruposDisponibles.length === 0) return;

    // Segundo grupo del usuario
    const segundoGrupoCN = usuarioSeleccionado.groups?.[1];
    if (segundoGrupoCN) {
      const grupoValido = gruposDisponibles.find(
        (g) => g.cn === segundoGrupoCN
      );
      if (grupoValido) {
        setGrupo(grupoValido.cn); // ahora coincide con value de SelectItem
      } else {
        setGrupo("");
      }
    } else {
      setGrupo("");
      console.log("Usuario no tiene segundo grupo definido");
    }
  }, [usuarioSeleccionado, gruposDisponibles]);

  // Render del Select
  {
    gruposDisponibles.length > 0 && usuarioSeleccionado && (
      <Select
        key={usuarioSeleccionado.uid} // fuerza re-montaje al cambiar usuario
        value={grupo}
        onValueChange={setGrupo}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un grupo" />
        </SelectTrigger>
        <SelectContent>
          {gruposDisponibles.map((g) => (
            <SelectItem key={g.gidNumber} value={g.cn}>
              {g.cn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-md"
      >
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto del usuario"
              className="w-24 h-24 rounded-full border object-cover"
            />
          ) : esAlumno ? (
            <div className="text-xs text-muted-foreground">
              No se encontró imagen
            </div>
          ) : null}
          <DialogTitle>{usuarioSeleccionado?.givenName+ " " + usuarioSeleccionado?.sn} </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Apellidos</label>
            <Input
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Grupo</label>
            <Select value={grupo} onValueChange={setGrupo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un grupo" />
              </SelectTrigger>
              <SelectContent>
                {gruposDisponibles.map((g) => (
                  <SelectItem key={g.gidNumber} value={g.cn}>
                    {g.cn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium">UID</label>
            <Input value={uid} disabled />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
