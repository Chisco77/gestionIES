// src/components/reservas/TablaReservasPeriodicas.jsx
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Eraser,
} from "lucide-react";

import { useState } from "react";
import { columnsReservasPeriodicas } from "./columns-reservas-periodicas";
import { useReservasPeriodicasTodas } from "@/hooks/Reservas/userReservasPeriodicasTodas";

export function TablaReservasPeriodicas() {
  const [sorting, setSorting] = useState([{ id: "fecha_desde", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);

  const { data: reservas = [], isLoading } = useReservasPeriodicasTodas();

  const table = useReactTable({
    data: reservas,
    columns: columnsReservasPeriodicas(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 6 },
    },
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const limpiarFiltros = () => {
    table.getAllColumns().forEach((col) => {
      if (col.getCanFilter()) col.setFilterValue("");
    });
    table.resetSorting();
    table.resetPagination();
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        Cargando reservas periódicas…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* FILTROS */}
      <div className="p-2 border rounded-md bg-muted/40">
        <div className="flex flex-wrap gap-4 items-end text-sm">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Solicitante
            </label>
            <Input
              className="h-8 w-[180px]"
              placeholder="Buscar solicitante…"
              value={table.getColumn("nombreCreador")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("nombreCreador")?.setFilterValue(e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Profesor destino
            </label>
            <Input
              className="h-8 w-[180px]"
              placeholder="Buscar profesor…"
              value={table.getColumn("nombreProfesor")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table
                  .getColumn("nombreProfesor")
                  ?.setFilterValue(e.target.value)
              }
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 ml-auto flex items-center gap-2"
            onClick={limpiarFiltros}
          >
            <Eraser className="w-4 h-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-md border max-h-[288px] overflow-y-auto">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none"
                  >
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center gap-1"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: "↑",
                        desc: "↓",
                      }[header.column.getIsSorted()] ?? ""}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="h-6">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-0.5">
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
                  colSpan={table.getAllColumns().length}
                  className="text-center h-24"
                >
                  No hay reservas periódicas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center py-1 text-xs">
        <div className="flex-1" />
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="px-2 text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex-1 text-right text-muted-foreground">
          Total: {table.getFilteredRowModel().rows.length}
        </div>
      </div>
    </div>
  );
}
