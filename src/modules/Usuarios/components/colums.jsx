/**
 * columns.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Definición de las columnas de la tabla de usuarios (alumnos/profesores)
 * utilizada en el módulo de gestión de usuarios.
 *
 * Funcionalidades:
 * - Columnas principales:
 *     • Grupo
 *     • Nombre
 *     • Apellidos
 *     • Usuario (uid)
 *     • Acciones (menú desplegable)
 * - Cada columna soporta:
 *     • Ordenación ascendente/descendente
 *     • Filtrado (texto o multi-select según columna)
 * - La columna de acciones incluye un menú desplegable con:
 *     • Copiar ID
 *     • Ver alumno
 *     • Ver detalles
 *
 * Filtros personalizados:
 * - fuzzyTextFilter: filtro de apellidos (basado en `sn`)
 *
 * Dependencias:
 * - Componentes UI: Button, DropdownMenu, DropdownMenuContent,
 *   DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
 * - Iconos: lucide-react (MoreHorizontal, ArrowUpDown)
 *
 */


import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Filtro para apellidos (usa sn)
const fuzzyTextFilter = (row, columnId, filterValue) => {
  const apellidos = row.original.sn ?? "";
  return apellidos.toLowerCase().includes(filterValue.toLowerCase());
};

export const columns = [
  {
    id: "grupo",
    accessorFn: (row) => {
      const grupo = Array.isArray(row.groups) ? row.groups[1] : "";
      return grupo ?? "";
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Grupo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      return filterValue.includes(row.getValue(columnId));
    },
  },

  {
    accessorKey: "givenName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      return row
        .getValue(columnId)
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
  },
  {
    id: "apellidos",
    accessorFn: (row) => row.sn ?? "",
    cell: (info) => info.getValue(),
    filterFn: fuzzyTextFilter,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Apellidos
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "uid",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Usuario
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.trim() === "") return true;
      const value = String(row.getValue(columnId) ?? "").toLowerCase();
      return value.includes(filterValue.toLowerCase());
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver alumno</DropdownMenuItem>
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
