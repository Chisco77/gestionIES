// columnsPeriodos.jsx - Definición de columnas para la tabla de periodos horarios
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columnsPeriodos = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row
        .getValue(columnId)
        ?.toLowerCase()
        .includes(filterValue.toLowerCase());
    },
  },

  {
    accessorKey: "inicio",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Hora Inicio
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue("inicio");
      return val ? val.substring(0, 5) : "";
    },
  },

  {
    accessorKey: "fin",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Hora Fin
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue("fin");
      return val ? val.substring(0, 5) : "";
    },
  },
];
