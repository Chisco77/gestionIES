import { useState, useEffect } from "react";
import { TablaAsuntosDirectiva } from "../components/TablaAsuntosDirectiva";
import { columnsAsuntos } from "../components/columns-asuntos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function PanelReservasDirectiva({ reloadKey, onPanelCambiado }) {
  const [data, setData] = useState([]);
  const [asuntosFiltrados, setAsuntosFiltrados] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAsuntos = async () => {
    try {
      const resAsuntos = await fetch(
        `${API_URL}/db/asuntos-propios-enriquecidos`,
        { credentials: "include" }
      );
      if (!resAsuntos.ok)
        throw new Error("Error al obtener los asuntos propios");
      const data = await resAsuntos.json();
      if (data.ok) {
        setData(data.asuntos);
        setAsuntosFiltrados(data.asuntos);
      }
    } catch (error) {
      console.error("❌ Error al cargar los asuntos propios:", error);
      setData([]);
      setAsuntosFiltrados([]);
    }
  };

  useEffect(() => {
    fetchAsuntos();
  }, [reloadKey]);

  const handleCambio = () => {
    fetchAsuntos();
    onPanelCambiado?.(); // notifica al Dashboard
  };

  return (
    <Card className="shadow-lg rounded-2xl h-[500px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
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
            <TabsContent
              value="asuntos"
              className="h-full overflow-y-auto pr-2"
            >
              <TablaAsuntosDirectiva
                data={asuntosFiltrados}
                columns={columnsAsuntos({ onCambio: handleCambio })}
                onCambio={handleCambio}
              />
            </TabsContent>

            <TabsContent
              value="actividades"
              className="h-full flex items-center justify-center text-gray-500"
            >
              Pendiente de implementar
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
