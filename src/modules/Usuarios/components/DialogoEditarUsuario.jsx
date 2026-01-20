/**
 * DialogoEditarUsuario.jsx - Componente de diálogo para editar un usuario (alumno o profesor)
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Descripción:
 * Componente que renderiza un diálogo para editar la información de un usuario.
 * Permite editar campos según el perfil del usuario activo.
 *
 * Props:
 * - open: boolean, controla si el diálogo está abierto.
 * - onClose: función para cerrar el diálogo.
 * - usuarioSeleccionado: objeto con los datos del usuario a editar.
 * - empleadoSeleccionado: datos del empleado (solo si no es alumno)
 * - esAlumno: boolean
 * - modo: "admin" o "perfil" (opcional)
 *
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export default function DialogoEditarUsuario({
  open,
  onClose,
  usuarioSeleccionado,
  empleadoSeleccionado,
  esAlumno,
  modo = "admin",
}) {
  const queryClient = useQueryClient();
  const { user: usuarioActivo } = useAuth(); // perfil del usuario logueado

  // ⚠️ Evitar errores si no hay usuario seleccionado
  if (!usuarioSeleccionado) return null;

  // Permisos dinámicos
  const esPropietario = usuarioActivo?.username === usuarioSeleccionado?.uid;
  const puedeEditarAvanzados = ["admin", "directiva"].includes(
    usuarioActivo?.perfil
  );
  const puedeEditarBasicos = esPropietario || puedeEditarAvanzados;

  // LDAP
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [grupo, setGrupo] = useState("");
  const [uid, setUid] = useState("");
  const [fotoUrl, setFotoUrl] = useState(null);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);

  // Empleados
  const [dni, setDni] = useState("");
  const [asuntosPropios, setAsuntosPropios] = useState(0);
  const [tipoEmpleado, setTipoEmpleado] = useState("");
  const [jornada, setJornada] = useState(0);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  // Sincronizar datos LDAP
  useEffect(() => {
    if (!open || !usuarioSeleccionado) return;

    setNombre(usuarioSeleccionado.givenName || "");
    setApellidos(usuarioSeleccionado.sn || "");
    setUid(usuarioSeleccionado.uid || "");
    setGrupo(usuarioSeleccionado.gidNumber || "");
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
  }, [usuarioSeleccionado, open, esAlumno, SERVER_URL]);

  // Sincronizar datos empleados
  useEffect(() => {
    if (!empleadoSeleccionado || !open) return;

    setDni(empleadoSeleccionado.dni || "");
    setAsuntosPropios(empleadoSeleccionado.asuntos_propios || 0);
    setTipoEmpleado(empleadoSeleccionado.tipo_empleado || "");
    setJornada(empleadoSeleccionado.jornada ?? 0);
    setEmail(empleadoSeleccionado.email || "");
    setTelefono(empleadoSeleccionado.telefono || "");
  }, [empleadoSeleccionado, open]);

  // Cargar grupos disponibles según tipo de usuario
  useEffect(() => {
    if (!open) return;
    const groupType = esAlumno ? "school_class" : "school_department";

    fetch(`${API_URL}/ldap/grupos?groupType=${groupType}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setGruposDisponibles(data.sort((a, b) => a.cn.localeCompare(b.cn)))
      )
      .catch(() => toast.error("Error al obtener grupos"));
  }, [open, esAlumno, API_URL]);

  // Mutation para guardar empleado
  const mutation = useMutation({
    mutationFn: async (datos) => {
      const res = await fetch(
        `${API_URL}/db/empleados/${usuarioSeleccionado.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(datos),
        }
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Error al actualizar empleado");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["empleados"]);
      toast.success("Empleado actualizado correctamente");
      onClose();
    },
    onError: (err) => {
      console.error("Error actualizando empleado:", err);
      toast.error(err.message || "Error al guardar empleado");
    },
  });

  const handleGuardar = () => {
    if (!usuarioSeleccionado || esAlumno) return;

    const datos = {};

    if (puedeEditarBasicos) {
      datos.dni = dni;
      datos.email = email;
      datos.telefono = telefono;
    }
    if (puedeEditarAvanzados) {
      datos.asuntos_propios = asuntosPropios;
      datos.tipo_empleado = tipoEmpleado;
      datos.jornada = jornada;
    }

    mutation.mutate(datos);
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
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
          <DialogTitle>
            {usuarioSeleccionado.givenName} {usuarioSeleccionado.sn}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* LDAP */}
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Apellidos</label>
            <Input
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Grupo</label>
            <Select value={grupo} onValueChange={setGrupo} disabled>
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

          {/* Empleados */}
          {!esAlumno && empleadoSeleccionado && (
            <>
              <div>
                <label className="block text-sm font-medium">DNI</label>
                <Input
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  disabled={!puedeEditarBasicos}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!puedeEditarBasicos}
                  placeholder="correo@centro.es"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Teléfono</label>
                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={!puedeEditarBasicos}
                  placeholder="600123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Máximo Asuntos Propios
                </label>
                <Input
                  type="number"
                  value={asuntosPropios}
                  onChange={(e) => setAsuntosPropios(Number(e.target.value))}
                  disabled={!puedeEditarAvanzados}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Tipo Empleado
                </label>
                <Select
                  value={tipoEmpleado}
                  onValueChange={setTipoEmpleado}
                  disabled={!puedeEditarAvanzados}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "funcionario de carrera",
                      "funcionario interino",
                      "funcionario en prácticas",
                      "laboral indefinido",
                      "laboral temporal",
                    ].map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium">Jornada</label>
                <Select
                  value={String(jornada)}
                  onValueChange={(val) => setJornada(Number(val))}
                  disabled={!puedeEditarAvanzados}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Completa</SelectItem>
                    <SelectItem value="1">Partida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
