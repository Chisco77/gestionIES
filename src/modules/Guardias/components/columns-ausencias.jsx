import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const columnsAusencias = [
  {
    accessorKey: "nombreProfesor",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Profesor/a
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.trim() === "") return true;
      return String(row.getValue(columnId) ?? "")
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: "fecha_inicio",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      new Date(row.original.fecha_inicio).toLocaleDateString("es-ES"),
  },
  {
    id: "horario",
    header: "Periodo",
    cell: ({ row }) => {
      const { periodo_inicio, periodo_fin } = row.original;
      if (!periodo_inicio)
        return <span className="text-xs italic">Día completo</span>;
      return (
        <div className="text-xs">
          <span className="font-medium">{periodo_inicio.nombre}</span>
          <span className="text-muted-foreground ml-1">
            ({periodo_inicio.inicio} - {periodo_fin?.fin || periodo_inicio.fin})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tipo_ausencia",
    header: "Motivo",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize font-normal">
        {row.getValue("tipo_ausencia").replace("-", " ")}
      </Badge>
    ),
  },
];
