import { useState, useEffect } from "react";
import { TablaAsuntosDirectiva } from "../components/TablaAsuntosDirectiva";
import { columnsAsuntos } from "../components/columns-asuntos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TablaExtraescolares } from "@/modules/Extraescolares/components/TablaExtraescolares";

export function PanelReservasDirectiva({ user, fecha }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleCambio = () => {};

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
              <TablaAsuntosDirectiva fecha={fecha} />
            </TabsContent>

            {/* Tabla de Extraescolares */}
            <TabsContent
              value="actividades"
              className="h-full overflow-y-auto pr-2"
            >
              <TablaExtraescolares user={user} fecha={fecha} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
