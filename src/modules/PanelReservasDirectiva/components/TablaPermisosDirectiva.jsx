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
      pagination: { pageIndex: 0, pageSize: 6 },
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
  };

  return (
    <div className="space-y-2">
      {/* FILTROS */}
      <div className="p-2 border rounded-md bg-muted/40 mb-4">
        <div className="flex items-end gap-2 w-full flex-nowrap">
          {" "}
          {/* flex-nowrap es la clave */}
          {/* Filtro profesor */}
          <div className="flex-1 min-w-[120px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">
              Profesor
            </label>
            <Input
              className="h-8 w-full text-xs"
              placeholder="Profesor..."
              value={table.getColumn("nombreProfesor")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table
                  .getColumn("nombreProfesor")
                  ?.setFilterValue(e.target.value)
              }
            />
          </div>
          {/* Filtro descripción */}
          <div className="flex-1 min-w-[120px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">
              Descripción
            </label>
            <Input
              className="h-8 w-full text-xs"
              placeholder="Descripción..."
              value={table.getColumn("descripcion")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("descripcion")?.setFilterValue(e.target.value)
              }
            />
          </div>
          {/* Filtro tipo */}
          <div className="flex-[1.5] min-w-[150px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">
              Tipo
            </label>
            <Select
              value={
                table.getColumn("tipo")?.getFilterValue()?.toString() ?? "ALL"
              }
              onValueChange={(value) =>
                table
                  .getColumn("tipo")
                  ?.setFilterValue(value === "ALL" ? "" : Number(value))
              }
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                {Object.entries(MAPEO_TIPOS_PERMISOS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Filtro Rango - Un poco más pequeño */}
          {/* Filtro Rango Fechas */}
          <div className="flex-none space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">
              Rango Fechas
            </label>
            <div className="flex gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 w-[200px] justify-start text-left text-[11px] font-normal",
                      !fechaDesde && !fechaHasta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {fechaDesde && fechaHasta
                        ? `${new Date(fechaDesde).toLocaleDateString()} - ${new Date(fechaHasta).toLocaleDateString()}`
                        : "Seleccionar fechas"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    locale={es}
                    selected={{
                      from: fechaDesde ? new Date(fechaDesde) : undefined,
                      to: fechaHasta ? new Date(fechaHasta) : undefined,
                    }}
                    onSelect={(range) => {
                      setFechaDesde(
                        range?.from ? formatLocalDate(range.from) : ""
                      );
                      setFechaHasta(range?.to ? formatLocalDate(range.to) : "");
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={limpiarTodosLosFiltros}
                title="Limpiar filtros"
              >
                <Eraser className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* SECCIÓN FINAL (Switch e Impresora) */}
          <div className="flex items-center gap-3 ml-auto pl-2 border-l h-8">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Switch
                className="scale-75" // Un poco más pequeño para ahorrar espacio
                checked={table.getColumn("estado")?.getFilterValue() === true}
                onCheckedChange={(checked) =>
                  table
                    .getColumn("estado")
                    ?.setFilterValue(checked ? true : null)
                }
              />
              <span className="text-[11px] font-medium">Pendientes</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Printer className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGenerarPdf}>
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  Listado de permisos por profesor
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

      {/* PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center py-1 space-y-4 sm:space-y-0 text-xs">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center space-x-1 flex-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="px-2 text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex-1 text-right text-xs text-muted-foreground">
          Total de registros: {table.getFilteredRowModel().rows.length}
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
