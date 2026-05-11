import { useState } from "react";
import { columnsBajas } from "../components/columns-bajas";
import { TablaBajas } from "../components/TablaBajas";
import { useSustituciones } from "@/hooks/useSustituciones";
import { Pencil, Trash2, LogOut, UserPlus, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { DialogoSustituir } from "../components/DialogoSustituir";
import { DialogoFinalizarSustitucion } from "../components/DialogoFinalizarSustitucion";
import { DialogoEditarSustitucion } from "../components/DialogoEditarSustitucion";
import { DialogoEliminarSustitucion } from "../components/DialogoEliminarSustitucion";

export function BajasIndex() {
  const { user } = useAuth();
  const [bajaSeleccionada, setBajaSeleccionada] = useState(null);
  const [abrirAsignar, setAbrirAsignar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirFinalizar, setAbrirFinalizar] = useState(false);
  const [abrirEliminar, setAbrirEliminar] = useState(false);

  // Hook similar a useAusencias pero para la tabla sustituciones
  const { data: bajas, isLoading, error, refetch } = useSustituciones();

  const esDirectiva = user?.perfil === "directiva";

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-10 border rounded-lg bg-red-50">
          ❌ Error al cargar sustituciones: {error.message}
        </div>
      ) : (
        // ... dentro de BajasIndex.jsx en el prop acciones de TablaBajas

        <TablaBajas
          columns={columnsBajas}
          data={bajas || []}
          esDirectiva={esDirectiva}
          acciones={(seleccionado) => {
            const haySeleccion = !!seleccionado;
            const estaActiva = seleccionado && !seleccionado.fecha_fin;

            return (
              <div className="flex gap-2 mt-2">
                <TooltipProvider>
                  {/* 1. BOTÓN NUEVA SUSTITUCIÓN (Siempre habilitado para directiva) */}
                  {esDirectiva && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          className="bg-green-600 hover:bg-green-700 shadow-md"
                          onClick={() => setAbrirAsignar(true)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-green-700 text-white">
                        Registrar nueva sustitución
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* 2. BOTÓN EDITAR (Lápiz) */}
                  {esDirectiva && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={!haySeleccion}
                          onClick={() => {
                            setBajaSeleccionada(seleccionado);
                            setAbrirEditar(true);
                          }}
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Editar fechas u observaciones
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* 3. BOTÓN FINALIZAR (Puerta/Salida) */}
                  {esDirectiva && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={!estaActiva}
                          onClick={() => {
                            setBajaSeleccionada(seleccionado);
                            setAbrirFinalizar(true);
                          }}
                        >
                          <LogOut className="w-4 h-4 text-amber-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Finalizar sustitución (Retorno titular)
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* 4. BOTÓN ELIMINAR (Papelera) */}
                  {esDirectiva && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={!haySeleccion}
                          onClick={() => {
                            setBajaSeleccionada(seleccionado);
                            setAbrirEliminar(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-red-600 text-white">
                        Eliminar registro por completo
                      </TooltipContent>
                    </Tooltip>
                  )}
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
        onSuccess={refetch}
      />

      <DialogoEditarSustitucion
        open={abrirEditar}
        onOpenChange={setAbrirEditar}
        sustitucion={bajaSeleccionada}
      />

      <DialogoFinalizarSustitucion
        open={abrirFinalizar}
        onOpenChange={setAbrirFinalizar}
        sustitucion={bajaSeleccionada}
        onSuccess={refetch}
      />

      <DialogoEliminarSustitucion
        open={abrirEliminar}
        onOpenChange={setAbrirEliminar}
        sustitucion={bajaSeleccionada}
      />
    </div>
  );
}
