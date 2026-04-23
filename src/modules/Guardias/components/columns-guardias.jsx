import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const getColumnsGuardias = (esDirectiva) => {
  const columns = [
    {
      accessorKey: "fecha",
      filterFn: "dateRange",
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
        new Date(row.original.fecha).toLocaleDateString("es-ES"),
    },
    {
      accessorKey: "periodo_nombre",
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
      accessorKey: "nombre_ausente",
      header: "Profesor Ausente",
    },
  ];

  // Si es directiva, añadimos la columna de quién cubrió la guardia
  if (esDirectiva) {
    columns.push({
      accessorKey: "nombre_cubridor",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Realizada por
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    });
  }

  // Columnas finales comunes
  columns.push(
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado");
        const variants = {
          activa: "secondary",
          realizada: "success",
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
        <div className="flex justify-center w-full">
          <span title={row.original.confirmada ? "Confirmada" : "Pendiente"}>
            {row.original.confirmada ? "✅" : "⏳"}
          </span>
        </div>
      ),
    }
  );

  return columns;
};
