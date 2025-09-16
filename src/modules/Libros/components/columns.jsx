/**
 * columns.jsx - Definición de columnas para la tabla de libros
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
 * Define las columnas de la tabla de libros para su uso con React Table.
 * - Columnas visibles:
 *    - "Libro": nombre del libro, con ordenación y filtro de texto.
 *    - "Curso": curso asociado, con ordenación alfabética.
 * - Columnas ocultas/filtro:
 *    - "idcurso": columna usada únicamente para filtrado interno por curso.
 *
 * Funcionalidad:
 * - Cada columna define un header con botón de ordenación.
 * - La columna "Libro" permite filtrado de texto (case-insensitive).
 * - La columna "idcurso" permite filtrado exacto sin mostrarse en la tabla.
 *
 * Dependencias:
 * - React
 * - @/components/ui/button
 * - lucide-react (ArrowUpDown)
 *
 */


import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    accessorKey: "libro",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Libro
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const value = row.getValue(columnId);
      return value?.toLowerCase().includes(filterValue.toLowerCase());
    },
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
    enableSorting: true,
    sortingFn: "alphanumeric",
  },

  {
    accessorKey: "idcurso", // este campo servirá para el filtro
    header: () => null, // oculto
    cell: () => null,
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row.getValue(columnId) === filterValue;
    },
  },
];
