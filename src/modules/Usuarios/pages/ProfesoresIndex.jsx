// Con react query, usamos hook useProfesoresLdap.jsx.
import { useState } from "react";
import { columns } from "../components/colums";
import { TablaUsuarios } from "../components/TablaUsuarios";
import { useProfesoresLdap } from "@/hooks/useProfesoresLdap";
import { Loader } from "lucide-react";

export function ProfesoresIndex() {
  const [profesoresFiltrados, setProfesoresFiltrados] = useState([]);
  const { data: profesores, isLoading, error } = useProfesoresLdap();

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          ❌ Error al cargar profesores: {error.message}
        </div>
      ) : (
        <TablaUsuarios
          columns={columns}
          data={profesores}
          onFilteredChange={(rows) => setProfesoresFiltrados(rows)}
        />
      )}
    </div>
  );
}
