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
 
];
