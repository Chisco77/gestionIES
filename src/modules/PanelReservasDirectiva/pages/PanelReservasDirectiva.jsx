/**
 * PanelReservasDirectiva.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente que muestra tabla de permisos actividades extraescolares y reservas periódicas
 *     para la directiva.
 * 
 *
 * Funcionalidades:  Permite aceptar o rechazar permisos y actividades extraescolares.

 */

/*import { TablaPermisosDirectiva } from "../components/TablaPermisosDirectiva";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { TablaExtraescolaresDirectiva } from "../components/TablaExtraescolaresDirectiva";
import { TablaReservasPeriodicas } from "../components/TablaReservasPeriodicas";

export function PanelReservasDirectiva({ user, fecha, tabActivo, setTabActivo }) {
  // Ya no necesitamos estado interno
  return (
    <Card className="shadow-lg rounded-2xl h-[480px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-2 overflow-hidden">
        <Tabs
          value={tabActivo}
          onValueChange={setTabActivo} // ahora el tab se controla desde fuera
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-3 mb-2 gap-2">
            <TabsTrigger value="permisos">Permisos</TabsTrigger>
            <TabsTrigger value="actividades">Actividades extraescolares</TabsTrigger>
            <TabsTrigger value="periodicas">Reservas periódicas</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="permisos" className="h-full overflow-y-auto pr-2">
              <TablaPermisosDirectiva fecha={fecha} />
            </TabsContent>

            <TabsContent value="actividades" className="h-full overflow-y-auto pr-2">
              <TablaExtraescolaresDirectiva fecha={fecha} />
            </TabsContent>

            <TabsContent value="periodicas" className="h-full overflow-y-auto pr-2">
              <TablaReservasPeriodicas />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}*/

import { TablaPermisosDirectiva } from "../components/TablaPermisosDirectiva";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TablaExtraescolaresDirectiva } from "../components/TablaExtraescolaresDirectiva";
import { TablaReservasPeriodicas } from "../components/TablaReservasPeriodicas";
import { FileCheck2, GraduationCap, Repeat } from "lucide-react";

export function PanelReservasDirectiva({
  user,
  fecha,
  tabActivo,
  setTabActivo,
}) {
  return (
    <div className="w-full flex flex-col h-auto min-h-[350px] max-h-[calc(100vh-480px)] md:max-h-[calc(100vh-520px)] overflow-hidden bg-white border border-slate-200 shadow-3xs rounded-xl p-4">
      <Tabs
        value={tabActivo}
        onValueChange={setTabActivo}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Selector interno de sub-gestión */}
        <div className="flex items-center justify-start pb-3 border-b border-slate-100 mb-4 flex-shrink-0">
          <TabsList className="grid grid-cols-3 w-full max-w-xl bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/40">
            <TabsTrigger
              value="permisos"
              className="flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-2xs text-slate-600 data-[state=active]:text-slate-900"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
              Permisos
            </TabsTrigger>

            <TabsTrigger
              value="actividades"
              className="flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-2xs text-slate-600 data-[state=active]:text-slate-900"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              Actividades Extraescolares
            </TabsTrigger>

            <TabsTrigger
              value="periodicas"
              className="flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-2xs text-slate-600 data-[state=active]:text-slate-900"
            >
              <Repeat className="w-3.5 h-3.5 text-slate-500" />
              Reservas Periódicas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenedor de las tablas - Hereda la flexibilidad del padre */}
        <div className="flex-1 overflow-hidden bg-white min-h-0 flex flex-col">
          <TabsContent
            value="permisos"
            className="flex-1 h-full overflow-y-auto pr-1 mt-0 focus-visible:outline-hidden data-[state=inactive]:hidden animate-in fade-in duration-150 scrollbar-none min-h-0"
          >
            <TablaPermisosDirectiva fecha={fecha} />
          </TabsContent>

          <TabsContent
            value="actividades"
            className="flex-1 h-full overflow-y-auto pr-1 mt-0 focus-visible:outline-hidden data-[state=inactive]:hidden animate-in fade-in duration-150 scrollbar-none min-h-0"
          >
            <TablaExtraescolaresDirectiva fecha={fecha} />
          </TabsContent>

          <TabsContent
            value="periodicas"
            className="flex-1 h-full overflow-y-auto pr-1 mt-0 focus-visible:outline-hidden data-[state=inactive]:hidden animate-in fade-in duration-150 scrollbar-none min-h-0"
          >
            <TablaReservasPeriodicas />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
