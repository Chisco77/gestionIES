/**
 * DialogoAsuntosRestricciones.jsx - Diálogo para las restricciones aplicables a asuntos propios
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que muestra un cuadro de diálogo para establecer restricciones
 * para la petición de días de asuntos propios.
 *
 */

import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogoEliminarRango } from "./DialogoEliminarRango";

export function DialogoAsuntosRestricciones() {
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [open, setOpen] = useState(true);
  const [restricciones, setRestricciones] = useState({
    asuntosDisponibles: 0,
    maxPorDia: 0,
    antelacionMinima: 0,
    maxConsecutivos: 0,
    ofuscar: false,
  });

  const [rangoAEliminar, setRangoAEliminar] = useState(null);
  const [dialogoEliminarRangoAbierto, setDialogoEliminarRangoAbierto] =
    useState(false);

  const [rangos, setRangos] = useState([]);
  const [nuevoRango, setNuevoRango] = useState({
    inicio: "",
    fin: "",
    motivo: "",
  });
  const [cargandoRangos, setCargandoRangos] = useState(false);

  useEffect(() => {
    setOpen(true);
    if (open) {
      fetchRestricciones();
      fetchRangos();
    }
  }, [location.key]);

  const fetchRestricciones = async () => {
    try {
      const res = await fetch(`${API_URL}/db/restricciones`, {
        credentials: "include",
      });
      if (!res.ok)
        throw new Error("Error al obtener restricciones de asuntos propios");
      const data = await res.json();

      const map = {
        dias: "asuntosDisponibles",
        concurrentes: "maxPorDia",
        antelacion: "antelacionMinima",
        consecutivos: "maxConsecutivos",
        ofuscar: "ofuscar",
      };

      const newState = { ...restricciones };
      data.forEach((r) => {
        if (r.restriccion === "asuntos" && map[r.descripcion]) {
          if (r.descripcion === "ofuscar") {
            newState[map[r.descripcion]] = r.valor_bool;
          } else {
            newState[map[r.descripcion]] = r.valor_num;
          }
        }
      });
      setRestricciones(newState);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar las restricciones de asuntos propios");
    }
  };

  const fetchRangos = async () => {
    try {
      setCargandoRangos(true);
      const res = await fetch(`${API_URL}/db/restricciones/asuntos/rangos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener rangos bloqueados");
      const data = await res.json();
      setRangos(data.rangos || []);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los rangos bloqueados");
    } finally {
      setCargandoRangos(false);
    }
  };

  const handleChange = (field, value) =>
    setRestricciones((prev) => ({ ...prev, [field]: value }));

  const handleGuardar = async () => {
    try {
      const res = await fetch(`${API_URL}/db/restricciones/asuntos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(restricciones),
      });
      if (!res.ok) throw new Error("Error al guardar restricciones");

      toast.success("Restricciones de asuntos propios guardadas correctamente");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar restricciones de asuntos propios");
    }
  };

  const handleCancelar = () => setOpen(false);

  const handleAddRango = async () => {
    if (!nuevoRango.inicio || !nuevoRango.fin) {
      toast.error("Debes indicar fechas de inicio y fin");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/restricciones/asuntos/rangos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevoRango),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al añadir rango bloqueado");
      }
      const data = await res.json();
      setRangos(data.rangos);
      setNuevoRango({ inicio: "", fin: "", motivo: "" });
      toast.success("Rango bloqueado añadido correctamente");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleDeleteRango = async (inicio, fin) => {
    if (!confirm("¿Eliminar este rango bloqueado?")) return;
    try {
      const res = await fetch(`${API_URL}/db/restricciones/asuntos/rangos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inicio, fin }),
      });
      if (!res.ok) throw new Error("Error al eliminar rango bloqueado");

      const data = await res.json();
      setRangos(data.rangos);
      toast.success("Rango eliminado correctamente");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el rango bloqueado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogContent
        className="p-0 rounded-lg h-[550px] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Restricciones de Asuntos Propios
          </DialogTitle>
        </DialogHeader>

        <Card className="border-none shadow-none bg-transparent flex-1 overflow-hidden">
          <CardContent className="space-y-5 pt-4 flex flex-col h-full overflow-hidden">
            <Tabs
              defaultValue="restricciones"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="justify-start">
                <TabsTrigger value="restricciones">Restricciones</TabsTrigger>
                <TabsTrigger value="rangos">Rangos bloqueados</TabsTrigger>
              </TabsList>

              {/* --- Tab: Restricciones numéricas --- */}
              <TabsContent
                value="restricciones"
                className="flex-1 overflow-auto space-y-5"
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="asuntosDisponibles"
                    className="text-sm font-medium"
                  >
                    Asuntos propios disponibles
                  </Label>
                  <Input
                    id="asuntosDisponibles"
                    type="number"
                    value={restricciones.asuntosDisponibles}
                    onChange={(e) =>
                      handleChange("asuntosDisponibles", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxPorDia" className="text-sm font-medium">
                    Máximo de peticiones por día
                  </Label>
                  <Input
                    id="maxPorDia"
                    type="number"
                    value={restricciones.maxPorDia}
                    onChange={(e) =>
                      handleChange("maxPorDia", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="antelacionMinima"
                    className="text-sm font-medium"
                  >
                    Antelación mínima (días)
                  </Label>
                  <Input
                    id="antelacionMinima"
                    type="number"
                    value={restricciones.antelacionMinima}
                    onChange={(e) =>
                      handleChange("antelacionMinima", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="maxConsecutivos"
                    className="text-sm font-medium"
                  >
                    Máximo de días consecutivos
                  </Label>
                  <Input
                    id="maxConsecutivos"
                    type="number"
                    value={restricciones.maxConsecutivos}
                    onChange={(e) =>
                      handleChange("maxConsecutivos", Number(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="ofuscar" className="text-sm font-medium">
                    Ofuscar nombres en el calendario
                  </Label>
                  <Switch
                    id="ofuscar"
                    checked={restricciones.ofuscar}
                    onCheckedChange={(checked) =>
                      handleChange("ofuscar", checked)
                    }
                  />
                </div>
              </TabsContent>

              {/* --- Tab: Rangos bloqueados --- */}
              <TabsContent
                value="rangos"
                className="flex-1 overflow-auto space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Define periodos en los que no se podrán solicitar días de
                  asuntos propios.
                </p>

                <div className="flex-1 overflow-auto space-y-2 mb-3">
                  {cargandoRangos ? (
                    <p className="text-sm text-muted-foreground">Cargando...</p>
                  ) : rangos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay rangos bloqueados actualmente.
                    </p>
                  ) : (
                    rangos.map((r, i) => {
                      const inicioStr = new Date(r.inicio).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        }
                      );
                      const finStr = new Date(r.fin).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        }
                      );

                      return (
                        <Card
                          key={i}
                          className="border shadow-sm rounded-xl p-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors relative"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span>
                                {inicioStr} → {finStr}
                              </span>
                              {r.motivo && (
                                <div className="text-muted-foreground ml-0">
                                  ({r.motivo})
                                </div>
                              )}
                            </div>
                            <Button
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRangoAEliminar(r);
                                setDialogoEliminarRangoAbierto(true);
                              }}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <Input
                    type="date"
                    value={nuevoRango.inicio}
                    onChange={(e) =>
                      setNuevoRango((p) => ({ ...p, inicio: e.target.value }))
                    }
                  />
                  <Input
                    type="date"
                    value={nuevoRango.fin}
                    onChange={(e) =>
                      setNuevoRango((p) => ({ ...p, fin: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Motivo (opcional)"
                    value={nuevoRango.motivo}
                    onChange={(e) =>
                      setNuevoRango((p) => ({ ...p, motivo: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="secondary" onClick={handleAddRango}>
                    Añadir rango
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <DialogFooter className="px-6 py-4 bg-gray-50">
              <Button variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button variant="outline" onClick={handleGuardar}>
                Guardar
              </Button>
            </DialogFooter>
          </CardContent>
        </Card>
      </DialogContent>

      
      {rangoAEliminar && (
        <DialogoEliminarRango
          rango={rangoAEliminar}
          open={dialogoEliminarRangoAbierto}
          onOpenChange={setDialogoEliminarRangoAbierto}
          onDeleteSuccess={() => {
            fetchRangos(); // recarga rangos después de eliminar
            setRangoAEliminar(null);
          }}
        />
      )}
    </Dialog>
  );
}
