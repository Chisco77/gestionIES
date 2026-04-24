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
import { format } from "date-fns";

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
      {/* FILTROS */}
      <div className="p-3 border rounded-xl bg-slate-50/50 shadow-sm mb-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-end gap-2 p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="space-y-0.5">
              <label className="block text-[10px] uppercase font-bold text-slate-400 text-center">
                Desde
              </label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-[130px] h-7 border-none p-0 text-xs text-center bg-transparent focus-visible:ring-0"
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
                className="w-[130px] h-7 border-none p-0 text-xs text-center bg-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[140px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Responsable
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                className="h-8 w-full text-[11px] bg-white pl-7 shadow-sm"
                placeholder="Buscar..."
                value={table.getColumn("responsables")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table
                    .getColumn("responsables")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex-[1.5] min-w-[180px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Actividad
            </label>
            <Input
              className="h-8 w-full text-[11px] bg-white shadow-sm"
              placeholder="Título..."
              value={table.getColumn("titulo")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("titulo")?.setFilterValue(e.target.value)
              }
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-slate-400"
            onClick={limpiarTodosLosFiltros}
          >
            <Eraser size={14} />
          </Button>

          <div className="flex items-center gap-3 ml-auto pl-4 border-l border-slate-200">
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
              <Switch
                id="pend-ext"
                className="scale-75 data-[state=checked]:bg-yellow-600"
                checked={table.getColumn("estado")?.getFilterValue() === true}
                onCheckedChange={(c) =>
                  table.getColumn("estado")?.setFilterValue(c ? true : null)
                }
              />
              <label
                htmlFor="pend-ext"
                className="text-[10px] font-bold text-slate-600 uppercase cursor-pointer"
              >
                Pendientes
              </label>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 bg-slate-800 hover:bg-slate-900 shadow-md"
                >
                  <Printer className="h-3.5 w-3.5 mr-2" />{" "}
                  <span className="text-[11px]">Informes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() =>
                    generateListadoExtraescolaresMensual(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas()
                    )
                  }
                >
                  <FileText className="mr-2 h-4 w-4 text-red-500" /> Agenda
                  mensual
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    generateListadoExtraescolaresPorProfesor(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas()
                    )
                  }
                >
                  <FileText className="mr-2 h-4 w-4 text-blue-500" /> Por
                  profesor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    generateListadoExtraescolaresPorDepartamento(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas()
                    )
                  }
                >
                  <FileText className="mr-2 h-4 w-4 text-orange-500" />{" "}
                  Departamento (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    generateListadoExtraescolaresPorDepartamentoXLS(
                      table.getFilteredRowModel().rows.map((r) => r.original),
                      getFiltrosFechas()
                    )
                  }
                >
                  <Grid className="mr-2 h-4 w-4 text-green-600" /> Departamento
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
