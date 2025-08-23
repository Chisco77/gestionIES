import { ArrowUpDown, Check, X } from "lucide-react";
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

  /* {
    accessorKey: "docPrestamoDevuelto",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Devuelto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("devuelto");
      return value ? (
        <Check className="text-green-500 w-5 h-5" />
      ) : (
        <X className="text-red-500 w-5 h-5" />
      );
    },
    filterFn: (row, columnId, value) => {
      return row.getValue(columnId) === value;
    },
  },*/
];
