/**
 * columns.jsx - Definición de columnas para la tabla de estancias
 *
 * ------------------------------------------------------------
 * Inspirado en el módulo de libros
 * ------------------------------------------------------------
 */

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    accessorKey: "codigo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Código
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) =>
      !filterValue ||
      row
        .getValue(columnId)
        ?.toLowerCase()
        .includes(filterValue.toLowerCase()),
  },
  {
    accessorKey: "descripcion",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Descripción
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) =>
      !filterValue ||
      row
        .getValue(columnId)
        ?.toLowerCase()
        .includes(filterValue.toLowerCase()),
  },
  {
    accessorKey: "planta",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Planta
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "totalllaves",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Nº llaves
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "armario",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Armario
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) =>
      !filterValue ||
      row
        .getValue(columnId)
        ?.toLowerCase()
        .includes(filterValue.toLowerCase()),
  },
  {
    accessorKey: "codigollave",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Código llave
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) =>
      !filterValue ||
      row
        .getValue(columnId)
        ?.toLowerCase()
        .includes(filterValue.toLowerCase()),
  },
];
