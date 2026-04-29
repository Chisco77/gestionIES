/**
 * TablaMaterias.jsx - Tabla interactiva de materias
 * ------------------------------------------------------------
 * Con filtro de búsqueda por texto.
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
import { Input } from "@/components/ui/input"; 
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search, // Opcional: Icono de búsqueda
} from "lucide-react";
import { useEffect, useState } from "react";

export function TablaMaterias({ columns, data, onFilteredChange, acciones }) {
  const [sorting, setSorting] = useState([{ id: "nombre", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    state: { sorting, columnFilters },
  });

  const selectedRow = table.getSelectedRowModel().rows[0];
  const selectedItem = selectedRow?.original;

  useEffect(() => {
    const filtered = table.getFilteredRowModel().rows.map((r) => r.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data]);

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div>
      {/* FILTRO POR TEXTO  */}
      <div className="flex flex-wrap items-end gap-3 py-4 text-sm text-muted-foreground">
        <div className="relative w-full max-w-sm">
          <label className="block font-medium text-xs mb-1">
            Filtrar por nombre
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Escribe todo o parte del nombre de la materia..."
              value={table.getColumn("nombre")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table.getColumn("nombre")?.setFilterValue(event.target.value)
              }
              className="pl-9 w-full"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer ${
                    row.getIsSelected() ? "bg-blue-100 dark:bg-blue-900/30" : ""
                  } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
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

      {/* Paginación y acciones */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center py-6 space-y-4 sm:space-y-0">
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
