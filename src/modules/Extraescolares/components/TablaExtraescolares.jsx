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

import { useEffect, useState } from "react";
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
  Pencil,
  Eraser,
} from "lucide-react";

import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { columnsExtraescolares } from "./columns";

// Diálogos
import { DialogoEditarExtraescolar } from "../components/DialogoEditarExtraescolar";
import { DialogoConfirmacionExtraescolar } from "./DialogoConfirmacionExtraescolar";

import { useCursosLdap } from "@/hooks/useCursosLdap";
import { useDepartamentosLdap } from "@/hooks/useDepartamentosLdap";
import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { useExtraescolaresAll } from "@/hooks/Extraescolares/useExtraescolaresAll";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Printer, FileText, Grid } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { generateListadoExtraescolaresPorProfesor } from "@/utils/Informes";
import { generateListadoExtraescolaresPorFecha } from "@/utils/Informes";
import { generateListadoExtraescolaresPorDepartamento } from "@/utils/Informes";
import { generateListadoExtraescolaresPorDepartamentoXLS } from "@/utils/Informes";

export function TablaExtraescolares({ user, fecha }) {
  const [sorting, setSorting] = useState([{ id: "fecha_inicio", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  //  const API_URL = import.meta.env.VITE_API_URL;
  const API_URL = `${import.meta.env.VITE_SERVER_URL}${import.meta.env.VITE_API_URL}`;

  // Estados de diálogos
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [dialogConfirmOpen, setDialogConfirmOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [accion, setAccion] = useState(null);

  // Hooks de datos
  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();
  const { data: periodos = [] } = usePeriodosHorarios();
  const { data: extraescolaresTodas = [] } = useExtraescolaresAll();

  const handleGenerarExcel = async (actividad) => {
    try {
      const res = await fetch(`${API_URL}/excel-dietas/generar-excel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actividad),
      });

      if (!res.ok) {
        toast.error("Error generando el documento ZIP");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Dietas.zip`;
      a.style.display = "none";
      document.body.appendChild(a);

      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("ZIP generado");
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión");
    }
  };

  const handleGenerarExtraescolaresProfesor = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    // informe
    generateListadoExtraescolaresPorProfesor(filasFiltradas);

  };

  const handleGenerarExtraescolaresDepartamento = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    // informe
    generateListadoExtraescolaresPorDepartamento(filasFiltradas);

  };

  const handleGenerarExtraescolaresDepartamentoXLS = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    // informe
    generateListadoExtraescolaresPorDepartamentoXLS(filasFiltradas);

  };

  const handleGenerarExtraescolaresFecha = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    // informe
    generateListadoExtraescolaresPorFecha(filasFiltradas);

  };

  // Tabla
  const table = useReactTable({
    data: extraescolaresTodas,
    columns: [
      ...columnsExtraescolares(cursos),
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {/* ACEPTAR */}
            {(user.perfil === "administrador" ||
              user.perfil === "directiva" ||
              user.perfil === "extraescolares") && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-green-600"
                        onClick={() => handleAccion(row.original, "aceptar")}
                      >
                        <Check size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-green-500 text-white">
                      <p>Aceptar actividad</p>
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
                        onClick={() => handleAccion(row.original, "rechazar")}
                      >
                        <X size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-red-600 text-white rounded-lg shadow-md">
                      <p>Rechazar actividad</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            {/* EDITAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditItem(row.original);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1DA1F2] text-white">
                  <p>Editar/Ver actividad</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* XLS */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => handleGenerarExcel(row.original)}
                    className="p-0 h-auto bg-transparent hover:bg-transparent text-green-600 hover:text-green-700 font-bold text-xs"
                  >
                    XLS
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1DA1F2] text-white">
                  <p>Generar Excel Dietas</p>
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
    initialState: { pagination: { pageIndex: 0, pageSize: 6 } },
  });

  // ----- Actualizamos el filtro de rango cuando cambia la prop fecha -----
  useEffect(() => {
    if (fecha) {
      setFechaDesde(fecha);
      setFechaHasta(fecha);
    } else {
      setFechaDesde("");
      setFechaHasta("");
    }
  }, [fecha]);

  // ----- Aplicamos el filtro de rango a la columna -----
  useEffect(() => {
    table
      .getColumn("fecha_inicio")
      ?.setFilterValue({ desde: fechaDesde, hasta: fechaHasta });
  }, [fechaDesde, fechaHasta, table]);

  // ----- Confirmar aceptar / rechazar -----
  const handleAccion = (item, tipo) => {
    setSeleccionado(item);
    setAccion(tipo);
    setDialogConfirmOpen(true);
  };

  const confirmarAccion = async () => {
    if (!seleccionado) return;
    const nuevoEstado = accion === "aceptar" ? 1 : 2;

    try {
      const res = await fetch(
        `${API_URL}/db/extraescolares/estado/${seleccionado.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );
      const r = await res.json();
      if (!res.ok) {
        toast.error(r.error || "Error al actualizar");
        return;
      }
      toast.success(
        nuevoEstado === 1 ? "Actividad aceptada" : "Actividad rechazada"
      );
      setDialogConfirmOpen(false);
    } catch (e) {
      toast.error("Error de conexión");
    }
  };

  const formatLocalDate = (d) => d.toLocaleDateString("sv-SE");

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const limpiarTodosLosFiltros = () => {
    // Limpia estados locales
    setFechaDesde("");
    setFechaHasta("");

    // Limpia filtros de la tabla
    table.resetColumnFilters();
    table.resetGlobalFilter();
    table.resetSorting(); // Si quieres que también quite la ordenación
    table.resetPagination(); // Opcional, si quieres volver a la página 1
  };

  return (
    <div className="space-y-2">
      {/* FILTROS */}
      <div className="p-2 border rounded-md space-y-3 bg-muted/40">
        <div className="flex flex-wrap gap-4 items-end text-sm">
          <div>
            <label className="text-xs font-medium">Profesor</label>
            <Input
              className="h-8 text-sm"
              placeholder="Buscar..."
              value={table.getColumn("nombreProfesor")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table
                  .getColumn("nombreProfesor")
                  ?.setFilterValue(e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium">Título</label>
            <Input
              className="h-8 text-sm"
              placeholder="Buscar..."
              value={table.getColumn("titulo")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("titulo")?.setFilterValue(e.target.value)
              }
            />
          </div>

          {/* Rango fechas */}
          <div>
            <label className="text-xs font-medium">Rango fechas</label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 w-[240px] justify-start text-left text-sm",
                      !fechaDesde && !fechaHasta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaDesde && fechaHasta
                      ? `${new Date(fechaDesde).toLocaleDateString()} - ${new Date(
                          fechaHasta
                        ).toLocaleDateString()}`
                      : "Seleccionar rango"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
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
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs flex items-center gap-2"
                onClick={limpiarTodosLosFiltros}
              >
                <Eraser className="w-4 h-4" />
                Limpiar filtros
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Switch estado */}
            <div className="flex items-center gap-2">
              <Switch
                checked={table.getColumn("estado")?.getFilterValue() === true}
                onCheckedChange={(checked) =>
                  table
                    .getColumn("estado")
                    ?.setFilterValue(checked ? true : null)
                }
              />
              <span className="text-sm text-muted-foreground">
                Solo pendientes
              </span>
            </div>

            {/* Menú informes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Printer className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGenerarExtraescolaresFecha}>
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  Listado extraescolares por fecha
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleGenerarExtraescolaresProfesor}>
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  Listado extraescolares por profesor
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresDepartamento}
                >
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  Listado extraescolares por departamento
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresDepartamentoXLS}
                >
                  <Grid className="mr-2 h-4 w-4 text-green-500" />
                  Listado extraescolares por departamento (XLS)
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
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    <div
                      className="flex items-center gap-1 cursor-pointer select-none"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: "↑", desc: "↓" }[h.column.getIsSorted()] ?? ""}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                <TableCell colSpan={table.getAllColumns().length}>
                  No hay actividades extraescolares
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
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

      {/* DIÁLOGOS */}
      {editOpen && editItem && (
        <DialogoEditarExtraescolar
          open={editOpen}
          onClose={() => setEditOpen(false)}
          actividad={editItem}
          periodos={periodos}
          departamentos={departamentos}
          cursos={cursos}
        />
      )}

      {dialogConfirmOpen && seleccionado && (
        <DialogoConfirmacionExtraescolar
          open={dialogConfirmOpen}
          setOpen={setDialogConfirmOpen}
          actividad={seleccionado}
          accion={accion}
          onSuccess={() => {
            setSeleccionado(null);
            setAccion(null);
          }}
        />
      )}
    </div>
  );
}
