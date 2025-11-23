import { useState, useEffect } from "react";
import { TablaAsuntosDirectiva } from "../components/TablaAsuntosDirectiva";
import { columnsAsuntos } from "../components/columns-asuntos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TablaExtraescolares } from "@/modules/Extraescolares/components/TablaExtraescolares";
import { useCursosLdap } from "@/hooks/useCursosLdap";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { useAsuntosTodos } from "@/hooks/Asuntos/useAsuntosTodos";
import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";

export function PanelReservasDirectiva({ user }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // Actividades extraescolares (solo lectura, igual que en ExtraescolaresIndex)

  const handleCambio = () => {};
  const { data: departamentos } = useDepartamentosLdap();
  const { data: cursos } = useCursosLdap();
  const { data: periodos } = usePeriodosHorarios();
  const { data: asuntosPropiosTodos } = useAsuntosTodos();
  const { data: extraescolaresTodas } = useExtraescolaresAll();
  console.log("Asuntos propios: ", asuntosPropiosTodos);
  return (
    <Card className="shadow-lg rounded-2xl h-[480px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-2 overflow-hidden">
        <Tabs
          defaultValue="asuntos"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2 mb-2 gap-2">
            <TabsTrigger value="asuntos" className="text-sm py-1">
              Asuntos propios
            </TabsTrigger>
            <TabsTrigger value="actividades" className="text-sm py-1">
              Actividades extraescolares
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Tabla de Asuntos Propios */}
            <TabsContent
              value="asuntos"
              className="h-full overflow-y-auto pr-2"
            >
              <TablaAsuntosDirectiva asuntosTodos={asuntosPropiosTodos} />
            </TabsContent>

            {/* Tabla de Extraescolares */}
            <TabsContent
              value="actividades"
              className="h-full overflow-y-auto pr-2"
            >
              <Card className="shadow-lg rounded-2xl flex flex-col p-2">
                <CardHeader className="py-1">
                  <CardTitle className="text-center text-lg font-semibold p-0">
                    Actividades Extraescolares y Complementarias
                  </CardTitle>
                </CardHeader>

                <TablaExtraescolares
                  data={extraescolaresTodas || []}
                  user={user}
                  periodos={periodos}
                  cursos={cursos}
                  departamentos={departamentos}
                />
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
