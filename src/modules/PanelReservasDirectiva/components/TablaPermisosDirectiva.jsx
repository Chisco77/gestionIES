/**
 * TablaPermisosDirectiva.jsx
 *
 * Componente de gestión de permisos (asuntos propios) para el equipo directivo.
 *
 * FUNCIONALIDAD PRINCIPAL:
 * - Visualiza todos los permisos registrados en formato tabla (TanStack Table).
 * - Permite gestionar solicitudes mediante acciones:
 *    - Aceptar permiso
 *    - Rechazar permiso
 * - Actualiza el estado del permiso en backend mediante petición PATCH.
 *
 * FILTROS DISPONIBLES:
 * - Rango de fechas (desde / hasta)
 * - Profesor solicitante
 * - Tipo de permiso (según MAPEO_TIPOS_PERMISOS)
 * - Estado:
 *    - Switch para mostrar solo permisos pendientes
 * - Opción para limpiar todos los filtros
 *
 * COMPORTAMIENTO ESPECIAL:
 * - Puede inicializarse mostrando solo pendientes mediante la prop:
 *    → soloPendientesInicial
 * - Puede sincronizarse con una fecha externa (prop `fecha`)
 *   para filtrar automáticamente por día concreto.
 *
 * INFORMES:
 * - Generación de listado PDF de permisos por profesor
 * - Basado en los datos actualmente filtrados en la tabla
 *
 * UI / UX:
 * - Panel de filtros estilo "cloud" compacto y visual
 * - Tabla con cabecera fija y scroll vertical
 * - Tooltips en acciones (aceptar/rechazar)
 * - Paginación completa con navegación rápida
 * - Indicador de total de registros filtrados
 *
 * MODALES:
 * - DialogoConfirmacion → confirma acciones de aceptar/rechazar
 *
 * HOOKS UTILIZADOS:
 * - usePermisosTodos → carga de permisos desde backend
 *
 * NOTAS TÉCNICAS:
 * - El filtrado por fechas se realiza enviando un objeto { desde, hasta }
 *   a la columna "fecha" del table model
 * - El estado del permiso:
 *    0 → pendiente
 *    1 → aceptado
 *    2 → rechazado
 * - La tabla está completamente controlada (sorting, filtros, paginación)
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

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Check,
  Search,
  X,
  Eraser,
} from "lucide-react";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { DialogoConfirmacion } from "./DialogoConfirmacion";
import { toast } from "sonner";
import { columnsPermisos } from "./columns-permisos";
import { usePermisosTodos } from "@/hooks/Permisos/usePermisosTodos";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Printer, FileText } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { generateListadoPermisosProfesores } from "@/Informes/permisos";
import { MAPEO_TIPOS_PERMISOS } from "@/utils/mapeoTiposPermisos";

export function TablaPermisosDirectiva({
  fecha,
  soloPendientesInicial = false,
}) {
  const [sorting, setSorting] = useState([{ id: "fecha", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // CONTROL DE PAGINACIÓN LOCAL (Evita el salto a 6 filas)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });

  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para el diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);
  const [accion, setAccion] = useState(null);

  const { data: asuntosPropiosTodos = [] } = usePermisosTodos();
  console.log ("Permisos: ", asuntosPropiosTodos);
  const { data: centro } = useConfiguracionCentro();

  const handleClick = (asunto, tipo) => {
    setAsuntoSeleccionado(asunto);
    setAccion(tipo);
    setDialogOpen(true);
  };

  const handleGenerarPdf = () => {
    const urlParaPdf =
      typeof resolverRutaLogo === "function"
        ? resolverRutaLogo(centro?.logoCentroUrl)
        : centro?.logoCentroUrl;

    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (!filasFiltradas.length) {
      toast.info("No hay permisos que coincidan con los filtros.");
      return;
    }

    generateListadoPermisosProfesores(filasFiltradas, urlParaPdf);
  };

  // Tabla
  const table = useReactTable({
    data: asuntosPropiosTodos,
    columns: [
      ...columnsPermisos(),
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {/* ACEPTAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-green-600 h-6 w-6"
                    onClick={() => handleClick(row.original, "aceptar")}
                  >
                    <Check size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-green-500 text-white text-[10px]">
                  <p>Aceptar solicitud</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* RECHAZAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-600 h-6 w-6"
                    onClick={() => handleClick(row.original, "rechazar")}
                  >
                    <X size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-600 text-white text-[10px] rounded-lg shadow-md">
                  <p>Rechazar solicitud</p>
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

  // Para filtrar actividades pendientes
  useEffect(() => {
    if (soloPendientesInicial) {
      table.getColumn("estado")?.setFilterValue(true);
    }
  }, [soloPendientesInicial, table]);

  // Sincronización con la prop 'fecha'
  useEffect(() => {
    if (fecha) {
      setFechaDesde(fecha);
      setFechaHasta(fecha);
    } else {
      setFechaDesde("");
      setFechaHasta("");
    }
  }, [fecha]);

  // Aplicación del filtro de rango
  useEffect(() => {
    table
      .getColumn("fecha")
      ?.setFilterValue({ desde: fechaDesde, hasta: fechaHasta });
  }, [fechaDesde, fechaHasta, table]);

  const currentPage = pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const confirmarAccion = async () => {
    if (!asuntoSeleccionado || !accion) return;
    const nuevoEstado = accion === "aceptar" ? 1 : 2;

    try {
      const res = await fetch(
        `${API_URL}/db/permisos/estado/${asuntoSeleccionado.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Error desconocido al actualizar estado");
        return;
      }

      const index = asuntosPropiosTodos.findIndex(
        (a) => a.id === asuntoSeleccionado.id
      );
      if (index !== -1) asuntosPropiosTodos[index].estado = nuevoEstado;

      toast.success(
        accion === "aceptar"
          ? "Asunto aceptado correctamente"
          : "Asunto rechazado correctamente"
      );

      setDialogOpen(false);
      setAsuntoSeleccionado(null);
      setAccion(null);
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al actualizar estado");
    }
  };

  const limpiarTodosLosFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
    table.resetColumnFilters();
    table.resetGlobalFilter();
    table.resetSorting();

    setPagination({ pageIndex: 0, pageSize: 6 });

    toast.info("Filtros restablecidos: mostrando todo el histórico");
  };

  return (
    <div className="space-y-2 flex flex-col h-full overflow-hidden">
      {/* PANEL DE FILTROS ULTRA COMPACTO */}
      <div className="p-2 border border-slate-200/80 rounded-xl bg-slate-50/50 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. MICRO RANGO DE FECHAS CON INLINE LABELS */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs h-7 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Desde</span>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-[110px] h-full border-none focus-visible:ring-0 p-0 text-[11px] text-center bg-transparent font-medium text-slate-700 normal-case tracking-normal"
              />
              <span>Hasta</span>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-[110px] h-full border-none focus-visible:ring-0 p-0 text-[11px] text-center bg-transparent font-medium text-slate-700 normal-case tracking-normal"
              />
            </div>

            {/* 2. FILTRO PROFESOR */}
            <div className="relative w-[160px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input
                className="h-7 w-full text-[11px] bg-white pl-7 pr-2 shadow-2xs border-slate-200 focus-visible:ring-slate-300"
                placeholder="Buscar profesor..."
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

            {/* 3. FILTRO TIPO DE PERMISO COMPACTO */}
            <div className="w-[190px]">
              <Select
                value={
                  table.getColumn("tipo")?.getFilterValue()?.toString() || "ALL"
                }
                onValueChange={(value) =>
                  table
                    .getColumn("tipo")
                    ?.setFilterValue(value === "ALL" ? "" : Number(value))
                }
              >
                <SelectTrigger className="h-7 w-full text-[11px] bg-white shadow-2xs border-slate-200 focus:ring-slate-300 px-2 font-medium text-slate-600">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="text-[11px]">
                  <SelectItem value="ALL" className="text-[11px]">
                    Todos los tipos
                  </SelectItem>
                  {Object.entries(MAPEO_TIPOS_PERMISOS).map(([v, label]) => (
                    <SelectItem key={v} value={v} className="text-[11px]">
                      {label}
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
              onClick={limpiarTodosLosFiltros}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Limpiar
              </span>
            </Button>
          </div>

          {/* 5. SECCIÓN FINAL ACCIONES */}
          <div className="flex items-center gap-3">
            {/* Switch Estado Micro */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 h-7 rounded-lg border border-slate-200/60 shadow-2xs">
              <Switch
                id="pendientes-perm"
                className="scale-65 data-[state=checked]:bg-yellow-600"
                checked={table.getColumn("estado")?.getFilterValue() === true}
                onCheckedChange={(checked) =>
                  table
                    .getColumn("estado")
                    ?.setFilterValue(checked ? true : null)
                }
              />
              <label
                htmlFor="pendientes-perm"
                className="text-[10px] font-bold text-slate-500 uppercase tracking-tight cursor-pointer select-none"
              >
                Pendientes
              </label>
            </div>

            {/* Menú Informes */}
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
                  onClick={handleGenerarPdf}
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-blue-500" />{" "}
                  Listado por profesor
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
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="h-7 text-[10px] font-bold text-slate-500 uppercase tracking-wider py-0"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1 px-2",
                          h.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted()] ??
                          ""}
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
                    No se han encontrado solicitudes de permisos.
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

      <DialogoConfirmacion
        open={dialogOpen}
        setOpen={setDialogOpen}
        asunto={asuntoSeleccionado}
        mensaje={
          accion === "aceptar"
            ? "¿Desea aceptar este asunto propio?"
            : "¿Desea rechazar este asunto propio?"
        }
        accion={accion}
        onConfirm={confirmarAccion}
      />
    </div>
  );
}
