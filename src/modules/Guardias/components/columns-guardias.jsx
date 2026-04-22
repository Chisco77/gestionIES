import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const columnsGuardias = [
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.fecha).toLocaleDateString("es-ES"),
  },
  {
    accessorKey: "periodo_nombre", // Asumiendo que el backend hace el join con periodos_horarios
    header: "Hora / Periodo",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.periodo_nombre}</span>
        <span className="text-[10px] text-muted-foreground">
          {row.original.periodo_inicio} - {row.original.periodo_fin}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "nombre_ausente", // El backend debería devolver el nombre real, no solo el UID
    header: "Profesor Ausente",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado");
      const variants = {
        activa: "default",
        realizada: "success", // Necesitarías definir este color en tus badges
        anulada: "destructive",
      };
      return (
        <Badge variant={variants[estado] || "outline"} className="capitalize">
          {estado}
        </Badge>
      );
    },
  },
  {
    accessorKey: "confirmada",
    header: "Conf.",
    cell: ({ row }) => (
      <span title={row.original.confirmada ? "Confirmada" : "Pendiente"}>
        {row.original.confirmada ? "✅" : "⏳"}
      </span>
    ),
  },
];