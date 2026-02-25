import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificacionesBell from "./NotificacionesBell";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NotificacionesPopover({
  permisos,
  extraescolares,
  total,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // Estado controlado del Popover

  // ✅ ya son números, no objetos
  const totalPermisos = permisos;
  const totalExtraescolares = extraescolares;

  const irADashboard = () => {
    navigate("/"); // Navega al dashboard
    setOpen(false); // Cierra el popover
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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

          {totalPermisos > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span>Permisos pendientes</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-600">
                  {totalPermisos}
                </span>
                <button
                  onClick={irADashboard}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Ir al dashboard"
                >
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </button>
              </div>
            </div>
          )}

          {totalExtraescolares > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span>Extraescolares pendientes</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-600">
                  {totalExtraescolares}
                </span>
                <button
                  onClick={irADashboard}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Ir al dashboard"
                >
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}