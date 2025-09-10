/*import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function DialogoAccionMasiva({ open, onClose, onSuccess, tipo }) {
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const titulos = {
    entregarDoc: "Entrega de documento de compromiso",
    recibirDoc: "Recepción de documento de compromiso",
    entregarLibros: "Entrega física de libros",
    devolverLibros: "Devolución de libros",
  };

  useEffect(() => {
    if (open) {
      setGrupoSeleccionado("");
      setAlumnos([]);
      setAlumnosSeleccionados([]);
    }
  }, [open]);

  useEffect(() => {
    fetch(`${API_URL}/ldap/grupos?groupType=school_class`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setGrupos(data.sort((a, b) => a.cn.localeCompare(b.cn))))
      .catch(() => toast.error("Error al obtener grupos"));
  }, []);

  useEffect(() => {
    if (grupoSeleccionado) {
      fetch(`${API_URL}/ldap/usuariosPorGrupo?grupo=${grupoSeleccionado}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then(setAlumnos)
        .catch(() => toast.error("Error al obtener alumnos"));
    } else {
      setAlumnos([]);
      setAlumnosSeleccionados([]);
    }
  }, [grupoSeleccionado]);

  const toggleSeleccionarTodosAlumnos = () => {
    if (alumnosSeleccionados.length === alumnos.length) {
      setAlumnosSeleccionados([]);
    } else {
      setAlumnosSeleccionados(alumnos.map((a) => a.uid));
    }
  };

  const handleAccion = async () => {
    if (alumnosSeleccionados.length === 0) {
      toast.error("Debes seleccionar al menos un alumno");
      return;
    }

    let endpoint = "";
    let tipoAccion = "";

    // Elegir endpoint y tipo según la acción
    if (tipo === "entregarDoc") {
      endpoint = `${API_URL}/db/prestamos/accionDocCompromisoMasivo`;
      tipoAccion = "entregar";
    } else if (tipo === "recibirDoc") {
      endpoint = `${API_URL}/db/prestamos/accionDocCompromisoMasivo`;
      tipoAccion = "recibir";
    } else if (tipo === "entregarLibros") {
      endpoint = `${API_URL}/db/prestamos/accionLibrosMasivo`;
      tipoAccion = "entregar";
    } else if (tipo === "devolverLibros") {
      endpoint = `${API_URL}/db/prestamos/accionLibrosMasivo`;
      tipoAccion = "devolver";
    } else {
      toast.error("Tipo de acción no válido");
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoAccion,
          alumnos: alumnosSeleccionados,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falló la acción");

      toast.success("Acción realizada correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Error al realizar la acción masiva");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>{titulos[tipo]}</DialogTitle>
        </DialogHeader>

        <div>
          <label className="block mb-2 font-semibold text-sm">Grupo</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={grupoSeleccionado}
            onChange={(e) => {
              setGrupoSeleccionado(e.target.value);
              setAlumnosSeleccionados([]);
            }}
          >
            <option value="">Seleccionar grupo</option>
            {grupos.map((g) => (
              <option key={g.cn} value={g.cn}>
                {g.cn}
              </option>
            ))}
          </select>

          {grupoSeleccionado && (
            <>
              <div className="flex items-center justify-between mt-4 mb-2">
                <h3 className="text-base font-semibold">Alumnos</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSeleccionarTodosAlumnos}
                  className="flex items-center space-x-1"
                >
                  {alumnosSeleccionados.length === alumnos.length ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Deseleccionar todos</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Seleccionar todos</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="max-h-64 overflow-auto border border-gray-200 rounded-md p-3 shadow-sm">
                {alumnos.length === 0 && (
                  <p className="text-xs italic text-gray-500">No hay alumnos</p>
                )}
                {alumnos.map((a) => (
                  <div key={a.uid} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`alumno-${a.uid}`}
                      checked={alumnosSeleccionados.includes(a.uid)}
                      onCheckedChange={(checked) =>
                        setAlumnosSeleccionados((prev) =>
                          checked
                            ? [...prev, a.uid]
                            : prev.filter((uid) => uid !== a.uid)
                        )
                      }
                    />
                    <label
                      htmlFor={`alumno-${a.uid}`}
                      className="text-sm select-none cursor-pointer"
                    >
                      {a.sn}, {a.givenName} ({a.uid})
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              disabled={alumnosSeleccionados.length === 0}
              onClick={handleAccion}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
*/

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function DialogoAccionMasiva({ open, onClose, onSuccess, tipo }) {
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const titulos = {
    entregarDoc: "Entrega de documento de compromiso",
    recibirDoc: "Recepción de documento de compromiso",
    entregarLibros: "Entrega física de libros",
    devolverLibros: "Devolución de libros",
  };

  useEffect(() => {
    if (open) {
      setGrupoSeleccionado("");
      setAlumnos([]);
      setAlumnosSeleccionados([]);
    }
  }, [open]);

  useEffect(() => {
    fetch(`${API_URL}/ldap/grupos?groupType=school_class`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setGrupos(data.sort((a, b) => a.cn.localeCompare(b.cn))))
      .catch(() => toast.error("Error al obtener grupos"));
  }, []);

  useEffect(() => {
    if (grupoSeleccionado) {
      fetch(`${API_URL}/ldap/usuariosPorGrupo?grupo=${grupoSeleccionado}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then(setAlumnos)
        .catch(() => toast.error("Error al obtener alumnos"));
    } else {
      setAlumnos([]);
      setAlumnosSeleccionados([]);
    }
  }, [grupoSeleccionado]);

  const toggleSeleccionarTodosAlumnos = () => {
    if (alumnosSeleccionados.length === alumnos.length) {
      setAlumnosSeleccionados([]);
    } else {
      setAlumnosSeleccionados(alumnos.map((a) => a.uid));
    }
  };

  const handleAccion = async () => {
    if (alumnosSeleccionados.length === 0) {
      toast.error("Debes seleccionar al menos un alumno");
      return;
    }

    let endpoint = "";
    let tipoAccion = "";

    if (tipo === "entregarDoc") {
      endpoint = `${API_URL}/db/prestamos/accionDocCompromisoMasivo`;
      tipoAccion = "entregar";
    } else if (tipo === "recibirDoc") {
      endpoint = `${API_URL}/db/prestamos/accionDocCompromisoMasivo`;
      tipoAccion = "recibir";
    } else if (tipo === "entregarLibros") {
      endpoint = `${API_URL}/db/prestamos/accionLibrosMasivo`;
      tipoAccion = "entregar";
    } else if (tipo === "devolverLibros") {
      endpoint = `${API_URL}/db/prestamos/accionLibrosMasivo`;
      tipoAccion = "devolver";
    } else {
      toast.error("Tipo de acción no válido");
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoAccion,
          alumnos: alumnosSeleccionados,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falló la acción");
      }

      // Toast y cierre de diálogo al finalizar
      //toast.success("Libros actualizados correctamente");
      if (data.actualizados == 0) {
        toast.error(`Se actualizaron ${data.actualizados} préstamos.`);
      } else {
        toast.success(`Se actualizaron ${data.actualizados} préstamos.`);
        onSuccess?.(); // Para que el padre recargue datos si es necesario
        onClose?.();
      }
    } catch (err) {
      toast.error("Error al realizar la acción masiva");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={false}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>{titulos[tipo]}</DialogTitle>
        </DialogHeader>

        <div>
          <label className="block mb-2 font-semibold text-sm">Grupo</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={grupoSeleccionado}
            onChange={(e) => {
              setGrupoSeleccionado(e.target.value);
              setAlumnosSeleccionados([]);
            }}
          >
            <option value="">Seleccionar grupo</option>
            {grupos.map((g) => (
              <option key={g.cn} value={g.cn}>
                {g.cn}
              </option>
            ))}
          </select>

          {grupoSeleccionado && (
            <>
              <div className="flex items-center justify-between mt-4 mb-2">
                <h3 className="text-base font-semibold">Alumnos</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSeleccionarTodosAlumnos}
                  className="flex items-center space-x-1"
                >
                  {alumnosSeleccionados.length === alumnos.length ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Deseleccionar todos</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Seleccionar todos</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="max-h-64 overflow-auto border border-gray-200 rounded-md p-3 shadow-sm">
                {alumnos.length === 0 && (
                  <p className="text-xs italic text-gray-500">No hay alumnos</p>
                )}
                {alumnos.map((a) => (
                  <div key={a.uid} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`alumno-${a.uid}`}
                      checked={alumnosSeleccionados.includes(a.uid)}
                      onCheckedChange={(checked) =>
                        setAlumnosSeleccionados((prev) =>
                          checked
                            ? [...prev, a.uid]
                            : prev.filter((uid) => uid !== a.uid)
                        )
                      }
                    />
                    <label
                      htmlFor={`alumno-${a.uid}`}
                      className="text-sm select-none cursor-pointer"
                    >
                      {a.sn}, {a.givenName} ({a.uid})
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              disabled={alumnosSeleccionados.length === 0}
              onClick={handleAccion}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
