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
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eraser } from "lucide-react";

// Lógica de filtrado por rango de fechas (basado en la columna 'fecha')
const dateRangeFilter = (row, columnId, value) => {
  const [start, end] = value;
  if (!start && !end) return true;

  const fechaFila = row.original.fecha ? row.original.fecha.split("T")[0] : "";
  if (!fechaFila) return false;

  if (start && !end) return fechaFila >= start;
  if (!start && end) return fechaFila <= end;
  return fechaFila >= start && fechaFila <= end;
};

export function TablaImpresiones({
  columns,
  data,
  onFilteredChange,
  informes,
  acciones,
}) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [sorting, setSorting] = useState([{ id: "fecha", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const table = useReactTable({
    data,
    columns,
    filterFns: { dateRange: dateRangeFilter },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: false,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageIndex: 0, pageSize: 15 } },
  });

  // Sincronizar los inputs de fecha con el filtro de la tabla en la columna 'fecha'
  useEffect(() => {
    if (fechaInicio || fechaFin) {
      table.getColumn("fecha")?.setFilterValue([fechaInicio, fechaFin]);
    } else {
      table.getColumn("fecha")?.setFilterValue(undefined);
    }
  }, [fechaInicio, fechaFin, table]);

  useEffect(() => {
    const filtered = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data, table, onFilteredChange]);

  const selectedRow = table.getSelectedRowModel().rows[0];
  const selectedItem = selectedRow?.original;

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const limpiarTodosLosFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    table.resetColumnFilters();
    table.resetGlobalFilter();
    table.resetSorting();
    table.resetPagination();
  };

  return (
    <div className="space-y-4">
      {/* Filtros avanzados */}
      <Card className="p-4 shadow-none">
        <div className="flex flex-wrap items-end gap-4 text-sm">
          {/* Rango de Fechas */}
          <div className="flex items-end gap-2 p-2 bg-white rounded-md border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-500">
                Desde
              </label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-[140px] h-8 border-none focus-visible:ring-0 p-0 text-sm"
              />
            </div>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-500">
                Hasta
              </label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-[140px] h-8 border-none focus-visible:ring-0 p-0 text-sm"
              />
            </div>
          </div>

          {/* Filtro Profesor */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Profesor/a
            </label>
            <Input
              placeholder="Buscar profesor..."
              value={table.getColumn("docente")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("docente")?.setFilterValue(e.target.value)
              }
              className="w-[180px] h-8 text-sm"
            />
          </div>

          {/* Filtro Color / B&N */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Tipo de impresión
            </label>
            <select
              value={table.getColumn("color")?.getFilterValue() ?? "all"}
              onChange={(e) =>
                table.getColumn("color")?.setFilterValue(e.target.value)
              }
              className="w-[140px] h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Todas</option>
              <option value="color">Color</option>
              <option value="bn">Blanco y Negro</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs flex items-center gap-2"
            onClick={limpiarTodosLosFiltros}
          >
            <Eraser className="w-4 h-4" />
            Limpiar filtros
          </Button>

          {informes && <div className="ml-auto">{informes}</div>}
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
                  className={`cursor-pointer ${
                    row.getIsSelected() ? "bg-blue-100" : ""
                  } hover:bg-gray-100 transition-colors`}
                  onClick={() => {
                    row.toggleSelected();
                    setSelectedId(row.original.id);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-2 px-3" key={cell.id}>
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
                  No hay registros de impresión.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ACCIONES + PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center py-1 space-y-4 sm:space-y-0 text-xs">
        <div className="flex gap-2">
          {acciones ? acciones(selectedItem) : null}
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center justify-center space-x-1 flex-1">
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
            Página {currentPage} de {totalPages || 1}
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

        <div className="flex-1 text-right text-xs text-muted-foreground">
          Total de registros: {table.getFilteredRowModel().rows.length}
        </div>
      </div>
    </div>
  );
}
