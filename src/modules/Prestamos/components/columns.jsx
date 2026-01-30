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
/**
 * columns.jsx - Columnas ajustadas para TablaPrestamos
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
    id: "expand",
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableColumnFilter: false,
    size: 160,
    minSize: 160,
    maxSize: 160,
  },

  {
    accessorKey: "nombreUsuario",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-start w-full text-left truncate"
      >
        Alumno
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="truncate text-left w-full">
        {row.getValue("nombreUsuario")}
      </div>
    ),
    filterFn: (row, columnId, value) =>
      row.getValue(columnId)?.toLowerCase().includes(value.toLowerCase()),
    size: 250, // ancho deseado
    minSize: 250, // ancho mínimo
    maxSize: 250, // ancho máximo (pequeño margen)
  },
  {
    accessorKey: "doc_compromiso",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Doc compromiso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center w-full">
        {mapDocCompromiso(row.getValue("doc_compromiso"))}
      </div>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const a = mapDocCompromiso(rowA.getValue(columnId));
      const b = mapDocCompromiso(rowB.getValue(columnId));
      return a.localeCompare(b);
    },
    filterFn: (row, columnId, value) => {
      if (!value) return true; // Todos
      return String(row.getValue(columnId)) === String(value);
    },
    size: 70,
    minSize: 70,
    maxSize: 70,
  },

  {
    accessorKey: "curso",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Curso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center w-full">{row.getValue("curso")}</div>
    ),
    size: 70,
    minSize: 70,
    maxSize: 70,
  },
];
