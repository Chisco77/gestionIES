// src/components/asuntos/TablaPermisosDirectiva.jsx
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
  CalendarIcon,
  Check,
  Search,
  X,
  Eraser,
} from "lucide-react";

import { useEffect, useState } from "react";
import { es } from "date-fns/locale";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { DialogoConfirmacion } from "./DialogoConfirmacion";
import { toast } from "sonner";
import { columnsPermisos } from "./columns-permisos";
import { usePermisosTodos } from "@/hooks/Permisos/usePermisosTodos";

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
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para el diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);
  const [accion, setAccion] = useState(null); // "aceptar" o "rechazar"

  const { data: asuntosPropiosTodos = [] } = usePermisosTodos();

  // Abrir diálogo al pinchar check o aspa
  const handleClick = (asunto, tipo) => {
    setAsuntoSeleccionado(asunto);
    setAccion(tipo);
    setDialogOpen(true);
  };

  const handleGenerarPdf = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (!filasFiltradas.length) {
      toast.info("No hay permisos que coincidan con los filtros.");
      return;
    }

    generateListadoPermisosProfesores(filasFiltradas);
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
                    className="text-green-600"
                    onClick={() => handleClick(row.original, "aceptar")}
                  >
                    <Check size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-green-500 text-white">
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
                    className="text-red-600"
                    onClick={() => handleClick(row.original, "rechazar")}
                  >
                    <X size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-600 text-white rounded-lg shadow-md">
                  <p>Rechazar solicitud</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });

  // Para filtrar actividades pedientes
  useEffect(() => {
    if (soloPendientesInicial) {
      table.getColumn("estado")?.setFilterValue(true);
    }
  }, [soloPendientesInicial, table]);

  // 1. Sincronización con la prop 'fecha' (cuando se navega por el calendario general)
  useEffect(() => {
    if (fecha) {
      setFechaDesde(fecha);
      setFechaHasta(fecha);
    } else {
      setFechaDesde("");
      setFechaHasta("");
    }
  }, [fecha]);

  // 2. APLICACIÓN DEL FILTRO DE RANGO
  // Enviamos un objeto con 'desde' y 'hasta' a la columna "fecha"
  useEffect(() => {
    table
      .getColumn("fecha")
      ?.setFilterValue({ desde: fechaDesde, hasta: fechaHasta });
  }, [fechaDesde, fechaHasta, table]);

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  // Confirmar acción y llamar al backend
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

      // Actualizar tabla localmente
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

  // Filtrar por rango de fechas
  useEffect(() => {
    table
      .getColumn("fecha")
      ?.setFilterValue({ desde: fechaDesde, hasta: fechaHasta });
  }, [fechaDesde, fechaHasta, table]);

  const formatLocalDate = (d) => d.toLocaleDateString("sv-SE");

  const limpiarTodosLosFiltros = () => {
    table.getAllColumns().forEach((col) => {
      if (col.getCanFilter()) col.setFilterValue("");
    });

    setFechaDesde("");
    setFechaHasta("");
    table.getColumn("estado")?.setFilterValue(null);

    setColumnFilters([]);
    table.resetColumnFilters();
    table.resetGlobalFilter();
    table.resetSorting();
    table.resetPagination();
    toast.info("Filtros restablecidos: mostrando todo el histórico");
  };

  return (
    <div className="space-y-2">
      {/* PANEL DE FILTROS ESTILO CLOUD - PERMISOS */}
      <div className="p-3 border rounded-xl bg-slate-50/50 shadow-sm mb-3">
        <div className="flex flex-wrap items-end gap-3 w-full">
          {/* 1. RANGO DE FECHAS (DISEÑO CÁPSULA) */}
          <div className="flex items-end gap-2 p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="space-y-0.5">
              <label className="block text-[10px] uppercase font-bold text-slate-400 text-center">
                Desde
              </label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-[130px] h-7 border-none focus-visible:ring-0 p-0 text-xs text-center bg-transparent"
              />
            </div>
            <div className="h-7 w-[1px] bg-slate-100 mx-0.5" />
            <div className="space-y-0.5">
              <label className="block text-[10px] uppercase font-bold text-slate-400 text-center">
                Hasta
              </label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-[130px] h-7 border-none focus-visible:ring-0 p-0 text-xs text-center bg-transparent"
              />
            </div>
          </div>

          {/* 2. FILTRO PROFESOR */}
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Profesor/a
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="h-9 w-full text-xs bg-white pl-8 shadow-sm"
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
          </div>

          {/* 3. FILTRO TIPO DE PERMISO */}
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Tipo de Permiso
            </label>
            <Select
              // Forzamos que si el valor es vacío o undefined, marque "ALL"
              value={
                table.getColumn("tipo")?.getFilterValue()?.toString() || "ALL"
              }
              onValueChange={(value) =>
                table
                  .getColumn("tipo")
                  ?.setFilterValue(value === "ALL" ? "" : Number(value))
              }
            >
              <SelectTrigger className="h-9 w-full text-xs bg-white shadow-sm">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                {Object.entries(MAPEO_TIPOS_PERMISOS).map(([v, label]) => (
                  <SelectItem key={v} value={v} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. BOTÓN LIMPIAR */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  onClick={limpiarTodosLosFiltros}
                >
                  <Eraser className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpiar filtros</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 5. SECCIÓN FINAL (SWITCH E INFORMES) */}
          <div className="flex items-center gap-4 ml-auto pl-4 border-l border-slate-200 h-10">
            {/* Switch Estado */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <Switch
                id="pendientes-perm"
                className="scale-75 data-[state=checked]:bg-yellow-600"
                checked={!!table.getColumn("estado")?.getFilterValue()}
                onCheckedChange={(checked) =>
                  table
                    .getColumn("estado")
                    ?.setFilterValue(checked ? true : null)
                }
              />
              <label
                htmlFor="pendientes-perm"
                className="text-[11px] font-semibold text-slate-600 cursor-pointer select-none"
              >
                Solo Pendientes
              </label>
            </div>

            {/* Menú Informes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-3 bg-slate-800 hover:bg-slate-900 shadow-md"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  <span className="text-xs text-white">Informes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleGenerarPdf}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-red-500" /> Listado por
                  profesor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-md border max-h-[288px] overflow-y-auto">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none"
                  >
                    {header.isPlaceholder ? null : (
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
                    )}
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
                  No hay asuntos propios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN ESTILO "BASE" CON NAVEGACIÓN COMPLETA */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-2 bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-sm -mt-1">
        {/* 1. ESPACIADOR IZQUIERDO */}
        <div className="hidden sm:block flex-1" />

        {/* 2. PAGINACIÓN CENTRADA CON DOBLE CHEVRON */}
        <div className="flex items-center space-x-1 flex-1 justify-center">
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

          <div className="flex items-center justify-center min-w-[85px] text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
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

        {/* 3. TOTAL REGISTROS A LA DERECHA */}
        <div className="flex-1 flex justify-end">
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-md uppercase tracking-tight">
            Total:{" "}
            <span className="text-blue-600 font-extrabold">
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
