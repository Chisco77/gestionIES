/*import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    accessorKey: "nombreAlumno",
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
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const value = row.getValue(columnId);
      return value?.toLowerCase().includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: "curso",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Curso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "libro",
    header: "Libro",
  },
  {
    accessorKey: "devuelto",
    header: "Devuelto",
    cell: ({ row }) => (row.original.devuelto ? "Sí" : "No"),
  },
  {
    accessorKey: "fechaentrega",
    header: "Entrega",
    cell: ({ row }) => row.original.fechaentrega?.slice(0, 10) || "—",
  },
  {
    accessorKey: "fechadevolucion",
    header: "Devolución",
    cell: ({ row }) => row.original.fechadevolucion?.slice(0, 10) || "—",
  },
];
*/

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    accessorKey: "nombreAlumno",
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
];
