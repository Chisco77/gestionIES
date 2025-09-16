/**
 * ProfesoresIndex.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente principal para visualizar y gestionar profesores desde LDAP.
 *
 * Funcionalidades:
 * - Obtiene profesores mediante el hook `useProfesoresLdap` (React Query)
 * - Muestra los profesores en `TablaUsuarios` con:
 *     • Filtrado por grupo, apellidos y usuario
 *     • Ordenación y paginación
 *     • Ofuscación de datos sensibles
 *
 * Estados principales:
 * - profesoresFiltrados: profesores visibles tras filtrado en la tabla
 *
 * Dependencias:
 * - TablaUsuarios: tabla con filtros, ordenación y paginación
 * - Componentes UI: Button (interno en TablaUsuarios)
 * - Iconos: lucide-react
 * - Hook: useProfesoresLdap
 *
 */


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
