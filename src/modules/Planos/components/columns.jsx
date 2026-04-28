import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns = [
  {
    accessorKey: "id",
    header: "ID Técnico",
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre Visible
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "orden",
    header: "Orden",
  },
  {
    accessorKey: "svgUrl", // <--- Cambiar de svg_url a svgUrl
    header: "Archivo SVG",
    cell: ({ row }) => {
      const valor = row.original.svgUrl; // <--- Usar el nuevo nombre

      if (!valor)
        return <span className="text-slate-400 italic">Sin archivo</span>;

      // Si usabas .split('/') para mostrar solo el nombre del archivo:
      const partes = valor.split("/");
      const nombreArchivo = partes[partes.length - 1];

      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded">
            {nombreArchivo}
          </span>
        </div>
      );
    },
  },
];
