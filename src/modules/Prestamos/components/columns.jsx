/**
 * columns.jsx - Definición de columnas para tabla de préstamos
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Configuración de las columnas para la tabla de préstamos de alumnos.
 * Incluye columnas para:
 *  - Expansión de filas (para detalles del préstamo)
 *  - Nombre del alumno (con filtro y ordenación)
 *  - Documento de compromiso (mapeado a "Entregado"/"Recibido")
 *  - Curso del alumno (con filtro y ordenación)
 *
 * Uso:
 * import { columns } from './columns';
 * 
 * Dependencias:
 * - React
 * - lucide-react (Iconos)
 * - @/components/ui/button (Botón de cabecera)
 */


import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const mapDocCompromiso = (value) => {
  if (value === 1) return "Entregado";
  if (value === 2) return "Recibido";
  return "";
};

export const columns = [
  {
    id: "expand", // columna vacía para expandir/colapsar
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableColumnFilter: false,
    size: 40,
  },
  {
    accessorKey: "nombreUsuario",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Alumno
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, value) =>
      row.getValue(columnId)?.toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "doc_compromiso",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Doc compromiso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => mapDocCompromiso(row.getValue("doc_compromiso")),
    sortingFn: (rowA, rowB, columnId) => {
      const a = mapDocCompromiso(rowA.getValue(columnId));
      const b = mapDocCompromiso(rowB.getValue(columnId));
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "curso",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Curso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];
