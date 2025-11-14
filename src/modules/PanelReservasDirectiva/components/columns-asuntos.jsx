// src/components/asuntos/columns-asuntos.jsx
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export const columnsAsuntos = (onAceptar, onRechazar) => [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = new Date(row.original.fecha);
      return fecha.toLocaleDateString();
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "uid",
    header: "UID",
  },
  {
    accessorKey: "nombreProfesor",
    header: "Profesor",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      switch (row.original.estado) {
        case 0:
          return "Pendiente";
        case 1:
          return "Aceptado";
        case 2:
          return "Rechazado";
        default:
          return "—";
      }
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          className="p-1"
          onClick={() => onAceptar(row.original)}
        >
          <Check className="w-4 h-4 text-green-600" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="p-1"
          onClick={() => onRechazar(row.original)}
        >
          <X className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    ),
    enableSorting: false,
  },
];
