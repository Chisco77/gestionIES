import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columnsImpresiones } from "../components/columnsImpresiones";
import { TablaImpresiones } from "../components/TablaImpresiones";
import { Loader, Printer } from "lucide-react";

async function fetchRegistroImpresiones() {
  const res = await fetch("/api/db/impresiones");
  if (!res.ok) throw new Error("Error al cargar el registro de impresiones");
  return res.json();
}

export function RegistroImpresionesIndex() {
  const [impresionesFiltradas, setImpresionesFiltradas] = useState([]);

  const {
    data: impresiones = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["registro-impresiones"],
    queryFn: fetchRegistroImpresiones,
  });

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <div className="flex items-center gap-3">
        <Printer className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">
          Registro de Impresiones
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          ❌ Error al cargar impresiones: {error.message}
        </div>
      ) : (
        <TablaImpresiones
          columns={columnsImpresiones}
          data={impresiones}
          onFilteredChange={(rows) => setImpresionesFiltradas(rows)}
        />
      )}
    </div>
  );
}
