/**
 * ------------------------------------------------------------
 * Componente: NotificacionesPopover.jsx
 *
 * Descripción:
 * Componente que muestra un popover con el resumen de notificaciones
 * pendientes para el usuario (equipo directivo). Desde este popover
 * se puede acceder a un cuadro de diálogo con el detalle completo
 * de cada tipo de notificación.
 *
 * Funcionalidad:
 * - Muestra el número total de notificaciones en un icono (campana)
 * - Despliega un popover con:
 *    - Permisos pendientes
 *    - Actividades extraescolares pendientes
 * - Permite abrir un diálogo modal con tablas detalladas
 * - Cierra automáticamente el popover al abrir el diálogo
 *
 * Componentes relacionados:
 * - NotificacionesBell
 * - TablaPermisosDirectiva
 * - TablaExtraescolaresDirectiva
 *
 * Dependencias principales:
 * - React (useState)
 * - ShadCN UI (Popover, Dialog, Button)
 * - Lucide-react (iconos)
 *
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * Centro: IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import NotificacionesBell from "./NotificacionesBell";
import { ArrowRight } from "lucide-react";

import { TablaPermisosDirectiva } from "@/modules/PanelReservasDirectiva/components/TablaPermisosDirectiva";
import { TablaExtraescolaresDirectiva } from "@/modules/PanelReservasDirectiva/components/TablaExtraescolaresDirectiva";
import { Button } from "@/components/ui/button";

export default function NotificacionesPopover({
  permisos,
  extraescolares,
  total,
}) {
  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [tipoDialogo, setTipoDialogo] = useState(null);

  const handleAbrirPermisos = () => {
    setTipoDialogo("permisos");
    setOpenDialog(true);
    setOpenPopover(false);
  };

  const handleAbrirExtraescolares = () => {
    setTipoDialogo("extraescolares");
    setOpenDialog(true);
    setOpenPopover(false);
  };

  return (
    <>
      {/* POPOVER */}
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <div>
            <NotificacionesBell total={total} />
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-72 bg-white">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Notificaciones</h4>

            {total === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay elementos pendientes
              </p>
            )}

            {permisos > 0 && (
              <div
                onClick={handleAbrirPermisos}
                className="flex justify-between items-center text-sm cursor-pointer hover:bg-muted p-2 rounded-md transition"
              >
                <span>Permisos pendientes</span>
                <span className="font-semibold text-red-600">{permisos}</span>
              </div>
            )}

            {extraescolares > 0 && (
              <div
                onClick={handleAbrirExtraescolares}
                className="flex justify-between items-center text-sm cursor-pointer hover:bg-muted p-2 rounded-md transition"
              >
                <span>Extraescolares pendientes</span>
                <span className="font-semibold text-orange-600">
                  {extraescolares}
                </span>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* DIALOG */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog} modal={true}>
        <DialogContent
          className="p-0 overflow-visible rounded-lg max-w-6xl w-full"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="bg-green-500 text-white rounded-t-lg flex flex-col items-center justify-center py-3 px-6">
            <DialogTitle className="text-lg font-semibold text-center leading-snug">
              {tipoDialogo === "permisos"
                ? "Gestión de Permisos"
                : "Gestión de Actividades Extraescolares"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col max-h-[120vh]">
            {/* CONTENIDO */}
            <div className="p-4 overflow-y-auto">
              {tipoDialogo === "permisos" && (
                <TablaPermisosDirectiva soloPendientesInicial />
              )}

              {tipoDialogo === "extraescolares" && (
                <TablaExtraescolaresDirectiva soloPendientesInicial />
              )}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end border-t p-4 bg-muted/30">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
