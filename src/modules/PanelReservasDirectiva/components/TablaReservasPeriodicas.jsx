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

import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { toast } from "sonner";

export function TablaReservasPeriodicas() {
  const [sorting, setSorting] = useState([{ id: "fecha_desde", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);

  // CONTROL DE PAGINACIÓN LOCAL COMPARTIDO (Fijado a 7 filas)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });

  const { data: reservas = [], isLoading } = useReservasPeriodicasTodas();
  const { data: centro } = useConfiguracionCentro();

  const [openEditar, setOpenEditar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const { data: periodosDB = [] } = usePeriodosHorarios();

  const [openEliminar, setOpenEliminar] = useState(false);
  const [reservaEliminar, setReservaEliminar] = useState(null);

  const estanciasUnicas = Array.from(
    new Set(reservas.map((r) => r.descripcion_estancia).filter(Boolean))
  ).sort();

  const handleGenerarInformeReservasPeriodicas = () => {
    const urlParaPdf =
      typeof resolverRutaLogo === "function"
        ? resolverRutaLogo(centro?.logoCentroUrl)
        : centro?.logoCentroUrl;

    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    if (!filasFiltradas.length) {
      toast.info("No hay reservas periódicas que coincidan con los filtros.");
      return;
    }
    generateInformeReservasPeriodicas(filasFiltradas, periodosDB, urlParaPdf);
  };

  const handleGenerarInformeReservasPeriodicasProfesor = () => {
    const urlParaPdf =
      typeof resolverRutaLogo === "function"
        ? resolverRutaLogo(centro?.logoCentroUrl)
        : centro?.logoCentroUrl;

    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    if (!filasFiltradas.length) {
      toast.info("No hay reservas periódicas que coincidan con los filtros.");
      return;
    }
    generateInformeReservasPeriodicasProfesor(
      filasFiltradas,
      periodosDB,
      urlParaPdf
    );
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
                    className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setReservaSeleccionada(row.original);
                      setOpenEditar(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-600 text-white text-[10px]">
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
                    className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setReservaEliminar(row.original);
                      setOpenEliminar(true);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-600 text-white text-[10px]">
                  <p>Eliminar reserva periódica</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 6 },
    },
  });

  const currentPage = pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const limpiarFiltros = () => {
    table.resetColumnFilters();
    table.resetGlobalFilter();
    table.resetSorting();

    //  Retorna estrictamente al tamaño de página configurado
    setPagination({ pageIndex: 0, pageSize: 6 });
    toast.info("Filtros restablecidos");
  };

  if (isLoading) {
    return (
      <div className="text-xs font-medium text-slate-400 p-8 text-center animate-pulse">
        Cargando reservas periódicas…
      </div>
    );
  }

  return (
    <div className="space-y-2 flex flex-col h-full overflow-hidden">
      {/* PANEL DE FILTROS ULTRA COMPACTO */}
      <div className="p-2 border border-slate-200/80 rounded-xl bg-slate-50/50 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. FILTRO CREADA POR */}
            <div className="relative w-[150px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input
                className="h-7 w-full text-[11px] bg-white pl-7 pr-2 shadow-2xs border-slate-200 focus-visible:ring-slate-300"
                placeholder="Creada por..."
                value={table.getColumn("nombreCreador")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table
                    .getColumn("nombreCreador")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>

            {/* 2. FILTRO CREADA PARA */}
            <div className="relative w-[150px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input
                className="h-7 w-full text-[11px] bg-white pl-7 pr-2 shadow-2xs border-slate-200 focus-visible:ring-slate-300"
                placeholder="Creada para..."
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

            {/* 3. FILTRO ESTANCIA / AULA */}
            <div className="w-[180px]">
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
                <SelectTrigger className="h-7 w-full text-[11px] bg-white shadow-2xs border-slate-200 focus:ring-slate-300 px-2 font-medium text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                    <SelectValue placeholder="Todas" />
                  </div>
                </SelectTrigger>
                <SelectContent className="text-[11px]">
                  <SelectItem value="__all__" className="text-[11px]">
                    Todas las estancias
                  </SelectItem>
                  {estanciasUnicas.map((estancia) => (
                    <SelectItem
                      key={estancia}
                      value={estancia}
                      className="text-[11px]"
                    >
                      {estancia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. BOTÓN LIMPIAR */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors rounded-md gap-1 flex items-center"
              onClick={limpiarFiltros}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Limpiar
              </span>
            </Button>
          </div>

          {/* 5. SECCIÓN FINAL ACCIONES */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 px-2.5 bg-slate-800 hover:bg-slate-900 shadow-2xs rounded-lg text-white"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-[11px] font-medium">Informes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 text-xs">
                <DropdownMenuItem
                  onClick={handleGenerarInformeReservasPeriodicas}
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-red-500" />{" "}
                  Reservas por aula
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarInformeReservasPeriodicasProfesor}
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-blue-500" />{" "}
                  Reservas por profesor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL ALTA DENSIDAD */}
      <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden min-h-0 flex flex-col">
        <div className="overflow-y-auto flex-1 scrollbar-none">
          <Table>
            <TableHeader className="bg-slate-50/60 sticky top-0 z-10 border-b border-slate-200">
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="hover:bg-transparent border-none"
                >
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-7 text-[10px] font-bold text-slate-500 uppercase tracking-wider py-0"
                    >
                      <div
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "flex items-center gap-1 px-2",
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
                    className="hover:bg-slate-50/40 transition-colors border-b border-slate-100/50 h-[26px]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-0.5 px-4 text-[11px] text-slate-600 whitespace-nowrap align-middle"
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
                    className="h-24 text-center text-slate-400 italic text-[11px]"
                  >
                    No se han encontrado reservas periódicas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAGINACIÓN Y TOTALES INTEGRADOS */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl shadow-3xs flex-shrink-0">
        <div className="hidden sm:block flex-1" />

        <div className="flex items-center space-x-1 flex-1 justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-slate-800"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-slate-800"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <div className="flex items-center justify-center min-w-[70px] text-[9px] uppercase tracking-wider font-bold text-slate-400">
            Pág.{" "}
            <span className="text-slate-800 ml-1">
              {currentPage} / {totalPages}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-slate-800"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-slate-800"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-tight shadow-3xs">
            Total:{" "}
            <span className="text-blue-600 font-bold">
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
