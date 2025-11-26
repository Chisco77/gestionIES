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

export function TablaExtraescolares({ user, fecha }) {
  const [sorting, setSorting] = useState([{ id: "fecha_inicio", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

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
        headers: {
          "Content-Type": "application/json",
        },
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
            {(user.perfil === "administrador" ||
              user.perfil === "directiva" ||
              user.perfil === "extraescolares") && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-green-600"
                  onClick={() => handleAccion(row.original, "aceptar")}
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => handleAccion(row.original, "rechazar")}
                >
                  <X size={16} />
                </Button>
              </>
            )}
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
            <Button
              variant="ghost"
              onClick={() => handleGenerarExcel(row.original)}
              className="p-0 h-auto bg-transparent hover:bg-transparent text-green-600 hover:text-green-700 font-bold text-xs"
            >
              XLS
            </Button>
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
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFechaDesde("");
                  setFechaHasta("");
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Switch
              checked={table.getColumn("estado")?.getFilterValue() === true}
              onCheckedChange={(ch) =>
                table.getColumn("estado")?.setFilterValue(ch ? true : null)
              }
            />
            <span className="text-sm">Solo pendientes</span>
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
