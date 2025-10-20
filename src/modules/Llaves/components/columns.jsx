import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const formatoFechaHora = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const renderSortingIcon = (column) => {
  const sort = column.getIsSorted();
  if (sort === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
  if (sort === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
};

export const columns = [
  {
    accessorKey: "profesor",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Profesor
        {renderSortingIcon(column)}
      </Button>
    ),
  },
  {
    accessorKey: "codigollave",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Llave
        {renderSortingIcon(column)}
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
        {renderSortingIcon(column)}
      </Button>
    ),
  },
  {
    accessorKey: "fechaEntrega",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha entrega
        {renderSortingIcon(column)}
      </Button>
    ),
    cell: ({ row }) => formatoFechaHora(row.original.fechaEntrega),
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.fechaEntrega || 0) - new Date(rowB.original.fechaEntrega || 0),
  },
  {
    accessorKey: "fechaDevolucion",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha devolución
        {renderSortingIcon(column)}
      </Button>
    ),
    cell: ({ row }) => formatoFechaHora(row.original.fechaDevolucion),
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.fechaDevolucion || 0) - new Date(rowB.original.fechaDevolucion || 0),
  },
  {
    accessorKey: "devuelta",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ¿Devuelta?
        {renderSortingIcon(column)}
      </Button>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.devuelta}
        disabled
        className="pointer-events-none"
      />
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.devuelta ? 1 : 0;
      const b = rowB.original.devuelta ? 1 : 0;
      return a - b;
    },
  },
];
