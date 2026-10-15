import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columnsImpresiones = [
  {
    accessorKey: "fecha",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha y Hora
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const fechaStr = row.getValue("fecha");
      if (!fechaStr) return "-";
      return new Date(fechaStr).toLocaleString("es-ES", {
        dateStyle: "short",
        timeStyle: "medium",
      });
    },
  },
  {
    id: "docente",
    accessorKey: "docente",
    accessorFn: (row) => `${row.apellidos || ""}, ${row.nombre || row.uid}`,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Profesor/a
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { nombre, apellidos, uid } = row.original;
      if (apellidos || nombre) {
        return (
          <span className="font-medium">{`${apellidos || ""}, ${nombre || ""}`}</span>
        );
      }
      return <span className="text-muted-foreground">{uid}</span>;
    },
  },
  {
    accessorKey: "titulo_documento",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Documento
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span
        className="truncate max-w-[220px] block"
        title={row.getValue("titulo_documento")}
      >
        {row.getValue("titulo_documento") || "Sin título"}
      </span>
    ),
  },
  {
    accessorKey: "impresora",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Impresora
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-slate-600 font-mono">
        {row.getValue("impresora")}
      </span>
    ),
  },
  {
    accessorKey: "paginas_copia",
    header: "Pags/C",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("paginas_copia")}</div>
    ),
  },
  {
    accessorKey: "copias",
    header: "Copias",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("copias")}</div>
    ),
  },
  {
    accessorKey: "total_paginas",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Pags.
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center font-bold">
        {row.getValue("total_paginas")}
      </div>
    ),
  },
  {
    accessorKey: "color",
    header: "Color",
    filterFn: (row, columnId, filterValue) => {
      if (
        filterValue === "all" ||
        filterValue === undefined ||
        filterValue === ""
      )
        return true;
      const esColor = row.getValue(columnId);
      return filterValue === "color" ? esColor === true : esColor === false;
    },
    cell: ({ row }) => {
      const esColor = row.getValue("color");
      return (
        <span
          className={`px-2 py-1 text-xs rounded-md font-medium ${
            esColor
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {esColor ? "Color" : "B/N"}
        </span>
      );
    },
  },
];
