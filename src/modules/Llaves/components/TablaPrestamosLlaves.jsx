/**
 * TablaPrestamosLlaves.jsx - Componente de tabla interactiva para préstamos de llaves
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Tabla reutilizable para mostrar préstamos de llaves.
 * - Filtrado por planta y texto (nombre del profesor o llave)
 * - Selección única de fila
 * - Paginación
 */

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
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

export function TablaPrestamosLlaves({
  columns,
  data,
  onFilteredChange,
  informes,
  acciones,
}) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [textoFiltro, setTextoFiltro] = useState("");
  const [filtroPlanta, setFiltroPlanta] = useState("");
  const [filtroDevuelta, setFiltroDevuelta] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Criterios de ordenacion
  const [sorting, setSorting] = useState([
    { id: "devuelta", desc: false }, // Primero las no devueltas
    { id: "fechaEntrega", desc: false }, // Luego por fecha de entrega más antigua
  ]);

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

  useEffect(() => {
    table.getColumn("profesor")?.setFilterValue(textoFiltro);
  }, [textoFiltro]);

  useEffect(() => {
    table.getColumn("planta")?.setFilterValue(filtroPlanta || undefined);
  }, [filtroPlanta]);

  useEffect(() => {
    const filtered = table.getFilteredRowModel().rows.map((r) => r.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data]);

  useEffect(() => {
    // Devuelta: convertir "true"/"false" a boolean para la columna
    const valor = filtroDevuelta === "" ? undefined : filtroDevuelta === "true";
    table.getColumn("devuelta")?.setFilterValue(valor);
  }, [filtroDevuelta]);

  const selectedRow = table.getSelectedRowModel().rows[0];
  const selectedItem = selectedRow?.original;

  // Plantas únicas derivadas de los datos
  const plantas = Array.from(
    new Set(data.map((p) => p.planta).filter(Boolean))
  ).sort();

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 py-2 text-sm text-muted-foreground items-end">
        <div className="space-y-1">
          <label className="block font-medium text-xs">Planta</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroPlanta}
            onChange={(e) => setFiltroPlanta(e.target.value)}
          >
            <option value="">Todas</option>
            {(plantas || []).map((planta, idx) => (
              <option key={idx} value={planta}>
                {planta}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-xs">Buscar</label>
          <input
            type="text"
            className="border p-2 rounded text-sm"
            placeholder="Profesor o llave"
            value={textoFiltro}
            onChange={(e) => setTextoFiltro(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-xs">Devuelta</label>
          <select
            className="border p-2 rounded text-sm"
            value={filtroDevuelta}
            onChange={(e) => setFiltroDevuelta(e.target.value)}
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
              table.getRowModel().rows.map((row) => {
                // Si la llave NO ha sido devuelta, aplicar fondo rojo claro
                const rowClass = `${
                  !row.original.devuelta
                    ? "bg-red-100 border border-red-300"
                    : ""
                } cursor-pointer hover:bg-gray-100 transition-colors ${
                  row.getIsSelected() ? "bg-blue-100" : ""
                }`;

                return (
                  <TableRow
                    key={row.id}
                    className={rowClass}
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
                );
              })
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

      {/* Acciones + paginación */}
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
