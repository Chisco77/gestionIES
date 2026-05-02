/**
 * ============================================
 *  TABLA DE GESTIÓN DE GUARDIAS
 * ============================================
 *
 * Este componente renderiza una tabla avanzada basada en @tanstack/react-table
 * para la visualización, filtrado y selección de registros de guardias.
 *
 *  RESPONSABILIDADES PRINCIPALES
 * --------------------------------------------
 * - Mostrar listado de guardias (filtrado previamente en el padre)
 * - Permitir selección de una fila (single select)
 * - Gestión de paginación, ordenación y filtros avanzados
 * - Filtrado por rango de fechas (custom filter)
 * - Filtrado por profesor ausente y profesor cubridor
 * - Resaltar registros del día actual
 * - Integración con acciones externas (botones del módulo padre)
 * - Inyección de controles de informes (dropdowns o botones externos)
 *
 *  FILTRADO DE FECHAS
 * --------------------------------------------
 * Se utiliza un filtro personalizado (dateRangeFilter) basado en date-fns:
 * - Permite rango abierto (solo inicio o solo fin)
 * - Normaliza fechas con startOfDay para evitar problemas de horas
 * - Se aplica sobre la columna "fecha"
 *
 *  NOTAS DE DISEÑO
 * --------------------------------------------
 * - Optimizada para densidad de información media-alta
 * - UI basada en shadcn/ui + Tailwind
 * - Pensada para trabajo diario de gestión de guardias
 * - El filtrado pesado se delega al backend en módulos superiores
 *
 * ============================================
 */

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { isWithinInterval, parseISO, startOfDay } from "date-fns"; // Necesitaremos estas
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
  Eraser,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

// Función personalizada para filtrar por rango de fechas
const dateRangeFilter = (row, columnId, value) => {
  const date = startOfDay(parseISO(row.getValue(columnId)));
  const [start, end] = value;
  if (start && !end) return date >= start;
  if (!start && end) return date <= end;
  if (start && end) return date >= start && date <= end;
  return true;
};

export function TablaGuardias({
  columns,
  data,
  informes,
  acciones,
  esDirectiva = false,
  fechaFiltroDefault = format(new Date(), "yyyy-MM-dd"),
}) {
  const [sorting, setSorting] = useState([{ id: "fecha", desc: true }]);
  // La directiva ve por defecto las de hoy, el profe ve todo su histórico
  const [columnFilters, setColumnFilters] = useState(
    esDirectiva ? [{ id: "fecha", value: fechaFiltroDefault }] : []
  );

  // Estado local para el rango de fechas (objetos Date)
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      dateRange: dateRangeFilter,
    },
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: false,
    initialState: { pagination: { pageIndex: 0, pageSize: 12 } },
  });

  const selectedItem = table.getSelectedRowModel().rows[0]?.original;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const hoyStr = format(new Date(), "yyyy-MM-dd");

  // Efecto para aplicar el filtro de rango cuando cambian los inputs
  useEffect(() => {
    const start = fechaInicio ? startOfDay(parseISO(fechaInicio)) : null;
    const end = fechaFin ? startOfDay(parseISO(fechaFin)) : null;

    table.getColumn("fecha")?.setFilterValue([start, end]);
  }, [fechaInicio, fechaFin, table]);

  const handleLimpiar = () => {
    setFechaInicio("");
    setFechaFin("");
    table.resetColumnFilters();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-none border-slate-200">
        <div className="flex flex-wrap items-end gap-4 text-sm">
          {/* RANGO DE FECHAS */}
          <div className="flex items-end gap-2 p-2 bg-white rounded-md border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-500">
                Desde
              </label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-[150px] h-8 border-none focus-visible:ring-0 p-0 text-sm"
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
                className="w-[150px] h-8 border-none focus-visible:ring-0 p-0 text-sm"
              />
            </div>
          </div>

          {/* Filtro Profesor Ausente */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Prof. Ausente
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={
                  table.getColumn("nombre_ausente")?.getFilterValue() ?? ""
                }
                onChange={(e) =>
                  table
                    .getColumn("nombre_ausente")
                    ?.setFilterValue(e.target.value)
                }
                className="w-[180px] h-8 pl-8 text-sm"
              />
            </div>
          </div>

          {/* Filtro Cubridor (Solo Directiva) */}
          {esDirectiva && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">
                Realizada por
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={
                    table.getColumn("nombre_cubridor")?.getFilterValue() ?? ""
                  }
                  onChange={(e) =>
                    table
                      .getColumn("nombre_cubridor")
                      ?.setFilterValue(e.target.value)
                  }
                  className="w-[180px] h-8 pl-8 text-sm"
                />
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs flex items-center gap-2"
            onClick={handleLimpiar}
          >
            <Eraser className="w-4 h-4" /> Limpiar
          </Button>

          {informes && <div className="ml-auto">{informes}</div>}
        </div>
      </Card>

      <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
        <Table className="text-sm">
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-slate-700"
                  >
                    {flexRender(
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
                  className={`cursor-pointer transition-colors
                    ${row.getIsSelected() ? "bg-blue-50 hover:bg-blue-100" : ""} 
                    ${!row.getIsSelected() && row.original.fecha === hoyStr ? "bg-amber-50/30" : "hover:bg-slate-50"}
                  `}
                  onClick={() => row.toggleSelected()}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={`py-2 px-3 ${
                        index === 0 && row.original.fecha === hoyStr
                          ? "border-l-4 border-l-orange-500"
                          : "border-l-4 border-l-transparent"
                      }`}
                    >
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No se han encontrado registros de guardias.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: Acciones + Paginación */}
      <div className="flex flex-col sm:flex-row items-center py-1 space-y-4 sm:space-y-0 text-xs">
        <div className="flex gap-2">{acciones?.(selectedItem)}</div>
        <div className="flex-1"></div>

        <div className="flex items-center justify-center space-x-1 flex-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-3 font-medium text-slate-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 text-right font-medium text-slate-500">
          Total: {table.getFilteredRowModel().rows.length} guardias
        </div>
      </div>
    </div>
  );
}
