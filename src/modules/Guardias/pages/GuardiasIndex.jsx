import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGuardias } from "@/hooks/useGuardias";
import { getColumnsGuardias } from "../components/columns-guardias";
import { TablaGuardias } from "../components/TablaGuardias";
import {
  Loader,
  ShieldCheck,
  Printer,
  FileText,
  Info,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

export function GuardiasIndex() {
  const { user } = useAuth();
  const { data: guardias, isLoading, error } = useGuardias();
  const esDirectiva = user?.perfil === "directiva";
  const hoyStr = format(new Date(), "yyyy-MM-dd");

  // Columnas dinámicas según perfil
  const columns = useMemo(() => getColumnsGuardias(esDirectiva), [esDirectiva]);

  // Filtrado inicial (el profesor solo ve lo suyo)
  const guardiasVisibles = useMemo(() => {
    if (!guardias) return [];
    if (esDirectiva) return guardias;
    return guardias.filter((g) => g.uid_profesor_cubridor === user?.username);
  }, [guardias, user, esDirectiva]);

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-10 border rounded-lg bg-red-50">
          ❌ Error al cargar las guardias: {error.message}
        </div>
      ) : (
        <TablaGuardias
          columns={columns}
          data={guardiasVisibles}
          esDirectiva={esDirectiva}
          informes={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.print()}>
                  <FileText className="mr-2 h-4 w-4" /> Exportar vista actual
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          acciones={(seleccionado) => (
            <div className="flex gap-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-default opacity-50"
                      disabled={!seleccionado}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {seleccionado
                        ? "Registro histórico no editable"
                        : "Selecciona una fila"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        />
      )}
    </div>
  );
}
