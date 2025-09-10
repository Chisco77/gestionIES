/*import { ArrowUpDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    accessorKey: "nombreUsuario",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Alumno
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, value) =>
      row.getValue(columnId)?.toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "curso",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Curso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
 
];*/

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
