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
  Check,
  X,
  Pencil,
  Eraser,
  Search,
  Printer,
  FileText,
  Grid,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { columnsExtraescolares } from "./columns";

// Diálogos
import { DialogoEditarExtraescolar } from "@/modules/Extraescolares/components/DialogoEditarExtraescolar";
import { DialogoConfirmacionExtraescolar } from "@/modules/Extraescolares/components/DialogoConfirmacionExtraescolar";
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

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  generateListadoExtraescolaresPorProfesor,
  generateListadoExtraescolaresPorFecha,
  generateListadoExtraescolaresPorDepartamento,
  generateListadoExtraescolaresPorDepartamentoXLS,
  generateListadoExtraescolaresMensual,
} from "@/Informes/extraescolares";

import { getCursoActual, ddmmyyyyToISO } from "@/utils/fechasHoras";
import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { resolverRutaLogo } from "@/Informes/utils";

// Función de filtrado por rango de fechas
const dateRangeFilter = (row, columnId, value) => {
  const [desde, hasta] = value || [];
  if (!desde && !hasta) return true;
  const fInicioAct = row.original.fecha_inicio?.split(" ")[0];
  const fFinAct = row.original.fecha_fin?.split(" ")[0] || fInicioAct;
  if (desde && fFinAct < desde) return false;
  if (hasta && fInicioAct > hasta) return false;
  return true;
};

export function TablaExtraescolares({ fecha, soloPendientesInicial = false }) {
  const API_URL = `${import.meta.env.VITE_SERVER_URL}${import.meta.env.VITE_API_URL}`;

  const [sorting, setSorting] = useState([{ id: "fecha_inicio", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [dialogConfirmOpen, setDialogConfirmOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [accion, setAccion] = useState(null);

  const { data: departamentos = [] } = useDepartamentosLdap();
  const { data: cursos = [] } = useCursosLdap();
  const { data: periodos = [] } = usePeriodosHorarios();
  const { data: extraescolaresTodas = [] } = useExtraescolaresAll();

  const { data: centro } = useConfiguracionCentro(); // Traemos los datos del centro
  const urlLogoParaInformes = resolverRutaLogo(centro?.logoCentroUrl);

  // Dietas XLS
  const handleGenerarExcel = async (actividad) => {
    try {
      const res = await fetch(`${API_URL}/excel-dietas/generar-excel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actividad),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Dietas.zip`;
      a.click();
      toast.success("ZIP generado");
    } catch (e) {
      toast.error("Error al generar dietas");
    }
  };

  const table = useReactTable({
    data: extraescolaresTodas,
    columns: [
      ...columnsExtraescolares(cursos, periodos),
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          // Determinamos si es modo "Directiva" (si tiene permisos para aceptar)
          // O si simplemente quieres mostrar solo editar para usuarios normales
          const esAdmin = !!row.original.id; // Aquí podrías usar una prop o user.role

          return (
            <div className="flex gap-1 justify-end">
              <TooltipProvider>
                <div className="flex items-center gap-0.5">
                  {/* BOTONES EXCLUSIVOS DE DIRECTIVA (Aceptar/Rechazar) */}
                  {soloPendientesInicial && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-green-600 hover:bg-green-50"
                            onClick={() =>
                              handleAccion(row.original, "aceptar")
                            }
                          >
                            <Check size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-green-600 text-white text-[10px]">
                          Aceptar
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleAccion(row.original, "rechazar")
                            }
                          >
                            <X size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-600 text-white text-[10px]">
                          Rechazar
                        </TooltipContent>
                      </Tooltip>
                    </>
                  )}

                  {/* BOTÓN COMÚN: EDITAR/VER */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setEditItem(row.original);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-600 text-white text-[10px]">
                      Ver / Editar
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          );
        },
      },
    ],
    filterFns: { dateRange: dateRangeFilter },
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 6 } },
  });

  // Filtros iniciales y efectos
  useEffect(() => {
    if (soloPendientesInicial) table.getColumn("estado")?.setFilterValue(true);
  }, [soloPendientesInicial]);

  useEffect(() => {
    if (fecha) {
      setFechaDesde(fecha);
      setFechaHasta(fecha);
    }
  }, [fecha]);

  useEffect(() => {
    table
      .getColumn("fecha_inicio")
      ?.setFilterValue(
        fechaDesde || fechaHasta ? [fechaDesde, fechaHasta] : undefined
      );
  }, [fechaDesde, fechaHasta]);

  const handleAccion = (item, tipo) => {
    setSeleccionado(item);
    setAccion(tipo);
    setDialogConfirmOpen(true);
  };

  const getFiltrosFechas = () => {
    if (fechaDesde && fechaHasta)
      return { desde: fechaDesde, hasta: fechaHasta };
    const curso = getCursoActual();
    return {
      desde: ddmmyyyyToISO(curso.inicioCurso),
      hasta: ddmmyyyyToISO(curso.finCurso),
    };
  };

  const limpiarTodosLosFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
    table.resetColumnFilters();
    toast.info("Filtros restablecidos");
  };

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-1 w-full max-w-full overflow-hidden">
      {/* CONTENEDOR DE FILTROS */}
      <div className="p-2 border border-slate-200/80 rounded-xl bg-slate-50/50 flex-shrink-0 mb-4">
        <div className="flex flex-wrap items-center gap-2 w-full justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. RANGO DE FECHAS */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs h-7 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Desde</span>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-[125px] h-full border-none focus-visible:ring-0 p-0 text-[11px] text-center bg-transparent font-medium text-slate-700 normal-case tracking-normal"
              />
              <span className="text-slate-200">|</span>
              <span>Hasta</span>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-[125px] h-full border-none focus-visible:ring-0 p-0 text-[11px] text-center bg-transparent font-medium text-slate-700 normal-case tracking-normal"
              />
            </div>

            {/* 2. FILTRO RESPONSABLE */}
            <div className="relative w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input
                className="h-7 w-full text-[11px] bg-white pl-7 pr-2 shadow-2xs border-slate-200 focus-visible:ring-slate-300"
                placeholder="Responsable..."
                value={table.getColumn("responsables")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table
                    .getColumn("responsables")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>

            {/* 3. FILTRO ACTIVIDAD */}
            <div className="relative w-[200px]">
              <Input
                className="h-7 w-full text-[11px] bg-white px-2 shadow-2xs border-slate-200 focus-visible:ring-slate-300"
                placeholder="Filtrar actividad..."
                value={table.getColumn("titulo")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table.getColumn("titulo")?.setFilterValue(e.target.value)
                }
              />
            </div>

            {/* 4. BOTÓN LIMPIAR */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors rounded-md gap-1"
              onClick={limpiarTodosLosFiltros}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Limpiar
              </span>
            </Button>
          </div>

          {/* 5. SECCIÓN FINAL: SWITCH Y ACCIONES */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white px-2.5 h-7 rounded-lg border border-slate-200/60 shadow-2xs">
              <Switch
                id="pend-ext"
                className="scale-65 data-[state=checked]:bg-yellow-600"
                checked={table.getColumn("estado")?.getFilterValue() === true}
                onCheckedChange={(c) =>
                  table.getColumn("estado")?.setFilterValue(c ? true : null)
                }
              />
              <label
                htmlFor="pend-ext"
                className="text-[10px] font-bold text-slate-500 uppercase tracking-tight cursor-pointer select-none"
              >
                Pendientes
              </label>
            </div>

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
                  onClick={() =>
                    generateListadoExtraescolaresMensual(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas(),
                      urlLogoParaInformes
                    )
                  }
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-red-500" /> Agenda
                  mensual
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    generateListadoExtraescolaresPorProfesor(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas(),
                      urlLogoParaInformes
                    )
                  }
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-blue-500" /> Por
                  profesor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    generateListadoExtraescolaresPorDepartamento(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas(),
                      urlLogoParaInformes
                    )
                  }
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-orange-500" />{" "}
                  Depto (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    generateListadoExtraescolaresPorDepartamentoXLS(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas()
                    )
                  }
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <Grid className="mr-2 h-3.5 w-3.5 text-green-600" /> Depto
                  (XLS)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* TABLA CON SCROLL HORIZONTAL CONTROLADO */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="h-9 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          h.column.getCanSort() && "cursor-pointer"
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
                    className="hover:bg-slate-50/50 transition-colors border-slate-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-1.5 px-4 text-[11px] text-slate-700 whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis"
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
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-sm -mt-4">
        <div className="hidden sm:block flex-1" />
        <div className="flex items-center space-x-1 flex-1 justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={14} />
          </Button>
          <div className="text-[10px] font-bold text-slate-400 min-w-[70px] text-center uppercase">
            Pág.{" "}
            <span className="text-slate-900">
              {currentPage} / {totalPages}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight size={14} />
          </Button>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border px-3 py-1 rounded-md uppercase">
            Total:{" "}
            <span className="text-blue-600 font-black">
              {table.getFilteredRowModel().rows.length}
            </span>
          </div>
        </div>
      </div>

      {/* MODALES */}
      {editOpen && editItem && (
        <DialogoEditarExtraescolar
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditItem(null);
          }}
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
