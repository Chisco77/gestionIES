/**
 * DialogoLlavesRestricciones.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Proyecto: gestionIES
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Descripción:
 * Diálogo para activar o desactivar la restricción
 * de entrega de llaves solo con reserva previa,
 * con gestión de excepciones por usuario.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Key, UserPlus } from "lucide-react";
import { useProfesoresStaff } from "@/hooks/useProfesoresStaff"; // Tu nuevo hook
import { SelectEntidadSimple } from "@/modules/Utilidades/components/SelectEntidadSimple";

export function DialogoLlavesRestricciones({ open, onOpenChange }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const [activa, setActiva] = useState(false);
  const [existe, setExiste] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [excepciones, setExcepciones] = useState([]);
  const [nuevoUid, setNuevoUid] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: personalActivo, isLoading: loadingPersonal } =
    useProfesoresStaff();

  useEffect(() => {
    if (open) {
      fetchRestriccionLlaves();
      fetchExcepciones();
    }
  }, [open]);

  // --- API FETCHERS (Se mantienen tus funciones originales) ---
  const fetchRestriccionLlaves = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_URL}/db/restricciones/llaves`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data) {
        setActiva(data.valor_bool);
        setExiste(true);
      }
    } catch (err) {
      toast.error("Error al cargar configuración");
    } finally {
      setCargando(false);
    }
  };

  const fetchExcepciones = async () => {
    try {
      const res = await fetch(
        `${API_URL}/db/restricciones/llaves/excepciones`,
        { credentials: "include" }
      );
      const data = await res.json();
      setExcepciones(data.excepciones || []);
    } catch (err) {
      toast.error("Error al cargar excepciones");
    }
  };

  const guardarRestriccionMutation = useMutation({
    mutationFn: async () => {
      const method = existe ? "PUT" : "POST";
      await fetch(`${API_URL}/db/restricciones/llaves`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ activa }),
      });
    },
    onSuccess: () => {
      toast.success("Configuración guardada");
      onOpenChange(false);
    },
  });

  const agregarExcepcion = async () => {
    if (!nuevoUid.trim()) return toast.error("Selecciona un profesor");
    try {
      const res = await fetch(
        `${API_URL}/db/restricciones/llaves/excepciones`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ uid: nuevoUid }),
        }
      );
      const data = await res.json();
      setExcepciones(data.usuarios);
      setNuevoUid("");
      setShowForm(false);
      toast.success("Excepción añadida");
    } catch (err) {
      toast.error("No se pudo añadir la excepción");
    }
  };

  const eliminarExcepcion = async (uid) => {
    try {
      const res = await fetch(
        `${API_URL}/db/restricciones/llaves/excepciones`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ uid }),
        }
      );
      const data = await res.json();
      setExcepciones(data.usuarios);
      toast.success("Excepción eliminada");
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 rounded-xl w-[600px] flex flex-col overflow-hidden border-none shadow-2xl"
      >
        <DialogHeader className="bg-green-600 text-white flex items-center justify-center py-5 px-6 shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <Key className="w-5 h-5" /> Control de Llaves
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8 bg-white overflow-y-auto max-h-[70vh]">
          {/* SECCIÓN 1: EL SWITCH PRINCIPAL */}
          <div className="flex items-start justify-between gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
            <div className="space-y-1">
              <Label className="text-sm font-bold text-slate-800">
                Restringir entrega por reserva
              </Label>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                La llave solo se entregará si existe una reserva activa del aula
                (disponible 15 min antes).
              </p>
            </div>
            <Switch
              checked={activa}
              onCheckedChange={setActiva}
              disabled={cargando}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* SECCIÓN 2: EXCEPCIONES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Excepciones
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {excepciones.length}
                </span>
              </div>
              <Button
                variant={showForm ? "ghost" : "outline"}
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className={
                  showForm
                    ? "text-slate-400"
                    : "border-green-600 text-green-700 hover:bg-green-50 h-8 font-bold text-xs"
                }
              >
                {showForm ? "Cancelar" : "+ Añadir Excepción"}
              </Button>
            </div>

            {/* FORMULARIO COLAPSABLE Profes y staff */}
            {showForm && (
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-green-700 ml-1">
                      Personal Autorizado (Profesorado o Personal no Docente)
                    </Label>

                    {/* Aquí la integración clave */}
                    <SelectEntidadSimple
                      value={nuevoUid}
                      onChange={setNuevoUid}
                      options={personalActivo} // <--- Pasamos el array combinado del hook
                      isLoading={loadingPersonal} // <--- Pasamos el estado de carga
                      placeholder="Buscar por nombre o apellidos..."
                    />
                  </div>

                  <Button
                    onClick={agregarExcepcion}
                    disabled={!nuevoUid}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-9 font-bold shadow-sm"
                  >
                    Confirmar Excepción
                  </Button>
                </div>
              </div>
            )}

            {/* LISTADO DE EXCEPCIONES */}
            <div className="grid gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {excepciones.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-xl border-slate-100 text-slate-400 text-sm italic">
                  No hay usuarios con permiso especial
                </div>
              ) : (
                excepciones.map((uid) => {
                  const prof = personalActivo.find((p) => p.uid === uid);
                  return (
                    <div
                      key={uid}
                      className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-green-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">
                            {prof ? `${prof.sn}, ${prof.givenName}` : uid}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">
                            {uid}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => eliminarExcepcion(uid)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-600 rounded-full h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => guardarRestriccionMutation.mutate()}
            disabled={guardarRestriccionMutation.isLoading}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] font-bold shadow-md"
          >
            {guardarRestriccionMutation.isLoading
              ? "Guardando..."
              : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
