/**
 * TablaReservasPeriodicas.jsx
 *
 * Componente principal para la gestión y visualización de reservas periódicas.
 * Una reserva periódica, en general, es creada por la directiva a principio de curso y 
 * determina el uso que se le va a dar a un aula durante todo el curso.
 *
 * FUNCIONALIDAD PRINCIPAL:
 * - Muestra un listado de reservas periódicas en formato tabla usando TanStack Table.
 * - Permite ordenar, filtrar y paginar los datos de forma eficiente.
 * - Incluye acciones sobre cada reserva:
 *    - Editar reserva periódica
 *    - Eliminar reserva periódica
 *
 * FILTROS DISPONIBLES:
 * - Por creador de la reserva
 * - Por profesor destinatario
 * - Por estancia/aula
 * - Opción de limpiar todos los filtros activos
 *
 * INFORMES:
 * - Generación de informes en PDF:
 *    - Reservas por aula
 *    - Reservas por profesor
 * - Solo se generan con los datos filtrados actualmente en la tabla
 *
 * UI / UX:
 * - Diseño tipo "cloud" con filtros compactos y accesibles
 * - Tabla con cabecera fija y scroll interno
 * - Tooltips informativos en acciones
 * - Paginación personalizada con navegación rápida
 * - Indicador de total de resultados filtrados
 *
 * MODALES INTEGRADOS:
 * - DialogoEditarReservaPeriodica → edición de reservas
 * - DialogoEliminarReservaPeriodica → confirmación de borrado
 *
 * HOOKS UTILIZADOS:
 * - useReservasPeriodicasTodas → carga de datos desde backend
 * - usePeriodosHorarios → obtención de periodos lectivos
 *
 * NOTAS:
 * - La tabla se basa en columnas dinámicas (columnsReservasPeriodicas)
 * - El estado de la tabla (sorting, filtros, paginación) está controlado manualmente
 * - Los informes se generan a partir del estado filtrado de la tabla
 *
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * Centro: IES Francisco de Orellana - Trujillo
 */

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
import { cn } from "@/lib/utils";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Eraser,
  Pencil,
  Trash2,
  Printer,
  FileText,
  Search,
  MapPin,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import { columnsReservasPeriodicas } from "./columns-reservas-periodicas";
import { useReservasPeriodicasTodas } from "@/hooks/Reservas/userReservasPeriodicasTodas";
import { DialogoEditarReservaPeriodica } from "@/modules/ReservasEstancias/components/DialogoEditarReservaPeriodica";
import { DialogoEliminarReservaPeriodica } from "@/modules/ReservasEstancias/components/DialogoEliminarReservaPeriodica";

import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { generateInformeReservasPeriodicas } from "@/Informes/reservas";
import { generateInformeReservasPeriodicasProfesor } from "@/Informes/reservas";
import { toast } from "sonner";

export function TablaReservasPeriodicas() {
  const [sorting, setSorting] = useState([{ id: "fecha_desde", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);

  const { data: reservas = [], isLoading } = useReservasPeriodicasTodas();

  const [openEditar, setOpenEditar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const { data: periodosDB = [] } = usePeriodosHorarios();

  const [openEliminar, setOpenEliminar] = useState(false);
  const [reservaEliminar, setReservaEliminar] = useState(null);

  const estanciasUnicas = Array.from(
    new Set(reservas.map((r) => r.descripcion_estancia).filter(Boolean))
  ).sort();

  const handleGenerarInformeReservasPeriodicas = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    if (!filasFiltradas.length) {
      toast.info("No hay reservas periódicas que coincidan con los filtros.");
      return;
    }
    generateInformeReservasPeriodicas(filasFiltradas, periodosDB);
  };

  const handleGenerarInformeReservasPeriodicasProfesor = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    if (!filasFiltradas.length) {
      toast.info("No hay reservas periódicas que coincidan con los filtros.");
      return;
    }
    generateInformeReservasPeriodicasProfesor(filasFiltradas, periodosDB);
  };

  const table = useReactTable({
    data: reservas,
    columns: [
      ...columnsReservasPeriodicas(periodosDB),
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-1 justify-end">
            {/* EDITAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setReservaSeleccionada(row.original);
                      setOpenEditar(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white">
                  <p>Editar reserva periódica</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* ELIMINAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setReservaEliminar(row.original);
                      setOpenEliminar(true);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-600 text-white">
                  <p>Eliminar reserva periódica</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const limpiarFiltros = () => {
    table.resetColumnFilters();
    table.resetSorting();
    table.resetPagination();
    toast.info("Filtros restablecidos");
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground p-8 text-center animate-pulse">
        Cargando reservas periódicas…
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* PANEL DE FILTROS ESTILO CLOUD */}
      <div className="p-3 border rounded-xl bg-slate-50/50 shadow-sm mb-2">
        <div className="flex flex-wrap items-end gap-3 w-full">
          {/* Filtro Creada por */}
          <div className="flex-1 min-w-[140px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Creada por
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                className="h-9 w-full text-xs bg-white pl-8 shadow-sm"
                placeholder="Solicitante..."
                value={table.getColumn("nombreCreador")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table
                    .getColumn("nombreCreador")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>
          </div>

          {/* Filtro Creada para */}
          <div className="flex-1 min-w-[140px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Creada para
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                className="h-9 w-full text-xs bg-white pl-8 shadow-sm"
                placeholder="Profesor/a..."
                value={
                  table.getColumn("nombreProfesor")?.getFilterValue() ?? ""
                }
                onChange={(e) =>
                  table
                    .getColumn("nombreProfesor")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>
          </div>

          {/* Filtro Estancia */}
          <div className="flex-1 min-w-[160px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Estancia / Aula
            </label>
            <Select
              value={
                table.getColumn("descripcion_estancia")?.getFilterValue() ??
                "__all__"
              }
              onValueChange={(value) =>
                table
                  .getColumn("descripcion_estancia")
                  ?.setFilterValue(value === "__all__" ? "" : value)
              }
            >
              <SelectTrigger className="h-9 w-full text-xs bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="Todas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas las estancias</SelectItem>
                {estanciasUnicas.map((estancia) => (
                  <SelectItem key={estancia} value={estancia}>
                    {estancia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón Limpiar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  onClick={limpiarFiltros}
                >
                  <Eraser className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpiar filtros</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Sección Informes */}
          <div className="flex items-center gap-2 ml-auto pl-4 border-l border-slate-200 h-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-4 bg-slate-800 hover:bg-slate-900 shadow-md"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  <span className="text-xs">Informes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleGenerarInformeReservasPeriodicas}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  Reservas por aula
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarInformeReservasPeriodicasProfesor}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  Reservas por profesor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 text-[11px] font-bold text-slate-600 uppercase"
                    >
                      <div
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none"
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{ asc: " ↑", desc: " ↓" }[
                          header.column.getIsSorted()
                        ] ?? ""}
                      </div>
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
                    className="hover:bg-slate-50/50 transition-colors border-slate-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2 px-4 text-[11px] text-slate-700"
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
                    colSpan={table.getAllColumns().length}
                    className="h-32 text-center text-slate-400 italic"
                  >
                    No se han encontrado reservas periódicas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAGINACIÓN ESTILO CLOUD */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-sm -mt-4">
        <div className="hidden sm:block flex-1" />

        <div className="flex items-center space-x-1.5 flex-1 justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center min-w-[90px] text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Pág.{" "}
            <span className="text-slate-900 ml-1">
              {currentPage} / {totalPages}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-md uppercase">
            Total:{" "}
            <span className="text-blue-600 font-extrabold">
              {table.getFilteredRowModel().rows.length}
            </span>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <DialogoEliminarReservaPeriodica
        open={openEliminar}
        onOpenChange={(v) => {
          setOpenEliminar(v);
          if (!v) setReservaEliminar(null);
        }}
        reserva={reservaEliminar}
        periodos={periodosDB}
      />

      {reservaSeleccionada && (
        <DialogoEditarReservaPeriodica
          open={openEditar}
          onClose={() => {
            setOpenEditar(false);
            setReservaSeleccionada(null);
          }}
          fecha={reservaSeleccionada.fecha_desde}
          reserva={reservaSeleccionada}
          periodos={periodosDB}
          onSuccess={() => {
            setOpenEditar(false);
            setReservaSeleccionada(null);
          }}
        />
      )}
    </div>
  );
}
