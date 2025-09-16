/**
 * TablaUsuarios.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente de tabla para visualizar usuarios (alumnos o profesores)
 * con filtrado, ordenación y paginación.
 *
 * Funcionalidades:
 * - Filtros por:
 *     • Grupo (MultiSelect)
 *     • Apellidos (Input de texto)
 *     • Usuario (Input de texto)
 * - Ordenación por columnas usando `@tanstack/react-table`
 * - Paginación con navegación a primera, anterior, siguiente y última página
 * - Actualización automática de los usuarios filtrados mediante `onFilteredChange`
 * - Soporte para acciones externas pasadas como prop `acciones`
 *
 * Estados principales:
 * - sorting: columnas ordenadas
 * - columnFilters: filtros aplicados a las columnas
 *
 * Dependencias:
 * - @tanstack/react-table para la lógica de la tabla
 * - Componentes UI: Table, Card, Input, Button, MultiSelect
 * - Iconos: lucide-react
 * - Utilidades: ofuscarTexto
 *
 */


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { ofuscarTexto } from "@/utils/ofuscar";


export function TablaUsuarios({ columns, data, onFilteredChange, acciones }) {
  const [sorting, setSorting] = useState([{ id: "grupo", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  useEffect(() => {
    const filtered = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    onFilteredChange?.(filtered);
  }, [columnFilters]);

  const getUniqueValues = (columnId) =>
    Array.from(
      new Set(
        table.getPreFilteredRowModel().rows.map((row) => row.getValue(columnId))
      )
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const renderCell = (cell) => {
    const colId = cell.column.id;
    const value = cell.getValue();

    if (colId === "apellidos") return ofuscarTexto(value, { tipo: "nombre" });
    if (colId === "uid") return ofuscarTexto(value, { tipo: "usuario" });
    if (colId === "givenName") return ofuscarTexto(value, { tipo: "nombre" });
    //if (colId === "grupo") return ofuscarTexto(value, { tipo: "curso" });

    return flexRender(cell.column.columnDef.cell, cell.getContext());
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="p-4 shadow-none">
        <div className="flex flex-wrap items-end gap-4 text-sm">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Grupo
            </label>
            <MultiSelect
              values={table.getColumn("grupo")?.getFilterValue() ?? []}
              onChange={(value) =>
                table.getColumn("grupo")?.setFilterValue(value)
              }
              options={getUniqueValues("grupo").map((g) => ({
                value: g,
                label: g,
              }))}
              placeholder="Seleccionar grupos"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Apellidos
            </label>
            <Input
              placeholder="Buscar apellidos..."
              value={table.getColumn("apellidos")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("apellidos")?.setFilterValue(e.target.value)
              }
              className="w-[180px] h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Usuario
            </label>
            <Input
              placeholder="Buscar usuario..."
              value={table.getColumn("uid")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("uid")?.setFilterValue(e.target.value)
              }
              className="w-[180px] h-8 text-sm"
            />
          </div>

          {acciones && <div className="ml-auto">{acciones}</div>}
        </div>
      </Card>

      {/* Tabla */}
      <div className="rounded-md border overflow-auto">
        <Table className="text-sm">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {/* {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )} */}
                      {renderCell(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col items-center justify-center py-4 space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="px-2 text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Total de registros: {table.getFilteredRowModel().rows.length}
        </div>
      </div>
    </div>
  );
}
