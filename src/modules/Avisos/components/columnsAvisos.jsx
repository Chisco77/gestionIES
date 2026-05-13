import { ArrowUpDown, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Asumo que usas el componente Badge de shadcn

export const columns = [
  {
    accessorKey: "modulo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Módulo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "emails",
    header: "Emails",
    cell: ({ row }) =>
      Array.isArray(row.original.emails) ? row.original.emails.join(", ") : "",
  },
  {
    accessorKey: "avisar_profesores",
    header: "Notificar a profesores",
    cell: ({ row }) => {
      const activo = row.original.avisar_profesores;
      return (
        <Badge
          variant={activo ? "outline" : "secondary"}
          className={`flex w-fit items-center gap-1 ${
            activo ? "border-green-600 text-green-600 bg-green-50" : ""
          }`}
        >
          {activo ? (
            <>
              <Bell className="h-3 w-3" />
              Activado
            </>
          ) : (
            <>
              <BellOff className="h-3 w-3" />
              Desactivado
            </>
          )}
        </Badge>
      );
    },
  },
];
