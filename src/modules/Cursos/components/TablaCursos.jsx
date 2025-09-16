/**
 * TablaCursos.jsx - Tabla interactiva de cursos
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Componente que renderiza una tabla de cursos utilizando @tanstack/react-table.
 * - Permite ordenar, filtrar y paginar los datos.
 * - Selección de fila única con resaltado azul.
 * - Filtros dinámicos mediante MultiSelect para la columna "curso".
 * - Integración de acciones externas (Editar, Eliminar, etc.) sobre la fila seleccionada.
 *
 * Props:
 * - columns: array de definiciones de columnas (columnDef) para react-table.
 * - data: array de objetos con los cursos a mostrar.
 * - onFilteredChange: callback que devuelve los datos filtrados tras cambios en filtros.
 * - acciones: función que recibe el item seleccionado y renderiza botones de acción.
 *
 * Estado interno:
 * - sorting: estado del orden de columnas.
 * - columnFilters: estado de filtros aplicados.
 * - selectedId: id de la fila seleccionada actualmente.
 *
 * Funcionalidad:
 * - Renderiza la tabla con react-table y ShadCN Table.
 * - Permite ordenar al hacer click en los encabezados de columnas.
 * - Permite filtrar cursos mediante MultiSelect.
 * - Resalta la fila seleccionada con color azul.
 * - Permite paginación completa con botones de primero, anterior, siguiente y último.
 * - Llama a `onFilteredChange` solo cuando los datos filtrados cambian.
 *
 * Dependencias:
 * - @tanstack/react-table
 * - @/components/ui/table
 * - @/components/ui/button
 * - @/components/ui/multiselect
 * - lucide-react
 * - react
 *
 * Notas:
 * - Solo se permite seleccionar una fila a la vez.
 * - `acciones(selectedItem)` se renderiza dinámicamente según la fila seleccionada.
 * - La paginación se calcula con `table.getPageCount()` y `table.getState().pagination`.
 */

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export function TablaCursos({ columns, data, onFilteredChange, acciones }) {
  const [sorting, setSorting] = useState([{ id: "curso", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true, // permite seleccionar filas
    state: {
      sorting,
      columnFilters,
    },
    // permite solo una fila seleccionada a la vez
    enableMultiRowSelection: false,
  });

  const selectedRow = table.getSelectedRowModel().rows[0];
  const selectedItem = selectedRow?.original;

  // Solo llamar a onFilteredChange cuando cambien los datos filtrados realmente
  useEffect(() => {
    const filtered = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data]);

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

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 py-2 text-sm text-muted-foreground">
        <div className="space-y-1">
          <label className="block font-medium text-xs">Grupo</label>
          <MultiSelect
            values={table.getColumn("curso")?.getFilterValue() ?? []}
            onChange={(value) =>
              table.getColumn("curso")?.setFilterValue(value)
            }
            options={getUniqueValues("curso").map((g) => ({
              value: g,
              label: g,
            }))}
            placeholder="Seleccionar cursos"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
                  className={`cursor-pointer ${
                    row.getIsSelected() ? "bg-blue-100" : ""
                  } hover:bg-gray-100 transition-colors`}
                  onClick={() => {
                    row.toggleSelected(); 
                    setSelectedId(row.original.id); 
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
      <div className="flex flex-col sm:flex-row sm:justify-between items-center py-6 space-y-4 sm:space-y-0">
        {" "}
        {/* Acciones (lado izquierdo) */}
        <div className="flex gap-2">{acciones(selectedItem)}</div>
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

          <span className="text-xs text-muted-foreground px-2">
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
