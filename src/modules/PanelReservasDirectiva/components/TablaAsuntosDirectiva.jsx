// src/components/asuntos/TablaAsuntosDirectiva.jsx
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
import { columnsAsuntos } from "./columns-asuntos";

export function TablaAsuntosDirectiva({ data, user, onCambio}) {
  const [sorting, setSorting] = useState([{ id: "fecha", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para el diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [asuntoSeleccionado, setAsuntoSeleccionado] = useState(null);
  const [accion, setAccion] = useState(null); // "aceptar" o "rechazar"

  // Tabla
  const table = useReactTable({
    data,
    columns: [
      ...columnsAsuntos(), // llamamos a la función para obtener las columnas
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
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  // Abrir diálogo al pinchar check o aspa
  const handleClick = (asunto, tipo) => {
    setAsuntoSeleccionado(asunto);
    setAccion(tipo);
    setDialogOpen(true);
  };

  // Confirmar acción y llamar al backend
  const confirmarAccion = async () => {
    if (!asuntoSeleccionado || !accion) return;

    const nuevoEstado = accion === "aceptar" ? 1 : 2;

    try {
      const res = await fetch(
        `${API_URL}/db/asuntos-propios/estado/${asuntoSeleccionado.id}`,
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
      const index = data.findIndex((a) => a.id === asuntoSeleccionado.id);
      if (index !== -1) data[index].estado = nuevoEstado;

      toast.success(
        accion === "aceptar"
          ? "Asunto aceptado correctamente"
          : "Asunto rechazado correctamente"
      );

      setDialogOpen(false);
      setAsuntoSeleccionado(null);
      setAccion(null);
      onCambio?.();
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
  }, [fechaDesde, fechaHasta]);

  return (
    <div className="space-y-4">
      {/* FILTROS */}
      <div className="p-4 border rounded-md space-y-3 bg-muted/40">
        <div className="flex flex-wrap gap-4 items-end text-sm">
          {/* Filtro profesor */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Profesor
            </label>
            <Input
              className="h-8 w-[180px] text-sm"
              placeholder="Buscar profesor..."
              value={table.getColumn("nombreProfesor")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table
                  .getColumn("nombreProfesor")
                  ?.setFilterValue(e.target.value)
              }
            />
          </div>

          {/* Filtro descripción */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Descripción
            </label>
            <Input
              className="h-8 w-[180px] text-sm"
              placeholder="Buscar descripción..."
              value={table.getColumn("descripcion")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("descripcion")?.setFilterValue(e.target.value)
              }
            />
          </div>

          {/* Filtro rango de fechas */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Fecha (rango)
            </label>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[260px] justify-start text-left font-normal h-8 text-sm",
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

                <PopoverContent className="w-auto p-0">
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
                        range?.from ? range.from.toISOString().slice(0, 10) : ""
                      );
                      setFechaHasta(
                        range?.to ? range.to.toISOString().slice(0, 10) : ""
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-red-600"
                onClick={() => {
                  setFechaDesde("");
                  setFechaHasta("");
                }}
                disabled={!fechaDesde && !fechaHasta}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Switch estado */}
          <div className="flex items-center gap-2 ml-auto">
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
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell colSpan={table.getAllColumns().length} className="text-center h-24">
                  No hay asuntos propios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center py-6 space-y-4 sm:space-y-0">
        <div />

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="px-2 text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-right">
          Total de registros: {table.getFilteredRowModel().rows.length}
        </div>
      </div>

      {/* DIÁLOGO CONFIRMACIÓN */}
      <DialogoConfirmacion
        open={dialogOpen}
        setOpen={setDialogOpen}
        mensaje={
          accion === "aceptar"
            ? "¿Desea aceptar este asunto propio?"
            : "¿Desea rechazar este asunto propio?"
        }
        onConfirm={confirmarAccion}
      />
    </div>
  );
}
