import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGuardias } from "@/hooks/useGuardias";
import { getColumnsGuardias } from "../components/columns-guardias";
import { TablaGuardias } from "../components/TablaGuardias";
import { generarPdfControlGuardias } from "@/Informes/guardias";
import { getCursoActual } from "@/utils/fechasHoras";
import { Loader, Printer, FileText, ClipboardCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { resolverRutaLogo } from "@/Informes/utils";

export function GuardiasIndex() {
  const { user } = useAuth();
  const { data: guardias, isLoading, error } = useGuardias();
  const [cargandoInforme, setCargandoInforme] = useState(false);

  const esDirectiva = user?.perfil === "directiva";

  const columns = useMemo(() => getColumnsGuardias(esDirectiva), [esDirectiva]);
  const { data: centro } = useConfiguracionCentro(); // Traemos los datos del centro

  const guardiasVisibles = useMemo(() => {
    if (!guardias) return [];
    const efectivas = guardias.filter(
      (g) => g.confirmada === true && g.estado === "activa"
    );
    if (esDirectiva) return efectivas;
    return efectivas.filter((g) => g.uid_profesor_cubridor === user?.username);
  }, [guardias, user, esDirectiva]);

  const handleGenerarInformeControl = async () => {
    try {
      setCargandoInforme(true);
      const curso = getCursoActual();
      const API_URL = import.meta.env.VITE_API_URL;
      const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

      const response = await fetch(
        `${API_BASE}/horario-profesorado/enriquecido?curso_academico=${curso.label}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Error al obtener los horarios");

      const dataHorarios = await response.json();
      const horariosSoloGuardia = (dataHorarios.horario || []).filter(
        (h) => h.tipo === "guardia"
      );

      if (horariosSoloGuardia.length === 0) {
        alert("No hay horarios de guardia definidos.");
        return;
      }

      // Extraer periodos únicos
      const periodosMap = new Map();
      horariosSoloGuardia.forEach((h) => {
        if (!periodosMap.has(h.idperiodo)) {
          periodosMap.set(h.idperiodo, {
            id: h.idperiodo,
            nombre: h.periodo_nombre,
            inicio: h.inicio,
            fin: h.fin,
          });
        }
      });

      const periodosOrdenados = Array.from(periodosMap.values()).sort((a, b) =>
        a.inicio.localeCompare(b.inicio)
      );

      const urlParaPdf = resolverRutaLogo(centro?.logoCentroUrl);

      await generarPdfControlGuardias(
        horariosSoloGuardia,
        guardiasVisibles,
        periodosOrdenados,
        curso.label,
        urlParaPdf // <--- PASAMOS LA URL RESUELTA
      );
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setCargandoInforme(false);
    }
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-10 border rounded-lg bg-red-50">
          ❌ Error: {error.message}
        </div>
      ) : (
        <TablaGuardias
          columns={columns}
          data={guardiasVisibles}
          esDirectiva={esDirectiva}
          informes={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={cargandoInforme}
                >
                  {cargandoInforme ? (
                    <Loader className="animate-spin w-5 h-5" />
                  ) : (
                    <Printer className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {esDirectiva && (
                  <DropdownMenuItem onClick={handleGenerarInformeControl}>
                    <ClipboardCheck className="mr-2 h-4 w-4 text-blue-600" />
                    Informe Control de Guardias (Anual)
                  </DropdownMenuItem>
                )}
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
                      className="opacity-50"
                      disabled
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {seleccionado
                        ? "Histórico no editable"
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
