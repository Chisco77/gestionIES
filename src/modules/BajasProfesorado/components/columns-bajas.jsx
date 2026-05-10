import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const columnsBajas = [
  {
    accessorKey: "nombreTitular", // Asumiendo que el backend hace un join para traerte el nombre
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Titular (Baja)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "nombreSustituto",
    header: "Sustituto/a",
    cell: ({ row }) => (
      <div className="font-medium text-blue-700">
        {row.getValue("nombreSustituto")}
      </div>
    ),
  },
  {
    accessorKey: "fecha_inicio",
    header: "Desde",
    filterFn: "dateRange",
    cell: ({ row }) =>
      new Date(row.original.fecha_inicio).toLocaleDateString("es-ES"),
  },
  {
    accessorKey: "fecha_fin",
    header: "Hasta",
    cell: ({ row }) =>
      row.original.fecha_fin
        ? new Date(row.original.fecha_fin).toLocaleDateString("es-ES")
        : <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Activa</Badge>,
  },
  {
    accessorKey: "observaciones",
    header: "Observaciones",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground italic">
        {row.original.observaciones || "---"}
      </span>
    ),
  },
];