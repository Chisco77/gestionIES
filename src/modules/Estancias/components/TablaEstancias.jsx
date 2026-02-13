/**
 * TablaEstancias.jsx - Componente de tabla interactiva para la gestión de estancias
 *
 * ------------------------------------------------------------
 * Inspirado en el módulo de libros
 * ------------------------------------------------------------
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

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { useEffect, useState } from "react";

export function TablaEstancias({
  columns,
  data,
  onFilteredChange,
  informes,
  acciones,
}) {
  const [sorting, setSorting] = useState([{ id: "codigo", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);

    // Filtros individuales
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroDescripcion, setFiltroDescripcion] = useState("");
  const [filtroPlanta, setFiltroPlanta] = useState("");
  const [filtroReservable, setFiltroReservable] = useState(""); // "true" | "false" | ""
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
    enableRowSelection: true,
    enableMultiRowSelection: false,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Filtros manuales
  /* useEffect(() => {
    table.getColumn("codigo")?.setFilterValue(textoFiltro);
    table.getColumn("descripcion")?.setFilterValue(textoFiltro);
  }, [textoFiltro]);*/

  // Filtros manuales
  useEffect(() => {
    table.getColumn("codigo")?.setFilterValue(filtroCodigo || undefined);
  }, [filtroCodigo]);

  useEffect(() => {
    table
      .getColumn("descripcion")
      ?.setFilterValue(filtroDescripcion || undefined);
  }, [filtroDescripcion]);

  useEffect(() => {
    if (filtroReservable === "") {
      table.getColumn("reservable")?.setFilterValue(undefined);
    } else {
      table
        .getColumn("reservable")
        ?.setFilterValue(filtroReservable === "true");
    }
  }, [filtroReservable]);

  useEffect(() => {
    table.getColumn("planta")?.setFilterValue(filtroPlanta || undefined);
  }, [filtroPlanta]);

  // Callback al padre
  useEffect(() => {
    const filtered = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data]);

  const selectedRow = table.getSelectedRowModel().rows[0];
  const selectedItem = selectedRow?.original;

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 py-2 text-sm text-muted-foreground items-end">
        {/* Filtro Planta */}
        <div className="space-y-1">
          <label className="block font-medium text-xs">Planta</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroPlanta}
            onChange={(e) => setFiltroPlanta(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="baja">Baja</option>
            <option value="primera">Primera</option>
            <option value="segunda">Segunda</option>
          </select>
        </div>

        {/* Filtro Código */}
        <div className="space-y-1">
          <label className="block font-medium text-xs">Código</label>
          <input
            type="text"
            className="border p-2 rounded text-sm"
            placeholder="Buscar código..."
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          />
        </div>

        {/* Filtro Descripción */}
        <div className="space-y-1">
          <label className="block font-medium text-xs">Descripción</label>
          <input
            type="text"
            className="border p-2 rounded text-sm"
            placeholder="Buscar descripción..."
            value={filtroDescripcion}
            onChange={(e) => setFiltroDescripcion(e.target.value)}
          />
        </div>

        {/* Filtro Reservable */}
        <div className="space-y-1">
          <label className="block font-medium text-xs">Reservable</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroReservable}
            onChange={(e) => setFiltroReservable(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        {informes && <div className="ml-auto">{informes}</div>}
      </div>

      {/* Tabla */}
      <div className="rounded-md border mt-4">
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

      {/* Acciones + Paginación */}
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
