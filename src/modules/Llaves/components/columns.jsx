import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const columns = [
  {
    accessorKey: "profesor",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Profesor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "llave",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Llave
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "planta",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Planta
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "fechaEntrega",
    header: "Fecha entrega",
    cell: ({ row }) =>
      new Date(row.original.fechaEntrega).toLocaleDateString(),
  },
  {
    accessorKey: "fechaDevolucion",
    header: "Fecha devolución",
    cell: ({ row }) =>
      row.original.fechaDevolucion
        ? new Date(row.original.fechaDevolucion).toLocaleDateString()
        : "—",
  },
  {
    accessorKey: "devuelta",
    header: "¿Devuelta?",
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.devuelta}
        disabled
        className="pointer-events-none"
      />
    ),
  },
];
