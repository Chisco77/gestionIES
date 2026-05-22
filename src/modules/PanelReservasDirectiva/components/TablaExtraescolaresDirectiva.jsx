/**
 * -----------------------------------------------------------------------------
 * Componente: TablaExtraescolaresDirectiva
 * -----------------------------------------------------------------------------
 * Descripción:
 * Tabla avanzada para la gestión de actividades extraescolares desde el panel
 * de dirección. Permite visualizar, filtrar, ordenar y gestionar (aceptar,
 * rechazar, editar) las actividades registradas en el sistema.
 *
 * Incluye funcionalidades como:
 * - Filtrado por rango de fechas, profesor responsable y título de actividad
 * - Filtro rápido de actividades pendientes
 * - Generación de informes en distintos formatos (PDF y XLS):
 *    • Agenda mensual
 *    • Listado por profesor
 *    • Listado por departamento
 * - Generación de documentos Excel de dietas por actividad
 * - Edición de actividades mediante diálogo modal
 * - Confirmación de acciones (aceptar/rechazar)
 * - Integración con datos externos (LDAP, configuración del centro, periodos)
 *
 * Este componente utiliza @tanstack/react-table junto con componentes UI
 * personalizados (ShadCN) para ofrecer una experiencia de usuario moderna,
 * eficiente y altamente interactiva.
 *
 * -----------------------------------------------------------------------------
 * Props:
 * @param {string} fecha - Fecha inicial para filtrar actividades (formato ISO)
 * @param {boolean} soloPendientesInicial - Si es true, muestra solo actividades pendientes al iniciar
 *
 * -----------------------------------------------------------------------------
 * Hooks utilizados:
 * - useExtraescolaresAll → Obtiene todas las actividades extraescolares
 * - useDepartamentosLdap → Obtiene departamentos desde LDAP
 * - useCursosLdap → Obtiene cursos desde LDAP
 * - usePeriodosHorarios → Obtiene periodos horarios
 * - useConfiguracionCentro → Obtiene datos del centro (logo, etc.)
 *
 * -----------------------------------------------------------------------------
 * Autor:
 * - Nombre: Francisco Damian Mendez Palma
 * - Email: adminies.franciscodeorellana@educarex.es
 * - GitHub: https://github.com/Chisco77
 * - Repositorio: https://github.com/Chisco77/gestionIES.git
 * - Centro: IES Francisco de Orellana - Trujillo
 *
 * -----------------------------------------------------------------------------
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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { columnsExtraescolares } from "./columns-extraescolares";

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

import { Printer, FileText, Grid } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { generateListadoExtraescolaresPorProfesor } from "@/Informes/extraescolares";
import { generateListadoExtraescolaresPorFecha } from "@/Informes/extraescolares";
import { generateListadoExtraescolaresPorDepartamento } from "@/Informes/extraescolares";
import { generateListadoExtraescolaresPorDepartamentoXLS } from "@/Informes/extraescolares";
import { generateListadoExtraescolaresMensual } from "@/Informes/extraescolares";

import { getCursoActual, ddmmyyyyToISO } from "@/utils/fechasHoras";
import { format } from "date-fns";

import { useConfiguracionCentro } from "@/hooks/useConfiguracionCentro";
import { resolverRutaLogo } from "@/Informes/utils";

// Definimos la función de filtrado
const dateRangeFilter = (row, columnId, value) => {
  const [desde, hasta] = value || [];
  if (!desde && !hasta) return true;

  const fInicioAct = row.original.fecha_inicio?.split(" ")[0];
  const fFinAct = row.original.fecha_fin?.split(" ")[0] || fInicioAct;

  if (desde && fFinAct < desde) return false;
  if (hasta && fInicioAct > hasta) return false;

  return true;
};

export function TablaExtraescolaresDirectiva({
  fecha,
  soloPendientesInicial = false,
}) {
  const hoyStr = format(new Date(), "yyyy-MM-dd");

  const [sorting, setSorting] = useState([{ id: "fecha_inicio", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // SOLUCIÓN AL MISTERIO: Controlamos el estado de paginación explícitamente en el componente
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });

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
  const { data: centro } = useConfiguracionCentro();

  const urlLogoParaInformes = resolverRutaLogo(centro?.logoCentroUrl);

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

    if (!filasFiltradas.length) {
      toast.info("No hay actividades que coincidan con los filtros.");
      return;
    }

    let desde = fechaDesde;
    let hasta = fechaHasta;

    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso);
      hasta = ddmmyyyyToISO(curso.finCurso);
    }

    generateListadoExtraescolaresPorProfesor(
      filasFiltradas,
      { desde, hasta },
      urlLogoParaInformes
    );
  };

  const handleGenerarExtraescolaresDepartamento = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (!filasFiltradas.length) {
      toast.info("No hay actividades que coincidan con los filtros.");
      return;
    }

    let desde = fechaDesde;
    let hasta = fechaHasta;

    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso);
      hasta = ddmmyyyyToISO(curso.finCurso);
    }

    generateListadoExtraescolaresPorDepartamento(
      filasFiltradas,
      { desde, hasta },
      urlLogoParaInformes
    );
  };

  const handleGenerarExtraescolaresDepartamentoXLS = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (!filasFiltradas.length) {
      toast.info("No hay actividades que coincidan con los filtros.");
      return;
    }

    let desde = fechaDesde;
    let hasta = fechaHasta;

    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso);
      hasta = ddmmyyyyToISO(curso.finCurso);
    }

    generateListadoExtraescolaresPorDepartamentoXLS(filasFiltradas, {
      desde,
      hasta,
    });
  };

  const handleGenerarExtraescolaresFecha = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    generateListadoExtraescolaresPorFecha(filasFiltradas, {
      desde: fechaDesde,
      hasta: fechaHasta,
      urlLogoParaInformes,
    });
  };

  const handleGenerarExtraescolaresMensual = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (!filasFiltradas.length) {
      toast.info("No hay actividades que coincidan con los filtros.");
      return;
    }

    let desde = fechaDesde;
    let hasta = fechaHasta;

    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso);
      hasta = ddmmyyyyToISO(curso.finCurso);
    }

    generateListadoExtraescolaresMensual(
      filasFiltradas,
      { desde, hasta },
      urlLogoParaInformes
    );
  };

  // Tabla
  const table = useReactTable({
    data: extraescolaresTodas,
    columns: [
      ...columnsExtraescolares(cursos, periodos),
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
                    onClick={() => handleAccion(row.original, "aceptar")}
                  >
                    <Check size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-green-500 text-white text-[10px]">
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
                    className="text-red-600 h-6 w-6"
                    onClick={() => handleAccion(row.original, "rechazar")}
                  >
                    <X size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-600 text-white text-[10px] rounded-lg shadow-md">
                  <p>Rechazar actividad</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* EDITAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => {
                      setEditItem(row.original);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white text-[10px]">
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
                    className="p-0 h-6 px-1 bg-transparent hover:bg-transparent text-green-600 hover:text-green-700 font-bold text-[11px]"
                  >
                    XLS
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white text-[10px]">
                  <p>Generar Excel Dietas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    filterFns: {
      dateRange: dateRangeFilter,
    },
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

  // Actualizamos el filtro de rango cuando cambia la prop fecha
  useEffect(() => {
    if (fecha) {
      setFechaDesde(fecha);
      setFechaHasta(fecha);
    } else {
      setFechaDesde("");
      setFechaHasta("");
    }
  }, [fecha]);

  // Efecto para disparar el filtro por rango
  useEffect(() => {
    if (fechaDesde || fechaHasta) {
      table.getColumn("fecha_inicio")?.setFilterValue([fechaDesde, fechaHasta]);
    } else {
      table.getColumn("fecha_inicio")?.setFilterValue(undefined);
    }
  }, [fechaDesde, fechaHasta]);

  // Confirmar aceptar / rechazar
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

  // Leemos las variables directamente del useState controlado
  const currentPage = pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

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
      {/* PANEL DE FILTROS */}
      <div className="p-2 border border-slate-200/80 rounded-xl bg-slate-50/50 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. MICRO RANGO DE FECHAS CON INLINE LABELS UNIFORMES */}
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
                placeholder="Filtrar por profesor..."
                value={table.getColumn("responsables")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table
                    .getColumn("responsables")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>

            {/* 3. FILTRO TÍTULO */}
            <div className="relative w-[190px]">
              <Input
                className="h-7 w-full text-[11px] bg-white px-2 shadow-2xs border-slate-200 focus-visible:ring-slate-300"
                placeholder="Filtrar por actividad..."
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
            <div className="flex items-center gap-1.5 bg-white px-2.5 h-7 rounded-lg border border-slate-200/60 shadow-2xs">
              <Switch
                id="pendientes-ext"
                className="scale-65 data-[state=checked]:bg-yellow-600"
                checked={table.getColumn("estado")?.getFilterValue() === true}
                onCheckedChange={(checked) =>
                  table
                    .getColumn("estado")
                    ?.setFilterValue(checked ? true : null)
                }
              />
              <label
                htmlFor="pendientes-ext"
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
                  onClick={handleGenerarExtraescolaresMensual}
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-red-500" /> Agenda
                  mensual
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresProfesor}
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-blue-500" /> Por
                  profesor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresDepartamento}
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 text-orange-500" /> Por
                  departamento (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresDepartamentoXLS}
                  className="cursor-pointer py-1.5 text-slate-700"
                >
                  <Grid className="mr-2 h-3.5 w-3.5 text-green-600" /> Por
                  departamento (XLS)
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
                    No se han encontrado actividades extraescolares.
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

      {/* DIÁLOGOS MODALES */}
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
