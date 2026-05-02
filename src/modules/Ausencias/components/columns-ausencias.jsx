/**
 * columns-ausencias.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Definición de columnas para la tabla de ausencias.
 * 
 * Configura la visualización, ordenación y filtrado de los datos,
 * incluyendo formato de fechas, periodos horarios y descripciones.
 *
 */

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
  },
  {
    accessorKey: "fecha_inicio",
    header: "Desde",
    // CLAVE: Añadimos el identificador del filtro de rango
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
        : "---",
  },
  {
    id: "horario",
    header: "Periodo",
    cell: ({ row }) => {
      const { periodo_inicio, periodo_fin } = row.original;
      if (!periodo_inicio) {
        return (
          <span className="text-xs italic text-muted-foreground">
            Día completo
          </span>
        );
      }
      const esMismoPeriodo =
        !periodo_fin || periodo_inicio.id === periodo_fin.id;

      return (
        <div className="text-xs flex flex-col leading-tight">
          <span className="font-medium text-foreground">
            {esMismoPeriodo
              ? periodo_inicio.nombre
              : `${periodo_inicio.nombre} - ${periodo_fin.nombre}`}
          </span>
          <span className="text-muted-foreground text-[10px]">
            ({periodo_inicio.inicio} - {periodo_fin?.fin || periodo_inicio.fin})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tipo_ausencia",
    header: "Motivo / Descripción",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo_ausencia");
      const descripcion = row.original.descripcion;

      return (
        <div className="flex flex-col items-start gap-1 max-w-[450px]">
          <Badge
            variant="outline"
            className="capitalize font-normal text-[10px] px-1.5 py-0 h-5"
          >
            {tipo.replace("-", " ")}
          </Badge>
          {descripcion && (
            <span className="text-[11px] text-muted-foreground leading-snug line-clamp-2 italic">
              {descripcion}
            </span>
          )}
        </div>
      );
    },
  },
];
