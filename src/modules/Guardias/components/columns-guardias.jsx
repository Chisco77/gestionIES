import { ArrowUpDown, User, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export const getColumnsGuardias = (esDirectiva) => {
  const columns = [
    {
      accessorKey: "fecha",
      filterFn: "dateRange",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const fecha = new Date(row.original.fecha);
        return (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {fecha.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "periodo_nombre",
      header: "Hora / Periodo",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">
            {row.original.periodo_nombre}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            {row.original.periodo_inicio} — {row.original.periodo_fin}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "nombre_ausente",
      header: "Profesor Ausente",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-[10px] font-bold">
            {row.original.nombre_ausente?.charAt(0) || "?"}
          </div>
          <span className="text-sm">{row.original.nombre_ausente}</span>
        </div>
      ),
    },
  ];

  // Si es directiva, mostramos quién cubrió la guardia
  if (esDirectiva) {
    columns.push({
      accessorKey: "nombre_cubridor",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Realizada por
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-blue-900">
            {row.original.nombre_cubridor}
          </span>
        </div>
      ),
    });
  }



  return columns;
};
