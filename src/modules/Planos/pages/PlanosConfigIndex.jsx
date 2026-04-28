import { useState } from "react";
import { columns } from "../components/columns";
import { TablaPlanos } from "../components/TablaPlanos";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { DialogoInsertarPlano } from "../components/DialogoInsertarPlano";
import { DialogoEliminarPlano } from "../components/DialogoEliminarPlano";
import { usePlanos } from "@/hooks/usePlanos"; // Tu nuevo hook
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PlanosConfigIndex() {
  const { data: planos = [], isLoading, refetch } = usePlanos();
  const [abrirDialogoInsertar, setAbrirDialogoInsertar] = useState(false);
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);
  const [planoSeleccionado, setPlanoSeleccionado] = useState(null);

  const handleEliminar = (plano) => {
    setPlanoSeleccionado(plano);
    setAbrirDialogoEliminar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900">
          Configuración de Planos
        </h2>
        {isLoading && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        )}
      </div>

      <TablaPlanos
        columns={columns}
        data={planos} // Ahora usamos directamente la data del hook
        acciones={(seleccionado) => (
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAbrirDialogoInsertar(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  <p>Nuevo plano</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEliminar(seleccionado)}
                    disabled={!seleccionado}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-500 text-white">
                  <p>Eliminar plano</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      />

      <DialogoInsertarPlano
        open={abrirDialogoInsertar}
        onOpenChange={setAbrirDialogoInsertar}
        onSuccess={() => {
          // Ya no hace falta fetchPlanos manual,
          // React Query lo hace solo por la invalidación en el hijo
          setAbrirDialogoInsertar(false);
        }}
      />

      <DialogoEliminarPlano
        open={abrirDialogoEliminar}
        onClose={() => setAbrirDialogoEliminar(false)}
        planoSeleccionado={planoSeleccionado}
        onSuccess={() => {
          setAbrirDialogoEliminar(false);
        }}
      />
    </div>
  );
}
