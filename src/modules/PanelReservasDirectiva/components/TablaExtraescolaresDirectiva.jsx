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
  CalendarIcon,
  Check,
  X,
  Pencil,
  Eraser,
  Search,
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
  const hoyStr = format(new Date(), "yyyy-MM-dd"); // Obtenemos hoy en formato ISO

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
  const { data: centro } = useConfiguracionCentro();

  // Resolvemos la URL una sola vez para usarla en todos los botones
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

    // Si el filtro de fechas está vacío, usamos el curso actual
    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso); // "dd/mm/yyyy" -> "yyyy-mm-dd"
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

    // Si el filtro de fechas está vacío, usamos el curso actual
    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso); // "dd/mm/yyyy" -> "yyyy-mm-dd"
      hasta = ddmmyyyyToISO(curso.finCurso);
    }
    // informe
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

    // Si el filtro de fechas está vacío, usamos el curso actual
    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso); // "dd/mm/yyyy" -> "yyyy-mm-dd"
      hasta = ddmmyyyyToISO(curso.finCurso);
    }
    // informe
    generateListadoExtraescolaresPorDepartamentoXLS(filasFiltradas, {
      desde,
      hasta,
    });
  };

  const handleGenerarExtraescolaresFecha = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    // informe
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

    // Si el filtro de fechas está vacío, usamos el curso actual
    if (!desde || !hasta) {
      const curso = getCursoActual();
      desde = ddmmyyyyToISO(curso.inicioCurso); // "dd/mm/yyyy" -> "yyyy-mm-dd"
      hasta = ddmmyyyyToISO(curso.finCurso);
    }

    // informe
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
    filterFns: {
      dateRange: dateRangeFilter,
    },
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  });

  // Para filtrar actividades pedientes
  useEffect(() => {
    if (soloPendientesInicial) {
      table.getColumn("estado")?.setFilterValue(true);
    }
  }, [soloPendientesInicial, table]);

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

  // Efecto simplificado para disparar el filtro
  useEffect(() => {
    if (fechaDesde || fechaHasta) {
      table.getColumn("fecha_inicio")?.setFilterValue([fechaDesde, fechaHasta]);
    } else {
      table.getColumn("fecha_inicio")?.setFilterValue(undefined);
    }
  }, [fechaDesde, fechaHasta]);

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
    setFechaDesde(""); // Vaciamos para ver todo el histórico
    setFechaHasta("");
    table.resetColumnFilters();
    table.resetGlobalFilter();
    toast.info("Filtros restablecidos: mostrando todo el histórico");
  };

  return (
    <div className="space-y-1">
      {/* PANEL DE FILTROS ESTILO CLOUD */}
      <div className="p-3 border rounded-xl bg-slate-50/50 shadow-sm mb-3">
        <div className="flex flex-wrap items-end gap-3 w-full">
          {/* 1. RANGO DE FECHAS (POR DEFECTO HOY) */}
          <div className="flex items-end gap-2 p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="space-y-0.5">
              <label className="block text-[10px] uppercase font-bold text-slate-400 text-center">
                Desde
              </label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-[135px] h-7 border-none focus-visible:ring-0 p-0 text-xs text-center bg-transparent"
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
                className="w-[135px] h-7 border-none focus-visible:ring-0 p-0 text-xs text-center bg-transparent"
              />
            </div>
          </div>

          {/* 2. FILTRO PROFESOR */}
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Profesor/a responsable
            </label>
            {/* FILTRO PROFESOR responsable*/}
            <div className="relative flex-1 min-w-[130px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                className="h-8 w-full text-[11px] bg-white pl-7 shadow-sm"
                placeholder="Profesor/a..."
                value={table.getColumn("responsables")?.getFilterValue() ?? ""}
                onChange={(e) =>
                  table
                    .getColumn("responsables")
                    ?.setFilterValue(e.target.value)
                }
              />
            </div>
          </div>

          {/* 3. FILTRO TÍTULO */}
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
              Actividad
            </label>
            <Input
              className="h-9 w-full text-xs bg-white shadow-sm"
              placeholder="Título de la actividad..."
              value={table.getColumn("titulo")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("titulo")?.setFilterValue(e.target.value)
              }
            />
          </div>

          {/* 4. BOTÓN LIMPIAR */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  onClick={limpiarTodosLosFiltros}
                >
                  <Eraser className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpiar todos los filtros</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 5. SECCIÓN FINAL (SWITCH E INFORMES) */}
          <div className="flex items-center gap-4 ml-auto pl-4 border-l border-slate-200 h-10">
            {/* Switch Estado */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <Switch
                id="pendientes-ext"
                className="scale-75 data-[state=checked]:bg-yellow-600"
                checked={table.getColumn("estado")?.getFilterValue() === true}
                onCheckedChange={(checked) =>
                  table
                    .getColumn("estado")
                    ?.setFilterValue(checked ? true : null)
                }
              />
              <label
                htmlFor="pendientes-ext"
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
                  <span className="text-xs">Informes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresMensual}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-red-500" /> Agenda
                  mensual
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresProfesor}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-blue-500" /> Por
                  profesor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresDepartamento}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-orange-500" /> Por
                  departamento (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerarExtraescolaresDepartamentoXLS}
                  className="cursor-pointer"
                >
                  <Grid className="mr-2 h-4 w-4 text-green-600" /> Por
                  departamento (XLS)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="h-10 text-[11px] font-bold text-slate-600 uppercase"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        h.column.getCanSort() && "cursor-pointer select-none"
                      )}
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted()] ?? ""}
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
                  className="hover:bg-slate-50/50 transition-colors border-slate-100 h-8"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-1 px-4 text-[11px] text-slate-700 whitespace-nowrap"
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
                  No se han encontrado actividades extraescolares para el rango
                  seleccionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN Y TOTALES INTEGRADOS */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-2 bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-sm -mt-4">
        {/* 1. ESPACIADOR IZQUIERDO (Para que la paginación quede centrada realmente) */}
        <div className="hidden sm:block flex-1" />

        {/* 2. PAGINACIÓN CENTRADA */}
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

          <div className="flex items-center justify-center min-w-[80px] text-[10px] uppercase tracking-wider font-bold text-slate-400">
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
