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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export function TablaAusencias({
  columns,
  data,
  onFilteredChange,
  informes,
  acciones,
  esDirectiva = false,
  fechaFiltroDefault = format(new Date(), "yyyy-MM-dd"),
}) {
  const [sorting, setSorting] = useState([{ id: "fecha_inicio", desc: true }]);
  // Si es directiva, filtramos por hoy. Si es profe, empezamos sin filtros de columna.
  const [columnFilters, setColumnFilters] = useState(
    esDirectiva ? [{ id: "fecha_inicio", value: fechaFiltroDefault }] : []
  );

  // Estado para controlar qué columnas se ven
  const [columnVisibility, setColumnVisibility] = useState({
    nombreProfesor: esDirectiva, // Si no es directiva, se oculta por defecto
  });

  const table = useReactTable({
    data,
    columns,
    // Unificamos todo en un solo objeto state
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
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

  useEffect(() => {
    const filtered = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    onFilteredChange?.(filtered);
  }, [columnFilters, data, table, onFilteredChange]);

  const esHoy = (fInicio, fFin) => {
    const hoy = new Date().setHours(0, 0, 0, 0);
    const inicio = new Date(fInicio).setHours(0, 0, 0, 0);
    const fin = new Date(fFin || fInicio).setHours(0, 0, 0, 0);
    return hoy >= inicio && hoy <= fin;
  };

  const selectedItem = table.getSelectedRowModel().rows[0]?.original;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-none">
        <div className="flex flex-wrap items-end gap-4 text-sm">
          {/* FILTRO DE PROFESOR: Solo si es directiva */}
          {esDirectiva && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">
                Profesor/a
              </label>
              <Input
                placeholder="Buscar profesor..."
                value={
                  table.getColumn("nombreProfesor")?.getFilterValue() ?? ""
                }
                onChange={(e) =>
                  table
                    .getColumn("nombreProfesor")
                    ?.setFilterValue(e.target.value)
                }
                className="w-[200px] h-8 text-sm"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">
              Ver ausencias el día...
            </label>
            <Input
              type="date"
              value={table.getColumn("fecha_inicio")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("fecha_inicio")?.setFilterValue(e.target.value)
              }
              className="w-[160px] h-8 text-sm font-medium"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs flex items-center gap-2"
            onClick={() => table.resetColumnFilters()}
          >
            <Eraser className="w-4 h-4" /> Limpiar filtros
          </Button>

          {informes && <div className="ml-auto">{informes}</div>}
        </div>
      </Card>

      <div className="rounded-md border overflow-auto">
        <Table className="text-sm">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => {
                const activaHoy = esHoy(
                  row.original.fecha_inicio,
                  row.original.fecha_fin
                );

                return (
                  <TableRow
                    key={row.id}
                    // Eliminamos el border-l del TableRow porque falla en muchos navegadores
                    className={`cursor-pointer transition-colors
            ${row.getIsSelected() ? "bg-blue-100 hover:bg-blue-200" : ""} 
            ${!row.getIsSelected() && activaHoy ? "bg-amber-50/40 hover:bg-amber-100/50" : "hover:bg-gray-100"}
          `}
                    onClick={() => row.toggleSelected()}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={`py-1 px-2 
                ${
                  /* Si es la primera celda (index 0) y está activa hoy, ponemos el borde */
                  index === 0 && activaHoy
                    ? "border-l-4 border-l-orange-500"
                    : "border-l-4 border-l-transparent"
                }
              `}
                      >
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center py-1 space-y-4 sm:space-y-0 text-xs">
        <div className="flex gap-2">{acciones(selectedItem)}</div>
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
        <div className="flex-1 text-right text-xs text-muted-foreground">
          Total de registros: {table.getFilteredRowModel().rows.length}
        </div>
      </div>
    </div>
  );
}
