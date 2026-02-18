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

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function DialogoEditarUsuario({
  open,
  onClose,
  usuarioSeleccionado,
  empleadoSeleccionado,
  esAlumno,
  modo = "admin",
}) {
  const queryClient = useQueryClient();
  const { user: usuarioActivo } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL;

  // ----------------------------------------
  // ⚠️ Hooks siempre inicializados
  // ----------------------------------------
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [grupo, setGrupo] = useState("");
  const [uid, setUid] = useState("");
  const [fotoUrl, setFotoUrl] = useState(null);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);

  const [dni, setDni] = useState("");
  const [asuntosPropios, setAsuntosPropios] = useState(0);
  const [tipoEmpleado, setTipoEmpleado] = useState("");
  const [jornada, setJornada] = useState(0);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cuerpo, setCuerpo] = useState(""); // Nuevo select Cuerpo

  // ----------------------------------------
  // Permisos
  // ----------------------------------------
  const esPropietario = usuarioActivo?.username === usuarioSeleccionado?.uid;
  const puedeEditarAvanzados = ["admin", "directiva"].includes(
    usuarioActivo?.perfil
  );
  const puedeEditarBasicos = esPropietario || puedeEditarAvanzados;

  // ----------------------------------------
  // Efectos para sincronizar datos desde props
  // ----------------------------------------
  useEffect(() => {
    if (!usuarioSeleccionado) return;

    setNombre(usuarioSeleccionado.givenName || "");
    setApellidos(usuarioSeleccionado.sn || "");
    setUid(usuarioSeleccionado.uid || "");

    // Datos de empleados (enriquecidos)
    setDni(usuarioSeleccionado.dni || "");
    setAsuntosPropios(usuarioSeleccionado.asuntos_propios || 0);
    setTipoEmpleado(usuarioSeleccionado.tipo_empleado || "");
    setJornada(usuarioSeleccionado.jornada ?? 0);
    setEmail(usuarioSeleccionado.email || "");
    setTelefono(usuarioSeleccionado.telefono || "");
    setCuerpo(usuarioSeleccionado.cuerpo || "");
    setGrupo(usuarioSeleccionado.grupo || ""); // <-- A1 o A2

    setFotoUrl(null);

    // Foto del alumno
    if (esAlumno && usuarioSeleccionado.uid) {
      const extensiones = ["jpg", "jpeg", "png"];
      for (const ext of extensiones) {
        const url = `/gestionIES/uploads/alumnos/${usuarioSeleccionado.uid}.${ext}`;
        setFotoUrl(url);
        break;
      }
    }
  }, [usuarioSeleccionado, esAlumno]);

  // ----------------------------------------
  // Mutation para guardar empleado
  // ----------------------------------------
  const mutation = useMutation({
    mutationFn: async (datos) => {
      if (!usuarioSeleccionado) throw new Error("No hay usuario seleccionado");

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
        throw new Error(json.message || "Error al actualizar usuario");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["empleados"]);
      queryClient.invalidateQueries(["profesores-ldap"]);
      toast.success("Usuario actualizado correctamente");
      onClose();
    },
    onError: (err) => {
      console.error("Error actualizando usuario:", err);
      toast.error(err.message || "Error al guardar usuario");
    },
  });

  const handleGuardar = () => {
    if (!usuarioSeleccionado || esAlumno) return;

    const datos = {};

    // Campos básicos
    if (puedeEditarBasicos) {
      datos.dni = dni;
      datos.email = email;
      datos.telefono = telefono;
    }

    // Campos avanzados
    if (puedeEditarAvanzados) {
      datos.asuntos_propios = asuntosPropios;
      datos.tipo_empleado = tipoEmpleado;
      datos.jornada = jornada;
      datos.cuerpo = cuerpo;
      datos.grupo = grupo;
    }

    mutation.mutate(datos);
  };

  // ----------------------------------------
  // Render seguro
  // ----------------------------------------
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
            {usuarioSeleccionado?.givenName} {usuarioSeleccionado?.sn}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personales">Datos Personales</TabsTrigger>
            <TabsTrigger value="profesionales">Datos Profesionales</TabsTrigger>
          </TabsList>

          {/* ------------------ Datos Personales ------------------ */}
          <TabsContent value="personales" className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <Input value={nombre} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium">Apellidos</label>
              <Input value={apellidos} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium">UID</label>
              <Input value={uid} disabled />
            </div>
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
              </>
            )}
          </TabsContent>

          {/* ------------------ Datos Profesionales ------------------ */}
          <TabsContent value="profesionales" className="space-y-4 mt-2">
            {!esAlumno && (
              <>
                <div>
                  <label className="block text-sm font-medium">Cuerpo</label>
                  <Select
                    value={cuerpo}
                    onValueChange={setCuerpo}
                    disabled={!puedeEditarAvanzados}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona cuerpo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Profesores de Secundaria">
                        Profesores de Secundaria
                      </SelectItem>
                      <SelectItem value="Maestros">Maestros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Grupo</label>
                  <Select
                    value={grupo}
                    onValueChange={setGrupo}
                    disabled={!puedeEditarAvanzados}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                    </SelectContent>
                  </Select>
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
              </>
            )}
          </TabsContent>
        </Tabs>

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
