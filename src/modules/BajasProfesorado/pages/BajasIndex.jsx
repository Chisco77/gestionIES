import { useState } from "react";
import { columnsBajas } from "../components/columns-bajas";
import { TablaBajas } from "../components/TablaBajas";
import { useSustituciones } from "@/hooks/useSustituciones";
import { Loader, Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { DialogoSustituir } from "../components/DialogoSustituir";

export function BajasIndex() {
  const { user } = useAuth();
  const [bajaSeleccionada, setBajaSeleccionada] = useState(null);
  const [abrirAsignar, setAbrirAsignar] = useState(false);
  const [abrirFinalizar, setAbrirFinalizar] = useState(false);

  // Hook similar a useAusencias pero para la tabla sustituciones
  const { data: bajas, isLoading, error, refetch } = useSustituciones();

  const esDirectiva = user?.perfil === "directiva";

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestión de Sustituciones (Bajas)
        </h2>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-10 border rounded-lg bg-red-50">
          ❌ Error al cargar sustituciones: {error.message}
        </div>
      ) : (
        <TablaBajas
          columns={columnsBajas}
          data={bajas || []}
          esDirectiva={esDirectiva}
          // El componente TablaAusencias es genérico, nos sirve perfectamente
          acciones={(seleccionado) => {
            const haySeleccion = !!seleccionado;
            const estaActiva = seleccionado && !seleccionado.fecha_fin;

            return (
              <div className="flex gap-2 mt-2">
                <TooltipProvider>
                  {/* BOTÓN NUEVA SUSTITUCIÓN */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="icon"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setAbrirAsignar(true)}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Registrar nueva sustitución</TooltipContent>
                  </Tooltip>

                  {/* BOTÓN FINALIZAR (Poner fecha_fin) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={!estaActiva}
                        onClick={() => setAbrirFinalizar(true)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Finalizar sustitución (Retorno titular)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          }}
        />
      )}
      {/* Aquí irán los diálogos que construiremos a continuación */}
      <DialogoSustituir
        open={abrirAsignar}
        onOpenChange={setAbrirAsignar}
        onSuccess={refetch} // Importante: refresca la tabla al terminar
      />{" "}
      {/* <DialogoFinalizarSustitucion ... /> */}
    </div>
  );
}
