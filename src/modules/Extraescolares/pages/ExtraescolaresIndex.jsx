import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogoInsertarExtraescolar } from "../components/DialogoInsertarExtraescolar"

// Datos de prueba temporales
const datosPrueba = [
  { id: 1, titulo: "Salida al Parque", fecha: "2025-02-14", profesor: "Juan Pérez" },
  { id: 2, titulo: "Visita al Zoo", fecha: "2025-03-02", profesor: "Ana García" },
];

export function ExtraescolaresIndex() {
  const [extraescolares, setExtraescolares] = useState([]);
  const [abrirDialogo, setAbrirDialogo] = useState(false);

  // Cargar datos de prueba
  useEffect(() => {
    setExtraescolares(datosPrueba);
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Actividades Extraescolares</h1>
        <Button onClick={() => setAbrirDialogo(true)}>Nueva actividad</Button>
      </div>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Listado de actividades</CardTitle>
        </CardHeader>
        <CardContent>
          {extraescolares.length === 0 ? (
            <p className="text-gray-500 italic">No hay actividades registradas.</p>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Título</th>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Profesor responsable</th>
                </tr>
              </thead>
              <tbody>
                {extraescolares.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{e.titulo}</td>
                    <td className="p-2">{e.fecha}</td>
                    <td className="p-2">{e.profesor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo */}
      {abrirDialogo && (
        <DialogoInsertarExtraescolar
          open={abrirDialogo}
          onClose={() => setAbrirDialogo(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
