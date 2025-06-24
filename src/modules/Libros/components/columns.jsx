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
