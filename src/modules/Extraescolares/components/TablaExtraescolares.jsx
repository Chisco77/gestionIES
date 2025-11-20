// src/components/extraescolares/TablaExtraescolares.jsx

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

export function TablaExtraescolares({ data, user, onCambio, onEditar }) {
  const [sorting, setSorting] = useState([{ id: "fecha_inicio", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [accion, setAccion] = useState(null);

  const table = useReactTable({
    data,
    columns: [
      ...columnsExtraescolares(),
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-green-600"
              onClick={() => handleClick(row.original, "aceptar")}
            >
              <Check size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-600"
              onClick={() => handleClick(row.original, "rechazar")}
            >
              <X size={16} />
            </Button>
            <Button variant="ghost" onClick={() => onEditar(row.original)}>
              <Pencil className="w-4 h-4 text-blue-600" />
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
    initialState: {
      pagination: { pageIndex: 0, pageSize: 6 },
    },
  });

  const handleClick = (item, tipo) => {
    setSeleccionado(item);
    setAccion(tipo);
    setDialogOpen(true);
  };

  const confirmarAccion = async () => {
    if (!seleccionado || !accion) return;

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

      onCambio?.();
      setDialogOpen(false);
    } catch (e) {
      toast.error("Error de conexión");
    }
  };

  useEffect(() => {
    table
      .getColumn("fecha_inicio")
      ?.setFilterValue({ desde: fechaDesde, hasta: fechaHasta });
  }, [fechaDesde, fechaHasta]);

  const formatLocalDate = (d) => d.toLocaleDateString("sv-SE");

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-2">
      {/* FILTROS */}
      <div className="p-2 border rounded-md bg-muted/40 space-y-3 text-sm">
        <div className="flex flex-wrap gap-4 items-end">
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
                      {{
                        asc: "↑",
                        desc: "↓",
                      }[h.column.getIsSorted()] ?? ""}
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
                    <TableCell key={cell.id} className="py-0.5 text-xs">
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

      {/* PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center py-1 space-y-4 sm:space-y-0 text-xs">
        {/* Izquierda vacío para empujar el centro */}
        <div className="flex-1"></div>
        <div className="flex items-center justify-center space-x-1 flex-1">
          {" "}
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
          {" "}
          Total de registros: {table.getFilteredRowModel().rows.length}
        </div>
      </div>
    </div>
  );
}
