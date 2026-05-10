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
  Eraser,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

// Filtro de rango de fechas para sustituciones
const dateRangeFilter = (row, columnId, value) => {
  const [start, end] = value;
  if (!start && !end) return true;

  const fInicio = row.original.fecha_inicio;
  const fFin = row.original.fecha_fin || "9999-12-31"; // Si es NULL, asumimos que sigue activa

  if (start && !end) return fFin >= start;
  if (!start && end) return fInicio <= end;
  return fInicio <= end && fFin >= start;
};

export function TablaBajas({
  columns,
  data,
  onFilteredChange,
  acciones,
  esDirectiva = false,
  fechaFiltroDefault = format(new Date(), "yyyy-MM-dd"),
}) {
  const hoyStr = format(new Date(), "yyyy-MM-dd");
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(""); // Dejamos vacío para ver todas las activas
  const [sorting, setSorting] = useState([{ id: "fecha_inicio", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    filterFns: { dateRange: dateRangeFilter },
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  // Efecto para aplicar el filtro de fechas
  useEffect(() => {
    table.getColumn("fecha_inicio")?.setFilterValue([fechaInicio, fechaFin]);
  }, [fechaInicio, fechaFin, table]);

  const handleLimpiar = () => {
    setFechaInicio("");
    setFechaFin("");
    table.resetColumnFilters();
  };

  const selectedItem = table.getSelectedRowModel().rows[0]?.original;

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-none border-slate-200">
        <div className="flex flex-wrap items-end gap-4 text-sm">
          {/* FILTRO FECHAS */}
          <div className="flex items-end gap-2 p-2 bg-slate-50 rounded-md border border-slate-200">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-500">
                Sustituciones desde
              </label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-[150px] h-8 border-none bg-transparent focus-visible:ring-0 p-0 text-sm"
              />
            </div>
          </div>

          {/* BUSCADOR POR NOMBRE (Titular o Sustituto) */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Buscar docente
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Nombre del profesor..."
                value={table.getColumn("nombreTitular")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table
                    .getColumn("nombreTitular")
                    ?.setFilterValue(e.target.value)
                }
                className="w-[250px] h-8 pl-8 text-sm"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-slate-500"
            onClick={handleLimpiar}
          >
            <Eraser className="w-4 h-4 mr-2" /> Restablecer
          </Button>
        </div>
      </Card>

      <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
        <Table className="text-sm">
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="hover:bg-transparent border-b border-slate-200"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-slate-700 h-10"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
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
                  className={`cursor-pointer transition-colors ${
                    row.getIsSelected()
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => row.toggleSelected()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                  No se han encontrado sustituciones registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PIE DE TABLA: ACCIONES Y PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center py-1 space-y-4 sm:space-y-0 text-xs text-slate-500">
        <div className="flex gap-2">{acciones(selectedItem)}</div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-2">
            Pág. {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
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
        </div>
      </div>
    </div>
  );
}
