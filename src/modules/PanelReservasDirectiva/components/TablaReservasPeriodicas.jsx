// src/components/reservas/TablaReservasPeriodicas.jsx
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
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
import { Button } from "@/components/ui/button";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Eraser,
  Pencil,
  Trash2,
  Printer,
  FileText,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import { columnsReservasPeriodicas } from "./columns-reservas-periodicas";
import { useReservasPeriodicasTodas } from "@/hooks/Reservas/userReservasPeriodicasTodas";
import { DialogoEditarReservaPeriodica } from "@/modules/ReservasEstancias/components/DialogoEditarReservaPeriodica";
import { DialogoEliminarReservaPeriodica } from "@/modules/ReservasEstancias/components/DialogoEliminarReservaPeriodica";

import { usePeriodosHorarios } from "@/hooks/usePeriodosHorarios";
import { generateInformeReservasPeriodicas } from "@/Informes/reservas";
import { toast } from "sonner";

export function TablaReservasPeriodicas() {
  const [sorting, setSorting] = useState([{ id: "fecha_desde", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);

  const { data: reservas = [], isLoading } = useReservasPeriodicasTodas();

  const [openEditar, setOpenEditar] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const { data: periodosDB = [] } = usePeriodosHorarios();

  const [openEliminar, setOpenEliminar] = useState(false);
  const [reservaEliminar, setReservaEliminar] = useState(null);

  const estanciasUnicas = Array.from(
    new Set(reservas.map((r) => r.descripcion_estancia).filter(Boolean)),
  ).sort();

  const handleGenerarInformeReservasPeriodicas = () => {
    const filasFiltradas = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    if (!filasFiltradas.length) {
      toast.info("No hay reservas periódicas que coincidan con los filtros.");
      return;
    }

    generateInformeReservasPeriodicas(filasFiltradas, periodosDB);
  };
  const table = useReactTable({
    data: reservas,
    columns: [
      ...columnsReservasPeriodicas(periodosDB),
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {/* EDITAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-blue-600"
                    onClick={() => {
                      setReservaSeleccionada(row.original);
                      setOpenEditar(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar reserva periódica</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* ELIMINAR */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      setReservaEliminar(row.original);
                      setOpenEliminar(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-600 text-white">
                  <p>Eliminar reserva periódica</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    state: {
      sorting,
      columnFilters,
    },
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

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const limpiarFiltros = () => {
    table.getAllColumns().forEach((col) => {
      if (col.getCanFilter()) col.setFilterValue("");
    });
    table.resetSorting();
    table.resetPagination();
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        Cargando reservas periódicas…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* FILTROS */}
      <div className="p-2 border rounded-md bg-muted/40">
        <div className="flex flex-wrap gap-4 items-end text-sm">
          {/* Filtro Creada por */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Creada por ...
            </label>
            <Input
              className="h-8 w-[180px] text-sm"
              placeholder="Buscar solicitante…"
              value={table.getColumn("nombreCreador")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("nombreCreador")?.setFilterValue(e.target.value)
              }
            />
          </div>

          {/* Filtro Creada para */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Creada Para ...
            </label>
            <Input
              className="h-8 w-[180px] text-sm"
              placeholder="Buscar profesor…"
              value={table.getColumn("nombreProfesor")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table
                  .getColumn("nombreProfesor")
                  ?.setFilterValue(e.target.value)
              }
            />
          </div>

          {/* Filtro Estancia */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Estancia
            </label>

            <Select
              value={
                table.getColumn("descripcion_estancia")?.getFilterValue() ??
                "__all__"
              }
              onValueChange={(value) =>
                table
                  .getColumn("descripcion_estancia")
                  ?.setFilterValue(value === "__all__" ? "" : value)
              }
            >
              <SelectTrigger className="h-8 w-[180px] text-sm">
                <SelectValue placeholder="Todas las estancias" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {estanciasUnicas.map((estancia) => (
                  <SelectItem key={estancia} value={estancia}>
                    {estancia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Limpiar filtros */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 flex items-center gap-2"
            onClick={limpiarFiltros}
          >
            <Eraser className="w-4 h-4" />
            Limpiar filtros
          </Button>
          {/* Botones a la derecha */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Impresora / informes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Printer className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleGenerarInformeReservasPeriodicas}
                >
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  Informe reservas periódicas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-md border max-h-[288px] overflow-y-auto text-sm">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none"
                  >
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center gap-1"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: "↑",
                        desc: "↓",
                      }[header.column.getIsSorted()] ?? ""}
                    </div>
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
                    <TableCell
                      key={cell.id}
                      className="py-0.5 min-h-6 align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                  No hay reservas periódicas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center py-1 text-xs">
        <div className="flex-1" />
        <div className="flex items-center space-x-1">
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
        <div className="flex-1 text-right text-muted-foreground">
          Total: {table.getFilteredRowModel().rows.length}
        </div>
      </div>

      <DialogoEliminarReservaPeriodica
        open={openEliminar}
        onOpenChange={(v) => {
          setOpenEliminar(v);
          if (!v) setReservaEliminar(null);
        }}
        reserva={reservaEliminar}
        periodos={periodosDB}
      />

      {reservaSeleccionada && (
        <DialogoEditarReservaPeriodica
          open={openEditar}
          onClose={() => {
            setOpenEditar(false);
            setReservaSeleccionada(null);
          }}
          fecha={reservaSeleccionada.fecha_desde}
          reserva={reservaSeleccionada}
          periodos={periodosDB}
          onSuccess={() => {
            setOpenEditar(false);
            setReservaSeleccionada(null);
          }}
        />
      )}
    </div>
  );
}
