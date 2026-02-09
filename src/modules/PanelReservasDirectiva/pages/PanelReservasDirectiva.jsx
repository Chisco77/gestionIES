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
 * Componente que muestra tabla de permisos y actividades extraescolares
 *     para la directiva.
 * 
 *
 * Funcionalidades:  Permite aceptar o rechazar permisos y actividades extraescolares.

 */

import { TablaPermisosDirectiva } from "../components/TablaPermisosDirectiva";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TablaExtraescolaresDirectiva } from "../components/TablaExtraescolaresDirectiva";
import { TablaReservasPeriodicas } from "../components/TablaReservasPeriodicas";

export function PanelReservasDirectiva({ user, fecha }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleCambio = () => {};

  return (
    <Card className="shadow-lg rounded-2xl h-[480px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-2 overflow-hidden">
        <Tabs
          defaultValue="permisos"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-3 mb-2 gap-2">
            <TabsTrigger value="permisos">Permisos</TabsTrigger>
            <TabsTrigger value="actividades">
              Actividades extraescolares
            </TabsTrigger>
            <TabsTrigger value="periodicas">Reservas periódicas</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Tabla de Asuntos Propios */}
            <TabsContent
              value="permisos"
              className="h-full overflow-y-auto pr-2"
            >
              <TablaPermisosDirectiva fecha={fecha} />
            </TabsContent>

            {/* Tabla de Extraescolares */}
            <TabsContent
              value="actividades"
              className="h-full overflow-y-auto pr-2"
            >
              <TablaExtraescolaresDirectiva user={user} fecha={fecha} />
            </TabsContent>
            <TabsContent
              value="periodicas"
              className="h-full overflow-y-auto pr-2"
            >
              <TablaReservasPeriodicas />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
